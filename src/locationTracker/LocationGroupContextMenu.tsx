import _ from 'lodash';
import { useCallback } from 'react';
import {
    Menu,
    Item,
    Separator,
    Submenu,
    ItemParams,
} from 'react-contexify';
import { LocationGroupContextMenuProps } from './LocationGroupHeader';
import { bulkEditChecks, mapEntrance, setHint } from '../tracker/slice';
import { MapExitContextMenuProps } from './mapTracker/EntranceMarker';
import { useDispatch, useSelector } from 'react-redux';
import {
    areasSelector,
    checkSelector,
    entrancePoolsSelector,
    settingSelector,
    usedEntrancesSelector,
} from '../tracker/selectors';
import { TrackerLinkedEntrancePool } from '../logic/Logic';
import { bosses } from './Hints';
import { ThunkResult, useAppDispatch } from '../store/store';
import hintItems from '../data/hintItems.json';
import { HintItem } from './LocationContextMenu';
import { EntrancePool } from '../logic/Entrances';

type AreaCtxProps<T = void> = ItemParams<LocationGroupContextMenuProps, T>;
type ExitCtxProps<T = void> = ItemParams<MapExitContextMenuProps, T>;

interface ItemData {
    item: string;
}

interface BossData {
    boss: number;
}

function checkOrUncheckAll(area: string, markChecked: boolean, onlyInLogic = false): ThunkResult {
    return (dispatch, getState) => {
        let checks = areasSelector(getState()).find(
            (a) => a.name === area,
        )?.checks;

        if (onlyInLogic) {
            checks = checks?.filter(
                (c) => checkSelector(c)(getState()).logicalState === 'inLogic',
            );
        }

        if (checks?.length) {
            dispatch(bulkEditChecks({ checks, markChecked }));
        }
    };
}

function useGroupContextMenuHandlers() {
    const dispatch = useAppDispatch();

    const checkAll = useCallback(
        (params: AreaCtxProps | ExitCtxProps) => {
            if (params.props!.area) {
                dispatch(checkOrUncheckAll(params.props!.area, true));
            }
        },
        [dispatch],
    );

    const checkAllInLogic = useCallback(
        (params: AreaCtxProps | ExitCtxProps) => {
            if (params.props!.area) {
                dispatch(checkOrUncheckAll(params.props!.area, true, /* onlyInLogic */ true));
            }
        },
        [dispatch],
    );

    const uncheckAll = useCallback(
        (params: AreaCtxProps | ExitCtxProps) => {
            if (params.props!.area) {
                dispatch(checkOrUncheckAll(params.props!.area, false));
            }
        },
        [dispatch],
    );

    const handlePathClick = useCallback(
        (params: AreaCtxProps<BossData> | ExitCtxProps<BossData>) =>
            params.props!.area &&
            dispatch(
                setHint({
                    areaId: params.props!.area,
                    hint: { type: 'path', index: params.data!.boss },
                }),
            ),
        [dispatch],
    );

    const handleSetItemClick = useCallback(
        (params: AreaCtxProps<ItemData> | ExitCtxProps<ItemData>) =>
            params.props!.area && 
            dispatch(setHint({
                areaId: params.props!.area,
                hint: { type: 'item', item: params.data!.item }
            })),
        [dispatch],
    );

    const handleSotsClick = useCallback(
        (params: AreaCtxProps | ExitCtxProps) =>
            params.props!.area &&
            dispatch(
                setHint({
                    areaId: params.props!.area,
                    hint: { type: 'sots' },
                }),
            ),
        [dispatch],
    );

    const handleBarrenClick = useCallback(
        (params: AreaCtxProps | ExitCtxProps) =>
            params.props!.area &&
            dispatch(
                setHint({
                    areaId: params.props!.area,
                    hint: { type: 'barren' },
                }),
            ),
        [dispatch],
    );

    const handleClearClick = useCallback(
        (params: AreaCtxProps | ExitCtxProps) =>
            params.props!.area &&
            dispatch(
                setHint({
                    areaId: params.props!.area,
                    hint: undefined,
                }),
            ),
        [dispatch],
    );

    return {
        checkAll,
        checkAllInLogic,
        uncheckAll,
        handleSetItemClick,
        handlePathClick,
        handleSotsClick,
        handleBarrenClick,
        handleClearClick,
    };
}

/**
 * React-contexify breaks down if items are in fragments, so
 * this is not a component!
 */
function useAreaContextMenuItems() {
    const {
        checkAll,
        checkAllInLogic,
        uncheckAll,
        handleSetItemClick,
        handleBarrenClick,
        handleClearClick,
        handlePathClick,
        handleSotsClick,
    } = useGroupContextMenuHandlers();

    return [
        <Item key="checkAll" onClick={checkAll}>Check All</Item>,
        <Item key="checkAllLogic" onClick={checkAllInLogic}>Check All In Logic</Item>,
        <Item key="uncheckAll" onClick={uncheckAll}>Uncheck All</Item>,
        <Separator key="sep1" />,
        <Submenu key="path"  label="Set Path">
            {_.map(bosses, (bossName, bossIndex) => (
                <Item
                    key={bossName}
                    onClick={handlePathClick}
                    data={{ boss: bossIndex } satisfies BossData}
                >
                    {bossName}
                </Item>
            ))}
        </Submenu>,
        <Item key="sots" onClick={handleSotsClick}>Set SotS</Item>,
        <Item key="barren" onClick={handleBarrenClick}>Set Barren</Item>,
        <Submenu key="item" label="Set Item">
            {_.map(hintItems, (items, category) => (
                <Submenu key={category} label={category}>
                    {_.map(items, (listItem) => (
                        <Item
                            key={listItem}
                            onClick={handleSetItemClick}
                            data={{ item: listItem } satisfies ItemData}
                        >
                            <HintItem itemName={listItem} />
                        </Item>
                    ))}
                </Submenu>
            ))}
        </Submenu>,
        <Item key="clearHint" onClick={handleClearClick}>Clear Hint</Item>,
    ];
}

function LocationGroupContextMenu() {
    const randomEntrances = useSelector(settingSelector('randomize-entrances'));
    const randomDungeonEntrances = useSelector(
        settingSelector('randomize-dungeon-entrances'),
    );
    const randomSilentRealms = useSelector(settingSelector('randomize-trials'));

    const dungeonEntranceSetting = randomDungeonEntrances ?? randomEntrances;
    const areDungeonEntrancesRandomized = dungeonEntranceSetting !== 'None';

    const areaMenuItems = useAreaContextMenuItems();

    return (
        <>
            <Menu id="group-context">
                {areaMenuItems}
            </Menu>
            <BoundEntranceMenu
                id="dungeon-context"
                pool="dungeons"
                canChooseEntrance={areDungeonEntrancesRandomized}
            />
            <UnboundEntranceMenu id="unbound-dungeon-context" pool="dungeons" />
            <BoundEntranceMenu
                id="dungeon-unrequired-context"
                pool="dungeons_unrequired"
                canChooseEntrance={areDungeonEntrancesRandomized}
            />
            <UnboundEntranceMenu id="unbound-dungeon-unrequired-context" pool="dungeons_unrequired" />
            <BoundEntranceMenu
                id="trial-context"
                pool="silent_realms"
                canChooseEntrance={randomSilentRealms}
            />
            <UnboundEntranceMenu
                id="unbound-trial-context"
                pool="silent_realms"
            />
        </>
    );
}

// Wow it turns out getting any sort of dynamic data into React-Contexify is a massive pain,
// so this is kind of annoying and not as generic but /shrug

// contexify breaks down if items are wrapped in nodes, so this is not a component!!!
function createBindSubmenu(
    entrancePools: Record<string, EntrancePool>,
    usedEntrances: Set<string>,
    pool: TrackerLinkedEntrancePool,
    chooseEntrance: (exitId: string, entranceId: string) => void,
    disabled: boolean,
) {

    if (!entrancePools[pool]) {
        return undefined;
    }

    const name = pool === 'silent_realms' ? 'Silent Realm' : 'Dungeon';
    return (
        <Submenu disabled={disabled} label={`Bind ${name} to Entrance`}>
            {entrancePools[pool].entrances.map(
                ({id, name}) => {
                    return (
                        <Item
                            key={name}
                            disabled={usedEntrances.has(id)}
                            onClick={(params: ExitCtxProps) =>
                                chooseEntrance(
                                    params.props!.exitMapping.exit.id,
                                    id,
                                )
                            }
                        >
                            {name}
                        </Item>
                    );
                },
            )}
        </Submenu>
    );
}

function BoundEntranceMenu({
    id,
    pool,
    canChooseEntrance,
}: {
    id: string;
    pool: TrackerLinkedEntrancePool;
    canChooseEntrance: boolean;
}) {
    const dispatch = useAppDispatch();
    const usedEntrances = useSelector(usedEntrancesSelector);
    const areaMenuItems = useAreaContextMenuItems();
    const entrancePools = useSelector(entrancePoolsSelector);

    const handleMapEntrance = useCallback(
        (exit: string, entrance: string) =>
            dispatch(
                mapEntrance({
                    from: exit,
                    to: entrance,
                }),
            ),
        [dispatch],
    );

    const unbindEntrance = useCallback(
        (params: ExitCtxProps) =>
            dispatch(mapEntrance({
                from: params.props!.exitMapping.exit.id,
                to: undefined,
            })),
        [dispatch],
    );

    return (
        <Menu id={id}>
            {areaMenuItems}
            {createBindSubmenu(
                entrancePools,
                new Set(usedEntrances[pool]),
                pool,
                handleMapEntrance,
                !canChooseEntrance,
            )}
            <Item key="unbindEntrance" onClick={unbindEntrance}>Unbind Entrance</Item>
        </Menu>
    );
}

function UnboundEntranceMenu({
    id,
    pool,
}: {
    id: string;
    pool: TrackerLinkedEntrancePool;
}) {
    const dispatch = useDispatch();
    const usedEntrances = useSelector(usedEntrancesSelector);
    const entrancePools = useSelector(entrancePoolsSelector);

    const handleMapEntrance = useCallback(
        (exit: string, entrance: string) =>
            dispatch(
                mapEntrance({
                    from: exit,
                    to: entrance,
                }),
            ),
        [dispatch],
    );

    return (
        <Menu id={id}>
            {createBindSubmenu(
                entrancePools,
                new Set(usedEntrances[pool]),
                pool,
                handleMapEntrance,
                false,
            )}
        </Menu>
    );
}


export default LocationGroupContextMenu;
