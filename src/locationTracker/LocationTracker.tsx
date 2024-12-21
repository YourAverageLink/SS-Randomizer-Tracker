
import LocationGroupHeader from "./LocationGroupHeader";
import { Locations } from "./Locations";
import LocationGroupContextMenu from "./LocationGroupContextMenu";
import LocationContextMenu from "./LocationContextMenu";
import { useSelector } from "react-redux";
import { areasSelector } from "../tracker/selectors";
import { isDungeon } from "../logic/Locations";
import { InterfaceAction, InterfaceState } from "../tracker/TrackerInterfaceReducer";
import EntranceChooser from "./EntranceChooser";

export function NewLocationTracker({
    containerHeight,
    interfaceState,
    interfaceDispatch
}: {
    containerHeight: number;
    interfaceState: InterfaceState;
    interfaceDispatch: React.Dispatch<InterfaceAction>;
}) {
    const areas = useSelector(areasSelector);
    const activeArea = interfaceState.type === 'viewingChecks' ? interfaceState.hintRegion : undefined;
    const selectedArea = activeArea && areas.find((a) => a.name === activeArea) || undefined;
    const setActiveArea = (area: string) =>
        interfaceDispatch({ type: 'selectHintRegion', hintRegion: area });
    const onChooseEntrance = (exitId: string) => interfaceDispatch({ type: 'chooseEntrance', exitId });

    return (
        <div>
            <LocationContextMenu />
            <LocationGroupContextMenu interfaceDispatch={interfaceDispatch} />
            <div
                style={{
                    height: containerHeight / 2,
                    overflowY: 'auto',
                    overflowX: 'visible',
                }}
            >
                <div style={{ padding: '2%' }}>
                    {areas
                        .filter(
                            (area) =>
                                !isDungeon(area.name) &&
                                !area.name.includes('Silent Realm') &&
                                !area.nonProgress,
                        )
                        .map((value) => (
                            <LocationGroupHeader
                                setActiveArea={setActiveArea}
                                key={value.name}
                                area={value}
                            />
                        ))}
                </div>
            </div>
            {selectedArea && (
                <div
                    style={{
                        height: containerHeight / 2,
                        overflowY: 'auto',
                        overflowX: 'visible',
                    }}
                >
                    <Locations onChooseEntrance={onChooseEntrance} hintRegion={selectedArea} />
                </div>
            )}
            {interfaceState.type === 'choosingEntrance' && (
                <div
                    style={{
                        height: containerHeight / 2,
                        overflowY: 'auto',
                        overflowX: 'visible',
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
}