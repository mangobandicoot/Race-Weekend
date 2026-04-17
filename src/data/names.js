  // social media posts
        const SOCIAL_POSTS = {
            positive: [
                "wheels up nothing clears your head like a good test day",
                "grateful for this team the work they put in every week doesn't go unnoticed",
                "long drive home good race good people can't ask for much more than that",
                "track day felt right today car was dialed looking forward to race day",
                "appreciate every fan that made the trip out you're the reason we do this",
                "another podium in the books on to the next one",
                "just signed some autographs for an hour best part of the job honestly",
                "season's going well staying focused staying humble",
                "talked to a kid today who wants to race told him the same thing someone told me just show up",
                "the crew worked through the night to get this car ready they deserve the credit",
                "road trip to the track coffee loud music let's go",
                "qualifying felt strong starting position matters we'll see what we can do",
                "ran clean laps in practice the car is responding good sign going into the weekend",
                "sponsors showed up at the track today love when we can show them what we're building",
                "back in the shop going over data from last weekend always something to learn",
                "cut a fast lap today that reminded me why i got into this",
                "watched the highlights couple things i'd do differently mostly happy with it",
                "first place feels earned when your team earns it with you",
                "positive weekend not perfect but moving in the right direction",
                "season's half over the second half is where it gets interesting",
                "good conversation with my engineer today we're on the same page",
                "the competition is stiff this year that's what makes it fun",
                "signed a kid's helmet today hope he remembers this when he's racing someday",
                "woke up thinking about the setup change we made think it was right",
                "grateful to be healthy racing and improving don't take any of it for granted",
                "mechanic called me at 7am about a setup idea we might be onto something",
                "good vibes at the track this week team is locked in",
                "the championship is a long game playing the long game",
                "finished strong not where we wanted to start but happy with how we responded",
                "post-race debrief just wrapped smart team we'll be better next week",
                "home for a night laundry coffee then back at it",
                "appreciate the messages from fans this week genuinely",
                "track was rubbered in perfectly car felt planted days like this are what you train for",
                "race craft is a long education still learning still here",
                "building something real here you can feel it in the shop",
                "won today felt good said thank you meant it",
                "clean race clean result don't always need a story sometimes the number says enough",
                "p1 that's the post",
                "led laps today felt right want more of that",
                "championship lead feels good also feels fragile not taking anything for granted",
                "pole position the one lap that reminds you what this is all about",
                "came from the back passed a lot of cars good day",
                "fast car clean air good tires that's a recipe used it today",
                "nobody handed me anything today good",
                "fans in the stands tonight were loud could hear them in the car that helps more than you'd think",
                "ran the fastest lap in the field today not a win but i'll take it",
                "two laps from the end i found something extra not sure where it came from glad it showed up",
                "this team doesn't know how to quit neither do i that's why we get along",
                "the championship is a long game and we're playing it right",
                "won and the crew chief is already talking about next week love this team",
            ],
            negative: [
                "not the result we wanted back to work",
                "that one hurt won't lie but it's not the last race",
                "frustrated not going to pretend otherwise the car deserved better than what i gave it",
                "rough weekend not making excuses just need to do better",
                "some days the sport reminds you it doesn't owe you anything",
                "walked away in one piece have to find the positive somewhere",
                "results don't reflect the work that's the most frustrating part",
                "DNF don't want to talk about it tonight",
                "bad calls were made some by me own it and move on",
                "the pace was there the finish wasn't story of the season right now",
                "competitors are better prepared right now that's the honest truth",
                "took too long to find the setup window by then the race was gone",
                "lost a position on the last restart i should have held mentally replaying it",
                "the gap at the top of the standings is uncomfortable time to do something about it",
                "crew gave me a fast car i didn't do enough with it that's on me",
                "got shuffled back early and spent the whole race trying to recover didn't",
                "tired frustrated coming back swinging next week",
                "rivals had a good weekend we didn't gap got bigger simple",
                "not acceptable for where we want to be said it out loud own it",
                "incident on lap 4 set the whole race back can't keep doing this",
                "watched the replay looked worse than it felt that's never good",
                "let a slower car hold me up for too long cost us positions lesson learned",
                "tight on budget tight on results something has to give",
                "sponsor called this morning conversation wasn't fun",
                "mental side of the game was off this weekend no one to blame for that but me",
                "if i'm honest i wasn't fully present at the track this weekend showed in the results",
                "nothing went right from friday to sunday rare but it happens back at it",
                "apologies to the team they gave me everything this weekend i didn't deliver",
                "engine gave up can't race what you don't finish",
                "fell from second to eighth in the last three laps no words",
                "tired of being close need to actually finish the job",
                "nobody wants to hear excuses including me we have to just be better",
                "DNF and a long quiet ride home we'll figure it out",
                "parked early everything hurts including my feelings",
                "didn't finish and i am choosing not to elaborate further",
                "well we were fast right up until we weren't",
                "car let us down tonight sometimes that's racing still sucks",
                "not our night not even a little bit",
                "got thrown out not the story i wanted to tell this week",
                "disqualified team is already working on making sure it doesn't happen again",
                "DQ not going to pretend that doesn't sting",
                "finished where we finished and we will not be discussing this further",
                "the part that breaks is always the part you didn't expect",
                "rough night the results don't reflect the effort but they do reflect the result",
            ],
            neutral: [
                "race weekend coming up headed to the track thursday",
                "long travel day time zones are not my friend",
                "in the shop today going over last week's data",
                "tech inspection passed ready to qualify",
                "packing the gear bag same ritual every week",
                "track walk this morning always good to feel the surface before you race on it",
                "media day commitments wrapped now the actual racing part",
                "simulator session in the books prepped for the layout",
                "weather looks interesting for race day we'll see how it plays",
                "got to the track early worth it every time",
                "crew is loading the hauler weekend starts now",
                "first practice session today feeling out the baseline",
                "checking tire compound data from previous races here doing the homework",
                "mid-season halfway through the schedule starting to see what this season is",
                "had a meeting with the engineering team today long one",
                "series put out the schedule for next season already circling some dates",
                "press obligations done can focus on setup work now",
                "still in one piece after that race that's the first checkbox",
                "new tracks are always interesting adapting fast is the skill",
                "race strategy meeting went long lot to consider this week",
                "fitness day gym and then film study",
                "headed to a track i've run well at before history doesn't guarantee anything",
                "day off sort of still watched race footage for two hours",
                "rule changes for next year were announced reading through the technical bulletin now",
                "schedule says test day test day it is",
                "interview obligations this morning usual questions usual answers",
                "car is getting freshened up between races shop time is part of the rhythm",
                "checked into the hotel race week officially started",
                "oval this week track position is everything we know that",
                "sponsor wanted some content spent an hour in front of a camera today",
                "travel playlist is getting stale taking suggestions",
                "two weeks between races felt like forever ready to be back in the seat",
                "first day at a new track impressions are good so far",
                "safety briefing done rulebook reviewed we're race ready",
                "results thread from last weekend still in my mentions people are passionate",
                "new helmet this weekend small thing still good to have something fresh",
                "checked the entry list for this weekend stacked field",
                "off to the track eight hour drive good podcast queue",
                "rain in the forecast that changes a few things",
                "watched my teammate's onboard from last week different driving style interesting data",
                "autograph session this afternoon good to see the fans face to face",
                "season's winding down starting to think about what's next",
                "eating hotel breakfast at 6am before heading to the track living the dream",
                "talked to my engineer for an hour about things that have nothing to do with racing good for both of us",
                "crew chief sent a twelve message voice note about tire pressures love this job",
                "testing today nothing to report that's a good sign",
                "offseason work is quiet work that's fine quiet work shows up later",
                "fan asked me what i think about during a race honestly mostly just trying not to mess up",
                "sleep schedule is a disaster track life",
            ],
            callout: [
                "some driving out there this weekend that i'd love to get an explanation for i'll be polite and leave it at that",
                "if you're going to make a move like that at least make it stick just a thought",
                "interesting racing decisions were made today not by me",
                "i'd comment on the incident but my PR person is standing right here",
                "replayed the contact about fifteen times still not sure what the plan was",
                "racing is hard apparently harder for some people than others",
                "there are drivers in this series i trust completely the list is getting shorter",
                "my door panel has opinions about what happened today unfortunately it can't talk",
                "some people race you some people race at you know the difference",
                "keep your head on a swivel out there apparently that's necessary now",
                "someone owes my crew chief an apology and a new quarter panel",
                "i don't do callouts but i will say some of y'all need to re-read the rulebook",
                "the stewards saw it the fans saw it the cameras definitely saw it moving on",
                "payback isn't something i believe in karma on the other hand works just fine",
                "i gave room it wasn't returned that's all i'm saying publicly",
                "if you race me clean i'll race you clean that's the deal always has been",
                "three races in a row now patience has a limit",
                "my spotter was very colorful on the radio today can't repeat it here",
                "i raised my hand for the contact no wait i didn't that wasn't me",
                "the replay speaks for itself i'll let it do the talking",
                "some people in this paddock confuse confidence with competence not the same thing",
                "interesting that the loudest people in the paddock aren't leading the points just an observation",
                "the scoreboard doesn't lie some people just don't like what it says",
                "i let my results do the talking certain other people let other things do the talking",
                "if someone has a problem with how i race them my number is in the series directory",
                "the fastest way around a track doesn't involve taking out the car next to you basic concept",
                "focused on my own program hard to do when other people keep making it interesting",
            ],
            hype: [
                "championship lead don't want to jinx it but also championship lead",
                "three wins in a row this car is alive right now",
                "points leader heading into race day that's a good feeling",
                "momentum is real we've got it protecting it",
                "hot streak don't touch anything we're not changing a thing",
                "series is watching good let them watch",
                "fastest car in practice turned it into a qualifying lap now let's make it a race",
                "back to back podiums the car is right the team is locked in let's go",
                "four races left we're in this thing fully in it",
                "the lead in points is small but it's ours every point matters from here",
                "winning changes the atmosphere in the hauler everybody stands a little taller",
                "on a run right now not overthinking it just racing",
                "people are starting to take notice that's fine we've been here all season",
                "track record broken today now it's mine until someone takes it",
                "the championship math is working in our favor not taking it for granted",
                "car unloaded fast stayed fast all day want to bottle this and bring it every week",
                "streak is real don't ask me what we changed because we're not changing anything",
                "this team right now is something special and i'm not going to be quiet about it",
            ],
            shade: [
                "some people in this paddock confuse confidence with competence not the same thing",
                "interesting that the loudest people in the paddock aren't leading the points just an observation",
                "the scoreboard doesn't lie some people just don't like what it says",
                "i let my results do the talking certain other people let other things do the talking",
                "noticed some people had a lot to say after the race funny how that works",
                "the ones who complain the most after a race are usually the ones who raced the worst pattern i've noticed",
                "i respect everyone on this grid some of them make it harder than others",
                "if someone has a problem with how i race them my number is in the series directory",
                "actions on track words off it one of those things matters more to me than the other",
                "my crew chief told me to say no comment so no comment",
                "not going to name names you know who you are so do i",
                "some moves you make because you're good some you make because you're desperate different energy",
                "the fastest way around a track doesn't involve taking out the car next to you basic concept",
                "focused on my own program hard to do when other people keep making it interesting",
                "there's a reason certain drivers have long careers and certain ones don't watch long enough and you'll figure it out",
                "i sleep great after clean races not everyone in this field can say that",
            ],
        };

        // one post per type per week
        function canPostSocial(state, type) {
            if (!state.lastSocialPost) state.lastSocialPost = {};
            return (state.lastSocialPost[type] || 0) < state.week;
        }

        // pick posts based on what just happened
        function getSocialPostPool(type) {
            var last = (G.raceHistory || []).slice(-1)[0];
            var pos = last ? last.pos : null;
            var dnf = last ? last.dnf : false;
            var dq = last ? last.dq : false;
            var fs = last ? (last.fs || 20) : 20;
            var isWin = pos === 1 && !dnf && !dq;
            var isPodium = pos <= 3 && !dnf && !dq;
            var isTop5 = pos <= 5 && !dnf && !dq;
            var isTopHalf = pos <= Math.ceil(fs / 2) && !dnf && !dq;
            var isDead = dnf || dq || (pos && pos >= fs - 2);
            var seriesShort = last ? last.seriesShort : '';

            if (type === 'positive') {
                var pool = [];
                if (isWin) pool = [
                    "won today. that's all.",
                    "p1. car was perfect, crew was perfect, everything clicked. grateful doesn't cover it",
                    "victory lane is loud and i don't care who knows i love it",
                    "got the win. season's looking different now",
                    "we won. the crew chief is insufferable when we win and i wouldn't have it any other way",
                    "checked a box today. been working toward that one for a while",
                    "the car was so good tonight i almost felt bad. almost",
                    "won at " + (last && last.track ? last.track : 'the track') + " and the drive home is going to feel very different than last week",
                    "p1 and we had something left at the end. that's the version of this team i want to show up every week",
                    "won. called my parents. cried a little. told nobody. now i'm telling everybody",
                ] ; else if (isPodium) pool = [
                    "podium. not the step we wanted but this team earned every bit of it",
                    "p" + pos + " and the car had more in it. gives you something to think about on the drive home",
                    "top three. keeps the points picture interesting",
                    "p" + pos + " tonight. happy with the effort, want more from the result. that's racing",
                    "stood on the podium today. first time doing that at " + (last && last.track ? last.track : 'this track') + " and it won't be the last",
                    "p" + pos + " and honestly a solid night. the car was dialed and we made the most of it",
                ] ; else if (isTop5) pool = [
                    "p" + pos + " and we moved up in points. not complaining",
                    "top five. clean race, good execution, kept our nose clean",
                    "p" + pos + " today. field was stacked and we held our own. good day",
                    "p" + pos + " is p" + pos + ". we'll take it and come back swinging next week",
                    "finished p" + pos + " in a field of " + fs + ". the pace is there and the results are starting to follow",
                ] ; else if (isTopHalf) pool = [
                    "p" + pos + " out of " + fs + ". clean race, learned a lot, want more",
                    "mid pack finish but we kept it clean and that matters right now",
                    "p" + pos + " isn't the result we showed up for but the effort was real",
                    "took some notes tonight. the setup wasn't quite there but we'll fix it",
                    "another lap, another lesson. p" + pos + " and already thinking about next week",
                ] ; else pool = SOCIAL_POSTS.positive;
                return pool.length ? pool : SOCIAL_POSTS.positive;
            }

            if (type === 'negative') {
                var npool = [];
                if (dq) npool = [
                    "well that happened",
                    "DQ. not going to pretend that doesn't sting",
                    "got thrown out. not the story i wanted to tell this week",
                    "disqualified. the team is already working on making sure it doesn't happen again",
                    "not how you want to end a race weekend. heads down and move on",
                ] ; else if (dnf) npool = [
                    "DNF. car had something to say about our evening plans",
                    "parked early. everything hurts including my feelings",
                    "DNF at " + (last && last.track ? last.track : 'the track') + " and i am choosing not to elaborate",
                    "didn't finish. the part that breaks is always the part you didn't expect",
                    "well we were fast right up until we weren't",
                    "DNF and a long quiet ride home. we'll figure it out",
                    "car let us down tonight. sometimes that's racing. still sucks",
                    "not our night. not even a little bit",
                ] ; else if (isDead) npool = [
                    "p" + pos + " out of " + fs + ". that one's going in the trash",
                    "rough night. the results don't reflect the effort but they do reflect the result",
                    "p" + pos + " and i've already deleted the replay",
                    "finished last and earned every bit of it tonight. time to fix some things",
                    "not great bob",
                    "p" + pos + ". we will not be discussing this further",
                ] ; else npool = SOCIAL_POSTS.negative;
                return npool.length ? npool : SOCIAL_POSTS.negative;
            }

            if (type === 'callout') {
                return SOCIAL_POSTS.callout;
            }
            if (type === 'hype') {
                return SOCIAL_POSTS.hype;
            }
            if (type === 'shade') {
                return SOCIAL_POSTS.shade;
            }
            return SOCIAL_POSTS[type] || SOCIAL_POSTS.neutral;
        }

        function doSocialPost(type) {
            if (!canPostSocial(G, type)) return;
            var pool = getSocialPostPool(type);
            var post = pool[rand(0, pool.length - 1)];
            if (!G.lastSocialPost) G.lastSocialPost = {};
            G.lastSocialPost[type] = G.week;
            var repDelta = 0, fanDelta = 0;
            if (type === 'positive') { repDelta = rand(1, 3); fanDelta = rand(100, 400); }
            if (type === 'negative') { repDelta = rand(-2, 0); fanDelta = rand(-200, 100); }
            if (type === 'neutral')  { repDelta = 0; fanDelta = rand(0, 150); }
            if (type === 'callout')  { repDelta = rand(-1, 1); fanDelta = rand(200, 500); }
            if (type === 'hype')     { repDelta = rand(1, 4); fanDelta = rand(200, 600); }
            if (type === 'shade')    { repDelta = rand(-1, 2); fanDelta = rand(150, 450); }
            G.reputation = Math.max(0, G.reputation + repDelta);
            G.fans = Math.max(0, G.fans + fanDelta);
            addLog(G, '📱 Social post (' + type + '): "' + post.slice(0, 60) + '..." | Rep ' + (repDelta >= 0 ? '+' : '') + repDelta + ' | Fans ' + (fanDelta >= 0 ? '+' : '') + fmtFans(fanDelta));
            G.lastSocialPostText = { type: type, text: post, rep: repDelta, fans: fanDelta, week: G.week };
            saveGame(); render();
            showSummaryToast('📱 Posted: "' + post + '"', type === 'positive' ? '#10B981' : type === 'negative' ? '#EF4444' : type === 'hype' ? '#F59E0B' : '#94A3B8', 'Social');
        }

        // international name pools
const INTL_NAMES = {
    Europe: {
        first: ['Luca', 'Marco', 'Matteo', 'Lorenzo', 'Alessandro', 'Francesco', 'Pierre', 'Antoine',
            'Julien', 'Romain', 'Sebastien', 'Nicolas', 'Maxime', 'Theo', 'Max', 'Lars',
            'Nico', 'Felix', 'Kevin', 'Marcel', 'Timo', 'Mick', 'Carlos', 'Fernando',
            'Alvaro', 'Sergio', 'Dani', 'Javier', 'Pablo', 'Ruben', 'Lewis', 'George',
            'Lando', 'Oliver', 'Jack', 'Will', 'Tom', 'Harry',
            'Sofia','Giulia','Francesca','Chiara','Alessia','Elena',
            'Camille','Claire','Amelie','Juliette','Manon',
            'Emma','Hannah','Leonie','Mila','Lena',
            'Freya','Ingrid','Astrid','Signe',
            'Eva','Anna','Clara','Lucia',
            'Isabella','Victoria','Helena','Margot','Amara','Elise','Nina','Paula','Saskia','Katarina',
            'Marina','Verena','Diana','Bianca','Livia','Jasmin','Anika','Petra','Elena','Cecilia',
            'Louis','Theo','Julien','Gabriel','Simon','Mathis','Elias','Adrian','Raphael','Dominik',
            'Vincent','Sebastian','Jonathan','Benjamin','Christian','Anton','Fabian','Oliver','Daniel','Niklas'],
        last: ['Rossi', 'Ferrari', 'Lombardi', 'Ricci', 'Conti', 'Mancini', 'Greco', 'Esposito',
            'Leclerc', 'Gasly', 'Ocon', 'Grosjean', 'Vergne', 'Lapierre', 'Vandoorne',
            'Verstappen', 'Magnussen', 'Eriksson', 'Lindqvist', 'Ronning', 'Haugen',
            'Sainz', 'Alonso', 'Molina', 'Fuentes', 'Herrero', 'Martinez', 'Castillo',
            'Hamilton', 'Russell', 'Norris', 'Rowland', 'Harvey', 'Chilton', 'Tincknell',
            'Dubois','Lefevre','Moreau','Girard','Andre','Lambert','Bonnet','Renaud',
            'Chevalier','Blanchard','Schmidt','Weber','Fischer','Wagner','Becker','Hoffmann',
            'Keller','Braun','Kruger','Neumann','Jansen','DeVries','VanDijk','Romano',
            'Gallo','Costa','Rinaldi','Moretti','DeLuca','Marchetti','Bellini','Caruso',
            'Fontana','Bianchi','Sorrentino','Vitale','Rinaldo','Barone','Ferraro','Martini',
            'Kovacs','Nagy','Horvath','Toth','Szabo','Varga','Molnar','Fischer','Schulz','Klein',
            'Becker','Maier','Richter','Schneider','Wolf','Bauer','Koch','Hoffman','Schmitt','Meier']
    },

    Asia: {
        first: ['Yuki', 'Sho', 'Ryo', 'Kenji', 'Takumi', 'Hiroshi', 'Daiki', 'Naoki',
            'Wei', 'Jian', 'Hao', 'Ming', 'Lei', 'Tao', 'Peng', 'Cheng',
            'Ji-Woo', 'Min-Jun', 'Tae-Yang', 'Hyun', 'Seung', 'Jae', 'Dong', 'Young',
            'Arjun', 'Kush', 'Jehan', 'Ruhaan', 'Akhil', 'Raj', 'Vicky', 'Aditya',
            'Yuna','Hina','Sakura','Aoi','Rin',
            'Mei','Xinyi','Li Na','Xia','Yan',
            'Ji-Eun','Soo-Min','Hye-Jin','Ara',
            'Ananya','Priya','Isha','Kavya','Neha',
            'Haruto','Sota','Ren','Yuto','Kaito','Riku','Hikaru','Daichi','Takashi','Shota',
            'Aarav','Rohan','Vihaan','Ira','Saanvi','Anika','Meera','Priya','Tanvi','Diya'],
        last: ['Tsunoda', 'Yamamoto', 'Kobayashi', 'Nakajima', 'Sato', 'Matsushita', 'Otsu', 'Makino',
            'Zhou', 'Wang', 'Li', 'Zhang', 'Chen', 'Liu', 'Yang', 'Wu',
            'Kim', 'Park', 'Lee', 'Choi', 'Jung', 'Kang', 'Yoon', 'Lim',
            'Maini', 'Mehta', 'Daruvala', 'Narain', 'Karthikeyan', 'Singhania',
            'Tanaka','Fujimoto','Matsumoto','Ishikawa','Kawasaki','Takahashi','Okada','Shimizu','Yamaguchi','Hasegawa',
            'Gupta','Sharma','Patel','Reddy','Nair','Iyer','Chopra','Bose','Kapoor','Bhat']
    },

    Africa: {
        first: ['Jann', 'Sacha', 'Kelvin', 'Nathanael', 'Liam', 'Jordan', 'Caleb', 'Ethan',
            'Kwame', 'Kofi', 'Yaw', 'Nana', 'Kojo', 'Fiifi',
            'Tariq', 'Bilal', 'Youssef', 'Omar', 'Karim', 'Hassan', 'Nabil', 'Rachid',
            'Ama','Akosua','Abena','Efua',
            'Amina','Fatima','Zahra','Imane',
            'Thandi','Naledi','Zola','Ayanda',
            'Nia','Zuri','Imani','Asha',
            'Amara','Sade','Chimamanda','Ify','Ayo','Lindiwe','Keletso','Sibongile','Bongi','Mbali'],
        last: ['Monger', 'Fenestraz', 'Beckmann', 'Soulet', 'Thiim',
            'Asante', 'Mensah', 'Owusu', 'Boateng', 'Amoah', 'Osei', 'Darko', 'Agyei',
            'Benali', 'Mansouri', 'Khalidi', 'Bensalem', 'Azizi', 'Ouali', 'Hajji', 'Berrada',
            'Okafor','Nwosu','Balogun','Adebayo','Ogunleye','Nkosi','Dlamini','Mokoena',
            'Ndlovu','Khumalo','Zulu','Mthembu','Traore','Coulibaly','Keita','Konate','Diop',
            'Mbaye','Diallo','Sow','Kamara','Abebe','Tesfaye','Adeyemi','Obi','Achebe','Chike']
    },

    'South America': {
        first: ['Gabriel', 'Felipe', 'Pietro', 'Enzo', 'Caio', 'Thiago', 'Matheus', 'Lucas',
            'Sebastian', 'Nicolas', 'Facundo', 'Matias', 'Agustin', 'Ignacio', 'Santiago', 'Tomas',
            'Juan', 'Julio', 'Carlos', 'Eduardo', 'Rodrigo', 'Andres', 'Diego', 'Miguel',
            'Sofia','Valentina','Camila','Isabella','Martina','Luciana',
            'Gabriela','Daniela','Mariana','Paula','Carla','Juliana',
            'Antonella','Renata','Bianca','Fernanda','Liliana','Adriana','Isabel','Veronica','Elena','Catalina'],
        last: ['Bortoleto', 'Drugovich', 'Fittipaldi', 'Piquet', 'Senna', 'Barrichello', 'Nasr', 'Fraga',
            'Colapinto', 'Dapero', 'Nannini', 'Vesti', 'Hauger', 'Marti', 'Bearman',
            'Montoya', 'Maldonado', 'Urrutia', 'Rojas', 'Fuenmayor', 'Guerrieri', 'Girolami',
            'Silva','Santos','Oliveira','Souza','Pereira','Costa','Ribeiro','Alves','Carvalho',
            'Gomes','Fernandez','Gomez','Lopez','Diaz','Torres','Vargas','Cabrera','Mendoza',
            'Castillo','Herrera','Ramirez','Morales','Gonzalez','Perez','Vega','Rios','Campos','Almeida','Farias','Barros','Moura']
    },

    'Central America': {
        first: ['Esteban', 'Ricardo', 'Sergio', 'Roberto', 'Mario', 'Memo', 'Adrian', 'Raul',
            'Josue', 'Alejandro', 'Sebastian', 'Andres', 'Felipe', 'Arturo', 'Hector', 'Ernesto',
            'Maria','Guadalupe','Fernanda','Valeria','Ximena','Andrea',
            'Daniela','Gabriela','Lucia','Ana','Paola','Carmen','Isabel','Monica','Patricia','Claudia'],
        last: ['Guerrieri', 'Soto', 'Jimenez', 'Herrera', 'Mendez', 'Vasquez', 'Castillo', 'Cruz',
            'Rodriguez', 'Morales', 'Garcia', 'Lopez', 'Martinez', 'Gonzalez', 'Perez', 'Ramirez',
            'Navarro','Delgado','Rios','Campos','Ortega','Salazar','Vega','Carrillo','Mejia',
            'Pineda','Reyes','Cortez','Dominguez','Fuentes','Valdez','Estrada','Serrano',
            'Palacios','Molina','Alvarado','Benitez','Pacheco','Acosta','Torres','Carmona','Vidal','Espinoza','Galvez']
    },

    Australia: {
        first: ['Oscar', 'Jack', 'Will', 'Scott', 'Mark', 'Daniel', 'James', 'Ryan',
            'Liam', 'Nathan', 'Dylan', 'Jake', 'Broc', 'Cameron', 'Matthew', 'Todd',
            'Chloe','Sophie','Emily','Olivia','Isla','Mia',
            'Zoe','Grace','Ella','Ruby','Matilda','Evie','Lily','Charlotte','Amelia','Holly',
            'Abigail','Madeline','Jessica','Leah','Sienna','Georgia','Maya','Imogen','Poppy','Harper'],
        last: ['Piastri', 'Doohan', 'Power', 'McLaughlin', 'Webber', 'Ricciardo', 'Courtney', 'Briscoe',
            'Percat', 'Whincup', 'Mostert', 'Reynolds', 'Waters', 'Heimgartner', 'Slade',
            'Smith','Jones','Taylor','Brown','Williams','Wilson','Evans','Thomas','Roberts','Walker',
            'Wright','Robinson','Thompson','Baker','Hughes','Murphy','Kelly','Mason','Turner',
            'Harrison','Edwards','Cooper','Mitchell','Campbell','Bell','Carter','Phillips','Parker','Cook']
    }
};
        function generateIntlName(region) {
            var pool = INTL_NAMES[region];
            if (!pool) return null;
            var first = pool.first[Math.floor(Math.random() * pool.first.length)];
            var last = pool.last[Math.floor(Math.random() * pool.last.length)];
            return first + ' ' + last;
        }
        // ai driver name pool
        const AI_FIRST = [
    'Kyle','Jimmy','Dale','Bobby','Ronnie','Chase','Tyler','Rick','Austin','Hank',
    'Luke','Cody','Ray','Brent','Travis','Mitch','Greg','Aaron','Vince','Wade',
    'Jason','Connor','Mike','Gary','Dave','Shawn','Neil','Vance','Brett','Derek',
    'Shane','Lance','Todd','Denny','Clint','David','Matt','Blake','Carson','Logan',
    'Jeb','Earl','Floyd','Lonnie','Doyle','Merle','Dwayne','Leroy','Clyde','Gus',
    'Scotty','Robby','Donnie','Kenny','Rusty','Buddy','Grady','Tucker','Knox','Reid',

    // Expanded
    'Liam','Noah','Oliver','Elijah','James','William','Benjamin','Lucas','Henry','Alexander',
    'Mason','Michael','Ethan','Daniel','Jacob','Logan','Jackson','Levi','Sebastian','Mateo',
    'Jack','Owen','Theodore','Aiden','Samuel','Joseph','John','Wyatt','Matthew','Luke',
    'Asher','Carter','Julian','Grayson','Leo','Jayden','Gabriel','Isaac','Lincoln','Anthony',

    'Max','Eli','Ian','Kai','Zane','Jace','Dean','Jude','Troy','Reed',
    'Cole','Beau','Lane','Roy','Clark','Grant','Scott','Brock','Quinn','Tate',
    'Hayes','Jett','Crew','Rhys','Dax','Zeke','Kade','Boone','Trace','Rex',

    'Caleb','Jared','Spencer','Preston','Gage','Branson','Colby','Devin','Casey','Corey',
    'Zack','Tanner','Emmett','Jesse','Marshall','Ricky','Frankie','Leon','Alvin','Harvey',
    'Otis','Vernon','Elmer','Chester','Wallace','Edgar','Milton','Stanley','Howard','Clarence',

    'Bennett','Desmond','Emmett','Finnegan','Hugo','Jasper','Keaton','Lachlan','Magnus','Niall',
    'Orson','Percy','Roscoe','Sullivan','Thatcher','Vaughn','Wesley','Zander','Archer','Beckett',
    'Callum','Ellis','Harlan','Indy','Kellan','Leland','Merritt','Nico','Oakley','Porter',
    'Quincy','Ronan','Soren','Trenton','Ulric','Valen','Wilder','Yates','Zavier'
];

const AI_LAST = [
    'McAllister','Hayes','Whitfield','Duvall','Boone','Cantrell','Phelps','Hargrove',
    'Farris','Holt','Deen','Finch','Dillon','Marsh','Sutton','Holloway','Pruitt',
    'Corley','Hobbs','Cutler','Rideout','Kowalski','Malone','Voss','Dawson','Hensley',
    'Cope','Speed','Bodine','Wallace','Nemechek','Kenseth','Waltrip','Labonte',
    'Earnhardt','Petty','Allison','Yarborough','Pearson','Thomas','Craven','Trickle',
    'Setzer','Pressley','Grissom','Sauter','Lund','Weatherly','Lorenzen','Marcis',
    'Andretti','Mears','Biffle','Burton','Kahne','Truex','Logano','Chastain','Preece','Hemric',

    // Expanded
    'Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez',
    'Hernandez','Lopez','Gonzalez','Wilson','Anderson','Taylor','Moore','Jackson','Martin','Lee',
    'Perez','Thompson','White','Harris','Sanchez','Clark','Ramirez','Lewis','Robinson','Walker',

    'Young','Allen','King','Wright','Scott','Torres','Nguyen','Hill','Flores','Green',
    'Adams','Nelson','Baker','Hall','Rivera','Campbell','Mitchell','Carter','Roberts','Gomez',

    'Phillips','Evans','Turner','Diaz','Parker','Cruz','Edwards','Collins','Reyes','Stewart',
    'Morris','Morales','Murphy','Cook','Rogers','Gutierrez','Ortiz','Morgan','Cooper','Peterson',

    'Bailey','Reed','Kelly','Howard','Ramos','Kim','Cox','Ward','Richardson','Watson',
    'Brooks','Chavez','Wood','James','Bennett','Gray','Mendoza','Ruiz','Hughes','Price',

    'Alvarez','Castillo','Sanders','Patel','Myers','Long','Ross','Foster','Jimenez','Powell',
    'Jenkins','Perry','Russell','Sullivan','Bell','Coleman','Butler','Henderson','Barnes','Gonzales',

    'Fisher','Vasquez','Simmons','Romero','Jordan','Patterson','Alexander','Hamilton','Graham','Reynolds',
    'Griffin','Wallace','West','Cole','Hayden','Stone','Barker','Caldwell','Stephens','Lawson',

    'Hawkins','Barrett','Wheeler','Chapman','Fuller','Moss','Cross','Knight','Spencer','Hudson',
    'Owens','Bishop','Carpenter','Crawford','Boyd','Mason','Porter','Hunter','Hicks','Dunn'
];

const AI_FIRST_FEMALE = [
    'Hailie','Natalie','Jessica','Ashley','Courtney','Amber','Brittany','Kelley',
    'Danica','Jennifer','Tara','Leilani','Sarah','Megan','Kenzie','Reagan',
    'Caylin','Taylor','Jordan','Peyton','Morgan','Ryann','Brooke','Lindsey',
    'Crystal','Lacey','Shelby','Savannah','Kayla','Caitlin','Erin','Paige',
    'Holly','Donna','Lisa','Tammy','Christy','Stacy','Gina','Renee',
    'Deb','Wanda','Carla','Brenda','Rhonda','Sherry','Vickie','Paula',
    'Regan','Charlene','June','Loretta','Betty','Connie','Angie','Bobbie',
    'Trish','Darla','Roxanne','Nadine',

    // Expanded
    'Olivia','Emma','Ava','Sophia','Isabella','Mia','Charlotte','Amelia','Harper','Evelyn',
    'Abigail','Emily','Ella','Scarlett','Aria','Penelope','Chloe','Layla','Riley','Zoey',
    'Nora','Lily','Eleanor','Hannah','Lillian','Addison','Aubrey','Ellie','Stella','Natalia',

    'Luna','Nova','Ivy','Zoe','Skye','Sage','Blair','Quinn','Lane','Wren',
    'Remi','Ari','Eden','Kai','Noa','Rue','Lux','Bryn','Shae','Vale',

    'Madeline','Paisley','Everly','Emery','Willow','Autumn','Summer','Sienna','Delilah','Adeline',
    'Eliza','Rose','Iris','Jade','Ruby','Alice','Clara','Vivian','Josephine','Naomi',

    'Adelaide','Beatrix','Clementine','Felicity','Genevieve','Imogen','Juniper','Kaia','Liora','Marigold',
    'Nerissa','Ophelia','Rosalind','Seraphina','Tallulah','Verity','Winona','Zinnia',

    'Faith','Hope','Charity','Brandy','Misty','Stormy','Sunny','Daisy','Heidi','Amberly',
    'Kelsey','Whitney','Jamie','Leslie','Robin','Casey','Dana','Shannon','Terry','Kelly'
];

        const MIDDLE_INITIALS = 'ABCDEFGHJKLMNPRSTW'.split('');

        var _JR_CANDIDATES = {};

        function retireDriverAsJrCandidate(driver) {
            if (!driver || !driver.name) return;
            const parts = driver.name.replace(/ Jr\.?$/i, '').trim().split(' ');
            const last = parts[parts.length - 1];
            if (!last || last.length < 2) return;
            if (!_JR_CANDIDATES[last]) _JR_CANDIDATES[last] = [];
            if (!_JR_CANDIDATES[last].includes(driver.name)) {
                _JR_CANDIDATES[last].push(driver.name);
            }
        }

        function checkAndLinkFamily(state, newDriver) {
            if (!state || !state.drivers) return;
            // strip jr/sr and middle initials to get actual last name
            var _stripped = newDriver.name.replace(/\s+Jr\.?\s*$|\s+Sr\.?\s*$/i, '').trim();
            var _parts = _stripped.split(' ');
            var last = _parts[_parts.length - 1];
            // H. at the end means real last name is before it
            if (last && last.match(/^[A-Z]\.?$/) && _parts.length > 1) last = _parts[_parts.length - 2];
            if (!last || last.length <= 2) return;
            var relatives = state.drivers.filter(function(d) {
                if (d.name === newDriver.name || !d.active) return false;
                var _ds = d.name.replace(/\s+Jr\.?\s*$|\s+Sr\.?\s*$/i, '').trim().split(' ');
                var _dl = _ds[_ds.length - 1];
                if (_dl && _dl.match(/^[A-Z]\.?$/) && _ds.length > 1) _dl = _ds[_ds.length - 2];
                return _dl === last;
            });
            if (!relatives.length) return;
            // most same surnames are coincidence, 22% chance theyre actually related
            if (Math.random() > 0.22) return;
            newDriver._familyName = last;
            newDriver._familyMembers = relatives.map(function(d) { return d.name; });
            // same home state
            var relWithState = relatives.find(function(d) { return d.homeState; });
            if (relWithState && !newDriver.homeState) newDriver.homeState = relWithState.homeState;
            // tell the existing relatives about the new one
            relatives.forEach(function(d) {
                d._familyMembers = d._familyMembers || [];
                if (!d._familyMembers.includes(newDriver.name)) d._familyMembers.push(newDriver.name);
                d._familyName = d._familyName || last;
            });
            // 60% chance this generates some paddock chatter
            if (state.dramaQueue && Math.random() < 0.60) {
                var rel = relatives[rand(0, relatives.length - 1)];
                var relType = Math.random() < 0.5 ? 'brother' : Math.random() < 0.5 ? 'cousin' : 'uncle';
                var lines = [
                    newDriver.name + ' has entered the series. Word in the paddock is they\'re ' + rel.name + '\'s ' + relType + '. The ' + last + ' family just got bigger on the grid.',
                    'Another ' + last + ' in the field — ' + newDriver.name + ', who is apparently ' + rel.name + '\'s ' + relType + '. Family business.',
                    'The ' + last + ' name is becoming a fixture around here. ' + newDriver.name + ' is the latest — ' + rel.name + '\'s ' + relType + ' by all accounts.',
                    rel.name + '\'s ' + relType + ' ' + newDriver.name + ' has signed on. Two ' + last + 's on the entry list is going to make the race programs interesting.',
                ];
                state.dramaQueue.push({
                    id: 'family_arrival_' + uid(),
                    title: '👨‍👦 The ' + last + ' Family',
                    effect: 'none',
                    desc: lines[rand(0, lines.length - 1)],
                    valence: 'neutral',
                });
            }
        }

        function generateAIName() {
            var intlRegions = ['Europe', 'Asia', 'Africa', 'South America', 'Central America', 'Australia'];
            if (Math.random() < 0.15) {
                var region = intlRegions[Math.floor(Math.random() * intlRegions.length)];
                var intlName = generateIntlName(region);
                if (intlName) return intlName;
            }
            const isFemale = Math.random() < 0.10;
            const firstPool = isFemale ? AI_FIRST_FEMALE : AI_FIRST;
            const first = firstPool[rand(0, firstPool.length - 1)];
            const last = AI_LAST[rand(0, AI_LAST.length - 1)];
            const middle = Math.random() < 0.20 ? ` ${MIDDLE_INITIALS[rand(0, MIDDLE_INITIALS.length - 1)]}.` : '';
            let name = `${first}${middle} ${last}`;
            if (!isFemale) {
                const hasFather = _JR_CANDIDATES[last] && _JR_CANDIDATES[last].length > 0;
                if (hasFather) {
                    if (Math.random() < 0.55) name = name + ' Jr.';
                } else if (Math.random() < 0.05) {
                    name = name + ' Jr.';
                }
            }
            return name;
        }

        // result parser
        // Parses pasted iRacing results into structured finish order.

        // Supports TWO formats:

        // FORMAT A — Online race copy-paste (license-letter separator per driver):
        //   R               ← lone license letter starts each block
        //   2.98 / +0.14    ← SR/iR noise
        //   Dale Earnhardt Jr.
        //   12              ← car number
        //   Running / -0:00.453 / 0:17.886 / Lap 2 / 35L / Led 0L / 042

        // FORMAT B — Offline AI results table (each driver = one run of lines, NO
        //   license-letter separator; name appears as a clean "First Last" line
        //   between a car-number line and the stats lines):
        //   Nigel Pattinson         ← driver name (2+ words, all caps start, no digits)
        //   2                       ← car number
        //   1                       ← car class / start
        //   ---                     ← P1 gap marker
        //   Running                 ← status
        //   0:17.868                ← best lap time
        //   Lap 7                   ← best lap number
        //   35L                     ← laps completed
        //   Led 35L                 ← laps led
        //   043                     ← concatenated inc+pts+aggpts (noise)

        // The parser auto-detects which format is present.

        function parseRaceResults(raw, isMultiClass) {
            if (isMultiClass === undefined) isMultiClass = false;
            const lines = raw.split(/\n/).map(l => l.trim()).filter(Boolean);
            const results = [];

            // shared helpers
            const LICENSE_LETTER_RE = /^[RDCPBA]$/;

            // Words that can never be part of a driver name
            const NOISE = new Set([
                'running', 'disconnected', 'laps', 'lap', 'led', 'lapped', 'inc', 'incident',
                'started', 'finished', 'class', 'overall', 'pos', 'position', 'gap', 'interval',
                'behind', 'down', 'total', 'avg', 'best', 'time', 'pts', 'points', 'dns', 'dnf',
                'dsq', 'dq', 'nc', 'car', 'chassis', 'team', 'manufacturer', 'make', 'model',
                'vehicle', 'status', 'division', 'div', 'license', 'rating', 'safety', 'fastest',
                'view', 'start', 'bmw', 'm2', 'cs', 'racing', 'ferrari', 'porsche', 'lamborghini',
                'mclaren', 'aston', 'martin', 'honda', 'toyota', 'ford', 'chevrolet', 'chevy',
                'dodge', 'nissan', 'hyundai', 'subaru', 'cup', 'gt3', 'gt4', 'gtp', 'lmp1', 'lmp2',
                'lmp3', 'gtd', 'gtdpro', 'tcr', 'arca', 'nascar', 'global', 'north', 'south', 'east',
                'west', 'america', 'europe', 'asia', 'pacific', 'the', 'and', 'for', 'with', 'from',
            ]);

            const COUNTRIES = new Set([
                'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Armenia', 'Australia', 'Austria',
                'Azerbaijan', 'Bahrain', 'Bangladesh', 'Belarus', 'Belgium', 'Bolivia', 'Brazil',
                'Bulgaria', 'Cambodia', 'Canada', 'Chile', 'China', 'Colombia', 'Croatia', 'Cuba',
                'Cyprus', 'Denmark', 'Ecuador', 'Egypt', 'Estonia', 'Finland', 'France', 'Georgia',
                'Germany', 'Ghana', 'Global', 'Greece', 'Guatemala', 'Honduras', 'Hungary', 'India',
                'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan',
                'Kazakhstan', 'Kenya', 'Kosovo', 'Latvia', 'Lebanon', 'Lithuania', 'Luxembourg',
                'Malaysia', 'Mexico', 'Moldova', 'Montenegro', 'Morocco', 'Netherlands', 'Nigeria',
                'Norway', 'Pakistan', 'Panama', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal',
                'Romania', 'Russia', 'Saudi', 'Serbia', 'Singapore', 'Slovakia', 'Slovenia', 'Spain',
                'Sweden', 'Switzerland', 'Taiwan', 'Thailand', 'Turkey', 'Ukraine', 'Wales', 'Scotland',
                'England', 'Korea', 'Africa', 'Kingdom', 'States', 'Zealand', 'Hong', 'Kong', 'UAE',
                'SouthKorea', 'SouthAfrica', 'UnitedKingdom', 'UnitedStates', 'NewZealand',
            ]);

            function isNameLine(line) {
                if (!line || line.length < 4) return false;
                if (/^\d+$/.test(line)) return false;
                if (/^[+-]\d+\.?\d*$/.test(line)) return false;
                if (/^\d{1,2}:\d{2}\.\d+$/.test(line)) return false;
                if (/^-\d{0,1}:\d{2}\.\d+$/.test(line)) return false;
                if (/^-{2,}$/.test(line)) return false;
                if (/^\d+L$/i.test(line)) return false;
                if (/^Led \d+L$/i.test(line)) return false;
                if (/^Lap \d+$/i.test(line)) return false;
                if (/^Running$|^Disconnected$|^Disqualified$|^Retired$/i.test(line)) return false;
                if (/^\d{4,}$/.test(line)) return false;
                if (/^[+-]\d+$/.test(line)) return false;
                if (/^-\d+L$/.test(line)) return false;
                if (COUNTRIES.has(line)) return false;
                const lineNoTrailingNum = line.replace(/\d+$/, '').trim();
                if (lineNoTrailingNum.split(/\s+/).every(w => NOISE.has(w.toLowerCase()))) return false;

                const tokens = line.split(/\s+/);
                const nameTokens = tokens.filter(t => {
                    if (!t) return false;
                    if (NOISE.has(t.toLowerCase().replace(/\d/g, ''))) return false;
                    if (COUNTRIES.has(t)) return false;
                    if (!/^[A-Z]/.test(t)) return false;
                    if (!/^[A-Z][a-zA-Z'.-]*\d*$/.test(t)) return false;
                    if (/^(DNF|DQ|DSQ|DNS|NC|Jr|Sr|II|III|IV)$/i.test(t)) return ['Jr', 'Sr', 'II', 'III', 'IV'].some(s => s === t);
                    return true;
                });
                return nameTokens.length >= 2;
            }

            function extractNameFromLine(line) {
                const tokens = line.split(/\s+/);
                const nameTokens = tokens.filter(t => {
                    if (!t) return false;
                    if (NOISE.has(t.toLowerCase().replace(/\d/g, ''))) return false;
                    if (COUNTRIES.has(t)) return false;
                    if (!/^[A-Z]/.test(t)) return false;
                    if (!/^[A-Z][a-zA-Z'.-]*\d*$/.test(t)) return false;
                    if (/^(DNF|DQ|DSQ|DNS|NC)$/i.test(t)) return false;
                    return true;
                });
                if (nameTokens.length < 2) return null;
                let candidate = nameTokens.slice(0, 4).join(' ').replace(/[.,]+$/, '').trim();
                // Strip trailing digits from online usernames (Lopes6 → Lopes)
                candidate = candidate.replace(/\b([A-Z][a-zA-Z]{2,})\d+\b/g, '$1').trim();
                return (candidate.length >= 4 && candidate.length <= 45) ? candidate : null;
            }

            function extractStatsFromBlock(blockLines) {
                const text = blockLines.join('\n');
                // Best lap: shortest M:SS.mmm value (offline uses 0:17.xxx, online uses 1:18.xxx)
                const allLapTimes = [...text.matchAll(/\b(\d{1,2}:\d{2}\.\d{2,4})\b/g)].map(m => m[1]);
                // For offline format there is only one lap time per block; for online there may be avg+best
                const lapTime = allLapTimes.length >= 2 ? allLapTimes[allLapTimes.length - 1]
                    : allLapTimes.length === 1 ? allLapTimes[0] : null;
                const gapMatch = text.match(/^(-\d{0,1}:\d{2}\.\d+|-\d+\.\d{3,})$/m);
                const gap = gapMatch ? gapMatch[1] : null;
                const lapsDown = (text.match(/^(-\d+L)$/m) || [])[1] || null;
                const disconnected = /^Disconnected$/m.test(text);
                const disqualified = /^Disqualified$/m.test(text);
                const retired = /^Retired$/m.test(text);
                const statusMatch = text.match(/\b(DNF|DQ|DSQ|DNS|NC)\b|^DQ[\/\s]/im);
                const rawStatus = statusMatch
                    ? (statusMatch[1] ? statusMatch[1].toUpperCase() : 'DQ')
                    : disconnected ? 'DNF'
                    : disqualified ? 'DNF'
                    : retired ? 'DNF'
                    : null;
                // DQ in iRacing paste = bridge-issued fake DNF (car couldn't continue)
                // DNS = also never started = DNF for our purposes
                // Translate all to DNF so the DNF checkbox ticks, not the DQ checkbox
                const status = (rawStatus === 'DQ' || rawStatus === 'DSQ' || rawStatus === 'DNS') ? 'DNF' : rawStatus;
                return { lapTime, gap: gap || lapsDown || null, status };
            }

            // detect format
            const hasLicenseLetter = lines.some(l => LICENSE_LETTER_RE.test(l));

            
            // FORMAT A — Online: split on license letters
            
            if (hasLicenseLetter) {
                const groups = [];
                let current = null;
                for (const line of lines) {
                    if (LICENSE_LETTER_RE.test(line)) {
                        if (current !== null) groups.push(current);
                        current = [];
                    } else if (current !== null) {
                        current.push(line);
                    }
                }
                if (current !== null && current.length) groups.push(current);

                for (const group of groups) {
                    let name = null;
                    let carNumber = null;
                    let nameIdx = -1;
                    for (let gi = 0; gi < group.length; gi++) {
                        const line = group[gi];
                        if (isNameLine(line)) {
                            name = extractNameFromLine(line);
                            nameIdx = gi;
                            if (name) break;
                        }
                    }
                    if (!name) continue;
                    // Car number is typically the line right after the name — a short numeric string
                    if (nameIdx >= 0 && nameIdx + 1 < group.length) {
                        const nextLine = group[nameIdx + 1].trim();
                        if (/^\d{1,3}[a-zA-Z]?$/.test(nextLine)) {
                            carNumber = nextLine;
                        }
                    }
                    const cleaned = name.replace(/(\S+)\d+(\s|$)/g, (m, w, t) => w.length >= 3 ? w + t : m).trim();
                    const finalName = cleaned.split(/\s+/).length >= 2 ? cleaned : name;
                    const { lapTime, gap, status } = extractStatsFromBlock(group);
                    results.push({ name: finalName, lapTime, gap, carClass: null, status, carNumber });
                }
                return results;
            }

            
            // FORMAT B — Offline AI results
            // The offline table pastes as a single blob where each driver's data is a
            // run of consecutive lines. A new driver block starts whenever we see a
            // "name-shaped" line (2+ capitalised words, no numbers/noise).
            //
            // Sample block:
            //   Nigel Pattinson    ← name
            //   2                  ← car #
            //   1                  ← car class / start position
            //   ---                ← P1 gap  (or -0:00.453 for others)
            //   Running            ← status
            //   0:17.868           ← best lap time
            //   Lap 7              ← best lap number
            //   35L                ← laps completed
            //   Led 35L
            //   043                ← concatenated inc+pts+aggpts — NOISE
            

            // Split the line array into per-driver blocks by finding name lines
            const blocks = [];
            let curBlock = null;
            for (const line of lines) {
                if (isNameLine(line)) {
                    if (curBlock) blocks.push(curBlock);
                    curBlock = [line];
                } else if (curBlock) {
                    curBlock.push(line);
                }
                // Lines before the first name are header noise — skip
            }
            if (curBlock && curBlock.length) blocks.push(curBlock);

            for (const block of blocks) {
                const name = extractNameFromLine(block[0]);
                if (!name) continue;
                // Car number is the first line after the name that is a short number
                let carNumber = null;
                for (let bi = 1; bi < Math.min(4, block.length); bi++) {
                    const bl = block[bi].trim();
                    if (/^\d{1,3}[a-zA-Z]?$/.test(bl)) {
                        carNumber = bl;
                        break;
                    }
                }
                const { lapTime, gap, status } = extractStatsFromBlock(block.slice(1));
                results.push({ name, lapTime, gap: gap, carClass: null, status, carNumber });
            }

            return results;
        }