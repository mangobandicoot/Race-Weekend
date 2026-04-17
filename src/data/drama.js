        // drama events
        const DRAMA = [
            // bad stuff
            { id: 'rival_media', weight: 3, title: 'Rival Trash Talk', effect: 'rep_hit', value: -4, fans: -150, desc: 'A rival went to the media and questioned your ability. It got picked up. People are talking.' },
            { id: 'rival_media2', weight: 2, title: 'Called Out Publicly', effect: 'rep_hit', value: -5, fans: -200, desc: 'Your rival gave an interview specifically calling out your driving. By name. On camera.' },
            { id: 'rival_media3', weight: 2, title: 'Paddock Whispers', effect: 'rep_hit', value: -3, fans: -100, desc: 'Word going around the paddock that some drivers think you got lucky with recent results.' },
            { id: 'team_pressure', weight: 2, title: 'Team Pressure', effect: 'rep_hit', value: -3, fans: 0, desc: 'The team owner pulled you aside after the last race. Results need to improve. The tone was not friendly.' },
            { id: 'team_pressure2', weight: 1, title: 'Internal Memo Leaked', effect: 'rep_hit', value: -4, fans: -150, desc: "Someone inside the team talked to a reporter. The story is framed around your results. It's not flattering." },
            { id: 'bad_interview', weight: 2, title: 'Bad Interview', effect: 'rep_hit', value: -4, fans: -100, desc: "You said something you shouldn't have in a post-race interview. The clips are everywhere." },
            { id: 'bad_interview2', weight: 1, title: 'Hot Mic Moment', effect: 'rep_hit', value: -5, fans: -250, desc: "Something you said to your crew chief got picked up on the broadcast feed. It's making rounds." },
            { id: 'social_backlash', weight: 2, title: 'Social Media Backlash', effect: 'rep_hit', value: -3, fans: -300, desc: 'A clip of an on-track moment went viral for the wrong reasons. The comments are brutal.' },
            { id: 'social_backlash2', weight: 1, title: 'Trending for the Wrong Reason', effect: 'rep_hit', value: -4, fans: -400, desc: "You're trending. Unfortunately the tweet that started it was someone calling your last race embarrassing." },
            { id: 'stewards_scrutiny', weight: 2, title: 'Stewards Watching', effect: 'rep_hit', value: -2, fans: 0, desc: 'Officials noted your driving style in their report this week. Not an official warning yet. Yet.' },
            { id: 'stewards_warning', weight: 1, title: 'Official Warning Issued', effect: 'rep_hit', value: -4, fans: -100, desc: 'Formal warning from series officials following contact in the last race. One more and it is a penalty.' },
            { id: 'sponsor_threat', weight: 2, title: 'Sponsor Concern', effect: 'rep_hit', value: -2, fans: 0, desc: "Your sponsor's rep called. They're watching the results closely and the tone was clipped." },
            { id: 'injury_scare', weight: 1, title: 'Practice Incident', effect: 'rep_hit', value: -2, fans: -50, desc: 'Hard hit in practice. Nothing broken but the team is quiet. Media noticed too.' },
            { id: 'wrench_issue', weight: 1, title: 'Mechanical Blame Game', effect: 'rep_hit', value: -2, fans: 0, desc: "The crew chief made some comments suggesting the car's issues weren't all mechanical. Not great." },
            { id: 'wrench_issue2', weight: 1, title: 'Crew Turnover', effect: 'rep_hit', value: -3, fans: 0, desc: 'One of your key crew members is reportedly looking at other opportunities. Timing is bad.' },
            { id: 'fan_conflict', weight: 1, title: 'Fan Confrontation', effect: 'rep_hit', value: -3, fans: -500, desc: 'A heated exchange in the autograph line got filmed. The video is getting passed around.' },
            { id: 'compare_badly', weight: 1, title: 'Unfavorable Comparison', effect: 'rep_hit', value: -3, fans: -100, desc: 'A columnist ran a piece comparing your numbers to your teammates. The comparison was not kind.' },
            { id: 'sponsor_pull', weight: 1, title: 'Associate Sponsor Drops', effect: 'rep_hit', value: -2, fans: 0, desc: 'One of your smaller sponsors quietly pulled their logo off the car. No announcement.' },
            { id: 'rival_promoted', weight: 2, title: 'Rival Moves Up', effect: 'rep_hit', value: -2, fans: -100, desc: 'A direct rival just signed with a better team. The narrative is shifting and you are on the wrong side of it.' },
            { id: 'old_footage', weight: 1, title: 'Old Footage Resurfaces', effect: 'rep_hit', value: -3, fans: -200, desc: 'Someone dug up a rough race from two seasons ago. The timing of the post was not accidental.' },
            // good stuff
            { id: 'performance_bonus', weight: 2, title: 'Sponsor Bonus', effect: 'money', value: 5000, desc: 'Your sponsor loved the last result. Unexpected bonus wired to the account.' },
            { id: 'media_buzz', weight: 2, title: 'Media Feature', effect: 'rep_fans', value: 8, fans: 600, desc: 'A regional motorsport outlet ran a feature on your season. The tone was complimentary.' },
            { id: 'media_buzz2', weight: 1, title: 'Podcast Appearance', effect: 'rep_fans', value: 5, fans: 800, desc: "You were a guest on a popular racing podcast. The audience responded well. New followers coming in." },
            { id: 'media_buzz3', weight: 1, title: 'Driver Profile Published', effect: 'rep_fans', value: 7, fans: 600, desc: 'A long-form profile piece ran this week. Told your story well. The comments were mostly positive.' },
            { id: 'fan_favorite', weight: 1, title: 'Fan Favorite Award', effect: 'rep_fans', value: 6, fans: 900, desc: 'Voted fan favorite at your home track. The sponsors noticed the crowd reaction.' },
            { id: 'fan_favorite2', weight: 1, title: 'Fan Mail Week', effect: 'rep_fans', value: 3, fans: 400, desc: 'Unusually high volume of fan mail this week. Team noticed. Sponsors noticed.' },
            { id: 'merch_spike', weight: 1, title: 'Merch Spike', effect: 'money', value: 3000, desc: 'Your merchandise sold out after that last race. Good problem to have.' },
            { id: 'merch_spike2', weight: 1, title: 'Collab Offer', effect: 'money', value: 2000, desc: 'A local brand wants to do a limited collab on merch. Small deal but good exposure.' },
            { id: 'rival_stumbles', weight: 2, title: 'Rival Struggles', effect: 'rep_fans', value: 4, fans: 200, desc: 'Your main rival had a rough stretch. The narrative is shifting in your direction.' },
            { id: 'rival_stumbles2', weight: 1, title: 'Rival Out With Injury', effect: 'rep_fans', value: 3, fans: 150, desc: 'Your main rival is sidelined for the next event. The points gap just got a little more manageable.' },
            { id: 'good_interview', weight: 2, title: 'Strong Interview', effect: 'rep_fans', value: 5, fans: 350, desc: 'Post-race interview went well. Calm, sharp, professional. Sponsors were watching.' },
            { id: 'good_interview2', weight: 1, title: 'Clip Goes Positive Viral', effect: 'rep_fans', value: 6, fans: 900, desc: 'A clip of your post-race comments got picked up and shared widely. The reaction is warm.' },
            { id: 'local_hero', weight: 1, title: 'Local Hero', effect: 'rep_fans', value: 5, fans: 500, desc: 'Home track weekend. The crowd was yours before you even strapped in.' },
            { id: 'comeback_story', weight: 1, title: 'Comeback Coverage', effect: 'rep_fans', value: 7, fans: 700, desc: 'A writer picked up on your season arc. The comeback angle is getting real coverage.' },
            { id: 'young_fan', weight: 1, title: 'Young Fan Moment', effect: 'rep_fans', value: 4, fans: 600, desc: 'A photo of you with a kid at the track circulated this week. Wholesome and effective.' },
            { id: 'charity_event', weight: 1, title: 'Charity Appearance', effect: 'rep_fans', value: 6, fans: 400, desc: 'You showed up to a local charity event. Low key but the right people saw it.' },
            { id: 'sponsor_praise', weight: 2, title: 'Sponsor Goes Public', effect: 'rep_fans', value: 5, fans: 300, desc: 'Your primary sponsor posted about you publicly this week. Their audience is not small.' },
            { id: 'analyst_shoutout', weight: 1, title: 'Analyst Shoutout', effect: 'rep_fans', value: 5, fans: 250, desc: 'A known motorsport analyst specifically called out your recent performances as underrated.' },
            { id: 'clean_pass_clip', weight: 1, title: 'Move of the Week', effect: 'rep_fans', value: 4, fans: 550, desc: 'A broadcast outlet named one of your passes the move of the week. The clip is everywhere.' },
            { id: 'mentor_praise', weight: 1, title: 'Veteran Vouches For You', effect: 'rep_fans', value: 7, fans: 400, desc: 'A respected veteran driver mentioned you favorably in an interview. That carries weight.' },
            { id: 'series_spotlight', weight: 1, title: 'Series Spotlight', effect: 'rep_fans', value: 6, fans: 500, desc: 'The series itself featured you in their official social content this week.' },
            // money
            { id: 'parts_deal', weight: 2, title: 'Parts Hookup', effect: 'money', value: 800, desc: "A local supplier wants to back you. They covered this week's tire bill." },
            { id: 'parts_deal2', weight: 1, title: 'Engine Builder Partnership', effect: 'money', value: 1200, desc: 'An engine builder offered a discounted rebuild rate in exchange for being mentioned in your content.' },
            { id: 'prize_bump', weight: 1, title: 'Bonus Prize Purse', effect: 'money', value: 1500, desc: 'A local business put up a special award for your last result. Check is in the mail.' },
            { id: 'parts_fail', weight: 2, title: 'Parts Failure Warning', effect: 'money', value: -2000, desc: 'Your engine builder flagged a potential issue. Recommend a precautionary rebuild this week.' },
            { id: 'parts_fail2', weight: 1, title: 'Transporter Repair', effect: 'money', value: -1800, desc: 'The hauler needed unexpected work. Inconvenient timing.' },
            { id: 'theft', weight: 1, title: 'Parts Theft', effect: 'money', value: -1500, desc: 'Someone broke into the hauler. Lost some spare parts. Insurance is a joke.' },
            { id: 'fuel_bill', weight: 1, title: 'Unexpected Fuel Cost', effect: 'money', value: -900, desc: 'Fuel prices spiked this week. Testing session cost more than budgeted.' },
            { id: 'legal_fee', weight: 1, title: 'Legal Consultation', effect: 'money', value: -1200, desc: 'Had to get a lawyer involved in a contract dispute. Not expensive but not nothing.' },
            // sponsor
            { id: 'sponsor_warning', weight: 2, title: 'Sponsor Warning', effect: 'sponsor_warning', desc: "Your primary sponsor is unhappy. One more bad stretch and they're reconsidering the deal." },
            { id: 'sponsor_bonus2', weight: 1, title: 'Sponsor Doubles Down', effect: 'money', value: 4000, desc: 'Your sponsor liked what they saw this month and added to the annual commitment. Rare move.' },
            { id: 'new_sponsor_sniff', weight: 1, title: 'New Sponsor Inquiring', effect: 'rep_fans', value: 3, fans: 0, desc: 'A brand reached out through your team about potential sponsorship. Nothing signed but the door is open.' },

            // expanded negative drama
            { id: 'crew_chief_grumble', weight: 2, title: 'Crew Chief Friction', effect: 'rep_hit', value: -3, fans: 0, desc: "Your crew chief has been tight-lipped this week. Someone in the hauler overheard a phone call with the team owner. The word 'recalibrate' came up more than once. Nobody's saying anything directly but the mood is off." },
            { id: 'social_pile_on', weight: 1, title: 'Reply-Guy Weekend', effect: 'rep_hit', value: -4, fans: -350, desc: "You made the mistake of replying to one critical comment. By Sunday morning the thread had three hundred responses, half of them from people who couldn't name the series you race in. You had to mute your own notification panel." },
            { id: 'engineer_conflict', weight: 1, title: 'Setup Disagreement Goes Sideways', effect: 'rep_hit', value: -3, fans: 0, desc: "You and your engineer had a disagreement about the car's aero balance heading into the weekend. You went with your read. You were wrong. The engineer was gracious about it in debrief. That somehow felt worse than if they'd been smug." },
            { id: 'broadcast_called_out', weight: 1, title: 'Broadcast Crew Takes a Shot', effect: 'rep_hit', value: -4, fans: -200, desc: "One of the broadcast analysts used your name unprompted in a segment about inconsistent performers. Politely worded. Entirely accurate. The clip got shared a few hundred times by people who were less polite about it." },
            { id: 'gate_crasher_incident', weight: 1, title: 'Paddock Access Drama', effect: 'rep_hit', value: -2, fans: -100, desc: "A credentialing mixup at the hauler lot ended up involving you, an irritated official, and a bystander who filmed the whole thing on a phone. The video is blurry and out of context but that hasn't stopped anyone from having opinions." },
            { id: 'rival_trophy_speech', weight: 2, title: 'Victory Lane Mention', effect: 'rep_hit', value: -3, fans: -150, desc: "Your rival won this week. In their trophy ceremony interview they said — unprompted — that winning meant more because the competition included drivers who'd had it handed to them. They didn't name you. They didn't need to." },
            { id: 'oversteer_clip', weight: 1, title: 'The Wrong Kind of Viral', effect: 'rep_hit', value: -4, fans: -500, desc: "A clip of you getting loose through the middle of turn three — and catching it, badly — got edited with a comedy sound effect and posted to a racing meme account. It now has more views than your best finish has coverage." },
            { id: 'sponsor_awkward_meeting', weight: 1, title: 'Uncomfortable Sponsor Lunch', effect: 'rep_hit', value: -2, fans: 0, desc: "Your sponsor rep flew in for a 'casual check-in.' It was not casual. They had a printed copy of your results from the last six races. They highlighted the ones they wanted to discuss in yellow marker. You finished the sandwich anyway." },
            { id: 'body_shop_bill', weight: 2, title: 'Sheet Metal Bill', effect: 'money', value: -2500, desc: "Contact in the last race bent more than just feelings. The body shop invoice arrived this week. Itemized. The labor line alone hurts. You initialed the estimate and tried not to do the math on what it cost per position." },
            { id: 'points_math_brutal', weight: 1, title: 'The Math Got Real', effect: 'rep_hit', value: -2, fans: -100, desc: "Someone did the championship points math and posted it. You need to win the next three races and have the leader DNF twice to have a realistic shot. Several people replied 'lol.' One of them was someone from your own team's social account, probably by accident." },
            { id: 'hometown_booed', weight: 1, title: 'Hometown Crowd Turns', effect: 'rep_hit', value: -5, fans: -600, desc: "You expected home track support. You got it for the first half of the race. Then the crash happened — your fault, you know it — and the boos from the grandstands were more specific than normal boos. These were people who know your name." },
            { id: 'team_radio_leak', weight: 1, title: 'Radio Chatter Surfaces', effect: 'rep_hit', value: -4, fans: -200, desc: "Team radio from the last race got shared on a fan forum. Nothing illegal, nothing criminal. Just you, frustrated, saying exactly what you thought about the pit strategy call in real time. Your crew chief has read the thread. You have not spoken about it." },
            { id: 'lost_appeal', weight: 1, title: 'Appeal Denied', effect: 'rep_hit', value: -3, fans: -100, desc: "You filed an appeal on the post-race penalty. It was denied. The series released a one-paragraph statement. The relevant sentence was seven words long and said nothing. You're out the points and the fine." },
            { id: 'back_marker_incident', weight: 1, title: 'Lapped Traffic Blowup', effect: 'rep_hit', value: -3, fans: -150, desc: "A lap-down car held you up at the wrong moment and you said something on the radio that you shouldn't have. The lapped driver heard it. Their team heard it. They said something publicly. You said nothing, which everyone interpreted as confirmation." },
            { id: 'merchandise_misspelled', weight: 1, title: 'Merch Disaster', effect: 'money', value: -800, desc: "The merchandise run came back with your name spelled wrong on four hundred t-shirts. The vendor will reprint them at cost-sharing. You are paying half. On the bright side, some fans find it charming. Not many, but some." },

            // expanded positive drama
            { id: 'trade_mag_feature', weight: 1, title: 'Trade Publication Feature', effect: 'rep_fans', value: 9, fans: 700, desc: "A motorsport trade publication ran a two-page spread on your season trajectory. They used the word 'calculated' which feels right. The piece found its way to a couple of team owner inboxes, according to someone who would know." },
            { id: 'sponsor_activation', weight: 1, title: 'Sponsor Activation Night', effect: 'rep_fans', value: 6, fans: 900, desc: "Your sponsor set up a fan experience booth at the track this week. They ran a meet-and-greet, got a line going, used your name everywhere. You stood there for two hours and shook hands until your hand hurt. The sponsor was thrilled. That's what thrilled sponsors look like." },
            { id: 'veterans_table', weight: 1, title: 'Invited to the Right Table', effect: 'rep_fans', value: 8, fans: 300, desc: "You got invited to sit with a group of veteran drivers at dinner before the race. Nobody made a big deal of it. You mostly listened. But you were asked, and you were there, and that means something in this paddock." },
            { id: 'fast_time_clip', weight: 1, title: 'Practice Clip Gets Traction', effect: 'rep_fans', value: 5, fans: 650, desc: "Someone posted your best lap from practice with the sector splits overlaid. The lap was clean. The kind of clean that people in this community recognize. The clip quietly accumulated a few thousand views from the right kind of accounts." },
            { id: 'autograph_line', weight: 2, title: 'Long Autograph Line', effect: 'rep_fans', value: 4, fans: 500, desc: "The autograph session ran thirty minutes over schedule because the line wouldn't quit. You signed hats, programs, forearms, and at least one child's sneaker. You were the last driver to leave the table. The track promoter shook your hand on the way out." },
            { id: 'team_bonus_check', weight: 1, title: 'Team Performance Bonus', effect: 'money', value: 3500, desc: "The team owner handed you an envelope before the debrief this week. Inside was a check with a note that said 'for the stretch run.' No contract requirement. No announcement. Just recognition for how you've been showing up lately." },
            { id: 'pit_crew_shoutout', weight: 1, title: 'Crew Gets Their Moment', effect: 'rep_fans', value: 5, fans: 400, desc: "In your post-race interview you went long on the crew. Really long. Named the over-the-wall guys specifically, talked about the engineer's call mid-race. The team's social media coordinator clipped it and posted it. The engagement was the best number they've had all season." },
            { id: 'series_preview_mention', weight: 1, title: 'Listed in the Season Preview', effect: 'rep_fans', value: 6, fans: 500, desc: "A motorsport outlet did their mid-season driver power rankings. You made the list. Not at the top, but you were named. The blurb was four sentences and one of them was 'watch this driver down the stretch.' You screenshot it and didn't post it. You wanted to." },
            { id: 'rival_compliment', weight: 1, title: 'Rival Says Something Nice', effect: 'rep_fans', value: 7, fans: 350, desc: "Unprompted, a driver you've battled all season told a reporter that you were one of the cleanest racers they'd been around this year. They didn't have to say it. You heard about it secondhand. You're not sure what to do with it, but it feels different than the usual noise." },
            { id: 'kid_fan_letter', weight: 1, title: 'Fan Letter', effect: 'rep_fans', value: 5, fans: 600, desc: "A handwritten letter showed up at the team's address from a twelve-year-old who said they've been watching every race this season. They included a drawing of your car. The number was correct. You put it on the hauler wall and left it there." },
            { id: 'broadcast_love', weight: 1, title: 'Broadcast Team Takes Notice', effect: 'rep_fans', value: 7, fans: 750, desc: "The broadcast crew spent about forty seconds on you during last week's coverage without a specific incident prompting it. Just a 'driver to watch' segment. It's unpaid press. It's the best kind." },
            { id: 'engine_upgrade', weight: 1, title: 'Engine Program Investment', effect: 'money', value: 2000, desc: "Your engine builder called with good news for once. They've been developing a new package and they want you in the test program. No cost for the upgrade. They want the data, you get the horses. You said yes before they finished the sentence." },
            { id: 'old_rival_retires', weight: 1, title: 'Long-Running Rival Retires', effect: 'rep_fans', value: 6, fans: 400, desc: "A driver you've been competing against for several seasons announced their retirement this week. You were mentioned in their farewell statement as one of the toughest they'd lined up against. The quote went everywhere. You sent them a text. They replied immediately." },
            { id: 'national_pickup', weight: 1, title: 'National Media Pickup', effect: 'rep_fans', value: 10, fans: 1200, desc: "A national motorsport outlet picked up a story about you. Regional-to-national crossover is rare at this level. The article framed you as a name to know going into next season. Your team forwarded it to three people. Your phone has been doing things it doesn't normally do." },
            { id: 'spotter_praise', weight: 1, title: 'Spotter Speaks Up', effect: 'rep_fans', value: 3, fans: 200, desc: "Your spotter gave an interview to a local racing podcast. They talked about what it's like calling races for you. The way they described your racecraft — patient, aware, dangerous in traffic — was more articulate than anything you've said about yourself." },

            // paddock / social texture
            { id: 'garage_talk', weight: 2, title: 'Garage Speculation', effect: 'rep_hit', value: -1, fans: 0, desc: "Word moving through the paddock this week involves your name, a possible seat change, and at least two versions of a rumor that aren't even compatible with each other. Nobody has asked you directly. You are the last person to have accurate information about your own future." },
            { id: 'track_official_nod', weight: 1, title: 'Series Official Acknowledgment', effect: 'rep_fans', value: 4, fans: 100, desc: "A series official stopped you in the garage and mentioned your driving this week specifically. Not a warning — the opposite. A quiet acknowledgment that you've been racing the right way. In this world, that's worth more than it sounds." },
            { id: 'weather_delay_camaraderie', weight: 1, title: 'Rain Delay Moment', effect: 'rep_fans', value: 3, fans: 350, desc: "Rain pushed the start two hours. You ended up sitting in the hauler with two other drivers you don't usually talk to, playing cards and complaining about the same things. One of them posted a photo of the three of you. It performed well. Authenticity is free advertising." },
            { id: 'sponsor_hospitality', weight: 1, title: 'Sponsor Hospitality Suite', effect: 'rep_fans', value: 4, fans: 250, desc: "Your sponsor ran a hospitality tent this weekend for their corporate clients. You spent two hours doing meet-and-greets with people who mostly knew you through the logo on their PowerPoint decks. Three of them were genuinely excited. That was enough." },
            { id: 'equipment_envy', weight: 1, title: 'Other Teams Notice Your Setup', effect: 'rep_fans', value: 5, fans: 200, desc: "Two competing crew chiefs were spotted looking at your car on the grid longer than was casual. Your engineer noticed. Nobody said anything directly but the energy in the garage had a different quality to it. Recognition without words." },
        ];

        // media day system
        // scales by tier - local reporter at t1, full circus by cup
        var MEDIA_DAY = {
            tier12: {
                label: 'Local Reporter',
                color: '#94A3B8',
                icon: '📰',
                questions: [
                    "Local paper caught you after the race. \"How'd tonight go for you?\"",
                    "A reporter from the county paper wants a quote for their racing column.",
                    "Someone with a voice recorder and a press pass found you near your trailer.",
                    "The track announcer wants a word for the Facebook livestream.",
                    "A high school journalism student is covering the race for their school paper. They seem nervous.",
                ],
            },
            tier3: {
                label: 'Regional Beat Writer',
                color: '#3B82F6',
                icon: '🎙️',
                questions: [
                    "The regional motorsport outlet caught you in the paddock. \"What's the plan for the rest of the season?\"",
                    "A beat writer who covers your series wants your take on the championship picture.",
                    "You're doing a quick spot for a regional racing podcast. They have about 8,000 listeners.",
                    "A reporter from the state's biggest paper is doing a motorsport feature. You made the list.",
                    "The series official media guy needs a quote for the weekly newsletter.",
                ],
            },
            tier4: {
                label: 'National Outlet',
                color: '#F59E0B',
                icon: '📡',
                questions: [
                    "A national motorsport outlet has you scheduled for a proper sit-down. Cameras rolling.",
                    "You're doing a feature interview for one of the bigger racing publications. Sponsors are watching this one.",
                    "Pre-race media availability. Several outlets are present. Someone is going to ask about your rivals.",
                    "National TV wants a brief comment before qualifying. Keep it tight.",
                    "Your sponsor's PR team set up a media session. It's friendly but there are microphones.",
                ],
            },
            tier567: {
                label: 'Full Press Conference',
                color: '#EC4899',
                icon: '🎥',
                questions: [
                    "Full pre-race press conference. Multiple outlets, cameras, the works. Someone is going to ask about the championship.",
                    "You're in the media center. The room is full. A reporter from a major outlet leads off: \"How are you feeling about your championship chances?\"",
                    "Post-race press conference. The result was notable enough to fill the room. Someone's going to ask about your rival.",
                    "National broadcast wants you for a segment. Prime time. Your sponsor bought ad space during the same show.",
                    "The series put you in the official post-race press conference. Top finishers only. The cameras are on.",
                ],
            },
        };
        const MEDIA_RESPONSES = [
            {
                label: 'Keep it professional',
                type: 'safe',
                rep: 2, fans: 50, sponsorHappy: 3,
                log: 'Gave a clean, professional answer. Nobody offended. Nobody excited.',
                lines: [
                    '"We\'re focused on the work. Every race is a chance to improve and that\'s what we\'re doing."',
                    '"The team has been putting in the hours. I\'m just trying to execute on race day."',
                    '"One race at a time. That\'s the only way to approach a season like this."',
                    '"We\'re building something. I feel good about the direction we\'re headed."',
                    '"Results speak louder than words. We\'ll let ours do the talking."',
                    '"I don\'t concern myself with what other people are doing. Eyes forward."',
                    '"Every week is a chance to get better. That\'s the mentality in our garage."',
                ],
                followups: [
                    {
                        q: '"Can you be more specific about what improving looks like for you this season?"',
                        options: ['safe', 'humble']
                    },
                    {
                        q: '"Some would say that\'s a non-answer. Fair?"',
                        options: ['deflect', 'bold']
                    },
                ],
            },
            {
                label: 'Be bold',
                type: 'bold',
                rep: 4, fans: 200, sponsorHappy: 5,
                log: 'Made a confident statement. People are paying attention.',
                lines: [
                    '"We\'re here to win. Not to participate. To win. I think we\'ve shown we can do that."',
                    '"I think anyone watching the last few races can see what we\'re capable of. We\'re not done."',
                    '"The championship is the goal. It\'s always been the goal. We haven\'t changed our mind about that."',
                    '"I\'m not interested in being a contender. I\'m interested in being the champion. There\'s a difference."',
                    '"I came here to race and I came here to win. Everything else is noise."',
                    '"Nobody in this field works harder. Nobody. You\'ll see that reflected in the results."',
                    '"We haven\'t peaked yet. That\'s the most dangerous thing about this team right now."',
                ],
                followups: [
                    {
                        q: '"Strong words. What happens if the results don\'t follow?"',
                        options: ['deflect', 'safe']
                    },
                    {
                        q: '"Does that kind of confidence ever rub people the wrong way?"',
                        options: ['trash', 'humble']
                    },
                ],
            },
            {
                label: 'Call out a rival',
                type: 'trash',
                rep: -1, fans: 400, sponsorHappy: -5,
                log: 'Made it personal. Fans loved it. Sponsors slightly nervous.',
                lines: [
                    '"There are drivers in this field who\'ve had a lot to say lately. I\'d rather let the results do the talking. Mine have been pretty loud."',
                    '"I\'ve heard what some people in this paddock have been saying. I\'ll respond on track. That\'s the only response that matters."',
                    '"There\'s a driver or two in this series who confuse confidence with results. Different things."',
                    '"Some people in this paddock need to worry less about what I\'m doing and more about what they\'re doing."',
                    '"I\'m not going to name names. But if someone feels like that was about them, maybe they should ask themselves why."',
                    '"The scoreboard doesn\'t lie. People can say whatever they want. I\'ll keep pointing at the scoreboard."',
                ],
                followups: [
                    {
                        q: '"Are you talking about anyone specific?"',
                        options: ['trash', 'deflect']
                    },
                    {
                        q: '"That sounds like a direct challenge. Is it?"',
                        options: ['bold', 'trash']
                    },
                ],
            },
            {
                label: 'Go nuclear',
                type: 'nuclear',
                rep: -3, fans: 600, sponsorHappy: -12,
                log: 'Said exactly what you think. Sponsors are calling. Fans are screaming.',
                lines: [
                    '"Honestly? Some of these guys can kiss my ass. I\'m done being polite about it."',
                    '"You want honesty? Half this field wouldn\'t be here if their dads didn\'t own the teams. I earned my seat."',
                    '"I\'ve been diplomatic long enough. That move last week was dirty and everyone in the paddock knows it."',
                    '"Off the record? That guy is a hack. On the record? That guy is a hack."',
                    '"I don\'t care who I piss off. I came here to race, not to make friends."',
                    '"The politics in this series are a joke. The stewards are a joke. I\'ll say it on camera."',
                ],
                followups: [
                    {
                        q: '"Do you want to walk any of that back?"',
                        options: ['deflect', 'trash']
                    },
                    {
                        q: '"You realize your sponsor is watching this, right?"',
                        options: ['safe', 'deflect']
                    },
                ],
            },
            {
                label: 'Stay humble',
                type: 'humble',
                rep: 3, fans: 100, sponsorHappy: 8,
                log: 'Came across well. Sponsors particularly happy with the tone.',
                lines: [
                    '"I\'ve got a lot to learn still. Every week teaches me something. I\'m just grateful for the opportunity."',
                    '"The team deserves the credit. I show up and drive. They make it possible."',
                    '"I don\'t take any of this for granted. There are a lot of talented people in this paddock. I know that."',
                    '"We\'re not where we want to be yet. We know that. We\'re working on it every day."',
                    '"Racing gives back what you put in. I\'m just trying to put in enough to deserve it."',
                    '"There are drivers in this series who\'ve been doing this longer than me. I\'m still learning from them."',
                ],
                followups: [
                    {
                        q: '"Is there a point where humility becomes underselling yourself?"',
                        options: ['bold', 'safe']
                    },
                    {
                        q: '"Fans want fire. Does that frustrate you?"',
                        options: ['deflect', 'bold']
                    },
                ],
            },
            {
                label: 'Deflect and joke',
                type: 'deflect',
                rep: 1, fans: 150, sponsorHappy: 2,
                log: 'Kept it light. No controversy. Some charm points.',
                lines: [
                    '"Ask me again after the checkered flag. I\'ll have a better answer then."',
                    '"I\'ll tell you what — let\'s revisit that question at the end of the season. I think the answer will be clearer."',
                    '"My crew chief told me not to say anything interesting in press conferences. So I won\'t say anything interesting."',
                    '"You know what they say — let the car do the talking. Mine\'s been pretty chatty lately."',
                    '"That\'s a great question. I\'m going to pretend I didn\'t hear it and talk about the car instead."',
                    '"I\'d answer that but my lawyer told me not to. I\'m kidding. Mostly."',
                    '"Look, I just drive the thing. Ask someone smarter than me."',
                ],
                followups: [
                    {
                        q: '"That\'s a dodge and you know it. Real answer?"',
                        options: ['bold', 'safe']
                    },
                    {
                        q: '"You always this hard to pin down?"',
                        options: ['humble', 'deflect']
                    },
                ],
            },
            {
                label: 'Praise the team',
                type: 'team',
                rep: 2, fans: 80, sponsorHappy: 10,
                log: 'Redirected to the team. Crew chief is going to love this.',
                lines: [
                    '"I want to talk about the guys in the garage before I talk about anything else. They\'re the reason we\'re here."',
                    '"Whatever we accomplish this season belongs to the whole team. I\'m one piece of it."',
                    '"The crew chief had the car dialed this week. I just tried not to mess it up."',
                    '"You should be interviewing my engineer. They deserve more credit than I do right now."',
                    '"This team has been with me through the bad stretches. Good results feel better because of that."',
                ],
                followups: [
                    {
                        q: '"But you\'re the one driving it. Give yourself some credit."',
                        options: ['humble', 'bold']
                    },
                    {
                        q: '"Is this a team that can win a championship?"',
                        options: ['bold', 'safe']
                    },
                ],
            },
            {
                label: 'Talk about the fans',
                type: 'fans',
                rep: 3, fans: 300, sponsorHappy: 6,
                log: 'Fan-first answer. Social media is going to like this.',
                lines: [
                    '"The people who show up every week, travel to the tracks, wear the shirts — they\'re why I do this."',
                    '"Had a kid come up to me before the race and tell me I\'m their favorite driver. That\'s the whole thing right there."',
                    '"The fans in this series are different. They actually know racing. They appreciate the craft."',
                    '"I race for the people in the grandstands. Full stop. Everything else is secondary."',
                    '"Someone drove four hours to watch us race last week. Four hours. I owe them everything I have."',
                ],
                followups: [
                    {
                        q: '"What do you say to fans who are frustrated with your recent results?"',
                        options: ['humble', 'bold']
                    },
                    {
                        q: '"Does fan pressure ever get to you?"',
                        options: ['safe', 'deflect']
                    },
                ],
            },
        ];

        // follow-up responses
        const MEDIA_FOLLOWUP_RESPONSES = {
            safe: [
                '"We focus on what we can control. That\'s all any of us can do."',
                '"The work will show up in the results. I believe that."',
                '"I\'ll let the season answer that question."',
            ],
            bold: [
                '"Watch what happens. That\'s my answer."',
                '"I don\'t back down from what I said. Not even a little."',
                '"The only thing I\'m walking back is the part where I was being too diplomatic."',
            ],
            humble: [
                '"I\'m not trying to be modest. I genuinely have a lot of room to grow."',
                '"Every driver in this field is good. I\'m one of them. Nothing more."',
                '"I\'m just grateful to be here. That\'s not a line."',
            ],
            deflect: [
                '"I think you\'re reading too much into it. But that\'s your job."',
                '"Next question? I\'m kidding. Mostly."',
                '"If I answer that one, you\'re going to have a follow-up. I can see it already."',
            ],
            trash: [
                '"Yeah. It is a direct challenge. Write that down."',
                '"If someone in this paddock feels called out, that\'s on them, not me."',
                '"I meant every word. I\'ll mean the next words too."',
            ],
        };

        function doMediaDay(tier) {
            const tierKey = tier <= 2 ? 'tier12' : tier === 3 ? 'tier3' : tier === 4 ? 'tier4' : 'tier567';
            const config = MEDIA_DAY[tierKey];
            const question = config.questions[rand(0, config.questions.length - 1)];
            const tierMult = [1, 1, 1.5, 2, 3, 4, 5][Math.min(tier, 6)];

            // nuclear options only unlock at t4+
            const availableResponses = MEDIA_RESPONSES.filter(function (r) {
                return r.type !== 'nuclear' || tier >= 4;
            });

            function showFollowUp(resp, quote, scaledRep, scaledFans) {
                if (!resp.followups || !resp.followups.length || tier < 3) {
                    // no followup, show result
                    showMediaResult(resp, quote, scaledRep, scaledFans);
                    return;
                }
                const fu = resp.followups[rand(0, resp.followups.length - 1)];
                const fuOptions = fu.options.map(function (type) {
                    return MEDIA_RESPONSES.find(function (r) { return r.type === type; });
                }).filter(Boolean);

                openModal(h('div', null,
                    h('div', { className: 'modal-eyebrow' }, config.icon + ' ' + config.label + ' — Follow-up'),
                    h('div', {
                        style: {
                            background: '#060A10', border: '1px solid #1E2433', borderRadius: '8px',
                            padding: '14px', marginBottom: '16px', fontSize: '14px', color: '#CBD5E1',
                            lineHeight: '1.6', borderLeft: '3px solid ' + config.color,
                        }
                    }, fu.q),
                    h('div', { style: { fontSize: '13px', color: '#94A3B8', marginBottom: '12px' } }, 'How do you respond?'),
                    h('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
                        ...fuOptions.map(function (fuResp) {
                            const fuScaledRep = Math.round(fuResp.rep * tierMult * 0.5);
                            const fuScaledFans = Math.round(fuResp.fans * tierMult * 0.5);
                            return h('button', {
                                className: 'btn btn-secondary',
                                style: { textAlign: 'left', padding: '10px 14px' },
                                onClick: function () {
                                    G.reputation = Math.max(0, G.reputation + fuScaledRep);
                                    G.fans = Math.max(0, G.fans + fuScaledFans);
                                    G.sponsors = G.sponsors.map(function (sp) { return Object.assign({}, sp, { happiness: clamp(sp.happiness + fuResp.sponsorHappy, 0, 100) }); });
                                    const fuQuote = MEDIA_FOLLOWUP_RESPONSES[fuResp.type]
                                        ? MEDIA_FOLLOWUP_RESPONSES[fuResp.type][rand(0, MEDIA_FOLLOWUP_RESPONSES[fuResp.type].length - 1)]
                                        : fuResp.lines[rand(0, fuResp.lines.length - 1)];
                                    addLog(G, '🎙️ Follow-up (' + config.label + '): ' + fuResp.label + '.');
                                    showMediaResult(resp, quote + ' / ' + fuQuote, scaledRep + fuScaledRep, scaledFans + fuScaledFans);
                                },
                            },
                                h('div', { style: { fontWeight: 700, fontSize: '14px' } }, fuResp.label),
                                h('div', { style: { fontSize: '12px', color: '#94A3B8', marginTop: '2px' } },
                                    [fuScaledRep !== 0 ? 'Rep ' + (fuScaledRep > 0 ? '+' : '') + fuScaledRep : null,
                                    fuScaledFans !== 0 ? '+' + fmtFans(fuScaledFans) + ' fans' : null,
                                    ].filter(Boolean).join(' · ')
                                ),
                            );
                        }),
                        mkBtn('No further comment', 'btn btn-ghost btn-sm', function () {
                            showMediaResult(resp, quote, scaledRep, scaledFans);
                        }),
                    ),
                ));
            }

            function showMediaResult(resp, quote, totalRep, totalFans) {
                G.lastMediaQuote = { quote: quote, type: resp.type, tier: tier, week: G.week, label: config.label };
                saveGame();
                openModal(h('div', null,
                    h('div', { className: 'modal-eyebrow' }, config.label),
                    h('div', { className: 'modal-title' }, 'You said:'),
                    h('div', {
                        style: {
                            background: '#060A10', borderRadius: '8px', padding: '14px',
                            marginBottom: '16px', fontSize: '15px', color: '#F1F5F9',
                            lineHeight: '1.7', fontStyle: 'italic', borderLeft: '3px solid ' + config.color,
                        }
                    }, quote),
                    h('div', { style: { display: 'flex', gap: '16px', marginBottom: '16px' } },
                        totalRep !== 0 ? h('div', { style: { fontSize: '14px', fontWeight: 700, color: totalRep > 0 ? '#10B981' : '#EF4444' } }, 'Rep ' + (totalRep > 0 ? '+' : '') + totalRep) : null,
                        totalFans !== 0 ? h('div', { style: { fontSize: '14px', fontWeight: 700, color: '#EC4899' } }, '+' + fmtFans(totalFans) + ' fans') : null,
                        resp.sponsorHappy !== 0 ? h('div', { style: { fontSize: '14px', fontWeight: 700, color: resp.sponsorHappy > 0 ? '#10B981' : '#EF4444' } }, 'Sponsors ' + (resp.sponsorHappy > 0 ? '+' : '') + resp.sponsorHappy + '%') : null,
                    ),
                    h('div', { className: 'modal-actions' }, mkBtn('Done', 'btn btn-primary', function () { render(); closeModal(); })),
                ));
            }

            openModal(h('div', null,
                h('div', { className: 'modal-eyebrow' }, config.icon + ' ' + config.label),
                h('div', { className: 'modal-title' }, 'Media Availability'),
                h('div', {
                    style: {
                        background: '#060A10', border: '1px solid #1E2433', borderRadius: '8px',
                        padding: '14px', marginBottom: '16px', fontSize: '14px', color: '#CBD5E1',
                        lineHeight: '1.6', borderLeft: '3px solid ' + config.color,
                    }
                }, question),
                h('div', { style: { fontSize: '13px', color: '#94A3B8', marginBottom: '12px' } }, 'How do you handle it?'),
                h('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
                    ...availableResponses.map(function (resp) {
                        const scaledRep = Math.round(resp.rep * tierMult);
                        const scaledFans = Math.round(resp.fans * tierMult);
                        return h('button', {
                            className: 'btn btn-secondary',
                            style: { textAlign: 'left', padding: '10px 14px' },
                            onClick: function () {
                                G.reputation = Math.max(0, G.reputation + scaledRep);
                                G.fans = Math.max(0, G.fans + scaledFans);
                                G.sponsors = G.sponsors.map(function (sp) { return Object.assign({}, sp, { happiness: clamp(sp.happiness + resp.sponsorHappy, 0, 100) }); });
                                const quote = resp.lines[rand(0, resp.lines.length - 1)];
                                const repStr = scaledRep !== 0 ? ' Rep ' + (scaledRep > 0 ? '+' : '') + scaledRep : '';
                                const fanStr = scaledFans !== 0 ? ' Fans ' + (scaledFans > 0 ? '+' : '') + fmtFans(scaledFans) : '';
                                addLog(G, '🎙️ Media day (' + config.label + '): ' + resp.label + '.' + repStr + fanStr);
                                showFollowUp(resp, quote, scaledRep, scaledFans);
                            },
                        },
                            h('div', { style: { fontWeight: 700, fontSize: '14px' } }, resp.label),
                            h('div', { style: { fontSize: '12px', color: '#94A3B8', marginTop: '2px' } },
                                [scaledRep !== 0 ? 'Rep ' + (scaledRep > 0 ? '+' : '') + scaledRep : null,
                                scaledFans !== 0 ? '+' + fmtFans(scaledFans) + ' fans' : null,
                                resp.sponsorHappy !== 0 ? 'Sponsors ' + (resp.sponsorHappy > 0 ? '+' : '') + resp.sponsorHappy + '%' : null,
                                ].filter(Boolean).join(' · ')
                            ),
                        );
                    }),
                    mkBtn('No comment', 'btn btn-ghost btn-sm', closeModal),
                ),
            ));
        }
        // sponsor activation events
        const SPONSOR_ACTIVATIONS = [
            {
                id: 'social_post',
                title: 'Social Post Request',
                weight: 3,
                desc: function (sp) {
                    return [
                        `${sp.brand} reached out through the team this week; they want you to post something on social mentioning them by name. Nothing crazy, just a shoutout. They're tracking engagement this quarter and apparently your numbers are good.`,
                        `Got a message from the ${sp.brand} rep asking if you'd be willing to put something up on social about them. They've got a new product dropping and want some authentic voices behind it. Their words, not mine.`,
                        `${sp.brand} wants a social post. Something genuine, they said, not a script. They'll send talking points but you can do whatever you want with them, roughly.`,
                        `The ${sp.brand} marketing team has been unusually quiet lately and then sent over a very cheerful email asking for a social mention this week. The timing is suspicious but the ask is simple enough.`,
                        `${sp.brand} sent over a brief with suggested caption ideas for a social post. Three of them are unusable. One of them is actually pretty good. They want it up before the weekend.`,
                        `Quick ask from ${sp.brand}; they want you to post something about their new campaign. They've already drafted three options for you to choose from which is either helpful or presumptuous depending on your mood.`,
                        `${sp.brand} wants some social content before the next race. They specifically asked for something that doesn't look like an ad, which is an interesting thing to ask for in an ad request.`,
                        `The ${sp.brand} rep texted the team directly this time; they want a post this week and they're offering a small bonus for good engagement numbers. No pressure, they said. Definitely some pressure.`,
                    ][rand(0, 7)];
                },
                options: [
                    { label: 'Post it properly', rep: -1, fans: 150, money: 0, sponsorHappy: 8, desc: 'Takes ten minutes and they love you for it. Small rep dip because some fans clock the promo energy.' },
                    { label: 'Post something vague', rep: 0, fans: 50, money: 0, sponsorHappy: 4, desc: "You mention them without really mentioning them. They'll take it but don't expect a bonus anytime soon." },
                    { label: 'Pass on it', rep: 1, fans: 0, money: 0, sponsorHappy: -8, desc: "They're not happy but they'll get over it. Probably." },
                ],
            },
            {
                id: 'trade_show',
                title: 'Trade Show Appearance',
                weight: 2,
                desc: function (sp) {
                    return [
                        `${sp.brand} has a booth at a regional trade show next weekend and they want you there for a few hours to meet people and take photos. They're covering travel and there's a decent appearance fee involved.`,
                        `The ${sp.brand} team is doing a trade show and asked if you'd come out for the afternoon. It's not glamorous but they've got a check with your name on it and it keeps the relationship warm.`,
                        `${sp.brand} wants you at their trade show booth this weekend; a few hours, some handshakes, a lot of photos with people who will definitely tell you about their own racing days whether you ask or not.`,
                        `${sp.brand} is exhibiting at a trade show and they want a driver in the booth. Their words. You are the driver. The booth will have branded pens and a banner with your face on it. Welcome to sponsorship.`,
                        `Got the trade show request from ${sp.brand} again this year. Last year went well apparently; well enough that they've upgraded the booth and are expecting a bigger crowd. Same deal, better snacks supposedly.`,
                        `${sp.brand} is at a regional expo this weekend and they want some motorsport energy in the booth. Translation: they want you standing next to their product looking enthusiastic for four hours.`,
                        `The ${sp.brand} rep was very excited on the phone about this trade show. Very excited. The kind of excited that makes you think the booth assignment was a bigger deal internally than it sounds. They want you there.`,
                        `${sp.brand} is doing a combined trade show and customer appreciation day and they want you there for the afternoon session. Apparently last year's driver appearance drove a lot of traffic and they're hoping for a repeat.`,
                    ][rand(0, 7)];
                },
                options: [
                    { label: 'Show up', rep: 2, fans: 200, money: 800, sponsorHappy: 12, desc: "Few hours of your weekend, solid check, and they'll remember it at renewal time." },
                    { label: 'Send a signed photo instead', rep: 0, fans: 50, money: 200, sponsorHappy: 4, desc: "Not what they asked for but it's something. They appreciate the gesture, sort of." },
                    { label: "Can't make it", rep: 0, fans: 0, money: 0, sponsorHappy: -10, desc: "They understand. They don't like it but they understand." },
                ],
            },
            {
                id: 'media_appearance',
                title: 'Media Appearance Request',
                weight: 2,
                desc: function (sp) {
                    return [
                        `${sp.brand} set up an interview with a regional outlet and want you front and center. It's a puff piece mostly but their logo is going to be in every frame and they're very excited about that.`,
                        `The ${sp.brand} PR team booked a local TV segment and they want you as the face of it. Twenty minutes of your time, they said. It'll be forty-five. Budget accordingly.`,
                        `${sp.brand} has a media day coming up and your name is on the list. They want genuine, they want relaxed, and they want you wearing their gear. Two of those three are easy.`,
                        `${sp.brand} arranged a podcast appearance and want you as the guest. It's a motorsport show with a decent following and the host seems to actually know racing, which is rarer than you'd think.`,
                        `There's a regional sports magazine doing a feature on local racing and ${sp.brand} sponsored the piece. They want you in the photos and available for a brief quote. Their PR person will be there the whole time.`,
                        `${sp.brand} booked a radio spot and they want you in studio for it. Live read, their script, your voice. Twenty minutes total. The host is going to mispronounce your name at least once.`,
                        `The ${sp.brand} team put together a short video series about their involvement in motorsport and episode two apparently needs a driver interview. You're the driver. The questions are softballs.`,
                        `${sp.brand} got picked up by a regional news outlet for a business feature and they want to include some racing footage and a brief driver interview to round it out. Low pressure, good exposure.`,
                    ][rand(0, 7)];
                },
                options: [
                    { label: 'Do it', rep: 3, fans: 300, money: 500, sponsorHappy: 10, desc: "Good exposure and they pay you for the time. Hard to argue with." },
                    { label: 'Do it but keep it short', rep: 1, fans: 100, money: 200, sponsorHappy: 5, desc: "You show up, you deliver, you leave. They wanted more but they got something." },
                    { label: 'Pass', rep: 0, fans: 0, money: 0, sponsorHappy: -8, desc: "They booked a slot with someone else. It's fine. It's not fine." },
                ],
            },
            {
                id: 'store_appearance',
                title: 'Store Meet and Greet',
                weight: 2,
                desc: function (sp) {
                    return [
                        `${sp.brand} wants you at one of their locations for a meet and greet on Saturday afternoon. Sign some stuff, take some photos, talk to customers who are going to tell you about their own racing days whether you ask or not.`,
                        `Got a request from ${sp.brand} to come out to their store for a few hours and meet some fans. They're running a promotion and having a driver there is part of the pitch. Fans get to meet you; you get paid.`,
                        `${sp.brand} is doing an in-store event and they want you there. Couple hours, good crowd, decent check. The downside is someone will definitely ask you to sign something weird.`,
                        `${sp.brand} is running a weekend promotion and they want a driver presence in store. You'd be signing autographs, taking photos, and occasionally explaining what you actually do to customers who wandered in for something else entirely.`,
                        `The ${sp.brand} store manager apparently specifically requested you for their meet and greet. That's either very flattering or means the regular requests went to someone else first. Either way the check clears.`,
                        `${sp.brand} has a new location opening and they want some motorsport flavor at the launch event. A few hours, good energy, and the kind of crowd that actually wants to be there rather than just passing through.`,
                        `Got a call about a ${sp.brand} store event; they're doing a customer appreciation weekend and want you there for the Saturday afternoon slot. Probably two hundred people, maybe more if the weather holds.`,
                        `${sp.brand} is hosting a community day at their location and they want you as a draw. It's genuinely a nice event from what the rep described; families, food, and racing content. Could be fun actually.`,
                    ][rand(0, 7)];
                },
                options: [
                    { label: 'Go', rep: 3, fans: 400, money: 600, sponsorHappy: 12, desc: "Fans love it, sponsor loves it, you sign something weird. Worth it." },
                    { label: 'Go for an hour only', rep: 1, fans: 150, money: 300, sponsorHappy: 6, desc: "You show face and get out. They wanted longer but they got something on the books." },
                    { label: "Not this weekend", rep: 0, fans: 0, money: 0, sponsorHappy: -9, desc: "They'll ask again. Maybe." },
                ],
            },
            {
                id: 'car_livery',
                title: 'Special Livery Request',
                weight: 1,
                desc: function (sp) {
                    return [
                        `${sp.brand} wants to run a special livery for one race this season; their anniversary edition branding, basically the whole car. They're excited about it. You have opinions about the color scheme.`,
                        `The ${sp.brand} marketing team has been working on a special paint scheme and they want to run it at an upcoming race. It's their call technically but they're asking nicely. The design is bold.`,
                        `${sp.brand} asked about doing a one-off livery for a race this season. Full rebrand for the weekend, their colors, their layout. Could look great. Could look like a moving billboard. Probably both.`,
                        `${sp.brand} has a milestone coming up and they want to mark it with a special paint scheme on the car for one race. They sent over a mock-up. It's a lot. There's a lot going on in that design.`,
                        `The ${sp.brand} design team has apparently been sitting on a livery concept for months and they finally want to pull the trigger on it. One race, full wrap, their branding everywhere. The check is substantial.`,
                        `${sp.brand} is turning twenty-five this year and they want to celebrate with a throwback livery on the car for a race. The old branding is actually pretty clean. This might be one of the easier livery conversations.`,
                        `Got sent over a livery proposal from ${sp.brand} for a one-race special scheme tied to a product launch. The colors are aggressive. The logo placement is aggressive. The entire thing is aggressive. They're very proud of it.`,
                        `${sp.brand} wants to do a charity-themed livery for one race with a portion of the visibility going toward a cause they're backing this quarter. The design is tasteful and the cause is legitimate.`,
                    ][rand(0, 7)];
                },
                options: [
                    { label: 'Give them the car', rep: 0, fans: 100, money: 1500, sponsorHappy: 15, desc: "They're thrilled, they pay well for it, and you spend the whole weekend explaining the color choices to journalists." },
                    { label: 'Negotiate the design', rep: 1, fans: 50, money: 800, sponsorHappy: 8, desc: "You keep some input, they keep most of it. Compromise livery. Could be worse." },
                    { label: 'Keep your current scheme', rep: 2, fans: 0, money: 0, sponsorHappy: -6, desc: "Your car, your call. They respect it a little. Not a lot." },
                ],
            },
            {
                id: 'charity_tie_in',
                title: 'Charity Partnership Request',
                weight: 2,
                desc: function (sp) {
                    return [
                        `${sp.brand} is doing a charity push this quarter and they want you involved; a joint announcement, some content, maybe a small donation matched by them. Good optics for everyone and genuinely not a bad cause.`,
                        `The ${sp.brand} team reached out about a charity tie-in they're running. They want a driver's face on it and they picked yours. The cause is legitimate and they're putting real money behind it.`,
                        `${sp.brand} wants to do something with a local charity and have you front the announcement with them. Low effort on your end, good for the community, and it makes their quarterly report look excellent.`,
                        `${sp.brand} is partnering with a kids racing program this season and they want you involved in the launch. It's a half day, good cause, and the kind of thing that follows you positively for a long time.`,
                        `Got a request from ${sp.brand} about a food bank partnership they're running; they want a driver to help with a weekend distribution event and do a bit of press around it. Simple ask, genuine cause.`,
                        `${sp.brand} is backing a scholarship fund for young drivers from lower-income backgrounds and they want you to be part of the announcement. You'd be presenting the first award at a small ceremony.`,
                        `The ${sp.brand} foundation has a hospital visit program and they want to bring you along on the next one. No cameras unless you're comfortable with it; they're pretty clear that it's about the kids not the content.`,
                        `${sp.brand} is running a youth motorsport awareness campaign and they want you to record a short message for schools in the area. Twenty minutes of your time, goes out to a few thousand kids.`,
                    ][rand(0, 7)];
                },
                options: [
                    { label: 'Get involved', rep: 6, fans: 350, money: 0, sponsorHappy: 12, desc: "Costs you nothing but time and it genuinely means something. The fans notice too." },
                    { label: 'Lend your name only', rep: 3, fans: 150, money: 0, sponsorHappy: 6, desc: "You're on the poster but not at the event. Half credit." },
                    { label: 'Sit this one out', rep: -2, fans: -100, money: 0, sponsorHappy: -5, desc: "They find someone else. The optics aren't great." },
                ],
            },
            {
                id: 'product_launch',
                title: 'Product Launch Event',
                weight: 1,
                desc: function (sp) {
                    return [
                        `${sp.brand} is launching a new product line and wants you at the launch event. It's an evening thing, decent crowd, open bar that you probably shouldn't touch too much of. Good check and solid exposure.`,
                        `${sp.brand} has a product launch coming up and your name is on the VIP list as their featured guest. Dress code is business casual which is already asking a lot, but the appearance fee is real.`,
                        `Got an invite from ${sp.brand} for their product launch; they want you there as a brand ambassador for the night. It's the kind of event where everyone is trying to seem important. You'll fit right in.`,
                        `${sp.brand} is unveiling something new and they want motorsport energy in the room for it. You'd be mingling, talking about the brand, and occasionally pretending you use the product regularly.`,
                        `The ${sp.brand} launch event is apparently a bigger deal than their usual stuff; they've hired a proper venue and invited press. Your job is to stand near the product, look fast, and say nice things if asked.`,
                        `${sp.brand} sent over a formal invitation to their product reveal dinner. It's a seated event, about eighty people, and you're listed as a featured guest. The food is supposed to be genuinely good.`,
                        `${sp.brand} is doing a dealer preview for their new lineup and they want you there as the racing connection. Dealers love that kind of thing apparently and your face moves product more than you'd expect.`,
                        `Got a last-minute ask from ${sp.brand}; someone dropped out of their launch event and they want you to fill the slot. Short notice but the check is larger than usual to compensate.`,
                    ][rand(0, 7)];
                },
                options: [
                    { label: 'Attend', rep: 2, fans: 200, money: 1200, sponsorHappy: 12, desc: "You shake hands, say the right things, and leave with a check. Smooth." },
                    { label: 'Send a video message instead', rep: 0, fans: 50, money: 400, sponsorHappy: 5, desc: "They wanted you in the room but a video is better than nothing. Barely." },
                    { label: 'Skip it', rep: 0, fans: 0, money: 0, sponsorHappy: -8, desc: "They launch without you. Someone else gets in the photos." },
                ],
            },
            {
                id: 'fan_contest',
                title: 'Fan Contest Sponsorship',
                weight: 2,
                desc: function (sp) {
                    return [
                        `${sp.brand} wants to run a fan contest where the winner gets to meet you at a race. They handle everything; the promotion, the logistics, the winner's travel. You just show up and spend an hour with whoever wins.`,
                        `${sp.brand} is doing a sweepstakes tied to their current campaign and the grand prize is a VIP race day experience with you. They've run these before and they go well. The winner is always genuinely excited.`,
                        `Got a proposal from ${sp.brand} for a fan contest; winner gets a pit lane tour and a meet with you at the next home race. Simple concept, good PR, and honestly the winners are usually the best part of the day.`,
                        `${sp.brand} wants to do a trivia contest on social with racing questions and the prize is a chance to hang out with you for an afternoon at the track. Low effort on your end and their audience loves this stuff.`,
                        `The ${sp.brand} team pitched a contest where fans submit videos about why they love racing and you pick the winner. You'd spend a couple hours judging entries and then meet the winner at a race.`,
                        `${sp.brand} is running a photo contest; fans submit their best racing photos and the winner gets to spend race day in the pit area with you. They want your name attached to the judging.`,
                        `Got asked by ${sp.brand} to be the prize in a customer loyalty contest. First place gets a signed helmet and a phone call with you. Second place gets a signed photo. They've already written the copy.`,
                        `${sp.brand} wants to run a 'design the car' contest for fans where you pick the winning submission and it gets used for a test day. They want you involved in the judging and the announcement.`,
                    ][rand(0, 7)];
                },
                options: [
                    { label: 'Do it', rep: 4, fans: 500, money: 300, sponsorHappy: 11, desc: "Fans go crazy for this stuff and the winner will tell everyone they know for the rest of their life." },
                    { label: 'Do it but limit your time', rep: 2, fans: 200, money: 150, sponsorHappy: 6, desc: "You show up for thirty minutes instead of an hour. Still meaningful, just shorter." },
                    { label: 'Pass', rep: 0, fans: 0, money: 0, sponsorHappy: -7, desc: "They run the contest with a different prize. Less exciting for everyone." },
                ],
            },
            {
                id: 'school_program',
                title: 'School Outreach Program',
                weight: 2,
                desc: function (sp) {
                    return [
                        `${sp.brand} sponsors a STEM program at a few local schools and they want to bring you in for a visit; talk about racing, physics, how cars work, that kind of thing. The kids are middle schoolers so expect good questions and no filter.`,
                        `${sp.brand} has a relationship with the local school district and they're putting together a career day program. They want a racing driver on the lineup. The other speakers are an accountant and a nurse. You'll stand out.`,
                        `Got a request from ${sp.brand} about visiting a high school automotive program. The teacher reached out through the sponsor and the ask is simple; come talk to the class about what you do for an hour.`,
                        `${sp.brand} does an annual school visit program and this year they want to include racing. You'd go to two or three schools, talk about the sport, and answer questions from kids who have probably already watched your race footage on YouTube.`,
                        `The ${sp.brand} community team is running a 'meet a professional' series at elementary schools in the area and they specifically requested someone from motorsport. One afternoon, three classrooms, a lot of very small handshakes.`,
                        `${sp.brand} is sponsoring a science fair this year and they want a racing driver to judge the engineering category and give a short talk about how racing and engineering connect. Right in your wheelhouse actually.`,
                        `Got a message through ${sp.brand} from a teacher whose class has been following your season as part of a math project; tracking points, calculating averages, that kind of thing. The sponsor wants to make a moment out of it with a school visit.`,
                        `${sp.brand} does a summer program for underprivileged kids and they've added a motorsport day this year. They want you there for the afternoon to show the kids around a car and talk about the sport.`,
                    ][rand(0, 7)];
                },
                options: [
                    { label: 'Go visit', rep: 5, fans: 250, money: 0, sponsorHappy: 10, desc: "Genuinely one of the better ways to spend an afternoon. The kids are great and the sponsor loves the photos." },
                    { label: 'Send some signed merchandise instead', rep: 2, fans: 50, money: 0, sponsorHappy: 4, desc: "Not as good as showing up but the teacher will make the most of it." },
                    { label: 'Skip this one', rep: -1, fans: 0, money: 0, sponsorHappy: -6, desc: "They find another driver. The kids are fine. You feel slightly bad about it." },
                ],
            },
            {
                id: 'content_day',
                title: 'Content Creation Day',
                weight: 2,
                desc: function (sp) {
                    return [
                        `${sp.brand} wants to bring a camera crew to the garage for a content day; behind the scenes stuff, car walkaround, short interview. Half a day, they handle everything, and the content goes on their channels.`,
                        `The ${sp.brand} digital team wants to shoot some content with you for their social channels. Nothing complicated; a walkaround of the car, a few talking head clips, maybe some action footage if there's testing happening.`,
                        `${sp.brand} has been building out their content library and they want some motorsport material. They're sending a two-person crew for the day and the plan is pretty relaxed; just you, the car, and a camera.`,
                        `Got a request from ${sp.brand} for a content shoot at the track. They want authentic behind-the-scenes material and they've specifically said they don't want it to feel produced. Which means it'll take twice as long to produce.`,
                        `${sp.brand} is redoing their website and they want new photography and video content featuring you and the car. Professional crew, half day, you basically just need to show up and be yourself near the vehicle.`,
                        `The ${sp.brand} marketing team wants to do a day-in-the-life style video following you through a race weekend. Documentary style, minimal scripting, just cameras following the process. Could be interesting actually.`,
                        `${sp.brand} wants to shoot a series of short clips for their social channels; the kind of stuff that does well on short video platforms. Ten to fifteen clips, most of them thirty seconds or less, all at the track.`,
                        `Got a content brief from ${sp.brand} that's actually pretty well thought out; they want to document the car preparation process and use it for an engineering-focused campaign. Crew shows up Friday morning.`,
                    ][rand(0, 7)];
                },
                options: [
                    { label: 'Full day shoot', rep: 1, fans: 300, money: 900, sponsorHappy: 13, desc: "They get great content, you get a solid check, and the garage looks good on camera." },
                    { label: 'Half day only', rep: 0, fans: 150, money: 450, sponsorHappy: 7, desc: "You give them the morning and they make the most of it. Not everything they wanted but close." },
                    { label: 'Not the right time', rep: 0, fans: 0, money: 0, sponsorHappy: -7, desc: "They reschedule or find another angle. The content calendar slips." },
                ],
            },
            {
                id: 'hospitality_event',
                title: 'Sponsor Hospitality Hosting',
                weight: 1,
                desc: function (sp) {
                    return [
                        `${sp.brand} is bringing some of their top clients to the next race and they want you to host a hospitality suite for the afternoon. Meet and greet, track tour, the works. These are the people who write the big checks internally.`,
                        `The ${sp.brand} team is entertaining clients at the race this weekend and they've asked if you'd spend some time in their hospitality area between sessions. An hour, maybe ninety minutes; shaking hands with people who are very excited to be there.`,
                        `${sp.brand} has a hospitality tent at the next race and they want you available for their VIP guests for part of the day. These are dealers and distributors mostly; good people to know and they respond well to direct time with drivers.`,
                        `Got a request to host a hospitality session for ${sp.brand} at the upcoming race; their regional sales team is attending and a driver appearance is apparently a big deal for morale. Ninety minutes, catered, easy crowd.`,
                        `${sp.brand} is doing a client appreciation event at the track this weekend and they want you as the centerpiece. Think of it as a meet and greet but the guests are wearing business casual and asking about your lap times.`,
                        `The ${sp.brand} national team is in town for a conference and they've tagged on a race day experience. They want to bring the whole group through the paddock and have you available for Q&A. About forty people.`,
                        `${sp.brand} won a group of high-value clients in a lottery and they want to give them a race experience. You'd do a paddock walk, answer some questions, and generally be the reason they tell everyone at the office about their weekend.`,
                        `Got asked to spend an afternoon with ${sp.brand}'s franchise owners who are in for their annual conference. They're hosting at the track and want a driver to make it feel special. These are the people who actually stock ${sp.brand} products.`,
                    ][rand(0, 7)];
                },
                options: [
                    { label: 'Host them properly', rep: 2, fans: 100, money: 1400, sponsorHappy: 14, desc: "The clients love it, the sponsor loves it, and you get the best check of the activation options. Worth the time." },
                    { label: 'Quick appearance only', rep: 1, fans: 50, money: 600, sponsorHappy: 7, desc: "You do thirty minutes and head back to the garage. They got something, you got paid." },
                    { label: "Can't commit to it", rep: 0, fans: 0, money: 0, sponsorHappy: -11, desc: "These were important clients and the sponsor is going to remember you said no to this one." },
                ],
            },
            {
                id: 'podcast_guest',
                title: 'Podcast Guest Spot',
                weight: 2,
                desc: function (sp) {
                    return [
                        `${sp.brand} sponsors a motorsport podcast and they want you on as a guest. The host is good, the audience knows racing, and the sponsor gets a read and some mentions worked into the conversation naturally. Or as naturally as these things go.`,
                        `Got a booking request through ${sp.brand} for a podcast appearance; it's a general sports show that covers motorsport occasionally and they want a driver perspective. About forty-five minutes, recorded remotely, no prep required.`,
                        `${sp.brand} has a relationship with a popular automotive podcast and they've arranged a guest spot for you. The host specifically asked for someone who races at the grassroots level and you fit the brief.`,
                        `The ${sp.brand} marketing team co-produces a small racing podcast and they want you as a featured guest for their season preview episode. The show has a dedicated audience and the questions are usually solid.`,
                        `Got a podcast request that came through ${sp.brand}; it's a business and sports crossover show that does well with the demographic the sponsor is targeting. An hour of your time, recorded at your convenience.`,
                        `${sp.brand} sponsors a regional sports radio program that does a podcast version and they've arranged for you to be the guest on this week's episode. Live to tape format, about an hour, the host does their homework.`,
                        `A racing history podcast that ${sp.brand} sponsors wants to do an episode on current grassroots racing and they want you as the contemporary voice. The other guest is a historian. It'll be more interesting than it sounds.`,
                        `${sp.brand} is launching their own podcast and you're their first guest. No pressure, fresh audience, and they want the conversation to go wherever it goes. The production quality looks decent from the brief they sent over.`,
                    ][rand(0, 7)];
                },
                options: [
                    { label: 'Record the episode', rep: 3, fans: 400, money: 300, sponsorHappy: 9, desc: "Good audience, genuine conversation, and the episode lives online long after the recording." },
                    { label: 'Do a short segment only', rep: 1, fans: 150, money: 100, sponsorHappy: 4, desc: "You phone in for twenty minutes. Not the feature they wanted but it fills the slot." },
                    { label: 'Pass on this one', rep: 0, fans: 0, money: 0, sponsorHappy: -6, desc: "They book someone else. The episode goes up without you." },
                ],
            },
            {
                id: 'autograph_signing',
                title: 'Autograph Session',
                weight: 2,
                desc: function (sp) {
                    return [
                        `${sp.brand} is setting up an autograph session at one of their retail partners and they want you signing for a couple hours. They'll have merchandise ready, it's well promoted, and the turnout is expected to be solid.`,
                        `Got a signing request from ${sp.brand}; they've arranged a two-hour autograph session at a local retailer that carries their products. The store has done these before and they run smoothly.`,
                        `${sp.brand} wants you to do a signing session at a motorsport retailer they partner with. Two hours, whatever people bring, their team handles the queue and logistics. You just need to show up and have a working pen.`,
                        `The ${sp.brand} rep put together a signing event at a car parts retailer. It's a Saturday afternoon, they're running a promotion around it, and they're expecting a decent line based on the advance interest.`,
                        `${sp.brand} set up a signing at an automotive show and they want you there for the afternoon session. Bigger crowd than a typical retail signing, more varied audience, and the sponsor gets good visibility from the foot traffic.`,
                        `Got asked to do a signing through ${sp.brand} at a race memorabilia shop that carries their branded gear. The owner is a longtime fan of the sport and has been asking the sponsor to arrange this for months apparently.`,
                        `${sp.brand} is doing a signing tour at their dealer locations and you're on the schedule for the regional stop. Half a dozen locations over a weekend, they handle all the travel, and each stop is about forty-five minutes.`,
                        `The ${sp.brand} team set up a signing at a motorsport museum that's hosting a temporary exhibition on grassroots racing. Curated crowd, genuinely interested people, and the setting is pretty cool actually.`,
                    ][rand(0, 7)];
                },
                options: [
                    { label: 'Do the full session', rep: 3, fans: 450, money: 400, sponsorHappy: 11, desc: "Two hours, good crowd, everybody leaves happy. These sessions build real fan loyalty." },
                    { label: 'Do a shorter session', rep: 1, fans: 200, money: 200, sponsorHappy: 5, desc: "One hour instead of two. The line is longer than it looks when you have to cut it off." },
                    { label: 'Skip it', rep: 0, fans: 0, money: 0, sponsorHappy: -8, desc: "The store is disappointed. The sponsor is disappointed. A lot of disappointed people." },
                ],
            },
        ];

        // trade rumors
        function maybeFireTradeRumor(state) {
            // once a season, more likely in second half
            if ((state._tradeRumorFiredSeason || 0) >= state.season) return;
            const totalRaces = Object.values(state.schedules || {}).reduce(function (a, s) { return a + s.length; }, 0);
            const completedRaces = Object.values(state.schedules || {}).reduce(function (a, s) { return a + s.filter(function (r) { return r.result; }).length; }, 0);
            if (totalRaces === 0) return;
            const progress = completedRaces / totalRaces;
            // second half only, gets more likely as season goes on
            if (progress < 0.5) return;
            if (Math.random() > (progress - 0.4) * 0.8) return;

            // one tier up from where we are
            const playerTiers = (state.contracts || []).map(function (c) {
                return (getSeries(c.seriesId) && getSeries(c.seriesId).tier) || 1;
            });
            if (!playerTiers.length) return;
            const highestTier = Math.max(...playerTiers);
            const targetSeries = SERIES.find(function (s) { return s.tier === highestTier + 1; });
            if (!targetSeries) return;

            // random team
            const teamList = TEAMS[targetSeries.id] || [];
            if (!teamList.length) return;
            const team = teamList[rand(0, teamList.length - 1)];

            state._tradeRumorFiredSeason = state.season;

            const playerFirst = state.driverName.split(' ')[0];
            const lines = [
                `Word from someone close to the ${targetSeries.short} paddock is that ${team} has been asking questions about ${playerFirst}. Nothing official, nothing confirmed, but the people doing the asking aren't doing it casually.`,
                `Heard through a mutual contact that ${team} in the ${targetSeries.short} has had ${playerFirst}'s name come up in their driver conversations. Whether that goes anywhere depends on how the rest of this season plays out.`,
                `A source says ${team} sent someone to watch a couple of races recently. ${playerFirst} was specifically mentioned as someone they're monitoring. Free agency is going to be interesting.`,
                `Not confirmed but reliable: ${team} has been making calls about ${playerFirst}. The ${targetSeries.short} team apparently likes what they've seen and wants to know more before the offseason.`,
                `Word in the paddock is ${team} is putting together a list for next season and ${playerFirst}'s name is on it. Could be nothing. Could be the call you've been waiting for.`,
                `Heard from someone at the ${targetSeries.short} level that ${team} has been paying close attention to ${playerFirst}'s results lately. No contact yet but the interest sounds genuine.`,
                `A ${targetSeries.short} team owner — reportedly from ${team} — was seen at the track last weekend. ${playerFirst} was pointed out to them specifically. Make of that what you will.`,
                `${team} is apparently in rebuild mode for next season and they're looking at drivers from lower series. ${playerFirst} came up by name according to someone who was in the room.`,
            ];

            state.dramaQueue.push({
                id: 'trade_rumor_' + uid(),
                title: `👀 ${targetSeries.short} Interest — ${team}`,
                effect: 'none',
                desc: lines[rand(0, lines.length - 1)],
                valence: 'good',
                _isTradeRumor: true,
            });

            addLog(state, `👀 Trade rumor: ${team} (${targetSeries.short}) asking about ${state.driverName}`);
        }
                        function maybeFirePostRaceInspection(state, seriesId, result) {
            // 4% base - goes up with car wear
            // <60% avg condition = 10%, <80% = 7%, otherwise 4%
            const _icc = getCarCondition(state, seriesId);
            const _avgCond = ((_icc.engine || 100) + (_icc.suspension || 100) + (_icc.brakes || 100) + (_icc.chassis || 100) + (_icc.tires || 100)) / 5;
            const _inspChance = _avgCond < 60 ? 0.10 : _avgCond < 80 ? 0.07 : 0.04;
            if (Math.random() > _inspChance) return;
            if (result.dnf || result.dq) return; // already a bad night
            const order = result.finishOrder || [];
            if (order.length < 3) return;

            // Target: winner or top 3 (most inspected), player occasionally caught too
            const dqPool = order.slice(0, Math.min(5, order.length));
            const target = dqPool[rand(0, dqPool.length - 1)];
            if (!target || !target.name) return;

            const isPlayer = target.isPlayer || /\byou\b/i.test(target.name) ||
                target.name.toLowerCase() === state.driverName.toLowerCase();

            const infractions = [
                'fuel sample failed post-race inspection',
                'front splitter found to be out of spec',
                'carburetor exceeded allowable CFM rating',
                'ride height violation discovered post-race',
                'weight was short after the race',
                'ballast mounting did not comply with the rulebook',
                'engine failed to pass the post-race teardown',
                'tire compound not on the approved list',
            ];
            const infraction = infractions[rand(0, infractions.length - 1)];
            const pos = order.indexOf(target) + 1;

            if (isPlayer) {
                // Mark the result as DQ so the schedule row displays correctly
                result.dq = true;
                // Player DQ'd — serious
                state.dramaQueue.push({
                    id: 'inspect_dq_player_' + uid(),
                    title: '🚫 Post-Race DQ — Technical Infraction',
                    effect: 'rep_hit', value: -4, fans: -150,
                    desc: `Post-race inspection came back with a finding: ${infraction}. Your P${pos} result has been disqualified. Points and prize money are forfeited. Rep -4.`,
                    valence: 'bad',
                });
                // Strip points and prize from this race
                const pts = result.points || 0;
                state.championshipPoints[seriesId] = Math.max(0, (state.championshipPoints[seriesId] || 0) - pts);
                const prizeShare = 1.0; // already paid, reversed
                state.money = Math.max(0, state.money - Math.floor((result.prize || 0) * prizeShare));
                state.reputation = Math.max(0, state.reputation - 4);
                state.fans = Math.max(0, state.fans - 150);
                addLog(state, `🚫 Player DQ'd post-race: ${infraction}`);
            } else {
                // Another driver DQ'd — interesting paddock news
                const isRival = (state.rivals || []).some(function(r) {
                    return r.name.toLowerCase() === target.name.toLowerCase() &&
                        ['rival', 'frenemy'].includes(r.relationship || '');
                });
                // If it's the winner, promote the player one spot in the field standings
                if (pos === 1 && !isPlayer) {
                    const playerIdx = order.findIndex(function(e) {
                        return e.isPlayer || /\byou\b/i.test(e.name) ||
                            e.name.toLowerCase() === state.driverName.toLowerCase();
                    });
                    if (playerIdx === 1) {
                        // Player was P2, now inherits win — add bonus points/prize
                        state.championshipPoints[seriesId] = (state.championshipPoints[seriesId] || 0) + 3;
                        state.wins++;
                        addLog(state, `🏆 ${target.name} DQ'd from P1 — ${state.driverName} inherits the win. +3 pts.`);
                    }
                }
                // Update standings — remove DQ'd driver's points for this race
                if (state.seriesFields[seriesId] && state.seriesFields[seriesId][target.name]) {
                    const fieldPts = IRACING_PTS[order.indexOf(target)] || 1;
                    state.seriesFields[seriesId][target.name].points = Math.max(0,
                        (state.seriesFields[seriesId][target.name].points || 0) - fieldPts
                    );
                    if (pos === 1) state.seriesFields[seriesId][target.name].wins = Math.max(0,
                        (state.seriesFields[seriesId][target.name].wins || 0) - 1
                    );
                }
                state.dramaQueue.push({
                    id: 'inspect_dq_ai_' + uid(),
                    title: `${target.name} DQ'd — Tech Inspection`,
                    effect: 'none',
                    desc: `${target.name}'s P${pos} result was wiped out in post-race inspection: ${infraction}. The stewards made it official after the cars left the tech shed. Championship points adjusted.${isRival ? ' Your rival took the hit.' : ''}`,
                    valence: isRival ? 'good' : 'neutral',
                });
            }
        }

        function maybeFirePitEntryReminder(state) {
            if (!state.pitEntries || !state.pitEntries.length) return;
            state.pitEntries.forEach(function(pe) {
                if (pe.season !== state.season) return;
                var sched = state.schedules[pe.seriesId] || [];
                var race = sched[pe.raceIdx];
                if (!race || race.result) return;
                var raceWeek = race.week || race.round;
                if (raceWeek !== state.week) return;
                var s = getSeries(pe.seriesId);
                if (!s) return;
                // Only fire once
                if (pe._reminded) return;
                pe._reminded = true;
                state.dramaQueue.push({
                    id: 'pit_entry_' + pe.seriesId + '_' + pe.raceIdx,
                    title: '🏁 Pit Road Entry: ' + s.short,
                    effect: 'none',
                    valence: 'neutral',
                    desc: 'You flagged ' + race.track + ' for a single entry this week. Head to Pit Road to enter the race or pass on it.',
                    _requiresAction: false,
                });
            });
        }

        function maybeFireSpecialInvite(state) {
            // Max 2 invites per season — spaced out, not too early
            const seasonInvites = (state.offTrackDone || []).filter(function(k) {
                return k.startsWith('invite_') && k.endsWith('_s' + state.season);
            }).length;
            if (seasonInvites >= 2) return;
            if (seasonInvites === 1 && state.week < 10) return;
            if (seasonInvites === 0 && state.week < 4) return;
            if (Math.random() > 0.20) return;

            const playerTier = Math.max(1, ...(state.contracts || []).map(function(c) {
                return (getSeries(c.seriesId) && getSeries(c.seriesId).tier) || 1;
            }));

            // Build set of track names player actually has access to
            const availableTracks = new Set();
            ((state.trackPools && state.trackPools.free) || []).forEach(function(t) { availableTracks.add(t.name); });
            ((state.trackPools && state.trackPools.paid) || []).forEach(function(t) { availableTracks.add(t.name); });
            ((state.trackPools && state.trackPools.invite) || []).forEach(function(t) { availableTracks.add(t.name); });
            if (playerTier >= 3) { (SERIES_TRACKS.regional || []).forEach(function(t) { availableTracks.add(t.name); }); }
            if (playerTier >= 4) { (SERIES_TRACKS.national || []).forEach(function(t) { availableTracks.add(t.name); }); }
            if (playerTier >= 6) { (SERIES_TRACKS.cup || []).forEach(function(t) { availableTracks.add(t.name); }); }

            const inviteEvents = SPECIAL_EVENTS.filter(function(e) { return e.invite; });
            const alreadyDoneThisSeason = new Set(
                (state.offTrackDone || [])
                    .filter(function(k) { return k.startsWith('invite_') && k.endsWith('_s' + state.season); })
                    .map(function(k) { return k.replace('invite_', '').replace('_s' + state.season, ''); })
            );

            const eligible = inviteEvents.filter(function(e) {
                if (alreadyDoneThisSeason.has(e.id)) return false;
                if (e.inviteTier && !e.inviteTier.includes(playerTier) &&
                    !e.inviteTier.includes(playerTier - 1) &&
                    !e.inviteTier.includes(playerTier + 1)) return false;
                if (state.reputation < (e.reqRep || 0)) return false;
                if (e.reqTrack && !availableTracks.has(e.reqTrack)) return false;
                // Don't offer if we're past the 70% mark of the season — event would have already run
                var _mainSeries = (state.contracts || []).find(function(c) { var cs = getSeries(c.seriesId); return cs && !cs.isSideStep; });
                var _totalRaces = _mainSeries ? (getSeries(_mainSeries.seriesId).races || 16) : 16;
                if (state.week > Math.floor(_totalRaces * 0.7)) return false;
                return true;
            });

            if (!eligible.length) return;

            // Prefer exact tier match, fall back to adjacent
            const exact = eligible.filter(function(e) {
                return e.inviteTier && e.inviteTier.includes(playerTier);
            });
            const pool = exact.length ? exact : eligible;
            const evt = pool[rand(0, pool.length - 1)];

            if (!state.offTrackDone) state.offTrackDone = [];
            state.offTrackDone.push('invite_' + evt.id + '_s' + state.season);

            const hasSponsor = (state.sponsors || []).some(function(sp) { return sp.happiness >= 60; });
            const sponsorCovers = hasSponsor && Math.random() < (evt.sponsorChance || 0.08);
            const totalCost = sponsorCovers ? 0 : (evt.travelCost || 0) + evt.entryCost;
            const sponsorName = sponsorCovers
                ? ((state.sponsors || []).find(function(sp) { return sp.happiness >= 60; }) || {}).brand || 'your sponsor'
                : null;
            // playerInSeries: true only if player is EXACTLY in the event's primary tier
            // (not just nearby) — prevents "already racing this tier" for support slots
            const evtMinTier = evt.inviteTier ? Math.min.apply(null, evt.inviteTier) : 1;
            const evtMaxTier = evt.inviteTier ? Math.max.apply(null, evt.inviteTier) : 1;
            const playerInSeries = (state.contracts || []).some(function(c) {
                var cTier = (getSeries(c.seriesId) && getSeries(c.seriesId).tier) || 0;
                // Only counts as "in series" if player is at the TOP tier of the event
                // not a lower tier that's only eligible for support
                return evt.inviteTier && cTier >= evtMaxTier;
            });
            const costDesc = sponsorCovers
                ? sponsorName + ' is covering the entry fee.'
                : 'Entry costs ' + fmtMoney(totalCost) + ' out of pocket.';
            const pointsDesc = playerInSeries
                ? 'Points count — you\'re already racing this tier.'
                : 'No championship points, but the prize money and fans are real.';

            // isSupport: player is below the minimum tier of the event
            const isSupport = playerTier < evtMinTier;
            const supportDesc = isSupport
                ? 'This is a support race slot — you\'d be in the ' + evt.carType + ' feature as part of the ' + evt.name + ' weekend, not the headline event. The exposure and crowd are real. The main event is not yours yet.'
                : '';

            state.dramaQueue.push({
                id: 'invite_' + evt.id + '_' + uid(),
                title: '📬 Invitation — ' + evt.name + (isSupport ? ' (Support Race)' : ''),
                effect: 'none',
                desc: 'An invite came through for the ' + evt.name + ' at ' + evt.location + '. ' + evt.desc + ' ' + (isSupport ? supportDesc + ' ' : '') + costDesc + ' ' + pointsDesc,
                valence: 'good',
                _isInvite: true,
                _inviteEvtId: evt.id,
                _inviteCost: totalCost,
                _inviteSponsorCovers: sponsorCovers,
                _inviteSponsorName: sponsorName,
                _invitePointsCount: playerInSeries,
                _isSupport: isSupport,
            });
        }
        function maybeFireSponsorActivation(state) {
            if (!(state.sponsors || []).length) return;
            if (Math.random() > 0.18) return; // ~18% chance per race

            // Pick a sponsor weighted toward primary and happier ones
            const eligible = state.sponsors.filter(function (sp) { return sp.happiness >= 40; });
            if (!eligible.length) return;
            const sp = eligible[rand(0, eligible.length - 1)];

            // Don't fire the same activation twice in a row for the same sponsor
            const lastAct = sp._lastActivation;
            const available = SPONSOR_ACTIVATIONS.filter(function (a) { return a.id !== lastAct; });
            if (!available.length) return;

            const total = available.reduce(function (s, a) { return s + a.weight; }, 0);
            let r = Math.random() * total;
            let act = null;
            for (const a of available) { r -= a.weight; if (r <= 0) { act = a; break; } }
            if (!act) act = available[rand(0, available.length - 1)];

            sp._lastActivation = act.id;

            const desc = act.desc(sp);

            state.dramaQueue.push({
                id: 'spact_' + uid(),
                title: `${sp.brand} — ${act.title}`,
                effect: 'none',
                desc,
                valence: 'neutral',
                _isSponsor: true,
                _isActivation: true,
                _activationOptions: act.options,
                _activationSponsorId: sp.id,
            });
        }


        function maybeFireAIIncidents(state, seriesId, result) {
            // Post-race: nearby finishers may have had contact, affecting their relationships
            if (!result.finishOrder || result.finishOrder.length < 4) return;
            var order = result.finishOrder.filter(function(e) { return !e.isPlayer && e.name; });
            if (order.length < 3) return;

            // Check adjacent finishers for incident chance
            for (var i = 0; i < order.length - 1; i++) {
                var a = order[i];
                var b = order[i + 1];
                if (!a.name || !b.name) continue;

                // ~12% chance adjacent finishers had notable contact
                if (Math.random() > 0.12) continue;

                var dA = (state.drivers || []).find(function(d) { return d.name === a.name; });
                var dB = (state.drivers || []).find(function(d) { return d.name === b.name; });
                if (!dA || !dB) continue;

                var aggrA = (dA.aiStats && dA.aiStats.aggression) || 60;
                var aggrB = (dB.aiStats && dB.aiStats.aggression) || 60;
                var avgAggr = (aggrA + aggrB) / 2;

                // More aggressive pairs more likely to have real incidents
                var isHardContact = avgAggr > 68 && Math.random() < 0.55;

                if (isHardContact) {
                    // Push toward rivalry
                    if (!dA.aiRivals) dA.aiRivals = [];
                    if (!dB.aiRivals) dB.aiRivals = [];
                    if (!dA.aiRivals.includes(dB.name)) dA.aiRivals.push(dB.name);
                    if (!dB.aiRivals.includes(dA.name)) dB.aiRivals.push(dA.name);
                    // Remove from friends if they were
                    dA.aiFriends = (dA.aiFriends || []).filter(function(n) { return n !== dB.name; });
                    dB.aiFriends = (dB.aiFriends || []).filter(function(n) { return n !== dA.name; });

                    // Small chance it becomes a paddock note
                    if (Math.random() < 0.35) {
                        var incidentLines = [
                            a.name + ' and ' + b.name + ' made contact racing for position late in the race. Neither driver was happy about it in the pits.',
                            'The ' + a.name + ' and ' + b.name + ' situation is one to watch — they\'ve been getting closer on track and tonight it finally went wrong.',
                            a.name + ' and ' + b.name + ' tangled in the late stages. Paddock word is neither crew is laughing about it.',
                            'Hard racing between ' + a.name + ' and ' + b.name + ' tonight. The kind that gets remembered.',
                            a.name + ' and ' + b.name + ' swapped paint one too many times tonight. The debrief on both sides is going to be pointed.',
                        ];
                        state.dramaQueue.push({
                            id: 'ai_incident_' + uid(),
                            title: (function() {
                        function lastName(n) {
                            return n.replace(/\s+Jr\.?\s*$|\s+Sr\.?\s*$/i, '').trim().split(' ').pop();
                        }
                        return '💥 ' + lastName(a.name) + ' vs ' + lastName(b.name);
                    })(),
                            effect: 'none',
                            desc: incidentLines[rand(0, incidentLines.length - 1)],
                            valence: 'neutral',
                        });
                    }
                } else {
                    // Clean close racing — push toward friendship if not already rivals
                    var bothNotRivals = !(dA.aiRivals || []).includes(dB.name) && !(dB.aiRivals || []).includes(dA.name);
                    if (bothNotRivals && Math.random() < 0.25) {
                        if (!dA.aiFriends) dA.aiFriends = [];
                        if (!dB.aiFriends) dB.aiFriends = [];
                        if (!dA.aiFriends.includes(dB.name)) dA.aiFriends.push(dB.name);
                        if (!dB.aiFriends.includes(dA.name)) dB.aiFriends.push(dA.name);
                    }
                }
            }
        }

        function maybeFireFamilyNarrative(state, seriesId, result) {
            if (Math.random() > 0.35) return;
            if (!result.finishOrder || result.finishOrder.length < 4) return;

            var order = result.finishOrder || [];
            var familyGroups = {};
            order.forEach(function(entry) {
                if (!entry.name || entry.isPlayer) return;
                var d = (state.drivers || []).find(function(dr) { return dr.name === entry.name; });
                if (!d || !d._familyName) return;
                if (!familyGroups[d._familyName]) familyGroups[d._familyName] = [];
                familyGroups[d._familyName].push({ entry: entry, driver: d, pos: order.indexOf(entry) + 1 });
            });

            var familyKeys = Object.keys(familyGroups).filter(function(k) { return familyGroups[k].length >= 2; });
            if (!familyKeys.length) return;

            var lastName = familyKeys[rand(0, familyKeys.length - 1)];
            var members = familyGroups[lastName].sort(function(a, b) { return a.pos - b.pos; });
            var topMember = members[0];
            var bottomMember = members[members.length - 1];
            var fieldMid = Math.ceil((result.fieldSize || 20) * 0.5);
            var topTen = topMember.pos <= 10;
            var bothTopHalf = members.every(function(m) { return m.pos <= fieldMid; });
            var isGoodNight = topMember.pos <= fieldMid;
            var topFirst = topMember.entry.name.split(' ')[0];
            var bottomFirst = bottomMember.entry.name.split(' ')[0];
            var count = members.length;

            var topPos = topMember.pos;
            var botPos = bottomMember.pos;
            var topWon = topPos === 1;
            var bothTop10 = members.every(function(m) { return m.pos <= 10; });
            var bothTop5 = members.every(function(m) { return m.pos <= 5; });

            var goodLines = [
                topFirst + ' ' + lastName + ' finished ' + (topWon ? 'first' : ordinal(topPos)) + ', ' + bottomFirst + ' ' + ordinal(botPos) + '. Good night to share a last name.',
                bothTop5 ? 'Both ' + lastName + 's in the top five. That doesn\'t happen often in any field, let alone this one.' : bothTop10 ? 'Both ' + lastName + 's inside the top ten. The family debrief is going to be a good one tonight.' : topFirst + ' and ' + bottomFirst + ' ' + lastName + ' both ran in the top half. Solid family showing.',
                topFirst + ' ' + lastName + ' led the family effort with a ' + ordinal(topPos) + '. ' + bottomFirst + ' wasn\'t far behind at ' + ordinal(botPos) + '. Both in the money.',
                topWon ? topFirst + ' ' + lastName + ' won. ' + bottomFirst + ' ' + lastName + ' finished ' + ordinal(botPos) + '. The family is going to need a bigger trophy shelf.' : 'The ' + lastName + ' family ran ' + ordinal(topPos) + ' and ' + ordinal(botPos) + ' tonight. Two cars, two results worth talking about.',
                count + ' ' + lastName + 's on the entry list, all of them ran well. The family operation is doing fine.',
                'The ' + lastName + ' name showed up in the top half ' + (count > 2 ? count + ' times' : 'twice') + ' tonight. People notice that.',
                'Another strong showing for the ' + lastName + ' family. ' + topFirst + ' best of them at ' + ordinal(topPos) + ', ' + bottomFirst + ' a respectable ' + ordinal(botPos) + '.',
                topFirst + ' and ' + bottomFirst + ' ' + lastName + ' both had good runs. Nobody took the other one out, which at this level is genuinely impressive.',
            ];

            var badLines = [
                topFirst + ' ' + lastName + ' finished ' + ordinal(topPos) + ', ' + bottomFirst + ' ' + ordinal(botPos) + '. Rough night for the whole family.',
                'The ' + lastName + ' family had matching bad nights — ' + topFirst + ' at ' + ordinal(topPos) + ', ' + bottomFirst + ' at ' + ordinal(botPos) + '. The drive home is going to be quiet.',
                topFirst + ' and ' + bottomFirst + ' ' + lastName + ' both struggled tonight. Best the family could do was ' + ordinal(topPos) + '. That\'s a hard debrief.',
                count + ' ' + lastName + 's on the entry list. None of them are celebrating tonight.',
                'The ' + lastName + ' family came to race and the race hit back. ' + topFirst + ' best at ' + ordinal(topPos) + ', ' + bottomFirst + ' at ' + ordinal(botPos) + '. They\'ll regroup.',
                'Not the result anyone in the ' + lastName + ' camp was hoping for. ' + topFirst + ' finished ' + ordinal(topPos) + ' and that was as good as it got tonight.',
            ];

            var mixedLines = [
                topFirst + ' ' + lastName + ' finished ' + ordinal(topPos) + '. ' + bottomFirst + ' finished ' + ordinal(botPos) + '. Family bragging rights settled on the track.',
                topFirst + ' had the stronger run with a ' + ordinal(topPos) + '. ' + bottomFirst + ' will hear about their ' + ordinal(botPos) + ' on the drive home.',
                'Split results for the ' + lastName + ' family. ' + topFirst + ' at ' + ordinal(topPos) + ', ' + bottomFirst + ' at ' + ordinal(botPos) + '. One of them is buying dinner.',
                topFirst + ' ' + lastName + ' ' + ordinal(topPos) + ', ' + bottomFirst + ' ' + lastName + ' ' + ordinal(botPos) + '. The family championship standings are lopsided right now.',
                'The ' + lastName + 's had different nights. ' + topFirst + ' delivered a ' + ordinal(topPos) + '. ' + bottomFirst + ' will be motivated by their ' + ordinal(botPos) + ' next week.',
            ];

            var lines = bothTopHalf ? goodLines : isGoodNight ? mixedLines : badLines;

            state.dramaQueue.push({
                id: 'family_race_' + uid(),
                title: '👨‍👦 The ' + lastName + ' Family',
                effect: 'none',
                desc: lines[rand(0, lines.length - 1)],
                valence: 'neutral',
            });
        }

        function maybeFireFanMail(state) {
            // Once per season, weighted toward good results — not after a DNF or last place
            if ((state.offTrackDone || []).includes('fan_mail_s' + state.season)) return;
            const _lastResult = (state.raceHistory || []).slice(-1)[0];
            if (_lastResult && (_lastResult.dnf || _lastResult.pos >= (_lastResult.fs || 20))) return;
            if (Math.random() > 0.15) return;
            state.offTrackDone = state.offTrackDone || [];
            state.offTrackDone.push('fan_mail_s' + state.season);

            const name = state.driverName;
            const lines = [
                'A letter showed up at the track addressed to you. Handwritten. Kid from two states over says you\'re the reason they want to race. No return address.',
                'Someone emailed the team asking if you\'d sign a photo for their dad who just got out of the hospital. The team forwarded it. You said yes.',
                'A fan drove six hours to watch you race last weekend. They left before the finish because of a family thing. Left a note on the hauler anyway. "Worth every mile."',
                'Got a message through the team\'s social account. Someone\'s been following your career since mini stocks. They just wanted to say they noticed the improvement.',
                'A kid held up a sign with your name on it at the last race. Your crew chief took a photo and sent it to you. Still on your phone.',
                'Someone sent a handwritten note to the team. They said watching ' + name + ' race is the only thing that made their week better lately. Team pinned it in the hauler.',
                'Fan mail came through this week. Most of it is form stuff but one letter stood out — someone who lost their job recently said coming to the races is the one thing they still look forward to.',
                'A message from a kid who says they built a model of your car for a school project. Sent a photo. The number is wrong but the effort is right.',
                'Someone wrote to say they named their dog after you. You\'re not sure how to feel about that but the photo they attached is pretty great.',
                'A veteran wrote in to say watching short-track racing reminds him of when he used to go with his father. You\'re part of keeping that alive for him.',
            ];

            state.dramaQueue.push({
                id: 'fan_mail_' + uid(),
                title: '📬 Fan Mail',
                effect: 'rep_fans',
                value: rand(2, 4),
                fans: rand(100, 300),
                desc: lines[Math.floor(Math.random() * lines.length)],
                valence: 'good',
                _isFanMail: true,
            });
            state.reputation = Math.max(0, state.reputation + rand(2, 4));
            state.fans = Math.max(0, state.fans + rand(100, 300));
        }
        function maybeFireRivalWin(state, seriesId, result) {
            if (!result.finishOrder || !result.finishOrder.length) return;
            const winner = result.finishOrder[0];
            if (!winner || !winner.name) return;
            if (winner.isPlayer) return;
            const rival = (state.rivals || []).find(function (r) {
                return r.name.toLowerCase() === winner.name.toLowerCase() &&
                    ['rival', 'frenemy', 'racing_rival'].includes(relationship(r));
            });
            if (!rival) return;
            const rel = relationship(rival);
            const lines = [
                winner.name + ' took the win today. You know what that means for the points.',
                'Of all the people to win today, it had to be ' + winner.name + '.',
                winner.name + ' in victory lane. That one\'s going to sting for a while.',
                'The paddock is talking about ' + winner.name + '\'s win. They\'re going to be insufferable.',
                winner.name + ' got the win. File that away.',
            ];
            const friendLines = [
                winner.name + ' won today. Good for them — you can celebrate later. Focus on your own gap.',
                'Your ' + (rel === 'racing_rival' ? 'racing rival' : 'rival') + ' ' + winner.name + ' is in victory lane. Complicated feelings.',
            ];
            const useLines = rel === 'friend' ? friendLines : lines;
            state.dramaQueue.push({
                id: 'rival_win_' + uid(),
                title: winner.name + ' Wins',
                effect: 'none',
                desc: useLines[Math.floor(Math.random() * useLines.length)],
                valence: rel === 'friend' ? 'neutral' : 'bad',
            });
        }
        function maybeFirePaddockRumor(state) {
            if (Math.random() > 0.20) return;
            // Don't fire positive paddock rumor events right after a DNF or last-place finish
            const _lastR = (state.raceHistory || []).slice(-1)[0];
            const _recentlyBad = _lastR && (_lastR.dnf || _lastR.dq || _lastR.pos >= (_lastR.fs || 20));

            // Build connected rumors from actual sim state
            const connectedRumors = [];
            const playerFirst = state.driverName.split(' ')[0];

            // Struggling known driver
            const strugglingDrivers = (state.drivers || []).filter(function (d) {
                return d.source === 'known' && d.active && d.seasonPoints < 50 && d.starts > 3;
            });
            if (strugglingDrivers.length) {
                const d = strugglingDrivers[rand(0, strugglingDrivers.length - 1)];
                const s = getSeries(d.currentSeriesId);
                connectedRumors.push(
                    `Word in the ${(s && s.short) || 'series'} paddock is that ${d.name} hasn't been happy with how the season has gone and there might be conversations happening about what comes next; nobody's saying anything on the record but the vibe around that side of the garage has shifted.`,
                    `Heard from someone close to the ${(s && s.short) || 'series'} that ${d.name}'s situation is being watched pretty closely right now, results haven't been where anyone expected and the mood around the team reflects that.`,
                    `${d.name} has had a rough stretch and apparently it's not just a on-track thing; there's talk that the relationship with the team has gotten complicated, though nobody's putting names to it officially.`
                );
            }

            // Driver on a hot streak
            const hotDrivers = (state.drivers || []).filter(function (d) {
                return d.source === 'known' && d.active && d.seasonWins >= 2;
            });
            if (hotDrivers.length) {
                const d = hotDrivers[rand(0, hotDrivers.length - 1)];
                const s = getSeries(d.currentSeriesId);
                connectedRumors.push(
                    `${d.name} has been on a run lately and apparently some teams from higher up the ladder have been making calls; nothing confirmed but when you're winning races people notice and they talk.`,
                    `Heard that ${d.name}'s recent results have gotten some attention from outside the ${(s && s.short) || 'series'}; the kind of attention that usually means someone's putting together an offer.`,
                    `The buzz around ${d.name} right now is real; two wins does something to the conversation in the paddock and word is the phone has been busier than usual on that side.`
                );
            }

            // Active rivalry between two known drivers
            const knownRivals = (state.rivals || []).filter(function (r) {
                return ['rival', 'frenemy'].includes(relationship(r));
            });
            if (knownRivals.length) {
                const r = knownRivals[rand(0, knownRivals.length - 1)];
                connectedRumors.push(
                    `The situation between ${playerFirst} and ${r.name} has apparently been a topic of conversation beyond just the two of them; people in the paddock have been picking sides whether anyone asked them to or not.`,
                    `Heard from a crew member that the tension between ${playerFirst} and ${r.name} goes deeper than what's been public; there's apparently a specific incident that started it that hasn't made it into any of the coverage.`,
                    `${r.name} was overheard saying something about ${playerFirst} that didn't sound particularly friendly; the person who heard it wasn't supposed to and now it's making the rounds.`
                );
            }

            // Injured driver
            const injuredKnown = (state.drivers || []).filter(function (d) {
                return d.source === 'known' && d.injuredOrPenalized && d._injuryRacesOut > 0;
            });
            if (injuredKnown.length) {
                const d = injuredKnown[rand(0, injuredKnown.length - 1)];
                connectedRumors.push(
                    `The timeline on ${d.name}'s return is apparently less clear than the team has been letting on; heard from someone close to the situation that it's being managed carefully and the optimistic updates might be a little optimistic.`,
                    `${d.name}'s injury is being described publicly as minor but the word inside the garage is that it's taking longer than expected and the team is starting to have conversations they'd rather not be having yet.`
                );
            }

            // Championship pressure late in season
            const activeSeries = (state.contracts || []).map(function (c) { return c.seriesId; });
            activeSeries.forEach(function (sid) {
                const sched = state.schedules[sid] || [];
                const racesLeft = sched.filter(function (r) { return !r.result; }).length;
                const myPts = state.championshipPoints[sid] || 0;
                const field = state.seriesFields[sid] || {};
                const rows = [{ pts: myPts, isPlayer: true }].concat(Object.entries(field).map(function ([n, d]) { return { pts: d.points, name: n }; })).sort(function (a, b) { return b.pts - a.pts; });
                const myPos = rows.findIndex(function (r) { return r.isPlayer; }) + 1;
                const s = getSeries(sid);
                if (racesLeft <= 4 && racesLeft > 0 && myPos <= 3) {
                    connectedRumors.push(
                        `The ${(s && s.short) || 'series'} championship is tighter than the standings make it look and apparently there are people in the paddock who think the next two races are going to decide everything; the pressure is real even if nobody's admitting it.`,
                        `Heard that the conversation in the ${(s && s.short) || 'series'} paddock has shifted entirely to the championship picture; teams that were focused on individual results are now doing the math and it's making everyone a little edgy.`
                    );
                }
            });

            // Team instability — someone got dropped recently
            const recentDrops = (state.log || []).slice(-20).filter(function (l) { return l.includes('dropped you'); });
            if (recentDrops.length) {
                connectedRumors.push(
                    `After the recent team change there's been a lot of speculation about what actually happened behind the scenes; the official version and the paddock version don't quite match up and people are filling in the gaps.`,
                    `The fallout from the recent driver move is still being talked about; turns out these things are rarely as clean as the announcements make them sound and there are a few people who have opinions about how it went down.`
                );
            }

            // Generic flavor rumors — always available, no connection to sim state
            const genericRumors = [
                `Word is one of the top teams in the series has been quietly unhappy with their driver situation for a while now and the offseason could bring some movement that catches people off guard.`,
                `Heard from a reliable source that at least one well-funded team is about to announce a sponsorship deal that's bigger than anything the series has seen in a few years; it'll change their plans for next season significantly.`,
                `Talk in the garage area is that a manufacturer is increasing their involvement in the series next season which means more factory support and more competition for the seats that come with it.`,
                `A crew chief reportedly interviewed with a rival team last week; nobody's confirming it but the timing lines up with some other things that have been happening and it's not being dismissed.`,
                `Rumor is the series is looking at a rule change that would shake up the car setup side of things pretty significantly; teams are already lobbying and the politics around it have gotten interesting.`,
                `Heard that a driver who's been on everyone's radar recently turned down a significant offer from a bigger team; whether that's because something better is coming or because the situation at home is more complicated than it looks, nobody's sure.`,
                `Word is a sponsor who's been in the series for years is reconsidering their long-term commitment after next season; the numbers apparently aren't working the way they used to and the internal conversation has changed.`,
                `There's talk that a prominent driver is unhappy with their current contract situation and the relationship with the team has gotten complicated enough that both sides are being careful about what they say publicly.`,
                `Heard from someone in the paddock that a team owner is seriously considering selling the operation after this season; not confirmed but the person saying it usually knows what they're talking about.`,
                `A source says at least one driver who's been running up front lately has been dealing with something off the track that the team has been covering for; it hasn't affected results yet but the people around them have noticed.`,
                `The stewards apparently received a formal complaint after last week's race that never made it into the official reports; whatever it was, it was serious enough that there were some very tense conversations behind closed doors.`,
                `Word is a young driver who everyone assumed was on their way up has been having second thoughts about the path they're on; sometimes the reality of what it takes doesn't match what you imagined when you were coming up.`,
                `Heard that two drivers who have been close for a long time aren't really talking right now; nobody knows exactly what happened but the energy between them at the last event was noticeably different.`,
                `There's apparently been some friction inside one of the bigger teams about strategy calls over the last few races; the kind of friction that starts as a disagreement and quietly becomes something more if results don't improve.`,
                `Rumor is a driver who recently moved up to a higher series is struggling more than the results show; apparently the step up has been harder than expected and the team is being patient but patience has limits.`,
                `Word from the paddock is that the next few races are going to clarify a lot of things that have been uncertain this season; some contracts, some relationships, some situations that have been in a holding pattern.`,
                `Heard that a well-known team principal had a meeting with series officials that ran a lot longer than scheduled; what came out of it hasn't been shared but the people in the room apparently left looking like they had a lot to think about.`,
                `There's talk that a driver everyone wrote off after a rough patch last season has been working with a new coach and the results in testing have been turning heads; whether it translates to race weekends is another question.`,
                `A source close to one of the midfield teams says the financial picture for next season is more uncertain than they're letting on publicly; sponsorship is harder to find than it used to be and the math is getting difficult.`,
                `Word is someone in the series is about to make an announcement that's going to surprise people; the details aren't clear but the source was specific enough that it's hard to dismiss entirely.`,
            ];


            // Pick from connected pool if available (weighted 60/40 toward connected when available)
            let rumor;
            let isConnected = false;
            if (connectedRumors.length && Math.random() < 0.60) {
                rumor = connectedRumors[rand(0, connectedRumors.length - 1)];
                isConnected = true;
            } else {
                rumor = genericRumors[rand(0, genericRumors.length - 1)];
            }

            state.dramaQueue.push({
                id: 'rumor_' + uid(),
                title: '🗣️ Paddock Rumor',
                effect: 'none',
                desc: rumor,
                valence: 'neutral',
                _isRumor: true,
                _isConnected: isConnected,
            });
        }