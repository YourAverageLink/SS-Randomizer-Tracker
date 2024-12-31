import { createSelector } from '@reduxjs/toolkit';
import {
    areaGraphSelector,
    logicSelector,
    optionsSelector,
} from '../logic/Selectors';
import type { OptionDefs, TypedOptions } from '../permalink/SettingsTypes';
import type { RootState } from '../store/Store';
import { currySelector } from '../utils/Redux';
import {
    completeTriforceReq,
    doesHintDistroUseGossipStone,
    gotOpeningReq,
    gotRaisingReq,
    hordeDoorReq,
    impaSongCheck,
    runtimeOptions,
    swordsToAdd,
} from '../logic/ThingsThatWouldBeNiceToHaveInTheDump';
import {
    type HintRegion,
    type Check,
    type DungeonName,
    type ExitMapping,
    dungeonNames,
    isDungeon,
    type LogicalState,
    type CheckGroup,
} from '../logic/Locations';
import { type Logic, type LogicalCheck, itemName } from '../logic/Logic';
import {
    cubeCheckToCubeCollected,
    cubeCheckToGoddessChestCheck,
    dungeonCompletionItems,
    goddessChestCheckToCubeCheck,
    sothItemReplacement,
    sothItems,
    triforceItemReplacement,
    triforceItems,
} from '../logic/TrackerModifications';
import * as _ from 'lodash-es';
import { LogicalExpression } from '../logic/bitlogic/LogicalExpression';
import { TimeOfDay } from '../logic/UpstreamTypes';
import {
    type Requirements,
    computeLeastFixedPoint,
    mergeRequirements,
} from '../logic/bitlogic/BitLogic';
import { validateSettings } from '../permalink/Settings';
import { LogicBuilder } from '../logic/LogicBuilder';
import { exploreAreaGraph } from '../logic/Pathfinding';
import { keyData } from '../logic/KeyLogic';
import { BitVector } from '../logic/bitlogic/BitVector';
import { type InventoryItem, itemMaxes } from '../logic/Inventory';
import {
    getAllowedStartingEntrances,
    getEntrancePools,
    getExitRules,
    getExits,
    getUsedEntrances,
} from '../logic/Entrances';
import {
    computeSemiLogic,
    getVisibleTricksEnabledRequirements,
} from '../logic/SemiLogic';
import {
    counterBasisSelector,
    trickSemiLogicSelector,
    trickSemiLogicTrickListSelector,
} from '../customization/Selectors';

const bitVectorMemoizeOptions = {
    memoizeOptions: {
        resultEqualityCheck: (a: BitVector, b: BitVector) =>
            a instanceof BitVector && b instanceof BitVector && a.equals(b),
    },
};

/**
 * Selects the hint for a given area.
 */
export const areaHintSelector = currySelector(
    (state: RootState, area: string) => state.tracker.hints[area],
);

/**
 * All hinted items.
 */
export const checkHintsSelector = (state: RootState) =>
    state.tracker.checkHints;

/**
 * Selects the hinted item for a given check
 */
export const checkHintSelector = currySelector(
    (state: RootState, checkId: string) => state.tracker.checkHints[checkId],
);

/**
 * Selects ALL settings, even the ones not logically relevant.
 */
export const allSettingsSelector = createSelector(
    [optionsSelector, (state: RootState) => state.tracker.settings],
    validateSettings,
);

/**
 * Selects the current logical settings.
 */
export const settingsSelector: (state: RootState) => TypedOptions =
    allSettingsSelector;

/**
 * Selects a particular logical settings value.
 */
export const settingSelector: <K extends keyof TypedOptions>(
    setting: K,
) => (state: RootState) => TypedOptions[K] = currySelector(
    <K extends keyof TypedOptions>(
        state: RootState,
        setting: K,
    ): TypedOptions[K] => settingsSelector(state)[setting],
);

export const rawItemCountsSelector = (state: RootState) =>
    state.tracker.inventory;

/** A map of all actual items to their counts. Since redux only stores partial counts, this ensures all items are present. */
export const inventorySelector = createSelector(
    [rawItemCountsSelector],
    (rawInventory) =>
        _.mapValues(
            itemMaxes,
            (_val, item) => rawInventory[item as InventoryItem] ?? 0,
        ),
    { memoizeOptions: { resultEqualityCheck: _.isEqual } },
);

export const rawItemCountSelector = currySelector(
    (state: RootState, item: InventoryItem) =>
        inventorySelector(state)[item] ?? 0,
);

export const checkedChecksSelector = createSelector(
    [(state: RootState) => state.tracker.checkedChecks],
    (checkedChecks) => new Set(checkedChecks),
);

function getNumLooseGratitudeCrystals(
    logic: Logic,
    checkedChecks: Set<string>,
) {
    return [...checkedChecks].filter(
        (check) => logic.checks[check]?.type === 'loose_crystal',
    ).length;
}

export function getAdditionalItems(
    logic: Logic,
    inventory: Record<InventoryItem, number>,
    checkedChecks: Set<string>,
) {
    const result: Record<string, number> = {};
    // Completed dungeons
    for (const [dungeon, completionCheck] of Object.entries(
        logic.dungeonCompletionRequirements,
    )) {
        if (checkedChecks.has(completionCheck)) {
            result[dungeonCompletionItems[dungeon]] = 1;
        }
    }

    if (inventory['Triforce'] === 3) {
        result[dungeonCompletionItems['Sky Keep']] = 1;
    }

    // If this is a goddess cube check, mark the requirement as checked
    // since this is the requirement used by the goddess chests.
    for (const check of checkedChecks) {
        const cubeCollectedItem = cubeCheckToCubeCollected[check];
        if (cubeCollectedItem) {
            result[cubeCollectedItem] = 1;
        }
    }

    const looseCrystals = getNumLooseGratitudeCrystals(logic, checkedChecks);
    result['Gratitude Crystal'] = looseCrystals;
    return result;
}

export const checkItemsSelector = createSelector(
    [logicSelector, inventorySelector, checkedChecksSelector],
    getAdditionalItems,
    { memoizeOptions: { resultEqualityCheck: _.isEqual } },
);

export const totalGratitudeCrystalsSelector = createSelector(
    [
        logicSelector,
        checkedChecksSelector,
        rawItemCountSelector('Gratitude Crystal Pack'),
    ],
    (logic, checkedChecks, packCount) => {
        const looseCrystalCount = getNumLooseGratitudeCrystals(
            logic,
            checkedChecks,
        );
        return packCount * 5 + looseCrystalCount;
    },
);

export const allowedStartingEntrancesSelector = createSelector(
    [logicSelector, settingSelector('random-start-entrance')],
    getAllowedStartingEntrances,
);

const skyKeepRequiredSelector = (state: RootState) => {
    const settings = settingsSelector(state);
    if (!settings['triforce-required']) {
        return false;
    }
    return settings['triforce-shuffle'] !== 'Anywhere';
};

export const requiredDungeonsSelector = createSelector(
    [
        (state: RootState) => state.tracker.requiredDungeons,
        settingSelector('required-dungeon-count'),
        skyKeepRequiredSelector,
    ],
    (selectedRequiredDungeons, numRequiredDungeons, skyKeepRequired) => {
        // Enforce consistent order
        return dungeonNames.filter((d) =>
            d === 'Sky Keep'
                ? skyKeepRequired
                : numRequiredDungeons === 6 ||
                  selectedRequiredDungeons.includes(d),
        );
    },
);

/**
 * Describes which entrances are available for a given pool (dungeons, silent realms, starting, ...)
 * This is a bit overkill because it keeps all pools available at all times, but it
 * used to be necessary when we allowed context menus to select entrances, since
 * context menus had to be always rendered and there wasn't a way to include
 */
export const entrancePoolsSelector = createSelector(
    [
        areaGraphSelector,
        allowedStartingEntrancesSelector,
        settingSelector('randomize-entrances'),
        settingSelector('randomize-dungeon-entrances'),
        requiredDungeonsSelector,
    ],
    getEntrancePools,
);

const mappedExitsSelector = (state: RootState) => state.tracker.mappedExits;

/** Defines how exits should be resolved. */
export const exitRulesSelector = createSelector(
    [
        logicSelector,
        settingSelector('random-start-entrance'),
        settingSelector('randomize-entrances'),
        settingSelector('randomize-dungeon-entrances'),
        settingSelector('randomize-trials'),
        settingSelector('random-start-statues'),
        settingSelector('empty-unrequired-dungeons'),
        requiredDungeonsSelector,
    ],
    getExitRules,
);

export const exitsSelector = createSelector(
    [logicSelector, exitRulesSelector, mappedExitsSelector],
    getExits,
);

export const exitsByIdSelector = createSelector(
    [exitsSelector],
    (exits) => _.keyBy(exits, (e) => e.exit.id),
)

/**
 * Selects the requirements that depend on state/settings, but should still be revealed during
 * tooltip computations. Any recalculations here will cause the tooltips cache to throw away its
 * cached tooltips and recalculate requirements (after logic has loaded, this is only settings, mapped exits, and required dungeons).
 */
export const settingsRequirementsSelector = createSelector(
    [
        logicSelector,
        optionsSelector,
        settingsSelector,
        exitsSelector,
        requiredDungeonsSelector,
    ],
    mapSettings,
);

function mapSettings(
    logic: Logic,
    options: OptionDefs,
    settings: TypedOptions,
    exits: ExitMapping[],
    requiredDungeons: string[],
) {
    const requirements: Requirements = {};
    const b = new LogicBuilder(logic.allItems, logic.itemLookup, requirements);

    for (const option of runtimeOptions) {
        const [item, command, expect] = option;
        const val = settings[command];
        const match =
            val !== undefined &&
            (typeof expect === 'function' ? expect(val) : expect === val);
        if (match) {
            console.log('setting', item);
            b.set(item, b.true());
        }
    }

    // https://github.com/NindyBK/ssrnppbuild/pull/1
    if (logic.itemBits['Lanayru Mining Facility Unrequired'] !== undefined) {
        for (const dungeon of dungeonNames) {
            if (!requiredDungeons.includes(dungeon)) {
                b.trySet(`${dungeon} Unrequired`, b.true());
            } else {
                b.trySet(`${dungeon} Required`, b.true());
            }
        }
    }

    for (const option of options) {
        if (
            option.type === 'multichoice' &&
            (option.command === 'enabled-tricks-glitched' ||
                option.command === 'enabled-tricks-bitless')
        ) {
            const vals = settings[option.command];
            for (const option of vals) {
                b.set(`${option} Trick`, b.true());
            }
        }
    }

    const raiseGotExpr =
        settings['got-start'] === 'Raised'
            ? b.true()
            : b.singleBit(impaSongCheck);
    const neededSwords = swordsToAdd[settings['got-sword-requirement']];
    let openGotExpr = b.singleBit(`Progressive Sword x ${neededSwords}`);
    let hordeDoorExpr = settings['triforce-required']
        ? b.singleBit(completeTriforceReq)
        : b.true();

    const allRequiredDungeonsBits = requiredDungeons.reduce((acc, dungeon) => {
        if (dungeon !== 'Sky Keep') {
            acc.setBit(logic.itemBits[dungeonCompletionItems[dungeon]]);
        }
        return acc;
    }, new BitVector());
    const dungeonsExpr = new LogicalExpression([allRequiredDungeonsBits]);

    if (settings['got-dungeon-requirement'] === 'Required') {
        openGotExpr = openGotExpr.and(dungeonsExpr);
    } else if (settings['got-dungeon-requirement'] === 'Unrequired') {
        hordeDoorExpr = hordeDoorExpr.and(dungeonsExpr);
    }

    b.set(gotOpeningReq, openGotExpr);
    b.set(gotRaisingReq, raiseGotExpr);
    b.set(hordeDoorReq, hordeDoorExpr);

    const mapConnection = (from: string, to: string) => {
        const exitArea = logic.areaGraph.areasByExit[from];
        const exitExpr = b.singleBit(from);

        let dayReq: LogicalExpression;
        let nightReq: LogicalExpression;

        if (exitArea.availability === 'abstract') {
            dayReq = exitExpr;
            nightReq = exitExpr;
        } else if (exitArea.availability === TimeOfDay.Both) {
            dayReq = exitExpr.and(b.singleBit(b.day(exitArea.id)));
            nightReq = exitExpr.and(b.singleBit(b.night(exitArea.id)));
        } else if (exitArea.availability === TimeOfDay.DayOnly) {
            dayReq = exitExpr;
            nightReq = b.false();
        } else if (exitArea.availability === TimeOfDay.NightOnly) {
            dayReq = b.false();
            nightReq = exitExpr;
        } else {
            throw new Error('bad ToD');
        }

        const entranceDef = logic.areaGraph.entrances[to];
        if (entranceDef.allowed_time_of_day === TimeOfDay.Both) {
            b.addAlternative(b.day(to), dayReq);
            b.addAlternative(b.night(to), nightReq);
        } else if (entranceDef.allowed_time_of_day === TimeOfDay.DayOnly) {
            b.addAlternative(to, dayReq);
        } else if (entranceDef.allowed_time_of_day === TimeOfDay.NightOnly) {
            b.addAlternative(to, nightReq);
        } else {
            throw new Error('bad ToD');
        }
    };

    for (const mapping of exits) {
        if (mapping.entrance) {
            mapConnection(mapping.exit.id, mapping.entrance.id);
        }
    }

    return requirements;
}

export const inventoryRequirementsSelector = createSelector(
    [logicSelector, inventorySelector],
    mapInventory,
);

export function mapInventory(logic: Logic, itemCounts: Record<string, number>) {
    const requirements: Requirements = {};
    const b = new LogicBuilder(logic.allItems, logic.itemLookup, requirements);

    for (const [item, count] of Object.entries(itemCounts)) {
        if (
            count === undefined ||
            item === 'Sailcloth' ||
            item === 'Tumbleweed'
        ) {
            continue;
        }
        if (item === sothItemReplacement) {
            for (let i = 1; i <= count; i++) {
                b.set(sothItems[i - 1], b.true());
            }
        } else if (item === triforceItemReplacement) {
            for (let i = 1; i <= count; i++) {
                b.set(triforceItems[i - 1], b.true());
            }
        } else {
            for (let i = 1; i <= count; i++) {
                b.set(itemName(item, i), b.true());
            }
        }
    }

    return requirements;
}

export const checkRequirementsSelector = createSelector(
    [logicSelector, checkItemsSelector],
    mapInventory,
);

export const inLogicBitsSelector = createSelector(
    [
        logicSelector,
        settingsRequirementsSelector,
        inventoryRequirementsSelector,
        checkRequirementsSelector,
    ],
    (logic, settingsRequirements, inventoryRequirements, checkRequirements) =>
        computeLeastFixedPoint(
            'Logical state',
            mergeRequirements(
                logic.numRequirements,
                logic.staticRequirements,
                settingsRequirements,
                inventoryRequirements,
                checkRequirements,
            ),
        ),
    bitVectorMemoizeOptions,
);

const optimisticInventoryItemRequirementsSelector = createSelector(
    [logicSelector],
    (logic) => mapInventory(logic, itemMaxes),
);

/**
 * A selector that computes logical state as if you had gotten every item.
 * Useful for checking if something is out of logic because of missing
 * items or generally unreachable because of missing entrances.
 */
export const optimisticLogicBitsSelector = createSelector(
    [
        logicSelector,
        settingsRequirementsSelector,
        optimisticInventoryItemRequirementsSelector,
        // TODO this should probably also treat all check requirements as available? E.g. dungeons completed, cubes gotten?
        checkRequirementsSelector,
        inLogicBitsSelector,
    ],
    (
        logic,
        settingsRequirements,
        optimisticInventoryRequirements,
        checkRequirements,
        inLogicBits,
    ) =>
        computeLeastFixedPoint(
            'Optimistic state',
            mergeRequirements(
                logic.numRequirements,
                logic.staticRequirements,
                settingsRequirements,
                optimisticInventoryRequirements,
                checkRequirements,
            ),
            inLogicBits,
        ),
    bitVectorMemoizeOptions,
);

export const skyKeepNonprogressSelector = createSelector(
    [settingsSelector],
    (settings) =>
        settings['empty-unrequired-dungeons'] === true &&
        (settings['triforce-required'] === false ||
            settings['triforce-shuffle'] === 'Anywhere'),
);

export const areaNonprogressSelector = createSelector(
    [
        skyKeepNonprogressSelector,
        settingSelector('empty-unrequired-dungeons'),
        requiredDungeonsSelector,
    ],
    (skyKeepNonprogress, emptyUnrequiredDungeons, requiredDungeons) => {
        return (area: string) =>
            area === 'Sky Keep'
                ? skyKeepNonprogress
                : emptyUnrequiredDungeons && isDungeon(area)
                    ? !requiredDungeons.includes(area)
                    : false;
    },
);

export const areaHiddenSelector = createSelector(
    [
        areaNonprogressSelector,
        settingSelector('randomize-entrances'),
        settingSelector('randomize-dungeon-entrances'),
    ],
    (areaNonprogress, randomEntranceSetting, randomDungeonEntranceSetting) => {
        const dungeonEntranceSetting =
            randomDungeonEntranceSetting ?? randomEntranceSetting;
        return (area: string) =>
            areaNonprogress(area) &&
            (!isDungeon(area) ||
                (area === 'Sky Keep' &&
                    dungeonEntranceSetting !==
                        'All Surface Dungeons + Sky Keep'));
    },
);

export const isCheckBannedSelector = createSelector(
    [
        logicSelector,
        areaNonprogressSelector,
        settingSelector('excluded-locations'),
        settingSelector('rupeesanity'),
        settingSelector('shopsanity'),
        settingSelector('beedle-shopsanity'),
        settingSelector('rupin-shopsanity'),
        settingSelector('luv-shopsanity'),
        settingSelector('tadtonesanity'),
        settingSelector('treasuresanity-in-silent-realms'),
        settingSelector('trial-treasure-amount'),
        settingSelector('hint-distribution'),
    ],
    (
        logic,
        areaNonprogress,
        bannedLocations,
        rupeeSanity,
        shopSanity,
        beedleShopsanity,
        rupinShopSanity,
        luvShopSanity,
        tadtoneSanity,
        silentRealmTreasuresanity,
        silentRealmTreasureAmount,
        hintDistro,
    ) => {
        const bannedChecks = new Set(bannedLocations);
        const rupeesExcluded =
            rupeeSanity === 'Vanilla' || rupeeSanity === false;
        const maxRelics = silentRealmTreasuresanity
            ? silentRealmTreasureAmount
            : 0;
        const banBeedle =
            shopSanity !== undefined
                ? shopSanity !== true
                : beedleShopsanity !== true;
        const banGearShop = rupinShopSanity !== true;
        const banPotionShop = luvShopSanity !== true;

        const trialTreasurePattern = /Relic (\d+)/;
        const isExcessRelic = (check: LogicalCheck) => {
            if (check.type === 'trial_treasure') {
                const match = check.name.match(trialTreasurePattern);
                return match && parseInt(match[1], 10) > maxRelics;
            }
        };

        const isBannedCubeCheckViaChest = (
            checkId: string,
            check: LogicalCheck,
        ) => {
            return (
                check.type === 'tr_cube' &&
                bannedChecks.has(
                    logic.checks[cubeCheckToGoddessChestCheck[checkId]].name,
                )
            );
        };

        const isBannedChestViaCube = (checkId: string) => {
            const cube = goddessChestCheckToCubeCheck[checkId];
            return cube && areaNonprogress(logic.checks[cube].area!);
        };

        const gossipStoneUsed = doesHintDistroUseGossipStone[hintDistro] ?? _.stubTrue;

        return (checkId: string) => {
            const check = logic.checks[checkId];
            return (
                bannedChecks.has(check.name) ||
                areaNonprogress(logic.checks[checkId].area!) ||
                isExcessRelic(check) ||
                isBannedChestViaCube(checkId) ||
                isBannedCubeCheckViaChest(checkId, check) ||
                (rupeesExcluded && check.type === 'rupee') ||
                (banBeedle && check.type === 'beedle_shop') ||
                (banGearShop && check.type === 'gear_shop') ||
                (banPotionShop && check.type === 'potion_shop') ||
                (!tadtoneSanity && check.type === 'tadtone') ||
                (check.type === 'gossip_stone' && !gossipStoneUsed(checkId))
            );
        };
    },
);

const dungeonKeyLogicSelector = createSelector(
    [
        logicSelector,
        settingSelector('logic-mode'),
        settingSelector('boss-key-mode'),
        settingSelector('small-key-mode'),
        settingsRequirementsSelector,
        checkRequirementsSelector,
        isCheckBannedSelector,
        optimisticLogicBitsSelector,
    ],
    keyData,
);

/** A selector for the requirements that assume every trick enabled in customization is enabled. */
const visibleTricksRequirementsSelector = createSelector(
    [
        logicSelector,
        optionsSelector,
        settingsSelector,
        trickSemiLogicTrickListSelector,
    ],
    getVisibleTricksEnabledRequirements,
);

export const inTrickLogicBitsSelector = createSelector(
    [
        logicSelector,
        inLogicBitsSelector,
        settingsRequirementsSelector,
        inventoryRequirementsSelector,
        checkRequirementsSelector,
        visibleTricksRequirementsSelector,
    ],
    (
        logic,
        inLogicBits,
        settingsRequirements,
        inventoryRequirements,
        checkRequirements,
        allTricksRequirements,
    ) =>
        computeLeastFixedPoint(
            'TrickLogic state',
            mergeRequirements(
                logic.numRequirements,
                logic.staticRequirements,
                settingsRequirements,
                inventoryRequirements,
                checkRequirements,
                allTricksRequirements,
            ),
            inLogicBits,
        ),
);

const semiLogicBitsSelector = createSelector(
    [
        logicSelector,
        isCheckBannedSelector,
        checkedChecksSelector,
        inventorySelector,
        inLogicBitsSelector,
        dungeonKeyLogicSelector,
        settingsRequirementsSelector,
        checkHintsSelector,
        trickSemiLogicSelector,
        visibleTricksRequirementsSelector,
    ],
    computeSemiLogic,
);

export const getRequirementLogicalStateSelector = createSelector(
    [logicSelector, inLogicBitsSelector, semiLogicBitsSelector],
    (logic, inLogicBits, semiLogicBits) =>
        (requirement: string): LogicalState => {
            const bit = logic.itemBits[requirement];
            return inLogicBits.test(bit)
                ? 'inLogic'
                : semiLogicBits.inSemiLogicBits.test(bit)
                    ? 'semiLogic'
                    : semiLogicBits.inTrickLogicBits.test(bit)
                        ? 'trickLogic'
                        : 'outLogic';
        },
);

export const dungeonCompletedSelector = currySelector(
    createSelector(
        [
            (_state: RootState, name: DungeonName) => name,
            // This dependency is the wrong way around, I think
            checkItemsSelector,
        ],
        (name, checkItems) => Boolean(checkItems[dungeonCompletionItems[name]]),
    ),
);

export const checkSelector = currySelector(
    createSelector(
        [
            (_state: RootState, checkId: string) => checkId,
            logicSelector,
            getRequirementLogicalStateSelector,
            checkedChecksSelector,
            mappedExitsSelector,
        ],
        (
            checkId,
            logic,
            getRequirementLogicalState,
            checkedChecks,
            mappedExits,
        ): Check => {
            const logicalState = getRequirementLogicalState(checkId);

            if (logic.checks[checkId]) {
                const checkName = logic.checks[checkId].name;
                const shortCheckName = checkName.includes('-')
                    ? checkName.substring(checkName.indexOf('-') + 1).trim()
                    : checkName;
                return {
                    checked: checkedChecks.has(checkId),
                    checkId,
                    checkName: shortCheckName,
                    type: logic.checks[checkId].type,
                    logicalState,
                };
            } else if (logic.areaGraph.exits[checkId]) {
                const shortCheckName =
                    logic.areaGraph.exits[checkId].short_name;
                return {
                    checked: Boolean(mappedExits[checkId]),
                    checkId,
                    checkName: shortCheckName,
                    type: 'exit',
                    logicalState,
                };
            } else {
                throw new Error('unknown check ' + checkId);
            }
        },
    ),
);

export const areasSelector = createSelector(
    [
        logicSelector,
        checkedChecksSelector,
        exitsSelector,
        isCheckBannedSelector,
        getRequirementLogicalStateSelector,
        areaNonprogressSelector,
        areaHiddenSelector,
        counterBasisSelector,
    ],
    (
        logic,
        checkedChecks,
        allExits,
        isCheckBanned,
        getLogicalState,
        isAreaNonprogress,
        isAreaHidden,
        counterBasis,
    ): HintRegion[] => {
        const exitsById = _.keyBy(allExits, (e) => e.exit.id);
        return _.compact(
            logic.hintRegions.map((area): HintRegion | undefined => {
                const checks = logic.checksByHintRegion[area];
                // Loose crystal checks can be banned to not require picking them up
                // in logic, but we want to allow marking them as collected.
                const progressChecks = checks.filter(
                    (check) =>
                        !isCheckBanned(check) ||
                        logic.checks[check].type === 'loose_crystal',
                );

                const [extraChecks, regularChecks_] = _.partition(
                    progressChecks,
                    (check) =>
                        logic.checks[check].type === 'gossip_stone' ||
                        logic.checks[check].type === 'tr_cube' ||
                        logic.checks[check].type === 'loose_crystal',
                );

                const nonProgress = isAreaNonprogress(area);
                const hidden = isAreaHidden(area);
                const regularChecks = nonProgress ? [] : regularChecks_;
                const shouldCount = (state: LogicalState) =>
                    counterBasis === 'logic'
                        ? state === 'inLogic'
                        : state !== 'outLogic';

                const checkGroup = (checks: string[]): CheckGroup => {
                    const nonBannedChecks = checks.filter((c) => !isCheckBanned(c));
                    const remaining = nonBannedChecks.filter(
                        (c) => !checkedChecks.has(c),
                    );
                    const accessible = remaining.filter((c) =>
                        shouldCount(getLogicalState(c)),
                    );
                    return {
                        // Intentionally include banned but shown checks in the list
                        // of checks, but do not count them anywhere!
                        list: checks,
                        numTotal: nonBannedChecks.length,
                        numAccessible: accessible.length,
                        numRemaining: remaining.length,
                    };
                };

                const extraLocations = _.mapValues(
                    _.groupBy(
                        extraChecks,
                        (check) => logic.checks[check].type,
                    ),
                    checkGroup,
                );

                const relevantExits = logic.exitsByHintRegion[area].filter((e) => {
                    const exitMapping = exitsById[e];
                    if (!exitMapping) {
                        return false;
                    }
                    return (
                        exitMapping.canAssign &&
                        exitMapping.rule.type === 'random'
                    );
                });

                const remainingExits = relevantExits.filter((e) => {
                    const exitMapping = exitsById[e];
                    return !exitMapping.entrance;
                }); 

                const accessibleExits = remainingExits.filter((e) => {
                    const exitMapping = exitsById[e];
                    return (
                        exitMapping.rule.type === 'random' &&
                        !exitMapping.rule.isKnownIrrelevant &&
                        shouldCount(getLogicalState(e))
                    );
                }); 

                extraLocations.exits = {
                    list: relevantExits,
                    numAccessible: accessibleExits.length,
                    numRemaining: remainingExits.length,
                    numTotal: relevantExits.length,
                } satisfies CheckGroup;

                return {
                    checks: checkGroup(regularChecks),
                    extraLocations,
                    nonProgress,
                    hidden,
                    name: area,
                };
            }),
        );
    }
);

export const totalCountersSelector = createSelector(
    [areasSelector, exitsByIdSelector],
    (areas, exits) => {
        const numChecked = _.sumBy(
            areas,
            (a) => a.checks.numTotal - a.checks.numRemaining,
        );
        const numAccessible = _.sumBy(areas, (a) => a.checks.numAccessible);
        const numRemaining = _.sumBy(areas, (a) => a.checks.numRemaining);
        let numExitsAccessible = _.sumBy(areas, (a) => a.extraLocations.exits?.numAccessible ?? 0);

        const startMapping = exits['\\Start'];
        const needsStartingEntrance = !startMapping.entrance;
        if (needsStartingEntrance) {
            numExitsAccessible++;
        }
        return {
            numChecked,
            numAccessible,
            numRemaining,
            numExitsAccessible,
        };
    },
);

export const usedEntrancesSelector = createSelector(
    [entrancePoolsSelector, exitsSelector],
    getUsedEntrances,
);

export const inLogicPathfindingSelector = createSelector(
    [areaGraphSelector, exitsSelector, inLogicBitsSelector],
    exploreAreaGraph,
);

export const optimisticPathfindingSelector = createSelector(
    [areaGraphSelector, exitsSelector, optimisticLogicBitsSelector],
    exploreAreaGraph,
);
