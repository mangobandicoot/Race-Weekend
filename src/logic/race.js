// race result processing
        function processRaceResult(state, seriesId, raceIdx, result) {
            const sched = state.schedules[seriesId];
            const race = sched[raceIdx];
            const s = getSeries(seriesId);
            const contract = state.contracts.find(c => c.seriesId === seriesId);

            // condition modifiers if set
            const _raceObj = (state.schedules[seriesId] || [])[raceIdx];
            if (_raceObj && _raceObj._pendingCondition && !result.isFig8Bonus) {
                const pc = _raceObj._pendingCondition;
                if (pc.prizeMult < 1 && result.prize) result.prize = Math.round(result.prize * pc.prizeMult);
                if (pc.fanBonus > 0) result._condFanBonus = pc.fanBonus;
                delete _raceObj._pendingCondition;
            }
            if (result.isFig8Bonus) {
                race.bonusResult = result;
                state.money += result.prize || 0;
                state.totalPrizeMoney += result.prize || 0;
                state.fans += result.dnf ? 50 : Math.floor(50 + (result.fieldSize - result.position) * 20);
                const pos = result.dnf ? 'DNF' : `P${result.position}/${result.fieldSize}`;
                addLog(state, `🔀 Figure-8 @ ${race.track}: ${pos} | ${fmtMoney(result.prize || 0)} | ${result.dnf ? (result.dnfReason || 'chaos') : 'survived.'}`);
                _checkContractClose(state, seriesId, sched, contract, s);
                return;
            }

                        race.result = result;
            result._submitTime = Date.now();

            // snapshot before anything fires - undo needs this for full rewind
            result._snapshot = {
                money: state.money,
                totalPrizeMoney: state.totalPrizeMoney,
                reputation: state.reputation,
                fans: state.fans,
                starts: state.starts,
                week: state.week,
                wins: state.wins,
                top5s: state.top5s,
                poles: state.poles,
                confidence: state.confidence || 0,
                championshipPoints: JSON.parse(JSON.stringify(state.championshipPoints)),
                seriesFields: JSON.parse(JSON.stringify(state.seriesFields || {})),
                sponsors: JSON.parse(JSON.stringify(state.sponsors)),
                rivals: JSON.parse(JSON.stringify(state.rivals)),
                carCondition: JSON.parse(JSON.stringify(state.carCondition || {})),
                playerInjury: state.playerInjury ? JSON.parse(JSON.stringify(state.playerInjury)) : null,
                dramaQueueLength: (state.dramaQueue || []).length,
                raceHistoryLength: (state.raceHistory || []).length,
                drivers: JSON.parse(JSON.stringify(state.drivers || [])),
                teammates: JSON.parse(JSON.stringify(state.teammates || [])),
                milestones: JSON.parse(JSON.stringify(state.milestones || [])),
                storyJournalLength: (state.storyJournal || []).length,
                trackRecords: JSON.parse(JSON.stringify(state.trackRecords || {})),
                _elimNotified: state._elimNotified || null,
                conflictSkipKeys: (function() {
                    var keys = {};
                    (state.contracts || []).forEach(function(c) {
                        var sched = state.schedules[c.seriesId] || [];
                        var nextUnrun = sched.findIndex(function(r) { return !r.result; });
                        keys[c.seriesId] = nextUnrun;
                    });
                    return keys;
                })(),
                contracts: JSON.parse(JSON.stringify(state.contracts || [])),
            };
            // premier modifiers
       if (race.isPremier && !result.dnf && !result.dq) {
                result.points = (result.points || 0) * 2;
                state.dramaQueue.push({
                    id: 'premier_' + uid(),
                    title: `⭐ ${race.premierName}`,
                    effect: 'none',
                    desc: result.position === 1
                        ? `${state.driverName} wins the ${race.premierName}. Double points, bigger field, and a result that will be remembered. That's what these races are for.`
                        : result.position <= 5
                            ? `P${result.position} in the ${race.premierName}. Bigger field, tougher competition, double points. Not a bad showing when it mattered.`
                            : `P${result.position} in the ${race.premierName}. The expanded field made it tougher but the double points still count for something.`,
                    valence: result.position <= 3 ? 'good' : 'neutral',
                });
            }
            // used car dnf risk - fires before result processes
            if (G._usedCarSeriesId === seriesId && !result.dnf && !result.dq) {
                var cc2 = getCarCondition(state, seriesId);
                var avgCond2 = (cc2.engine + cc2.suspension + cc2.chassis + cc2.tires + cc2.brakes) / 5;
                // risk drops as car gets repaired - 30% at 50% condition, 5% at 90%+
                var usedRisk = avgCond2 >= 90 ? 0.05 : avgCond2 >= 75 ? 0.12 : avgCond2 >= 60 ? 0.20 : 0.30;
                if (Math.random() < usedRisk) {
                    var usedDNFReasons = ['hidden engine fault', 'worn suspension failure', 'brake fade and crash', 'electrical gremlin', 'old gasket failure'];
                    result.dnf = true;
                    result.dnfReason = usedDNFReasons[rand(0, usedDNFReasons.length - 1)] + ' (used car)';
                    state.dramaQueue.push({
                        id: 'usedcar_dnf_' + uid(),
                        title: '🔧 Used Car Bites Back',
                        effect: 'none',
                        desc: 'The used car found a way to ruin your night — ' + result.dnfReason + '. That\'s what you get for buying on the cheap. Get it properly repaired before next week.',
                        valence: 'bad',
                    });
                    addLog(state, '🔧 Used car DNF: ' + result.dnfReason);
                }
                // clear flag at 85%+ average, repaired enough
                if (avgCond2 >= 85) {
                    delete G._usedCarSeriesId;
                    addLog(state, '✅ Used car risk cleared — car repaired to acceptable condition.');
                }
            }

            // entry fee every race regardless
            const entryFee = contract ? (contract.entryFee || s.fee) : s.fee;
            state.money -= entryFee;
            addLog(state, `🎟️ Entry fee @ ${race.track}: -${fmtMoney(entryFee)}`);

            // run owned team and charge weekly costs
            if (state.ownedTeam) {
                simulateTeamRace(state, state.ownedTeam.seriesId);
                tickTeamWeeklyCosts(state);
            }

            // sponsor payments
            let sponsorRaceIncome = 0;
            state.sponsors.forEach(function (sp) {
                if (!sp.valuePerRace) {
                    const sr = getSeries(sp.seriesId);
                    sp.valuePerRace = Math.floor(sp.valuePerSeason / Math.max(sr ? sr.races : 10, 1));
                }
                const payment = Math.floor(sp.valuePerRace * (sp.happiness / 100) * randF(0.85, 1.15));
                state.money += payment;
                state.totalPrizeMoney += payment;
                sponsorRaceIncome += payment;
            });
            if (sponsorRaceIncome > 0) addLog(state, `💼 Sponsor payments: +${fmtMoney(sponsorRaceIncome)}`);

            // prize money - apply prize split
            const prizeShare = (contract && !contract.indie && contract.prizeShare) ? contract.prizeShare : 1.0;
            const driverPrize = Math.floor((result.prize || 0) * prizeShare);
            const teamCut = (result.prize || 0) - driverPrize;
            state.money += driverPrize;
            state.totalPrizeMoney += driverPrize;
            if (teamCut > 0) addLog(state, `💸 Prize split: you keep ${fmtMoney(driverPrize)} (${Math.round(prizeShare * 100)}%), team takes ${fmtMoney(teamCut)}`);
            state.starts++;
            state.week++;

            // conflict resolution: auto-skip races in other series that conflict
            // When a race is submitted, any other contract's race scheduled for the
            // same week that hasn't been run yet gets auto-simulated if the tracks
            // are in different regions (can't be in two places at once).
            var _racedTrackState = ((state.schedules[seriesId] || [])[raceIdx] || {}).state || '';
            (state.contracts || []).forEach(function(oc) {
                if (oc.seriesId === seriesId) return; // skip the one we just raced
                var ocSched = state.schedules[oc.seriesId] || [];
                // find next unrun race
                var ocRaceIdx = ocSched.findIndex(function(r) { return !r.result; });
                if (ocRaceIdx < 0) return;
                var ocRace = ocSched[ocRaceIdx];
                // only conflict if same week
                if (!ocRace.week || ocRace.week !== (state.week - 1)) return; // week-1 because we already incremented
                // Same track = always allowed (same-venue double-header)
                if (ocRace.track && ocRace.track === race.track) return;
                // Same region = allowed double-header, no skip
                var ocState = ocRace.state || '';
                if (_racedTrackState && ocState && isSameRegion(_racedTrackState, ocState)) return;
                // Different region — auto-simulate as a conflict skip
                var ocS = getSeries(oc.seriesId);
                var skipResult = simulateRaceBackground(oc.seriesId, ocRaceIdx, false);
                ocRace.result = skipResult || {
                    skipped: true, simulated: true, position: 0, fieldSize: 20,
                    dnf: false, dq: false, points: 0, prize: 0,
                    finishOrder: [], winner: null,
                    summary: 'Conflict skip — racing in ' + (getSeries(seriesId) ? getSeries(seriesId).short : seriesId) + ' this week.',
                };
                ocRace.result._conflictSkip = true;
                ocRace.result._conflictWith = seriesId;
                if (result._snapshot) result._snapshot.seriesFields = JSON.parse(JSON.stringify(state.seriesFields || {}));
                addLog(state, '⚠️ Conflict skip: ' + (ocS ? ocS.short : oc.seriesId) + ' R' + ocRace.round + ' @ ' + ocRace.track + ' — you were racing in ' + (getSeries(seriesId) ? getSeries(seriesId).short : seriesId) + ' this week.');
                state.dramaQueue.push({
                    id: 'conflict_skip_' + uid(),
                    title: '📅 Race Missed: ' + (ocS ? ocS.short : oc.seriesId),
                    effect: 'none',
                    valence: 'neutral',
                    desc: 'You raced ' + (getSeries(seriesId) ? getSeries(seriesId).short : seriesId) + ' at ' + (_racedTrackState || 'another track') + ' this week, so the ' + (ocS ? ocS.short : oc.seriesId) + ' race at ' + ocRace.track + ' ran without you. ' + (skipResult && skipResult.winner ? skipResult.winner + ' won.' : ''),
                });
            });

            const pts = result._injuryRace ? 0 : (result.points || 0);
                state.championshipPoints[seriesId] = (state.championshipPoints[seriesId] || 0) + pts;

            if (!result.dnf && !result.dq) {
                if (result.position === 1) state.wins++;
                if (result.position <= 5) state.top5s++;
            }
            if (result.pole) state.poles++;

            // Rep gain — DQ is worse than DNF for reputation
            const _fieldMid = Math.ceil((result.fieldSize || 20) * 0.5);
            const _fieldBack = Math.ceil((result.fieldSize || 20) * 0.75);
            const _isLastPlace = !result.dnf && result.position >= (result.fieldSize || 20);
            const repGain = result.dq         ? -rand(5, 9)
                : result.dnf                  ? -rand(3, 6)
                : _isLastPlace                ? -rand(2, 4)
                : result.position === 1       ? rand(5, 9)
                : result.position <= 3        ? rand(2, 5)
                : result.position <= 10       ? rand(0, 2)
                : result.position <= _fieldMid ? -rand(0, 1)
                : result.position <= _fieldBack ? -rand(1, 2)
                : -rand(2, 3);
            state.reputation = Math.max(0, state.reputation + repGain);

            // Fan gain
            const _serTier = (getSeries(seriesId) && getSeries(seriesId).tier) || 1;
            // Tier 1-2 fan gains are intentionally small — Mini Stock doesn't make you famous
            const _fanMult = [1, 0.4, 0.7, 1.5, 5, 15, 40, 100][_serTier] || 1;
            let fanGain = 0;
            if (result.dq) fanGain = -rand(20, 60);
            else if (result.position === 1) fanGain = rand(150, 350);
            else if (result.position <= 5) fanGain = rand(30, 120);
            else if (result.lapsLed) fanGain = rand(10, 50);
            else if (!result.dnf) fanGain = rand(0, 20);
            else fanGain = -rand(0, 15);
            if (result.pole) fanGain += rand(20, 60);
            fanGain = Math.round(fanGain * _fanMult);

            // Close finish fan bonus
            const closeFinishes = result.closeFinishes || [];
            if (closeFinishes.length) fanGain += closeFinishes.length * Math.round(rand(20, 80) * _fanMult);

            state.fans = Math.max(0, state.fans + fanGain);
            result._fanGain = fanGain;
            result._repGain = repGain;
            // Apply condition fan bonus
            if (result._condFanBonus > 0) {
                state.fans += result._condFanBonus;
                fanGain += result._condFanBonus;
                addLog(state, `🌦️ Condition fan bonus: +${fmtFans(result._condFanBonus)}`);
            }


            // home race effects
            // When the race state matches the player's home state, the crowd is theirs.
            // Win = big bonus. DNF = penalty. Poor finish = smaller hit. Just showing up = fans.
            if (!result.isFig8Bonus && !result.dq && race.state) {
                // Personal home region takes priority, team home region is fallback
                const contract = state.contracts.find(function (c) { return c.seriesId === seriesId; });
                const teamHomeState = contract ? (TEAM_HOME_STATES[contract.team] || null) : null;
                const isPersonalHome = state.homeState && isSameRegion(race.state, state.homeState);
                const isTeamHome = !isPersonalHome && teamHomeState && isSameRegion(race.state, teamHomeState);
                const isHomeRace = isPersonalHome || isTeamHome;
                // homeLabel shows the actual race location, not the player's home state
                const raceStateName = (typeof US_STATE_NAMES !== 'undefined' ? US_STATE_NAMES[race.state] : null) || race.state;
                const homeLabel = isPersonalHome
                    ? raceStateName
                    : isTeamHome
                        ? raceStateName + ' (team home)'
                        : null;

                if (isHomeRace && homeLabel) {
                    if (result.dnf) {
                        const homeFanHit = -rand(100, 300);
                        const homeRepHit = -rand(2, 4);
                        state.fans = Math.max(0, state.fans + homeFanHit);
                        state.reputation = Math.max(0, state.reputation + homeRepHit);
                        state.dramaQueue.push({
                            id: 'home_dnf_' + uid(), title: 'Rough Night at Home', effect: 'none',
                            desc: `DNF in ${homeLabel}. The home crowd was pulling for you. That one stings more than usual.`, valence: 'bad'
                        });
                        addLog(state, `🏠 Home race (${homeLabel}): DNF — Rep ${homeRepHit} | Fans ${fmtFans(homeFanHit)}`);
                    } else if (result.position === 1) {
                        const homeFanBoost = rand(400, 900);
                        const homeRepBoost = rand(5, 10);
                        state.fans = Math.max(0, state.fans + homeFanBoost);
                        state.reputation = Math.max(0, state.reputation + homeRepBoost);
                        state.dramaQueue.push({
                            id: 'home_win_' + uid(), title: 'Hometown Hero', effect: 'none',
                            desc: `Win in ${homeLabel}. The crowd lost their minds. This is what it's all about.`, valence: 'good'
                        });
                        addLog(state, `🏠🏆 Home race win (${homeLabel}): Rep +${homeRepBoost} | Fans +${fmtFans(homeFanBoost)}`);
                    } else if (result.position <= 5) {
                        const homeFanBoost = rand(100, 300);
                        state.fans = Math.max(0, state.fans + homeFanBoost);
                        addLog(state, `🏠 Home race top 5 (${homeLabel}): Fans +${fmtFans(homeFanBoost)}`);
                    } else if (result.position > Math.ceil(result.fieldSize * 0.6)) {
                        const homeFanHit = -rand(50, 150);
                        state.fans = Math.max(0, state.fans + homeFanHit);
                        state.dramaQueue.push({
                            id: 'home_bad_' + uid(), title: 'Off Day at Home', effect: 'none',
                            desc: `P${result.position} in ${homeLabel}. Not what the home crowd came to see. The drive back will be quiet.`, valence: 'bad'
                        });
                        addLog(state, `🏠 Home race (${homeLabel}): poor finish — Fans ${fmtFans(homeFanHit)}`);
                    } else {
                        const homeFanBump = rand(50, 150);
                        state.fans = Math.max(0, state.fans + homeFanBump);
                        addLog(state, `🏠 Home race (${homeLabel}): Fans +${fmtFans(homeFanBump)}`);
                    }
                }
            }

            // Sponsor happiness
            state.sponsors = state.sponsors.map(sp => {
                let h = sp.happiness;
                if (result.dq) h -= ((SPONSOR_TYPES[sp.type] && SPONSOR_TYPES[sp.type].decay) || 5) * 1.5;
                else if (result.dnf) h -= (SPONSOR_TYPES[sp.type] && SPONSOR_TYPES[sp.type].decay) || 5;
                else if (result.position === 1) h += (SPONSOR_TYPES[sp.type] && SPONSOR_TYPES[sp.type].gain) || 10;
                else if (result.position <= 5) h += Math.floor(((SPONSOR_TYPES[sp.type] && SPONSOR_TYPES[sp.type].gain) || 10) * 0.4);
                else if (result.position > result.fieldSize * 0.6) h -= Math.floor(((SPONSOR_TYPES[sp.type] && SPONSOR_TYPES[sp.type].decay) || 5) * 0.5);
                if (result.qualPosition && result.qualPosition <= 3 && !result.dq) h += 3;
                return { ...sp, happiness: clamp(h, 0, 100) };
            });

            // Sponsor bonuses
            state.sponsors.forEach(sp => {
                if (result.position === 1 && sp.winBonus) { state.money += sp.winBonus; state.totalPrizeMoney += sp.winBonus; }
                else if (result.position <= 5 && sp.top5Bonus) { state.money += sp.top5Bonus; state.totalPrizeMoney += sp.top5Bonus; }
            });

            // Sponsor praise, warnings, and cancellations
            state.sponsors = state.sponsors.filter(sp => {
                // Cancel
                if (sp.happiness <= sp.minHappy) {
                    addLog(state, `💔 ${sp.brand} pulled sponsorship. They'd seen enough.`);
                    state.dramaQueue.push({
                        id: 'sp_cancel_' + uid(), title: `${sp.brand} Pulls Out`, effect: 'rep_hit', value: -4, fans: -200,
                        _isSponsor: true,
                        desc: `${sp.brand} terminated the sponsorship agreement. The results didn't meet expectations and they stopped returning calls. The car loses the logo next race.`, valence: 'bad'
                    });
                    return false;
                }
                // Warning threshold — fires once when happiness crosses below 40
                if (sp.happiness < 40 && sp.happiness >= (sp.minHappy || 25) && !sp._warned) {
                    sp._warned = true;
                    state.dramaQueue.push({
                        id: 'sp_warn_' + uid(), title: `${sp.brand} Concerned`, effect: 'none',
                        _isSponsor: true,
                        desc: `${sp.brand} reached out this week. The tone was polite but the message was clear — results need to improve or the renewal conversation is going to be a short one.`, valence: 'bad'
                    });
                }
                // Reset warning flag if happiness recovers
                if (sp.happiness >= 55 && sp._warned) sp._warned = false;
                // Praise — fires once per good run when happiness crosses above 80
                if (sp.happiness >= 80 && !sp._praised) {
                    sp._praised = true;
                    state.dramaQueue.push({
                        id: 'sp_praise_' + uid(), title: `${sp.brand} Happy`, effect: 'rep_fans', value: 2, fans: 150,
                        _isSponsor: true,
                        desc: `${sp.brand} sent a note to the team this week. They're pleased with the results and the exposure. Renewal is looking like a formality at this point.`, valence: 'good'
                    });
                }
                // Reset praise flag if happiness dips so it can fire again on recovery
                if (sp.happiness < 70 && sp._praised) sp._praised = false;
                return true;
            });

            // Rivalry processing
            const order = result.finishOrder || [];
            const myLower = state.driverName.toLowerCase();
            const myIdx = (() => {
                const mi = order.findIndex(e => /\byou\b/i.test(e.name) || e.name.toLowerCase() === myLower || e.isPlayer);
                return mi >= 0 ? mi : result.position - 1;
            })();

            // Position-based close finishes (within 2 spots)
            order.forEach((entry, idx) => {
                if (!entry.name || /\byou\b/i.test(entry.name) || entry.name.toLowerCase() === myLower || entry.isPlayer) return;
                if (Math.abs(idx - myIdx) <= 3) touchRival(state.rivals, entry.name, 'close', true);
            });

            // Time-based close finishes (within 0.05s) — reward clean racing
            closeFinishes.forEach(cf => {
                touchRival(state.rivals, cf.name, 'close', true);
                // bonus fan bump for the story arc
                state.fans = Math.max(0, state.fans + rand(20, 60));
            });
            // Driver callout chance — close finishes
            closeFinishes.forEach(cf => {
                maybeFireDriverCallout(state, cf.name, 'close', race.track);
            });


            // Incident drivers
            (result.incidentDrivers || []).forEach(name => {
                if (name.trim()) touchRival(state.rivals, name.trim(), 'incident', false);
            });
            // Driver callout chance — incidents
            (result.incidentDrivers || []).forEach(name => {
                if (name.trim()) maybeFireDriverCallout(state, name.trim(), 'incident', race.track);
            });


            // Teammate simulation
            // happiness = team's view of the player vs this teammate (0-100, starts 70)
            // tmForm    = teammate's own standing with the team (0-100, starts 70)
            // Both shift every race. When things turn critical the team decides who to
            // keep based on who is winning the internal comparison -- not just one side.
            const seriesTeammates = (state.teammates || []).filter(t => t.seriesId === seriesId);
            seriesTeammates.forEach(tm => {
                if (!tm.races) tm.races = 0;
                if (!tm.beatUs) tm.beatUs = 0;
                if (!tm.weBeat) tm.weBeat = 0;
                if (tm.happiness === undefined) tm.happiness = 70;
                if (tm.tmForm === undefined) tm.tmForm = 70;
                if (!tm._warnedLow) tm._warnedLow = false;
                if (!tm._tmWarnedLow) tm._tmWarnedLow = false;

                const myPos = result.position;
                const fs = result.fieldSize || 20;

                // Simulate teammate finish -- use actual entry if present, roll from form if not
                const tmEntry = order.find(e => e.name && e.name.toLowerCase() === tm.name.toLowerCase());
                let tmPos;
                if (tmEntry) {
                    tmPos = order.indexOf(tmEntry) + 1;
                } else {
                    tmPos = clamp(Math.round((tm.tmForm / 100) * fs * 0.6 + randF(0, fs * 0.4)), 1, fs);
                }

                // Head-to-head counters
                tm.races++;
                if (tmPos < myPos) tm.beatUs++;
                else if (tmPos > myPos) tm.weBeat++;

                // happiness delta -- team's view of player relative to teammate
                if (result.dnf) {
                    tm.happiness = clamp(tm.happiness - 5, 0, 100);
                } else {
                    const gap = tmPos - myPos; // positive means player is ahead
                    if (gap > 0) tm.happiness = clamp(tm.happiness + (gap >= 5 ? 8 : gap >= 3 ? 6 : 4), 0, 100);
                    else if (gap < 0) tm.happiness = clamp(tm.happiness - (gap <= -5 ? 10 : gap <= -3 ? 7 : 3), 0, 100);
                    if (myPos <= Math.ceil(fs / 2)) tm.happiness = clamp(tm.happiness + 1, 0, 100);
                }

                // Teammate form delta -- independent of player
                const tmTopHalf = tmPos <= Math.ceil(fs / 2);
                const tmStrong = tmPos <= Math.max(3, Math.ceil(fs * 0.15));
                if (tmStrong) tm.tmForm = clamp(tm.tmForm + 6, 0, 100);
                else if (tmTopHalf) tm.tmForm = clamp(tm.tmForm + 2, 0, 100);
                else tm.tmForm = clamp(tm.tmForm - 4, 0, 100);

                // Drama: notable gaps worth calling out
                if (tmPos < myPos && myPos - tmPos >= 3 && Math.random() < 0.35) {
                    state.dramaQueue.push({
                        id: 'tm_beat_' + uid(), title: 'Teammate Outperformed You', effect: 'none',
                        desc: `${tm.name} finished P${tmPos} to your P${myPos} in the same car at ${race.track}. The team noticed.`, valence: 'bad'
                    });
                } else if (myPos < tmPos && tmPos - myPos >= 5 && Math.random() < 0.25) {
                    state.dramaQueue.push({
                        id: 'tm_crushed_' + uid(), title: 'You Outperformed Your Teammate', effect: 'none',
                        desc: `P${myPos} to ${tm.name}'s P${tmPos} at ${race.track}. Clean gap. The team had no complaints tonight.`, valence: 'good'
                    });
                }

                // Team decision -- needs 3+ races before anything happens
                                if (tm.races >= 6) {
                    const playerStruggle = tm.happiness <= 20;
                    const playerStrong = tm.happiness >= 65;
                    const tmStruggling = tm.tmForm <= 30;

                    // Case A: player underperforming, teammate doing well -- warn or drop player
                    if (playerStruggle && !tmStruggling) {
                        if (tm.happiness <= 8 && !tm._fired) {
                            tm._fired = true;
                            const c2 = state.contracts.find(c => c.seriesId === seriesId);
                            if (c2) {
                                state.contracts = state.contracts.filter(c => c.seriesId !== seriesId);
                                state.teammates = state.teammates.filter(t => !(t.seriesId === seriesId && t.name === tm.name));
                                state.reputation = Math.max(0, state.reputation - 6);
                                addLog(state, `🚫 ${c2.team} dropped you -- ${tm.name} was outperforming you and the team made their call. Rep -6.`);
                                state.dramaQueue.push({
                                    id: 'tm_fire_' + uid(), title: 'Released -- Teammate Won the Battle', effect: 'none',
                                    desc: `${c2.team} let you go. The numbers between you and ${tm.name} told the story the team didn't want to say out loud. They went with ${tm.name}.`, valence: 'bad'
                                });
                            }
                        } else if (tm.happiness <= 20 && !tm._warnedLow) {
                            tm._warnedLow = true;
                            state.dramaQueue.push({
                                id: 'tm_warn_' + uid(), title: 'Team Watching the Gap', effect: 'none',
                                desc: `The gap between you and ${tm.name} is becoming a conversation in the ${contract && contract.team || 'team'} garage. You have time to close it -- but not much.`, valence: 'bad'
                            });
                        }
                    }

                    // Case B: teammate struggling, player doing well -- teammate may get replaced
                    if (tmStruggling && playerStrong) {
                        if (tm.tmForm <= 15 && !tm._tmFired) {
                            tm._tmFired = true;
                            const oldName = tm.name;
                            const newName = generateAIName();
                            tm.name = newName; tm.races = 0; tm.beatUs = 0; tm.weBeat = 0;
                            tm.happiness = 70; tm.tmForm = 50;
                            tm._warnedLow = false; tm._tmWarnedLow = false; tm._fired = false; tm._tmFired = false;
                            const d = findOrCreateDriver(state, newName);
                            d.currentSeriesId = seriesId;
                            addLog(state, `🔄 ${contract && contract.team || 'Team'} replaced ${oldName} with ${newName}.`);
                            state.dramaQueue.push({
                                id: 'tm_replaced_' + uid(), title: 'Teammate Replaced', effect: 'none',
                                desc: `${contract && contract.team || 'The team'} made a move: ${oldName} is out, ${newName} is in. Your numbers made the decision easy for them.`, valence: 'good'
                            });
                        } else if (tm.tmForm <= 30 && !tm._tmWarnedLow) {
                            tm._tmWarnedLow = true;
                            state.dramaQueue.push({
                                id: 'tm_rival_warn_' + uid(), title: 'Teammate Under Pressure', effect: 'none',
                                desc: `Word in the ${contract && contract.team || 'team'} garage is that ${tm.name} is on a short leash. Your results are making the comparison uncomfortable for them.`, valence: 'neutral'
                            });
                        }
                    }

                    // Reset warning flags on recovery
                    if (tm.happiness >= 65 && tm._warnedLow) tm._warnedLow = false;
                    if (tm.tmForm >= 65 && tm._tmWarnedLow) tm._tmWarnedLow = false;
                }
            });

            // Update driver database from finish order
            integrateFinishOrder(state, seriesId, result.finishOrder || [], race.isPremier || false);

            // Championship field tracking — guest entries don't score points
            if (!state.seriesFields[seriesId]) state.seriesFields[seriesId] = {};
            const field = state.seriesFields[seriesId];
            order.forEach((entry, idx) => {
                if (!entry.name || /\byou\b/i.test(entry.name) || entry.name.toLowerCase() === myLower || entry.isPlayer) return;
                const clean = entry.name.trim(); if (!clean) return;
                // Check if this driver is a guest entry — don't give them championship points
                const driverObj = (state.drivers || []).find(function (d) { return d.name.toLowerCase() === clean.toLowerCase(); });
                if (driverObj && driverObj._guestEntry && idx === 0 && race.isPremier) {
                    state.dramaQueue.push({
                        id: 'guest_win_' + uid(),
                        title: `${clean} Wins the ${race.premierName || 'Premier Event'}!`,
                        effect: 'none',
                        desc: `${clean} came in as a guest entry and won the ${race.premierName || 'premier event'}. A statement win from outside the regular field.`,
                        valence: 'neutral',
                    });
                }
                if (!field[clean]) field[clean] = { points: 0, wins: 0, top5s: 0, starts: 0 };
                const p = idx + 1;
                field[clean].points += IRACING_PTS[idx] || 1;
                field[clean].starts++;
                if (p === 1) field[clean].wins++;
                if (p <= 5) field[clean].top5s++;
            });

            // Generate and store mad-libs summary now (persists with race history)
            const rivalName = (state.rivals || []).filter(r => ['rival', 'frenemy', 'racing_rival'].includes(relationship(r))).map(r => r.name)[0] || null;
            const madLibText = getMadLibSummary(result, seriesId, race.track, (contract && contract.team) || 'the team', state.season, rivalName);

            // Per-race AI driver fan/rep ticks — keeps AI pace with player across a season
            (function() {
                var _sFanMult = [1, 0.3, 0.5, 1.0, 3, 10, 25, 60][Math.min(s ? s.tier : 1, 7)] || 0.3;
                (state.drivers || []).forEach(function(d) {
                    if (!d.active || d.currentSeriesId !== seriesId) return;
                    // Simulate this driver's race result — random position weighted by skill
                    var skillRoll = (d.skill || 50) + rand(-20, 20);
                    var estPos = clamp(Math.round(((100 - skillRoll) / 100) * ((s ? s.races : 20) * 1.2) + 1), 1, result.fieldSize || 20);
                    var won = estPos === 1;
                    var top5 = estPos <= 5;
                    var repTick = won ? rand(2, 5) : top5 ? rand(0, 2) : skillRoll > 55 ? rand(0, 1) : -rand(0, 1);
                    var fanTick = Math.round((won ? rand(100, 300) : top5 ? rand(20, 80) : rand(-10, 30)) * _sFanMult);
                    d.rep = clamp((d.rep || 0) + repTick, 0, 400);
                    d.fans = clamp((d.fans || 0) + fanTick, 0, 2000000);
                    if (won) { d.wins = (d.wins || 0) + 1; d.seasonWins = (d.seasonWins || 0) + 1; }
                    if (top5) d.top5s = (d.top5s || 0) + 1;
                    d.starts = (d.starts || 0) + 1;
                });
            })();

            // Race history
            state.raceHistory.push({
                season: state.season, week: race.week || race.round,
                seriesId, seriesShort: s.short,
                pos: result.position, fs: result.fieldSize,
                points: pts, prize: result.prize || 0,
                track: race.track, dnf: result.dnf, dq: result.dq || false,
                fans: fanGain, repGain,
                closeFinishes: closeFinishes.length,
                summary: madLibText,  // persisted mad-libs blurb
            });

            // Story journal — beat-writer running narrative
            try { addStoryJournalEntry(state, seriesId, raceIdx, result); } catch(e) { console.error('addStoryJournalEntry error:', e); }

            // Also store on the race schedule entry so it shows in race detail modal
            race.result.summary = madLibText;
            if (state.raceHistory.length > 500) state.raceHistory = state.raceHistory.slice(-500);

            // Contract tracking & enforcement
            if (contract) {
                contract.racesCompleted++;
                contract.earnings += driverPrize;
                const recentAvg = state.raceHistory
                    .filter(r => r.seriesId === seriesId && r.season === state.season && !r.dnf)
                    .reduce((s, r, _, a) => s + r.pos / a.length, 0);
                if (!result.dnf && !result._injuryRace && result.position > contract.reqFinish && contract.racesCompleted > 5) {
                    contract.missedFinishWarnings = (contract.missedFinishWarnings || 0) + 1;
                    if (contract.missedFinishWarnings === 1) {
                        state.dramaQueue.push({
                            id: 'warn_' + uid(), title: 'Team Warning', effect: 'none',
                            desc: `${contract.team} is unhappy. You're averaging P${Math.round(recentAvg || 0)} — they want top ${contract.reqFinish}. One more stretch like this and you're gone.`
                        });
                    } else if (contract.missedFinishWarnings >= 3) {
                        state.contracts = state.contracts.filter(c => c.seriesId !== seriesId);
                        state.teammates = state.teammates.filter(t => t.seriesId !== seriesId);
                        state.reputation = Math.max(0, state.reputation - 8);
                        addLog(state, `🚫 ${contract.team} dropped you after repeated poor results. Rep -8.`);
                        state.dramaQueue.push({
                            id: 'drop_' + uid(), title: 'Dropped by Team', effect: 'none',
                            desc: `${contract.team} terminated your contract. They warned you. No buyout.`
                        });
                        return;
                    }
                }

                const remaining = sched.filter(r => !r.result).length;
                if ((remaining === 0 || contract.racesCompleted >= contract.races))
                    _finalizeContract(state, seriesId, contract, s);
            }

            const posStr = result.dq ? 'DQ' : result.dnf ? `DNF${result.dnfReason ? ` (${result.dnfReason})` : ''}` : (`P${result.position}/${result.fieldSize}`);
            const qualStr = result.qualPosition ? ` | Q${result.qualPosition}` : '';
            const closeStr = closeFinishes.length ? ` | 🔥 ${closeFinishes.length} close finish${closeFinishes.length > 1 ? 'es' : ''}` : '';
            addLog(state, `${s.short} R${race.round} @ ${race.track}: ${posStr}${qualStr} | +${pts}pts | ${fmtMoney(result.prize || 0)} | Rep ${repGain >= 0 ? '+' : ''}${repGain} | Fans ${fanGain >= 0 ? '+' : ''}${fmtFans(fanGain)}${closeStr}`);

            if (Math.random() < 0.10) {
                const d = _rollDrama(state);
                if (d) state.dramaQueue.push(d);
            }
            maybeFireUnpromptedCallout(state, seriesId, result);
            maybeFireSeriesNews(state, seriesId);
            maybeFirePaddockRumor(state);
            maybeFireRivalWin(state, seriesId, result);
            maybeFireAIIncidents(state, seriesId, result);
            maybeFireFamilyNarrative(state, seriesId, result);
            maybeFireFanMail(state);
            maybeFireSponsorActivation(state);
            applyPerRaceSponsorPayments(state, seriesId);
            maybeFireTradeRumor(state);
            maybeFireSpecialInvite(state);
            maybeFirePitEntryReminder(state);
            maybeFirePostRaceInspection(state, seriesId, result);

            // Injury rolls — player and AI
            if (!result._injuryRace) {
                processPlayerInjury(state, seriesId, result);
            } else {
                // Post-race summary for injury sub race
                const subName = result._subName || (state.playerInjury && state.playerInjury.subName) || 'your substitute';
                const racesLeft = state.playerInjury ? state.playerInjury.racesRemaining : 0;
                state.dramaQueue.push({
                    id: 'inj_summary_' + uid(),
                    title: '⛑️ Injury Update',
                    effect: 'none',
                    desc: `${subName} ran in your place today. ${result.dnf ? 'They DNF\'d.' : result.position <= 5 ? `They finished P${result.position} — solid run for the team.` : `They finished P${result.position}.`} ${racesLeft > 0 ? `You have ${racesLeft} race${racesLeft > 1 ? 's' : ''} remaining on injury.` : 'You should be cleared for the next race.'}`,
                    valence: result.position <= 5 ? 'good' : 'neutral',
                });
            }
            const _alreadyInjured = new Set((state.drivers || []).filter(d => d.injuredOrPenalized && d._injuryRacesOut > 0).map(d => d.name));
            processAIInjuries(state, seriesId, result.finishOrder || []);
            tickAIInjuries(state, seriesId, _alreadyInjured);
            if (state.week % 6 === 0) {
                const fresh = generateOffers(state.reputation, state.fans);
                fresh.forEach(o => { if (!state.pendingOffers.find(p => p.seriesId === o.seriesId)) state.pendingOffers.push(o); });
            }

            // Check if any season goals are now complete
            checkGoals(state, seriesId);

            // Confidence / hot streak — based on last 5 results
            const last5 = state.raceHistory.slice(-5);
            if (last5.length >= 3) {
                const avgPos = last5.filter(r => !r.dnf && !r.dq).reduce((a, r, _, arr) => a + (arr.length ? r.pos / arr.length : 0), 0);
                const dnfRate = last5.filter(r => r.dnf || r.dq).length / last5.length;
                const wins = last5.filter(r => r.pos === 1 && !r.dnf && !r.dq).length;
                let conf = 0;
                if (wins >= 2) conf = 3;
                else if (wins === 1 && avgPos <= 5) conf = 2;
                else if (avgPos <= 5 && dnfRate === 0) conf = 1;
                else if (dnfRate >= 0.4) conf = -2;
                else if (avgPos > 15 && dnfRate >= 0.2) conf = -1;
                else if (avgPos > 12) conf = -1;
                state.confidence = conf;
            }

            // Car condition degradation — 5 components
            const cc = getCarCondition(state, seriesId);
            const cond = CONDITIONS.find(c => c.id === (race.condition || 'clear')) || CONDITIONS[0];
            const hardRace = result.position <= 5;
            const incidentRace = (result.incidentDrivers || []).length > 0 || result.dnf;
            const tier = s ? s.tier : 1;

            // Tire degradation — tier 1-2 assumed included in entry fee, minimal wear
            const tireDeg = tier <= 2 ? rand(0, 2) : tier === 3 ? rand(3, 6) : tier <= 5 ? rand(6, 10) : rand(10, 16);

            // Brakes — consistent wear, harder races wear faster
            const brakeDeg = rand(3, 6) + (hardRace ? 3 : 0);

            // Engine — minimal baseline, big hit only on engine-related DNF
            const engineDNFHit = result.dnf && result.dnfReason && /engine|motor|rod|bearing|blown/i.test(result.dnfReason || '') ? 40 : 0;
            const engineDeg = rand(0, 2) + engineDNFHit;

            // Chassis — near zero clean race, meaningful only on incidents
            const chassisIncidentHit = incidentRace ? rand(5, 10) : 0;
            const chassisDeg = rand(0, 1) + chassisIncidentHit;

            // Suspension — low baseline, incident penalty
            const suspIncidentHit = incidentRace ? rand(6, 12) : 0;
            const suspDeg = rand(1, 3) + suspIncidentHit;

            cc.tires = clamp(cc.tires - tireDeg * (cond.tireWear || 1), 0, 100);
            cc.brakes = clamp(cc.brakes - brakeDeg, 0, 100);
            cc.engine = clamp(cc.engine - engineDeg, 0, 100);
            cc.chassis = clamp(cc.chassis - chassisDeg, 0, 100);
            cc.suspension = clamp(cc.suspension - suspDeg, 0, 100);
            //warn if criticals are too high
            const criticals = [];
            if (cc.engine < 25) criticals.push('Engine');
            if (cc.tires < 15) criticals.push('Tires');
            if (cc.suspension < 20) criticals.push('Suspension');
            if (cc.brakes < 15) criticals.push('Brakes');
            if (cc.chassis < 20) criticals.push('Chassis');
            if (criticals.length && !result.dnf) {
                state.dramaQueue.push({
                    id: 'car_warn_' + uid(), title: '⚠️ Car Needs Attention', effect: 'none',
                    desc: `Post-race inspection flagged: ${criticals.join(', ')} in the red. Race it as-is and you're gambling.`, valence: 'bad'
                });
            }

            // Milestone checking
            checkMilestones(state);
            // Win celebration and streak check
            if (!result.dnf && !result.dq && result.position === 1) {
                const lastFive = (state.raceHistory || []).slice(-5);
                const streak = lastFive.filter(r => r.pos === 1 && !r.dnf && !r.dq).length;

                const celebLines = [
                    `${state.driverName} to victory lane at ${race.track}. The crew lost it. The sponsor rep was there and they lost it too. Good night all around.`,
                    `Win at ${race.track}. ${state.driverName} climbed out of the car and the crew was already halfway to victory lane. Those moments don't get old.`,
                    `${state.driverName} takes it at ${race.track}. Post-race the team looked like they'd been waiting all season for this and honestly they had.`,
                    `Checkered flag for ${state.driverName} at ${race.track}. The radio went crazy on the last lap and it didn't stop for a while after.`,
                    `${state.driverName} wins at ${race.track}. Short burnout, long celebration. The sponsor got their photo. Everyone went home happy.`,
                    `Victory lane at ${race.track}. ${state.driverName} kept it together when it mattered and the whole team felt it. Good one.`,
                    `${state.driverName} gets the win at ${race.track} and the crew chief is already talking about the setup like they knew all along. Classic.`,
                    `Win number whatever for ${state.driverName} at ${race.track}. Doesn't matter what number it is; they all feel like the first one in the moment.`,
                ];

                state.dramaQueue.push({
                    id: 'win_cel_' + uid(),
                    title: `🏆 Win — ${race.track}`,
                    effect: 'none',
                    desc: celebLines[rand(0, celebLines.length - 1)],
                    valence: 'good',
                });

                if (streak >= 3) {
                    const streakLines = [
                        `${streak} wins in a row now. The paddock has stopped pretending not to notice.`,
                        `That's ${streak} straight. At some point it stops being a hot streak and starts being a statement.`,
                        `${streak} consecutive wins for ${state.driverName}. The rivals are not having a good week.`,
                        `Win number ${streak} in a row. The crew chief has the same setup sheet from three weeks ago and nobody is touching it.`,
                    ];
                    state.dramaQueue.push({
                        id: 'streak_' + uid(),
                        title: `🔥 ${streak} Wins in a Row`,
                        effect: 'none',
                        desc: streakLines[rand(0, streakLines.length - 1)],
                        valence: 'good',
                    });
                }
            }


            // Track favorite/weak spot check
            checkTrackFavoritePerformance(state, race.track, result);
            // Track record check — all drivers
            if (!result.dq && result.finishOrder) {
                if (!state.trackRecords) state.trackRecords = {};
                var _trKey2 = seriesId + '::' + race.track;
                if (!state.trackRecords[_trKey2]) state.trackRecords[_trKey2] = { overall: null, personal: null };
                const rec = state.trackRecords[_trKey2];

                // Check all drivers in this race for overall record
                (result.finishOrder || []).forEach(function (entry) {
                    if (!entry.lapTime) return;
                    const sec = lapTimeToSeconds(entry.lapTime);
                    if (!sec) return;
                    if (!rec.overall || sec < rec.overall.time) {
                        rec.overall = {
                            time: entry.lapTime,
                            timeSec: sec,
                            driver: entry.isPlayer ? state.driverName : entry.name,
                            season: state.season,
                            week: state.week,
                        };
                    }
                });

                // Check player personal best
                const playerEntry = (result.finishOrder || []).find(function (e) { return e.isPlayer; });
                if (playerEntry && playerEntry.lapTime && !result.dnf) {
                    const pSec = lapTimeToSeconds(playerEntry.lapTime);
                    if (pSec) {
                        const oldPersonal = rec.personal;
                        if (!rec.personal || pSec < rec.personal.timeSec) {
                            rec.personal = {
                                time: playerEntry.lapTime,
                                timeSec: pSec,
                                season: state.season,
                                week: state.week,
                            };
                            // Only notify if not first visit
                            if (oldPersonal) {
                                const isOverall = rec.overall && rec.overall.driver === state.driverName && rec.overall.time === playerEntry.lapTime;
                                if (isOverall) {
                                    state.dramaQueue.push({
                                        id: 'tr_overall_' + uid(),
                                        title: `⚡ Track Record — ${race.track}`,
                                        effect: 'rep_fans', value: 3, fans: 200,
                                        desc: `${state.driverName} set the all-time fastest lap at ${race.track} with a ${playerEntry.lapTime}; that's the quickest anyone has gone there in the database. Previous record was ${oldPersonal.time}.`,
                                        valence: 'good',
                                        _isSponsor: false,
                                    });
                                } else {
                                    state.dramaQueue.push({
                                        id: 'tr_personal_' + uid(),
                                        title: `📈 Personal Best — ${race.track}`,
                                        effect: 'none',
                                        desc: `New personal best at ${race.track}: ${playerEntry.lapTime}. Previous best was ${oldPersonal.time}. Getting quicker.`,
                                        valence: 'good',
                                    });
                                }
                            }
                        }
                    }
                }
            }


            // Championship pressure — late in season
            const seriesRaces = s.races;
            const racesDone = sched.filter(r => r.result).length;
            const racesLeft = seriesRaces - racesDone;
            if (racesLeft <= 4 && racesLeft > 0) {
                const myPts = state.championshipPoints[seriesId] || 0;
                const field = state.seriesFields[seriesId] || {};
                const allPts = [{ pts: myPts, isPlayer: true }, ...Object.entries(field).map(([n, d]) => ({ pts: d.points, name: n }))].sort((a, b) => b.pts - a.pts);
                const leaderPts = (allPts[0] && allPts[0].pts) || 0;
                const myPos = allPts.findIndex(r => r.isPlayer) + 1;
                const gap = leaderPts - myPts;
                // Max possible points remaining — 43 is the win value in the unified points table
                const maxPtsPerRace = 43;
                const maxPossible = maxPtsPerRace * racesLeft;
                if (myPos === 1 && allPts.length > 1) {
                    const secondGap = myPts - ((allPts[1] && allPts[1].pts) || 0);
                    if (secondGap < maxPtsPerRace * racesLeft * 0.5 && Math.random() < 0.5) {
                        state.dramaQueue.push({
                            id: 'champ_lead_' + uid(), title: 'Championship On The Line', effect: 'none',
                            desc: `${racesLeft} races left. You're P1 by ${secondGap} points. It's yours to lose. Don't lose it.`, valence: 'neutral'
                        });
                    }
                } else if (gap <= maxPossible && gap > 0 && Math.random() < 0.5) {
                    state.dramaQueue.push({
                        id: 'champ_chase_' + uid(), title: `${racesLeft} Races Left`, effect: 'none',
                        desc: `P${myPos} in ${s.short}, ${gap} points back. ${gap <= maxPtsPerRace * 2 ? 'It\'s mathematically alive.' : 'Needs a run.'}`, valence: 'neutral'
                    });
                } else if (gap > maxPossible && myPos > 1) {
                    // Mathematically eliminated
                    if (!state._elimNotified) {
                        state._elimNotified = seriesId;
                        state.dramaQueue.push({
                            id: 'champ_elim_' + uid(), title: 'Championship Eliminated', effect: 'none',
                            desc: `The math doesn't work anymore for the ${s.short} title. Race for pride, points experience, and the winter.`, valence: 'bad'
                        });
                    }
                }
            }
        }

        function _checkContractClose(state, seriesId, sched, contract, s) {
            if (!contract) return;

            const remaining = sched.filter(r => !r.result).length;
            if ((remaining === 0 || contract.racesCompleted >= contract.races))
                _finalizeContract(state, seriesId, contract, s);
        }

        function _finalizeContract(state, seriesId, contract, s) {
            contract.seasonsCompleted++;
            const seasonsLeft = contract.termSeasons - contract.seasonsCompleted;
            if (seasonsLeft <= 0) {
                state.contracts = state.contracts.filter(c => c.seriesId !== seriesId);
                state.teammates = state.teammates.filter(t => t.seriesId !== seriesId);
                addLog(state, `📋 ${s.short} contract with ${contract.team} complete. Total: ${fmtMoney(contract.earnings)}`);
            } else {
                addLog(state, `📋 ${s.short} season done with ${contract.team}. ${seasonsLeft} season(s) remaining on deal.`);
            }
        }

        function _rollDrama(state) {
            const _lastRH = (state.raceHistory || []).slice(-1)[0];
            const _badRace = _lastRH && (_lastRH.dnf || _lastRH.dq || _lastRH.pos >= (_lastRH.fs || 20) * 0.8);
            const pool = [...DRAMA].filter(function(e) {
                if (!_badRace) return true;
                // After a DNF or back-of-field finish, suppress positive rep/money events
                if (e.effect === 'rep_fans' && (e.value > 0 || e.fans > 0)) return false;
                if (e.effect === 'money' && e.value > 0) return false;
                return true;
            });

            // Confidence-boosted events — hot streaks attract more positive drama
            const conf = state.confidence || 0;
            if (conf >= 2) {
                // Hot streak — extra positive drama chance
                pool.push({ id: 'hot_streak_bonus', weight: 3, title: 'Hot Streak Buzz', effect: 'rep_fans', value: 6, fans: 400, desc: 'You\'ve been on fire lately. The paddock is talking. Sponsors are paying attention.' });
                pool.push({ id: 'momentum_story', weight: 2, title: 'Momentum Building', effect: 'rep_fans', value: 4, fans: 300, desc: 'The narrative around your season is shifting. Writers are calling it a run.' });
            } else if (conf <= -2) {
                // Cold streak — more pressure drama
                pool.push({ id: 'cold_streak_heat', weight: 3, title: 'Results Under Scrutiny', effect: 'rep_hit', value: -3, fans: -100, desc: 'Your recent results have people asking questions. The paddock remembers form.' });
                pool.push({ id: 'sponsor_nerves', weight: 2, title: 'Sponsor Getting Nervous', effect: 'rep_hit', value: -2, fans: 0, desc: 'Your sponsor\'s rep reached out. "Just checking in." The tone said more than the words.' });
            }

            // Teammate tension — only if you have teammates and enough race history
            const teammates = state.teammates || [];
            if (teammates.length > 0 && Math.random() < 0.25) {
                const tm = teammates[rand(0, teammates.length - 1)];
                const seriesId = tm.seriesId;
                const contract = (state.contracts || []).find(c => c.seriesId === seriesId);
                if (contract && !contract.indie) {
                    pool.push({
                        id: 'teammate_tension_' + uid(),
                        weight: 4,
                        title: 'Team Orders',
                        effect: 'none',
                        desc: `${contract.team} quietly suggested you might "manage the gap" behind ${tm.name} in the next race. They didn't call it team orders. It was team orders.`,
                        _isTeamOrder: true,
                        _teammate: tm.name,
                        _seriesId: seriesId,
                    });
                }
            }

            const total = pool.reduce((s, e) => s + e.weight, 0);
            let r = Math.random() * total;
            for (const e of pool) { r -= e.weight; if (r <= 0) return { ...e, id: (e.id || 'drama') + uid() }; }
            return null;
        }

        // special event processing
        function processSpecialResult(state, evtId, result, cost) {
            const evt = SPECIAL_EVENTS.find(function(e) { return e.id === evtId; });
            if (!evt) return;
            state.money -= cost;

            // Prize — scaled by position
            const prizeBase = evt.prize || 0;
            const prizeEarned = result.dnf ? Math.floor(prizeBase * 0.20)
                : result.dq ? 0
                : result.position === 1 ? prizeBase
                : result.position <= 3 ? Math.floor(prizeBase * 0.65)
                : result.position <= 6 ? Math.floor(prizeBase * 0.40)
                : result.position <= 10 ? Math.floor(prizeBase * 0.25)
                : Math.floor(prizeBase * 0.10);
            state.money += prizeEarned;
            state.totalPrizeMoney += prizeEarned;

            // Fan gain — scale by position
            const fanMult = result.dnf ? 0.20 : result.dq ? 0.10
                : result.position === 1 ? 2.0 : result.position <= 3 ? 1.5
                : result.position <= 6 ? 1.2 : result.position <= 10 ? 0.9 : 0.5;
            const fansEarned = Math.floor((evt.fanGain || 300) * fanMult);
            state.fans = Math.max(0, state.fans + fansEarned);

            // Rep — prestige multiplier based on reqRep gate
            const prestigeMult = evt.reqRep >= 95 ? 2.0 : evt.reqRep >= 80 ? 1.6
                : evt.reqRep >= 60 ? 1.3 : evt.reqRep >= 40 ? 1.1
                : evt.reqRep >= 20 ? 0.9 : 0.7;
            const repBase = result.dq ? -rand(3, 6)
                : result.dnf ? -rand(1, 3)
                : result.position === 1 ? rand(10, 16)
                : result.position <= 3 ? rand(6, 11)
                : result.position <= 6 ? rand(4, 8)
                : result.position <= 10 ? rand(2, 5)
                : rand(1, 3);
            // Showing up at a prestige event is worth something even if results disappoint
            const participationBonus = !result.dnf && !result.dq && evt.reqRep >= 40 ? rand(1, 3) : 0;
            const repEarned = Math.round((repBase + participationBonus) * prestigeMult);
            state.reputation = Math.max(0, state.reputation + repEarned);

            const pos = result.dnf ? 'DNF' : result.dq ? 'DQ' : 'P' + result.position + '/' + result.fieldSize;
            addLog(state, '🏁 ' + evt.name + ' @ ' + evt.track + ': ' + pos + ' | ' + fmtMoney(prizeEarned) + ' | +' + fmtFans(fansEarned) + ' fans | Rep ' + (repEarned >= 0 ? '+' : '') + repEarned);

            // Sponsor interest
            if (!evt.fig8 && Math.random() < (evt.sponsorChance || 0.05) && state.reputation >= (evt.reqRep || 0)) {
                const sp = makeSponsor(evtId, 'primary', true);
                state.sponsorOffers.push(sp);
                addLog(state, '📬 ' + sp.brand + ' noticed your run at ' + evt.name + '. They want to talk sponsorship.');
            }

            // Post-race drama — scaled by prestige and result
            if (!result.dq) {
                var dramaThreshold = evt.reqRep >= 60 ? 6 : evt.reqRep >= 30 ? 4 : 99;
                var isNoteworthy = result.position <= dramaThreshold && !result.dnf;
                if (isNoteworthy || (result.position === 1)) {
                    const winLines = [
                        'Word from ' + evt.name + ' is making rounds in the paddock. People noticed.',
                        'The result at ' + evt.name + ' is being talked about. That\'s the kind of run that changes conversations.',
                        evt.name + ' is over and the result is going to follow you for a while. In a good way.',
                        'A win at ' + evt.name + '. That one goes on the résumé and stays there.',
                    ];
                    const podiumLines = [
                        'A podium at ' + evt.name + '. That goes on the resume.',
                        'Top ' + result.position + ' at ' + evt.name + '. The paddock has a longer memory than you think.',
                        'P' + result.position + ' at ' + evt.name + '. That result is doing work for you right now.',
                        'Finished P' + result.position + ' at ' + evt.name + '. Not everyone who enters that event finishes that high.',
                    ];
                    const showupLines = [
                        'Competed at ' + evt.name + '. The experience counts even when the result doesn\'t go all the way.',
                        evt.name + ' is the kind of race that teaches you something whether you win or not.',
                    ];
                    const lines = result.position === 1 ? winLines
                        : result.position <= 3 ? podiumLines : showupLines;
                    state.dramaQueue.push({
                        id: 'invite_result_' + uid(),
                        title: result.position === 1 ? '🏆 Won at ' + evt.name
                            : result.position <= 3 ? '📋 Podium at ' + evt.name
                            : '🏁 Competed at ' + evt.name,
                        effect: 'none',
                        desc: lines[rand(0, lines.length - 1)],
                        valence: result.position <= 3 ? 'good' : 'neutral',
                    });
                }
            }

            state.specialResults.push({
                evtId, season: state.season, week: state.week,
                pos: result.position, dnf: result.dnf, dq: result.dq || false,
                fans: fansEarned, rep: repEarned, prize: prizeEarned,
                track: evt.track, fieldSize: result.fieldSize, isSupport: !!(result._isSupport),
            });
            state.week++;
        }