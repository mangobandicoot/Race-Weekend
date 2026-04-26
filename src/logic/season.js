 // ai season simulation
        function simulateAISeasons(state) {
            // give all ai drivers a season result when player wraps up
            const promotions = [], demotions = [];

            state.drivers.forEach(d => {
                if (!d.active) return;
                const s = getSeries(d.currentSeriesId);
                if (!s) return;
                if (s.isSideStep) return; // side series tick per-race not here

                // sim season from skill - modifiers only apply if player isnt in this series
                const playerInSeries = G.contracts && G.contracts.some(function (c) { return c.seriesId === d.currentSeriesId; });
                let skillRoll = d.skill + randF(-20, 20);
                if (!playerInSeries && d.aiStats) {
                    // age curve - peak 28-32, slow decline after 45
                    const age = d.aiStats.age || 30;
                    const ageMult = age < 18 ? 0.85
                        : age < 25 ? 0.90 + (age - 18) * 0.02
                            : age < 33 ? 1.0
                                : age < 45 ? 1.0 - (age - 33) * 0.008
                                    : 0.85 - (age - 45) * 0.005;
                    // optimism = consistency
                    const optimismVariance = (50 - (d.aiStats.optimism || 50)) * 0.15;
                    // better crew = fewer dnfs
                    const pitFactor = (d.aiStats.pitCrewSkill || 50) / 100;
                    skillRoll = (skillRoll + (d.aiStats.relativeSkill || 50) * 0.3) * ageMult + optimismVariance;
                    // aggression = more incidents
                    if (d.aiStats.aggression > 65 && Math.random() < (d.aiStats.aggression - 65) * 0.008) {
                        skillRoll -= rand(5, 15);
                    }
                    // bad crew = more dnfs
                    if (pitFactor < 0.4 && Math.random() < (0.4 - pitFactor) * 0.3) {
                        skillRoll -= rand(10, 20);
                    }
                }
                const estPos = clamp(Math.round(((100 - skillRoll) / 100) * (s.races * 1.5) + 1), 1, 40);
                const seasonWins = skillRoll > 75 ? rand(1, 5) : skillRoll > 60 ? rand(0, 3) : skillRoll > 40 ? rand(0, 1) : 0;
                const seasonTop5 = Math.max(seasonWins, Math.round(skillRoll / 20));

                // rep and fans
                const repChange = seasonWins > 2 ? rand(8, 15) : seasonWins > 0 ? rand(3, 8) : skillRoll > 60 ? rand(0, 3) : -rand(0, 3);
                const _sFanMult = [1, 1, 2, 4, 12, 40, 100, 250][s.tier || 1] || 1;
                const fanChange = Math.round((seasonWins > 2 ? rand(200, 800) : seasonWins > 0 ? rand(50, 300) : rand(-50, 100)) * _sFanMult);
                d.rep = clamp(d.rep + repChange, 0, 400);
                d.fans = clamp(d.fans + fanChange, 0, 2000000);
                d.wins += seasonWins;
                d.top5s += seasonTop5;
                                const rate = (d.attendanceRate !== undefined) ? d.attendanceRate : 0.85;
                const racesActuallyRun = Math.round(s.races * rate * randF(0.9, 1.0));
                d.starts += racesActuallyRun;
                d.seasonPoints = rand(30, Math.max(60, Math.round(400 * rate)));
                d.careerHistory.push({ season: state.season, seriesId: d.currentSeriesId, rep: d.rep, wins: seasonWins, pos: estPos });
                if (d.careerHistory.length > 20) d.careerHistory = d.careerHistory.slice(-20);
                // age and skill
                if (d.aiStats && d.aiStats.age < 65) d.aiStats.age++;
                if (d.aiStats) {
                    const age = d.aiStats.age;
                    if (age >= 45 && d.skill > 20) d.skill = Math.max(20, d.skill - rand(0, 1));
                    if (age < 25 && d.skill < 85) d.skill = Math.min(85, d.skill + rand(0, 1));
                }

                // promotion/demotion - rep, results, consistency, skill all factor in
                const nextSeries = SERIES.find(ns => ns.tier === s.tier + 1);
                const prevSeries = SERIES.find(ps => ps.tier === s.tier - 1);
                // consistency from smoothness and optimism
                const consistencyScore = d.aiStats ? ((d.aiStats.smoothness || 50) + (100 - (d.aiStats.pittingRisk || 50))) / 2 : 50;
                // needs all three to go up
                const promotionScore = (skillRoll * 0.5) + (d.rep / Math.max(nextSeries ? nextSeries.reqRep : 100, 1) * 30) + (consistencyScore * 0.2);
                const demotionScore  = (skillRoll * 0.5) + (d.rep / Math.max(s.reqRep || 1, 1) * 30) + (consistencyScore * 0.2);
                const promoteChance  = promotionScore > 85 ? 0.35 : promotionScore > 75 ? 0.20 : promotionScore > 65 ? 0.10 : 0.03;
                const demoteChance   = demotionScore  < 30 ? 0.30 : demotionScore  < 45 ? 0.15 : 0.04;
                if (nextSeries && d.rep >= nextSeries.reqRep && d.fans >= nextSeries.reqFans && skillRoll > 60 && d.skill >= (40 + (nextSeries.tier * 5)) && Math.random() < promoteChance) {
                    promotions.push({ driver: d, from: s.id, to: nextSeries.id });
                } else if (prevSeries && d.rep < s.reqRep * 0.6 && skillRoll < 45 && Math.random() < demoteChance) {
                    demotions.push({ driver: d, from: s.id, to: prevSeries.id });
                }
            });

            // t1-3 looser movement
            promotions.filter(function (p) { return (getSeries(p.from) && getSeries(p.from).tier) || 0 < 4; }).forEach(function ({ driver, to }) {
                driver.currentSeriesId = to;
                const teamList = TEAMS[to] || ['Independent'];
                driver.currentTeam = teamList[rand(0, teamList.length - 1)];
                driver._carNumberSeniority = 0;
                addLog(state, '📈 ' + driver.name + ' promoted to ' + (getSeries(to) && getSeries(to).short) || to);
                if (driver.source === 'known') _notifyRosterChange(state, driver, 'promoted', to, null);
            });

            demotions.filter(function (p) { return (getSeries(p.from) && getSeries(p.from).tier) || 0 < 4; }).forEach(function ({ driver, to }) {
                driver.currentSeriesId = to;
                const teamList = TEAMS[to] || ['Independent'];
                driver.currentTeam = teamList[rand(0, teamList.length - 1)];
                driver._carNumberSeniority = 0;
                addLog(state, '📉 ' + driver.name + ' dropped to ' + (getSeries(to) && getSeries(to).short) || to);
                if (driver.source === 'known') _notifyRosterChange(state, driver, 'demoted', to, null);
                if ((getSeries(to) && getSeries(to).tier) === 1) retireDriverAsJrCandidate(driver);
            });

            // t4+ slot balanced
            const NATIONAL_TIERS = [4, 5, 6, 7];
            NATIONAL_TIERS.forEach(function (tier) {
                const seriesAtTier = SERIES.find(function (s) { return s.tier === tier; });
                const seriesBelow = SERIES.find(function (s) { return s.tier === tier - 1; });
                if (!seriesAtTier || !seriesBelow) return;

                const movingUp = promotions.filter(function (p) { return p.to === seriesAtTier.id; });
                const movingDown = demotions.filter(function (p) { return p.from === seriesAtTier.id; });
                const count = movingUp.length;

                // promote
                movingUp.forEach(function ({ driver, to }) {
                    driver.currentSeriesId = to;
                    const teamList = TEAMS[to] || ['Independent'];
                    driver.currentTeam = teamList[rand(0, teamList.length - 1)];
                    driver._carNumberSeniority = 0;
                    addLog(state, '📈 ' + driver.name + ' promoted to ' + (getSeries(to) && getSeries(to).short));
                    if (driver.source === 'known') _notifyRosterChange(state, driver, 'promoted', to, null);
                });

                // need to move someone down to make room
                let actualDemotions = movingDown.slice(0, count);
                if (actualDemotions.length < count) {
                    // worst performers go down
                    const alreadyDemoted = new Set(actualDemotions.map(function (d) { return d.driver.name; }));
                    const candidates = state.drivers.filter(function (d) {
                        return d.active &&
                            d.currentSeriesId === seriesAtTier.id &&
                            !alreadyDemoted.has(d.name) &&
                            d.name.toLowerCase() !== state.driverName.toLowerCase();
                    }).sort(function (a, b) {
                        return ((a.skill || 50) + (a.seasonPoints || 0) * 0.1) - ((b.skill || 50) + (b.seasonPoints || 0) * 0.1);
                    });
                    const needed = count - actualDemotions.length;
                    candidates.slice(0, needed).forEach(function (d) {
                        actualDemotions.push({ driver: d, from: seriesAtTier.id, to: seriesBelow.id });
                    });
                }

                actualDemotions.forEach(function ({ driver, to }) {
                    const fromId = driver.currentSeriesId;
                    driver.currentSeriesId = seriesBelow.id;
                    const teamList = TEAMS[seriesBelow.id] || ['Independent'];
                    driver.currentTeam = teamList[rand(0, teamList.length - 1)];
                    driver._carNumberSeniority = 0;
                    addLog(state, '📉 ' + driver.name + ' dropped to ' + (getSeries(seriesBelow.id) && getSeries(seriesBelow.id).short));
                    if (driver.source === 'known') _notifyRosterChange(state, driver, 'demoted', seriesBelow.id, null);
                });
            });

            state.drivers.forEach(d => {
                if (!d.active) { retireDriverAsJrCandidate(d); return; }
                const s2 = getSeries(d.currentSeriesId);
                const age = d.aiStats ? d.aiStats.age : 40;
                const shouldRetire =
                    (age >= 65) ||
                    (age >= 55 && d.skill < 30 && Math.random() < 0.25) ||
                    ((s2 && s2.tier) === 1 && d.starts > 60 && d.skill < 35 && Math.random() < 0.15);

                if (shouldRetire) {
                    d.active = false;
                    retireDriverAsJrCandidate(d);

                    // Paddock notice for notable retirements
                    const isRival = (state.rivals || []).some(r => r.name === d.name && ['rival', 'frenemy'].includes(relationship(r)));
                    const isFriend = (state.rivals || []).some(r => r.name === d.name && ['friend', 'racing_rival'].includes(relationship(r)));
                    const isTm = (state.teammates || []).some(t => t.name === d.name);
                    if (isRival || isFriend || isTm || d.source === 'known') {
                        const lines = [
                            `${d.name} has retired after ${d.starts} career starts. Word came through the paddock at the end of the season.`,
                            `${d.name} is done racing; the announcement came quietly but it's official. ${d.starts} starts, ${d.wins} wins. Not a bad run.`,
                            `Heard at the end of season banquet that ${d.name} is hanging it up. ${d.starts} starts over their career. The paddock will be different without them.`,
                            `${d.name} confirmed retirement this offseason. ${d.wins > 0 ? d.wins + ' wins and ' : ''}${d.starts} starts. They earned their exit.`,
                        ];
                        const line = lines[rand(0, lines.length - 1)];
                        state.dramaQueue.push({
                            id: 'retire_' + uid(),
                            title: `${d.name} Retires`,
                            effect: 'none',
                            desc: line,
                            valence: isRival ? 'good' : 'neutral',
                        });
                        addLog(state, `🏁 ${d.name} retired after ${d.starts} starts.`);
                    }

                    // Spawn replacement driver
                    let newName = generateAIName();
                    let tries = 0;
                    while (state.drivers.find(x => x.name === newName) && tries < 200) { newName = generateAIName(); tries++; }

                    // Small chance of Jr. connection
                    const parts = d.name.replace(/ Jr\.?$/i, '').trim().split(' ');
                    const lastName = parts[parts.length - 1];
                    if (Math.random() < 0.20 && lastName && lastName.length > 2) {
                        const firstPool = ['Kyle', 'Chase', 'Tyler', 'Austin', 'Logan', 'Cody', 'Blake', 'Carson'];
                        const jrFirst = firstPool[rand(0, firstPool.length - 1)];
                        newName = jrFirst + ' ' + lastName + ' Jr.';
                        if (state.drivers.find(x => x.name === newName)) newName = generateAIName();
                    }

                    const newDriver = createDriver(newName, rand(30, 55), d.currentSeriesId, 'generated');
                    state.drivers.push(newDriver);

                    // Only notify about replacements for known series
                    if (isRival || isFriend || isTm || d.source === 'known') {
                        const isJr = newName.includes('Jr.');
                        const repLines = isJr ? [
                            `${newName} is joining the ${(s2 && s2.short) || 'series'} field this season; that last name will be familiar to anyone who followed ${d.name}'s career.`,
                            `A familiar name is back in the ${(s2 && s2.short) || 'series'}; ${newName} takes over the seat vacated by ${d.name}.`,
                        ] : [
                            `${newName} joins the ${(s2 && s2.short) || 'series'} field to fill the vacancy left by ${d.name}'s retirement.`,
                            `The seat ${d.name} vacated goes to ${newName} for the upcoming season.`,
                            `${newName} gets their shot in the ${(s2 && s2.short) || 'series'} after ${d.name} stepped away.`,
                        ];
                        state.dramaQueue.push({
                            id: 'newdriver_retire_' + uid(),
                            title: `${newName} Joins ${(s2 && s2.short) || 'Series'}`,
                            effect: 'none',
                            desc: repLines[rand(0, repLines.length - 1)],
                            valence: 'neutral',
                        });
                    }
                }
            });

            // Cross-series appearances — drivers run select races in adjacent tiers
            // Cup/Xfinity overlap, Mini Stock regulars dabble in Street Stock, etc.
            state.drivers.forEach(function(d) {
                if (!d.active) return;
                var s = getSeries(d.currentSeriesId);
                if (!s || s.isSideStep) return;
                // Chance of attempting an adjacent series based on tier
                // Higher-tier drivers more likely to "drop down" for select races
                var crossChance = s.tier >= 6 ? 0.40  // Cup drivers often do Xfinity
                    : s.tier >= 5 ? 0.25              // Xfinity drivers try Trucks
                    : s.tier >= 4 ? 0.15              // ARCA guys try Late Model
                    : s.tier >= 3 ? 0.12              // Late Model tries Street Stock
                    : s.tier >= 2 ? 0.10              // Street Stock tries Mini Stock events
                    : 0.08;                            // Mini Stock guys try Street Stock
                if (Math.random() > crossChance) return;
                // Pick adjacent series — either one up or one down
                var adjacent = [];
                var seriesUp = SERIES.find(function(ns) { return ns.tier === s.tier + 1 && !ns.isSideStep; });
                var seriesDown = SERIES.find(function(ns) { return ns.tier === s.tier - 1 && !ns.isSideStep; });
                // Higher tiers drop down more than move up; lower tiers try moving up
                if (seriesDown && s.tier >= 4) adjacent.push(seriesDown);
                if (seriesUp && s.tier <= 3 && d.skill > 55) adjacent.push(seriesUp);
                if (seriesDown && s.tier <= 3) adjacent.push(seriesDown);
                if (!adjacent.length) return;
                var targetSeries = adjacent[rand(0, adjacent.length - 1)];
                // Mark as a part-time appearance — doesn't change their home series
                if (!d._partTimeAppearances) d._partTimeAppearances = [];
                var alreadyThere = d._partTimeAppearances.some(function(a) { return a.seriesId === targetSeries.id && a.season === state.season; });
                if (!alreadyThere) {
                    d._partTimeAppearances.push({ seriesId: targetSeries.id, season: state.season, races: rand(2, 6) });
                }
            });

            // Team reshuffles — some drivers change teams
            state.drivers.forEach(d => {
                if (!d.active) return;
                if (Math.random() < 0.15) {
                    const teamList = TEAMS[d.currentSeriesId] || ['Independent'];
                    d.currentTeam = teamList[rand(0, teamList.length - 1)];
                }
            });

            // Reset seasonal stats
            // Process drivers leaving their current team to join the player's owned team
            if (state.ownedTeam) {
                state.drivers.forEach(function(d) {
                    if (d._leavingForTeam && d._leavingAfterSeason === state.season - 1) {
                        var oldTeam = d.currentTeam;
                        d.currentTeam = null; // they're now exclusively with the player's team
                        d._leavingForTeam = null;
                        d._leavingAfterSeason = null;
                        addLog(state, '🚗 ' + d.name + ' has left ' + oldTeam + ' and is now full-time with ' + state.ownedTeam.name + '.');
                    }
                });
            }

            state.drivers.forEach(d => { d.seasonPoints = 0; d.seasonWins = 0; d.injuredOrPenalized = false; d.substituteFor = null; });
            if (state.ownedTeam) {
                state.ownedTeam.drivers.forEach(function(td) {
                    if (td) { td.points = 0; td.wins = 0; td.top5s = 0; td.top10s = 0; td.starts = 0; }
                });
            }
            // Evolve AI-to-AI rivalries each season
            state.drivers.forEach(function (d) {
                if (!d.active) return;
                if ((d.aiRivals || []).length > 0 && Math.random() < 0.15) {
                    var rivalName = d.aiRivals[Math.floor(Math.random() * d.aiRivals.length)];
                    var rival = (state.drivers || []).find(function (r) { return r.name === rivalName; });
                    if (rival && !(rival.aiRivals || []).includes(d.name)) {
                        rival.aiRivals = rival.aiRivals || [];
                        rival.aiRivals.push(d.name);
                    }
                }
                if ((d.aiFriends || []).length < 3 && Math.random() < 0.08) {
                    var colleagues = (state.drivers || []).filter(function (c) {
                        return c !== d && c.active &&
                            c.currentSeriesId === d.currentSeriesId &&
                            !(d.aiFriends || []).includes(c.name) &&
                            !(d.aiRivals || []).includes(c.name);
                    });
                    if (colleagues.length) {
                        var newFriend = colleagues[Math.floor(Math.random() * colleagues.length)];
                        d.aiFriends = d.aiFriends || [];
                        d.aiFriends.push(newFriend.name);
                        newFriend.aiFriends = newFriend.aiFriends || [];
                        if (!newFriend.aiFriends.includes(d.name)) newFriend.aiFriends.push(d.name);
                    }
                }
            });

            // Inject fresh rookies into tier 1 to replace promoted drivers
            // Keeps the entry-level field feeling like new blood each season
            var tier1Series = SERIES.find(function(s) { return s.tier === 1 && !s.isSideStep; });
            if (tier1Series) {
                var tier1Drivers = state.drivers.filter(function(d) { return d.active && d.currentSeriesId === tier1Series.id; });
                var promoted1 = promotions.filter(function(p) { return (getSeries(p.from) && getSeries(p.from).tier) === 1; }).length;
                var retired1 = state.drivers.filter(function(d) { return !d.active && d.currentSeriesId === tier1Series.id; }).length;
                var toAdd = Math.max(promoted1, Math.floor(tier1Drivers.length * 0.15)); // at least 15% turnover
                toAdd = Math.min(toAdd, 8); // cap at 8 new rookies per season
                for (var _ri = 0; _ri < toAdd; _ri++) {
                    var rName = generateAIName();
                    var _tries = 0;
                    while (state.drivers.find(function(x) { return x.name === rName; }) && _tries < 200) { rName = generateAIName(); _tries++; }
                    var rookie = createDriver(rName, rand(28, 52), tier1Series.id, 'generated');
                    state.drivers.push(rookie);
                }
            }

            return { promotions, demotions };
        }

        // season goals
        const FAN_PROMISE_STORIES = [
            { desc: 'A kid in the stands held up a sign before the race. "Win one for me." You nodded.', target: 'win', reward: { rep: 12, fans: 800 }, failPenalty: { rep: -6, fans: -300 } },
            { desc: 'Your hometown paper ran a story saying you\'d finish top 5 this season. Your dad shared it.', target: 'top5', reward: { rep: 8, fans: 500 }, failPenalty: { rep: -3, fans: -150 } },
            { desc: 'A local racing club named you their driver of the year — before the season. Time to earn it.', target: 'top10', reward: { rep: 6, fans: 400 }, failPenalty: { rep: -2, fans: -100 } },
            { desc: 'You told a sick kid at the hospital you\'d get a win this season. She drew you a picture of the car.', target: 'win', reward: { rep: 15, fans: 1200 }, failPenalty: { rep: -8, fans: -500 } },
            { desc: 'Your sponsor\'s CEO told the board you\'d win a race this season. He went out on a limb.', target: 'win', reward: { rep: 10, fans: 600 }, failPenalty: { rep: -5, fans: -200 } },
            { desc: 'You posted that you\'d make top 5 in points this season. The comments are watching.', target: 'top5_pts', reward: { rep: 9, fans: 700 }, failPenalty: { rep: -4, fans: -250 } },
            { desc: 'A retiring legend told the press he thinks you\'ll win your first race this year. Don\'t make him wrong.', target: 'win', reward: { rep: 14, fans: 1000 }, failPenalty: { rep: -7, fans: -400 } },
            { desc: 'Your crew chief bet his fishing boat that you\'d crack the top 10 in points this season. His boat is on the line.', target: 'top10_pts', reward: { rep: 7, fans: 350 }, failPenalty: { rep: -2, fans: -100 } },
            { desc: 'You shook hands with a fan who drove 400 miles to see you race. You told him top 5 before the season ends.', target: 'top5', reward: { rep: 9, fans: 450 }, failPenalty: { rep: -3, fans: -200 } },
        ];

        function generateSeasonGoals(state) {
            const goals = [];
            const seriesIds = state.contracts.map(c => c.seriesId);
            if (!seriesIds.length) return goals;
            // Use the series with the most scheduled races — reflects primary commitment
            const sid = seriesIds.reduce(function(best, id) {
                var schedLen = (state.schedules[id] || []).length;
                var bestLen = (state.schedules[best] || []).length;
                return schedLen > bestLen ? id : best;
            }, seriesIds[0]);
            const s = getSeries(sid);
            if (!s) return goals;
            const tier = s.tier;

            // 1. Sponsor goal
            const primarySponsor = state.sponsors.find(sp => sp.type === 'primary' || sp.type === 'international');
            if (primarySponsor) {
                const targetType = tier <= 2 ? 'top10' : tier <= 4 ? 'top5' : 'win';
                const targetLabel = targetType === 'win' ? 'Win a race' : targetType === 'top5' ? 'Finish top 5' : 'Finish top 10';
                const bonus = Math.floor(primarySponsor.valuePerSeason * (targetType === 'win' ? 0.4 : 0.2));
                const sponsorSeriesId = primarySponsor.seriesId || sid;
                const sponsorSeries = getSeries(sponsorSeriesId) || s;
                goals.push({
                    id: 'sponsor_' + uid(), type: 'sponsor', seriesId: sponsorSeriesId,
                    sponsorName: primarySponsor.brand,
                    desc: `${primarySponsor.brand} wants a result in the ${sponsorSeries.short}. They need ${targetLabel.toLowerCase()} this season to justify the renewal conversation.`,
                    target: targetType, reward: { money: bonus }, failPenalty: { sponsorHappy: -25 },
                    status: 'active', season: state.season, achieved: false,
                });
            }

            // 2. Fan promise
            if (Math.random() < 0.75) {
                const eligible = FAN_PROMISE_STORIES.filter(p => tier <= 2 ? (p.target !== 'win' || Math.random() < 0.25) : true);
                const story = eligible[rand(0, eligible.length - 1)];
                goals.push({
                    id: 'promise_' + uid(), type: 'fan_promise', seriesId: sid,
                    desc: story.desc, target: story.target,
                    reward: story.reward, failPenalty: story.failPenalty,
                    status: 'active', season: state.season, achieved: false,
                    _startPoles: state.poles,
                });
            }

            // 3. Personal milestone
            let milestone = null;
            const careerWins = state.wins;
            if (careerWins === 0 && state.starts >= 3) {
                milestone = { desc: 'You haven\'t won yet. This is the season that changes.', target: 'win', reward: { rep: 10, fans: 500 }, failPenalty: { rep: -2 } };
            } else if (tier >= 3 && !state.raceHistory.find(r => r.season < state.season && r.pos === 1 && (getSeries(r.seriesId) && getSeries(r.seriesId).tier >= 3))) {
                milestone = { desc: `First win at the ${s.short} level would mean something. Prove you belong here.`, target: 'win', reward: { rep: 12, fans: 600 }, failPenalty: { rep: -2 } };
            } else {
                const lastSeasonRaces = state.raceHistory.filter(r => r.season === state.season - 1 && r.seriesId === sid && !r.dnf && !r.dq);
                if (lastSeasonRaces.length >= 4) {
                    const avg = lastSeasonRaces.reduce((a, r, _, arr) => a + r.pos / arr.length, 0);
                    if (avg > 8) milestone = { desc: `You averaged P${Math.round(avg)} last season. Average top 8 this year.`, target: 'avg_top8', reward: { rep: 5, fans: 200 }, failPenalty: { rep: -1 } };
                }
            }
            if (milestone) {
                goals.push({
                    id: 'milestone_' + uid(), type: 'milestone', seriesId: sid,
                    desc: milestone.desc, target: milestone.target,
                    reward: milestone.reward, failPenalty: milestone.failPenalty,
                    status: 'active', season: state.season, achieved: false,
                    _startPoles: state.poles,
                });
            }

            return goals.slice(0, 3);
        }

        function checkGoals(state, seriesId) {
            if (!(state.seasonGoals || []).length) return;
            const seasonRaces = state.raceHistory.filter(r => r.season === state.season);
            state.seasonGoals.forEach(goal => {
                if (goal.status !== 'active') return;
                const racesDone = seasonRaces.filter(r => r.seriesId === goal.seriesId);
                let achieved = false;
                // win/top5/top10 are global — any series counts
                const allCleanRaces = seasonRaces.filter(r => r.seriesId === r.seriesId); // all series this season
                const globalClean = state.raceHistory.filter(r => r.season === state.season && !r.dnf && !r.dq);
                switch (goal.target) {
                    case 'win': achieved = globalClean.some(r => r.pos === 1); break;
                    case 'top5': achieved = globalClean.some(r => r.pos <= 5); break;
                    case 'top10': achieved = globalClean.some(r => r.pos <= 10); break;
                    case 'top10_pts': achieved = (function() {
                        const field = state.seriesFields[goal.seriesId] || {};
                        const myPts = state.championshipPoints[goal.seriesId] || 0;
                        const allPts = [myPts, ...Object.values(field).map(function(d) { return d.points || 0; })].sort(function(a,b){return b-a;});
                        return allPts.indexOf(myPts) < 10;
                    })(); break;
                    case 'top5_pts': {
                        const pts = state.championshipPoints[goal.seriesId] || 0;
                        const field = state.seriesFields[goal.seriesId] || {};
                        const rows = [{ points: pts, isPlayer: true }, ...Object.entries(field).map(([n, d]) => ({ points: d.points }))].sort((a, b) => b.points - a.points);
                        achieved = rows.findIndex(r => r.isPlayer) < 5; break;
                    }
                    case 'avg_top8': {
                        // best average from any series with 5+ clean finishes
                        const contractIds = (state.contracts || []).map(c => c.seriesId);
                        achieved = contractIds.some(function(sid) {
                            const cRaces = state.raceHistory.filter(r => r.season === state.season && r.seriesId === sid && !r.dnf && !r.dq);
                            if (cRaces.length < 5) return false;
                            const avg = cRaces.reduce((a, r, _, arr) => a + r.pos / arr.length, 0);
                            return avg <= 8;
                        });
                        break;
                    }
                }
                if (achieved) {
                    goal.status = 'complete'; goal.achieved = true;
                    if (goal.reward.money) { state.money += goal.reward.money; state.totalPrizeMoney += goal.reward.money; }
                    if (goal.reward.rep) state.reputation = Math.max(0, state.reputation + goal.reward.rep);
                    if (goal.reward.fans) state.fans = Math.max(0, state.fans + goal.reward.fans);
                    if (goal.reward.sponsorHappy) state.sponsors = state.sponsors.map(sp => ({ ...sp, happiness: clamp(sp.happiness + goal.reward.sponsorHappy, 0, 100) }));
                    const rewardStr = [goal.reward.money ? `+${fmtMoney(goal.reward.money)}` : null, goal.reward.rep ? `+${goal.reward.rep} rep` : null, goal.reward.fans ? `+${fmtFans(goal.reward.fans)} fans` : null].filter(Boolean).join(', ');
                    const title = goal.type === 'fan_promise' ? '🤝 Promise Kept' : goal.type === 'sponsor' ? '🏆 Sponsor Goal Hit' : '⭐ Milestone Reached';
                    state.dramaQueue.push({ id: 'goal_done_' + uid(), title, effect: 'none', desc: `You did it. ${goal.desc.split('.')[0]}. Reward: ${rewardStr}.`, valence: 'good' });
                    addLog(state, `✅ Goal complete (${goal.type}): ${goal.target} — ${rewardStr}`);
                }
            });
        }

        function resolveSeasonGoals(state) {
            if (!(state.seasonGoals || []).length) return;
            state.seasonGoals.forEach(goal => {
                if (goal.status !== 'active') return;
                goal.status = 'failed';
                const p = goal.failPenalty || {};
                if (p.rep) state.reputation = Math.max(0, state.reputation + p.rep);
                if (p.fans) state.fans = Math.max(0, state.fans + p.fans);
                if (p.sponsorHappy) state.sponsors = state.sponsors.map(sp => ({ ...sp, happiness: clamp(sp.happiness + p.sponsorHappy, 0, 100) }));
                if (goal.type === 'fan_promise' && p.rep < -4) {
                    state.dramaQueue.push({
                        id: 'goal_fail_' + uid(), title: '💔 Promise Broken', effect: 'none',
                        desc: goal.desc.split('.')[0] + '. You didn\'t deliver. Some things are hard to walk back.', valence: 'bad'
                    });
                }
                addLog(state, `❌ Goal failed (${goal.type}): ${goal.target}`);
            });
            state.goalHistory = [...(state.goalHistory || []), ...state.seasonGoals];
            if (state.goalHistory.length > 30) state.goalHistory = state.goalHistory.slice(-30);
            state.seasonGoals = [];
        }

        // milestones
        const MILESTONE_DEFS = [
            // Early career
            { id: 'first_start', label: 'First Start', icon: '🏁', desc: 'You showed up. That\'s step one.', check: function (s) { return s.starts >= 1; } },
            { id: 'first_top5', label: 'First Top 5', icon: '🔝', desc: 'Ran with the fast ones.', check: function (s) { return s.top5s >= 1; } },
            { id: 'first_top10', label: 'First Top 10', icon: '📋', desc: 'Consistent. Respectable. Keep going.', check: function (s) { return (s.raceHistory || []).some(function(r) { return r.pos <= 10 && !r.dnf && !r.dq; }); } },
            { id: 'first_win', label: 'First Win', icon: '🏆', desc: 'The one that changes everything.', check: function (s) { return s.wins >= 1; } },
            { id: 'first_rival', label: 'First Rival', icon: '😤', desc: 'Someone in this paddock doesn\'t like you. Good.', check: function (s) { return (s.rivals || []).some(function (r) { return relationship(r) === 'rival'; }); } },
            { id: 'first_sponsor', label: 'First Sponsor', icon: '💰', desc: 'Someone believed in you enough to write a check.', check: function (s) { return (s.sponsors || []).length >= 1; } },
            // Wins milestones
            { id: 'five_wins', label: '5 Wins', icon: '⭐', desc: 'Starting to make a habit of it.', check: function (s) { return s.wins >= 5; } },
            { id: 'ten_wins', label: '10 Wins', icon: '💛', desc: 'Double digits.', check: function (s) { return s.wins >= 10; } },
            { id: 'twenty_wins', label: '20 Wins', icon: '🔥', desc: 'Twenty wins. You\'re not a prospect anymore.', check: function (s) { return s.wins >= 20; } },
            { id: 'fifty_wins', label: '50 Wins', icon: '👑', desc: 'Half a hundred. All-time territory.', check: function (s) { return s.wins >= 50; } },
            // Starts milestones
            { id: 'iron_man', label: 'Iron Man', icon: '🔩', desc: '50 career starts.', check: function (s) { return s.starts >= 50; } },
            { id: 'century', label: 'Century', icon: '💯', desc: '100 career starts. This is your life now.', check: function (s) { return s.starts >= 100; } },
            { id: 'veteran', label: 'Veteran', icon: '🎖️', desc: '250 career starts. You\'ve seen everything.', check: function (s) { return s.starts >= 250; } },
            // Championships
            { id: 'champion', label: 'Champion', icon: '👑', desc: 'Won a series championship.', check: function (s) { return (s.seasonHistory || []).some(function (h) { return h.championships && h.championships.some(function (c) { return c.pos === 1; }); }); } },
            { id: 'multi_champ', label: 'Multi-Champion', icon: '👑', desc: 'Multiple series championships. Different levels, same result.', check: function (s) { return (s.seasonHistory || []).reduce(function (a, h) { return a + (h.championships || []).filter(function (c) { return c.pos === 1; }).length; }, 0) >= 2; } },
            { id: 'clean_season', label: 'Clean Season', icon: '✨', desc: 'A full season without a DNF.', check: function (s) { return (s.seasonHistory || []).some(function (h) { return h.dnfs === 0 && h.races >= 8; }); } },
            // Series progression
            { id: 'first_national', label: 'Gone National', icon: '📺', desc: 'First race in a nationally televised series.', check: function (s) { return (s.raceHistory || []).some(function (r) { return getSeries(r.seriesId) && getSeries(r.seriesId).tier >= 4; }); } },
            { id: 'cup_start', label: 'Cup Series Start', icon: '🎖️', desc: 'Made it to the pinnacle.', check: function (s) { return (s.raceHistory || []).some(function (r) { return r.seriesId === 'nascar_cup'; }); } },
            { id: 'ladder_climber', label: 'Ladder Climber', icon: '📈', desc: 'Raced in 4 different series.', check: function (s) { return new Set((s.raceHistory || []).map(function (r) { return r.seriesId; })).size >= 4; } },
            // Fans
            { id: 'fan_base', label: 'Fan Base', icon: '📣', desc: '10,000 fans.', check: function (s) { return s.fans >= 10000; } },
            { id: 'following', label: 'Following', icon: '📱', desc: '50,000 fans.', check: function (s) { return s.fans >= 50000; } },
            { id: 'household_name', label: 'Household Name', icon: '⭐', desc: '200,000 fans. They know your name at the grocery store.', check: function (s) { return s.fans >= 200000; } },
            // Rivalries
            { id: 'respected', label: 'Respected', icon: '🤝', desc: 'A rivalry that turned into something more.', check: function (s) { return (s.rivals || []).some(function (r) { return relationship(r) === 'frenemy'; }); } },
            { id: 'crew', label: 'Crew', icon: '👥', desc: 'Made a real friend in this paddock.', check: function (s) { return (s.rivals || []).some(function (r) { return relationship(r) === 'friend'; }); } },
            { id: 'nemesis', label: 'Nemesis', icon: '💢', desc: '5 or more incidents with the same driver.', check: function (s) { return (s.rivals || []).some(function (r) { return (r.incidents || 0) >= 5; }); } },
            // Money
            { id: 'first_100k', label: 'First $100K', icon: '💵', desc: 'Six figures. The sport is starting to pay.', check: function (s) { return s.totalPrizeMoney >= 100000; } },
            { id: 'millionaire', label: 'Millionaire', icon: '💰', desc: '$1,000,000 in career prize money.', check: function (s) { return s.totalPrizeMoney >= 1000000; } },
            // Injuries
            { id: 'walked_away', label: 'Walked Away', icon: '🏥', desc: 'Came back from an injury. Stronger for it.', check: function (s) { return (s.seasonHistory || []).some(function (h) { return h.hadInjury; }); } },
            // Longevity
            { id: 'five_seasons', label: 'Five Seasons', icon: '📅', desc: 'Five full seasons. This is a career.', check: function (s) { return s.season >= 6; } },
            { id: 'decade', label: 'A Decade', icon: '🗓️', desc: 'Ten seasons. Legendary.', check: function (s) { return s.season >= 11; } },
        ];

        // track tendencies
        function getTrackTendencies(state) {
            // Returns { best, worst } — tracks with 3+ visits and a clear pattern
            const byTrack = {};
            (state.raceHistory || []).forEach(r => {
                if (!r.track || r.dq) return;
                if (!byTrack[r.track]) byTrack[r.track] = [];
                byTrack[r.track].push(r);
            });

            const MIN_VISITS = 3;
            const scored = [];

            Object.entries(byTrack).forEach(([track, races]) => {
                if (races.length < MIN_VISITS) return;
                const valid = races.filter(r => !r.dnf);
                if (valid.length < MIN_VISITS) return;
                // Score: avg finish relative to field size (lower = better)
                // Top 4 = strong, win = very strong, DNF = weak
                const dnfRate = races.filter(r => r.dnf).length / races.length;
                const avgPct = valid.reduce((a, r) => a + (r.pos / (r.fs || 20)), 0) / valid.length;
                const winRate = valid.filter(r => r.pos === 1).length / valid.length;
                const top4Rate = valid.filter(r => r.pos <= 4).length / valid.length;
                // Composite score: 0 = dominated, 1 = struggled
                const score = avgPct * 0.5 + (1 - top4Rate) * 0.3 + dnfRate * 0.2;
                scored.push({ track, races, score, winRate, top4Rate, dnfRate, avgPct, count: races.length });
            });

            if (!scored.length) return { best: null, worst: null };

            scored.sort((a, b) => a.score - b.score);
            const best = scored[0].score < 0.45 ? scored[0] : null;
            const worst = scored[scored.length - 1].score > 0.65 ? scored[scored.length - 1] : null;

            return { best, worst };
        }

        function checkTrackFavoritePerformance(state, track, result) {
            const { best, worst } = getTrackTendencies(state);
            if (result.dq) return;

            // best track check
            if (best && best.track === track && !result.dnf) {
                const isStrongResult = result.position <= 4;
                const isWeakResult = result.position > Math.ceil((result.fieldSize || 20) * 0.55);

                if (isWeakResult && best.top4Rate >= 0.6) {
                    state.dramaQueue.push({
                        id: 'fav_track_fail_' + uid(),
                        title: '📉 Off Day at a Home Track',
                        effect: 'rep_hit', value: -3, fans: -200,
                        desc: `P${result.position} at ${track}. Usually dangerous here. The paddock noticed the off day.`,
                        valence: 'bad',
                    });
                } else if (isStrongResult && best.top4Rate >= 0.6 && Math.random() < 0.4) {
                    state.dramaQueue.push({
                        id: 'fav_track_good_' + uid(),
                        title: '🏠 Home Track Delivers Again',
                        effect: 'rep_fans', value: 2, fans: 150,
                        desc: `P${result.position} at ${track}. Something extra always shows up here. Fans love the consistency.`,
                        valence: 'good',
                    });
                }
            }

            // worst track check — reverse mechanic
            if (worst && worst.track === track) {
                const isStrongResult = result.position <= 4 && !result.dnf;
                const isWeakResult = result.dnf || result.position > Math.ceil((result.fieldSize || 20) * 0.6);

                if (isStrongResult && worst.dnfRate >= 0.3 || isStrongResult && worst.top4Rate <= 0.25) {
                    // Conquered their bogey track — public positive drama
                    state.dramaQueue.push({
                        id: 'bogey_track_good_' + uid(),
                        title: '💪 Conquered the Bogey Track',
                        effect: 'rep_fans', value: 5, fans: 350,
                        desc: `P${result.position} at ${track}. That place has been a nightmare. Not today. People are talking about it.`,
                        valence: 'good',
                    });
                } else if (isWeakResult && worst.score > 0.65 && Math.random() < 0.5) {
                    // Struggled again at their worst track — public negative drama
                    state.dramaQueue.push({
                        id: 'bogey_track_fail_' + uid(),
                        title: '😬 That Track Again',
                        effect: 'rep_hit', value: -2, fans: -150,
                        desc: `${result.dnf ? 'DNF' : 'P' + result.position} at ${track}. The pattern continues. Some tracks just have your number.`,
                        valence: 'bad',
                    });
                }
            }
        }

        function checkMilestones(state) {
            if (!state.milestones) state.milestones = [];
            MILESTONE_DEFS.forEach(def => {
                if (state.milestones.find(m => m.id === def.id)) return;
                try {
                    if (def.check(state)) {
                        state.milestones.push({ id: def.id, season: state.season, week: state.week });
                        state.dramaQueue.push({
                            id: 'ms_' + def.id, title: `🏅 ${def.label}`, effect: 'none',
                            desc: `Milestone unlocked: ${def.label}. ${def.desc}`, valence: 'good'
                        });
                        addLog(state, `🏅 Milestone: ${def.label}`);
                    }
                } catch (e) { }
            });
        }

        // free agency
        function generateFreeAgencyOffers(state) {
            var fresh = generateOffers(state.reputation, state.fans)
                .map(function (o) { return Object.assign({}, o, { expiresIn: 3, freeAgency: true }); });
            var saved = (state.savedForOffseason || []).map(function (o) {
                return Object.assign({}, o, { expiresIn: 3, freeAgency: true, _savedOffer: true });
            });
            state.savedForOffseason = [];
            return fresh.concat(saved);
        }

        function tickFreeAgencyOffers(state) {
            if (!state.offseasonOffers) return;
            state.offseasonOffers = state.offseasonOffers
                .map(o => ({ ...o, expiresIn: (o.expiresIn || 3) - 1 }))
                .filter(o => o.expiresIn > 0);
            if (!state.offseasonOffers.length) {
                // All expired — fall back to normal offers
                state.pendingOffers = generateOffers(state.reputation, state.fans);
                state.offseasonPhase = false;
                addLog(state, '⏰ Free agency window closed. Standard offers now available.');
            }
        }

        // season advance
        function advanceSeason(state) {
            // Resolve any outstanding season goals before advancing
            resolveSeasonGoals(state);

            // championship celebration
            var _champCelebrations = [];
            Object.entries(state.championshipPoints || {}).forEach(function(entry) {
                var sid = entry[0], myPts = entry[1];
                if (!myPts || myPts <= 0) return;
                var s = getSeries(sid);
                if (!s) return;
                var field = state.seriesFields[sid] || {};
                var allPts = [myPts].concat(Object.values(field).map(function(d) { return d.points || 0; })).sort(function(a,b) { return b-a; });
                if (allPts[0] !== myPts) return; // not champion
                var sWins  = (state.raceHistory || []).filter(function(r) { return r.season === state.season && r.seriesId === sid && r.pos === 1 && !r.dnf && !r.dq; }).length;
                var sTop5s = (state.raceHistory || []).filter(function(r) { return r.season === state.season && r.seriesId === sid && !r.dnf && !r.dq && r.pos <= 5; }).length;
                var sStarts = (state.raceHistory || []).filter(function(r) { return r.season === state.season && r.seriesId === sid; }).length;
                var topRival = (state.rivals || []).slice().sort(function(a,b) { return ((b.incidents||0)+(b.battles||0)) - ((a.incidents||0)+(a.battles||0)); })[0];
                _champCelebrations.push({ s: s, pts: myPts, wins: sWins, top5s: sTop5s, starts: sStarts, rival: topRival });
            });
            if (_champCelebrations.length) {
                setTimeout(function() {
                    _champCelebrations.forEach(function(cw) {
                        var name = state.driverAlias || state.driverName;
                        var heroLine = cw.wins > 0
                            ? name + ' won the ' + cw.s.name + ' championship with ' + cw.wins + ' win' + (cw.wins !== 1 ? 's' : '') + ' and ' + cw.pts + ' points across ' + cw.starts + ' starts.'
                            : name + ' claimed the ' + cw.s.name + ' championship on consistency — ' + cw.top5s + ' top-5s in ' + cw.starts + ' starts, ' + cw.pts + ' points.';
                        var body = h('div', null,
                            h('div', { style: { fontSize: '72px', textAlign: 'center', marginBottom: '8px' } }, '🏆'),
                            h('div', { style: { fontSize: '11px', fontWeight: 700, color: cw.s.color, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '6px' } }, 'Season ' + state.season + ' Champion'),
                            h('div', { style: { fontSize: '24px', fontWeight: 900, color: '#F9FAFB', textAlign: 'center', marginBottom: '16px', lineHeight: 1.2 } }, cw.s.name),
                            h('div', { style: { fontSize: '14px', color: '#CBD5E1', lineHeight: 1.8, marginBottom: '20px', borderLeft: '3px solid ' + cw.s.color, paddingLeft: '14px' } }, heroLine),
                            h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px', marginBottom: '20px' } },
                                ...[
                                    { label: 'Starts', value: cw.starts, color: '#64748B' },
                                    { label: 'Wins',   value: cw.wins,   color: '#F59E0B' },
                                    { label: 'Top 5s', value: cw.top5s,  color: '#10B981' },
                                    { label: 'Points', value: cw.pts,    color: cw.s.color },
                                ].map(function(stat) {
                                    return h('div', { style: { background: '#060A10', borderRadius: '8px', padding: '10px', textAlign: 'center', border: '1px solid ' + stat.color + '33' } },
                                        h('div', { style: { fontSize: '24px', fontWeight: 900, color: stat.color } }, stat.value),
                                        h('div', { style: { fontSize: '10px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '2px' } }, stat.label)
                                    );
                                })
                            ),
                            cw.rival ? h('div', { style: { fontSize: '12px', color: '#475569', borderTop: '1px solid #1E2433', paddingTop: '14px', fontStyle: 'italic' } },
                                'Toughest battle this season: ' + cw.rival.name + ' — ' + ((cw.rival.incidents || 0) + (cw.rival.battles || 0)) + ' incidents between you.'
                            ) : null,
                            h('div', { className: 'modal-actions', style: { marginTop: '20px' } },
                                mkBtn('🏁 Close Season', 'btn btn-primary', function() { closeModal(); render(); })
                            )
                        );
                        openModal(body);
                    });
                }, 300);
            }

            // Archive this season's summary into seasonHistory
            const seasonRaces = state.raceHistory.filter(r => r.season === state.season);
            const seasonWins = seasonRaces.filter(r => !r.dnf && !r.dq && r.pos === 1).length;
            const seasonTop5s = seasonRaces.filter(r => !r.dnf && !r.dq && r.pos <= 5).length;
            const seasonDNFs = seasonRaces.filter(r => r.dnf).length;
            const seasonPrize = seasonRaces.reduce((a, r) => a + (r.prize || 0), 0);
            const champs = Object.entries(state.championshipPoints || {}).map(([sid, pts]) => {
                    const s = getSeries(sid);
                    const field = state.seriesFields[sid] || {};
                    const rows = [{ points: pts, isPlayer: true }, ...Object.entries(field).map(([n, d]) => ({ points: d.points || 0 }))].sort((a, b) => b.points - a.points);
                    const pos = rows.findIndex(r => r.isPlayer) + 1;
                    const seriesWins = seasonRaces.filter(r => r.seriesId === sid && !r.dnf && !r.dq && r.pos === 1).length;
                    return { seriesId: sid, seriesShort: (s && s.short) || sid, pos, pts: pts || 0, wins: seriesWins };
                });
            if (!(state.seasonHistory)) state.seasonHistory = [];
            state.seasonHistory.push({
                season: state.season,
                races: seasonRaces.length, wins: seasonWins, top5s: seasonTop5s, dnfs: seasonDNFs,
                prize: seasonPrize, rep: state.reputation, fans: state.fans, money: state.money,
                championships: champs,
                confidence: state.confidence || 0,
                hadInjury: !!(state.playerInjury === null && state._hadInjuryThisSeason),
            });
            if (state.seasonHistory.length > 20) state.seasonHistory = state.seasonHistory.slice(-20);
            state._hadInjuryThisSeason = false;
            // Merch revenue
            const merch = calcMerchRevenue(state.fans);
            state.money += merch;
            state.totalMerchRevenue = (state.totalMerchRevenue || 0) + merch;
            if (merch > 0) addLog(state, `🛍️ Season merch revenue: ${fmtMoney(merch)} (${fmtFans(state.fans)} fans)`);

            // Tick sponsor seasons
            state.sponsors = state.sponsors.map(sp => ({ ...sp, seasonsLeft: sp.seasonsLeft - 1 })).filter(sp => {
                if (sp.seasonsLeft <= 0) { addLog(state, `📋 ${sp.brand} sponsorship ended.`); return false; }
                return true;
            });

            // Tick team sponsor seasons and enforce performance clauses
            if (state.ownedTeam && state.ownedTeam.sponsors) {
                // Evaluate clauses before ticking
                var teamWins = (state.ownedTeam.drivers || []).reduce(function(a, d) { return a + (d.wins || 0); }, 0);
                var teamTop5s = (state.ownedTeam.drivers || []).reduce(function(a, d) { return a + (d.top5s || 0); }, 0);
                var teamTop10s = (state.ownedTeam.drivers || []).reduce(function(a, d) { return a + (d.top10s || 0); }, 0);
                var teamStarts = (state.ownedTeam.drivers || []).reduce(function(a, d) { return a + (d.starts || 0); }, 0);

                state.ownedTeam.sponsors.forEach(function(sp) {
                    if (!sp.clause) return;
                    var achieved = false;
                    switch (sp.clause.type) {
                        case 'win':    achieved = teamWins >= sp.clause.req; break;
                        case 'top5':   achieved = teamTop5s >= sp.clause.req; break;
                        case 'top10':  achieved = teamTop10s >= sp.clause.req; break;
                        case 'starts': achieved = teamStarts >= sp.clause.req; break;
                        case 'champ_pos':
                        case 'champ_pos_pct': {
                            // Calculate team championship position in their series
                            var teamSeriesDrivers = (state.drivers || []).filter(function(d) {
                                return d.active && d.currentSeriesId === state.ownedTeam.seriesId;
                            });
                            var teamTotalPoints = (state.ownedTeam.drivers || []).reduce(function(a, d) { return a + (d.points || 0); }, 0);
                            var teamsAhead = teamSeriesDrivers.filter(function(d) {
                                return (d.seasonPoints || 0) > teamTotalPoints;
                            }).length;
                            var champPos = teamsAhead + 1;
                            var fieldSize2 = teamSeriesDrivers.length + 1;
                            if (sp.clause.type === 'champ_pos') {
                                achieved = champPos <= sp.clause.req;
                            } else {
                                achieved = (champPos / fieldSize2) <= sp.clause.req;
                            }
                            addLog(state, '📊 ' + state.ownedTeam.name + ' championship position: P' + champPos + ' of ' + fieldSize2);
                            break;
                        }
                    }
                    if (achieved) {
                        addLog(state, '✅ ' + sp.brand + ' clause met (' + sp.clause.label + ') — ' + state.ownedTeam.name + ' keeps full value.');
                        sp.happiness = Math.min(100, (sp.happiness || 80) + 15);
                    } else {
                        var pen = sp.clause.penalty || 0;
                        if (pen > 0) {
                            state.money = Math.max(0, state.money - pen);
                            state.ownedTeam.totalSpent = (state.ownedTeam.totalSpent || 0) + pen;
                        }
                        sp.happiness = Math.max(0, (sp.happiness || 80) - sp.clause.penaltyHappy);
                        addLog(state, '❌ ' + sp.brand + ' clause missed (' + sp.clause.label + ')' + (pen > 0 ? ' — penalty: -' + fmtMoney(pen) : '') + ' · happiness -' + sp.clause.penaltyHappy + '%');
                        state.dramaQueue.push({
                            id: 'team_clause_fail_' + uid(),
                            title: '📋 ' + sp.brand + ' Clause Not Met',
                            desc: state.ownedTeam.name + ' failed the ' + sp.brand + ' performance clause (' + sp.clause.label + ').' + (pen > 0 ? ' Penalty: -' + fmtMoney(pen) + '.' : '') + ' Sponsor happiness dropped to ' + sp.happiness + '%. At 0% they won\'t renew.',
                            valence: 'bad', effect: 'info',
                        });
                    }
                });

                // Tick seasons, pay out value, drop expired
                state.ownedTeam.sponsors = state.ownedTeam.sponsors.map(function(sp) {
                    return Object.assign({}, sp, { seasonsLeft: sp.seasonsLeft - 1 });
                }).filter(function(sp) {
                    if (sp.seasonsLeft <= 0) {
                        // Pay out final season value
                        state.money += sp.valuePerSeason;
                        state.ownedTeam.totalRevenue = (state.ownedTeam.totalRevenue || 0) + sp.valuePerSeason;
                        addLog(state, '📋 ' + sp.brand + ' team sponsorship ended — final payment: +' + fmtMoney(sp.valuePerSeason));
                        if ((sp.happiness || 80) >= 60) {
                            // Happy sponsor — push a renewal offer
                            if (!state.ownedTeam.sponsorOffers) state.ownedTeam.sponsorOffers = [];
                            state.ownedTeam.sponsorOffers.push({
                                id: uid(), brand: sp.brand,
                                valuePerSeason: Math.floor(sp.valuePerSeason * (1 + Math.random() * 0.15)),
                                seasonsLeft: rand(1, 3),
                                winBonus: sp.winBonus,
                                clause: sp.clause,
                                _theirFloor: Math.floor(sp.valuePerSeason * 0.8),
                                _renewal: true,
                            });
                            addLog(state, '🔄 ' + sp.brand + ' is open to renewing with ' + state.ownedTeam.name + '.');
                        }
                        return false;
                    }
                    // Mid-contract — pay season value
                    state.money += sp.valuePerSeason;
                    state.ownedTeam.totalRevenue = (state.ownedTeam.totalRevenue || 0) + sp.valuePerSeason;
                    return true;
                });

                // Clear blacklist from prior season
                if (state.ownedTeam._blacklistedBrands) {
                    Object.keys(state.ownedTeam._blacklistedBrands).forEach(function(brand) {
                        if (state.ownedTeam._blacklistedBrands[brand] < state.season) {
                            delete state.ownedTeam._blacklistedBrands[brand];
                        }
                    });
                }
            }

            // Tick multi-season contracts
            state.contracts.forEach(c => { c.seasonsCompleted++; c.racesCompleted = 0; c.earnings = 0; c.missedFinishWarnings = 0; });
            state.contracts = state.contracts.filter(c => {
                if (c.seasonsCompleted >= c.termSeasons) { addLog(state, `📋 ${getSeries(c.seriesId).short} contract with ${c.team} expired.`); return false; }
                return true;
            });

            // Simulate AI careers
            const aiNews = simulateAISeasons(state);
            state._lastSeasonAiNews = aiNews || { promotions: [], demotions: [] };
            // Car number conflict resolution for national series
            // Only notify player if the conflict is in a series they race in
            const playerSeriesIds = new Set((state.contracts || []).map(function (c) { return c.seriesId; }));
            SERIES.filter(function (s) { return s.tier >= 4; }).forEach(function (s) {
                const conflicts = resolveCarNumberConflicts.call(null, s.id);
                conflicts.forEach(function (c) {
                    addLog(state, '🔢 Car number conflict: ' + c.driver + ' lost #' + c.hadNumber + ' to ' + c.keeperName + ' — assign new number');
                    if (!playerSeriesIds.has(s.id)) return; // silent for series player isn't in
                    state.dramaQueue.push({
                        id: 'carnumber_' + uid(),
                        title: '🔢 Car Number Conflict — ' + c.driver,
                        effect: 'none',
                        desc: c.driver + ' lost car number #' + c.hadNumber + ' to ' + c.keeperName + ' (more senior). Assign ' + c.driver + ' a new number in iRacing before next season.',
                        valence: 'neutral',
                        _requiresAction: true,
                        _actionLabel: 'Number Assigned',
                        _isPaddock: true,
                    });
                });
            });

                        state.season++;
            state.week = 1;
            // Trim old data at season end to keep save size manageable
            if (state.raceHistory) {
                state.raceHistory.forEach(function(rh) {
                    if (rh.season < state.season - 1) {
                        delete rh.finishOrder;
                        delete rh.summary;
                    }
                });
            }
            if (state.storyJournal && state.storyJournal.length > 150) {
                state.storyJournal = state.storyJournal.slice(-150);
            }
            // Regenerate schedules — sort by tier so higher tiers pick premiers first
            var sortedContracts = (state.contracts || []).slice().sort(function(a, b) {
                var ta = (getSeries(a.seriesId) && getSeries(a.seriesId).tier) || 1;
                var tb = (getSeries(b.seriesId) && getSeries(b.seriesId).tier) || 1;
                return tb - ta;
            });
            var _usedPremierTracks = [];
            sortedContracts.forEach(function(c) {
                if (!state.trackPools) state.trackPools = {};
                state.trackPools._excludePremierTracks = _usedPremierTracks.slice();
                state.schedules[c.seriesId] = generateSchedule(c.seriesId, null);
                // Record what premier was chosen
                var chosen = (state.schedules[c.seriesId] || []).find(function(r) { return r.isPremier; });
                if (chosen) _usedPremierTracks.push(chosen.track);
            });
            delete state.trackPools._excludePremierTracks;
            alignPremierEventsAcrossSeries(state);
            state.seriesFields = {};
            state.sponsorOffers = [];
            state.offTrackDone = [];
            state.lastSocialPost = {};
            state._elimNotified = null;
            state.teammates = state.teammates.filter(t => state.contracts.find(c => c.seriesId === t.seriesId));
             state.playerInjury = null;
            
            // Car condition: partial offseason restoration per series
            if (!state.carCondition) state.carCondition = {};
            Object.keys(state.carCondition).forEach(function (sid) {
                var cc = state.carCondition[sid];
                if (cc && typeof cc === 'object' && cc.engine !== undefined) {
                    Object.keys(cc).forEach(function (k) { cc[k] = Math.min(100, (cc[k] || 0) + 35); });
                }
            });


            // Free agency replaces normal offers — 3-click expiry window
            state.offseasonOffers = generateFreeAgencyOffers(state);
            state.offseasonPhase = true;
            state.pendingOffers = [];

            // Check milestones at season boundary
            checkMilestones(state);

            addLog(state, `--- Season ${state.season} begins. Free agency open — offers expire in 3 interactions. ---`);
        }

        // conditions
        // generateSchedule already exists — patch it to add condition field
        var alignPremierEventsAcrossSeries = function(state) {
            // Collect all premier events across all schedules: { track, week, seriesId, tier }
            var premiers = [];
            (state.contracts || []).forEach(function(c) {
                var sched = state.schedules[c.seriesId] || [];
                var s = getSeries(c.seriesId);
                sched.forEach(function(race) {
                    if (race.isPremier) {
                        premiers.push({ track: race.track, week: race.week || race.round, seriesId: c.seriesId, tier: s ? s.tier : 1, race: race });
                    }
                });
            });

            // For each premier, check other series and align them
            premiers.forEach(function(p) {
                (state.contracts || []).forEach(function(c) {
                    if (c.seriesId === p.seriesId) return;
                    var sched = state.schedules[c.seriesId] || [];
                    var s = getSeries(c.seriesId);
                    var tier = s ? s.tier : 1;

                    // Check if this series already has a race at this track this week
                    var alreadyHasIt = sched.some(function(r) {
                        return r.track === p.track && (r.week || r.round) === p.week;
                    });
                    if (alreadyHasIt) return;

                    // Find the race at this week in the other series and replace with support race
                    var targetRaceIdx = sched.findIndex(function(r) {
                        return (r.week || r.round) === p.week && !r.result;
                    });
                    if (targetRaceIdx < 0) return;

                    var trackDef = (SERIES_TRACKS.local || []).concat(SERIES_TRACKS.regional || []).find(function(t) { return t.name === p.track; });
                    if (!trackDef) return;

                    var existingRace = sched[targetRaceIdx];
                    var supportLaps = tier === 1 ? 30 : tier === 2 ? 40 : 75;
                    var _supportName = tier === 1
                        ? (trackDef.premierNameT1 || trackDef.premierName || null)
                        : tier === 2
                        ? (trackDef.premierName ? trackDef.premierName.replace(/\d+/, function(n) { return Math.min(parseInt(n), 75); }) : null)
                        : null;
                    sched[targetRaceIdx] = Object.assign({}, existingRace, {
                        track: p.track,
                        city: trackDef.city || existingRace.city,
                        state: trackDef.state || existingRace.state,
                        night: !!trackDef.night,
                        isPremier: false,
                        isSupportRace: true,
                        premierName: _supportName,
                        premierLaps: null,
                        raceLaps: supportLaps,
                        week: p.week,
                    });
                });
            });
        }
        const _origGenerateSchedule = generateSchedule;
        generateSchedule = function (seriesId, trackPools) {
            const races = _origGenerateSchedule(seriesId, trackPools);
            races.forEach(r => { r.condition = rollCondition(); });
            return races;
        };

        // calendar event processing
        function processCalendarEvent(state, evt) {
            if (evt.effect === 'money' && evt.value) { state.money += evt.value; state.totalPrizeMoney += Math.max(0, evt.value); }
            if (evt.effect === 'fans' && evt.value) state.fans = Math.max(0, state.fans + evt.value);
            if (evt.effect === 'rep' && evt.value) state.reputation = Math.max(0, state.reputation + evt.value);
            if (evt.effect === 'rep_fans') {
                if (evt.repValue) state.reputation = Math.max(0, state.reputation + evt.repValue);
                if (evt.fanValue) state.fans = Math.max(0, state.fans + evt.fanValue);
            }
            state.log.push(`[S${state.season} W${state.week}] 📅 ${evt.title}: ${evt.desc}`);
        }

        // repair cost calculation
        function calcRepairCost(itemId, seriesId) {
            const item = REPAIR_ITEMS.find(r => r.id === itemId);
            if (!item) return 0;
            const s = getSeries(seriesId);
            const tier = s ? s.tier : 1;
            const mult = REPAIR_TIER_MULT[tier] || 1.0;
            // Condition modifier baked in at call site
            return Math.round(item.baseCost * mult);
        }

        // season end summary
        function buildSeasonSummary(state) {
            // Championship positions per series
            const championships = [];
            Object.entries(state.championshipPoints || {}).forEach(([sid, myPts]) => {
                const s = getSeries(sid); if (!s) return;
                const field = state.seriesFields[sid] || {};
                const rows = [
                    { name: state.driverName, points: myPts, isPlayer: true },
                    ...Object.entries(field).map(([n, d]) => ({ name: n, points: d.points, isPlayer: false })),
                ].sort((a, b) => b.points - a.points);
                const pos = rows.findIndex(r => r.isPlayer) + 1;
                const trophy = TROPHY_TIERS.find(t => pos <= t.minPos) || TROPHY_TIERS[TROPHY_TIERS.length - 1];
                championships.push({ seriesId: sid, seriesName: s.name, seriesColor: s.color, position: pos, points: myPts, fieldSize: rows.length, trophy });
            });

            let totalRaces = 0, wins = 0, top5s = 0, totalPrize = 0;
            state.raceHistory.filter(r => r.season === state.season).forEach(r => {
                totalRaces++;
                if (!r.dnf && !r.dq && r.pos === 1) wins++;
                if (!r.dnf && !r.dq && r.pos <= 5) top5s++;
                totalPrize += r.prize || 0;
            });

            return {
                championships, totalRaces, wins, top5s, totalPrize, season: state.season,
                rep: state.reputation, fans: state.fans, money: state.money,
                hadInjury: !!(state._hadInjuryThisSeason)
            };
        }