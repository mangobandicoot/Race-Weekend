// settings
        function renderSettings() {
            const f = document.createDocumentFragment();
            f.appendChild(h('div', { className: 'page-title' }, 'Settings'));

            // iRacing bridge panel — only show in Electron
            if (typeof window !== 'undefined' && window.electronBridge) {
                f.appendChild(renderSdkPanel());
            }

            // driver profile + career info side by side
            const bioIn = h('textarea', { rows: 2, placeholder: 'Short bio or notes (optional)...', style: { width: '100%', marginTop: '6px' } });
            bioIn.value = G.playerBio || '';
            const countrySel = h('select', { style: { width: '100%', marginTop: '6px', marginBottom: '8px' } });
            ['United States', 'Canada', 'Mexico', 'International'].forEach(function(country) {
                const opt = h('option', { value: country }, country);
                const currentCountry = G.homeState && G.homeState.startsWith('CA_') ? 'Canada' 
                    : G.homeState && G.homeState.startsWith('MX_') ? 'Mexico'
                    : G.homeState && G.homeState.startsWith('INTL_') ? 'International'
                    : 'United States';
                if (country === currentCountry) opt.selected = true;
                countrySel.appendChild(opt);
            });
            
            const stateSel = h('select', { style: { width: '100%', marginTop: '6px' } });
            
            function updateStateSelector() {
                stateSel.innerHTML = '';
                const selectedCountry = countrySel.value;
                let opts = [];
                
                if (selectedCountry === 'Canada') {
                    opts = typeof CANADIAN_PROVINCES !== 'undefined' ? Object.keys(CANADIAN_PROVINCES).map(function(code) { return { code: 'CA_' + code, name: CANADIAN_PROVINCES[code] }; }) : [];
                } else if (selectedCountry === 'Mexico') {
                    opts = typeof MEXICAN_STATES !== 'undefined' ? Object.keys(MEXICAN_STATES).map(function(code) { return { code: 'MX_' + code, name: MEXICAN_STATES[code] }; }) : [];
                } else if (selectedCountry === 'International') {
                    var regions = { Europe: 'Europe', CentralAmerica: 'Central America', SouthAmerica: 'South America', Africa: 'Africa', AsiaPacific: 'Asia-Pacific', Australia: 'Australia' };
                    opts = Object.keys(regions).map(function(code) { return { code: 'INTL_' + code, name: regions[code] }; });
                } else {
                    var us = (typeof US_STATES !== 'undefined' ? US_STATES : ['ME', 'NC', 'VA', 'TN', 'GA', 'SC', 'FL', 'TX', 'OH', 'IN', 'KY', 'WI', 'IL', 'PA', 'MI']);
                    opts = us.map(function(st) { return { code: st, name: (typeof US_STATE_NAMES !== 'undefined' ? US_STATE_NAMES[st] : null) || st }; });
                }
                
                opts.forEach(function(opt) {
                    var optEl = h('option', { value: opt.code }, opt.name);
                    if (opt.code === (G.homeState || 'ME')) optEl.selected = true;
                    stateSel.appendChild(optEl);
                });
            }
            
            countrySel.addEventListener('change', updateStateSelector);
            updateStateSelector();
            const saveBtn = mkBtn('Save Profile', 'btn btn-sm btn-primary', () => {
                G.homeState = stateSel.value;
                G.playerBio = bioIn.value.trim();
                saveGame();
                const orig = saveBtn.textContent;
                saveBtn.textContent = '✓ Saved';
                saveBtn.disabled = true;
                saveBtn.style.background = '#065F46';
                saveBtn.style.color = '#6EE7B7';
                setTimeout(() => {
                    saveBtn.textContent = orig;
                    saveBtn.disabled = false;
                    saveBtn.style.background = '';
                    saveBtn.style.color = '';
                    render();
                }, 1800);
            });

            f.appendChild(h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' } },
                h('div', { className: 'card' },
                    cardTitle('Driver Profile'),
                    h('div', { style: { fontSize: '13px', color: '#94A3B8', marginBottom: '6px' } },
                        G.driverName, h('span', { style: { color: '#475569', marginLeft: '6px' } }, '— name locked')
                    ),
                    h('label', { className: 'modal-label', style: { marginTop: '8px', display: 'block' } }, 'Home Country'),
                    countrySel,
                    h('label', { className: 'modal-label', style: { marginTop: '8px', display: 'block' } }, 'Home State / Province'),
                    stateSel,
                    h('label', { className: 'modal-label', style: { marginTop: '8px', display: 'block' } }, 'Broadcast Name (optional)'),
                    (function() {
                        var aliasIn = h('input', { type: 'text', placeholder: 'e.g. "The Rocket" or a nickname...', style: { width: '100%', marginTop: '4px' } });
                        aliasIn.value = G.driverAlias || '';
                        aliasIn.addEventListener('change', function() {
                            G.driverAlias = aliasIn.value.trim();
                            saveGame();
                        });
                        return aliasIn;
                    })(),
                    h('div', { style: { fontSize: '12px', color: '#64748B', marginTop: '3px' } }, 'Shows in paddock drama and race reports alongside your real name.'),
                    h('label', { className: 'modal-label', style: { marginTop: '8px', display: 'block' } }, 'Bio / Notes'),
                    bioIn,
                    h('label', { className: 'modal-label', style: { marginTop: '8px', display: 'block' } }, 'Reserved Car Number'),
                    (function() {
                        var numIn = h('input', { type: 'text', placeholder: 'e.g. 24 — no AI will use this number', style: { width: '100%', marginTop: '4px' } });
                        numIn.value = G.reservedCarNumber || '';
                        numIn.addEventListener('change', function() {
                            var val = numIn.value.trim();
                            G.reservedCarNumber = val || null;
                            saveGame();
                        });
                        return numIn;
                    })(),
                    h('div', { style: { fontSize: '12px', color: '#64748B', marginTop: '3px' } }, 'Blocks this number across all series. Leave blank to use none.'),
                    h('div', { style: { marginTop: '10px' } }, saveBtn),
                ),
                h('div', { className: 'card' },
                    cardTitle('Career Info'),
                    h('div', { style: { fontSize: '13px', color: '#94A3B8', lineHeight: '2.0' } },
                        `Season ${G.season} · Week ${G.week}`, h('br'),
                        `Starts: ${G.starts}`, h('br'),
                        `Wins: ${G.wins} · Top 5s: ${G.top5s}`, h('br'),
                        `Known drivers: ${(G.drivers || []).filter(d => d.source === 'known').length}`, h('br'),
                        `Total in database: ${(G.drivers || []).length}`, h('br'),
                        `Race history: ${(G.raceHistory || []).length} entries`, h('br'),
                        `Rivals tracked: ${(G.rivals || []).length}`, h('br'),
                        `Log entries: ${(G.log || []).length}`,
                    )
                ),
            ));
            // save / load
            const fi = h('input', { type: 'file', style: { display: 'none' } });
            fi.addEventListener('change', e => { if (e.target.files[0]) importSave(e.target.files[0]); });
            f.appendChild(h('div', { className: 'card', style: { marginBottom: '16px' } },
                cardTitle('Save / Load'),
                h('div', { style: { display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' } },
                    mkBtn('Export Save', 'btn btn-secondary', exportSave),
                    mkBtn('Import Save', 'btn btn-secondary', () => fi.click()),
                    fi,
                    mkBtn('New Game', 'btn btn-danger', () => {
                        openModal(h('div', null,
                            h('div', { className: 'modal-title', style: { color: '#EF4444', marginBottom: '8px' } }, 'Start Over?'),
                            h('div', { className: 'modal-sub' }, 'This cannot be undone. All progress will be lost.'),
                            h('div', { className: 'modal-actions' },
                                mkBtn('Cancel', 'btn btn-ghost', closeModal),
                                mkBtn('Yes, Start Over', 'btn btn-danger', () => {
                                    G = null;
                                    localStorage.removeItem('ft_save');
                                    sessionStorage.setItem('_forceSetup', '1');
                                    if (typeof window._electronDelete === 'function') {
                                        window._electronDelete().then(function() { location.reload(); }).catch(function() { location.reload(); });
                                    } else {
                                        location.reload();
                                    }
                                }),
                            )
                        ));
                    }),
                ),
                h('div', { style: { fontSize: '12px', color: '#475569', lineHeight: '1.6', borderTop: '1px solid #1E2433', paddingTop: '10px' } },
                    'Career saves to ',
                    h('span', { style: { color: '#F59E0B', fontFamily: 'monospace' } }, 'localStorage'),
                    ' — clearing browser data will wipe it. Export regularly. Saved as ',
                    h('span', { style: { color: '#F59E0B', fontFamily: 'monospace' } }, `race-weekend-s${G.season}.json`),
                    '.',
                )
            ));
            f.appendChild(h('div', { className: 'card', style: { marginBottom: '16px' } },
                cardTitle('Help'),
                h('div', { style: { fontSize: '13px', color: '#6A5E48', marginBottom: '10px' } }, 'Replay the guided tutorial to walk through all major systems again.'),
                mkBtn('▶ Replay Tutorial', 'btn btn-secondary', replayTutorial)
            ));

            // iracing ownership — cars and tracks
            f.appendChild(h('div', { className: 'card', style: { marginBottom: '16px' } },
                cardTitle('iRacing Ownership'),
                h('div', { style: { fontSize: '13px', color: '#94A3B8', marginBottom: '14px', lineHeight: '1.6' } },
                    'Check what you actually own in iRacing. This controls which cars and tracks can be used in roster exports. '
                    
                ),
                // cars - one row per class
                h('div', { style: { fontSize: '12px', color: '#475569', marginBottom: '10px' } },
                    'Check each car class you own. The roster for that series will use your car type so AI opponents are in the same class. Unowned classes fall back to the closest alternative, then free sports cars.'
                ),
                ...(function() {
                    var CAR_OWN_ROWS = [
                        { sid: 'super_late_model', label: 'Super Late Model',  note: 'Super Late Model' },
                        { sid: 'sk_modified',      label: 'SK Modified',       note: 'SK Modified or SK Modified Tour' },
                        { sid: 'late_model_stock', label: 'Late Model Stock',  note: 'Late Model Stock Car 2023' },
                        { sid: 'arca_menards',     label: 'ARCA Menards',      note: 'ARCA 2025 — Chevy / Ford / Toyota' },
                        { sid: 'nascar_trucks',    label: 'NASCAR Trucks',     note: 'All 4 truck brands mix in roster' },
                        { sid: 'nascar_xfinity',   label: 'NASCAR Xfinity',    note: 'Gen6 2019 bodies (Camaro/Mustang/Supra)' },
                        { sid: 'nascar_cup',       label: 'NASCAR Cup',        note: 'Gen6, Gen4 era, Legacy 87s, or Camry' },
                    ];
                    var els = [];
                    CAR_OWN_ROWS.forEach(function(row) {
                        var cls      = CAR_CLASS_POOLS[row.sid] || { variants: {} };
                        var owned    = !!(G.ownedCars || {})[row.sid];
                        var variants = Object.keys(cls.variants || {});
                        var pref     = (G.carVariantPref || {})[row.sid] || variants[0] || '';

                        var cb = h('input', { type: 'checkbox', checked: owned, style: { accentColor: '#F59E0B', width: '13px', height: '13px', flexShrink: 0, cursor: 'pointer' } });
                        cb.addEventListener('change', function() {
                            if (!G.ownedCars) G.ownedCars = {};
                            G.ownedCars[row.sid] = cb.checked;
                            addLog(G, '🎮 ' + row.label + (cb.checked ? ' — owned' : ' — unowned'));
                            saveGame(); render();
                        });

                        els.push(h('div', { style: { borderBottom: '1px solid #1A1E2A', padding: '5px 0' } },
                            h('label', { style: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' } },
                                cb,
                                h('span', { style: { fontSize: '13px', fontWeight: 600, color: owned ? '#F9FAFB' : '#64748B' } }, row.label),
                                h('span', { style: { fontSize: '11px', color: '#475569', marginLeft: '4px' } }, row.note)
                            ),
                            // type picker if owned and multiple eras exist
                        owned && variants.length > 1 ? h('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', marginLeft: '21px' } },
                            h('span', { style: { fontSize: '11px', color: '#64748B' } }, 'Type owned:'),
                            (function() {
                                var sel = h('select', { style: { fontSize: '12px', padding: '2px 6px', background: '#0D1117', border: '1px solid #2D3748', borderRadius: '4px', color: '#94A3B8' } });
                                variants.forEach(function(v) {
                                    var opt = h('option', { value: v }, v);
                                    if (v === pref) opt.selected = true;
                                    sel.appendChild(opt);
                                });
                                sel.addEventListener('change', function() {
                                    if (!G.carVariantPref) G.carVariantPref = {};
                                    G.carVariantPref[row.sid] = sel.value;
                                    addLog(G, '🎮 ' + row.label + ' type: ' + sel.value);
                                    saveGame();
                                });
                                return sel;
                            })()
                        ) : null
                        ));
                    });
                    return els;
                })(),
                h('div', { style: { height: '10px' } }),
                // paid tracks
                h('div', { style: { fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' } }, 'Tracks (Paid)'),
                h('div', { style: { fontSize: '12px', color: '#64748B', marginBottom: '16px' } },
                    'Checking a track adds it to your schedule pool. Unchecking removes it from future schedules.'
                ),
                ...(function() {
                    var trackGroups = [
                        {
                            label: 'Short Tracks & Regional',
                            tracks: [
                                'Five Flags Speedway', 'Hickory Motor Speedway', 'New Smyrna Speedway',
                                'Oswego Speedway', 'Stafford Motor Speedway', 'Irwindale Speedway',
                                'Myrtle Beach Speedway', "Kevin Harvick's Kern Raceway", 'The Bullring',
                                'Lucas Oil Indianapolis Raceway Park', 'Slinger Speedway',
                                'Nashville Fairgrounds Speedway',
                            ]
                        },
                        {
                            label: 'SK Modified / Late Model Ovals',
                            tracks: [
                                'Bristol Motor Speedway', 'Martinsville Speedway', 'Richmond Raceway',
                                'North Wilkesboro Speedway', 'New Hampshire Motor Speedway',
                            ]
                        },
                        {
                            label: 'Legends Road Courses',
                            tracks: [
                                'Watkins Glen International', 'Road America',
                                'Mid-Ohio Sports Car Course', 'Sebring International Raceway',
                            ]
                        },
                        {
                            label: 'NASCAR Trucks / Xfinity / Cup',
                            tracks: [
                                'Atlanta Motor Speedway', 'Charlotte Motor Speedway', 'Charlotte Motor Speedway Roval',
                                'Chicago Street Course', 'Circuit of the Americas', 'Darlington Raceway',
                                'Daytona International Speedway', 'Dover Motor Speedway', 'Gateway Motorsports Park',
                                'Homestead-Miami Speedway', 'Indianapolis Motor Speedway', 'Iowa Speedway - Oval - 2011',
                                'Kansas Speedway', 'Las Vegas Motor Speedway', 'Michigan International Speedway',
                                'Nashville Superspeedway', 'Phoenix Raceway', 'Pocono Raceway',
                                'Sonoma Raceway', 'Talladega Superspeedway', 'Texas Motor Speedway',
                                'Watkins Glen International',
                            ]
                        },
                    ];

                    function toggleTrack(trackName, checked) {
                        if (!G.trackPools) G.trackPools = {};
                        if (!G.trackPools.paid) G.trackPools.paid = [];
                        if (checked) {
                            if (!G.trackPools.paid.some(function(t) { return t.name === trackName; })) {
                                G.trackPools.paid.push({ name: trackName });
                            }
                        } else {
                            G.trackPools.paid = G.trackPools.paid.filter(function(t) { return t.name !== trackName; });
                        }
                        addLog(G, '🏁 Track ' + (checked ? 'added' : 'removed') + ': ' + trackName);
                        saveGame();
                    }

                    return trackGroups.map(function(group) {
                        var allChecked = group.tracks.every(function(tn) {
                            return (G.trackPools.paid || []).some(function(t) { return t.name === tn; });
                        });
                        var checkAllCb = h('input', { type: 'checkbox', checked: allChecked, style: { accentColor: '#F59E0B', width: '14px', height: '14px', flexShrink: 0, cursor: 'pointer' } });
                        checkAllCb.addEventListener('change', function() {
                            group.tracks.forEach(function(tn) { toggleTrack(tn, checkAllCb.checked); });
                            render();
                        });
                        var groupEl = h('div', { style: { marginBottom: '16px' } },
                            h('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', paddingBottom: '6px', borderBottom: '1px solid #1E2433' } },
                                checkAllCb,
                                h('span', { style: { fontSize: '12px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em' } }, group.label),
                            ),
                            h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 16px' } },
                                ...group.tracks.map(function(trackName) {
                                    var inPool = (G.trackPools.paid || []).some(function(t) { return t.name === trackName; });
                                    var cb2 = h('input', { type: 'checkbox', checked: inPool, style: { accentColor: '#F59E0B', width: '14px', height: '14px', flexShrink: 0, cursor: 'pointer', marginTop: '1px' } });
                                    cb2.addEventListener('change', function() {
                                        toggleTrack(trackName, cb2.checked);
                                        render();
                                    });
                                    return h('label', {
                                        style: {
                                            display: 'flex', gap: '8px', alignItems: 'flex-start',
                                            fontSize: '13px', color: inPool ? '#F9FAFB' : '#64748B',
                                            cursor: 'pointer', padding: '5px 0',
                                            borderBottom: '1px solid #0D1117',
                                        }
                                    }, cb2, trackName);
                                })
                            )
                        );
                        return groupEl;
                    });
                })(),
            ));
            return f;
        }

        // screens
        function showSetup() { $('setup-screen').classList.remove('hidden'); $('app').classList.remove('visible'); }
        function showGame() { $('setup-screen').classList.add('hidden'); $('app').classList.add('visible'); render(); }

        // condition badge
        function conditionBadge(condId) {
            const c = CONDITIONS.find(x => x.id === condId) || CONDITIONS[0];
            return h('span', {
                style: {
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    padding: '2px 8px', borderRadius: '12px', fontSize: '14px', fontWeight: 700,
                    background: c.color + '22', border: `1px solid ${c.color}44`, color: c.color,
                }
            }, c.icon, ' ', c.label);
        }