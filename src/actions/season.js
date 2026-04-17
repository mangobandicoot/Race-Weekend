 // season advance
        function openOffseasonSummaryModal() {
            var seasonHistory = G.seasonHistory || [];
            var last = seasonHistory[seasonHistory.length - 1];
            if (!last) { render(); return; }

            var topRival = (G.rivals || [])
                .filter(function (r) { return ['rival', 'frenemy'].includes(relationship(r)); })
                .sort(function (a, b) { return ((b.incidents || 0) + (b.closeRaces || 0)) - ((a.incidents || 0) + (a.closeRaces || 0)); })
            [0];
            var topFriend = (G.rivals || [])
                .filter(function (r) { return relationship(r) === 'friend' || relationship(r) === 'racing_rival'; })
                .sort(function (a, b) { return (b.closeRaces || 0) - (a.closeRaces || 0); })
            [0];

            var seasonRaces = (G.raceHistory || []).filter(function (r) { return r.season === last.season; });
            var bestRace = seasonRaces.filter(function (r) { return !r.dnf && !r.dq; }).sort(function (a, b) { return a.pos - b.pos; })[0];
            var worstRace = seasonRaces.filter(function (r) { return !r.dnf && !r.dq; }).sort(function (a, b) { return b.pos - a.pos; })[0];
            var dnfs = seasonRaces.filter(function (r) { return r.dnf; });
            var fansGained = seasonRaces.reduce(function (a, r) { return a + (r.fans || 0); }, 0);

            var repTier = getRepTier(G.reputation);

            openModal(h('div', null,
                h('div', { className: 'modal-eyebrow' }, 'Offseason'),
                h('div', { className: 'modal-title', style: { fontSize: '24px', fontWeight: 900, color: '#F9FAFB' } }, 'Season ' + last.season + ' — Year in Review'),
                h('div', { style: { fontSize: '14px', color: '#94A3B8', marginBottom: '20px' } }, 'Before free agency opens, here\'s what Season ' + last.season + ' looked like.'),

                // quick stats
                h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginBottom: '16px' } },
                    miniStatBox('Wins', last.wins, '#F59E0B'),
                    miniStatBox('Top 5s', last.top5s, '#10B981'),
                    miniStatBox('DNFs', last.dnfs, '#EF4444'),
                    miniStatBox('Prize Money', fmtMoney(last.prize), '#10B981'),
                    miniStatBox('Fans Gained', fmtFans(Math.max(0, fansGained)), '#EC4899'),
                    miniStatBox('Rep', last.rep, '#F59E0B'),
                ),

                // rep tier
                h('div', { style: { background: '#060A10', border: '1px solid #1E2433', borderRadius: '8px', padding: '12px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' } },
                    h('span', { style: { fontSize: '24px' } }, repTier.icon),
                    h('div', null,
                        h('div', { style: { fontSize: '13px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em' } }, 'Paddock Standing'),
                        h('div', { style: { fontSize: '16px', fontWeight: 800, color: repTier.color } }, repTier.label),
                    ),
                ),

                // best and worst result
                h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' } },
                    bestRace ? h('div', { style: { background: '#060A10', border: '1px solid #10B98133', borderRadius: '8px', padding: '12px' } },
                        h('div', { style: { fontSize: '11px', color: '#10B981', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' } }, 'Best Result'),
                        h('div', { style: { fontSize: '20px', fontWeight: 900, color: '#10B981' } }, 'P' + bestRace.pos),
                        h('div', { style: { fontSize: '13px', color: '#94A3B8' } }, bestRace.track),
                    ) : null,
                    worstRace && worstRace.pos > 10 ? h('div', { style: { background: '#060A10', border: '1px solid #EF444433', borderRadius: '8px', padding: '12px' } },
                        h('div', { style: { fontSize: '11px', color: '#EF4444', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' } }, 'Toughest Night'),
                        h('div', { style: { fontSize: '20px', fontWeight: 900, color: '#EF4444' } }, 'P' + worstRace.pos),
                        h('div', { style: { fontSize: '13px', color: '#94A3B8' } }, worstRace.track),
                    ) : null,
                ),

                // rivalries
                (topRival || topFriend) ? h('div', { style: { background: '#060A10', border: '1px solid #1E2433', borderRadius: '8px', padding: '12px', marginBottom: '12px' } },
                    h('div', { style: { fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', fontWeight: 700 } }, 'Notable Relationships'),
                    topRival ? h('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '6px' } },
                        h('span', { style: { fontSize: '14px', color: '#EF4444', fontWeight: 700 } }, topRival.name),
                        h('span', { style: { fontSize: '13px', color: '#94A3B8' } }, (topRival.incidents || 0) + ' incidents · unfinished business'),
                    ) : null,
                    topFriend ? h('div', { style: { display: 'flex', justifyContent: 'space-between' } },
                        h('span', { style: { fontSize: '14px', color: '#10B981', fontWeight: 700 } }, topFriend.name),
                        h('span', { style: { fontSize: '13px', color: '#94A3B8' } }, (topFriend.closeRaces || 0) + ' clean battles'),
                    ) : null,
                ) : null,

                // dnf note
                dnfs.length ? h('div', { style: { fontSize: '14px', color: '#94A3B8', fontStyle: 'italic', marginBottom: '16px' } },
                    dnfs.length + ' DNF' + (dnfs.length > 1 ? 's' : '') + ' this season. ' +
                    (dnfs.length >= 3 ? 'Reliability was a real issue.' : dnfs.length >= 2 ? 'Two DNFs hurt the points.' : 'One DNF in an otherwise clean season.'),
                ) : h('div', { style: { fontSize: '14px', color: '#10B981', marginBottom: '16px' } }, '✨ Zero DNFs. Clean season.'),

                h('div', { className: 'modal-actions' },
                    mkBtn('Open Free Agency →', 'btn btn-lg btn-primary', function () { closeModal(); render(); }),
                ),
            ));
        }
        function doAdvanceSeason() {
            advanceSeason(G);
            saveGame();
            openOffseasonSummaryModal();
            // check for unsigned contract after modal closes - small delay so modal renders first
            setTimeout(function() {
                if (G.contracts && G.contracts.length === 0) {
                    G.dramaQueue.unshift({
                        id: 'no_contract_reminder_' + uid(),
                        title: '📋 Season ' + G.season + ' — Sign a Contract',
                        effect: 'none',
                        desc: 'You don\'t have a contract for the new season yet. Head to the Contracts tab to sign with a team, go independent, or pick up a new series. Your schedule will stay empty until you do.',
                        valence: 'neutral',
                        _actionLabel: 'Go to Contracts',
                        _action: 'tab:contracts',
                    });
                    saveGame();
                }
            }, 500);
        }

        // independent racing
        function doGoIndependent(seriesId) {
            const s = getSeries(seriesId);
            if (!s) return;
            // modal not confirm() - confirm is blocked on iphone local files
            openModal(h('div', null,
                h('div', { className: 'modal-eyebrow' }, 'Independent Racing'),
                h('div', { className: 'modal-title' }, `Run Indie — ${s.name}`),
                h('div', { className: 'modal-sub' }, `No team. No salary. No obligations.`),
                h('div', { style: { background: '#060A10', borderRadius: '8px', padding: '14px', marginBottom: '16px', fontSize: '14px', color: '#E2E8F0', lineHeight: '1.7' } },
                    h('div', null, `Entry fee: ${fmtMoney(s.fee)} per race (paid when you submit each result)`),
                    h('div', null, 'You keep 100% of prize money'),
                    h('div', null, 'All repairs come out of your pocket'),
                    h('div', null, 'No performance requirements — race as you please'),
                ),
                h('div', { className: 'modal-actions' },
                    mkBtn('Cancel', 'btn btn-ghost', closeModal),
                    mkBtn('Go Indie →', 'btn btn-primary', () => {
                        closeModal();
                        const indieContract = {
                            id: uid(),
                            team: 'Independent',
                            seriesId,
                            quality: 'independent',
                            salary: 0,
                            prizeShare: 1.0,
                            entryFee: s.fee,
                            termSeasons: 1,
                            seasonsCompleted: 0,
                            winBonus: 0,
                            races: s.races,
                            racesCompleted: 0,
                            earnings: 0,
                            missedFinishWarnings: 0,
                            reqFinish: 999,
                            penaltyRate: 0,
                            buyoutRate: 0,
                            teammates: [],
                            crewPackage: 'basic',
                            indie: true,
                        };
                        G.contracts.push(indieContract);
                        G.pendingOffers = G.pendingOffers.filter(o => o.seriesId !== seriesId);
                        if (!G.schedules[seriesId]) G.schedules[seriesId] = generateSchedule(seriesId, G.trackPools);
                        if (!G.schedules[seriesId].some(r => r.absentDrivers)) assignSeasonAttendance(G, seriesId);
                        if (!(G.seasonGoals || []).filter(g => g.status === 'active').length) {
                            G.seasonGoals = G.seasonGoals || [];
                            const newGoals = generateSeasonGoals(G);
                            G.seasonGoals.push(...newGoals);
                            if (newGoals.length) addLog(G, `🎯 ${newGoals.length} season goal${newGoals.length > 1 ? 's' : ''} set for Season ${G.season}.`);
                        }
                        addLog(G, `🔧 Running independent in ${s.name}. Entry fee: ${fmtMoney(s.fee)}/race. All on you.`);
                        saveGame(); render();
                    }),
                )
            ));
        }

        // pr spend
        function doPRSpend(item) {
            if (G.money < item.cost) return;
            G.money -= item.cost;
            if (item.rep) G.reputation = Math.max(0, G.reputation + item.rep);
            if (item.fans) G.fans = Math.max(0, G.fans + item.fans);
            if (!G.offTrackDone) G.offTrackDone = [];
            G.offTrackDone.push(item.id + '_s' + G.season);
            const gained = [item.rep ? `+${item.rep} rep` : null, item.fans ? `+${fmtFans(item.fans)} fans` : null].filter(Boolean).join(', ');
            addLog(G, `📣 PR: ${item.label} — ${fmtMoney(item.cost)} → ${gained}`);
            saveGame(); render();
        }
        // availability system
        /* catches everything that keeps a driver off the entry list - injury, illness, family, whatever. same mechanics as the old injury system just reframed */

        const CANT_RACE_REASONS_AI = [
            'dealing with a prior commitment',
            'out with a minor injury',
            'handling a family matter',
            'away on sponsor obligations',
            'taking a personal leave',
            'sidelined by illness',
            'dealing with a contract dispute',
            'handling off-track business',
            'out for undisclosed reasons',
            'managing a minor medical issue',
        ];

        const CANT_RACE_REASONS_PLAYER = [
            'You have a prior commitment this week — someone is covering your seat.',
            'A minor injury means you\'re sitting this one out. Sub confirmed.',
            'Family matter this week. Your substitute will handle it.',
            'Sponsor obligations pulled you away. Sub is in the car.',
            'You\'re dealing with something off-track. Sub races in your place.',
            'Illness this week. You\'ll be back next race.',
            'A scheduling conflict means you miss this one. Sub confirmed.',
        ];

        function tickAIInjuries(state, seriesId, alreadyInjured) {
            alreadyInjured = alreadyInjured || new Set();
            (state.drivers || []).forEach(d => {
                if (!d.injuredOrPenalized || !d._injuryRacesOut) return;
                if (d.currentSeriesId !== seriesId) return;
                if (!alreadyInjured.has(d.name)) return; // just got hurt this race, skip the tick
                d._injuryRacesOut--;
                if (d._injuryRacesOut <= 0) {
                    // back to racing
                    d.injuredOrPenalized = false;
                    const subName = d._subName;
                    d._subName = null;
                    d._injuryRacesOut = null;
                    if (subName) {
                        const sub = (state.drivers || []).find(dr => dr.name === subName);
                        if (sub) sub.active = false;
                    }
                    const isRival = (state.rivals || []).some(r => r.name === d.name && ['rival', 'frenemy'].includes(relationship(r)));
                    const isFriend = (state.rivals || []).some(r => r.name === d.name && ['friend', 'racing_rival'].includes(relationship(r)));
                    const isTm = (state.teammates || []).some(t => t.name === d.name);
                    let valence = 'neutral';
                    let extra = '';
                    if (isRival) { valence = 'bad'; extra = ' Your rival is back. Keep your head on a swivel.'; }
                    if (isFriend) { valence = 'good'; extra = ' Good to see them back.'; }
                    if (isTm) { valence = 'good'; extra = ' Your teammate is back in the car.'; }
                    state.dramaQueue.push({
                        id: 'ai_rec_' + uid(),
                        title: `${d.name} Returns`,
                        effect: 'none',
                        desc: `${d.name} is available again and returns to the lineup this week.${extra}`,
                        valence,
                        _requiresAction: true,
                        _actionLabel: 'Roster updated in iRacing',
                    });
                    addLog(state, `✅ ${d.name} available again. ${subName || 'Sub'} relieved.`);
                } else {
                    // still out
                    const isRival = (state.rivals || []).some(r => r.name === d.name && ['rival', 'frenemy'].includes(relationship(r)));
                    const isTm = (state.teammates || []).some(t => t.name === d.name);
                    if (isRival || isTm) {
                        state.dramaQueue.push({
                            id: 'ai_inj_rem_' + uid(),
                            title: `${d.name} Still Out`,
                            effect: 'none',
                            desc: `${d.name} remains sidelined. ${d._subName || 'Their substitute'} starts again this week. ${d._injuryRacesOut} race${d._injuryRacesOut > 1 ? 's' : ''} remaining.`,
                            valence: isRival ? 'good' : 'neutral',
                        });
                    }
                }
            });
        }
        function rollInjuryChance(result) {
            // base chance
            let chance = 0.04; // 4% per race
            if (result.dnf) chance += 0.08;
            if ((result.incidentDrivers || []).length > 0) chance += 0.04;
            if (result.dnfReason && /crash|rollover|fire|wall|flip/i.test(result.dnfReason)) chance += 0.10;
            return Math.random() < chance;
        }

        function rollAIInjuryChance(driver, seriesId) {
            // 3% base chance per race per AI driver
            return Math.random() < 0.03;
        }

        function getInjuryLength() {
            // 1-4 races out, weighted toward shorter
            const roll = Math.random();
            if (roll < 0.50) return 1;
            if (roll < 0.80) return 2;
            if (roll < 0.95) return 3;
            return 4;
        }

        function processPlayerInjury(state, seriesId, result) {
            if (state.playerInjury) return; // already injured
            if (!rollInjuryChance(result)) return;
            state._hadInjuryThisSeason = true;
            const racesOut = getInjuryLength();
            const seriesTier = (getSeries(seriesId) && getSeries(seriesId).tier) || 1;

            // Player always finds someone — at tier 1-2 it's a friend or someone from the paddock
            // At tier 3+ the team handles it
            let subName = generateAIName();
            while ((state.drivers || []).find(d => d.name === subName)) subName = generateAIName();

            const subDriver = createDriver(subName, rand(seriesTier <= 2 ? 25 : 35, seriesTier <= 2 ? 55 : 65), seriesId, 'generated');
            subDriver.substituteFor = state.driverName;
            subDriver._friendSub = seriesTier <= 2; // flag for flavor text
            const playerContract = (state.contracts || []).find(function (c) { return c.seriesId === seriesId; });
            if (playerContract) subDriver.currentTeam = playerContract.team;
            state.drivers.push(subDriver);

            state.playerInjury = { racesOut, subName, seriesId, racesRemaining: racesOut };
            // Seed sub into series standings so they appear in the standings table
            if (!state.seriesFields[seriesId]) state.seriesFields[seriesId] = {};
            if (!state.seriesFields[seriesId][subName]) {
                state.seriesFields[seriesId][subName] = { points: 0, wins: 0, top5s: 0, starts: 0 };
            }
           const friendSubPhrases = [
                `${subName} — a friend from the paddock — agreed to keep the seat warm.`,
                `${subName} is stepping in as a favor. They've got some experience but this isn't their regular gig.`,
                `You called around and ${subName} said yes. Don't expect miracles.`,
                `${subName} is doing you a solid. They know the car well enough to get around.`,
            ];
            const teamSubPhrases = [
                `The team is putting ${subName} in the seat.`,
                `${subName} gets the call-up. The team moves quickly on these things.`,
                `${subName} will cover the races. Team management made the call.`,
            ];
            const subDesc = seriesTier <= 2
                ? friendSubPhrases[rand(0, friendSubPhrases.length - 1)]
                : teamSubPhrases[rand(0, teamSubPhrases.length - 1)];
            var playerCantRaceReason = CANT_RACE_REASONS_PLAYER[rand(0, CANT_RACE_REASONS_PLAYER.length - 1)];
            const desc = playerCantRaceReason + ' ' + subDesc + ' Submit results as usual — they will be recorded under ' + subName + '\'s name.';

            state.dramaQueue.push({
                id: 'player_inj_' + uid(),
                title: '📋 You Can\'t Race This Week',
                effect: 'none',
                desc,
                valence: 'bad',
            });
            addLog(state, `📋 Player unavailable — out ${racesOut} race${racesOut > 1 ? 's' : ''}. Sub: ${subName}`);

            // Sponsor concern
            state.sponsors.forEach(sp => {
                sp.happiness = clamp(sp.happiness - 8, 0, 100);
            });
        }

        function processAIInjuries(state, seriesId, finishOrder) {
            const field = finishOrder.filter(e => !e.isPlayer && e.name);
            field.forEach(entry => {
                const driver = (state.drivers || []).find(d => d.name.toLowerCase() === entry.name.toLowerCase());
                if (!driver || driver.injuredOrPenalized) return;
                if (!rollAIInjuryChance(driver, seriesId)) return;

                driver.injuredOrPenalized = true;
                const racesOut = getInjuryLength();
                driver._injuryRacesOut = racesOut;

                // At tier 1-2, car might just sit — no sub available
                const _aiSeriesTier = (getSeries(seriesId) && getSeries(seriesId).tier) || 1;
                const _noSub = _aiSeriesTier <= 2 && Math.random() < 0.45;
                let subName = null;
                if (!_noSub) {
                    subName = generateAIName();
                    while ((state.drivers || []).find(d => d.name === subName)) subName = generateAIName();
                    const sub = createDriver(subName, rand(30, 60), seriesId, 'generated');
                    sub.substituteFor = driver.name;
                    sub.currentTeam = driver.currentTeam || null;
                    state.drivers.push(sub);
                }
                driver._subName = subName;
                driver._noSub = _noSub;

                const isRival = (state.rivals || []).some(r => r.name === driver.name && ['rival', 'frenemy'].includes(relationship(r)));
                const isFriend = (state.rivals || []).some(r => r.name === driver.name && ['friend', 'racing_rival'].includes(relationship(r)));
                const isTm = (state.teammates || []).some(t => t.name === driver.name);

                let title = `${driver.name} Injured`;
                let valence = 'neutral';
                let extra = '';
                if (isRival) { title = `Rival Injured: ${driver.name}`; valence = 'good'; extra = ' Your rival is out.'; }
                if (isFriend) { title = `${driver.name} Injured`; valence = 'bad'; extra = ' Hate to see it.'; }
                if (isTm) { title = `Teammate Injured: ${driver.name}`; valence = 'bad'; extra = ' The team will need to adjust.'; }

                var cantRaceReason = CANT_RACE_REASONS_AI[rand(0, CANT_RACE_REASONS_AI.length - 1)];
                state.dramaQueue.push({
                    id: 'ai_inj_' + uid(),
                    title,
                    effect: 'none',
                    desc: _noSub
                        ? `${driver.name} is ${cantRaceReason} and will miss the next ${racesOut} race${racesOut > 1 ? 's' : ''}. No sub — the car sits.${extra} Remove them from your iRacing roster for the missed races.`
                        : `${driver.name} is ${cantRaceReason} and will miss the next ${racesOut} race${racesOut > 1 ? 's' : ''}. ${subName} steps in.${extra} Swap them in your iRacing roster.`,
                    valence,
                    _requiresAction: true,
                    _actionLabel: 'Roster updated in iRacing',
                });
                addLog(state, `📋 ${driver.name} unavailable (${cantRaceReason}) — out ${racesOut} races. Sub: ${subName || 'none'}`);
            });
        }

        function tickPlayerInjury(state) {
            if (!state.playerInjury) return false;
            // Check BEFORE decrementing — if there are races remaining, show injured modal
            if (state.playerInjury.racesRemaining <= 0) {
                // Already expired — clean up
                const subDriver = (state.drivers || []).find(d => d.name === state.playerInjury.subName);
                if (subDriver) subDriver.active = false;
                state.dramaQueue.push({
                    id: 'player_rec_' + uid(),
                    title: '✅ You\'re Back',
                    effect: 'none',
                    desc: state.driverName + ' is available again and will drive the next race. ' + (state.playerInjury.subName || 'The sub') + ' is relieved.',
                    valence: 'good',
                });
                addLog(state, `✅ Player available again. ${state.playerInjury.subName} relieved.`);
                state.playerInjury = null;
                return false;
            }
            // still out — decrement and show modal
            state.playerInjury.racesRemaining--;
            if (state.playerInjury.racesRemaining <= 0) {
                // Last race — injury update summary handles the messaging
            }

            return true;
        }

        // qualifying modal
        function openQualModal(seriesId, raceIdx) {
            const sched = G.schedules[seriesId] || [];
            const race = sched[raceIdx];
            const s = getSeries(seriesId);
            const c = G.contracts.find(c => c.seriesId === seriesId);
            const crewPkg = CREW_PACKAGES.find(p => p.id === (c && c.crewPackage || 'basic')) || CREW_PACKAGES[0];
            const posIn = h('input', { type: 'number', min: 1, placeholder: 'e.g. 4', style: { width: '100%' } });
            const fsIn = h('input', { type: 'number', value: '20', style: { width: '100%' } });
            const preview = h('div', { className: 'modal-preview' });
            function upd() {
                const pos = parseInt(posIn.value) || 0;
                preview.innerHTML = '';
                if (!pos) return;
                const adj = Math.max(1, pos - crewPkg.qualBonus);
                const isPole = adj === 1;
                preview.appendChild(h('div', null,
                    h('div', { className: 'pv-lbl' }, 'GRID POSITION'),
                    h('div', { className: 'pv-val', style: { color: isPole ? '#F59E0B' : '#8B5CF6' } },
                        `P${adj}${crewPkg.qualBonus > 0 ? ` (crew -${crewPkg.qualBonus})` : ''} ${isPole ? '🏆 POLE' : ''}`
                    )
                ));
            }
            posIn.addEventListener('input', upd);
            openModal(h('div', null,
                h('div', { className: 'modal-eyebrow' }, `${s.short} — Qualifying`),
                h('div', { className: 'modal-title' }, race.track),
                h('div', { className: 'modal-sub' }, `${race.city}, ${race.state} · Round ${race.round}`),
                crewPkg.qualBonus > 0 ? h('div', { style: { fontSize: '14px', color: '#10B981', marginBottom: '14px' } }, `${crewPkg.name} active: +${crewPkg.qualBonus} position improvement`) : null,
                h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' } },
                    h('div', null, h('label', { className: 'modal-label' }, 'Your Qualifying Position *'), posIn),
                    h('div', null, h('label', { className: 'modal-label' }, 'Field Size'), fsIn),
                ),
                h('div', { style: { fontSize: '14px', color: '#94A3B8', marginBottom: '12px' } }, 'P1 automatically records as pole position.'),
                preview,
                h('div', { className: 'modal-actions' },
                    mkBtn('Skip', 'btn btn-ghost', closeModal),
                    mkBtn('Save Qualifying', 'btn btn-secondary', () => {
                        const rawPos = parseInt(posIn.value) || 0; if (!rawPos) { closeModal(); return; }
                        const adjPos = Math.max(1, rawPos - crewPkg.qualBonus);
                        const isPole = adjPos === 1;
                        sched[raceIdx].qualifying = { position: adjPos, fieldSize: parseInt(fsIn.value) || 20, pole: isPole };
                        if (isPole) G.poles++;
                        if (adjPos <= 5) G.sponsors = G.sponsors.map(sp => ({ ...sp, happiness: Math.min(100, sp.happiness + 3) }));
                        addLog(G, `🏁 ${s.short} R${race.round} qualifying @ ${race.track}: P${adjPos}${isPole ? ' (POLE)' : ''}`);
                        saveGame(); closeModal(); render();
                    }),
                )
            ));
        }
