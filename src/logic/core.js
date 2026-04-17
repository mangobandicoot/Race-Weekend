       // utilities
        const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
        const randF = (a, b) => Math.random() * (b - a) + a;
        const shuffle = a => [...a].sort(() => Math.random() - 0.5);
        const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
        const uid = () => (function() { var h=''; for(var i=0;i<32;i++) h+=Math.floor(Math.random()*16).toString(16); return h.slice(0,8)+'-'+h.slice(8,12)+'-4'+h.slice(13,16)+'-'+(Math.floor(Math.random()*4)+8).toString(16)+h.slice(17,20)+'-'+h.slice(20,32); })();

        function getCarCondition(state, seriesId) {
            if (!state.carCondition) state.carCondition = {};
            if (!state.carCondition[seriesId]) {
                state.carCondition[seriesId] = { engine: 100, suspension: 100, chassis: 100, tires: 100, brakes: 100 };
            }
            return state.carCondition[seriesId];
        }

        function _notifyRosterChange(state, driver, direction, toSeriesId, replacedBy) {
            const toS = getSeries(toSeriesId);
            const arrow = direction === 'promoted' ? '📈' : '📉';
            const verb = direction === 'promoted' ? 'promoted to' : 'dropped to';
            state.dramaQueue.push({
                id: 'roster_' + uid(),
                title: arrow + ' Roster Change — ' + driver.name,
                effect: 'none',
                desc: driver.name + ' has been ' + verb + ' ' + (toS && toS.name || toSeriesId) + '. Update your iRacing roster before racing.' +
                    (replacedBy ? ' Replaced by: ' + replacedBy + '.' : ''),
                valence: 'neutral',
                _requiresAction: true,
                _actionLabel: 'Roster Updated in iRacing',
                _isPaddock: true,
            });
        }

        function fmtMoney(n) {
            n = Math.round(n || 0);
            if (n >= 1000000) return `$${(n / 1000000).toFixed(2)}M`;
            if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
            return `$${n}`;
        }
        function getDisplayName(state) {
            return (state && state.driverAlias) ? state.driverAlias : (state && state.driverName) || '';
        }

        function getLastName(fullName) {
            if (!fullName) return '';
            var stripped = fullName.replace(/\s+Jr\.?\s*$|\s+Sr\.?\s*$/i, '').trim();
            var parts = stripped.split(' ');
            // skip single letter middle initials at the end
            var last = parts[parts.length - 1];
            if (last && last.match(/^[A-Z]\.?$/) && parts.length > 1) {
                last = parts[parts.length - 2];
            }
            return last || '';
        }

        function getRepTier(rep) {
            if (rep >= 280) return { label: 'Legend', color: '#F59E0B', icon: '🏆' };
            if (rep >= 200) return { label: 'Household Name', color: '#EC4899', icon: '⭐' };
            if (rep >= 130) return { label: 'National Contender', color: '#8B5CF6', icon: '📺' };
            if (rep >= 70) return { label: 'Regional Threat', color: '#3B82F6', icon: '🔥' };
            if (rep >= 30) return { label: 'Local Hero', color: '#10B981', icon: '🏁' };
            return { label: 'Unknown', color: '#94A3B8', icon: '👤' };
        }
        function fmtFans(n) {
            n = Math.round(n || 0);
            if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
            if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
            return String(n);
        }
        function ordinal(n) {
            const s = ['th', 'st', 'nd', 'rd'], v = n % 100;
            return n + (s[(v - 20) % 10] || s[v] || s[0]);
        }

        // schedule generation
        function getRaceDay(seriesId, isNight) {
            var dayMap = {
                nascar_cup:       isNight ? 'Saturday' : 'Sunday',
                nascar_xfinity:   isNight ? 'Friday'   : 'Saturday',
                nascar_trucks:    isNight ? 'Thursday' : 'Friday',
                arca_menards:     isNight ? 'Friday'   : 'Saturday',
                late_model_stock: isNight ? 'Friday'   : 'Saturday',
                super_late_model: isNight ? 'Friday'   : 'Saturday',
                street_stock:     isNight ? 'Saturday' : 'Saturday',
                mini_stock:       isNight ? 'Saturday' : 'Saturday',
            };
            return dayMap[seriesId] || (isNight ? 'Saturday' : 'Saturday');
        }

        function generateSchedule(seriesId, trackPools) {
            const s = getSeries(seriesId);
            const tier = s ? s.tier : 1;

            const _tp = (typeof G !== 'undefined' && G && G.trackPools) ? G.trackPools : (trackPools || {});
            const userFree = (_tp.free && _tp.free.length > 0) ? _tp.free : null;
            const userPaid = (_tp.paid && _tp.paid.length > 0) ? _tp.paid : null;

            let pool;
            let fixedOrder = false;

            // Merge paid tracks into the pool for tiers 1-3.
            // Paid tracks get at least one guaranteed appearance.
            // Regional weighting still applies — home region tracks appear more.
            function mergePaidTracks(basePool, paid) {
                if (!paid || !paid.length) return basePool;
                var baseNames = new Set(basePool.map(function(t) { return t.name; }));
                var allKnown = (SERIES_TRACKS.local || []).concat(SERIES_TRACKS.regional || []);
                var newPaid = paid.filter(function(t) { return !baseNames.has(t.name); }).map(function(t) {
                    // fill in missing track data from the master list
                    var full = allKnown.find(function(k) { return k.name === t.name; });
                    return full ? full : t;
                }).filter(function(t) { return t.city && t.state; }); // drop anything still missing city/state
                return basePool.concat(newPaid);
            }

            if (s && s.isSideStep) {
                // side series have their own pools
                pool = (typeof SIDE_TRACKS !== 'undefined' && SIDE_TRACKS[seriesId]) || SERIES_TRACKS.local;
            } else if (tier <= 2) {
                var _base = userFree || SERIES_TRACKS.local;
                pool = mergePaidTracks(_base, userPaid);
            } else if (tier === 3) {
                pool = mergePaidTracks(SERIES_TRACKS.regional, userPaid);
            } else if (tier === 4) {
                // arca uses national pool
                pool = userPaid || SERIES_TRACKS.national;
            } else if (tier === 5) {
                // trucks fixed order
                pool = SERIES_TRACKS.trucks || SERIES_TRACKS.national;
                fixedOrder = true;
            } else if (tier === 6) {
                // xfinity fixed order
                pool = SERIES_TRACKS.xfinity || SERIES_TRACKS.cup;
                fixedOrder = true;
            } else {
                // cup fixed order
                pool = SERIES_TRACKS.cup;
                fixedOrder = true;
            }

            const rest = pool.filter(function (t) { return !t.fig8; });
            const mainCount = s.races;

            // home region gets 4x weight
            const playerHomeState = (typeof G !== 'undefined' && G) ? G.homeState : null;
            const contract = (typeof G !== 'undefined' && G && G.contracts) ? G.contracts.find(function (c) { return c.seriesId === seriesId; }) : null;
            const teamHomeState = contract ? (TEAM_HOME_STATES[contract.team] || null) : null;

            // weighted pool - home 4x, team home 2x, rest 1x
            const weightedPool = [];
            rest.forEach(function (t) {
                // premier tracks go in once, no regional weight or they dominate
                if (t.premierName) { weightedPool.push(t); return; }
                const isPlayerHome = playerHomeState && isSameRegion(t.state, playerHomeState);
                const isTeamHome = teamHomeState && isSameRegion(t.state, teamHomeState);
                const weight = isPlayerHome ? 4 : isTeamHome ? 2 : 1;
                for (let w = 0; w < weight; w++) weightedPool.push(t);
            });

            let picks = [];

            if (fixedOrder) {
                // fixed schedule - use in order, trim or repeat as needed
                const orderedTracks = pool.filter(function(t) { return !t.fig8; });
                for (let i = 0; i < mainCount; i++) {
                    picks.push(orderedTracks[i % orderedTracks.length]);
                }
            } else if (s && s.isSideStep && seriesId === 'legends') {
                // legends needs 3-4 road courses or its just ovals
                var _rc = shuffle(pool.filter(function(t) { return t.roadCourse; }));
                var _ov = shuffle(pool.filter(function(t) { return !t.roadCourse; }));
                var _rcCount = Math.min(4, _rc.length);
                for (var _ri = 0; _ri < _rcCount && picks.length < mainCount; _ri++) picks.push(_rc[_ri]);
                for (var _oi = 0; _oi < _ov.length && picks.length < mainCount; _oi++) picks.push(_ov[_oi]);
                while (picks.length < mainCount) pool.forEach(function(t) { if (picks.length < mainCount) picks.push(t); });
                picks = shuffle(picks);
            } else {
                const shuffled = shuffle(weightedPool);
                const usedNames = {};

                // paid tracks get at least one slot each
                var guaranteedPaid = [];
                if (userPaid && userPaid.length && tier <= 3) {
                    userPaid.forEach(function(pt) {
                        if (picks.length < mainCount) {
                            picks.push(pt);
                            usedNames[pt.name] = 1;
                            guaranteedPaid.push(pt.name);
                        }
                    });
                }

                // Fill remaining slots from weighted pool
                for (let i = 0; i < shuffled.length && picks.length < mainCount; i++) {
                    const t = shuffled[i];
                    const count = usedNames[t.name] || 0;
                    const maxRepeats = tier <= 2 ? 2 : 2;
                    if (count < maxRepeats) {
                        picks.push(t);
                        usedNames[t.name] = count + 1;
                    }
                }

                // Backfill if not enough unique picks
                while (picks.length < mainCount) {
                    rest.forEach(function(t) {
                        if (picks.length < mainCount) picks.push(t);
                    });
                }

                // Shuffle picks so guaranteed paid tracks don't always appear first
                if (guaranteedPaid.length) picks = shuffle(picks);
            }

            // Determine premier event — one per season, rotates so same track doesn't repeat
            // Premier events are placed at their fixed canonical week if defined.
            let premierIdx = -1;
            if (tier <= 3) {
                const lastPremierTrack = (_tp._lastPremierTrack && _tp._lastPremierTrack[seriesId]) || null;
                let bestIdx = -1;
                let bestScore = -1;
                var _excludePremiers = (_tp._excludePremierTracks) || [];
                picks.forEach(function(t, i) {
                    if (!t.premierName) return;
                    // No home region weighting for premiers — pick from full pool equally
                    const isRepeat = t.name === lastPremierTrack;
                    const isExcluded = _excludePremiers.indexOf(t.name) >= 0;
                    const score = (isRepeat ? -20 : 0) + (isExcluded ? -50 : 0) + Math.random() * 20;
                    if (score > bestScore) { bestScore = score; bestIdx = i; }
                });
                if (bestIdx >= 0) {
                    // Use fixed week if defined, otherwise place in second half
                    var _premierTrackName = picks[bestIdx].name;
                    var _targetIdx = Math.max(bestIdx, Math.floor(mainCount * 0.6));
                    // Swap premier track to target position
                    const tmp = picks[_targetIdx];
                    picks[_targetIdx] = picks[bestIdx];
                    picks[bestIdx] = tmp;
                    premierIdx = _targetIdx;
                    // Record which track was picked so next season rotates away
                    if (!_tp._lastPremierTrack) _tp._lastPremierTrack = {};
                    _tp._lastPremierTrack[seriesId] = picks[premierIdx].name;
                }
            }

            // Add weather conditions per race
            const WEATHER_OPTIONS = {
                'hot': ['clear', 'clear', 'clear', 'hot_dry'],
                'humid': ['clear', 'clear', 'humid', 'overcast'],
                'cool': ['clear', 'clear', 'cool_damp', 'overcast'],
                'mild': ['clear', 'clear', 'clear', 'overcast'],
            };

            var premierTrackName = premierIdx >= 0 && picks[premierIdx] ? picks[premierIdx].name : null;
            var _premierFixedWeek = null;

            return picks.map(function (t, i) {
                const isPremier = (i === premierIdx);
                // Support race: same track as premier OR same track appearing in PREMIER_FIXED_WEEKS
                // for another series this same week — marks it as a cross-series support race
                const isSupportRace = !isPremier && premierTrackName && t.name === premierTrackName;
                const weatherPool = WEATHER_OPTIONS[t.weather || 'mild'] || ['clear'];
                const condition = weatherPool[rand(0, weatherPool.length - 1)];

                var _schedWeek = i + 1;                return {
                    round: i + 1,
                    week: _schedWeek,
                    track: t.name,
                    city: t.city,
                    state: t.state,
                    fig8: false,
                    night: !!t.night,
                    raceDay: getRaceDay(seriesId, !!t.night),
                    condition: condition,
                    qualifying: null,
                    result: null,
                    bonusResult: null,
                    isPremier: isPremier,
                    isSupportRace: !!isSupportRace,
                    premierName: isPremier ? (tier <= 2 ? (t.premierNameT1 || t.premierName || 'Season Invitational') : (t.premierName || 'Season Invitational')) : null,
                    premierLaps: isPremier ? (tier <= 1 ? (t.premierLapsT1 || 75) : (t.premierLaps || 150)) : null,
                    // Normal race laps vary slightly each week for realism — same track, different night
                    // Support races (same track as premier, same weekend) get 10-15 extra laps
                    raceLaps: (function() {
                        // Cup: real NASCAR lap counts by track
                        var cupLaps = {
                            'Daytona International Speedway': t.night ? 160 : 200,
                            'Las Vegas Motor Speedway': 267,
                            'Phoenix Raceway': 312,
                            'Atlanta Motor Speedway': 260,
                            'Bristol Motor Speedway': 500,
                            'Circuit of the Americas': 68,
                            'Richmond Raceway': 400,
                            'Talladega Superspeedway': 188,
                            'Dover Motor Speedway': 400,
                            'Darlington Raceway': t.night ? 367 : 293,
                            'Charlotte Motor Speedway': 400,
                            'Charlotte Motor Speedway Roval': 109,
                            'Sonoma Raceway': 90,
                            'Iowa Speedway - Oval - 2011': 250,
                            'Chicago Street Course': 100,
                            'New Hampshire Motor Speedway': 301,
                            'Pocono Raceway': 140,
                            'Indianapolis Motor Speedway': 200,
                            'Michigan International Speedway': 200,
                            'Watkins Glen International': 90,
                            'Kansas Speedway': 267,
                            'Texas Motor Speedway': 334,
                            'Gateway Motorsports Park': 240,
                            'Martinsville Speedway': 500,
                            'North Wilkesboro Speedway': 400,
                            'Homestead-Miami Speedway': 267,
                            'Nashville Superspeedway': 300,
                        };
                        var laps;
                        var truckLaps = {
                            'Daytona International Speedway': 100,
                            'Las Vegas Motor Speedway': 150,
                            'Atlanta Motor Speedway': 130,
                            'Phoenix Raceway': 150,
                            'Bristol Motor Speedway': 200,
                            'Martinsville Speedway': 200,
                            'Charlotte Motor Speedway': 200,
                            'Iowa Speedway - Oval - 2011': 200,
                            'Gateway Motorsports Park': 200,
                            'Pocono Raceway': 60,
                            'Michigan International Speedway': 100,
                            'Indianapolis Motor Speedway': 65,
                            'Richmond Raceway': 250,
                            'Darlington Raceway': 147,
                            'Kansas Speedway': 167,
                            'Talladega Superspeedway': 94,
                            'North Wilkesboro Speedway': 200,
                            'New Hampshire Motor Speedway': 200,
                            'Texas Motor Speedway': 167,
                            'Dover Motor Speedway': 200,
                            'Homestead-Miami Speedway': 167,
                        };
                        var xfinityLaps = {
                            'Daytona International Speedway': 120,
                            'Las Vegas Motor Speedway': 200,
                            'Phoenix Raceway': 200,
                            'Atlanta Motor Speedway': 163,
                            'Bristol Motor Speedway': 300,
                            'Richmond Raceway': 250,
                            'Talladega Superspeedway': 113,
                            'Dover Motor Speedway': 200,
                            'Darlington Raceway': 147,
                            'Charlotte Motor Speedway': 200,
                            'Iowa Speedway - Oval - 2011': 200,
                            'Gateway Motorsports Park': 160,
                            'New Hampshire Motor Speedway': 200,
                            'Pocono Raceway': 80,
                            'Indianapolis Motor Speedway': 65,
                            'Michigan International Speedway': 125,
                            'Kansas Speedway': 200,
                            'Watkins Glen International': 82,
                            'North Wilkesboro Speedway': 200,
                            'Texas Motor Speedway': 200,
                            'Nashville Superspeedway': 188,
                            'Martinsville Speedway': 300,
                            'Homestead-Miami Speedway': 200,
                        };
                        var arcaLaps = {
                            'Daytona International Speedway': 100,
                            'Las Vegas Motor Speedway': 100,
                            'Phoenix Raceway': 150,
                            'Atlanta Motor Speedway': 100,
                            'Bristol Motor Speedway': 150,
                            'Richmond Raceway': 150,
                            'Charlotte Motor Speedway': 150,
                            'Iowa Speedway - Oval - 2011': 150,
                            'Pocono Raceway': 100,
                            'Michigan International Speedway': 100,
                            'New Hampshire Motor Speedway': 150,
                            'Indianapolis Motor Speedway': 100,
                            'Gateway Motorsports Park': 150,
                            'Darlington Raceway': 150,
                            'Kansas Speedway': 150,
                            'Talladega Superspeedway': 100,
                            'Texas Motor Speedway': 150,
                            'Martinsville Speedway': 200,
                            'Dover Motor Speedway': 150,
                            'Homestead-Miami Speedway': 150,
                            'North Wilkesboro Speedway': 150,
                            'Nashville Superspeedway': 150,
                            'Auto Club Speedway': 150,
                            'Kentucky Speedway': 150,
                            'Rockingham Speedway': 150,
                        };
                        if (tier === 7 && cupLaps[t.name]) {
                            laps = cupLaps[t.name];
                        } else if (tier === 5 && truckLaps[t.name]) {
                            laps = truckLaps[t.name];
                        } else if (tier === 6 && xfinityLaps[t.name]) {
                            laps = xfinityLaps[t.name];
                        } else if (tier === 4 && arcaLaps[t.name]) {
                            laps = arcaLaps[t.name];
                        } else {
                            var pools = { 1:[25,30,30,35,40,40,50], 2:[40,50,50,60,60,75,75], 3:[75,100,100,125,125,150], 4:[100,125,150,150,200], 5:[150,200,200,250,250], 6:[200,250,300,400,500], 7:[250,300,400,500,500,600] };
                            var slmPool = [75,100,100,125,150,200];
                            var pool = (seriesId === 'super_late_model') ? slmPool : (pools[tier] || pools[1]);
                            laps = pool[Math.floor(Math.random() * pool.length)];
                        }
                        if (isSupportRace) laps = Math.max(15, Math.round(laps * 0.6 / 5) * 5);
                        // Premier races use their defined lap count, capped by tier
                        if (isPremier) {
                            var _pLaps = tier <= 1 ? (t.premierLapsT1 || 75) : (t.premierLaps || laps);
                            laps = _pLaps;
                        }
                        return laps;
                    })(),
                };
            });
        }