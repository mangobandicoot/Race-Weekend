// drivers database
        function renderDrivers() {
            const f = document.createDocumentFragment();
            f.appendChild(h('div', { className: 'page-title' }, 'Driver Database'));
            f.appendChild(h('div', { className: 'page-sub' }, 'All drivers the app knows about. Known = pasted from your iRacing results. Generated = AI fill-ins. Names are remembered across seasons.'));

            // stats
            const known = (G.drivers || []).filter(d => d.source === 'known').length;
            const gen = (G.drivers || []).filter(d => d.source === 'generated').length;
            f.appendChild(h('div', { className: 'grid-3', style: { marginBottom: '16px' } },
                miniStatBox('Known Drivers', known, '#10B981'),
                miniStatBox('Generated', gen, '#94A3B8'),
                miniStatBox('Total', G.drivers.length, '#F9FAFB'),
            ));

            // manual add
            const nameIn = h('input', { type: 'text', placeholder: 'Driver name...', style: { flex: 1 } });
            f.appendChild(h('div', { className: 'card', style: { marginBottom: '14px' } },
                cardTitle('Add Driver Manually'),
                h('div', { style: { display: 'flex', gap: '8px' } },
                    nameIn,
                    mkBtn('Add', 'btn btn-sm btn-primary', () => {
                        const nm = nameIn.value.trim();
                        if (!nm) return;
                        const existing = G.drivers.find(d => d.name.toLowerCase() === nm.toLowerCase());
                        if (existing) { alert(`${nm} already in database.`); return; }
                        const d = createDriver(nm, rand(30, 70), 'mini_stock', 'known');
                        G.drivers.push(d);
                        addLog(G, `📋 Manually added driver: ${nm}`);
                        saveGame(); render();
                    })
                )
            ));

            // series filter
            let filterSeries = 'all';
            const container = h('div', null);
            let filterKnown = false;
            let searchQuery = '';
            const searchIn = h('input', { type: 'text', placeholder: 'Search name or car #…', style: { flex: 1 } });
            searchIn.addEventListener('input', function () { searchQuery = searchIn.value; renderDriverList(); });
            const controlRow = h('div', { style: { display: 'flex', gap: '8px', marginBottom: '10px' } }, searchIn);
            f.appendChild(controlRow);
            function renderDriverList() {
                container.innerHTML = '';
                const knownBtn = mkBtn(filterKnown ? '● Met Only' : '○ All Drivers', 'btn btn-xs ' + (filterKnown ? 'btn-primary' : 'btn-secondary'), function () { filterKnown = !filterKnown; renderDriverList(); });
                var _existingKnownBtn = controlRow.querySelector('button');
                if (_existingKnownBtn) _existingKnownBtn.remove();
                controlRow.appendChild(knownBtn);
                const filterRow = h('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' } },
                    ...[['all', 'All Series'], ...SERIES.map(s => [s.id, s.short])].map(([id, label]) =>
                        mkBtn(label, `btn btn-xs ${filterSeries === id ? 'btn-primary' : 'btn-secondary'}`, () => { filterSeries = id; renderDriverList(); })
                    )
                );
                container.appendChild(filterRow);
                const filtered = (G.drivers || []).filter(d => {
                    if (filterSeries !== 'all' && d.currentSeriesId !== filterSeries) return false;
                    if (filterKnown && d.source !== 'known') return false;
                    if (searchQuery) {
                        const q = searchQuery.toLowerCase();
                        const nameMatch = d.name.toLowerCase().indexOf(q) >= 0;
                        const numMatch = d.carNumber && String(d.carNumber).includes(q);
                        if (!nameMatch && !numMatch) return false;
                    }
                    return true;
                }).sort((a, b) => b.rep - a.rep);
                if (!filtered.length) { container.appendChild(h('div', { style: { color: '#94A3B8', padding: '16px', textAlign: 'center' } }, 'No drivers.')); return; }
                filtered.forEach(d => {
                    const s = getSeries(d.currentSeriesId);
                    const injBadge = d.injuredOrPenalized ? badge('INJ/PEN', '#EF4444') : d.substituteFor ? badge(`SUB for ${d.substituteFor}`, '#F97316') : null; const homeStr = d.homeState
                        ? ((typeof US_STATE_NAMES !== 'undefined' ? US_STATE_NAMES[d.homeState] : null) || d.homeState)
                        : null;

                    // bio toggle
                    const bioEl = h('div', {
                        style: {
                            fontSize: '13px', color: '#94A3B8', lineHeight: '1.6', marginTop: '6px',
                            padding: '8px 10px', background: '#060A10', borderRadius: '6px',
                            borderLeft: '2px solid #1E2433', display: 'none',
                        }
                    });
                    let bioGenerated = false;

                    const row = h('div', { className: 'driver-card', style: { cursor: 'pointer', flexWrap: 'wrap' } },
                        h('div', {
                            style: { flex: 1, minWidth: 0 }, onClick: () => {
                                if (bioEl.style.display === 'none') {
                                    if (!bioGenerated) {
                                        bioEl.textContent = generateDriverBio(d);
                                        bioGenerated = true;
                                    }
                                    bioEl.style.display = 'block';
                                } else {
                                    bioEl.style.display = 'none';
                                }
                            }
                        },
                            h('div', { className: 'dc-name' }, d.name, h('span', { className: `text-xs ${d.source === 'known' ? 'source-known' : 'source-generated'}`, style: { marginLeft: '8px' } }, d.source === 'known' ? '● known' : '○ gen')),
                            h('div', { className: 'dc-sub' },
                                s && s.tier <= 2 ? (s ? s.short : 'Unknown') : `${s ? s.short : 'Unknown'} · ${d.currentTeam || 'No team'}`,
                                homeStr ? h('span', { style: { color: '#64748B' } }, ' · 📍 ' + homeStr) : null,
                                ` · Rep: ${d.rep} · Fans: ${fmtFans(d.fans)}`,
                            ),
                            d.notes ? h('div', { className: 'dc-sub text-muted', style: { fontStyle: 'italic' } }, d.notes) : null,
                            bioEl,
                        ),
                        injBadge,
                        h('div', { style: { display: 'flex', gap: '4px', flexShrink: 0 } },
                            mkBtn('Profile', 'btn btn-xs btn-secondary', () => openDriverProfileModal(d.name)),
                            mkBtn('Edit', 'btn btn-xs btn-secondary', () => openEditDriverModal(d)),
                        )
                    );
                    container.appendChild(row);
                });
            }
            renderDriverList();
            f.appendChild(container);
            return f;
        }

        // tracks
        function renderTracks() {
            const f = document.createDocumentFragment();
            f.appendChild(h('div', { className: 'page-title' }, 'Track Manager'));
            f.appendChild(h('div', { className: 'page-sub' }, 'Manage your track pool. Slinger (figure-8) pins as season finale in free-track series.'));
            let activePool = 'free';
            const cont = h('div', null);
            function renderPool() {
                cont.innerHTML = '';
                const pool = G.trackPools[activePool] || [];
                cont.appendChild(h('div', { style: { display: 'flex', gap: '8px', marginBottom: '16px' } },
                    ...[['free', 'Free / Owned'], ['paid', 'Paid Tracks'], ['invite', 'Invite Venues']].map(([id, lbl]) => mkBtn(lbl, 'btn ' + (activePool === id ? 'btn-primary' : 'btn-secondary'), function() { activePool = id; if (!G.trackPools.invite) G.trackPools.invite = []; renderPool(); }))
                ));
                cont.appendChild(h('div', { style: { fontSize: '14px', color: '#94A3B8', marginBottom: '10px' } }, `${pool.length} tracks`));
                const list = h('div', null);
                let dragSrc = null; // must be outside foreach or drag breaks
                pool.forEach((t, i) => {
                    const row = h('div', { className: 'track-row', draggable: true },
                        h('span', { className: 'drag-handle' }, '⠿'),
                        h('div', { style: { flex: 1 } },
                            h('span', { style: { fontWeight: 700, fontSize: '14px', color: '#F9FAFB' } }, t.name),
                            t.city ? h('span', { style: { color: '#94A3B8', fontSize: '14px', marginLeft: '8px' } }, `${t.city}${t.state ? ', ' + t.state : ''}`) : null,
                            t.fig8 ? h('span', { style: { marginLeft: '8px', fontSize: '14px', color: '#8B5CF6', fontWeight: 700 } }, '🔀 Figure-8') : null,
                        ),
                        h('div', { style: { display: 'flex', gap: '4px' } },
                            mkBtn('↑', 'btn btn-xs btn-secondary', () => { if (i > 0) { const a = [...pool];[a[i - 1], a[i]] = [a[i], a[i - 1]]; G.trackPools[activePool] = a; saveGame(); renderPool(); } }, i === 0),
                            mkBtn('↓', 'btn btn-xs btn-secondary', () => { if (i < pool.length - 1) { const a = [...pool];[a[i], a[i + 1]] = [a[i + 1], a[i]]; G.trackPools[activePool] = a; saveGame(); renderPool(); } }, i === pool.length - 1),
                            mkBtn('✕', 'btn btn-xs btn-danger', () => { G.trackPools[activePool] = pool.filter((_, j) => j !== i); saveGame(); renderPool(); }),
                        )
                    );
                    row.addEventListener('dragstart', () => { dragSrc = i; row.style.opacity = '0.4'; });
                    row.addEventListener('dragend', () => { row.style.opacity = '1'; dragSrc = null; });
                    row.addEventListener('dragover', e => { e.preventDefault(); row.classList.add('drag-over'); });
                    row.addEventListener('dragleave', () => row.classList.remove('drag-over'));
                    row.addEventListener('drop', e => { e.preventDefault(); row.classList.remove('drag-over'); if (dragSrc != null && dragSrc !== i) { const a = [...pool]; const [item] = a.splice(dragSrc, 1); a.splice(i, 0, item); G.trackPools[activePool] = a; saveGame(); renderPool(); } });
                    list.appendChild(row);
                });
                if (!pool.length) list.appendChild(h('div', { style: { color: '#94A3B8', padding: '16px', textAlign: 'center' } }, 'No tracks.'));
                cont.appendChild(list);
                const nIn = h('input', { type: 'text', placeholder: 'Track Name *', style: { flex: 2 } });
                const cIn = h('input', { type: 'text', placeholder: 'City', style: { flex: 1 } });
                const sIn = h('input', { type: 'text', placeholder: 'ST', style: { width: '60px' } });
                const fCb = h('input', { type: 'checkbox' });
                cont.appendChild(h('div', { className: 'card', style: { marginTop: '12px' } },
                    h('div', { className: 'card-title' }, 'Add Track'),
                    h('div', { style: { display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' } }, nIn, cIn, sIn),
                    h('div', { style: { display: 'flex', gap: '16px', alignItems: 'center' } },
                        h('label', { style: { display: 'flex', gap: '7px', alignItems: 'center', cursor: 'pointer', fontSize: '14px', color: '#D1D5DB' } }, fCb, '🔀 Figure-8 (season finale)'),
                        h('div', { style: { flex: 1 } }),
                        mkBtn('Add Track', 'btn btn-primary', () => { if (!nIn.value.trim()) return; G.trackPools[activePool].push({ name: nIn.value.trim(), city: cIn.value.trim(), state: sIn.value.trim(), fig8: fCb.checked }); saveGame(); renderPool(); nIn.value = ''; cIn.value = ''; sIn.value = ''; fCb.checked = false; }),
                    )
                ));
            }
            renderPool();
            f.appendChild(cont);
            return f;
        }

        // log
        function renderLog() {
            const f = document.createDocumentFragment();
            f.appendChild(h('div', { className: 'page-title' }, 'Race Log'));
            f.appendChild(h('div', { className: 'page-sub' }, (G.log || []).length + ' entries'));

            const searchIn = h('input', { type: 'text', placeholder: 'Search log...', style: { width: '100%', marginBottom: '12px' } });
            f.appendChild(searchIn);

            const card = h('div', { className: 'card' });
            const inner = h('div', { style: { maxHeight: '520px', overflowY: 'auto' } });

            function renderEntries() {
                inner.innerHTML = '';
                const query = searchIn.value.toLowerCase();
                const entries = [...(G.log || [])].reverse();
                const filtered = query ? entries.filter(e => e.toLowerCase().includes(query)) : entries;
                if (!filtered.length) {
                    inner.appendChild(h('div', { style: { padding: '16px', color: '#94A3B8', textAlign: 'center', fontSize: '14px' } }, 'No entries match.'));
                    return;
                }
                filtered.forEach(function (entry, i) {
                    inner.appendChild(h('div', { style: { padding: '7px 0', borderBottom: '1px solid #0B0F1A', fontSize: '14px', color: i === 0 && !query ? '#F9FAFB' : '#94A3B8', lineHeight: '1.5' } }, entry));
                });
            }

            searchIn.addEventListener('input', renderEntries);
            renderEntries();
            card.appendChild(inner);
            f.appendChild(card);
            return f;
        }

        // career history
        function renderHistory() {
            const f = document.createDocumentFragment();
            f.appendChild(h('div', { className: 'page-title' }, 'Career Legacy'));
            f.appendChild(h('div', { className: 'page-sub' }, `${G.driverName} · ${G.starts} starts · ${G.wins} wins · ${(G.seasonHistory || []).length} seasons`));

            const history = (G.seasonHistory || []).slice().reverse();
            if (!history.length) {
                f.appendChild(h('div', { className: 'card', style: { textAlign: 'center', padding: '32px', color: '#94A3B8' } }, 'Complete a season to build your legacy.'));
                return f;
            }

            // career stat bar
            f.appendChild(h('div', { className: 'card', style: { marginBottom: '14px' } },
                cardTitle('Career Totals'),
                h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', marginBottom: '12px' } },
                    miniStatBox('Seasons', history.length, '#F59E0B'),
                    miniStatBox('Wins', G.wins, '#F59E0B'),
                    miniStatBox('Top 5s', G.top5s, '#10B981'),
                    miniStatBox('Poles', G.poles, '#8B5CF6'),
                ),
                h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px' } },
                    miniStatBox('Earnings', fmtMoney(G.totalPrizeMoney), '#10B981'),
                    miniStatBox('Fans', fmtFans(G.fans), '#EC4899'),
                    miniStatBox('Rep', G.reputation, '#F59E0B'),
                    miniStatBox('Championships', (G.seasonHistory || []).reduce((a, s) => a + (s.championships || []).filter(c => c.pos === 1).length, 0), '#F59E0B'),
                ),
            ));

           // track performance stats
            const trackMap = {};
            (G.raceHistory || []).filter(function(r) { return !r.dq; }).forEach(function(r) {
                if (!trackMap[r.track]) trackMap[r.track] = { starts: 0, wins: 0, top5s: 0, dnfs: 0, totalPos: 0, finishes: 0 };
                const t = trackMap[r.track];
                t.starts++;
                if (r.dnf) { t.dnfs++; return; }
                t.finishes++;
                t.totalPos += r.pos;
                if (r.pos === 1) t.wins++;
                if (r.pos <= 5) t.top5s++;
            });
            const trackEntries = Object.entries(trackMap).filter(function(e) { return e[1].starts >= 1; })
                .sort(function(a, b) { return b[1].wins - a[1].wins || a[1].totalPos / (a[1].finishes || 1) - b[1].totalPos / (b[1].finishes || 1); });
            if (trackEntries.length) {
                const tc = h('div', { className: 'card', style: { marginBottom: '14px' } });
                tc.appendChild(h('div', { className: 'card-title' }, 'Track Performance'));
                trackEntries.forEach(function(entry) {
                    const name = entry[0], t = entry[1];
                    const avg = t.finishes ? (t.totalPos / t.finishes).toFixed(1) : 'N/A';
                    const winPct = Math.round((t.wins / t.starts) * 100);
                    const barColor = t.wins > 0 ? '#F59E0B' : t.top5s > 0 ? '#10B981' : '#475569';
                    tc.appendChild(h('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', padding: '7px 0', borderBottom: '1px solid #0F172A' } },
                        h('div', { style: { flex: 1, minWidth: 0 } },
                            h('div', { style: { fontSize: '13px', fontWeight: 700, color: '#F9FAFB', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, name),
                            h('div', { style: { fontSize: '11px', color: '#64748B', marginTop: '2px' } },
                                t.starts + ' start' + (t.starts > 1 ? 's' : '') +
                                (t.wins ? ' · ' + t.wins + ' win' + (t.wins > 1 ? 's' : '') : '') +
                                (t.top5s ? ' · ' + t.top5s + ' top 5' : '') +
                                (t.dnfs ? ' · ' + t.dnfs + ' DNF' : '') +
                                ' · avg P' + avg
                            ),
                        ),
                        t.wins ? h('div', { style: { fontSize: '12px', fontWeight: 800, color: '#F59E0B', background: '#F59E0B18', border: '1px solid #F59E0B44', padding: '2px 8px', borderRadius: '4px', flexShrink: 0 } }, winPct + '% W') : null,
                    ));
                });
                f.appendChild(tc);
            }

            // championship gap chart
            // Shows points leader vs player week by week for the current season
            const currentSeasonRaces = (G.raceHistory || []).filter(function(r) { return r.season === G.season; })
                .sort(function(a, b) { return a.week - b.week; });
            if (currentSeasonRaces.length >= 2) {
                const gapCard = h('div', { className: 'card', style: { marginBottom: '14px' } });
                gapCard.appendChild(h('div', { className: 'card-title' }, 'Season ' + G.season + ' Championship Gap'));
                // cumulative points per week
                let myRunning = 0;
                const weekData = currentSeasonRaces.map(function(r) {
                    myRunning += (r.points || 0);
                    // estimate leader from seriesFields
                    const field = G.seriesFields[r.seriesId] || {};
                    const leaderPts = Math.max(...Object.values(field).map(function(d) { return d.points || 0; }).concat([myRunning]));
                    return { week: r.week, mine: myRunning, leader: leaderPts, gap: leaderPts - myRunning };
                });
                const maxPts = Math.max(...weekData.map(function(d) { return Math.max(d.mine, d.leader); }), 1);
                const chartH = 80, chartW = '100%';
                const pts = weekData.length;
                const svgContent = weekData.map(function(d, i) {
                    const x = (i / Math.max(pts - 1, 1)) * 100;
                    const myY = chartH - (d.mine / maxPts) * chartH;
                    const ldY = chartH - (d.leader / maxPts) * chartH;
                    return { x, myY, ldY, d };
                });
                // svg paths
                const myPath = svgContent.map(function(p, i) { return (i === 0 ? 'M' : 'L') + p.x.toFixed(1) + ',' + p.myY.toFixed(1); }).join(' ');
                const ldPath = svgContent.map(function(p, i) { return (i === 0 ? 'M' : 'L') + p.x.toFixed(1) + ',' + p.ldY.toFixed(1); }).join(' ');
                const lastGap = weekData[weekData.length - 1].gap;
                const gapColor = lastGap <= 0 ? '#10B981' : lastGap <= 20 ? '#F59E0B' : '#EF4444';
                gapCard.appendChild(h('div', { style: { marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                    h('div', { style: { fontSize: '12px', color: '#64748B' } },
                        h('span', { style: { color: '#10B981', fontWeight: 700 } }, '— You  '),
                        h('span', { style: { color: '#EF4444', fontWeight: 700 } }, '— Leader'),
                    ),
                    h('div', { style: { fontSize: '13px', fontWeight: 800, color: gapColor } },
                        lastGap <= 0 ? '+' + Math.abs(lastGap) + ' ahead' : lastGap + ' behind'
                    ),
                ));
                const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svgEl.setAttribute('viewBox', '0 0 100 ' + chartH);
                svgEl.setAttribute('preserveAspectRatio', 'none');
                svgEl.style.cssText = 'width:100%;height:' + chartH + 'px;display:block;';
                const mkPath = function(d, color) {
                    const el = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    el.setAttribute('d', d); el.setAttribute('fill', 'none');
                    el.setAttribute('stroke', color); el.setAttribute('stroke-width', '1.5');
                    el.setAttribute('vector-effect', 'non-scaling-stroke');
                    return el;
                };
                svgEl.appendChild(mkPath(ldPath, '#EF4444'));
                svgEl.appendChild(mkPath(myPath, '#10B981'));
                gapCard.appendChild(svgEl);
                f.appendChild(gapCard);
            }

            // track records
            const records = G.trackRecords || {};
            const recordEntries = Object.entries(records).filter(function ([key, rec]) { return rec.overall || rec.personal; });
            if (recordEntries.length) {
                const rc = h('div', { className: 'card', style: { marginBottom: '14px' } });
                rc.appendChild(cardTitle('Track Records'));
                const grid = h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '8px' } });
                recordEntries.forEach(function ([key, rec]) {
                    const parts = key.split('::');
                    const seriesId = parts.length > 1 ? parts[0] : null;
                    const track = parts.length > 1 ? parts[1] : key;
                    const series = seriesId ? getSeries(seriesId) : null;
                    const seriesName = series ? series.short : seriesId;
                    const trackLabel = seriesName ? seriesName + ' - ' + track : track;
                    const isYours = rec.overall && rec.overall.driver === G.driverName;
                    grid.appendChild(h('div', {
                        style: {
                            background: '#060A10', border: `1px solid ${isYours ? '#F59E0B44' : '#1E2433'}`,
                            borderRadius: '8px', padding: '10px 12px',
                        }
                    },
                        h('div', { style: { fontSize: '13px', fontWeight: 800, color: '#F9FAFB', marginBottom: '4px' } }, trackLabel),
                        rec.overall ? h('div', { style: { fontSize: '13px', color: isYours ? '#F59E0B' : '#94A3B8' } },
                            `⚡ ${rec.overall.time} — ${rec.overall.driver}${isYours ? ' (you)' : ''}`
                        ) : null,
                        rec.personal && (!rec.overall || rec.overall.driver !== G.driverName) ? h('div', { style: { fontSize: '12px', color: '#64748B', marginTop: '3px' } },
                            `Your best: ${rec.personal.time}`
                        ) : null,
                    ));
                });
                rc.appendChild(grid);
                f.appendChild(rc);
            }

            // series ladder climbed
            const seriesRaced = [...new Set((G.raceHistory || []).map(r => r.seriesId))];
            if (seriesRaced.length) {
                f.appendChild(h('div', { className: 'card', style: { marginBottom: '14px' } },
                    cardTitle('Series Climbed'),
                    h('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
                        ...SERIES
                            .filter(s => seriesRaced.includes(s.id))
                            .sort((a, b) => a.tier - b.tier)
                            .map(s => {
                                const wins = (G.raceHistory || []).filter(r => r.seriesId === s.id && r.pos === 1 && !r.dnf && !r.dq).length;
                                const starts = (G.raceHistory || []).filter(r => r.seriesId === s.id).length;
                                const champ = (G.seasonHistory || []).some(sh => (sh.championships || []).some(c => c.seriesId === s.id && c.pos === 1));
                                return h('div', {
                                    style: {
                                        background: s.color + '14', border: `1px solid ${s.color}44`,
                                        borderRadius: '8px', padding: '10px 14px', minWidth: '130px',
                                    }
                                },
                                    h('div', { style: { fontSize: '13px', fontWeight: 800, color: s.color, marginBottom: '4px' } }, s.short),
                                    champ ? h('div', { style: { fontSize: '12px', color: '#F59E0B', fontWeight: 700, marginBottom: '3px' } }, '🏆 Champion') : null,
                                    h('div', { style: { fontSize: '12px', color: '#94A3B8' } }, `${starts} starts · ${wins} wins`),
                                );
                            })
                    ),
                ));
            }

            // rivals made
            const notableRivals = (G.rivals || []).filter(r => relationship(r) !== 'acquaintance').sort((a, b) => {
                const o = { rival: 0, frenemy: 1, racing_rival: 2, friend: 3 };
                return (o[relationship(a)] || 4) - (o[relationship(b)] || 4);
            });
            if (notableRivals.length) {
                f.appendChild(h('div', { className: 'card', style: { marginBottom: '14px' } },
                    cardTitle('Rivalries & Relationships'),
                    h('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
                        ...notableRivals.slice(0, 12).map(r => {
                            const rel = relationship(r);
                            const col = REL_COLOR[rel] || '#94A3B8';
                            return h('div', {
                                style: {
                                    background: col + '14', border: `1px solid ${col}44`,
                                    borderRadius: '7px', padding: '8px 12px',
                                }
                            },
                                h('div', { style: { fontSize: '13px', fontWeight: 800, color: '#F9FAFB' } }, r.name),
                                h('div', { style: { fontSize: '11px', color: col, fontWeight: 700, marginTop: '2px' } }, REL_LABEL[rel] || rel.toUpperCase()),
                                h('div', { style: { fontSize: '11px', color: '#64748B', marginTop: '2px' } }, `${r.incidents || 0} inc · ${r.closeRaces || 0} close`),
                            );
                        })
                    ),
                ));
            }

            // season by season timeline
            f.appendChild(h('div', { style: { marginBottom: '8px', fontSize: '14px', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.1em', textTransform: 'uppercase' } }, 'Season Timeline'));
            history.forEach(s => {
                const champs = (s.championships || []).filter(c => c.pos === 1);
                const bestFinish = (s.championships || []).reduce((best, c) => c.pos < best ? c.pos : best, 99);
                const borderColor = champs.length ? '#F59E0B' : bestFinish <= 3 ? '#10B981' : bestFinish <= 10 ? '#3B82F6' : '#1E2433';
                const icon = champs.length ? '🏆' : bestFinish <= 3 ? '🥈' : bestFinish <= 5 ? '⭐' : s.wins > 0 ? '✅' : '🏁';

                f.appendChild(h('div', { className: 'card', style: { marginBottom: '8px', borderColor } },
                    h('div', { style: { display: 'flex', alignItems: 'flex-start', gap: '14px', flexWrap: 'wrap' } },
                        h('div', { style: { fontSize: '28px', lineHeight: 1, flexShrink: 0, marginTop: '2px' } }, icon),
                        h('div', { style: { flex: 1 } },
                            h('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' } },
                                h('div', { style: { fontSize: '16px', fontWeight: 900, color: '#F9FAFB' } }, `Season ${s.season}`),
                                ...(s.championships || []).map(c => {
                                    const sc = getSeries(c.seriesId);
                                    const col = c.pos === 1 ? '#F59E0B' : c.pos <= 3 ? '#CBD5E1' : c.pos <= 10 ? '#10B981' : '#94A3B8';
                                    return badge(`${(getSeries(c.seriesId) && getSeries(c.seriesId).tier) || 1} P${c.pos}`, col);
                                }),
                            ),
                            h('div', { style: { display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '13px', color: '#94A3B8' } },
                                h('span', null, h('span', { style: { color: '#F59E0B', fontWeight: 700 } }, s.wins), ' wins'),
                                h('span', null, h('span', { style: { color: '#10B981', fontWeight: 700 } }, s.top5s), ' top 5s'),
                                h('span', null, h('span', { style: { color: '#EF4444', fontWeight: 700 } }, s.dnfs), ' DNFs'),
                                h('span', null, h('span', { style: { color: '#10B981', fontWeight: 700 } }, fmtMoney(s.prize)), ' earned'),
                                h('span', null, h('span', { style: { color: '#EC4899', fontWeight: 700 } }, fmtFans(s.fans)), ' fans'),
                                h('span', null, 'Rep: ', h('span', { style: { color: '#F59E0B', fontWeight: 700 } }, s.rep)),
                            ),
                        ),
                    ),
                ));
            });
            // career highlights
            const highlights = [];

            // First win ever
            const firstWin = (G.raceHistory || []).find(function (r) { return r.pos === 1 && !r.dnf && !r.dq; });
            if (firstWin) {
                const fs = getSeries(firstWin.seriesId);
                highlights.push({
                    icon: '🏆',
                    color: '#F59E0B',
                    title: 'First Career Win',
                    desc: `${(fs && fs.short) || firstWin.seriesId} at ${firstWin.track} — Season ${firstWin.season}, Week ${firstWin.week}.`,
                });
            }

            // Championships
            (G.seasonHistory || []).forEach(function (sh) {
                (sh.championships || []).forEach(function (c) {
                    if (c.pos === 1) {
                        const cs = getSeries(c.seriesId);
                        highlights.push({
                            icon: '🏅',
                            color: '#F59E0B',
                            title: `${(cs && cs.short) || c.seriesId} Champion`,
                            desc: `Season ${sh.season} championship. ${c.points} points, ${c.wins} wins.`,
                        });
                    }
                });
            });

            // Best win streak
            let bestStreak = 0, currentStreak = 0, bestStreakEnd = null;
            (G.raceHistory || []).forEach(function (r) {
                if (r.pos === 1 && !r.dnf && !r.dq) {
                    currentStreak++;
                    if (currentStreak > bestStreak) {
                        bestStreak = currentStreak;
                        bestStreakEnd = r;
                    }
                } else {
                    currentStreak = 0;
                }
            });
            if (bestStreak >= 3 && bestStreakEnd) {
                const ss = getSeries(bestStreakEnd.seriesId);
                highlights.push({
                    icon: '🔥',
                    color: '#EF4444',
                    title: `${bestStreak}-Race Win Streak`,
                    desc: `Best streak ended at ${bestStreakEnd.track} in the ${(ss && ss.short) || bestStreakEnd.seriesId}, Season ${bestStreakEnd.season}.`,
                });
            }

            // Most wins in a single season
            const winsBySeason = {};
            (G.raceHistory || []).forEach(function (r) {
                if (r.pos === 1 && !r.dnf && !r.dq) {
                    const key = r.season + '_' + r.seriesId;
                    winsBySeason[key] = (winsBySeason[key] || 0) + 1;
                }
            });
            const bestSeasonEntry = Object.entries(winsBySeason).sort(function (a, b) { return b[1] - a[1]; })[0];
            if (bestSeasonEntry && bestSeasonEntry[1] >= 3) {
                const parts = bestSeasonEntry[0].split('_');
                const bss = getSeries(parts[1]);
                highlights.push({
                    icon: '📈',
                    color: '#10B981',
                    title: `${bestSeasonEntry[1]} Wins in a Season`,
                    desc: `Best single season performance in the ${(bss && bss.short) || parts[1]}, Season ${parts[0]}.`,
                });
            }

            // Home race wins
            const homeWins = (G.raceHistory || []).filter(function (r) {
                return r.pos === 1 && !r.dnf && !r.dq && G.homeState && r.state === G.homeState;
            });
            if (homeWins.length >= 1) {
                highlights.push({
                    icon: '🏠',
                    color: '#F59E0B',
                    title: `${homeWins.length} Home Race Win${homeWins.length > 1 ? 's' : ''}`,
                    desc: homeWins.length === 1
                        ? `First home win at ${homeWins[0].track}, Season ${homeWins[0].season}.`
                        : `${homeWins.length} wins in front of the home crowd. The best kind.`,
                });
            }

            // Track records held
            const hlRecords = G.trackRecords || {};
            const recordsHeld = Object.entries(hlRecords).filter(function (entry) {
                return entry[1].overall && entry[1].overall.driver === G.driverName;
            });
            if (recordsHeld.length >= 1) {
                highlights.push({
                    icon: '⚡',
                    color: '#8B5CF6',
                    title: `${recordsHeld.length} Track Record${recordsHeld.length > 1 ? 's' : ''}`,
                    desc: `Holds the all-time lap record at ${recordsHeld.length === 1 ? recordsHeld[0][0] : recordsHeld.length + ' tracks'}.`,
                });
            }

            // Rivals made
            const notableRivalCount = (G.rivals || []).filter(function (r) {
                return ['rival', 'frenemy', 'racing_rival', 'friend'].includes(relationship(r));
            }).length;
            if (notableRivalCount >= 2) {
                highlights.push({
                    icon: '🤝',
                    color: '#EC4899',
                    title: `${notableRivalCount} Notable Rivalries`,
                    desc: `Built real relationships on track — good and bad. That's what short track racing is about.`,
                });
            }

            // Pole positions
            if ((G.poles || 0) >= 5) {
                highlights.push({
                    icon: '🟣',
                    color: '#8B5CF6',
                    title: `${G.poles} Career Poles`,
                    desc: `Consistently one of the fastest qualifiers in the field.`,
                });
            }

            // Most laps led in a season
            const lapsLedBySeason = {};
            (G.raceHistory || []).forEach(function (r) {
                if (r.mostLapsLed) {
                    lapsLedBySeason[r.season] = (lapsLedBySeason[r.season] || 0) + 1;
                }
            });
            const bestLapsLedSeason = Object.entries(lapsLedBySeason).sort(function (a, b) { return b[1] - a[1]; })[0];
            if (bestLapsLedSeason && bestLapsLedSeason[1] >= 3) {
                highlights.push({
                    icon: '🎯',
                    color: '#06B6D4',
                    title: `Led Most Laps ${bestLapsLedSeason[1]} Times`,
                    desc: `Season ${bestLapsLedSeason[0]} — dominated the front of the field more than anyone.`,
                });
            }

            if (highlights.length) {
                const hCard = h('div', { className: 'card', style: { marginBottom: '14px' } });
                hCard.appendChild(cardTitle('Career Highlights'));
                highlights.forEach(function (hl) {
                    hCard.appendChild(h('div', {
                        style: {
                            display: 'flex', alignItems: 'flex-start', gap: '12px',
                            padding: '10px 0', borderBottom: '1px solid #0D1117',
                        }
                    },
                        h('div', {
                            style: {
                                fontSize: '22px', flexShrink: 0, width: '36px', height: '36px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: hl.color + '18', borderRadius: '8px', border: '1px solid ' + hl.color + '33',
                            }
                        }, hl.icon),
                        h('div', null,
                            h('div', { style: { fontSize: '14px', fontWeight: 800, color: hl.color, marginBottom: '3px' } }, hl.title),
                            h('div', { style: { fontSize: '13px', color: '#94A3B8', lineHeight: '1.5' } }, hl.desc),
                        ),
                    ));
                });
                f.appendChild(hCard);
            }

            // special / invite event results
            const specialRes = (G.specialResults || []).slice().reverse();
            if (specialRes.length) {
                const sc = h('div', { className: 'card', style: { marginBottom: '14px' } });
                sc.appendChild(cardTitle('Special & Invite Events (' + specialRes.length + ')'));
                sc.appendChild(h('div', { style: { display: 'grid', gridTemplateColumns: '48px 1fr auto auto auto', gap: '0 10px', fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 0 8px', borderBottom: '1px solid #1E2433', marginBottom: '4px' } },
                    h('div', null, 'Pos'),
                    h('div', null, 'Event'),
                    h('div', { style: { textAlign: 'right' } }, 'Prize'),
                    h('div', { style: { textAlign: 'right' } }, 'Rep'),
                    h('div', { style: { textAlign: 'right' } }, 'Fans'),
                ));
                specialRes.forEach(function(r) {
                    const evt = SPECIAL_EVENTS.find(function(e) { return e.id === r.evtId; });
                    const evtName = evt ? evt.name : r.evtId;
                    const isDQ = r.dq || false;
                    const posStr = isDQ ? 'DQ' : r.dnf ? 'DNF' : 'P' + r.pos + (r.fieldSize ? '/' + r.fieldSize : '');
                    const posColor = isDQ ? '#F97316' : r.dnf ? '#EF4444' : r.pos === 1 ? '#F59E0B' : r.pos <= 3 ? '#10B981' : r.pos <= 6 ? '#3B82F6' : '#94A3B8';
                    const repColor = (r.rep || 0) >= 0 ? '#10B981' : '#EF4444';
                    sc.appendChild(h('div', {
                        style: {
                            display: 'grid', gridTemplateColumns: '48px 1fr auto auto auto',
                            gap: '0 10px', alignItems: 'center',
                            padding: '8px 0', borderBottom: '1px solid #0D1117',
                        }
                    },
                        h('div', { style: { fontSize: '15px', fontWeight: 900, color: posColor } }, posStr),
                        h('div', null,
                            h('div', { style: { fontSize: '13px', fontWeight: 700, color: '#F9FAFB', lineHeight: 1.3 } },
                                evtName,
                                r.isSupport ? h('span', { style: { fontSize: '10px', color: '#8B5CF6', marginLeft: '5px', fontWeight: 700, background: '#8B5CF622', border: '1px solid #8B5CF644', padding: '1px 4px', borderRadius: '3px' } }, 'SUPPORT') : null,
                            ),
                            h('div', { style: { fontSize: '11px', color: '#64748B', marginTop: '2px' } },
                                'S' + r.season + ' · ' + (r.track || '') + (evt ? ' · ' + evt.location : ''),
                            ),
                        ),
                        h('div', { style: { fontSize: '13px', fontWeight: 700, color: '#10B981', textAlign: 'right' } },
                            r.prize ? fmtMoney(r.prize) : '—'
                        ),
                        h('div', { style: { fontSize: '13px', fontWeight: 700, color: repColor, textAlign: 'right' } },
                            r.rep !== undefined ? ((r.rep >= 0 ? '+' : '') + r.rep) : '—'
                        ),
                        h('div', { style: { fontSize: '13px', fontWeight: 700, color: '#EC4899', textAlign: 'right' } },
                            r.fans ? '+' + fmtFans(r.fans) : '—'
                        ),
                    ));
                });
                f.appendChild(sc);
            }

            return f;
        }