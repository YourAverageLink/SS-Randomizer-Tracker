import { type ThunkAction, configureStore } from '@reduxjs/toolkit';
import customization, {
    preloadedCustomizationState,
} from '../customization/Slice';
import tracker, { preloadedTrackerState } from '../tracker/Slice';
import saves, { preloadedSavesState } from '../saves/Slice';
import logic from '../logic/Slice';
import { useDispatch } from 'react-redux';

export function createStore() {
    return configureStore({
        reducer: {
            logic,
            customization,
            tracker,
            saves,
        },
        preloadedState: {
            customization: preloadedCustomizationState(),
            tracker: preloadedTrackerState(),
            saves: preloadedSavesState(),
        },
    });
}

export type Store = ReturnType<typeof createStore>;

export type RootState = ReturnType<Store['getState']>;
export type AppDispatch = Store['dispatch'];
export type AppAction = Parameters<AppDispatch>[0];
export const useAppDispatch: () => AppDispatch = useDispatch;
export type ThunkResult<R = void> = ThunkAction<
    R | Promise<R>,
    RootState,
    undefined,
    Parameters<AppDispatch>[0]
>;
