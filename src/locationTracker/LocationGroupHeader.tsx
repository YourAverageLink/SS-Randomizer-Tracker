import { useCallback } from 'react';
import AreaCounters from './AreaCounters';
import keyDownWrapper from '../utils/KeyDownWrapper';
import type { TriggerEvent } from 'react-contexify';
import { useContextMenu } from './context-menu';
import type { HintRegion } from '../logic/Locations';
import { useSelector } from 'react-redux';
import { areaHintSelector } from '../tracker/Selectors';
import styles from './LocationGroupHeader.module.css';
import clsx from 'clsx';
import type { LocationGroupContextMenuProps } from './LocationGroupContextMenu';
import Tooltip from '../additionalComponents/Tooltip';
import { decodeHint } from '../hints/Hints';

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

    const hints = areaHint.map(decodeHint);

    return (
        <div
            onClick={onClick}
            onKeyDown={keyDownWrapper(onClick)}
            role="button"
            tabIndex={0}
            onContextMenu={displayMenu}
            className={styles.locationGroupHeader}
        >
            <div className={styles.name}>{area.name}</div>
            {hints.map((hint, idx) => (
                <div key={idx} className={styles.hint}>
                    <Tooltip
                        content={
                            <span
                                style={{ color: `var(--scheme-${hint.style})` }}
                            >
                                {hint.description}
                            </span>
                        }
                    >
                        <img src={hint.image} alt={hint.description} />
                    </Tooltip>
                </div>
            ))}
            <div
                className={clsx(styles.counter, {
                    [styles.align]: alignCounters,
                })}
            >
                <AreaCounters
                    totalChecksLeftInArea={area.checks.numRemaining}
                    totalChecksAccessible={area.checks.numAccessible}
                />
            </div>
        </div>
    );
}
