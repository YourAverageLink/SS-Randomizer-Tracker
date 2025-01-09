import clsx from 'clsx';
import { useCallback } from 'react';
import type { TriggerEvent } from 'react-contexify';
import { useDispatch, useSelector } from 'react-redux';
import Tooltip from '../additionalComponents/Tooltip';
import { decodeHint } from '../hints/Hints';
import type { HintRegion } from '../logic/Locations';
import { areaHintSelector } from '../tracker/Selectors';
import keyDownWrapper from '../utils/KeyDownWrapper';
import AreaCounters from './AreaCounters';
import { useContextMenu } from './context-menu';
import type { LocationGroupContextMenuProps } from './LocationGroupContextMenu';
import styles from './LocationGroupHeader.module.css';
import { setHint } from '../tracker/Slice';

interface ItemRegionHint {
    region: string,
    item: string,
}

export default function LocationGroupHeader({
    area,
    setActiveArea,
    alignCounters,
}: {
    area: HintRegion;
    setActiveArea: (area: string) => void;
    alignCounters?: boolean;
}) {
    const dispatch = useDispatch();
    const onClick = useCallback(
        () => setActiveArea(area.name),
        [area.name, setActiveArea],
    );

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    };
    
    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const itemName = event.dataTransfer.getData("text/plain");
        handleItemDrag({region: area.name, item: itemName});
    };

    const handleItemDrag = useCallback(
        (params: ItemRegionHint) =>
            dispatch(
                setHint({
                    areaId: params.region,
                    hint: { type: 'item', item: params.item },
                }),
            ),
        [dispatch],
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
            onDragOver={handleDragOver}
            onDrop={handleDrop}
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
