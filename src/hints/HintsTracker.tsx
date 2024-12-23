import { useDispatch, useSelector } from 'react-redux';
import styles from './HintsTracker.module.css';
import type { RootState } from '../store/store';
import { setHintsText } from '../tracker/slice';

// Just a basic textarea for now
export function HintsTracker() {
    const dispatch = useDispatch();
    const hintsText = useSelector(
        (state: RootState) => state.tracker.userHintsText,
    );
    return (
        <div className={styles.hintsTracker}>
            <textarea
                className={styles.hintsTextArea}
                placeholder="Track hints here!"
                value={hintsText}
                onChange={(ev) => dispatch(setHintsText(ev.target.value))}
            />
        </div>
    );
}
