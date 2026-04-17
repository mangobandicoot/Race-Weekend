// schedule
        function openPreseasonModal() {
            G._preseasonSeen = G.season;
            saveGame();

            var repTier = getRepTier(G.reputation);
            var contract = G.contracts[0];
            var s = contract ? getSeries(contract.seriesId) : null;
            var sched = contract ? (G.schedules[contract.seriesId] || []) : [];
            var goals = (G.seasonGoals || []).filter(function (g) { return g.status === 'active'; });
            var rivals = (G.rivals || []).filter(function (r) {
                var rel = relationship(r);
                return rel === 'rival' || rel === 'frenemy' || rel === 'racing_rival';
            }).slice(0, 4);
            var friends = (G.rivals || []).filter(function (r) {
                return relationship(r) === 'friend';
            }).slice(0, 2);

            openModal(h('div', null,
                h('div', { className: 'modal-eyebrow' }, 'Season ' + G.season + ' — Preseason'),
                h('div', { className: 'modal-title', style: { fontSize: '24px', fontWeight: 900, color: '#F59E0B' } }, 'Welcome Back'),
                h('div', { style: { fontSize: '14px', color: '#94A3B8', marginBottom: '20px' } },
                    'Season ' + G.season + ' is about to begin. Here\'s where things stand.'
                ),

                // rep tier
                h('div', { style: { background: '#060A10', border: '1px solid ' + repTier.color + '44', borderRadius: '8px', padding: '12px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px' } },
                    h('span', { style: { fontSize: '28px' } }, repTier.icon),
                    h('div', null,
                        h('div', { style: { fontSize: '12px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em' } }, 'Your Standing'),
                        h('div', { style: { fontSize: '18px', fontWeight: 900, color: repTier.color } }, repTier.label),
                        h('div', { style: { fontSize: '13px', color: '#64748B' } }, G.reputation + ' reputation · ' + fmtFans(G.fans) + ' fans'),
                    ),
                ),

                // contract summary
                contract && s ? h('div', { style: { background: '#060A10', border: '1px solid ' + s.color + '33', borderRadius: '8px', padding: '12px', marginBottom: '12px' } },
                    h('div', { style: { fontSize: '11px', color: s.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' } }, 'This Season'),
                    h('div', { style: { fontSize: '16px', fontWeight: 800, color: '#F9FAFB', marginBottom: '4px' } }, s.name),
                    h('div', { style: { fontSize: '14px', color: '#94A3B8' } }, (contract.noContractRequired ? 'Open Entry' : contract.team) + ' · ' + sched.length + ' races · ' + Math.round((contract.prizeShare || 0.7) * 100) + '% prize share'),
                    h('div', { style: { fontSize: '14px', color: '#94A3B8', marginTop: '2px' } }, 'Win bonus: ' + fmtMoney(contract.winBonus) + ' · Entry fee: ' + fmtMoney(contract.entryFee || s.fee) + '/race'),
                ) : null,

                // preview first 5
                sched.length ? h('div', { style: { background: '#060A10', border: '1px solid #1E2433', borderRadius: '8px', padding: '12px', marginBottom: '12px' } },
                    h('div', { style: { fontSize: '11px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' } }, 'Schedule — ' + sched.length + ' Races'),
                    h('div', { style: { display: 'flex', flexDirection: 'column', gap: '4px' } },
                        ...sched.slice(0, 5).map(function (race, i) {
                            var isHome = race.state && G.homeState && race.state === G.homeState;
                            return h('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '3px 0', borderBottom: '1px solid #0D1117' } },
                                h('span', { style: { color: '#94A3B8' } }, 'R' + (i + 1)),
                                h('span', { style: { color: '#F9FAFB', flex: 1, marginLeft: '10px' } }, race.track,
                                    isHome ? h('span', { style: { color: '#F59E0B', marginLeft: '6px', fontSize: '11px' } }, '🏠') : null
                                ),
                                h('span', { style: { color: '#64748B' } }, race.city + ', ' + race.state),
                            );
                        }),
                        sched.length > 5 ? h('div', { style: { fontSize: '12px', color: '#64748B', marginTop: '4px' } },
                            '+ ' + (sched.length - 5) + ' more races...'
                        ) : null,
                    ),
                ) : null,

                // goals
                goals.length ? h('div', { style: { background: '#060A10', border: '1px solid #1E2433', borderRadius: '8px', padding: '12px', marginBottom: '12px' } },
                    h('div', { style: { fontSize: '11px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' } }, 'Season Goals'),
                    ...goals.map(function (goal) {
                        var typeColor = goal.type === 'fan_promise' ? '#EC4899' : goal.type === 'sponsor' ? '#10B981' : '#8B5CF6';
                        return h('div', { style: { fontSize: '13px', color: '#E2E8F0', padding: '4px 0', borderBottom: '1px solid #0D1117', display: 'flex', gap: '8px', alignItems: 'flex-start' } },
                            h('span', { style: { color: typeColor, fontWeight: 700, fontSize: '11px', flexShrink: 0, marginTop: '2px' } },
                                goal.type === 'fan_promise' ? '🤝' : goal.type === 'sponsor' ? '💰' : '⭐'
                            ),
                            h('span', null, goal.desc.split('.')[0] + '.'),
                        );
                    }),
                ) : null,

                // rivals and friends
                (rivals.length || friends.length) ? h('div', { style: { background: '#060A10', border: '1px solid #1E2433', borderRadius: '8px', padding: '12px', marginBottom: '12px' } },
                    h('div', { style: { fontSize: '11px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' } }, 'People to Watch'),
                    h('div', { style: { display: 'flex', gap: '6px', flexWrap: 'wrap' } },
                        ...rivals.map(function (r) {
                            var rel = relationship(r);
                            var col = REL_COLOR[rel] || '#EF4444';
                            return h('div', { style: { fontSize: '13px', background: col + '18', border: '1px solid ' + col + '44', borderRadius: '6px', padding: '4px 10px', color: col, fontWeight: 700 } },
                                r.name + ' · ' + (REL_LABEL[rel] || rel)
                            );
                        }),
                        ...friends.map(function (r) {
                            return h('div', { style: { fontSize: '13px', background: '#10B98118', border: '1px solid #10B98144', borderRadius: '6px', padding: '4px 10px', color: '#10B981', fontWeight: 700 } },
                                r.name + ' · ' + REL_LABEL[relationship(r)]
                            );
                        }),
                    ),
                ) : null,

                h('div', { className: 'modal-actions' },
                    mkBtn('Let\'s Race →', 'btn btn-lg btn-primary', function () { closeModal(); }),
                ),
            ));
        }


        function renderSchedule() {
            // preseason modal once per season
            if (G.week === 1 && G.contracts.length && (!G._preseasonSeen || G._preseasonSeen < G.season)) {
                setTimeout(function () { openPreseasonModal(); }, 100);
            }
            const f = document.createDocumentFragment();
            f.appendChild(h('div', { className: 'page-title' }, 'Race Schedule'));

            // no contracts - push them to sign
            if (!G.contracts || G.contracts.length === 0) {
                f.appendChild(h('div', { className: 'card', style: { textAlign: 'center', padding: '32px 20px' } },
                    h('div', { style: { fontSize: '36px', marginBottom: '12px' } }, '📋'),
                    h('div', { style: { fontSize: '20px', fontWeight: 900, color: '#F9FAFB', marginBottom: '8px' } }, 'No Contract for Season ' + G.season),
                    h('div', { style: { fontSize: '14px', color: '#94A3B8', marginBottom: '20px', lineHeight: '1.7', maxWidth: '340px', margin: '0 auto 20px' } },
                        'Your schedule is empty because you haven\'t signed a contract yet. Head to Contracts to sign with a team, run independent, or pick up a new series.'
                    ),
                    mkBtn('Go to Contracts →', 'btn btn-lg btn-primary', function() {
                        G._activeTab = 'contracts';
                        render();
                    }),
                ));
                const page = document.getElementById('content');
                if (page) { while (page.firstChild) page.removeChild(page.firstChild); page.appendChild(f); }
                return f;
            }

                        const _lastCompletedSeries = (function() {
                let best = null;
                G.contracts.forEach(function(c) {
                    const sch = G.schedules[c.seriesId] || [];
                    for (let i = sch.length - 1; i >= 0; i--) {
                        if (sch[i].result && !sch[i].result.skipped) {
                            if (!best || (sch[i].result._submitTime || 0) > (best.race.result._submitTime || 0)) {
                                best = { seriesId: c.seriesId, raceIdx: i, race: sch[i], s: getSeries(c.seriesId) };
                            }
                        }
                    }
                });
                return best;
            })();

            f.appendChild(h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' } },
                h('div', { className: 'page-sub', style: { margin: 0 } }, 'Click any completed race for details.'),
                mkBtn('⊟ Collapse All', 'btn btn-xs btn-secondary', function() {
                    G.contracts.forEach(function(c) { var cs = getSeries(c.seriesId); if (cs && !cs.isSideStep) _collapsed['sched_' + c.seriesId] = true; });
                    (G.sideContracts || []).forEach(function(sc) { _collapsed['sched_side_' + sc.seriesId] = true; });
                    render();
                }),
                _lastCompletedSeries ? mkBtn('↩ Undo Last Result', 'btn btn-sm btn-warn', function() {
                    const lc = _lastCompletedSeries;
                    openModal(h('div', null,
                        h('div', { className: 'modal-eyebrow' }, 'Undo Last Result'),
                        h('div', { className: 'modal-title' }, lc.race.track),
                        h('div', { className: 'modal-sub' }, (lc.s && lc.s.short) + ' R' + lc.race.round + ' — ' + (lc.race.result.dnf ? 'DNF' : 'P' + lc.race.result.position + '/' + lc.race.result.fieldSize)),
                        h('div', { style: { fontSize: '14px', color: '#94A3B8', marginBottom: '16px', lineHeight: '1.6' } },
                            'Reverses all stat changes from this result — points, prize, standings, rep, fans, week counter. The race returns to unsubmitted.'
                        ),
                        h('div', { className: 'modal-actions' },
                            mkBtn('Cancel', 'btn btn-ghost', closeModal),
                            mkBtn('Undo It', 'btn btn-danger', function() {
                                const old = lc.race.result;
                                const sid = lc.seriesId;
                                const contract = G.contracts.find(c => c.seriesId === sid);

                                if (old._snapshot) {
                                    const snap = old._snapshot;
                                    G.money = snap.money;
                                    G.totalPrizeMoney = snap.totalPrizeMoney;
                                    G.reputation = snap.reputation;
                                    G.fans = snap.fans;
                                    G.starts = snap.starts;
                                    G.week = snap.week;
                                    G.wins = snap.wins;
                                    G.top5s = snap.top5s;
                                    G.poles = snap.poles;
                                    G.confidence = snap.confidence;
                                    G.championshipPoints = snap.championshipPoints;
                                    G.seriesFields = snap.seriesFields;
                                    G.sponsors = snap.sponsors;
                                    G.rivals = snap.rivals;
                                    G.carCondition = snap.carCondition;
                                    G.playerInjury = snap.playerInjury;
                                    // restore driver list
                                    if (snap.drivers) G.drivers = snap.drivers;
                                    // restore teammates
                                    if (snap.teammates) G.teammates = snap.teammates;
                                    // restore milestones
                                    if (snap.milestones) G.milestones = snap.milestones;
                                    // restore track records
                                    if (snap.trackRecords) G.trackRecords = snap.trackRecords;
                                    // restore elim flag
                                    G._elimNotified = snap._elimNotified || null;
                                    // trim drama queue
                                    if (G.dramaQueue && G.dramaQueue.length > snap.dramaQueueLength) {
                                        G.dramaQueue = G.dramaQueue.slice(0, snap.dramaQueueLength);
                                    }
                                    // trim race history
                                    if (G.raceHistory && G.raceHistory.length > snap.raceHistoryLength) {
                                        G.raceHistory = G.raceHistory.slice(0, snap.raceHistoryLength);
                                    }
                                    // trim story journal
                                    if (snap.storyJournalLength !== undefined && G.storyJournal && G.storyJournal.length > snap.storyJournalLength) {
                                        G.storyJournal = G.storyJournal.slice(0, snap.storyJournalLength);
                                    }
                                    // restore contracts
                                    if (snap.contracts) G.contracts = snap.contracts;
                                    if (snap.conflictSkipKeys) {
                                        Object.keys(snap.conflictSkipKeys).forEach(function(cSid) {
                                            if (cSid === sid) return;
                                            var cSched = G.schedules[cSid] || [];
                                            var preIdx = snap.conflictSkipKeys[cSid];
                                            // clear results that didnt exist before
                                            if (preIdx >= 0 && preIdx < cSched.length) {
                                                for (var ci = preIdx; ci < cSched.length; ci++) {
                                                    if (cSched[ci].result && cSched[ci].result._conflictSkip) {
                                                        cSched[ci].result = null;
                                                    }
                                                }
                                            }
                                        });
                                    }
                                } else {
                                    // old results without snapshot - manual unwind
                                    const prizeShare = (contract && !contract.indie && contract.prizeShare) ? contract.prizeShare : 1.0;
                                    G.championshipPoints[sid] = Math.max(0, (G.championshipPoints[sid] || 0) - (old.points || 0));
                                    G.money -= Math.floor((old.prize || 0) * prizeShare);
                                    G.totalPrizeMoney = Math.max(0, (G.totalPrizeMoney || 0) - Math.floor((old.prize || 0) * prizeShare));
                                    G.starts = Math.max(0, G.starts - 1);
                                    G.week = Math.max(1, G.week - 1);
                                    if (!old.dnf && !old.dq) {
                                        if (old.position === 1) G.wins = Math.max(0, G.wins - 1);
                                        if (old.position <= 5) G.top5s = Math.max(0, G.top5s - 1);
                                    }
                                    const myLo = G.driverName.toLowerCase();
                                    if (G.seriesFields[sid]) {
                                        (old.finishOrder || []).forEach(function(entry, idx) {
                                            if (!entry.name || /\byou\b/i.test(entry.name) || entry.name.toLowerCase() === myLo || entry.isPlayer) return;
                                            const clean = entry.name.trim();
                                            if (!clean || !G.seriesFields[sid][clean]) return;
                                            G.seriesFields[sid][clean].points = Math.max(0, (G.seriesFields[sid][clean].points || 0) - (IRACING_PTS[idx] || 1));
                                            G.seriesFields[sid][clean].starts = Math.max(0, (G.seriesFields[sid][clean].starts || 0) - 1);
                                            if (idx === 0) G.seriesFields[sid][clean].wins = Math.max(0, (G.seriesFields[sid][clean].wins || 0) - 1);
                                            if (idx < 5) G.seriesFields[sid][clean].top5s = Math.max(0, (G.seriesFields[sid][clean].top5s || 0) - 1);
                                        });
                                    }
                                    G.raceHistory = (G.raceHistory || []).filter(r =>
                                        !(r.season === G.season && r.seriesId === sid && r.track === lc.race.track)
                                    );
                                }

                                lc.race.result = null;
                                if (contract && contract.racesCompleted > 0) contract.racesCompleted--;
                                addLog(G, '↩ Undid result: ' + (lc.s && lc.s.short) + ' R' + lc.race.round + ' @ ' + lc.race.track);
                                saveGame(); closeModal(); render();
                            }),
                        ),
                    ));
                }) : null,
            ));

            if (!G.contracts.length) {
                f.appendChild(h('div', { className: 'card', style: { textAlign: 'center', padding: '24px', color: '#94A3B8' } }, 'No active contracts.'));
            }
            // scroll to next race
            setTimeout(function() {
                const nextEl = document.querySelector('[data-is-next="true"]');
                if (nextEl) nextEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
            G.contracts.filter(function(c) { var s = getSeries(c.seriesId); return s && !s.isSideStep; }).forEach(contract => {
                const s = getSeries(contract.seriesId);
                const sched = G.schedules[contract.seriesId] || [];
                const pts = G.championshipPoints[contract.seriesId] || 0;
                const section = h('div', { style: { marginBottom: '28px' } });
                const schedKey = 'sched_' + contract.seriesId;
                const allDone = sched.length > 0 && sched.every(r => r.result);
                // Auto-collapse series where all races are done OR where many are done
                const manyDone = sched.filter(r => r.result).length >= 3 && sched.some(r => !r.result);
                const schedDefaultCollapsed = allDone || manyDone;
                const schedCollapsed = isCollapsed(schedKey, schedDefaultCollapsed);

                section.appendChild(h('div', {
                    style: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', cursor: 'pointer' },
                    onClick: function () { toggleCollapse(schedKey, schedDefaultCollapsed); render(); }
                },
                    h('div', { style: { width: '11px', height: '11px', borderRadius: '2px', background: s.color } }),
                    h('span', { style: { fontSize: '18px', fontWeight: 800, color: '#F9FAFB' } }, s.name),
                    contract.noContractRequired ? null : h('span', { style: { color: '#94A3B8', fontSize: '14px' } }, `— ${contract.team}`),
                    h('span', { style: { marginLeft: 'auto', fontSize: '15px', color: s.color, fontWeight: 900 } }, `${pts} pts`),
                    h('span', {
                        style: {
                            fontSize: '16px', color: '#64748B',
                            transform: schedCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s',
                            marginLeft: '8px',
                        }
                    }, '▾'),
                ));

                function renderRows() {
                    const old = section.querySelector('.sched-rows');
                    if (old) old.remove();
                    const rc = h('div', { className: 'sched-rows', style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px 8px' } });
                    let dragSrc = null;

                    sched.forEach((race, i) => {
                        const done = !!race.result && !(race.result && race.result.skipped);
                        const skipped = !!(race.result && race.result.skipped);
                        const isNext = !done && !skipped && sched.slice(0, i).every(r => r.result);
                        const bonusDone = !!race.bonusResult;
                        const bonusNow = done && race.fig8 && !bonusDone && !(race.result && race.result.skipped);
                        const isDQd = done && (race.result && race.result.dq);
                        const pc = done && race.result.dnf ? '#EF4444' : isDQd ? '#F97316' : done && race.result.position === 1 ? '#F59E0B' : done && race.result.position <= 5 ? '#10B981' : '#94A3B8';
                        const resultLabel = isDQd ? 'DQ' : (race.result && race.result.dnf) ? 'DNF' : done ? `P${race.result.position}` : '';
                        const draggable = false;
                        const dragHandle = null;

                        // Check if this track appears in any other series this same week
                        var _sameTrackOther = false;
                        var _sameTrackShort = null;
                        if (!done && !skipped) {
                            (G.contracts || []).forEach(function(oc) {
                                if (oc.seriesId === contract.seriesId) return;
                                var ocSched = G.schedules[oc.seriesId] || [];
                                var _thisWeek = race.week || race.round;
                                if (ocSched.some(function(or) { return or.track === race.track && (or.week || or.round) === _thisWeek; })) {
                                    _sameTrackOther = true;
                                    var _stS = getSeries(oc.seriesId);
                                    if (_stS && !_sameTrackShort) _sameTrackShort = _stS.short;
                                }
                            });
                        }

                        // Hoist conflict detection so row styling can use it
                        var _isConflicted = false;
                        var _conflictShort = null;
                        if (!done && !skipped) {
                            (G.contracts || []).forEach(function(oc) {
                                if (oc.seriesId === contract.seriesId) return;
                                var alreadyRan = (G.raceHistory || []).some(function(rh) {
                                    return rh.seriesId === oc.seriesId
                                        && rh.season === G.season
                                        && rh.week === (race.week || race.round);
                                });
                                if (alreadyRan && !_isConflicted) {
                                    _isConflicted = true;
                                    var _cs = getSeries(oc.seriesId);
                                    _conflictShort = _cs ? _cs.short : null;
                                }
                            });
                        }
                        const row = h('div', {
                            draggable: false,
                            'data-sched-idx': String(i),
                            'data-is-next': isNext ? 'true' : 'false',
                            style: {
                                display: 'flex', alignItems: 'center', gap: '10px',
                                background: isNext ? '#0D1820' : _isConflicted ? '#1A1000' : _sameTrackOther ? '#0F1A0F' : 'transparent',
                                border: isNext ? '2px solid #10B981' : _isConflicted ? '1px solid #F59E0B88' : _sameTrackOther ? '1px solid #10B98144' : '1px solid transparent',
                                borderRadius: '7px', padding: '8px 11px', marginBottom: '3px',
                                opacity: done ? '0.7' : skipped ? '0.35' : '1',
                                cursor: done ? 'pointer' : draggable ? 'default' : 'default',
                                boxShadow: isNext ? '0 0 0 1px #10B98122' : _isConflicted ? '0 0 0 1px #F59E0B22' : 'none',
                            },
                            onClick: done ? () => openRaceHistoryModal(contract.seriesId, i) : undefined,
                        },
                            dragHandle,
                            h('div', { style: { width: '34px', height: '34px', borderRadius: '5px', background: done ? '#060A10' : isNext ? s.color + '18' : '#060A10', border: `1px solid ${done ? '#1E2433' : isNext ? s.color : '#1E2433'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px', fontWeight: 800, color: isNext ? s.color : '#94A3B8', flexShrink: 0 } }, i + 1),
                            h('div', { style: { flex: 1 } },
                                h('div', null,
                                    h('div', { style: { fontSize: '14px', fontWeight: 700, color: '#F9FAFB', lineHeight: 1.3 } }, race.track),
                                    h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '3px' } },
                                        race.isPremier ? h('span', { style: { fontSize: '11px', color: '#F59E0B', fontWeight: 700, background: '#F59E0B18', border: '1px solid #F59E0B44', padding: '1px 6px', borderRadius: '3px' } }, '⭐ ' + race.premierName) : race.isSupportRace && race.premierName ? h('span', { style: { fontSize: '11px', color: '#D97706', fontWeight: 700, background: '#D9770618', border: '1px solid #D9770644', padding: '1px 6px', borderRadius: '3px' } }, '🏁 Support — ' + race.premierName) : null,
                                        race.night ? h('span', { style: { fontSize: '11px', color: '#8B5CF6', fontWeight: 700 } }, '🌙 Night') : null,
                                        race.state && G.homeState && isSameRegion(race.state, G.homeState) ? h('span', { style: { fontSize: '11px', color: '#F59E0B', fontWeight: 700 } }, '🏠 Home') : null,
                                        _sameTrackOther ? h('span', { style: { fontSize: '11px', color: '#10B981', fontWeight: 700, background: '#10B98118', border: '1px solid #10B98144', padding: '1px 6px', borderRadius: '3px' } }, '🔗 ' + (_sameTrackShort || 'Multi')) : null,
                                    ),
                                ),
                               h('div', { style: { fontSize: '12px', color: '#94A3B8' } }, race.isPremier ? race.track + ' · ' : '', `${race.city}, ${race.state}`,
                                    race.raceDay ? h('span', { style: { color: '#64748B', marginLeft: '6px' } }, '· ' + race.raceDay) : null,
                                    race.qualifying ? h('span', { style: { color: '#8B5CF6', marginLeft: '8px' } }, `Q:P${race.qualifying.position}${race.qualifying.pole ? '🏆' : ''}`) : '',
                                ),
                                h('div', { style: { fontSize: '12px', color: '#64748B', marginTop: '1px' } },
                                    (function() {
                                        var _s2 = getSeries(contract.seriesId); var _t2 = _s2 ? _s2.tier : 1;
                                        var _pools = {1:[20,25,25,30,30,35,40],2:[30,35,40,40,50,50,60],3:[75,75,100,100,125],4:[100,125,150,200,200],5:[150,200,200,250,250],6:[200,250,300,400,500],7:[250,300,400,500,500,600]};
                                        if (!race.raceLaps) { var _pl = _pools[_t2]||_pools[1]; race.raceLaps = _pl[Math.floor(Math.random()*_pl.length)]; }
                                        if (race.isPremier) return (race.premierLaps || race.raceLaps) + ' laps · ⭐ Premier Event';
                                        if (race.isSupportRace) return race.raceLaps + ' laps · 🏁 ' + (race.premierName || 'Support Race');
                                        return race.raceLaps + ' laps';
                                    })()
                                ),
                                !done && !skipped ? (function() {
                                    try {
                                        const wf = getWeeklyField(contract.seriesId, i);
                                        const baseField = SERIES_FIELD_SIZE[contract.seriesId] || 20;
                                        const diff = wf.expectedCount - baseField;
                                        const fc = diff <= -3 ? '#F59E0B' : diff >= 3 ? '#10B981' : '#64748B';
                                        const absentNames = wf.absent.slice(0, 3).map(function(d) { return d.name.split(' ')[0]; }).join(', ');
                                        const absentExtra = wf.absent.length > 3 ? ' +' + (wf.absent.length - 3) + ' more' : '';
                                        const absentStr = wf.absent.length ? ' · Out: ' + absentNames + absentExtra : '';
                                        return h('div', { style: { fontSize: '12px', color: fc, marginTop: '2px' } },
                                            '~' + wf.expectedCount + ' expected' + absentStr);
                                    } catch(e) { return null; }
                                })() : null,
                            ),
                            done
                                ? h('div', { style: { display: 'flex', gap: '8px', alignItems: 'center' } },
                                    race.result.pole ? badge('POLE', '#8B5CF6') : null,
                                    h('span', { style: { fontSize: '13px', color: '#94A3B8' } }, `${race.result.points || 0}pts`),
                                    h('span', { style: { fontWeight: 800, color: pc, fontSize: '15px' } }, resultLabel || `P${race.result.position}`),
                                    h('span', { style: { fontSize: '12px', color: '#64748B' } }, '↗'),
                                )
                                : skipped
                                    ? h('span', {
                                        style: { fontSize: '17px', color: race.result && race.result.simulated ? '#64748B' : '#374151', fontStyle: 'italic', cursor: race.result && race.result.simulated ? 'pointer' : 'default' },
                                        onClick: race.result && race.result.simulated ? function() {
                                            var fo = (race.result.finishOrder || []);
                                            var winner = fo.find(function(e) { return !e.dnf; });
                                            openModal(h('div', null,
                                                h('div', { className: 'modal-eyebrow' }, s.short + ' — R' + race.round),
                                                h('div', { className: 'modal-title' }, race.track),
                                                h('div', { className: 'modal-sub' }, race.city + ', ' + race.state + ' · Simulated'),
                                                h('div', { style: { background: '#060A10', borderRadius: '8px', padding: '14px', marginBottom: '14px', fontSize: '14px', color: '#94A3B8' } },
                                                    'You didn\'t race. ' + (winner ? winner.name + ' won.' : 'Results simulated from AI driver stats.')
                                                ),
                                                fo.length ? h('div', { style: { maxHeight: '280px', overflowY: 'auto' } },
                                                    h('table', { style: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' } },
                                                        h('thead', null,
                                                            h('tr', null,
                                                                h('th', { style: { textAlign: 'left', color: '#64748B', padding: '4px 8px', borderBottom: '1px solid #1E2433' } }, 'Pos'),
                                                                h('th', { style: { textAlign: 'left', color: '#64748B', padding: '4px 8px', borderBottom: '1px solid #1E2433' } }, 'Driver'),
                                                                h('th', { style: { textAlign: 'right', color: '#64748B', padding: '4px 8px', borderBottom: '1px solid #1E2433' } }, 'Status'),
                                                            ),
                                                        ),
                                                        h('tbody', null,
                                                            ...fo.map(function(entry, idx) {
                                                                var posColor = idx === 0 ? '#F59E0B' : idx < 3 ? '#10B981' : '#94A3B8';
                                                                return h('tr', { style: { borderBottom: '1px solid #0D1117' } },
                                                                    h('td', { style: { padding: '5px 8px', color: posColor, fontWeight: idx < 3 ? 800 : 400 } }, entry.dnf ? 'DNF' : 'P' + (idx + 1)),
                                                                    h('td', { style: { padding: '5px 8px', color: '#F9FAFB' } }, entry.name),
                                                                    h('td', { style: { padding: '5px 8px', textAlign: 'right', color: '#64748B' } }, entry.dnf ? '❌' : '✓'),
                                                                );
                                                            })
                                                        ),
                                                    )
                                                ) : h('div', { style: { color: '#64748B', fontSize: '13px' } }, 'No field data available.'),
                                                h('div', { className: 'modal-actions' },
                                                    mkBtn('Close', 'btn btn-ghost', closeModal),
                                                ),
                                            ));
                                        } : null,
                                    },
                                        race.result && race.result.simulated
                                            ? '⏭️ ' + (race.result.winner ? race.result.winner + ' won' : 'Simulated') + ' — click for results'
                                            : 'Skipped — joined mid-season'
                                    )
                                    : (() => {
                                        const thisState = race.state;
                                        // Conflict detection — correct week offset (raceHistory stores week-1)
                                        // Use hoisted conflict detection
                                        var conflictSeriesId = _isConflicted ? (function() {
                                            var cid = null;
                                            (G.contracts || []).forEach(function(oc) {
                                                if (oc.seriesId === contract.seriesId || cid) return;
                                                var alreadyRan = (G.raceHistory || []).some(function(rh) {
                                                    return rh.seriesId === oc.seriesId && rh.season === G.season && rh.week === (race.week || race.round);
                                                });
                                                if (alreadyRan) cid = oc.seriesId;
                                            });
                                            return cid;
                                        })() : null;
                                        var conflictSeries = conflictSeriesId ? getSeries(conflictSeriesId) : null;
                                        // Block if conflict AND different region (same-region double-headers OK)
                                        var _thisRaceState = race.state || '';
                                        var _conflictRaceState = '';
                                        if (conflictSeriesId) {
                                            var _conflictSched = G.schedules[conflictSeriesId] || [];
                                            var _conflictRan = _conflictSched.find(function(cr) { return cr.week === G.week && cr.result; });
                                            _conflictRaceState = _conflictRan ? (_conflictRan.state || '') : '';
                                        }
                                        var _sameRegionDoubleHeader = conflictSeriesId && _thisRaceState && _conflictRaceState && isSameRegion(_thisRaceState, _conflictRaceState);
                                        var isBlocked = !!(conflictSeriesId && !_sameRegionDoubleHeader);
                                        const blockedByState = conflictSeries ? conflictSeries.short : null;

                                        var openConflictModal = function() {
                                            openModal(h('div', null,
                                                h('div', { className: 'modal-eyebrow', style: { color: '#F59E0B' } }, '⚠️ Schedule Conflict'),
                                                h('div', { className: 'modal-title' }, 'You Can\'t Be in Two Places'),
                                                h('div', { className: 'modal-sub' }, 'You already raced in ' + (conflictSeries ? conflictSeries.short : 'another series') + ' this week.'),
                                                h('div', { style: { background: '#060A10', border: '1px solid #1E2433', borderRadius: '8px', padding: '14px', marginBottom: '16px', fontSize: '14px', color: '#CBD5E1', lineHeight: '1.7' } },
                                                    race.track + ' is on the schedule this week but you\'re already committed elsewhere. Send a substitute to keep your seat warm, or skip it and let the field run without you.'
                                                ),
                                                h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' } },
                                                    h('div', { style: { background: '#060A10', border: '1px solid #3B82F644', borderRadius: '8px', padding: '14px' } },
                                                        h('div', { style: { fontSize: '15px', fontWeight: 800, color: '#3B82F6', marginBottom: '6px' } }, '🔄 Race as Sub'),
                                                        h('div', { style: { fontSize: '13px', color: '#94A3B8', marginBottom: '12px', lineHeight: '1.6' } },
                                                            'A sub drives in your seat. You still enter the result — it just goes under their name. Championship points count at 50%.'
                                                        ),
                                                        mkBtn('Send a Sub', 'btn btn-secondary btn-full', function() {
                                                            closeModal();
                                                            openRaceModal(contract.seriesId, i);
                                                        }),
                                                    ),
                                                    h('div', { style: { background: '#060A10', border: '1px solid #EF444444', borderRadius: '8px', padding: '14px' } },
                                                        h('div', { style: { fontSize: '15px', fontWeight: 800, color: '#EF4444', marginBottom: '6px' } }, '⏭️ Skip & Simulate'),
                                                        h('div', { style: { fontSize: '13px', color: '#94A3B8', marginBottom: '12px', lineHeight: '1.6' } },
                                                            'The field runs without you. Standings update in the background. You get zero — rivals might gain ground.'
                                                        ),
                                                        mkBtn('Skip It', 'btn btn-danger btn-full', function() {
                                                            closeModal();
                                                            simulateSkippedRace(contract.seriesId, i);
                                                        }),
                                                    ),
                                                ),
                                                h('div', { className: 'modal-actions' },
                                                    mkBtn('Decide Later', 'btn btn-ghost', closeModal),
                                                ),
                                            ));
                                        };

                                        return h('div', { style: { display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' } },
                                            h('div', { style: { display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' } },
                                                conflictSeries
                                                    ? mkBtn('⚠️ Conflict', 'btn btn-sm btn-warn', openConflictModal)
                                                    : mkBtn('Enter Result →', 'btn btn-sm btn-success', function() { openRaceModal(contract.seriesId, i); }, isBlocked),
                                                mkBtn('⏭️ Skip', 'btn btn-xs btn-secondary', function() {
                                                    openModal(h('div', null,
                                                        h('div', { className: 'modal-eyebrow' }, s.short + ' — R' + race.round),
                                                        h('div', { className: 'modal-title' }, 'Skip This Race?'),
                                                        h('div', { className: 'modal-sub' }, race.track),
                                                        h('div', { style: { background: '#060A10', borderRadius: '8px', padding: '14px', marginBottom: '16px', fontSize: '14px', color: '#94A3B8', lineHeight: '1.7' } },
                                                            'The race simulates in the background using AI driver stats. Standings update as if it ran. You score zero — rivals might gain ground.'
                                                        ),
                                                        h('div', { className: 'modal-actions' },
                                                            mkBtn('Cancel', 'btn btn-ghost', closeModal),
                                                            mkBtn('Skip & Simulate', 'btn btn-danger', function() {
                                                                closeModal();
                                                                simulateSkippedRace(contract.seriesId, i);
                                                            }),
                                                        ),
                                                    ));
                                                }),
                                                mkBtn('✕', 'btn btn-xs btn-danger', function() {
                                                    sched.splice(i, 1);
                                                    sched.forEach(function(r, idx) { r.round = idx + 1; });
                                                    saveGame();
                                                    renderRows();
                                                }),
                                            ),
                                            isBlocked ? h('div', { style: { fontSize: '13px', color: '#64748B', fontStyle: 'italic', marginTop: '2px' } },
                                                'Already racing in ' + blockedByState + ' this week'
                                            ) : null,
                                            conflictSeries ? h('div', { style: { fontSize: '13px', color: '#F59E0B', fontStyle: 'italic', marginTop: '2px' } },
                                                'Conflict: ' + conflictSeries.short + ' already ran this week'
                                            ) : null,
                                        );
                                    })(),
                        );

                        if (draggable) {
                            row.addEventListener('dragstart', function (e) {
                                dragSrc = i;
                                row.style.opacity = '0.4';
                                e.dataTransfer.effectAllowed = 'move';
                            });
                            row.addEventListener('dragend', function () {
                                row.style.opacity = '1';
                                dragSrc = null;
                                rc.querySelectorAll('.drag-over').forEach(function (el) { el.classList.remove('drag-over'); });
                            });
                            row.addEventListener('dragover', function (e) {
                                e.preventDefault();
                                e.dataTransfer.dropEffect = 'move';
                                if (!sched[i].result) row.classList.add('drag-over');
                            });
                            row.addEventListener('dragleave', function () {
                                row.classList.remove('drag-over');
                            });
                            row.addEventListener('drop', function (e) {
                                e.preventDefault();
                                row.classList.remove('drag-over');
                                if (dragSrc === null || dragSrc === i) return;
                                // Only allow swapping undone races
                                if (sched[dragSrc].result || sched[i].result) return;
                                var tmp = sched[dragSrc];
                                sched[dragSrc] = sched[i];
                                sched[i] = tmp;
                                // Re-number rounds
                                sched.forEach(function (r, idx) { r.round = idx + 1; });
                                saveGame();
                                renderRows();
                            });
                            // Touch drag for mobile
                            var touchStartY = 0, touchItem = null, touchClone = null, touchOrigIdx = null;
                            row.addEventListener('touchstart', function (e) {
                                touchStartY = e.touches[0].clientY;
                                touchOrigIdx = i;
                                row.style.opacity = '0.5';
                            }, { passive: true });
                            row.addEventListener('touchmove', function (e) {
                                e.preventDefault();
                                var touch = e.touches[0];
                                var els = rc.querySelectorAll('[data-sched-idx]');
                                var target = null;
                                els.forEach(function (el) {
                                    var rect = el.getBoundingClientRect();
                                    if (touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
                                        target = el;
                                    }
                                });
                                rc.querySelectorAll('.drag-over').forEach(function (el) { el.classList.remove('drag-over'); });
                                if (target && target !== row) target.classList.add('drag-over');
                            }, { passive: false });
                            row.addEventListener('touchend', function (e) {
                                row.style.opacity = '1';
                                rc.querySelectorAll('.drag-over').forEach(function (el) { el.classList.remove('drag-over'); });
                                var touch = e.changedTouches[0];
                                var els = rc.querySelectorAll('[data-sched-idx]');
                                var targetIdx = null;
                                els.forEach(function (el) {
                                    var rect = el.getBoundingClientRect();
                                    if (touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
                                        var idx = parseInt(el.getAttribute('data-sched-idx'));
                                        if (!isNaN(idx) && idx !== i && !sched[idx].result) targetIdx = idx;
                                    }
                                });
                                if (targetIdx !== null) {
                                    var tmp = sched[i];
                                    sched[i] = sched[targetIdx];
                                    sched[targetIdx] = tmp;
                                    sched.forEach(function (r, idx) { r.round = idx + 1; });
                                    saveGame();
                                    renderRows();
                                }
                            });
                        }

                        rc.appendChild(row);
                        if (race.fig8) {
                            rc.appendChild(h('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '24px', marginTop: '2px', marginBottom: '3px', padding: '5px 11px', background: bonusNow ? '#100A1A' : 'transparent', border: bonusNow ? '1px dashed #6D28D9' : '1px dashed #1E2433', borderRadius: '6px', opacity: bonusDone ? '0.5' : '1' } },
                                h('span', { style: { fontSize: '14px' } }, '🔀'),
                                h('div', { style: { flex: 1, fontSize: '14px' } },
                                    h('span', { style: { fontWeight: 700, color: '#8B5CF6' } }, 'BONUS: Figure-8 '),
                                    h('span', { style: { color: '#94A3B8' } }, '— Slinger · Unranked'),
                                ),
                                bonusDone ? h('span', { style: { fontSize: '14px', fontWeight: 800, color: race.bonusResult.dnf ? '#EF4444' : '#8B5CF6' } }, race.bonusResult.dnf ? 'DNF' : `P${race.bonusResult.position}`) :
                                    bonusNow ? mkBtn('Why Not →', 'btn btn-sm btn-chaos', () => openFig8BonusModal(contract.seriesId, i)) :
                                        h('span', { style: { fontSize: '14px', color: '#2D3748' } }, 'After main race'),
                            ));
                        }
                    });
                    section.appendChild(rc);
                }
                if (!isCollapsed(schedKey, schedDefaultCollapsed)) renderRows();
                f.appendChild(section);
            });

            // side series races inline on schedule
            var activeSideContracts = (G.sideContracts || []).filter(function(sc) { return sc.season === G.season; });
            activeSideContracts.forEach(function(sc) {
                var ss = getSeries(sc.seriesId);
                if (!ss) return;
                var sideSched = (G.sideSchedules || {})[sc.seriesId] || [];
                if (!sideSched.length) return;
                var sideKey = 'sched_side_' + sc.seriesId;
                var sideDone = sideSched.filter(function(r) { return r.result && !r.result.simulated && !r.result.locked; }).length;
                var sideTotal = sideSched.length;
                var sidePastCount = sideSched.filter(function(r) { return r.locked || (r.result && r.result.simulated); }).length;
                var sideDefaultCollapsed = sidePastCount > 3 && sideDone === 0;
                var sideCollapsed = isCollapsed(sideKey, sideDefaultCollapsed);

                var sideSection = h('div', { style: { marginBottom: '28px' } });
                // Header — clickable to collapse
                sideSection.appendChild(h('div', {
                    style: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', cursor: 'pointer' },
                    onClick: function() { toggleCollapse(sideKey, false); render(); }
                },
                    h('div', { style: { width: '11px', height: '11px', borderRadius: '2px', background: ss.color } }),
                    h('span', { style: { fontSize: '18px', fontWeight: 800, color: ss.color } }, ss.short),
                    h('span', { style: { color: '#5A4E38', fontSize: '13px', marginLeft: '4px' } }, '— Pit Road'),
                    h('span', { style: { marginLeft: 'auto', fontSize: '13px', color: '#5A4E38' } }, sideDone + '/' + sideTotal + ' run'),
                    h('span', { style: { fontSize: '16px', color: '#64748B', transform: sideCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.2s', marginLeft: '8px' } }, '▾'),
                ));

                if (!sideCollapsed) {
                    var sideRc = h('div', null);
                    sideSched.forEach(function(sideRace, sideIdx) {
                        var isLocked = sideRace.locked;
                        var isSimulated = sideRace.result && sideRace.result.simulated;
                        var isDone = sideRace.result && !isLocked && !isSimulated;
                        var mainRaces = [];
                        (G.contracts || []).forEach(function(c) {
                            var ms = G.schedules && G.schedules[c.seriesId];
                            if (ms && ms[sideRace.week - 1]) mainRaces.push(ms[sideRace.week - 1]);
                        });
                        var nearby = !isLocked && mainRaces.some(function(mr) { return isSameRegion(mr.state, sideRace.state); });
                        var isNextSide = !isDone && !isLocked && !isSimulated && nearby;
                        var posColor = isDone ? (sideRace.result.position === 1 ? '#F59E0B' : sideRace.result.position <= 5 ? '#10B981' : '#94A3B8') : '#5A4E38';
                        var mainTrackLabel = mainRaces.length ? mainRaces[0].track : '';

                        var row = h('div', {
                            style: {
                                display: 'flex', alignItems: 'center', gap: '10px',
                                background: isNextSide ? '#0D150D' : isLocked ? 'transparent' : 'transparent',
                                border: isNextSide ? '1px solid ' + ss.color + '44' : '1px solid transparent',
                                borderLeft: '3px solid ' + (isLocked ? '#2E2820' : ss.color),
                                borderRadius: '6px', padding: '7px 10px', marginBottom: '3px',
                                opacity: isLocked ? '0.3' : isSimulated ? '0.5' : isDone ? '0.7' : '1',
                            }
                        },
                            h('div', { style: { width: '30px', textAlign: 'center', flexShrink: 0, fontSize: '13px', fontWeight: 800, color: isLocked ? '#3A3020' : posColor, fontFamily: "'Share Tech Mono',monospace" } },
                                isLocked ? '🔒' : isSimulated ? '—' : isDone ? (sideRace.result.position === 1 ? '🏆' : 'P' + sideRace.result.position) : sideRace.round),
                            h('div', { style: { flex: 1, minWidth: 0 } },
                                h('div', { style: { fontSize: '15px', fontWeight: 700, color: isLocked || isSimulated ? '#4A4038' : '#F0E8D8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } },
                                    sideRace.track,
                                    sideRace.roadCourse ? h('span', { style: { fontSize: '10px', color: '#6A5E48', marginLeft: '6px', fontWeight: 700 } }, 'ROAD') : null,
                                ),
                                h('div', { style: { fontSize: '12px', color: '#5A4E38', marginTop: '2px' } },
                                    sideRace.city + ', ' + sideRace.state + ' · Wk ' + sideRace.week + ' · ' + sideRace.raceLaps + ' laps',
                                    !isLocked && !isSimulated && mainTrackLabel ? h('span', { style: { color: nearby ? '#3A5038' : '#5A3018' } }, nearby ? ' · Near: ' + mainTrackLabel : ' · Far') : null,
                                    !isLocked && !isSimulated ? (function() {
                                        var sf = (G.sideFields || {})[sc.seriesId] || {};
                                        var count = Object.keys(sf).length + 1; // +1 for player
                                        return count > 1 ? h('span', { style: { color: '#4A5A48' } }, ' · ~' + count + ' drivers') : null;
                                    })() : null,
                                ),
                            ),
                            isLocked ? h('span', { style: { fontSize: '12px', color: '#3A3020' } }, 'Missed') :
                            isSimulated ? h('span', { style: { fontSize: '12px', color: '#5A4E38' } }, 'AI ran') :
                            isDone ? h('span', { style: { fontSize: '15px', fontWeight: 800, color: posColor } }, sideRace.result.dnf ? 'DNF' : 'P' + sideRace.result.position) :
                            mkBtn('Enter Result', 'btn btn-xs btn-success', (function(sidId, sidIdx) { return function() { openSideResultModal(sidId, sidIdx); }; })(sc.seriesId, sideIdx)),
                            isNextSide ? h('div', { style: { fontSize: '10px', fontWeight: 800, color: ss.color } }, '⚡ NOW') : null,
                        );
                        sideRc.appendChild(row);
                    });
                    sideSection.appendChild(sideRc);
                }
                f.appendChild(sideSection);
            });

            return f;
        }