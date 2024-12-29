import { useCallback } from 'react';
import AreaCounters from './AreaCounters';
import 'react-contexify/dist/ReactContexify.css';
import keyDownWrapper from '../KeyDownWrapper';
import type { TriggerEvent } from 'react-contexify';
import { useContextMenu } from './context-menu';
import type { HintRegion } from '../logic/Locations';
import { useSelector } from 'react-redux';
import { areaHintSelector } from '../tracker/selectors';
import { decodeHint } from './Hints';
import styles from './LocationGroupHeader.module.css';
import clsx from 'clsx';
import type { LocationGroupContextMenuProps } from './LocationGroupContextMenu';

export default function LocationGroupHeader({
    area,
    setActiveArea,
    alignCounters,
}: {
    area: HintRegion;
    setActiveArea: (area: string) => void;
    alignCounters?: boolean;
}) {
    const onClick = useCallback(
        () => setActiveArea(area.name),
        [area.name, setActiveArea],
    );

    const areaHint = useSelector(areaHintSelector(area.name));

    const { show } = useContextMenu<LocationGroupContextMenuProps>({
        id: 'group-context',
    });

    const displayMenu = useCallback(
        (e: TriggerEvent) => {
            show({
                event: e,
                props: { area: area.name },
            });
        },
        [area, show],
    );

    const hint = areaHint && decodeHint(areaHint);

    return (
        <div
            onClick={onClick}
            onKeyDown={keyDownWrapper(onClick)}
            role="button"
            tabIndex={0}
            onContextMenu={displayMenu}
            className={styles.locationGroupHeader}
        >
            <div className={styles.name}>
                <h3>{area.name}</h3>
            </div>
            <div className={styles.hint}>
                {hint && <img src={hint.image} alt={hint.description} />}
            </div>
            <div
                className={clsx(styles.counter, {
                    [styles.align]: alignCounters,
                })}
            >
                <h3>
                    <AreaCounters
                        totalChecksLeftInArea={area.checks.numRemaining}
                        totalChecksAccessible={area.checks.numAccessible}
                    />
                </h3>
            </div>
        </div>
    );
}
