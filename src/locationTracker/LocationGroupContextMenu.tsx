import { useCallback } from 'react';
import {
    Menu,
    Item,
    Separator,
    Submenu,
    type ItemParams,
} from 'react-contexify';
import { bulkEditChecks, setHint } from '../tracker/slice';
import { useSelector } from 'react-redux';
import {
    areasSelector,
    checkSelector,
    settingSelector,
} from '../tracker/selectors';
import type { TrackerLinkedEntrancePool } from '../logic/Logic';
import { bosses } from './Hints';
import { type ThunkResult, useAppDispatch } from '../store/store';
import hintItems from '../data/hintItems.json';
import { HintItem } from './LocationContextMenu';
import type { InterfaceAction } from '../tracker/TrackerInterfaceReducer';
import type { ExitMapping } from '../logic/Locations';

export interface LocationGroupContextMenuProps {
    area: string;
}

export interface MapExitContextMenuProps {
    exitMapping: ExitMapping;
    /** destination area! */
    area: string | undefined;
}


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
        )?.checks.list;

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
            {bosses.map((bossName, bossIndex) => (
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
            {Object.entries(hintItems).map(([category, items]) => (
                <Submenu key={category} label={category}>
                    {items.map((listItem) => (
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

function LocationGroupContextMenu({
    interfaceDispatch,
}: {
    interfaceDispatch: React.Dispatch<InterfaceAction>;
}) {
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
            <Menu id="group-context">{areaMenuItems}</Menu>
            <BoundEntranceMenu
                menuId="dungeon-context"
                pool="dungeons"
                canChooseEntrance={areDungeonEntrancesRandomized}
                interfaceDispatch={interfaceDispatch}
            />
            <BoundEntranceMenu
                menuId="dungeon-unrequired-context"
                pool="dungeons_unrequired"
                canChooseEntrance={areDungeonEntrancesRandomized}
                interfaceDispatch={interfaceDispatch}
            />
            <BoundEntranceMenu
                menuId="trial-context"
                pool="silent_realms"
                canChooseEntrance={randomSilentRealms}
                interfaceDispatch={interfaceDispatch}
            />
        </>
    );
}

function BoundEntranceMenu({
    menuId,
    pool,
    canChooseEntrance,
    interfaceDispatch,
}: {
    menuId: string;
    pool: TrackerLinkedEntrancePool;
    canChooseEntrance: boolean;
    interfaceDispatch: React.Dispatch<InterfaceAction>;
}) {
    const areaMenuItems = useAreaContextMenuItems();

    const manageEntrance = useCallback(
        (params: ExitCtxProps) =>
            interfaceDispatch({
                type: 'chooseEntrance',
                exitId: params.props!.exitMapping.exit.id,
            }),
        [interfaceDispatch],
    );

    const name = pool === 'silent_realms' ? 'Silent Realm' : 'Dungeon';

    return (
        <Menu id={menuId}>
            {areaMenuItems}
            {canChooseEntrance && <Item key="manageEntrance" onClick={manageEntrance}>Select {name} Entrance</Item>}
        </Menu>
    );
}

export default LocationGroupContextMenu;
