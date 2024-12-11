import { useSelector } from 'react-redux';
import Location from './Location';
import { locationLayoutSelector } from '../customization/selectors';
import styles from './LocationGroup.module.css';
import clsx from 'clsx';
import { reorderLocationsForGrid } from '../utils/Collections';

export default function LocationGroup({
    locations,
    onChooseEntrance,
}: {
    /* the list of locations this group contains */
    locations: string[];
    onChooseEntrance: (exitId: string) => void;
}) {
    const mapMode = useSelector(locationLayoutSelector) === 'map';
    const orderedLocations = mapMode
        ? reorderLocationsForGrid(locations)
        : locations;
    return (
        <div
            className={clsx(styles.locationGroup, {
                [styles.wide]: mapMode,
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
