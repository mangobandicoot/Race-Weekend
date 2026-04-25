 // team ownership
        function renderTeam() {
            const f = document.createDocumentFragment();
            f.appendChild(h('div', { className: 'page-title' }, 'My Team'));
            f.appendChild(h('div', { className: 'page-sub' }, 'Own a team. Hire drivers, buy cars, upgrade facilities.'));

            // no team yet
            if (!G.ownedTeam) {
                var availableSeries = SERIES.filter(function(s) {
                    var costs = TEAM_CAR_COSTS[s.id];
                    return costs && G.reputation >= s.reqRep && G.fans >= s.reqFans;
                });
                const buyCard = h('div', { className: 'card' });
                buyCard.appendChild(cardTitle('Start a Team'));
                buyCard.appendChild(h('div', { style: { fontSize: '14px', color: '#94A3B8', marginBottom: '16px', lineHeight: '1.6' } },
                    'Own a team and run hired drivers in parallel with your career. Your team earns prize money every time you submit a result. Pick a series to get started.'
                ));
                if (!availableSeries.length) {
                    buyCard.appendChild(h('div', { style: { fontSize: '14px', color: '#F59E0B', padding: '12px', background: '#F59E0B14', borderRadius: '8px' } },
                        '⚠️ Build your reputation to unlock series and gain access to team ownership.'
                    ));
                } else {
                    availableSeries.forEach(function(s) {
                        var costs = TEAM_CAR_COSTS[s.id];
                        var canAfford = G.money >= costs.used;
                        var row = h('div', {
                            style: {
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '12px', marginBottom: '8px', borderRadius: '8px',
                                background: '#060A10', border: '1px solid ' + (canAfford ? '#1E2433' : '#1E2433'),
                                opacity: canAfford ? '1' : '0.55',
                            }
                        },
                            h('div', null,
                                h('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' } },
                                    h('div', { style: { width: '10px', height: '10px', borderRadius: '2px', background: s.color, flexShrink: 0 } }),
                                    h('div', { style: { fontWeight: 700, fontSize: '14px', color: '#F9FAFB' } }, s.name),
                                    h('div', { style: { fontSize: '12px', color: '#64748B', background: '#0D1117', borderRadius: '4px', padding: '1px 6px' } }, 'T' + s.tier),
                                ),
                                h('div', { style: { fontSize: '13px', color: '#64748B', marginLeft: '18px' } },
                                    'Used: ' + fmtMoney(costs.used) + '  ·  New: ' + fmtMoney(costs.new)
                                )
                            ),
                            canAfford
                                ? mkBtn('Found Team →', 'btn btn-sm btn-secondary', function() {
                                    openFoundTeamModal(s);
                                })
                                : h('span', { style: { fontSize: '13px', color: '#EF4444' } }, 'Need ' + fmtMoney(costs.used - G.money) + ' more')
                        );
                        buyCard.appendChild(row);
                    });
                }
                f.appendChild(buyCard);
                return f;
            }

            // team exists
            var team = G.ownedTeam;
            var s = getSeries(team.seriesId);

            // overview
            var ov = h('div', { className: 'card', style: { marginBottom: '16px' } });
            ov.appendChild(cardTitle(team.name));
            ov.appendChild(h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginBottom: '12px' } },
                miniStatBox('Balance', fmtMoney(G.money), '#10B981'),
                miniStatBox('Spent', fmtMoney(team.totalSpent || 0), '#EF4444'),
                miniStatBox('Revenue', fmtMoney(team.totalRevenue || 0), '#F59E0B')
            ));
            var weeklyBurn = (team.drivers || []).reduce(function(a, d) { return a + (d && d.salary ? d.salary : 0); }, 0)
                + (team.staff || []).reduce(function(a, st) { return a + (st && st.weeklyCost ? st.weeklyCost : 0); }, 0);
            ov.appendChild(h('div', { style: { fontSize: '13px', color: '#94A3B8', marginBottom: '8px' } },
                '📉 Weekly burn: ' + fmtMoney(weeklyBurn) + '  ·  Series: ' + (s ? s.name : team.seriesId)
            ));
            // rename and dissolve
            ov.appendChild(h('div', { style: { display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' } },
                mkBtn('Rename', 'btn btn-sm btn-secondary', function() {
                    var newName = prompt('Team name:', team.name);
                    if (newName && newName.trim()) {
                        team.name = newName.trim();
                        addLog(G, '✏️ Team renamed to ' + team.name);
                        saveGame(); render();
                    }
                }),
                mkBtn('Dissolve Team', 'btn btn-sm btn-danger', function() {
                    if (!confirm('Dissolve ' + team.name + '? This cannot be undone.')) return;
                    addLog(G, '🏚️ ' + team.name + ' dissolved.');
                    G.ownedTeam = null;
                    saveGame(); render();
                })
            ));
            f.appendChild(ov);

            // cars
            var cc = h('div', { className: 'card', style: { marginBottom: '16px' } });
            cc.appendChild(cardTitle('Cars'));
            if (!team.cars.length) {
                cc.appendChild(h('div', { style: { fontSize: '14px', color: '#64748B', marginBottom: '10px' } }, 'No cars. Buy one to field drivers.'));
            } else {
                team.cars.forEach(function(car, ci) {
                    var condColor = car.condition >= 75 ? '#10B981' : car.condition >= 50 ? '#F59E0B' : '#EF4444';
                    var repairCost = Math.floor((100 - car.condition) * 80);
                    var row = h('div', { style: { display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', borderBottom: '1px solid #1E2433' } },
                        h('div', { style: { flex: 1 } },
                            h('div', { style: { fontSize: '14px', fontWeight: 700, color: '#F9FAFB' } }, 'Car #' + (ci + 1) + (car.purchasedUsed ? ' (used)' : ' (new)')),
                            h('div', { style: { fontSize: '13px', color: condColor } }, 'Condition: ' + car.condition + '%  ·  Mileage: ' + (car.mileage || 0) + ' laps')
                        ),
                        car.condition < 90 && repairCost > 0 ? mkBtn('Repair -' + fmtMoney(repairCost), 'btn btn-sm btn-secondary', function() {
                            if (G.money < repairCost - 1) { alert('Not enough money.'); return; }
                            G.money -= repairCost;
                            team.totalSpent = (team.totalSpent || 0) + repairCost;
                            car.condition = 100;
                            addLog(G, '🔧 Repaired car #' + (ci + 1) + ': -' + fmtMoney(repairCost));
                            saveGame(); render();
                        }) : badge('Good shape', '#10B981')
                    );
                    cc.appendChild(row);
                });
            }
            // buy more cars
            if (s) {
                var costs2 = TEAM_CAR_COSTS[s.id] || { new: 10000, used: 4000 };
                cc.appendChild(h('div', { style: { display: 'flex', gap: '8px', marginTop: '10px' } },
                    G.money >= costs2.used ? mkBtn('+ Used Car ' + fmtMoney(costs2.used), 'btn btn-sm btn-secondary', function() {
                        var car2 = makeTeamCar(s.id);
                        car2.purchasedUsed = true;
                        car2.condition = rand(60, 80);
                        car2.purchasePrice = costs2.used;
                        team.cars.push(car2);
                        G.money -= costs2.used;
                        team.totalSpent = (team.totalSpent || 0) + costs2.used;
                        addLog(G, '🚗 Bought used car for ' + team.name + ': -' + fmtMoney(costs2.used));
                        saveGame(); render();
                    }) : null,
                    G.money >= costs2.new ? mkBtn('+ New Car ' + fmtMoney(costs2.new), 'btn btn-sm btn-primary', function() {
                        var car2 = makeTeamCar(s.id);
                        car2.purchasedUsed = false;
                        car2.condition = 100;
                        car2.purchasePrice = costs2.new;
                        team.cars.push(car2);
                        G.money -= costs2.new;
                        team.totalSpent = (team.totalSpent || 0) + costs2.new;
                        addLog(G, '🚗 Bought new car for ' + team.name + ': -' + fmtMoney(costs2.new));
                        saveGame(); render();
                    }) : null
                ));
            }
            f.appendChild(cc);

            // drivers
            var dc = h('div', { className: 'card', style: { marginBottom: '16px' } });
            dc.appendChild(cardTitle('Drivers'));
            var availCars = team.cars.filter(function(c) { return !team.drivers.some(function(d) { return d && d.carId === c.id; }); });
            if (!team.drivers.length) {
                dc.appendChild(h('div', { style: { fontSize: '14px', color: '#64748B', marginBottom: '10px' } }, 'No drivers signed. Hire one below.'));
            } else {
                team.drivers.forEach(function(td, di) {
                    var moraleColor = (td.morale || 70) >= 70 ? '#10B981' : (td.morale || 70) >= 40 ? '#F59E0B' : '#EF4444';
                    var linkedCar = team.cars.find(function(c) { return c.id === td.carId; });
                    var dRow = h('div', { style: { padding: '10px 0', borderBottom: '1px solid #1E2433' } },
                        h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' } },
                            h('div', null,
                                h('span', { style: { fontWeight: 700, fontSize: '14px', color: '#F9FAFB' } }, td.name),
                                h('span', { style: { fontSize: '13px', color: '#64748B', marginLeft: '8px' } }, 'Skill: ' + td.skill + '  ·  Salary: ' + fmtMoney(td.salary) + '/wk')
                            ),
                            mkBtn('Fire', 'btn btn-xs btn-danger', function() {
                                var buyout = td.salary * 4;
                                if (!confirm('Fire ' + td.name + '? Buyout: ' + fmtMoney(buyout))) return;
                                G.money -= buyout;
                                team.totalSpent = (team.totalSpent || 0) + buyout;
                                team.drivers.splice(di, 1);
                                addLog(G, '🚪 Fired ' + td.name + ' — buyout: -' + fmtMoney(buyout));
                                saveGame(); render();
                            })
                        ),
                        h('div', { style: { fontSize: '13px', color: '#94A3B8' } },
                            'Morale: ', h('span', { style: { color: moraleColor } }, td.morale + '%'),
                            '  ·  Starts: ' + (td.starts || 0) + '  ·  Wins: ' + (td.wins || 0) + '  ·  Top 5s: ' + (td.top5s || 0),
                            '  ·  Car: ' + (linkedCar ? 'Car #' + (team.cars.indexOf(linkedCar) + 1) : '⚠️ No car assigned')
                        ),
                        // assign car
                        availCars.length && !td.carId ? h('div', { style: { marginTop: '6px' } },
                            mkBtn('Assign Car', 'btn btn-xs btn-secondary', function() {
                                td.carId = availCars[0].id;
                                saveGame(); render();
                            })
                        ) : null
                    );
                    dc.appendChild(dRow);
                });
            }
            // hire button - only when theres a car available
            if (team.cars.length > team.drivers.length) {
                var tier2 = s ? s.tier : 1;
                var salRange = TEAM_SALARY_BY_TIER[tier2] || { min: 0, max: 0 };
                dc.appendChild(h('div', { style: { marginTop: '12px' } },
                    mkBtn('+ Hire Driver', 'btn btn-sm btn-secondary', function() {
                        var pool = (G.drivers || []).filter(function(d) {
                            return d.active && d.currentSeriesId === team.seriesId
                                && !team.drivers.some(function(td) { return td && td.name === d.name; });
  });
                        while (pool.length < 6) {
                            pool.push({ name: 'Prospect ' + (pool.length + 1), skill: rand(45, 72), _generated: true });
                        }
                        pool = pool.slice(0, 10);
                        var rows = pool.map(function(d) {
                            var projSal = salRange.min === 0 ? 0 : rand(salRange.min, salRange.max);
                            var row = h('div', {
                                style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', marginBottom: '6px', borderRadius: '8px', background: '#060A10', border: '1px solid #1E2433', cursor: 'pointer' },
                                onClick: function() {
                                    var td2 = makeTeamDriver(team.seriesId, d.name, d.skill || 55);
                                    var freeCar = team.cars.find(function(c) { return !team.drivers.some(function(x) { return x && x.carId === c.id; }); });
                                    if (freeCar) td2.carId = freeCar.id;
                                    team.drivers.push(td2);
                                    var srcDriver = !d._generated ? (G.drivers || []).find(function(gd) { return gd.name === d.name; }) : null;
                                    if (srcDriver && srcDriver.currentTeam) {
                                        // They're on a real named team — flag to leave at season end
                                        srcDriver._leavingForTeam = team.name;
                                        srcDriver._leavingAfterSeason = G.season;
                                        addLog(G, '🤝 Signed ' + d.name + ' (' + srcDriver.currentTeam + ') for ' + team.name + ' — leaves current team at season end · ' + fmtMoney(td2.salary) + '/wk');
                                    } else {
                                        // Independent or lower-tier guy with no team — joins immediately, no drama
                                        addLog(G, '🤝 Hired ' + d.name + ' for ' + team.name + ' — ' + fmtMoney(td2.salary) + '/wk');
                                    }
                                    saveGame(); closeModal(); render();
                                }
                            },
                                h('div', null,
                                    h('div', { style: { fontWeight: 700, fontSize: '14px', color: '#F9FAFB' } }, d.name + (d._generated ? ' 🆕' : '')),
                                    h('div', { style: { fontSize: '12px', color: '#64748B', marginTop: '2px' } },
                                        'Skill: ' + (d.skill || 55) +
                                        ' · ' + (d._generated ? 'Prospect' : (getSeries(d.currentSeriesId) || {short: d.currentSeriesId || 'Unknown'}).short) +
                                        ' · Est. salary: ' + (salRange.min === 0 ? 'Free' : '~' + fmtMoney(projSal) + '/wk')
                                    )
                                ),
                                h('div', { style: { fontSize: '18px', fontWeight: 900, color: '#10B981' } }, '▶ Sign')
                            );
                            return row;
                        });
                        openModal(h('div', null,
                            h('div', { className: 'modal-eyebrow' }, team.name),
                            h('div', { className: 'modal-title' }, 'Hire a Driver'),
                            h('div', { style: { fontSize: '14px', color: '#94A3B8', marginBottom: '16px' } },
                                'Select a driver to sign. Drivers marked 🆕 are generated prospects not yet in the paddock.'
                            ),
                            h('div', null, ...rows),
                            h('div', { className: 'modal-actions' }, mkBtn('Cancel', 'btn btn-ghost', closeModal))
                        ));
                    })
                ));
            }
            f.appendChild(dc);

            // facilities
            var fc = h('div', { className: 'card', style: { marginBottom: '16px' } });
            fc.appendChild(cardTitle('Facilities'));
            FACILITY_UPGRADES.forEach(function(fac) {
                var owned = (team.facilities || []).includes(fac.id);
                var canAfford = G.money >= fac.cost;
                var bonusStr = Object.keys(fac.bonus).map(function(k) {
                    var v = fac.bonus[k];
                    return (v > 0 ? '+' : '') + v + (k === 'cost_pct' ? '% running costs' : ' ' + k);
                }).join(', ');
                var row2 = h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #1E2433' } },
                    h('div', { style: { flex: 1 } },
                        h('div', { style: { fontSize: '14px', fontWeight: 700, color: owned ? '#10B981' : '#F9FAFB' } }, (owned ? '✅ ' : '') + fac.name),
                        h('div', { style: { fontSize: '13px', color: '#94A3B8', marginTop: '2px' } }, fac.desc),
                        h('div', { style: { fontSize: '12px', color: '#F59E0B', marginTop: '2px' } }, bonusStr)
                    ),
                    owned ? null : (canAfford
                        ? mkBtn('Buy ' + fmtMoney(fac.cost), 'btn btn-sm btn-secondary', function() {
                            G.money -= fac.cost;
                            team.totalSpent = (team.totalSpent || 0) + fac.cost;
                            if (!team.facilities) team.facilities = [];
                            team.facilities.push(fac.id);
                            addLog(G, '🏗️ Bought ' + fac.name + ' for ' + team.name + ': -' + fmtMoney(fac.cost));
                            saveGame(); render();
                        })
                        : h('span', { style: { fontSize: '13px', color: '#EF4444' } }, fmtMoney(fac.cost))
                    )
                );
                fc.appendChild(row2);
            });
            f.appendChild(fc);

            // staff
            var sc2 = h('div', { className: 'card', style: { marginBottom: '16px' } });
            sc2.appendChild(cardTitle('Staff'));
            TEAM_STAFF_ROLES.forEach(function(role) {
                var hired = (team.staff || []).find(function(st) { return st && st.roleId === role.id; });
                var bonusStr2 = Object.keys(role.bonus).map(function(k) {
                    var v = role.bonus[k];
                    return (v > 0 ? '+' : '') + v + ' ' + k;
                }).join(', ');
                var sRow = h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #1E2433' } },
                    h('div', { style: { flex: 1 } },
                        h('div', { style: { fontSize: '14px', fontWeight: 700, color: hired ? '#10B981' : '#F9FAFB' } }, (hired ? '✅ ' : '') + role.name),
                        h('div', { style: { fontSize: '13px', color: '#94A3B8', marginTop: '2px' } }, fmtMoney(role.weeklyCost) + '/wk  ·  ' + bonusStr2)
                    ),
                    hired
                        ? mkBtn('Release', 'btn btn-xs btn-danger', function() {
                            var buyout = role.weeklyCost * 3;
                            if (!confirm('Release ' + role.name + '? Cost: ' + fmtMoney(buyout))) return;
                            G.money -= buyout;
                            team.totalSpent = (team.totalSpent || 0) + buyout;
                            team.staff = team.staff.filter(function(st) { return !st || st.roleId !== role.id; });
                            addLog(G, '🚪 Released ' + role.name + ': -' + fmtMoney(buyout));
                            saveGame(); render();
                        })
                        : G.money >= role.weeklyCost * 4
                            ? mkBtn('Hire ' + fmtMoney(role.weeklyCost) + '/wk', 'btn btn-sm btn-secondary', function() {
                                if (!team.staff) team.staff = [];
                                team.staff.push({ roleId: role.id, name: role.name, weeklyCost: role.weeklyCost, bonus: role.bonus });
                                addLog(G, '🤝 Hired ' + role.name + ' for ' + team.name + ' — ' + fmtMoney(role.weeklyCost) + '/wk');
                                saveGame(); render();
                            })
                            : h('span', { style: { fontSize: '13px', color: '#EF4444' } }, fmtMoney(role.weeklyCost) + '/wk')
                );
                sc2.appendChild(sRow);
            });
            f.appendChild(sc2);

            // team sponsors
            var spCard = h('div', { className: 'card', style: { marginBottom: '16px' } });
            spCard.appendChild(cardTitle('Team Sponsors'));

            if (!team.sponsorOffers || !team.sponsorOffers.length) {
                team.sponsorOffers = [];
                var TEAM_SPONSOR_TIERS = {
                    1: { // Mini stock / open entry
                        brands: ['Joe\'s Auto Parts', 'Hometown Tire', 'Miller\'s Hardware', 'County Line Diesel', 'Ace Auto Glass', 'Dave\'s Towing', 'Pioneer Seeds', 'Lakeside Marine'],
                        min: 200, max: 600
                    },
                    2: { // Street stock / super late
                        brands: ['AutoZone', 'Advance Auto', 'Moog Parts', 'Peak Antifreeze', 'WD-40', 'Mechanix Wear', 'Sunoco Race Fuels', 'Summit Racing'],
                        min: 600, max: 1800
                    },
                    3: { // Late model / regional
                        brands: ['Lucas Oil', 'Mobil 1', 'K&N Filters', 'Holley', 'MSD Ignition', 'Edelbrock', 'Trick Flow', 'Wilwood Brakes'],
                        min: 1500, max: 5000
                    },
                    4: { // ARCA
                        brands: ['Menards', 'Zaxby\'s', 'Pilot Flying J', 'Love\'s Travel Stops', 'NAPA Auto Parts', 'Chevrolet Accessories', 'Toyota Racing', 'Ford Performance'],
                        min: 4000, max: 12000
                    },
                    5: { // Trucks
                        brands: ['Bass Pro Shops', 'Camping World', 'Chevrolet Silverado', 'Ford F-150', 'Toyota Tundra', 'Safelite', 'NAPA Auto Parts', 'Niece Motorsports'],
                        min: 8000, max: 22000
                    },
                    6: { // Xfinity
                        brands: ['Busch Beer', 'Monster Energy', 'Reese\'s', 'M&Ms', 'Kraft', 'Sleep Number', 'Cheddar\'s Scratch Kitchen', 'Mahindra Tractors'],
                        min: 18000, max: 50000
                    },
                    7: { // Cup
                        brands: ['Hendrick Cars', 'Freightliner', 'Coca-Cola', 'Lowe\'s', 'FedEx', 'Valvoline', '5-hour Energy', 'Goodyear'],
                        min: 50000, max: 150000
                    },
                };
                var tier2 = s ? Math.min(s.tier, 7) : 1;
                var tierData = TEAM_SPONSOR_TIERS[tier2] || TEAM_SPONSOR_TIERS[1];
                var numOffers = 3 + rand(0, 2);
                var usedBrands = [];
                for (var oi = 0; oi < numOffers; oi++) {
                    var brand;
                    var attempts = 0;
                    do {
                        brand = tierData.brands[rand(0, tierData.brands.length - 1)];
                        attempts++;
                    } while (usedBrands.includes(brand) && attempts < 20);
                    usedBrands.push(brand);
                    var seasons = rand(1, 3);
                    var value = Math.floor(tierData.min + Math.random() * (tierData.max - tierData.min));
                    team.sponsorOffers.push({ id: uid(), brand: brand, valuePerSeason: value, seasonsLeft: seasons, winBonus: Math.floor(value * 0.1) });
                }
            }

            if (team.sponsors && team.sponsors.length) {
                spCard.appendChild(h('div', { style: { marginBottom: '10px' } },
                    h('div', { style: { fontSize: '12px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' } }, 'Active'),
                    ...team.sponsors.map(function(sp) {
                        return h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1E2433' } },
                            h('div', null,
                                h('div', { style: { fontWeight: 700, fontSize: '14px', color: '#F9FAFB' } }, sp.brand),
                                h('div', { style: { fontSize: '13px', color: '#94A3B8' } }, fmtMoney(sp.valuePerSeason) + '/season · ' + sp.seasonsLeft + ' season(s) left · Win bonus: ' + fmtMoney(sp.winBonus))
                            ),
                            h('span', { style: { fontSize: '11px', color: '#10B981', background: '#10B98122', border: '1px solid #10B98144', padding: '2px 7px', borderRadius: '4px', fontWeight: 700 } }, sp.seasonsLeft + (sp.seasonsLeft === 1 ? ' season' : ' seasons'))
                        );
                    })
                ));
            } else {
                spCard.appendChild(h('div', { style: { fontSize: '14px', color: '#64748B', marginBottom: '10px' } }, 'No active team sponsors.'));
            }

            if (team.sponsorOffers && team.sponsorOffers.length) {
                spCard.appendChild(h('div', { style: { fontSize: '12px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px', marginTop: '10px' } }, 'Available Offers'));
                team.sponsorOffers.forEach(function(sp) {
                    var offerRow = h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #1E2433' } },
                        h('div', { style: { flex: 1 } },
                            h('div', { style: { fontWeight: 700, fontSize: '14px', color: '#F9FAFB' } }, sp.brand),
                            h('div', { style: { fontSize: '13px', color: '#94A3B8', marginTop: '2px' } },
                                fmtMoney(sp.valuePerSeason) + '/season · ' + sp.seasonsLeft + ' season(s) · Win bonus: +' + fmtMoney(sp.winBonus)
                            )
                        ),
                        h('div', { style: { display: 'flex', gap: '6px' } },
                            mkBtn('Decline', 'btn btn-xs btn-ghost', function() {
                                team.sponsorOffers = team.sponsorOffers.filter(function(x) { return x.id !== sp.id; });
                                saveGame(); render();
                            }),
                            mkBtn('Sign', 'btn btn-xs btn-success', function() {
                                if (!team.sponsors) team.sponsors = [];
                                team.sponsors.push(sp);
                                team.sponsorOffers = team.sponsorOffers.filter(function(x) { return x.id !== sp.id; });
                                addLog(G, '🤝 ' + team.name + ' signed ' + sp.brand + ' — ' + fmtMoney(sp.valuePerSeason) + '/season');
                                saveGame(); render();
                            })
                        )
                    );
                    spCard.appendChild(offerRow);
                });
            } else {
                spCard.appendChild(h('div', { style: { fontSize: '14px', color: '#64748B' } }, 'No sponsor offers available right now.'));
            }

            spCard.appendChild(h('div', { style: { marginTop: '10px' } },
                mkBtn('🔄 Refresh Offers', 'btn btn-sm btn-secondary', function() {
                    team.sponsorOffers = null;
                    saveGame(); render();
                })
            ));

            f.appendChild(spCard);

            return f;
        }

        function renderBusiness() {
            const f = document.createDocumentFragment();
            f.appendChild(h('div', { className: 'page-title' }, 'Business'));
            f.appendChild(h('div', { className: 'page-sub' }, 'Sponsorships, off-track events, and merch.'));
            const bizQueue = (G.dramaQueue || []).filter(function (d) {
                return d.effect === 'money' || d.effect === 'sponsor_warning' || d._isFanMail || d._isSponsor;
            });
            if (bizQueue.length) {
                const bizKey = 'biz_notifications';
                const bizCollapsed = isCollapsed(bizKey, false);
                const bq = h('div', { className: 'card', style: { marginBottom: '18px' } });
                bq.appendChild(h('div', {
                    style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', cursor: 'pointer' },
                    onClick: function () { toggleCollapse(bizKey, false); render(); }
                },
                    cardTitle('Notifications (' + bizQueue.length + ')'),
                    h('span', { style: { fontSize: '16px', color: '#64748B', transform: bizCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' } }, '▾'),
                ));
                if (!bizCollapsed) {
                    bizQueue.forEach(function (d) {
                        const valColor = d.valence === 'bad' ? '#EF4444' : d.valence === 'good' ? '#10B981' : '#94A3B8';
                        const item = h('div', { style: { padding: '10px 0', borderBottom: '1px solid #0D1117' } });
                        item.appendChild(h('div', { style: { fontSize: '15px', fontWeight: 700, color: '#F9FAFB', marginBottom: '4px' } }, d.title));
                        item.appendChild(h('div', { style: { fontSize: '14px', color: '#E2E8F0', lineHeight: '1.5', marginBottom: '8px' } }, d.desc));
                        if (d._isActivation && d._activationOptions) {
                            const sp = (G.sponsors || []).find(function (s) { return s.id === d._activationSponsorId; });
                            item.appendChild(h('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' } },
                                ...d._activationOptions.map(function (opt) {
                                    return h('div', {
                                        style: {
                                            background: '#060A10', border: '1px solid #1E2433', borderRadius: '8px', padding: '10px 12px',
                                            cursor: 'pointer',
                                        }
                                    },
                                        h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' } },
                                            h('div', { style: { fontSize: '14px', fontWeight: 700, color: '#F9FAFB' } }, opt.label),
                                            h('div', { style: { display: 'flex', gap: '10px', fontSize: '13px' } },
                                                opt.money > 0 ? h('span', { style: { color: '#10B981' } }, '+' + fmtMoney(opt.money)) : opt.money < 0 ? h('span', { style: { color: '#EF4444' } }, fmtMoney(opt.money)) : null,
                                                opt.rep > 0 ? h('span', { style: { color: '#F59E0B' } }, '+' + opt.rep + ' rep') : opt.rep < 0 ? h('span', { style: { color: '#EF4444' } }, opt.rep + ' rep') : null,
                                                opt.fans > 0 ? h('span', { style: { color: '#EC4899' } }, '+' + fmtFans(opt.fans) + ' fans') : opt.fans < 0 ? h('span', { style: { color: '#EF4444' } }, fmtFans(opt.fans) + ' fans') : null,
                                                opt.sponsorHappy > 0 ? h('span', { style: { color: '#10B981' } }, '😊 +' + opt.sponsorHappy + '%') : h('span', { style: { color: '#EF4444' } }, '😟 ' + opt.sponsorHappy + '%'),
                                            ),
                                        ),
                                        h('div', { style: { fontSize: '13px', color: '#94A3B8' } }, opt.desc),
                                        h('button', {
                                            className: 'btn btn-sm btn-secondary',
                                            style: { marginTop: '8px' },
                                            onClick: function () {
                                                if (sp) {
                                                    sp.happiness = clamp(sp.happiness + opt.sponsorHappy, 0, 100);
                                                }
                                                G.reputation = Math.max(0, G.reputation + opt.rep);
                                                G.fans = Math.max(0, G.fans + opt.fans);
                                                G.money += opt.money;
                                                if (opt.money > 0) G.totalPrizeMoney += opt.money;
                                                addLog(G, '🤝 Sponsor activation (' + d.title + '): ' + opt.label + ' — ' + [
                                                    opt.money ? fmtMoney(opt.money) : null,
                                                    opt.rep ? opt.rep + ' rep' : null,
                                                    opt.fans ? fmtFans(opt.fans) + ' fans' : null,
                                                ].filter(Boolean).join(', '));
                                                const idx = G.dramaQueue.findIndex(function (x) { return x.id === d.id; });
                                                if (idx >= 0) G.dramaQueue.splice(idx, 1);
                                                saveGame(); render();
                                            },
                                        }, 'Choose This'),
                                    );
                                }),
                            ));
                        } else {
                            item.appendChild(h('div', { style: { textAlign: 'right' } },
                                mkBtn('Dismiss', 'btn btn-sm btn-primary', function () {
                                    const idx = G.dramaQueue.findIndex(function (x) { return x.id === d.id; });
                                    if (idx >= 0) doDismissDrama(idx);
                                })
                            ));
                        }
                        bq.appendChild(item);
                    });
                }
                f.appendChild(bq);
            }

            // media day
            const activeTier = G.contracts.length
                ? Math.max(...G.contracts.map(c => (getSeries(c.seriesId) && getSeries(c.seriesId).tier) || 1))
                : 1;
            const lastMediaWeek = G.lastMediaDayWeek || 0;
            const mediaDayUsed = (G.week - lastMediaWeek) < 3;
            const tierKey = activeTier <= 2 ? 'tier12' : activeTier === 3 ? 'tier3' : activeTier === 4 ? 'tier4' : 'tier567';
            const mediaCfg = MEDIA_DAY[tierKey];
            f.appendChild(h('div', { className: 'card', style: { marginBottom: '18px' } },
                h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' } },
                    h('div', null,
                        cardTitle(mediaCfg.icon + ' ' + mediaCfg.label),
                        h('div', { style: { fontSize: '14px', color: '#94A3B8' } },
                            activeTier <= 2 ? 'A local reporter wants a quote. Once per season.' :
                                activeTier === 3 ? 'Regional coverage. Your words travel further now. Once per season.' :
                                    activeTier === 4 ? 'National outlet. Sponsors are watching. Once per season.' :
                                        'Full press conference. Everything you say gets clipped. Once per season.'
                        ),
                    ),
                    mediaDayUsed
                        ? badge('Available in ' + (3 - (G.week - (G.lastMediaDayWeek || 0))) + ' races', '#64748B')
                        : mkBtn('Do Media Day', 'btn btn-primary', () => {
                            if (!G.offTrackDone) G.offTrackDone = [];
                            G.lastMediaDayWeek = G.week;
                            saveGame();
                            doMediaDay(activeTier);

                        }),
                ),
            ));
            // social media
            const smCard = h('div', { className: 'card', style: { marginBottom: '18px' } });
            smCard.appendChild(cardTitle('Social Media'));
            smCard.appendChild(h('div', { style: { fontSize: '14px', color: '#94A3B8', marginBottom: '14px' } },
                'One post per type per week. Posts are randomly drawn from 100 options each. Effects apply immediately.'
            ));

            // last post
            const lp = G.lastSocialPostText;
            if (lp && lp.week >= (G.week - 2)) {
                const lpColor = lp.type === 'positive' ? '#10B981' : lp.type === 'negative' ? '#EF4444' : '#94A3B8';
                smCard.appendChild(h('div', {
                    style: {
                        background: '#060A10', border: `1px solid ${lpColor}33`, borderRadius: '8px',
                        padding: '12px 14px', marginBottom: '14px',
                    }
                },
                    h('div', { style: { fontSize: '12px', color: lpColor, fontWeight: 700, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.1em' } },
                        `Last post · ${lp.type} · Week ${lp.week}`),
                    h('div', { style: { fontSize: '14px', color: '#E2E8F0', lineHeight: 1.55, fontStyle: 'italic' } }, `"${lp.text}"`),
                    h('div', { style: { fontSize: '13px', color: '#64748B', marginTop: '6px' } },
                        [lp.rep !== 0 ? `Rep ${lp.rep >= 0 ? '+' : ''}${lp.rep}` : null, lp.fans !== 0 ? `Fans ${lp.fans >= 0 ? '+' : ''}${fmtFans(lp.fans)}` : null].filter(Boolean).join(' · ')
                    ),
                ));
            }

            const btnRow = h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px' } });
            [
                { type: 'positive', label: '✅ Positive Post', color: '#10B981', bg: '#065134', desc: '+1 to +3 rep · +100 to +400 fans' },
                { type: 'neutral', label: '💬 Neutral Post', color: '#94A3B8', bg: '#1E2433', desc: 'No rep change · +0 to +150 fans' },
                { type: 'negative', label: '🔥 Negative Post', color: '#EF4444', bg: '#450a0a', desc: '-2 to 0 rep · -200 to +100 fans' },
            ].forEach(({ type, label, color, bg, desc }) => {
                const used = !canPostSocial(G, type);
                btnRow.appendChild(h('div', {
                    style: {
                        background: used ? '#04060E' : bg + '44',
                        border: `1px solid ${used ? '#1E2433' : color + '44'}`,
                        borderRadius: '8px', padding: '12px',
                        opacity: used ? '0.45' : '1',
                        textAlign: 'center',
                    }
                },
                    h('div', { style: { fontSize: '15px', fontWeight: 800, color: used ? '#64748B' : color, marginBottom: '4px' } }, label),
                    h('div', { style: { fontSize: '12px', color: '#64748B', marginBottom: '10px' } }, desc),
                    used
                        ? h('div', { style: { fontSize: '13px', color: '#374151', fontWeight: 700 } }, 'Posted this week')
                        : mkBtn('Post', 'btn btn-sm btn-primary', () => doSocialPost(type)),
                ));
            });
            smCard.appendChild(btnRow);
            f.appendChild(smCard);;



            // merch
            const merch = calcMerchRevenue(G.fans);
            f.appendChild(h('div', { className: 'card', style: { marginBottom: '14px' } },
                cardTitle('Merchandise Revenue'),
                h('div', { style: { display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' } },
                    h('div', null, h('div', { style: { fontSize: '12px', color: '#94A3B8' } }, 'FANBASE'), h('div', { style: { fontSize: '24px', fontWeight: 900, color: '#EC4899' } }, fmtFans(G.fans))),
                    h('div', null, h('div', { style: { fontSize: '12px', color: '#94A3B8' } }, 'PROJECTED/SEASON'), h('div', { style: { fontSize: '24px', fontWeight: 900, color: '#10B981' } }, fmtMoney(merch))),
                    h('div', { style: { fontSize: '14px', color: '#94A3B8', flex: 1 } }, 'Merch paid at season end. Grow fans through wins, appearances, and special events.'),
                )
            ));

            // sponsor offers
            if ((G.sponsorOffers || []).length) {
                const offersKey = 'biz_offers';
                const offersCollapsed = isCollapsed(offersKey, false);
                f.appendChild(h('div', { style: { marginBottom: '16px' } },
                    h('div', {
                        style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', cursor: 'pointer' },
                        onClick: function () { toggleCollapse(offersKey, false); render(); }
                    },
                        h('div', { className: 'card-title', style: { margin: 0 } }, 'SPONSOR OFFERS (' + (G.sponsorOffers || []).length + ')'),
                        h('span', { style: { fontSize: '16px', color: '#64748B', transform: offersCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' } }, '▾'),
                    ),
                    ...(!offersCollapsed ? (G.sponsorOffers || []).map(sp => h('div', { className: 'row-item' },

                        h('div', { style: { flex: 1 } },
                            h('div', { style: { fontWeight: 800, fontSize: '15px', color: '#F9FAFB', display: 'flex', gap: '8px', alignItems: 'center' } }, sp.brand, sp.international ? badge('INTERNATIONAL', '#F59E0B') : null),
                            h('div', { style: { fontSize: '14px', color: '#94A3B8', marginTop: '2px' } },
                                ((SPONSOR_TYPES[sp.type] || {}).label || sp.type) + ' · ' +
                                ((getSeries(sp.seriesId) && getSeries(sp.seriesId).short) || sp.seriesId || 'All Series') + ' · ' +
                                fmtMoney(sp.valuePerSeason) + '/season · ' +
                                sp.seasonsLeft + ' season(s) · Win bonus: ' + fmtMoney(sp.winBonus)
                            ),
                        ),
                        h('div', { style: { display: 'flex', gap: '6px' } },
                            mkBtn('Decline', 'btn btn-sm btn-ghost', () => { G.sponsorOffers = G.sponsorOffers.filter(s => s.id !== sp.id); saveGame(); render(); }),
                            mkBtn('Sign', 'btn btn-sm btn-success', () => doSignSponsor(sp)),
                        )
                    )) : [])
                ));
            }

            // Active sponsors
            const sponsorKey = 'biz_sponsors';
            const sponsorCollapsed = isCollapsed(sponsorKey, false);
            f.appendChild(h('div', { style: { marginBottom: '16px' } },
                h('div', {
                    style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', cursor: 'pointer' },
                    onClick: function () { toggleCollapse(sponsorKey, false); render(); }
                },
                    h('div', { className: 'card-title', style: { margin: 0 } }, 'ACTIVE SPONSORS'),
                    h('span', { style: { fontSize: '16px', color: '#64748B', transform: sponsorCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' } }, '▾'),
                ),
                ...(!sponsorCollapsed ? [
                    !(G.sponsors || []).length ? h('div', { className: 'card', style: { color: '#94A3B8', textAlign: 'center', padding: '16px', fontSize: '14px' } }, 'No active sponsors.') :
                        frag(...(G.sponsors || []).map(sp => {
                            const hc = sp.happiness >= 60 ? '#10B981' : sp.happiness >= 35 ? '#F59E0B' : '#EF4444';
                            return h('div', { className: 'row-item' },
                                h('div', { style: { flex: 1 } },
                                    h('div', { style: { fontWeight: 800, fontSize: '15px', color: '#F9FAFB' } }, sp.brand, sp.international ? badge('INTL', '#F59E0B') : null),
                                    h('div', { style: { fontSize: '14px', color: '#94A3B8', marginTop: '2px' } },
                                        (SPONSOR_TYPES[sp.type] || {}).label + ' · ' +
                                        ((getSeries(sp.seriesId) && getSeries(sp.seriesId).short) || sp.seriesId || 'All Series') + ' · ' +
                                        fmtMoney(sp.valuePerSeason) + '/season · ' +
                                        sp.seasonsLeft + ' season(s) left'
                                    ),
                                ),
                                h('div', { style: { textAlign: 'right', flexShrink: 0 } },
                                    h('div', { style: { fontSize: '12px', color: '#94A3B8' } }, 'HAPPINESS'),
                                    h('div', { style: { fontSize: '20px', fontWeight: 900, color: hc } }, `${sp.happiness}%`),
                                ),
                                h('div', { className: 'happy-wrap' }, h('div', { className: 'happy-bar' }, h('div', { className: 'happy-fill', style: { width: `${sp.happiness}%`, background: hc } }))),
                            );
                        }))
                ] : [])
            ));
            // Off-track events
            const offTrackKey = 'biz_offtrack';
            const offTrackCollapsed = isCollapsed(offTrackKey, false);
            f.appendChild(h('div', { className: 'card' },
                h('div', {
                    style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', cursor: 'pointer' },
                    onClick: function () { toggleCollapse(offTrackKey, false); render(); }
                },
                    cardTitle('Off-Track Opportunities'),
                    h('span', { style: { fontSize: '16px', color: '#64748B', transform: offTrackCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' } }, '▾'),
                ),
                !offTrackCollapsed && h('div', { style: { fontSize: '14px', color: '#94A3B8', marginBottom: '12px' } }, 'Once per season each. Earns rep, fans, sponsor happiness.'),
                ...(!offTrackCollapsed ? OFF_TRACK.map(evt => {
                    const done = (G.offTrackDone || []).some(function(d) { return d === evt.id + '_s' + G.season || d === evt.id; });
                    const canAfford = G.money >= evt.cost;
                    return h('div', { className: 'row-item', style: { opacity: done ? '0.45' : '1' } },
                        h('div', { style: { flex: 1 } },
                            h('div', { style: { fontWeight: 700, fontSize: '14px', color: '#F9FAFB' } }, evt.label),
                            h('div', { style: { fontSize: '14px', color: '#94A3B8', marginTop: '2px' } }, evt.desc),
                            h('div', { style: { fontSize: '14px', color: '#94A3B8', marginTop: '3px' } }, `+${evt.rep} rep · +${fmtFans(evt.fans)} fans · sponsors +${evt.sponsorHappy}%${evt.cost > 0 ? ` · ${fmtMoney(evt.cost)}` : ' · free'}`),
                        ),
                        done ? badge('Done', '#64748B') : mkBtn(canAfford ? 'Do It' : `Need ${fmtMoney(evt.cost - G.money)}`, 'btn btn-sm btn-secondary', () => doOffTrackEvent(evt), !canAfford || done),
                    );
                }) : [])
            ));
            return f;
        }

        // driver bio generation
        function generateDriverBio(d) {
            var s    = getSeries(d.currentSeriesId);
            var tier = s ? s.tier : 1;
            var seriesShort = s ? s.short : 'the series';
            var seriesName  = s ? s.name  : 'the series';
            var home = (typeof US_STATE_NAMES !== 'undefined' && d.homeState) ? US_STATE_NAMES[d.homeState] || d.homeState : null;
            var wins   = d.wins   || 0;
            var starts = d.starts || 0;
            var rep    = d.rep    || 0;
            var team   = d.currentTeam || 'an independent team';
            var ai     = d.aiStats || {};
            var agg    = ai.aggression    || 50;
            var smooth = ai.smoothness    || 50;
            var pit    = ai.pitCrewSkill  || 50;
            var risk   = ai.pittingRisk   || 50;
            var firstName = d.name.split(' ')[0];
            var lastName  = d.name.split(' ').slice(1).join(' ') || d.name;
            function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

            // driving style descriptors, layered
            var styleVerb = agg > 72
                ? pick(['goes door-to-door without hesitation', 'will race the fender off anyone who gives them an inch', 'doesn\'t ask permission when the lane opens up', 'races like the brake pedal is optional'])
                : agg < 35
                ? pick(['picks their moments carefully and rarely wastes one', 'races with a patience that frustrates more impulsive competitors', 'survives on clean laps where others throw them away', 'waits for the race to come to them and it usually does'])
                : smooth > 70
                ? pick(['is unusually smooth through dirty air', 'doesn\'t beat up the car, which means the car is there at the end', 'runs consistent splits from lap one to the checkered', 'is the kind of driver tire engineers love'])
                : pick(['adapts well mid-race', 'reads the field and adjusts', 'doesn\'t have one gear — adjusts to what the race needs', 'has a way of being in the right place when others make mistakes']);

            var stratLine = risk > 70
                ? pick(['The team calls the aggressive pit strategy almost by default. It works more than it doesn\'t.', 'When the field pits under green, this team stays out. Bold call. They live with the results.', 'Strategy-wise, the default setting is offense.'])
                : risk < 35
                ? pick(['Strategy is conservative — stage points matter, track position matters, and they rarely gamble it away.', 'The team takes the sure tire, the safe call, the position over the play. It extends careers.', 'You won\'t see this crew gambling on fuel mileage with ten to go. They\'re not built that way.'])
                : pick(['The pit calls are situational — they\'ll go either direction depending on how the race sets up.', 'Strategy varies week to week but the decision-making has been solid.', 'They read the race before making the call, which sounds obvious until you watch how many teams don\'t.']);

            var crewLine = pit > 70
                ? pick(['The over-the-wall crew has been one of the better units in the series — consistently gaining spots on pit road.', 'Pit stops have been a genuine weapon for this team this season.', 'The crew chief runs a tight operation. They\'ve gained more positions on pit road than most in this field.'])
                : pit < 35
                ? pick(['Pit road has been a recurring issue. They\'ve given back positions they earned on the track.', 'The crew is still finding its rhythm. The stopwatch tells the story.', 'Pit execution has cost this team on more than one occasion this season.'])
                : pick(['Pit stops are solid without being spectacular — they don\'t win races on pit road but they don\'t lose them either.', 'The crew executes reliably. No blown tires, no jack issues. Consistent.', 'Pit road is average in the right way — no drama, no mistakes.']);

            // archetype selector (picks a character flavor)
            var archetype = (d._bioArchetype = d._bioArchetype || pick(['grinder', 'prodigy', 'journeyman', 'hothead', 'tactician', 'dark_horse', 'veteran']));

            var archetypeTag = {
                grinder:    pick(['There\'s nothing glamorous about the way they do this. They show up, they work, they\'re hard to beat when the night gets long.', 'Built for the last fifty laps. Doesn\'t need to lead early. Needs to lead at the end.', 'The car is never perfect and they run it hard anyway. That\'s been the story for a long time.']),
                prodigy:    pick(['Young, faster than they should be at this stage, and still clearly learning — which is what makes them dangerous.', 'The learning curve is happening in public and they\'re handling it better than most veterans would.', 'The raw pace was obvious early. The race-craft is catching up to it, and that\'s when this gets interesting.']),
                journeyman: pick(['Has raced for a lot of teams, seen a lot of situations, and developed a quiet competence that doesn\'t photograph well but keeps them employed.', 'Doesn\'t generate headlines but generates results. This level of racing is full of people like that. Few of them stick around as long.', 'The career has zigged and zagged. The skill hasn\'t gone anywhere. They just needed the right week.']),
                hothead:    pick(['Intensity is not the problem. Channeling it is. On a good night it\'s the fastest car on the track. On a bad night it\'s a YouTube clip someone adds sound effects to.', 'Will win races with pure aggression and also occasionally hand them away the same way. The team has learned to manage the radio carefully.', 'Racecraft that\'s exciting to watch and occasionally expensive to insure.']),
                tactician:  pick(['Races like they\'ve already seen how the last ten laps go. Rarely wrong. The results reflect a driver who thinks more than they let on.', 'Hard to rattle. Races with information, not emotion. The kind of driver crew chiefs fight over in the offseason.', 'Patient to a fault in the early going. Dangerous in the late going. Most of the field has figured this out. Hasn\'t helped them.']),
                dark_horse: pick(['Not the name people put on the championship short list. Shows up in the results anyway. Make of that what you will.', 'Doesn\'t get talked about between races. Gets talked about after them. There\'s a difference.', 'Overlooked in offseason preview pieces. Not overlooked by the people who\'ve actually raced against them.']),
                veteran:    pick(['Has been here long enough to watch three generations of hotshoes come through and calm down. Knows more than they let on, which is a lot.', 'Longevity in this sport is its own credential. Still here. Still fast enough to embarrass younger drivers on the right track.', 'The experience shows in traffic. Doesn\'t panic. Doesn\'t overreact. Knows where every car in the field is without being told.']),
            }[archetype] || '';

            // win context
            var winLine = wins >= 20
                ? pick([`${wins} wins in the series. That number belongs on a short list of the most accomplished careers at this level.`, `Twenty-plus wins. The kind of career that earns respect from drivers who\'ve never met them.`])
                : wins >= 10
                ? pick([`${wins} wins, which earns the label of genuine series contender without any argument.`, `A ${wins}-win driver at this level. The track record doesn\'t lie.`])
                : wins >= 5
                ? pick([`Five or more wins. Not a fluke, not a flash — a driver who figures out how to close.`, `${wins} wins in the series, which puts them comfortably in the category of drivers who win, not drivers who nearly win.`])
                : wins >= 2
                ? pick([`${wins} wins. Enough to prove it can happen. Enough to want it to happen again.`, `Has been to victory lane ${wins} times. The first one breaks the seal. The second one proves it.`])
                : wins === 1
                ? pick([`One win. It was real, it was earned, and it changed something about how the rest of the field treats them.`, `A winner at this level, which is harder than it sounds and easier than it looks once you\'ve done it.`])
                : starts > 30
                ? pick([`${starts} starts without a win, which is a number that either gets corrected or becomes a different kind of career story. They\'re not done.`, `Still searching for a win after ${starts} starts. The pace has been there. The circumstances haven\'t all lined up at once.`])
                : starts > 10
                ? pick([`Early days, but the learning has been visible. The win isn\'t here yet. The ingredients for one are.`, `${starts} starts into the career. Still finding the edges. Not afraid to find them.`])
                : pick([`New to the field. The sample size is small. The feedback from people who\'ve run alongside them is not.`, `Not many starts yet but the ones they\'ve had have told a story worth following.`]);

            // tier routing

            // TIER 1-2: local newspaper OR driver first-person OR short fan forum post
            if (tier <= 2) {
                var voice = Math.random();
                if (voice < 0.33) {
                    // First person
                    var fpOpener = home
                        ? pick([
                            `I grew up in ${home} going to the track every Friday night with my dad. Took me a while to get here myself, but I made it.`,
                            `${home} is home. Has been my whole life. I learned to race about twenty minutes from the house I grew up in.`,
                            `I'm from ${home} and I've been racing since before I could drive legally. The ${seriesShort} is where I've wanted to be for a long time.`,
                            `Out of ${home}. Started in karts, worked through the local stuff, ended up in the ${seriesShort}. It's taken a while but here I am.`,
                        ])
                        : pick([
                            `I've been doing this long enough to know what it takes to compete in the ${seriesShort}. I know this level.`,
                            `The ${seriesShort} is home right now. I've put in the work and the results are coming.`,
                        ]);
                    var fpResult = wins > 3
                        ? `I've got ${wins} wins here. I know how to win. The ones who think otherwise haven't been watching closely enough.`
                        : wins === 1 ? `Got my first win and I'm not treating it like a gift. I'll add to it.`
                        : starts > 20 ? `No wins yet but I've been close enough to know it's coming. I've been in position.`
                        : `Still learning what this level takes. I'm figuring it out faster than most people expect.`;
                    var fpStyle = `I ${styleVerb}. ${stratLine}`;
                    return `${fpOpener} ${fpResult} ${fpStyle}`;
                } else if (voice < 0.67) {
                    // Local newspaper
                    var npOpener = home
                        ? pick([
                            `${d.name} of ${home} has made the ${seriesShort} their home this season.`,
                            `${home}-area native ${d.name} has become a regular fixture in the ${seriesShort} field.`,
                            `${d.name}, who races out of ${home}, has been turning heads in the ${seriesShort}.`,
                            `For ${d.name}, the commute to the track starts in ${home} and has started to end in the results column.`,
                        ])
                        : `${d.name} has carved out a reputation as a serious competitor in the ${seriesName}.`;
                    var npResult = wins > 5
                        ? `${wins} wins at this level make ${firstName} one of the more accomplished drivers running weekly.`
                        : wins > 0 ? `${firstName} has been to victory lane${wins > 1 ? ' ' + wins + ' times' : ''}, which earns respect in a field this competitive.`
                        : starts > 15 ? `After ${starts} starts, ${firstName} is regarded as dangerous on the right night — the kind of driver you have to account for.`
                        : `${firstName} is still building their résumé but the early runs have given people something to watch.`;
                    return `${npOpener} ${npResult} ${archetypeTag}`;
                } else {
                    // Fan forum post, informal
                    var ffOpener = home
                        ? pick([
                            `Not enough people talk about ${d.name}. ${home} driver, races the ${seriesShort}, doesn't get the coverage they deserve.`,
                            `${firstName} is quietly one of the better regulars in the ${seriesShort} field. ${home} has a real one here.`,
                            `If you haven't been watching ${d.name} run the ${seriesShort}, you're missing something. Out of ${home}, legitimate threat every week.`,
                        ])
                        : pick([
                            `${d.name} doesn't get enough credit in the ${seriesShort}. Watch the car, not the name.`,
                            `Every week ${firstName} shows up and runs a clean race and nobody talks about it. That's this series.`,
                        ]);
                    var ffResult = wins > 0
                        ? `${wins > 1 ? wins + ' wins' : 'A win'} in the series. The track record is real.`
                        : starts > 15 ? `No win yet but they've been in position. Just needs everything to go right on the same night.`
                        : `New to the field but running better than the car has any right to be. Pay attention.`;
                    return `${ffOpener} ${ffResult} ${archetypeTag}`;
                }
            }

            // TIER 3-4: regional beat writer with actual detail
            if (tier <= 4) {
                var opener3 = home
                    ? pick([
                        `${d.name} operates out of ${home} and has built one of the steadier programs in the ${seriesName} over recent seasons.`,
                        `A ${home}-based program, ${d.name} has developed the kind of weekly consistency that earns respect in the ${seriesShort} paddock.`,
                        `${d.name} out of ${home} is the type of competitor the ${seriesShort} is built on — shows up prepared, races hard, and earns the results.`,
                        `${home} native ${d.name} has made the ${seriesName} home for several seasons now, building a career through results more than headlines.`,
                    ])
                    : pick([
                        `${d.name} has established themselves in the ${seriesName} through results that speak louder than any marketing campaign would.`,
                        `Running the ${seriesShort} out of the ${team} shop, ${d.name} has become a fixture in the top half of the field.`,
                    ]);
                var middle3 = winLine;
                var char3 = `${archetypeTag} ${styleVerb.charAt(0).toUpperCase() + styleVerb.slice(1)} — a style that's produced results at this level. ${crewLine}`;
                return `${opener3} ${middle3} ${char3}`;
            }

            // TIER 5-6: trade press, half business-speak, half real
            if (tier <= 6) {
                var opener5 = home
                    ? `${d.name} competes in the ${seriesName} for ${team}, representing a program out of ${home} that has steadily built its capability over multiple seasons.`
                    : `${d.name} runs the ${seriesName} for ${team}, an operation that has matured into a legitimate contender at this level.`;
                var prog5 = wins > 5
                    ? `With ${wins} wins in the ${seriesShort}, the program has moved past the 'promising' stage. ${d.name} and ${team} are a known quantity when it matters.`
                    : wins > 0 ? `${winLine} The team continues to develop around a driver who has demonstrated they can close.`
                    : `${winLine} The organization is building toward a run, and the infrastructure is closer than the points table currently reflects.`;
                var style5 = `${firstName} ${styleVerb}. ${stratLine} ${crewLine}`;
                var arch5 = archetypeTag;
                return `${opener5} ${prog5} ${style5} ${arch5}`;
            }

            // TIER 7: Cup — full PR copy, multiple paragraphs of texture
            var opener7 = `${d.name} competes in the ${seriesName} for ${team}${home ? ', representing a program with roots in ' + home : ''}.`;
            var prog7 = wins > 10
                ? `A ${wins}-win veteran of the series, ${d.name} has built a record that holds up against any comparable career in the modern era of the sport. The wins have come on short tracks, intermediate ovals, and superspeedways — not a product of circumstance but of consistent execution across different challenges.`
                : wins > 3
                ? `${wins} wins in the ${seriesShort} reflect a driver and team that have figured something out. The ${team} operation has built a program capable of competing for the championship — not in theory, but in practice.`
                : wins > 0
                ? `${winLine} The organization is still developing but the infrastructure is real. ${d.name} has shown Cup-level competitiveness when the pieces are right.`
                : `${winLine} The focus for ${d.name} and ${team} is development — building a program that converts raw pace into consistent results at the highest level of competition.`;
            var char7 = `${d.name} ${styleVerb} — a style that generates both respect and friction depending on the week. ${stratLine} ${crewLine} ${archetypeTag}`;
            var rep7 = rep > 85
                ? `One of the more recognized names in the sport right now. Sponsor demand is high, which is what happens when you deliver consistently.`
                : rep > 60
                ? `A respected name in the paddock. The kind of reputation that takes years to build and gets noticed by the people making offseason decisions.`
                : `Still building the visibility that goes with the level. The results will do the talking.`;
            return `${opener7}\n\n${prog7}\n\n${char7}\n\n${rep7}`;
        }