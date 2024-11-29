import { setCounterBasis, setEnabledSemilogicTricks, setTrickSemiLogic } from './customization/slice';
import { RemoteReference, getAndPatchLogic } from './loader/LogicLoader';
import { InventoryItem, itemMaxes } from './logic/Inventory';
import { LogicalState } from './logic/Locations';
import { logicSelector } from './logic/selectors';
import { loadLogic } from './logic/slice';
import { defaultSettings } from './permalink/Settings';
import { AllTypedOptions, TypedOptions } from './permalink/SettingsTypes';
import { RootState, Store, createStore } from './store/store';
import {
    allSettingsSelector,
    areasSelector,
    checkSelector,
    entrancePoolsSelector,
    exitsSelector,
    rawItemCountSelector,
    totalCountersSelector,
} from './tracker/selectors';
import {
    acceptSettings,
    clickCheck,
    clickDungeonName,
    clickItem,
    mapEntrance,
    reset,
    setCheckHint,
    setItemCounts,
} from './tracker/slice';
import fs from 'node:fs';

const main: RemoteReference = {
    type: 'forkBranch',
    author: 'ssrando',
    repoName: 'ssrando',
    branch: 'main',
}

describe('full logic tests', () => {
    let store: Store;
    let defaultSet: AllTypedOptions;

    beforeAll(async () => {
        store = createStore();

        const loader = async (fileName: string) => {
            if (fileName.includes('presets')) {
                return "{}";
            }
            return await fs.promises.readFile(
                `./testData/${fileName}`,
                'utf-8',
            );
        }
            
        const [logic, options] = await getAndPatchLogic(loader);
        defaultSet = defaultSettings(options);
        store.dispatch(loadLogic({ logic, options, presets: {}, remote: main, remoteName: 'ssrando/main' }));
    });

    // Before each test, must reset our tracker to default
    beforeEach(() => {
        store.dispatch(reset({ settings: defaultSet }))
    });

    /**
     * Read the value of a selector. The result is not reactive,
     * so for updated state you must read again after dispatching any actions.
     */
    function readSelector<T>(selector: (state: RootState) => T): T {
        return selector(store.getState());
    }

    function tryFindCheckId(areaName: string, checkName: string) {
        const area = findArea(areaName);
        return (
            area.checks.find((c) => c.includes(checkName)) ??
            area.extraChecks.tr_cube?.find((c) => c.includes(checkName)) ??
            area.extraChecks.gossip_stone?.find((c) => c.includes(checkName))
        );
    }

    /**
     * Check that a check of the given name exists in the area, and return its id.
     */
    function findCheckId(areaName: string, checkName: string) {
        const check = tryFindCheckId(areaName, checkName);
        expect(check).toBeDefined();
        return check!;
    }

    /**
     * Finds an area by name and asserts that it exists.
     */
    function findArea(areaName: string) {
        const area = readSelector(areasSelector).find((a) => a.name === areaName)!;
        expect(area).toBeDefined();
        return area;
    }

    /**
     * Asserts that a given exit exists and is randomized.
     */
    function findExit(areaName: string, exitName: string) {
        const area = findArea(areaName);
        const exitId = area.exits.find((e) => e.includes(exitName));
        expect(exitId).toBeTruthy();
        const exit = readSelector(exitsSelector).find((e) => e.exit.id === exitId);
        expect(exit).toBeDefined();
        return exit!;
    }

    /**
     * Asserts that a given exit is not randomized and thus
     * doesn't appear in the given area's exits.
     */
    function expectExitAbsent(areaName: string, exitName: string) {
        const area = findArea(areaName);
        const exitId = area.exits.find((e) => e.includes(exitName));
        expect(exitId).toBeUndefined();
    }

    /**
     * Asserts that a given exit exists, is randomized, can be assigned,
     * and returns its list of possible entrances.
     */
    function getExitPool(areaName: string, exitName: string) {
        const pools = readSelector(entrancePoolsSelector);
        const exit = findExit(areaName, exitName);
        expect(exit.entrance).toBeUndefined();
        expect(exit.canAssign).toBe(true);
        expect(exit.rule.type).toBe('random');
        if (exit.rule.type !== 'random') {
            throw new Error('unreachable');
        }
        return pools[exit.rule.pool];
    }

    function expectRandomExitIrrelevant(areaName: string, exitName: string) {
        const exit = findExit(areaName, exitName);
        expect(exit.entrance).toBeUndefined();
        expect(exit.canAssign).toBe(true);
        expect(exit.rule.type).toBe('random');
        if (exit.rule.type !== 'random') {
            throw new Error('unreachable');
        }
        expect(exit.rule.isKnownIrrelevant).toBe(true);
    }

    function findEntranceId(areaName: string, entranceName: string) {
        const logic = readSelector(logicSelector);
        const entrance = Object.entries(logic.areaGraph.entrances).find(
            ([id, e]) =>
                logic.areaGraph.entranceHintRegions[id] === areaName &&
                e.short_name.includes(entranceName),
        );
        const id = entrance?.[0];
        expect(id).toBeTruthy();
        return id;
    }

    /**
     * Check that a check of the given name *does not* exist in the area (most likely is banned).
     * To protect against typos, you should also verify that the check exists with different settings.
     */
    function expectCheckAbsent(areaName: string, checkName: string) {
        const check = tryFindCheckId(areaName, checkName);
        expect(check).toBeUndefined();
    }

    /** Set a particular settings value. */
    function updateSettings<K extends keyof TypedOptions>(option: K, value: TypedOptions[K]) {
        const settings = { ...readSelector(allSettingsSelector), [option]: value };
        store.dispatch(acceptSettings({ settings }));
    }

    /** Set a particular settings value. */
    function updateSettingsWithReset<K extends keyof TypedOptions>(option: K, value: TypedOptions[K]) {
        const settings = { ...readSelector(allSettingsSelector), [option]: value };
        store.dispatch(reset({ settings }));
    }

    function updateSettingsWithFullInventory() {
        const fullInventory = [];
        for (const [item, count] of Object.entries(itemMaxes)) {
            for (let i = 0; i < count; i++) {
                fullInventory.push({ item: item as InventoryItem, count });
            }
        }
        store.dispatch(setItemCounts(fullInventory));
    }

    function checkState(checkId: string): LogicalState {
        return readSelector(checkSelector(checkId)).logicalState;
    }

    it('has some checks in logic with default settings', () => {
        const fledgesGiftId = findCheckId('Upper Skyloft', 'Fledge\'s Gift');
        expect(checkState(fledgesGiftId)).toBe('inLogic');
    });

    it('supports hint item semilogic', () => {
        const fledgesGiftId = findCheckId('Upper Skyloft', 'Fledge\'s Gift');
        const zeldaClosetGift = findCheckId('Upper Skyloft', 'Zelda\'s Closet');

        // Zelda's Closet is out of logic because it needs clawshots
        expect(checkState(zeldaClosetGift)).toBe('outLogic');

        // But if Fledge's Gift is hinted to be Clawshots...
        store.dispatch(setCheckHint({ checkId: fledgesGiftId, hint: 'Clawshots' }));

        // Then Zelda's Closet is semilogic
        expect(checkState(zeldaClosetGift)).toBe('semiLogic');
    });

    it('supports goddess chests and semilogic', () => {
        const chestName = 'Northeast Island Goddess Chest behind Bombable Rocks';
        const cubeName = 'Goddess Cube at Lanayru Mine Entrance';
        // Goddess chests are excluded by default
        expectCheckAbsent('Sky', chestName);
        expectCheckAbsent('Lanayru Mine', cubeName);

        updateSettings('excluded-locations', []);
        const goddessChest = findCheckId('Sky', chestName);
        const cubeCheck = findCheckId('Lanayru Mine', cubeName);

        expect(checkState(goddessChest)).toBe('outLogic');

        store.dispatch(clickItem({ item: 'Clawshots', take: false }));
        store.dispatch(clickItem({ item: 'Amber Tablet', take: false }));

        // Still out of logic since we still needs bombs to access the chest itself,
        // even if we can access the cube
        expect(checkState(goddessChest)).toBe('outLogic');

        // With bombs, it's semilogic
        store.dispatch(clickItem({ item: 'Bomb Bag', take: false }));
        expect(checkState(goddessChest)).toBe('semiLogic');

        store.dispatch(clickCheck({ checkId: cubeCheck }));

        // And once we collect the cube, the chest is in logic
        expect(checkState(goddessChest)).toBe('inLogic');;
    });

    it('bans goddess chest if cube is in EUD Skyview', () => {
        const chestName = 'Lumpy Pumpkin\\Goddess Chest on the Roof';
        const cubeName = 'Goddess Cube in Skyview Spring';

        updateSettings('excluded-locations', []);
        updateSettings('empty-unrequired-dungeons', true);
        expectCheckAbsent('Sky', chestName);
        expectCheckAbsent('Skyview', cubeName);

        // Either EUD is off
        updateSettings('empty-unrequired-dungeons', false);
        findCheckId('Sky', chestName);
        findCheckId('Skyview', cubeName);

        // Or SV is required
        updateSettings('empty-unrequired-dungeons', true);
        store.dispatch(clickDungeonName({ dungeonName: 'Skyview' }));
        findCheckId('Sky', chestName);
        findCheckId('Skyview', cubeName);
    });

    it('shows or hides Sky Keep depending on settings', () => {
        const skyKeepHidden = () => readSelector(areasSelector).find((a) => a.name === 'Sky Keep')!.hidden;
        expect(skyKeepHidden()).toBe(true);

        updateSettings('randomize-entrances', 'All Surface Dungeons + Sky Keep');
        expect(skyKeepHidden()).toBe(false);

        updateSettings('randomize-entrances', 'All Surface Dungeons');
        expect(skyKeepHidden()).toBe(true);
        updateSettings('randomize-entrances', 'Required Dungeons Separately');
        expect(skyKeepHidden()).toBe(true);

        updateSettings('triforce-shuffle', 'Sky Keep');
        expect(skyKeepHidden()).toBe(false);
        updateSettings('triforce-shuffle', 'Vanilla');
        expect(skyKeepHidden()).toBe(false);
    });

    it('handles countable items', () => {
        const check = findCheckId('Eldin Volcano', 'Chest behind Bombable Wall near Volcano Ascent');
        expect(checkState(check)).toBe('outLogic');

        store.dispatch(clickItem({ item: 'Ruby Tablet', take: false }));
        expect(checkState(check)).toBe('outLogic');
        store.dispatch(clickItem({ item: 'Progressive Beetle', take: false }));
        expect(checkState(check)).toBe('outLogic');
        store.dispatch(clickItem({ item: 'Progressive Beetle', take: false }));
        expect(checkState(check)).toBe('inLogic');
    });

    it('handles semilogic counters', () => {
        const area = findArea('Batreaux\'s House');
        expect(area.numChecksRemaining).toBeGreaterThan(0);
        expect(area.numChecksAccessible).toBe(0);
        const totalCounter = readSelector(totalCountersSelector).numAccessible;

        store.dispatch(setCounterBasis('semilogic'));

        const areaWithSemilogic = findArea('Batreaux\'s House');
        expect(areaWithSemilogic.numChecksRemaining).toBeGreaterThan(0);
        expect(areaWithSemilogic.numChecksAccessible).toBe(2);

        const totalCounterWithSemilogic = readSelector(totalCountersSelector).numAccessible;
        expect(totalCounterWithSemilogic).toBeGreaterThan(totalCounter);

    });

    it('handles starting items', () => {
        expect(readSelector(rawItemCountSelector('Progressive Slingshot'))).toBe(0);
        updateSettingsWithReset('starting-items', ['Progressive Slingshot']);

        expect(readSelector(rawItemCountSelector('Progressive Slingshot'))).toBe(1);
        expect(readSelector(rawItemCountSelector('Progressive Bow'))).toBe(0);
        updateSettingsWithReset('starting-items', ['Progressive Bow']);
        expect(readSelector(rawItemCountSelector('Progressive Slingshot'))).toBe(0);
        expect(readSelector(rawItemCountSelector('Progressive Bow'))).toBe(1);
    });

    it('handles clicking items', () => {
        const click = (take: boolean) => store.dispatch(clickItem({ item: 'Progressive Bow', take }));
        const count = () => readSelector(rawItemCountSelector('Progressive Bow'));
        expect(count()).toBe(0);
        for (let i = 1; i <= 3; i++) {
            click(false);
            expect(count()).toBe(i);
        }

        // Decrement
        click(true);
        expect(count()).toBe(2);
        click(false);
        // Wrap around
        click(false);
        expect(count()).toBe(0);
        // Wrap around
        click(true);
        expect(count()).toBe(3);

    });

    it('handles trick logic', () => {
        updateSettingsWithReset('starting-items', ['Amber Tablet']);
        const cagedRobotCheck = findCheckId('Lanayru Desert', 'Rescue Caged Robot');
        expect(checkState(cagedRobotCheck)).toBe('outLogic');

        // You can get this check with Brakeslide and Ampilus Bomb Toss tricks
        store.dispatch(setTrickSemiLogic(true));
        expect(checkState(cagedRobotCheck)).toBe('trickLogic');

        // Adding a single trick means we no longer consider all tricks by default,
        // so Ampilus Bomb Toss will be missing
        store.dispatch(setEnabledSemilogicTricks(['Brakeslide']))
        expect(checkState(cagedRobotCheck)).toBe('outLogic');

        
        // If one trick is in logic and one is customized for tricklogic, still tricklogic
        updateSettings('enabled-tricks-bitless', ['Lanayru Desert - Ampilus Bomb Toss']);
        expect(checkState(cagedRobotCheck)).toBe('trickLogic');

        // Make sure considered tricks are not considered if the toggle is off
        store.dispatch(setTrickSemiLogic(false));
        expect(checkState(cagedRobotCheck)).toBe('outLogic');

        // If both tricks are in logic, the check is in logic
        updateSettings('enabled-tricks-bitless', ['Lanayru Desert - Ampilus Bomb Toss', 'Brakeslide']);
        expect(checkState(cagedRobotCheck)).toBe('inLogic');
    });

    it('hides gossip stones with known hint distros', () => {
        updateSettingsWithReset('hint-distribution', 'Balanced');
        findCheckId('Faron Woods', 'Gossip Stone in Deep Woods');
        
        updateSettingsWithReset('hint-distribution', 'Remlits Tournament');
        expectCheckAbsent('Faron Woods', 'Gossip Stone in Deep Woods');
    });

    it('handles DER = None', () => {
        updateSettingsWithFullInventory();
        updateSettings('randomize-entrances', 'None');
        expectExitAbsent('Faron Woods', 'Exit to Skyview Temple');
        expectExitAbsent('Central Skyloft', 'Exit to Sky Keep');

        // Dungeon requiredness changes nothing
        store.dispatch(clickDungeonName({ dungeonName: 'Skyview' }));
        expectExitAbsent('Faron Woods', 'Exit to Skyview Temple');
        expect(readSelector(totalCountersSelector).numExitsAccessible).toBe(0);
    });

    it('handles DER = Required Dungeons Separately', () => {
        updateSettingsWithFullInventory();
        updateSettings('randomize-entrances', 'Required Dungeons Separately');
        updateSettings('empty-unrequired-dungeons', false);
        updateSettings('triforce-required', false);
        updateSettings('triforce-shuffle', 'Anywhere');

        // Unrequired dungeon together with all other unrequired dungeons (including Sky Keep)
        expect(getExitPool('Faron Woods', 'Exit to Skyview Temple').entrances.length).toBe(7);
        expect(getExitPool('Central Skyloft', 'Exit to Sky Keep').entrances.length).toBe(7);

        // SV required
        store.dispatch(clickDungeonName({ dungeonName: 'Skyview' }));
        expect(getExitPool('Faron Woods', 'Exit to Skyview Temple').entrances.length).toBe(1);

        // Eldin together with the unrequired dungeons
        expect(getExitPool('Eldin Volcano', 'Exit to Earth Temple').entrances.length).toBe(6);
        
        // Make Sky Keep required
        updateSettings('triforce-required', true);
        updateSettings('triforce-shuffle', 'Sky Keep');

        expect(getExitPool('Eldin Volcano', 'Exit to Earth Temple').entrances.length).toBe(5);
        
        // Skyview required together with Sky Keep
        expect(getExitPool('Faron Woods', 'Exit to Skyview Temple').entrances.length).toBe(2);
        expect(getExitPool('Central Skyloft', 'Exit to Sky Keep').entrances.length).toBe(2);

        // ET marked as uninteresting
        
        expect(readSelector(totalCountersSelector).numExitsAccessible).toBe(7);
        updateSettings('empty-unrequired-dungeons', true);
        expect(readSelector(totalCountersSelector).numExitsAccessible).toBe(2);

        expectRandomExitIrrelevant('Eldin Volcano', 'Exit to Earth Temple');
    });

    it('handles DER = All Surface Dungeons', () => {
        updateSettingsWithFullInventory();
        updateSettings('randomize-entrances', 'All Surface Dungeons');
        updateSettings('empty-unrequired-dungeons', true);
        updateSettings('triforce-required', false);
        updateSettings('triforce-shuffle', 'Anywhere');

        // Unrequired dungeon together with all other unrequired dungeons (excluding Sky Keep)
        expect(getExitPool('Faron Woods', 'Exit to Skyview Temple').entrances.length).toBe(6);
        expectExitAbsent('Central Skyloft', 'Exit to Sky Keep');

        // SV required
        store.dispatch(clickDungeonName({ dungeonName: 'Skyview' }));
        expect(getExitPool('Faron Woods', 'Exit to Skyview Temple').entrances.length).toBe(6);

        // Eldin together with the unrequired dungeons
        expect(getExitPool('Eldin Volcano', 'Exit to Earth Temple').entrances.length).toBe(6);
        
        // Make Sky Keep required
        updateSettings('triforce-required', true);
        updateSettings('triforce-shuffle', 'Sky Keep');

        // Sky Keep still uninteresting
        expect(getExitPool('Faron Woods', 'Exit to Skyview Temple').entrances.length).toBe(6);
        expectExitAbsent('Central Skyloft', 'Exit to Sky Keep');

        expect(readSelector(totalCountersSelector).numExitsAccessible).toBe(6);
    });

    it('handles DER = All Surface Dungeons + Sky Keep', () => {
        updateSettingsWithFullInventory();
        updateSettings('randomize-entrances', 'All Surface Dungeons + Sky Keep');
        updateSettings('empty-unrequired-dungeons', true);
        updateSettings('triforce-required', false);
        updateSettings('triforce-shuffle', 'Anywhere');

        // Unrequired dungeon together with all other unrequired dungeons (including Sky Keep)
        expect(getExitPool('Faron Woods', 'Exit to Skyview Temple').entrances.length).toBe(7);
        expect(getExitPool('Central Skyloft', 'Exit to Sky Keep').entrances.length).toBe(7);

        // SV required
        store.dispatch(clickDungeonName({ dungeonName: 'Skyview' }));
        expect(getExitPool('Faron Woods', 'Exit to Skyview Temple').entrances.length).toBe(7);

        // Eldin together with the other dungeons
        expect(getExitPool('Eldin Volcano', 'Exit to Earth Temple').entrances.length).toBe(7);
        
        // Make Sky Keep required
        updateSettings('triforce-required', true);
        updateSettings('triforce-shuffle', 'Sky Keep');

        // Sky Keep still unchanged
        expect(getExitPool('Faron Woods', 'Exit to Skyview Temple').entrances.length).toBe(7);
        expect(getExitPool('Central Skyloft', 'Exit to Sky Keep').entrances.length).toBe(7);
        expect(readSelector(totalCountersSelector).numExitsAccessible).toBe(7);
    });

    it('handles num accessible exits correctly', () => {
        updateSettings('randomize-entrances', 'All Surface Dungeons + Sky Keep');
        updateSettings('random-start-statues', false);

        store.dispatch(clickItem({ item: 'Stone of Trials', take: false }));
        store.dispatch(clickItem({ item: 'Clawshots', take: false }));

        expect(readSelector(totalCountersSelector).numExitsAccessible).toBe(1);

        store.dispatch(clickItem({ item: 'Clawshots', take: true }));

        store.dispatch(clickItem({ item: 'Amber Tablet', take: false }));
        expect(readSelector(totalCountersSelector).numExitsAccessible).toBe(0);

        store.dispatch(clickItem({ item: 'Emerald Tablet', take: false }));
        expect(readSelector(totalCountersSelector).numExitsAccessible).toBe(0);

        updateSettings('random-start-statues', true);
        expect(readSelector(totalCountersSelector).numExitsAccessible).toBe(2);

        store.dispatch(
            mapEntrance({
                from: findExit('Sky', 'Faron Pillar\\First Time Dive').exit.id,
                to: findEntranceId('Sealed Grounds', 'Sealed Grounds Spiral'),
            }),
        );

        expect(findExit('Sky', 'Faron Pillar\\First Time Dive').entrance).toBeTruthy();
        expect(readSelector(totalCountersSelector).numExitsAccessible).toBe(1);

        store.dispatch(clickItem({ item: 'Clawshots', take: false }));

        // Lanayru Pillar, Sky Keep, Skyview Temple
        expect(readSelector(totalCountersSelector).numExitsAccessible).toBe(3);

        store.dispatch(
            mapEntrance({
                from: findExit('Central Skyloft', 'Exit to Sky Keep').exit.id,
                to: findEntranceId('Sky Keep', 'Bottom Entrance'),
            }),
        );

        store.dispatch(
            mapEntrance({
                from: findExit('Faron Woods', 'Exit to Skyview Temple').exit.id,
                to: findEntranceId('Skyview', 'Main Entrance'),
            }),
        );

        expect(readSelector(totalCountersSelector).numExitsAccessible).toBe(1);
    });

    it('handles random starting entrance in accessible exits count', () => {
        expect(readSelector(totalCountersSelector).numExitsAccessible).toBe(0);
        
        updateSettings('random-start-entrance', 'Any');
        expect(readSelector(totalCountersSelector).numExitsAccessible).toBe(1);
    });
});
