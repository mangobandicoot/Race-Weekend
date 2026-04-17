 // supplemental data
        

        // race conditions
        const CONDITIONS = [
            { id: 'clear', label: 'Clear / Dry', icon: '☀️', color: '#F59E0B', weight: 35, tireWear: 1.0, bodyRisk: 1.0, fanBonus: 0, prizeMult: 1.0, desc: 'Perfect racing weather. No excuses.' },
            { id: 'hot_slick', label: 'Hot & Slick', icon: '🔥', color: '#EF4444', weight: 15, tireWear: 1.4, bodyRisk: 1.1, fanBonus: 0, prizeMult: 1.0, desc: 'Track is greasy. Tires go off fast. Watch your right-front.' },
            { id: 'overcast', label: 'Overcast / Cool', icon: '🌥️', color: '#CBD5E1', weight: 15, tireWear: 0.8, bodyRisk: 0.9, fanBonus: 0, prizeMult: 1.0, desc: 'Grip is there. Car feels good. No drama.' },
            { id: 'night', label: 'Night Race', icon: '🌙', color: '#8B5CF6', weight: 10, tireWear: 0.9, bodyRisk: 1.1, fanBonus: 300, prizeMult: 1.0, desc: 'The lights are on. The crowd is electric. Go racing.' },
            { id: 'light_rain', label: 'Light Rain', icon: '🌦️', color: '#3B82F6', weight: 10, tireWear: 0.7, bodyRisk: 1.3, fanBonus: 100, prizeMult: 1.0, desc: 'Wet track. Slippery. Incident rate goes up. Drive smart.' },
            { id: 'heavy_rain', label: 'Heavy Rain', icon: '⛈️', color: '#1D4ED8', weight: 5, tireWear: 0.6, bodyRisk: 1.5, fanBonus: 200, prizeMult: 0.7, desc: 'Red flag risk. Race may be shortened. Points and prize prorated.' },
            { id: 'fog_delay', label: 'Fog Delay', icon: '🌫️', color: '#94A3B8', weight: 5, tireWear: 1.0, bodyRisk: 1.0, fanBonus: 50, prizeMult: 1.0, desc: 'Two-hour delay. Catering is bad. Race goes off eventually.' },
            { id: 'heat_wave', label: 'Extreme Heat', icon: '🌡️', color: '#DC2626', weight: 5, tireWear: 1.6, bodyRisk: 1.2, fanBonus: 0, prizeMult: 1.0, desc: 'Tires are done by halfway. Blowout risk is real. Manage it.' },
        ];

        function rollCondition() {
            const total = CONDITIONS.reduce((s, c) => s + c.weight, 0);
            let r = Math.random() * total;
            for (const c of CONDITIONS) { r -= c.weight; if (r <= 0) return c.id; }
            return 'clear';
        }

        // repair items
        // basecost * tier factor
        const REPAIR_ITEMS = [
            // wear - optional post-race
            { id: 'tires', label: 'Tires', category: 'wear', baseCost: 80, mandatory: false, restores: [{ bar: 'Tires', color: '#10B981', amt: 60 }], desc: 'Fresh rubber for next race. Skip at your own risk on a hot track.' },
            { id: 'brakes', label: 'Brake Service', category: 'wear', baseCost: 120, mandatory: false, restores: [{ bar: 'Brakes', color: '#3B82F6', amt: 60 }], desc: 'Pads and rotors check. Skip three in a row and see what happens.' },
            { id: 'engine_tune', label: 'Engine Tune', category: 'wear', baseCost: 200, mandatory: false, restores: [{ bar: 'Engine', color: '#EF4444', amt: 70 }], desc: 'Carb, timing, valve clearances. Keeps the thing reliable.' },
            { id: 'suspension', label: 'Suspension Check', category: 'wear', baseCost: 150, mandatory: false, restores: [{ bar: 'Suspension', color: '#F97316', amt: 65 }], desc: 'Bump stops, shocks, alignment. Affects handling next race.' },
            { id: 'fuel_sys', label: 'Fuel System Check', category: 'wear', baseCost: 100, mandatory: false, restores: [], desc: 'Fuel lines, filter, pump. Cheap insurance.' },
            // damage - incidents and bad conditions
            { id: 'bodywork', label: 'Bodywork Repair', category: 'damage', baseCost: 300, mandatory: false, restores: [{ bar: 'Chassis', color: '#F59E0B', amt: 60 }], desc: 'Sheet metal, panels, nose. Cosmetic but affects downforce.' },
            { id: 'front_clip', label: 'Front Clip Repair', category: 'damage', baseCost: 600, mandatory: false, restores: [{ bar: 'Chassis', color: '#F59E0B', amt: 60 }], desc: 'Radiator support, core support, everything up front.' },
            { id: 'rear_clip', label: 'Rear Clip Repair', category: 'damage', baseCost: 500, mandatory: false, restores: [{ bar: 'Chassis', color: '#F59E0B', amt: 60 }], desc: 'Rear bumper, trunk lid, quarter panels.' },
            { id: 'suspension_d', label: 'Suspension Repair', category: 'damage', baseCost: 800, mandatory: false, restores: [{ bar: 'Suspension', color: '#F97316', amt: 65 }], desc: 'Bent control arms, spindles, tie rods. Has to be fixed.' },
            // dnf means you have to fix this
            { id: 'engine_rebuild', label: 'Engine Rebuild', category: 'dnf', baseCost: 2500, mandatory: true, restores: [{ bar: 'Engine', color: '#EF4444', amt: 70 }], desc: 'Spun a bearing, threw a rod, cooked a head. Not cheap.' },
            { id: 'trans_rebuild', label: 'Transmission Rebuild', category: 'dnf', baseCost: 1800, mandatory: true, restores: [{ bar: 'Engine', color: '#EF4444', amt: 50 }], desc: 'Missed a downshift, ground the gears into dust.' },
            { id: 'fire_damage', label: 'Fire Damage Repair', category: 'dnf', baseCost: 3500, mandatory: true, restores: [{ bar: 'Engine', color: '#EF4444', amt: 80 }, { bar: 'Chassis', color: '#F59E0B', amt: 50 }], desc: 'Electrical fire, fuel fire, take your pick. Everything needs replacing.' },
            { id: 'rollover', label: 'Rollover Repairs', category: 'dnf', baseCost: 4000, mandatory: true, restores: [{ bar: 'Chassis', color: '#F59E0B', amt: 60 }], desc: 'Roll cage, body, suspension. The whole car basically.' },
            { id: 'hard_crash', label: 'Hard Crash Repairs', category: 'dnf', baseCost: 2000, mandatory: true, restores: [{ bar: 'Chassis', color: '#F59E0B', amt: 60 }], desc: 'Front clip, suspension, bodywork. Big hit.' },
        ];

        // lower tiers pay more relative to their income, intentionally painful
        const REPAIR_TIER_MULT = { 1: 0.8, 2: 0.9, 3: 1.0, 4: 1.4, 5: 1.8, 6: 2.5, 7: 3.5 };

        // maps dnf reasons to repair items - checks all keywords, can stack
        function getDNFRepairs(dnfReason) {
            if (!dnfReason) return ['hard_crash'];
            const r = dnfReason.toLowerCase();
            const repairs = new Set();

            if (r.includes('engine') || r.includes('motor') || r.includes('rod') || r.includes('bearing') || r.includes('blown')) {
                repairs.add('engine_rebuild');
            }
            if (r.includes('fire')) {
                repairs.add('fire_damage');
            }
            if (r.includes('roll')) {
                repairs.add('rollover');
            }
            if (r.includes('trans') || r.includes('gearbox') || (r.includes('gear') && !r.includes('gearbox')) || r.includes('shift')) {
                repairs.add('trans_rebuild');
            }
            if (r.includes('crash') || r.includes('accident') || r.includes('contact') || r.includes('wall') || r.includes('wreck') || r.includes('hit')) {
                repairs.add('hard_crash');
                repairs.add('suspension_d');
            }
            if (r.includes('tire') || r.includes('blowout') || r.includes('flat') || r.includes('puncture')) {
                repairs.add('tires');
                repairs.add('suspension_d');
            }
            if (r.includes('fuel') || r.includes('oil')) {
                repairs.add('fuel_sys');
                repairs.add('engine_tune');
            }
            if (r.includes('suspension') || r.includes('spindle') || r.includes('control arm') || r.includes('tie rod')) {
                repairs.add('suspension_d');
            }
            if (r.includes('body') || r.includes('fender') || r.includes('panel') || r.includes('sheet metal')) {
                repairs.add('bodywork');
            }
            if (r.includes('front clip') || r.includes('radiator') || r.includes('nose')) {
                repairs.add('front_clip');
            }
            if (r.includes('rear') || r.includes('quarter panel') || r.includes('trunk')) {
                repairs.add('rear_clip');
            }

            // default - something hit something hard
            return repairs.size > 0 ? [...repairs] : ['hard_crash'];
        }

        // suggest wear items based on how the race went
        function suggestWearRepairs(conditionId, position, fieldSize) {
            const cond = CONDITIONS.find(c => c.id === conditionId) || CONDITIONS[0];
            const suggestions = [];
            if (cond.tireWear >= 1.3 || position > fieldSize * 0.6) suggestions.push('tires');
            if (cond.tireWear >= 1.2) suggestions.push('brakes');
            if (position <= 5) suggestions.push('engine_tune'); // up front all race, engine worked for it
            if (cond.bodyRisk >= 1.2) suggestions.push('bodywork');
            suggestions.push('suspension'); // always check suspension
            return [...new Set(suggestions)];
        }

        // mad libs race summaries
        // tokens: {name} {track} {pos} {series} {rival} {gap} {laps} {team} {season} {prize}
        // t1-3: punchy short track tone
        // t4+: beat writer style

        const SUMMARIES_WIN_LOCAL = [
            "{name} did what {name} does best at {track} Saturday night — got to the front and stayed there. {laps}. The {series} field had no answer.",
            "Checkered flag. {name}. {track}. That's all you need to know. {laps}, took home {prize}, and made it look easy.",
            "They said the outside lane was done at {track}. {name} didn't get the memo. Ran {rival} down with ten to go and never looked back.",
            "Nobody in the {series} pits was surprised when {name} climbed out of the car grinning. Another win, another {prize}. Season {season} is going to be something.",
            "Hot laps, cool head, checkered flag. {name} put on a clinic at {track} and the crowd knew it from lap one.",
            "{name} took the lead from {rival} on a restart and that was the ballgame. Smooth all night at {track}. {prize} richer.",
            "Start to finish at {track}. {name} controlled every restart, kept the car clean, and banked another {series} win. Simple as that.",
            "{name} and {rival} swapped the lead four times in the final twenty laps. When it mattered most, {name} had just a little more left. Victory lane.",
            "The {series} field came to {track} looking for an upset. They left watching {name} do burnouts. {prize} and the points lead. Not bad.",
            "{name} went to the top side on lap one and never left. {track} rewarded commitment tonight. {laps}. {prize} in the pocket.",
            "Win number whatever-it-is for {name} at {track}. The locals are starting to talk. The {series} rivals are starting to worry.",
            "Couldn't have drawn it up any better. {name} qualified well, avoided the early mess, took the lead late, and held off {rival} at the line. {prize}.",
            "The {series} race at {track} was {name}'s from the second half on. Led through the final cautions, held the line on the last restart, and didn't look back. {prize}.",
            "{rival} had the car to beat all night at {track}. Had it right up until {name} showed up in the mirror with fifteen to go. Didn't end the way {rival} planned.",
            "Short-track wins don't come clean. This one was typical — {name} got into {rival} for position, got loose, caught it, and still managed to park it in victory lane. {prize}.",
            "The {series} is full of drivers who can run fast laps. Fewer of them can actually close a race. {name} is one of them. {track} proved it again.",
            "Came to {track} needing a good result. Left with {prize} and the win. {name} doesn't overthink these things. Just drives the car.",
            "{winner} led most of the night. {name} led the last lap. That's the one that counts at {track}.",
        ];

        const SUMMARIES_WIN_NATIONAL = [
            "{name} delivered a commanding performance at {track} in the {series}, {laps} en route to a victory worth {prize}. The margin over {rival} was comfortable but earned.",
            "There are wins and then there are statements. {name}'s run at {track} was the latter — a controlled, methodical drive from the front that left the {series} field wondering what just happened.",
            "{name} and the {team} crew executed a near-perfect race at {track}, converting qualifying speed into a {series} victory. {laps}. This team is operating at a different level right now.",
            "For the {team} operation, {name}'s {series} race at {track} was about as good as it gets. {name} led when it mattered, managed the restarts flawlessly, and banked {prize}.",
            "The {series} visit to {track} produced a familiar result: {name} in victory lane, {prize} in hand, and a comfortable points haul to go with it. {laps}. The championship picture is shifting.",
            "{name} made passing {rival} for the lead look routine at {track}, then stretched the margin to comfortable before the final caution came out. Another {series} win. Season {season} is building into something real.",
            "From {team}'s perspective, the strategy was right, the car was right, and {name} was absolutely right on all night at {track}. A {series} win worth {prize} and exactly the statement they needed heading into the next stretch of the schedule.",
            "Pit road made the difference at {track}. The {team} crew gave {name} track position on the final cycle, {name} protected the line, and the {series} win followed. Clinical. Deserved. {prize}.",
            "{name} put the {series} field away in stages at {track} — clear of traffic by lap twenty, clear of {rival} by the halfway point, and never in doubt after that. {prize}. This is what championship form looks like.",
            "There were faster cars in the {series} field at {track} on paper. On the track, though, {name} turned fast laps into the right laps at the right time, and that's why the trophy is going home with {team}.",
        ];

        const SUMMARIES_GOOD_LOCAL = [
            "Top five at {track} for {name}. Not the win, but not far off either. {rival} had something for everybody tonight.",
            "{name} kept it clean and brought home a solid {pos} at {track}. {prize}, no damage, good night. The {series} points race is alive.",
            "Ran with {rival} all night at {track} before settling for {pos}. {name} will take it — clean car, decent money, and a lot learned.",
            "A quiet {pos} for {name} at {track} in the {series}. Not flashy. Not controversial. Just fast laps and a paycheck.",
            "{name} showed some real speed in the middle stages at {track} before traffic shuffled the running order. {pos}, {prize}. The pace is there.",
            "Racing is a long game and {name} played it well tonight at {track}. {pos} in the {series}, car intact, points in the bank. Better nights are coming.",
            "{pos} at {track}. {name} had a top three car early but a caution at the wrong time killed the track position. Finished {pos}, collected {prize}, moved on.",
            "Clean and consistent. {name} stayed out of the chaos at {track}, ran {pos} in the {series}, and heads home with {prize} and a healthy car. Solid night.",
            "{name} and {rival} traded paint once and traded positions twice before {name} settled into {pos}. Not the result either of them wanted but {prize} beats going home empty.",
            "{winner} got the win. {name} got {pos} and {prize} and a car that came home in one piece. Not the same as winning, but it's not nothing.",
            "{name} was running better than {pos} suggests for most of the night at {track}. A late caution shuffled everything. You play the hand you're dealt.",
            "Some nights the setup is off and you nurse it home. {pos} at {track}, {prize}. {name} will take the points and the clean sheet.",
            "{name} stayed in {pos} for the last thirty laps and didn't panic once. The car wasn't fast enough to go higher. It was fast enough to stay there. That's something.",
            "{rival} ran away with the {series} race at {track}. Behind them, {name} ran a methodical {pos}. Not as good as first. A lot better than the alternative.",
        ];

        const SUMMARIES_GOOD_NATIONAL = [
            "{name} salvaged a {pos} finish at {track} after a mid-race incident with {rival} disrupted what had been a strong {series} run. The {prize} is useful. The frustration is real but manageable.",
            "A solid {pos} for the {team} entry at {track}. {name} was consistent throughout the {series} event, staying out of trouble and collecting valuable championship points when the race didn't go to plan.",
            "{name} described the {pos} finish at {track} as 'acceptable, not satisfying.' The {series} pace was clearly there in practice and qualifying. The results will follow if this team keeps executing.",
            "Points, prize money, and a car in one piece. {name}'s {pos} in the {series} at {track} checks all the boxes for a weekend where winning wasn't quite on the menu.",
            "The {team} team came to {track} with championship points in mind and left with exactly that. {pos} in the {series}, {prize}, and {name} still within striking distance of the leaders. Mission accomplished.",
            "{name} picked up a {pos} in the {series} at {track} on a day when managing the race was more important than attacking it. The {team} crew called a smart strategy and {name} delivered. {prize}.",
            "Off the pace in the early laps but increasingly strong as the {series} race at {track} wore on, {name} worked up to {pos} before the checkered flag. The {team} side of the garage has things to sort, but the result is decent and the points are real.",
            "{name} had {rival} covered for most of the second half of the {series} race at {track}. A {pos} finish and {prize} isn't the haul they came for, but it keeps {name} in the championship conversation heading into the next round.",
        ];

        const SUMMARIES_BAD_LOCAL = [
            "Not {name}'s night at {track}. Started mid-pack, couldn't find a lane, finished {pos}. Happens. The {series} will be back next week.",
            "{pos} for {name} at {track}. Ran into {rival} early, lost the fender, lost the handling, lost the position. {prize} for a long night.",
            "The {series} race at {track} was one to forget for {name}. {pos}, damaged car, minimal points. Tomorrow is another day.",
            "Tough night at {track}. {name} never really found the rhythm in the {series} event. {pos}, packed up, drove home.",
            "The setup was off, the traffic was bad, and {name} never had the car to compete at {track}. {pos}. Move on.",
            "Sometimes you're the hammer and sometimes you're the nail. {name} was the nail at {track}. {pos} in the {series}. {prize}. Not what anyone wanted.",
            "{name} went three-wide for a position that wasn't there at {track} and spent the rest of the {series} night paying for it. {pos}. The car is fixable. The points hurt more.",
            "A quiet {pos} for {name} at {track} — quiet being a polite word for invisible. The {series} race passed {name} by almost completely tonight.",
            "{winner} won the {series} race at {track}. {name} finished {pos}. Those two facts are not related. They just both happened in the same evening.",
            "The {series} field at {track} had {name} buried from the opening green flag. {pos}. The car never came to life. Everybody has a night like this. Doesn't make it better.",
            "{name} caught {rival} at exactly the wrong time at {track}. The contact was minor. The position loss wasn't. {pos}. {prize}. On to the next.",
            "The longest races feel short when they're going well. This was not going well. {name} finished {pos} at {track} and it felt like every one of those laps.",
            "{pos} for {name} at {track}. Nothing dramatic — just a night where the car was average and the results matched. The {series} doesn't grade on a curve.",
        ];

        const SUMMARIES_BAD_NATIONAL = [
            "{name} and the {team} crew will want to review the tape from {track}. A {pos} finish in the {series} doesn't reflect the championship ambitions of this team, and everyone in the garage knows it.",
            "An off weekend for {name} in the {series} at {track}. The {pos} result puts some distance between this team and the championship leaders, but it's not insurmountable if they respond quickly.",
            "{track} was unkind to {name} on Saturday. A {pos} finish in the {series} after contact with {rival} leaves the team with real questions heading into the next round of the schedule.",
            "The {team} team leaves {track} with minimal points and a {pos} {series} result that will require some honest conversation about car setup and race strategy. The speed is somewhere — it just wasn't on track today.",
            "{name} didn't have the {series} car to run up front at {track} and the {pos} result showed it. The {team} crew will be working late this week. The championship math is getting uncomfortable.",
            "Every team in the {series} paddock goes through weekends like this. {name}'s came at {track}: a {pos} finish, {prize}, and a long debrief ahead. The only question is how quickly {team} bounces back.",
            "A {pos} for {name} in the {series} at {track} that will sting more for what it wasn't than what it was. The car had pace in practice. On race day it didn't come together, and {rival} made sure {name} paid for every mistake.",
        ];

        const SUMMARIES_DNF_LOCAL = [
            "DNF for {name} at {track}. Early night, long drive home. The {series} doesn't care about bad luck.",
            "{name} was running well at {track} before the {series} race ended early. The repair bill is going to sting.",
            "Parked early at {track}. {name} DNF'd in the {series} and the crew has work to do before the next one.",
            "They say it's not how you start, it's how you finish. {name} didn't finish at {track}. DNF in the {series}. On to the next.",
            "Looked good for a while at {track}. Then it wasn't. {name} DNF, zero points, zero prize money. The {series} is a cruel sport.",
            "{name} was in the top ten at {track} when the night went sideways. DNF in the {series}. The crew chief isn't happy. The car needs work. The schedule doesn't wait.",
            "One bad moment ended {name}'s night at {track}. DNF in the {series}. It happens. What matters is how the response comes next week.",
            "The {series} race at {track} lasted about as long as it needed to for {name}. Which is to say: not long. DNF.",
            "{rival} saw the whole thing happen. {name} didn't finish at {track}. No points. No prize. The hauler ride home is always the same kind of quiet.",
            "Ran with the front pack at {track} until something gave out. DNF for {name}. The car said it was done before {name} was ready to agree.",
            "Whatever {name} planned for {track}, none of it mattered after the DNF. Some nights the race just ends. Tonight was one of them.",
        ];

        const SUMMARIES_DNF_NATIONAL = [
            "A DNF at {track} derails what had been a promising start to the {series} weekend for {name} and the {team} squad. The championship damage is real.",
            "{name}'s {series} night at {track} ended prematurely, handing back points to championship rivals and adding a repair bill to the week's budget. A tough one to absorb.",
            "The {team} operation absorbs a difficult DNF result at {track} in the {series}. {name} will need a strong rebound next time out to keep championship hopes alive and the sponsor confidence intact.",
            "{name} was running well inside the top ten at {track} when the {series} race ended without warning. DNF. The {team} crew will work through the night to understand why and make sure it doesn't happen again.",
            "No points. No prize money. No good explanations. {name}'s DNF at {track} in the {series} is the kind of result that changes the tone of an entire season if it's not answered quickly. The pressure on {team} is real.",
            "A cruel end to what had been a disciplined {series} performance from {name} at {track}. The DNF cost this team dearly in the standings, and {rival} didn't waste the opportunity to extend their points lead.",
        ];

        const SUMMARIES_DQ_LOCAL = [
            "Black flag for {name} at {track}. Disqualified. The {series} officials had seen enough.",
            "{name} was shown the DQ at {track}. The result stands, and the conversation in the {series} pits will last all week.",
            "Disqualified at {track}. {name} won't be in the {series} points this week, and the appeals process is expensive.",
            "The {series} stewards made their call at {track}: DQ for {name}. Fair or not, it's official and the points are gone.",
            "Whatever {name} was thinking at {track}, the {series} officials disagreed with it thoroughly. DQ. No points, no prize money, and some explaining to do.",
            "The checkered flag meant nothing for {name} at {track}. Post-race inspection found a problem and the {series} called it a DQ. Short night. Long week ahead.",
        ];

        const SUMMARIES_DQ_NATIONAL = [
            "{name} was disqualified following post-race inspection at {track} in the {series}. The {team} camp is reviewing their options and preparing an appeal, but the points are gone for now.",
            "A technical infraction at {track} cost {name} a result in the {series}. Disqualified after inspection. Points forfeited. The {team} engineering department has questions to answer before the next race.",
            "The {series} penalties office made an unwelcome call to the {team} hauler: {name} DQ'd at {track} for a rules violation. The fine is manageable. The points loss is not.",
            "Championship implications aside, {name}'s disqualification at {track} is a costly and avoidable mistake for the {team} {series} effort. The technical staff will be under the microscope this week.",
            "A race result {name} thought was decent turned into a DQ in post-race inspection at {track}. The {series} rulebook doesn't grade on effort, and the {team} crew chief will have a frank conversation before the next event.",
            "{name} crossed the {track} finish line in a solid position before the {series} technical officials made their finding. Disqualified. The points swing toward the championship rivals is significant, and the pressure on {team} to respond is immediate.",
        ];

        function getMadLibSummary(result, seriesId, track, team, season, rivalName) {
            const s = getSeries(seriesId);
            const tier = s ? s.tier : 1;
            const national = tier >= 4;
            const pos = result.position;
            const dnf = result.dnf;
            const dq = result.dq;

            let pool;
            if (dq) pool = national ? SUMMARIES_DQ_NATIONAL : SUMMARIES_DQ_LOCAL;
            else if (dnf) pool = national ? SUMMARIES_DNF_NATIONAL : SUMMARIES_DNF_LOCAL;
            else if (pos === 1) pool = national ? SUMMARIES_WIN_NATIONAL : SUMMARIES_WIN_LOCAL;
            else if (pos <= 5) pool = national ? SUMMARIES_GOOD_NATIONAL : SUMMARIES_GOOD_LOCAL;
            else pool = national ? SUMMARIES_BAD_NATIONAL : SUMMARIES_BAD_LOCAL;

            const template = pool[Math.floor(Math.random() * pool.length)];
            const lapsText = result.mostLaps ? 'Led the most laps' : result.lapsLed ? 'Led laps' : '';
            const gapText = (result.finishOrder && result.finishOrder[1] && result.finishOrder[1].lapTime) ? result.finishOrder[1].lapTime : '';

            // family angle - did a relative race too
            let familyAngle = '';
            if (result.finishOrder && result.finishOrder.length >= 4) {
                const familyGroups = {};
                (result.finishOrder || []).forEach(function(entry) {
                    if (!entry.name || entry.isPlayer) return;
                    const d = (G.drivers || []).find(function(dr) { return dr.name === entry.name && dr._familyName; });
                    if (!d) return;
                    if (!familyGroups[d._familyName]) familyGroups[d._familyName] = [];
                    familyGroups[d._familyName].push(entry.name);
                });
                const familyKeys = Object.keys(familyGroups).filter(function(k) { return familyGroups[k].length >= 2; });
                if (familyKeys.length && Math.random() < 0.40) {
                    var _ln = familyKeys[0];
                    var _fMembers = familyGroups[_ln];
                    var _fCount = _fMembers.length;
                    var _fBest = _fMembers.sort(function(a, b) { return (a.pos || 99) - (b.pos || 99); })[0];
                    var _fWorst = _fMembers[_fMembers.length - 1];
                    var _fBestFirst = (_fBest.name || '').split(' ')[0];
                    var _fWorstFirst = (_fWorst.name || '').split(' ')[0];
                    var _allTop10 = _fMembers.every(function(m) { return (m.pos || 99) <= 10; });
                    if (_fCount >= 2 && _fBest.pos && _fWorst.pos) {
                        if (_allTop10) {
                            familyAngle = ' Both ' + _ln + 's finished in the top ten — ' + _fBestFirst + ' at ' + ordinal(_fBest.pos) + ', ' + _fWorstFirst + ' at ' + ordinal(_fWorst.pos) + '.';
                        } else {
                            familyAngle = ' The ' + _ln + ' family ran ' + _fCount + ' cars tonight. ' + _fBestFirst + ' best of them at ' + ordinal(_fBest.pos) + '.';
                        }
                    } else {
                        familyAngle = ' The ' + _ln + ' family had ' + _fCount + ' entries in the field tonight.';
                    }
                }
            }

            // extended tokens - rival pos, winner, runner-up
            var rivalFinishText = rivalName || 'the field';
            var winnerName = ''; var p2Name = '';
            if (result.finishOrder && result.finishOrder.length) {
                var _rvE = rivalName ? result.finishOrder.find(function(e) { return e.name && e.name.toLowerCase() === rivalName.toLowerCase(); }) : null;
                if (_rvE) { rivalFinishText = _rvE.dnf ? rivalName + " DNF'd" : rivalName + ' finished ' + ordinal(_rvE.pos || _rvE.position); }
                if (pos !== 1) { var _w = result.finishOrder.find(function(e) { return !e.dnf && (e.pos === 1 || e.position === 1); }); if (_w && !_w.isPlayer) winnerName = _w.name; }
                if (pos === 1 && result.finishOrder.length >= 2) { var _p2 = result.finishOrder[1]; if (_p2 && !_p2.isPlayer) p2Name = _p2.name; }
            }
            return (template
                .replace(/{name}/g, getDisplayName(G))
                .replace(/{track}/g, track)
                .replace(/{pos}/g, ordinal(pos || 0))
                .replace(/{series}/g, (s && s.short) || 'series')
                .replace(/{rival}/g, rivalName || 'the field')
                .replace(/{rival_finish}/g, rivalFinishText)
                .replace(/{winner}/g, winnerName || 'the winner')
                .replace(/{p2}/g, p2Name || rivalName || 'the field')
                .replace(/{gap}/g, gapText)
                .replace(/{laps}/g, lapsText)
                .replace(/{team}/g, team || 'the team')
                .replace(/{season}/g, String(season))
                .replace(/{prize}/g, fmtMoney(result.prize || 0))
                .replace(/{field}/g, (result.fieldSize || 20) >= 20 ? 'full field' : (result.fieldSize || 20) + '-car field')
            ) + familyAngle;
        }

        // random calendar events
        // These fire between races (~15% chance per race completed)
        const CALENDAR_EVENTS = [
            // Positive
            {
                id: 'parts_deal', weight: 3, title: 'Parts Hookup', valence: 'good',
                desc: 'A local parts supplier wants to back you. They\'ll cover your next tire bill.',
                effect: 'money', value: 800
            },
            {
                id: 'fan_mail', weight: 3, title: 'Fan Mail Surge', valence: 'good',
                desc: 'A video of your last race went viral on a local racing forum. Fans are noticing.',
                effect: 'fans', value: 500
            },
            {
                id: 'sponsor_bonus', weight: 2, title: 'Sponsor Happy', valence: 'good',
                desc: 'Your sponsor loved the last race. Unexpected bonus hit the account.',
                effect: 'money', value: 3000
            },
            {
                id: 'media_feature', weight: 2, title: 'Local Media Feature', valence: 'good',
                desc: 'A regional motorsport outlet ran a feature on your season. Clean press.',
                effect: 'rep_fans', repValue: 5, fanValue: 400
            },
            {
                id: 'rival_stumbles', weight: 2, title: 'Rival DNF', valence: 'good',
                desc: 'Your closest rival in the points DNF\'d their last race. You picked up ground.',
                effect: 'rep', value: 3
            },
            {
                id: 'prize_bump', weight: 1, title: 'Bonus Prize Money', valence: 'good',
                desc: 'A local business put up a special award for your last result. Check is in the mail.',
                effect: 'money', value: 1500
            },
            // Negative
            {
                id: 'parts_fail', weight: 3, title: 'Parts Failure Warning', valence: 'bad',
                desc: 'Your engine builder flagged a potential issue during inspection. Recommend a precautionary rebuild.',
                effect: 'money', value: -2000
            },
            {
                id: 'bad_press', weight: 2, title: 'Controversy', valence: 'bad',
                desc: 'An on-track incident got some bad coverage. A few fans are unhappy.',
                effect: 'rep_fans', repValue: -3, fanValue: -200
            },
            {
                id: 'sponsor_threat', weight: 2, title: 'Sponsor Concern', valence: 'bad',
                desc: 'Your sponsor sent an email. Results need to improve or they\'ll revisit the deal.',
                effect: 'rep', value: -2
            },
            {
                id: 'theft', weight: 1, title: 'Parts Theft', valence: 'bad',
                desc: 'Someone broke into the hauler. Lost some spare parts. Insurance claim filed. Sort of.',
                effect: 'money', value: -1500
            },
            {
                id: 'injury_scare', weight: 1, title: 'Practice Incident', valence: 'bad',
                desc: 'Hard hit in practice. Nothing broken but you\'re sore. Might affect next race.',
                effect: 'rep', value: -1
            },
            // Neutral / interesting
            {
                id: 'rulebook', weight: 2, title: 'Rule Change', valence: 'neutral',
                desc: 'The series announced a minor rule change for the rest of the season. Affects everyone equally.',
                effect: 'none'
            },
            {
                id: 'teammate_move', weight: 2, title: 'Teammate Update', valence: 'neutral',
                desc: 'A teammate is being considered for a promotion to a higher series. Word travels fast.',
                effect: 'none'
            },
            {
                id: 'track_resurface', weight: 1, title: 'Track Resurfaced', valence: 'neutral',
                desc: 'Next race venue got fresh asphalt. Track will be slippery early, fast late.',
                effect: 'none'
            },
            {
                id: 'record_crowd', weight: 1, title: 'Record Crowd Expected', valence: 'good',
                desc: 'Next race is selling out. Promoter expects a record crowd. Sponsors are pleased.',
                effect: 'fans', value: 300
            },
        ];

        // season end trophies
        const TROPHY_TIERS = [
            { minPos: 1, label: 'Champion', color: '#F59E0B', icon: '🏆' },
            { minPos: 2, label: 'Runner-Up', color: '#CBD5E1', icon: '🥈' },
            { minPos: 3, label: 'Third Place', color: '#CD7F32', icon: '🥉' },
            { minPos: 10, label: 'Top 10', color: '#10B981', icon: '✅' },
            { minPos: 999, label: 'Participated', color: '#94A3B8', icon: '🏁' },
        ];