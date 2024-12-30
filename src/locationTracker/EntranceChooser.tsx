import { useDispatch, useSelector } from 'react-redux';
import locationGroupStyles from './LocationGroup.module.css';
import locationStyles from './Location.module.css';
import styles from './EntranceChooser.module.css';
import clsx from 'clsx';
import { entrancePoolsSelector, exitsByIdSelector, usedEntrancesSelector } from '../tracker/Selectors';
import { useMemo, useState } from 'react';
import { mapEntrance } from '../tracker/Slice';
import keyDownWrapper from '../utils/KeyDownWrapper';
import { reorderLocationsForGrid } from '../utils/Collections';

const RESET_OPTION = 'RESET';

export default function EntranceChooser({ wide, exitId, onChoose }: { wide: boolean; exitId: string, onChoose: (entranceId: string) => void }) {

    const dispatch = useDispatch();
    const exits = useSelector(exitsByIdSelector);
    const entrancePools = useSelector(entrancePoolsSelector);
    const usedEntrances = useSelector(usedEntrancesSelector);
    const exit = exits[exitId];

    const [filterText, setFilterText] = useState('');
    
    const matches = (name: string, searchString: string) => {
        if (!searchString) {
            return true;
        }
        const fragments = searchString.split(' ');
        return fragments.every((fragment) => name.includes(fragment.trim()));
    };

    const entranceOptions = useMemo(() => {
        if (exit.canAssign) {
            const pool = exit.rule.pool;
            const entrances = entrancePools[pool].entrances
                .filter(
                    (entrance) =>
                        !entrancePools[pool].usedEntrancesExcluded ||
                        !usedEntrances[pool].includes(entrance.id),
                )
                .filter(({ name }) =>
                    matches(name.toLowerCase(), filterText.toLowerCase()),
                )
                .map(({ id, name }) => ({
                    value: id,
                    label: name,
                }));

            if (exit.entrance) {
                entrances.unshift({ value: RESET_OPTION, label: 'Reset' });
            }

            return wide ? reorderLocationsForGrid(entrances) : entrances;
        }
    }, [entrancePools, exit.canAssign, exit.entrance, exit.rule, filterText, wide, usedEntrances]);

    const onClickEntrance = (value: string) => {
        if (value === RESET_OPTION) {
            dispatch(mapEntrance({ from: exitId, to: undefined }));
        } else {
            dispatch(
                mapEntrance({ from: exitId, to: value }),
            );
        }
        onChoose(value);
    }

    return (
        <div className={styles.entranceChooser}>
            <h3>Where does {exit.exit.name} lead to?</h3>
            <input
                placeholder="Filter entrances..."
                autoFocus
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
            />
            <div className={styles.entrances}>
                <div
                    className={clsx(locationGroupStyles.locationGroup, {
                        [locationGroupStyles.wide]: wide,
                    })}
                >
                    {entranceOptions?.map(({ value, label }) => (
                        <div
                            key={value}
                            className={locationGroupStyles.locationCell}
                        >
                            <div
                                className={locationStyles.location}
                                role="button"
                                onClick={() => onClickEntrance(value)}
                                onKeyDown={keyDownWrapper(() =>
                                    onClickEntrance(value),
                                )}
                            >
                                <span className={locationStyles.text}>
                                    {label}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}