import skyMap from '../../assets/maps/Sky.png';
import faronMap from '../../assets/maps/Faron.png';
import eldinMap from '../../assets/maps/Eldin.png';
import lanayruMap from '../../assets/maps/Lanayru.png';
import skyloftMap from '../../assets/maps/Skyloft.png';
import MapMarker from './MapMarker';
import Submap from './Submap';
import mapData from '../../data/mapData.json';
import { useSelector } from 'react-redux';
import StartingEntranceMarker from './StartingEntranceMarker';
import type {
    InterfaceAction,
    InterfaceState,
} from '../../tracker/TrackerInterfaceReducer';
import { mapModelSelector } from './Selectors';
import { LocationsEntrancesList } from '../LocationsEntrancesList';

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
    imgWidth: number;
    containerHeight: number;
    interfaceState: InterfaceState;
    interfaceDispatch: React.Dispatch<InterfaceAction>;
}) {
    let imgWidth = imgWidth_;
    // original image dimensions
    const aspectRatio = 843 / 465;
    let imgHeight = imgWidth / aspectRatio;
    if (imgHeight > containerHeight * 0.55) {
        imgHeight = containerHeight * 0.55;
        imgWidth = imgHeight * aspectRatio;
    }

    const mapModel = useSelector(mapModelSelector);

    const activeSubmap = interfaceState.mapView;
    const handleGroupClick = (hintRegion: string | undefined) => {
        if (hintRegion) {
            interfaceDispatch({ type: 'selectHintRegion', hintRegion });
        } else {
            interfaceDispatch({ type: 'leaveMapView' });
        }
    };
    const handleSubmapClick = (submap: string | undefined) => {
        if (submap) {
            interfaceDispatch({ type: 'selectMapView', province: submap });
        } else {
            interfaceDispatch({ type: 'leaveMapView' });
        }
    };

    const onChooseEntrance = (exitId: string) =>
        interfaceDispatch({ type: 'chooseEntrance', exitId });

    const currentRegionOrExit =
        interfaceState.type === 'choosingEntrance'
            ? interfaceState.exitId
            : interfaceState.hintRegion;

    // TODO make the WorldMap a standalone map component
    // and move the LocationsEntrancesList into the main
    // tracker layout
    return (
        <div>
            <div
                style={{
                    position: 'absolute',
                    userSelect: 'none',
                    width: imgWidth,
                    height: imgWidth / aspectRatio,
                }}
            >
                <div>
                    {!activeSubmap && (
                        <>
                            {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
                            <img
                                src={skyMap}
                                alt="World Map"
                                width={imgWidth}
                                onContextMenu={(e) => {
                                    e.preventDefault();
                                }}
                            />
                            <StartingEntranceMarker
                                mapWidth={imgWidth}
                                onClick={(exitId) =>
                                    interfaceDispatch({
                                        type: 'chooseEntrance',
                                        exitId,
                                    })
                                }
                                selected={currentRegionOrExit === '\\Start'}
                            />
                        </>
                    )}
                    {mapModel.regions.map((marker) => (
                        <div
                            key={marker.hintRegion}
                            style={{ display: !activeSubmap ? '' : 'none' }}
                        >
                            <MapMarker
                                markerX={marker.markerX}
                                markerY={marker.markerY}
                                title={marker.hintRegion!}
                                onGlickGroup={handleGroupClick}
                                mapWidth={imgWidth}
                                selected={
                                    marker.hintRegion === currentRegionOrExit
                                }
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
                                currentRegionOrExit={currentRegionOrExit}
                            />
                        );
                    })}
                </div>
            </div>
            <div
                style={{
                    position: 'relative',
                    top: imgHeight + 10,
                    display: 'flex',
                }}
            >
                <div
                    style={{
                        width: imgWidth,
                        height: containerHeight * 0.43,
                    }}
                >
                    <LocationsEntrancesList
                        includeHeader
                        interfaceState={interfaceState}
                        interfaceDispatch={interfaceDispatch}
                    />
                </div>
            </div>
        </div>
    );
}

export default WorldMap;
