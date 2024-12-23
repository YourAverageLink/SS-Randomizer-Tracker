import { useCallback } from 'react';
import 'react-contexify/dist/ReactContexify.css';
import { useSelector } from 'react-redux';
import {
    areaHintSelector,
    areasSelector,
    exitsSelector,
    inLogicBitsSelector,
} from '../../tracker/selectors';
import { useContextMenu } from '../context-menu';
import type { TriggerEvent } from 'react-contexify';
import type { RootState } from '../../store/store';
import { logicSelector } from '../../logic/selectors';
import type { ColorScheme } from '../../customization/ColorScheme';
import HintDescription, { decodeHint } from '../Hints';
import type { ExitMapping } from '../../logic/Locations';
import { useTooltipExpr } from '../../tooltips/TooltipHooks';
import RequirementsTooltip from '../RequirementsTooltip';
import type { LocationGroupContextMenuProps } from '../LocationGroupHeader';
import { Marker } from './Marker';

type EntranceMarkerProps = {
    markerX: number;
    markerY: number;
    exitId: string;
    title: string;
    mapWidth: number;
    active: boolean;
    onGlickGroup: (group: string) => void;
    onChooseEntrance: (exitId: string) => void;
    selected: boolean;
};

export interface MapExitContextMenuProps {
    exitMapping: ExitMapping;
    /** destination area! */
    area: string | undefined;
}

const EntranceMarker = (props: EntranceMarkerProps) => {
    
    const { title, exitId, markerX, markerY, mapWidth, active, onGlickGroup, onChooseEntrance, selected } = props;
    const exit = useSelector((state: RootState) => exitsSelector(state).find((e) => e.exit.id === exitId))!;
    const inLogicBits = useSelector(inLogicBitsSelector);
    const logic = useSelector(logicSelector);
    const isDungeon = Object.values(logic.areaGraph.linkedEntrancePools['dungeons']).some((ex) => ex.exits[0] === exit.exit.id);

    const region = exit.entrance?.region;
    const area = useSelector((state: RootState) => areasSelector(state).find((r) => r.name === region))

    const hasConnection = region !== '' && region !== undefined;
    const remainingChecks = area?.numChecksRemaining;
    const accessibleChecks = area?.numChecksAccessible;
    const canReach = inLogicBits.test(logic.itemBits[exit.exit.id]);
    let markerColor: keyof ColorScheme = 'outLogic';
    if (hasConnection) {
        if (accessibleChecks !== 0) {
            markerColor = 'semiLogic';
        }
        if (accessibleChecks === remainingChecks) {
            markerColor = 'inLogic';
        }
        if (remainingChecks === 0) {
            markerColor = 'checked';
        }
    } else if (canReach) {
        markerColor = 'inLogic';
    } else {
        markerColor = 'checked';
    }

    const isUnrequiredDungeon =
        isDungeon &&
        exit.rule.type === 'random' &&
        Boolean(exit.rule.isKnownIrrelevant);

    const showBound = useContextMenu<MapExitContextMenuProps>({
        id: isDungeon
            ? isUnrequiredDungeon
                ? 'dungeon-unrequired-context'
                : 'dungeon-context'
            : 'trial-context',
    }).show;

    const showGroup = useContextMenu<LocationGroupContextMenuProps>({
        id: 'group-context',
    }).show;

    const destinationRegionName = exit.entrance && logic.areaGraph.entranceHintRegions[exit.entrance.id];

    const displayMenu = useCallback((e: TriggerEvent) => {
        e.preventDefault();
        if (!exit.canAssign) {
            if (exit.entrance) {
                showGroup({event: e, props: { area: exit.entrance?.region }})
            }
        } else if (hasConnection) {
            showBound({ event: e, props: { exitMapping: exit, area: destinationRegionName } });
        } else {
            onChooseEntrance(exitId);
        }
    }, [destinationRegionName, exit, exitId, hasConnection, onChooseEntrance, showBound, showGroup]);

    const areaHint = useSelector(areaHintSelector(destinationRegionName ?? ''));

    const hint = areaHint && decodeHint(areaHint);

    // Only calculate tooltip if this region is shown
    const requirements = useTooltipExpr(exit.exit.id, active);

    let tooltip;

    if (hasConnection) {
        tooltip = (
            <center>
                <div> {title}</div>
                <div> {region} ({accessibleChecks}/{remainingChecks}) </div>
                <div style={{ textAlign: 'left' }}>
                    <RequirementsTooltip requirements={requirements} />
                </div>
                {hint && <HintDescription hint={hint} />}
            </center>
        );
    } else {
        tooltip = (
            <center>
                <div> {title} ({(canReach ? 'Accessible' : 'Inaccessible')})</div>
                <div style={{ textAlign: 'left' }}>
                    <RequirementsTooltip requirements={requirements} />
                </div>
                <div> Click to Attach {isDungeon ? 'Dungeon' : 'Silent Realm'} </div>
            </center>
        );
    }

    const handleClick = (e: TriggerEvent) => {
        if (e instanceof KeyboardEvent && e.key !== ' ') {
            return;
        }
        if (e.type === 'contextmenu') {
            if (region) {
                onGlickGroup(region);
            }
            e.preventDefault();
        } else if (!hasConnection) {
            displayMenu(e);
        } else {
            onGlickGroup(region);
        }
    };

    return (
        <Marker
            x={markerX}
            y={markerY}
            variant={title.includes('Trial Gate') ? 'circle' : 'square'}
            color={markerColor}
            mapWidth={mapWidth}
            tooltip={tooltip}
            onClick={handleClick}
            onContextMenu={displayMenu}
            selected={selected}
        >
            {Boolean(accessibleChecks) && accessibleChecks}
            {!hasConnection && '?'}
        </Marker>
    );
};

export default EntranceMarker;
