let G = null;
        // collapse state
        const _collapsed = {};
        function isCollapsed(key, defaultVal) {
            if (_collapsed[key] === undefined) _collapsed[key] = defaultVal || false;
            return _collapsed[key];
        }
        function toggleCollapse(key, defaultVal) {
            _collapsed[key] = !isCollapsed(key, defaultVal);
        }
        function collapseToggleBtn(key, defaultVal, onToggle) {
            const collapsed = isCollapsed(key, defaultVal);
            const btn = h('button', {
                className: 'btn btn-xs btn-ghost',
                style: {
                    fontSize: '16px',
                    padding: '0 6px',
                    lineHeight: 1,
                    color: '#64748B',
                    transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s',
                },
                onClick: function (e) {
                    e.stopPropagation();
                    toggleCollapse(key, defaultVal);
                    if (onToggle) onToggle();
                    else render();
                },
            }, '▾');
            return btn;
        }

        let activeTab = 'dashboard';
        let rosterView = 'regular'; // regular or premier

        // dom helpers
        function h(tag, attrs, ...children) {
            const el = document.createElement(tag);
            if (attrs) {
                for (const [k, v] of Object.entries(attrs)) {
                    if (v == null) continue;
                    if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
                    else if (k.startsWith('on')) el.addEventListener(k.slice(2).toLowerCase(), v);
                    else if (k === 'className') el.className = v;
                    else if (k === 'disabled') el.disabled = !!v;
                    else if (k === 'checked') el.checked = !!v;
                    else if (k === 'value') el.value = v;
                    else if (k === 'placeholder') el.placeholder = v;
                    else if (k === 'type') el.type = v;
                    else if (k === 'rows') el.rows = v;
                    else if (k === 'maxLength') el.maxLength = v;
                    else if (k === 'htmlFor') el.htmlFor = v;
                    else el.setAttribute(k, v);
                }
            }
            for (const c of children.flat()) {
                if (c == null || c === false) continue;
                el.appendChild(typeof c === 'string' || typeof c === 'number'
                    ? document.createTextNode(String(c)) : c);
            }
            return el;
        }

        function badge(text, color) {
            color = color || '#64748B';
            return h('span', { className: 'badge', style: { color, borderColor: color + '55', background: color + '20' } }, text);
        }


        function mkBtn(text, cls, onClick, disabled) {
            return h('button', { className: `btn ${cls}`, onClick, disabled: !!disabled }, text);
        }

        function statBar(label, value, max, color) {
            max = max || 100; color = color || '#F59E0B';
            const pct = Math.min(100, Math.round((value / max) * 100));
            return h('div', { className: 'stat-bar' },
                h('div', { className: 'sb-row' },
                    h('span', { className: 'sb-lbl' }, label),
                    h('span', { className: 'sb-val' }, Math.round(value)),
                ),
                h('div', { className: 'sb-track' },
                    h('div', { className: 'sb-fill', style: { width: pct + '%', background: color, boxShadow: `0 0 6px ${color}60` } })
                )
            );
        }

        function cardTitle(text) { return h('div', { className: 'card-title' }, text); }
        function accent(color) { return h('div', { className: 'accent', style: { background: color } }); }

        function miniStatBox(label, value, color) {
            return h('div', { style: { background: '#060A10', borderRadius: '8px', padding: '12px', border: '1px solid #1E2433' } },
                h('div', { style: { fontSize: '12px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em' } }, label),
                h('div', { style: { fontSize: '22px', fontWeight: 900, color: color || '#E5E7EB', marginTop: '3px' } }, value),
            );
        }

        // persistence
        function saveGame() {
            if (!G) return;
            try {
                // Strip snapshots from all but the most recent race result — only
                // needed for undo and keeping them all costs ~2.5MB of save bloat
                var _lastResultSid = null, _lastResultIdx = -1, _lastResultTime = 0;
                Object.keys(G.schedules || {}).forEach(function(sid) {
                    (G.schedules[sid] || []).forEach(function(race, idx) {
                        if (race.result && race.result._submitTime && race.result._submitTime > _lastResultTime) {
                            _lastResultTime = race.result._submitTime;
                            _lastResultSid = sid;
                            _lastResultIdx = idx;
                        }
                    });
                });
                var _stripped = [];
                Object.keys(G.schedules || {}).forEach(function(sid) {
                    (G.schedules[sid] || []).forEach(function(race, idx) {
                        if (race.result && race.result._snapshot) {
                            if (sid === _lastResultSid && idx === _lastResultIdx) return;
                            _stripped.push({ sid: sid, idx: idx, snap: race.result._snapshot });
                            delete race.result._snapshot;
                        }
                    });
                });
                var data = JSON.stringify(G, function(_k, v) { return v === undefined ? null : v; });
                // Restore stripped snapshots so undo still works in current session
                _stripped.forEach(function(s) {
                    G.schedules[s.sid][s.idx].result._snapshot = s.snap;
                });
                localStorage.setItem('ft_save', data);
                // Electron: also persist to userData so saves survive temp folder clears
                if (typeof window._electronSave === 'function') window._electronSave(data);
                var kb = Math.round(data.length / 1024);
                if (kb > 7000) {
                    console.warn('[Save] Warning: save file is ' + kb + 'KB — approaching browser limit');
                    if (typeof showToast === 'function') showToast('⚠️ Save file is large (' + kb + 'KB). Consider starting a new career soon.');
                }
            } catch(e) {
                if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                    alert('⚠️ Save failed — browser storage is full.\n\nThe game will now trim old race data to free up space.');
                    trimSaveData();
                    try {
                        localStorage.setItem('ft_save', JSON.stringify(G, function(_k, v) { return v === undefined ? null : v; }));
                    } catch(e2) {
                        alert('❌ Save still failed after trimming. Export your save from Settings before closing the browser.');
                    }
                }
            }
        }

        function trimSaveData() {
            // strip old finish orders, they add up fast
            if (G.raceHistory) {
                G.raceHistory.forEach(function(rh) {
                    if (rh.season < G.season) {
                        delete rh.finishOrder;
                        delete rh.summary;
                    }
                });
            }
            // keep story journal under 100
            if (G.storyJournal && G.storyJournal.length > 100) {
                G.storyJournal = G.storyJournal.slice(-100);
            }
            // keep race history under 200
            if (G.raceHistory && G.raceHistory.length > 200) {
                G.raceHistory = G.raceHistory.slice(-200);
            }
            // snapshots are big, strip them once theyre not needed for undo
            if (G.schedules) {
                Object.values(G.schedules).forEach(function(sched) {
                    if (!Array.isArray(sched)) return;
                    sched.forEach(function(race) {
                        if (race.result && race.result._snapshot) delete race.result._snapshot;
                    });
                });
            }
        }
        function loadGame() {
            const raw = localStorage.getItem('ft_save');
            if (raw) {
                try {
                    G = JSON.parse(raw.replace(/:undefined([,}\]])/g, ':null$1'));
                     // clean out numeric or too-short driver names - old parser bug leftover
                    //    or too short — these are artefacts from the old parser that treated
                    //    position numbers as driver names.
                    if (G.drivers) {
                        G.drivers = G.drivers.filter(d => {
                            if (!d.name || d.name.trim().length < 3) return false;
                            if (/^\d+$/.test(d.name.trim())) return false;       // just a number
                            if (/^\d[\d\s]*$/.test(d.name.trim())) return false; // digits and spaces
                            return true;
                        });
                    }
                    // same for rivals
                    if (G.rivals) {
                        G.rivals = G.rivals.filter(r => {
                            if (!r.name || r.name.trim().length < 3) return false;
                            if (/^\d+$/.test(r.name.trim())) return false;
                            return true;
                        });
                    }
                    // and championship standings
                    if (G.seriesFields) {
                        Object.keys(G.seriesFields).forEach(sid => {
                            const field = G.seriesFields[sid];
                            Object.keys(field).forEach(name => {
                                if (/^\d+$/.test(name.trim()) || name.trim().length < 3) {
                                    delete field[name];
                                }
                            });
                        });
                    }
                    // drop contracts that are fully expired
                    if (G.contracts && G.schedules) {
                        G.contracts = G.contracts.filter(c => {
                            const sched = G.schedules[c.seriesId] || [];
                            const racesLeft = sched.filter(r => !r.result).length;
                            const seasonsLeft = (c.termSeasons || 1) - (c.seasonsCompleted || 0);
                            // keep if there are races or seasons left
                            return racesLeft > 0 || seasonsLeft > 0;
                        });
                    }
                    if (G.carCondition && G.carCondition.engine !== undefined) {
                        var oldCC = G.carCondition;
                        G.carCondition = {};
                        if (G.contracts && G.contracts.length) {
                            G.contracts.forEach(function (c) { G.carCondition[c.seriesId] = Object.assign({}, oldCC); });
                        }
                    }
                    if (!G.carCondition) G.carCondition = {};

                    if (!G.homeState) G.homeState = 'NC'; // old saves missing homeState
                    if (G.reservedCarNumber === undefined) G.reservedCarNumber = null;
                    if (!G.playerBio) G.playerBio = '';
                    if (!G.playerInjury) G.playerInjury = null;
                    // backfill homeState on drivers that dont have one - pasted drivers and old generated
                    if (G.drivers && typeof randomHomeState !== 'undefined') {
                        G.drivers.forEach(d => { if (!d.homeState) d.homeState = randomHomeState(); });
                    }
                    if (!G.carCondition.suspension) G.carCondition.suspension = 80;
                    if (!G.trackPools.invite) G.trackPools.invite = [];
                    if (G.drivers) {
                        var _lastNameMap = {};
                        G.drivers.forEach(function(d) {
                            if (!d.active) return;
                            var parts = d.name.replace(/\s+Jr\.?$|\s+Sr\.?$/i, '').trim().split(' ');
                            var last = parts[parts.length - 1];
                            if (last && last.length > 2) {
                                if (!_lastNameMap[last]) _lastNameMap[last] = [];
                                _lastNameMap[last].push(d);
                            }
                        });
                        Object.values(_lastNameMap).forEach(function(group) {
                            if (group.length < 2) return;
                            group.forEach(function(d) {
                                var _fStrip = d.name.replace(/\s+Jr\.?\s*$|\s+Sr\.?\s*$/i, '').trim().split(' ');
                                var _fLast = _fStrip[_fStrip.length - 1] || '';
                                if (_fLast.match(/^[A-Z]\.?$/) && _fStrip.length > 1) _fLast = _fStrip[_fStrip.length - 2];
                                d._familyName = _fLast || _fStrip[0] || '';
                                d._familyMembers = group.filter(function(x) { return x.name !== d.name; }).map(function(x) { return x.name; });
                                // Share home state
                                if (!d.homeState && group[0].homeState) d.homeState = group[0].homeState;
                            });
                            // Give them a shared home state if none has one
                            var sharedState = group.find(function(d) { return d.homeState; });
                            if (sharedState) group.forEach(function(d) { if (!d.homeState) d.homeState = sharedState.homeState; });
                        });
                    }
                    if (G.drivers) {
                        G.drivers.forEach(function(d) {
                            const s = getSeries(d.currentSeriesId);
                            if (s && s.tier <= 2) d.currentTeam = null;
                        });
                    }
                    if (G.contracts) {
                        G.contracts.forEach(function(c) {
                            const s = getSeries(c.seriesId);
                            if (s && s.tier <= 2) { c.team = 'Independent'; c.noContractRequired = true; }
                        });
                    }
                    if (!G.milestones) G.milestones = [];
                    if (!G.ownedCars) G.ownedCars = {};
                    if (!G.carVariantPref) G.carVariantPref = {};
                    if (!G.appCarsOwned) G.appCarsOwned = { mini_stock: true };
                    if (!G.appCarsOwned.mini_stock) G.appCarsOwned.mini_stock = true;
                    if (G.driverAlias === undefined) G.driverAlias = '';
                    if (!G.offseasonOffers) G.offseasonOffers = [];
                    if (G.offseasonPhase === undefined) G.offseasonPhase = false;
                    if (G.schedules && G.contracts) {
                        G.contracts.forEach(function(c) {
                            var s = getSeries(c.seriesId);
                            if (!s) return;
                            var maxLaps = s.tier === 1 ? 40 : s.tier === 2 ? 60 : 99999;
                            var sched = G.schedules[c.seriesId] || [];
                            sched.forEach(function(race) {
                                if (race.raceLaps && race.raceLaps % 5 !== 0) {
                                    race.raceLaps = Math.round(race.raceLaps / 5) * 5;
                                }
                                // Clamp non-premier, non-support races to tier max
                                if (!race.isPremier && !race.isSupportRace && race.raceLaps > maxLaps) {
                                    race.raceLaps = maxLaps;
                                }
                            });
                        });
                    }
                    
                    if (!G.sideContracts) G.sideContracts = [];
                    if (!G.sideSchedules) G.sideSchedules = {};
                    if (!G.sideFields) G.sideFields = {};
                    if (!G.sidePoints) G.sidePoints = {};
                    if (!G.pitEntries) G.pitEntries = [];
                    if (G.ownedTeam === undefined) G.ownedTeam = null;
                    if (G.tutorialDone === undefined) G.tutorialDone = true; // existing saves skip tutorial
                    // Seed drivers for any already-joined side series missing them
                    if (G.sideContracts && typeof seedSideSeriesDrivers !== 'undefined') {
                        G.sideContracts.forEach(function(sc) {
                            if (sc.season === G.season) seedSideSeriesDrivers(sc.seriesId);
                        });
                    }
                    
                    if (G.schedules) {
                        Object.values(G.schedules).forEach(function(sched) {
                            if (!Array.isArray(sched)) return;
                            sched.forEach(function(race) {
                                if (race.raceLaps && race.raceLaps % 5 !== 0) {
                                    race.raceLaps = Math.round(race.raceLaps / 5) * 5;
                                }
                            });
                        });
                    }
                    if (!G.seasonGoals) G.seasonGoals = [];
                    if (!G.goalHistory) G.goalHistory = [];
                    
                    G.seasonGoals = (G.seasonGoals || []).filter(function(g) { return g.target !== 'pole'; });
                    G.goalHistory = (G.goalHistory || []).filter(function(g) { return g.target !== 'pole'; });
                    if (!G.seasonHistory) G.seasonHistory = [];
                    if (G.seasonHistory) {
                        G.seasonHistory.forEach(function(sh) {
                            (sh.championships || []).forEach(function(c) {
                                if (c.wins === undefined) {
                                    c.wins = (G.raceHistory || []).filter(function(r) {
                                        return r.season === sh.season && r.seriesId === c.seriesId && r.pos === 1 && !r.dnf && !r.dq;
                                    }).length;
                                    c.pts = c.pts || 0;
                                }
                            });
                        });
                    }
                    if (G.confidence === undefined) G.confidence = 0;
                    if (G._preseasonSeen === undefined) G._preseasonSeen = 0;
                    if (!G.savedForOffseason) G.savedForOffseason = [];                   
                    if (G.drivers) {
                        G.drivers.forEach(function (d) {
                            if (!d.aiStats) {
                                d.aiStats = {
                                    relativeSkill: rand(30, 70),
                                    aggression: rand(20, 80),
                                    optimism: rand(30, 70),
                                    smoothness: rand(30, 70),
                                    age: rand(18, 45),
                                    pitCrewSkill: rand(30, 70),
                                    pittingRisk: rand(20, 60),
                                };
                            }
                            if (d.carNumber === undefined) d.carNumber = null;
                            if (d._carNumberSeniority === undefined) d._carNumberSeniority = d.starts || 0;
                        });
                    }

                    if (G.contracts) {
                        G.contracts.forEach(c => {
                            if (!c.indie && c.prizeShare === undefined) {
                                const s = SERIES.find(sr => sr.id === c.seriesId);
                                const tier = s ? s.tier : 1;
                                c.prizeShare = tier <= 3 ? 0.70 : 0.80;
                                c.entryFee = s ? s.fee : 250;
                            }
                        });
                    }
                    if (G.drivers && G.schedules) {
                        // Collect all names that appear in each series' result finishOrders
                        var nameToSeries = {}; // name -> Set of seriesIds they appeared in
                        Object.keys(G.schedules).forEach(function(sid) {
                            var sched = G.schedules[sid] || [];
                            sched.forEach(function(race) {
                                if (!race.result) return;
                                var fo = race.result.finishOrder || [];
                                fo.forEach(function(e) {
                                    if (!e.name || e.isPlayer) return;
                                    var n = e.name.toLowerCase();
                                    if (!nameToSeries[n]) nameToSeries[n] = [];
                                    if (!nameToSeries[n].includes(sid)) nameToSeries[n].push(sid);
                                });
                            });
                        });
                        // Any driver assigned to a higher series but who appeared in a lower series
                        // result should have their home series corrected to the lower one
                        G.drivers.forEach(function(d) {
                            if (!d.active && !d._guestEntry) return;
                            var n = d.name.toLowerCase();
                            var appearances = nameToSeries[n] || [];
                            if (appearances.length < 2) return; // only in one series, no conflict
                            // Find the lowest tier they appeared in
                            var lowestTier = 99;
                            var lowestSid = null;
                            appearances.forEach(function(sid) {
                                var s = getSeries(sid);
                                if (s && s.tier < lowestTier) { lowestTier = s.tier; lowestSid = sid; }
                            });
                            var curS = getSeries(d.currentSeriesId);
                            if (curS && lowestSid && curS.tier > lowestTier) {
                                // They appeared in a lower tier — that's their real home
                                d.currentSeriesId = lowestSid;
                                d.currentTeam = null;
                                d._guestEntry = true;
                            }
                        });
                        // Also fix pure _guestEntry drivers with wrong series
                        G.drivers.forEach(function(d) {
                            if (!d._guestEntry) return;
                            var s = getSeries(d.currentSeriesId);
                            if (!s) return;
                            var below = SERIES.find(function(ns) { return ns.tier === s.tier - 1 && !ns.isSideStep; });
                            if (below && !nameToSeries[d.name.toLowerCase()]) {
                                d.currentSeriesId = below.id;
                                d.currentTeam = null;
                            }
                        });
                    }

                    if (G.schedules && G.seriesFields !== undefined) {
                        Object.keys(G.schedules).forEach(function(sid) {
                            var sched = G.schedules[sid] || [];
                            if (!G.seriesFields[sid]) G.seriesFields[sid] = {};
                            var field = G.seriesFields[sid];
                            // Check if field has any non-zero points — if so, skip (already correct)
                            var hasPoints = Object.values(field).some(function(d) { return (d.points || 0) > 0; });
                            if (hasPoints) return;
                            // Rebuild from all simulated races that have a finishOrder
                            sched.forEach(function(race) {
                                if (!race.result || !race.result.simulated) return;
                                var fo = race.result.finishOrder || [];
                                if (!fo.length) return;
                                fo.forEach(function(entry, idx) {
                                    if (!entry.name || entry.isPlayer) return;
                                    var pts = entry.dnf ? 1 : (IRACING_PTS[idx] || 1);
                                    if (!field[entry.name]) field[entry.name] = { points: 0, wins: 0, top5s: 0, starts: 0 };
                                    field[entry.name].points += pts;
                                    field[entry.name].starts++;
                                    if (!entry.dnf && idx === 0) field[entry.name].wins++;
                                    if (!entry.dnf && idx < 5) field[entry.name].top5s++;
                                });
                            });
                        });
                    }

                    return true;
                } catch (e) { }
            }
            return false;
        }
        function exportSave() {
            const blob = new Blob([JSON.stringify(G, null, 2)], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `race-weekend-s${G.season}.json`;
            a.click();
        }
        function importSave(file) {
            const r = new FileReader();
            r.onload = e => { try { G = JSON.parse(e.target.result); saveGame(); showGame(); } catch (e) { alert('Invalid save file.'); } };
            r.readAsText(file);
        }

        // tabs
        const TABS = [
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'contracts', label: 'Contracts' },
            { id: 'paddock', label: 'Paddock' },
            { id: 'schedule', label: 'Schedule' },
            { id: 'roster', label: 'Roster' },
            { id: 'special', label: 'Special' },
            { id: 'rivals', label: 'Rivals' },
            { id: 'story', label: 'Story' },
            { id: 'sidequests', label: 'Pit Road' },
            { id: 'team', label: 'My Team' },
            { id: 'standings', label: 'Standings' },
            { id: 'business', label: 'Business' },
            { id: 'drivers', label: 'Drivers' },
            { id: 'log', label: 'Log' },
            { id: 'history', label: 'History' },
            { id: 'settings', label: 'Settings' },
        ];

        // badge counts
        function getTabBadge(id) {
            const _activeTier = (G.contracts || []).length
                ? Math.max(...(G.contracts || []).map(function(c) { return (getSeries(c.seriesId) && getSeries(c.seriesId).tier) || 1; }))
                : 0;
            if (id === 'contracts') return _activeTier <= 2 ? 0 : (G.pendingOffers || []).length + (G.offseasonOffers || []).length;
            if (id === 'paddock') return (G.dramaQueue || []).filter(d => d.effect !== 'money' && d.effect !== 'sponsor_warning' && !d._isFanMail && !d._isSponsor).length;
            if (id === 'business') return (G.sponsorOffers || []).length + (G.dramaQueue || []).filter(function(d) { return d.effect === 'money' || d.effect === 'sponsor_warning' || d._isFanMail || d._isSponsor; }).length;
            return 0;
        }

        function setTab(id) { activeTab = id; render(); }

        // sidebar
        function renderSidebar() {
            // Header
            const sh = $('sidebar-header');
            sh.innerHTML = '';
            sh.appendChild(frag(
                h('div', { className: 'sb-logo' }, 'RACE WEEKEND'),
                h('div', { className: 'sb-version' }, APP_VERSION + ' · iRacing Career RPG'),
            ));

            // Stats
            const ss = $('sidebar-stats');
            ss.innerHTML = '';
            const s = G.contracts.length ? getSeries(G.contracts[0].seriesId) : null;
            ss.appendChild(frag(
                h('div', { className: 'sb-driver-name' }, G.driverAlias || G.driverName),
                h('div', { className: 'sb-stat-row' },
                    h('span', { className: 'sb-stat-label' }, 'Season'),
                    h('span', { className: 'sb-stat-value' }, 'S' + G.season + ' W' + G.week),
                ),
                h('div', { className: 'sb-stat-row' },
                    h('span', { className: 'sb-stat-label' }, 'Money'),
                    h('span', { className: 'sb-stat-value money' }, fmtMoney(G.money)),
                ),
                h('div', { className: 'sb-stat-row' },
                    h('span', { className: 'sb-stat-label' }, 'Fans'),
                    h('span', { className: 'sb-stat-value fans' }, fmtFans(G.fans)),
                ),
                h('div', { className: 'sb-stat-row' },
                    h('span', { className: 'sb-stat-label' }, 'Rep'),
                    h('span', { className: 'sb-stat-value rep' }, G.reputation),
                ),
                s ? h('div', { className: 'sb-stat-row' },
                    h('span', { className: 'sb-stat-label' }, 'Series'),
                    h('span', { className: 'sb-stat-value', style: { color: s.color, fontSize: '14px' } }, s.short),
                ) : null,
            ));

            // Nav
            const sn = $('sidebar-nav');
            sn.innerHTML = '';

            const sections = [
                { label: 'Racing', items: ['dashboard', 'schedule', 'standings', 'roster'] },
                { label: 'Career', items: ['contracts', 'business', 'paddock', 'special', 'team'] },
                { label: 'People', items: ['rivals', 'drivers'] },
                { label: 'Pit Road', items: ['sidequests'] },
                { label: 'Records', items: ['story', 'history', 'log'] },
                { label: 'System', items: ['settings'] },
            ];

            const icons = {
                dashboard: '⚡', schedule: '📅', standings: '🏆', roster: '👥',
                contracts: '📋', business: '💰', paddock: '📻', special: '⭐',
               rivals: '🔥', drivers: '🧑', story: '📓', history: '📖', log: '📝', settings: '⚙️', sidequests: '🎯', team: '🏚️',
            };

            sections.forEach(function(sec) {
                sn.appendChild(h('div', { className: 'nav-section-label' }, sec.label));
                sec.items.forEach(function(id) {
                    const tab = TABS.find(t => t.id === id);
                    if (!tab) return;
                    const bc = getTabBadge(id);
                    sn.appendChild(h('div', {
                        className: 'nav-item' + (activeTab === id ? ' active' : ''),
                        onClick: () => setTab(id),
                    },
                        h('span', { className: 'nav-icon' }, icons[id] || '•'),
                        tab.label,
                        bc > 0 ? h('span', { className: 'nav-badge' + (id === 'paddock' ? ' alert' : '') }, bc) : null,
                    ));
                });
            });
        }

        // main header
        function renderMainHeader() {
            const mh = $('main-header');
            if (!mh) return;
            mh.innerHTML = '';

            // Series points / next race info
            const contract = G.contracts[0];
            const s = contract ? getSeries(contract.seriesId) : null;
            const sched = contract ? (G.schedules[contract.seriesId] || []) : [];
            const nextRaceIdx = sched.findIndex(r => !r.result);
            const nextRace = nextRaceIdx >= 0 ? sched[nextRaceIdx] : null;
            const pts = contract ? (G.championshipPoints[contract.seriesId] || 0) : 0;

            const sections = [];

            if (s) {
                sections.push(h('div', { className: 'mh-section' },
                    h('div', null,
                        h('div', { className: 'mh-label' }, s.short + ' Points'),
                        h('div', { className: 'mh-value', style: { color: s.color } }, pts),
                    )
                ));
            }

            if (nextRace) {
                sections.push(h('div', { className: 'mh-section' },
                    h('div', null,
                        h('div', { className: 'mh-label' }, 'Next Race'),
                        h('div', { className: 'mh-value', style: { fontSize: '16px', fontFamily: 'inherit' } }, nextRace.track),
                    )
                ));
                sections.push(h('div', { className: 'mh-section' },
                    h('div', null,
                        h('div', { className: 'mh-label' }, 'Round'),
                        h('div', { className: 'mh-value' }, 'R' + (nextRaceIdx + 1) + '/' + sched.length),
                    )
                ));
            }

            // Wins / Top 5s — split into two cells so they line up with the others
            sections.push(h('div', { className: 'mh-section' },
                h('div', null,
                    h('div', { className: 'mh-label' }, 'Wins'),
                    h('div', { className: 'mh-value', style: { color: '#F59E0B' } }, G.wins),
                )
            ));
            sections.push(h('div', { className: 'mh-section' },
                h('div', null,
                    h('div', { className: 'mh-label' }, 'Top 5s'),
                    h('div', { className: 'mh-value', style: { color: '#10B981' } }, G.top5s),
                )
            ));
            // Season starts
            sections.push(h('div', { className: 'mh-section' },
                h('div', null,
                    h('div', { className: 'mh-label' }, 'Starts'),
                    h('div', { className: 'mh-value' }, G.starts),
                )
            ));

            // Confidence if active
            if (G.confidence && G.confidence !== 0) {
                const confLabel = G.confidence >= 3 ? '🔥 On Fire' : G.confidence >= 2 ? '📈 Hot' : G.confidence >= 1 ? '✅ Good' : G.confidence <= -2 ? '❄️ Cold' : '📉 Off';
                const confColor = G.confidence > 0 ? '#7ED4A0' : '#FF8070';
                sections.push(h('div', { className: 'mh-section' },
                    h('div', null,
                        h('div', { className: 'mh-label' }, 'Form'),
                        h('div', { className: 'mh-value', style: { color: confColor, fontSize: '15px', fontFamily: 'inherit' } }, confLabel),
                    )
                ));
            }

            // Bridge status in header — only in Electron, click to toggle on/off
            if (typeof window !== 'undefined' && window.electronBridge && !window._noBridge) {
                var _isRunning = _sdkStatus && _sdkStatus.checked && !_sdkStatus.error;
                var _isConnected = _sdkStatus && _sdkStatus.connected;
                var _bColor = !_isRunning ? '#EF4444' : _isConnected ? '#10B981' : '#F59E0B';
                var _bIcon = !_isRunning ? '🔴' : _isConnected ? '🟢' : '🟡';
                var _bText = !_isRunning ? 'Bridge offline' : _isConnected ? (_sdkStatus.track || 'iRacing connected') : 'Bridge running';
                var _bridgeEnabled = !!(G.settings && G.settings.bridgeEnabled !== false);
                sections.push(h('div', {
                    className: 'mh-section',
                    style: { cursor: 'pointer', userSelect: 'none' },
                    onClick: function() {
                        if (!G.settings) G.settings = {};
                        G.settings.bridgeEnabled = !_bridgeEnabled;
                        if (window.electronBridge) {
                            window.electronBridge.setBridgeEnabled(G.settings.bridgeEnabled);
                        }
                        saveGame();
                        render();
                    }
                },
                    h('div', null,
                        h('div', { className: 'mh-label' }, '🔌 Bridge'),
                        h('div', { className: 'mh-value', style: { color: _bridgeEnabled ? _bColor : '#475569', fontSize: '13px' } },
                            _bridgeEnabled ? (_bIcon + ' ' + _bText) : '⭕ Bridge disabled'
                        ),
                    )
                ));
            }

            sections.forEach(s => mh.appendChild(s));
        }

        // main render
        function render() { renderSidebar(); renderMainHeader(); renderContent(); }

        function renderContent() {
            const c = $('content'); c.innerHTML = '';
            const page = h('div', { className: 'page' });
            const map = { dashboard: renderDashboard, contracts: renderContracts, paddock: renderPaddock, schedule: renderSchedule, roster: renderRoster, special: renderSpecial, rivals: renderRivals, story: renderStory, standings: renderStandings, business: renderBusiness, drivers: renderDrivers, log: renderLog, history: renderHistory, settings: renderSettings, sidequests: renderSideQuests, team: renderTeam };
            if (map[activeTab]) page.appendChild(map[activeTab]());
            c.appendChild(page);
        }