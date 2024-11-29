import { useSelector } from 'react-redux';
import Location from './Location';
import { locationLayoutSelector } from '../customization/selectors';

import styles from './LocationGroup.module.css';
import clsx from 'clsx';

export default function LocationGroup({
    locations,
}: {
    /* the list of locations this group contains */
    locations: string[];
}) {
    const mapMode = useSelector(locationLayoutSelector) === 'map';
    return (
        <div>
            <div className={clsx(styles.locationGroup, { [styles.wide]: mapMode })}>
                {locations.map((location) => (
                    <div key={location} className={styles.locationCell}>
                        <Location id={location} />
                    </div>
                ))}
            </div>
        </div>
    );
}
