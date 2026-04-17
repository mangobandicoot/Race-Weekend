// standings
        var _standTab = _standTab || 'mine';

        function renderStandings() {
            const f = document.createDocumentFragment();
            f.appendChild(h('div', { className: 'page-title' }, 'Championship Standings'));

            // sub-tab row
            const tabDefs = [
                { id: 'mine',   label: '🏁 My Series' },
                { id: 'all',    label: '🌐 All Series' },
                { id: 'ladder', label: '🪜 Ladder' },
            ];
            const tabRow = h('div', { style: { display: 'flex', gap: '4px', marginBottom: '20px', borderBottom: '2px solid #1E2433', paddingBottom: '0' } });
            tabDefs.forEach(function(td) {
                const active = _standTab === td.id;
                tabRow.appendChild(h('button', {
                    style: {
                        background: 'transparent', border: 'none',
                        borderBottom: active ? '2px solid #F59E0B' : '2px solid transparent',
                        color: active ? '#F59E0B' : '#64748B',
                        padding: '8px 16px', fontSize: '13px', fontWeight: 700,
                        letterSpacing: '0.05em', textTransform: 'uppercase',
                        cursor: 'pointer', marginBottom: '-2px',
                    },
                    onClick: function() { _standTab = td.id; render(); }
                }, td.label));
            });
            f.appendChild(tabRow);

            if (_standTab === 'mine') {

            f.appendChild(h('div', { className: 'grid-3', style: { marginBottom: '20px' } },
                ...[['Career Wins', G.wins, '#F59E0B'], ['Top 5s', G.top5s, '#10B981'], ['Starts', G.starts, '#3B82F6'],
                ['Win Rate', G.starts > 0 ? `${Math.round(G.wins / G.starts * 100)}%` : '—', '#8B5CF6'],
                ['Prize Money', fmtMoney(G.totalPrizeMoney), '#10B981'], ['Fans', fmtFans(G.fans), '#EC4899']]
                    .map(([l, v, c]) => miniStatBox(l, v, c))
            ));

            const contractSids = (G.contracts || []).map(function(c) { return c.seriesId; }).filter(function(sid) { var s = getSeries(sid); return s && !s.isSideStep; });
            const pointSids = Object.keys(G.championshipPoints || {}).filter(function(sid) { var s = getSeries(sid); return s && !s.isSideStep; });
            const activeSids = [...new Set([...contractSids, ...pointSids])];
            if (!activeSids.length) {
                f.appendChild(h('div', { className: 'card', style: { textAlign: 'center', padding: '24px', color: '#94A3B8' } }, 'Sign a contract and enter results to see standings.'));
            }
            activeSids.forEach(sid => {
                const s = getSeries(sid); if (!s) return;
                const myPts = G.championshipPoints[sid] || 0;
                const sched = G.schedules[sid] || [];
                // no field data yet - seed from driver pool so standings arent empty
                var field = G.seriesFields[sid] || {};
                if (Object.keys(field).length === 0) {
                    var _seedDrivers = (G.drivers || []).filter(function(d) {
                        return d.active && d.currentSeriesId === sid;
                    });
                    if (_seedDrivers.length) {
                        field = {};
                        _seedDrivers.forEach(function(d) {
                            field[d.name] = { points: 0, wins: 0, top5s: 0, starts: 0 };
                        });
                    }
                }
                const racesRun = sched.filter(r => r.result).length;
                // season history for player row, not career totals
                const seasonRaces = G.raceHistory.filter(r => r.season === G.season && r.seriesId === sid);
                const seasonWins = seasonRaces.filter(r => !r.dnf && !r.dq && r.pos === 1).length;
                const seasonTop5s = seasonRaces.filter(r => !r.dnf && !r.dq && r.pos <= 5).length;
                const seasonStarts = seasonRaces.length;
                const rows = [
                    { name: G.driverName, points: myPts, wins: seasonWins, top5s: seasonTop5s, starts: seasonStarts, isPlayer: true },
                    ...Object.entries(field).map(([name, d]) => ({ name, ...d, isPlayer: false })),
                ].sort((a, b) => b.points - a.points || b.wins - a.wins);
                const playerPos = rows.findIndex(r => r.isPlayer) + 1;
                const ptsBack = rows[0] && !rows[0].isPlayer ? rows[0].points - myPts : 0;
                const card = h('div', { className: 'card', style: { marginBottom: '18px' } });
                const standKey = 'stand_' + sid;
                const standCollapsed = isCollapsed(standKey, false);
                card.appendChild(h('div', {
                    style: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', cursor: 'pointer' },
                    onClick: function () { toggleCollapse(standKey, false); render(); }
                },
                    h('div', { style: { width: '4px', height: '34px', background: s.color, borderRadius: '2px' } }),
                    h('div', { style: { flex: 1 } },
                        h('div', { style: { fontSize: '17px', fontWeight: 900, color: '#F9FAFB' } }, s.name),
                        h('div', { style: { fontSize: '14px', color: '#94A3B8' } },
                            `${racesRun} of ${s.races} races · ${rows.length} drivers tracked`,
                            playerPos > 1 && ptsBack > 0 ? h('span', { style: { color: '#EF4444' } }, ` · P${playerPos} · ${ptsBack} back`) : null,
                            playerPos === 1 && rows.length > 1 ? h('span', { style: { color: '#F59E0B' } }, ` · Championship leader 🏆`) : null,
                        ),
                    ),
                    h('div', { style: { marginLeft: 'auto', fontSize: '24px', fontWeight: 900, color: s.color } }, `${myPts} pts`),
                    h('span', { style: { fontSize: '16px', color: '#64748B', transform: standCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.2s', marginLeft: '8px' } }, '▾'),
                ));
                if (!standCollapsed) {
                    const tbl = h('table', { className: 'stn-table' });
                    tbl.appendChild(h('tr', null, ...['', 'Driver', 'Pts', 'W', 'T5', 'St'].map(hd => h('th', null, hd))));
                    const tmNames = new Set((G.teammates || []).filter(t => t.seriesId === sid).map(t => t.name.toLowerCase()));
                    rows.forEach((row, idx) => {
                        const isP = row.isPlayer;
                        const isTm = !isP && tmNames.has(row.name.toLowerCase());
                        const rival = !isP ? (G.rivals || []).find(r => r.name.toLowerCase() === row.name.toLowerCase()) : null;
                        const isInjured = !isP && (G.drivers || []).some(d => d.name.toLowerCase() === row.name.toLowerCase() && d.injuredOrPenalized);
                        const rel = rival ? relationship(rival) : null;
                        const nameColor = isP ? s.color : isTm ? '#3B82F6' : '#D1D5DB';
                        let relBadge = null;
                        if (isTm) {
                            const tmRelColor = rel ? REL_COLOR[rel] || '#3B82F6' : '#3B82F6';
                            const tmRelLabel = rel && rel !== 'acquaintance' ? `TEAM · ${REL_LABEL[rel] || rel}` : 'TEAM';
                            relBadge = h('span', { style: { fontSize: '10px', color: tmRelColor, marginLeft: '5px', fontWeight: 700, background: tmRelColor + '22', border: `1px solid ${tmRelColor}44`, padding: '1px 5px', borderRadius: '3px' } }, tmRelLabel);
                        } else if (rel && rel !== 'acquaintance') {
                            relBadge = h('span', { style: { fontSize: '10px', color: REL_COLOR[rel], marginLeft: '5px', fontWeight: 700, background: REL_COLOR[rel] + '22', border: `1px solid ${REL_COLOR[rel]}44`, padding: '1px 5px', borderRadius: '3px' } }, REL_LABEL[rel]);
                        }
                        var _displayPos = idx + 1;
                        if (idx > 0 && rows[idx].points === rows[idx - 1].points && rows[idx].wins === rows[idx - 1].wins) {
                            _displayPos = _displayPos - 1;
                            // find where the tie starts
                            var _tieCheck = idx - 1;
                            while (_tieCheck > 0 && rows[_tieCheck].points === rows[idx].points && rows[_tieCheck].wins === rows[idx].wins) _tieCheck--;
                            _displayPos = (rows[_tieCheck].points === rows[idx].points && rows[_tieCheck].wins === rows[idx].wins) ? _tieCheck + 1 : _tieCheck + 2;
                        }
                        const tr = h('tr', { className: isP ? 'player-row' : '' },
                            h('td', { style: { color: _displayPos === 1 ? '#F59E0B' : _displayPos <= 3 ? '#CBD5E1' : '#94A3B8', fontWeight: 800 } }, _displayPos),
                            h('td', { style: { color: nameColor, cursor: isP ? 'default' : 'pointer' }, onClick: isP ? null : function () { openDriverProfileModal(row.name); } }, row.name,

                                isP ? h('span', { style: { fontSize: '10px', color: s.color, marginLeft: '5px', fontWeight: 700 } }, 'YOU') : null,
                                relBadge,
                                isInjured ? h('span', { style: { fontSize: '10px', color: '#EF4444', marginLeft: '5px', fontWeight: 700, background: '#7F1D1D22', border: '1px solid #EF444444', padding: '1px 4px', borderRadius: '3px' } }, 'INJ') : null,
                            ),
                            h('td', { style: { fontWeight: isP ? 800 : 400, color: isP ? s.color : '#E5E7EB' } }, row.points),
                            h('td', { style: { color: '#CBD5E1' } }, row.wins),
                            h('td', { style: { color: '#CBD5E1' } }, row.top5s),
                            h('td', { style: { color: '#94A3B8' } }, row.starts),
                        );
                        tbl.appendChild(tr);
                    });
                    card.appendChild(tbl);
                    if (rows.length <= 1) card.appendChild(h('div', { style: { fontSize: '14px', color: '#64748B', padding: '10px', fontStyle: 'italic' } }, 'No other drivers tracked yet.'));

                    // rivals and incident drivers in this series
                    const calloutPool = (G.rivals || []).filter(r => {
                        const rel = relationship(r);
                        return ['rival', 'frenemy', 'racing_rival'].includes(rel);
                    }).slice(0, 6);
                    if (calloutPool.length) {
                        const strip = h('div', { style: { marginTop: '10px', padding: '10px', background: '#060A10', border: '1px solid #1E2433', borderRadius: '7px' } },
                            h('div', { style: { fontSize: '12px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', fontWeight: 700 } }, 'Call Someone Out'),
                            h('div', { style: { display: 'flex', gap: '6px', flexWrap: 'wrap' } },
                                ...calloutPool.map(r => {
                                    const rel = relationship(r);
                                    const col = REL_COLOR[rel] || '#94A3B8';
                                    return h('button', {
                                        className: 'btn btn-xs',
                                        style: { background: col + '22', border: `1px solid ${col}44`, color: col },
                                        onClick: () => {
                                            openModal(h('div', null,
                                                h('div', { className: 'modal-eyebrow' }, `Say something about ${r.name}`),
                                                h('div', { className: 'modal-title' }, 'Pick Your Angle'),
                                                h('div', { style: { fontSize: '14px', color: '#94A3B8', marginBottom: '16px' } }, 'Start beef, give props, or flip the script. Your call.'),
                                                h('div', { style: { display: 'flex', gap: '10px', flexWrap: 'wrap' } }),
                                                h('button', { className: 'btn btn-danger', onClick: () => openPlayerCalloutModal(r.name, 'incident', null) }, '🔥 Call Them Out'),
                                                h('button', { className: 'btn btn-success', onClick: () => openPlayerCalloutModal(r.name, 'close', null) }, '🤝 Give Props'),
                                                mkBtn('Never mind', 'btn btn-ghost', closeModal),
                                            ));
                                        }
                                    }, `${rel === 'racing_rival' ? '🤝' : rel === 'friend' ? '👊' : '🔥'} ${r.name}`);
                                })
                            )
                        );
                        card.appendChild(strip);
                    }

                }
                f.appendChild(card);
            });


            // side series standings
            var activeSideContracts = (G.sideContracts || []).filter(function(sc) { return sc.season === G.season; });
            if (activeSideContracts.length) {
                f.appendChild(h('div', { style: { fontSize: '13px', fontWeight: 800, color: '#5A4E38', marginTop: '6px', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' } }, 'Side Series'));
                activeSideContracts.forEach(function(sc) {
                    var ss = getSeries(sc.seriesId);
                    if (!ss) return;
                    var myPts = (G.sidePoints || {})[sc.seriesId] || 0;
                    var sideField = (G.sideFields || {})[sc.seriesId] || {};
                    var sideSched = (G.sideSchedules || {})[sc.seriesId] || [];
                    var racesRun = sideSched.filter(function(r) { return r.result && !r.result.simulated && !r.result.locked; }).length;
                    var playerWins = sideSched.filter(function(r) { return r.result && r.result.position === 1 && !r.result.simulated; }).length;
                    var playerTop5 = sideSched.filter(function(r) { return r.result && r.result.position <= 5 && !r.result.simulated; }).length;
                    var aiRows = Object.entries(sideField).map(function(kv) {
                        return { name: kv[0], points: kv[1].points || 0, wins: kv[1].wins || 0, top5s: kv[1].top5s || 0, starts: kv[1].starts || 0, isPlayer: false };
                    });
                    var playerRow = { name: G.driverAlias || G.driverName, points: myPts, wins: playerWins, top5s: playerTop5, starts: racesRun, isPlayer: true };
                    var allRows = [playerRow].concat(aiRows).sort(function(a, b) { return b.points - a.points || b.wins - a.wins; });
                    var playerPos = allRows.findIndex(function(r) { return r.isPlayer; }) + 1;
                    var leader = allRows[0];
                    var ptsBack = leader && !leader.isPlayer ? leader.points - myPts : 0;
                    var sideCard = h('div', { className: 'card', style: { marginBottom: '14px', borderTop: '2px solid ' + ss.color } });
                    sideCard.appendChild(h('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', cursor: 'pointer' }, onClick: function() { setTab('sidequests'); } },
                        h('div', { style: { flex: 1 } },
                            h('div', { style: { fontSize: '15px', fontWeight: 900, color: ss.color } }, ss.short),
                            h('div', { style: { fontSize: '12px', color: '#5A4E38' } },
                                racesRun + ' raced · P' + playerPos + ' of ' + allRows.length,
                                ptsBack > 0 ? h('span', { style: { color: '#EF4444' } }, ' · ' + ptsBack + ' back') : null,
                                playerPos === 1 && allRows.length > 1 ? h('span', { style: { color: '#F59E0B' } }, ' · Leading') : null,
                            ),
                        ),
                        h('div', { style: { fontSize: '20px', fontWeight: 900, color: ss.color, fontFamily: "'Share Tech Mono',monospace" } }, myPts + ' pts'),
                    ));
                    var tbl = h('table', { className: 'stn-table' });
                    tbl.appendChild(h('tr', null, ...['', 'Driver', 'Pts', 'W', 'T5', 'St'].map(function(hd) { return h('th', null, hd); })));
                    allRows.forEach(function(row, idx) {
                        var _dp1 = idx + 1;
                        if (idx > 0 && allRows[idx].points === allRows[idx-1].points && allRows[idx].wins === allRows[idx-1].wins) { var _tc1 = idx-1; while(_tc1 > 0 && allRows[_tc1].points === allRows[idx].points && allRows[_tc1].wins === allRows[idx].wins) _tc1--; _dp1 = (allRows[_tc1].points === allRows[idx].points && allRows[_tc1].wins === allRows[idx].wins) ? _tc1+1 : _tc1+2; }
                        tbl.appendChild(h('tr', { className: row.isPlayer ? 'player-row' : '' },
                            h('td', { style: { color: _dp1 === 1 ? '#F59E0B' : '#94A3B8', fontWeight: 800 } }, _dp1),
                            h('td', { style: { color: row.isPlayer ? ss.color : '#D1D5DB' } }, row.name, row.isPlayer ? h('span', { style: { fontSize: '10px', color: ss.color, marginLeft: '4px', fontWeight: 700 } }, 'YOU') : null),
                            h('td', { style: { fontWeight: row.isPlayer ? 800 : 400, color: row.isPlayer ? ss.color : '#E5E7EB' } }, row.points),
                            h('td', null, row.wins),
                            h('td', null, row.top5s),
                            h('td', { style: { color: '#94A3B8' } }, row.starts),
                        ));
                    });
                    sideCard.appendChild(tbl);
                    f.appendChild(sideCard);
                });
            }

            // performance graph
            f.appendChild(renderPerfGraph());

            }

            // all series tab
            if (_standTab === 'all') {
                var playerSids = new Set((G.contracts || []).map(function(c) { return c.seriesId; }));
                var allSeriesList = SERIES.filter(function(s) { return !s.isSideStep && !playerSids.has(s.id); });

                if (!allSeriesList.length) {
                    f.appendChild(h('div', { className: 'card', style: { textAlign: 'center', padding: '24px', color: '#64748B' } }, 'You\'re in every series.'));
                } else {
                    f.appendChild(h('div', { style: { fontSize: '13px', color: '#475569', marginBottom: '14px' } },
                        'Estimated current-season standings for all other series. Points are simulated from AI driver skill and season progress — not tracked race-by-race. ● = driver you\'ve met.'
                    ));

                    /* estimate points for stable sort - skill based, seeded by name hash so its consistent per season */
                    function nameHash(str) {
                        var h = 0;
                        for (var i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
                        return Math.abs(h);
                    }
                    function estimateSeasonPts(d, totalRaces) {
                        // races run this season
                        var rate = d.attendanceRate !== undefined ? d.attendanceRate : 0.85;
                        var racesRun = Math.round(Math.min(G.week - 1, totalRaces) * rate);
                        if (racesRun <= 0) return 0;
                        // skill to points per race estimate
                        var skill = d.skill || 50;
                        // stable variance from name hash
                        var variance = ((nameHash(d.name + G.season) % 20) - 10); // -10 to +10 variance
                        var avgPts = Math.max(5, Math.round((skill + variance) * 0.38));
                        // wins from skill + stable name hash
                        var winRate = Math.max(0, (skill + variance - 45)) / 200; // 0 at skill 45, ~0.25 at skill 95
                        var estWins = Math.round(winRate * racesRun);
                        // Total pts = base avg + win bonus (wins worth extra ~15pts above avg)
                        return Math.round(avgPts * racesRun + estWins * 15);
                    }

                    allSeriesList.forEach(function(s) {
                        var seriesDrivers = (G.drivers || []).filter(function(d) {
                            return d.active && d.currentSeriesId === s.id;
                        });
                        if (!seriesDrivers.length) return;

                        // Compute estimated pts once, attach for stable sort
                        var withPts = seriesDrivers.map(function(d) {
                            return { d: d, pts: estimateSeasonPts(d, s.races || 16) };
                        }).sort(function(a, b) { return b.pts - a.pts || (b.d.skill || 50) - (a.d.skill || 50); });

                        var allKey = 'allstand_' + s.id;
                        var allCollapsed = isCollapsed(allKey, true);
                        var allCard = h('div', { className: 'card', style: { marginBottom: '12px' } });

                        // Header
                        allCard.appendChild(h('div', {
                            style: { display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: allCollapsed ? 0 : '10px' },
                            onClick: function() { toggleCollapse(allKey, true); render(); }
                        },
                            h('div', { style: { width: '10px', height: '10px', borderRadius: '2px', background: s.color, flexShrink: 0 } }),
                            h('span', { style: { fontSize: '15px', fontWeight: 800, color: s.color } }, s.short),
                            h('span', { style: { fontSize: '13px', color: '#475569', marginLeft: '4px' } }, '— ' + s.name),
                            h('span', { style: { marginLeft: 'auto', fontSize: '12px', color: '#475569' } },
                                seriesDrivers.length + ' drivers · Wk ' + Math.min(G.week - 1, s.races || 16) + '/' + (s.races || 16)
                            ),
                            h('span', { style: { fontSize: '14px', color: '#64748B', marginLeft: '8px', transform: allCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' } }, '▾'),
                        ));

                        if (!allCollapsed) {
                            var leader = withPts[0];
                            var tbl = h('table', { className: 'stn-table' });
                            tbl.appendChild(h('tr', null,
                                ...['', 'Driver', 'Est Pts', 'Skill', 'Rep', 'Fans'].map(function(hd) {
                                    return h('th', null, hd);
                                })
                            ));
                            withPts.slice(0, 25).forEach(function(row, idx) {
                                var d = row.d;
                                var ptsBack = leader && idx > 0 ? leader.pts - row.pts : 0;
                                var _dp2 = idx + 1;
                                if (idx > 0 && withPts[idx].pts === withPts[idx-1].pts) { var _tc2 = idx-1; while(_tc2 > 0 && withPts[_tc2].pts === withPts[idx].pts) _tc2--; _dp2 = (withPts[_tc2].pts === withPts[idx].pts) ? _tc2+1 : _tc2+2; }
                                tbl.appendChild(h('tr', null,
                                    h('td', { style: { color: _dp2 === 1 ? '#F59E0B' : _dp2 < 3 ? '#10B981' : '#64748B', fontWeight: 800 } }, _dp2),
                                    h('td', { style: { color: d.source === 'known' ? '#F0E8D8' : '#94A3B8' } },
                                        d.name,
                                        d.source === 'known' ? h('span', { style: { fontSize: '10px', color: '#10B981', marginLeft: '4px' } }, '●') : null,
                                    ),
                                    h('td', { style: { fontWeight: idx === 0 ? 800 : 400, color: idx === 0 ? '#F59E0B' : '#E5E7EB' } },
                                        row.pts,
                                        idx > 0 && ptsBack > 0 ? h('span', { style: { fontSize: '10px', color: '#475569', marginLeft: '4px' } }, '-' + ptsBack) : null,
                                    ),
                                    h('td', { style: { color: (d.skill||50) > 75 ? '#10B981' : (d.skill||50) > 55 ? '#F59E0B' : '#64748B' } }, d.skill || '?'),
                                    h('td', { style: { color: '#64748B', fontSize: '12px' } }, d.rep || 0),
                                    h('td', { style: { color: '#64748B', fontSize: '12px' } }, fmtFans(d.fans || 0)),
                                ));
                            });
                            allCard.appendChild(tbl);
                            if (withPts.length > 25) {
                                allCard.appendChild(h('div', { style: { fontSize: '12px', color: '#475569', marginTop: '6px', textAlign: 'center' } },
                                    '+ ' + (withPts.length - 25) + ' more'
                                ));
                            }
                        }
                        f.appendChild(allCard);
                    });
                }
            }

            // ladder tab
            if (_standTab === 'ladder') {
            // Series ladder
            const lc = h('div', { className: 'card' });
            lc.appendChild(cardTitle('Series Ladder'));
            SERIES.filter(function(s) { return !s.isSideStep; }).forEach(function(s) {
                var unlocked = G.reputation >= s.reqRep && G.fans >= s.reqFans;
                var active = G.contracts.find(function(c) { return c.seriesId === s.id; });
                var sched = G.schedules[s.id] || [];
                var sw = sched.filter(function(r) { return r.result && !r.result.dnf && r.result.position === 1; }).length;
                var ss = sched.filter(function(r) { return r.result; }).length;
                var appCarOwned = (G.appCarsOwned || {})[s.id];
                var canAffordNew  = G.money >= (s.carCostNew  || 0);
                var canAffordUsed = G.money >= (s.carCostUsed || 0);

                // Trucks: special case — requires iRacing car ownership, no valid free AI sub
                var truckOwned = !!(G.ownedCars || {}).nascar_trucks;
                var isTrucks = s.id === 'nascar_trucks';
                var trucksBlocked = isTrucks && !truckOwned;

                var carStatus = s.tier <= 3 && !appCarOwned && unlocked
                    ? (canAffordNew
                        ? badge('Buy New ' + fmtMoney(s.carCostNew), '#10B981')
                        : canAffordUsed
                            ? badge('Buy Used ' + fmtMoney(s.carCostUsed), '#F59E0B')
                            : badge('Save up: ' + fmtMoney(s.carCostUsed), '#EF4444'))
                    : null;

                // Trucks blocked row gets full opacity but a distinct visual treatment
                var rowOpacity = (unlocked && !trucksBlocked) ? '1' : trucksBlocked ? '0.6' : '0.3';
                var tierColor  = trucksBlocked ? '#475569' : (unlocked ? s.color : '#2D3748');

                lc.appendChild(h('div', {
                    style: { display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '9px 0', borderBottom: '1px solid #1E2433', opacity: rowOpacity },
                },
                    h('div', { style: { width: '30px', height: '30px', borderRadius: '6px', background: s.color + '14', border: '2px solid ' + tierColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 900, color: s.color, flexShrink: 0, marginTop: '2px' } }, 'T' + s.tier),
                    h('div', { style: { flex: 1 } },
                        h('div', { style: { fontWeight: 700, fontSize: '14px', color: '#F9FAFB' } }, s.name),
                        h('div', { style: { fontSize: '13px', color: '#94A3B8' } },
                            trucksBlocked
                                ? 'Req: ' + s.reqRep + ' rep, ' + fmtFans(s.reqFans) + ' fans'
                                : unlocked
                                    ? (ss > 0 ? ss + ' starts · ' + sw + ' wins' : 'Unlocked · ' + fmtMoney(s.fee) + ' entry fee')
                                    : 'Req: ' + s.reqRep + ' rep, ' + fmtFans(s.reqFans) + ' fans'
                        ),
                        // Trucks-specific ownership warning
                        trucksBlocked ? h('div', { style: { fontSize: '12px', color: '#F59E0B', marginTop: '4px', lineHeight: 1.5 } },
                            '🚛 Requires a NASCAR Truck in iRacing — Silverado, F-150, Tundra, or Ram. The free Silverado cannot race AI. Own any truck to unlock. Career skips to Xfinity if bypassed.'
                        ) : null,
                        s.tier <= 3 && appCarOwned ? h('div', { style: { fontSize: '12px', color: '#10B981', marginTop: '2px' } }, '✅ Car owned') : null,
                        s.tier <= 3 && !appCarOwned && unlocked && !active ? h('div', { style: { fontSize: '12px', color: '#F59E0B', marginTop: '2px' } }, '⚠️ Need to buy a car first') : null,
                    ),
                    // Badge column
                    active
                        ? badge('ACTIVE', s.color)
                        : trucksBlocked
                            ? badge('NO TRUCK', '#F59E0B')
                            : !unlocked
                                ? badge('LOCKED', '#2D3748')
                                : carStatus,
                    // Buy car button for tier 1-3
                    unlocked && !active && s.tier <= 3 && s.tier > 1 && !appCarOwned && (canAffordNew || canAffordUsed)
                        ? mkBtn('Buy Car', 'btn btn-xs btn-primary', function() { openCarPurchaseModal(s.id, null); })
                        : null,
                ));
            });
            f.appendChild(lc);
            } // end _standTab === 'ladder'

            return f;
        }

        function renderPerfGraph() {
            const history = (G.raceHistory || []).slice(-40);
            if (history.length < 2) return h('div', null);
            const canvas = h('canvas', { width: 900, height: 180 });
            const wrap = h('div', { className: 'card', style: { marginBottom: '18px' } },
                cardTitle('Performance — Last 40 Races (Finish Position ↑ = Better)'),
                h('div', { className: 'graph-wrap' }, canvas)
            );
            requestAnimationFrame(() => {
                const ctx = canvas.getContext('2d');
                const W = canvas.width, H = canvas.height, PAD = 32;
                ctx.clearRect(0, 0, W, H);
                ctx.strokeStyle = '#1E2433'; ctx.lineWidth = 1;
                [0.25, 0.5, 0.75, 1].forEach(y => {
                    ctx.beginPath(); ctx.moveTo(PAD, PAD + (H - 2 * PAD) * y); ctx.lineTo(W - PAD, PAD + (H - 2 * PAD) * y); ctx.stroke();
                });
                const maxPos = Math.max(...history.map(r => r.fs || 30));
                const xStep = (W - 2 * PAD) / (Math.max(history.length - 1, 1));
                const sids = [...new Set(history.map(r => r.seriesId))];
                sids.forEach(sid => {
                    const s = getSeries(sid); if (!s) return;
                    const pts = history.map((r, i) => r.seriesId === sid ? { x: PAD + i * xStep, y: PAD + (H - 2 * PAD) * ((r.dnf ? maxPos : r.pos - 1) / (maxPos - 1 || 1)), dnf: r.dnf } : null).filter(Boolean);
                    if (pts.length < 1) return;
                    if (pts.length >= 2) { ctx.strokeStyle = s.color + '99'; ctx.lineWidth = 2; ctx.beginPath(); pts.forEach((p, i) => { if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); }); ctx.stroke(); }
                    pts.forEach(p => { ctx.fillStyle = p.dnf ? '#EF4444' : s.color; ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI * 2); ctx.fill(); });
                });
                ctx.fillStyle = '#94A3B8'; ctx.font = '11px Arial';
                ctx.textAlign = 'right'; ctx.fillText('P1', PAD - 5, PAD + 4); ctx.fillText(`P${Math.round(maxPos)}`, PAD - 5, H - PAD + 4);
                ctx.textAlign = 'left'; ctx.fillStyle = '#64748B';
                if (history.length > 0) ctx.fillText((history[0].track && history[0].track.slice(0, 20)) || '', PAD, H - 6);
                if (history.length > 1) ctx.fillText((history[history.length - 1].track && history[history.length - 1].track.slice(0, 20)) || '', W - PAD - 120, H - 6);
            });
            return wrap;
        }

        // business
        function openFoundTeamModal(s) {
            var costs = TEAM_CAR_COSTS[s.id];
            var defaultName = makeOwnedTeam(s.id).name;

            var nameInput = h('input', {
                type: 'text', value: defaultName,
                style: {
                    width: '100%', boxSizing: 'border-box',
                    background: '#0D1117', border: '1px solid #2D3748', borderRadius: '6px',
                    color: '#F9FAFB', fontSize: '15px', padding: '10px 12px', marginBottom: '4px',
                }
            });

            var errorEl = h('div', { style: { fontSize: '12px', color: '#EF4444', minHeight: '18px', marginBottom: '12px' } });

            function doFound(usedCar) {
                var chosenName = nameInput.value.trim() || defaultName;
                var cost = usedCar ? costs.used : costs.new;
                if (G.money < cost) { errorEl.textContent = 'Not enough money.'; return; }
                G.ownedTeam = makeOwnedTeam(s.id);
                G.ownedTeam.name = chosenName;
                var car = makeTeamCar(s.id);
                car.purchasedUsed = usedCar;
                car.condition = usedCar ? rand(60, 80) : 100;
                car.purchasePrice = cost;
                G.ownedTeam.cars.push(car);
                G.money -= cost;
                G.ownedTeam.totalSpent += cost;
                addLog(G, '🏚️ Founded ' + G.ownedTeam.name + ' in ' + s.name + '. Bought ' + (usedCar ? 'used' : 'new') + ' car: -' + fmtMoney(cost));
                saveGame(); closeModal(); render();
            }

            openModal(h('div', null,
                h('div', { className: 'modal-eyebrow' }, s.name),
                h('div', { className: 'modal-title' }, 'Found a Team'),
                h('div', { style: { fontSize: '14px', color: '#94A3B8', marginBottom: '18px' } },
                    'Name your team and choose your first car. You can rename it later.'
                ),

                h('div', { style: { fontSize: '12px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' } }, 'Team Name'),
                nameInput,
                errorEl,

                h('div', { style: { fontSize: '12px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' } }, 'First Car'),
                h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' } },
                    h('div', {
                        style: { background: '#060A10', border: '1px solid #1E2433', borderRadius: '8px', padding: '14px', cursor: 'pointer' },
                        onClick: function() { doFound(true); }
                    },
                        h('div', { style: { fontSize: '13px', fontWeight: 700, color: '#F9FAFB', marginBottom: '4px' } }, 'Used Car'),
                        h('div', { style: { fontSize: '18px', fontWeight: 900, color: '#F59E0B' } }, fmtMoney(costs.used)),
                        h('div', { style: { fontSize: '12px', color: '#64748B', marginTop: '4px' } }, 'Condition: 60–80%'),
                    ),
                    h('div', {
                        style: {
                            background: '#060A10', border: '1px solid ' + (G.money >= costs.new ? '#2D3748' : '#1E2433'),
                            borderRadius: '8px', padding: '14px',
                            cursor: G.money >= costs.new ? 'pointer' : 'default',
                            opacity: G.money >= costs.new ? '1' : '0.4',
                        },
                        onClick: function() { if (G.money >= costs.new) doFound(false); }
                    },
                        h('div', { style: { fontSize: '13px', fontWeight: 700, color: '#F9FAFB', marginBottom: '4px' } }, 'New Car'),
                        h('div', { style: { fontSize: '18px', fontWeight: 900, color: '#10B981' } }, fmtMoney(costs.new)),
                        h('div', { style: { fontSize: '12px', color: '#64748B', marginTop: '4px' } }, 'Condition: 100%'),
                    ),
                ),

                h('div', { className: 'modal-actions' },
                    mkBtn('Cancel', 'btn btn-ghost', closeModal),
                )
            ));

            // Focus and select the name input after modal renders
            setTimeout(function() { nameInput.focus(); nameInput.select(); }, 50);
        }