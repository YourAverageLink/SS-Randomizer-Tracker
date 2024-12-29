import Location from './Location';
import styles from './LocationGroup.module.css';
import clsx from 'clsx';
import { reorderLocationsForGrid } from '../utils/Collections';

export default function LocationGroup({
    wide,
    locations,
    onChooseEntrance,
}: {
    wide: boolean,
    /* the list of locations this group contains */
    locations: string[];
    onChooseEntrance: (exitId: string) => void;
}) {
    const orderedLocations = wide
        ? reorderLocationsForGrid(locations)
        : locations;
    return (
        <div
            className={clsx(styles.locationGroup, {
                [styles.wide]: wide,
            })}
        >
            {orderedLocations.map((location) => (
                <div key={location} className={styles.locationCell}>
                    <Location onChooseEntrance={onChooseEntrance} id={location} />
                </div>
            ))}
        </div>
    );
}
