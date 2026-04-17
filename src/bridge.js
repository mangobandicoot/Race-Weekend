// iracing sdk panel
var SDK_URL = 'http://localhost:54321';
var _sdkStatus = { connected: false, checked: false };
var _sdkPollInterval = null;

function sdkPoll() {
    fetch(SDK_URL + '/status')
        .then(function(r) { return r.json(); })
        .then(function(data) {
            _sdkStatus = Object.assign({}, data, { checked: true, error: false });
            // also grab live stress/rpm if actually racing
            if (data.connected && !data.session_finished) {
                fetch(SDK_URL + '/live')
                    .then(function(r) { return r.json(); })
                    .then(function(live) {
                        _sdkStatus.engine_stress    = live.engine_stress || 0;
                        _sdkStatus.player_rpm       = live.player_rpm || 0;
                        _sdkStatus.live_cautions    = live.yellows || 0;
                        _sdkStatus.live_black_flags = live.black_flags || 0;
                    })
                    .catch(function() {});
            }
        })
        .catch(function() {
            _sdkStatus = { connected: false, checked: true, error: true };
        });
}

function sdkStartPolling() {
    if (_sdkPollInterval) return;
    sdkPoll();
    _sdkPollInterval = setInterval(sdkPoll, 2000);
}

function sdkInjectIntoModal(ta, parseBtn) {
    fetch(SDK_URL + '/result')
        .then(function(r) { return r.json(); })
        .then(function(data) {
            if (!data.result || !data.result.finish_order || !data.result.finish_order.length) {
                alert('No result ready yet. Finish a race in iRacing first.');
                return;
            }
            var fo = data.result.finish_order;
            var flags = data.result.flags || {};
            var bfs = flags.black_flags || [];
            var dnfCars = {};
            bfs.forEach(function(bf) { if (bf.is_dnf) dnfCars[bf.car] = bf.reason; });
            var lines = fo.map(function(d) {
                var isMe = d.is_player || (G.driverName && d.name.toLowerCase() === G.driverName.toLowerCase());
                var forceDnf = d.dnf || (d.car_number && dnfCars[d.car_number]);
                var line = d.position + '. ' + (isMe ? 'You' : d.name);
                if (forceDnf) line += ' DNF';
                return line;
            });
            ta.value = lines.join('\n');
            ta.dispatchEvent(new Event('input', { bubbles: true }));
            setTimeout(function() {
                if (parseBtn) parseBtn.click();
                var contract = (G.contracts || [])[0];
                if (contract) {
                    var sched = G.schedules[contract.seriesId] || [];
                    var nextRace = sched.findIndex(function(r) { return !r.result; });
                    if (nextRace >= 0 && sched[nextRace]) sched[nextRace]._sdkFlags = flags;
                }
                if (flags.player_kerb_hits && contract) {
                    var cc = getCarCondition(G, contract.seriesId);
                    var kd = Math.min(flags.player_kerb_hits * 8, 35);
                    cc.suspension = Math.max(0, (cc.suspension || 100) - kd);
                    cc.tires = Math.max(0, (cc.tires || 100) - Math.floor(kd * 0.6));
                    addLog(G, '🟠 Kerb damage: -' + kd + ' suspension, -' + Math.floor(kd * 0.6) + ' tires');
                }
                var _tp = [];
                if (flags.yellow_count) _tp.push(flags.yellow_count + ' caution' + (flags.yellow_count > 1 ? 's' : ''));
                if (flags.black_flag_count) _tp.push(flags.black_flag_count + ' flag' + (flags.black_flag_count > 1 ? 's' : ''));
                if (_tp.length) showSummaryToast('🏁 ' + _tp.join(' · ') + ' · ' + fo.length + ' drivers loaded', '#10B981', 'SDK');
                else showSummaryToast('✅ ' + fo.length + ' drivers loaded from iRacing', '#10B981', 'SDK');
            }, 150);
        })
        .catch(function() { alert('Bridge not running. Start bridge.py first.'); });
}

function sdkInjectResult() {
    fetch(SDK_URL + '/result')
        .then(function(r) { return r.json(); })
        .then(function(data) {
            if (!data.result || !data.result.finish_order || !data.result.finish_order.length) {
                alert('No result ready yet. Finish a race in iRacing first, then try again.');
                return;
            }
            var fo = data.result.finish_order;

            // find the next race we havent done yet
            var contract = null;
            var nextRace = -1;
            (G.contracts || []).forEach(function(c) {
                if (nextRace >= 0) return;
                var sched = G.schedules[c.seriesId] || [];
                var idx = sched.findIndex(function(r) { return !r.result; });
                if (idx >= 0) { contract = c; nextRace = idx; }
            });
            if (!contract || nextRace < 0) {
                alert('No upcoming race found. Check your schedule.');
                return;
            }

            // build the paste - sdk position, swap player name for You
            var flags = data.result.flags || {};
            var pasteLines = fo.map(function(d) {
                var isMe = d.is_player ||
                    (G.driverName && d.name.toLowerCase() === G.driverName.toLowerCase());
                var line = d.position + '. ' + (isMe ? 'You' : d.name);
                if (d.dnf) line += ' DNF';
                return line;
            });
            var pasteText = pasteLines.join('\n');

            // kerb hits hurt the car
            if (flags.player_kerb_hits && flags.player_kerb_hits > 0 && G.contracts && G.contracts[0]) {
                var sid = G.contracts[0].seriesId;
                var cc = getCarCondition(G, sid);
                var kerbDamage = Math.min(flags.player_kerb_hits * 8, 35);
                cc.suspension = Math.max(0, (cc.suspension || 100) - kerbDamage);
                cc.tires = Math.max(0, (cc.tires || 100) - Math.floor(kerbDamage * 0.6));
                addLog(G, '🟠 Kerb damage applied: suspension -' + kerbDamage + ', tires -' + Math.floor(kerbDamage * 0.6));
            }

            // attach sdk flags so the modal can show them
            var nextSched = G.schedules[contract.seriesId] || [];
            if (nextSched[nextRace]) nextSched[nextRace]._sdkFlags = flags;

            // flag toast
            if (flags.yellow_count || flags.black_flag_count) {
                var flagSummary = [];
                if (flags.yellow_count) flagSummary.push(flags.yellow_count + ' caution' + (flags.yellow_count > 1 ? 's' : ''));
                if (flags.black_flag_count) flagSummary.push(flags.black_flag_count + ' black flag' + (flags.black_flag_count > 1 ? 's' : ''));
                showSummaryToast('🏁 ' + flagSummary.join(' · '), '#F59E0B', 'Flags');
            }

            // open modal then inject - has to wait for render
            openRaceModal(contract.seriesId, nextRace);

            // try a few times, modal might be slow
            var attempts = 0;
            function tryFill() {
                attempts++;
                var ta = document.querySelector('textarea[placeholder*="Paste"]') ||
                         document.querySelector('textarea[placeholder*="iRacing"]') ||
                         document.querySelector('textarea[rows="8"]');
                if (ta) {
                    ta.value = pasteText;
                    ta.dispatchEvent(new Event('input', { bubbles: true }));
                    // hit parse
                    var parseBtn = Array.from(document.querySelectorAll('button'))
                        .find(function(b) {
                            return b.textContent.includes('Parse') || b.textContent.includes('Clean');
                        });
                    if (parseBtn) {
                        setTimeout(function() {
                            parseBtn.click();
                            showSummaryToast(
                                '✅ ' + fo.length + ' drivers from iRacing — review and submit.',
                                '#10B981', 'SDK'
                            );
                        }, 100);
                    } else {
                        showSummaryToast(
                            '✅ ' + fo.length + ' drivers loaded — scroll down and submit.',
                            '#10B981', 'SDK'
                        );
                    }
                } else if (attempts < 5) {
                    setTimeout(tryFill, 300);
                } else {
                    // give up and show it for manual paste
                    showSummaryToast('📋 Paste this into the race modal manually.', '#F59E0B', 'SDK');
                    console.log('[SDK] Paste text:\n' + pasteText);
                    alert('Auto-fill failed after 5 attempts. The result is in the browser console (F12) — copy and paste it manually.');
                }
            }
            setTimeout(tryFill, 350);
        })
        .catch(function() {
            alert('Bridge not running. Start bridge.py in your terminal first.');
        });
}

function renderSdkPanel() {
    var _bridgeEnabled = true; // on by default
    // honor the toggle
    if (typeof window !== 'undefined' && window.electronBridge) {
        window.electronBridge.getBridgeEnabled().then(function(val) {
            _bridgeEnabled = val;
        });
    }
    if (_bridgeEnabled) sdkStartPolling();
    var isRunning   = _sdkStatus.checked && !_sdkStatus.error;
    var isConnected = _sdkStatus.connected;
    var isRacing    = isConnected && _sdkStatus.session_type === 'Race' && !_sdkStatus.session_finished;
    var statusColor = !isRunning ? '#EF4444' : isConnected ? '#10B981' : '#F59E0B';
    var statusText  = !isRunning ? 'Bridge not running' :
                      isConnected ? 'iRacing connected — ' + (_sdkStatus.track || 'track unknown') :
                      'Bridge running — iRacing not detected';
    var statusIcon  = !isRunning ? '🔴' : isConnected ? '🟢' : '🟡';

    // stress color
    var stress      = _sdkStatus.engine_stress || 0;
    var stressColor = stress < 40 ? '#10B981' : stress < 70 ? '#F59E0B' : '#EF4444';
    var stressLabel = stress < 40 ? 'Normal' : stress < 70 ? 'Elevated' : stress < 90 ? 'High — back off!' : '🔴 Critical!';

    return h('div', { className: 'card', style: { marginBottom: '16px', border: '1px solid #1E2433' } },

        // header
        h('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' } },
            h('div', { style: { fontSize: '18px', fontWeight: 900, color: '#F9FAFB', flex: 1 } }, '🔌 iRacing Bridge'),
            typeof window !== 'undefined' && window.electronBridge ? (function() {
                var _enabled = !!(G.settings && G.settings.bridgeEnabled !== false);
                var _cb = h('input', { type: 'checkbox', checked: _enabled, style: { accentColor: '#10B981', width: '14px', height: '14px', cursor: 'pointer' } });
                _cb.addEventListener('change', function() {
                    if (!G.settings) G.settings = {};
                    G.settings.bridgeEnabled = _cb.checked;
                    window.electronBridge.setBridgeEnabled(_cb.checked);
                    saveGame(); render();
                });
                return h('label', { style: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748B', cursor: 'pointer' } },
                    _cb, 'Auto-start'
                );
            })() : null,
            h('div', { style: { fontSize: '12px', color: statusColor, fontWeight: 700 } }, statusIcon + ' ' + statusText),
        ),

        // live stats - only show while actually racing
        isRacing ? h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '12px' } },
            h('div', { style: { background: '#060A10', borderRadius: '6px', padding: '8px', textAlign: 'center' } },
                h('div', { style: { fontSize: '10px', color: '#64748B', marginBottom: '2px' } }, 'CAUTIONS'),
                h('div', { style: { fontSize: '20px', fontWeight: 900, color: '#F59E0B' } },
                    String(_sdkStatus.live_cautions || 0)),
            ),
            h('div', { style: { background: '#060A10', borderRadius: '6px', padding: '8px', textAlign: 'center' } },
                h('div', { style: { fontSize: '10px', color: '#64748B', marginBottom: '2px' } }, 'FLAGS'),
                h('div', { style: { fontSize: '20px', fontWeight: 900, color: '#EF4444' } },
                    String(_sdkStatus.live_black_flags || 0)),
            ),
            h('div', { style: { background: '#060A10', borderRadius: '6px', padding: '8px', textAlign: 'center' } },
                h('div', { style: { fontSize: '10px', color: '#64748B', marginBottom: '2px' } }, 'RPM'),
                h('div', { style: { fontSize: '16px', fontWeight: 900, color: '#94A3B8' } },
                    _sdkStatus.player_rpm ? String(Math.round(_sdkStatus.player_rpm)) : '—'),
            ),
            h('div', { style: { background: '#060A10', borderRadius: '6px', padding: '8px', textAlign: 'center' } },
                h('div', { style: { fontSize: '10px', color: '#64748B', marginBottom: '2px' } }, 'ENGINE'),
                h('div', { style: { fontSize: '14px', fontWeight: 900, color: stressColor } }, stressLabel),
            ),
        ) : null,

        // stress bar
        isRacing && stress > 0 ? h('div', { style: { marginBottom: '12px' } },
            h('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748B', marginBottom: '4px' } },
                h('span', null, 'Engine Stress'),
                h('span', { style: { color: stressColor, fontWeight: 700 } }, stress.toFixed(1) + '%'),
            ),
            h('div', { style: { height: '6px', background: '#1E2433', borderRadius: '3px', overflow: 'hidden' } },
                h('div', { style: {
                    height: '100%', width: Math.min(stress, 100) + '%',
                    background: stressColor, borderRadius: '3px',
                    transition: 'width 0.5s, background 0.5s',
                }}),
            ),
        ) : null,

        h('div', { style: { fontSize: '13px', color: '#64748B', marginBottom: '10px', lineHeight: '1.6' } },
            isRunning
                ? isRacing
                    ? 'Race in progress. Flag data updating live.'
                    : 'Bridge active. Import result when race finishes.'
                : 'Start bridge.py in your terminal to connect.'
        ),

        h('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
            mkBtn('🔄 Refresh', 'btn btn-sm btn-ghost', function() { sdkPoll(); setTimeout(render, 400); }),
            isRacing ? mkBtn('🟡 Yellow', 'btn btn-sm btn-warn', function() {
                fetch(SDK_URL + '/cmd/yellow', { method: 'POST' })
                    .then(function() { showSummaryToast('🟡 Full course yellow sent', '#F59E0B', 'SDK'); })
                    .catch(function() { alert('Bridge not reachable.'); });
            }) : null,
            isRacing ? mkBtn('🟢 Green', 'btn btn-sm btn-ghost', function() {
                fetch(SDK_URL + '/cmd/green', { method: 'POST' })
                    .then(function() { showSummaryToast('🟢 Green flag sent', '#10B981', 'SDK'); })
                    .catch(function() { alert('Bridge not reachable.'); });
            }) : null,
        ),

        isConnected && _sdkStatus.session_finished ? h('div', {
            style: { marginTop: '10px', background: '#060A10', borderRadius: '8px',
                     padding: '10px 14px', fontSize: '13px', color: '#10B981', border: '1px solid #10B98144' }
        }, '✅ Race finished — result ready to import from the Schedule page.') : null,
    );
}