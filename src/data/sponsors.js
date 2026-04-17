// sponsor data
        const SPONSOR_BRANDS = {
            mini_stock: [
                "Earl's Auto Parts", "Bud's Tire World", 'County Diesel', 'Lakeside Motors',
                'Gravel Pit Auto', 'Pinebrook Hardware', 'Twin Pines Fuel', 'Millcreek Towing',
                "Hank's Collision Center", 'Ridgeline Auto Glass', 'Five Star Lube', 'Tri-County Ford',
                'Depot Street Diner', 'Riverside Salvage', "Mac's Machine Shop", 'Hilltop Propane',
                'Lakeview Tire & Wheel', 'Sunset Wrecker Service', 'Crossroads Auto Parts', 'Pioneer Fuel Stop',
                "Daddy's Chicken Shack", 'Blue Ridge Motorsports Supply', 'Backwoods Battery Co.', 'Old Mill Hardware',
            ],
            street_stock: [
                'Midwest Auto Supply', 'Thunder Ridge Fuel', 'Valley Hardware', 'Pinecrest Auto',
                'Ridgewood Parts', 'Cornerstone Auto', 'Backroads Fuel', 'Lakeview Motors',
                'Ironside Suspension', 'Southpaw Speed Shop', 'Overpass Auto Body', 'Rural Route Towing',
                'Creekside Performance', 'Bridgeway Engines', 'Three Rivers Racing Supply', 'Cardinal Auto Parts',
                'Flatland Diesel', 'Frontier Lubricants', 'Highway One Speed', 'Summit Street Supply',
                'Bison Motor Sports', 'Ironwood Brake & Exhaust', 'Timber Run Performance', 'Lakewood Auto Center',
            ],
            late_model_stock: [
                'Summit Racing', 'Holley Performance', 'Lucas Oil', 'Driven Racing Oil',
                'Trick Flow Specialties', 'K&N Filters', 'MSD Ignition', 'Jegs Performance',
                'ARP Fasteners', 'Moroso Performance', 'Speedway Motors', 'Allstar Performance',
                'Pro Shocks', 'Longacre Racing', 'Howe Racing', 'Butler Performance',
                'Fasterproms', 'Wehrs Machine', 'Bert Transmissions', 'Hypercoils',
                'RaceQuip Safety', 'Kirkey Racing Fabrication', 'PFC Brakes', 'Aero Race Wheels',
            ],
            super_late_model: [
                'Comp Cams', 'Edelbrock', 'Weld Racing', 'Hooker Headers',
                'Wilwood Brakes', 'Strange Engineering', 'QA1 Suspension', 'Afco Racing',
                'Peterson Fluid Systems', 'Winters Performance', 'Bassett Racing Wheels', 'Integra Shocks',
                'Swift Springs', 'Triple X Race Components', 'Deist Safety', 'Brodix Cylinder Heads',
                'JMC Motorsports Products', 'Meziere Enterprises', 'Tilton Engineering', 'Penske Racing Shocks',
                'MRS Fuel Safety', 'Impact Race Products', 'Pyrotect Safety Equipment', 'Butlerbuilt Seats',
            ],
            arca_menards: [
                'Menards', 'NAPA Auto Parts', 'Chevrolet Accessories', 'Mobil 1',
                'General Tire', 'Prestone', 'Quaker State', 'STP',
                'Purolator', 'Rain-X', 'Armor All', 'Pennzoil',
                'Citgo', 'Sunoco Racing Fuels', 'VP Racing Fuels', 'Optima Batteries',
                'MSD Performance', 'Edelbrock', 'ACDelco', 'Motorcraft',
            ],
            nascar_trucks: [
                'Camping World', 'DeWalt', '3M', 'Chevrolet Accessories',
                'Toyota Accessories', 'Ford Performance', 'Kubota', 'Bass Pro Shops',
                'Niece Motorsports', 'United Rentals', 'Tenda Heal', 'NAPA Filters',
                'Chevrolet Silverado', 'Ford F-150', 'Toyota Tundra', 'Craftsman Tools',
                'GMS Racing', 'McAnally-Hilgemann Racing', 'Tricon Garage', 'Front Row Motorsports',
                'Ideal Door', 'Work & Win', 'Rackley W.A.R.', 'Young Motorsports',
            ],
            nascar_xfinity: [
                'Xfinity', 'Whelen Engineering', 'Interstate Batteries', 'Hy-Vee',
                'Pilot Flying J', 'Nutrien Ag Solutions', 'Beef Jerky Outlet', 'Menards',
                'Henry Repeating Arms', 'Dex Imaging', 'Safelite AutoGlass', 'Sunoco Fuel',
                'Focused Health', 'SciAps', 'Celsius Energy Drinks', 'Sunseeker Resorts',
                'Solterra', 'Vast Broadband', 'Mahindra Tractors', 'Kitchenaid',
                'Juniper Networks', "Hellmann's", "Cheddar's", 'Benihana',
                'Shelby American', 'TransAm Racing', 'Snap-on Tools', 'NAPA Auto Parts',
                'Camping World', 'Bass Pro Shops', 'Advance Auto Parts', 'O\'Reilly Auto Parts',
            ],
            nascar_cup: [
                'Monster Energy', 'Coca-Cola', 'Goodyear', 'FedEx', 'M&Ms',
                'Bass Pro Shops', 'USAA', 'Ally Financial', 'Busch Light',
                "McDonald's", 'Fastenal', 'Chevrolet', 'Ford Motor Company',
                'Toyota Racing', 'DoorDash', 'GEICO', 'Hendrickcars.com',
                'Valvoline', 'Pennzoil', 'Mobil 1', 'Liberty University',
                'Hooters', 'Axalta', 'Mahindra', 'Nature\'s Bakery',
                'Snap-on Tools', 'Würth', 'Camping World', 'Reese\'s',
                'Wendy\'s', 'Sonax', '3M', 'Hertz', 'Kraft Heinz',
                'TaxSlayer', 'NOS Energy', 'Advance Auto Parts',
                'O\'Reilly Auto Parts', 'NAPA Auto Parts', 'SiriusXM',
                'Xfinity', 'Whelen Engineering', 'Interstate Batteries',
            ],
            international: [
                'Pirelli', 'Red Bull', 'Shell V-Power', 'Bosch',
                'Michelin', 'Castrol', 'Gulf Oil', 'Motul',
                'Sparco', 'OMP Racing', 'Alpinestars', 'Bell Helmets',
                'Total Energies', 'Petronas', 'Liqui-Moly', 'Elf Lubricants',
                'Sabelt', 'Sparco', 'Recaro', 'Hans Performance Products',
            ],
        };
        const SPONSOR_TYPES = {
            primary: { label: 'Primary', mult: 1.0, dur: [1, 2], decay: 8, gain: 12 },
            associate: { label: 'Associate', mult: 0.3, dur: [1, 1], decay: 5, gain: 8 },
            contingency: { label: 'Contingency', mult: 0.1, dur: [1, 3], decay: 2, gain: 4 },
            international: { label: 'International', mult: 1.5, dur: [1, 2], decay: 6, gain: 10 },
        };

        // crew packages
        const CREW_PACKAGES = [
            { id: 'basic', name: 'Basic', cost: 0, qualBonus: 0, desc: 'Standard setup. Gets you to the grid.' },
            { id: 'club', name: 'Club', cost: 5000, qualBonus: 2, desc: 'Experienced engineer. Qualifying improves noticeably.' },
            { id: 'pro', name: 'Pro', cost: 20000, qualBonus: 4, desc: 'Full-time crew chief, proper data. Teams notice.' },
            { id: 'elite', name: 'Elite', cost: 75000, qualBonus: 7, desc: 'Best in the business. Sponsors love the numbers.' },
        ];

        // car substitutes
        // When a player doesn't own the series car, these stand-in cars are available.
        // car class pools — variant-based
        // G.ownedCars[seriesId] = true/false  (do you own ANY car in this class?)
        // G.carVariantPref[seriesId] = variantKey  (which generation to use in roster)
        // Variants with multiple cars pick randomly within the group per driver.
        // confirmed car pools — all paths/ids verified from actual iracing roster files
        // free: true  = no ownership check needed, always available for roster generation
        // free: false = player must confirm ownership in Settings for fair AI racing
        // Roster generation always uses the owned/selected type; fallback chain handles unowned.
        const CAR_CLASS_POOLS = {
            mini_stock: { free: true, variants: {
                'Mini Stock': [{ path: 'ministock', id: 191 }],
            }},
            street_stock: { free: true, variants: {
                // panther is free, mix freely
                'All Street Stock': [
                    { path: 'streetstock',              id: 36  },
                    { path: 'streetstock\\streetstock2', id: 186 },
                    { path: 'streetstock\\streetstock3', id: 187 },
                ],
                'Panther Only':     [{ path: 'streetstock',               id: 36  }],
                'Street Stock 2':   [{ path: 'streetstock\\streetstock2',  id: 186 }],
                'Street Stock 3':   [{ path: 'streetstock\\streetstock3',  id: 187 }],
            }},
            super_late_model: { free: false, variants: {
                'Super Late Model': [{ path: 'superlatemodel', id: 54 }],
            }},
            late_model_stock: { free: false, variants: {
                'Late Model 2023': [{ path: 'latemodel2023', id: 164 }],
            }},
            legends: { free: true, variants: {
                'Ford 34 Coupe': [{ path: 'legends\\ford34c', id: 5 }],
            }},
            sk_modified: { free: false, variants: {
                'SK Modified':      [{ path: 'skmodified',       id: 2  }],
                'SK Modified Tour': [{ path: 'skmodified\\tour', id: 31 }],
            }},
            arca_menards: { free: false, variants: {
                'ARCA 2025': [
                    { path: 'stockcars2\\arcachevy25',  id: 198 },
                    { path: 'stockcars2\\arcaford25',   id: 199 },
                    { path: 'stockcars2\\arcatoyota25', id: 200 },
                ],
            }},
            nascar_trucks: { free: false, variants: {
                'Current Trucks': [
                    { path: 'trucks\\silverado2019',    id: 111 },
                    { path: 'trucks\\fordf150',         id: 123 },
                    { path: 'trucks\\toyotatundra2022', id: 155 },
                    { path: 'trucks\\ram2026',          id: 211 },
                ],
            }},
            nascar_xfinity: { free: false, variants: {
                'Gen6 2019': [
                    { path: 'stockcars2\\camaro2019',  id: 114 },
                    { path: 'stockcars2\\mustang2019', id: 115 },
                    { path: 'stockcars2\\supra2019',   id: 116 },
                ],
            }},
            nascar_cup: { free: false, variants: {
                // gen 4 2003 - taurus and monte carlo share id 201, different paths
                'Gen4 (2003)':  [{ path: 'stockcars\\fordtaurus03', id: 201 }, { path: 'stockcars\\chevymontecarlo03', id: 201 }],
                // nextgen - camry 136, mustang 140, camaro 141
                'NextGen':      [{ path: 'stockcars\\toyotacamry2022', id: 136 }, { path: 'stockcars\\fordmustang2022', id: 140 }, { path: 'stockcars\\chevycamarozl12022', id: 141 }],
                // classic 87s
                'Classic (87)': [{ path: 'stockcars\\buicklesabre87', id: 154 }, { path: 'stockcars\\chevymontecarlo87', id: 124 }, { path: 'stockcars\\fordthunderbird87', id: 125 }, { path: 'stockcars\\pontiacgrandprix87', id: 175 }],
                // gen6 cup
                'Cup Gen6':     [{ path: 'stockcars\\camarozl12018', id: 103 }, { path: 'stockcars\\fordmustang2019', id: 110 }, { path: 'stockcars\\toyotacamry', id: 56 }],
            }},
        };

        // free sports cars - always available, no ownership check needed, confirmed ai-capable
        const FREE_FALLBACK_POOL = [
            { path: 'bmwm2csr',      id: 195 },
            { path: 'toyotagr86',    id: 160 },
            { path: 'cadillacctsvr', id: 41  },
            { path: 'mx5\\mx52016',  id: 67  },
            { path: 'kiaoptima',     id: 44  },
            { path: 'specracer',     id: 23  },
            { path: 'jettatdi',      id: 27  },
        ];

        // pick a car for export - respects ownership and variant pref
        // Falls back through the tier chain, then to free sports cars as last resort.
        function pickSeriesCar(seriesId) {
            var owned = G.ownedCars || {};

            // Ordered fallback chains — closest substitute first.
            // Trucks have no fallback (free truck can't race AI).
            var FALLBACK_CHAIN = {
                super_late_model: ['late_model_stock', 'arca_menards'],
                late_model_stock: ['super_late_model', 'arca_menards'],
                arca_menards:     ['late_model_stock', 'super_late_model', 'nascar_xfinity', 'nascar_cup'],
                nascar_xfinity:   ['nascar_cup', 'arca_menards'],
                nascar_cup:       ['nascar_xfinity', 'arca_menards'],
                sk_modified:      [], // no cross-class fallback — use free pool
                nascar_trucks:    [], // no valid fallback
            };

            function buildPool(sid) {
                var cls = CAR_CLASS_POOLS[sid];
                if (!cls) return [];
                if (!cls.free && !owned[sid]) return [];
                var variants = cls.variants || {};
                var keys = Object.keys(variants);
                if (!keys.length) return [];
                var pref = (G.carVariantPref || {})[sid];
                var selectedKey = (pref && variants[pref]) ? pref : keys[0];
                return variants[selectedKey] || [];
            }

            // Try primary series
            var pool = buildPool(seriesId);

            // Walk fallback chain
            if (!pool.length) {
                var chain = FALLBACK_CHAIN[seriesId] || [];
                for (var i = 0; i < chain.length; i++) {
                    pool = buildPool(chain[i]);
                    if (pool.length) break;
                }
            }

            // Last resort — random free sports car (confirmed AI-capable)
            if (!pool.length) {
                return FREE_FALLBACK_POOL[Math.floor(Math.random() * FREE_FALLBACK_POOL.length)];
            }

            return pool[Math.floor(Math.random() * pool.length)];
        }

        // Legacy compat — used by a few older code paths
        const CAR_SUBSTITUTES = {
            nascar_trucks:  { name: 'Ram 2026',      path: 'trucks\\ram2026',          id: 211 },
            arca_menards:   { name: 'Toyota GR86',   path: 'toyotagr86',               id: 160 },
            nascar_xfinity: { name: 'BMW M2 CSR',    path: 'bmwm2csr',                 id: 195 },
            nascar_cup:     { name: 'BMW M2 CSR',    path: 'bmwm2csr',                 id: 195 },
        };
        function getSeriesCar(seriesId) {
            if (!G.ownedCars) G.ownedCars = {};
            if (G.ownedCars[seriesId]) return null;
            return CAR_SUBSTITUTES[seriesId] || null;
        }

        // off-track events
        const OFF_TRACK = [
            { id: 'hospital', label: 'Hospital Visit', cost: 0, rep: 6, fans: 200, sponsorHappy: 5, desc: 'Visit patients at a children\'s hospital.' },
            { id: 'school', label: 'School Visit', cost: 0, rep: 5, fans: 150, sponsorHappy: 4, desc: 'Talk to kids about racing. Half think you\'re famous.' },
            { id: 'sponsor_dinner', label: 'Sponsor Dinner', cost: 500, rep: 2, fans: 50, sponsorHappy: 15, desc: 'Schmooze with the people who write the checks.' },
            { id: 'media', label: 'Media Appearance', cost: 0, rep: 8, fans: 500, sponsorHappy: 8, desc: 'Interview, podcast, or local TV spot.' },
            { id: 'autograph', label: 'Autograph Session', cost: 0, rep: 4, fans: 400, sponsorHappy: 6, desc: 'Meet the fans. They\'re loud. They love you.' },
            { id: 'charity_auction', label: 'Charity Auction', cost: 1000, rep: 10, fans: 600, sponsorHappy: 10, desc: 'Donate a helmet or ride-along. Good karma.' },
            { id: 'team_dinner', label: 'Team Dinner', cost: 800, rep: 1, fans: 0, sponsorHappy: 3, desc: 'Buy the crew dinner. Crew chiefs remember this.' },
            { id: 'donate_10k', label: 'Donate $10,000', cost: 10000, rep: 15, fans: 1000, sponsorHappy: 12, desc: 'Major donation. National attention.' },
            { id: 'donate_5k', label: 'Donate $5,000', cost: 5000, rep: 10, fans: 600, sponsorHappy: 8, desc: 'Meaningful contribution. Local press.' },
            { id: 'donate_1k', label: 'Donate $1,000', cost: 1000, rep: 5, fans: 200, sponsorHappy: 4, desc: 'Community-level. Still noticed.' },
        ];