// dashboard
        function renderDashboard() {
            const f = document.createDocumentFragment();
            const grid = h('div', { className: 'grid-2', style: { marginBottom: '14px' } });

            // driver card
            const dc = h('div', { className: 'card' });
            dc.appendChild(cardTitle('Driver'));
            dc.appendChild(h('div', { style: { fontSize: '26px', fontWeight: 900, color: '#F9FAFB', marginBottom: '4px' } }, G.driverAlias || G.driverName));
            dc.appendChild(h('div', { style: { fontSize: '13px', color: '#64748B', marginBottom: '8px' } },
                G.homeState ? `📍 ${(typeof US_STATE_NAMES !== 'undefined' ? US_STATE_NAMES[G.homeState] : null) || G.homeState}` : ''
            ));
            dc.appendChild(h('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' } },
                badge(`Season ${G.season}`, '#F59E0B'),
                badge(`${G.starts} starts`, '#94A3B8'),
                G.wins > 0 ? badge(`${G.wins} win${G.wins !== 1 ? 's' : ''}`, '#10B981') : null,
            ));
            dc.appendChild(statBar('Reputation', Math.min(G.reputation, 320), 320, '#F59E0B'));
            dc.appendChild(statBar('Fans', Math.min(G.fans, 500000), 500000, '#EC4899'));
            // confidence/streak
            if (G.confidence !== 0) {
                const confColor = G.confidence >= 2 ? '#F59E0B' : G.confidence === 1 ? '#10B981' : G.confidence === -1 ? '#F97316' : '#EF4444';
                const confLabel = G.confidence >= 3 ? '🔥 On Fire' : G.confidence === 2 ? '📈 Hot Streak' : G.confidence === 1 ? '✅ Good Form' : G.confidence === -1 ? '📉 Cold Stretch' : '❄️ Struggling';
                const confDesc = G.confidence >= 2 ? 'Wins coming in bunches right now. Sponsors are watching.' : G.confidence === 1 ? 'Running well lately. Keep it going.' : G.confidence === -1 ? 'Results have been off. Something needs to change.' : 'Rough stretch. The paddock is starting to ask questions.';
                dc.appendChild(h('div', {
                    style: {
                        background: confColor + '18', border: `1px solid ${confColor}44`,
                        borderRadius: '7px', padding: '8px 12px', marginBottom: '10px',
                        display: 'flex', alignItems: 'center', gap: '10px',
                    }
                },
                    h('div', { style: { fontSize: '18px' } }, confLabel.split(' ')[0]),
                    h('div', null,
                        h('div', { style: { fontSize: '13px', fontWeight: 800, color: confColor } }, confLabel.slice(2)),
                        h('div', { style: { fontSize: '12px', color: '#94A3B8', marginTop: '2px' } }, confDesc),
                    ),
                ));
            }

            const _repTier = getRepTier(G.reputation);
            dc.appendChild(h('div', { style: { display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', marginBottom: '4px' } },
                h('span', { style: { fontSize: '16px' } }, _repTier.icon),
                h('span', { style: { fontSize: '13px', fontWeight: 800, color: _repTier.color, letterSpacing: '0.05em' } }, _repTier.label),
                h('span', { style: { fontSize: '12px', color: '#64748B' } }, '(' + G.reputation + ' rep)'),
            ));
            // next tier to unlock
            const nextS = SERIES.find(s => s.reqRep > G.reputation || s.reqFans > G.fans);
            if (nextS) {
                const parts = [];
                if (G.reputation < nextS.reqRep) parts.push(`${nextS.reqRep - G.reputation} rep`);
                if (G.fans < nextS.reqFans) parts.push(`${fmtFans(nextS.reqFans - G.fans)} fans`);
                dc.appendChild(h('div', { style: { background: '#060A10', borderRadius: '7px', padding: '10px', border: '1px solid #1E2433', fontSize: '14px', color: '#94A3B8', marginTop: '10px' } },
                    `Next: ${nextS.short} — need ${parts.join(' + ')}`
                ));
            }
            grid.appendChild(dc);

            // career stats
            const sc = h('div', { className: 'card' });
            sc.appendChild(cardTitle('Career'));
            sc.appendChild(h('div', { className: 'grid-2', style: { marginBottom: '12px' } },
                ...[['Wins', G.wins, '#F59E0B'], ['Top 5s', G.top5s, '#10B981'], ['Poles', G.poles, '#8B5CF6'], ['Earnings', fmtMoney(G.totalPrizeMoney), '#10B981']]
                    .map(([l, v, c]) => miniStatBox(l, v, c))
            ));
            sc.appendChild(h('div', { style: { display: 'flex', gap: '12px', flexWrap: 'wrap' } },
                h('div', { style: { background: '#060A10', borderRadius: '7px', padding: '10px', border: '1px solid #1E2433', flex: 1 } },
                    h('div', { style: { fontSize: '12px', color: '#94A3B8' } }, 'MERCH REVENUE'),
                    h('div', { style: { fontSize: '18px', fontWeight: 900, color: '#EC4899' } }, fmtMoney(G.totalMerchRevenue || 0)),
                ),
                h('div', { style: { background: '#060A10', borderRadius: '7px', padding: '10px', border: '1px solid #1E2433', flex: 1 } },
                    h('div', { style: { fontSize: '12px', color: '#94A3B8' } }, 'BANK'),
                    h('div', { style: { fontSize: '18px', fontWeight: 900, color: '#F59E0B' } }, fmtMoney(G.money)),
                ),
            ));
            grid.appendChild(sc);
            f.appendChild(grid);

            // contracts
            const cc = h('div', { className: 'card' });
            cc.appendChild(cardTitle('Active Contracts'));
            // all done? season over
            const allRacesDone = G.contracts.length > 0 && G.contracts.every(contract => {
                const sched = G.schedules[contract.seriesId] || [];
                return sched.every(r => r.result);
            });
            if (!G.contracts.length) {
                cc.appendChild(h('div', { style: { color: '#94A3B8', textAlign: 'center', padding: '16px 0', fontSize: '14px' } }, 'No active contracts. Sign one in the Contracts tab.'));
                cc.appendChild(h('div', { style: { marginTop: '12px' } }, mkBtn(`Advance to Season ${G.season + 1} →`, 'btn btn-primary', openSeasonEndModal)));
            } else {
                G.contracts.forEach(contract => {
                    const s = getSeries(contract.seriesId);
                    const sched = G.schedules[contract.seriesId] || [];
                    const nextIdx = sched.findIndex(r => !r.result);
                    const nextRace = nextIdx >= 0 ? sched[nextIdx] : null;
                    const racesLeft = sched.filter(r => !r.result).length;

                    cc.appendChild(h('div', { className: 'row-item', style: { borderColor: s.color + '30', marginBottom: '8px' } },
                        accent(s.color),
                        h('div', { style: { flex: 1 } },
                            h('div', { className: 'row-name' }, s.name),
                            h('div', { className: 'row-sub' }, `${contract.noContractRequired ? 'Open Entry' : contract.team} · ${racesLeft} races left${nextRace ? ` · Next: ${nextRace.track}` : ''}`),
                            h('div', { className: 'row-sub2' }, `${fmtMoney(contract.earnings)} earned · ${G.championshipPoints[contract.seriesId] || 0} pts · ${contract.termSeasons - contract.seasonsCompleted} season(s) left`),
                        ),
                        h('div', { style: { display: 'flex', gap: '6px', flexShrink: 0 } },
                            nextRace ? mkBtn('Enter Result →', 'btn btn-sm btn-success', () => openRaceModal(contract.seriesId, nextIdx)) : null,

                        )
                    ));
                });
                // advance only when every series is done
                if (allRacesDone) {
                    cc.appendChild(h('div', { style: { marginTop: '14px', padding: '12px', background: '#0D1117', borderRadius: '8px', border: '1px solid #F59E0B33', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' } },
                        h('div', null,
                            h('div', { style: { fontSize: '15px', fontWeight: 800, color: '#F59E0B' } }, 'Season Complete!'),
                            h('div', { style: { fontSize: '14px', color: '#94A3B8', marginTop: '2px' } }, 'All races finished. Review your season then advance.'),
                        ),
                        mkBtn(`Season ${G.season + 1} →`, 'btn btn-primary', openSeasonEndModal),
                    ));
                }
            }
            f.appendChild(cc);

            // last race
            if (G.raceHistory && G.raceHistory.length) {
                const last = G.raceHistory[G.raceHistory.length - 1];
                const s = getSeries(last.seriesId);
                const isDQ = last.dq || false;
                const pc = isDQ ? '#F97316' : last.pos === 1 ? '#F59E0B' : last.pos <= 5 ? '#10B981' : last.dnf ? '#EF4444' : '#CBD5E1';
                const lastLabel = isDQ ? 'DQ' : last.dnf ? 'DNF' : `P${last.pos}`;
                const lastCard = h('div', { className: 'card' });
                lastCard.appendChild(cardTitle('Last Race Result'));
                lastCard.appendChild(h('div', { style: { display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' } },
                    h('div', { style: { fontSize: '62px', fontWeight: 900, color: pc, lineHeight: 1, minWidth: '80px', textAlign: 'center' } }, lastLabel),
                    h('div', null,
                        h('div', { style: { fontSize: '18px', fontWeight: 800, color: '#F9FAFB' } }, last.track),
                        h('div', { style: { fontSize: '14px', color: '#94A3B8' } }, `${last.seriesShort} · ${last.fs}-car field · S${last.season}`),
                        last.closeFinishes > 0 ? h('div', { style: { fontSize: '14px', color: '#F97316', marginTop: '4px' } }, `🔥 ${last.closeFinishes} close finish${last.closeFinishes > 1 ? 'es' : ''}! Fan boost earned.`) : null,
                    ),
                    h('div', { style: { marginLeft: 'auto', textAlign: 'right' } },
                        h('div', { style: { fontSize: '12px', color: '#94A3B8' } }, 'PRIZE'),
                        h('div', { style: { fontSize: '22px', fontWeight: 900, color: '#10B981' } }, fmtMoney(last.prize)),
                        h('div', { style: { fontSize: '14px', color: '#F59E0B', fontWeight: 700 } }, `+${last.points} pts`),
                        h('div', { style: { fontSize: '14px', color: last.repGain >= 0 ? '#10B981' : '#EF4444' } }, `Rep ${last.repGain >= 0 ? '+' : ''}${last.repGain}`),
                        h('div', { style: { fontSize: '14px', color: '#EC4899' } }, `Fans ${last.fans >= 0 ? '+' : ''}${fmtFans(last.fans)}`),
                    )
                ));
                // mad libs summary under last race
                if (last.summary) {
                    lastCard.appendChild(h('div', {
                        style: {
                            marginTop: '12px', padding: '11px 14px',
                            background: '#060A10', borderRadius: '7px',
                            borderLeft: `3px solid ${(s && s.color) || '#F59E0B'}`,
                        }
                    },
                        h('div', { style: { fontSize: '10px', color: (s && s.color) || '#F59E0B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '5px' } }, `📰 ${last.seriesShort} Report`),
                        h('div', { style: { fontSize: '14px', color: '#CBD5E1', lineHeight: '1.65', fontStyle: 'italic' } }, last.summary),
                    ));
                }
                f.appendChild(lastCard);
            }

            // car condition per series
            G.contracts.forEach(function (contract) {
                const sid = contract.seriesId;
                const s2 = getSeries(sid);
                const dashCC = getCarCondition(G, sid);
                const ccComponents = [
                    { key: 'engine', label: 'Engine', color: '#EF4444' },
                    { key: 'suspension', label: 'Suspension', color: '#F97316' },
                    { key: 'chassis', label: 'Chassis', color: '#F59E0B' },
                    { key: 'tires', label: 'Tires', color: '#10B981' },
                    { key: 'brakes', label: 'Brakes', color: '#3B82F6' },
                ];
                const criticalParts = ccComponents.filter(function (comp) { return (dashCC[comp.key] || 0) < 25; });
                const warningParts = ccComponents.filter(function (comp) { return (dashCC[comp.key] || 0) < 50 && (dashCC[comp.key] || 0) >= 25; });
                const ccCard = h('div', { className: 'card', style: { borderColor: criticalParts.length ? '#EF444444' : warningParts.length ? '#F59E0B44' : '#1E2433', marginBottom: '10px' } });
                ccCard.appendChild(h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' } },
                    h('div', { className: 'card-title', style: { margin: 0 } }, s2 ? h('span', { style: { color: s2.color } }, '● ') : '', 'Car Condition' + (s2 ? ' — ' + s2.short : '')),
                    criticalParts.length
                        ? h('div', { style: { fontSize: '13px', fontWeight: 700, color: '#EF4444', background: '#7F1D1D22', padding: '3px 10px', borderRadius: '20px' } }, `⚠️ ${criticalParts.length} CRITICAL`)
                        : warningParts.length
                            ? h('div', { style: { fontSize: '13px', fontWeight: 700, color: '#F59E0B', background: '#78350F22', padding: '3px 10px', borderRadius: '20px' } }, `${warningParts.length} Low`)
                            : h('div', { style: { fontSize: '13px', fontWeight: 700, color: '#10B981', background: '#06513422', padding: '3px 10px', borderRadius: '20px' } }, 'All Good'),
                ));
                if (criticalParts.length || warningParts.length) {
                    const ccGrid = h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', marginBottom: criticalParts.length ? '10px' : '0' } });
                    ccComponents.forEach(function (comp) {
                        const val = Math.round(dashCC[comp.key] || 0);
                        const barColor = val > 60 ? comp.color : val > 30 ? '#F59E0B' : '#EF4444';
                        ccGrid.appendChild(h('div', null,
                            h('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '3px' } },
                                h('span', { style: { color: '#94A3B8' } }, comp.label),
                                h('span', { style: { color: barColor, fontWeight: 700 } }, val + '%'),
                            ),
                            h('div', { style: { height: '5px', background: '#1E2433', borderRadius: '3px', overflow: 'hidden' } },
                                h('div', { style: { height: '100%', width: val + '%', background: barColor, borderRadius: '3px' } }),
                            ),
                        ));
                    });
                    ccCard.appendChild(ccGrid);
                } else {
                    ccCard.appendChild(h('div', { style: { fontSize: '13px', color: '#94A3B8', display: 'flex', gap: '16px', flexWrap: 'wrap' } },
                        ...ccComponents.map(function(comp) {
                            const val = Math.round(dashCC[comp.key] || 0);
                            return h('span', null,
                                h('span', { style: { color: '#475569' } }, comp.label + ' '),
                                h('span', { style: { color: comp.color, fontWeight: 700 } }, val + '%'),
                            );
                        })
                    ));
                }
                if (criticalParts.length) {
                    ccCard.appendChild(h('div', { style: { fontSize: '13px', color: '#EF4444', marginTop: '6px', fontWeight: 600 } },
                        '⚠️ ' + criticalParts.map(function (p) { return p.label; }).join(', ') + ' in the red. Post-race inspection risk elevated.'
                    ));
                }
                ccCard.appendChild(h('div', { style: { marginTop: '10px', textAlign: 'right' } },
                    mkBtn('🔧 Repair Car', 'btn btn-sm ' + (criticalParts.length ? 'btn-danger' : warningParts.length ? 'btn-warn' : 'btn-secondary'), function() {
                        openRepairModal(sid, { dnf: false, condition: null }, function() { saveGame(); render(); });
                    })
                ));
                f.appendChild(ccCard);
            });

            // track tendencies

            const { best: bestTrack, worst: worstTrack } = getTrackTendencies(G);
            if (bestTrack || worstTrack) {
                const tc = h('div', { className: 'card' });
                tc.appendChild(cardTitle('Track Tendencies'));
                const tcWrap = h('div', { style: { display: 'flex', gap: '10px', flexWrap: 'wrap' } });

                if (bestTrack) {
                    const pct = Math.round(bestTrack.top4Rate * 100);
                    const winPct = Math.round(bestTrack.winRate * 100);
                    const label = bestTrack.winRate >= 0.4 ? '🏆 Dominant' : bestTrack.top4Rate >= 0.7 ? '🔥 Heavy Favorite' : '⭐ Strong Track';
                    const labelColor = bestTrack.winRate >= 0.4 ? '#F59E0B' : '#10B981';
                    tcWrap.appendChild(h('div', {
                        style: {
                            flex: 1, minWidth: '180px', background: '#060A10',
                            border: '1px solid #10B98133', borderRadius: '8px', padding: '12px 14px',
                        }
                    },
                        h('div', { style: { fontSize: '12px', fontWeight: 700, color: '#10B981', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.1em' } }, label),
                        h('div', { style: { fontSize: '16px', fontWeight: 900, color: '#F9FAFB', marginBottom: '6px' } }, bestTrack.track),
                        h('div', { style: { display: 'flex', gap: '14px', fontSize: '13px', color: '#94A3B8' } },
                            h('span', null, `${bestTrack.count} visits`),
                            h('span', { style: { color: '#10B981', fontWeight: 700 } }, `${pct}% top 4`),
                            winPct > 0 ? h('span', { style: { color: '#F59E0B', fontWeight: 700 } }, `${winPct}% wins`) : null,
                        ),
                    ));
                }

                if (worstTrack) {
                    const pct = Math.round((1 - worstTrack.top4Rate) * 100);
                    const worstLabel = worstTrack.dnfRate >= 0.4 ? '💀 Nightmare Track' : worstTrack.score > 0.75 ? '😬 Bogey Track' : '⚠️ Trouble Track';
                    tcWrap.appendChild(h('div', {
                        style: {
                            flex: 1, minWidth: '180px', background: '#060A10',
                            border: '1px solid #EF444422', borderRadius: '8px', padding: '12px 14px',
                        }
                    },
                        h('div', { style: { fontSize: '12px', fontWeight: 700, color: '#EF4444', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.1em' } }, worstLabel),
                        h('div', { style: { fontSize: '16px', fontWeight: 900, color: '#F9FAFB', marginBottom: '6px' } }, worstTrack.track),
                        h('div', { style: { display: 'flex', gap: '14px', fontSize: '13px', color: '#94A3B8' } },
                            h('span', null, `${worstTrack.count} visits`),
                            h('span', { style: { color: '#EF4444', fontWeight: 700 } }, `P${(worstTrack.avgPct * 20).toFixed(1)} avg`),
                            worstTrack.dnfRate > 0 ? h('span', { style: { color: '#F97316', fontWeight: 700 } }, `${Math.round(worstTrack.dnfRate * 100)}% DNF`) : null,
                        ),
                    ));
                }

                tc.appendChild(tcWrap);
                f.appendChild(tc);
            }

            // trophies — only show earned, skip if none yet
            const earned = (G.milestones || []);
            if (earned.length) {
                const milestoneCard = h('div', { className: 'card' });
                milestoneCard.appendChild(cardTitle(`Milestones — ${earned.length} / ${MILESTONE_DEFS.length}`));
                const msGrid = h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(148px,1fr))', gap: '8px' } });
                MILESTONE_DEFS.forEach(def => {
                    const achieved = earned.find(m => m.id === def.id);
                    if (!achieved) return;
                    msGrid.appendChild(h('div', {
                        style: {
                            background: '#060A10', border: '1px solid #F59E0B44',
                            borderRadius: '8px', padding: '10px 12px',
                            display: 'flex', gap: '10px', alignItems: 'flex-start',
                        }
                    },
                        h('div', { style: { fontSize: '22px', lineHeight: 1, flexShrink: 0 } }, def.icon),
                        h('div', null,
                            h('div', { style: { fontSize: '13px', fontWeight: 800, color: '#F9FAFB', lineHeight: 1.2 } }, def.label),
                            h('div', { style: { fontSize: '12px', color: '#94A3B8', marginTop: '3px', lineHeight: 1.3 } }, def.desc),
                            h('div', { style: { fontSize: '11px', color: '#F59E0B', marginTop: '4px', fontWeight: 700 } },
                                `S${achieved.season} W${achieved.week}`
                            ),
                        ),
                    ));
                });
                milestoneCard.appendChild(msGrid);
                f.appendChild(milestoneCard);
            }

            // goals
            const activeGoals = (G.seasonGoals || []).filter(g => g.status === 'active');
            if (activeGoals.length) {
                const gc = h('div', { className: 'card' });
                gc.appendChild(cardTitle('Season Goals'));
                activeGoals.forEach(goal => {
                    const typeColor = goal.type === 'fan_promise' ? '#EC4899' : goal.type === 'sponsor' ? '#10B981' : '#8B5CF6';
                    const typeLabel = goal.type === 'fan_promise' ? '🤝 Fan Promise' : goal.type === 'sponsor' ? '💰 Sponsor Goal' : '⭐ Milestone';
                    const targetLabel = { win: 'Win a race', top5: 'Finish top 5', top10: 'Finish top 10', top5_pts: 'Top 5 in points', top10_pts: 'Top 10 in points', avg_top8: 'Avg top 8 finish' }[goal.target] || goal.target;
                    // check progress
                    // win/top5/top10 are global — any series counts
                    const allSeasonRaces = G.raceHistory.filter(r => r.season === G.season);
                    const allClean = allSeasonRaces.filter(r => !r.dnf && !r.dq);
                    // series-specific races for sponsor/points/avg goals
                    const seasonRaces = G.raceHistory.filter(r => r.season === G.season && r.seriesId === goal.seriesId);
                    const racesDone = seasonRaces.filter(r => !r.dnf && !r.dq);
                    let progress = '';
                    if (goal.target === 'win') progress = allClean.some(r => r.pos === 1) ? '✅ Done' : 'No wins yet';
                    else if (goal.target === 'top5') progress = allClean.some(r => r.pos <= 5) ? '✅ Done' : 'No top 5 yet';
                    else if (goal.target === 'top10') progress = allClean.some(r => r.pos <= 10) ? '✅ Done' : 'No top 10 yet';
                    else if (goal.target === 'top10_pts') progress = '📊 Points standing';
                    else if (goal.target === 'avg_top8') {
                        // best average from any series with 4+ clean finishes
                        const bySeriesAvg = {};
                        G.contracts.forEach(function(c) {
                            const cRaces = G.raceHistory.filter(r => r.season === G.season && r.seriesId === c.seriesId && !r.dnf && !r.dq);
                            if (cRaces.length >= 4) {
                                bySeriesAvg[c.seriesId] = cRaces.reduce((a, r, _, arr) => a + r.pos / arr.length, 0);
                            }
                        });
                        const bestAvg = Object.values(bySeriesAvg).length ? Math.min(...Object.values(bySeriesAvg)) : null;
                        progress = bestAvg !== null ? `Avg P${bestAvg.toFixed(1)}` : racesDone.length >= 2 ? `Avg P${(racesDone.reduce((a,r,_,arr)=>a+r.pos/arr.length,0)).toFixed(1)}` : 'Not enough races';
                    }
                    const rewardStr = [goal.reward.money ? `+${fmtMoney(goal.reward.money)}` : null, goal.reward.rep ? `+${goal.reward.rep} rep` : null, goal.reward.fans ? `+${fmtFans(goal.reward.fans)} fans` : null].filter(Boolean).join(' · ');
                    gc.appendChild(h('div', { style: { padding: '10px 0', borderBottom: '1px solid #0D1117', display: 'flex', gap: '12px', alignItems: 'flex-start' } },
                        h('div', { style: { fontSize: '12px', fontWeight: 700, color: typeColor, background: typeColor + '18', padding: '3px 8px', borderRadius: '4px', whiteSpace: 'nowrap', marginTop: '2px' } }, typeLabel),
                        h('div', { style: { flex: 1 } },
                            h('div', { style: { fontSize: '14px', color: '#E2E8F0', lineHeight: '1.5' } }, goal.desc),
                            h('div', { style: { display: 'flex', gap: '16px', marginTop: '5px', fontSize: '14px' } },
                                h('span', { style: { color: '#94A3B8' } }, 'Target: ', h('span', { style: { color: '#F9FAFB', fontWeight: 700 } }, targetLabel)),
                                h('span', { style: { color: '#94A3B8' } }, 'Reward: ', h('span', { style: { color: typeColor, fontWeight: 700 } }, rewardStr)),
                                h('span', { style: { color: '#94A3B8' } }, 'Progress: ', h('span', { style: { color: progress.startsWith('✅') ? '#10B981' : '#CBD5E1', fontWeight: 700 } }, progress)),
                            ),
                        ),
                    ));
                });
                f.appendChild(gc);
            }

            // teammates
            const allTeammates = G.contracts.flatMap(c => {
                const s = getSeries(c.seriesId);
                return (G.teammates || []).filter(t => t.seriesId === c.seriesId).map(t => ({ ...t, seriesColor: (s && s.color) || '#94A3B8', seriesShort: (s && s.short) || '' }));
            });
            if (allTeammates.length) {
                const tc = h('div', { className: 'card' });
                tc.appendChild(cardTitle('Teammates'));
                allTeammates.forEach(tm => {
                    const races = tm.races || 0;
                    const beatUs = tm.beatUs || 0;
                    const weBeat = tm.weBeat || 0;
                    const happiness = tm.happiness !== undefined ? tm.happiness : 70;
                    const tmForm = tm.tmForm !== undefined ? tm.tmForm : 70;

                    // h2h label
                    const edge = races > 0 ? (weBeat > beatUs ? '#10B981' : weBeat < beatUs ? '#EF4444' : '#CBD5E1') : '#94A3B8';
                    const edgeLabel = races === 0 ? 'No shared races yet' : weBeat > beatUs ? `You lead ${weBeat}-${beatUs}` : weBeat < beatUs ? `They lead ${beatUs}-${weBeat}` : `Even ${weBeat}-${beatUs}`;

                    // bar color from happiness
                    const hColor = happiness >= 65 ? '#10B981' : happiness >= 40 ? '#F59E0B' : '#EF4444';
                    const hLabel = happiness >= 65 ? 'Team happy' : happiness >= 40 ? 'Team watching' : 'Team unhappy';

                    // form
                    const fColor = tmForm >= 65 ? '#10B981' : tmForm >= 40 ? '#94A3B8' : '#EF4444';
                    const fLabel = tmForm >= 65 ? 'them: strong' : tmForm >= 40 ? 'them: average' : 'them: struggling';

                    tc.appendChild(h('div', { style: { padding: '10px 0', borderBottom: '1px solid #0D1117' } },
                        // name, series, h2h
                        h('div', { style: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' } },
                            h('div', { style: { width: '8px', height: '8px', borderRadius: '50%', background: tm.seriesColor, flexShrink: 0 } }),
                            h('div', { style: { flex: 1 } },
                                h('div', { style: { fontSize: '14px', fontWeight: 700, color: '#F9FAFB' } }, tm.name),
                                h('div', { style: { fontSize: '13px', color: '#94A3B8', marginTop: '2px' } }, tm.seriesShort + ' · ' + edgeLabel),
                            ),
                            races > 0 ? h('div', { style: { fontSize: '14px', fontWeight: 800, color: edge } }, weBeat > beatUs ? 'Ahead' : 'Behind') : null,
                        ),
                        // Bottom row: team standing bar + teammate form pill
                        races > 0 ? h('div', { style: { display: 'flex', gap: '10px', alignItems: 'center' } },
                            // Happiness bar
                            h('div', { style: { flex: 1 } },
                                h('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '3px' } },
                                    h('span', { style: { color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em' } }, 'Team standing'),
                                    h('span', { style: { color: hColor, fontWeight: 700 } }, hLabel),
                                ),
                                h('div', { style: { height: '4px', background: '#1E2433', borderRadius: '2px', overflow: 'hidden' } },
                                    h('div', { style: { height: '100%', width: `${happiness}%`, background: hColor, borderRadius: '2px', transition: 'width 0.4s' } }),
                                ),
                            ),
                            // Teammate form pill
                            h('div', {
                                style: {
                                    fontSize: '12px', fontWeight: 700, color: fColor,
                                    background: fColor + '18', border: `1px solid ${fColor}44`,
                                    borderRadius: '4px', padding: '2px 7px', whiteSpace: 'nowrap', flexShrink: 0,
                                }
                            }, fLabel),
                        ) : null,
                    ));
                });
                f.appendChild(tc);
            }

            // Notable rivals
            const notable = (G.rivals || []).filter(r => relationship(r) !== 'acquaintance');
            if (notable.length) {
                const rc = h('div', { className: 'card' }, cardTitle('Notable Relationships'));
                const wrap = h('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } });
                notable.slice(0, 8).forEach(r => {
                    const rel = relationship(r), col = REL_COLOR[rel];
                    wrap.appendChild(h('div', { style: { background: '#060A10', border: `1px solid ${col}30`, borderRadius: '8px', padding: '10px 14px' } },
                        h('div', { style: { fontWeight: 800, fontSize: '14px', color: '#F9FAFB' } }, r.name),
                        h('div', { style: { fontSize: '12px', color: col, fontWeight: 700, marginTop: '2px' } }, REL_LABEL[rel]),
                        h('div', { style: { fontSize: '12px', color: '#94A3B8' } }, `${r.incidents || 0} inc · ${r.closeRaces || 0} close`),
                    ));
                });
                rc.appendChild(wrap);
                f.appendChild(rc);
            }

            return f;
        }