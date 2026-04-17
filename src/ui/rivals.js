// special events
        function renderSpecial() {
            const f = document.createDocumentFragment();
            f.appendChild(h('div', { className: 'page-title' }, 'Special Events'));
            f.appendChild(h('div', { className: 'page-sub' }, 'One-off events: domestic road courses, international ovals, exotic venues. No championship points. No rivalries. Just fans, money, and maybe an international sponsor.'));

            const groups = [
                ['Domestic Events', SPECIAL_EVENTS.filter(e => !e.fig8 && !e.location.match(/England|Australia|Germany|France|Belgium|Japan|Brazil|Mexico/))],
                ['International Events', SPECIAL_EVENTS.filter(e => !e.fig8 && e.location.match(/England|Australia|Germany|France|Belgium|Japan|Brazil|Mexico/))],
            ];
            groups.forEach(([title, events]) => {
                if (!events.length) return;
                f.appendChild(h('div', { style: { fontSize: '14px', fontWeight: 800, color: '#94A3B8', marginBottom: '8px', marginTop: '10px', letterSpacing: '0.1em', textTransform: 'uppercase' } }, title));
                events.forEach(evt => {
                    const unlocked = G.reputation >= evt.reqRep && G.fans >= (evt.reqFans || 0);
                    const hasSponsor = G.sponsors.some(sp => sp.international);
                    const totalCost = hasSponsor ? evt.entryCost : evt.travelCost + evt.entryCost;
                    const canAfford = G.money >= totalCost;
                    const last = (G.specialResults || []).filter(r => r.evtId === evt.id).slice(-1)[0];
                    const card = h('div', { className: 'card', style: { opacity: unlocked ? '1' : '0.4' } });
                    card.appendChild(h('div', { style: { display: 'flex', gap: '14px', alignItems: 'flex-start', flexWrap: 'wrap' } },
                        h('div', { style: { flex: 1 } },
                            h('div', { style: { fontSize: '16px', fontWeight: 800, color: '#F9FAFB', marginBottom: '3px' } }, evt.name),
                            h('div', { style: { fontSize: '14px', color: '#94A3B8', marginBottom: '5px' } }, `${evt.location} · ${evt.carType}${evt.multiClass ? ' · Multi-class' : ''}`),
                            h('div', { style: { fontSize: '14px', color: '#94A3B8' } }, evt.desc),
                            h('div', { style: { fontSize: '14px', color: '#64748B', marginTop: '6px' } },
                                `Entry: ${fmtMoney(evt.entryCost)}`,
                                evt.travelCost > 0 ? ` · Travel: ${fmtMoney(evt.travelCost)}` : '',
                                hasSponsor ? h('span', { style: { color: '#10B981' } }, ' · Sponsor covers travel!') : null,
                                ` · +${fmtFans(evt.fanGain)} fans`,
                                evt.laps ? ` · ${evt.laps} laps` : '',
                                evt.sponsorChance > 0 ? ` · ${Math.round(evt.sponsorChance * 100)}% intl sponsor chance` : '',
                            ),
                        ),
                        h('div', { style: { textAlign: 'right', flexShrink: 0 } },
                            last ? h('div', { style: { fontSize: '14px', color: last.dnf ? '#EF4444' : last.pos <= 3 ? '#F59E0B' : '#94A3B8', marginBottom: '8px', fontWeight: 700 } }, `Last: ${last.dnf ? 'DNF' : ordinal(last.pos)}`) : null,
                            unlocked ? canAfford ? mkBtn(`Race (${fmtMoney(totalCost)})`, 'btn btn-sm btn-primary', () => openSpecialModal(evt.id)) :
                                h('span', { style: { fontSize: '14px', color: '#EF4444' } }, `Need ${fmtMoney(totalCost - G.money)} more`) :
                                h('span', { style: { fontSize: '14px', color: '#64748B' } }, `Req: ${evt.reqRep} rep`),
                        )
                    ));
                    f.appendChild(card);
                });
            });
            // slinger fig-8 — always available
            const fig8Card = h('div', { className: 'card', style: { marginBottom: '14px', border: '1px solid #8B5CF644' } });
            fig8Card.appendChild(h('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' } },
                h('div', { style: { fontSize: '24px' } }, '🔀'),
                h('div', null,
                    h('div', { style: { fontSize: '17px', fontWeight: 900, color: '#8B5CF6' } }, 'Slinger Speedway Figure-8'),
                    h('div', { style: { fontSize: '14px', color: '#94A3B8', marginTop: '2px' } }, 'Slinger, WI · No championship points · Open anytime'),
                ),
            ));
            fig8Card.appendChild(h('div', { style: { fontSize: '14px', color: '#CBD5E1', marginBottom: '14px', lineHeight: '1.6' } },
                'The figure-8 at Slinger is open any time you want a break from the grind. No championship implications, no contract required — just chaos, contact, and a good story. Field of 16–20 mixed drivers.'
            ));
            fig8Card.appendChild(h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', marginBottom: '14px' } },
                h('div', { style: { background: '#060A10', borderRadius: '7px', padding: '8px 10px', border: '1px solid #8B5CF633' } },
                    h('div', { style: { fontSize: '11px', color: '#64748B', textTransform: 'uppercase' } }, 'Field Size'),
                    h('div', { style: { fontSize: '16px', fontWeight: 800, color: '#8B5CF6' } }, '16–20'),
                ),
                h('div', { style: { background: '#060A10', borderRadius: '7px', padding: '8px 10px', border: '1px solid #8B5CF633' } },
                    h('div', { style: { fontSize: '11px', color: '#64748B', textTransform: 'uppercase' } }, 'Prize'),
                    h('div', { style: { fontSize: '16px', fontWeight: 800, color: '#10B981' } }, '$50–600'),
                ),
                h('div', { style: { background: '#060A10', borderRadius: '7px', padding: '8px 10px', border: '1px solid #8B5CF633' } },
                    h('div', { style: { fontSize: '11px', color: '#64748B', textTransform: 'uppercase' } }, 'Points'),
                    h('div', { style: { fontSize: '16px', fontWeight: 800, color: '#94A3B8' } }, 'None'),
                ),
            ));
            fig8Card.appendChild(mkBtn('🔀 Enter the Fig-8', 'btn btn-chaos', function () {
                const fig8FieldSize = rand(16, 20);
                const fig8Drivers = [];
                const usedNames = new Set();
                shuffle([...(G.drivers || []).filter(function(d) { return d.active && d.source === 'known'; })]).slice(0, 6).forEach(function(d) {
                    fig8Drivers.push({ name: d.name, isKnown: true }); usedNames.add(d.name);
                });
                while (fig8Drivers.length < fig8FieldSize - 1) {
                    let name = generateAIName(); let tries = 0;
                    while (usedNames.has(name) && tries < 100) { name = generateAIName(); tries++; }
                    fig8Drivers.push({ name, isKnown: false }); usedNames.add(name);
                }
                buildRaceModal({
                    eyebrow: 'Special — Slinger Speedway',
                    title: 'Figure-8 Race',
                    sub: 'Slinger, WI · Unranked · No championship points',
                    seriesId: 'mini_stock', raceIdx: -1,
                    isFig8: true, isSpecial: true,
                    specialEvt: { id: 'slinger_fig8', name: 'Figure-8 Race', prize: rand(50, 600), fanGain: rand(100, 400) },
                    expectedField: fig8Drivers.map(function(d) { return d.name; }),
                    onSubmit: function(result) {
                        G.money += result.prize || 0;
                        G.fans  += result.fanGain || rand(50, 200);
                        addLog(G, '🔀 Fig-8 at Slinger: P' + result.position + (result.dnf ? ' (DNF)' : '') + ' · ' + fmtMoney(result.prize || 0));
                        saveGame(); render();
                    }
                });
            }));
            f.appendChild(fig8Card);

            return f;
        }

        // rivals
        function getH2H(rivalName) {
            // how many times we beat or got beat by this driver
            let ahead = 0, behind = 0;
            (G.raceHistory || []).forEach(function(r) {
                if (r.dnf || r.dq) return;
                const sched = (G.schedules[r.seriesId] || []);
                const race = sched.find(function(s) { return s.result && s.track === r.track && s.result.season === r.season; });
                if (!race || !race.result || !race.result.finishOrder) return;
                const order = race.result.finishOrder;
                const myIdx = order.findIndex(function(e) {
                    return e.isPlayer || /\byou\b/i.test(e.name) || e.name.toLowerCase() === G.driverName.toLowerCase();
                });
                const theirIdx = order.findIndex(function(e) {
                    return e.name && e.name.toLowerCase() === rivalName.toLowerCase();
                });
                if (myIdx === -1 || theirIdx === -1) return;
                if (myIdx < theirIdx) ahead++;
                else behind++;
            });
            return { ahead: ahead, behind: behind, total: ahead + behind };
        }

        function renderRivals() {
            const f = document.createDocumentFragment();
            f.appendChild(h('div', { className: 'page-title' }, 'Rivals & Relationships'));
            f.appendChild(h('div', { className: 'page-sub' }, 'Built from your race entries. Close finishes (within 0.05s) build racing rivalries. Incidents build enemies. Both = heated. Persists across all seasons and series.'));

            f.appendChild(h('div', { className: 'grid-4', style: { marginBottom: '20px' } },
                ...[['Friends', '#10B981', 'friend'], ['Racing Rivals', '#F97316', 'racing_rival'], ['Rivals', '#EF4444', 'rival'], ['Heated', '#F59E0B', 'frenemy']]
                    .map(function(entry) {
                        var l = entry[0], c = entry[1], rel = entry[2];
                        var group = (G.rivals || []).filter(function(r) { return relationship(r) === rel; });
                        return h('div', { className: 'card', style: { cursor: group.length ? 'pointer' : 'default' }, onClick: function() {
                            if (!group.length) return;
                            var sorted = group.slice().sort(function(a, b) {
                                return ((b.incidents || 0) + (b.closeRaces || 0) + (b.cleanBattles || 0)) -
                                       ((a.incidents || 0) + (a.closeRaces || 0) + (a.cleanBattles || 0));
                            });
                            openModal(h('div', null,
                                h('div', { className: 'modal-eyebrow', style: { color: c } }, l.toUpperCase()),
                                h('div', { className: 'modal-title' }, group.length + ' ' + l),
                                h('div', { style: { maxHeight: '60vh', overflowY: 'auto', marginTop: '14px' } },
                                    ...sorted.map(function(r) {
                                        var h2h = getH2H(r.name);
                                        var pct = h2h.total ? Math.round((h2h.ahead / h2h.total) * 100) : null;
                                        var pctCol = pct === null ? '#94A3B8' : pct >= 60 ? '#10B981' : pct >= 40 ? '#F59E0B' : '#EF4444';
                                        return h('div', {
                                            style: { display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid #1A1E2A', cursor: 'pointer' },
                                            onClick: function(e) { e.stopPropagation(); closeModal(); openDriverProfileModal(r.name); }
                                        },
                                            h('div', { style: { width: '6px', height: '6px', borderRadius: '50%', background: c, flexShrink: 0 } }),
                                            h('div', { style: { flex: 1 } },
                                                h('div', { style: { fontWeight: 700, fontSize: '14px', color: '#F9FAFB' } }, r.name),
                                                h('div', { style: { fontSize: '12px', color: '#94A3B8', marginTop: '2px' } },
                                                    (r.incidents || 0) + ' inc · ' + (r.closeRaces || 0) + ' close · ' + (r.cleanBattles || 0) + ' clean'
                                                ),
                                            ),
                                            pct !== null ? h('div', { style: { fontSize: '12px', fontWeight: 700, color: pctCol } }, 'H2H ' + pct + '%') : null,
                                        );
                                    })
                                ),
                                h('div', { className: 'modal-actions' }, mkBtn('Close', 'btn btn-ghost', closeModal))
                            ));
                        }},
                            h('div', { style: { fontSize: '12px', color: '#94A3B8', textTransform: 'uppercase' } }, l),
                            h('div', { style: { fontSize: '28px', fontWeight: 900, color: c } }, group.length),
                            group.length ? h('div', { style: { fontSize: '11px', color: '#475569', marginTop: '4px' } }, 'tap to view') : null,
                        );
                    })
            ));

            if (!(G.rivals || []).length) {
                f.appendChild(h('div', { className: 'card', style: { textAlign: 'center', padding: '28px', color: '#94A3B8' } }, 'No tracked drivers yet. Enter finish orders after races.'));
                return f;
            }
            const sorted = [...G.rivals].sort((a, b) => { const o = { rival: 0, frenemy: 1, racing_rival: 2, friend: 3, acquaintance: 4 }; return o[relationship(a)] - o[relationship(b)]; });
            sorted.forEach(r => {
                const rel = relationship(r), rc = REL_COLOR[rel];
                f.appendChild(h('div', { className: 'row-item', style: { borderColor: rc + '30', marginBottom: '8px' } },
                    accent(rc),
                    h('div', { style: { flex: 1 } },
                        h('div', { style: { fontWeight: 800, fontSize: '15px', color: '#F9FAFB', cursor: 'pointer' }, onClick: function () { openDriverProfileModal(r.name); } }, r.name, ' →'),
                        h('div', { style: { fontSize: '14px', color: '#94A3B8', marginTop: '2px' } }, `${Math.round(r.incidents || 0)} incidents · ${r.closeRaces || 0} close finishes · ${r.cleanBattles || 0} clean battles`),
                        (function() {
                            const h2h = getH2H(r.name);
                            if (!h2h.total) return null;
                            const pct = Math.round((h2h.ahead / h2h.total) * 100);
                            const col = pct >= 60 ? '#10B981' : pct >= 40 ? '#F59E0B' : '#EF4444';
                            return h('div', { style: { fontSize: '13px', color: col, marginTop: '3px', fontWeight: 700 } },
                                'H2H: ' + h2h.ahead + '–' + h2h.behind + ' (' + pct + '% ahead) over ' + h2h.total + ' shared races'
                            );
                        })(),
                    ),
                    REL_LABEL[rel] ? badge(REL_LABEL[rel], rc) : null,
                    h('div', { style: { fontSize: '14px', color: '#94A3B8', textAlign: 'right', maxWidth: '160px' } }, REL_DESC[rel] || ''),
                ));
            });
            // fig-8 is in special events
            if (false) {
            const fig8Card = h('div', {});
            fig8Card.appendChild(h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', marginBottom: '14px' } },
                h('div', { style: { background: '#060A10', borderRadius: '7px', padding: '8px 10px', border: '1px solid #1E2433' } },
                    h('div', { style: { fontSize: '11px', color: '#64748B', textTransform: 'uppercase' } }, 'Field Size'),
                    h('div', { style: { fontSize: '16px', fontWeight: 800, color: '#8B5CF6' } }, '16–20'),
                ),
                h('div', { style: { background: '#060A10', borderRadius: '7px', padding: '8px 10px', border: '1px solid #1E2433' } },
                    h('div', { style: { fontSize: '11px', color: '#64748B', textTransform: 'uppercase' } }, 'Prize'),
                    h('div', { style: { fontSize: '16px', fontWeight: 800, color: '#10B981' } }, '$50–600'),
                ),
                h('div', { style: { background: '#060A10', borderRadius: '7px', padding: '8px 10px', border: '1px solid #1E2433' } },
                    h('div', { style: { fontSize: '11px', color: '#64748B', textTransform: 'uppercase' } }, 'Points'),
                    h('div', { style: { fontSize: '16px', fontWeight: 800, color: '#94A3B8' } }, 'None'),
                ),
            ));
            fig8Card.appendChild(mkBtn('🔀 Enter the Fig-8', 'btn btn-chaos', function () {
                // fresh random roster for this run
                const fig8FieldSize = rand(16, 20);
                const fig8Drivers = [];
                const usedNames = new Set();
                // mix real and generated
                const knownPool = (G.drivers || []).filter(function (d) {
                    return d.active && d.source === 'known' && !usedNames.has(d.name);
                });
                // up to 6 real ones
                shuffle([...knownPool]).slice(0, 6).forEach(function (d) {
                    fig8Drivers.push({ name: d.name, isKnown: true });
                    usedNames.add(d.name);
                });
                // fill the rest
                while (fig8Drivers.length < fig8FieldSize - 1) {
                    let name = generateAIName();
                    let tries = 0;
                    while (usedNames.has(name) && tries < 100) { name = generateAIName(); tries++; }
                    fig8Drivers.push({ name, isKnown: false });
                    usedNames.add(name);
                }
                // open modal
                const _doOpenEntry = () => buildRaceModal({
                    eyebrow: `${s.short} — Round ${race.round}`,
                    title: race.track,
                    sub: _preNote ? `${race.city}, ${race.state}\n📻 ${_preNote}` : `${race.city}, ${race.state}`,
                    seriesId, raceIdx,
                    qualNote: qual ? `Qualified P${qual.position}${qual.pole ? ' (POLE)' : ''}` : null,
                    crewPkg,
                    expectedField,
                    isFig8: false, isSpecial: false,
                    onSubmit: (result) => {
                        processRaceResult(G, seriesId, raceIdx, result);
                        tryGenerateSummary(G, seriesId, raceIdx, result);

                        // check for new faces
                        const knownNames = new Set((G.drivers || []).filter(function(d) {
                            return d.active && d.currentSeriesId === seriesId;
                        }).map(function(d) { return d.name.toLowerCase(); }));
                        const newDrivers = (result.finishOrder || []).filter(function(e) {
                            return e.name && !e.isPlayer && !/\byou\b/i.test(e.name) &&
                                e.name.toLowerCase() !== G.driverName.toLowerCase() &&
                                !knownNames.has(e.name.toLowerCase());
                        });
                        if (newDrivers.length) {
                            // find them in the driver pool
                            const newDObjs = newDrivers.map(function(e) {
                                return (G.drivers || []).find(function(d) { return d.name.toLowerCase() === e.name.toLowerCase(); });
                            }).filter(Boolean);
                            if (newDObjs.length) {
                                setTimeout(function() {
                                    openModal(h('div', null,
                                        h('div', { className: 'modal-eyebrow' }, '🆕 New Drivers Detected'),
                                        h('div', { className: 'modal-title' }, newDObjs.length + ' driver' + (newDObjs.length > 1 ? 's' : '') + ' not in your iRacing roster'),
                                        h('div', { className: 'modal-sub' }, 'Add them to your iRacing AI roster to see them in future races.'),
                                        h('div', { style: { marginBottom: '16px' } },
                                            ...newDObjs.map(function(d) {
                                                const stats = d.aiStats || {};
                                                return h('div', { style: { background: '#060A10', border: '1px solid #1E2433', borderRadius: '7px', padding: '10px 14px', marginBottom: '8px' } },
                                                    h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' } },
                                                        h('span', { style: { fontSize: '15px', fontWeight: 800, color: '#F9FAFB' } }, d.name),
                                                        h('span', { style: { fontSize: '13px', color: '#94A3B8' } }, 'Car #' + (d.carNumber || '?')),
                                                    ),
                                                    h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '6px' } },
                                                        ...[ ['Skill', stats.relativeSkill], ['Aggr', stats.aggression], ['Optim', stats.optimism], ['Smooth', stats.smoothness],
                                                             ['Pit Crew', stats.pitCrewSkill], ['Pit Risk', stats.pittingRisk], ['Age', stats.age], ['#', d.carNumber || '?'] ]
                                                        .map(function(pair) {
                                                            return h('div', { style: { background: '#0B0F1A', borderRadius: '5px', padding: '5px 8px', textAlign: 'center' } },
                                                                h('div', { style: { fontSize: '10px', color: '#64748B', textTransform: 'uppercase' } }, pair[0]),
                                                                h('div', { style: { fontSize: '13px', fontWeight: 800, color: '#CBD5E1' } }, pair[1] || '?'),
                                                            );
                                                        })
                                                    ),
                                                );
                                            })
                                        ),
                                        h('div', { style: { fontSize: '12px', color: '#475569', marginBottom: '16px' } },
                                            '💾 Or use the Export button on the Roster tab to regenerate your full iRacing roster.json'
                                        ),
                                        h('div', { className: 'modal-actions' },
                                            mkBtn('Got It', 'btn btn-primary', closeModal),
                                        ),
                                    ));
                                }, 400);
                            }
                        }
                    }
                });

                try {
                    const _wf = getWeeklyField(seriesId, raceIdx);
                    const _absentList = _wf.absent;
                    const _starterList = _wf.starters;
                    openModal(h('div', null,
                        h('div', { className: 'modal-eyebrow' }, s.short + ' — Round ' + race.round),
                        h('div', { className: 'modal-title' }, race.track),
                        h('div', { className: 'modal-sub' }, race.city + ', ' + race.state + (race.night ? ' · 🌙 Night' : '')),
                        _preNote ? h('div', { style: { background: '#0D1117', border: '1px solid #1E2433', borderRadius: '8px', padding: '12px 14px', marginBottom: '14px', fontSize: '14px', color: '#CBD5E1', lineHeight: '1.6' } }, '📻 ' + _preNote) : null,
                        (function() {
                            var _wf2 = (function() { try { return getWeeklyField(seriesId, raceIdx); } catch(e) { return null; } })();
                            if (!_wf2) return null;
                            var _starters = _wf2.starters || [];
                            var _rivalStarters = (G.rivals || []).filter(function(r) {
                                var rel = relationship(r);
                                return ['rival','frenemy','racing_rival','friend'].includes(rel) &&
                                    _starters.some(function(s) { return s.name && s.name.toLowerCase() === r.name.toLowerCase(); });
                            });
                            if (!_rivalStarters.length) return null;
                            return h('div', { style: { background: '#0A0F1A', border: '1px solid #2D3748', borderRadius: '8px', padding: '10px 14px', marginBottom: '14px' } },
                                h('div', { style: { fontSize: '11px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: '8px' } }, '⚔️ In This Field'),
                                h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '6px' } },
                                    ..._rivalStarters.map(function(r) {
                                        var rel = relationship(r);
                                        var rc = REL_COLOR[rel] || '#94A3B8';
                                        var rl = REL_LABEL[rel] || '';
                                        return h('div', {
                                            style: { display: 'flex', alignItems: 'center', gap: '6px', background: rc + '15', border: '1px solid ' + rc + '44', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer' },
                                            onClick: function() { closeModal(); openDriverProfileModal(r.name); }
                                        },
                                            h('span', { style: { width: '7px', height: '7px', borderRadius: '50%', background: rc, display: 'inline-block', flexShrink: 0 } }),
                                            h('span', { style: { fontSize: '13px', fontWeight: 700, color: rc } }, rl),
                                            h('span', { style: { fontSize: '13px', color: '#D1D5DB' } }, r.name),
                                        );
                                    })
                                )
                            );
                        })(),
                        h('div', { style: { display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' } },
                            h('div', { style: { background: '#060A10', border: '1px solid #1E2433', borderRadius: '7px', padding: '8px 14px', flex: 1 } },
                                h('div', { style: { fontSize: '11px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em' } }, 'Expected Starters'),
                                h('div', { style: { fontSize: '18px', fontWeight: 800, color: '#F9FAFB', marginTop: '2px' } }, String(_wf.expectedCount)),
                            ),
                            h('div', { style: { background: '#060A10', border: '1px solid #1E2433', borderRadius: '7px', padding: '8px 14px', flex: 1 } },
                                h('div', { style: { fontSize: '11px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em' } }, 'Driver Pool'),
                                h('div', { style: { fontSize: '18px', fontWeight: 800, color: '#94A3B8', marginTop: '2px' } }, String(_starterList.length + _absentList.length)),
                            ),
                            _absentList.length ? h('div', { style: { background: '#1a0a00', border: '1px solid #F59E0B44', borderRadius: '7px', padding: '8px 14px', flex: 1 } },
                                h('div', { style: { fontSize: '11px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em' } }, 'Sitting Out'),
                                h('div', { style: { fontSize: '18px', fontWeight: 800, color: '#F59E0B', marginTop: '2px' } }, String(_absentList.length)),
                            ) : null,
                        ),
                        _absentList.length ? h('div', { style: { marginBottom: '14px' } },
                            h('div', { style: { fontSize: '12px', color: '#F59E0B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' } }, '🚫 Not Racing This Week'),
                            h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px', maxHeight: '200px', overflowY: 'auto' } },
                                ..._absentList.map(function(d) {
                                    const rate = d.attendanceRate !== undefined ? d.attendanceRate : 0.85;
                                    const aColor = rate >= 0.88 ? '#10B981' : rate >= 0.70 ? '#F59E0B' : '#EF4444';
                                    const aLabel = rate >= 0.88 ? 'Regular' : rate >= 0.70 ? 'Occasional' : 'Rare';
                                    return h('div', { style: { fontSize: '13px', color: '#94A3B8', padding: '3px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                                        h('span', null, d.name),
                                        h('span', { style: { fontSize: '10px', color: aColor, fontWeight: 700 } }, aLabel),
                                    );
                                })
                            ),
                        ) : h('div', { style: { fontSize: '13px', color: '#10B981', marginBottom: '14px', padding: '10px 14px', background: '#06513422', border: '1px solid #10B98133', borderRadius: '7px' } },
                            '✅ Full field expected — all ' + _starterList.length + ' regulars present.'
                        ),
                        _conditionWarning ? h('div', { style: { background: '#1C0C08', border: '1px solid #CC2020', borderLeft: '4px solid #CC2020', borderRadius: '7px', padding: '12px 16px', marginBottom: '14px', fontSize: '15px', color: '#FCA5A5', lineHeight: '1.6' } },
                            '⚠️ Critical wear: ' + _conditionWarning + '. Post-race inspection risk is elevated. Repair from the Dashboard before the race to reduce it.'
                        ) : null,
                        h('div', { className: 'modal-actions' },
                            mkBtn('📤 Roster', 'btn btn-secondary', function() {
                                var _wfForExport = (function() { try { return getWeeklyField(seriesId, raceIdx); } catch(e) { return null; } })();
                                var _guestsForExport = _wfForExport ? _wfForExport.starters.filter(function(d) { return d.currentSeriesId !== seriesId; }) : [];
                                var _startersForExport = _wfForExport ? _wfForExport.starters : null;
                                exportIRacingRoster(seriesId, _guestsForExport.length ? _guestsForExport : undefined, _startersForExport);
                            }),
                            mkBtn('Cancel', 'btn btn-ghost', closeModal),
                            mkBtn('Race! →', 'btn btn-primary', () => { closeModal(); _doOpenEntry(); }),
                        ),
                    ));
                } catch(e) {
                    _doOpenEntry();
                }
            }));
            } // fig8 block
            return f;
        }