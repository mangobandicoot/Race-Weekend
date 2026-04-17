// modal system
        function openModal(content) {
            $('modal-box').innerHTML = '';
            $('modal-box').appendChild(content);
            $('modal-overlay').classList.remove('hidden');
        }
        function closeModal() {
            $('modal-overlay').classList.add('hidden');
            $('modal-box').innerHTML = '';
        }

        // contract actions
        function openNegotiateModal(offer) {
            var s = getSeries(offer.seriesId);
            var currentPrizeShare = Math.round((offer.prizeShare || 0.7) * 100);
            var currentWinBonus = offer.winBonus || 0;

            var prizeIn = h('input', { type: 'number', min: currentPrizeShare, max: 95, value: currentPrizeShare, style: { width: '100%' } });
            var winIn = h('input', { type: 'number', min: 0, value: currentWinBonus, style: { width: '100%' } });

            var resultEl = h('div', { style: { fontSize: '14px', marginTop: '12px', minHeight: '20px' } });

            function updateResult() {
                var newPrize = parseInt(prizeIn.value) || currentPrizeShare;
                var newWin = parseInt(winIn.value) || currentWinBonus;
                var prizeAsk = newPrize - currentPrizeShare;
                var winAsk = newWin - currentWinBonus;
                if (prizeAsk <= 0 && winAsk <= 0) {
                    resultEl.textContent = '';
                    return;
                }
                var pressure = (prizeAsk / 5) + (winAsk / (offer.winBonus || 1000) * 3);
                var acceptChance = Math.max(0.05, 0.70 - pressure * 0.15);
                var label = acceptChance > 0.60 ? 'Likely to accept' : acceptChance > 0.35 ? 'Coin flip' : 'Risky ask';
                var col = acceptChance > 0.60 ? '#10B981' : acceptChance > 0.35 ? '#F59E0B' : '#EF4444';
                resultEl.style.color = col;
                resultEl.textContent = label + ' (' + Math.round(acceptChance * 100) + '% chance)';
            }

            prizeIn.addEventListener('input', updateResult);
            winIn.addEventListener('input', updateResult);

            openModal(h('div', null,
                h('div', { className: 'modal-eyebrow' }, offer.team + ' — ' + s.short),
                h('div', { className: 'modal-title' }, 'Counter Offer'),
                h('div', { style: { fontSize: '14px', color: '#94A3B8', marginBottom: '16px' } }, 'Ask for better terms. Push too hard and they walk. One counter per offer.'),

                h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '8px' } },
                    h('div', null,
                        h('label', { className: 'modal-label' }, 'Prize Share % (currently ' + currentPrizeShare + '%)'),
                        prizeIn,
                        h('div', { style: { fontSize: '12px', color: '#64748B', marginTop: '4px' } }, 'Max realistic: 95%'),
                    ),
                    h('div', null,
                        h('label', { className: 'modal-label' }, 'Win Bonus (currently ' + fmtMoney(currentWinBonus) + ')'),
                        winIn,
                    ),
                ),
                resultEl,

                h('div', { className: 'modal-actions' },
                    mkBtn('Cancel', 'btn btn-ghost', closeModal),
                    mkBtn('Send Counter', 'btn btn-warn', function () {
                        var newPrize = Math.min(95, Math.max(currentPrizeShare, parseInt(prizeIn.value) || currentPrizeShare));
                        var newWin = Math.max(currentWinBonus, parseInt(winIn.value) || currentWinBonus);
                        var prizeAsk = newPrize - currentPrizeShare;
                        var winAsk = newWin - currentWinBonus;
                        var pressure = (prizeAsk / 5) + (winAsk / Math.max(offer.winBonus || 1000, 1) * 3);
                        var acceptChance = Math.max(0.05, 0.70 - pressure * 0.15);
                        var repHit = prizeAsk > 10 || winAsk > offer.winBonus ? -2 : 0;

                        if (Math.random() < acceptChance) {
                            // deal accepted
                            offer.prizeShare = newPrize / 100;
                            offer.winBonus = newWin;
                            offer._countered = true;
                            if (repHit) G.reputation = Math.max(0, G.reputation + repHit);
                            addLog(G, '🤝 ' + offer.team + ' accepted counter: ' + newPrize + '% prize share, ' + fmtMoney(newWin) + ' win bonus.');
                            saveGame();
                            openModal(h('div', null,
                                h('div', { className: 'modal-eyebrow' }, offer.team + ' — Response'),
                                h('div', { className: 'modal-title', style: { color: '#10B981' } }, '✅ Counter Accepted'),
                                h('div', { style: { background: '#060A10', borderRadius: '8px', padding: '14px', marginBottom: '16px', fontSize: '14px', color: '#E2E8F0', lineHeight: '1.7' } },
                                    offer.team + ' came back with a yes. The updated terms are now active on the offer.',
                                    h('div', { style: { marginTop: '10px', display: 'flex', gap: '16px' } },
                                        h('div', null, h('div', { style: { fontSize: '12px', color: '#94A3B8' } }, 'PRIZE SHARE'), h('div', { style: { fontSize: '20px', fontWeight: 900, color: '#10B981' } }, newPrize + '%')),
                                        h('div', null, h('div', { style: { fontSize: '12px', color: '#94A3B8' } }, 'WIN BONUS'), h('div', { style: { fontSize: '20px', fontWeight: 900, color: '#F59E0B' } }, fmtMoney(newWin))),
                                    ),
                                ),
                                h('div', { className: 'modal-actions' },
                                    mkBtn('Sign Now', 'btn btn-success', function () { closeModal(); doSignContract(offer); }),
                                    mkBtn('Sign Later', 'btn btn-ghost', function () { closeModal(); render(); }),
                                ),
                            ));
                        } else {
                            // nope, gone
                            G.pendingOffers = (G.pendingOffers || []).filter(function (o) { return o.id !== offer.id; });
                            G.offseasonOffers = (G.offseasonOffers || []).filter(function (o) { return o.id !== offer.id; });
                            G.reputation = Math.max(0, G.reputation - 2);
                            addLog(G, '❌ ' + offer.team + ' rejected the counter offer. Offer pulled. Rep -2.');
                            saveGame();
                            openModal(h('div', null,
                                h('div', { className: 'modal-eyebrow' }, offer.team + ' — Response'),
                                h('div', { className: 'modal-title', style: { color: '#EF4444' } }, '❌ Counter Rejected'),
                                h('div', { style: { background: '#060A10', borderRadius: '8px', padding: '14px', marginBottom: '16px', fontSize: '14px', color: '#E2E8F0', lineHeight: '1.7' } },
                                    offer.team + ' didn\'t like the counter. The offer is off the table. Word gets around when negotiations go sideways.',
                                    h('div', { style: { marginTop: '8px', fontSize: '14px', color: '#EF4444', fontWeight: 700 } }, 'Rep -2. Offer removed.'),
                                ),
                                h('div', { className: 'modal-actions' },
                                    mkBtn('Close', 'btn btn-ghost', function () { closeModal(); render(); }),
                                ),
                            ));
                        }
                    }),
                ),
            ));
        }

                function doSignContract(offer) {
            // already signed here, bail out quietly
            if (G.contracts.find(c => c.seriesId === offer.seriesId && !c.indie)) {
                // just drop it
                G.pendingOffers = G.pendingOffers.filter(o => o.id !== offer.id);
                G.offseasonOffers = (G.offseasonOffers || []).filter(o => o.id !== offer.id);
                saveGame(); render();
                return;
            }
            // swap indie for the real deal
            G.contracts = G.contracts.filter(c => !(c.seriesId === offer.seriesId && c.indie));
            G.contracts.push(offer);
            // clear from both offer pools
            G.pendingOffers = G.pendingOffers.filter(o => o.id !== offer.id);
            G.offseasonOffers = (G.offseasonOffers || []).filter(o => o.id !== offer.id);
            // burn one interaction off remaining free agency offers
            if (G.offseasonPhase) tickFreeAgencyOffers(G);
            if (!G.schedules[offer.seriesId]) {
                G.schedules[offer.seriesId] = generateSchedule(offer.seriesId, G.trackPools);
                // joining mid-season - skip ahead so first race lines up with current week
                const newSched = G.schedules[offer.seriesId];
                // only skip if races have actually been run, not just week advances in dev mode
                const racesRunElsewhere = (G.raceHistory || []).filter(function(rh) {
                    return rh.season === G.season && rh.seriesId !== offer.seriesId;
                }).length;
                const racesAlreadyDone = racesRunElsewhere > 0 ? Math.max(0, G.week - 1) : 0;
                // dont skip more than half the season or theres nothing left to race
                const skipCount = Math.min(racesAlreadyDone, Math.floor(newSched.length * 0.5));
                for (let si = 0; si < skipCount; si++) {
                    if (!newSched[si].result) {
                        var midSimResult = simulateRaceBackground(offer.seriesId, si, true);
                        newSched[si].result = midSimResult || {
                            skipped: true, simulated: true, position: 0, fieldSize: 20,
                            dnf: false, dq: false, points: 0, prize: 0,
                            finishOrder: [], winner: null,
                            summary: 'Joined series mid-season.',
                        };
                    }
                }
                assignSeasonAttendance(G, offer.seriesId);
            }
            G.championshipPoints[offer.seriesId] = G.championshipPoints[offer.seriesId] || 0;
            G.championshipPoints[offer.seriesId] = G.championshipPoints[offer.seriesId] || 0;
            // pick teammates from real paste results first, generated pool as last resort
            const tmCount = offer.teammates.length || 0;
            if (tmCount > 0) {
                const assigned = [];
                for (let i = 0; i < tmCount; i++) {
                    // real pasted drivers only, not the player, not already on the team
                    const eligible = (G.drivers || []).filter(d =>
                        d.source === 'known' &&
                        d.currentSeriesId === offer.seriesId &&
                        d.active &&
                        !d.injuredOrPenalized &&
                        d.name.toLowerCase() !== G.driverName.toLowerCase() &&
                        !(G.teammates || []).find(t => t.name === d.name) &&
                        !assigned.find(a => a.name === d.name)
                    );
                    let driver;
                    if (eligible.length) {
                        // whoever shows up most in results is the most realistic pick
                        driver = eligible.sort((a, b) => (b.starts || 0) - (a.starts || 0))[0];
                    } else {
                        // No known drivers available — leave slot empty, will fill when a real driver appears
                        addLog(G, `📋 ${offer.team} teammate slot open — will fill from race results`);
                        continue;
                    }
                    driver.currentTeam = offer.team;
                    driver.currentSeriesId = offer.seriesId;
                    assigned.push(driver);
                }
                // Keep unfilled slots as null placeholders so auto-fill can detect them
                const filledCount = assigned.length;
                const totalSlots = tmCount;
                offer.teammates = assigned.map(function (d) { return { name: d.name, seriesId: offer.seriesId }; }).concat(new Array(totalSlots - filledCount).fill(null));
                assigned.forEach(function (d) {
                    if (!(G.teammates || []).find(function (t) { return t.name === d.name; }))
                        G.teammates.push({ name: d.name, seriesId: offer.seriesId });
                });

                // Fire paddock reactions from drivers who have history with your new teammates
                assigned.forEach(function (tm) {
                    if (!tm || !tm.name) return;
                    var tmRivals = tm.aiRivals || [];
                    var tmFriends = tm.aiFriends || [];
                    var allDrivers = G.drivers || [];

                    tmRivals.forEach(function (rivalName) {
                        var rival = allDrivers.find(function (d) { return d.name === rivalName && d.source === 'known'; });
                        if (!rival || Math.random() > 0.6) return;
                        var lines = [
                            rival.name + ' on the paddock grapevine: "So ' + tm.name + ' and ' + G.driverName + ' are teammates now. Interesting choice. We\'ll see how that garage gets along."',
                            'Word is ' + rival.name + ' had some things to say about ' + G.driverName + ' signing with ' + offer.team + '. Specifically about ' + tm.name + ' being on that roster.',
                            rival.name + ' to a reporter: "I\'ve raced ' + tm.name + ' for years. Now they\'re in the same program as ' + G.driverName + '. I\'ll just say I know both of them well. Very well."',
                            rival.name + ' wasn\'t subtle about it: "That ' + offer.team + ' lineup is going to be must-watch. For all the right and wrong reasons."',
                            'Overheard in the paddock — ' + rival.name + ' to their crew: "Did you see who ' + G.driverName + ' is teamed up with? ' + tm.name + '. Yeah. This should be interesting."',
                        ];
                        G.dramaQueue.push({
                            id: 'pairing_reaction_' + uid(),
                            title: rival.name + ' Reacts to Your Signing',
                            effect: 'none',
                            desc: lines[Math.floor(Math.random() * lines.length)],
                            valence: 'neutral',
                            _isCallout: true,
                            _calloutDriver: rival.name,
                        });
                    });

                    tmFriends.forEach(function (friendName) {
                        var friend = allDrivers.find(function (d) { return d.name === friendName && d.source === 'known'; });
                        if (!friend || Math.random() > 0.5) return;
                        var lines = [
                            friend.name + ' on social: "Congrats to ' + tm.name + ' on the ' + offer.team + ' deal. And welcome to ' + G.driverName + ' — that\'s a good garage right there."',
                            friend.name + ' to the paddock press: "Glad to see ' + tm.name + ' and ' + G.driverName + ' together. Those two are going to push each other."',
                            'Word from ' + friend.name + ': "I\'ve raced with ' + tm.name + ' a long time. ' + G.driverName + ' is lucky to have them. And vice versa."',
                            friend.name + ' posted a fire emoji reacting to the ' + offer.team + ' lineup announcement. Paddock took notice.',
                        ];
                        G.dramaQueue.push({
                            id: 'pairing_support_' + uid(),
                            title: friend.name + ' Weighs In',
                            effect: 'none',
                            desc: lines[Math.floor(Math.random() * lines.length)],
                            valence: 'good',
                        });
                    });

                    if ((tm.aiRivals || []).includes(G.driverName)) {
                        G.dramaQueue.push({
                            id: 'tm_tension_' + uid(),
                            title: 'Uneasy Partnership',
                            effect: 'none',
                            desc: 'Word in the paddock is ' + tm.name + ' wasn\'t exactly thrilled about sharing a garage with you. The team made the call. Should be an interesting season.',
                            valence: 'neutral',
                        });
                    } else if ((tm.aiFriends || []).includes(G.driverName)) {
                        G.dramaQueue.push({
                            id: 'tm_warmth_' + uid(),
                            title: tm.name + ' Requested the Pairing',
                            effect: 'none',
                            desc: 'Sources say ' + tm.name + ' specifically asked about running alongside you this season. They\'ve been watching your career. That means something in this paddock.',
                            valence: 'good',
                        });
                    }
                });
            }
            // Generate sponsor offers
            const fresh = sponsorOffersForSeries(offer.seriesId);
            fresh.forEach(sp => { if (!G.sponsorOffers.find(s => s.brand === sp.brand)) G.sponsorOffers.push(sp); });
            // Generate season goals when first contract is signed (if none exist yet)
            if (!(G.seasonGoals || []).filter(g => g.status === 'active').length) {
                G.seasonGoals = G.seasonGoals || [];
                const newGoals = generateSeasonGoals(G);
                G.seasonGoals.push(...newGoals);
                if (newGoals.length) addLog(G, `🎯 ${newGoals.length} season goal${newGoals.length > 1 ? 's' : ''} set for Season ${G.season}.`);
            }
            // Pay signing bonus (national-level teams only)
            if (offer.salary > 0) {
                G.money += offer.salary;
                G.totalPrizeMoney += offer.salary;
                addLog(G, `💰 Signing bonus from ${offer.team}: +${fmtMoney(offer.salary)}`);
            }
            const prizeSharePct = Math.round((offer.prizeShare || 1.0) * 100);
            const entryNote = `Entry fee: ${fmtMoney(offer.entryFee || (getSeries(offer.seriesId) && getSeries(offer.seriesId).fee) || 0)}/race · Prize share: ${prizeSharePct}% yours`;
            addLog(G, `✍️ Signed with ${offer.team} — ${getSeries(offer.seriesId).name}. ${entryNote}. ${offer.termSeasons} season deal.`);

            // pit road → contract carry-over
            // Find all pit entries for this series this season that were actually raced
            var _pitRaced = (G.pitEntries || []).filter(function(pe) {
                return pe.seriesId === offer.seriesId && pe.season === G.season && pe._raced;
            });
            if (_pitRaced.length) {
                // Count races completed via pit entry
                var _pitCount = _pitRaced.length;

                // Carry points already scored into seriesFields under the player's name
                var _playerKey = G.driverAlias || G.driverName;
                if (!G.seriesFields[offer.seriesId]) G.seriesFields[offer.seriesId] = {};
                var _field = G.seriesFields[offer.seriesId];
                if (!_field[_playerKey]) _field[_playerKey] = { points: 0, wins: 0, top5s: 0, starts: 0 };
                var _pitPts = G.championshipPoints[offer.seriesId] || 0;
                // seriesFields points are already set by processRaceResult during pit entry —
                // just make sure the player entry exists and matches championshipPoints
                _field[_playerKey].points = Math.max(_field[_playerKey].points || 0, _pitPts);
                _field[_playerKey].starts = Math.max(_field[_playerKey].starts || 0, _pitCount);

                // Drama: acknowledge the promotion from pit entry to full seat
                var _pitS = getSeries(offer.seriesId);
                var _pitSeriesName = _pitS ? _pitS.name : offer.seriesId;
                var _pitLines = [
                    offer.team + ' had been watching. The ' + _pitCount + ' pit entries in ' + _pitSeriesName + ' were enough to make the case. Full seat secured.',
                    _pitCount + ' race' + (_pitCount > 1 ? 's' : '') + ' on single entries in ' + _pitSeriesName + ' turned into a contract. That is how it is supposed to work.',
                    'The single entries in ' + _pitSeriesName + ' opened the door. ' + offer.team + ' walked through it and offered the full deal. ' + _pitCount + ' race' + (_pitCount > 1 ? 's' : '') + ' worth of proof.',
                    offer.team + ' did not need a full resume. ' + _pitCount + ' solid run' + (_pitCount > 1 ? 's' : '') + ' on the pit road entry list told them what they needed to know.',
                ];
                G.dramaQueue.push({
                    id: 'pit_to_contract_' + uid(),
                    title: 'Pit Entry Becomes a Full Seat',
                    effect: 'none',
                    desc: _pitLines[rand(0, _pitLines.length - 1)],
                    valence: 'good',
                });
                addLog(G, '📋 ' + _pitCount + ' pit entr' + (_pitCount > 1 ? 'ies' : 'y') + ' in ' + _pitSeriesName + ' carried over to new contract.');
            }

            saveGame(); render();
        }

        function doTerminateContract(seriesId, penalty) {
            const c = G.contracts.find(c => c.seriesId === seriesId);
            if (!c) return;
            openModal(h('div', null,
                h('div', { className: 'modal-title', style: { color: '#EF4444', marginBottom: '8px' } }, 'Terminate Contract?'),
                h('div', { className: 'modal-sub' }, `${c.team} — ${(getSeries(seriesId) && getSeries(seriesId).name) || ''}`),
                h('div', { style: { background: '#060A10', borderRadius: '8px', padding: '14px', marginBottom: '16px', fontSize: '14px', color: '#E2E8F0' } },
                    `Exit penalty: `, h('span', { style: { color: '#EF4444', fontWeight: 800, fontSize: '17px' } }, fmtMoney(penalty)),
                    h('br'), h('div', { style: { fontSize: '14px', color: '#94A3B8', marginTop: '6px' } }, 'This will be deducted from your account immediately.'),
                ),
                h('div', { className: 'modal-actions' },
                    mkBtn('Cancel', 'btn btn-ghost', closeModal),
                    mkBtn(`Pay ${fmtMoney(penalty)} & Leave`, 'btn btn-danger', () => {
                        closeModal();
                        G.money -= penalty;
                        G.contracts = G.contracts.filter(c => c.seriesId !== seriesId);
                        G.teammates = G.teammates.filter(t => t.seriesId !== seriesId);
                        addLog(G, `🚪 Terminated ${getSeries(seriesId).short} contract with ${c.team}. Penalty: ${fmtMoney(penalty)}`);
                        saveGame(); render();
                    }),
                )
            ));
        }

        // sponsor actions
        function doSignSponsor(sp) {
            // Convert season value to per-race payment stored on the sponsor object
            const s = getSeries(sp.seriesId);
            const races = s ? s.races : 10;
            sp.valuePerRace = sp.valuePerRace || Math.floor(sp.valuePerSeason / Math.max(races, 1));
            G.sponsors.push(sp);
            G.sponsorOffers = G.sponsorOffers.filter(s => s.id !== sp.id);
            // Small signing advance — 1 race worth, not the whole season
            const advance = sp.valuePerRace;
            G.money += advance;
            G.totalPrizeMoney += advance;
            addLog(G, `🤝 Signed ${sp.brand} (${sp.type}) — ${fmtMoney(sp.valuePerRace)}/race · ${fmtMoney(sp.valuePerSeason)}/season · ${sp.seasonsLeft} season(s). Advance: ${fmtMoney(advance)}.`);
            saveGame(); render();
        }

        // crew
        function doUpgradeCrew(seriesId, pkg) {
            const c = G.contracts.find(c => c.seriesId === seriesId);
            if (!c || G.money < pkg.cost) return;
            G.money -= pkg.cost;
            c.crewPackage = pkg.id;
            addLog(G, `🔧 ${getSeries(seriesId).short}: upgraded to ${pkg.name} crew package.${pkg.qualBonus > 0 ? ` +${pkg.qualBonus} qualifying positions.` : ''}`);
            saveGame(); render();
        }

        // off-track
        function doOffTrackEvent(evt) {
            if (G.money < evt.cost) return;
            G.money -= evt.cost;
            var _tier = G.contracts.length ? Math.max(...G.contracts.map(function(c) { var s = getSeries(c.seriesId); return s && !s.isSideStep ? (s.tier || 1) : 1; })) : 1;
            var _offMult = [1, 0.3, 0.5, 0.8, 1.2, 2.0, 3.5, 6.0][Math.min(_tier, 7)] || 0.3;
            var scaledRep = Math.round(evt.rep * _offMult);
            var scaledFans = Math.round(evt.fans * _offMult);
            G.reputation += scaledRep;
            G.fans = Math.max(0, G.fans + scaledFans);
            G.sponsors = G.sponsors.map(sp => ({ ...sp, happiness: Math.min(100, sp.happiness + evt.sponsorHappy) }));
            if (!G.offTrackDone) G.offTrackDone = [];
            G.offTrackDone.push(evt.id + '_s' + G.season);
            addLog(G, `🎯 ${evt.label}: +${scaledRep} rep, +${fmtFans(scaledFans)} fans`);
            saveGame(); render();
        }

        // drama
        function doDismissDrama(idx) {
            const d = G.dramaQueue[idx]; if (!d) return;
            let effectDesc = '';
            if (d.effect === 'money' && d.value) {
                G.money += d.value;
                if (d.value > 0) G.totalPrizeMoney += d.value;
                effectDesc = d.value > 0 ? ` (+${fmtMoney(d.value)})` : ` (${fmtMoney(d.value)})`;
            }
            if (d.effect === 'rep_hit' && d.value) {
                G.reputation = Math.max(0, G.reputation + d.value);
                effectDesc = ` (Rep ${d.value})`;
                if (d.fans) { G.fans = Math.max(0, G.fans + d.fans); effectDesc += ` (Fans ${d.fans})`; }
            }
            if (d.effect === 'rep_fans') {
                if (d.value) { G.reputation = Math.max(0, G.reputation + d.value); effectDesc += ` (Rep +${d.value})`; }
                if (d.fans) { G.fans = Math.max(0, G.fans + d.fans); effectDesc += ` (Fans +${fmtFans(d.fans)})`; }
            }
            G.log.push(`[S${G.season} W${G.week}] 📰 ${d.title}${effectDesc}: ${d.desc.slice(0, 100)}`);
            G.dramaQueue.splice(idx, 1);
            saveGame(); render();
        }