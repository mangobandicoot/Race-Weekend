// initial state
        function initState(name) {
            // auto-generate mini stock open entry, no contract at t1
            const _miniContract = makeContract('mini_stock', 'poor');
            _miniContract.indie = true;
            _miniContract.team = 'Independent';
            _miniContract.teammates = [];
            _miniContract.salary = 0;
            _miniContract.prizeShare = 1.0;   // keep everything
            _miniContract.winBonus = 0;
            _miniContract.entryFee = 120;     // pay at the gate each race
            _miniContract.teamStyle = 'open_entry';
            _miniContract.termSeasons = 1;
            _miniContract.noContractRequired = true;  // no signing needed

            return {
                driverName: name,
                homeState: 'ME',
                season: 1, week: 1,
                money: 5000, reputation: 0, fans: 0,
                wins: 0, top5s: 0, starts: 0, poles: 0,
                totalPrizeMoney: 0, totalMerchRevenue: 0,
                contracts: [_miniContract],
                pendingOffers: [],
                schedules: {},
                championshipPoints: {},
                seriesFields: {},
                sponsors: [],
                sponsorOffers: [],
                rivals: [],
                teammates: [],
                offTrackDone: [],
                dramaQueue: [],
                seasonGoals: [],
                goalHistory: [],
                seasonHistory: [],
                confidence: 0,
                spotter: null,
                milestones: [],
                playerInjury: null,  // racesOut, subName, seriesId
                offseasonOffers: [],
                offseasonPhase: false,
                carCondition: {},

                ownedCars: {},
                driverAlias: '',
                ownedCars: {},
                appCarsOwned: { mini_stock: true }, // everyone starts with mini stock
                driverAlias: '',
                specialResults: [],
                raceHistory: [],
                storyJournal: [],
                sideContracts: [],
                sideSchedules: {},
                sideFields: {},
                sidePoints: {},
                pitEntries: [],
                ownedTeam: null,
                reservedCarNumber: null,
                tutorialDone: false,
                trackPools: {
                    free: JSON.parse(JSON.stringify(FREE_TRACKS)),
                    paid: [],
                },
                drivers: (() => {
                    const pool = generateInitialDriverPool();
                    seedAIRivalries(pool);
                    return pool;
                })(),
                log: [`Season 1. $5,000, a dream, and no business being on a race track. Let's go.`],
                settings: { apiKey: '' },
            };
        }

        // team ownership factories
        function makeTeamCar(seriesId) {
            var costs = TEAM_CAR_COSTS[seriesId] || { new: 10000, used: 4000 };
            return {
                id: uid(),
                seriesId: seriesId,
                condition: 85,        // 0-100, degrades each race
                mileage: 0,
                purchasePrice: costs.used,
                purchasedUsed: true,
            };
        }

        function makeTeamDriver(seriesId, name, skill) {
            var s = getSeries(seriesId);
            var tier = s ? s.tier : 1;
            var sal = TEAM_SALARY_BY_TIER[tier] || { min: 0, max: 0 };
            return {
                id: uid(),
                name: name || 'Open Seat',
                seriesId: seriesId,
                skill: skill || rand(45, 75),
                salary: sal.min === 0 ? 0 : rand(sal.min, sal.max),
                contract: 1,          // seasons left
                morale: 70,           // 0-100
                carId: null,          // which car they drive
                starts: 0,
                wins: 0,
                top5s: 0,
                points: 0,
            };
        }

        function makeOwnedTeam(seriesId) {
            var s = getSeries(seriesId);
            var teamName = (TEAMS[seriesId] || ['Independent Racing'])[0];
            return {
                id: uid(),
                seriesId: seriesId,
                name: teamName,
                founded: G ? G.season : 1,
                cars: [],             // team cars
                drivers: [],          // hired drivers
                staff: [],            // staff roles
                facilities: [],       // facility upgrades
                budget: 0,            // weekly budget
                totalSpent: 0,
                totalRevenue: 0,
                wins: 0,
                tier: s ? s.tier : 1,
            };
        }

        // team sim engine
        function simulateTeamRace(state, seriesId) {
            // sim a race for each hired driver
            if (!state.ownedTeam || state.ownedTeam.seriesId !== seriesId) return;
            var team = state.ownedTeam;
            var s = getSeries(seriesId);
            if (!s) return;
            var fieldSize = (typeof SERIES_FIELD_SIZE !== 'undefined' && SERIES_FIELD_SIZE[seriesId]) || 20;
            team.drivers.forEach(function(td) {
                if (!td || !td.name || td.name === 'Open Seat') return;
                // skill * car condition
                var car = team.cars.find(function(c) { return c.id === td.carId; });
                var carFactor = car ? (car.condition / 100) : 0.75;
                var roll = td.skill * carFactor + rand(-18, 18);
                var pos = Math.max(1, Math.round(fieldSize * (1 - roll / 100)));
                pos = Math.min(pos, fieldSize);
                // DNF chance: poor condition = higher risk
                var dnfChance = car ? Math.max(0, (100 - car.condition) / 400) : 0.05;
                var dnf = Math.random() < dnfChance;
                if (dnf) pos = fieldSize;
                // Prize share — team keeps what driver doesn't
                var prize = s.prizes && s.prizes[pos - 1] ? s.prizes[pos - 1] : Math.max(0, Math.floor(s.pay * (1 - pos / fieldSize)));
                var teamPrize = Math.floor(prize * 0.5); // team keeps 50% of prize
                state.money += teamPrize;
                state.ownedTeam.totalRevenue = (state.ownedTeam.totalRevenue || 0) + teamPrize;
                // Car wear
                if (car) {
                    var wear = dnf ? rand(15, 30) : rand(3, 10);
                    car.condition = Math.max(10, car.condition - wear);
                    car.mileage = (car.mileage || 0) + (s.laps || 30);
                }
                // Driver stats
                td.starts = (td.starts || 0) + 1;
                td.points = (td.points || 0) + Math.max(1, 43 - pos);
                if (pos === 1) td.wins = (td.wins || 0) + 1;
                if (pos <= 5) td.top5s = (td.top5s || 0) + 1;
                if (pos <= 10) td.top10s = (td.top10s || 0) + 1;
                // Morale
                if (pos <= 5) td.morale = Math.min(100, (td.morale || 70) + 5);
                else if (pos > fieldSize * 0.75) td.morale = Math.max(10, (td.morale || 70) - 4);
                var result = dnf ? 'DNF' : 'P' + pos;
                addLog(state, '🏎️ ' + td.name + ' (' + team.name + '): ' + result + ' | +' + fmtMoney(teamPrize));
            });
        }

        function tickTeamWeeklyCosts(state) {
            if (!state.ownedTeam) return;
            var team = state.ownedTeam;
            var total = 0;
            // Driver salaries
            team.drivers.forEach(function(td) {
                if (td && td.salary > 0) total += td.salary;
            });
            // Staff costs
            team.staff.forEach(function(st) {
                if (st && st.weeklyCost) total += st.weeklyCost;
            });
            if (total > 0) {
                state.money -= total;
                state.ownedTeam.totalSpent = (state.ownedTeam.totalSpent || 0) + total;
                addLog(state, '🏚️ ' + team.name + ' weekly costs: -' + fmtMoney(total));
            }
        }

        function addLog(state, msg) {
            state.log.push(`[S${state.season} W${state.week}] ${msg}`);
            if (state.log.length > 200) state.log = state.log.slice(-200);
        }

        // driver database helpers
        function getDriversForSeries(state, seriesId) {
            return state.drivers.filter(d => d.currentSeriesId === seriesId && d.active);
        }

        function findOrCreateDriver(state, name) {
            const lower = name.toLowerCase().trim();
            let d = state.drivers.find(d => d.name.toLowerCase() === lower);
            if (!d) {
                d = createDriver(name, rand(30, 70), 'mini_stock', 'known');
                d.source = 'known';
                d.aiRivals = [];
                d.aiFriends = [];
                state.drivers.push(d);
                checkAndLinkFamily(state, d);
                // Seed pre-existing relationships with other known drivers in the same series
                // — the world didn't start when the player showed up
                const peers = state.drivers.filter(p =>
                    p !== d &&
                    p.currentSeriesId === d.currentSeriesId &&
                    (p.aiRivals || []).length + (p.aiFriends || []).length < 4
                );
                if (peers.length) {
                    const peer = peers[rand(0, peers.length - 1)];
                    if (Math.random() < 0.35) {
                        // Pre-existing rivalry
                        if (!d.aiRivals.includes(peer.name)) d.aiRivals.push(peer.name);
                        if (!(peer.aiRivals || []).includes(d.name)) { peer.aiRivals = peer.aiRivals || []; peer.aiRivals.push(d.name); }
                    } else if (Math.random() < 0.40) {
                        // Pre-existing friendship
                        if (!d.aiFriends.includes(peer.name)) d.aiFriends.push(peer.name);
                        if (!(peer.aiFriends || []).includes(d.name)) { peer.aiFriends = peer.aiFriends || []; peer.aiFriends.push(d.name); }
                    }
                }
                addLog(state, '📋 New driver added to database: ' + name);
                state.dramaQueue.push({
                    id: 'newdriver_' + uid(),
                    title: '📋 New Driver: ' + name,
                    effect: 'none',
                    desc: name + ' has been added to the driver database from your race results. Check their profile and set AI stats if needed.',
                    valence: 'neutral',
                    _isPaddock: true,
                });

            } else if (d.source === 'generated') {
                d.source = 'known';
                if (!d.aiRivals) d.aiRivals = [];
                if (!d.aiFriends) d.aiFriends = [];
            }
            return d;
        }

        function integrateFinishOrder(state, seriesId, finishOrder, isPremier) {
            // Get the regular series field — drivers already assigned to this series
            const regularDriverNames = new Set(
                (state.drivers || [])
                    .filter(function (d) { return d.active && d.currentSeriesId === seriesId && !d._guestEntry; })
                    .map(function (d) { return d.name.toLowerCase(); })
            );

            // Roster replacement detection:
            // If more than half the finish order are new/unknown names, treat them all
            // as the new season roster rather than one-off guests — score everyone
            var _newCount = 0, _regularCount = 0;
            finishOrder.forEach(function(entry) {
                if (!entry.name || entry.isPlayer) return;
                if (regularDriverNames.has(entry.name.toLowerCase())) _regularCount++;
                else _newCount++;
            });
            var _isRosterReplacement = _newCount > _regularCount && _newCount >= 4;
            if (_isRosterReplacement) {
                addLog(state, '📋 New roster detected: ' + _newCount + ' new drivers added as regulars for ' + seriesId + '.');
            }

            finishOrder.forEach(function (entry) {
                if (entry.isPlayer || !entry.name) return;

                const nameLower = entry.name.toLowerCase();
                const isRegular = regularDriverNames.has(nameLower) || _isRosterReplacement;
                const isGuest = !isRegular;

                if (isGuest) {
                    // Guest entry — create a temporary driver tagged as guest
                    // Don't add them permanently to the series field
                    const existing = (state.drivers || []).find(function (d) {
                        return d.name.toLowerCase() === nameLower;
                    });
                    if (!existing) {
                        const guestSkill = isPremier ? rand(55, 85) : rand(35, 65);
                        // Don't assign guest to the current series — find their likely home series
                        // by looking for an adjacent tier series, defaulting to tier-1
                        var _curS = getSeries(seriesId);
                        var _homeSeries = seriesId; // fallback
                        if (_curS) {
                            var _below = SERIES.find(function(ns) { return ns.tier === _curS.tier - 1 && !ns.isSideStep; });
                            var _above = SERIES.find(function(ns) { return ns.tier === _curS.tier + 1 && !ns.isSideStep; });
                            // Guests in higher series more likely came from below; guests in lower from above
                            _homeSeries = (_below ? _below.id : null) || (_above ? _above.id : null) || seriesId;
                        }
                        const guestDriver = createDriver(entry.name, guestSkill, _homeSeries, 'generated');
                        guestDriver._guestEntry = true;
                        guestDriver._guestSeason = state.season;
                        guestDriver.active = false;
                        state.drivers.push(guestDriver);
                    } else {
                        existing._guestEntry = true;
                        existing._guestSeason = state.season;
                    }
                    // Guest entries don't get starts counted toward their career
                    return;
                }

                // Regular driver — full processing
                const d = findOrCreateDriver(state, entry.name);
                if (!d.currentSeriesId || d.currentSeriesId !== seriesId) {
                    d.currentSeriesId = seriesId;
                }
                if (entry.carNumber && !d.carNumber) {
                    d.carNumber = entry.carNumber;
                    d._carNumberSeniority = d.starts || 0;
                }
                d.starts++;
            });

            // Auto-fill empty teammate slots from known drivers in this race
            const contract = (state.contracts || []).find(function (c) { return c.seriesId === seriesId; });
            if (contract && contract.teammates) {
                const emptySlots = contract.teammates.filter(function (t) { return !t || !t.name; }).length;
                if (emptySlots > 0) {
                    const alreadyTm = (state.teammates || []).map(function (t) { return t.name.toLowerCase(); });
                    const candidates = finishOrder
                        .filter(function (e) { return !e.isPlayer && e.name; })
                        .map(function (e) { return (state.drivers || []).find(function (d) { return d.name.toLowerCase() === e.name.toLowerCase(); }); })
                        .filter(function (d) { return d && d.source === 'known' && !d._guestEntry && !alreadyTm.includes(d.name.toLowerCase()); });
                    let filled = 0;
                    contract.teammates = contract.teammates.map(function (t) {
                        if ((!t || !t.name) && candidates[filled]) {
                            const d = candidates[filled++];
                            d.currentTeam = contract.team;
                            state.teammates.push({ name: d.name, seriesId });
                            addLog(state, `📋 ${contract.team} teammate slot filled: ${d.name}`);
                            state.dramaQueue.push({
                                id: 'tm_assigned_' + uid(),
                                title: `${contract.team} Teammate Confirmed`,
                                effect: 'none',
                                desc: `${d.name} will be your teammate at ${contract.team} this season. They're in the same car program. Worth keeping an eye on how they run.`,
                                valence: 'neutral',
                            });
                            return { name: d.name, seriesId };
                        }
                        return t;
                    });
                }
            }
        }