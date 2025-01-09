import { useSelector } from 'react-redux';
import eldinMap from '../../assets/maps/Eldin.png';
import faronMap from '../../assets/maps/Faron.png';
import lanayruMap from '../../assets/maps/Lanayru.png';
import skyMap from '../../assets/maps/Sky.png';
import skyloftMap from '../../assets/maps/Skyloft.png';
import mapData from '../../data/mapData.json';
import type {
    InterfaceAction,
    InterfaceState,
} from '../../tracker/TrackerInterfaceReducer';
import MapMarker from './MapMarker';
import { mapModelSelector } from './Selectors';
import StartingEntranceMarker from './StartingEntranceMarker';
import Submap from './Submap';

const images: Record<string, string> = {
    skyloftMap,
    faronMap,
    eldinMap,
    lanayruMap,
};

export const WORLD_MAP_ASPECT_RATIO = 843 / 465;

function WorldMap({
    width,
    interfaceState,
    interfaceDispatch,
}: {
    width: number;
    interfaceState: InterfaceState;
    interfaceDispatch: React.Dispatch<InterfaceAction>;
}) {
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

    return (
        <div
            style={{
                position: 'relative',
                userSelect: 'none',
                width,
                height: width / WORLD_MAP_ASPECT_RATIO,
                containerType: 'inline-size',
            }}
        >
            {!activeSubmap && (
                <>
                    {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
                    <img
                        src={skyMap}
                        alt="World Map"
                        width="100%"
                        onContextMenu={(e) => {
                            e.preventDefault();
                        }}
                    />
                    <StartingEntranceMarker
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
                        submarkerPlacement="right"
                        selected={marker.hintRegion === currentRegionOrExit}
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
                        exitParams={entry.exitParams}
                        activeSubmap={activeSubmap}
                        currentRegionOrExit={currentRegionOrExit}
                    />
                );
            })}
        </div>
    );
}

export default WorldMap;
