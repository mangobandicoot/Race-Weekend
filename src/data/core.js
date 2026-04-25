// version
        const APP_VERSION = 'v1.1.2';
        // home states
        const US_STATES = [
            'AL', 'AR', 'AZ', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY',
            'LA', 'MA', 'MD', 'ME', 'MI', 'MN', 'MO', 'MS', 'MT', 'NC', 'ND', 'NE', 'NH', 'NJ', 'NM',
            'NV', 'NY', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VA', 'VT', 'WA',
            'WI', 'WV', 'WY', 'DC', 'International',
        ];

        const US_STATE_NAMES = {
            AL: 'Alabama', AR: 'Arkansas', AZ: 'Arizona', CA: 'California', CO: 'Colorado',
            CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia', IA: 'Iowa',
            ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', KS: 'Kansas', KY: 'Kentucky',
            LA: 'Louisiana', MA: 'Massachusetts', MD: 'Maryland', ME: 'Maine', MI: 'Michigan',
            MN: 'Minnesota', MO: 'Missouri', MS: 'Mississippi', MT: 'Montana', NC: 'North Carolina',
            ND: 'North Dakota', NE: 'Nebraska', NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico',
            NV: 'Nevada', NY: 'New York', OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania',
            RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas',
            UT: 'Utah', VA: 'Virginia', VT: 'Vermont', WA: 'Washington', WI: 'Wisconsin',
            WV: 'West Virginia', WY: 'Wyoming', DC: 'Washington D.C.', International: 'International',
        };

        const CANADIAN_PROVINCES = {
            AB: 'Alberta', BC: 'British Columbia', MB: 'Manitoba', NB: 'New Brunswick',
            NL: 'Newfoundland & Labrador', NS: 'Nova Scotia', NT: 'Northwest Territories',
            NU: 'Nunavut', ON: 'Ontario', PE: 'Prince Edward Island', QC: 'Quebec',
            SK: 'Saskatchewan', YT: 'Yukon',
        };

        const MEXICAN_STATES = {
            AGS: 'Aguascalientes', BC: 'Baja California', BCS: 'Baja California Sur',
            CAMP: 'Campeche', COAH: 'Coahuila', COL: 'Colima', CDMX: 'Mexico City',
            DGO: 'Durango', GTO: 'Guanajuato', GRO: 'Guerrero', HGO: 'Hidalgo',
            JAL: 'Jalisco', MEX: 'State of Mexico', MICH: 'Michoacán', MOR: 'Morelos',
            NAY: 'Nayarit', OAX: 'Oaxaca', PUE: 'Puebla', QRO: 'Querétaro',
            QROO: 'Quintana Roo', SLP: 'San Luis Potosí', SIN: 'Sinaloa', SON: 'Sonora',
            TAB: 'Tabasco', TAMS: 'Tamaulipas', TLX: 'Tlaxcala', VER: 'Veracruz',
            YUC: 'Yucatán', ZAC: 'Zacatecas',
        };

        const HOME_STATE_POOL_ALL = [
            ...Array(8).fill('NC'), ...Array(7).fill('VA'), ...Array(7).fill('TN'),
            ...Array(6).fill('GA'), ...Array(6).fill('SC'), ...Array(5).fill('FL'),
            ...Array(5).fill('OH'), ...Array(5).fill('IN'), ...Array(4).fill('KY'),
            ...Array(4).fill('WI'), ...Array(4).fill('IL'), ...Array(3).fill('TX'),
            ...Array(3).fill('PA'), ...Array(3).fill('MI'), ...Array(3).fill('MO'),
            ...Array(2).fill('AL'), ...Array(2).fill('AR'), ...Array(2).fill('MS'),
            ...Array(2).fill('NY'), ...Array(2).fill('CA'), ...Array(2).fill('MN'),
            ...Array(1).fill('WV'), ...Array(1).fill('LA'), ...Array(1).fill('OK'),
            ...Array(1).fill('KS'), ...Array(1).fill('NE'), ...Array(1).fill('IA'),
            ...Array(2).fill('CA_ON'), ...Array(2).fill('CA_QC'),
            ...Array(1).fill('CA_AB'), ...Array(1).fill('CA_BC'), ...Array(1).fill('CA_MB'),
            ...Array(1).fill('MX_TX'), ...Array(1).fill('MX_SON'), ...Array(1).fill('MX_CA'),
        ];

        // weighted toward southeast/midwest - thats where short track racing lives
        const HOME_STATE_POOL = HOME_STATE_POOL_ALL;
        // home region map
        const HOME_REGIONS = {
            'New England': ['ME', 'NH', 'VT', 'MA', 'CT', 'RI', 'NY'],
            'Mid-Atlantic': ['NJ', 'PA', 'DE', 'MD', 'VA', 'WV'],
            'Southeast': ['NC', 'SC', 'GA', 'FL', 'TN', 'AL', 'MS'],
            'Midwest': ['OH', 'IN', 'KY', 'MI', 'WI', 'IL', 'MO', 'IA'],
            'South Central': ['TX', 'OK', 'AR', 'LA'],
            'Plains': ['KS', 'NE', 'SD', 'ND', 'MN', 'MT', 'WY', 'CO', 'ID'],
            'West': ['CA', 'OR', 'WA', 'NV', 'AZ', 'UT', 'NM'],
            'Eastern Canada': ['CA_ON', 'CA_QC', 'CA_NB', 'CA_NS', 'CA_PE', 'CA_NL'],
            'Western Canada': ['CA_BC', 'CA_AB', 'CA_MB', 'CA_SK'],
            'Northern Canada': ['CA_NT', 'CA_NU', 'CA_YT'],
            'Northern Mexico': ['MX_SON', 'MX_COAH', 'MX_DGO', 'MX_NL', 'MX_TX'],
            'Central Mexico': ['MX_JAL', 'MX_GTO', 'MX_SLP', 'MX_CDMX', 'MX_MEX', 'MX_MICH', 'MX_QRO', 'MX_HGO'],
            'Southern Mexico': ['MX_VER', 'MX_OAX', 'MX_TAB', 'MX_CAMP', 'MX_QROO', 'MX_YUC'],
        };

        function getHomeRegion(state) {
            if (!state) return null;
            for (var region in HOME_REGIONS) {
                if (HOME_REGIONS[region].indexOf(state) >= 0) return region;
            }
            return null;
        }

        // Map home state/province/region to default home track for the 'home bonus'
        function getHomeTrackForState(state) {
            if (!state) return null;
            // US states
            const usStateToTrack = {
                'ME': 'Oxford Plains Speedway', 'NH': 'New Hampshire Motor Speedway', 'VT': 'New Hampshire Motor Speedway',
                'MA': 'New Hampshire Motor Speedway', 'CT': 'Thompson Speedway Motorsports Park', 'RI': 'New Hampshire Motor Speedway',
                'NY': 'Oswego Speedway', 'NJ': 'New Jersey Motorsports Park', 'PA': 'Penn National Raceway',
                'DE': 'Monmouth Park', 'MD': 'Hagerstown Speedway', 'VA': 'Virginia International Raceway',
                'WV': 'Martinsville Speedway', 'NC': 'Hickory Motor Speedway', 'SC': 'Myrtle Beach Speedway',
                'GA': 'Lanier National Speedway', 'FL': 'New Smyrna Speedway', 'TN': 'Volunteer Speedway',
                'AL': 'Talladega Short Track', 'MS': 'Mississippi Motor Speedway', 'LA': 'Five Flags Speedway',
                'OH': 'Cleveland Public Sq. Stage', 'IN': 'Indianapolis Motor Speedway', 'KY': 'Speedway',
                'MI': 'Michigan International Speedway', 'WI': 'Slinger Speedway', 'IL': 'Gateway Motorsports Park',
                'MO': 'Gateway Motorsports Park', 'IA': 'Iowa Speedway - Oval - 2011', 'TX': 'Texas Motor Speedway',
                'OK': 'Las Vegas Motor Speedway', 'KS': 'Kansas Speedway', 'NE': 'Kearney Speedway',
                'SD': 'South Dakota Speedway', 'ND': 'Madison International Speedway', 'MN': 'The Milwaukee Mile',
                'MT': 'The Milwaukee Mile', 'WY': 'Las Vegas Motor Speedway', 'CO': 'Las Vegas Motor Speedway',
                'ID': 'Spokane Raceway', 'CA': 'Kern Raceway', 'NV': 'Las Vegas Motor Speedway',
                'OR': 'Portland International Raceway', 'WA': 'Spokane Raceway', 'AZ': 'Phoenix Raceway',
                'UT': 'Salt Lake City', 'NM': 'Albuquerque Dragway',
            };
            // Canadian provinces
            const caProvinceToTrack = {
                'CA_ON': 'New Hampshire Motor Speedway', 'CA_QC': 'New Hampshire Motor Speedway',
                'CA_NB': 'New Hampshire Motor Speedway', 'CA_NS': 'New Hampshire Motor Speedway',
                'CA_PE': 'New Hampshire Motor Speedway', 'CA_NL': 'New Hampshire Motor Speedway',
                'CA_BC': 'Spokane Raceway', 'CA_AB': 'Las Vegas Motor Speedway',
                'CA_MB': 'The Milwaukee Mile', 'CA_SK': 'The Milwaukee Mile',
                'CA_NT': 'The Milwaukee Mile', 'CA_NU': 'The Milwaukee Mile', 'CA_YT': 'Las Vegas Motor Speedway',
            };
            // Mexican states
            const mxStateToTrack = {
                'MX_TX': 'Texas Motor Speedway', 'MX_SON': 'Las Vegas Motor Speedway', 'MX_CA': 'Kern Raceway',
                'MX_BC': 'Kern Raceway', 'MX_BCS': 'Las Vegas Motor Speedway', 'MX_DGO': 'Las Vegas Motor Speedway',
                'MX_COAH': 'Texas Motor Speedway', 'MX_NL': 'Texas Motor Speedway', 'MX_TAB': 'Texas Motor Speedway',
                'MX_TAMS': 'Texas Motor Speedway', 'MX_JAL': 'Las Vegas Motor Speedway', 'MX_GTO': 'Texas Motor Speedway',
                'MX_MICH': 'Las Vegas Motor Speedway', 'MX_CDMX': 'Las Vegas Motor Speedway', 'MX_MEX': 'Las Vegas Motor Speedway',
                'MX_MON': 'Las Vegas Motor Speedway', 'MX_QRO': 'Texas Motor Speedway', 'MX_SLP': 'Texas Motor Speedway',
                'MX_NAY': 'Las Vegas Motor Speedway', 'MX_OAX': 'Texas Motor Speedway', 'MX_PUE': 'Las Vegas Motor Speedway',
                'MX_VER': 'Texas Motor Speedway', 'MX_YUC': 'Texas Motor Speedway', 'MX_QROO': 'Texas Motor Speedway',
                'MX_CAMP': 'Texas Motor Speedway', 'MX_HGO': 'Texas Motor Speedway', 'MX_COL': 'Las Vegas Motor Speedway',
                'MX_ZAC': 'Las Vegas Motor Speedway', 'MX_AGS': 'Las Vegas Motor Speedway', 'MX_TLX': 'Las Vegas Motor Speedway',
            };
            return usStateToTrack[state] || caProvinceToTrack[state] || mxStateToTrack[state] || null;
        }

        function isSameRegion(stateA, stateB) {
            if (!stateA || !stateB) return false;
            if (stateA === stateB) return true;
            var regionA = getHomeRegion(stateA);
            var regionB = getHomeRegion(stateB);
            return regionA && regionB && regionA === regionB;
        }

        const TEAM_HOME_STATES = {
            // mini stock
            "Pawlowski's Auto Body": 'WI', "Earl's Speed Shop": 'NC', 'Backwoods Motorsports': 'TN',
            'County Line Racing': 'VA', 'Hilltop Racing': 'NC', 'Gravel Road Racing': 'TN',
            'Pinebrook Motorsports': 'ME', 'Twin Pines Garage': 'ME',
            // street stock
            'Barnyard Racing': 'VA', "Cousin's Garage": 'NC', 'Rural Route Racing': 'TN',
            'Three Dog Racing': 'SC', 'Riverside Motorsports': 'VA', 'Southpaw Racing': 'GA',
            'Timber Run Racing': 'NC', 'Lakeview Speed': 'WI', 'Ironhide Motorsports': 'OH',
            // super late
            'Carolina Asphalt Racing': 'NC', 'Ridgeline Motorsports': 'VA', 'Summit Racing Stable': 'OH',
            'Tri-Oval Racing': 'NC', 'Flatout Racing': 'TN', 'Precision Motorsports': 'GA',
            'Apex Asphalt Racing': 'SC', 'Benchmark Speed': 'VA', 'Threshold Motorsports': 'NC',
            // late model stock
            'Southern Speed Racing': 'NC', 'Appalachian Motorsports': 'VA', 'Piedmont Racing Co.': 'NC',
            'Blue Ridge Speed': 'VA', 'Tri-State Racing': 'TN', 'Carolina Thunder Racing': 'NC',
            'Shenandoah Motorsports': 'VA', 'Smoky Mountain Speed': 'TN', 'Tidewater Racing': 'VA',
            'Gulf Coast Motorsports': 'FL',
            // arca
            'Pinnacle Motorsports': 'NC', 'Elevation Racing': 'CO', 'Heritage Speed Group': 'IN',
            'National Oval Racing': 'OH', 'Summit Motorsports': 'OH', 'Accelerate Racing': 'NC',
            'Landmark Motorsports': 'VA', 'Frontier Speed Group': 'TX', 'Continental Racing': 'PA',
            'Keystone Motorsports': 'PA', 'American Oval Racing': 'IN', 'Crossover Motorsports': 'NC',
            // trucks
            'Frontier Truck Racing': 'TX', 'Wildfire Motorsports': 'NC', 'Crossroads Racing': 'TN',
            'Thunder Racing': 'NC', 'Apex Truck Team': 'NC', 'Ironhorse Motorsports': 'TX',
            'Stampede Racing': 'TX', 'Longhaul Motorsports': 'NC', 'Roughrider Racing': 'OK',
            'Big Rig Motorsports': 'IN', 'Outpost Racing': 'TN', 'Trailblazer Speed': 'NC',
            'Stonewall Truck Racing': 'VA', 'Overland Motorsports': 'CO',
            // xfinity
            'Silver Arrow Racing': 'NC', 'Criterion Motorsports': 'NC', 'Momentum Racing Partners': 'NC',
            'Apex National': 'NC', 'Phoenix Racing': 'NC', 'Cardinal Motorsports': 'VA',
            'Velocity Racing Group': 'NC', 'Ironside Motorsports': 'NC', 'Highline National': 'NC',
            'Threshold Racing': 'NC', 'Benchmark Motorsports': 'NC', 'Streamline Racing': 'NC',
            'Precision National': 'NC', 'Catalyst Motorsports': 'NC', 'Vortex Racing': 'NC',
            // cup
            'Titan Motorsports': 'NC', 'Crown Racing': 'NC', 'Dynasty Motor Racing': 'NC',
            'Apex Cup Team': 'NC', 'Legacy Motor Club': 'NC', 'Republic Racing': 'NC',
            'Ironclad Cup Racing': 'NC', 'Sovereign Motorsports': 'NC', 'National Speed Group': 'NC',
            'Empire Racing': 'NC', 'Pinnacle Cup Team': 'NC', 'Vanguard Motor Racing': 'NC',
            'Landmark Racing': 'NC', 'Continental Motorsports': 'NC', 'Heritage Cup Racing': 'NC',
            'Criterion Cup Team': 'NC',
        };
        function randomHomeState() {
            return HOME_STATE_POOL[rand(0, HOME_STATE_POOL.length - 1)];
        }



        // points tables
        // 43 for p1, drops one per position, floor at 1
        const IRACING_PTS = Array.from({ length: 50 }, (_, i) => Math.max(1, 43 - i));
        const NASCAR_PTS = IRACING_PTS; // alias kept for old saves
        const REGIONAL_PTS = IRACING_PTS; // same

        function calcPoints(seriesId, pos, pole, lapsLed, mostLaps) {
            return (IRACING_PTS[Math.max(0, pos - 1)] || 1);
        }

        // series ladder
        const SERIES = [
            // side progression
            { id: 'legends', name: 'iRacing Legends Series', short: 'Legends', tier: 1, races: 12, pay: 80, winBonus: 400, reqRep: 0, reqFans: 0, color: '#F97316', maxTerm: 1, maxTm: 1, fee: 80, carCostNew: 0, carCostUsed: 0, isSideStep: true, carType: 'Legend Car (1934 Ford)', desc: 'Purpose-built spec cars, short ovals and road courses. Cheap to run, technically demanding, and a legitimate proving ground.' },
            { id: 'sk_modified', name: 'SK Modified Series', short: 'SK Modified', tier: 2, races: 14, pay: 250, winBonus: 1000, reqRep: 30, reqFans: 200, color: '#EF4444', maxTerm: 1, maxTm: 1, fee: 200, carCostNew: 0, carCostUsed: 0, isSideStep: true, carType: 'SK Modified', desc: 'Modified racing on asphalt ovals. New England short track royalty. Fast, fenders-optional, and brutally competitive.' },
            // main ladder
            { id: 'mini_stock', name: 'Mini Stock Series', short: 'Mini Stock', tier: 1, races: 16, pay: 120, winBonus: 600, reqRep: 0, reqFans: 0, color: '#8B5CF6', maxTerm: 1, maxTm: 1, fee: 120, carCostNew: 1500, carCostUsed: 600, desc: 'Four cylinders, 200 horses, zero dignity. Everyone starts here.' },
            { id: 'street_stock', name: 'Street Stock Series', short: 'Street Stock', tier: 2, races: 18, pay: 280, winBonus: 1200, reqRep: 120, reqFans: 5000, color: '#3B82F6', maxTerm: 1, maxTm: 1, fee: 250, carCostNew: 4000, carCostUsed: 1800, desc: 'A step up. Same chaos, slightly more horsepower.' },
            { id: 'late_model_stock', name: 'Late Model Stock Tour', short: 'Late Model', tier: 3, races: 22, pay: 1800, winBonus: 7000, reqRep: 220, reqFans: 25000, color: '#10B981', maxTerm: 1, maxTm: 2, fee: 1000, carCostNew: 18000, carCostUsed: 8000, desc: '500hp V8, real money, real sponsor pressure.' },
            { id: 'arca_menards', name: 'ARCA Menards Series', short: 'ARCA', tier: 4, races: 20, pay: 12000, winBonus: 35000, reqRep: 320, reqFans: 65000, color: '#F59E0B', maxTerm: 2, maxTm: 2, fee: 4000, carCostNew: 0, carCostUsed: 0, desc: 'National TV. NASCAR scouts in the grandstands.' },
            { id: 'nascar_trucks', name: 'NASCAR Craftsman Truck Series', short: 'Trucks', tier: 5, races: 23, pay: 25000, winBonus: 90000, reqRep: 420, reqFans: 110000, color: '#EF4444', maxTerm: 2, maxTm: 3, fee: 15000, carCostNew: 0, carCostUsed: 0, desc: "NASCAR proper. Don't blow it on a lapped car." },
            { id: 'nascar_xfinity', name: 'NASCAR Xfinity Series', short: 'Xfinity', tier: 6, races: 33, pay: 75000, winBonus: 250000, reqRep: 560, reqFans: 180000, color: '#06B6D4', maxTerm: 3, maxTm: 3, fee: 35000, carCostNew: 0, carCostUsed: 0, desc: 'One rung from the Cup. Every lap is an audition.' },
            { id: 'super_late_model', name: 'Super Late Model Tour', short: 'Super Late', tier: 2, races: 18, pay: 800, winBonus: 4000, reqRep: 150, reqFans: 12000, color: '#F97316', maxTerm: 1, maxTm: 2, fee: 400, carCostNew: 8000, carCostUsed: 3500, desc: 'Full-fendered asphalt rockets. Faster than street stock, a stepping stone to the big money.' },
            { id: 'nascar_cup', name: 'NASCAR Cup Series', short: 'Cup Series', tier: 7, races: 36, pay: 200000, winBonus: 1000000, reqRep: 700, reqFans: 250000, color: '#EC4899', maxTerm: 3, maxTm: 3, fee: 80000, carCostNew: 0, carCostUsed: 0, desc: "The pinnacle. Don't fuck it up." },
        ];
        function getSeries(id) { return SERIES.find(s => s.id === id); }

        // tracks
        // Organized by tier. Lower tiers use short tracks; higher tiers use superspeedways.
        // Slinger is the fig8 finale for tier 1-2 series.

        // side series track pools
        const SIDE_TRACKS = {
            legends: [
                // Free road courses
                { name: 'Summit Point Raceway', city: 'Summit Point', state: 'WV', night: false, roadCourse: true },
                // Paid road courses
                { name: 'Lime Rock Park', city: 'Lakeville', state: 'CT', night: false, roadCourse: true, paid: false, premierName: 'Lime Rock Grand Prix', premierLaps: 60 },
                { name: 'Watkins Glen International', city: 'Watkins Glen', state: 'NY', night: false, roadCourse: true, paid: true, premierName: 'Watkins Glen Invitational', premierLaps: 75 },
                { name: 'Road America', city: 'Elkhart Lake', state: 'WI', night: false, roadCourse: true, paid: true, premierName: 'Road America Classic', premierLaps: 50 },
                { name: 'Mid-Ohio Sports Car Course', city: 'Lexington', state: 'OH', night: false, roadCourse: true, paid: true },
                { name: 'Virginia International Raceway', city: 'Alton', state: 'VA', night: false, roadCourse: true, paid: false },
                { name: 'Sebring International Raceway', city: 'Sebring', state: 'FL', night: false, roadCourse: true, paid: true, premierName: 'Sebring Legends 60', premierLaps: 60 },
                // Free ovals — Legends-compatible
                { name: 'South Boston Speedway', city: 'South Boston', state: 'VA', night: true, roadCourse: false, premierName: 'South Boston Legends 100', premierLaps: 100 },
                { name: 'Concord Speedway', city: 'Concord', state: 'NC', night: true, roadCourse: false },
                { name: 'Thompson Speedway Motorsports Park', city: 'Thompson', state: 'CT', night: false, roadCourse: false, premierName: 'Thompson Legends Classic', premierLaps: 100 },
                { name: 'Lanier National Speedway', city: 'Braselton', state: 'GA', night: true, roadCourse: false },
                { name: 'Southern National Motorsports Park', city: 'Kenly', state: 'NC', night: true, roadCourse: false },
                { name: 'Langley Speedway', city: 'Hampton', state: 'VA', night: true, roadCourse: false },
            ],
            sk_modified: [
                // Free tracks
                { name: 'Thompson Speedway Motorsports Park', city: 'Thompson', state: 'CT', night: false, premierName: 'Thompson SK Classic 150', premierLaps: 150 },
                { name: 'Oxford Plains Speedway', city: 'Oxford', state: 'ME', night: false },
                { name: 'South Boston Speedway', city: 'South Boston', state: 'VA', night: true },
                { name: 'Langley Speedway', city: 'Hampton', state: 'VA', night: true },
                { name: 'Concord Speedway', city: 'Concord', state: 'NC', night: true },
                { name: 'Southern National Motorsports Park', city: 'Kenly', state: 'NC', night: true },
                // Paid tracks
                { name: 'Stafford Motor Speedway', city: 'Stafford Springs', state: 'CT', night: false, paid: true, premierName: 'Stafford SK Premier 150', premierLaps: 150 },
                { name: 'Oswego Speedway', city: 'Oswego', state: 'NY', night: false, paid: true, premierName: 'Oswego Speedway Classic 200', premierLaps: 200 },
                { name: 'Bristol Motor Speedway', city: 'Bristol', state: 'TN', night: true, paid: true, premierName: 'Bristol SK Showdown 150', premierLaps: 150 },
                { name: 'Martinsville Speedway', city: 'Ridgeway', state: 'VA', night: false, paid: true, premierName: 'Martinsville SK Open 200', premierLaps: 200 },
                { name: 'Richmond Raceway', city: 'Richmond', state: 'VA', night: true, paid: true },
                { name: 'North Wilkesboro Speedway', city: 'North Wilkesboro', state: 'NC', night: false, paid: true },
                { name: 'New Hampshire Motor Speedway', city: 'Loudon', state: 'NH', night: false, paid: true },
                { name: 'Slinger Speedway', city: 'Slinger', state: 'WI', night: true, paid: true, premierName: 'Slinger SK Nationals 150', premierLaps: 150 },
            ],
        };

        const SERIES_TRACKS = {
            // Tier 1-2: local short tracks
            // premierName/premierLaps = tier 2 (full) version
            // premierNameT1/premierLapsT1 = tier 1 (shorter) version
            local: [
                { name: 'Langley Speedway', city: 'Hampton', state: 'VA', night: true, weather: 'humid', premierName: 'Hampton Heat 150', premierLaps: 150, premierNameT1: 'Hampton Heat 75', premierLapsT1: 75 },
                { name: 'USA International Speedway', city: 'Lakeland', state: 'FL', night: false, weather: 'hot', premierName: 'Sunshine 150', premierLaps: 150, premierNameT1: 'Sunshine 75', premierLapsT1: 75 },
                { name: 'Southern National Motorsports Park', city: 'Kenly', state: 'NC', night: true, weather: 'humid', premierName: 'Carolina 150', premierLaps: 150, premierNameT1: 'Carolina 75', premierLapsT1: 75 },
                { name: 'South Boston Speedway', city: 'South Boston', state: 'VA', night: true, weather: 'mild', premierName: 'South Boston 200', premierLaps: 200, premierNameT1: 'South Boston 100', premierLapsT1: 100 },
                { name: 'Concord Speedway', city: 'Concord', state: 'NC', night: true, weather: 'mild', premierName: 'Concord 150', premierLaps: 150, premierNameT1: 'Concord 75', premierLapsT1: 75 },
                { name: 'Oxford Plains Speedway', city: 'Oxford', state: 'ME', night: false, weather: 'cool', premierName: 'Oxford 250', premierLaps: 250, premierNameT1: 'Oxford 70', premierLapsT1: 70 },
                { name: 'Lanier National Speedway', city: 'Braselton', state: 'GA', night: true, weather: 'hot', premierName: 'Lanier 150', premierLaps: 150, premierNameT1: 'Lanier 75', premierLapsT1: 75 },
                { name: 'Thompson Speedway Motorsports Park', city: 'Thompson', state: 'CT', night: false, weather: 'cool', premierName: 'Thompson World Series 200', premierLaps: 200, premierNameT1: 'Thompson Spring 100', premierLapsT1: 100 },
                // Paid tracks — only appear if owned
                { name: 'Five Flags Speedway', city: 'Pensacola', state: 'FL', night: false, weather: 'hot', premierName: 'Snowball Derby 300', premierLaps: 300, premierNameT1: 'Five Flags Fall Qualifier 100', premierLapsT1: 100, paid: true },
                { name: 'Hickory Motor Speedway', city: 'Hickory', state: 'NC', night: true, weather: 'mild', premierName: 'Hickory Classic 200', premierLaps: 200, premierNameT1: 'Hickory Scramble 100', premierLapsT1: 100, paid: true },
                { name: 'New Smyrna Speedway', city: 'New Smyrna Beach', state: 'FL', night: false, weather: 'hot', premierName: 'New Smyrna 200', premierLaps: 200, premierNameT1: 'New Smyrna Winter Warm-Up 100', premierLapsT1: 100, paid: true },
                { name: 'Oswego Speedway', city: 'Oswego', state: 'NY', night: false, weather: 'cool', premierName: 'Oswego Classic 200', premierLaps: 200, premierNameT1: 'Oswego Open 100', premierLapsT1: 100, paid: true },
                { name: 'Stafford Motor Speedway', city: 'Stafford Springs', state: 'CT', night: false, weather: 'cool', premierName: 'Stafford Spring Sizzler 200', premierLaps: 200, premierNameT1: 'Stafford Open 75', premierLapsT1: 75, paid: true },
                { name: 'Irwindale Speedway', city: 'Irwindale', state: 'CA', night: true, weather: 'hot', premierName: 'Irwindale 200', premierLaps: 200, premierNameT1: 'Irwindale 100', premierLapsT1: 100, paid: true },
                { name: 'Myrtle Beach Speedway', city: 'Myrtle Beach', state: 'SC', night: true, weather: 'humid', premierName: 'Myrtle Beach 200', premierLaps: 200, premierNameT1: 'Myrtle Beach 100', premierLapsT1: 100, paid: true },
                { name: 'Slinger Speedway', city: 'Slinger', state: 'WI', night: true, weather: 'cool', premierName: 'Slinger Nationals 200', premierLaps: 200, premierNameT1: 'Slinger 75', premierLapsT1: 75, paid: true },
            ],
        // Tier 3: regional short/intermediate tracks
        // night: true = Saturday race; night: false = Sunday afternoon
        regional: [
            { name: 'Bristol Motor Speedway',          city: 'Bristol',         state: 'TN', night: true  },
            { name: 'Martinsville Speedway',           city: 'Ridgeway',        state: 'VA', night: false },
            { name: 'Richmond Raceway',                city: 'Richmond',        state: 'VA', night: true  },
            { name: 'Charlotte Motor Speedway',        city: 'Concord',         state: 'NC', night: false },
            { name: 'Iowa Speedway - Oval - 2011',     city: 'Newton',          state: 'IA', night: false },
            { name: 'Nashville Superspeedway',         city: 'Lebanon',         state: 'TN', night: false },
            { name: 'Gateway Motorsports Park',        city: 'Madison',         state: 'IL', night: true  },
            { name: 'North Wilkesboro Speedway',       city: 'North Wilkesboro',state: 'NC', night: false },
            { name: 'New Hampshire Motor Speedway',    city: 'Loudon',          state: 'NH', night: false },
            { name: 'Dover Motor Speedway',            city: 'Dover',           state: 'DE', night: false },
            { name: 'Darlington Raceway',              city: 'Darlington',      state: 'SC', night: true  },
            { name: 'Phoenix Raceway',                 city: 'Avondale',        state: 'AZ', night: false },
            { name: 'Lime Rock Park',                  city: 'Lakeville',       state: 'CT', night: false },
            { name: 'Rockingham Speedway',             city: 'Rockingham',      state: 'NC', night: false },
            { name: 'Road America',                    city: 'Elkhart Lake',    state: 'WI', night: false },
            { name: 'Mid-Ohio Sports Car Course',      city: 'Lexington',       state: 'OH', night: false },
            { name: 'Nashville Fairgrounds Speedway',  city: 'Nashville',       state: 'TN', night: true  },
            { name: 'The Milwaukee Mile',              city: 'West Allis',      state: 'WI', night: false },
        ],
        // Tier 2-3: late model short tracks (mix of short tracks and small regulars)
        latemodel: [
            // Short tracks
            { name: 'Langley Speedway', city: 'Hampton', state: 'VA', night: true },
            { name: 'USA International Speedway', city: 'Lakeland', state: 'FL', night: false },
            { name: 'Southern National Motorsports Park', city: 'Kenly', state: 'NC', night: true },
            { name: 'South Boston Speedway', city: 'South Boston', state: 'VA', night: true },
            { name: 'Concord Speedway', city: 'Concord', state: 'NC', night: true },
            { name: 'Oxford Plains Speedway', city: 'Oxford', state: 'ME', night: false },
            { name: 'Lanier National Speedway', city: 'Braselton', state: 'GA', night: true },
            { name: 'Thompson Speedway Motorsports Park', city: 'Thompson', state: 'CT', night: false },
            { name: 'Hickory Motor Speedway', city: 'Hickory', state: 'NC', night: true },
            { name: 'New Smyrna Speedway', city: 'New Smyrna Beach', state: 'FL', night: false },
            { name: 'Stafford Motor Speedway', city: 'Stafford Springs', state: 'CT', night: false },
            { name: 'Irwindale Speedway', city: 'Irwindale', state: 'CA', night: true },
            { name: 'Myrtle Beach Speedway', city: 'Myrtle Beach', state: 'SC', night: true },
            { name: 'Slinger Speedway', city: 'Slinger', state: 'WI', night: true },
            // Mixed in regionals
            { name: 'Nashville Fairgrounds Speedway', city: 'Nashville', state: 'TN', night: true },
            { name: 'Martinsville Speedway', city: 'Ridgeway', state: 'VA', night: false },
            { name: 'North Wilkesboro Speedway', city: 'North Wilkesboro', state: 'NC', night: false },
            { name: 'Richmond Raceway', city: 'Richmond', state: 'VA', night: true },
            { name: 'Bristol Motor Speedway', city: 'Bristol', state: 'TN', night: true },
            { name: 'Charlotte Motor Speedway', city: 'Concord', state: 'NC', night: false },
            { name: 'Lime Rock Park', city: 'Lakeville', state: 'CT', night: false },
            { name: 'Road America', city: 'Elkhart Lake', state: 'WI', night: false },
            { name: 'Mid-Ohio Sports Car Course', city: 'Lexington', state: 'OH', night: false },
            { name: 'The Milwaukee Mile', city: 'West Allis', state: 'WI', night: false },
        ],
        national: [
            { name: 'Daytona International Speedway',  city: 'Daytona Beach',   state: 'FL', night: false },
            { name: 'Las Vegas Motor Speedway',        city: 'Las Vegas',       state: 'NV', night: true  },
            { name: 'Phoenix Raceway',                 city: 'Avondale',        state: 'AZ', night: false },
            { name: 'Atlanta Motor Speedway',          city: 'Hampton',         state: 'GA', night: false },
            { name: 'Bristol Motor Speedway',          city: 'Bristol',         state: 'TN', night: true  },
            { name: 'Richmond Raceway',                city: 'Richmond',        state: 'VA', night: true  },
            { name: 'Charlotte Motor Speedway',        city: 'Concord',         state: 'NC', night: false },
            { name: 'Iowa Speedway - Oval - 2011',     city: 'Newton',          state: 'IA', night: false },
            { name: 'Pocono Raceway',                  city: 'Long Pond',       state: 'PA', night: false },
            { name: 'Michigan International Speedway', city: 'Brooklyn',        state: 'MI', night: false },
            { name: 'New Hampshire Motor Speedway',    city: 'Loudon',          state: 'NH', night: false },
            { name: 'Indianapolis Motor Speedway',     city: 'Indianapolis',    state: 'IN', night: false },
            { name: 'Gateway Motorsports Park',        city: 'Madison',         state: 'IL', night: true  },
            { name: 'Darlington Raceway',              city: 'Darlington',      state: 'SC', night: true  },
            { name: 'Kansas Speedway',                 city: 'Kansas City',     state: 'KS', night: true  },
            { name: 'Talladega Superspeedway',         city: 'Talladega',       state: 'AL', night: false },
            { name: 'Texas Motor Speedway',            city: 'Fort Worth',      state: 'TX', night: true  },
            { name: 'Martinsville Speedway',           city: 'Ridgeway',        state: 'VA', night: false },
            { name: 'Dover Motor Speedway',            city: 'Dover',           state: 'DE', night: false },
            { name: 'Homestead-Miami Speedway',        city: 'Homestead',       state: 'FL', night: false },
            { name: 'North Wilkesboro Speedway',       city: 'North Wilkesboro',state: 'NC', night: false },
            { name: 'Nashville Superspeedway',         city: 'Lebanon',         state: 'TN', night: false },
            { name: 'Auto Club Speedway',              city: 'Fontana',         state: 'CA', night: false },
            { name: 'Kentucky Speedway',               city: 'Sparta',          state: 'KY', night: true  },
            { name: 'Rockingham Speedway',             city: 'Rockingham',      state: 'NC', night: false },
        ],

        // Tier 5: Trucks — fixed ordered schedule (23 races)
        // Fridays; night races shift to Thursday
        trucks: [
            { name: 'Daytona International Speedway',  city: 'Daytona Beach',   state: 'FL', night: false },
            { name: 'Las Vegas Motor Speedway',        city: 'Las Vegas',       state: 'NV', night: true  },
            { name: 'Atlanta Motor Speedway',          city: 'Hampton',         state: 'GA', night: false },
            { name: 'Phoenix Raceway',                 city: 'Avondale',        state: 'AZ', night: false },
            { name: 'Bristol Motor Speedway',          city: 'Bristol',         state: 'TN', night: true  },
            { name: 'Martinsville Speedway',           city: 'Ridgeway',        state: 'VA', night: false },
            { name: 'Charlotte Motor Speedway',        city: 'Concord',         state: 'NC', night: false },
            { name: 'Iowa Speedway - Oval - 2011',     city: 'Newton',          state: 'IA', night: false },
            { name: 'Gateway Motorsports Park',        city: 'Madison',         state: 'IL', night: true  },
            { name: 'Pocono Raceway',                  city: 'Long Pond',       state: 'PA', night: false },
            { name: 'Michigan International Speedway', city: 'Brooklyn',        state: 'MI', night: false },
            { name: 'Indianapolis Motor Speedway',     city: 'Indianapolis',    state: 'IN', night: false },
            { name: 'Richmond Raceway',                city: 'Richmond',        state: 'VA', night: true  },
            { name: 'Darlington Raceway',              city: 'Darlington',      state: 'SC', night: true  },
            { name: 'Kansas Speedway',                 city: 'Kansas City',     state: 'KS', night: true  },
            { name: 'Talladega Superspeedway',         city: 'Talladega',       state: 'AL', night: false },
            { name: 'North Wilkesboro Speedway',       city: 'North Wilkesboro',state: 'NC', night: false },
            { name: 'New Hampshire Motor Speedway',    city: 'Loudon',          state: 'NH', night: false },
            { name: 'Texas Motor Speedway',            city: 'Fort Worth',      state: 'TX', night: true  },
            { name: 'Dover Motor Speedway',            city: 'Dover',           state: 'DE', night: false },
            { name: 'Homestead-Miami Speedway',        city: 'Homestead',       state: 'FL', night: false },
            { name: 'Phoenix Raceway',                 city: 'Avondale',        state: 'AZ', night: false },
            { name: 'Martinsville Speedway',           city: 'Ridgeway',        state: 'VA', night: false },
        ],

        // Tier 6: Xfinity — fixed ordered schedule (33 races)
        // Saturdays; night races shift to Friday
        xfinity: [
            { name: 'Daytona International Speedway',  city: 'Daytona Beach',   state: 'FL', night: false },
            { name: 'Las Vegas Motor Speedway',        city: 'Las Vegas',       state: 'NV', night: true  },
            { name: 'Phoenix Raceway',                 city: 'Avondale',        state: 'AZ', night: false },
            { name: 'Atlanta Motor Speedway',          city: 'Hampton',         state: 'GA', night: false },
            { name: 'Bristol Motor Speedway',          city: 'Bristol',         state: 'TN', night: true  },
            { name: 'Richmond Raceway',                city: 'Richmond',        state: 'VA', night: true  },
            { name: 'Talladega Superspeedway',         city: 'Talladega',       state: 'AL', night: false },
            { name: 'Dover Motor Speedway',            city: 'Dover',           state: 'DE', night: false },
            { name: 'Darlington Raceway',              city: 'Darlington',      state: 'SC', night: true  },
            { name: 'Charlotte Motor Speedway',        city: 'Concord',         state: 'NC', night: false },
            { name: 'Iowa Speedway - Oval - 2011',     city: 'Newton',          state: 'IA', night: false },
            { name: 'Gateway Motorsports Park',        city: 'Madison',         state: 'IL', night: true  },
            { name: 'New Hampshire Motor Speedway',    city: 'Loudon',          state: 'NH', night: false },
            { name: 'Pocono Raceway',                  city: 'Long Pond',       state: 'PA', night: false },
            { name: 'Indianapolis Motor Speedway',     city: 'Indianapolis',    state: 'IN', night: false },
            { name: 'Michigan International Speedway', city: 'Brooklyn',        state: 'MI', night: false },
            { name: 'Kansas Speedway',                 city: 'Kansas City',     state: 'KS', night: true  },
            { name: 'Bristol Motor Speedway',          city: 'Bristol',         state: 'TN', night: false },
            { name: 'Watkins Glen International',      city: 'Watkins Glen',    state: 'NY', night: false },
            { name: 'Daytona International Speedway',  city: 'Daytona Beach',   state: 'FL', night: true  },
            { name: 'Darlington Raceway',              city: 'Darlington',      state: 'SC', night: false },
            { name: 'Richmond Raceway',                city: 'Richmond',        state: 'VA', night: false },
            { name: 'North Wilkesboro Speedway',       city: 'North Wilkesboro',state: 'NC', night: false },
            { name: 'Texas Motor Speedway',            city: 'Fort Worth',      state: 'TX', night: true  },
            { name: 'Talladega Superspeedway',         city: 'Talladega',       state: 'AL', night: false },
            { name: 'Charlotte Motor Speedway',        city: 'Concord',         state: 'NC', night: false },
            { name: 'Nashville Superspeedway',         city: 'Lebanon',         state: 'TN', night: false },
            { name: 'Las Vegas Motor Speedway',        city: 'Las Vegas',       state: 'NV', night: false },
            { name: 'Martinsville Speedway',           city: 'Ridgeway',        state: 'VA', night: false },
            { name: 'Kansas Speedway',                 city: 'Kansas City',     state: 'KS', night: false },
            { name: 'Phoenix Raceway',                 city: 'Avondale',        state: 'AZ', night: false },
            { name: 'Homestead-Miami Speedway',        city: 'Homestead',       state: 'FL', night: false },
            { name: 'Martinsville Speedway',           city: 'Ridgeway',        state: 'VA', night: true  },
        ],

        // Tier 7: Cup — fixed ordered schedule (36 races)
        // Sundays; night races shift to Saturday
        cup: [
            { name: 'Daytona International Speedway',  city: 'Daytona Beach',   state: 'FL', night: false },
            { name: 'Las Vegas Motor Speedway',        city: 'Las Vegas',       state: 'NV', night: false },
            { name: 'Phoenix Raceway',                 city: 'Avondale',        state: 'AZ', night: false },
            { name: 'Atlanta Motor Speedway',          city: 'Hampton',         state: 'GA', night: false },
            { name: 'Bristol Motor Speedway',          city: 'Bristol',         state: 'TN', night: false },
            { name: 'Circuit of the Americas',         city: 'Austin',          state: 'TX', night: false },
            { name: 'Richmond Raceway',                city: 'Richmond',        state: 'VA', night: true  },
            { name: 'Talladega Superspeedway',         city: 'Talladega',       state: 'AL', night: false },
            { name: 'Dover Motor Speedway',            city: 'Dover',           state: 'DE', night: false },
            { name: 'Darlington Raceway',              city: 'Darlington',      state: 'SC', night: true  },
            { name: 'Charlotte Motor Speedway',        city: 'Concord',         state: 'NC', night: false },
            { name: 'Sonoma Raceway',                  city: 'Sonoma',          state: 'CA', night: false },
            { name: 'Iowa Speedway - Oval - 2011',     city: 'Newton',          state: 'IA', night: false },
            { name: 'Chicago Street Course',           city: 'Chicago',         state: 'IL', night: false },
            { name: 'New Hampshire Motor Speedway',    city: 'Loudon',          state: 'NH', night: false },
            { name: 'Pocono Raceway',                  city: 'Long Pond',       state: 'PA', night: false },
            { name: 'Indianapolis Motor Speedway',     city: 'Indianapolis',    state: 'IN', night: false },
            { name: 'Michigan International Speedway', city: 'Brooklyn',        state: 'MI', night: false },
            { name: 'Watkins Glen International',      city: 'Watkins Glen',    state: 'NY', night: false },
            { name: 'Daytona International Speedway',  city: 'Daytona Beach',   state: 'FL', night: true  },
            { name: 'Darlington Raceway',              city: 'Darlington',      state: 'SC', night: false },
            { name: 'Kansas Speedway',                 city: 'Kansas City',     state: 'KS', night: true  },
            { name: 'Bristol Motor Speedway',          city: 'Bristol',         state: 'TN', night: true  },
            { name: 'Texas Motor Speedway',            city: 'Fort Worth',      state: 'TX', night: true  },
            { name: 'Talladega Superspeedway',         city: 'Talladega',       state: 'AL', night: false },
            { name: 'Charlotte Motor Speedway Roval',  city: 'Concord',         state: 'NC', night: false },
            { name: 'Las Vegas Motor Speedway',        city: 'Las Vegas',       state: 'NV', night: true  },
            { name: 'North Wilkesboro Speedway',       city: 'North Wilkesboro',state: 'NC', night: false },
            { name: 'Martinsville Speedway',           city: 'Ridgeway',        state: 'VA', night: false },
            { name: 'Gateway Motorsports Park',        city: 'Madison',         state: 'IL', night: true  },
            { name: 'Richmond Raceway',                city: 'Richmond',        state: 'VA', night: false },
            { name: 'Kansas Speedway',                 city: 'Kansas City',     state: 'KS', night: false },
            { name: 'Phoenix Raceway',                 city: 'Avondale',        state: 'AZ', night: false },
            { name: 'Homestead-Miami Speedway',        city: 'Homestead',       state: 'FL', night: false },
            { name: 'Martinsville Speedway',           city: 'Ridgeway',        state: 'VA', night: true  },
            { name: 'Phoenix Raceway',                 city: 'Avondale',        state: 'AZ', night: false },
        ],

        // Fig8 finale — always Slinger for tier 1-2
        fig8: [
            { name: 'Slinger Speedway', city: 'Slinger', state: 'WI', fig8: true },
        ],
    };

        // premier event fixed weeks
        // Maps premier track name → canonical week number (out of 16-race season).
        // Week 1 ≈ late April. These are approximate real-world equivalents.
        // All series align their races at the same track to the same week.
        // Support races in lower series share that week automatically.
        // Keep these for backward compatibility with save migration
        const FREE_TRACKS = SERIES_TRACKS.local;
        const PAID_TRACKS = [];

        // special events
        const SPECIAL_EVENTS = [
            { id: 'uk_oval', name: 'UK Oval Invitational', track: 'Coventry Oval', location: 'Coventry, England', travelCost: 3000, entryCost: 2000, fanGain: 800, prize: 4000, reqRep: 60, reqFans: 2000, sponsorChance: 0.12, carType: 'Stock Rod', multiClass: false, desc: 'Short oval racing UK style. Different car, same chaos.' , laps: 100},
            { id: 'aus_supercars', name: 'Australian Supercars Wildcard', track: 'Mount Panorama', location: 'Bathurst, Australia', travelCost: 5000, entryCost: 3000, fanGain: 1500, prize: 6000, reqRep: 90, reqFans: 15000, sponsorChance: 0.15, carType: 'Supercar', multiClass: false, desc: 'The mountain. One of the most iconic tracks in the world.' , laps: 161},
            { id: 'nurburgring_24', name: 'Nürburgring 24h Entry', track: 'Nürburgring Nordschleife', location: 'Nürburg, Germany', travelCost: 6000, entryCost: 8000, fanGain: 3000, prize: 5000, reqRep: 110, reqFans: 25000, sponsorChance: 0.20, carType: 'GT4/GT3', multiClass: true, desc: 'The Green Hell. 24 hours. Multiple car classes. Career bucket list.' },
            { id: 'le_mans_am', name: 'Le Mans Am Class Entry', track: 'Circuit de la Sarthe', location: 'Le Mans, France', travelCost: 7000, entryCost: 12000, fanGain: 5000, prize: 8000, reqRep: 140, reqFans: 50000, sponsorChance: 0.25, carType: 'GT3', multiClass: true, desc: 'Le Mans. Multiple classes on track. Massive worldwide exposure.' },
            { id: 'spa_invitational', name: 'Spa Invitational GT', track: 'Circuit de Spa-Francorchamps', location: 'Spa, Belgium', travelCost: 6500, entryCost: 7000, fanGain: 2500, prize: 6000, reqRep: 120, reqFans: 35000, sponsorChance: 0.18, carType: 'GT4', multiClass: true, desc: "Eau Rouge. Raidillon. Your sponsor's European dreams come true." , laps: 44},
            { id: 'suzuka_challenge', name: 'Suzuka International Challenge', track: 'Suzuka Circuit', location: 'Suzuka, Japan', travelCost: 8000, entryCost: 6000, fanGain: 2000, prize: 5000, reqRep: 100, reqFans: 20000, sponsorChance: 0.15, carType: 'Touring Car', multiClass: false, desc: 'Japan. The figure-8 circuit. Your American fans will be confused.' , laps: 53},
            { id: 'indy_500_wildcard', name: 'Indianapolis 500 Wildcard Entry', track: 'Indianapolis Motor Speedway', location: 'Indianapolis, IN', travelCost: 0, entryCost: 15000, fanGain: 8000, prize: 40000, reqRep: 180, reqFans: 80000, sponsorChance: 0.35, carType: 'Indy Car', multiClass: false, desc: 'The Greatest Spectacle in Racing. You earned a wildcard entry. 200 laps. 33 starters. One chance.' , laps: 200},
                        { id: 'slinger_fig8', name: 'Slinger Figure-8 Open', track: 'Slinger Speedway', location: 'Slinger, WI', travelCost: 0, entryCost: 150, fanGain: 200, prize: 300, reqRep: 0, reqFans: 0, sponsorChance: 0, carType: 'Mini Stock', multiClass: false, fig8: true, desc: 'Pure chaos. The intersection awaits. No rivalries. No regrets.' , laps: 40},
           
            // tier 2 invite events — street stock / super late level
            { id: 'oxford_250', name: 'Oxford 250', track: 'Oxford Plains Speedway', location: 'Oxford, ME', travelCost: 0, entryCost: 800, fanGain: 600, prize: 2500, reqRep: 15, sponsorChance: 0.08, carType: 'Mini Stock / Street Stock', invite: true, inviteTier: [1, 2], reqTrack: 'Oxford Plains Speedway', desc: 'One of the most prestigious short-track events in New England. A win here travels.' , laps: 250},
            { id: 'thompson_world_series', name: 'Thompson World Series 200', track: 'Thompson Speedway Motorsports Park', location: 'Thompson, CT', travelCost: 0, entryCost: 700, fanGain: 700, prize: 3000, reqRep: 20, sponsorChance: 0.08, carType: 'Street Stock', invite: true, inviteTier: [2], reqTrack: 'Thompson Speedway Motorsports Park', desc: 'The World Series at Thompson is the crown jewel of New England short track racing. The stands are full and the entry list is serious.' , laps: 200},
            { id: 'snowball_derby', name: 'Snowball Derby', track: 'Five Flags Speedway', location: 'Pensacola, FL', travelCost: 200, entryCost: 900, fanGain: 1200, prize: 6000, reqRep: 28, sponsorChance: 0.12, carType: 'Super Late Model', invite: true, inviteTier: [2, 3], reqTrack: 'Five Flags Speedway', desc: 'The most prestigious short track race in the country. December at Five Flags. Everyone who is anyone in short track racing wants this one.' , laps: 300},
            { id: 'stafford_sizzler', name: 'Stafford Spring Sizzler 200', track: 'Stafford Motor Speedway', location: 'Stafford Springs, CT', travelCost: 0, entryCost: 700, fanGain: 700, prize: 2800, reqRep: 18, sponsorChance: 0.08, carType: 'Street Stock', invite: true, inviteTier: [2], reqTrack: 'Stafford Motor Speedway', desc: 'The Sizzler has been run at Stafford since 1972. That history means something in New England.' , laps: 200},
            { id: 'hickory_classic', name: 'Hickory Motor Speedway Classic', track: 'Hickory Motor Speedway', location: 'Hickory, NC', travelCost: 0, entryCost: 700, fanGain: 650, prize: 2500, reqRep: 18, sponsorChance: 0.08, carType: 'Street Stock / Super Late Model', invite: true, inviteTier: [2], reqTrack: 'Hickory Motor Speedway', desc: 'Hickory is the birthplace of more NASCAR drivers than anywhere else. The Classic is how you get in that conversation.' , laps: 150},
            { id: 'slinger_nationals', name: 'Slinger Nationals 200', track: 'Slinger Speedway', location: 'Slinger, WI', travelCost: 200, entryCost: 600, fanGain: 800, prize: 4000, reqRep: 20, sponsorChance: 0.10, carType: 'Super Late Model', invite: true, inviteTier: [2, 3], reqTrack: 'Slinger Speedway', desc: 'The Slinger Nationals draws the best short-track talent in the Midwest. A win here travels. Points count if you\'re already running the series.' , laps: 200},
            { id: 'oswego_classic', name: 'Oswego Classic 200', track: 'Oswego Speedway', location: 'Oswego, NY', travelCost: 100, entryCost: 600, fanGain: 600, prize: 2500, reqRep: 18, sponsorChance: 0.07, carType: 'Street Stock', invite: true, inviteTier: [2], reqTrack: 'Oswego Speedway', desc: 'Oswego has a unique character — a lake breeze, a tight oval, and a paddock full of people who take this very seriously.' , laps: 200},

            // tier 3 invite events — late model level
            { id: 'north_wilkesboro_throwback', name: 'North Wilkesboro Throwback 250', track: 'North Wilkesboro Speedway', location: 'North Wilkesboro, NC', travelCost: 200, entryCost: 1500, fanGain: 1500, prize: 9000, reqRep: 45, sponsorChance: 0.12, carType: 'Late Model Stock', invite: true, inviteTier: [3, 4], reqTrack: 'North Wilkesboro Speedway', desc: 'North Wilkesboro came back from the dead and it brought everyone with it. The Throwback is a pilgrimage for anyone serious about NASCAR history.' , laps: 250},
            { id: 'richmond_late_model_classic', name: 'Richmond Late Model Classic', track: 'Richmond Raceway', location: 'Richmond, VA', travelCost: 100, entryCost: 1200, fanGain: 1200, prize: 7000, reqRep: 40, sponsorChance: 0.10, carType: 'Late Model Stock', invite: true, inviteTier: [3], reqTrack: 'Richmond Raceway', desc: 'Richmond under the lights for a late model invitational. The track is fast, the field is serious, and the scouts are watching.' , laps: 250},
            { id: 'nashville_fairgrounds_throwback', name: 'Nashville Fairgrounds Throwback 400', track: 'Nashville Fairgrounds Speedway', location: 'Nashville, TN', travelCost: 200, entryCost: 1400, fanGain: 1400, prize: 10000, reqRep: 50, sponsorChance: 0.12, carType: 'Late Model Stock', invite: true, inviteTier: [3], reqTrack: 'Nashville Fairgrounds Speedway', desc: 'The Fairgrounds throwback event brings out the best late model talent in the South. Nashville on a Saturday night. You\'ll remember it.' , laps: 400},
            { id: 'milwaukee_challenge', name: 'Milwaukee Mile Challenge 200', track: 'The Milwaukee Mile', location: 'West Allis, WI', travelCost: 200, entryCost: 1300, fanGain: 1200, prize: 8000, reqRep: 45, sponsorChance: 0.10, carType: 'Late Model Stock', invite: true, inviteTier: [3], reqTrack: 'The Milwaukee Mile', desc: 'The oldest operating motor speedway in the world hosts an invitational. A mile oval with a century of history under the asphalt.' , laps: 200},
            { id: 'martinsville_invitational', name: 'Martinsville Late Model Invitational', track: 'Martinsville Speedway', location: 'Ridgeway, VA', travelCost: 100, entryCost: 1400, fanGain: 1400, prize: 9000, reqRep: 48, sponsorChance: 0.12, carType: 'Late Model Stock', invite: true, inviteTier: [3, 4], reqTrack: 'Martinsville Speedway', desc: 'The paperclip. Martinsville late model invitational is the kind of race that gets talked about for years. Fenders, bumpers, and zero mercy.' , laps: 200},
            { id: 'rockingham_revival', name: 'Rockingham Revival 300', track: 'Rockingham Speedway', location: 'Rockingham, NC', travelCost: 100, entryCost: 1200, fanGain: 1100, prize: 7500, reqRep: 42, sponsorChance: 0.10, carType: 'Late Model Stock', invite: true, inviteTier: [3], reqTrack: 'Rockingham Speedway', desc: 'The Rock is back and the late model community showed up for it. The Revival draws drivers from all over the Southeast.' , laps: 300},

            // tier 4-5 invite events — arca / trucks level
            { id: 'daytona_arca_opener', name: 'Daytona ARCA Opener', track: 'Daytona International Speedway', location: 'Daytona Beach, FL', travelCost: 400, entryCost: 4000, fanGain: 3000, prize: 20000, reqRep: 90, sponsorChance: 0.18, carType: 'ARCA Stock Car', invite: true, inviteTier: [4, 5], reqTrack: null, desc: 'Daytona in February. Every series starts here and you\'ve earned a spot on the entry list. The draft is real. The stakes are real.' , laps: 100},
            { id: 'iowa_corn_250', name: 'Iowa Corn 250', track: 'Iowa Speedway - Oval - 2011', location: 'Newton, IA', travelCost: 300, entryCost: 3500, fanGain: 2500, prize: 18000, reqRep: 85, sponsorChance: 0.15, carType: 'ARCA Stock Car', invite: true, inviteTier: [4], reqTrack: 'Iowa Speedway - Oval - 2011', desc: 'Iowa is one of the best short ovals in the country at any level. The Corn 250 draws a legitimate national field.' , laps: 250},
            { id: 'north_wilkesboro_return', name: 'North Wilkesboro All-Star Invitational', track: 'North Wilkesboro Speedway', location: 'North Wilkesboro, NC', travelCost: 200, entryCost: 5000, fanGain: 4000, prize: 25000, reqRep: 95, sponsorChance: 0.20, carType: 'NASCAR Stock Car', invite: true, inviteTier: [4, 5], reqTrack: 'North Wilkesboro Speedway', desc: 'The All-Star format at North Wilkesboro. No points, all money, maximum chaos. This is the one the sponsors actually talk about at dinner.' , laps: 100},
            { id: 'rockingham_last_lap', name: 'Rockingham Last Lap 200', track: 'Rockingham Speedway', location: 'Rockingham, NC', travelCost: 200, entryCost: 3000, fanGain: 2200, prize: 15000, reqRep: 80, sponsorChance: 0.14, carType: 'Truck Series', invite: true, inviteTier: [5], reqTrack: 'Rockingham Speedway', desc: 'The Rock hosts a trucks invitational and the entry list reads like a who\'s who of the series. Season finale energy even when it\'s mid-season.' , laps: 200},
            { id: 'mini_exhibition', name: 'Mini Stock Local Night', track: 'South Boston Speedway', location: 'South Boston, VA', travelCost: 0, entryCost: 250, fanGain: 150, prize: 500, reqRep: 0, reqFans: 0, sponsorChance: 0, carType: 'Mini Stock', multiClass: false, desc: 'A local night race. Low stakes, good practice.' , laps: 30},
            { id: 'street_exhibition', name: 'Street Stock Grudge Night', track: 'Slinger Speedway', location: 'Slinger, WI', travelCost: 0, entryCost: 400, fanGain: 250, prize: 800, reqRep: 0, reqFans: 0, sponsorChance: 0, carType: 'Street Stock', multiClass: false, desc: 'Grudge night at Slinger. Everyone has a score to settle.' , laps: 40},

            // new prestige short-track invitationals
            { id: 'all_american_400', name: 'All American 400', track: 'Nashville Fairgrounds Speedway', location: 'Nashville, TN', travelCost: 150, entryCost: 1100, fanGain: 1000, prize: 9000, reqRep: 35, sponsorChance: 0.11, carType: 'Late Model Stock', invite: true, inviteTier: [3], reqTrack: 'Nashville Fairgrounds Speedway', desc: 'The All American 400 at Nashville Fairgrounds. One of the most storied late model events in the country. The grandstands fill up for this one.' , laps: 400},
            { id: 'world_series_asphalt', name: 'World Series of Asphalt Stock Car Racing', track: 'New Smyrna Speedway', location: 'New Smyrna Beach, FL', travelCost: 200, entryCost: 900, fanGain: 700, prize: 5000, reqRep: 22, sponsorChance: 0.09, carType: 'Late Model / Street Stock', invite: true, inviteTier: [2, 3], reqTrack: 'New Smyrna Speedway', desc: 'A week-long February tradition at New Smyrna. Multiple classes, multiple nights, and the best short-track talent showing up early in the season to make a statement.' , laps: 200},
            { id: 'valleystar_300', name: 'ValleyStar Credit Union 300', track: 'Martinsville Speedway', location: 'Ridgeway, VA', travelCost: 100, entryCost: 1300, fanGain: 1100, prize: 10000, reqRep: 40, sponsorChance: 0.12, carType: 'Late Model Stock', invite: true, inviteTier: [3, 4], reqTrack: 'Martinsville Speedway', desc: 'The Late Model race at Martinsville. The paperclip. The same track the Cup cars use, just with late model iron and a lot more contact.' , laps: 300},

            { id: 'kern_invitational', name: 'Kern Raceway Invitational', track: "Kevin Harvick's Kern Raceway", location: 'Bakersfield, CA', travelCost: 300, entryCost: 800, fanGain: 600, prize: 4000, reqRep: 20, sponsorChance: 0.08, carType: 'Late Model / Super Late', invite: true, inviteTier: [2, 3], night: true, laps: 175, reqTrack: "Kevin Harvick's Kern Raceway", desc: "Kevin Harvick's house. The West Coast short-track scene comes out for this one and the night race atmosphere is something else." },
            { id: 'langley_fall_classic', name: 'Langley Fall Classic', track: 'Langley Speedway', location: 'Hampton, VA', travelCost: 0, entryCost: 600, fanGain: 500, prize: 3000, reqRep: 15, sponsorChance: 0.07, carType: 'Late Model Stock', invite: true, inviteTier: [2, 3], night: true, laps: 150, reqTrack: 'Langley Speedway', desc: 'The Fall Classic at Langley has been a fixture on the Virginia short-track calendar for years. Night race, fast track, serious field.' },
            { id: 'lanier_shootout', name: 'Lanier Super Late Shootout', track: 'Lanier National Speedway', location: 'Braselton, GA', travelCost: 0, entryCost: 700, fanGain: 600, prize: 3500, reqRep: 18, sponsorChance: 0.08, carType: 'Super Late Model', invite: true, inviteTier: [2, 3], night: true, laps: 200, reqTrack: 'Lanier National Speedway', desc: 'Georgia short-track racing at its best. The Lanier Shootout pulls talent from across the Southeast for a night race that always delivers.' },
            { id: 'myrtle_beach_200', name: 'Myrtle Beach 200', track: 'Myrtle Beach Speedway', location: 'Myrtle Beach, SC', travelCost: 0, entryCost: 700, fanGain: 600, prize: 3500, reqRep: 18, sponsorChance: 0.08, carType: 'Late Model Stock', invite: true, inviteTier: [2, 3], night: true, laps: 200, reqTrack: 'Myrtle Beach Speedway', desc: "The beach is nearby but nobody came for that. The Myrtle Beach 200 draws a strong Southeast field every time." },
            { id: 'south_boston_200', name: 'South Boston 200', track: 'South Boston Speedway', location: 'South Boston, VA', travelCost: 0, entryCost: 600, fanGain: 500, prize: 3000, reqRep: 15, sponsorChance: 0.07, carType: 'Late Model Stock', invite: true, inviteTier: [2, 3], night: true, laps: 200, reqTrack: 'South Boston Speedway', desc: 'South Boston under the lights. Virginia short-track racing at its most competitive. The regulars know every inch of this track and they will not be patient with you.' },
            { id: 'southern_nationals_classic', name: 'Southern Nationals Classic', track: 'Southern National Motorsports Park', location: 'Kenly, NC', travelCost: 0, entryCost: 600, fanGain: 500, prize: 3000, reqRep: 15, sponsorChance: 0.07, carType: 'Late Model Stock', invite: true, inviteTier: [2, 3], night: true, laps: 150, reqTrack: 'Southern National Motorsports Park', desc: "Kenly, North Carolina. The Southern Nationals Classic is a Friday night institution. If you're serious about late model racing in the Carolinas you run this." },
            { id: 'bullring_classic', name: 'The Bullring Classic', track: 'The Bullring', location: 'Las Vegas, NV', travelCost: 400, entryCost: 800, fanGain: 700, prize: 4500, reqRep: 22, sponsorChance: 0.09, carType: 'Super Late Model', invite: true, inviteTier: [2, 3], night: true, laps: 150, reqTrack: 'The Bullring', desc: 'The Bullring sits in the shadow of Las Vegas Motor Speedway. Super lates under desert lights. West Coast talent, national spotlight.' },
            { id: 'thompson_fall_200', name: 'Thompson Fall 200', track: 'Thompson Speedway Motorsports Park', location: 'Thompson, CT', travelCost: 0, entryCost: 700, fanGain: 650, prize: 3500, reqRep: 18, sponsorChance: 0.08, carType: 'Late Model Stock', invite: true, inviteTier: [2, 3], night: false, laps: 200, reqTrack: 'Thompson Speedway Motorsports Park', desc: 'Thompson in the fall. One of the oldest tracks in the country and one of the best fields of the season.' },
            { id: 'gateway_moonlight', name: 'Gateway Moonlight Classic', track: 'Gateway Motorsports Park', location: 'Madison, IL', travelCost: 200, entryCost: 900, fanGain: 700, prize: 4500, reqRep: 22, sponsorChance: 0.09, carType: 'Late Model / Super Late', invite: true, inviteTier: [2, 3], night: true, laps: 150, reqTrack: 'Gateway Motorsports Park', desc: "Night race at Gateway. The Moonlight Classic is the Midwest's answer to the big Southern invitationals. Fast track, fast field, good atmosphere." },
            { id: 'lucas_oil_irp_200', name: 'Lucas Oil 200', track: 'Lucas Oil Indianapolis Raceway Park', location: 'Indianapolis, IN', travelCost: 150, entryCost: 1000, fanGain: 800, prize: 5500, reqRep: 25, sponsorChance: 0.10, carType: 'Late Models', invite: true, inviteTier: [2, 3, 4], night: true, laps: 200, reqTrack: 'Lucas Oil Indianapolis Raceway Park', desc: 'Lucas Oil IRP sits just outside Indianapolis. The oval race draws serious talent during Indy weekend and the night race energy is real.' },
            { id: 'wilkes_200', name: 'Wilkes 200', track: 'North Wilkesboro Speedway', location: 'North Wilkesboro, NC', travelCost: 100, entryCost: 900, fanGain: 900, prize: 6000, reqRep: 28, sponsorChance: 0.10, carType: 'Late Model Stock', invite: true, inviteTier: [2, 3], night: true, laps: 200, reqTrack: 'North Wilkesboro Speedway', desc: 'North Wilkesboro is back and the Wilkes 200 is proof. Late models on one of the most historic ovals in American racing.' },
            { id: 'slinger_nationals_slm', name: 'Slinger Nationals', track: 'Slinger Speedway', location: 'Slinger, WI', travelCost: 200, entryCost: 700, fanGain: 900, prize: 5000, reqRep: 22, sponsorChance: 0.10, carType: 'Super Late Model', invite: true, inviteTier: [2, 3], night: true, laps: 200, reqTrack: 'Slinger Speedway', desc: 'The Slinger Nationals. Super lates at the fastest short track in the Midwest. A win here follows you.' },
            { id: 'usa_international_200', name: 'USA International 200', track: 'USA International Speedway', location: 'Lakeland, FL', travelCost: 100, entryCost: 600, fanGain: 500, prize: 3000, reqRep: 15, sponsorChance: 0.07, carType: 'Super Late Model', invite: true, inviteTier: [2, 3], night: false, laps: 200, reqTrack: 'USA International Speedway', desc: 'Florida heat and super lates. The USA International 200 draws talent from across the Southeast early in the season.' },
        ];

        // teams
        const TEAMS = {
            mini_stock: [
                "Pawlowski's Auto Body", "Earl's Speed Shop", "Backwoods Motorsports",
                "County Line Racing", "Hilltop Racing", "Gravel Road Racing",
                "Pinebrook Motorsports", "Twin Pines Garage",
            ],
            street_stock: [
                'Barnyard Racing', "Cousin's Garage", 'Rural Route Racing',
                'Three Dog Racing', 'Riverside Motorsports', 'Southpaw Racing',
                'Timber Run Racing', 'Lakeview Speed', 'Ironhide Motorsports',
            ],
            super_late_model: [
                'Carolina Asphalt Racing', 'Ridgeline Motorsports', 'Summit Racing Stable',
                'Tri-Oval Racing', 'Flatout Racing', 'Precision Motorsports',
                'Apex Asphalt Racing', 'Benchmark Speed', 'Threshold Motorsports',
            ],
            late_model_stock: [
                'Southern Speed Racing', 'Appalachian Motorsports', 'Piedmont Racing Co.',
                'Blue Ridge Speed', 'Tri-State Racing', 'Carolina Thunder Racing',
                'Shenandoah Motorsports', 'Smoky Mountain Speed', 'Tidewater Racing',
                'Gulf Coast Motorsports',
            ],
            arca_menards: [
                'Pinnacle Motorsports', 'Elevation Racing', 'Heritage Speed Group',
                'National Oval Racing', 'Summit Motorsports', 'Accelerate Racing',
                'Landmark Motorsports', 'Frontier Speed Group', 'Continental Racing',
                'Keystone Motorsports', 'American Oval Racing', 'Crossover Motorsports',
            ],
            nascar_trucks: [
                'Frontier Truck Racing', 'Wildfire Motorsports', 'Crossroads Racing',
                'Thunder Racing', 'Apex Truck Team', 'Ironhorse Motorsports',
                'Stampede Racing', 'Longhaul Motorsports', 'Roughrider Racing',
                'Big Rig Motorsports', 'Outpost Racing', 'Trailblazer Speed',
                'Stonewall Truck Racing', 'Overland Motorsports',
            ],
            nascar_xfinity: [
                'Silver Arrow Racing', 'Criterion Motorsports', 'Momentum Racing Partners',
                'Apex National', 'Phoenix Racing', 'Cardinal Motorsports',
                'Velocity Racing Group', 'Ironside Motorsports', 'Highline National',
                'Threshold Racing', 'Benchmark Motorsports', 'Streamline Racing',
                'Precision National', 'Catalyst Motorsports', 'Vortex Racing',
            ],
            nascar_cup: [
                'Titan Motorsports', 'Crown Racing', 'Dynasty Motor Racing',
                'Apex Cup Team', 'Legacy Motor Club', 'Republic Racing',
                'Ironclad Cup Racing', 'Sovereign Motorsports', 'National Speed Group',
                'Empire Racing', 'Pinnacle Cup Team', 'Vanguard Motor Racing',
                'Landmark Racing', 'Continental Motorsports', 'Heritage Cup Racing',
                'Criterion Cup Team',
            ],
        };

        // team ownership constants
        var TEAM_SALARY_BY_TIER = {
            // Weekly salary paid TO hired drivers by your owned team
            1: { min: 0,    max: 0    }, // open entry — no salaries
            2: { min: 0,    max: 0    },
            3: { min: 400,  max: 900  }, // late model / super late
            4: { min: 800,  max: 2000 }, // arca
            5: { min: 2000, max: 5000 }, // trucks
            6: { min: 4000, max: 9000 }, // xfinity
            7: { min: 8000, max: 20000}, // cup
        };

        var TEAM_CAR_COSTS = {
            // Cost to purchase a car for your team (one car per series slot)
            mini_stock:        { new: 4000,   used: 1500  },
            street_stock:      { new: 7000,   used: 2800  },
            super_late_model:  { new: 18000,  used: 7000  },
            late_model_stock:  { new: 22000,  used: 9000  },
            arca_menards:      { new: 55000,  used: 22000 },
            nascar_trucks:     { new: 120000, used: 50000 },
            nascar_xfinity:    { new: 200000, used: 85000 },
            nascar_cup:        { new: 400000, used: 160000},
            legends:           { new: 5500,   used: 2200  },
            sk_modified:       { new: 8500,   used: 3500  },
        };

        var FACILITY_UPGRADES = [
            { id: 'basic_shop',    name: 'Basic Shop',      cost: 5000,   desc: 'A roof, a lift, and a prayer. Better than the driveway.',  bonus: { reliability: 3 } },
            { id: 'alignment_rig', name: 'Alignment Rig',   cost: 12000,  desc: 'Proper setup means fewer loose-wheel DNFs.',                bonus: { handling: 3 } },
            { id: 'dyno',          name: 'Engine Dyno',     cost: 25000,  desc: 'Know your numbers before you hit the track.',              bonus: { power: 4 } },
            { id: 'fab_shop',      name: 'Fabrication Shop',cost: 40000,  desc: 'Build your own parts. Cut costs, gain edge.',              bonus: { reliability: 5, cost_pct: -10 } },
            { id: 'sim_rig',       name: 'Sim Rig Suite',   cost: 18000,  desc: "Your hired drivers can prep on iRacing. Fancy.",           bonus: { driverDev: 2 } },
            { id: 'wind_tunnel',   name: 'Wind Tunnel',     cost: 80000,  desc: 'You are absolutely not at this level yet but here it is.', bonus: { handling: 6, power: 2 } },
        ];

        var TEAM_STAFF_ROLES = [
            { id: 'crew_chief',   name: 'Crew Chief',    weeklyCost: 600,  bonus: { reliability: 4, handling: 2 } },
            { id: 'engine_builder',name:'Engine Builder', weeklyCost: 500,  bonus: { power: 5 } },
            { id: 'tire_specialist',name:'Tire Specialist',weeklyCost: 350, bonus: { handling: 3 } },
            { id: 'spotter',      name: 'Spotter',       weeklyCost: 200,  bonus: { awareness: 3 } },
            { id: 'pr_manager',   name: 'PR Manager',    weeklyCost: 400,  bonus: { fanGain: 10 } },
        ];

        // Earliest week a player can buy into a team mid-season (as % of schedule)
        var PLAYER_JOIN_CUTOFF_BY_TIER = { 1: 0.3, 2: 0.3, 3: 0.4, 4: 0.4, 5: 0.5, 6: 0.5, 7: 0.6 };