// driver database
        function createDriver(name, skill = null, seriesId = null, source = 'generated') {
            const tier = seriesId ? ((getSeries(seriesId) && getSeries(seriesId).tier) || 1) : 1;
            return {
                id: uid(),
                name,
                source,
                skill: skill !== null ? skill : rollDriverSkill(tier),
                currentSeriesId: seriesId || 'mini_stock',
                currentTeam: (() => {
                    const _s = getSeries(seriesId);
                    if (_s && _s.tier <= 2) return null;
                    const tl = TEAMS[seriesId || 'mini_stock'] || [''];
                    return tl[rand(0, tl.length - 1)];
                })(),
                rep: rand(0, Math.max(0, (tier - 1) * 30)),
                fans: rand(
                    [0, 200, 500, 2000, 8000, 30000, 80000, 150000][tier] || 0,
                    [0, 800, 2000, 8000, 40000, 120000, 300000, 600000][tier] || 0
                ),
                money: rand(1000, 5000 * (tier)),
                wins: 0, top5s: 0, starts: 0,
                seasonPoints: 0,
                seasonWins: 0,
                active: true,
                injuredOrPenalized: false,
                substituteFor: null,
                notes: '',
                careerHistory: [],
                aliases: [],
                homeState: randomHomeState(),
                // ai stats weighted toward realistic tier means, bell curve distribution
                aiStats: (() => {
                    function wrand(mean, spread) {
                        // two rand calls gives a bell curve
                        return clamp(Math.round((rand(mean - spread, mean + spread) + rand(mean - spread, mean + spread)) / 2), 0, 100);
                    }
                    // t1-2 local, t3 regional, t4+ national
                    const topField    = tier >= 4;
                    const midField    = tier === 3 || tier === 2;
                    // roughly 30% top, 50% mid, 20% backmarkers per field
                    const roll = Math.random();
                    const level = topField
                        ? (roll < 0.25 ? 'top' : roll < 0.80 ? 'mid' : 'back')
                        : midField
                            ? (roll < 0.15 ? 'top' : roll < 0.70 ? 'mid' : 'back')
                            : (roll < 0.10 ? 'top' : roll < 0.55 ? 'mid' : 'back');
                    const profiles = {
                        top:  { rs: 90, ag: 80, op: 77, sm: 65, spread: 8 },
                        mid:  { rs: 77, ag: 72, op: 70, sm: 52, spread: 10 },
                        back: { rs: 62, ag: 77, op: 77, sm: 42, spread: 12 },
                    };
                    const p = profiles[level];
                    return {
                        relativeSkill: skill !== null ? clamp(skill + rand(-5, 5), 0, 100) : wrand(p.rs, p.spread),
                        aggression:    wrand(p.ag, p.spread),
                        optimism:      wrand(p.op, p.spread),
                        smoothness:    wrand(p.sm, p.spread),
                        age:           rand(18, 45),
                        pitCrewSkill:  topField ? wrand(72, 12) : wrand(55, 15),
                        pittingRisk:   level === 'back' ? wrand(60, 15) : wrand(40, 15),
                        _level: level,
                    };
                })(),
                carNumber: (() => {
                    const resolvedSeries = seriesId || 'mini_stock';
                    const resolvedTier   = (getSeries(resolvedSeries) && getSeries(resolvedSeries).tier) || 1;
                    const taken = new Set((typeof G !== 'undefined' && G && G.drivers ? G.drivers : [])
                        .filter(function (d) { return d.currentSeriesId === resolvedSeries && d.carNumber; })
                        .map(function (d) { return String(d.carNumber); }));
                    if (typeof G !== 'undefined' && G && G.reservedCarNumber) taken.add(String(G.reservedCarNumber));
                    
                    const useSuffixes = resolvedTier <= 2;
                    const suffixes = ['', '', '', '', 'X', 'A', 'B', '0']; // plain numbers are more common
                    let num;
                    let tries = 0;
                    do {
                        const base = rand(1, 99);
                        if (useSuffixes && tries > 30) {
                            // plain numbers gone, try suffixed
                            const suffix = suffixes[rand(1, suffixes.length - 1)];
                            num = suffix === '0' ? '0' + String(base) : String(base) + suffix;
                        } else {
                            num = String(base);
                        }
                        tries++;
                    } while (taken.has(num) && tries < 300);
                    return num;
                })(),
                                _carNumberSeniority: 0,
                attendanceRate: Math.random() < 0.75
                    ? randF(0.80, 0.95)
                    : randF(0.50, 0.75),
            };
        }
        function assignSeasonAttendance(state, seriesId) {
            var drivers = (state.drivers || []).filter(function(d) {
                return d.active && d.currentSeriesId === seriesId;
            });
            drivers.forEach(function(d) {
                if (d.attendanceRate === undefined || d.attendanceRate === null) {
                    d.attendanceRate = Math.random() < 0.75
                        ? randF(0.80, 0.98)
                        : randF(0.45, 0.79);
                }
            });
        }

        function resolveCarNumberConflicts(seriesId) {
        const drivers = (G.drivers || []).filter(function (d) {
                return d.active && d.currentSeriesId === seriesId && d.carNumber;
            });
            if (G.reservedCarNumber) {
                var reserved = String(G.reservedCarNumber);
                drivers.forEach(function (d) {
                    if (String(d.carNumber) === reserved) {
                        d.carNumber = null;
                        d._carNumberSeniority = 0;
                    }
                });
            }
            const byNumber = {};
            drivers.forEach(function (d) {
                const n = String(d.carNumber);
                if (!byNumber[n]) byNumber[n] = [];
                byNumber[n].push(d);
            });
            const conflicts = [];
            Object.entries(byNumber).forEach(function ([num, group]) {
                if (group.length < 2) return;
                // most starts gets to keep the number
                group.sort(function (a, b) { return (b._carNumberSeniority || b.starts || 0) - (a._carNumberSeniority || a.starts || 0); });
                group.slice(1).forEach(function (d) {
                    const oldNum = d.carNumber;
                    d.carNumber = null; // needs reassignment
                    conflicts.push({ driver: d.name, hadNumber: oldNum, keeperName: group[0].name });
                });
            });
            return conflicts;
        }


        // expected starters per series
        const SERIES_FIELD_SIZE = {
            legends: 28,
            sk_modified: 24,
            mini_stock: 22,       // expected field, pool is bigger than this
            street_stock: 24,
            super_late_model: 26,
            late_model_stock: 30,
            arca_menards: 32,
            nascar_trucks: 38,
            nascar_xfinity: 42,
            nascar_cup: 46,
        };

        // pool is bigger than field to allow for absences
        const SERIES_DRIVER_POOL = {
            legends: 40,
            sk_modified: 32,
            mini_stock: 32,
            street_stock: 36,
            super_late_model: 36,
            late_model_stock: 40,
            arca_menards: 42,
            nascar_trucks: 46,
            nascar_xfinity: 50,
            nascar_cup: 52,
        };

        function rollDriverSkill(tier) {
            var tierFloor = Math.min(10 + tier * 5, 45);
            var tierCeil  = Math.min(60 + tier * 6, 100);
            var roll = Math.random();
            var raw;
            if (roll < 0.15) {
                raw = rand(72, 100);
            } else if (roll < 0.65) {
                raw = rand(40, 71);
            } else {
                raw = rand(15, 39);
            }
            return clamp(raw, tierFloor, tierCeil);
        }

        function generateInitialDriverPool() {
            const drivers = [];
            SERIES.forEach(s => {
                const count = SERIES_DRIVER_POOL[s.id] || SERIES_FIELD_SIZE[s.id] || 20;
                for (let i = 0; i < count; i++) {
                    let name = generateAIName();
                    while (drivers.find(d => d.name === name)) name = generateAIName();
                    drivers.push(createDriver(name, rollDriverSkill(s.tier), s.id, 'generated'));
                }
            });

            /* reassign car numbers post-generation so theyre unique per series
            cant do this in createDriver because G doesnt exist yet */
            const useSuffixes = function (tier) { return tier <= 2; };
            const suffixes = ['X', 'A', 'B'];
            SERIES.forEach(function (s) {
                const inSeries = drivers.filter(function (d) { return d.currentSeriesId === s.id; });
                const taken = new Set();
                inSeries.forEach(function (d) {
                    let num;
                    let tries = 0;
                    // plain numbers first
                    do {
                        num = String(rand(1, 99));
                        tries++;
                    } while (taken.has(num) && tries < 200);
                    // try suffixes if plain ran out
                    if (taken.has(num) && useSuffixes(s.tier)) {
                        let found = false;
                        for (let si = 0; si < suffixes.length && !found; si++) {
                            for (let n = 1; n <= 99 && !found; n++) {
                                const candidate = String(n) + suffixes[si];
                                if (!taken.has(candidate)) { num = candidate; found = true; }
                            }
                        }
                        // 0-prefix as last resort
                        if (!found) {
                            for (let n = 1; n <= 99 && !found; n++) {
                                const candidate = '0' + String(n);
                                if (!taken.has(candidate)) { num = candidate; found = true; }
                            }
                        }
                    }
                    d.carNumber = num;
                    d._carNumberSeniority = 0;
                    taken.add(num);
                });
            });

            // sim 2 seasons before career starts so ai drivers have real history when you meet them
            var _mockState = {
                season: 0, week: 1,
                drivers: drivers,
                contracts: [],
                schedules: {},
                seriesFields: {},
                championshipPoints: {},
                dramaQueue: [],
                raceHistory: [],
                rivals: [],
                teamates: [],
            };
            for (var _ps = 0; _ps < 2; _ps++) {
                _mockState.season = _ps + 1;
                drivers.forEach(function(d) {
                    if (!d.active) return;
                    var s = getSeries(d.currentSeriesId);
                    if (!s || s.isSideStep) return;
                    var skillRoll = d.skill + randF(-20, 20);
                    var seasonWins = skillRoll > 75 ? rand(1, 4) : skillRoll > 60 ? rand(0, 2) : 0;
                    var repChange = seasonWins > 2 ? rand(8, 15) : seasonWins > 0 ? rand(3, 8) : skillRoll > 60 ? rand(0, 3) : -rand(0, 2);
                    var _sFanMult = [1, 1, 2, 4, 12, 40, 100, 250][s.tier || 1] || 1;
                    var fanChange = Math.round((seasonWins > 2 ? rand(200, 800) : seasonWins > 0 ? rand(50, 300) : rand(0, 80)) * _sFanMult);
                    d.rep = clamp(d.rep + repChange, 0, 400);
                    d.fans = clamp(d.fans + fanChange, 0, 2000000);
                    d.wins += seasonWins;
                    d.starts += Math.round(s.races * 0.85);
                    d.careerHistory.push({ season: _ps + 1, seriesId: d.currentSeriesId, rep: d.rep, wins: seasonWins, pos: rand(3, 18) });
                    if (d.aiStats && d.aiStats.age < 65) d.aiStats.age++;
                    // Promotion check after each pre-season
                    var nextS = SERIES.find(function(ns) { return ns.tier === s.tier + 1 && !ns.isSideStep; });
                    if (nextS && d.rep >= nextS.reqRep && d.fans >= nextS.reqFans && skillRoll > 65 && Math.random() < 0.25) {
                        d.currentSeriesId = nextS.id;
                        var tl = TEAMS[nextS.id] || ['Independent'];
                        d.currentTeam = tl[rand(0, tl.length - 1)];
                    }
                });
            }

            return drivers;
        }

        // rivalry system
        function touchRival(rivals, name, type, clean = true) {
            let r = rivals.find(x => x.name === name);
            if (!r) { r = { name, incidents: 0, closeRaces: 0, cleanBattles: 0 }; rivals.push(r); }
            if (type === 'incident') r.incidents++;
            if (type === 'close') { r.closeRaces++; if (clean) r.cleanBattles = (r.cleanBattles || 0) + 1; }
            if (type === 'battle') { r.incidents++; r.closeRaces++; }

            // Family spillover — incidents partially affect relatives
            if (type === 'incident' && G && G.drivers) {
                const driver = (G.drivers || []).find(function(d) { return d.name === name; });
                if (driver && driver._familyMembers && driver._familyMembers.length) {
                    driver._familyMembers.forEach(function(relName) {
                        // 40% chance the family member takes notice of an incident
                        if (Math.random() > 0.40) return;
                        let rel = rivals.find(function(x) { return x.name === relName; });
                        if (!rel) { rel = { name: relName, incidents: 0, closeRaces: 0, cleanBattles: 0 }; rivals.push(rel); }
                        rel.incidents += 1; // family rivals still count as incidents
                        // Fire a paddock note occasionally
                        if (G.dramaQueue && Math.random() < 0.35) {
                            var last = driver._familyName || driver.name.split(' ').pop();
                            var lines = [
                                relName + ' heard what happened with ' + name + '. The ' + last + ' family has a long memory.',
                                'Word got back to ' + relName + ' about the incident with ' + name + '. Blood is thicker than water in this paddock.',
                                relName + ' didn\'t say anything publicly about the situation with ' + name + '. They didn\'t have to.',
                                'The ' + last + ' camp is not happy. ' + relName + ' made that clear without making it official.',
                            ];
                            G.dramaQueue.push({
                                id: 'family_incident_' + uid(),
                                title: '👨‍👦 ' + last + ' Family Notice',
                                effect: 'none',
                                desc: lines[rand(0, lines.length - 1)],
                                valence: 'bad',
                            });
                        }
                    });
                }
            }
        }

        function relationship(r) {
            const i = r.incidents || 0, c = r.closeRaces || 0, cb = r.cleanBattles || 0;
            const tier = G ? Math.max(...((G.contracts || []).map(c => ((getSeries(c.seriesId) && getSeries(c.seriesId).tier) || 1))).concat([1])) : 1;
            const rivalThresh = tier >= 6 ? 5 : tier >= 4 ? 4 : tier >= 3 ? 3 : 2;
            const closeThresh = tier >= 6 ? 6 : tier >= 4 ? 5 : tier >= 3 ? 4 : 3;
            const rcThresh    = tier >= 6 ? 4 : tier >= 4 ? 3 : 2;
            // Friend threshold: 3 close races with 0-1 incidents and majority clean
            // Much easier than rivals — clean racing passively builds this
            const friendThresh = tier >= 4 ? 3 : 2;
            if (i >= rivalThresh && c >= closeThresh) return 'frenemy';
            if (i >= rivalThresh) return 'rival';
            if (c >= closeThresh) return cb >= c * 0.6 ? 'racing_rival' : 'frenemy';
            // Friend: decent close race history, mostly clean, low incidents
            if (c >= friendThresh && i <= 1 && cb >= c * 0.5) return 'friend';
            if (c >= rcThresh && i <= 1) return 'racing_rival';
            return 'acquaintance';
        }

        const REL_COLOR = { rival: '#EF4444', friend: '#10B981', frenemy: '#F59E0B', racing_rival: '#F97316', acquaintance: '#94A3B8' };
        const REL_LABEL = { rival: 'RIVAL', friend: 'FRIEND', frenemy: 'HEATED', racing_rival: 'RACING RIVAL', acquaintance: '' };
        const REL_DESC = {
            rival: 'Keeps wrecking you. Remember everything.',
            friend: 'Good, clean racing. Mutual respect.',
            frenemy: 'Race great together and also hate each other.',
            racing_rival: 'Consistent clean battles. The fans love your story arc.',
            acquaintance: "You've shared a track.",
        };

        // unprompted callouts
        // Random post-race comments about the player from anyone in the paddock.
        // No incident or close finish required — just paddock noise.

        const UNPROMPTED_CALLOUT_LINES = [
            // Shade from strangers
            "{name} to a paddock reporter: \"I've been watching {player} for a few races now. Jury's still out.\"",
            "{name} on the series podcast: \"There's a lot of hype around {player}. I'll believe it when I see it on a Saturday night.\"",
            "{name} in the garage: \"Ask me about {player} after they've run a full season here. Until then I don't have much to say.\"",
            "Overheard near the haulers: {name} telling a crew member, \"That {player} thinks they belong here. Might be right. Might not be.\"",
            "{name} on social: \"Lot of new faces in this paddock. Some will stick. Some won't. Time tells.\" Everyone assumed it was about {player}.",
            "{name} to the beat reporter: \"I don't pay attention to what other drivers are doing. I race my race. But I've noticed {player}.\"",
            "{name} at the drivers meeting: \"Some people in this field are here to learn. Some are here to race. {player}'s going to have to decide which one they are.\"",
            "{name} postgame stream: \"Someone asked about {player}. Look, I respect the hustle. The results aren't there yet. That's all I'll say.\"",
            // Genuine props from strangers
            "{name} to a reporter: \"I don't know {player} personally but I've watched the tape. That's a driver. Real one.\"",
            "{name} on the series broadcast: \"Keep an eye on {player} this season. I'm not the only one in this garage saying that.\"",
            "{name} in the paddock: \"Whoever is wrenching on {player}'s car is doing something right. That thing has been fast.\"",
            "A veteran in the paddock — {name} — stopped a journalist this week specifically to mention {player}. \"That kid's the real deal. Write that down.\"",
            "{name} on social: \"Shoutout to {player} for putting on a show out there. Earned every bit of it.\"",
            "{name} to their crew after the race: \"You see {player} out there? That's somebody. Remember that name.\"",
            "{name} at the autograph table: \"Fan asked me who to watch. I said {player}. No hesitation.\"",
            // Veteran observations
            "{name} to the broadcast: \"I've been in this series a long time. I can tell when someone's going to be a problem. {player} is going to be a problem.\"",
            "{name} in a long-form interview: \"The thing about {player} that stands out isn't the speed. It's the patience. That's hard to teach.\"",
            "{name} postgame: \"Young drivers come through here all the time. Most of them are quick for a race or two. {player} has been quick for a while now. Different.\"",
            "{name} to a sponsor rep at dinner: \"{player} is the name I keep hearing in the paddock. Just so you know.\"",
            // Stirring the pot
            "{name} on a podcast: \"I'll be honest — I expected more from {player} by now. Maybe I set the bar too high. Maybe they need to set it higher.\"",
            "{name} in a post-race presser: \"I'm not going to compare myself to {player} because we're at different stages. But the comparison is going to come. And I'm ready for it.\"",
            "{name} on social at midnight: \"Just watching some old race tape. {player} keeps showing up in it. Make of that what you will.\"",
            "{name} to a journalist: \"You want a rivalry? Go ask {player}. I'm not going to manufacture one. But if they want one, I'm not hard to find.\"",
            "{name} in the paddock, to no one in particular: \"I heard {player} has been talking. I don't listen to talk. I watch lap times.\"",
            // Funny / backhanded
            "{name} at the autograph line: \"A kid asked me to sign his hat and write something about {player}. I wrote 'good luck.' Meant it both ways.\"",
            "{name} on a fan call: \"Best thing I can say about {player} is they haven't wrecked me yet. Low bar. They're clearing it.\"",
            "{name} to the crew chief: \"You know what {player} reminds me of? Me. About ten years ago. That's either a compliment or a warning. Haven't decided.\"",
            "{name} postgame, grinning: \"Someone told me {player} said they're coming for my wins. Good. Motivation is motivation.\"",
            "{name} on the broadcast: \"I'll say this about {player} — they are not boring. Whatever else is true, they are not boring.\"",
            // Championship / standings commentary
            "{name} to a reporter: \"Look at the points. {player} is right there. That's not an accident at this point.\"",
            "{name} in the debrief: \"If {player} keeps running like this I'm going to have to actually think about the championship picture. Haven't had to do that in a while.\"",
            "{name} on the paddock radio, overheard: \"Where did {player} finish? ... Yeah. Yeah that's what I thought. Keep an eye on that.\"",
            "{name} on a podcast: \"The championship conversation used to be about three or four drivers. Now I hear {player}'s name in there. The field has gotten more interesting.\"",
        ];

        const UNPROMPTED_PROPS_LINES = [
            "{name} singled out {player} specifically in their post-race media. Nobody asked. They just said it.",
            "A crew member from {name}'s team was overheard telling someone: \"{player} is going to win a lot of races here. Mark it.\"",
            "{name} reposted a fan clip of {player}'s race with a single fire emoji. Paddock noticed.",
            "{name} to the broadcast team: \"Off the record? {player} is the most interesting driver in this field right now.\" It made it on air anyway.",
            "{name} walked past {player}'s pit box after the race and gave a slow nod. Old school respect. People noticed.",
        ];

        function maybeFireUnpromptedCallout(state, seriesId, result) {
            // ~15% chance per race
            if (Math.random() > 0.15) return;

            // Need at least some drivers in the field to pull a name from
            const fieldDrivers = (result.finishOrder || [])
                .filter(e => !e.isPlayer && e.name && e.name.toLowerCase() !== state.driverName.toLowerCase())
                .map(e => e.name);

            // Also pull from known drivers in this series
            const knownInSeries = (state.drivers || [])
                .filter(d => d.source === 'known' && d.currentSeriesId === seriesId && d.active)
                .map(d => d.name)
                .filter(n => n.toLowerCase() !== state.driverName.toLowerCase());

            // Boost substitute drivers only if player is currently injured/unavailable
            const playerCurrentlyOut = !!(state.playerInjury && state.playerInjury.seriesId === seriesId);
            const subDrivers = playerCurrentlyOut
                ? (state.drivers || [])
                    .filter(d => d.substituteFor && d.active && d.currentSeriesId === seriesId)
                    .map(d => d.name)
                : [];
            const pool = [...new Set([...fieldDrivers, ...knownInSeries, ...subDrivers, ...subDrivers])];
            if (!pool.length) return;

            const name = pool[rand(0, pool.length - 1)];

            // Weight toward shade if player is doing well, props if struggling
            const last3 = state.raceHistory.slice(-3).filter(r => !r.dq);
            const recentAvg = last3.length ? last3.reduce((a, r, _, arr) => a + (r.pos / arr.length), 0) : 10;
            const useProps = recentAvg <= 5 ? Math.random() < 0.60 : Math.random() < 0.35;

            let line;
            if (useProps && Math.random() < 0.25) {
                // Short props line
                line = UNPROMPTED_PROPS_LINES[rand(0, UNPROMPTED_PROPS_LINES.length - 1)]
                    .replace(/{name}/g, name)
                    .replace(/{player}/g, state.driverName);
            } else {
                line = UNPROMPTED_CALLOUT_LINES[rand(0, UNPROMPTED_CALLOUT_LINES.length - 1)]
                    .replace(/{name}/g, name)
                    .replace(/{player}/g, state.driverName);
            }

            const isPositive = useProps || line.includes('real deal') || line.includes('shoutout') || line.includes('props');

            // Apply immediate passive effect — paddock talk has weight
            if (isPositive) {
                state.reputation = Math.max(0, state.reputation + rand(1, 3));
                state.fans = Math.max(0, state.fans + rand(50, 200));
                // Push toward friend/racing_rival
                touchRival(state.rivals, name, 'close', true);
            } else {
                // Shade — nudge toward rivalry, no rep hit unless they're already a rival
                const existing = (state.rivals || []).find(r => r.name === name);
                const rel = existing ? relationship(existing) : null;
                if (rel === 'rival' || rel === 'frenemy') {
                    state.reputation = Math.max(0, state.reputation - 1);
                }
                touchRival(state.rivals, name, 'incident', false);
            }
            const effect = isPositive ? 'rep_fans' : 'none';
            state.dramaQueue.push({
                id: 'unprompted_' + uid(),
                title: isPositive ? `${name} Mentions You` : `${name} Has Opinions`,
                effect,
                value: isPositive ? rand(1, 3) : 0,
                fans: isPositive ? rand(50, 200) : 0,
                desc: line,
                valence: isPositive ? 'good' : 'neutral',
                _isCallout: true,
                _calloutType: isPositive ? 'close' : 'incident',
                _calloutDriver: name,
            });
        }

        // driver callout system
        // After a race, drivers you had incidents with or finished close to have a
        // chance to call you out publicly. You choose how to respond. The response
        // affects rep, fans, and the rivalry relationship.
        const CALLOUT_INCIDENT_LINES_ESCALATED = [
            '{name} didn\'t hold back this time: "{player} has been pulling this shit all season. I\'m done being diplomatic about it."',
            '{name} to the media, clearly done being polite: "At some point you have to call it what it is. {player} is a dirty driver. Full stop."',
            '{name} on social at midnight: "I\'ve kept quiet long enough. {player} knows what they did. The whole paddock knows. I\'m just the one saying it."',
            '{name} in a post-race presser, jaw tight: "You want my honest reaction? {player} can go straight to hell. That\'s my honest reaction."',
            '{name} to a paddock reporter: "I\'ve got a list. {player}\'s name is at the top of it. Has been for a while now."',
            '{name} didn\'t wait for a microphone: "Every single week with this guy. Every. Single. Week. I am so tired of {player}\'s bullshit."',
            '{name} on the broadcast, barely keeping it together: "I will not be lectured about racing by {player}. Not today. Not ever."',
            '{name} to anyone who would listen after the race: "That wasn\'t racing. That was assault. {player} should be parked for a month."',
            '{name} in a long post on social: "I\'ve tried to be professional. I\'ve tried to move on. But {player} has made that impossible and I\'m not going to pretend otherwise."',
            '{name} on a podcast, no filter: "Ask me about {player}? Really? Fine. That driver is a menace and everyone in this paddock is too scared to say it out loud."',
            'Hot mic caught {name} after the incident: "I swear to God if {player} touches my car one more time I am going to lose my mind."',
            '{name} skipped the media scrum and went straight to the officials\' truck. Word is they filed a formal complaint against {player}.',
            '{name} at the drivers\' meeting the following week, standing up: "I need everyone in this room to hear this. {player} and I are going to have a serious problem if this continues."',
            '{name} to their crew chief, overheard on scanner: "I don\'t care what it costs me in points. Next time {player} pulls that, I\'m giving it right back."',
            '{name} on social, all caps: "DONE. Being. Nice. About. This. {player} — you know what you did."',
            '{name} after the race, not waiting for a mic: "What the fuck was that? Seriously. What the actual fuck was {player} thinking?"',
            '{name} on social, 1am: "I don\'t usually post like this but I\'ve had a few drinks and I need everyone to know that {player} is an absolute asshole on the race track."',
            '{name} to a reporter who probably didn\'t expect this: "Off the record? {player} is the dirtiest driver I\'ve ever raced against. On the record? Same answer."',
            '{name} in the hauler, door open, not caring who heard: "I am so fucking sick of {player}. Season after season of this garbage."',
            '{name} filed a protest, then posted about it: "Let the officials sort it out. All I know is {player} needs to be held accountable because nobody else is doing it."',
            '{name} at the autograph table, still hot: "You want me to sign something? Sure. You want to talk about {player}? Absolutely. That driver is out of their damn mind."',
            '{name} on a livestream, forgetting they were live: "-- oh we\'re live? Good. Everyone should hear this. {player} can kiss my ass."',
            '{name} to their spotter on the radio, scanner caught it: "If {player} comes anywhere near me in the last ten laps, I want you to say nothing. I know what I\'m doing."',
            '{name} to a fellow driver in the garage, overheard: "You know what the problem with {player} is? Zero consequences. Every single week, zero consequences."',
            '{name} issued a statement through their team PR. It was supposed to be measured. It was not: "We are requesting a full stewards review of {player}\'s conduct and if nothing changes we will be exploring every available option."',
            'Someone asked {name} about the incident at the sponsor dinner that evening. Bad timing. The sponsor heard everything.',
            '{name} cornered {player} in the drivers\' meeting. Nobody knows exactly what was said but {player} sat down quickly.',
            '{name} on a rival\'s podcast, probably shouldn\'t have agreed to this one: "You want the truth about {player}? I\'ve got about four seasons worth of truth for you."',
            '{name} to the broadcast booth after climbing out of the car: "I\'m not going to sugarcoat it. That was a chickenshit move by {player} and everybody saw it."',
            'Word from the {name} camp is they\'ve retained legal counsel following the latest incident with {player}. Whether that goes anywhere is another question.',
            '{name} posted a seventeen-second video. No caption. Just in-car footage of the incident with {player}. The comments are not kind.',
            '{name} was asked to comment on {player}\'s post-race statement. They laughed. Then they said: "Sure, let\'s go with that version of events."',
            '{name} to the series officials, loud enough for the media to hear: "Either you do something about {player} or I will handle it myself. Your choice."',
            '{name} in the post-race presser, jaw tight, voice level: "I have nothing to say about {player} that I\'m willing to say in front of cameras. Next question."',
            '{name} on social the next morning, clearly slept on it and decided to go harder: "Woke up still thinking about what {player} did. Still pissed. Not going away."',
        ];
        const CALLOUT_INCIDENT_LINES = [
            "{name} didn't hold back in the post-race interview. \"That move was completely unnecessary. I don't know what the hell {player} was thinking.\"",
            "{name} went straight to social media. \"Shoutout to {player} for ruining my damn night. Hope the points were worth it.\"",
            "{name} told the paddock reporter exactly what they thought. \"Dirty racing. Plain and simple. I'll remember that one.\"",
            "{name} was still hot in the garage. \"I gave {player} room. They took my whole damn fender. This isn't over.\"",
            "In the post-race presser, {name} singled you out. \"I've raced clean my whole career. That contact was intentional and everyone saw it.\"",
            "{name} posted a clip of the incident with a one-word caption: \"Really, {player}?\"",
            "A reporter caught {name} in the pits. \"I don't have much to say except {player} owes me a conversation and probably an apology.\"",
            "{name} didn't mince words on the broadcast. \"That's not how you're supposed to race somebody. Full stop.\"",
            "Text from {name} hit your phone before you were out of the car. It was not friendly. Word got out.",
            "{name} pulled no punches. \"If {player} races like that again we're going to have a damn problem.\"",
            "{name} was still fuming in the hauler. \"I've seen better decisions from a guy at a stop sign. {player} had no business making that move.\"",
            "{name} kept it simple on the broadcast. \"That was pure buffoonery. I'll leave it at that.\"",
            "{name} to the series reporter: \"I don't know who taught {player} to race but they need a refund.\"",
            "{name} posted a meme. No words. Just a still frame of the contact and a clown emoji. You know who it was aimed at.",
            "{name} in the garage: \"I'm not mad. I'm just tired of giving people the benefit of the doubt they clearly don't deserve.\"",
            "Word came through the paddock that {name} called {player} 'a hazard with a helmet' in the team debrief. Someone was taking notes.",
            "{name} on the post-race stream: \"I stay out of people's way. All I ask is the same. That's apparently too much to expect from {player}.\"",
            "{name} to anyone in earshot: \"That move was dumb. I don't use that word lightly. It was genuinely, spectacularly dumb.\"",
            "The series stewards got a written complaint from {name}'s team. The language in it, apparently, was colorful.",
            "{name} kept it short in the press conference. \"Noted. We're done talking about it.\" Everyone knew it was about {player}.",
            "{name} on the radio, accidentally broadcast: \"Tell {player} they can have that corner when I'm retired.\" It made the highlight reel.",
            "{name} post-race: \"I've been racing fifteen years. I've never been hit that hard by someone who wasn't trying to. At least I hope they weren't.\"",
            "{name}'s crew chief to a nearby reporter: \"Our driver is fine. The car is not. {player} is going to hear about this.\"",
            "{name} shook their head at the replay screen. \"That's not racing. That's just a person being a Billy Bad Butt with someone else's equipment.\"",
            "{name} pointed at you across the infield. Didn't say a word. Walked away. Somehow worse than if they'd said something.",
            "{name} to the broadcast team: \"I thought we were racing. Apparently {player} had a different agenda. Still figuring out what.\"",
            "{name} after the race: \"It wasn't even a good hit. Just a bad one. If you're going to wreck somebody at least make it look intentional.\"",
            "{name} on social the next morning: \"Slept on it. Still pissed. Moving on.\"",
            "{name} to a reporter outside the hauler: \"Ask me again when I've calmed down. Actually don't. Come back never.\"",
            "{name} at the autograph table: \"You want to know about the incident? Ask {player}. They apparently have opinions about how racing works.\"",
            "{name} on a livestream that night: \"I'm not going to call anyone out. I'll just say the bar for self-awareness in this paddock is real low.\"",
            "{name}'s spotter, overheard on the scanner: \"Yeah that was {player}. Yeah. We saw it.\" The tone said everything.",
            "{name} filed a protest, withdrew it an hour later, then posted: \"Took the high road. Hated every second of it.\"",
            "A paddock insider said {name} called {player} 'the most confidently wrong driver in this field.' It got around fast.",
            "{name} after climbing out: \"I'm fine. The car's fine. My opinion of {player} is not fine.\"",
            "Someone in {name}'s pit crew spray-painted something on the splitter that had to be taped over before TV got there. Directed at {player}.",
            "{name} walked past your pit box loud enough for your crew to hear: \"Some people in this series got their license out of a cereal box.\"",
            "{name} post-race tweet: \"Grateful for the fans. Car felt good. Some people in this field need to go back to karting. That's all I'll say.\"",
            "{name} doing a cooldown interview still in their helmet: \"I'm keeping this on until I'm calm enough to be on camera. Give me a minute.\"",
            "{name} on the broadcast: \"I'm a professional and I'm going to act like one. But I want everyone watching to know — I remember everything.\"",
            "{name} late that night on social: \"Replayed it fourteen times. Still can't figure out what the plan was. Guess there wasn't one.\"",
            "{name} to their crew, caught on a nearby mic: \"If {player} pulls that again I swear to God I'm parking sideways in front of their pit box.\"",
            "{name} to the series official handing out the incident report form: \"Do I get extra pages? Because I have thoughts.\"",
            "{name} post-race, loud enough: \"That boy drives like he stole it and doesn't care if he brings it back.\"",
            "{name} to a sponsor rep: \"Tell your people I may need a minute before cameras. I need to locate my composure. It left with my front bumper.\"",
            "{name} on the podcast the next week: \"My crew chief told me not to say anything. So I'm not. But y'all saw it.\"",
            "{name} post-race, absolutely not calm: \"I don't know if that was intentional or just stupid. Honestly? Either answer pisses me off.\"",
            "{name} to the media: \"{player} has two brain cells and they're both fighting for third place. That's my official statement.\"",
            "{name} overheard near the haulers: \"That move had the IQ of a parking cone. A parking cone wouldn't have hit me, by the way.\"",
            "{name} on the cool-down lap radio, accidentally broadcast: \"Are you kidding me? Are you KIDDING me right now?\" Replayed seventeen times on social.",
            "{name} on a fan Q&A stream: Someone asked about the incident. They stared at the camera for four full seconds. Then said: \"Next question.\"",
            "{name} in the garage, to their engineer: \"Write this down. {player}. Write it down. We're going to need that name.\"",
            "{name} post-race interview, barely holding it together: \"I'm going to say something I'll regret if I answer that right now. So. Moving on.\"",
            "{name} at the drivers meeting the next week, unprompted: \"I just want to say — some of y'all need to re-read the rulebook. Not naming names. {player} knows.\"",
            "{name} to a fellow driver in the garage: \"You know what burns me? It wasn't even a good move. If you're gonna wreck me, at least be creative about it.\"",
            "{name} post-race, caught on a hot mic: \"That son of a bitch — \" and then the feed cut. Everyone heard it. Nobody's talking about anything else.",
            "Broadcast caught {name} mouthing something at the camera after the incident. Lip readers on social had a field day. No official comment from the team.",
            "{name} in the post-race presser, very slowly: \"I. Have. Nothing. To. Say. About. {player}. At. This. Time.\" Paused. \"That's it. That's my answer.\"",
            "{name} to the crew chief over the radio, still audible on the broadcast feed: \"Tell me that wasn't who I think it was.\" Long silence. \"Yeah. Yeah that tracks.\"",
            "{name} on social at midnight: \"Couldn't sleep. Watched the replay. Still think {player} is an ass. Good night.\"",
            "{name} to the pit reporter immediately post-race: \"You want a quote? Here's your quote — what the hell was that?\" Walked away. That was the whole interview.",
            "{name} at the autograph session the next day, cheerfully signing a hat: \"Oh you want me to sign it to {player}? Sure. I've got some words for them.\"",
            "{name} overheard in the garage: \"I've been wrecked by better drivers doing worse things and been less annoyed. That's how stupid that move was.\"",
            "{name} on a podcast three days later, still not over it: \"My wife told me to let it go. My crew chief told me to let it go. My spotter told me to let it go. I'm not letting it go.\"",
            "{name} outside the hauler, to nobody in particular: \"I didn't say {player} was dumb. I said that move was dumb. There's a difference. Probably.\"",
            "{name} post-race statement released by their PR team, clearly heavily edited: \"We are disappointed with the on-track contact and will be reviewing our options.\" The unedited version was reportedly something else entirely.",
            "{name} into the spotter's radio, caught on a leaked audio clip: \"That's {player}. That's {player} being {player}. Write it in the notes. Again.\"",
            "{name} to the crew in the debrief: \"I've been hit by amateurs, I've been hit by veterans, I've been hit by people having the worst day of their career. That? That was a new category.\"",
            "{name} on a fan call: \"I don't have beef with {player}. Beef implies I think about it. I've moved on.\" Paused. \"Okay I haven't moved on. But I'm working on it.\"",
        ];

        const CALLOUT_CLOSE_LINES = [
            "{name} was mic'd up for the finish and it got played back everywhere. \"{player} nearly had me there. Nearly.\"",
            "In victory lane, {name} pointed across the track at you. \"That's the one to watch. {player} was right there all damn night.\"",
            "{name} flagged you down after the race. \"Good battle tonight. Let's do it again next week.\"",
            "{name} went on the series podcast and brought your name up unprompted. \"The battle with {player} mid-race was the highlight. Real racing.\"",
            "{name} posted after the race: \"{player} and I put on a show tonight. Respect.\"",
            "The broadcast caught {name} grinning after the finish. \"Ask me about {player}. Fastest car I've ever had to hold off.\"",
            "{name} told the press: \"I knew {player} was coming. I could see the nose every lap. That's what racing is supposed to look like.\"",
            "In the garage cool-down, {name} walked over and offered a handshake. Cameras caught it. People noticed.",
            "{name} sent a voice note to the series group chat after the race. Someone shared it. \"That finish with {player} — that's why I do this.\"",
            "{name} told a reporter: \"If {player} keeps racing like that, they're going to win a lot of races here. Took everything I had.\"",
            "{name} on the broadcast: \"I've raced a lot of people. {player} is the real deal. I don't say that about everybody.\"",
            "Post-race, {name} found you in the garage. \"I knew you were there the whole last lap. Didn't look. Didn't need to. Knew.\" They walked away grinning.",
            "{name} to the paddock reporter: \"That's the most fun I've had in a race car in two years. {player} made me earn every damn inch of that.\"",
            "{name} posted a slow-motion clip of the side-by-side moment. Caption: \"This is why.\"",
            "{name} at the post-race presser: \"People talk about the championship, the money, the points. That battle with {player} tonight? That's what I race for.\"",
            "Overheard in the hauler: {name} replaying the final lap. \"Watch this. Watch {player} try to find a way through. Couldn't do it. Not tonight.\"",
            "{name} on social: \"No beef, no drama. Just two drivers going for it. {player}, that was a good one. See you next week.\"",
            "{name} laughing in the cool-down: \"I looked over and saw {player} right there and I thought — oh hell, this is going to be a problem. And it was. For a while.\"",
            "{name} post-race: \"I don't care about the gap. I care that I had to drive the wheels off it to keep {player} behind me. That means something.\"",
            "{name} tapped the roof of your car on the cool-down lap. Just once. You both knew what it meant.",
            "{name} on the podcast the next day: \"Clean, fast, and hard. {player} brought it out of me. Couldn't ask for more than that.\"",
            "A fan posted the battle clip. {name} replied: \"Tag {player}. They deserve the credit too.\"",
            "{name} to the broadcast: \"Ask {player} how their heart rate was on that last restart. Mine was through the roof. Worth every second.\"",
            "{name} post-race tweet: \"Hats off to {player}. I won the position, not the argument. See you next race.\"",
            "{name} walking to the hauler, to nobody in particular: \"That kid can flat out drive. I'm worried about the next twenty laps with them behind me.\"",
            "{name} to their crew chief on the cool-down lap: \"Did you see what they tried?\" Long pause. \"Good driver. Really good driver.\"",
            "{name} signing autographs: \"You want a good race to watch? Pull up the last ten laps. Me and {player}. That's what this series is about.\"",
            "{name} on a late-night stream: \"I'm not going to pretend that wasn't stressful. {player} had me honest the whole last run. I had nothing left at the end.\"",
            "{name} in the debrief, overheard: \"Tell me when {player} is on the schedule again. I want to be ready this time.\" They were smiling when they said it.",
            "{name} to a rival driver in the garage: \"You race {player} yet? Yeah. Yeah, you'll know when you do.\"",
            "{name} in a post-race interview still catching their breath: \"I haven't had to race that hard since the late models. {player} is damn dangerous. I mean that as a compliment.\"",
            "{name} to the series broadcaster: \"I thought I had it until about three to go. Then {player} showed back up. Had to dig.\"",
            "{name} on social the morning after: \"Couldn't sleep. Kept replaying that last run. {player} was right there every lap. Good problem to have.\"",
            "{name} at the sponsor dinner: \"Best battle I've had this season. {player} — that one's going to be good for this series for a long time.\"",
            "{name} to a young fan at the hauler: \"You see the finish? Me and {player}? That's what you're working toward, kid. Remember it.\"",
            "{name} in a radio interview: \"My wife texted me one word. 'Wow.' That's because of {player}. They earned that.\"",
            "{name} post-race, still in the car, on hot mic: \"Tell me {player}'s got a ride lined up for next season. I want to race them again.\"",
            "{name} walking past your pit box after the race, stopping briefly: \"Hell of a race. Hell of a race.\" Kept walking. Meant it.",
            "{name} at the drivers meeting the following week: \"I just want to race {player} again.\" Half the room laughed. The other half nodded.",
            "{name} on a fan account reply: \"That battle was real. No script. No team orders. Just me and {player} figuring it out at speed. That's the good stuff.\"",
            "{name} overheard telling their spotter: \"I need a faster car or {player} needs a slower one. Either way, schedule the rematch.\"",
            "{name} quietly, to your crew chief across the pit wall: \"Your driver's the real deal. You know that, right?\" Walked off before there was time to respond.",
            "{name} post-race livestream: \"Someone asked if {player} and I planned that finish. Yeah. We planned it on the way to the grid. Come on. That was just racing. Beautiful, stupid racing.\"",
            "{name} to the broadcast after climbing out: \"I've been in this sport a long time. I know good when I see it. {player} is good.\"",
            "{name} in a text that got screenshot and shared: \"Not mad about the result. I raced {player} as hard as I know how to race somebody. That's enough for tonight.\"",
            "{name} to their engineer post-race: \"Put {player} in the notes. Not as a threat. As a reminder to bring our A-game. Every time.\"",
            "{name} on the series fan call: \"Someone asked who's going to be a factor. Same answer every time. {player}. Watch them.\"",
            "{name} in the garage, to a fellow driver: \"You ever just race somebody and think — damn, I'm glad we're in the same era? That's {player} for me.\"",
            "{name} on social at midnight: \"Still thinking about that last run. {player} is going to win a lot of races. Glad I held them off tonight. Barely.\"",
            "{name} to a reporter, unprompted: \"I know people want drama. Sorry. Me and {player} just raced hard and clean. Sometimes that's all it is. Good for the sport.\"",
            "{name} at the autograph table the next day: \"Sign it to {player}? Sure. I'll write 'nice try.' With love.\"",
            "{name} post-race, grinning at the reporter: \"You want controversy? I got nothing. Me and {player} put on a show. Go write about that instead.\"",
            "{name} on the broadcast, barely composed: \"That last lap I was just talking to myself. 'Hold on. Hold on. Hold on.' {player} makes you earn it. Every damn lap.\"",
            "{name} in a podcast the following week: \"My crew chief said 'you've got {player} behind you.' I said I know. I've known for twenty laps. That's not a problem. That's a race.\"",
            "{name} to a journalist outside the hauler: \"Off the record? That was one of the best battles I've had in years. On the record? Same thing. I don't mind saying it.\"",
            "{name} shaking their head in the best way possible after the race: \"That son of a gun nearly had me. Nearly. I'm going home and sleeping like a baby.\"",
            "{name} to the spotter on the cool-down lap: \"Is {player} behind me?\" Spotter: \"No you're clear.\" {name}: \"Damn. I was starting to enjoy it.\"",
            "{name} post-race, to anyone who'd listen: \"People ask what I love about this sport. Tonight. Tonight is what I love about this sport.\"",
        ];

        // Response options per callout type
        // Each response: { label, btnClass, rep, fans, rivalEffect, log }
        // rivalEffect: 'incident' = push toward rival, 'close_clean' = push toward friend/racing_rival, null = no change
        const CALLOUT_RESPONSES = {
            incident: [
                {
                    label: 'Stay Professional',
                    btnClass: 'btn-secondary',
                    rep: 3, fans: 100,
                    rivalEffect: null,
                    log: 'Kept it professional publicly. Rep bump for taking the high road.',
                },
                {
                    label: 'Fire Back',
                    btnClass: 'btn-danger',
                    rep: -2, fans: 300,
                    rivalEffect: 'incident',
                    log: 'Fired back publicly. Fans loved it. The beef is officially on.',
                },
                {
                    label: 'Apologize',
                    btnClass: 'btn-ghost',
                    rep: 5, fans: -100,
                    rivalEffect: null,
                    log: 'Issued a public apology. Rep gain, but some fans thought it was weak.',
                },
            ],
            close: [
                {
                    label: 'Return the Respect',
                    btnClass: 'btn-success',
                    rep: 3, fans: 200,
                    rivalEffect: 'close_clean',
                    log: 'Returned the compliment publicly. Good for the sport narrative.',
                },
                {
                    label: 'Stay Quiet',
                    btnClass: 'btn-ghost',
                    rep: 0, fans: -50,
                    rivalEffect: null,
                    log: 'Said nothing. Some fans found it cold given the good battle.',
                },
                {
                    label: 'Talk Some Trash',
                    btnClass: 'btn-warn',
                    rep: -1, fans: 350,
                    rivalEffect: 'incident',
                    log: 'Turned a compliment into a challenge. Fans are hyped. Relationship may sour.',
                },
            ],
        };

        function maybeFireDriverCallout(state, driverName, type, track) {
            // type: 'incident' or 'close'
            // Chance: 40% for incidents, 25% for close finishes
            const chance = type === 'incident' ? 0.40 : 0.25;
            if (Math.random() > chance) return;

            const rival = (state.rivals || []).find(function (r) { return r.name === driverName; });
            const incidentCount = rival ? (rival.incidents || 0) : 0;
            const useEscalated = type === 'incident' && incidentCount >= 5 && Math.random() < 0.6;
            const pool = useEscalated ? CALLOUT_INCIDENT_LINES_ESCALATED : (type === 'incident' ? CALLOUT_INCIDENT_LINES : CALLOUT_CLOSE_LINES);
            const line = pool[rand(0, pool.length - 1)]
                .replace(/{name}/g, driverName)
                .replace(/{player}/g, state.driverName);

            const venue = type === 'incident'
                ? ['post-race interview', 'social media', 'paddock', 'broadcast'][rand(0, 3)]
                : ['post-race interview', 'series podcast', 'social media', 'broadcast'][rand(0, 3)];

            state.dramaQueue.push({
                id: 'callout_' + uid(),
                title: useEscalated
                    ? `${driverName} Is Done Being Nice`
                    : type === 'incident'
                        ? `${driverName} Calls You Out`
                        : `${driverName} Gives You Props`,
                effect: 'none',
                desc: line,
                valence: type === 'incident' ? 'bad' : 'good',
                _isCallout: true,
                _calloutType: type,
                _calloutDriver: driverName,
                _calloutTrack: track,
                _venue: venue,
            });
        }
        // driver profile modal
        function openDriverProfileModal(driverName) {
            var driver = (G.drivers || []).find(function (d) { return d.name === driverName; });
            var myRivalEntry = (G.rivals || []).find(function (r) { return r.name === driverName; });
            var myRel = myRivalEntry ? relationship(myRivalEntry) : 'acquaintance';
            var myRelColor = REL_COLOR[myRel] || '#94A3B8';
            var myRelLabel = REL_LABEL[myRel] || '';
            var s = driver ? getSeries(driver.currentSeriesId) : null;
            var isTm = (G.teammates || []).some(function (t) { return t.name === driverName; });
            var isInjured = driver && driver.injuredOrPenalized;

            // Check if callout is appropriate
            var inCurrentSeries = driver && G.contracts.some(function (c) { return c.seriesId === driver.currentSeriesId; });
            var isNotableRival = myRivalEntry && ['rival', 'frenemy', 'racing_rival'].includes(myRel);
            var canCallout = inCurrentSeries || isNotableRival;

            // Their relationships with other drivers
            var theirRivals = (driver && driver.aiRivals || []).map(function (name) {
                var d2 = (G.drivers || []).find(function (d) { return d.name === name; });
                return { name: name, series: d2 ? (getSeries(d2.currentSeriesId) && getSeries(d2.currentSeriesId).short) || '' : '' };
            });
            var theirFriends = (driver && driver.aiFriends || []).map(function (name) {
                var d2 = (G.drivers || []).find(function (d) { return d.name === name; });
                return { name: name, series: d2 ? (getSeries(d2.currentSeriesId) && getSeries(d2.currentSeriesId).short) || '' : '' };
            });

            openModal(h('div', null,
                // Header
                h('div', { className: 'modal-eyebrow' }, s ? (s.tier <= 2 ? s.short : s.short + ' · ' + (driver.currentTeam || 'Independent')) : 'Driver Profile'),
                h('div', { className: 'modal-title' }, driverName,
                    isInjured ? h('span', { style: { fontSize: '13px', color: '#EF4444', marginLeft: '8px' } }, '⛑️ INJURED') : null,
                    isTm ? h('span', { style: { fontSize: '13px', color: '#3B82F6', marginLeft: '8px' } }, 'TEAMMATE') : null,
                ),
                s ? h('div', { className: 'modal-sub' }, s.name) : null,

                // Stats row
                driver ? h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px', marginBottom: '14px' } },
                    miniStatBox('Wins', driver.wins, '#F59E0B'),
                    miniStatBox('Starts', driver.starts, '#3B82F6'),
                    miniStatBox('Rep', driver.rep, '#F59E0B'),
                    miniStatBox('Fans', fmtFans(driver.fans), '#EC4899'),
                ) : null,

                // Your relationship with them
                h('div', { style: { background: '#060A10', border: '1px solid #1E2433', borderRadius: '8px', padding: '12px', marginBottom: '12px' } },
                    h('div', { style: { fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', fontWeight: 700 } }, 'Your Relationship'),
                    myRelLabel
                        ? h('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' } },
                            h('span', { style: { fontSize: '14px', fontWeight: 800, color: myRelColor, background: myRelColor + '22', border: '1px solid ' + myRelColor + '44', padding: '3px 10px', borderRadius: '4px' } }, myRelLabel),
                            myRivalEntry ? h('span', { style: { fontSize: '13px', color: '#94A3B8' } },
                                (myRivalEntry.incidents || 0) + ' incidents · ' + (myRivalEntry.closeRaces || 0) + ' close races'
                            ) : null,
                        )
                        : h('span', { style: { fontSize: '14px', color: '#64748B' } }, 'No history yet.'),
                ),

                // Their relationships with others
                (theirRivals.length || theirFriends.length || (driver && driver._familyMembers && driver._familyMembers.length)) ? h('div', { style: { background: '#060A10', border: '1px solid #1E2433', borderRadius: '8px', padding: '12px', marginBottom: '12px' } },
                    h('div', { style: { fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', fontWeight: 700 } }, 'Paddock Relationships'),
                    // Family connections
                    driver && driver._familyMembers && driver._familyMembers.length ? h('div', { style: { marginBottom: '8px' } },
                        h('div', { style: { fontSize: '12px', color: '#F59E0B', fontWeight: 700, marginBottom: '4px' } }, '👨‍👦 Family — The ' + (driver._familyName || '') + 's'),
                        h('div', { style: { display: 'flex', gap: '6px', flexWrap: 'wrap' } },
                            ...driver._familyMembers.map(function(relName) {
                                return h('span', {
                                    style: { fontSize: '12px', background: '#F59E0B22', border: '1px solid #F59E0B44', borderRadius: '4px', padding: '2px 8px', color: '#FDE68A', cursor: 'pointer' },
                                    onClick: function() { closeModal(); openDriverProfileModal(relName); }
                                }, relName);
                            })
                        ),
                    ) : null,
                    theirRivals.length ? h('div', { style: { marginBottom: '8px' } },
                        h('div', { style: { fontSize: '12px', color: '#EF4444', fontWeight: 700, marginBottom: '4px' } }, 'Rivals'),
                        h('div', { style: { display: 'flex', gap: '6px', flexWrap: 'wrap' } },
                            ...theirRivals.map(function (r) {
                                return h('span', {
                                    style: { fontSize: '12px', background: '#EF444422', border: '1px solid #EF444444', borderRadius: '4px', padding: '2px 8px', color: '#FCA5A5', cursor: 'pointer' },
                                    onClick: function() { closeModal(); openDriverProfileModal(r.name); }
                                }, r.name + (r.series ? ' (' + r.series + ')' : ''));
                            })
                        ),
                    ) : null,
                    theirFriends.length ? h('div', null,
                        h('div', { style: { fontSize: '12px', color: '#10B981', fontWeight: 700, marginBottom: '4px' } }, 'Friends'),
                        h('div', { style: { display: 'flex', gap: '6px', flexWrap: 'wrap' } },
                            ...theirFriends.map(function (f) {
                                return h('span', {
                                    style: { fontSize: '12px', background: '#10B98122', border: '1px solid #10B98144', borderRadius: '4px', padding: '2px 8px', color: '#6EE7B7', cursor: 'pointer' },
                                    onClick: function() { closeModal(); openDriverProfileModal(f.name); }
                                }, f.name + (f.series ? ' (' + f.series + ')' : ''));
                            })
                        ),
                    ) : null,
                ) : null,

                // Callout buttons
                canCallout ? h('div', { style: { display: 'flex', gap: '8px', marginBottom: '12px' } },
                    mkBtn('Call Them Out', 'btn btn-sm btn-danger', function () {
                        closeModal();
                        openPlayerCalloutModal(driverName, 'incident', null);
                    }),
                    mkBtn('Give Props', 'btn btn-sm btn-secondary', function () {
                        closeModal();
                        openPlayerCalloutModal(driverName, 'close', null);
                    }),
                ) : null,

                // AI Stats section
                h('div', { style: { background: '#060A10', border: '1px solid #1E2433', borderRadius: '8px', padding: '12px', marginBottom: '12px' } },
                    h('div', { style: { fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px', fontWeight: 700 } }, 'iRacing AI Stats'),
                    h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' } },
                        ...([
                            ['relativeSkill', 'Relative Skill'],
                            ['aggression', 'Aggression'],
                            ['optimism', 'Optimism'],
                            ['smoothness', 'Smoothness'],
                            ['pitCrewSkill', 'Pit Crew Skill'],
                            ['pittingRisk', 'Pitting Risk'],
                        ].map(function (pair) {
                            const key = pair[0], label = pair[1];
                            const val = (driver && driver.aiStats && driver.aiStats[key]) || 50;

                            return h('div', null,
                                h('div', { style: { fontSize: '12px', color: '#94A3B8', marginBottom: '3px' } }, label),
                                h('div', { style: { fontSize: '14px', color: '#F9FAFB', padding: '7px 11px', background: '#0B0F1A', border: '1px solid #2D3748', borderRadius: '6px' } }, String(val)),
                            );
                        })),
                    ),
                ),

                h('div', { className: 'modal-actions' },
                    mkBtn('Close', 'btn btn-ghost', closeModal),
                ),
            ));
        }

        // player callout myodal
        function openPlayerCalloutModal(name, type, track) {
            const lines = type === 'incident' ? CALLOUT_INCIDENT_LINES : CALLOUT_CLOSE_LINES;
            const line = lines[rand(0, lines.length - 1)]
                .replace(/{name}/g, G.driverName)
                .replace(/{player}/g, name);
            // Apply effects directly — player already chose their intent
            const repDelta = type === 'incident' ? -1 : 3;
            const fanDelta = type === 'incident' ? rand(200, 500) : rand(100, 300);
            G.reputation = Math.max(0, G.reputation + repDelta);
            G.fans = Math.max(0, G.fans + fanDelta);
            if (type === 'incident') touchRival(G.rivals, name, 'incident', false);
            else touchRival(G.rivals, name, 'close', true);

            const existingRival = (G.rivals || []).find(r => r.name === name);
            const rel = existingRival ? relationship(existingRival) : null;
            let narrativeNote = null;
            if (type === 'incident' && (rel === 'friend' || rel === 'racing_rival')) {
                narrativeNote = `You publicly called out ${name} despite your history of clean racing together. The paddock noticed.`;
                G.dramaQueue.push({ id: 'shift_' + uid(), title: 'Narrative Shift', effect: 'none', desc: narrativeNote, valence: 'neutral' });
            } else if (type === 'close' && (rel === 'rival' || rel === 'frenemy')) {
                narrativeNote = `You gave props to ${name} publicly despite the history between you. People are talking.`;
                G.dramaQueue.push({ id: 'shift_' + uid(), title: 'Unexpected Respect', effect: 'none', desc: narrativeNote, valence: 'neutral' });
            }

            const repStr = repDelta >= 0 ? `+${repDelta} rep` : `${repDelta} rep`;
            const fanStr = `+${fmtFans(fanDelta)} fans`;
            G.log.push(`[S${G.season} W${G.week}] 💬 You ${type === 'incident' ? 'called out' : 'gave props to'} ${name}. ${repStr}, ${fanStr}.`);

            openModal(h('div', null,
                h('div', { className: 'modal-eyebrow' }, type === 'incident' ? `You called out ${name}` : `You gave props to ${name}`),
                h('div', { className: 'modal-title' }, type === 'incident' ? 'Word is out.' : 'Respect shown.'),
                h('div', { style: { background: '#060A10', borderRadius: '8px', padding: '14px', marginBottom: '16px', fontSize: '14px', color: '#CBD5E1', lineHeight: '1.6', fontStyle: 'italic' } }, `"${line}"`),
                narrativeNote ? h('div', { style: { fontSize: '13px', color: '#F59E0B', marginBottom: '12px', fontStyle: 'italic' } }, `⚡ ${narrativeNote}`) : null,
                h('div', { style: { display: 'flex', gap: '16px', marginBottom: '16px' } },
                    h('div', { style: { fontSize: '14px', fontWeight: 700, color: repDelta >= 0 ? '#10B981' : '#EF4444' } }, repStr),
                    h('div', { style: { fontSize: '14px', fontWeight: 700, color: '#EC4899' } }, fanStr),
                ),
                h('div', { className: 'modal-actions' },
                    mkBtn('Done', 'btn btn-primary', () => { saveGame(); render(); closeModal(); }),
                ),
            ));
        }

        // lap time parsing
        function intervalToSeconds(str) {
            // Parses an interval string to seconds from the leader.
            // "---" or "—" = leader (0). "-0:01.234" or "-1.234" = seconds behind leader.
            if (!str || str === '---' || str === '—' || str === '--') return 0;
            // M:SS.mmm with optional leading minus
            const mMatch = str.match(/^-?(\d+):(\d+\.\d+)$/);
            if (mMatch) return parseInt(mMatch[1]) * 60 + parseFloat(mMatch[2]);
            // Plain seconds with optional leading minus e.g. "-1.234" or "-0.453"
            const sMatch = str.match(/^-?(\d+\.\d+)$/);
            if (sMatch) return parseFloat(sMatch[1]);
            return null;
        }

        function detectCloseFinishes(finishOrder) {
            // Primary method: compare cumulative intervals from the leader.
            // The interval for the leader is 0. Every other driver's interval is how far
            // behind the leader they finished. Two drivers are "close" if their intervals
            // are within 0.05s of each other — this is the actual finish proximity.
            //
            // Fallback: if no intervals are present, try best lap times as a last resort,
            // but note this is an approximation — best lap is not finish proximity.
            const close = [];
            const playerIdx = finishOrder.findIndex(e => e.isPlayer);
            if (playerIdx < 0) return close;

            const playerEntry = finishOrder[playerIdx];

            // Check whether any intervals are present
            const hasIntervals = finishOrder.some(e =>
                e.gap && (e.gap === '---' || e.gap === '—' || intervalToSeconds(e.gap) !== null)
            );

            if (hasIntervals) {
                // Primary path — interval comparison
                const playerInterval = intervalToSeconds(playerEntry.gap);
                if (playerInterval === null) return close;

                finishOrder.forEach(entry => {
                    if (entry.isPlayer || !entry.name || !entry.gap) return;
                    const eInterval = intervalToSeconds(entry.gap);
                    if (eInterval !== null && Math.abs(eInterval - playerInterval) <= 0.05) {
                        close.push({
                            name: entry.name,
                            gap: Math.abs(eInterval - playerInterval).toFixed(3),
                            fromInterval: true,
                        });
                    }
                });
            } else {
                // Fallback — best lap time comparison (approximation only)
                const pSec = lapTimeToSeconds(playerEntry.lapTime);
                if (pSec === null) return close;
                finishOrder.forEach(entry => {
                    if (entry.isPlayer || !entry.name || !entry.lapTime) return;
                    const eSec = lapTimeToSeconds(entry.lapTime);
                    if (eSec !== null && Math.abs(pSec - eSec) <= 0.05) {
                        close.push({
                            name: entry.name,
                            gap: Math.abs(pSec - eSec).toFixed(3),
                            fromTime: true,
                        });
                    }
                });
            }
            return close;
        }

        function lapTimeToSeconds(str) {
            if (!str) return null;
            const m = str.match(/(\d+):(\d+\.\d+)/);
            if (m) return parseInt(m[1]) * 60 + parseFloat(m[2]);
            const s = str.match(/^(\d+\.\d+)$/);
            if (s) return parseFloat(s[1]);
            return null;
        }

        // merch revenue
        function calcMerchRevenue(fans) {
            if (!fans) return 0;
            if (fans < 1000) return Math.floor(fans * 0.5);
            if (fans < 10000) return Math.floor(500 + (fans - 1000) * 0.3);
            if (fans < 100000) return Math.floor(3200 + (fans - 10000) * 0.15);
            return Math.floor(16700 + (fans - 100000) * 0.08);
        }

        // prize money
        function calcPrize(seriesId, pos, fs) {
            const s = getSeries(seriesId);
            // Pool = entry fees from the whole field, supplemented by promoter/purse money
            // s.pay represents the promoter's base purse per car equivalent
            const pool = s.fee * Math.max(fs, 10) + s.pay * Math.max(fs, 10) * 0.5;
            if (pos === 1) return Math.floor(pool * 0.18 + s.winBonus);
            // Descending share: P2=12%, P3=9%, tapering to ~1% at last place
            // Each position gets a diminishing share of the pool
            const topShare   = 0.18;  // P1 already paid above
            const remaining  = 1.0 - topShare;
            const decay      = Math.pow(remaining, 1 / Math.max(fs - 1, 1));
            // Simple geometric-ish taper: pct drops by ~(0.60 / field) per position
            const pct = Math.max(0.008, 0.12 - ((pos - 2) / (Math.max(fs - 2, 1))) * 0.11);
            return Math.floor(pool * pct);
        }

        // ai rivalry seeding
        function seedAIRivalries(drivers) {
            drivers.forEach(d => { d.aiRivals = []; d.aiFriends = []; });
            const seriesGroups = {};
            drivers.forEach(d => {
                if (!seriesGroups[d.currentSeriesId]) seriesGroups[d.currentSeriesId] = [];
                seriesGroups[d.currentSeriesId].push(d);
            });
            Object.values(seriesGroups).forEach(field => {
                if (field.length < 4) return;
                const shuffled = shuffle(field);
                const rivalCount = rand(2, Math.min(4, Math.floor(field.length / 4)));
                for (let i = 0; i < rivalCount; i++) {
                    const a = shuffled[i * 2];
                    const b = shuffled[i * 2 + 1];
                    if (!a || !b) break;
                    if (!a.aiRivals.includes(b.name)) a.aiRivals.push(b.name);
                    if (!b.aiRivals.includes(a.name)) b.aiRivals.push(a.name);
                }
                const friendStart = rivalCount * 2;
                const friendCount = rand(2, Math.min(3, Math.floor((field.length - friendStart) / 2)));
                for (let i = 0; i < friendCount; i++) {
                    const a = shuffled[friendStart + i * 2];
                    const b = shuffled[friendStart + i * 2 + 1];
                    if (!a || !b) break;
                    if (!a.aiFriends.includes(b.name)) a.aiFriends.push(b.name);
                    if (!b.aiFriends.includes(a.name)) b.aiFriends.push(a.name);
                }
            });
        }

        // pre-race commentary
        function buildPreRaceNote(seriesId, raceIdx) {
            const sched = G.schedules[seriesId] || [];
            const race = sched[raceIdx];
            if (!race) return null;
            const notes = [];
            const repTier = getRepTier(G.reputation);
            const tierLabel = repTier.label;

            // Recent form
            const last5 = G.raceHistory.slice(-5).filter(r => !r.dq);
            if (last5.length >= 3) {
                const wins = last5.filter(r => r.pos === 1 && !r.dnf).length;
                const dnfs = last5.filter(r => r.dnf).length;
                const avgPos = last5.filter(r => !r.dnf).reduce((a, r, _, arr) => a + (r.pos / arr.length), 0);
                if (wins >= 2) {
                    if (G.reputation >= 130)
                        notes.push(`${wins} wins in the last ${last5.length}. A ${tierLabel} on a run is a dangerous thing.`);
                    else
                        notes.push(`${wins} wins in the last ${last5.length} races. Momentum is real right now.`);
                }
                else if (dnfs >= 2) notes.push(`Two DNFs in the last stretch. Car needs to finish today.`);
                else if (avgPos <= 4) {
                    if (G.reputation >= 200)
                        notes.push(`Averaging P${avgPos.toFixed(1)} lately. This is what ${tierLabel} form looks like.`);
                    else
                        notes.push(`Averaging P${avgPos.toFixed(1)} over the last few races. Quietly on a run.`);
                }
                else if (avgPos > 12) {
                    if (G.reputation >= 130)
                        notes.push(`Results have been off lately. The paddock is starting to ask questions about a ${tierLabel}.`);
                    else
                        notes.push(`Results have been tough lately. Something needs to change today.`);
                }
            }

            // Track history
            const trackHistory = G.raceHistory.filter(r => r.track === race.track && !r.dq);
            if (trackHistory.length >= 2) {
                const wins = trackHistory.filter(r => r.pos === 1 && !r.dnf).length;
                const dnfRate = trackHistory.filter(r => r.dnf).length / trackHistory.length;
                const avgPos = trackHistory.filter(r => !r.dnf).reduce((a, r, _, arr) => a + (r.pos / arr.length), 0);
                if (wins >= 2) notes.push(`${race.track} has been a happy hunting ground. ${wins} wins here.`);
                else if (dnfRate >= 0.5) notes.push(`This track has been a nightmare. DNF in ${Math.round(dnfRate * 100)}% of visits.`);
                else if (avgPos <= 4) notes.push(`Historically strong at ${race.track}. Top-four average over ${trackHistory.length} visits.`);
                else if (avgPos > 12) notes.push(`${race.track} hasn't been kind. Looking to change that today.`);
            } else if (trackHistory.length === 0) {
                notes.push(`First time at ${race.track}. No data. Just go find out.`);
            }

            // Rivals
            const knownRivals = (G.rivals || []).filter(r => ['rival', 'frenemy'].includes(relationship(r)));
            const knownFriends = (G.rivals || []).filter(r => ['friend', 'racing_rival'].includes(relationship(r)));
            // Check which rivals are cross-series guests vs regulars
            var _wfNote = null;
            try { _wfNote = getWeeklyField(seriesId, raceIdx); } catch(e) {}
            var _noteStarters = _wfNote ? _wfNote.starters : [];
            function _isGuest(name) {
                var d = _noteStarters.find(function(s) { return s.name && s.name.toLowerCase() === name.toLowerCase(); });
                return d && d.currentSeriesId && d.currentSeriesId !== seriesId;
            }
            function _guestSeries(name) {
                var d = _noteStarters.find(function(s) { return s.name && s.name.toLowerCase() === name.toLowerCase(); });
                return d && d.currentSeriesId ? ((getSeries(d.currentSeriesId) && getSeries(d.currentSeriesId).short) || d.currentSeriesId) : null;
            }
            if (knownRivals.length === 1) {
                var _r0 = knownRivals[0];
                var _gs0 = _isGuest(_r0.name) ? _guestSeries(_r0.name) : null;
                if (_gs0)
                    notes.push(`${_r0.name} is here this week from ${_gs0}. Keep your head on a swivel.`);
                else if (G.reputation >= 130)
                    notes.push(`${_r0.name} is out there. People expect fireworks when a ${tierLabel} and a rival share a track.`);
                else
                    notes.push(`${_r0.name} is in this series. Keep your head on a swivel.`);
            } else if (knownRivals.length >= 2) {
                var _gs1 = _isGuest(knownRivals[0].name) ? _guestSeries(knownRivals[0].name) : null;
                var _gs2 = _isGuest(knownRivals[1].name) ? _guestSeries(knownRivals[1].name) : null;
                if (_gs1 || _gs2) {
                    var _guestNames = knownRivals.slice(0, 2).map(function(r) {
                        var gs = _isGuest(r.name) ? _guestSeries(r.name) : null;
                        return r.name + (gs ? ' (' + gs + ')' : '');
                    });
                    notes.push(_guestNames.join(' and ') + ' are both out there this week. Could be a long day.');
                } else {
                    notes.push(`${knownRivals[0].name} and ${knownRivals[1].name} are both out there. Could be a long day.`);
                }
            }
            if (knownFriends.length >= 1 && Math.random() < 0.5) {
                notes.push(`${knownFriends[0].name} has been one of the cleaner racers out here. Good person to be near.`);
            }

            // Championship
            const myPts = G.championshipPoints[seriesId] || 0;
            const field = G.seriesFields[seriesId] || {};
            const allPts = [{ pts: myPts, isPlayer: true }, ...Object.entries(field).map(([n, d]) => ({ pts: d.points, name: n }))].sort((a, b) => b.pts - a.pts);
            const myPos = allPts.findIndex(r => r.isPlayer) + 1;
            const racesLeft = sched.filter(r => !r.result).length;
            if (myPos === 1 && allPts.length > 1 && racesLeft <= 4) {
                const gap = myPts - ((allPts[1] && allPts[1].pts) || 0);
                if (G.reputation >= 130)
                    notes.push(`Championship leader by ${gap} with ${racesLeft} to go. A ${tierLabel} doesn't blow leads like this.`);
                else
                    notes.push(`Championship leader by ${gap} points with ${racesLeft} to go. Protect it.`);
            } else if (myPos > 1 && racesLeft <= 4 && allPts.length > 1) {
                const gap = ((allPts[0] && allPts[0].pts) || 0) - myPts;
                if (G.reputation >= 130)
                    notes.push(`${gap} back with ${racesLeft} left. A ${tierLabel} doesn't go down without a fight.`);
                else
                    notes.push(`${gap} points back with ${racesLeft} races left. Need a strong run.`);
            }
            // Confidence/streak mention
            if (G.confidence >= 2 && Math.random() < 0.6) {
                notes.push(`You're on a run right now. The car feels right and the results are following. Don't change anything.`);
            } else if (G.confidence <= -2 && Math.random() < 0.6) {
                notes.push(`Results have been rough lately. Something needs to click today or the questions are going to get louder.`);
            }

            // Rep tier flavor — fires occasionally when nothing else fills the note
            if (!notes.length || Math.random() < 0.20) {
                if (G.reputation >= 280)
                    notes.push(`The Legend walks into another race weekend. The paddock watches differently now.`);
                else if (G.reputation >= 200)
                    notes.push(`${G.driverName} is a Household Name now. Every result gets analyzed. Every move gets noticed.`);
                else if (G.reputation >= 130)
                    notes.push(`National Contender status means the pre-race chatter includes your name. Own it.`);
                else if (G.reputation >= 70)
                    notes.push(`Regional Threat. People in this paddock know the name. Time to make sure they remember it.`);
                                else if (G.reputation >= 30 && race.state && G.homeState && isSameRegion(race.state, G.homeState))
                    notes.push(`Local Hero walking into their home territory. The crowd has expectations.`);
   }
            // Track record mention
            var _trKeyRead = (seriesId || '') + '::' + race.track;
            if (G.trackRecords && (G.trackRecords[_trKeyRead] || G.trackRecords[race.track])) {
                const rec = G.trackRecords[_trKeyRead] || G.trackRecords[race.track];
                if (rec.overall) {
                    const isYours = rec.overall.driver === G.driverName;
                    if (isYours) {
                        notes.push(`You hold the track record at ${race.track} with a ${rec.overall.time}. Something to protect.`);
                    } else {
                        notes.push(`Track record at ${race.track} is a ${rec.overall.time} set by ${rec.overall.driver}. Something to chase.`);
                    }
                } else if (rec.personal) {
                    notes.push(`Your personal best here is ${rec.personal.time}. See if you can better it.`);
                }
            }

            // Premier event mention — always fires for premier races
            if (race.isPremier) {
                const premierNotes = [
                    `This is the ${race.premierName}. Bigger field, double points, more eyes on the result. Everything that happens today matters more than usual.`,
                    `${race.premierName} weekend. The expanded field means faster cars and drivers who don't normally show up at this level. Treat it differently.`,
                    `This isn't a normal race weekend. The ${race.premierName} brings out drivers you won't see again all season. Be ready for that.`,
                    `The ${race.premierName} is the race people remember at the end of the season. Win here and it follows you into the offseason conversations.`,
                    `Double points on the line today at the ${race.premierName}. The standings are going to move more after this race than any other this season.`,
                ];
                return premierNotes[rand(0, premierNotes.length - 1)];
            }

            // Attendance flavor — occasionally note the expected field size
            if (!race.isPremier && Math.random() < 0.30) {
                const wf = getWeeklyField(seriesId, raceIdx);
                const baseField = SERIES_FIELD_SIZE[seriesId] || 20;
                const diff = wf.expectedCount - baseField;
                if (diff <= -4) {
                    const lightNotes = [
                        `Light entry list this week — maybe ${wf.expectedCount} starters. The regulars are here; the occasionals aren't.`,
                        `Only about ${wf.expectedCount} cars on the entry sheet. Short field, tighter points spread.`,
                        `${wf.expectedCount} cars expected. Happens this time of year — some guys just don't make every race.`,
                    ];
                    notes.push(lightNotes[rand(0, lightNotes.length - 1)]);
                } else if (diff >= 4) {
                    const bigNotes = [
                        `Big entry list this week — ${wf.expectedCount} cars. Passing will be at a premium.`,
                        `${wf.expectedCount} starters expected. Track position is going to matter a lot today.`,
                        `Full field and then some. ${wf.expectedCount} cars fighting for the same piece of asphalt.`,
                    ];
                    notes.push(bigNotes[rand(0, bigNotes.length - 1)]);
                }
            }

            if (!notes.length) return null;
            return notes[rand(0, notes.length - 1)];
        }

        // weekly field helper
        // Returns { starters: [...driverObjs], absent: [...driverObjs], expectedCount: n }
        // Uses each driver's attendanceRate to determine if they show up this week.
        // raceIdx is used as a seed offset so results are stable per race (same week = same field).
        function getWeeklyField(seriesId, raceIdx) {
            // Get drivers absent this specific race from the schedule entry
            const schedEntry = (G.schedules && G.schedules[seriesId] && G.schedules[seriesId][raceIdx]) || null;
            const absentThisRace = new Set((schedEntry && schedEntry.absentDrivers) || []);
            // Include part-time drivers scheduled for this series this season
            // Also inject live same-season guests — drivers from adjacent tiers
            // who show up for individual races without changing their home series
            var s = getSeries(seriesId);
            var sTier = s ? s.tier : 1;
            var partTimers = (G.drivers || []).filter(function(d) {
                if (!d.active || d.currentSeriesId === seriesId) return false;
                if (absentThisRace.has(d.name)) return false;
                // Season-end scheduled appearances
                var apps = (d._partTimeAppearances || []).find(function(a) {
                    return a.seriesId === seriesId && a.season === G.season;
                });
                if (apps) {
                    var raceSlot = (G.season * 1000 + raceIdx) % (apps.races + 1);
                    return raceSlot < apps.races;
                }
                // Live guest injection — adjacent tier drivers only
                var dTier = (getSeries(d.currentSeriesId) && getSeries(d.currentSeriesId).tier) || 1;
                if (dTier >= sTier) return false; // guests only come from LOWER tiers (stepping up)
                if (sTier - dTier > 1) return false; // only one tier below
                // Deterministic per race so the guest list is stable — same guest every time you open the modal
                var _nameHash = d.name ? d.name.split('').reduce(function(h, c, i) { return h + c.charCodeAt(0) * (i + 1) * 31; }, 0) : 0;
                var guestRoll = (Math.sin(G.season * 7919 + raceIdx * 1013 + _nameHash * 0.001) + 1) / 2;
                // ~2 guests per race on average — scale by field size
                // Known rivals/friends always get priority — they show up if the roll passes a higher threshold
                var isKnownRival = (G.rivals || []).some(function(rv) {
                    return rv.name && d.name && rv.name.toLowerCase() === d.name.toLowerCase() &&
                        ['rival','frenemy','racing_rival','friend'].includes(relationship(rv));
                });
                // Base: ~2 random guests per race. Known rivals get a modest bump but still capped.
                var adjacentCount = Math.max((G.drivers || []).filter(function(x) {
                    return x.active && Math.abs(((getSeries(x.currentSeriesId) && getSeries(x.currentSeriesId).tier) || 1) - sTier) <= 1 && x.currentSeriesId !== seriesId;
                }).length, 1);
                var guestThresh = isKnownRival ? (4 / adjacentCount) : (2 / adjacentCount);
                return guestRoll < guestThresh;
            });
            var allDrivers = (G.drivers || []).filter(function(d) {
                return d.active && d.currentSeriesId === seriesId && !absentThisRace.has(d.name);
            }).concat(partTimers);
            const seed = (G.season * 1000) + raceIdx; // deterministic per race
            const starters = [], absent = [];
            allDrivers.forEach(function(d, i) {
                // Substitute drivers always show — they're there specifically to race
                // Injured drivers never show — they're out
                if (d.substituteFor) { starters.push(d); return; }
                if (d.injuredOrPenalized) { absent.push(d); return; }
                const rate = (d.attendanceRate !== undefined) ? d.attendanceRate : 0.85;
                const roll = ((Math.sin(seed + i * 127.1) + 1) / 2);
                if (roll < rate) starters.push(d);
                else absent.push(d);
            });
            // Always maintain a minimum field (occasional drivers fill gaps)
            const minField = Math.floor((SERIES_FIELD_SIZE[seriesId] || 20) * 0.75);
            if (starters.length < minField) {
                const needed = minField - starters.length;
                absent.splice(0, needed).forEach(function(d) { starters.push(d); });
            }
            // Separate out cross-series guests from home-series starters for display
            var guests = starters.filter(function(d) { return d.currentSeriesId !== seriesId; });
            var homeStarters = starters.filter(function(d) { return d.currentSeriesId === seriesId; });
            return { starters: starters, absent: absent, expectedCount: starters.length, guests: guests, homeStarters: homeStarters };
        }