import skyMap from '../../assets/maps/Sky.png';
import faronMap from '../../assets/maps/Faron.png';
import eldinMap from '../../assets/maps/Eldin.png';
import lanayruMap from '../../assets/maps/Lanayru.png';
import skyloftMap from '../../assets/maps/Skyloft.png';
import MapMarker from './MapMarker';
import Submap from './Submap';
import mapData from '../../data/mapData.json';
import LocationContextMenu from '../LocationContextMenu';
import LocationGroupContextMenu from '../LocationGroupContextMenu';
import { areasSelector } from '../../tracker/selectors';
import { useSelector } from 'react-redux';
import StartingEntranceMarker from './StartingEntranceMarker';
import LocationGroupHeader from '../LocationGroupHeader';
import { Locations } from '../Locations';
import { InterfaceAction, InterfaceState } from '../../tracker/TrackerInterfaceReducer';
import EntranceChooser from '../EntranceChooser';
import { mapModelSelector } from './Selectors';


const images: Record<string, string> = {
    skyloftMap,
    faronMap,
    eldinMap,
    lanayruMap,
};

function WorldMap({
    imgWidth: imgWidth_,
    containerHeight,
    interfaceState,
    interfaceDispatch,
}: {
    imgWidth: number,
    containerHeight: number,
    interfaceState: InterfaceState;
    interfaceDispatch: React.Dispatch<InterfaceAction>;
}) {
    let imgWidth = imgWidth_;
    // original image dimensions
    const aspectRatio = 843/465;
    let imgHeight = imgWidth / aspectRatio;
    if (imgHeight > containerHeight * 0.55) {
        imgHeight = containerHeight * 0.55;
        imgWidth = imgHeight * aspectRatio;
    }

    const mapModel = useSelector(mapModelSelector);

    const activeSubmap = interfaceState.mapView;
    const handleGroupClick = (hintRegion: string | undefined) => {
        if (hintRegion) {
            interfaceDispatch({ type: 'selectHintRegion', hintRegion })
        } else {
            interfaceDispatch({ type: 'leaveMapView' });
        }
    };
    const expandedGroup = interfaceState.type === 'viewingChecks' ? interfaceState.hintRegion : undefined;
    const handleSubmapClick = (submap: string | undefined) => {
        if (submap) {
            interfaceDispatch({ type: 'selectMapView', province: submap });
        } else {
            interfaceDispatch({ type: 'leaveMapView' });
        }
    };

    const onChooseEntrance = (exitId: string) => interfaceDispatch({ type: 'chooseEntrance', exitId });
    
    const worldMap = (
        <div style={{position:'absolute', width:imgWidth, height:imgWidth / aspectRatio}}>
            <div>
                {!activeSubmap &&
                    <>
                        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
                        <img src={skyMap} alt="World Map" width={imgWidth} onContextMenu={(e) => {
                            e.preventDefault();
                        }} />
                        <StartingEntranceMarker mapWidth={imgWidth} onClick={(exitId) => interfaceDispatch({ type: 'chooseEntrance', exitId })} />
                    </>
                }
                {mapModel.regions.map((marker) => (
                    <div key={marker.hintRegion} style={{display:(!activeSubmap ? '' : 'none')}}>
                        <MapMarker
                            markerX={marker.markerX}
                            markerY={marker.markerY}
                            title={marker.hintRegion!}
                            onGlickGroup={handleGroupClick}
                            mapWidth={imgWidth}
                        />
                    </div>
                ))}
                {mapModel.provinces.map((submap) => {
                    const entry = mapData[submap.provinceId];
                    return (
                        <Submap
                            key={submap.provinceId}
                            provinceId={submap.provinceId}
                            markerX={entry.markerX}
                            markerY={entry.markerY}
                            title={submap.name}
                            onGroupChange={handleGroupClick}
                            onSubmapChange={handleSubmapClick}
                            onChooseEntrance={onChooseEntrance}
                            markers={submap.regions}
                            map={images[entry.map]}
                            mapWidth={imgWidth}
                            exitParams={entry.exitParams}
                            activeSubmap={activeSubmap}
                        />
                    )
                })}
            </div>
            <LocationContextMenu />
            <LocationGroupContextMenu interfaceDispatch={interfaceDispatch} />
        </div>
    );

    const areas = useSelector(areasSelector);

    const selectedArea = expandedGroup && areas.find((a) => a.name === expandedGroup) || undefined;

    const locationHeader = selectedArea && (
        <div style={{
            display: 'flex',
            width: imgWidth,
            position: 'relative',
            top: imgHeight + 10,
        }}>
            <div style={{margin: '2%', width: '100%'}}>
                <LocationGroupHeader alignCounters area={selectedArea} setActiveArea={handleGroupClick}/>
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
                    <Locations onChooseEntrance={onChooseEntrance} hintRegion={selectedArea} />
                </div>
            )}
            {interfaceState.type === 'choosingEntrance' && (
                <div
                    style={{
                        width: imgWidth,
                        height: containerHeight * 0.40,
                    }}
                >
                    <EntranceChooser
                        exitId={interfaceState.exitId}
                        onChoose={(entranceId) =>
                            interfaceDispatch({
                                type: 'cancelChooseEntrance',
                                selectedEntrance: entranceId,
                            })
                        }
                    />
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
