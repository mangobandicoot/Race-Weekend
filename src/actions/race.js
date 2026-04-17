 // race result modal and simulation
        function openRaceModal(seriesId, raceIdx) {
            try {
                const sched = G.schedules[seriesId] || [];
                const race = sched[raceIdx];
                if (!race) { alert(`Race not found: seriesId=${seriesId} raceIdx=${raceIdx}`); return; }
                const s = getSeries(seriesId);
                if (!s) { alert(`Series not found: ${seriesId}`); return; }

                // mechanical failure roll
                // warn if car is beat up - elevated dq risk
                const cc = getCarCondition(G, seriesId);
                const _warnParts = [];
                if (cc.engine <= 20) _warnParts.push('Engine ' + cc.engine + '%');
                if (cc.tires <= 15) _warnParts.push('Tires ' + cc.tires + '%');
                if (cc.suspension <= 20) _warnParts.push('Suspension ' + cc.suspension + '%');
                if (cc.brakes <= 15) _warnParts.push('Brakes ' + cc.brakes + '%');
                if (cc.chassis <= 20) _warnParts.push('Chassis ' + cc.chassis + '%');
                const _conditionWarning = _warnParts.length ? _warnParts.join(' · ') : null;
                const c = G.contracts.find(c => c.seriesId === seriesId);
                const crewPkg = CREW_PACKAGES.find(p => p.id === (c && c.crewPackage || 'basic')) || CREW_PACKAGES[0];
                const qual = race.qualifying;

                // prefill field from driver db
                const knownDrivers = getDriversForSeries(G, seriesId);
                const expectedField = knownDrivers.map(d => `${d.name}${d.injuredOrPenalized ? ' [INJ/PEN]' : ''}`).join('\n');

                const _preNote = buildPreRaceNote(seriesId, raceIdx);

                // if injured show it here - injury ticks on submit not on open
                if (G.playerInjury && G.playerInjury.seriesId === seriesId) {
                    const stillOut = G.playerInjury.racesRemaining > 0;
                    if (stillOut) {
                        // racing as sub
                        const _injWf = (function() { try { return getWeeklyField(seriesId, raceIdx); } catch(e) { return null; } })();
                        openModal(h('div', null,
                            h('div', { className: 'modal-eyebrow' }, `${s.short} — Round ${race.round}`),
                            h('div', { className: 'modal-title', style: { color: '#EF4444' } }, '📋 You Can\'t Race This Week'),
                            h('div', { className: 'modal-sub' }, race.track + ' · ' + race.city + ', ' + race.state),
                            h('div', { style: { background: '#1a0505', border: '1px solid #EF4444', borderRadius: '8px', padding: '14px', marginBottom: '14px', fontSize: '14px', color: '#FCA5A5', lineHeight: '1.6' } },
                                `${G.playerInjury.subName} is starting in your place today. Enter the race results as normal — when you see your name in the results paste, it will be replaced with ${G.playerInjury.subName} automatically. Any points and prize money go to the substitute.`
                            ),
                            h('div', { style: { fontSize: '14px', color: '#94A3B8', marginBottom: '14px' } },
                                `${G.playerInjury.racesRemaining} race${G.playerInjury.racesRemaining > 1 ? 's' : ''} remaining on injury.`
                            ),
                            _preNote ? h('div', { style: { background: '#0D1117', border: '1px solid #1E2433', borderRadius: '8px', padding: '12px 14px', marginBottom: '14px', fontSize: '14px', color: '#CBD5E1', lineHeight: '1.6' } }, '📻 ' + _preNote) : null,
                            _injWf ? h('div', { style: { marginBottom: '14px' } },
                                h('div', { style: { display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' } },
                                    h('div', { style: { background: '#060A10', border: '1px solid #1E2433', borderRadius: '7px', padding: '8px 14px', flex: 1 } },
                                        h('div', { style: { fontSize: '11px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em' } }, 'Expected Starters'),
                                        h('div', { style: { fontSize: '18px', fontWeight: 800, color: '#F9FAFB', marginTop: '2px' } }, String(_injWf.expectedCount)),
                                    ),
                                    _injWf.absent.length ? h('div', { style: { background: '#1a0a00', border: '1px solid #F59E0B44', borderRadius: '7px', padding: '8px 14px', flex: 1 } },
                                        h('div', { style: { fontSize: '11px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em' } }, 'Sitting Out'),
                                        h('div', { style: { fontSize: '18px', fontWeight: 800, color: '#F59E0B', marginTop: '2px' } }, String(_injWf.absent.length)),
                                    ) : null,
                                ),
                                _injWf.absent.length ? h('div', null,
                                    h('div', { style: { fontSize: '12px', color: '#F59E0B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' } }, '🚫 Not Racing This Week'),
                                    h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px', maxHeight: '160px', overflowY: 'auto' } },
                                        ..._injWf.absent.map(function(d) {
                                            const rate = d.attendanceRate !== undefined ? d.attendanceRate : 0.85;
                                            const aColor = rate >= 0.88 ? '#10B981' : rate >= 0.70 ? '#F59E0B' : '#EF4444';
                                            const aLabel = rate >= 0.88 ? 'Regular' : rate >= 0.70 ? 'Occasional' : 'Rare';
                                            return h('div', { style: { fontSize: '13px', color: '#94A3B8', padding: '3px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                                                h('span', null, d.name),
                                                h('span', { style: { fontSize: '10px', color: aColor, fontWeight: 700 } }, aLabel),
                                            );
                                        })
                                    ),
                                ) : h('div', { style: { fontSize: '13px', color: '#10B981', padding: '8px 14px', background: '#06513422', border: '1px solid #10B98133', borderRadius: '7px' } },
                                    '✅ Full field expected — all ' + _injWf.starters.length + ' regulars present.'
                                ),
                            ) : null,
                            h('div', { className: 'modal-actions' },
                                mkBtn('Enter Results →', 'btn btn-danger', () => {
                                    closeModal();
                                    buildRaceModal({
                                        eyebrow: `${s.short} — Round ${race.round} (Injured — Sub: ${(G.playerInjury && G.playerInjury.subName) || 'Sub'})`,
                                        title: race.track,
                                        sub: `${race.city}, ${race.state}`,
                                        seriesId, raceIdx,
                                        qualNote: null,
                                        crewPkg: CREW_PACKAGES[0],
                                        expectedField,
                                        isFig8: false, isSpecial: false,
                                        playerNameOverride: (G.playerInjury && G.playerInjury.subName),
                                        onSubmit: (result) => {
                                            // sub gets the points and money, not us
                                            result._injuryRace = true;
                                            result._subName = (G.playerInjury && G.playerInjury.subName);
                                            // burn one race off the injury counter
                                            tickPlayerInjury(G);
                                            processRaceResult(G, seriesId, raceIdx, result);
                                            saveGame(); render();
                                        },
                                    });
                                }),
                            ),
                        ));
                        return;
                    }
                }

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
                        const _sched2 = G.schedules[seriesId] || [];
                        const _race2 = _sched2[raceIdx];
                        if (_race2 && _race2.result && _race2.result.summary) {
                            showSummaryToast(_race2.result.summary, (getSeries(seriesId) && getSeries(seriesId).color) || '#F59E0B', (getSeries(seriesId) && getSeries(seriesId).short) || '');
                        }
                        tryGenerateSummary(G, seriesId, raceIdx, result);
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
                            var _guests = _wf.guests || [];
                            if (!_guests.length) return null;
                            return h('div', { style: { background: '#0A0F1A', border: '1px solid #3B82F644', borderRadius: '8px', padding: '12px 14px', marginBottom: '14px' } },
                                h('div', { style: { fontSize: '11px', color: '#3B82F6', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: '10px' } }, '🔀 Crossover Entries This Week'),
                                h('div', { style: { display: 'flex', flexDirection: 'column', gap: '6px' } },
                                    ..._guests.map(function(d) {
                                        var rivalEntry = (G.rivals || []).find(function(r) { return r.name && d.name && r.name.toLowerCase() === d.name.toLowerCase(); });
                                        var rel = rivalEntry ? relationship(rivalEntry) : null;
                                        var hasRel = rel && rel !== 'acquaintance';
                                        var rc = hasRel ? (REL_COLOR[rel] || '#94A3B8') : '#3B82F6';
                                        var rl = hasRel ? (REL_LABEL[rel] || '') : null;
                                        var homeSeries = d.currentSeriesId ? (getSeries(d.currentSeriesId) && getSeries(d.currentSeriesId).short) || d.currentSeriesId : '?';
                                        var homeTier = d.currentSeriesId ? ((getSeries(d.currentSeriesId) && getSeries(d.currentSeriesId).tier) || 1) : 1;
                                        var thisTier = s ? s.tier : 1;
                                        var direction = homeTier > thisTier ? '⬇ Running down' : homeTier < thisTier ? '⬆ Running up' : '↔ Same tier';
                                        return h('div', {
                                            style: { display: 'flex', alignItems: 'center', gap: '8px', background: hasRel ? rc + '12' : '#0D1520', border: '1px solid ' + (hasRel ? rc + '44' : '#1E2D45'), borderRadius: '6px', padding: '7px 11px', cursor: 'pointer' },
                                            onClick: function() { closeModal(); openDriverProfileModal(d.name); }
                                        },
                                            h('div', { style: { flex: 1 } },
                                                h('div', { style: { display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' } },
                                                    h('span', { style: { fontSize: '14px', fontWeight: 700, color: hasRel ? rc : '#F9FAFB' } }, d.name),
                                                    rl ? h('span', { style: { fontSize: '10px', fontWeight: 800, color: rc, background: rc + '22', border: '1px solid ' + rc + '55', padding: '1px 6px', borderRadius: '3px', letterSpacing: '0.08em' } }, rl) : null,
                                                ),
                                                h('div', { style: { fontSize: '11px', color: '#64748B', marginTop: '2px' } },
                                                    h('span', { style: { color: '#3B82F6', fontWeight: 600 } }, homeSeries),
                                                    ' · ' + direction,
                                                    d.wins ? ' · ' + d.wins + (d.wins === 1 ? ' win' : ' wins') : '',
                                                ),
                                            ),
                                            h('span', { style: { fontSize: '11px', color: '#4B5563' } }, '→'),
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
                                var _startingDrivers = (_wf.homeStarters || _wf.starters || []).map(function(d) {
                                    return { name: d.name, skill: (d.aiStats && d.aiStats.relativeSkill) || d.skill || 70, _isRegular: true };
                                });
                                var _guestEntries = (_wf.guests || []).map(function(d) {
                                    return { name: d.name, skill: (d.aiStats && d.aiStats.relativeSkill) || d.skill || 70, _isGuest: true };
                                });
                                exportIRacingRoster(seriesId, _guestEntries.length ? _guestEntries : undefined, _startingDrivers);
                            }),
                            mkBtn('Cancel', 'btn btn-ghost', closeModal),
                            mkBtn('Race! →', 'btn btn-primary', () => { closeModal(); _doOpenEntry(); }),
                        ),
                    ));
                } catch(e) {
                    console.error('Pre-race briefing error:', e);
                    _doOpenEntry();
                }
            } catch (err) {
                console.error('openRaceModal error:', err);
                alert('Error in openRaceModal:\n' + err.message + '\n\n' + (err.stack || '').split('\n').slice(0, 3).join('\n'));
            }
        }

        function simulateRaceBackground(seriesId, raceIdx, isMidSeasonJoin) {
            /* sim engine for skipped races and mid-season joins - caller handles week increment */
            var sched = G.schedules[seriesId] || [];
            var race = sched[raceIdx];
            if (!race) return null;
            var s = getSeries(seriesId);
            // attendance-aware field size, same as live races
            // not all drivers show every week
            var wf = null;
            try { wf = getWeeklyField(seriesId, raceIdx); } catch(e) { wf = null; }
            var fieldDrivers = wf ? wf.starters : (G.drivers || []).filter(function(d) {
                return d.active && d.currentSeriesId === seriesId && !d.injuredOrPenalized;
            });
            if (!fieldDrivers.length) {
                return { skipped: true, simulated: true, position: 0, fieldSize: 0, dnf: false, dq: false, points: 0, prize: 0, finishOrder: [], summary: 'No field available.' };
            }
            // skill + noise = finish order
            var scored = fieldDrivers.map(function(d) {
                var skill = (d.aiStats && d.aiStats.relativeSkill) || d.skill || 50;
                var aggression = (d.aiStats && d.aiStats.aggression) || 60;
                var noise = randF(-15, 15);
                if (aggression > 70) noise += randF(-10, 10);
                return { driver: d, score: skill + noise };
            });
            scored.sort(function(a, b) { return b.score - a.score; });
            var fs = scored.length;
            // first pass - who finishes, who dnfs
            var withDnf = scored.map(function(entry) {
                var dnfChance = 0.04 + ((entry.driver.aiStats && entry.driver.aiStats.aggression || 60) > 75 ? 0.04 : 0);
                return { driver: entry.driver, dnf: Math.random() < dnfChance };
            });
            // dnfs go at the back
            var finishers = withDnf.filter(function(e) { return !e.dnf; });
            var dnfDrivers = withDnf.filter(function(e) { return e.dnf; });
            var finishOrder = finishers.map(function(entry, idx) {
                return { name: entry.driver.name, pos: idx + 1, dnf: false, isPlayer: false };
            }).concat(dnfDrivers.map(function(entry, idx) {
                return { name: entry.driver.name, pos: finishers.length + idx + 1, dnf: true, isPlayer: false };
            }));
            // update ai standings
            if (!G.seriesFields) G.seriesFields = {};
            if (!G.seriesFields[seriesId]) G.seriesFields[seriesId] = {};
            var field = G.seriesFields[seriesId];
            finishOrder.forEach(function(entry, idx) {
                if (!entry.name) return;
                var pts = entry.dnf ? 1 : (IRACING_PTS[idx] || 1);
                if (!field[entry.name]) field[entry.name] = { points: 0, wins: 0, top5s: 0, starts: 0 };
                field[entry.name].points += pts;
                field[entry.name].starts++;
                if (!entry.dnf && idx === 0) field[entry.name].wins++;
                if (!entry.dnf && idx < 5) field[entry.name].top5s++;
                var d = (G.drivers || []).find(function(x) { return x.name === entry.name; });
                if (d) {
                    d.starts = (d.starts || 0) + 1;
                    d.seasonPoints = (d.seasonPoints || 0) + pts;
                    if (!entry.dnf && idx === 0) { d.wins = (d.wins || 0) + 1; d.seasonWins = (d.seasonWins || 0) + 1; }
                }
            });
            var winner = finishOrder.find(function(e) { return !e.dnf; });
            var summaryText = isMidSeasonJoin
                ? 'Joined series mid-season. ' + (winner ? winner.name + ' won.' : 'Race simulated.')
                : 'You skipped this race. ' + (winner ? winner.name + ' won.' : 'Race simulated.');
            return {
                skipped: true,
                simulated: true,
                position: 0, fieldSize: fs,
                dnf: false, dq: false, points: 0, prize: 0,
                finishOrder: finishOrder,
                winner: winner ? winner.name : null,
                summary: summaryText,
            };
        }

        function simulateSkippedRace(seriesId, raceIdx) {
            var sched = G.schedules[seriesId] || [];
            var race = sched[raceIdx];
            if (!race || race.result) return;
            var s = getSeries(seriesId);
            var result = simulateRaceBackground(seriesId, raceIdx, false);
            race.result = result;
            // rival won - drama time
            if (result.winner) {
                var winnerRival = (G.rivals || []).find(function(r) {
                    return r.name === result.winner && ['rival', 'frenemy'].includes(relationship(r));
                });
                var desc = result.winner + ' took the win at ' + race.track + ' while you sat it out. ' +
                    (winnerRival ? 'Your rival collected the points. That\'s going to sting.' : 'The points moved without you. Make sure the next one counts.');
                G.dramaQueue.push({
                    id: 'skip_sim_' + uid(),
                    title: '🏁 You Missed: ' + race.track,
                    effect: 'none',
                    desc: desc,
                    valence: winnerRival ? 'bad' : 'neutral',
                });
            }
            G.week++;
            addLog(G, '⏭️ Skipped ' + (s ? s.short : seriesId) + ' R' + race.round + ' @ ' + race.track + ' — race simulated. ' + (result.winner ? result.winner + ' won.' : ''));
            saveGame(); render();
        }

        function openFig8BonusModal(seriesId, raceIdx) {
            const sched = G.schedules[seriesId] || [];
            const race = sched[raceIdx];
            buildRaceModal({
                eyebrow: '🔀 Figure-8 Bonus Race',
                title: race.track,
                sub: `${race.city}, ${race.state} · Season finale chaos`,
                seriesId, raceIdx, isFig8: true, isSpecial: false,
                onSubmit: (result) => {
                    result.isFig8Bonus = true;
                    processRaceResult(G, seriesId, raceIdx, result);
                    saveGame(); render();
                }
            });
        }

                function openSpecialInviteModal(evt, totalCost, pointsCount, isSupport, dramaId) {
            if (G.money < totalCost) { alert('Need ' + fmtMoney(totalCost - G.money) + ' more.'); return; }

            const briefLines = [
                evt.desc,
                isSupport ? 'You have a support race slot — not the headline event, but the crowd and exposure are real.' : null,
                totalCost > 0 ? 'Entry cost: ' + fmtMoney(totalCost) + '.' : 'Entry covered.',
                pointsCount ? 'Championship points apply.' : 'No championship points — but prize money and fans are real.',
                evt.multiClass ? 'Multi-class event — cars from other classes will be on track.' : null,
            ].filter(Boolean).join(' ');

            // mix real names and generated to fill the field
            var specialField = (G.drivers || []).filter(function(d) { return d.active && d.source === 'known'; });
            var fieldSize = Math.max(evt.laps ? 20 : 25, 20);
            var usedNames = new Set(specialField.map(function(d) { return d.name; }));
            while (specialField.length < fieldSize - 1) {
                var gn = generateAIName();
                if (!usedNames.has(gn)) { usedNames.add(gn); specialField.push({ name: gn }); }
            }
            shuffle(specialField);
            var expectedField = specialField.map(function(d) { return d.name; }).join('\n');

            openModal(h('div', null,
                h('div', { className: 'modal-eyebrow' }, '📬 Invitation'),
                h('div', { className: 'modal-title' }, evt.name),
                h('div', { className: 'modal-sub' }, evt.location + ' · ' + evt.track),
                h('div', {
                    style: {
                        background: '#060A10', border: '1px solid #1E2433', borderRadius: '8px',
                        padding: '14px 16px', marginBottom: '16px', fontSize: '14px',
                        color: '#CBD5E1', lineHeight: '1.7',
                    }
                }, briefLines),
                h('div', { style: { display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' } },
                    ...[
                        ['Car', evt.carType, '#F59E0B'],
                        ['Prize', fmtMoney(evt.prize || 0), '#10B981'],
                        ['Fan Gain', '+' + fmtFans(evt.fanGain || 0), '#EC4899'],
                        ['Entry', totalCost > 0 ? fmtMoney(totalCost) : 'Covered', totalCost > 0 ? '#EF4444' : '#10B981'],
                        ['Field', '~' + (fieldSize + 1) + ' cars', '#94A3B8'],
                    ].map(function(item) {
                        return h('div', {
                            style: { background: '#0B0F1A', border: '1px solid #1E2433', borderRadius: '7px', padding: '8px 12px', flex: 1, minWidth: '80px' }
                        },
                            h('div', { style: { fontSize: '11px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em' } }, item[0]),
                            h('div', { style: { fontSize: '15px', fontWeight: 800, color: item[2], marginTop: '2px' } }, item[1]),
                        );
                    })
                ),
                h('div', { className: 'modal-actions' },
                    mkBtn('Back Out', 'btn btn-ghost', closeModal),
                    mkBtn('📤 Roster → iRacing', 'btn btn-secondary', function() {
                        // use all known drivers for the export
                        var exportNames = specialField.map(function(d) { return d.name; });
                        exportIRacingRoster('mini_stock', exportNames.map(function(n) { return { name: n }; }));
                    }),
                    mkBtn('Race →', 'btn btn-primary', function() {
                        closeModal();
                        // committed, remove the invite
                        if (dramaId) {
                            var qi = G.dramaQueue.findIndex(function(x) { return x.id === dramaId; });
                            if (qi >= 0) G.dramaQueue.splice(qi, 1);
                        }
                        G.money -= totalCost;
                        buildRaceModal({
                            eyebrow: '📬 ' + (isSupport ? 'Support Race — ' : '') + evt.carType + (evt.multiClass ? ' · Multi-class' : '') + ' — Invitation',
                            title: evt.name + (isSupport ? ' Weekend' : ''),
                            sub: evt.location + ' · ' + (totalCost > 0 ? fmtMoney(totalCost) + ' entry' : 'Entry covered') + (pointsCount ? ' · Points count' : ' · No championship points') + (isSupport ? ' · Support feature' : ''),
                            seriesId: 'mini_stock', raceIdx: -1,
                            isFig8: !!evt.fig8, isSpecial: true, specialEvt: evt, multiClass: evt.multiClass,
                            expectedField: expectedField,
                            onSubmit: function(result) {
                                result._pointsOverride = pointsCount;
                                processSpecialResult(G, evt.id, result, totalCost);
                                saveGame(); render();
                            }
                        });
                    }),
                ),
            ));
        }

        function openSpecialModal(evtId) {
            const evt = SPECIAL_EVENTS.find(e => e.id === evtId);
            if (!evt) return;
            const hasSponsor = G.sponsors.some(sp => sp.international);
            const totalCost = hasSponsor ? evt.entryCost : evt.travelCost + evt.entryCost;
            if (G.money < totalCost) { alert(`Need ${fmtMoney(totalCost - G.money)} more.`); return; }
            // Build expected field from known drivers + generated fill
            var spField = (G.drivers || []).filter(function(d) { return d.active && d.source === 'known'; });
            var spSize = 24;
            var spUsed = new Set(spField.map(function(d) { return d.name; }));
            while (spField.length < spSize - 1) {
                var gn = generateAIName();
                if (!spUsed.has(gn)) { spUsed.add(gn); spField.push({ name: gn }); }
            }
            shuffle(spField);
            var expectedField = spField.map(function(d) { return d.name; }).join('\n');
            buildRaceModal({
                eyebrow: `🌍 ${evt.carType}${evt.multiClass ? ' · Multi-class' : ''}`,
                title: evt.name,
                sub: `${evt.location} · ${fmtMoney(totalCost)} total cost`,
                seriesId: 'mini_stock', raceIdx: -1,
                isFig8: !!evt.fig8, isSpecial: true, specialEvt: evt, multiClass: evt.multiClass,
                expectedField: expectedField,
                onSubmit: (result) => {
                    processSpecialResult(G, evtId, result, totalCost);
                    saveGame(); render();
                }
            });
        }

                //  TYPO NAME MATCHING
        function levenshtein(a, b) {
            const m = a.length, n = b.length;
            const dp = Array.from({ length: m + 1 }, function(_, i) {
                return Array.from({ length: n + 1 }, function(_, j) { return i === 0 ? j : j === 0 ? i : 0; });
            });
            for (let i = 1; i <= m; i++)
                for (let j = 1; j <= n; j++)
                    dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1]
                        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
            return dp[m][n];
        }

        function fuzzyMatchRoster(parsedNames, seriesId) {
            const normalizeName = function(n) { return n.replace(/\bJr\.\b/gi, 'Jr').replace(/\bSr\.\b/gi, 'Sr').toLowerCase(); };
            const roster = (G.drivers || []).filter(function(d) {
                return d.active && d.source === 'known';
            }).map(function(d) { return d.name; });
            if (!roster.length) return [];
            const warnings = [];
            parsedNames.forEach(function(name) {
                if (!name || name.length < 3) return;
                const nameLo = normalizeName(name);
                if (roster.some(function(r) { return normalizeName(r) === nameLo; })) return;
                // Find closest roster name within edit distance 2
                let bestDist = 99, bestMatch = null;
                roster.forEach(function(r) {
                    const dist = levenshtein(nameLo, normalizeName(r));
                    if (dist < bestDist) { bestDist = dist; bestMatch = r; }
                });
                if (bestDist <= 2 && bestMatch) {
                    warnings.push({ submitted: name, suggestion: bestMatch, distance: bestDist });
                }
            });
            return warnings;
        }

        function buildRaceModal({ eyebrow, title, sub, seriesId, raceIdx, qualNote, crewPkg, expectedField, isFig8, isSpecial, specialEvt, multiClass, forcedDNFReason, prefillResult, prefillOrder, playerNameOverride, onSubmit }) {
            const s = getSeries(seriesId);
            const sched = G.schedules[seriesId] || [];
            const race = raceIdx >= 0 ? sched[raceIdx] : null;
            const fieldSize = (race && race.fieldSize) || 20;

            // Declare repair hint up front so event listeners can reference it safely
            const repairHint = h('div', { style: { fontSize: '14px', color: '#94A3B8', marginTop: '5px', display: 'none' } });
            function updateRepairHint() {
                if (!dnfCb.checked) { repairHint.style.display = 'none'; return; }
                const ids = getDNFRepairs(dnfRIn.value.trim());
                const labels = ids.map(id => { const item = REPAIR_ITEMS.find(i => i.id === id); return item ? item.label : id; });
                repairHint.textContent = '🔧 Mandatory repairs: ' + labels.join(', ');
                repairHint.style.display = 'block';
            }

            const dnfCb = h('input', { type: 'checkbox' });
            const dnfRIn = h('input', { type: 'text', placeholder: 'e.g. "blown engine", "crash into wall", "rollover + fire", "flat tire"...', style: { width: '100%', display: 'none', marginTop: '6px' } });
            // Pre-fill for mechanical DNF
            if (forcedDNFReason) {
                dnfCb.checked = true;
                dnfRIn.value = forcedDNFReason;
                dnfRIn.style.display = 'block';
            }
            dnfCb.addEventListener('change', () => {
                dnfRIn.style.display = dnfCb.checked ? 'block' : 'none';
                if (dnfCb.checked) dqCb.checked = false;
                updateRepairHint();
                upd();
            });
            dnfRIn.addEventListener('input', updateRepairHint);

            const dqCb = h('input', { type: 'checkbox' });
            dqCb.addEventListener('change', () => {
                if (dqCb.checked) { dnfCb.checked = false; dnfRIn.style.display = 'none'; repairHint.style.display = 'none'; }
                upd();
            });

            const posIn = h('input', { type: 'number', min: 1, placeholder: 'e.g. 3', style: { width: '100%' } });
            const fsIn = h('input', { type: 'number', value: '20', style: { width: '100%' } });

            // Last Place checkbox. Locks position to field size, updates as field size changes
            const lastPlaceCb = h('input', { type: 'checkbox' });
            function applyLastPlace() {
                if (lastPlaceCb.checked) {
                    const fs = parseInt(fsIn.value) || 20;
                    posIn.value = String(fs);
                    posIn.disabled = true;
                    posIn.style.opacity = '0.5';
                } else {
                    posIn.disabled = false;
                    posIn.style.opacity = '1';
                }
                upd();
            }
            lastPlaceCb.addEventListener('change', applyLastPlace);
            // When field size changes and last place is checked, update position too
            fsIn.addEventListener('input', () => { if (lastPlaceCb.checked) posIn.value = String(parseInt(fsIn.value) || 20); upd(); });

            if (forcedDNFReason) {
                lastPlaceCb.checked = true;
                posIn.value = String(fieldSize);
                fsIn.value = String(fieldSize);
                posIn.disabled = true;
                posIn.style.opacity = '0.5';
            }
            //qualiyfing now longer tracked
            const qualPole = (race && race.qualifying && race.qualifying.pole) || false;
            const poleCb = h('input', { type: 'checkbox', disabled: true, checked: false });
            const lapsCb = h('input', { type: 'checkbox', disabled: true });
            const mostCb = h('input', { type: 'checkbox', disabled: true });

            // Finish order
            const orderTa = h('textarea', { rows: 8, placeholder: 'Paste iRacing results — online OR offline AI format:\n\nOnline: paste the full race results page (has R/D/C license letters)\nOffline: paste the results table (has Running / Led NL lines)\n\nOr type manually:\n1. John Smith\n2. Jane Doe DNF\nYou\n...\n\nAuto-parses on paste. Or click Parse & Clean.', style: { width: '100%', resize: 'vertical', fontFamily: 'inherit' } });

            // Pre-fill from a previous result (edit mode)
            if (prefillResult) {
                const pr = prefillResult;
                posIn.value = String(pr.position || '');
                fsIn.value = String(pr.fieldSize || 20);
                if (pr.dnf) {
                    dnfCb.checked = true;
                    dnfRIn.style.display = 'block';
                    dnfRIn.value = pr.dnfReason || '';
                    updateRepairHint();
                }
                if (pr.dq) {
                    dqCb.checked = true;
                }
                if (pr.pole && !qualPole) poleCb.checked = true;
                if (pr.lapsLed) lapsCb.checked = true;
                if (pr.mostLapsLed) mostCb.checked = true;
            }
            if (prefillOrder) {
                orderTa.value = prefillOrder;
            }

            // Auto-detect finish position from pasted text
            function autoDetectPosition() {
                const lines = orderTa.value.split(/\n/).map(l => l.trim()).filter(Boolean);
                if (!lines.length) return;
                // Only update field size if it hasn't already been set by the iRacing auto-parser
                // (detect by checking if textarea looks like clean parsed output vs raw iRacing dump)
                const isRawIRacing = lines.some(l => /^[RDCPBA]$/.test(l));
                if (!isRawIRacing && lines.length > 1) { fsIn.value = lines.length; }

                let playerLineIdx = -1;
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    let namePart;
                    if (line.includes('\t')) {
                        const cols = line.split('\t');
                        namePart = /^\d+$/.test(cols[0].trim()) ? (cols[1] || '') : cols[0];
                    } else {
                        namePart = line;
                    }
                    namePart = namePart.replace(/^\d{1,3}[\s.):\-]+/, '').replace(/\b(DNF|DQ|DSQ|DNS|NC)\b/gi, '').trim();
                    if (/\byou\b/i.test(namePart) || namePart.toLowerCase() === G.driverName.toLowerCase()) {
                        playerLineIdx = i;
                        break;
                    }
                }
                if (playerLineIdx >= 0) {
                    posIn.value = playerLineIdx + 1;
                    const playerLine = lines[playerLineIdx];
                    if (/\bDNF\b/i.test(playerLine) && !dqCb.checked) {
                        dnfCb.checked = true;
                        dnfRIn.style.display = 'block';
                        updateRepairHint();
                    } else if (/\bDQ\b|\bDSQ\b/i.test(playerLine) && !dnfCb.checked) {
                        dqCb.checked = true;
                    }
                    upd();
                }
            }

            function tryAutoParseIRacing() {
                const raw = orderTa.value;
                const lines = raw.split(/\n/).map(l => l.trim()).filter(Boolean);
                // Detect iRacing online format: has lone license letters R/D/C on their own lines
                const licenseLines = lines.filter(l => /^[RDCPBA]$/.test(l));
                // Detect iRacing offline format: has "Running" or "Disconnected" status lines
                // AND "Led NL" lines (characteristic of the offline results table)
                const hasRunning = lines.some(l => /^Running$|^Disqualified$|^Retired$|^Disconnected$/i.test(l));
                const hasLedLine = lines.some(l => /^Led \d+L$/i.test(l));
                const isOfflineFormat = hasRunning && hasLedLine;
                if (licenseLines.length < 2 && !isOfflineFormat) return; // not a recognised iRacing format
                // Auto-parse and rewrite textarea with clean output
                const parsed = parseRaceResults(raw, !!multiClass);
                if (parsed.length >= 2) {
                    orderTa.value = parsed.map(p => {
                        let line = p.name;
                        if (p.status && p.status !== 'null') line += ` ${p.status}`;
                        if (p.lapTime) line += `\t${p.lapTime}`;
                        if (p.gap) line += `\t${p.gap}`;
                        return line;
                    }).join('\n');
                    // Update field size to match actual parsed driver count
                    fsIn.value = String(parsed.length);
                    if (lastPlaceCb && lastPlaceCb.checked) posIn.value = String(parsed.length);
                    // Re-run position detection on the clean output
                    autoDetectPosition();
                }
            }

            orderTa.addEventListener('input', function() {
                autoDetectPosition();
                // Debounce fuzzy check so it doesn't fire on every keystroke
                clearTimeout(orderTa._fuzzyTimer);
                orderTa._fuzzyTimer = setTimeout(function() {
                    const names = orderTa.value.split('\n').map(function(l) {
                        return l.split(/\t/)[0].replace(/^\d+[\s.):-]+/, '').replace(/\b(DNF|DQ|DSQ|DNS)\b/gi, '').trim();
                    }).filter(Boolean);
                    runFuzzyCheck(names);
                }, 600);
            });
                        orderTa.addEventListener('paste', () => setTimeout(() => {
                tryAutoParseIRacing();
                autoDetectPosition();
                const names = orderTa.value.split('\n').map(function(l) {
                    return l.split(/\t/)[0].replace(/^\d+[\s.):-]+/, '').replace(/\b(DNF|DQ|DSQ|DNS)\b/gi, '').trim();
                }).filter(Boolean);
                runFuzzyCheck(names);
            }, 0));

            //  Incident drivers — chip typeahead
            // Chips track selected names; typeahead filters from race order + driver DB
            const incChips = [];   // array of name strings currently selected
            const incChipRow = h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '5px', minHeight: '28px', marginBottom: '6px' } });
            const incTypeIn = h('input', { type: 'text', placeholder: 'Name or car #…', style: { flex: 1, minWidth: '160px' } });
            const incDropdown = h('div', {
                style: {
                    position: 'absolute', zIndex: 600, background: '#131822', border: '1px solid #64748B',
                    borderRadius: '6px', maxHeight: '180px', overflowY: 'auto', width: '100%', display: 'none',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
                }
            });
            const incWrap = h('div', { style: { position: 'relative' } },
                h('div', {
                    style: {
                        display: 'flex', flexWrap: 'wrap', gap: '5px', alignItems: 'center',
                        background: '#131822', border: '1px solid #64748B', borderRadius: '6px',
                        padding: '5px 8px', cursor: 'text',
                    }
                }, incChipRow, incTypeIn),
                incDropdown,
            );

            // Pre-fill chips from a previous result (edit mode)
            if (prefillResult && (prefillResult.incidentDrivers || []).length) {
                prefillResult.incidentDrivers.forEach(name => {
                    if (!incChips.includes(name)) { incChips.push(name); renderChips(); }
                });
            }

            function renderChips() {
                incChipRow.innerHTML = '';
                incChips.forEach((name, idx) => {
                    incChipRow.appendChild(h('span', {
                        style: {
                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                            background: '#7F1D1D', color: '#FCA5A5', border: '1px solid #EF444466',
                            borderRadius: '4px', padding: '2px 7px', fontSize: '13px', fontWeight: 700,
                        }
                    },
                        name,
                        h('span', {
                            style: { cursor: 'pointer', marginLeft: '2px', fontSize: '14px', lineHeight: 1, color: '#FCA5A5' },
                            onClick: () => { incChips.splice(idx, 1); renderChips(); }
                        }, '×'),
                    ));
                });
            }

            function getIncidentCandidates() {
                // 1. Names already in the finish-order textarea (parsed live)
                const fromOrder = orderTa.value.split(/\n/).map(l => {
                    const parts = l.split(/\t/);
                    let raw = /^\d{1,3}[.):\s]*$/.test(parts[0].trim()) ? (parts[1] || '') : parts[0];
                    raw = raw.replace(/\b(DNF|DQ|DSQ|DNS|NC)\b/gi, '')
                        .replace(/\b\d{1,2}:\d{2}\.\d+\b/g, '')
                        .replace(/^\d{1,3}[\s.):\-]+/, '')
                        .replace(/\b\d+\b/g, '')
                        .replace(/[^\w\s'.-]/g, ' ')
                        .replace(/\s+/g, ' ').trim();
                    return raw;
                }).filter(n => n && n.length >= 4 && /^[A-Z]/.test(n) && /\s/.test(n));

                // 2. Known drivers from the database as fallback
                const fromDB = (G.drivers || [])
                    .filter(d => d.source === 'known' && d.name && d.name.length >= 4)
                    .map(d => d.name);

                // Merge, deduplicate, exclude already-selected and the player
                const all = [...new Set([...fromOrder, ...fromDB])];
                return all.filter(n =>
                    !incChips.includes(n) &&
                    n.toLowerCase() !== G.driverName.toLowerCase() &&
                    !/\byou\b/i.test(n)
                );
            }

            function renderDropdown(query) {
                incDropdown.innerHTML = '';
                if (!query.trim()) { incDropdown.style.display = 'none'; return; }
                const q = query.toLowerCase().trim();
                const isNumericQuery = /^\d+$/.test(q);
                const candidates = getIncidentCandidates();

                // Build a map of carNumber → name from the finish order textarea
                const carNumMap = {};
                orderTa.value.split(/\n/).forEach(function(l) {
                    const parts = l.split(/\t/);
                    const raw = parts[0].trim();
                    // Look for lines like "Name\t#65" or parse carNumber from parsed results
                    const name = raw.replace(/^[\d\s.):-]+/, '').replace(/\b(DNF|DQ|DSQ|DNS|NC)\b/gi, '').trim();
                    if (name.length >= 4 && /\s/.test(name)) {
                        const parsed2 = (window._lastParsedOrder || []);
                        const entry = parsed2.find(function(e) { return e.name && name.toLowerCase().includes(e.name.toLowerCase().split(' ')[0]); });
                        if (entry && entry.carNumber) carNumMap[entry.carNumber] = entry.name;
                    }
                });
                // Also pull from G.drivers carNumber
                (G.drivers || []).forEach(function(d) {
                    if (d.carNumber && d.name) carNumMap[String(d.carNumber)] = d.name;
                });

                var matches;
                if (isNumericQuery) {
                    // Search by car number 
                    const numMatch = carNumMap[q];
                    matches = candidates.filter(function(n) {
                        return (numMatch && n.toLowerCase().includes(numMatch.toLowerCase())) ||
                               String((G.drivers || []).find(function(d) { return d.name === n; }) && (G.drivers.find(function(d) { return d.name === n; })).carNumber) === q;
                    }).slice(0, 12);
                    // If no match in candidates, show the mapped name directly
                    if (!matches.length && numMatch && !incChips.includes(numMatch)) {
                        matches = [numMatch];
                    }
                } else {
                    matches = candidates.filter(function(n) { return n.toLowerCase().includes(q); }).slice(0, 12);
                }
                if (!matches.length) { incDropdown.style.display = 'none'; return; }
                matches.forEach(name => {
                    const item = h('div', {
                        style: {
                            padding: '8px 12px', cursor: 'pointer', fontSize: '14px', color: '#E2E8F0',
                            borderBottom: '1px solid #1E2433',
                        }
                    }, name);
                    item.addEventListener('mousedown', e => {
                        e.preventDefault(); // keep focus on input
                        if (!incChips.includes(name)) { incChips.push(name); renderChips(); }
                        incTypeIn.value = '';
                        incDropdown.style.display = 'none';
                    });
                    item.addEventListener('mouseover', () => item.style.background = '#1E2433');
                    item.addEventListener('mouseout', () => item.style.background = '');
                    incDropdown.appendChild(item);
                });
                incDropdown.style.display = 'block';
            }

            incTypeIn.addEventListener('input', () => renderDropdown(incTypeIn.value));
            incTypeIn.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    const val = incTypeIn.value.trim().replace(/,$/, '');
                    if (val.length >= 2 && !incChips.includes(val)) { incChips.push(val); renderChips(); }
                    incTypeIn.value = '';
                    incDropdown.style.display = 'none';
                }
                if (e.key === 'Backspace' && !incTypeIn.value && incChips.length) {
                    incChips.pop(); renderChips();
                }
                if (e.key === 'Escape') { incDropdown.style.display = 'none'; }
            });
            incTypeIn.addEventListener('blur', () => setTimeout(() => { incDropdown.style.display = 'none'; }, 150));
            incTypeIn.addEventListener('focus', () => { if (incTypeIn.value) renderDropdown(incTypeIn.value); });

            // Clicking the wrapper focuses the input
            incWrap.addEventListener('click', () => incTypeIn.focus());

            // Re-build dropdown candidates whenever the finish order textarea changes
            orderTa.addEventListener('input', () => { if (incTypeIn.value) renderDropdown(incTypeIn.value); });
            const preview = h('div', { className: 'modal-preview' });

            function upd() {
                const pos = parseInt(posIn.value) || 0, fs = parseInt(fsIn.value) || 20;
                preview.innerHTML = '';
                if (!pos) return;
                const dnf = dnfCb.checked;
                const dq = dqCb.checked;
                const prize = isFig8 ? 0 : isSpecial ? ((specialEvt && specialEvt.prize) || 0) : (dnf || dq) ? 0 : calcPrize(seriesId, pos, fs);
                const pts = (!isFig8 && !isSpecial && !dnf && !dq) ? calcPoints(seriesId, pos, poleCb.checked, lapsCb.checked, mostCb.checked) : 0;
                const items = [];
                if (!isFig8 && !isSpecial) items.push(['POINTS', pts, '#F59E0B']);
                items.push(['PRIZE', isFig8 ? '$50–600' : fmtMoney(prize), '#10B981']);
                items.push(['POSITION', `P${pos}/${fs}`, '#E5E7EB']);
                items.forEach(([l, v, c]) => preview.appendChild(h('div', null, h('div', { className: 'pv-lbl' }, l), h('div', { className: 'pv-val', style: { color: c } }, v))));
            }
            posIn.addEventListener('input', upd);
            // fsIn listener is handled by lastPlaceCb wiring above; add upd fallback for non-lastplace case
            fsIn.addEventListener('input', () => { if (!lastPlaceCb.checked) upd(); });
            [poleCb, lapsCb, mostCb, dnfCb].forEach(cb => cb.addEventListener('change', upd));

                        // Fuzzy warning banner — shown below textarea when typos detected
            const fuzzyWarnEl = h('div', {
                style: {
                    display: 'none', background: '#1a1000', border: '1px solid #F59E0B',
                    borderRadius: '7px', padding: '10px 14px', marginTop: '8px', fontSize: '13px',
                }
            });

            function runFuzzyCheck(names) {
                if (isFig8 || isSpecial) return;
                const warnings = fuzzyMatchRoster(names, seriesId);
                fuzzyWarnEl.innerHTML = '';
                if (!warnings.length) { fuzzyWarnEl.style.display = 'none'; return; }
                fuzzyWarnEl.style.display = 'block';
                fuzzyWarnEl.appendChild(h('div', {
                    style: { fontWeight: 800, color: '#F59E0B', marginBottom: '8px' }
                }, '⚠️ Possible typos detected — click to fix:'));
                warnings.forEach(function(w) {
                    const row = h('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' } },
                        h('span', { style: { color: '#EF4444', fontWeight: 700 } }, '"' + w.submitted + '"'),
                        h('span', { style: { color: '#94A3B8' } }, '→'),
                        h('span', { style: { color: '#10B981', fontWeight: 700 } }, '"' + w.suggestion + '"'),
                        mkBtn('Fix', 'btn btn-xs btn-primary', function() {
                            const re = new RegExp('\\b' + w.submitted.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'g');
                            orderTa.value = orderTa.value.replace(re, w.suggestion);
                            runFuzzyCheck(orderTa.value.split('\n').map(function(l) {
                                return l.split(/\t/)[0].replace(/^\d+[\s.):-]+/, '').replace(/\b(DNF|DQ|DSQ|DNS)\b/gi, '').trim();
                            }).filter(Boolean));
                        }),
                    );
                    fuzzyWarnEl.appendChild(row);
                });
            }

            // Parse & clean button
            const parseBtn = mkBtn('Parse & Clean', 'btn btn-sm btn-secondary', () => {
                const raw = orderTa.value;
                const parsed = parseRaceResults(raw, !!multiClass);
                if (parsed.length) {
                    orderTa.value = parsed.map(p => {
                        let line = p.name;
                        if (p.status && p.status !== 'null') line += ` ${p.status}`;
                        if (p.lapTime) line += `\t${p.lapTime}`;
                        if (p.gap) line += `\t${p.gap}`;
                        if (p.carClass) line += `\t[${p.carClass}]`;
                        return line;
                    }).join('\n');
                    fsIn.value = String(parsed.length);
                    if (lastPlaceCb && lastPlaceCb.checked) posIn.value = String(parsed.length);
                    autoDetectPosition();
                    // Run fuzzy check on parsed names
                    runFuzzyCheck(parsed.map(function(p) { return p.name; }));
                }
            });


            openModal(h('div', null,
                h('div', { className: 'modal-eyebrow' }, eyebrow),
                h('div', { className: 'modal-title' }, title),
                h('div', { className: 'modal-sub' }, sub),
                qualNote ? h('div', { style: { background: '#1a1a2e', borderRadius: '7px', padding: '9px 12px', marginBottom: '14px', fontSize: '14px', color: '#8B5CF6', fontWeight: 700 } }, `Qualified: ${qualNote}`) : null,
                forcedDNFReason ? h('div', { style: { background: '#1a0505', border: '1px solid #EF4444', borderRadius: '7px', padding: '10px 13px', marginBottom: '14px', fontSize: '14px', color: '#FCA5A5', fontWeight: 700 } },
                    `⚠️ Mechanical DNF (${forcedDNFReason}) — your result is locked as DNF. Enter the finish order so AI drivers score their points.`
                ) : null,

                h('div', { className: 'modal-section' },
                    h('div', { style: { display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '6px' } },
                        h('label', { className: 'checkbox-item' }, dnfCb, h('span', { style: { color: '#EF4444', fontSize: '14px' } }, 'Did Not Finish (DNF)')),
                        h('label', { className: 'checkbox-item' }, dqCb, h('span', { style: { color: '#F97316', fontSize: '14px' } }, 'Disqualified (DQ)')),
                    ),
                    dnfRIn,
                    repairHint,
                ),
                h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '8px' } },
                    h('div', null, h('label', { className: 'modal-label' }, forcedDNFReason ? 'Your Finish Position (Last Place)' : 'Your Finish Position *'), posIn),
                    h('div', null, h('label', { className: 'modal-label' }, 'Field Size'), fsIn),
                ),
                !forcedDNFReason ? h('div', { style: { marginBottom: '12px' } },
                    h('label', { className: 'checkbox-item', style: { fontSize: '14px' } },
                        lastPlaceCb,
                        h('span', { style: { color: '#94A3B8' } }, 'Finished last — set position to field size automatically'),
                    )
                ) : null,
                !isFig8 && qualPole ? h('div', { style: { fontSize: '14px', color: '#8B5CF6', padding: '4px 8px', background: '#1a1a2e', borderRadius: '5px', marginBottom: '8px' } },
                    '✓ Pole recorded in qualifying'
                ) : null,

                h('div', { className: 'modal-section' },
                    h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' } },
                        h('label', { className: 'modal-label', style: { margin: 0 } }, multiClass ? 'Finish Order (include car class in brackets)' : 'Finish Order — paste iRacing results'),
                        h('div', { style: { display: 'flex', gap: '6px' } },
                            parseBtn,
                        ),
                    ),
                                        orderTa,
                    fuzzyWarnEl,
                    h('div', { style: { fontSize: '14px', color: '#94A3B8', marginTop: '4px' } }, 'Names are remembered in the driver database.')
              ),

                !isFig8 ? h('div', { className: 'modal-section' },
                    h('label', { className: 'modal-label' }, 'Incident Drivers (caused incidents with you)'),
                    incWrap,
                    h('div', { style: { fontSize: '13px', color: '#64748B', marginTop: '4px' } }, 'Type to filter drivers from the finish order. Click to add. × to remove. Enter or comma confirms a typed name.'),
                ) : h('div', { style: { fontSize: '14px', color: '#94A3B8', marginBottom: '12px' } }, 'Figure-8 incidents are not tracked for rivalries.'),

                preview,

                h('div', { className: 'modal-actions' },
                    mkBtn('Cancel', 'btn btn-ghost', closeModal),
                    mkBtn(isFig8 ? '🔀 Submit Chaos' : isSpecial ? 'Submit Result' : 'Submit Result', isFig8 ? 'btn btn-chaos' : 'btn btn-success', () => {
                        const pos = parseInt(posIn.value) || 0;
                        if (!pos || pos < 1) { alert('Enter your finish position.'); return; }

                        // Final fuzzy gate — block submit if unresolved typo warnings exist
                        if (!isFig8 && !isSpecial && fuzzyWarnEl.style.display !== 'none') {
                            const stillWarning = fuzzyWarnEl.querySelectorAll('.btn');
                            if (stillWarning.length > 0) {
                                const go = confirm('⚠️ Possible name mismatches detected. Submit anyway?\n\nClick Cancel to go back and fix them first.');
                                if (!go) return;
                            }
                        }
                        const fs = parseInt(fsIn.value) || 20;
                        const dnf = dnfCb.checked;
                        const dq = dqCb.checked;

                        // Parse finish order from textarea — single unified path.
                        // Handles plain text ("John Smith", "1 John Smith", "1. John Smith DNF")
                        // AND iRacing tab-export which is: Position\tName\tLapTime\tGap[...\tClass]
                        const rawLines = orderTa.value.split(/\n/).map(l => l.trim()).filter(Boolean);
                        const finishOrder = [];
                        let parsedIdx = 0;
                        for (const line of rawLines) {
                            let rawName, lapTime = null, gap = null, carClass = null;

                            if (line.includes('\t')) {
                                // Tab-separated — figure out which column is the name.
                                // iRacing format: "1\tJohn Smith\t1:23.456\t+0.234"
                                // Post-"Parse & Clean" format: "John Smith\t1:23.456\t+0.234\t[GT3]"
                                const tabParts = line.split(/\t/);
                                // If first column is a pure number (or number+punctuation), it's a position — skip it
                                if (/^\d{1,3}[.):\s]*$/.test(tabParts[0].trim())) {
                                    // iRacing-style: col0=pos, col1=name, col2=laptime, col3=gap
                                    rawName = (tabParts[1] && tabParts[1].trim()) || '';
                                    lapTime = (tabParts[2] && tabParts[2].trim()) || null;
                                    gap = (tabParts[3] && tabParts[3].trim()) || null;
                                    carClass = (tabParts[4] && tabParts[4].replace(/[\[\]]/g, '').trim()) || null;
                                } else {
                                    // Already-cleaned style: col0=name, col1=laptime, col2=gap, col3=class
                                    rawName = tabParts[0].trim();
                                    lapTime = (tabParts[1] && tabParts[1].trim()) || null;
                                    gap = (tabParts[2] && tabParts[2].trim()) || null;
                                    carClass = (tabParts[3] && tabParts[3].replace(/[\[\]]/g, '').trim()) || null;
                                }
                            } else {
                                rawName = line;
                            }

                             // extract dnf/dq status before stripping
                            const statusM = rawName.match(/\b(DNF|DQ|DSQ|DNS|NC)\b/i);
                            const entryStatus = statusM ? statusM[1].toUpperCase() : null;

                             // strip everything that isnt the driver name
                            let name = rawName;
                            name = name.replace(/\b(DNF|DQ|DSQ|DNS|NC)\b/gi, ''); // status tokens
                            name = name.replace(/\bJr\.\b/gi, 'Jr'); // iRacing drops the dot on Jr.
                            name = name.replace(/\bSr\.\b/gi, 'Sr'); // same for Sr.
                            name = name.replace(/\b\d{1,2}:\d{2}\.\d{2,4}\b/g, ''); // lap times
                            name = name.replace(/[+-]\d+\.\d+s?/g, '');              // gap values
                            name = name.replace(/\biR\s*[\d,]+\b|\bSR\s*[\d.]+\b/gi, ''); // iRating/SR
                            name = name.replace(/\s#\d{1,3}\b|\s\(\d{1,3}\)/g, '');  // car numbers
                            name = name.replace(/^\d{1,3}[\s.):\-]+/, '');            // leading position number
                            name = name.replace(/\b\d+\b/g, '');                      // remaining standalone numbers
                            name = name.replace(/[^\w\s'.-]/g, ' ');                  // odd punctuation
                            name = name.replace(/\s+/g, ' ').trim();

                            // Skip if nothing useful remains
                            if (!name || name.length < 2 || /^\d+$/.test(name)) continue;

                            // Also skip if lapTime/gap ended up in name column (means columns still wrong)
                            if (/^\d{1,2}:\d{2}/.test(name) || /^[+-]\d/.test(name)) continue;

                            const isPlayer = /\byou\b/i.test(name) || name.toLowerCase() === G.driverName.toLowerCase() || (playerNameOverride && name.toLowerCase() === playerNameOverride.toLowerCase());
                            // If injured, swap player name for sub name in the finish order
                            if (playerNameOverride && (name.toLowerCase() === G.driverName.toLowerCase() || /\byou\b/i.test(name))) {
                                name = playerNameOverride;
                            }
                            finishOrder.push({ pos: parsedIdx + 1, name, lapTime, gap, carClass, status: entryStatus, dnf: entryStatus === 'DNF', dq: entryStatus === 'DQ' || entryStatus === 'DSQ', isPlayer });
                            parsedIdx++;
                        }



                        // Detect close finishes from lap times
                        const playerEntry = finishOrder.find(e => e.isPlayer || /\byou\b/i.test(e.name) || e.name.toLowerCase() === G.driverName.toLowerCase());
                        if (playerEntry) playerEntry.isPlayer = true;
                        const closeFinishes = detectCloseFinishes(finishOrder);

                        const prize = isFig8 ? rand(pos === 1 ? 300 : 50, pos === 1 ? 600 : 250) : isSpecial ? ((specialEvt && specialEvt.prize) || 0) : (dnf || dq) ? 0 : calcPrize(seriesId, pos, fs);
                        // Pole point: only count from race modal checkbox if qualifying didn't already record it
                        const poleFromRaceModal = poleCb.checked && !qualPole;
                        const pts = (!isFig8 && !isSpecial && !dnf && !dq) ? calcPoints(seriesId, pos, poleFromRaceModal, lapsCb.checked, mostCb.checked) : 0;
                        const incArr = incChips.slice();

                        const result = {
                            position: pos, fieldSize: fs, dnf, dq, dnfReason: dnfRIn.value.trim(),
                            prize, points: pts,
                            pole: qualPole || poleCb.checked,  // true if pole was recorded either way
                            lapsLed: lapsCb.checked, mostLapsLed: mostCb.checked,
                            finishOrder, incidentDrivers: incArr,
                            closeFinishes,
                            qualPosition: (race && race.qualifying && race.qualifying.position) || null,
                        };
                        closeModal();

                        // DQ: no repairs, but random fine based on series tier
                        if (dq && !isFig8 && !isSpecial) {
                            const s2 = getSeries(seriesId);
                            const tier = s2 ? s2.tier : 1;
                            // ~40% chance of a fine for DQ
                            if (Math.random() < 0.40) {
                                const fineBase = [500, 1200, 3000, 8000, 20000, 35000, 50000][tier - 1] || 500;
                                const fine = Math.floor(fineBase * (0.7 + Math.random() * 0.6));
                                G.money -= fine;
                                addLog(G, `🚫 DQ @ ${(race && race.track) || 'race'}: Fined ${fmtMoney(fine)} by ${(s2 && s2.short) || 'series'} officials.`);
                                G.dramaQueue.push({
                                    id: 'dq_fine_' + Date.now(), title: `DQ Fine — ${fmtMoney(fine)} Deducted`, effect: 'none',
                                    desc: `${(s2 && s2.short) || 'series'} officials fined you ${fmtMoney(fine)} following the disqualification at ${(race && race.track) || 'this race'}. The money has already been taken from your account.`
                                });
                            }
                            onSubmit(result);
                            maybeFireCalendarEvent();
                            saveGame(); render();
                            return;
                        }

                        // Normal race or DNF — onSubmit first (stores result), then repair modal
                        if (!isFig8 && !isSpecial) {
                            onSubmit(result);
                            const _raceSnap = (G.schedules[seriesId] || [])[raceIdx];
                            const _condId = (_raceSnap && _raceSnap.condition) || 'clear';
                            result.condition = _condId;
                            setTimeout(function () {
                                openRepairModal(seriesId, result, () => {
                                    maybeFireCalendarEvent();
                                    saveGame(); render();
                                    // Show summary toast AFTER repair modal closes so it isn't buried
                                    const _r3 = (G.schedules[seriesId] || [])[raceIdx];
                                    if (_r3 && _r3.result && _r3.result.summary) {
                                        showSummaryToast(_r3.result.summary, (getSeries(seriesId) && getSeries(seriesId).color) || '#F59E0B', (getSeries(seriesId) && getSeries(seriesId).short) || '');
                                    }
                                });
                            }, 50);
                        } else {
                            onSubmit(result);
                            saveGame(); render();
                        }
                    })
                )
            ));
        }

        // race history modal
        function openRaceHistoryModal(seriesId, raceIdx) {
            const sched = G.schedules[seriesId] || [];
            const race = sched[raceIdx];
            if (!race || !race.result) return;
            const s = getSeries(seriesId);
            const result = race.result;
           const isDQ = result.dq || false;
            const pc = isDQ ? '#F97316' : result.dnf ? '#EF4444' : result.position === 1 ? '#F59E0B' : result.position <= 5 ? '#10B981' : '#94A3B8';
            const resultLabel = isDQ ? 'DQ' : result.dnf ? 'DNF' : `P${result.position}`;
            // SDK flags data — attached when result was imported from bridge
            const sdkFlags = race._sdkFlags || result._sdkFlags || null;

            const content = h('div', null,
                h('div', { className: 'modal-eyebrow' }, `${s.short} — Round ${race.round}`),
                h('div', { className: 'modal-title' }, race.track),
                h('div', { className: 'modal-sub' }, `${race.city}, ${race.state}` + (race.raceLaps ? ` · ${race.raceLaps} laps` : '')),

                // Mad-libs summary block (if present)
                result.summary ? h('div', {
                    style: {
                        background: '#080C14', border: `1px solid ${s.color}33`,
                        borderRadius: '8px', padding: '13px 16px', marginBottom: '18px',
                        borderLeft: `3px solid ${s.color}`,
                    }
                },
                    h('div', { style: { fontSize: '10px', color: s.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '6px' } }, `📰 ${s.short} Report`),
                    h('div', { style: { fontSize: '14px', color: '#D1D5DB', lineHeight: '1.7', fontStyle: 'italic' } }, result.summary),
                ) : null,

                h('div', { style: { display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' } },
                    h('div', { style: { fontSize: '56px', fontWeight: 900, color: pc, lineHeight: 1 } }, resultLabel),
                    h('div', null,
                        h('div', { style: { fontSize: '14px', color: '#94A3B8', marginBottom: '4px' } }, `${result.fieldSize}-car field`),
                        race.qualifying ? h('div', { style: { fontSize: '14px', color: '#8B5CF6' } }, `Qualified P${race.qualifying.position}${race.qualifying.pole ? ' (POLE)' : ''}`) : '',
                        result.pole ? h('div', { style: { fontSize: '14px', color: '#8B5CF6' } }, 'Won Pole') : null,
                        result.lapsLed ? h('div', { style: { fontSize: '14px', color: '#F59E0B' } }, `Led laps${result.mostLapsLed ? ' (most)' : ''}`) : '',
                        result.dnf ? h('div', { style: { fontSize: '14px', color: '#EF4444' } }, result.dnfReason || 'DNF') : null,
                        isDQ ? h('div', { style: { fontSize: '14px', color: '#F97316' } }, 'Disqualified') : null,
                    ),
                    h('div', { style: { marginLeft: 'auto', textAlign: 'right' } },
                        h('div', { style: { fontSize: '12px', color: '#94A3B8' } }, 'POINTS'), h('div', { style: { fontSize: '22px', fontWeight: 900, color: '#F59E0B' } }, result.points || 0),
                        h('div', { style: { fontSize: '12px', color: '#94A3B8', marginTop: '6px' } }, 'PRIZE'), h('div', { style: { fontSize: '22px', fontWeight: 900, color: '#10B981' } }, fmtMoney(result.prize || 0)),
                    )
                ),

                // Close finishes
                (result.closeFinishes || []).length > 0 ? h('div', { style: { background: '#1a1000', border: '1px solid #D97706', borderRadius: '8px', padding: '10px 14px', marginBottom: '14px' } },
                    h('div', { style: { fontSize: '14px', color: '#F59E0B', fontWeight: 700, marginBottom: '4px' } }, `🔥 ${result.closeFinishes.length} Close Finish${result.closeFinishes.length > 1 ? 'es' : ''} (within 0.05s)`),
                    ...result.closeFinishes.map(cf => h('div', { style: { fontSize: '14px', color: '#D1D5DB' } }, `${cf.name} — ${cf.gap}s gap`))
                ) : null,

                // Finish order table
                (result.finishOrder || []).length > 0 ? h('div', null,
                    h('div', { className: 'card-title', style: { marginBottom: '8px' } }, 'RACE RESULTS'),
                    (() => {
                        // Find the overall fastest lap for the pink highlight
                        const allTimes = (result.finishOrder || [])
                            .map(e => ({ name: e.name, sec: lapTimeToSeconds(e.lapTime) }))
                            .filter(e => e.sec !== null);
                        const fastestSec = allTimes.length ? Math.min(...allTimes.map(e => e.sec)) : null;

                        return h('table', { className: 'race-hist-table', style: { fontSize: '14px' } },
                            h('tr', null,
                                h('th', null, 'Pos'),
                                h('th', null, 'Driver'),
                                h('th', null, 'Interval'),
                                h('th', null, 'Fastest Lap'),
                                (result.finishOrder[0] && result.finishOrder[0].carClass) ? h('th', null, 'Class') : null,
                            ),
                            ...result.finishOrder.map((entry, i) => {
                                const isFastest = fastestSec !== null && lapTimeToSeconds(entry.lapTime) === fastestSec;
                                const lapColor = isFastest ? '#EC4899' : '#94A3B8';
                                const isTm = !entry.isPlayer && (G.teammates || []).some(t => t.name.toLowerCase() === entry.name.toLowerCase());
                                const entryRival = !entry.isPlayer ? (G.rivals || []).find(r => r.name.toLowerCase() === entry.name.toLowerCase()) : null;
                                const entryRel = entryRival ? relationship(entryRival) : null;
                                let entryRelBadge = null;
                                if (isTm) {
                                    const c = entryRel ? REL_COLOR[entryRel] || '#3B82F6' : '#3B82F6';
                                    const l = entryRel && entryRel !== 'acquaintance' ? `TEAM · ${REL_LABEL[entryRel] || entryRel}` : 'TEAM';
                                    entryRelBadge = h('span', { style: { fontSize: '10px', color: c, marginLeft: '5px', fontWeight: 700, background: c + '22', border: `1px solid ${c}44`, padding: '1px 4px', borderRadius: '3px' } }, l);
                                } else if (entryRel && entryRel !== 'acquaintance') {
                                    entryRelBadge = h('span', { style: { fontSize: '10px', color: REL_COLOR[entryRel], marginLeft: '5px', fontWeight: 700, background: REL_COLOR[entryRel] + '22', border: `1px solid ${REL_COLOR[entryRel]}44`, padding: '1px 4px', borderRadius: '3px' } }, REL_LABEL[entryRel]);
                                }
                                var _entryDNF = entry.dnf || entry.status === 'DNF';
                                var _entryDQ  = entry.dq  || entry.status === 'DQ' || entry.status === 'DSQ';
                                var _posColor = _entryDNF ? '#EF4444' : _entryDQ ? '#F97316' : i === 0 ? '#F59E0B' : i <= 2 ? '#CBD5E1' : '#94A3B8';
                                var _posLabel = _entryDNF ? 'DNF' : _entryDQ ? 'DQ' : String(i + 1);
                                return h('tr', { style: { background: entry.isPlayer ? 'rgba(245,158,11,0.1)' : _entryDNF ? 'rgba(239,68,68,0.05)' : '' } },
                                    h('td', { style: { fontWeight: entry.isPlayer ? 800 : 400, color: _posColor } }, _posLabel),
                                    h('td', {
                                        style: { fontWeight: entry.isPlayer ? 800 : 400, color: entry.isPlayer ? '#F59E0B' : '#D1D5DB', cursor: entry.isPlayer ? 'default' : 'pointer' },
                                        onClick: entry.isPlayer ? null : function () { openDriverProfileModal(entry.name); }
                                    },
                                        entry.name,
                                        entry.isPlayer ? h('span', { style: { fontSize: '10px', color: '#F59E0B', marginLeft: '5px' } }, 'YOU') : null,
                                        entryRelBadge,
                                    ),

                                    h('td', { style: { color: _entryDNF ? '#EF4444' : '#94A3B8' } }, _entryDNF ? 'DNF' : entry.gap || '—'),
                                    h('td', { style: { color: lapColor, fontWeight: isFastest ? 700 : 400 } },
                                        entry.lapTime || '—',
                                        isFastest ? h('span', { style: { fontSize: '10px', color: '#EC4899', marginLeft: '4px' } }, '⬤') : null,
                                    ),
                                    entry.carClass ? h('td', null, badge(entry.carClass, '#94A3B8')) : null,
                                );
                            })
                        );
                    })()
                ) : h('div', { style: { fontSize: '14px', color: '#94A3B8', fontStyle: 'italic' } }, 'No finish order recorded for this race.'),

                // Incidents
                (result.incidentDrivers || []).length > 0 ? h('div', { style: { marginTop: '12px' } },
                    h('div', { style: { fontSize: '14px', color: '#EF4444', fontWeight: 700, marginBottom: '4px' } }, 'INCIDENT DRIVERS'),
                    h('div', { style: { display: 'flex', gap: '6px', flexWrap: 'wrap' } }, ...result.incidentDrivers.map(name => badge(name, '#EF4444')))
                ) : null,

                // Player callout section — call out incident drivers or rivals from this race
                (() => {
                    const incDrivers = result.incidentDrivers || [];
                    const rivals = (G.rivals || []).filter(r => ['rival', 'frenemy'].includes(relationship(r)));
                    const closeDrivers = (result.closeFinishes || []).map(c => c.name);
                    const calloutTargets = [...new Set([...incDrivers, ...rivals.map(r => r.name), ...closeDrivers])]
                        .filter(n => n && n.toLowerCase() !== G.driverName.toLowerCase());
                    if (!calloutTargets.length) return null;
                    return h('div', { style: { marginTop: '14px', padding: '12px', background: '#060A10', border: '1px solid #1E2433', borderRadius: '8px' } },
                        h('div', { style: { fontSize: '12px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700, marginBottom: '8px' } }, 'Say Something Publicly'),
                        h('div', { style: { display: 'flex', gap: '6px', flexWrap: 'wrap' } },
                            ...calloutTargets.slice(0, 5).map(name => {
                                const isInc = incDrivers.includes(name);
                                const isClose = closeDrivers.includes(name);
                                const defaultType = isInc ? 'incident' : 'close';
                                return h('button', {
                                    className: `btn btn-xs ${isInc ? 'btn-danger' : isClose ? 'btn-success' : 'btn-ghost'}`,
                                    onClick: () => {
                                        openModal(h('div', null,
                                            h('div', { className: 'modal-eyebrow' }, `Say something about ${name}`),
                                            h('div', { className: 'modal-title' }, 'Pick Your Angle'),
                                            h('div', { style: { fontSize: '14px', color: '#94A3B8', marginBottom: '16px' } }, 'You can start beef, give props, or anything in between. Your call.'),
                                            h('div', { style: { display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' } },
                                                h('button', { className: 'btn btn-danger', onClick: () => openPlayerCalloutModal(name, 'incident', race.track) }, '🔥 Call Them Out'),
                                                h('button', { className: 'btn btn-success', onClick: () => openPlayerCalloutModal(name, 'close', race.track) }, '🤝 Give Props'),
                                                mkBtn('Never mind', 'btn btn-ghost', closeModal),
                                            ),
                                        ));
                                    }
                                }, `${isInc ? '🔥' : isClose ? '🤝' : '💬'} ${name}`);
                            })
                        )
                    );
                })(),

                // SDK flags summary — only shows when result was imported from bridge
                sdkFlags ? h('div', {
                    style: { background: '#060A10', border: '1px solid #1E2433', borderRadius: '8px', padding: '12px 14px', marginTop: '14px' }
                },
                    h('div', { style: { fontSize: '11px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: '8px' } }, '🚩 Race Flags — iRacing SDK'),
                    h('div', { style: { display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: sdkFlags.black_flags && sdkFlags.black_flags.length ? '10px' : '0' } },
                        h('div', null,
                            h('div', { style: { fontSize: '11px', color: '#64748B' } }, 'CAUTIONS'),
                            h('div', { style: { fontSize: '20px', fontWeight: 900, color: '#F59E0B' } }, String(sdkFlags.yellow_count || 0)),
                        ),
                        h('div', null,
                            h('div', { style: { fontSize: '11px', color: '#64748B' } }, 'BLACK FLAGS'),
                            h('div', { style: { fontSize: '20px', fontWeight: 900, color: '#EF4444' } }, String(sdkFlags.black_flag_count || 0)),
                        ),
                        sdkFlags.player_kerb_hits ? h('div', null,
                            h('div', { style: { fontSize: '11px', color: '#64748B' } }, 'KERB HITS'),
                            h('div', { style: { fontSize: '20px', fontWeight: 900, color: '#F97316' } }, String(sdkFlags.player_kerb_hits)),
                        ) : null,
                        sdkFlags.player_penalised ? h('div', null,
                            h('div', { style: { fontSize: '11px', color: '#EF4444', fontWeight: 700 } }, '⚠️ YOU WERE PENALISED'),
                        ) : null,
                    ),
                    sdkFlags.black_flags && sdkFlags.black_flags.length ? h('div', null,
                        ...sdkFlags.black_flags.map(function(bf) {
                            return h('div', { style: { fontSize: '12px', color: bf.is_player ? '#FCA5A5' : '#94A3B8', padding: '3px 0', borderTop: '1px solid #0D1117' } },
                                h('span', { style: { color: '#EF4444', marginRight: '6px' } }, '🚩'),
                                '#' + bf.car + ' ' + bf.driver + ' — ' + bf.reason + ' (' + bf.penalty_seconds + 's)',
                            );
                        })
                    ) : null,
                    sdkFlags.yellows && sdkFlags.yellows.length ? h('div', { style: { marginTop: '8px' } },
                        ...sdkFlags.yellows.map(function(y) {
                            return h('div', { style: { fontSize: '12px', color: '#94A3B8', padding: '2px 0' } },
                                h('span', { style: { color: '#F59E0B', marginRight: '6px' } }, '🟡'),
                                'Lap ' + y.lap + ' — ' + y.reason,
                            );
                        })
                    ) : null,
                ) : null,

                h('div', { className: 'modal-actions' },
                    mkBtn('✏️ Edit Result', 'btn btn-warn', () => openEditRaceResultModal(seriesId, raceIdx)),
                    mkBtn('Close', 'btn btn-ghost', closeModal),
                ),
            );
            openModal(content);
        }