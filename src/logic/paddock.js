// roster
      function getLuminance(hex) {
            hex = hex.replace('#', '');
            if (hex.length === 3) hex = hex.split('').map(function(c) { return c + c; }).join('');
            var r = parseInt(hex.substr(0,2),16)/255;
            var g = parseInt(hex.substr(2,2),16)/255;
            var b = parseInt(hex.substr(4,2),16)/255;
            return 0.2126*r + 0.7152*g + 0.0722*b;
        }

        function exportIRacingRoster(seriesId, extraDrivers, starterFilter) {
            var s = getSeries(seriesId);
            var baseDrivers;
            if (starterFilter && starterFilter.length) {
                // starters only
                var starterNames = new Set(starterFilter.map(function(e) { return e.name.toLowerCase(); }));
                baseDrivers = (G.drivers || []).filter(function(d) {
                    return d.active && starterNames.has(d.name.toLowerCase());
                }).sort(function(a, b) {
                    var rA = a.attendanceRate !== undefined ? a.attendanceRate : 0.85;
                    var rB = b.attendanceRate !== undefined ? b.attendanceRate : 0.85;
                    return rB - rA;
                });
            } else {
                baseDrivers = (G.drivers || []).filter(function(d) {
                    return d.active && d.currentSeriesId === seriesId;
                }).sort(function(a, b) {
                    var rA = a.attendanceRate !== undefined ? a.attendanceRate : 0.85;
                    var rB = b.attendanceRate !== undefined ? b.attendanceRate : 0.85;
                    return rB - rA;
                });
            }
            // add owned team drivers if theyre not already in there
            if (G.ownedTeam && G.ownedTeam.seriesId === seriesId && G.ownedTeam.drivers) {
                G.ownedTeam.drivers.forEach(function(td) {
                    if (!td || !td.name || td.name === 'Open Seat') return;
                    var alreadyIn = baseDrivers.some(function(d) { return d.name.toLowerCase() === td.name.toLowerCase(); });
                    if (!alreadyIn) {
                        baseDrivers.push({ name: td.name, skill: td.skill || 60, active: true, currentSeriesId: seriesId, attendanceRate: 0.95, source: 'team' });
                    }
                });
            }
            // side series driver pool might not exist yet, seed it now
            if (!baseDrivers.length) {
                var _ss = getSeries(seriesId);
                if (_ss && _ss.isSideStep && typeof seedSideSeriesDrivers !== 'undefined') {
                    seedSideSeriesDrivers(seriesId);
                    baseDrivers = (G.drivers || []).filter(function(d) {
                        return d.active && d.currentSeriesId === seriesId;
                    });
                }
            }
            if (!baseDrivers.length && !(extraDrivers && extraDrivers.length)) {
                alert('No drivers found for this series.'); return;
            }

            // confirmed sponsor ids - verified against actual iracing roster files
            var SPONSOR_IDS = [
                1,2,3,6,7,72,73,103,108,111,130,146,147,150,158,172,
                196,197,225,236,245,247,249,253,267,268,269,270,271,275,
                277,278,279,280,298,307,325,326,327,331,332,334,335,336,
                337,345,346,361,362,363,368,369,372,376,377,388,390,392,
                398,401,404,406,407,409,410,413,414,415,416,417,418,419,
                422,425,426,427,428,429,433,
            ];

            var CAR_PATHS = {
                legends:          { path: 'legends\\ford34c',     id: 5   },
                sk_modified:      { path: 'streetstock',          id: 36  },
                mini_stock:       { path: 'ministock',            id: 191 },
                street_stock:     { path: 'streetstock',          id: 36  },
                super_late_model: { path: 'superlatemodel',       id: 54  },
                late_model_stock: { path: 'latemodel2023',        id: 164 },
                arca_menards:     { path: 'arca',                 id: 157 },
                nascar_trucks:    { path: 'trucks\\ram2026',      id: 211 },
                nascar_xfinity:   { path: 'nascarxfinityseries',  id: 117 },
                nascar_cup:       { path: 'nascarnextgencup',     id: 189 },
            };
            // pick car per driver - handles ownership, variant pref, and fallback
            var car = (typeof pickSeriesCar !== 'undefined')
                ? pickSeriesCar(seriesId)
                : (CAR_PATHS[seriesId] || CAR_PATHS.mini_stock);
            var _carPool = [car]; // legacy ref

            // palettes [primary, secondary, tertiary]
            // dark bg = light numbers, light bg = dark numbers
            var PALETTES = [
                ['ED1C24','FFFFFF','000000'],['0A3D91','FFFFFF','C8AA37'],
                ['006940','FFFFFF','FFD700'],['FF6B00','000000','FFFFFF'],
                ['8B0000','FFFFFF','C0C0C0'],['005A9C','FFD700','FFFFFF'],
                ['2D6A2D','FFFFFF','FFD700'],['1A1A2E','E94560','FFFFFF'],
                ['00334E','00B4D8','FFFFFF'],['3D0000','FF4444','FFFFFF'],
                ['2B2D42','EF233C','FFFFFF'],['155263','FF6F3C','FFFFFF'],
                ['1B4332','95D5B2','FFFFFF'],['6A0572','FF9EF7','FFFFFF'],
                ['2D6A4F','52B788','FFFFFF'],['7B2D8B','F1A7DC','FFFFFF'],
                ['3C1518','A44200','FFFFFF'],['0F3460','533483','E94560'],
                ['16213E','0F3460','E94560'],['2C3E50','E74C3C','FFFFFF'],
                ['1D3557','457B9D','A8DADC']
                // light backgrounds removed — iRacing renders them as white
            ];

            // car designs 0-25 confirmed valid
            var CAR_DESIGNS_BY_SERIES = {
    mini_stock:       [0,1,2,3,4,5,7,8,11,12,13,15,17,19,20,21,22,23],
    street_stock:     [1,2,3,4,5,7,8,9,10,11,15,16,17,19,21,23],
    super_late_model: [1,2,3,4,5,6,7,8,9,12,14,15,16,17,18,19,20,21,22,23],
    late_model_stock: [0,1,2,3,4,5,6,7,8,10,11,13,14,15,16,17,18,19,20,21,22,23,24,25],
    arca_menards:     [0,1,2,3,4,5,6,8,9,11,13,15,16,17,18,20,21,23],
    nascar_trucks:    [0,1,2,3,4,5,8,9,10,11,12,13,14,15,16,17,18,20,21,22,25],
    nascar_xfinity:   [2,4,5,6,7,8,9,11,13,15,16,17,18,19,21,22,23,25],
    nascar_cup:       [1,2,4,5,6,8,11,12,13,15,16,17,20,21,22,23],
    legends:          [0,1,2,3,4,5,6,7,8,9,10,11,15,16,17,19,20,22,23],
    sk_modified:      [1,2,3,4,5,6,7,8,9,10,11,12,13,15,16,19,20,21,23,24],
};
var CAR_DESIGNS = CAR_DESIGNS_BY_SERIES[seriesId] || CAR_DESIGNS_BY_SERIES.mini_stock;
            // suit designs 1-36
            var SUIT_DESIGNS  = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36];
            // helmets 0-68
            var HELMET_DESIGNS = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68];

            // light text on dark bg, dark text on light bg
            var NUMBER_DESIGNS_ON_DARK = [
                '1,2,ED1C24,FFFFFF,233D85',
                '9,2,FFFFFF,EBEDF0,16315C',
                '12,2,ffffff,ed1c24,0a0a0a',
                '15,2,ffffff,0a0a0a,2e358f',
                '24,2,FFFFFF,D22030,231F20',
                '26,2,ffffff,231f20,000000',
                '34,1,FFFFFF,0063A8,E22726',
                '41,1,FFE900,20201E,20201E',
                '42,1,BB2739,040707,FECD08',
                '48,2,FDFF00,000000,FFFFFF',
                '48,2,F13033,FFE900,20201E',
                '55,4,ffffff,0a0a0a,0a0a0a',
                '9,2,FFF200,222222,000000',
                '7,3,FFFFFF,E72729,000000',
                '40,3,FFFFFF,FAFF00,000000',
                '3,1,000000,FFFFFF,000000',
                '11,2,FFD65A,00050B,FFFFFF',
                '46,2,E5242C,F5A327,0A0A0A',
            ];
            var NUMBER_DESIGNS_ON_LIGHT = [
                '1,1,231f20,ffffff,ffffff',
                '3,4,2e358f,0a0a0a,ffffff',
                '12,2,231F20,E8262C,FFFFFF',
                '35,1,030000,FFFFFF,ED1C24',
                '4,4,E9EAEB,050708,B31136',
                '42,1,000000,FFFFFF,FFFFFF',
                '44,4,ed1c2e,231f20,231f20',
                '47,4,D02030,FFFFFF,FFFFFF',
                '35,3,FFB200,131110,E70C0E',
                '26,2,cf3438,231f20,ffffff',
            ];

            var rnd = function(arr) { return arr[Math.floor(Math.random() * arr.length)]; };
            var rndSponsor = function(isPrimary) {
                if (isPrimary) return rnd(SPONSOR_IDS); // always assign a primary sponsor
                return Math.random() < 0.65 ? rnd(SPONSOR_IDS) : 0;
            };

            // track used numbers, no duplicates
            var usedNumbers = new Set();
// Reserve the player's car number so AI doesn't get assigned it
if (G.reservedCarNumber) usedNumbers.add(String(G.reservedCarNumber));
var nextNum = 1;
            var getNumber = function(preferred) {
    var n = preferred ? String(preferred) : null;
    // Cap at 99 — numbers above that are invalid in most iRacing series
    if (n && parseInt(n) <= 99 && !usedNumbers.has(n)) { usedNumbers.add(n); return n; }
    while (usedNumbers.has(String(nextNum)) || nextNum > 99) nextNum++;
    if (nextNum > 99) nextNum = 1; // wrap around if somehow exhausted
    var assigned = String(nextNum++);
    usedNumbers.add(assigned);
    return assigned;
};

            // merge base + guests
            var allEntries = baseDrivers.map(function(d) {
                return {
                    name: d.name,
                    stats: d.aiStats || {},
                    carNumber: d.carNumber,
                    isGuest: false,
                };
            });
            if (extraDrivers && extraDrivers.length) {
                extraDrivers.forEach(function(g) {
                    allEntries.push({
                        name: g.name,
                        stats: {
                            relativeSkill: g.skill || rand(58, 82),
                            aggression:    rand(55, 78),
                            optimism:      rand(52, 75),
                            smoothness:    rand(48, 72),
                            pitCrewSkill:  rand(52, 76),
                            pittingRisk:   rand(28, 58),
                            age:           rand(20, 44),
                        },
                        carNumber: null,
                        isGuest: true,
                    });
                });
            }

            var rosterDrivers = allEntries.map(function(entry, i) {
                var pal;
var _attempts = 0;
do {
    pal = rnd(PALETTES);
    var _h = pal[0];
    var _r = parseInt(_h.slice(0,2),16)/255;
    var _g = parseInt(_h.slice(2,4),16)/255;
    var _b = parseInt(_h.slice(4,6),16)/255;
    var _lum = 0.2126*_r + 0.7152*_g + 0.0722*_b;
    _attempts++;
} while ((_lum < 0.05 || _lum > 0.85) && _attempts < 50);
                var lum = getLuminance(pal[0]);
                // < 0.35 dark bg, >= 0.35 light bg
                var numDesign = lum < 0.35
                    ? rnd(NUMBER_DESIGNS_ON_DARK)
                    : rnd(NUMBER_DESIGNS_ON_LIGHT);
                var stats = entry.stats;
                return {
                    driverName:        entry.name,
                    carDesign: (entry.isGuest ? '1' : rnd(CAR_DESIGNS)) + ',' + pal[0] + ',' + pal[1] + ',' + pal[2],
                    carNumber:         getNumber(entry.isGuest ? null : entry.carNumber),
                    suitDesign:        rnd(SUIT_DESIGNS) + ',' + pal[0] + ',' + pal[1] + ',' + pal[2],
                    helmetDesign:      rnd(HELMET_DESIGNS) + ',' + pal[0] + ',' + pal[1] + ',' + pal[2],
                    carPath:           (function() { car = (typeof pickSeriesCar !== 'undefined') ? pickSeriesCar(seriesId) : _carPool[0]; return car.path; })(),
                    carId:             car.id,
                    sponsor1:          rndSponsor(true),
                    sponsor2:          rndSponsor(false),
                    numberDesign:      numDesign,
                    driverSkill:       stats.relativeSkill || 70,
                    driverAggression:  stats.aggression    || 70,
                    driverOptimism:    stats.optimism      || 70,
                    driverSmoothness:  stats.smoothness    || 50,
                    pitCrewSkill:      stats.pitCrewSkill  || 55,
                    strategyRiskiness: stats.pittingRisk   || 45,
                    driverAge:         stats.age           || 30,
                    id: (function() { var h=''; for(var i=0;i<32;i++) h+=Math.floor(Math.random()*16).toString(16); return h.slice(0,8)+'-'+h.slice(8,12)+'-4'+h.slice(13,16)+'-'+(Math.floor(Math.random()*4)+8).toString(16)+h.slice(17,20)+'-'+h.slice(20,32); })(),
                    rowIndex:   i,
                };
            });

            var label = 'roster';
            var json = JSON.stringify({ drivers: rosterDrivers }, null, '\t');
            var blob = new Blob([json], { type: 'application/json' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = label + '.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            addLog(G,
                '\uD83D\uDCE4 Exported iRacing ' + label + ' for ' +
                (s ? s.name : seriesId) + ' \u2014 ' +
                rosterDrivers.length + ' drivers' +
                (extraDrivers && extraDrivers.length ? ' (' + extraDrivers.length + ' guests)' : '') +
                '.'
            );
        }

        function renderRoster() {
            const f = document.createDocumentFragment();
            f.appendChild(h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '4px' } },
                h('div', { className: 'page-title', style: { margin: 0 } }, 'Race Roster'),
                h('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
                    ...(G.contracts || []).filter(function(c) { var cs = getSeries(c.seriesId); return cs && !cs.isSideStep; }).map(function(c) {
                        const s = getSeries(c.seriesId);
                        return mkBtn(
                            '📤 Export ' + (s ? s.short : c.seriesId) + ' → iRacing',
                            'btn btn-sm btn-secondary',
                            function() { exportIRacingRoster(c.seriesId); }
                        );
                    })
                ),
            ));
            f.appendChild(h('div', { style: { fontSize: '12px', color: '#475569', marginBottom: '16px', lineHeight: '1.6' } },
                '💾 Exports as ',
                h('span', { style: { color: '#94A3B8', fontFamily: 'monospace' } }, 'roster.json'),
                ' — save to ',
                h('span', { style: { color: '#94A3B8', fontFamily: 'monospace' } }, 'Documents\\iRacing\\airosters\\[Roster Name]\\roster.json'),
                ' then reload iRacing.'
            ));

            if (!G.contracts.length) {
                f.appendChild(h('div', { className: 'page-sub' }, 'Current drivers assigned to each series. Set these in iRacing before racing.'));
                f.appendChild(h('div', { className: 'card', style: { textAlign: 'center', padding: '24px', color: '#94A3B8' } }, 'No active contracts. Sign one to see your roster.'));
                return f;
            }

            // Check if any upcoming race this week is a premier event
            const upcomingPremier = (function () {
                for (var ci = 0; ci < G.contracts.length; ci++) {
                    var contract = G.contracts[ci];
                    var sched = G.schedules[contract.seriesId] || [];
                    var nextIdx = sched.findIndex(function (r) { return !r.result; });
                    if (nextIdx >= 0 && sched[nextIdx].isPremier) {
                        return { race: sched[nextIdx], contract: contract, series: getSeries(contract.seriesId) };
                    }
                }
                return null;
            })();

            // Sub-tabs — only show if a premier is coming up
            if (upcomingPremier) {
                const subTabRow = h('div', { style: { display: 'flex', gap: '4px', marginBottom: '20px', borderBottom: '2px solid #1E2433', paddingBottom: '0' } });
                [
                    { id: 'regular', label: 'Regular Roster' },
                    { id: 'premier', label: '⭐ ' + upcomingPremier.race.premierName },
                ].forEach(function (st) {
                    const isActive = rosterView === st.id;
                    const btn = h('button', {
                        style: {
                            background: 'transparent',
                            border: 'none',
                            borderBottom: isActive ? '3px solid #F59E0B' : '3px solid transparent',
                            color: isActive ? '#F59E0B' : '#94A3B8',
                            padding: '8px 18px',
                            fontSize: '13px',
                            fontWeight: 700,
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                            cursor: 'pointer',
                            marginBottom: '-2px',
                        },
                        onClick: function () { rosterView = st.id; render(); },
                    }, st.label);
                    subTabRow.appendChild(btn);
                });
                f.appendChild(subTabRow);
            } else {
                // No premier coming — reset to regular view
                rosterView = 'regular';
                f.appendChild(h('div', { className: 'page-sub' }, 'Current drivers assigned to each series. Set these in iRacing before racing. Tap a driver to see their stats and bio.'));
            }

            // premier event view
            if (rosterView === 'premier' && upcomingPremier) {
                const pr = upcomingPremier.race;
                const s = upcomingPremier.series;
                const contract = upcomingPremier.contract;

                // Guest list — generate once, store on race obj so all views match
                if (!pr._premierGuests) {
                    var _rn = new Set((G.drivers || []).filter(function(d) { return d.active && d.currentSeriesId === contract.seriesId; }).map(function(d) { return d.name.toLowerCase(); }));
                    var _gp = (G.drivers || []).filter(function(d) { return d.source === 'known' && d.active && !_rn.has(d.name.toLowerCase()); }).sort(function() { return Math.random() - 0.5; });
                    var _gl = _gp.slice(0, Math.min(14, _gp.length)).map(function(d) { return d.name; });
                    while (_gl.length < 8) { var _gn = generateAIName(); var _gt = 0; while (_gl.includes(_gn) && _gt < 50) { _gn = generateAIName(); _gt++; } _gl.push(_gn); }
                    pr._premierGuests = _gl; saveGame();
                }
                var guestNames = pr._premierGuests;

                const regularDrivers = (G.drivers || []).filter(function (d) {
                    return d.active && d.currentSeriesId === contract.seriesId;
                }).sort(function (a, b) {
                    if (a.source === 'known' && b.source !== 'known') return -1;
                    if (b.source === 'known' && a.source !== 'known') return 1;
                    return (parseInt(a.carNumber) || 999) - (parseInt(b.carNumber) || 999);
                });

                const normalFieldSize = SERIES_FIELD_SIZE[contract.seriesId] || 20;
                const premierFieldSize = Math.min(normalFieldSize + guestNames.length, normalFieldSize + 14);

                // Press release blurb
                const blurbs = [
                    `The ${pr.premierName} at ${pr.track} is the marquee event on the ${s.short} calendar — the one race all season that pulls drivers from outside the normal field. Expect cars you haven't seen all year, higher skill levels throughout the field, and a crowd that knows they're watching something different. The regular season points are doubled. The competition is stiffer. The result will be talked about longer than any other race on the schedule.`,
                    `${pr.track} hosts the ${pr.premierName}, and the entry list reflects what makes this event different. Guest drivers who don't run the full ${s.short} schedule have entered for this race only — some from higher series, some from regional circuits with something to prove. Double points make every position worth fighting for. Set your iRacing AI roster accordingly before you start.`,
                    `Once a season, the ${s.short} opens the gates. The ${pr.premierName} at ${pr.track} is that race — an expanded field, double championship points, and drivers who don't normally share a track with you. The regular roster will be supplemented by guest entries this week. Treat it differently than a normal Saturday night. The paddock does.`,
                    `The ${pr.premierName} is ${pr.premierLaps} laps, double points, and a bigger field than you've seen all season. Guest drivers enter specifically for this event — they won't be on your roster next week, but they're on it now, and some of them are fast. Update your iRacing AI lineup before the race. This is the one they remember at the end-of-season banquet.`,
                    `Not every race on the ${s.short} schedule carries the same weight. The ${pr.premierName} at ${pr.track} carries more. Double points shift the championship picture. Guest entries expand the field and raise the overall competition level. Some of the fastest drivers in the region show up for this one specifically. Your regular-season results got you here. What you do here is a different conversation.`,
                ];
                const blurb = blurbs[Math.floor(Math.random() * blurbs.length)];

                // Press release card
                f.appendChild(h('div', {
                    style: {
                        background: 'linear-gradient(135deg, #0D0A00, #1A1200)',
                        border: '1px solid #F59E0B55',
                        borderRadius: '10px',
                        padding: '20px 22px',
                        marginBottom: '18px',
                    }
                },
                    h('div', { style: { display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '14px' } },
                        h('div', { style: { fontSize: '36px', lineHeight: 1, flexShrink: 0 } }, '⭐'),
                        h('div', null,
                            h('div', { style: { fontSize: '11px', color: '#D97706', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '4px' } }, s.short + ' · Premier Event'),
                            h('div', { style: { fontSize: '22px', fontWeight: 900, color: '#F59E0B', lineHeight: 1.1, marginBottom: '4px' } }, pr.premierName),
                            h('div', { style: { fontSize: '14px', color: '#D97706' } }, pr.track + ' · ' + pr.city + ', ' + pr.state),
                        ),
                    ),
                    h('div', { style: { display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' } },
                        ...[
                            ['Laps', pr.premierLaps, '#F59E0B'],
                            ['Points', '2× this week', '#10B981'],
                            ['Field', premierFieldSize + ' drivers', '#3B82F6'],
                            ['Guests', guestNames.length + ' entries', '#8B5CF6'],
                        ].map(function (item) {
                            return h('div', {
                                style: {
                                    background: '#060A10',
                                    border: '1px solid ' + item[2] + '33',
                                    borderRadius: '7px',
                                    padding: '8px 12px',
                                    minWidth: '90px',
                                }
                            },
                                h('div', { style: { fontSize: '11px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em' } }, item[0]),
                                h('div', { style: { fontSize: '15px', fontWeight: 800, color: item[2], marginTop: '2px' } }, item[1]),
                            );
                        }),
                    ),
                    h('div', { style: { fontSize: '14px', color: '#CBD5E1', lineHeight: '1.75', fontStyle: 'italic', borderLeft: '3px solid #F59E0B44', paddingLeft: '14px' } }, blurb),
                ));

                // Instructions card
                f.appendChild(h('div', { className: 'card', style: { marginBottom: '18px', borderColor: '#F59E0B33' } },
                    h('div', { style: { fontSize: '13px', fontWeight: 700, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '12px' } }, '📋 iRacing Setup — Before You Race'),
                    h('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
                        ...[
                            ['1', 'Add the guest drivers below to your iRacing AI roster for this session.'],
                            ['2', 'Set guest driver skill higher than your regulars — this field is faster than a normal week.'],
                            ['3', 'Run ' + pr.premierLaps + ' laps. Double points apply automatically when you submit.'],
                            ['4', 'After the race, remove guest drivers from your iRacing roster. They don\'t race next week.'],
                        ].map(function (step) {
                            return h('div', { style: { display: 'flex', gap: '10px', alignItems: 'flex-start' } },
                                h('div', {
                                    style: {
                                        width: '22px', height: '22px', borderRadius: '50%',
                                        background: '#F59E0B22', border: '1px solid #F59E0B44',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '11px', fontWeight: 900, color: '#F59E0B', flexShrink: 0,
                                    }
                                }, step[0]),
                                h('div', { style: { fontSize: '14px', color: '#CBD5E1', lineHeight: '1.5', paddingTop: '2px' } }, step[1]),
                            );
                        }),
                    ),
                ));

                // Guest entries
                f.appendChild(h('div', { className: 'card', style: { marginBottom: '18px', borderColor: '#8B5CF633' } },
                    h('div', { style: { fontSize: '13px', fontWeight: 700, color: '#8B5CF6', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '4px' } }, '🏁 Guest Entries — This Race Only'),
                    h('div', { style: { fontSize: '13px', color: '#64748B', marginBottom: '12px' } }, 'Add these to iRacing before the race. Remove them after.'),
                    h('div', { style: { display: 'flex', gap: '6px', flexWrap: 'wrap' } },
                        ...guestNames.map(function (name) {
                            const knownDriver = (G.drivers || []).find(function (d) { return d.name === name && d.source === 'known'; });
                            return h('div', {
                                style: {
                                    background: '#0D0A1A',
                                    border: '1px solid #8B5CF644',
                                    borderRadius: '6px',
                                    padding: '6px 11px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                }
                            },
                                h('span', { style: { fontSize: '13px', fontWeight: 700, color: '#DDD6FE' } }, name),
                                knownDriver ? h('span', { style: { fontSize: '10px', color: '#10B981', fontWeight: 700 } }, '●') : null,
                            );
                        }),
                    ),
                    h('div', { style: { fontSize: '12px', color: '#374151', marginTop: '10px' } }, '● = driver known from your results  |  Others are generated entries'),
                    h('div', { style: { marginTop: '12px', textAlign: 'right' } },
                        mkBtn('📤 Export Premier Week Roster', 'btn btn-sm btn-secondary', function() {
                            var guestEntries = (pr._premierGuests || guestNames).map(function(name) {
                                var kd = (G.drivers || []).find(function(d) { return d.name === name; });
                                var baseSkill = kd && kd.aiStats && kd.aiStats.relativeSkill ? kd.aiStats.relativeSkill : rand(62, 88);
                                return { name: name, skill: baseSkill, aiStats: kd && kd.aiStats ? kd.aiStats : null };
                            });
                            exportIRacingRoster(contract.seriesId, guestEntries);
                        })
                    ),
                ));

                // Regular drivers still running
                f.appendChild(h('div', { className: 'card' },
                    h('div', { style: { fontSize: '13px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '10px' } }, contract.noContractRequired ? 'Regular Field' : 'Regular Field — ' + contract.team),
                    h('div', { style: { display: 'flex', flexDirection: 'column', gap: '4px' } },
                        ...regularDrivers.map(function (d) {
                            const isTm = (G.teammates || []).some(function (t) { return t.name === d.name; });
                            const col = d.source === 'known' ? '#10B981' : '#94A3B8';
                            return h('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0', borderBottom: '1px solid #0D1117' } },
                                d.carNumber ? h('div', { style: { width: '30px', height: '30px', borderRadius: '5px', background: s.color + '18', border: '1px solid ' + s.color + '44', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 900, color: s.color, flexShrink: 0 } }, d.carNumber) : h('div', { style: { width: '30px', height: '30px', borderRadius: '5px', background: '#1E2433', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#64748B', flexShrink: 0 } }, '#?'),
                                h('div', { style: { flex: 1 } },
                                    h('div', { style: { fontSize: '13px', fontWeight: 700, color: '#F9FAFB' } }, d.name,
                                        isTm ? h('span', { style: { fontSize: '10px', color: '#3B82F6', marginLeft: '6px', fontWeight: 700 } }, 'TEAMMATE') : null,
                                    ),
                                    (function() {
                                        const _rs = getSeries(d.currentSeriesId);
                                        if (_rs && _rs.tier <= 2) return null;
                                        return h('div', { style: { fontSize: '12px', color: '#64748B' } }, d.currentTeam || '');
                                    })(),
                                ),
                                h('span', { style: { fontSize: '11px', color: col, fontWeight: 700 } }, d.source === 'known' ? 'KNOWN' : 'GEN'),
                                (function() {
                                    const rate = d.attendanceRate !== undefined ? d.attendanceRate : 0.85;
                                    const pct = Math.round(rate * 100);
                                    const aColor = rate >= 0.88 ? '#10B981' : rate >= 0.70 ? '#F59E0B' : '#EF4444';
                                    const aLabel = rate >= 0.88 ? 'Regular' : rate >= 0.70 ? 'Occasional' : 'Rare';
                                    return h('span', { style: { fontSize: '10px', color: aColor, fontWeight: 700, marginLeft: '4px' } }, aLabel + ' ' + pct + '%');
                                })(),
                            );
                        }),
                    ),
                ));

                return f;
            }

            // regular roster view
            if (!upcomingPremier) {
                f.appendChild(h('div', { className: 'page-sub' }, ''));
            }

            // Side series roster sections
            (G.sideContracts || []).filter(function(sc) { return sc.season === G.season; }).forEach(function(sc) {
                var ss = getSeries(sc.seriesId);
                if (!ss) return;
                var sideDrivers = (G.drivers || []).filter(function(d) { return d.active && d.currentSeriesId === sc.seriesId; }).sort(function(a,b) { return (parseInt(a.carNumber)||999)-(parseInt(b.carNumber)||999); });
                if (!sideDrivers.length) return;
                var sideRKey = 'roster_' + sc.seriesId;
                var sideCollapsed = isCollapsed(sideRKey, false);
                var sec = h('div', { className: 'card', style: { marginBottom: '14px', borderTop: '2px solid ' + ss.color } });
                sec.appendChild(h('div', {
                    style: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: sideCollapsed ? 0 : '12px', cursor: 'pointer' },
                    onClick: function() { toggleCollapse(sideRKey, false); render(); }
                },
                    h('div', { style: { width: '10px', height: '10px', borderRadius: '2px', background: ss.color } }),
                    h('span', { style: { fontSize: '16px', fontWeight: 800, color: ss.color } }, ss.short),
                    h('span', { style: { fontSize: '13px', color: '#5A4E38', marginLeft: '4px' } }, '— Pit Road · ' + sideDrivers.length + ' drivers'),
                    mkBtn('📤 Export → iRacing', 'btn btn-xs btn-secondary', function() { exportIRacingRoster(sc.seriesId); }, false),
                    h('span', { style: { fontSize: '16px', color: '#64748B', marginLeft: 'auto', transform: sideCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)' } }, '▾'),
                ));
                if (!sideCollapsed) {
                    sideDrivers.forEach(function(d) {
                        sec.appendChild(h('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0', borderBottom: '1px solid #1A1410' } },
                            h('div', { style: { width: '36px', height: '36px', borderRadius: '5px', background: ss.color + '14', border: '1px solid ' + ss.color + '44', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800, color: ss.color, flexShrink: 0 } }, d.carNumber || '?'),
                            h('div', { style: { flex: 1 } },
                                h('div', { style: { fontSize: '14px', fontWeight: 700, color: '#F0E8D8' } }, d.name),
                                h('div', { style: { fontSize: '12px', color: '#5A4E38' } }, 'Skill: ' + (d.skill || '?') + ' · Rep: ' + (d.rep || 0) + ' · ' + (d.source === 'known' ? '● known' : '○ gen')),
                            ),
                        ));
                    });
                }
                f.appendChild(sec);
            });

            G.contracts.filter(function(c) { var cs = getSeries(c.seriesId); return cs && !cs.isSideStep; }).forEach(function (contract) {
                const s = getSeries(contract.seriesId);
                if (!s) return;

                const rosterKey = 'roster_' + contract.seriesId;
                const collapsed = isCollapsed(rosterKey, false);
                const drivers = (G.drivers || []).filter(function (d) {
                    return d.active && d.currentSeriesId === contract.seriesId;
                }).sort(function (a, b) {
                    // Known drivers first, then by car number, then by name
                    if (a.source === 'known' && b.source !== 'known') return -1;
                    if (b.source === 'known' && a.source !== 'known') return 1;
                    const aNum = parseInt(a.carNumber) || 999;
                    const bNum = parseInt(b.carNumber) || 999;
                    return aNum - bNum;
                });

                const section = h('div', { className: 'card', style: { marginBottom: '14px' } });

                // Header
                section.appendChild(h('div', {
                    style: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: collapsed ? '0' : '12px', cursor: 'pointer' },
                    onClick: function () { toggleCollapse(rosterKey, false); render(); }
                },
                    h('div', { style: { width: '11px', height: '11px', borderRadius: '2px', background: s.color } }),
                    h('span', { style: { fontSize: '17px', fontWeight: 800, color: '#F9FAFB' } }, s.name),
                    h('span', { style: { color: '#94A3B8', fontSize: '14px' } }, '— ' + contract.team),
                    h('span', { style: { marginLeft: 'auto', fontSize: '14px', color: '#94A3B8' } }, drivers.length + ' drivers'),
                    h('span', { style: { fontSize: '16px', color: '#64748B', transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.2s', marginLeft: '8px' } }, '▾'),
                ));

                if (!collapsed) {
                    const driverGrid = h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' } });
                    section.appendChild(driverGrid);
                    drivers.forEach(function (d) {
                        const isKnown = d.source === 'known';
                        const rival = (G.rivals || []).find(function (r) { return r.name === d.name; });
                        const rel = rival ? relationship(rival) : null;
                        const relColor = rel ? REL_COLOR[rel] : null;
                        const isTm = (G.teammates || []).some(function (t) { return t.name === d.name; });
                        const isInjured = d.injuredOrPenalized;

                        // Bio expand state per driver
                        const bioKey = 'roster_bio_' + d.id;
                        const bioExpanded = isCollapsed(bioKey, true); // default collapsed = true means bio hidden

                        const driverRow = h('div', {
                            style: {
                                background: '#060A10',
                                border: '1px solid #1E2433',
                                borderRadius: '8px',
                                padding: '8px 10px',
                                cursor: 'pointer',
                            }, onClick: function () {
                                toggleCollapse(bioKey, true);
                                render();
                            }
                        });

                        // Top row
                        driverRow.appendChild(h('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' } },
                            // Car number
                            d.carNumber ? h('div', {
                                style: {
                                    width: '36px', height: '36px', borderRadius: '6px',
                                    background: s.color + '18', border: '2px solid ' + s.color,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '14px', fontWeight: 900, color: s.color, flexShrink: 0,
                                }
                            }, d.carNumber) : h('div', {
                                style: {
                                    width: '36px', height: '36px', borderRadius: '6px',
                                    background: '#1E2433', border: '1px dashed #374151',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '11px', color: '#64748B', flexShrink: 0,
                                }
                            }, '#?'),
                            // Name and team
                            h('div', { style: { flex: 1, minWidth: 0 } },
                                h('div', { style: { fontSize: '14px', fontWeight: 800, color: '#F9FAFB', display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' } },
                                    d.name,
                                    isKnown ? h('span', { style: { fontSize: '10px', color: '#10B981', background: '#06513422', border: '1px solid #10B98144', padding: '1px 5px', borderRadius: '3px', fontWeight: 700 } }, 'KNOWN') : null,
                                    isTm ? h('span', { style: { fontSize: '10px', color: '#3B82F6', background: '#1E3A5F22', border: '1px solid #3B82F644', padding: '1px 5px', borderRadius: '3px', fontWeight: 700 } }, 'TEAMMATE') : null,
                                    isInjured ? h('span', { style: { fontSize: '10px', color: '#EF4444', background: '#7F1D1D22', border: '1px solid #EF444444', padding: '1px 5px', borderRadius: '3px', fontWeight: 700 } }, 'INJ') : null,
                                    d.substituteFor ? h('span', { style: { fontSize: '10px', color: '#F97316', background: '#F9730622', border: '1px solid #F9730644', padding: '1px 5px', borderRadius: '3px', fontWeight: 700 } }, 'SUB') : null,
                                    rel && rel !== 'acquaintance' ? h('span', { style: { fontSize: '10px', color: relColor, background: relColor + '22', border: '1px solid ' + relColor + '44', padding: '1px 5px', borderRadius: '3px', fontWeight: 700 } }, REL_LABEL[rel]) : null,
                                ),
                                // Injury/sub line — who is out and who is covering
                                (function() {
                                    if (isInjured) {
                                        const sub = !d._noSub && (G.drivers || []).find(function(x) {
                                            return x.substituteFor && x.substituteFor.toLowerCase() === d.name.toLowerCase() && x.currentSeriesId === d.currentSeriesId;
                                        });
                                        const racesOut = d._injuryRacesOut || '?';
                                        const subStr = d._noSub ? ' · No sub — car sits' : sub ? ' · ' + sub.name + ' covering' : '';
                                        const subColor = d._noSub ? '#64748B' : '#EF4444';
                                        return h('div', { style: { fontSize: '12px', color: subColor, marginTop: '2px', fontWeight: 700 } },
                                            '⛑️ Out ' + racesOut + ' race' + (racesOut !== 1 ? 's' : '') + subStr
                                        );
                                    }
                                    if (d.substituteFor) {
                                        return h('div', { style: { fontSize: '12px', color: '#F97316', marginTop: '2px', fontWeight: 700 } },
                                            '🔄 Subbing for ' + d.substituteFor
                                        );
                                    }
                                    // Player injury — show on the player's series section header
                                    if (G.playerInjury && G.playerInjury.seriesId === contract.seriesId
                                        && G.playerInjury.racesRemaining > 0
                                        && d.name === G.driverName) {
                                        return h('div', { style: { fontSize: '12px', color: '#EF4444', marginTop: '2px', fontWeight: 700 } },
                                            '📋 You\'re out · ' + G.playerInjury.subName + ' covering · ' + (G.playerInjury.racesRemaining || '?') + ' races left'
                                        );
                                    }
                                    return null;
                                })(),
                                (function() {
                                    const _ds = getSeries(d.currentSeriesId);
                                    if (_ds && _ds.tier <= 2) return null;
                                    return h('div', { style: { fontSize: '13px', color: '#64748B', marginTop: '2px' } }, d.currentTeam || 'No team');
                                })(),
                            ),
                            h('span', { style: { fontSize: '14px', color: '#64748B', flexShrink: 0 } }, bioExpanded ? '▴' : '▾'),
                        ));

                        // Expanded bio and stats
                        if (!bioExpanded) {
                            const bio = generateDriverBio(d);
                            const stats = d.aiStats || {};

                            const statItems = [
                                { label: 'Age', value: stats.age || '?', color: '#94A3B8' },
                                { label: 'Skill', value: d.skill || '?', color: '#F59E0B' },
                                { label: 'Rel. Skill', value: stats.relativeSkill || '?', color: '#F59E0B' },
                                { label: 'Aggression', value: stats.aggression || '?', color: '#EF4444' },
                                { label: 'Smoothness', value: stats.smoothness || '?', color: '#10B981' },
                                { label: 'Optimism', value: stats.optimism || '?', color: '#3B82F6' },
                                { label: 'Pit Crew', value: stats.pitCrewSkill || '?', color: '#8B5CF6' },
                                { label: 'Pit Risk', value: stats.pittingRisk || '?', color: '#F97316' },
                                { label: 'Car #', value: d.carNumber || 'Unassigned', color: s.color },
                                { label: 'Starts', value: d.starts || 0, color: '#94A3B8' },
                                { label: 'Wins', value: d.wins || 0, color: '#F59E0B' },
                                { label: 'Home', value: (US_STATE_NAMES && US_STATE_NAMES[d.homeState]) || d.homeState || '?', color: '#94A3B8' },
                            ];

                            driverRow.appendChild(h('div', { style: { marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #1E2433' } },
                                // Bio
                                h('div', {
                                    style: {
                                        fontSize: '13px', color: '#94A3B8', lineHeight: '1.6',
                                        marginBottom: '10px', padding: '8px 10px',
                                        background: '#080C14', borderRadius: '6px',
                                        borderLeft: '2px solid ' + s.color,
                                    }
                                }, bio),
                                // Stats grid
                                h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '6px' } },
                                    ...statItems.map(function (si) {
                                        return h('div', {
                                            style: {
                                                background: '#0B0F1A', borderRadius: '6px',
                                                padding: '6px 8px', border: '1px solid #1E2433',
                                            }
                                        },
                                            h('div', { style: { fontSize: '11px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' } }, si.label),
                                            h('div', { style: { fontSize: '14px', fontWeight: 800, color: si.color, marginTop: '2px' } }, si.value),
                                        );
                                    })
                                ),
                            ));
                        }

                        driverGrid.appendChild(driverRow);
                    });
                }

                f.appendChild(section);
            });

            return f;
        }