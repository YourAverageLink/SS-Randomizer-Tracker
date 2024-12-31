import type { TypedOptions } from '../permalink/SettingsTypes';
import { type InventoryItem, isItem } from './Inventory';
import goddessCubesList_ from '../data/goddessCubes2.json';
import * as _ from 'lodash-es';
import { swordsToAdd } from './ThingsThatWouldBeNiceToHaveInTheDump';
import type { DungeonName } from './Locations';
import type { TrackerState } from '../tracker/Slice';

const collectedCubeSuffix = '_TR_Cube_Collected';

export const goddessChestCheckToCubeCheck = Object.fromEntries(
    goddessCubesList_.map(([chest, cube]) => [chest, cube]),
);
export const cubeCheckToGoddessChestCheck = _.invert(
    goddessChestCheckToCubeCheck,
);
export const cubeCollectedToCubeCheck = Object.fromEntries(
    Object.keys(cubeCheckToGoddessChestCheck).map((check) => [
        mapToCubeCollectedRequirement(check),
        check,
    ]),
);
export const cubeCheckToCubeCollected = _.invert(cubeCollectedToCubeCheck);

export function mapToCubeCollectedRequirement(check: string) {
    return `${check}${collectedCubeSuffix}`;
}

// The rando models some items as individual items, but the tracker just has these as stacks.
// Maybe we could ad-hoc rewrite the logic to model these as stacks, but it doesn't seem worth it.
export const sothItems = [
    'Faron Song of the Hero Part',
    'Eldin Song of the Hero Part',
    'Lanayru Song of the Hero Part',
];

export const sothItemReplacement = 'Song of the Hero';

export const triforceItems = [
    'Triforce of Power',
    'Triforce of Wisdom',
    'Triforce of Courage',
];

export const triforceItemReplacement = 'Triforce';

// Checking a dungeon completion check gives the respective "item"
// so that the "All Required Dungeons Complete" requirement is
// logically fulfilled when the player completes the dungeon, not
// when they gain the ability to do so (semilogic...)
export const dungeonCompletionItems: Record<string, string> = {
    Skyview: '\\Tracker\\Skyview Completed',
    'Earth Temple': '\\Tracker\\Earth Temple Completed',
    'Lanayru Mining Facility': '\\Tracker\\Lanayru Mining Facility Completed',
    'Ancient Cistern': '\\Tracker\\Ancient Cistern Completed',
    Sandship: '\\Tracker\\Sandship Completed',
    'Fire Sanctuary': '\\Tracker\\Fire Sanctuary Completed',
    'Sky Keep': '\\Tracker\\Sky Keep Completed',
} satisfies Record<DungeonName, string>;

export function getInitialItems(
    settings: TypedOptions,
): TrackerState['inventory'] {
    const items: TrackerState['inventory'] = {};
    const add = (item: InventoryItem, count: number = 1) => {
        items[item] ??= 0;
        items[item] += count;
    };
    add('Sailcloth');
    if (settings['starting-tablet-count'] === 3) {
        add('Emerald Tablet');
        add('Ruby Tablet');
        add('Amber Tablet');
    }
    add('Gratitude Crystal Pack', settings['starting-crystal-packs'] ?? 0);
    add('Group of Tadtones', settings['starting-tadtones'] ?? 0);
    add('Empty Bottle', settings['starting-bottles'] ?? 0);

    add(
        'Progressive Sword',
        swordsToAdd[settings['starting-sword'] ?? 'Swordless'],
    );
    const startingItems = settings['starting-items'] ?? [];
    for (const item of startingItems) {
        if (item.includes(sothItemReplacement)) {
            add(sothItemReplacement);
        } else if (item.includes(triforceItemReplacement)) {
            add(triforceItemReplacement);
        } else if (
            isItem(item) &&
            (!item.includes('Pouch') || !items['Progressive Pouch'])
        ) {
            add(item);
        }
    }

    return items;
}
