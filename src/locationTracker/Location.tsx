import clsx from 'clsx';
import { useCallback, type CSSProperties } from 'react';
import type { TriggerEvent } from 'react-contexify';
import { useDispatch, useSelector } from 'react-redux';
import Tooltip from '../additionalComponents/Tooltip';
import exitImg from '../assets/dungeons/entrance.png';
import goddessCubeImg from '../assets/sidequests/goddess_cube.png';
import gossipStoneImg from '../assets/sidequests/gossip_stone.png';
import images, { findRepresentativeIcon } from '../itemTracker/Images';
import type { Check } from '../logic/Locations';
import { useAppDispatch, type RootState } from '../store/Store';
import { useEntrancePath, useTooltipExpr } from '../tooltips/TooltipHooks';
import { clickCheck } from '../tracker/Actions';
import {
    checkHintSelector,
    checkSelector,
    exitsByIdSelector,
    isCheckBannedSelector,
} from '../tracker/Selectors';
import { mapEntrance, setCheckHint } from '../tracker/Slice';
import keyDownWrapper from '../utils/KeyDownWrapper';
import { useContextMenu } from './context-menu';
import styles from './Location.module.css';
import PathTooltip from './PathTooltip';
import RequirementsTooltip from './RequirementsTooltip';

export interface LocationContextMenuProps {
    checkId: string;
}
export interface ItemData {
    item: string;
}

export default function Location({
    id,
    onChooseEntrance,
}: {
    id: string;
    onChooseEntrance: (exitId: string) => void;
}) {
    const check = useSelector(checkSelector(id));
    if (check.type === 'exit') {
        return <Exit onChooseEntrance={onChooseEntrance} id={id} />;
    } else {
        return <CheckLocation id={id} />;
    }
}

function CheckLocation({ id }: { id: string }) {
    const dispatch = useAppDispatch();
    const isBanned = useSelector((state: RootState) =>
        isCheckBannedSelector(state)(id),
    );

    const check = useSelector(checkSelector(id));

    const onClick = () => dispatch(clickCheck({ checkId: id }));

    const style = {
        color: check.checked
            ? `var(--scheme-checked)`
            : `var(--scheme-${check.logicalState})`,
    } satisfies CSSProperties;

    const { show } = useContextMenu<LocationContextMenuProps>({
        id: 'location-context',
    });

    const displayMenu = useCallback(
        (e: TriggerEvent) => {
            show({ event: e, props: { checkId: id } });
        },
        [id, show],
    );

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
      };
    
    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const itemName = event.dataTransfer.getData("text/plain");
        handleItemDrag({item: itemName});
    };

    const handleItemDrag = useCallback(
        (params: ItemData) =>
            dispatch(
                setCheckHint({
                    checkId: id,
                    hint: params.item,
                }),
            ),
        [dispatch],
    );

    const expr = useTooltipExpr(id);
    const path = useEntrancePath(id);

    return (
        <Tooltip
            content={
                <>
                    <RequirementsTooltip requirements={expr} />
                    {path && (
                        <>
                            <hr />
                            <PathTooltip segments={path} />
                        </>
                    )}
                    {isBanned && (
                        <span className={styles.tooltipNote}>
                            This location is excluded by current settings and
                            will never be logically required.
                        </span>
                    )}
                </>
            }
        >
            <div
                className={clsx(styles.location, {
                    [styles.checked]: check.checked,
                })}
                style={style}
                role="button"
                onClick={onClick}
                onKeyDown={keyDownWrapper(onClick)}
                onContextMenu={displayMenu}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                data-check-id={id}
            >
                <span className={styles.text}>{check.checkName}</span>
                <CheckIcon check={check} />
            </div>
        </Tooltip>
    );
}

function CheckIcon({ check }: { check: Check }) {
    const hintItem = useSelector(checkHintSelector(check.checkId));
    const isCheckBanned = useSelector(isCheckBannedSelector);
    let name: string | undefined = undefined;
    let src: string | undefined = undefined;
    if (check.type === 'exit') {
        name = 'Exit';
        src = exitImg;
    } else if (check.type === 'gossip_stone') {
        name = 'Gossip Stone';
        src = gossipStoneImg;
    } else if (check.type === 'tr_cube') {
        name = 'Goddess Cube';
        src = goddessCubeImg;
    } else if (check.type === 'loose_crystal') {
        name = 'Gratitude Crystal';
        const banned = isCheckBanned(check.checkId);
        if (banned) {
            name += ' (not required)';
        }
        src = images['Gratitude Crystals Grid'][banned ? 0 : 1];
    } else if (hintItem) {
        name = hintItem;
        src = findRepresentativeIcon(hintItem);
    }

    if (src && name) {
        return (
            <div className={styles.hintItem}>
                <img src={src} height={36} title={name} alt={name} />
            </div>
        );
    }
}

function Exit({
    id,
    onChooseEntrance,
    // setActiveArea,
}: {
    id: string;
    onChooseEntrance: (exitId: string) => void;
    // TODO
    // setActiveArea: (area: string) => void;
}) {
    const dispatch = useDispatch();
    const exit = useSelector(
        (state: RootState) => exitsByIdSelector(state)[id],
    );
    const check = useSelector(checkSelector(id));

    const style = {
        color: check.checked
            ? `var(--scheme-checked)`
            : `var(--scheme-${check.logicalState})`,
    };

    const expr = useTooltipExpr(id);
    const path = useEntrancePath(id);

    const onClick = () => onChooseEntrance(id);

    return (
        <>
            <Tooltip
                content={
                    <>
                        <RequirementsTooltip requirements={expr} />
                        {path && (
                            <>
                                <hr />
                                <PathTooltip segments={path} />
                            </>
                        )}
                    </>
                }
            >
                <div
                    className={styles.location}
                    role="button"
                    onClick={onClick}
                    onKeyDown={keyDownWrapper(onClick)}
                    onContextMenu={(e) => {
                        e.preventDefault();
                        dispatch(
                            mapEntrance({
                                from: exit.exit.id,
                                to: undefined,
                            }),
                        );
                    }}
                    data-check-id={id}
                >
                    <div className={clsx(styles.exit, styles.text)}>
                        <span style={style}>{check.checkName}</span>
                        <span>
                            ↳{exit.entrance?.name ?? 'Select entrance...'}
                        </span>
                    </div>
                    <CheckIcon check={check} />
                </div>
            </Tooltip>
        </>
    );
}
