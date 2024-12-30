import { useCallback } from 'react';
import MapMarker from './MapMarker';
import EntranceMarker from './EntranceMarker';
import keyDownWrapper from '../../utils/KeyDownWrapper';
import leaveSkyloft from '../../assets/maps/leaveSkyloft.png';
import leaveFaron from '../../assets/maps/leaveFaron.png';
import leaveEldin from '../../assets/maps/leaveEldin.png';
import leaveLanayru from '../../assets/maps/leaveLanayru.png';
import { useSelector } from 'react-redux';
import { areasSelector, checkSelector, exitsByIdSelector, settingSelector } from '../../tracker/Selectors';
import { areaGraphSelector } from '../../logic/Selectors';
import HintDescription, { type DecodedHint, decodeHint } from '../Hints';
import type { RootState } from '../../store/Store';
import type { TriggerEvent } from 'react-contexify';
import { Marker } from './Marker';
import type { MapHintRegion } from './MapModel';
import { combineRegionCounters, getMarkerColor, getRegionData, getSubmarkerData, initialRegionData } from './MapUtils';

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

const Submap = ({
    onSubmapChange,
    onGroupChange,
    onChooseEntrance,
    provinceId,
    title,
    markerX,
    markerY,
    map,
    activeSubmap,
    markers,
    exitParams,
    currentRegionOrExit,
}: {
    markerX: number;
    markerY: number;
    title: string;
    provinceId: string;
    onGroupChange: (region: string | undefined) => void;
    onSubmapChange: (submap: string | undefined) => void;
    onChooseEntrance: (exitId: string) => void;
    markers: MapHintRegion[];
    activeSubmap: string | undefined;
    map: string;
    exitParams: ExitParams;
    currentRegionOrExit: string | undefined;
}) => {
    const subregionHints: { hint: DecodedHint, area: string }[] = [];
    const areas = useSelector(areasSelector);
    const exits = useSelector(exitsByIdSelector);
    const hints = useSelector((state: RootState) => state.tracker.hints);
    let data = initialRegionData();
    for (const marker of markers) {
        const area = areas.find((area) => area.name === marker.hintRegion);
        if (area) {
            data = combineRegionCounters(data, getRegionData(area));
            const hint = hints[area.name];
            if (hint) {
                subregionHints.push({ area: area.name, hint: decodeHint(hint) });
            }
        }
    }

    const areaGraph = useSelector(areaGraphSelector);

    let markerColor = getMarkerColor(data.checks);

    const birdSanityOn = useSelector(settingSelector('random-start-statues'));
    const birdStatueSanityPool = birdSanityOn && areaGraph.birdStatueSanity[title];
    const needsBirdStatueSanityExit =
        birdStatueSanityPool && exits[birdStatueSanityPool.exit].entrance === undefined;
    const exitCheck = useSelector(
        (state: RootState) =>
            needsBirdStatueSanityExit &&
            checkSelector(birdStatueSanityPool.exit)(state),
    );

    if (exitCheck && exitCheck.logicalState !== 'outLogic' && data.checks.numAccessible === 0) {
        markerColor = exitCheck.logicalState;
    }

    const tooltip = (
        <center>
            <div> {title} ({data.checks.numAccessible}/{data.checks.numRemaining}) </div>
            <div> Click to Expand </div>
            {needsBirdStatueSanityExit && <div>Right-click to choose Statue</div>}
            {subregionHints.map(({hint, area}) => <HintDescription key={area} hint={hint} area={area} />)}
        </center>
    );

    const handleClick = (e: TriggerEvent | React.UIEvent) => {
        if (e.type === 'contextmenu') {
            e.preventDefault();
        } else {
            onSubmapChange(provinceId);
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
            tooltip={tooltip}
            onClick={handleClick}
            onContextMenu={displayMenu}
            selected={currentRegionOrExit === birdStatueExitId}
            submarkers={getSubmarkerData(data)}
        >
            {(data.checks.numAccessible > 0) ? data.checks.numAccessible : needsBirdStatueSanityExit ? '?' : ''}
        </Marker>
    );

    const mapElement = (
        <div>
            {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
            <img src={map} alt={`${title} Map`} width="100%" style={{position: 'relative'}} onContextMenu={handleBack}/>
            {markers.map((marker) => {
                if (marker.type === 'hint_region') {
                    return (
                        <MapMarker
                            key={marker.hintRegion}
                            markerX={marker.markerX}
                            markerY={marker.markerY}
                            title={marker.hintRegion!}
                            onGlickGroup={onGroupChange}
                            selected={
                                marker.hintRegion !== undefined &&
                                    marker.hintRegion === currentRegionOrExit
                            }
                        />
                    )
                } else {
                    return (
                        <EntranceMarker
                            key={marker.exitId}
                            markerX={marker.markerX}
                            markerY={marker.markerY}
                            title={areaGraph.exits[marker.exitId].short_name}
                            active={provinceId === activeSubmap}
                            exitId={marker.exitId}
                            selected={
                                marker.exitId == currentRegionOrExit ||
                                (marker.hintRegion !== undefined &&
                                    marker.hintRegion === currentRegionOrExit)
                            }
                            onGlickGroup={onGroupChange}
                            onChooseEntrance={onChooseEntrance}
                        />
                    );
                }
            })}
            <div
                onKeyDown={keyDownWrapper(handleBack)}
                onClick={handleBack}
                onContextMenu={handleBack}
                role="button"
                tabIndex={0}
            >
                <img alt="Back to Sky" src={images[exitParams.image]} width={`${exitParams.width}%`} style={{position: 'absolute', left: `${exitParams.left}%`, top: `${exitParams.top}%`}}/>
            </div>
        </div>
    );
    
    return (
        <div>
            <div style={{display:(provinceId === activeSubmap ? '' : 'none')}}>
                {mapElement}
            </div>
            <div style={{display:(!activeSubmap ? '' : 'none')}}>
                {markerElement}
            </div>
        </div>
    );
};

export default Submap;
