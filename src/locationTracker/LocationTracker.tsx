import type {
    InterfaceAction,
    InterfaceState,
} from '../tracker/TrackerInterfaceReducer';
import { LocationGroupList } from './LocationGroupList';
import { LocationsEntrancesList } from './LocationsEntrancesList';

// TODO absorb this into the main tracker component, since this is not a standalone component
export function LocationTracker({
    containerHeight,
    interfaceState,
    interfaceDispatch,
}: {
    containerHeight: number;
    interfaceState: InterfaceState;
    interfaceDispatch: React.Dispatch<InterfaceAction>;
}) {
    return (
        <div>
            <div
                style={{
                    height: containerHeight / 2,
                    overflowY: 'auto',
                    overflowX: 'visible',
                }}
            >
                <LocationGroupList interfaceDispatch={interfaceDispatch} />
            </div>
            <div
                style={{
                    height: containerHeight / 2,
                }}
            >
                <LocationsEntrancesList
                    interfaceState={interfaceState}
                    interfaceDispatch={interfaceDispatch}
                />
            </div>
        </div>
    );
}
