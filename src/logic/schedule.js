// side series schedule generator
        function generateSideSchedule(seriesId, mainSchedules) {
            var s = getSeries(seriesId);
            if (!s || !s.isSideStep) return [];

            // paid tracks only if player owns them
            var _ownedPaidNames = new Set();
            var _tp = (typeof G !== 'undefined' && G && G.trackPools) ? G.trackPools : {};
            (_tp.paid || []).forEach(function(t) { _ownedPaidNames.add(t.name); });

            var pool = (SIDE_TRACKS[seriesId] || []).filter(function(t) {
                return !t.paid || _ownedPaidNames.has(t.name);
            });
            // fallback to free tracks if filter kills everything
            if (!pool.length) pool = (SIDE_TRACKS[seriesId] || []).filter(function(t) { return !t.paid; });
            if (!pool.length) return [];
            var currentWeek = (G && G.week) ? G.week : 1;
            var races = s.races;

            // legends needs road courses or its just ovals
            // flat shuffle - legends goes everywhere, no home weighting
            var picks = [];
            var used = {};
            if (seriesId === 'legends') {
                var roadCourses = shuffle(pool.filter(function(t) { return t.roadCourse; }).slice());
                var ovals = shuffle(pool.filter(function(t) { return !t.roadCourse; }).slice());
                // road courses first
                var rcCount = Math.min(4, roadCourses.length);
                for (var ri = 0; ri < rcCount; ri++) {
                    if (!used[roadCourses[ri].name]) { picks.push(roadCourses[ri]); used[roadCourses[ri].name] = true; }
                }
                // fill with ovals
                for (var oi = 0; oi < ovals.length && picks.length < races; oi++) {
                    if (!used[ovals[oi].name]) { picks.push(ovals[oi]); used[ovals[oi].name] = true; }
                }
            } else {
                var shuffled = shuffle(pool.slice());
                for (var si = 0; si < shuffled.length && picks.length < races; si++) {
                    if (!used[shuffled[si].name]) { picks.push(shuffled[si]); used[shuffled[si].name] = true; }
                }
            }
            // backfill if short
            while (picks.length < races) {
                pool.forEach(function(t) { if (picks.length < races) picks.push(t); });
            }
            picks = shuffle(picks); // shuffle

            // how long is the main season
            var mainSched = mainSchedules || (G && G.schedules) || {};
            var totalMainWeeks = 1;
            Object.values(mainSched).forEach(function(sched) {
                if (!Array.isArray(sched)) return;
                totalMainWeeks = Math.max(totalMainWeeks, sched.length);
            });
            if (totalMainWeeks < races) totalMainWeeks = races;

            // space races evenly across the season, no two on the same week
            var assigned = picks.map(function() { return 0; });
            var weekAssigned = {};
            picks.forEach(function(t, idx) {
                // ideal slot
                var ideal = Math.round(1 + (idx / Math.max(picks.length - 1, 1)) * (totalMainWeeks - 1));
                // nudge to nearest open week
                var wk = ideal;
                var offset = 0;
                while (weekAssigned[wk]) {
                    offset++;
                    wk = ideal + (offset % 2 === 1 ? offset : -offset);
                    if (wk < 1) wk = ideal + offset;
                    if (wk > totalMainWeeks + picks.length) wk = totalMainWeeks + picks.length;
                }
                assigned[idx] = wk;
                weekAssigned[wk] = true;
            });

            var lapPool = seriesId === 'legends' ? [25, 30, 35, 40] : [50, 60, 75, 75, 100];

            // one premier per season, lean toward second half
            var _sidePremierIdx = -1;
            var _bestPremierScore = -1;
            picks.forEach(function(t, i) {
                if (!t.premierName) return;
                var score = (i >= Math.floor(picks.length * 0.5) ? 10 : 0) + Math.random() * 10;
                if (score > _bestPremierScore) { _bestPremierScore = score; _sidePremierIdx = i; }
            });

            return picks.map(function(t, idx) {
                var wk = assigned[idx] || (idx + 1);
                var isPast = wk < currentWeek;
                var isPremier = (idx === _sidePremierIdx);
                var raceLaps = isPremier ? (t.premierLaps || lapPool[lapPool.length - 1]) : lapPool[Math.floor(Math.random() * lapPool.length)];
                return {
                    round: idx + 1,
                    week: wk,
                    locked: isPast,
                    track: t.name,
                    city: t.city,
                    state: t.state,
                    night: !!t.night,
                    roadCourse: !!t.roadCourse,
                    raceDay: t.night ? 'Saturday Night' : 'Saturday',
                    raceLaps: raceLaps,
                    isPremier: isPremier,
                    premierName: isPremier ? (t.premierName || 'Season Invitational') : null,
                    premierLaps: isPremier ? raceLaps : null,
                    isSupportRace: false,
                    seriesId: seriesId,
                    result: isPast ? { skipped: true, position: null, locked: true, simulated: true } : null,
                };
            }).sort(function(a, b) { return a.week - b.week; })
              .map(function(r, idx) { r.round = idx + 1; return r; }); // renumber after sort
        }

        // is there a side race this week that we can actually get to
        function getSideRaceForWeek(seriesId, week) {
            var sched = G.sideSchedules && G.sideSchedules[seriesId];
            if (!sched) return null;
            var race = sched.find(function(r) { return r.week === week && !r.result; });
            if (!race) return null;

            // needs to be geographically close to a main race
            var mainRaces = [];
            (G.contracts || []).forEach(function(c) {
                var ms = G.schedules && G.schedules[c.seriesId];
                if (ms && ms[week - 1]) mainRaces.push(ms[week - 1]);
            });
            if (!mainRaces.length) return { race: race, canRun: true, reason: '' }; // no main races, always available

            var nearby = mainRaces.some(function(mr) {
                return mr.state && race.state && isSameRegion(mr.state, race.state);
            });

            return {
                race: race,
                canRun: nearby,
                reason: nearby ? '' : 'Too far — ' + race.city + ', ' + race.state + ' is not near this week\'s main race.',
            };
        }

        // Simulate past weeks AI field when joining mid-season
        function seedSideSeriesDrivers(seriesId) {
            // Anchor names — always seeded first so rivalries with real names stay stable
            var LEGENDS_ANCHORS = [
                'Keith Rocco','Matt Hirschman','Tyler Bowman','Logan Seavey','Woody Pitkat',
                'Carson Kvapil','Alex Yankowski','Tommy Vigh Jr','Darrell Swartzlander','Craig Lutz','Figgy Earnhardt',
            ];
            var MODIFIED_ANCHORS = [
                'Keith Rocco','Jimmy Blewett','Ronnie Williams','Mike Gular','Ryan Preece',
                'Woody Pitkat','Craig Von Dohren','Duane Howard','Billy Pauch Jr','Ryan Watt',
            ];

            // Series-flavored first/last name pools for generated fill drivers
            var LEGENDS_FIRST = [
                'Tyler','Cole','Jake','Dustin','Brett','Cody','Austin','Hunter','Travis','Lance',
                'Derek','Carson','Greg','Dawson','Ryan','Chase','Mason','Connor','Dylan','Tate',
                'Grant','Tanner','Spencer','Kyle','Anthony','Matt','Chris','Tommy','Zane','Blake',
                'Garrett','Colby','Peyton','Brant','Jeb','Dalton','Wade','Clint','Casey','Troy',
            ];
            var LEGENDS_LAST = [
                'Bowman','Renfrew','Sorrell','Harkey','Causey','Pearce','Mabe','Dill','Fulk','Byrd',
                'Chaffin','Kvapil','Van Alst','Cram','Flores','Diaz','Vickers','Raab','Ardoin','Lupton',
                'Fidler','Fogleman','Fletcher','Smith','Enfinger','Gray','Eckes','Boyd','Bonsignore',
                'Flannery','Swanson','Orr','Cook','Kuhn','Harrington','Ballard','McDowell','Setzer',
                'Weatherly','Lund','Petty','Cope','Bonnett','Trickle','Sacks','Mears','Bodine',
            ];
            var MODIFIED_FIRST = [
                'Jimmy','Ronnie','Mike','Anthony','Ted','D.J.','Todd','Evan','Tom','Chris',
                'Rowan','Michael','Marcus','Chas','Dave','Carl','Duane','Matt','Ryan','Jordan',
                'David','Brian','Kyle','Billy','Andrew','Brandon','Doug','Gary','Bobby','Eric',
                'Tim','Bob','Pete','Rich','Danny','Al','Jeff','Steve','Dave','Scott',
            ];
            var MODIFIED_LAST = [
                'Blewett','Williams','Gular','Nocella','Christopher','Shaw','Owen','Dial','Abrahams','Pasteryak',
                'Pennink','Lunsford','Hagle','Micheli','Meris','Sapienza','Medlar','Lichty','Howard','Von Dohren',
                'Janisch','Godown','Watson','Schilling','Krummel','Rohner','Pauch','Watt','Krause','Grosso',
                'Coby','Linden','Horton','Fiore','Preece','Rocco','Pitkat','Swartzlander','Wentworth','Hirschman',
            ];

            var anchors = seriesId === 'legends' ? LEGENDS_ANCHORS : MODIFIED_ANCHORS;
            var firstPool = seriesId === 'legends' ? LEGENDS_FIRST : MODIFIED_FIRST;
            var lastPool = seriesId === 'legends' ? MODIFIED_LAST : MODIFIED_LAST;
            // Modifieds use their own last pool
            if (seriesId === 'sk_modified') lastPool = MODIFIED_LAST;
            if (seriesId === 'legends') lastPool = LEGENDS_LAST;

            var count = seriesId === 'legends' ? 40 : 32;
            var existing = (G.drivers || []).filter(function(d) { return d.currentSeriesId === seriesId; });
            if (existing.length >= count) return;
            var usedNames = new Set(existing.map(function(d) { return d.name; }));

            // Step 1 — seed anchor names first
            anchors.forEach(function(name) {
                if (existing.length >= count || usedNames.has(name)) return;
                var d = createDriver(name, rand(55, 88), seriesId, 'generated');
                if (!G.drivers) G.drivers = [];
                G.drivers.push(d);
                existing.push(d);
                usedNames.add(name);
            });

            // Step 2 — fill remainder from flavored first+last pools
            var attempts = 0;
            while (existing.length < count && attempts < 200) {
                attempts++;
                var first = firstPool[Math.floor(Math.random() * firstPool.length)];
                var last = lastPool[Math.floor(Math.random() * lastPool.length)];
                var genName = first + ' ' + last;
                if (!usedNames.has(genName)) {
                    var gd = createDriver(genName, rand(38, 80), seriesId, 'generated');
                    if (!G.drivers) G.drivers = [];
                    G.drivers.push(gd);
                    existing.push(gd);
                    usedNames.add(genName);
                }
            }
        }

        function initSideField(seriesId) {
            var s = getSeries(seriesId);
            if (!s) return;
            var sched = G.sideSchedules[seriesId] || [];
            var currentWeek = G.week || 1;
            var SIDE_NAMES = [
                'Tyler Bowman','Cole Renfrew','Jake Sorrell','Dustin Harkey','Brett Causey',
                'Cody Pearce','Austin Mabe','Hunter Dill','Travis Fulk','Lance Byrd',
                'Derek Chaffin','Logan Seavey','Carson Kvapil','Greg Van Alst','Dawson Cram',
                'Tommy Vigh Jr','Jimmy Blewett','Ronnie Williams','Mike Gular','Anthony Nocella',
                'Alex Yankowski','Craig Lutz','Matt Hirschman','Ryan Preece','Ted Christopher Jr',
                'Woody Pitkat','Michael Wentworth','Tyler Barry','D.J. Shaw','Keith Rocco',
            ];
            var count = seriesId === 'legends' ? 40 : 32;
            var field = {};
            SIDE_NAMES.slice(0, count).forEach(function(name) {
                field[name] = { points: 0, wins: 0, top5s: 0, starts: 0, skill: rand(40, 88) };
            });
            // Simulate all weeks before the player joined
            sched.forEach(function(race) {
                if (race.week >= currentWeek) return;
                var entries = Object.keys(field).slice();
                // Weighted random finish by skill
                entries.sort(function(a, b) {
                    return (field[b].skill + rand(-25, 25)) - (field[a].skill + rand(-25, 25));
                });
                entries.forEach(function(name, pos) {
                    var pts = Math.max(1, 43 - pos);
                    field[name].points += pts;
                    field[name].starts++;
                    if (pos === 0) field[name].wins++;
                    if (pos < 5) field[name].top5s++;
                });
            });
            if (!G.sideFields) G.sideFields = {};
            G.sideFields[seriesId] = field;
        }