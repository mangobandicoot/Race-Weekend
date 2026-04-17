// contract generation
        function makeContract(seriesId, quality) {
            const s = getSeries(seriesId);
            const teamList = TEAMS[seriesId] || ['Independent Racing'];
            const team = teamList[rand(0, teamList.length - 1)];
            const mult = { poor: 0.7, average: 1.0, good: 1.3, elite: 1.7 }[quality];
            const termSeasons = rand(1, s.maxTerm);
            const tmCount = rand(0, Math.min(s.maxTm, quality === 'elite' ? 3 : quality === 'good' ? 2 : 1));
            // what % the driver keeps - 60% on a bad deal, 85% elite
            // national teams flip this - they pay to attract talent
            const prizeShare = s.tier <= 3
                ? { poor: 0.60, average: 0.70, good: 0.78, elite: 0.85 }[quality]
                : { poor: 0.70, average: 0.80, good: 0.88, elite: 0.95 }[quality];
            // higher tiers come with a signing bonus
            const signingBonus = s.tier >= 4 ? Math.floor(s.pay * s.races * mult * randF(0.2, 0.4)) : 0;
            return {
                id: uid(),
                team, seriesId, quality,
                salary: signingBonus,       // signing bonus not weekly salary
                prizeShare,                 // driver's cut of prize money
                entryFee: s.fee,            // driver pays entry every race no matter what
                termSeasons,
                seasonsCompleted: 0,
                winBonus: Math.floor(s.winBonus * mult * randF(0.5, 0.9)),
                races: s.races,
                racesCompleted: 0,
                earnings: 0,
                missedFinishWarnings: 0,
                reqFinish: quality === 'elite' ? 8 : quality === 'good' ? 12 : 18,
                penaltyRate: 0.35,
                buyoutRate: 0.50,
                teammates: new Array(tmCount).fill(null), // placeholders, filled in doSignContract
                crewPackage: 'basic',
                indie: false,
            };
        }

        function applyPerRaceSponsorPayments(state, seriesId) {
            // t1-2 sponsors pay per race not seasonal
            const s = getSeries(seriesId);
            if (!s || s.tier > 2) return;
            (state.sponsors || []).forEach(function(sp) {
                if (!sp.active) return;
                const perRace = sp.valuePerRace || Math.floor((sp.value || 0) / 16);
                if (perRace <= 0) return;
                state.money += perRace;
                state.totalMerchRevenue = (state.totalMerchRevenue || 0) + perRace;
                addLog(state, '💰 ' + sp.brand + ' per-race payment: +' + fmtMoney(perRace));
            });
        }

        function generateOffers(rep, fans) {
            const offers = [];
            const completedSeriesIds = new Set((G && G.raceHistory || []).map(r => r.seriesId));
            const highestCompletedTier = completedSeriesIds.size > 0
                ? Math.max(...[...completedSeriesIds].map(sid => (getSeries(sid) && getSeries(sid).tier) || 1))
                : 1;
          const maxOfferTier = highestCompletedTier + 1; // one step at a time

            // count seasons per tier to gate progression
            const seasonsByTier = {};
            completedSeriesIds.forEach(function(sid) {
                var t = (getSeries(sid) && getSeries(sid).tier) || 1;
                seasonsByTier[t] = (seasonsByTier[t] || 0) + 1;
            });

            // series we're already in
            const activeSeriesIds = new Set((G && G.contracts || []).map(c => c.seriesId));
            // highest tier we're racing in right now
            const activeTier = activeSeriesIds.size > 0
                ? Math.max(...[...activeSeriesIds].map(sid => (getSeries(sid) && getSeries(sid).tier) || 1))
                : 0;

            SERIES.forEach(s => {
                if (s.isSideStep) return; // side series go through pit road
                if (s.tier > maxOfferTier) return;
                // dont offer where we're already racing
                if (activeSeriesIds.has(s.id)) return;
                // t1-2 are open entry only
                if (s.tier <= 2) return;
                // need t1 or t2 season done before late model
                if (s.tier === 3 && highestCompletedTier < 2) return;
                // need a late model season first
                if (s.tier === 4 && (seasonsByTier[3] || 0) < 1) return;
                // need arca first
                // AND must own a truck — no valid free AI alternative exists
                if (s.tier === 5 && (seasonsByTier[4] || 0) < 1) return;
                if (s.tier === 5 && !(G.ownedCars || {}).nascar_trucks) return;
                // Tier 6 (Xfinity): need at least 1 completed season at tier 5 OR tier 4
                // if trucks were skipped due to no ownership
                if (s.tier === 6) {
                    var hasTruckSeason = (seasonsByTier[5] || 0) >= 1;
                    var truckOwned = !!(G.ownedCars || {}).nascar_trucks;
                    var hasARCASeason = (seasonsByTier[4] || 0) >= 1;
                    // Allow skip: ARCA done + no truck owned = can go straight to Xfinity
                    if (!hasTruckSeason && !(hasARCASeason && !truckOwned)) return;
                }
                // Tier 7 (Cup): need at least 1 completed season at tier 6
                if (s.tier === 7 && (seasonsByTier[6] || 0) < 1) return;
                if (rep >= s.reqRep - 10 && fans >= s.reqFans * 0.5) {
                    const chance = rep >= s.reqRep ? 0.65 : 0.25;
                    if (Math.random() < chance) {
                        const c = makeContract(s.id, q);
                        // Tier 1-2: mostly independent — no teammates, no salary, keep full prize
                        if (s.tier <= 2) {
                            c.indie = false; // still a "team" but in name only
                            c.teammates = []; // no teammates — solo operation
                            c.salary = 0;
                            c.prizeShare = q === 'good' ? 0.90 : 0.85; // keep most of it
                            c.winBonus = Math.floor(c.winBonus * 0.4); // small contingency bonus
                            c.teamStyle = 'independent';
                        }
                        // Tier 3: shared shop / small team — maybe one teammate
                        else if (s.tier === 3) {
                            c.teammates = Math.random() < 0.4 ? [null] : []; // 40% chance of one shared-shop partner
                            c.salary = 0;
                            c.prizeShare = q === 'good' ? 0.82 : 0.75;
                            c.teamStyle = 'small_team';
                        }
                        // Tier 4+: proper development/pro teams — already correct
                        else {
                            c.teamStyle = s.tier >= 6 ? 'pro_team' : 'development_team';
                        }
                        offers.push(c);
                    }
                }
            });
            if (!offers.length) {
                // No fallback — at tier 1-2 player runs open entry, no team contract needed
                return offers;
                const fallback = makeContract('mini_stock', 'poor');
                fallback.indie = false;
                fallback.teammates = [];
                fallback.salary = 0;
                fallback.prizeShare = 0.85;
                fallback.teamStyle = 'independent';
                offers.push(fallback);
            }
            return shuffle(offers).slice(0, 4);
        }

        // car purchase (tiers 1-3 only — fake app money)
        function openCarPurchaseModal(seriesId, onPurchase) {
            var s = getSeries(seriesId);
            if (!s || s.tier > 3) return; // tiers 4+ are team-owned
            var canAffordNew  = G.money >= s.carCostNew;
            var canAffordUsed = G.money >= s.carCostUsed;

            openModal(h('div', null,
                h('div', { className: 'modal-eyebrow' }, s.short + ' — Car Purchase'),
                h('div', { className: 'modal-title' }, 'Buy a Car'),
                h('div', { className: 'modal-sub' }, 'You need your own car to race at this level. Teams don\'t provide one until ARCA.' ),
                h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' } },
                    h('div', { style: { background: '#060A10', border: '1px solid #10B98144', borderRadius: '10px', padding: '18px' } },
                        h('div', { style: { fontSize: '20px', marginBottom: '6px' } }, '🆕'),
                        h('div', { style: { fontSize: '16px', fontWeight: 900, color: '#10B981', marginBottom: '4px' } }, 'New Car'),
                        h('div', { style: { fontSize: '24px', fontWeight: 900, color: '#F9FAFB', marginBottom: '8px' } }, fmtMoney(s.carCostNew)),
                        h('div', { style: { fontSize: '13px', color: '#94A3B8', marginBottom: '12px', lineHeight: '1.6' } },
                            'Fresh build. No hidden issues. Full condition on all components.'
                        ),
                        mkBtn(
                            canAffordNew ? 'Buy New — ' + fmtMoney(s.carCostNew) : 'Need ' + fmtMoney(s.carCostNew - G.money) + ' more',
                            'btn btn-success btn-full',
                            function() {
                                G.money -= s.carCostNew;
                                if (!G.appCarsOwned) G.appCarsOwned = {};
                                G.appCarsOwned[seriesId] = true;
                                var cc = getCarCondition(G, seriesId);
                                Object.keys(cc).forEach(function(k) { cc[k] = 100; });
                                addLog(G, '🚗 Bought new ' + s.short + ' car — ' + fmtMoney(s.carCostNew));
                                closeModal();
                                if (onPurchase) onPurchase();
                                saveGame(); render();
                            },
                            !canAffordNew
                        ),
                    ),
                    h('div', { style: { background: '#060A10', border: '1px solid #F59E0B44', borderRadius: '10px', padding: '18px' } },
                        h('div', { style: { fontSize: '20px', marginBottom: '6px' } }, '🔧'),
                        h('div', { style: { fontSize: '16px', fontWeight: 900, color: '#F59E0B', marginBottom: '4px' } }, 'Used Car'),
                        h('div', { style: { fontSize: '24px', fontWeight: 900, color: '#F9FAFB', marginBottom: '8px' } }, fmtMoney(s.carCostUsed)),
                        h('div', { style: { fontSize: '13px', color: '#94A3B8', marginBottom: '12px', lineHeight: '1.6' } },
                            'Previous owner raced it hard. Starts at 55–75% condition. Risk of surprise DNF each race until repaired to 85%+.'
                        ),
                        mkBtn(
                            canAffordUsed ? 'Buy Used — ' + fmtMoney(s.carCostUsed) : 'Need ' + fmtMoney(s.carCostUsed - G.money) + ' more',
                            'btn btn-warn btn-full',
                            function() {
                                G.money -= s.carCostUsed;
                                if (!G.appCarsOwned) G.appCarsOwned = {};
                                G.appCarsOwned[seriesId] = true;
                                var cc = getCarCondition(G, seriesId);
                                cc.engine     = rand(45, 70);
                                cc.suspension = rand(50, 75);
                                cc.chassis    = rand(55, 80);
                                cc.tires      = rand(40, 65);
                                cc.brakes     = rand(45, 70);
                                G._usedCarSeriesId = seriesId;
                                addLog(G, '🔧 Bought used ' + s.short + ' car — ' + fmtMoney(s.carCostUsed) + ' (wear risk active until repaired)');
                                closeModal();
                                if (onPurchase) onPurchase();
                                saveGame(); render();
                            },
                            !canAffordUsed
                        ),
                    ),
                ),
                h('div', { className: 'modal-actions' },
                    mkBtn('Not yet', 'btn btn-ghost', closeModal),
                ),
            ));
        }

        // sponsor generation
        function makeSponsor(seriesId, type = 'primary', international = false) {
            const brands = international ? SPONSOR_BRANDS.international : (SPONSOR_BRANDS[seriesId] || SPONSOR_BRANDS.mini_stock);
            const brand = brands[rand(0, brands.length - 1)];
            const st = SPONSOR_TYPES[international ? 'international' : type];
            const s = getSeries(seriesId);
            // Sponsor value scaled more conservatively — primary ~3x race pay, associate ~0.8x
            const base = Math.floor(s.pay * (type === 'primary' ? 3 : type === 'associate' ? 0.8 : 0.3) * randF(0.8, 1.3));
            const seasons = rand(st.dur[0], st.dur[1]);
            return {
                id: uid(),
                brand, type: international ? 'international' : type, seriesId,
                valuePerSeason: base,
                seasonsLeft: seasons, totalSeasons: seasons,
                happiness: 75,
                winBonus: Math.floor(base * 0.15),
                top5Bonus: Math.floor(base * 0.05),
                minHappy: 25,
                international,
            };
        }

        function sponsorOffersForSeries(seriesId) {
            const out = [];
            if (Math.random() < 0.7) out.push(makeSponsor(seriesId, 'primary'));
            if (Math.random() < 0.8) out.push(makeSponsor(seriesId, 'associate'));
            if (Math.random() < 0.5) out.push(makeSponsor(seriesId, 'associate'));
            const s = getSeries(seriesId);
            if (s.tier >= 3 && Math.random() < 0.6) out.push(makeSponsor(seriesId, 'contingency'));
            return out;
        }
        // paddock
        function renderPaddock() {
            var f = document.createDocumentFragment();
            f.appendChild(h('div', { className: 'page-title' }, 'Paddock'));
            f.appendChild(h('div', { className: 'page-sub' }, 'Action required items stay pinned until confirmed. Everything else dismisses normally.'));
            const queue = (G.dramaQueue || []).filter(function (d) {
                return d.effect !== 'money' && d.effect !== 'sponsor_warning' && !d._isFanMail && !d._isSponsor;

            });
            if (!queue.length) {
                f.appendChild(h('div', { className: 'card', style: { textAlign: 'center', padding: '28px', color: '#94A3B8', fontSize: '15px' } }, 'Nothing requiring your attention right now.'));
                return f;
            }
            var indexed = queue.map(function (d, i) { return { d: d, i: i }; });
            indexed.sort(function (a, b) {
                function pri(d) {
                    if (d._requiresAction) return 0;
                    if (d.title && d.title.indexOf('Injur') >= 0) return 1;
                    if (d._isCallout) return 2;
                    if (d._isTeamOrder) return 3;
                    if (d._isNews || d._isRumor) return 5;
                    return 4;
                }
                return pri(a.d) - pri(b.d);
            });
            indexed.forEach(function (item) {
                var d = item.d;
                var isAction = !!d._requiresAction;
                var borderColor = isAction ? '#F59E0B44' : d._isTradeRumor ? '#8B5CF644' : d.valence === 'bad' ? '#EF444444' : d.valence === 'good' ? '#10B98133' : '#1E2433';
                var bg = isAction ? '#1a1200' : d._isTradeRumor ? '#0D0A1A' : '#0B0F1A';
                var effectTag = null;
                if (d.effect === 'rep_hit' && d.value) {
                    var repTxt = 'Rep ' + d.value;
                    var fanTxt = d.fans ? ' · Fans ' + d.fans : '';
                    effectTag = h('span', { style: { fontSize: '14px', fontWeight: 700, color: '#EF4444', background: '#7F1D1D22', padding: '2px 8px', borderRadius: '4px', marginLeft: '8px' } }, repTxt + fanTxt);
                } else if (d.effect === 'money' && d.value) {
                    var col = d.value > 0 ? '#10B981' : '#EF4444';
                    var bg2 = d.value > 0 ? '#06513422' : '#7F1D1D22';
                    effectTag = h('span', { style: { fontSize: '14px', fontWeight: 700, color: col, background: bg2, padding: '2px 8px', borderRadius: '4px', marginLeft: '8px' } }, (d.value > 0 ? '+' : '') + fmtMoney(d.value));
                } else if (d.effect === 'rep_fans') {
                    var parts = [];
                    if (d.value) parts.push('Rep +' + d.value);
                    if (d.fans) parts.push('Fans +' + fmtFans(d.fans));
                    if (parts.length) effectTag = h('span', { style: { fontSize: '14px', fontWeight: 700, color: '#10B981', background: '#06513422', padding: '2px 8px', borderRadius: '4px', marginLeft: '8px' } }, parts.join(' · '));
                }
                var banner = h('div', { style: { background: bg, border: '1px solid ' + borderColor, borderRadius: '8px', padding: '14px 16px', marginBottom: '10px' } });
                banner.appendChild(h('div', { style: { display: 'flex', alignItems: 'center', marginBottom: '5px' } },
                    h('div', { style: { fontSize: '15px', fontWeight: 800, color: isAction ? '#FBBF24' : '#F9FAFB' } }, d.title),
                    effectTag
                ));
                banner.appendChild(h('div', { style: { fontSize: '14px', color: '#E2E8F0', lineHeight: '1.5', marginBottom: '10px' } }, d.desc));
                if (isAction) {
                    var cb = h('input', { type: 'checkbox' });
                    var lbl = h('label', { style: { display: 'inline-flex', gap: '10px', alignItems: 'center', cursor: 'pointer', fontSize: '18px', color: '#F59E0B', fontWeight: 700, padding: '8px 14px', background: '#1A1200', border: '1px solid #F59E0B44', borderRadius: '6px', marginTop: '4px' } }, cb, d._actionLabel || 'Mark as done');
                    cb.addEventListener('change', function () {
                        if (cb.checked) {
                            var idx = G.dramaQueue.findIndex(function (x) { return x.id === d.id; });
                            if (idx >= 0) G.dramaQueue.splice(idx, 1);
                            addLog(G, 'Acknowledged: ' + d.title);
                            saveGame(); render();
                        }
                    });
                    banner.appendChild(lbl);
                } else if (d._action && d._action.startsWith('tab:')) {
                    var targetTab = d._action.replace('tab:', '');
                    banner.appendChild(mkBtn(d._actionLabel || 'Go', 'btn btn-sm btn-primary', function() {
                        var idx = G.dramaQueue.findIndex(function(x) { return x.id === d.id; });
                        if (idx >= 0) G.dramaQueue.splice(idx, 1);
                        G._activeTab = targetTab;
                        saveGame(); render();
                    }));
                } else if (d._isTeamOrder) {
                    banner.appendChild(h('div', { style: { display: 'flex', gap: '8px' } },
                        mkBtn('Race Your Own Race', 'btn btn-sm btn-primary', function () {
                            var c = (G.contracts || []).find(function (c) { return c.seriesId === d._seriesId; });
                            if (c) c.missedFinishWarnings = (c.missedFinishWarnings || 0) + 0.5;
                            G.log.push('[S' + G.season + ' W' + G.week + '] Team orders: raced your own race.');
                            var idx = G.dramaQueue.findIndex(function (x) { return x.id === d.id; });
                            if (idx >= 0) G.dramaQueue.splice(idx, 1);
                            saveGame(); render();
                        }),
                        mkBtn('Hold Position', 'btn btn-sm btn-ghost', function () {
                            G.reputation = Math.max(0, G.reputation - 1);
                            G.fans = Math.max(0, G.fans - 100);
                            G.log.push('[S' + G.season + ' W' + G.week + '] Team orders: held position.');
                            var idx = G.dramaQueue.findIndex(function (x) { return x.id === d.id; });
                            if (idx >= 0) G.dramaQueue.splice(idx, 1);
                            saveGame(); render();
                        })
                    ));
                } else if (d._isCallout) {
                    var responses = CALLOUT_RESPONSES[d._calloutType] || [];
                    var btns = responses.map(function (resp) {
                        return mkBtn(resp.label, 'btn btn-sm ' + resp.btnClass, function () {
                            G.reputation = Math.max(0, G.reputation + resp.rep);
                            G.fans = Math.max(0, G.fans + resp.fans);
                            if (resp.rivalEffect === 'incident') touchRival(G.rivals, d._calloutDriver, 'incident', false);
                            else if (resp.rivalEffect === 'close_clean') touchRival(G.rivals, d._calloutDriver, 'close', true);
                            var repStr = resp.rep !== 0 ? ' Rep ' + (resp.rep > 0 ? '+' : '') + resp.rep : '';
                            var fanStr = resp.fans !== 0 ? ' Fans ' + (resp.fans > 0 ? '+' : '') + fmtFans(resp.fans) : '';
                            G.log.push('[S' + G.season + ' W' + G.week + '] ' + (d._calloutDriver || 'driver') + ' callout: ' + resp.label + '.' + repStr + fanStr);
                            var idx = G.dramaQueue.findIndex(function (x) { return x.id === d.id; });
                            if (idx >= 0) G.dramaQueue.splice(idx, 1);
                            saveGame(); render();
                        });
                    });
                    btns.push(mkBtn('No Comment', 'btn btn-sm btn-ghost', function () {
                        var idx = G.dramaQueue.findIndex(function (x) { return x.id === d.id; });
                        if (idx >= 0) G.dramaQueue.splice(idx, 1);
                        saveGame(); render();
                    }));
                    banner.appendChild(h('div', { style: { marginTop: '4px' } },
                        h('div', { style: { fontSize: '13px', color: '#64748B', marginBottom: '8px' } }, 'How do you respond to ' + (d._calloutDriver || 'them') + '?'),
                        h('div', { style: { display: 'flex', gap: '6px', flexWrap: 'wrap' } }, ...btns)
                    ));
                                } else if (d._isInvite) {
                    const canAfford = G.money >= (d._inviteCost || 0);
                    banner.appendChild(h('div', { style: { display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' } },
                        mkBtn('Decline', 'btn btn-sm btn-ghost', function() {
                            var idx = G.dramaQueue.findIndex(function(x) { return x.id === d.id; });
                            if (idx >= 0) G.dramaQueue.splice(idx, 1);
                            addLog(G, '📬 Declined invite: ' + d.title);
                            saveGame(); render();
                        }),
                        mkBtn(
                            d._inviteSponsorCovers ? '🏎️ Accept — Sponsor Covers Entry' : canAfford ? ('🏎️ Accept — ' + fmtMoney(d._inviteCost || 0)) : ('Need ' + fmtMoney((d._inviteCost || 0) - G.money) + ' more'),
                            'btn btn-sm btn-primary',
                            function() {
                                var evt = SPECIAL_EVENTS.find(function(e) { return e.id === d._inviteEvtId; });
                                if (!evt) return;
                                if (!d._inviteSponsorCovers && G.money < (d._inviteCost || 0)) return;
                                // Don't remove from queue yet — only remove after results submitted or declined
                                if (d._inviteSponsorCovers && d._inviteSponsorName) {
                                    var sp = (G.sponsors || []).find(function(s) { return s.brand === d._inviteSponsorName; });
                                    if (sp) sp.happiness = Math.min(100, sp.happiness + 8);
                                    addLog(G, '🤝 ' + d._inviteSponsorName + ' covered entry for ' + evt.name);
                                }
                                var totalCost = d._inviteSponsorCovers ? 0 : (d._inviteCost || 0);
                                var drId = d.id;
                                openSpecialInviteModal(evt, totalCost, d._invitePointsCount, d._isSupport, drId);
                            },
                            !d._inviteSponsorCovers && !canAfford
                        ),
                    ));
                } else {
                    banner.appendChild(h('div', { style: { textAlign: 'right' } },
                        mkBtn('Dismiss', 'btn btn-sm btn-primary', function () {
                            var idx = G.dramaQueue.findIndex(function (x) { return x.id === d.id; });
                            if (idx >= 0) doDismissDrama(idx);
                        })
                    ));
                }
                f.appendChild(banner);
});
            return f;
        }