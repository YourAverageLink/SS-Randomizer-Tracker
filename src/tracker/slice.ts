import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { AllTypedOptions } from '../permalink/SettingsTypes';
import { getInitialItems } from '../logic/TrackerModifications';
import { RegularDungeon } from '../logic/Locations';
import { InventoryItem, isItem, itemMaxes } from '../logic/Inventory';
import { Hint } from '../locationTracker/Hints';
import { getStoredTrackerState } from '../LocalStorage';

export interface TrackerState {
    /**
     * Checks we've acquired.
     * Includes regular checks and fake checks for cubes/crystals.
     */
    checkedChecks: string[];
    /**
     * Items we've marked as acquired.
     */
    inventory: Partial<Record<InventoryItem, number>>;
    /**
     * Whether this state has been modified.
     */
    hasBeenModified: boolean;
    /**
     * Exits we've has mapped. Later merged with the vanilla connections depending on settings.
     */
    mappedExits: Record<string, string | undefined>;
    /**
     * Dungeons we've marked as required.
     */
    requiredDungeons: string[];
    /**
     * Hints by area
     */
    hints: Record<string, Hint | undefined>;
    /**
     * Hints by check name
     */
    checkHints: Record<string, string | undefined>;
    /**
     * Fully decoded settings.
     */
    settings: Partial<AllTypedOptions>;
    /**
     * A plaintext text area for the user to track hints.
     */
    userHintsText: string;
}

const initialState: TrackerState = {
    checkedChecks: [],
    inventory: {},
    hasBeenModified: false,
    mappedExits: {},
    requiredDungeons: [],
    hints: {},
    checkHints: {},
    settings: {},
    userHintsText: "",
};

export function preloadedTrackerState(): TrackerState {
    return { ...initialState, ...getStoredTrackerState() };
}

const trackerSlice = createSlice({
    name: 'tracker',
    initialState,
    reducers: {
        clickItem: (
            state,
            action: PayloadAction<{ item: InventoryItem; take: boolean }>,
        ) => {
            const { item, take } = action.payload;
            if (!isItem(item)) {
                throw new Error(`bad item ${item as string}`);
            }
            if (item === 'Sailcloth') {
                return;
            }

            const max = itemMaxes[item];
            const count = state.inventory[item] ?? 0;
            let newCount = take ? count - 1 : count + 1;
            if (newCount < 0) {
                newCount += max + 1;
            } else if (newCount > max) {
                newCount -= max + 1;
            }
            state.hasBeenModified = true;
            state.inventory[item] = newCount;
        },
        clickCheck: (
            state,
            action: PayloadAction<{ checkId: string; markChecked?: boolean }>,
        ) => {
            const { checkId } = action.payload;
            const add = action.payload.markChecked ?? !state.checkedChecks.includes(checkId);
            if (add) {
                state.checkedChecks.push(checkId);
            } else {
                state.checkedChecks = state.checkedChecks.filter(
                    (c) => c !== checkId,
                );
            }
            state.hasBeenModified = true;
        },
        setItemCounts: (
            state,
            action: PayloadAction<{ item: InventoryItem; count: number }[]>,
        ) => {
            for (const {item, count} of action.payload) {
                state.inventory[item] = count;
            }
            state.hasBeenModified = true;
        },
        clickDungeonName: (
            state,
            action: PayloadAction<{ dungeonName: RegularDungeon }>,
        ) => {
            const { dungeonName } = action.payload;
            if (state.requiredDungeons.includes(dungeonName)) {
                state.requiredDungeons = state.requiredDungeons.filter((c) => c !== dungeonName);
            } else {
                state.requiredDungeons.push(dungeonName);
            }
            state.hasBeenModified = true;
        },
        bulkEditChecks: (
            state,
            action: PayloadAction<{ checks: string[]; markChecked: boolean }>,
        ) => {
            const { checks, markChecked } = action.payload;
            const oldChecks = new Set(state.checkedChecks);
            if (markChecked) {
                for (const check of checks) {
                    oldChecks.add(check);
                }
            } else {
                for (const check of checks) {
                    oldChecks.delete(check);
                }
            }
            state.checkedChecks = [...oldChecks];
            state.hasBeenModified = true;
        },
        mapEntrance: (
            state,
            action: PayloadAction<{ from: string; to: string | undefined }>,
        ) => {
            const { from, to } = action.payload;
            state.mappedExits[from] = to;
            state.hasBeenModified = true;
        },
        setHint: (
            state,
            action: PayloadAction<{ areaId: string; hint: Hint | undefined }>,
        ) => {
            const { areaId, hint } = action.payload;
            state.hints[areaId] = hint;
            state.hasBeenModified = true;
        },
        setCheckHint: (
            state,
            action: PayloadAction<{
                checkId: string;
                hint: string | undefined;
            }>,
        ) => {
            const { checkId, hint } = action.payload;
            state.checkHints[checkId] = hint;
            state.hasBeenModified = true;
        },
        setHintsText: (
            state,
            action: PayloadAction<string>
        ) => {
            state.userHintsText = action.payload;
            state.hasBeenModified ||= action.payload !== '';
        },
        acceptSettings: (
            state,
            action: PayloadAction<{ settings: AllTypedOptions }>,
        ) => {
            const { settings } = action.payload;
            state.settings = settings;
        },
        reset: (
            _state,
            action: PayloadAction<{ settings: AllTypedOptions }>,
        ) => {
            const { settings } = action.payload;
            return {
                ...initialState,
                settings: settings,
                inventory: getInitialItems(settings),
            }
        },
        loadTracker: (
            _state,
            action: PayloadAction<TrackerState>,
        ) => {
            return action.payload;
        },
    },
});

export const { clickItem, clickCheck, setItemCounts, clickDungeonName, bulkEditChecks, mapEntrance, acceptSettings, setCheckHint, reset, setHint, setHintsText, loadTracker } = trackerSlice.actions;

export default trackerSlice.reducer;
