import { useCallback } from 'react';
import _ from 'lodash';
import ColorScheme from '../../customization/ColorScheme';
import MapMarker from './MapMarker';
import EntranceMarker from './EntranceMarker';
import keyDownWrapper from '../../KeyDownWrapper';
import leaveSkyloft from '../../assets/maps/leaveSkyloft.png';
import leaveFaron from '../../assets/maps/leaveFaron.png';
import leaveEldin from '../../assets/maps/leaveEldin.png';
import leaveLanayru from '../../assets/maps/leaveLanayru.png';
import { useSelector } from 'react-redux';
import { areasSelector, checkSelector, exitsSelector, settingSelector } from '../../tracker/selectors';
import { AreaGraph, Logic } from '../../logic/Logic';
import { logicSelector } from '../../logic/selectors';
import HintDescription, { DecodedHint, decodeHint } from '../Hints';
import { RootState } from '../../store/store';
import { TriggerEvent } from 'react-contexify';
import { Marker } from './Marker';

export type RegionMarkerParams = {
    region: string,
    markerX: number,
    markerY: number,
};

export type EntranceMarkerParams = {
    exitPool: keyof AreaGraph['linkedEntrancePools']
    entryName: string;
    markerX: number,
    markerY: number,
};

export type ExitParams = {
    image: string,
    width: number,
    left: number,
    top: number
}

const images: Record<string, string> = {
    leaveSkyloft,
    leaveFaron,
    leaveEldin,
    leaveLanayru,
};

function getExit(logic: Logic, marker: EntranceMarkerParams) {
    const exitId = logic.areaGraph.linkedEntrancePools[marker.exitPool][marker.entryName].exits[0];
    return { exitId, exitName: logic.areaGraph.exits[exitId].short_name };
}

const Submap = ({
    onSubmapChange,
    onGroupChange,
    onChooseEntrance,
    title,
    markerX,
    markerY,
    map,
    mapWidth,
    activeSubmap,
    markers,
    entranceMarkers,
    exitParams,
}: {
    markerX: number;
    markerY: number;
    title: string;
    onGroupChange: (region: string | undefined) => void;
    onSubmapChange: (submap: string | undefined) => void;
    onChooseEntrance: (exitId: string) => void;
    markers: RegionMarkerParams[];
    entranceMarkers: EntranceMarkerParams[];
    activeSubmap: string | undefined;
    map: string;
    mapWidth: number;
    exitParams: ExitParams;
}) => {
    let remainingChecks = 0
    let accessibleChecks = 0;
    const subregionHints: { hint: DecodedHint, area: string }[] = [];
    const areas = useSelector(areasSelector);
    const exits = useSelector(exitsSelector);
    const hints = useSelector((state: RootState) => state.tracker.hints);
    _.forEach(markers, (marker) => {
        const area = areas.find((area) => area.name === marker.region);
        if (area) {
            remainingChecks += area.numChecksRemaining;
            accessibleChecks += area.numChecksAccessible;
            const hint = hints[area.name];
            if (hint) {
                subregionHints.push({ area: area.name, hint: decodeHint(hint) });
            }
        }
    })

    const logic = useSelector(logicSelector);
    
    _.forEach(entranceMarkers, (marker) => {
        const exit = getExit(logic, marker);
        const exitMapping = exits.find((e) => e.exit.id === exit.exitId)!;
        const areaName = exitMapping.entrance && logic.areaGraph.entranceHintRegions[exitMapping.entrance.id];
        const area = areas.find((area) => area.name === areaName);
        if (area) {
            remainingChecks += area.numChecksRemaining;
            accessibleChecks += area.numChecksAccessible;
            const hint = hints[area.name];
            if (hint) {
                subregionHints.push({ area: area.name, hint: decodeHint(hint) });
            }
        }
    })

    let markerColor: keyof ColorScheme = 'outLogic';
    if (accessibleChecks !== 0) {
        markerColor = 'semiLogic';
    }
    if (accessibleChecks === remainingChecks) {
        markerColor = 'inLogic';
    }
    if (remainingChecks === 0) {
        markerColor = 'checked';
    }

    // TODO create a generic Marker component and separate some of this code
    const birdSanityOn = useSelector(settingSelector('random-start-statues'));
    const birdStatueSanityPool = birdSanityOn && logic.areaGraph.birdStatueSanity[title];
    const needsBirdStatueSanityExit = birdStatueSanityPool && !exits.find((e) => e.exit.id === birdStatueSanityPool.exit && e.entrance);
    const exitCheck = useSelector(
        (state: RootState) =>
            needsBirdStatueSanityExit &&
            checkSelector(birdStatueSanityPool.exit)(state),
    );

    if (exitCheck && exitCheck.logicalState !== 'outLogic' && accessibleChecks === 0) {
        markerColor = exitCheck.logicalState;
    }

    const tooltip = (
        <center>
            <div> {title} ({accessibleChecks}/{remainingChecks}) </div>
            <div> Click to Expand </div>
            {needsBirdStatueSanityExit && <div>Right-click to choose Statue</div>}
            {subregionHints.map(({hint, area}) => <HintDescription key={area} hint={hint} area={area} />)}
        </center>
    );

    const handleClick = (e: TriggerEvent | React.UIEvent) => {
        if (e.type === 'contextmenu') {
            e.preventDefault();
        } else {
            onSubmapChange(title);
        }
    };

    const birdStatueExitId = birdStatueSanityPool && birdStatueSanityPool.exit;

    const displayMenu = useCallback(
        (e: React.UIEvent) => {
            if (birdStatueExitId) {
                onChooseEntrance(birdStatueExitId);
            }
            e.preventDefault();
        },
        [birdStatueExitId, onChooseEntrance],
    );

    const handleBack = (e: TriggerEvent | React.UIEvent) => {
        if (e.type === 'contextmenu') {
            e.preventDefault();
            onSubmapChange(undefined);
        } else {
            onSubmapChange(undefined);
        }
    };

    const markerElement = (
        <Marker
            x={markerX}
            y={markerY}
            variant={title.includes('Silent Realm') ? 'circle' : 'rounded'}
            color={markerColor}
            mapWidth={mapWidth}
            tooltip={tooltip}
            onClick={handleClick}
            onContextMenu={displayMenu}
        >
            {(accessibleChecks > 0) ? accessibleChecks : needsBirdStatueSanityExit ? '?' : ''}
        </Marker>
    );

    const mapElement = (
        <div>
            {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
            <img src={map} alt={`${title} Map`} width={mapWidth} style={{position: 'relative'}} onContextMenu={handleBack}/>
            {markers.map((marker) => (
                <MapMarker
                    key={marker.region}
                    markerX={marker.markerX}
                    markerY={marker.markerY}
                    title={marker.region}
                    mapWidth={mapWidth}
                    onGlickGroup={onGroupChange}
                />
            ))}
            {entranceMarkers.map((entrance) => {
                const { exitId, exitName } = getExit(logic, entrance);
                return (
                    <EntranceMarker
                        key={exitId}
                        markerX={entrance.markerX}
                        markerY={entrance.markerY}
                        title={exitName}
                        mapWidth={mapWidth}
                        active={title === activeSubmap}
                        exitId={exitId}
                        onGlickGroup={onGroupChange}
                    />
                );
            })}
            <div
                onKeyDown={keyDownWrapper(handleBack)}
                onClick={handleBack}
                onContextMenu={handleBack}
                role="button"
                tabIndex={0}
            >
                <img alt="Back to Sky" src={images[exitParams.image]} width={exitParams.width * mapWidth / 100} style={{position: 'absolute', left: `${exitParams.left}%`, top: `${exitParams.top}%`}}/>
            </div>
        </div>
    );
    
    return (
        <div className="submap">
            <div style={{display:(title === activeSubmap ? '' : 'none')}}>
                {mapElement}
            </div>
            <div style={{display:(!activeSubmap ? '' : 'none')}}>
                {markerElement}
            </div>
        </div>
    );
};

export default Submap;
