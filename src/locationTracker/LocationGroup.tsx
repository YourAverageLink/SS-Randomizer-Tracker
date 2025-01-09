import clsx from 'clsx';
import Location from './Location';
import styles from './LocationGroup.module.css';

export default function LocationGroup({
    wide,
    locations,
    onChooseEntrance,
}: {
    wide: boolean;
    /* the list of locations this group contains */
    locations: string[];
    onChooseEntrance: (exitId: string) => void;
}) {
    return (
        <div
            className={clsx(styles.locationGroup, {
                [styles.wide]: wide,
            })}
        >
            {locations.map((location) => (
                <div key={location} className={styles.locationCell}>
                    <Location
                        onChooseEntrance={onChooseEntrance}
                        id={location}
                    />
                </div>
            ))}
        </div>
    );
}
