import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from './store/store';
import { TrackerState } from './tracker/slice';
import { RemoteReference, formatRemote, parseRemote } from './loader/LogicLoader';
import { CounterBasis, CustomizationState, ItemLayout, LocationLayout } from './customization/slice';
import ColorScheme from './customization/ColorScheme';

const trackerStateLocalStorageKey = 'ssrTrackerState';
const customizationStateLocalStorageKey = 'ssrTrackerCustomization';
const remoteLogicLocalStorageKey = 'ssrTrackerRemoteLogic';

// Legacy
const itemLayoutLocalStorageKey = 'ssrTrackerLayout';
const colorSchemeLocalStorageKey = 'ssrTrackerColorScheme';
const locationLayoutLocalStorageKey = 'ssrTrackerLocationLayout';
const trickSemilogicLocalStorageKey = 'ssrTrackerTrickLogic';
const counterBasisLocalStorageKey = 'ssrTrackerCounterBasis';

export function useSyncTrackerStateToLocalStorage() {
    const rawRemote = useSelector((state: RootState) => state.logic.loaded!.remote);
    const trackerState = useSelector((state: RootState) => state.tracker);
    const customizationState = useSelector((state: RootState) => state.customization);

    useEffect(() => {
        localStorage.setItem(trackerStateLocalStorageKey, JSON.stringify(trackerState));
    }, [trackerState]);

    useEffect(() => {
        localStorage.setItem(
            remoteLogicLocalStorageKey,
            JSON.stringify(rawRemote),
        );
    }, [rawRemote]);

    useEffect(() => {
        localStorage.setItem(customizationStateLocalStorageKey, JSON.stringify(customizationState))
    }, [customizationState])
}

export function getStoredTrackerState(): Partial<TrackerState> | undefined {
    const stateJson = localStorage.getItem(trackerStateLocalStorageKey);
    return stateJson ? JSON.parse(stateJson) as Partial<TrackerState> : undefined;
}

const logicMigrations: Record<string, string> = {
    'robojumper/logic-dump': 'robojumper/logic-v2.1.1',
    'robojumper/statuesanity': 'ssrando/main',
    'YourAverageLink/random-pillar-statue': 'ssrando/main',
};

export function getStoredCustomization(): Partial<
    Omit<CustomizationState, 'colorScheme'> & {
        colorScheme: Partial<ColorScheme>;
    }
    > {
    const entireCustomization = localStorage.getItem(
        customizationStateLocalStorageKey,
    );
    let state: ReturnType<typeof getStoredCustomization> = {};
    if (entireCustomization) {
        state = JSON.parse(entireCustomization) as Partial<CustomizationState>;
    } else {
        state = {
            itemLayout: getStoredItemLayout(),
            locationLayout: getStoredLocationLayout(),
            colorScheme: getStoredColorScheme(),
            trickSemilogic: getStoredTrickSemiLogic(),
            counterBasis: getStoredCounterBasis(),
        };
    }

    // Remove undefined properties so that merging works in users of this
    for (const [key, value] of Object.entries(state)) {
        if (value === undefined) {
            delete state[key as keyof typeof state];
        }
    }

    return state;
}

export function getStoredRemote(): RemoteReference | undefined {
    const storedRemote = localStorage.getItem(remoteLogicLocalStorageKey);
    if (storedRemote === null) {
        return undefined;
    }
    const theRemote = JSON.parse(storedRemote) as RemoteReference;
    const migration = logicMigrations[formatRemote(theRemote)];
    if (migration) {
        return parseRemote(migration)!;
    } else {
        return theRemote;
    }
}

// Legacy

function getStoredItemLayout(): ItemLayout | undefined {
    const itemLayout = (localStorage.getItem(itemLayoutLocalStorageKey) as ItemLayout | null);
    return itemLayout ?? undefined;
}

function getStoredLocationLayout(): LocationLayout | undefined {
    const locationLayout = (localStorage.getItem(locationLayoutLocalStorageKey) as LocationLayout | null);
    return locationLayout ?? undefined;
}

function getStoredColorScheme(): Partial<ColorScheme> | undefined {
    const schemeJson = localStorage.getItem(colorSchemeLocalStorageKey);
    return schemeJson ? (JSON.parse(schemeJson) as Partial<ColorScheme>) : undefined;
}

function getStoredTrickSemiLogic(): boolean | undefined {
    const schemeJson = localStorage.getItem(trickSemilogicLocalStorageKey);
    return schemeJson ? (JSON.parse(schemeJson) as boolean) : undefined;
}

function getStoredCounterBasis(): CounterBasis | undefined {
    const schemeJson = localStorage.getItem(counterBasisLocalStorageKey);
    return schemeJson ? (JSON.parse(schemeJson) as CounterBasis) : undefined;
}