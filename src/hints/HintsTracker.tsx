import { useDispatch, useSelector } from 'react-redux';
import styles from './HintsTracker.module.css';
import type { RootState } from '../store/Store';
import { setHintsText } from '../tracker/Slice';
import clsx from 'clsx';

const hintsPlaceholder = $FEATURE_FLAG_HINTS_PARSER
    ? 'Track hints here! Examples:\nUpper Barren\nFaron -> ET\nFloria -> G2'
    : 'Track hints here!';

// Just a basic textarea for now
export function HintsTracker() {
    const dispatch = useDispatch();
    const hintsText = useSelector(
        (state: RootState) => state.tracker.userHintsText,
    );
    return (
        <div className={styles.hintsTracker}>
            <textarea
                className={clsx('tracker-input', styles.hintsTextArea)}
                placeholder={hintsPlaceholder}
                value={hintsText}
                onChange={(ev) => dispatch(setHintsText(ev.target.value))}
            />
        </div>
    );
}
