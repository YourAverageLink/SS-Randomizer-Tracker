# Skyward Sword Randomizer Tracker
[![Discord](https://discordapp.com/api/guilds/767090759773323264/embed.png?style=shield)](https://discord.gg/evpNKkaaw6)

Web based tracker for the [Skyward Sword Randomizer](https://github.com/ssrando/ssrando).

## Instances
[Production](https://robojumper.github.io/SS-Randomizer-Tracker/) - the one and only deployed version of this tracker. Directly updated from the default branch of this repository within minutes of merging a Pull Request.

## Usage
When you navigate to the tracker, you will be presented with a UI to fill in your settings. First you need to select the version of your randomizer so that the tracker knows where to load logic from. The version dropdown allows you to select official releases and the latest development build, the "Beta Features" tab can be used if you got a special randomizer build from another source.
These builds will usually contain further instructions.

After selecting a build, you can copy the settings string from the randomizer application and paste it in the tracker. If the versions match up, this automatically sets all settings to their
correct value. You should not need to set any individual settings, though they are provided if you'd like to double check some settings or change them after the fact

The *Launch New Tracker* button will bring you to the main tracker page.

In the center of the tracker is the **Location Tracker**. This is where the randomizer shows you all of the available locations, and info about your current logical state in the seed. Hovering over a check will show what the requirements logically for the check are, and clicking a check will toggle it as checked/unchecked. The location tracker also allows you to connect entrances in case entrance randomization settings are enabled. Try right-clicking the invidual map parts for more shortcuts.

The left side of the tracker contains the **Dungeon Tracker** and the **Inventory** areas. Clicking the name of a dungeon will mark it as required or unrequired. When unrequired dungeons are empty (Empty Unrequired Dungeons), this will also label the dungeons locations as being able to contain progression.

The **Additional Checks** section on the right is populated with exits, unrandomized checks (such as individual crystals) or additional things that are required to unlock randomized locations (such as goddess cubes).

The bottom bar of the tracker contains various controls for the entire tracker. Here, you can export your tracker state to save your progress or import a previous state. Additionally, there are **Customization** options that allow you to configure the colors in the tracker to your liking. For content creators, we recommend using *Dark Mode* along with a Chroma Key on your capture window(s) in order to capture the tracker without a background.

The tracker auto-saves its state. You can safely close the tracker and click "Continue Tracker" to continue where you left off.

## Reporting Issues

Ran into a bug? Bugs found in the production instance should be reported [here on GitHub](https://github.com/robojumper/SS-Randomizer-Tracker/issues) or in the Discord.

## Running From Source
Building and running an instance of the tracker locally requires Node v14 and npm. This process will allow you to run any version of the tracker.

1. Clone the repository
2. Install dependcies
```
npm install
```
3. Build and serve the application
```
npm start
```
4. Access the application at http://localhost:5173/

## Shoutouts

Also see the [Acknowledgements](https://robojumper.github.io/SS-Randomizer-Tracker/acknowledgement) page.

- [lepelog](https://github.com/lepelog), [peppernicus](https://github.com/Peppernicus2000), [azer67](https://github.com/azer67) - Creating the [randomizer](https://github.com/ssrando/ssrando)
- [Floha](https://github.com/Floha258), [Kuonino](https://github.com/Kuonino), Extodasher, [CapitanBublo](https://github.com/CapitanBublo), [CovenEsme](https://github.com/covenesme), [YourAverageLink](https://github.com/youraveragelink) - Fellow devs on the tracker
- [wooferzfg](https://github.com/wooferzfg) - Creating [the tracker for The Wind Waker Randomizer](https://github.com/wooferzfg/tww-rando-tracker), from which much of the original logic subsystem in this tracker was derived
- [cjs](https://github.com/cjs8487/) - Creating [the original Skyward Sword Randomizer tracker](https://github.com/cjs8487/SS-Randomizer-Tracker), from which this tracker was originally forked
