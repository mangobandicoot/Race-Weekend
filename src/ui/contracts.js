// contracts
        function renderContracts() {
            const f = document.createDocumentFragment();
            f.appendChild(h('div', { className: 'page-title' }, 'Contracts & Independence'));
            f.appendChild(h('div', { className: 'page-sub' }, `Rep (${G.reputation}) and fans (${fmtFans(G.fans)}) determine team offers. Or run independent — pay your own way, keep everything.`));

            // free agency window
            const faOffers = G.offseasonOffers || [];
            if (faOffers.length) {
                f.appendChild(h('div', { style: { marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '10px' } },
                    h('div', { style: { fontSize: '14px', fontWeight: 900, color: '#F59E0B' } }, '🔥 FREE AGENCY'),
                    h('div', { style: { fontSize: '14px', color: '#EF4444' } }, 'Offers expire — act fast.'),
                ));
                faOffers.forEach(offer => {
                    const s = getSeries(offer.seriesId);
                    const qc = { poor: '#94A3B8', average: '#3B82F6', good: '#10B981', elite: '#F59E0B' }[offer.quality];
                    const signed = G.contracts.find(c => c.seriesId === offer.seriesId && !c.indie);
                    const urgencyColor = offer.expiresIn === 1 ? '#EF4444' : offer.expiresIn === 2 ? '#F97316' : '#F59E0B';
                    const card = h('div', { className: 'card', style: { borderColor: urgencyColor + '44' } });
                    card.appendChild(h('div', { style: { display: 'flex', gap: '14px', alignItems: 'flex-start', flexWrap: 'wrap' } },
                        h('div', { style: { width: '48px', height: '48px', borderRadius: '8px', background: s.color + '18', border: `2px solid ${s.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 900, color: s.color, flexShrink: 0 } }, `T${s.tier}`),
                        h('div', { style: { flex: 1 } },
                            h('div', { style: { display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '5px', flexWrap: 'wrap' } },
                                h('span', { style: { fontSize: '17px', fontWeight: 900, color: '#F9FAFB' } }, offer.team),
                                badge(offer.quality.toUpperCase(), qc),
                                badge(`${offer.termSeasons} season${offer.termSeasons > 1 ? 's' : ''}`, '#94A3B8'),
                                badge(`⏰ ${offer.expiresIn} left`, urgencyColor),
                            ),
                            h('div', { style: { fontSize: '14px', color: s.color, fontWeight: 700, marginBottom: '5px' } }, s.name),
                            h('div', { style: { fontSize: '14px', color: '#94A3B8' } }, s.desc),
                        ),
                        h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', minWidth: '190px' } },
                            ...[
                                ['Prize Share', `${Math.round((offer.prizeShare || 0.7) * 100)}% yours`, '#10B981'],
                                ['Entry Fee', fmtMoney(offer.entryFee || (getSeries(offer.seriesId) && getSeries(offer.seriesId).fee) || 0), '#EF4444'],
                                ['Win Bonus', fmtMoney(offer.winBonus), '#F59E0B'],
                                ['Req Finish', `Top ${offer.reqFinish}`, '#CBD5E1'],
                                ['Teammates', offer.teammates && offer.teammates.filter(t => t && t.name).length > 0 ? `${offer.teammates.filter(t => t && t.name).length}/${offer.teammates.length} slot${offer.teammates.length > 1 ? 's' : ''}` : 'None', '#94A3B8'],
                            ].map(([l, v, c]) => h('div', { style: { background: '#060A10', borderRadius: '7px', padding: '9px 11px', border: '1px solid #1E2433' } },
                                h('div', { style: { fontSize: '12px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' } }, l),
                                h('div', { style: { fontSize: '14px', fontWeight: 800, color: c || '#E5E7EB', marginTop: '2px' } }, v),
                            ))
                        ),
                    ));
                    card.appendChild(h('div', { style: { display: 'flex', gap: '8px', marginTop: '14px', justifyContent: 'flex-end' } },
                        mkBtn('Pass', 'btn btn-sm btn-ghost', () => {
                            G.offseasonOffers = (G.offseasonOffers || []).filter(o => o.id !== offer.id);
                            if (G.offseasonPhase) tickFreeAgencyOffers(G);
                            saveGame(); render();
                        }),
                        signed ? badge('Already signed', '#94A3B8') : mkBtn('Counter', 'btn btn-sm btn-warn', function () { openNegotiateModal(offer); }),
                        signed ? null : mkBtn('Sign — Free Agency', 'btn btn-sm btn-success', function () { doSignContract(offer); }),
                    ));
                    f.appendChild(card);
                });
                f.appendChild(h('div', { style: { height: '1px', background: '#1E2433', margin: '16px 0' } }));
            }

            // mid-season offers
           // Check if player is currently running open entry at tier 1-2
            const openEntryContract = (G.contracts || []).find(function(c) { return c.noContractRequired; });
            const playerTierNow = G.contracts.length
                ? Math.max(...G.contracts.map(function(c) { return (getSeries(c.seriesId) && getSeries(c.seriesId).tier) || 1; }))
                : 0;

            if (!G.pendingOffers.length && !faOffers.length) {
                if (openEntryContract && playerTierNow <= 2) {
                    f.appendChild(h('div', { className: 'card', style: { padding: '20px 24px' } },
                        h('div', { style: { fontSize: '15px', fontWeight: 800, color: '#F9FAFB', marginBottom: '6px' } }, '🏁 Open Entry — No Contract Required'),
                        h('div', { style: { fontSize: '14px', color: '#94A3B8', lineHeight: '1.6' } },
                            'At this level you show up, pay the entry fee, and race. No team, no paperwork, no salary. You keep all your prize money. Team offers start appearing once you\'ve built enough reputation to move up to Tier 3.'
                        ),
                        h('div', { style: { marginTop: '12px', display: 'flex', gap: '12px', flexWrap: 'wrap' } },
                            h('div', { style: { background: '#060A10', borderRadius: '7px', padding: '9px 14px', border: '1px solid #1E2433' } },
                                h('div', { style: { fontSize: '11px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em' } }, 'Entry Fee'),
                                h('div', { style: { fontSize: '15px', fontWeight: 800, color: '#EF4444', marginTop: '2px' } }, fmtMoney(openEntryContract.entryFee || 120) + ' / race'),
                            ),
                            h('div', { style: { background: '#060A10', borderRadius: '7px', padding: '9px 14px', border: '1px solid #1E2433' } },
                                h('div', { style: { fontSize: '11px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em' } }, 'Prize Share'),
                                h('div', { style: { fontSize: '15px', fontWeight: 800, color: '#10B981', marginTop: '2px' } }, '100% yours'),
                            ),
                            h('div', { style: { background: '#060A10', borderRadius: '7px', padding: '9px 14px', border: '1px solid #1E2433' } },
                                h('div', { style: { fontSize: '11px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em' } }, 'Team Offers'),
                                h('div', { style: { fontSize: '15px', fontWeight: 800, color: '#94A3B8', marginTop: '2px' } }, 'Rep ' + (getSeries('late_model_stock') ? getSeries('late_model_stock').reqRep : 80) + ' required'),
                            ),
                        ),
                    ));
                } else {
                    f.appendChild(h('div', { className: 'card', style: { textAlign: 'center', padding: '28px', color: '#94A3B8', fontSize: '15px' } }, 'No team offers right now. Keep racing.'));
                }
            }
            if (G.pendingOffers.length) {
                f.appendChild(h('div', { style: { fontSize: '14px', fontWeight: 700, color: '#94A3B8', marginBottom: '10px', letterSpacing: '0.1em' } }, 'MID-SEASON OFFERS'));
            }
            G.pendingOffers.forEach(offer => {
                const s = getSeries(offer.seriesId);
                const qc = { poor: '#94A3B8', average: '#3B82F6', good: '#10B981', elite: '#F59E0B' }[offer.quality];
                const signed = G.contracts.find(c => c.seriesId === offer.seriesId && !c.indie);
                const card = h('div', { className: 'card' });
                card.appendChild(h('div', { style: { display: 'flex', gap: '14px', alignItems: 'flex-start', flexWrap: 'wrap' } },
                    h('div', { style: { width: '48px', height: '48px', borderRadius: '8px', background: s.color + '18', border: `2px solid ${s.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 900, color: s.color, flexShrink: 0 } }, `T${s.tier}`),
                    h('div', { style: { flex: 1 } },
                        h('div', { style: { display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '5px', flexWrap: 'wrap' } },
                            h('span', { style: { fontSize: '17px', fontWeight: 900, color: '#F9FAFB' } }, offer.team),
                            badge(offer.quality.toUpperCase(), qc),
                            badge(`${offer.termSeasons} season${offer.termSeasons > 1 ? 's' : ''}`, '#94A3B8'),
                        ),
                        h('div', { style: { fontSize: '14px', color: s.color, fontWeight: 700, marginBottom: '5px' } }, s.name),
                        h('div', { style: { fontSize: '14px', color: '#94A3B8' } }, s.desc),
                    ),
                    h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', minWidth: '190px' } },
                        ...[
                            ['Prize Share', `${Math.round((offer.prizeShare || 0.7) * 100)}% yours`, '#10B981'],
                            ['Entry Fee', fmtMoney(offer.entryFee || (getSeries(offer.seriesId) && getSeries(offer.seriesId).fee) || 0), '#EF4444'],
                            ['Win Bonus', fmtMoney(offer.winBonus), '#F59E0B'],
                            ['Req Finish', `Top ${offer.reqFinish}`, '#CBD5E1'],
                            ['Teammates', offer.teammates && offer.teammates.length > 0 ? `${offer.teammates.length} slot${offer.teammates.length > 1 ? 's' : ''}` : 'None', '#94A3B8'],
                        ].map(([l, v, c]) => h('div', { style: { background: '#060A10', borderRadius: '7px', padding: '9px 11px', border: '1px solid #1E2433' } },
                            h('div', { style: { fontSize: '12px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' } }, l),
                            h('div', { style: { fontSize: '14px', fontWeight: 800, color: c || '#E5E7EB', marginTop: '2px' } }, v),
                        ))
                    ),
                ));
                card.appendChild(h('div', { style: { display: 'flex', gap: '8px', marginTop: '14px', justifyContent: 'flex-end' } },
                    mkBtn('Pass', 'btn btn-sm btn-ghost', () => { G.pendingOffers = G.pendingOffers.filter(o => o.id !== offer.id); saveGame(); render(); }),
                    signed ? mkBtn('Hold for Offseason', 'btn btn-sm btn-secondary', function () {
                        if (!G.savedForOffseason) G.savedForOffseason = [];
                        if (!G.savedForOffseason.find(function (o) { return o.id === offer.id; })) {
                            G.savedForOffseason.push(offer);
                            addLog(G, '📋 Saved ' + offer.team + ' offer for offseason consideration.');
                        }
                        G.pendingOffers = G.pendingOffers.filter(function (o) { return o.id !== offer.id; });
                        saveGame(); render();
                    }) : mkBtn('Counter', 'btn btn-sm btn-warn', function () { openNegotiateModal(offer); }),
                    signed ? null : mkBtn('Sign Contract', 'btn btn-sm btn-success', function () { doSignContract(offer); }),
                ));
                f.appendChild(card);
            });

            // active contracts
            if (G.contracts.length) {
                f.appendChild(h('div', { style: { fontSize: '14px', fontWeight: 800, color: '#94A3B8', marginBottom: '10px', marginTop: '20px', letterSpacing: '0.1em' } }, 'ACTIVE CONTRACTS'));
                G.contracts.forEach(c => {
                    const s = getSeries(c.seriesId);
                    const racesLeft = (G.schedules[c.seriesId] || []).filter(r => !r.result).length;
                    const seasonsLeft = c.termSeasons - c.seasonsCompleted;
                    const penalty = Math.floor((c.salary || 0) * seasonsLeft * c.penaltyRate + s.fee * racesLeft * 0.3);
                    const prizeSharePct = Math.round((c.prizeShare || 1.0) * 100);
                    f.appendChild(h('div', { className: 'row-item', style: { borderColor: s.color + '28' } },
                        accent(s.color),
                        h('div', { style: { flex: 1 } },
                            h('span', { style: { fontWeight: 800, fontSize: '14px', color: '#F9FAFB' } },
                                c.indie ? '🔧 Independent' :
                                c.teamStyle === 'independent' ? '🔧 ' + c.team + ' (Independent)' :
                                c.teamStyle === 'small_team' ? '🏚️ ' + c.team :
                                c.team
                            ),
                            h('span', { style: { color: '#94A3B8', fontSize: '14px' } }, ` — ${s.short} · ${racesLeft} races · ${seasonsLeft} season(s) left`),
                            h('div', { style: { fontSize: '14px', color: '#94A3B8', marginTop: '2px' } },
                                c.indie
                                    ? `Entry: ${fmtMoney(s.fee)}/race · You keep 100% prize`
                                    : `Entry: ${fmtMoney(c.entryFee || s.fee)}/race · Prize share: ${prizeSharePct}% yours · Win bonus: ${fmtMoney(c.winBonus)}`
                            ),
                            (function() {
                                var sub = getSeriesCar(c.seriesId);
                                if (!sub) return null;
                                return h('div', { style: { fontSize: '13px', color: '#F59E0B', marginTop: '3px', display: 'flex', gap: '8px', alignItems: 'center' } },
                                    h('span', null, '🚗 Sub car: ' + sub.name),
                                    mkBtn('I own the real car', 'btn btn-xs btn-secondary', function() {
                                        if (!G.ownedCars) G.ownedCars = {};
                                        G.ownedCars[c.seriesId] = true;
                                        addLog(G, '🚗 Confirmed ownership of ' + (s && s.short) + ' car.');
                                        saveGame(); render();
                                    }),
                                );
                            })(),
                            c.teammates && c.teammates.filter(t => t && t.name).length ? h('div', { style: { fontSize: '14px', color: '#94A3B8', marginTop: '2px' } }, `Teammates: ${c.teammates.filter(t => t && t.name).map(t => t.name).join(', ')}`) : null,
                        ),
                        !c.indie ? h('div', { style: { textAlign: 'right', flexShrink: 0 } },
                            h('div', { style: { fontSize: '12px', color: '#94A3B8' } }, 'EXIT PENALTY'),
                            h('div', { style: { fontSize: '15px', fontWeight: 800, color: '#EF4444', marginBottom: '5px' } }, fmtMoney(penalty)),
                            mkBtn('Terminate', 'btn btn-sm btn-danger', () => doTerminateContract(c.seriesId, penalty)),
                        ) : null,
                    ));
                });
            }

            // independent racing option

            f.appendChild(h('div', { className: 'card', style: { marginTop: '20px', borderColor: '#374151' } },
                h('div', { style: { display: 'flex', gap: '14px', alignItems: 'flex-start', flexWrap: 'wrap' } },
                    h('div', { style: { width: '48px', height: '48px', borderRadius: '8px', background: '#1E2433', border: '2px solid #374151', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 } }, '🔧'),
                    h('div', { style: { flex: 1 } },
                        h('div', { style: { fontSize: '17px', fontWeight: 900, color: '#F9FAFB', marginBottom: '4px' } }, 'Run Independent'),
                        h('div', { style: { fontSize: '14px', color: '#94A3B8', marginBottom: '8px' } }, 'No team, no salary, no obligations. Pay entry fees and all repairs yourself. Keep 100% of prize money.'),
                        h('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
                            ...SERIES.filter(s => !s.isSideStep && (s.tier === 1 || (G.reputation || 0) >= s.reqRep && (G.fans || 0) >= s.reqFans)).map(s => {
                                const activeContract = G.contracts.find(c => c.seriesId === s.id);
                                return h('div', { style: { background: '#060A10', border: `1px solid ${s.color}33`, borderRadius: '7px', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px' } },
                                    h('span', { style: { color: s.color, fontWeight: 700, fontSize: '14px' } }, s.short),
                                    h('span', { style: { fontSize: '14px', color: '#94A3B8' } }, `Entry: ${fmtMoney(s.fee)}/race`),
                                    activeContract
                                        ? badge(activeContract.indie ? 'Running Indie' : 'Team Signed', '#64748B')
                                        : mkBtn('Go Indie →', 'btn btn-xs btn-primary', () => doGoIndependent(s.id)),
                                );
                            })
                        ),
                    ),
                ),
            ));

            // pr spend
            f.appendChild(h('div', { className: 'card', style: { marginTop: '14px' } },
                cardTitle('PR & Media Spend'),
                h('div', { style: { fontSize: '14px', color: '#94A3B8', marginBottom: '12px' } }, 'Convert money directly into reputation or fan growth. One purchase per type per season.'),
                h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '10px' } },
                    ...[
                        { id: 'pr_rep_sm', label: 'Local Press Run', cost: 500, rep: 4, fans: 0, desc: 'Local paper coverage. Small rep bump.' },
                        { id: 'pr_fans_sm', label: 'Fan Appearance', cost: 300, rep: 0, fans: 300, desc: 'Autograph session. Grows local fanbase.' },
                        { id: 'pr_rep_md', label: 'Regional Media Blitz', cost: 1500, rep: 8, fans: 200, desc: 'Radio, local TV, a few podcasts.' },
                        { id: 'pr_fans_md', label: 'Social Media Push', cost: 800, rep: 2, fans: 600, desc: 'Hire someone who knows what they\'re doing.' },
                        { id: 'pr_rep_lg', label: 'National Feature', cost: 5000, rep: 15, fans: 500, desc: 'National motorsport outlet. Serious exposure.' },
                        { id: 'pr_fans_lg', label: 'Viral Campaign', cost: 3000, rep: 3, fans: 2000, desc: 'You go semi-viral. Fans flood in.' },
                    ].map(item => {
                        const done = (G.offTrackDone || []).includes(item.id + '_s' + G.season);
                        const canAfford = G.money >= item.cost;
                        return h('div', { style: { background: '#060A10', borderRadius: '8px', padding: '12px', border: '1px solid #1E2433', opacity: done ? '0.45' : '1' } },
                            h('div', { style: { fontWeight: 700, fontSize: '14px', color: '#F9FAFB', marginBottom: '3px' } }, item.label),
                            h('div', { style: { fontSize: '14px', color: '#94A3B8', marginBottom: '6px' } }, item.desc),
                            h('div', { style: { fontSize: '14px', color: '#94A3B8', marginBottom: '8px' } },
                                `${fmtMoney(item.cost)}`,
                                item.rep ? h('span', { style: { color: '#F59E0B', marginLeft: '8px' } }, `+${item.rep} rep`) : null,
                                item.fans ? h('span', { style: { color: '#EC4899', marginLeft: '8px' } }, `+${fmtFans(item.fans)} fans`) : null,
                            ),
                            done ? badge('Done this season', '#64748B') :
                                mkBtn(canAfford ? 'Buy' : `Need ${fmtMoney(item.cost - G.money)}`, 'btn btn-xs btn-primary', () => doPRSpend(item), !canAfford),
                        );
                    })
                ),
            ));

            return f;
        }