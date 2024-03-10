import { OptionDefs } from '../permalink/SettingsTypes';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { RawLogic } from './UpstreamTypes';
import { RemoteReference } from '../loader/LogicLoader';

/**
 * Relevant data loaded from an ssrando upstream.
 */
export interface LogicBundle {
    /** dump.yaml */
    logic: RawLogic;
    /** options.yaml */
    options: OptionDefs;
    /** the remote we loaded from */
    remote: RemoteReference;
    /** the human-readable data (for Latest version, this is the latest) */
    remoteName: string;
}

export interface LogicState {
    loaded: LogicBundle | undefined,
}

const initialState: LogicState = {
    loaded: undefined,
};

const logicSlice = createSlice({
    name: 'logic',
    initialState,
    reducers: {
        loadLogic: (
            state,
            action: PayloadAction<LogicBundle>,
        ) => {
            state.loaded = action.payload;
        },
    },
});

export const { loadLogic } = logicSlice.actions;

export default logicSlice.reducer;
