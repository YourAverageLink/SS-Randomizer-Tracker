import { itemLocationAssignmentEnabledSelector } from '../customization/Selectors';
import { isRegularItemCheck } from '../logic/Logic';
import type { SyncThunkResult } from '../store/Store';
import { checkSelector } from './Selectors';
import { clickCheckInternal } from './Slice';

export function clickCheck({
    checkId,
    markChecked,
}: {
    checkId: string;
    markChecked?: boolean;
}): SyncThunkResult {
    return (dispatch, getState) => {
        const check = checkSelector(checkId)(getState());
        const autoAssignmentEnabled = itemLocationAssignmentEnabledSelector(getState());
        dispatch(
            clickCheckInternal({
                checkId,
                markChecked,
                canMarkForItemAssignment:
                    autoAssignmentEnabled &&
                    check.type !== 'exit' &&
                    isRegularItemCheck(check.type),
            }),
        );
    };
}
