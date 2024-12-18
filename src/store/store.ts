import { ThunkAction, configureStore } from '@reduxjs/toolkit';
import customization, {
    preloadedCustomizationState,
} from '../customization/slice';
import tracker, { preloadedTrackerState } from '../tracker/slice';
import saves, { preloadedSavesState } from '../saves/slice';
import logic from '../logic/slice';
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
