// edit race result modal
        /* undo the old result stats then reapply with corrected data */
        function openEditRaceResultModal(seriesId, raceIdx) {
            const sched = G.schedules[seriesId] || [];
            const race = sched[raceIdx];
            if (!race || !race.result) return;
            const s = getSeries(seriesId);
            const old = race.result;

            // prefill the textarea from what we already have
            const prefillOrder = (old.finishOrder || []).map(e => {
                let line = e.name || '';
                if (e.status && e.status !== 'null') line += ` ${e.status}`;
                if (e.lapTime) line += `\t${e.lapTime}`;
                if (e.gap) line += `\t${e.gap}`;
                return line;
            }).join('\n');

            buildRaceModal({
                eyebrow: `✏️ Editing — ${s.short} Round ${race.round}`,
                title: race.track,
                sub: `${race.city}, ${race.state} · Correcting previous entry`,
                seriesId, raceIdx,
                qualNote: race.qualifying
                    ? `Qualified P${race.qualifying.position}${race.qualifying.pole ? ' (POLE)' : ''}`
                    : null,
                crewPkg: CREW_PACKAGES.find(p => p.id === ((G.contracts.find(c => c.seriesId === seriesId) || {}).crewPackage || 'basic')) || CREW_PACKAGES[0],
                prefillResult: old,        // passed into buildRaceModal so it can pre-fill fields
                prefillOrder,
                isFig8: false, isSpecial: false,
                onSubmit: (newResult) => {
                    // 1. undo old result's stat effects
                    // points
                    const oldPts = old.points || 0;
                    G.championshipPoints[seriesId] = Math.max(0, (G.championshipPoints[seriesId] || 0) - oldPts);

                    // prize money - reverse what was added
                    const contract = G.contracts.find(c => c.seriesId === seriesId);
                    const prizeShare = (contract && !contract.indie && contract.prizeShare) ? contract.prizeShare : 1.0;
                    const oldDriverPrize = Math.floor((old.prize || 0) * prizeShare);
                    G.money -= oldDriverPrize;
                    G.totalPrizeMoney = Math.max(0, (G.totalPrizeMoney || 0) - oldDriverPrize);

                    // wins and top 5s
                    if (!old.dnf && !old.dq) {
                        if (old.position === 1) G.wins = Math.max(0, G.wins - 1);
                        if (old.position <= 5) G.top5s = Math.max(0, G.top5s - 1);
                    }

                    // poles
                    if (old.pole && !(race.qualifying && race.qualifying.pole)) G.poles = Math.max(0, G.poles - 1);

                    // rep - rough reversal, good enough
                    const oldRepGain = old.dq ? -rand(3, 6) : old.position === 1 ? rand(5, 9) : old.position <= 3 ? rand(2, 5) : old.position <= 10 ? rand(0, 2) : old.dnf ? -2 : -1;
                    G.reputation = Math.max(0, G.reputation - oldRepGain);

                    // fans
                    let oldFanGain = 0;
                    if (old.dq) oldFanGain = -rand(20, 60);
                    else if (old.position === 1) oldFanGain = rand(200, 500);
                    else if (old.position <= 5) oldFanGain = rand(50, 200);
                    else if (old.lapsLed) oldFanGain = rand(20, 80);
                    else if (!old.dnf) oldFanGain = rand(0, 30);
                    else oldFanGain = -rand(0, 20);
                    if (old.pole) oldFanGain += rand(30, 80);
                    G.fans = Math.max(0, G.fans - oldFanGain);

                                        // undo starts, processRaceResult adds it back
                    G.starts = Math.max(0, G.starts - 1);

                    // undo ai standings - if we skip this points double on every edit
                    const myLowerEdit = G.driverName.toLowerCase();
                    if (G.seriesFields[seriesId]) {
                        (old.finishOrder || []).forEach(function(entry, idx) {
                            if (!entry.name || /\byou\b/i.test(entry.name) || entry.name.toLowerCase() === myLowerEdit || entry.isPlayer) return;
                            const clean = entry.name.trim();
                            if (!clean || !G.seriesFields[seriesId][clean]) return;
                            const pts = IRACING_PTS[idx] || 1;
                            G.seriesFields[seriesId][clean].points = Math.max(0, (G.seriesFields[seriesId][clean].points || 0) - pts);
                            G.seriesFields[seriesId][clean].starts = Math.max(0, (G.seriesFields[seriesId][clean].starts || 0) - 1);
                            if (idx === 0) G.seriesFields[seriesId][clean].wins = Math.max(0, (G.seriesFields[seriesId][clean].wins || 0) - 1);
                            if (idx < 5) G.seriesFields[seriesId][clean].top5s = Math.max(0, (G.seriesFields[seriesId][clean].top5s || 0) - 1);
                        });
                    }

                    // step week back, grab it before decrement so history filter works
                    const weekBeforeEdit = G.week;
                    G.week = Math.max(1, G.week - 1);

                    // remove the old history entry
                    G.raceHistory = (G.raceHistory || []).filter(r =>
                        !(r.season === G.season && r.seriesId === seriesId && r.track === race.track && r.week === weekBeforeEdit - 1)
                    );

                    // wipe result so processRaceResult thinks its new
                    race.result = null;

                    // step 2 - put entry fee back so it doesnt get charged twice
                    const entryFee = contract ? (contract.entryFee || s.fee) : s.fee;
                    G.money += entryFee;

                    // 3. Re-process with the corrected result
                    processRaceResult(G, seriesId, raceIdx, newResult);

                    // Update summary toast
                    const _r = (G.schedules[seriesId] || [])[raceIdx];
                    if ((_r && _r.result && _r.result.summary)) showSummaryToast(_r.result.summary, s.color, s.short);

                    addLog(G, `✏️ Result corrected — ${s.short} R${race.round} @ ${race.track}: P${newResult.position}/${newResult.fieldSize}`);

                    openRepairModal(seriesId, newResult, () => { saveGame(); render(); });
                },
            });
        }

        // EDIT DRIVER MODAL 
        function openEditDriverModal(driver) {
            const isPlayer = driver.name.toLowerCase() === G.driverName.toLowerCase();
            const notesIn = h('textarea', { rows: 3, placeholder: 'Notes about this driver...', style: { width: '100%' } });
            notesIn.value = driver.notes || '';
            const seriesSel = h('select', { style: { width: '100%' } });
            SERIES.forEach(s => {
                const opt = h('option', { value: s.id }, s.name);
                if (s.id === driver.currentSeriesId) opt.selected = true;
                seriesSel.appendChild(opt);
            });
            // Name field: display-only for the career driver to avoid breaking isPlayer detection
            const nameRow = isPlayer
                ? h('div', { style: { marginBottom: '12px' } },
                    h('label', { className: 'modal-label' }, 'Name'),
                    h('div', { style: { fontSize: '14px', color: '#F9FAFB', padding: '8px 11px', background: '#0B0F1A', border: '1px solid #2D3748', borderRadius: '6px', marginTop: '2px' } }, driver.name),
                    h('div', { style: { fontSize: '12px', color: '#64748B', marginTop: '4px' } }, 'Career driver name cannot be changed.')
                )
                : h('div', { style: { marginBottom: '12px' } },
                    h('label', { className: 'modal-label' }, 'Name'),
                    h('input', { type: 'text', id: 'edit-driver-name', value: driver.name, style: { width: '100%' } })
                );
            openModal(h('div', null,
                h('div', { className: 'modal-title', style: { marginBottom: '16px' } }, `Edit: ${driver.name}`),
                nameRow,
                h('div', { style: { marginBottom: '12px' } }, h('label', { className: 'modal-label' }, 'Current Series'), seriesSel),
                h('div', { style: { marginBottom: '16px' } }, h('label', { className: 'modal-label' }, 'Notes'), notesIn),
                h('div', { className: 'modal-actions' },
                    mkBtn('Cancel', 'btn btn-ghost', closeModal),
                    mkBtn('Save', 'btn btn-primary', () => {
                        if (!isPlayer) {
                            const ni = $('edit-driver-name');
                            if (ni && ni.value.trim()) driver.name = ni.value.trim();
                        }
                        driver.notes = notesIn.value.trim();
                        const oldSeriesId = driver.currentSeriesId;
                        driver.currentSeriesId = seriesSel.value;
                        driver.currentTeam = (TEAMS[seriesSel.value] || ['Independent'])[0];
                        driver._carNumberSeniority = 0;
                        // Notify if moving into or out of a series the player is racing
                        if (oldSeriesId !== seriesSel.value) {
                            const playerInOld = G.contracts && G.contracts.some(function (c) { return c.seriesId === oldSeriesId; });
                            const playerInNew = G.contracts && G.contracts.some(function (c) { return c.seriesId === seriesSel.value; });
                            if (playerInOld || playerInNew) {
                                const direction = (getSeries(seriesSel.value) && getSeries(seriesSel.value).tier || 1) > (getSeries(oldSeriesId) && getSeries(oldSeriesId).tier || 1) ? 'promoted' : 'demoted';
                                _notifyRosterChange(G, driver, direction, seriesSel.value, null);
                                addLog(G, '📋 ' + driver.name + ' moved from ' + (getSeries(oldSeriesId) && getSeries(oldSeriesId).short || oldSeriesId) + ' to ' + (getSeries(seriesSel.value) && getSeries(seriesSel.value).short || seriesSel.value));
                            }
                        }
                        saveGame(); closeModal(); render();
                    })

                )
            ));
        }

        // SUMMARY
        function tryGenerateSummary(state, seriesId, raceIdx, result) {

        }

        function showToast(text, color) {
            color = color || '#F59E0B';
            const t = h('div', { style: { position: 'fixed', bottom: '20px', right: '20px', maxWidth: '360px', background: '#0B0F1A', border: `1px solid ${color}`, borderRadius: '10px', padding: '18px', zIndex: 1000, boxShadow: `0 4px 24px ${color}40`, animation: 'slideUp 0.3s ease' } },
                h('div', { style: { fontSize: '12px', color: color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' } }, 'AI Race Summary'),
                h('div', { style: { fontSize: '14px', color: '#D1D5DB', lineHeight: '1.6' } }, text),
                h('div', { style: { marginTop: '10px', textAlign: 'right' } }, mkBtn('✕', 'btn btn-xs btn-ghost', () => t.remove())),
            );
            document.body.appendChild(t);
            setTimeout(() => { if (t.parentNode) t.remove(); }, 20000);
        }

        function showSummaryToast(text, color, seriesShort) {
            color = color || '#F59E0B';

            const old = document.getElementById('ml-toast');
            if (old) old.remove();
            const overlay = h('div', {
                style: {
                    position: 'fixed', inset: '0',
                    background: 'rgba(0,0,0,0.55)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1100,
                    animation: 'fadeIn 0.2s ease',
                }
            });
            overlay.id = 'ml-toast';

            const box = h('div', {
                style: {
                    background: '#0D1117',
                    border: `2px solid ${color}`,
                    borderRadius: '14px',
                    padding: '28px 32px',
                    maxWidth: '520px',
                    width: '90%',
                    boxShadow: `0 8px 48px ${color}30, 0 0 0 1px #1E2433`,
                }
            });

            box.appendChild(h('div', {
                style: {
                    fontSize: '12px', color: color, fontWeight: 800,
                    textTransform: 'uppercase', letterSpacing: '0.22em', marginBottom: '14px',
                    display: 'flex', alignItems: 'center', gap: '8px',
                }
            }, `📰 ${seriesShort || 'Race'} Report — Season ${G ? G.season : ''}`));

            box.appendChild(h('div', {
                style: {
                    fontSize: '17px', color: '#F1F5F9',
                    lineHeight: '1.75', fontStyle: 'italic', fontWeight: 400,
                }
            }, text));

            box.appendChild(h('div', { style: { marginTop: '18px', textAlign: 'right' } },
                mkBtn('Dismiss  ✕', 'btn btn-sm btn-ghost', () => overlay.remove())
            ));

            // Click outside to dismiss
            overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
            overlay.appendChild(box);
            document.body.appendChild(overlay);
            // Auto-dismiss after 30s
            setTimeout(() => { if (overlay.parentNode) overlay.remove(); }, 30000);
        }
        const $ = id => document.getElementById(id);
        const frag = (...nodes) => { const f = document.createDocumentFragment(); nodes.flat().forEach(n => n && f.appendChild(n)); return f; };

        //  BOOT
        window.addEventListener('DOMContentLoaded', () => {
            // Check if this is a NO FLAGS build and set global flag
            window._appIsNoFlags = false;
            if (typeof window.electronBridge !== 'undefined' && window.electronBridge.isNoFlags) {
                window.electronBridge.isNoFlags().then(function(val) {
                    window._appIsNoFlags = !!val;
                }).catch(function() {});
            }
            $('setup-form').addEventListener('submit', e => {
                e.preventDefault();
                const name = $('driver-name-input').value.trim();
                if (!name) return;
                G = initState(name);
                const stateEl = $('driver-state-input');
                if (stateEl) G.homeState = stateEl.value || 'NC';
                // Generate sponsor offers for open entry series (normally triggered by doSignContract)
                G.sponsorOffers = sponsorOffersForSeries('mini_stock');
                // Generate season goals
                if (!(G.seasonGoals || []).filter(g => g.status === 'active').length) {
                    G.seasonGoals = G.seasonGoals || [];
                    const newGoals = generateSeasonGoals(G);
                    G.seasonGoals.push(...newGoals);
                }
                const checkedOwned = Array.from(document.querySelectorAll('input[name="owned-track"]:checked'))
                    .map(function(cb) { return cb.value.trim(); });

                const allLocal = SERIES_TRACKS.local;
                const freeTracks = allLocal.filter(function(t) {
                    const FREE_NAMES = [
                        'Langley Speedway','USA International Speedway','Southern National Motorsports Park',
                        'South Boston Speedway','Concord Speedway','Oxford Plains Speedway',
                        'Lanier National Speedway','Thompson Speedway Motorsports Park'
                    ];
                    return FREE_NAMES.includes(t.name);
                });
                const ownedPaid = allLocal.filter(function(t) {
                    return checkedOwned.includes(t.name);
                });
                const combined = freeTracks.concat(ownedPaid);
                if (combined.length > 0) {
                    G.trackPools.free = combined;
                    G.contracts.forEach(function(c) {
                        G.schedules[c.seriesId] = generateSchedule(c.seriesId, G.trackPools);
                    });
                }
                const localNames = allLocal.map(function(t) { return t.name; });
                G.trackPools.invite = checkedOwned
                    .filter(function(n) { return !localNames.includes(n); })
                    .map(function(n) { return { name: n }; });

                saveGame(); showGame(); setTimeout(maybeShowTutorial, 500);
            });
            const importEl = $('import-setup');
            if (importEl) importEl.addEventListener('change', e => { if (e.target.files[0]) importSave(e.target.files[0]); });
            $('modal-overlay').addEventListener('click', e => {
                if (e.target === $('modal-overlay')) {
                    if ($('modal-overlay').dataset.repairOpen === 'true') return;
                    closeModal();
                }
            });
            // Electron: load from userData first, then fall back to localStorage
            function _boot() {
                // forceSetup flag survives reload, means user clicked Start Over
                if (sessionStorage.getItem('_forceSetup')) {
                    sessionStorage.removeItem('_forceSetup');
                    localStorage.removeItem('ft_save');
                    if (typeof window._electronDelete === 'function') window._electronDelete();
                    showSetup();
                    return;
                }
                if (loadGame()) { showGame(); setTimeout(maybeShowTutorial, 2500); } else showSetup();
            }
            if (typeof window._electronLoad === 'function') {
                window._electronLoad().then(function(data) {
                    if (data && data.length > 10) {
                        try { localStorage.setItem('ft_save', data); } catch(e) {}
                    } else {
                        localStorage.removeItem('ft_save');
                    }
                    _boot();
                }).catch(function() { _boot(); });
            } else {
                _boot();
            }
            setInterval(() => { if (G) saveGame(); }, 60000);
        });

        // TUTORIAL
        var _tutStep = 0;
        var _tutEl = null;

        var TUTORIAL_STEPS = [
            { title: 'Welcome to Race Weekend', icon: '🏁', tab: null,
              body: 'You\'re a driver working up from Mini Stock to NASCAR Cup. Every race you run in iRacing, you paste the result here and it tracks your career — money, rep, fans, standings, drama. This quick tour covers the main systems. Hit Next or Skip to dive straight in.' },
            { title: 'The Dashboard', icon: '⚡', tab: 'dashboard',
              body: 'Your home base. Shows this week\'s race, current car condition (the green bars), season goals, and an overview of your stats. Car condition degrades with each race — run too damaged and your results suffer. Repair between races from the post-race screen.' },
            { title: 'Schedule & Submitting Results', icon: '📅', tab: 'schedule',
              body: 'After each iRacing race, come here and paste your result text into the input box — the app reads the finish order and finds your name automatically. Or enter a position manually. Premier Events (⭐) are season highlights with double points and a bigger field.' },
            { title: 'The Paddock — Drama Inbox', icon: '📻', tab: 'paddock',
              body: 'After every race, events land here: sponsor pressure, media coverage, crew friction, fan moments. Each has a choice and consequences. The badge on the sidebar tells you something is waiting. Don\'t ignore it — drama stacks up.' },
            { title: 'Business & Money', icon: '💰', tab: 'business',
              body: 'Sponsor deals, bonus checks, and unexpected bills all live here. Sponsors have satisfaction ratings — good results keep them happy. Watch your cash flow. Entry fees and repair bills add up fast in the lower series.' },
            { title: 'Contracts & Moving Up', icon: '📋', tab: 'contracts',
              body: 'You need enough rep and fans to receive offers from higher series. Offers arrive mid-season and in the offseason. Higher tiers mean bigger prize money but steeper entry fees, stricter finish requirements, and real team expectations.' },
            { title: 'Rivals', icon: '🔥', tab: 'rivals',
              body: 'Drivers you\'ve built history with. Rivalries evolve — they trash talk, react to your results, and become feuds or reluctant respect over time. Promote someone manually, or the system picks up on repeated contact and close finishes.' },
            { title: 'The Roster', icon: '👥', tab: 'roster',
              body: 'Your iRacing AI opponent list. Before each race, export the roster for your current series — it generates a driver list formatted for iRacing\'s AI setup. The app tracks who owns what car so the export only includes valid entries.' },
            { title: 'Special Events', icon: '⭐', tab: 'special',
              body: 'Invitational races outside your regular schedule — the Snowball Derby, Martinsville Late Model Invitational, international wildcards, Indy 500 wildcard. They unlock by reputation. They cost money to enter. They\'re worth it.' },
            { title: 'Side Quests — Legends & Modifieds', icon: '🎯', tab: 'sidequests',
              body: 'Run Legends cars or SK Modifieds alongside your main career. Side races only run when the track is within the same region as your main race that week — no flying from Florida to Maine to do two races. Join from here and submit results separately.' },
            { title: 'Driver Database & Race Story', icon: '📓', tab: 'story',
              body: 'Story is your season journal — every race gets a beat-writer entry. The Drivers tab holds every AI competitor the app knows, with expanding bios and career stats. Tap any driver to read their profile.' },
            { title: 'Settings', icon: '⚙️', tab: 'settings',
              body: 'Mark which iRacing cars and tracks you actually own — controls roster exports. Set your home state for regional bonuses. Export or import your save. The tutorial can be replayed from here anytime.' },
            { title: 'You\'re Ready', icon: '🏆', tab: null, last: true,
              body: 'A few things to discover on your own: the AI-to-AI rivalry system, career milestones, the season-end review broadcast, and the family narrative system that fires when multiple same-surname drivers run in your field. Good luck. The Mini Stock won\'t win itself.' },
        ];

        function maybeShowTutorial() {
            if (!G) return;
            if (G.tutorialDone) return;
            _tutStep = 0;
            showTutorialStep();
        }

        function showTutorialStep() {
            closeTutorialOverlay();
            var step = TUTORIAL_STEPS[_tutStep];
            if (!step) { closeTutorial(); return; }
            if (step.tab) setTab(step.tab);

            var overlay = document.createElement('div');
            overlay.id = '_tut_overlay';
            overlay.style.cssText = 'position:fixed;inset:0;z-index:9000;pointer-events:none;display:flex;align-items:center;justify-content:center;padding:24px;';

            var card = document.createElement('div');
            card.style.cssText = 'background:#181410;border:1px solid #3A3020;border-top:4px solid #CC2020;border-radius:12px;padding:24px 28px 20px;max-width:540px;width:calc(100% - 32px);pointer-events:all;box-shadow:0 8px 48px rgba(0,0,0,0.8);';

            var dots = document.createElement('div');
            dots.style.cssText = 'display:flex;gap:5px;margin-bottom:16px;';
            TUTORIAL_STEPS.forEach(function(_, i) {
                var d = document.createElement('div');
                d.style.cssText = 'width:5px;height:5px;border-radius:50%;flex-shrink:0;background:' + (i === _tutStep ? '#CC2020' : i < _tutStep ? '#5A4E38' : '#2E2820') + ';';
                dots.appendChild(d);
            });

            var hd = document.createElement('div');
            hd.style.cssText = 'display:flex;align-items:center;gap:10px;margin-bottom:10px;';
            var ic = document.createElement('div'); ic.style.fontSize = '24px'; ic.textContent = step.icon;
            var tl = document.createElement('div'); tl.style.cssText = 'font-size:17px;font-weight:900;color:#F0E8D8;letter-spacing:0.01em;'; tl.textContent = step.title;
            hd.appendChild(ic); hd.appendChild(tl);

            var bd = document.createElement('div');
            bd.style.cssText = 'font-size:13px;color:#8A7E6E;line-height:1.75;margin-bottom:18px;';
            bd.textContent = step.body;

            var act = document.createElement('div');
            act.style.cssText = 'display:flex;justify-content:space-between;align-items:center;';

            var skip = document.createElement('button');
            skip.style.cssText = 'background:none;border:none;color:#3A3020;font-size:12px;cursor:pointer;padding:4px 0;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;';
            skip.textContent = 'Skip Tutorial';
            skip.addEventListener('click', closeTutorial);

            var right = document.createElement('div');
            right.style.cssText = 'display:flex;align-items:center;gap:12px;';
            var ctr = document.createElement('div');
            ctr.style.cssText = 'font-size:10px;color:#3A3020;letter-spacing:0.1em;';
            ctr.textContent = (_tutStep + 1) + ' / ' + TUTORIAL_STEPS.length;

            var nxt = document.createElement('button');
            nxt.style.cssText = 'background:#CC2020;color:#fff;border:none;border-radius:6px;padding:9px 20px;font-size:13px;font-weight:800;cursor:pointer;letter-spacing:0.04em;';
            nxt.textContent = step.last ? 'Start Career' : 'Next →';
            nxt.addEventListener('click', function() {
                if (step.last) { closeTutorial(); return; }
                _tutStep++;
                showTutorialStep();
            });

            right.appendChild(ctr); right.appendChild(nxt);
            act.appendChild(skip); act.appendChild(right);
            card.appendChild(dots); card.appendChild(hd); card.appendChild(bd); card.appendChild(act);
            overlay.appendChild(card);
            document.body.appendChild(overlay);
            _tutEl = overlay;
        }

        function closeTutorialOverlay() {
            var old = document.getElementById('_tut_overlay');
            if (old) old.remove();
            _tutEl = null;
        }

        function closeTutorial() {
            closeTutorialOverlay();
            if (G) { G.tutorialDone = true; saveGame(); }
            setTab('dashboard');
        }

        function replayTutorial() {
            if (G) G.tutorialDone = false;
            _tutStep = 0;
            showTutorialStep();
        }

        //REPAIR MODAL
        function openRepairModal(seriesId, result, afterClose) {
            const s = getSeries(seriesId);
            const cond = result.condition ? CONDITIONS.find(c => c.id === result.condition) : null;
            const tier = s ? s.tier : 1;
            const cc = getCarCondition(G, seriesId);

            // Components
            const COMPONENTS = [
                { key: 'engine', label: 'Engine', color: '#EF4444', tier1free: false },
                { key: 'suspension', label: 'Suspension', color: '#F97316', tier1free: false },
                { key: 'chassis', label: 'Chassis', color: '#F59E0B', tier1free: false },
                { key: 'tires', label: 'Tires', color: '#10B981', tier1free: true },
                { key: 'brakes', label: 'Brakes', color: '#3B82F6', tier1free: false },
            ];

            // Base costs per component
            const BASE_COSTS = {
                engine: 2400,
                suspension: 1500,
                chassis: 1200,
                tires: 600,
                brakes: 300,
            };

            // Mandatory repairs from DNF
            const mandatoryIds = result.dnf ? getDNFRepairs(result.dnfReason) : [];
            const mandatoryComponents = new Set();
            mandatoryIds.forEach(id => {
                if (/engine/.test(id)) mandatoryComponents.add('engine');
                if (/trans/.test(id)) mandatoryComponents.add('engine');
                if (/fire/.test(id)) { mandatoryComponents.add('engine'); mandatoryComponents.add('chassis'); }
                if (/rollover/.test(id)) mandatoryComponents.add('chassis');
                if (/crash|hard/.test(id)) { mandatoryComponents.add('chassis'); mandatoryComponents.add('suspension'); }
                if (/suspension/.test(id)) mandatoryComponents.add('suspension');
                if (/tire|blowout/.test(id)) mandatoryComponents.add('tires');
            });

            // Target values
            const targets = {};
            COMPONENTS.forEach(c => {
                targets[c.key] = mandatoryComponents.has(c.key) ? 100 : cc[c.key];
            });

            // Cost calculation , scales with how much repair is needed AND tier
            function calcComponentCost(key, targetVal) {
                const current = cc[key];
                const delta = targetVal - current;
                if (delta <= 0) return 0;
                const mult = REPAIR_TIER_MULT[tier] || 1.0;
                // More degraded = more expensive per point
                const degradationMult = current < 25 ? 1.8 : current < 50 ? 1.3 : 1.0;
                return Math.round(BASE_COSTS[key] * mult * degradationMult * (delta / 100));
            }

            function calcTotal() {
                return COMPONENTS.reduce((sum, c) => sum + calcComponentCost(c.key, targets[c.key]), 0);
            }

            // Build sliders
            const sliders = {};
            const costEls = {};
            const totalEl = h('div', { style: { fontSize: '28px', fontWeight: 900, color: '#F59E0B' } }, fmtMoney(calcTotal()));

            function updateTotal() {
                totalEl.textContent = fmtMoney(calcTotal());
            }

            const componentRows = COMPONENTS.map(c => {
                const current = Math.round(cc[c.key] || 0);
                const isMandatory = mandatoryComponents.has(c.key);
                const isTier12Free = c.tier1free && tier <= 2;
                const barColor = current > 60 ? c.color : current > 30 ? '#F59E0B' : '#EF4444';

                const costEl = h('div', { style: { fontSize: '13px', fontWeight: 700, color: '#F59E0B', minWidth: '60px', textAlign: 'right' } },
                    isTier12Free ? 'Included' : fmtMoney(calcComponentCost(c.key, targets[c.key]))
                );
                costEls[c.key] = costEl;

                const slider = h('input', {
                    type: 'range', min: current, max: 100, value: targets[c.key],
                    disabled: isMandatory || isTier12Free,
                    style: { flex: 1, accentColor: c.color, cursor: isMandatory || isTier12Free ? 'not-allowed' : 'pointer' },
                });
                sliders[c.key] = slider;

                slider.addEventListener('input', () => {
                    targets[c.key] = parseInt(slider.value);
                    costEl.textContent = fmtMoney(calcComponentCost(c.key, targets[c.key]));
                    // Update the fill preview
                    const fill = slider.parentElement.parentElement.querySelector('.comp-fill');
                    if (fill) {
                        const pct = targets[c.key];
                        const fc = pct > 60 ? c.color : pct > 30 ? '#F59E0B' : '#EF4444';
                        fill.style.width = pct + '%';
                        fill.style.background = fc;
                    }
                    updateTotal();
                });

                return h('div', { style: { marginBottom: '14px' } },
                    // Label row
                    h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' } },
                        h('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
                            h('span', { style: { fontSize: '14px', fontWeight: 700, color: '#F9FAFB' } }, c.label),
                            isMandatory ? h('span', { style: { fontSize: '11px', color: '#EF4444', background: '#7F1D1D22', border: '1px solid #EF444444', borderRadius: '3px', padding: '1px 6px', fontWeight: 700 } }, 'MANDATORY') : null,
                            isTier12Free ? h('span', { style: { fontSize: '11px', color: '#10B981', background: '#06513422', border: '1px solid #10B98144', borderRadius: '3px', padding: '1px 6px', fontWeight: 700 } }, 'INCLUDED') : null,
                        ),
                        h('div', { style: { display: 'flex', alignItems: 'center', gap: '12px' } },
                            h('span', { style: { fontSize: '13px', color: '#94A3B8' } }, `${current}% → `),
                            h('span', { style: { fontSize: '13px', fontWeight: 800, color: c.color }, id: `target-${c.key}` }, `${targets[c.key]}%`),
                            costEl,
                        ),
                    ),
                    // Current condition bar
                    h('div', { style: { height: '6px', background: '#1E2433', borderRadius: '3px', overflow: 'hidden', marginBottom: '6px' } },
                        h('div', {
                            className: 'comp-fill', style: {
                                height: '100%',
                                width: targets[c.key] + '%',
                                background: targets[c.key] > 60 ? c.color : targets[c.key] > 30 ? '#F59E0B' : '#EF4444',
                                borderRadius: '3px',
                                transition: 'width 0.2s',
                            }
                        }),
                    ),
                    // Slider
                    isTier12Free || isMandatory ? null : slider,
                    isMandatory ? h('div', { style: { fontSize: '12px', color: '#EF4444', marginTop: '2px' } }, 'Required repair — cannot be reduced') : null,
                    isTier12Free ? h('div', { style: { fontSize: '12px', color: '#10B981', marginTop: '2px' } }, 'Fresh tires included in your entry fee at this level') : null,
                );
            });

            // Update target display when slider moves
            COMPONENTS.forEach(c => {
                if (sliders[c.key]) {
                    sliders[c.key].addEventListener('input', () => {
                        const el = document.getElementById(`target-${c.key}`);
                        if (el) el.textContent = targets[c.key] + '%';
                    });
                }
            });

            const content = h('div', {},
                h('div', { className: 'modal-eyebrow' }, 'Post-Race'),
                h('div', { className: 'modal-title' }, 'Repair & Maintenance'),
                h('div', { className: 'modal-sub' }, `${(s && s.name) || ''} · ${result.dnf ? 'DNF — mandatory repairs required' : 'Adjust sliders to set repair targets'}`),

                cond ? h('div', { style: { display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '14px' } },
                    h('span', { style: { fontSize: '14px', color: '#CBD5E1' } }, 'Race conditions:'),
                    conditionBadge(result.condition),
                    cond.tireWear > 1.1 ? h('span', { style: { fontSize: '14px', color: '#EF4444', marginLeft: '4px' } }, `Tire wear +${Math.round((cond.tireWear - 1) * 100)}%`) : null,
                ) : null,

                h('div', { style: { marginBottom: '16px' } }, ...componentRows),

                h('div', {
                    style: {
                        background: '#060A10', border: '1px solid #1E2433', borderRadius: '8px',
                        padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        marginBottom: '16px',
                    }
                },
                    h('div', null,
                        h('div', { style: { fontSize: '12px', color: '#94A3B8', marginBottom: '2px' } }, 'TOTAL REPAIR COST'),
                        totalEl,
                        h('div', { style: { fontSize: '14px', color: '#CBD5E1', marginTop: '2px' } }, `Balance: ${fmtMoney(G.money)}`),
                    ),
                    h('div', { style: { fontSize: '13px', color: '#64748B', maxWidth: '180px', textAlign: 'right' } },
                        'Drag sliders to choose how much to repair each component.',
                    ),
                ),

                h('div', { className: 'modal-actions' },
                    mkBtn('Skip All Repairs', 'btn btn-ghost', () => {
                        delete $('modal-overlay').dataset.repairOpen;
                        if (afterClose) afterClose();
                        closeModal();
                        render();
                    }),
                    mkBtn('Pay & Repair', 'btn btn-success', () => {
                        const total = calcTotal();
                        G.money -= total;

                        // Apply repairs to car condition
                        COMPONENTS.forEach(c => {
                            const delta = targets[c.key] - cc[c.key];
                            if (delta > 0) cc[c.key] = Math.min(100, cc[c.key] + delta);
                        });

                        const repaired = COMPONENTS.filter(c => targets[c.key] > cc[c.key] || mandatoryComponents.has(c.key));
                        if (total > 0) addLog(G, `🔧 Repairs @ ${(s && s.short) || ''}: ${fmtMoney(total)}`);

                        delete $('modal-overlay').dataset.repairOpen;
                        if (afterClose) afterClose();
                        closeModal();
                        render();
                    }),
                ),
            );

            $('modal-overlay').dataset.repairOpen = 'true';
            openModal(content);
        }

        //BACKGROUND SERIES NEWS
        function maybeFireSeriesNews(state, playerSeriesId) {
            if (Math.random() > 0.20) return; // 20% chance
            const otherSeries = SERIES.filter(s => s.id !== playerSeriesId);
            if (!otherSeries.length) return;
            const s = otherSeries[rand(0, otherSeries.length - 1)];

            const drivers = (state.drivers || []).filter(d => d.currentSeriesId === s.id && d.active);
            if (!drivers.length) return;
            const driver = drivers[rand(0, drivers.length - 1)];

            const templates = [
                `${driver.name} takes the win at ${s.short}. ${driver.wins > 3 ? 'Championship picture shifting.' : 'First win of the season for the team.'}`,
                `Incident-filled race in the ${s.short}. ${driver.name} among those caught up. Several cars damaged.`,
                `${driver.name} leads the ${s.short} points after a strong run. ${rand(2, 8)} races left in the season.`,
                `Mechanical DNF for ${driver.name} in the ${s.short}. The team has work to do before the next round.`,
                `${driver.name} qualifies on pole for the ${s.short} round. Best lap of the session by ${(randF(0.1, 0.5)).toFixed(3)}s.`,
                `Rain delay in the ${s.short}. Race shortened. ${driver.name} finishes in the top five when it counts.`,
                `${driver.name} signs a new contract extension in the ${s.short}. Sources say the deal runs through next season.`,
                `The ${s.short} stewards review an incident involving ${driver.name}. No further action taken.`,
            ];

            const desc = templates[rand(0, templates.length - 1)];

            state.dramaQueue.push({
                id: 'series_news_' + uid(),
                title: `📡 ${s.short} News`,
                effect: 'none',
                desc,
                valence: 'neutral',
                _isNews: true,
            });
        }

        //CALENDAR EVENT DISPLAy
        function maybeFireCalendarEvent() {
            if (Math.random() > 0.15) return; // ~15% chance between races
            const total = CALENDAR_EVENTS.reduce((s, e) => s + e.weight, 0);
            let r = Math.random() * total;
            let evt = null;
            for (const e of CALENDAR_EVENTS) { r -= e.weight; if (r <= 0) { evt = e; break; } }
            if (!evt) return;
            processCalendarEvent(G, evt);
            G.dramaQueue.push({
                id: 'cal_' + Date.now(),
                title: evt.title,
                effect: 'none', // already applied
                desc: evt.desc + (evt.value ? ` (${evt.value > 0 ? '+' : ''}${evt.effect === 'fans' ? fmtFans(evt.value) : fmtMoney(evt.value)})` : ''),
                valence: evt.valence,
            });
            saveGame();
        }

        const _origOpenRaceModal = openRaceModal;
        openRaceModal = function (seriesId, raceIdx) {
            const sched = G.schedules[seriesId] || [];
            const race = sched[raceIdx];
            const cond = (race && race.condition) ? CONDITIONS.find(c => c.id === race.condition) : null;
            if (cond) {
                const s = getSeries(seriesId);
                const isPremier = !!(race && race.isPremier);

                // Premier event: generate guest field for roster card
                let premierGuestNames = [];
                if (isPremier) {
                    const regularNames = new Set(
                        (G.drivers || [])
                            .filter(d => d.active && d.currentSeriesId === seriesId)
                            .map(d => d.name.toLowerCase())
                    );
                    // Pull known drivers from one tier higher for guest flavor
                    const guestPool = (G.drivers || []).filter(d =>
                        d.source === 'known' && d.active &&
                        !regularNames.has(d.name.toLowerCase())
                    );
                    // Shuffle and take up to 8 guest names
                    const shuffledGuests = guestPool.sort(() => Math.random() - 0.5);
                    premierGuestNames = shuffledGuests.slice(0, Math.min(8, shuffledGuests.length)).map(d => d.name);
                    // Pad with generated names if needed
                    while (premierGuestNames.length < 5) {
                        let name = generateAIName();
                        let tries = 0;
                        while (premierGuestNames.includes(name) && tries < 50) { name = generateAIName(); tries++; }
                        premierGuestNames.push(name);
                    }
                }

                openModal(h('div', {},
                    // Premier banner
                    isPremier ? h('div', {
                        style: {
                            background: 'linear-gradient(135deg, #78350F, #92400E)',
                            border: '1px solid #F59E0B',
                            borderRadius: '8px',
                            padding: '10px 14px',
                            marginBottom: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                        }
                    },
                        h('div', { style: { fontSize: '24px' } }, '⭐'),
                        h('div', null,
                            h('div', { style: { fontSize: '13px', fontWeight: 900, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.15em' } }, 'Premier Event'),
                            h('div', { style: { fontSize: '15px', fontWeight: 800, color: '#FDE68A' } }, race.premierName),
                            h('div', { style: { fontSize: '13px', color: '#D97706' } }, `${race.premierLaps} laps · Double points · Expanded field`),
                        ),
                    ) : null,

                    h('div', { className: 'modal-eyebrow' }, `${(s && s.short) || ''} Round ${(race && race.round) || ''} — Race Day`),
                    h('div', { className: 'modal-title' }, isPremier ? race.premierName : (race && race.track) || ''),
                    h('div', { className: 'modal-sub' }, `${(race && race.track) || ''} · ${(race && race.city) || ''}, ${(race && race.state) || ''}`),

                    // Premier roster card
                    isPremier ? h('div', {
                        style: {
                            background: '#060A10',
                            border: '1px solid #F59E0B33',
                            borderRadius: '8px',
                            padding: '12px 14px',
                            marginBottom: '14px',
                        }
                    },
                        h('div', { style: { fontSize: '11px', fontWeight: 700, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '8px' } }, '📋 Guest Entries — Add to iRacing Roster'),
                        h('div', { style: { fontSize: '13px', color: '#94A3B8', marginBottom: '8px', lineHeight: '1.5' } },
                            'These drivers are entered for this event only. Add them to your iRacing AI roster before starting. Remove them after the race.'
                        ),
                        h('div', { style: { display: 'flex', gap: '6px', flexWrap: 'wrap' } },
                            ...premierGuestNames.map(name =>
                                h('span', {
                                    style: {
                                        background: '#F59E0B18',
                                        border: '1px solid #F59E0B44',
                                        borderRadius: '4px',
                                        padding: '3px 9px',
                                        fontSize: '13px',
                                        fontWeight: 700,
                                        color: '#FDE68A',
                                    }
                                }, name)
                            )
                        ),
                        h('div', { style: { fontSize: '12px', color: '#64748B', marginTop: '8px' } },
                            'Field is larger this week. Use a higher skill range for guest drivers in iRacing AI settings.'
                        ),
                    ) : null,

                    h('div', { style: { textAlign: 'center', padding: isPremier ? '12px 0' : '20px 0' } },
                        h('div', { style: { fontSize: isPremier ? '40px' : '64px', marginBottom: '8px' } }, cond.icon),
                        conditionBadge(cond.id),
                        h('div', { style: { fontSize: '14px', color: '#CBD5E1', marginTop: '10px', fontFamily: 'sans-serif', lineHeight: '1.5' } }, cond.desc),
                        cond.prizeMult < 1 ? h('div', { style: { fontSize: '14px', color: '#F59E0B', marginTop: '6px' } }, `⚠️ Shortened race — prize money and points at ${Math.round(cond.prizeMult * 100)}%`) : null,
                        cond.fanBonus > 0 ? h('div', { style: { fontSize: '14px', color: '#EC4899', marginTop: '4px' } }, `+${fmtFans(cond.fanBonus)} fan bonus for racing in these conditions`) : null,
                    ),
                    h('div', { className: 'modal-actions' },
                        mkBtn(isPremier ? '⭐ Race Day →' : 'Let\'s Race →', 'btn btn-lg btn-primary', () => {
                            try {
                                closeModal();
                                if (race) race._pendingCondition = { cond, prizeMult: cond.prizeMult, fanBonus: cond.fanBonus };
                                _origOpenRaceModal(seriesId, raceIdx);
                            } catch (err) {
                                console.error('Let\'s Race error:', err);
                                alert('Error opening race modal:\\n' + err.message + '\\n\\nLine: ' + (err.stack || '').split('\\n')[1]);
                            }
                        })
                    )
                ));
            } else {
                _origOpenRaceModal(seriesId, raceIdx);
            }
        };