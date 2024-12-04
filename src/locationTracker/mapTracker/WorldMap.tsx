import skyMap from '../../assets/maps/Sky.png';
import faronMap from '../../assets/maps/Faron.png';
import eldinMap from '../../assets/maps/Eldin.png';
import lanayruMap from '../../assets/maps/Lanayru.png';
import skyloftMap from '../../assets/maps/Skyloft.png';
import MapMarker from './MapMarker';
import Submap, { EntranceMarkerParams } from './Submap';
import mapData from '../../data/mapData.json';
import LocationContextMenu from '../LocationContextMenu';
import LocationGroupContextMenu from '../LocationGroupContextMenu';
import { areaHintSelector, areasSelector } from '../../tracker/selectors';
import { useSelector } from 'react-redux';
import StartingEntranceMarker from './StartingEntranceMarker';
import AreaCounters from '../AreaCounters';
import { decodeHint } from '../Hints';
import { useContextMenu } from '../context-menu';
import { LocationGroupContextMenuProps } from '../LocationGroupHeader';
import { useCallback, MouseEvent } from 'react';
import { Locations } from '../Locations';

type WorldMapProps = {
    imgWidth: number,
    handleGroupClick: (group: string | undefined) => void
    handleSubmapClick: (submap: string | undefined) => void,
    containerHeight: number,
    expandedGroup: string | undefined,
    activeSubmap: string | undefined,
};

const images: Record<string, string> = {
    skyloftMap,
    faronMap,
    eldinMap,
    lanayruMap,
};

const WorldMap = (props: WorldMapProps) => {
    const { containerHeight, activeSubmap, expandedGroup, handleGroupClick, handleSubmapClick } = props;
    let { imgWidth } = props;
    // original image dimensions
    const aspectRatio = 843/465;
    let imgHeight = imgWidth / aspectRatio;
    if (imgHeight > containerHeight * 0.55) {
        imgHeight = containerHeight * 0.55;
        imgWidth = imgHeight * aspectRatio;
    }
    const {
        skyloftSubmap,
        faronSubmap,
        eldinSubmap,
        lanayruSubmap,
        thunderhead,
        sky,
    } = mapData;

    const submaps = [
        faronSubmap,
        skyloftSubmap,
        eldinSubmap,
        lanayruSubmap,
    ];

    const markers = [
        thunderhead,
        sky,
    ];


    const worldMap = (
        <div style={{position:'absolute', width:imgWidth, height:imgWidth / aspectRatio}}>
            <div>
                {!activeSubmap &&
                    <>
                        <img src={skyMap} alt="World Map" width={imgWidth} onContextMenu={(e) => {
                            e.preventDefault();
                        }} />
                        <StartingEntranceMarker mapWidth={imgWidth} />
                    </>
                }
                {markers.map((marker) => (
                    <div key={marker.region} style={{display:(!activeSubmap ? '' : 'none')}}>
                        <MapMarker
                            markerX={marker.markerX}
                            markerY={marker.markerY}
                            title={marker.region}
                            onGlickGroup={handleGroupClick}
                            mapWidth={imgWidth}
                        />
                    </div>
                ))}
                {submaps.map((submap) => (
                    <Submap
                        key={submap.name}
                        markerX={submap.markerX}
                        markerY={submap.markerY}
                        title={submap.name}
                        onGroupChange={handleGroupClick}
                        onSubmapChange={handleSubmapClick}
                        markers={submap.markers}
                        entranceMarkers={submap.entranceMarkers as EntranceMarkerParams[]}
                        map={images[submap.map]}
                        mapWidth={imgWidth}
                        exitParams={submap.exitParams}
                        activeSubmap={activeSubmap}
                    />
                ))}
            </div>
            <LocationContextMenu />
            <LocationGroupContextMenu />
        </div>
    );

    const areas = useSelector(areasSelector);

    const selectedArea = expandedGroup && areas.find((a) => a.name === expandedGroup) || undefined;
    const areaHint = useSelector(areaHintSelector(selectedArea?.name ?? ''));
    const hint = areaHint && decodeHint(areaHint);

    const show = useContextMenu<LocationGroupContextMenuProps>({
        id: 'group-context',
    }).show;

    const displayMenu = useCallback((e: MouseEvent) => {
        if (selectedArea) {
            show({ event: e, props: { area: selectedArea.name } });
        }
    }, [selectedArea, show]);

    const locationHeader = selectedArea && (
        <div
            className="flex-container"
            tabIndex={0}
            role="button"
            onContextMenu={displayMenu}
            style={{
                display: 'flex',
                flexDirection: 'row',
                width: imgWidth,
                position: 'relative',
                top: imgHeight + 10,
            }}
        >
            <div style={{ flexGrow: 1, margin: '2%' }}>
                <h3>{selectedArea.name}</h3>
            </div>
            <div style={{ margin: '1%' }}>
                <span>
                    {hint && (
                        <img
                            style={{ height: '40px' }}
                            src={hint.image}
                            alt={hint.description}
                        />
                    )}
                </span>
            </div>
            <div style={{ margin: '2%' }}>
                <h3>
                    <AreaCounters
                        totalChecksLeftInArea={selectedArea.numChecksRemaining}
                        totalChecksAccessible={selectedArea.numChecksAccessible}
                    />
                </h3>
            </div>
        </div>
    );
    
    const locationList = (
        <div
            style={{
                position: 'relative',
                top: imgHeight + 10,
                display: 'flex',
            }}
        >
            {selectedArea && (
                <div
                    style={{
                        width: imgWidth,
                        height: containerHeight * 0.35,
                        overflowY: 'scroll',
                        overflowX: 'visible',
                    }}
                >
                    <Locations hintRegion={selectedArea} />
                </div>
            )}
        </div>
    );


    return (
        <div>
            {worldMap}
            {locationHeader}
            {locationList}
        </div>
    );
}

export default WorldMap;
