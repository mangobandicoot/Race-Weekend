# Race Weekend — iRacing Career RPG



---

Race in iRacing against AI drivers. Start in Mini Stocks and work your way up through Late Models, Trucks, and Xfinity before reaching Cup.

Race Weekend is a career management app for iRacing's AI racing mode. You race in iRacing, enter your results, and the game tracks everything from rivalries, reputation, contracts, championships, and a world that keeps moving whether you're winning or not. Instead of trying to get the app to influence what iRacing does, I decided that iRacing should influence how Race Weekend works.

## Highlights

**Dynamic AI.** Your rivals remember incidents and close finishes. Push the wrong driver too many times and it stops being just between the two of you.

**Fully generated rosters every week.**  Each race gets a unique field with real car numbers and custom liveries. You'll see the same faces week after week, and for big events, drivers from other series show up to fill out the grid.

**A living world.** Everyone on that grid is trying to move up, not just you. If you're not taking the points, someone else is.

**Flag simulation.** Race Weekend runs in the background during your race, throwing caution flags and black flagging both AI drivers and the player for violations and failures that iRacing's AI mode doesn't simulate on its own. Cautions come with a reason: a spin in turn 1, something on the front stretch, a car that stopped where it shouldn't. It's not perfect, but it makes a 100 lap race feel like a 100 lap race. 

## What it looks like

![Dashboard](screenshots/dashboard.png)
![Roster](screenshots/roster.png)
![Rivals](screenshots/rivals.png)
![In-Game](screenshots/livries.png)

## Limitations

Currently, the limitations are:

iRacing doesn't export much useful telemetry, so yellow and black flags are either random, or using math to estimate when there should be a flag. Contact detection watches for sudden speed drops combined with steering spikes. If a car loses speed quickly and jerks the wheel at the same time, it logs a contact event. Enough contacts on the same car can trigger a flag. Player mechanical failure actually uses real RPM telemetry from your car to build stress. Money shifts and running at redline accumulate stress. This is the one place real telemetry is used, but other random factors could still trigger a failure. iRacing doesn't offer an option to inject a "meatball flag", so the app will force a DQ in place of a DNF when damage become critical and race-ending.

The app cannot automatically send rosters to each race, so they have to be downloaded before each race, which will remove drivers skipping that week, or add drivers who are joining from other series. Downloading a fresh roster each week is the simplest approach, as it automatically handles drivers skipping weeks or guests joining from other series.

Likewise, results must be manually copied and pasted from the "view results" after the race ends. While the bridge can detect the finish order, it lacks the information to register close races or incidents with other drivers. I explored using the bridge to detect results automatically but removed it due to these limitations. It may be possible to export the race .json and have the app detect it from a folder automatically, but that's not something I explored.

iRacing only has spec cars, meaning all cars are 100% drivable before races and cannot be influenced by other apps. The "repair damage" pop-up after the race will show damage that doesn't transmit to iRacing. This damage also doesnt come from iRacing, but instead uses natural degredation of parts each race. Incidents reported after each race also contribute to damage numhers, so driving hard but careful pays off. Untreated damage has a chance of post-race inspection failing in Race Weekend, triggering a DQ. So while you can get away with not repairing damage, the more it goes untreated, the higher the chance of DQ.

## Getting started

1. Download the latest release from the [Releases](https://github.com/mangobandicoot/Race-Weekend/releases) page
2. Run `RaceWeekend-setup.exe` or use the portable version
3. Enter your name exactly as it appears in iRacing and choose your home region to weigh your schedule toward local tracks
4. Sign a contract and head to the Roster page to export your field for the week
5. In iRacing, create an AI race, import the roster file, and set up your session how you want or following the generated schedule
6. Race, then come back and enter your result

## Requirements

- [iRacing](https://www.iracing.com/) subscription
- Windows 10/11
- Bridge component (included) for flag simulation; can be disabled in settings
- Designed for iRacing's AI offline mode, the bridge connects to your local iRacing instance and works in offline sessions. It may also work in private hosted sessions, though this has not been fully tested.
- Can also be used to track a career in a private league or against friends online by entering results manually.

## Known Issues

**Post-race screen reappears.** After closing the repair modal, the post-race summary briefly reappears before dismissing. This doesn't affect results or functionality and should be addressed in a minor update.

**Incident filtering shows all drivers.** When entering incidents after a race, the search pulls from all drivers you've ever encountered rather than just the drivers in that race.

**AI car number conflicts.** If an AI driver's stored number matches your reserved car number, iRacing may assign them a random number instead of the app cleanly reassigning it. Mostly resolved but edge cases remain.

**White or unpainted cars.** Occasionally an AI car will appear unpainted in iRacing. Again, mostly fixed, but edge cases remain. 


Feel free to [submit any bugs you encounter](https://github.com/mangobandicoot/Race-Weekend/issues) or send an email to [Support](mailto:RaceWeekend@proton.me?subject=Race%20Weekend%20Support)

## Notes

**Privacy.** Race Weekend makes no network calls. Everything runs locally. Your save file stays on your machine, and the only external connection is the bridge talking to iRacing on localhost. **There is now a NOFLAGS version which disables the flag injection entirely, for those who prefer it.**

**Built with AI assistance.** The app was conceived and designed by me. Claude (Anthropic) was used extensively during development to help write and debug code.

## Getting involved

🐛 **Found a bug?** Open an issue on GitHub.

💡 **Have an idea?** Feature requests are welcome

## License

MIT License. Do whatever you want with it.
