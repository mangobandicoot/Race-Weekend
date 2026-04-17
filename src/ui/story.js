// season end mad-libs
        const SEASON_SUMMARY_CHAMP = [
            "{name} is your {series} champion. {wins} wins, {top5s} top fives, {prize} in prize money. The ladder has another rung. Start climbing.",
            "Champion. The word fits {name} after a Season {season} {series} campaign that nobody in the pits will forget quickly. {wins} wins said everything that needed saying.",
            "{name} closed out the {series} title with {wins} wins and a commanding points lead at the end. The hardware is real. The question now is what's next.",
            "Season {season}: {totalRaces} starts, {wins} wins, {top5s} top fives, one championship. {name} ran the {series} exactly the way it needed to be run — consistent, aggressive when it mattered, and clean when it didn't.",
            "{wins} wins. {top5s} top fives. {prize} earned. A {series} championship. That's the Season {season} résumé for {name}, and it's a strong one. The door to the next level is open.",
            "The {series} season is over and {name} is champion. It wasn't always pretty — {totalRaces} starts and some hard nights mixed in — but the wins came when it counted and the points told the true story by the end.",
            "A Season {season} nobody who watched the {series} will forget easily. {name} put together {wins} wins, kept the car in one piece race after race, and walked away with the championship. That's how it's supposed to be done.",
        ];

        const SEASON_SUMMARY_PODIUM = [
            "{name} finished the {series} season in {pos} — competitive, occasionally brilliant, not quite the title. {wins} wins still on the board and the resume is getting stronger.",
            "{pos} in the {series} points. {name} was in the mix all season, collected {wins} wins and {top5s} top fives. Close but the championship went elsewhere. The gap to close is real but closeable.",
            "The {series} title wasn't {name}'s in Season {season} but {wins} wins and {top5s} top fives in {pos} makes this a résumé worth building on. The next step up the ladder is in sight.",
            "Season {season} ends with {name} in {pos} in the {series} standings. {totalRaces} races, {wins} wins, {top5s} top fives, and {prize} in the bank. The pieces are there. The championship will come if the consistency follows.",
            "{name} ends Season {season} in {pos} in the {series}. The wins were real, the top fives were real, and the margins at the end of the year were close enough that a few different outcomes swing the whole thing. File this one under 'unfinished business' and come back ready.",
            "A {pos} in the {series} for {name} in Season {season} that will feel like a missed opportunity for a while. {wins} wins. {top5s} top fives. {prize} earned. More than respectable. But the championship was right there, and that's the only thing anyone remembers.",
        ];

        const SEASON_SUMMARY_MIDPACK = [
            "{name} ends the {series} season in {pos}. {top5s} top fives, {prize} earned. Not the year anyone hoped for, but experience is its own currency at this level.",
            "Season done. {pos} in the {series}. {name} showed flashes — {top5s} top fives, some decent paychecks — but consistency was the missing ingredient all season.",
            "{pos} in the {series} standings for {name}. {totalRaces} races, {prize} in prize money. The foundation is there. The results need to follow in Season {season_next}.",
            "{name} leaves Season {season} with a {pos} in the {series} standings and a long list of things to work on. {wins} wins on the board, {top5s} top fives, and a clear picture of where the gaps are. That's more than some drivers get.",
            "The {series} season didn't go the way {name} drew it up. {pos} in the final standings, {top5s} top fives, {prize} earned from {totalRaces} starts. The pace was there sometimes. The execution wasn't consistent enough. Season {season_next} needs a different answer.",
        ];

        const SEASON_SUMMARY_WINLESS = [
            "No wins in the {series} for {name} in Season {season}. {top5s} top fives, {totalRaces} starts, {prize}. The win will come. It has to.",
            "{name} leaves Season {season} without a {series} win. {top5s} top fives, though, and not for lack of trying. Next season is a fresh start.",
            "Season {season} in the {series}: {totalRaces} races, {top5s} top fives, zero wins. {name} knows exactly what needs to improve and that self-awareness is worth something.",
            "The {series} win column stays empty for {name} after Season {season}. {top5s} top fives from {totalRaces} starts tells you the pace is there. The win is coming. The question is whether the patience holds out until it does.",
            "Zero wins in the {series} in Season {season}. That number is going to drive the offseason work for {name} more than anything else. {top5s} top fives from {totalRaces} starts. The consistency is building. The breakthrough hasn't come yet.",
        ];
        function getSeasonNarrativeLine(summary) {
            var name = G.driverName;
            var topRival = (G.rivals || [])
                .filter(function (r) { return ['rival', 'frenemy'].includes(relationship(r)); })
                .sort(function (a, b) { return ((b.incidents || 0) + (b.closeRaces || 0)) - ((a.incidents || 0) + (a.closeRaces || 0)); })
            [0];
            var topFriend = (G.rivals || [])
                .filter(function (r) { return relationship(r) === 'friend'; })
            [0];
            var hadInjury = summary.hadInjury;
            var name = getDisplayName(G);
            var pos = (summary.championships[0] && summary.championships[0].position) || 99;
            var wins = summary.wins;

            // family angle - any relatives have a good season
            var familyLines = [];
            var familyGroups = {};
            (G.drivers || []).filter(function(d) { return d.active && d._familyName && d._familyMembers && d._familyMembers.length; }).forEach(function(d) {
                if (!familyGroups[d._familyName]) familyGroups[d._familyName] = [];
                if (!familyGroups[d._familyName].find(function(x) { return x.name === d.name; })) {
                    familyGroups[d._familyName].push(d);
                }
            });
            Object.keys(familyGroups).forEach(function(lastName) {
                var group = familyGroups[lastName];
                if (group.length < 2) return;
                var combined = group.reduce(function(a, d) { return a + (d.seasonWins || 0); }, 0);
                if (combined >= 2) {
                    familyLines.push('The ' + lastName + ' family put up ' + combined + ' combined wins this season. A dynasty is forming.');
                    familyLines.push('Two ' + lastName + 's with wins this season. The family business is booming.');
                } else if (group.length >= 2) {
                    familyLines.push('Multiple ' + lastName + 's in the same field all season. The paddock has gotten used to seeing that name twice on the entry list.');
                }
            });

            var rivalLines = topRival ? [
                'The subplot of the season was the running battle with ' + topRival.name + '. That one isn\'t over.',
                topRival.name + ' was the name that kept coming up. In the standings. In the drama. In the paddock.',
                'Whatever happens next season, the unfinished business with ' + topRival.name + ' is going to be part of the story.',
                'If there\'s one name from this season that sticks, it\'s ' + topRival.name + '.',
            ] : [];

            var friendLines = topFriend ? [
                'One unexpected development: the relationship with ' + topFriend.name + ' that nobody saw coming.',
                'Not everything was conflict. The connection with ' + topFriend.name + ' was one of the better things to come out of this season.',
            ] : [];

            var injuryLines = hadInjury ? [
                'The injury changed the shape of the season. Coming back from that says something.',
                'Missing races is one thing. Coming back and running the way ' + name + ' did is another thing entirely.',
            ] : [];

            var arcLines = wins >= 3 ? [
                'This was the season where the question stopped being "can they win?" and started being "how many?"',
                'The wins came. The momentum built. This is what a career starting to peak looks like.',
            ] : wins === 0 ? [
                'A winless season doesn\'t tell the whole story. The pace was there. The results weren\'t.',
                'No wins. But this wasn\'t a wasted season. The foundation got stronger.',
            ] : pos === 1 ? [
                'Championship seasons have their own weight. This was one of them.',
            ] : [
                'Not the season ' + name + ' drew up. But not the end of the story either.',
                'Somewhere in the middle of this season the direction became clearer. Next year will be different.',
            ];

            var pool = [].concat(rivalLines, rivalLines, friendLines, injuryLines, arcLines, familyLines);
            if (!pool.length) return '';
            return pool[Math.floor(Math.random() * pool.length)];
        }

        function getBroadcastNarrative(summary) {
            var name = getDisplayName(G);
            var pos = (summary.championships[0] && summary.championships[0].position) || 99;
            var wins = summary.wins;
            var season = summary.season;
            var repTier = getRepTier(G.reputation);

            if (pos === 1) return name + ' is the story of Season ' + season + '. Championship, wins, and a reputation that is no longer up for debate. The ladder has another rung.';
            if (pos <= 3 && wins > 0) return 'Season ' + season + ' was the season ' + name + ' announced themselves. Not a champion. Not yet. But the gap is closing and the competition knows it.';
            if (wins >= 3) return 'Three or more wins in a season changes the narrative. ' + name + ' is no longer just a name to watch. This is a driver who wins races.';
            if (wins === 0 && summary.totalRaces >= 8) return 'The results didn\'t come in Season ' + season + '. But ' + name + ' is still here. Still racing. The story isn\'t written yet.';
            if (G.reputation >= 130) return name + ' is a ' + repTier.label + ' now. The paddock treats them differently. The media asks different questions. Something shifted this season.';
            return 'Season ' + season + ' for ' + name + ': another chapter. Not the defining one. But part of the arc.';
        }
        function getSeasonMadLib(summary) {
            const { wins, top5s, totalRaces, championships, season } = summary;
            const champ = championships[0];
            const pos = (champ && champ.position) || 99;
            const seriesName = (champ && champ.seriesName) || 'series';
            const prize = fmtMoney(summary.totalPrize || 0);
            const name = getDisplayName(G);

            let pool;
            if (pos === 1) pool = SEASON_SUMMARY_CHAMP;
            else if (pos <= 3) pool = SEASON_SUMMARY_PODIUM;
            else if (wins > 0) pool = SEASON_SUMMARY_MIDPACK;
            else pool = SEASON_SUMMARY_WINLESS;

            const tpl = pool[Math.floor(Math.random() * pool.length)];
            return tpl
                .replace(/{name}/g, name)
                .replace(/{series}/g, seriesName)
                .replace(/{wins}/g, wins)
                .replace(/{top5s}/g, top5s)
                .replace(/{pos}/g, ordinal(pos))
                .replace(/{prize}/g, prize)
                .replace(/{totalRaces}/g, totalRaces)
                .replace(/{season}/g, season)
                .replace(/{season_next}/g, season + 1);
        }

// story journal

        function addStoryJournalEntry(state, seriesId, raceIdx, result) {
            if (!state.storyJournal) state.storyJournal = [];
            var s = getSeries(seriesId);
            var race = (state.schedules[seriesId] || [])[raceIdx];
            if (!s || !race || !result) return;
            var name = getDisplayName(state);
            var pos = result.position;
            var dnf = result.dnf;
            var dq = result.dq;
            var track = race.track;
            var prize = fmtMoney(result.prize || 0);
            var pts = result.points || 0;
            var fanGain = result._fanGain || 0;
            var repGain = result._repGain || 0;
            var closeFinishes = result.closeFinishes || [];
            var pick = function(arr) { return arr[Math.floor(Math.random() * arr.length)]; };
            var closeFinishes = result.closeFinishes || [];

            // rival in the finish order
            var rivalContext = '';
            var rivals = state.rivals || [];
            if (result.finishOrder && result.finishOrder.length && rivals.length) {
                var rv = rivals[0];
                var rvEntry = result.finishOrder.find(function(e) { return e.name && e.name.toLowerCase() === rv.name.toLowerCase(); });
                if (rvEntry) {
                    var rp = rvEntry.pos || rvEntry.position;
                    if (rvEntry.dnf) rivalContext = rv.name + " DNF'd.";
                    else if (rp === 1 && pos !== 1) rivalContext = rv.name + ' won the race.';
                    else if (pos === 1 && rp > 1) rivalContext = rv.name + ' finished ' + ordinal(rp) + '.';
                    else if (rp && Math.abs(rp - pos) <= 2) rivalContext = 'Close night with ' + rv.name + ', who ended up ' + ordinal(rp) + '.';
                }
            }

            // championship context
            var champContext = '';
            var myPts = (state.championshipPoints || {})[seriesId] || 0;
            var rows = Object.entries(state.seriesFields[seriesId] || {}).map(function(kv) { return kv[1].points || 0; }).sort(function(a,b) { return b-a; });
            var leaderPts = rows[0] || 0;
            var gap = leaderPts - myPts;
            if (myPts > 0 && myPts >= leaderPts) champContext = ' ' + name + ' leads the ' + s.short + ' standings.';
            else if (myPts > 0 && gap <= 50 && !dnf && pos <= 5) champContext = ' The title hunt is alive.';
            else if ((dnf || dq) && gap > 20) champContext = ' Tough night for the standings.';

            // champion context - compute before _safePos
            var champPos = null, champTotal = null, champGap = null;
            var _myPts2 = (state.championshipPoints || {})[seriesId] || 0;
            var _fieldRows2 = Object.values(state.seriesFields[seriesId] || {}).map(function(d) { return d.points || 0; }).sort(function(a,b) { return b-a; });
            if (_fieldRows2.length) {
                var _leaderPts2 = _fieldRows2[0];
                var _allPts = [_myPts2].concat(_fieldRows2).sort(function(a,b) { return b-a; });
                champPos = _allPts.indexOf(_myPts2) + 1;
                champTotal = _allPts.length;
                champGap = _leaderPts2 - _myPts2;
            }

            // build multi-paragraph race story
            var _cond = CONDITIONS ? CONDITIONS.find(function(c) { return c.id === (race.condition || 'clear'); }) : null;
            var _condDesc = _cond && _cond.id !== 'clear' ? _cond.label.toLowerCase() : null;
            var _nightRace = !!race.night;
            var _location = (race.city && race.state) ? race.city + ', ' + race.state : '';
            var _isPremier = !!race.isPremier;
            var _safePos = (typeof champPos === 'number' && champPos > 0) ? champPos : null;

            // para 1 - the result as a story
            var para1 = '';
            var _trackStr = track + (_location ? ', ' + _location : '');
            if (dq) {
                para1 = pick([
                    name + ' crossed the finish line at ' + track + ' and then waited. The post-race inspection found something the team hadn\'t planned for, and by the time everyone packed up the result was gone. The team is working through the paperwork. The points aren\'t coming back.',
                    'It went wrong after the race, which is almost worse. ' + name + ' ran a clean event at ' + track + ', finished where they finished, and then watched the officials take it away. Disqualified. The team\'s official statement was brief and the mood in the hauler was briefer.',
                    'The car crossed the line and the clock stopped and that was supposed to be the end of it. Then tech inspection found a violation, and ' + name + '\'s result at ' + track + ' became a footnote. No points. No prize. A long drive home.',
                ]);
            } else if (dnf) {
                var _dnfCause = result.dnfReason || pick(['a mechanical issue', 'an engine problem', 'something in the drivetrain that had no warning signs', 'a failure nobody saw coming']);
                para1 = pick([
                    'The race at ' + _trackStr + ' ended the way nobody wanted it to. ' + name + ' was in a decent spot, working through traffic and collecting the kind of laps that add up over a season, when ' + _dnfCause + ' took the decision away from everyone. Climbing out of the car with the race still going is a specific kind of frustration — the kind that stays with you on the drive home.',
                    track + ' was supposed to be a straightforward night. ' + name + ' had the car in position, the pace was there, and then ' + _dnfCause + ' ended it. DNF on the scoresheet. The team loaded up without saying much. They\'ll go through the data this week and figure out what happened, and then they\'ll do it all again next race.',
                    'Some nights the car takes the decision out of your hands. ' + track + ' was that kind of night for ' + name + ' — running strong until ' + _dnfCause + ' parked the car before the finish. The result column says DNF and that\'s accurate, but it doesn\'t really describe what happened out there.',
                    'There was a version of tonight where ' + name + ' came home with a solid result. The car had the pace for it. Then ' + _dnfCause + ' happened, and that version ended. The garage crew will sort through what went wrong and the team will show up next week. That\'s the job.',
                ]);
            } else if (pos === 1) {
                var _winPrize = fmtMoney(prize);
                para1 = pick([
                    name + ' won at ' + _trackStr + (_nightRace ? ' under the lights' : '') + (_isPremier ? ', and it was the ' + race.premierName + ' so the win carries more weight than a normal Saturday night' : '') + '. The race had its difficult moments — it always does — but when the checkered flag came out it was ' + name + ' who was there to collect it. The ' + _winPrize + ' goes in the account, the points go in the standings, and the team will be talking about this one for a while.',
                    'Victory lane at ' + track + ' belonged to ' + name + ' tonight. It wasn\'t always pretty and there were moments in the middle of the race where the outcome was genuinely unclear, but that\'s racing — what matters is where you are when the flag falls. ' + name + ' was in front, which is where the team has been working to get all season.',
                    'There were faster cars on paper coming into ' + track + '. At least two or three teams had more raw speed in practice. None of that mattered when it counted, and ' + name + ' collected the win and the ' + _winPrize + ' and the points that come with it. Sometimes the race goes to the driver who executes rather than the one who qualifies quickest.',
                    'The checkered flag at ' + track + ' went to ' + name + ', and honestly it felt right by the end of it. Led when it mattered, survived the moments that could have gone wrong, and came out ahead of everyone. That\'s the whole job description and tonight it got done.',
                ]);
            } else if (pos <= 3) {
                para1 = pick([
                    'A podium at ' + track + ' — ' + ordinal(pos) + ' for ' + name + (_nightRace ? ' in a night race' : '') + '. The car was capable of more and everyone in the team knows it, but finishing on the podium in the ' + s.short + ' is never something to wave off. The points are real, the prize money is ' + fmtMoney(prize) + ', and the finish was earned.',
                    name + ' came home ' + ordinal(pos) + ' at ' + track + ', which is good but not what the team circled on the calendar before the race. The win was there at various points in the night and it didn\'t quite happen, but a podium finish in this series is a solid result and the standings will reflect it.',
                    ordinal(pos) + ' place at ' + track + ' for ' + name + '. Clean race, good pace through most of it, and a result that puts them in the conversation on points. Not the win. Still a strong night.',
                ]);
            } else if (pos <= 8) {
                para1 = pick([
                    name + ' finished ' + ordinal(pos) + ' at ' + track + (_nightRace ? ' under the lights' : '') + ', which is somewhere in the range of what the team expected coming in. The field was competitive and the car did what it could do. ' + fmtMoney(prize) + ' and some useful championship points.',
                    ordinal(pos) + ' for ' + name + ' at ' + track + '. The pace was there in stretches, the strategy was reasonable, and the result is an honest reflection of where things stand. Not every race is going to be a win or a podium — this one was about executing and collecting points and the team did that.',
                    'A ' + ordinal(pos) + ' at ' + track + ' for ' + name + '. There were moments in the race where it looked like it might become something better, but the field is deep in the ' + s.short + ' and a top-eight finish is what it is — a result worth having, even if it\'s not the one anyone gets excited about.',
                ]);
            } else if (pos <= 15) {
                para1 = pick([
                    name + ' finished ' + ordinal(pos) + ' at ' + track + '. The team was aiming for better and the car had the potential for better on a different kind of night, but the race played out the way it played out and ' + ordinal(pos) + ' is what ended up on the scoresheet. The debrief will be honest.',
                    ordinal(pos) + ' at ' + track + ' for ' + name + '. There\'s not a lot to dress up about a result like this one — the car ran, the laps got done, the team brought it home. Sometimes a race weekend is about damage control and points and moving on to the next one, and that\'s what this was.',
                    'A difficult night at ' + track + ' for ' + name + ', who finished ' + ordinal(pos) + '. The car wasn\'t where it needed to be and the pace just wasn\'t there at the right moments. The team will look at the data, make some adjustments, and come back to the next round with something to work with.',
                ]);
            } else {
                para1 = pick([
                    name + ' crossed the finish line ' + ordinal(pos) + ' at ' + track + ' and the team packed up without many words. There are weekends in racing where everything goes sideways and this was one of them. The result is what it is. The important thing is that the car finished and everyone goes home to figure out what comes next.',
                    ordinal(pos) + ' for ' + name + ' at ' + track + '. A hard race to take. The team will go through everything this week and try to understand what went wrong, but right now the only thing on anyone\'s mind is getting some distance from this result and resetting for the next round.',
                    'Some nights just belong to someone else. ' + track + ' was that kind of night for ' + name + ', who finished ' + ordinal(pos) + ' after a race that never really found its rhythm. There\'s no version of this that gets spun into a good story so the team isn\'t going to try — they\'ll work on the car and come back stronger.',
                ]);
            }

            // para 2 - conditions, qual, close battles, incidents
            var para2Parts = [];
            if (_condDesc && _condDesc !== 'clear') {
                para2Parts.push(pick([
                    'The ' + _condDesc + ' made it a different kind of race. Cars that looked quick in practice were handling it differently once the green flag fell, and the whole field was adapting on the fly.',
                    'Racing in ' + _condDesc + ' conditions added another variable to an already complicated night. Some teams adjusted better than others and it showed in the results.',
                    'The weather played a role. ' + _condDesc.charAt(0).toUpperCase() + _condDesc.slice(1) + ' conditions mean different tire behavior, different grip levels, and a race that rewards adaptability over raw pace.',
                ]));
            }
            if (result.qualPosition) {
                var _qp = result.qualPosition;
                if (_qp === 1) para2Parts.push('Started on pole, which set up the day well from the beginning.');
                else if (_qp <= 5) para2Parts.push('Qualified ' + ordinal(_qp) + ' and had a clean view of the field from the start.');
                else if (_qp > 15) para2Parts.push('Started ' + ordinal(_qp) + ' and spent a lot of the race working back through traffic, which costs time and tires both.');
            }
            if (closeFinishes.length && !dnf && !dq) {
                var _cf = closeFinishes[0];
                var _cfName = _cf.name || _cf;
                para2Parts.push(pick([
                    'The battle with ' + _cfName + ' was the highlight of the race from a competition standpoint — the kind of side-by-side racing where you don\'t know who\'s going to come out of it until they do. ' + name + ' came out ahead of it, which is the only way to tell a story like that.',
                    'There was a stretch late in the race where ' + _cfName + ' was right there every corner, and neither driver was willing to give an inch. The crowd had to enjoy that part even if both of them probably found it stressful.',
                    _cfName + ' pushed hard all night and nearly had something for ' + name + ' in the closing laps, but the gap held. That\'s the kind of race you remember even when the result isn\'t the one you wanted.',
                ]));
            }
            if ((result.incidentDrivers || []).length) {
                var _inc = result.incidentDrivers[0];
                para2Parts.push(pick([
                    'There was contact with ' + _inc + ' at some point in the race, and it cost time. Whether it was avoidable or just one of those racing deals is a conversation for later, but the result definitely would have been different without it.',
                    'The incident with ' + _inc + ' was the moment the night changed. These things happen in close-quarters racing but that doesn\'t make them easier to process when you\'re the one who lost positions because of it.',
                    'A run-in with ' + _inc + ' didn\'t help the cause. The team will review it and decide how to handle it going forward, but losing track position in that situation was the difference between a better result and the one that ended up on the board.',
                ]));
            }
            var para2 = para2Parts.join(' ');

            // para 3 - points and championship
            var para3 = '';
            if (_safePos !== null && !dnf && !dq && pts > 0) {
                var _champStr = s.short + ' standings';
                if (_safePos === 1 && champTotal > 1) {
                    para3 = pts + ' points from ' + track + ' and ' + name + ' leads the ' + s.short + ' championship. That\'s a position that carries its own kind of weight — every driver in the paddock knows where you are, and every week someone is trying to take it away. The gap gets checked constantly and the team is managing that pressure along with everything else.';
                } else if (champGap !== null && champGap <= 15 && champGap > 0) {
                    para3 = pts + ' more points for ' + name + ', who is now ' + champGap + ' back in the ' + _champStr + '. That\'s a gap that closes in one good race, and with ' + (race.round ? 'rounds still to run' : 'races remaining') + ' on the schedule, nothing is settled. The team knows the math and they\'re not ready to let this one go.';
                } else if (champGap !== null && champGap <= 40 && champGap > 0) {
                    para3 = ordinal(_safePos) + ' in the ' + _champStr + ' after tonight, ' + champGap + ' points behind the leader. It\'s a gap that needs work but it\'s not a crisis — the season isn\'t over and there are still points on the table. The team is staying focused on what they can control and not worrying about the number too much yet.';
                } else if (pts > 0) {
                    para3 = 'Added ' + pts + ' points to the ' + s.short + ' total tonight, sitting ' + ordinal(_safePos) + ' in the standings. The season is taking shape and each result either closes the gap or widens it — this one held the position and that\'s something to build on.';
                }
            } else if (dnf) {
                para3 = 'The DNF hurts in the standings. Someone else added points tonight while ' + name + ' was in the garage, and that gap doesn\'t close by itself. The team isn\'t panicking — there\'s still time — but races like this one narrow the margin for error.';
            }

            // para 4 - paddock stuff
            var para4Parts = [];
            if (rivalContext) para4Parts.push(rivalContext);
            var _aiDramas = (state.dramaQueue || []).filter(function(d) {
                return d.id && d.id.startsWith('ai_incident_') && !d._storyUsed;
            }).slice(0, 2);
            _aiDramas.forEach(function(d) {
                d._storyUsed = true;
                para4Parts.push(d.desc);
            });
            var _familyDrama = (state.dramaQueue || []).find(function(d) {
                return d.id && d.id.startsWith('family_') && !d._storyUsed;
            });
            if (_familyDrama) {
                _familyDrama._storyUsed = true;
                para4Parts.push(_familyDrama.desc);
            }
            var para4 = para4Parts.join(' ');

            var text = [para1, para2, para3, para4].filter(Boolean).join('\n\n').trim();
            // after first mention use last name only
            if (name && name.indexOf(' ') > -1) {
                var _lastName = getLastName(name);
                var _firstName = name.split(' ')[0];
                var _nameRegex = new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
                var _firstSeen = false;
                text = text.replace(_nameRegex, function() {
                    if (!_firstSeen) { _firstSeen = true; return name; }
                    return _lastName || _firstName;
                });
            }

            // grab ai incidents for the behind the scenes thread
            var aiIncidentSnaps = [];
            if (result.finishOrder && result.finishOrder.length >= 4) {
                var _order = result.finishOrder.filter(function(e) { return !e.isPlayer && e.name; });
                for (var _i = 0; _i < Math.min(_order.length - 1, 8); _i++) {
                    var _a = _order[_i], _b = _order[_i + 1];
                    var _dA = (state.drivers || []).find(function(d) { return d.name === _a.name; });
                    var _dB = (state.drivers || []).find(function(d) { return d.name === _b.name; });
                    if (_dA && _dB) {
                        var _aggrAvg = ((_dA.aiStats && _dA.aiStats.aggression) || 60) + ((_dB.aiStats && _dB.aiStats.aggression) || 60);
                        if (_aggrAvg / 2 > 62 && Math.random() < 0.25) {
                            var _rivals = (_dA.aiRivals || []).includes(_dB.name) || (_dB.aiRivals || []).includes(_dA.name);
                            var _friends = (_dA.aiFriends || []).includes(_dB.name);
                            aiIncidentSnaps.push({ a: _a.name, b: _b.name, posA: _i + 1, posB: _i + 2, areRivals: _rivals, areFriends: _friends, dnfA: !!_a.dnf, dnfB: !!_b.dnf });
                        }
                    }
                }
            }
            state.storyJournal.push({
                season: state.season,
                week: state.week,
                track: track,
                city: race.city || '',
                state: race.state || '',
                series: s.short,
                seriesId: seriesId,
                pos: pos,
                fs: result.fieldSize || 20,
                dnf: !!dnf,
                dq: !!dq,
                dnfReason: result.dnfReason || null,
                prize: result.prize || 0,
                pts: result.points || 0,
                fans: result._fanGain || 0,
                repGain: result._repGain || 0,
                closeFinishes: (result.closeFinishes || []).map(function(cf) { return cf.name || cf; }),
                incidentDrivers: (result.incidentDrivers || []).slice(0, 3),
                night: !!race.night,
                condition: race.condition || 'clear',
                isPremier: !!race.isPremier,
                premierName: race.premierName || null,
                qualPos: result.qualPosition || null,
                champPos: champPos,
                champTotal: champTotal,
                champGap: champGap,
                confidence: state.confidence || 0,
                aiIncidents: aiIncidentSnaps,
                text: text.trim(),
            });
            if (state.storyJournal.length > 200) state.storyJournal = state.storyJournal.slice(-200);
        }

        function renderSideQuests() {
            var f = document.createDocumentFragment();
            f.appendChild(h('div', { className: 'page-title' }, 'Pit Road'));
            f.appendChild(h('div', { className: 'page-sub' }, 'Run single races in any series without a full contract. Pay the entry fee, score points, earn rep and money. No commitment beyond the race you enter.'));

            // sub-tabs: one per available series + side series
            var contractedIds = new Set((G.contracts || []).map(function(c) { return c.seriesId; }));

            // series we arent in, sorted by tier
            var availableSeries = SERIES.filter(function(s) {
                return !contractedIds.has(s.id);
            }).sort(function(a, b) { return a.tier - b.tier; });

            // can we race here
            var playerTier = G.contracts.length
                ? Math.max.apply(null, G.contracts.map(function(c) {
                    var cs = getSeries(c.seriesId); return cs && !cs.isSideStep ? (cs.tier || 1) : 1;
                }))
                : 1;

            function seriesEligible(s) {
                // legends/sk just need rep and fans
                if (s.isSideStep) {
                    return G.reputation >= (s.reqRep || 0) && G.fans >= (s.reqFans || 0);
                }
                // cant guest more than 2 tiers from current level
                if (Math.abs(s.tier - playerTier) > 2) return false;
                // no cup driver in mini stock
                if (s.tier < playerTier - 1) return false;
                return G.reputation >= (s.reqRep || 0) && G.fans >= (s.reqFans || 0);
            }

            if (!availableSeries.length) {
                f.appendChild(h('div', { className: 'card', style: { textAlign: 'center', padding: '24px', color: '#94A3B8' } },
                    'You\'re contracted in every series. Nothing left to enter as a single-race guest.'
                ));
                return f;
            }

            // tab state
            var _prTab = G._pitRoadTab || availableSeries[0].id;
            if (!availableSeries.find(function(s) { return s.id === _prTab; })) _prTab = availableSeries[0].id;

            var tabRow = h('div', { style: { display: 'flex', gap: '4px', marginBottom: '20px', borderBottom: '2px solid #1E2433', paddingBottom: '0', flexWrap: 'wrap' } });
            availableSeries.forEach(function(s) {
                var active = _prTab === s.id;
                var eligible = seriesEligible(s);
                tabRow.appendChild(h('button', {
                    style: {
                        background: 'transparent', border: 'none',
                        borderBottom: active ? '2px solid ' + (eligible ? s.color : '#475569') : '2px solid transparent',
                        color: active ? (eligible ? s.color : '#475569') : (eligible ? '#64748B' : '#374151'),
                        padding: '8px 14px', fontSize: '13px', fontWeight: 700,
                        letterSpacing: '0.05em', textTransform: 'uppercase',
                        cursor: eligible ? 'pointer' : 'default',
                        opacity: eligible ? '1' : '0.45',
                    },
                    onClick: eligible ? function() { G._pitRoadTab = s.id; render(); } : null
                }, s.short));
            });
            f.appendChild(tabRow);

            var activeSeries = availableSeries.find(function(s) { return s.id === _prTab; });
            if (!activeSeries) return f;

            var s = activeSeries;
            var sched = (s.isSideStep ? (G.sideSchedules && G.sideSchedules[s.id]) : G.schedules[s.id]) || [];
            var myPitEntries = (G.pitEntries || []).filter(function(pe) {
                return pe.seriesId === s.id && pe.season === G.season;
            });
            var myEntryIdxs = new Set(myPitEntries.map(function(pe) { return pe.raceIdx; }));

            // Series header
            var _sideJoined = s.isSideStep && (G.sideContracts || []).find(function(c) { return c.seriesId === s.id && c.season === G.season; });
            f.appendChild(h('div', { className: 'card', style: { marginBottom: '16px', borderLeft: '4px solid ' + s.color } },
                h('div', { style: { display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' } },
                    h('div', { style: { flex: 1 } },
                        h('div', { style: { fontSize: '18px', fontWeight: 900, color: s.color } }, s.name),
                        h('div', { style: { fontSize: '13px', color: '#94A3B8', marginTop: '4px' } }, s.desc),
                    ),
                    h('div', { style: { textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' } },
                        h('div', null,
                            h('div', { style: { fontSize: '12px', color: '#64748B', textTransform: 'uppercase' } }, 'Entry Fee'),
                            h('div', { style: { fontSize: '20px', fontWeight: 900, color: '#F59E0B' } }, fmtMoney(s.fee)),
                        ),
                        s.isSideStep ? (
                            _sideJoined
                                ? mkBtn('Drop Full Season', 'btn btn-sm btn-danger', function() {
                                    G.sideContracts = (G.sideContracts || []).filter(function(c) { return !(c.seriesId === s.id && c.season === G.season); });
                                    addLog(G, '🔧 Left side series: ' + s.short);
                                    saveGame(); render();
                                })
                                : mkBtn('Join Full Season', 'btn btn-sm btn-secondary', function() {
                                    if (!G.sideContracts) G.sideContracts = [];
                                    if (!G.sideSchedules) G.sideSchedules = {};
                                    if (!G.sideFields) G.sideFields = {};
                                    if (!G.sidePoints) G.sidePoints = {};
                                    G.sideContracts.push({ seriesId: s.id, season: G.season, joinedWeek: G.week });
                                    if (!G.sideSchedules[s.id]) G.sideSchedules[s.id] = generateSideSchedule(s.id, G.schedules);
                                    if (typeof seedSideSeriesDrivers !== 'undefined') seedSideSeriesDrivers(s.id);
                                    if (typeof initSideField !== 'undefined') initSideField(s.id);
                                    addLog(G, '🔧 Joined side series: ' + s.name + ' (Week ' + G.week + ')');
                                    saveGame(); render();
                                })
                        ) : null,
                    ),
                )
            ));

            // If no schedule generated yet, offer to generate
            if (!seriesEligible(s)) {
                var _reasons = [];
                if (G.reputation < (s.reqRep || 0)) _reasons.push('Rep ' + G.reputation + '/' + s.reqRep);
                if (G.fans < (s.reqFans || 0)) _reasons.push('Fans ' + fmtFans(G.fans) + '/' + fmtFans(s.reqFans));
                if (!s.isSideStep && Math.abs(s.tier - playerTier) > 2) _reasons.push('Too many tiers above your current level');
                if (!s.isSideStep && s.tier < playerTier - 1) _reasons.push('Below your current level');
                f.appendChild(h('div', { style: { background: '#0F0A00', border: '1px solid #F59E0B44', borderRadius: '8px', padding: '14px 16px', marginBottom: '16px', color: '#94A3B8', fontSize: '14px' } },
                    h('div', { style: { fontWeight: 700, color: '#F59E0B', marginBottom: '6px' } }, '🔒 Not Yet Eligible'),
                    h('div', null, _reasons.join(' · '))
                ));
                return f;
            }

            if (!sched.length) {
                f.appendChild(h('div', { className: 'card', style: { textAlign: 'center', padding: '24px' } },
                    h('div', { style: { color: '#94A3B8', marginBottom: '12px' } }, 'No schedule generated for this series yet.'),
                    mkBtn('Generate Schedule', 'btn btn-primary', function() {
                        if (s.isSideStep) {
                            if (!G.sideSchedules) G.sideSchedules = {};
                            if (!G.sideFields) G.sideFields = {};
                            G.sideSchedules[s.id] = generateSideSchedule(s.id, G.schedules);
                            if (typeof seedSideSeriesDrivers !== 'undefined') seedSideSeriesDrivers(s.id);
                        } else {
                            G.schedules[s.id] = generateSchedule(s.id, G.trackPools);
                            var existing = (G.drivers || []).filter(function(d) { return d.active && d.currentSeriesId === s.id; });
                            if (!existing.length) {
                                var count = (typeof SERIES_DRIVER_POOL !== 'undefined' && SERIES_DRIVER_POOL[s.id]) || SERIES_FIELD_SIZE[s.id] || 20;
                                for (var _i = 0; _i < count; _i++) {
                                    var nm = generateAIName();
                                    var tries = 0;
                                    while ((G.drivers || []).find(function(d) { return d.name === nm; }) && tries < 100) { nm = generateAIName(); tries++; }
                                    G.drivers.push(createDriver(nm, rand(30 + s.tier * 5, 55 + s.tier * 7), s.id, 'generated'));
                                }
                            }
                        }
                        if (!G.seriesFields[s.id]) G.seriesFields[s.id] = {};
                        saveGame(); render();
                    })
                ));
                return f;
            }

            // My entries summary
            var myRan = myPitEntries.filter(function(pe) {
                var r = sched[pe.raceIdx];
                return r && r.result && !r.result._pitEntrySkipped;
            });
            if (myPitEntries.length) {
                f.appendChild(h('div', { style: { display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' } },
                    h('div', { className: 'card', style: { flex: 1, padding: '10px 14px' } },
                        h('div', { style: { fontSize: '11px', color: '#64748B', textTransform: 'uppercase' } }, 'Planned'),
                        h('div', { style: { fontSize: '24px', fontWeight: 900, color: s.color } }, myPitEntries.length)
                    ),
                    h('div', { className: 'card', style: { flex: 1, padding: '10px 14px' } },
                        h('div', { style: { fontSize: '11px', color: '#64748B', textTransform: 'uppercase' } }, 'Raced'),
                        h('div', { style: { fontSize: '24px', fontWeight: 900, color: '#10B981' } }, myRan.length)
                    ),
                    h('div', { className: 'card', style: { flex: 1, padding: '10px 14px' } },
                        h('div', { style: { fontSize: '11px', color: '#64748B', textTransform: 'uppercase' } }, 'Points'),
                        h('div', { style: { fontSize: '24px', fontWeight: 900, color: '#F59E0B' } }, G.championshipPoints[s.id] || 0)
                    ),
                ));
            }

            // Schedule grid
            var grid = h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' } });
            sched.forEach(function(race, i) {
                var raceWeek = race.week || race.round;
                var done = !!(race.result && !race.result.simulated && !race.result._pitEntrySkipped);
                var skipped = !!(race.result && race.result._pitEntrySkipped);
                var simulated = !!(race.result && race.result.simulated && !myEntryIdxs.has(i));
                var isMyEntry = myEntryIdxs.has(i);
                var isPast = raceWeek < G.week;
                var isCurrent = raceWeek === G.week;
                var isFuture = raceWeek > G.week;
                var pc = done ? (race.result.dnf ? '#EF4444' : race.result.position === 1 ? '#F59E0B' : race.result.position <= 5 ? '#10B981' : '#94A3B8') : '#94A3B8';
                var resultLabel = done ? (race.result.dnf ? 'DNF' : 'P' + race.result.position) : '';

                var borderColor = isMyEntry ? s.color : isCurrent ? '#10B981' : '#1E2433';
                var bgColor = isMyEntry && !done ? s.color + '11' : isCurrent ? '#0D1820' : 'transparent';

                var row = h('div', {
                    style: {
                        background: bgColor,
                        border: '1px solid ' + borderColor,
                        borderRadius: '7px', padding: '10px 12px',
                        opacity: isPast && !isMyEntry && !done ? '0.4' : '1',
                        cursor: done ? 'pointer' : 'default',
                    },
                    onClick: done ? function() { openRaceHistoryModal(s.id, i); } : undefined,
                },
                    h('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' } },
                        h('div', { style: { width: '26px', height: '26px', borderRadius: '4px', background: '#060A10', border: '1px solid #1E2433', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800, color: s.color, flexShrink: 0 } }, i + 1),
                        h('div', { style: { flex: 1, fontWeight: 700, fontSize: '13px', color: '#F9FAFB', lineHeight: '1.3' } },
                            race.track,
                            race.night ? h('span', { style: { fontSize: '11px', color: '#8B5CF6', marginLeft: '4px' } }, '🌙') : null,
                        ),
                        done ? h('span', { style: { fontSize: '13px', fontWeight: 900, color: pc } }, resultLabel) : null,
                    ),
                    race.isPremier ? h('div', { style: { display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 800, color: '#F59E0B', background: '#F59E0B18', border: '1px solid #F59E0B44', borderRadius: '4px', padding: '2px 7px', marginBottom: '4px' } },
                        '⭐ ', race.premierName || 'Premier Event'
                    ) : race.isSupportRace ? h('div', { style: { display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 800, color: '#D97706', background: '#D9770618', border: '1px solid #D9770644', borderRadius: '4px', padding: '2px 7px', marginBottom: '4px' } },
                        '🏁 Support Race'
                    ) : null,
                    h('div', { style: { fontSize: '11px', color: '#64748B', marginBottom: '6px' } },
                        race.city + ', ' + race.state + ' · ' + (race.raceLaps || '?') + ' laps'
                    ),
                    // Action buttons
                    !done && !simulated ? h('div', { style: { display: 'flex', gap: '4px' } },
                        isMyEntry
                            ? h('div', { style: { display: 'flex', gap: '4px', width: '100%' } },
                                (isCurrent || isPast) ? mkBtn('Race! →', 'btn btn-xs btn-success', (function(idx) { return function() {
                                    openPitEntryModal(s.id, idx);
                                }; })(i)) : null,
                                h('span', { style: { fontSize: '11px', color: s.color, fontWeight: 700, padding: '2px 6px', background: s.color + '22', border: '1px solid ' + s.color + '44', borderRadius: '4px', alignSelf: 'center' } }, isCurrent ? '📍 This Week' : '📋 Planned'),
                                mkBtn('✕', 'btn btn-xs btn-danger', (function(sid, idx) { return function() {
                                    G.pitEntries = (G.pitEntries || []).filter(function(pe) {
                                        return !(pe.seriesId === sid && pe.raceIdx === idx && pe.season === G.season);
                                    });
                                    saveGame(); render();
                                }; })(s.id, i)),
                            )
                            : isFuture ? mkBtn('+ Plan Entry', 'btn btn-xs btn-secondary', (function(sid, idx) { return function() {
                                if (!G.pitEntries) G.pitEntries = [];
                                G.pitEntries.push({ seriesId: sid, raceIdx: idx, season: G.season });
                                addLog(G, '🏁 Pit entry planned: ' + getSeries(sid).short + ' R' + (idx + 1) + ' @ ' + sched[idx].track);
                                saveGame(); render();
                            }; })(s.id, i))
                            : isCurrent ? mkBtn('Race Now →', 'btn btn-xs btn-success', (function(idx) { return function() {
                                if (!G.pitEntries) G.pitEntries = [];
                                if (!myEntryIdxs.has(idx)) G.pitEntries.push({ seriesId: s.id, raceIdx: idx, season: G.season });
                                openPitEntryModal(s.id, idx);
                            }; })(i))
                            : null
                    ) : done ? null : h('div', { style: { fontSize: '11px', color: '#475569', fontStyle: 'italic' } }, 'Simulated — field ran without you')
                );
                grid.appendChild(row);
            });
            f.appendChild(grid);
            return f;
        }

        function openPitEntryModal(seriesId, raceIdx) {
            var s = getSeries(seriesId);
            var sched = G.schedules[seriesId] || [];
            var race = sched[raceIdx];
            if (!s || !race) return;

            // Ensure schedule and drivers exist
            if (!G.seriesFields[seriesId]) G.seriesFields[seriesId] = {};

            var _wf = null;
            try { _wf = getWeeklyField(seriesId, raceIdx); } catch(e) {}
            var expectedCount = _wf ? _wf.starters.length : (SERIES_FIELD_SIZE[seriesId] || 20);
            var knownDrivers = getDriversForSeries(G, seriesId);

            var _doOpenPitEntry = function() {
                buildRaceModal({
                eyebrow: s.short + ' — Round ' + race.round + ' (Single Entry)',
                title: race.track,
                sub: race.city + ', ' + race.state + (race.night ? ' · 🌙 Night' : ''),
                seriesId: seriesId,
                raceIdx: raceIdx,
                qualNote: null,
                crewPkg: CREW_PACKAGES[0],
                expectedField: knownDrivers.map(function(d) { return d.name; }).join('\n'),
                isFig8: false,
                isSpecial: false,
                onSubmit: function(result) {
                    // Deduct entry fee
                    G.money -= s.fee;
                    addLog(G, '🎟️ Pit entry fee: -' + fmtMoney(s.fee) + ' (' + s.short + ' R' + race.round + ')');

                    // Process result — uses same path as contracted race
                    // Temporarily add a pseudo-contract so processRaceResult works
                    var _tempContract = {
                        seriesId: seriesId,
                        team: 'Independent',
                        indie: true,
                        prizeShare: 1.0,
                        entryFee: 0, // already deducted above
                        racesCompleted: 0,
                        earnings: 0,
                        missedFinishWarnings: 0,
                        teammates: [],
                        noContractRequired: true,
                        _isPitEntry: true,
                    };
                    var _hadContract = G.contracts.some(function(c) { return c.seriesId === seriesId; });
                    if (!_hadContract) G.contracts.push(_tempContract);

                    processRaceResult(G, seriesId, raceIdx, result);

                    if (!_hadContract) {
                        G.contracts = G.contracts.filter(function(c) { return !c._isPitEntry; });
                    }

                    // Mark entry as raced
                    var pe = (G.pitEntries || []).find(function(pe) {
                        return pe.seriesId === seriesId && pe.raceIdx === raceIdx && pe.season === G.season;
                    });
                    if (pe) pe._raced = true;

                    saveGame(); render();
                }
            });
            }; // end _doOpenPitEntry

            var _absentList = _wf ? _wf.absent : [];
            var _starterList = _wf ? _wf.starters : knownDrivers;
            openModal(h('div', null,
                h('div', { className: 'modal-eyebrow' }, s.short + ' — Round ' + race.round + ' (Single Entry)'),
                h('div', { className: 'modal-title' }, race.track),
                h('div', { className: 'modal-sub' }, race.city + ', ' + race.state + (race.night ? ' · 🌙 Night' : '')),
                h('div', { style: { display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' } },
                    h('div', { style: { background: '#060A10', border: '1px solid #1E2433', borderRadius: '7px', padding: '8px 14px', flex: 1 } },
                        h('div', { style: { fontSize: '11px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em' } }, 'Expected Starters'),
                        h('div', { style: { fontSize: '18px', fontWeight: 800, color: '#F9FAFB', marginTop: '2px' } }, String(_wf ? _wf.expectedCount : knownDrivers.length)),
                    ),
                    _absentList.length ? h('div', { style: { background: '#1a0a00', border: '1px solid #F59E0B44', borderRadius: '7px', padding: '8px 14px', flex: 1 } },
                        h('div', { style: { fontSize: '11px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em' } }, 'Sitting Out'),
                        h('div', { style: { fontSize: '18px', fontWeight: 800, color: '#F59E0B', marginTop: '2px' } }, String(_absentList.length)),
                    ) : null,
                ),
                _absentList.length ? h('div', { style: { marginBottom: '14px' } },
                    h('div', { style: { fontSize: '12px', color: '#F59E0B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' } }, '🚫 Not Racing This Week'),
                    h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px', maxHeight: '200px', overflowY: 'auto' } },
                        ..._absentList.map(function(d) {
                            var rate = d.attendanceRate !== undefined ? d.attendanceRate : 0.85;
                            var aColor = rate >= 0.88 ? '#10B981' : rate >= 0.70 ? '#F59E0B' : '#EF4444';
                            var aLabel = rate >= 0.88 ? 'Regular' : rate >= 0.70 ? 'Occasional' : 'Rare';
                            return h('div', { style: { fontSize: '13px', color: '#94A3B8', padding: '3px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                                h('span', null, d.name),
                                h('span', { style: { fontSize: '10px', color: aColor, fontWeight: 700 } }, aLabel),
                            );
                        })
                    ),
                ) : h('div', { style: { fontSize: '13px', color: '#10B981', marginBottom: '14px', padding: '10px 14px', background: '#06513422', border: '1px solid #10B98133', borderRadius: '7px' } },
                    '✅ Full field expected — all ' + _starterList.length + ' regulars present.'
                ),
                h('div', { className: 'modal-actions' },
                    mkBtn('📤 Roster', 'btn btn-secondary', function() { exportIRacingRoster(seriesId); }),
                    mkBtn('Cancel', 'btn btn-ghost', closeModal),
                    mkBtn('Race! →', 'btn btn-primary', function() { closeModal(); _doOpenPitEntry(); }),
                ),
            ));
        }

        function openSideResultModal(seriesId, raceIdx) {
            var s = getSeries(seriesId);
            var sched = (G.sideSchedules || {})[seriesId] || [];
            var race = sched[raceIdx];
            if (!race) return;
            // Build expected field from seeded drivers
            var sideDrivers = (G.drivers || []).filter(function(d) { return d.active && d.currentSeriesId === seriesId; });
            var expectedField = sideDrivers.map(function(d) { return d.name; }).join('\n');
            buildRaceModal({
                eyebrow: (s ? s.short : 'Side') + ' — Round ' + race.round,
                title: race.track,
                sub: race.city + ', ' + race.state + (race.roadCourse ? ' · Road Course' : ''),
                seriesId: seriesId,
                raceIdx: -1,
                crewPkg: CREW_PACKAGES[0],
                expectedField: expectedField,
                isFig8: false,
                isSpecial: false,
                onSubmit: function(result) {
                    var pos = result.position;
                    var fs = result.fieldSize || 20;
                    var dnf = result.dnf;
                    var prize = s ? Math.floor(s.pay + (pos === 1 ? s.winBonus : 0)) : 0;
                    result.prize = prize;
                    race.result = result;
                    // Update player side championship points
                    if (!G.sidePoints) G.sidePoints = {};
                    if (!dnf) {
                        G.sidePoints[seriesId] = (G.sidePoints[seriesId] || 0) + Math.max(1, 43 - (pos - 1));
                    }
                    // Update AI field standings
                    var field = (G.sideFields || {})[seriesId] || {};
                    var aiNames = Object.keys(field);
                    if (aiNames.length) {
                        // Use finish order from paste if available, otherwise simulate
                        var finishOrder = result.finishOrder || [];
                        var usedPositions = new Set([pos]);
                        var sorted = aiNames.slice().sort(function(a, b) {
                            // Check if driver appeared in pasted finish order
                            var aEntry = finishOrder.find(function(e) { return e.name && e.name.toLowerCase() === a.toLowerCase(); });
                            var bEntry = finishOrder.find(function(e) { return e.name && e.name.toLowerCase() === b.toLowerCase(); });
                            var aPos = aEntry ? (aEntry.pos || aEntry.position || 99) : (field[a].skill || 50) + rand(-15,15);
                            var bPos = bEntry ? (bEntry.pos || bEntry.position || 99) : (field[b].skill || 50) + rand(-15,15);
                            return aPos - bPos;
                        });
                        sorted.forEach(function(name, i) {
                            var aiPos = i + 1;
                            while (usedPositions.has(aiPos)) aiPos++;
                            usedPositions.add(aiPos);
                            if (aiPos > fs) aiPos = fs;
                            var aiPts = Math.max(1, 43 - (aiPos - 1));
                            field[name].points = (field[name].points || 0) + aiPts;
                            field[name].starts = (field[name].starts || 0) + 1;
                            if (aiPos === 1) field[name].wins = (field[name].wins || 0) + 1;
                            if (aiPos <= 5) field[name].top5s = (field[name].top5s || 0) + 1;
                        });
                        if (!G.sideFields) G.sideFields = {};
                        G.sideFields[seriesId] = field;
                    }
                    // Update known side series drivers from finish order
                    if (result.finishOrder && result.finishOrder.length) {
                        result.finishOrder.forEach(function(entry) {
                            if (!entry.name || entry.isPlayer) return;
                            var existing = (G.drivers || []).find(function(d) { return d.name.toLowerCase() === entry.name.toLowerCase() && d.currentSeriesId === seriesId; });
                            if (!existing) {
                                var nd = createDriver(entry.name, rand(40, 80), seriesId, 'known');
                                G.drivers.push(nd);
                            } else if (existing.source !== 'known') {
                                existing.source = 'known';
                            }
                        });
                    }
                    G.money += prize;
                    addLog(G, '🔧 ' + (s ? s.short : 'Side') + ': ' + (dnf ? 'DNF' : 'P' + pos + '/' + fs) + ' at ' + race.track + ' · ' + fmtMoney(prize));
                    saveGame(); render();
                }
            });
        }

        function renderStory() {
            const f = document.createDocumentFragment();
            f.appendChild(h('div', { className: 'page-title' }, 'Race Story'));
            f.appendChild(h('div', { className: 'page-sub' }, 'Season ' + G.season + ' as it happened. Updated after every race.'));

            const journal = (G.storyJournal || []).filter(function(e) { return e.season === G.season; });
            if (!journal.length) {
                f.appendChild(h('div', { style: { color: '#64748B', padding: '24px 0', fontSize: '15px', lineHeight: '1.8' } }, 'Nothing yet this season. Race to fill this page.'));
                return f;
            }

            // Season stat summary bar
            var seasonEntries = journal.slice();
            var sWins = seasonEntries.filter(function(e) { return e.pos === 1 && !e.dnf; }).length;
            var sTop5 = seasonEntries.filter(function(e) { return e.pos <= 5 && !e.dnf; }).length;
            var sDNF  = seasonEntries.filter(function(e) { return e.dnf; }).length;
            var sRaces = seasonEntries.length;
            f.appendChild(h('div', { style: { display: 'flex', gap: '10px', marginBottom: '18px', flexWrap: 'wrap' } },
                h('div', { style: { background: '#181410', border: '1px solid #2E2820', borderRadius: '6px', padding: '10px 16px', textAlign: 'center', flex: 1, minWidth: '70px' } },
                    h('div', { style: { fontSize: '22px', fontWeight: 900, color: '#F0E8D8', fontFamily: "'Share Tech Mono', monospace" } }, sRaces),
                    h('div', { style: { fontSize: '10px', color: '#5A4E38', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '3px' } }, 'Races'),
                ),
                h('div', { style: { background: '#181410', border: '1px solid #2E2820', borderRadius: '6px', padding: '10px 16px', textAlign: 'center', flex: 1, minWidth: '70px' } },
                    h('div', { style: { fontSize: '22px', fontWeight: 900, color: '#F59E0B', fontFamily: "'Share Tech Mono', monospace" } }, sWins),
                    h('div', { style: { fontSize: '10px', color: '#5A4E38', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '3px' } }, 'Wins'),
                ),
                h('div', { style: { background: '#181410', border: '1px solid #2E2820', borderRadius: '6px', padding: '10px 16px', textAlign: 'center', flex: 1, minWidth: '70px' } },
                    h('div', { style: { fontSize: '22px', fontWeight: 900, color: '#10B981', fontFamily: "'Share Tech Mono', monospace" } }, sTop5),
                    h('div', { style: { fontSize: '10px', color: '#5A4E38', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '3px' } }, 'Top 5s'),
                ),
                h('div', { style: { background: '#181410', border: '1px solid #2E2820', borderRadius: '6px', padding: '10px 16px', textAlign: 'center', flex: 1, minWidth: '70px' } },
                    h('div', { style: { fontSize: '22px', fontWeight: 900, color: '#EF4444', fontFamily: "'Share Tech Mono', monospace" } }, sDNF),
                    h('div', { style: { fontSize: '10px', color: '#5A4E38', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '3px' } }, 'DNFs'),
                ),
            ));

            var card = h('div', { className: 'card', style: { padding: '0' } });
            journal.slice().reverse().forEach(function(entry, idx, arr) {
                var posColor = entry.dnf ? '#EF4444' : entry.dq ? '#F97316' : entry.pos === 1 ? '#F59E0B' : entry.pos <= 3 ? '#FBBF24' : entry.pos <= 5 ? '#10B981' : entry.pos <= 10 ? '#6A9AE0' : '#5A4E38';
                var posLabel = entry.dnf ? 'DNF' : entry.dq ? 'DQ' : ordinal(entry.pos);
                var bgColor = entry.pos === 1 && !entry.dnf ? 'background: #1C1208; border-left: 3px solid #F59E0B;' : entry.dnf ? 'background: #180808; border-left: 3px solid #EF4444;' : 'border-left: 3px solid transparent;';
                var icon = entry.dnf ? '💥' : entry.dq ? '🚫' : entry.pos === 1 ? '🏆' : entry.pos <= 3 ? '🥈' : entry.pos <= 10 ? '✅' : '📋';
                card.appendChild(h('div', { style: 'display:flex; gap:0; align-items:stretch; border-bottom:' + (idx < arr.length - 1 ? '1px solid #1A1410' : 'none') + '; ' + bgColor },
                    h('div', { style: { width: '72px', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '14px 8px', borderRight: '1px solid #1A1410' } },
                        h('div', { style: { fontSize: '18px' } }, icon),
                        h('div', { style: { fontSize: '16px', fontWeight: 900, color: posColor, fontFamily: "'Share Tech Mono', monospace", lineHeight: 1.1, marginTop: '4px' } }, posLabel),
                        h('div', { style: { fontSize: '9px', color: '#3A3020', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '3px', textAlign: 'center' } }, entry.series),
                    ),
                    h('div', { style: { flex: 1, padding: '14px 18px', minWidth: 0 } },
                        h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' } },
                            h('div', { style: { fontSize: '13px', fontWeight: 800, color: '#D0C8B0', letterSpacing: '0.02em' } }, entry.track),
                            h('div', { style: { fontSize: '10px', color: '#3A3020', textTransform: 'uppercase', letterSpacing: '0.1em', flexShrink: 0, marginLeft: '10px' } }, 'Wk ' + entry.week),
                        ),
                        h('div', { style: { fontSize: '14px', color: '#8A7E6E', lineHeight: '1.7' } }, entry.text),
                    ),
                ));
            });
            f.appendChild(card);

            const pastSeasons = [...new Set((G.storyJournal || []).map(function(e) { return e.season; }))].sort(function(a,b) { return b-a; }).filter(function(s) { return s !== G.season; });
            if (pastSeasons.length) {
                f.appendChild(h('div', { style: { marginTop: '16px', fontSize: '13px', color: '#64748B' } },
                    'Past seasons: ',
                    ...pastSeasons.map(function(s) {
                        return h('span', { style: { cursor: 'pointer', color: '#3B82F6', marginRight: '10px' }, onClick: function() {
                            const entries = (G.storyJournal || []).filter(function(e) { return e.season === s; }).slice().reverse();
                            openModal(h('div', null,
                                h('div', { className: 'modal-eyebrow' }, 'Season ' + s),
                                h('div', { className: 'modal-title' }, 'Race Story'),
                                ...entries.map(function(entry) {
                                    return h('div', { style: { borderBottom: '1px solid #1E2433', padding: '12px 0' } },
                                        h('div', { style: { fontSize: '11px', color: '#475569', marginBottom: '4px' } }, entry.track + ' · ' + entry.series + ' · ' + (entry.dnf ? 'DNF' : ordinal(entry.pos))),
                                        h('div', { style: { fontSize: '13px', color: '#CBD5E1', lineHeight: '1.7' } }, entry.text),
                                    );
                                }),
                            ));
                        } }, 'Season ' + s);
                    }),
                ));
            }
            return f;
        }


        // season end modal
        function openSeasonEndModal() {
            const summary = buildSeasonSummary(G);
            const seasonBlurb = getSeasonMadLib(summary);

            // Persist season blurb in log
            G.log.push(`[S${summary.season}] 📋 Season Review: ${seasonBlurb}`);

            const content = h('div', {},
                h('div', { className: 'modal-eyebrow' }, `Season ${summary.season} Complete`),
                h('div', { className: 'modal-title', style: { fontSize: '28px', fontWeight: 900, color: '#F59E0B' } }, 'Season Review'),
                h('div', { className: 'modal-sub' }, `Your Season ${summary.season} campaign by the numbers`),

                // Championships
                summary.championships.length ? h('div', { style: { marginBottom: '16px' } },
                    ...summary.championships.map(c => h('div', {
                        style: {
                            background: c.seriesColor + '14', border: `1px solid ${c.seriesColor}40`,
                            borderRadius: '8px', padding: '12px', marginBottom: '8px',
                            display: 'flex', alignItems: 'center', gap: '12px',
                        }
                    },
                        h('div', { style: { fontSize: '32px' } }, c.trophy.icon),
                        h('div', { style: { flex: 1 } },
                            h('div', { style: { fontWeight: 800, fontSize: '15px', color: c.seriesColor } }, c.seriesName),
                            h('div', { style: { fontSize: '14px', color: '#CBD5E1' } },
                                `P${c.position} of ${c.fieldSize} drivers · ${c.points} pts`),
                        ),
                        badge(c.trophy.label, c.trophy.color),
                    ))
                ) : null,

                // Stats grid
                h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginBottom: '16px' } },
                    miniStatBox('Races', summary.totalRaces, '#3B82F6'),
                    miniStatBox('Wins', summary.wins, '#F59E0B'),
                    miniStatBox('Top 5s', summary.top5s, '#10B981'),
                    miniStatBox('Prize Money', fmtMoney(summary.totalPrize), '#10B981'),
                    miniStatBox('Rep', summary.rep, '#F59E0B'),
                    miniStatBox('Fans', fmtFans(summary.fans), '#EC4899'),
                ),

                // Mad-libs season blurb
                h('div', { style: { background: '#060A10', borderRadius: '8px', padding: '14px 16px', marginBottom: '12px', borderLeft: '3px solid #F59E0B' } },
                    h('div', { style: { fontSize: '10px', color: '#F59E0B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '7px' } }, '📰 Season Wrap-Up'),
                    h('div', { style: { fontSize: '14px', color: '#D1D5DB', lineHeight: '1.7', fontStyle: 'italic' } }, seasonBlurb),
                ),
                // Broadcast narrative + rival context
                (function () {
                    var narrativeLine = getSeasonNarrativeLine(summary);
                    var broadcastLine = getBroadcastNarrative(summary);
                    var combined = broadcastLine + (narrativeLine ? ' ' + narrativeLine : '');
                    return h('div', { style: { background: '#060A10', borderRadius: '8px', padding: '14px 16px', marginBottom: '16px', borderLeft: '3px solid #EC4899' } },
                        h('div', { style: { fontSize: '10px', color: '#EC4899', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '7px' } }, '📡 Broadcast Narrative'),
                        h('div', { style: { fontSize: '14px', color: '#D1D5DB', lineHeight: '1.7' } }, combined),
                    );
                })(),

                // AI series news — promotions and demotions
                (() => {
                    const news = G._lastSeasonAiNews || { promotions: [], demotions: [] };
                    const items = [
                        ...(news.promotions || []).slice(0, 5).map(({ driver, to }) =>
                            `📈 ${driver.name} promoted to ${(getSeries(to) && getSeries(to).short) || to}`
                        ),
                        ...(news.demotions || []).slice(0, 3).map(({ driver, to }) =>
                            `📉 ${driver.name} dropped to ${(getSeries(to) && getSeries(to).short) || to}`
                        ),
                    ];
                    if (!items.length) return null;
                    return h('div', { style: { background: '#060A10', borderRadius: '8px', padding: '12px 14px', marginBottom: '16px', border: '1px solid #1E2433' } },
                        h('div', { style: { fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700, marginBottom: '8px' } }, 'Series Movement'),
                        ...items.map(txt => h('div', { style: { fontSize: '13px', color: '#CBD5E1', padding: '3px 0', borderBottom: '1px solid #0D1117' } }, txt))
                    );
                })(),

                h('div', { className: 'modal-actions' },
                    mkBtn(`Start Season ${summary.season + 1} →`, 'btn btn-lg btn-primary', () => { closeModal(); doAdvanceSeason(); }),
                )
            );
            $('modal-overlay').dataset.repairOpen = 'true';
            openModal(content);
        }