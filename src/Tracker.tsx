import { useState } from 'react';
import { useSelector } from 'react-redux';
import EntranceTracker from './entranceTracker/EntranceTracker';
import { MakeTooltipsAvailable } from './tooltips/TooltipHooks';
import CustomizationModal from './customization/CustomizationModal';
import { Link, Navigate } from 'react-router-dom';
import { isLogicLoadedSelector } from './logic/Selectors';
import { ExportButton } from './ImportExport';
import { useSyncTrackerStateToLocalStorage } from './LocalStorage';
import { useTrackerInterfaceReducer } from './tracker/TrackerInterfaceReducer';
import LocationContextMenu from './locationTracker/LocationContextMenu';
import LocationGroupContextMenu from './locationTracker/LocationGroupContextMenu';
import { TrackerLayout } from './layouts/TrackerLayouts';
import { hasCustomLayoutSelector } from './customization/Selectors';
import { TrackerLayoutCustom } from './layouts/TrackerLayoutCustom';

export default function TrackerContainer() {
    const logicLoaded = useSelector(isLogicLoadedSelector);

    // If we haven't loaded logic yet, redirect to the main menu,
    // which will take care of loading logic for us.
    if (!logicLoaded) {
        return <Navigate to="/" />;
    }

    return (
        <MakeTooltipsAvailable>
            <Tracker />
            <TrackerStateSaver />
        </MakeTooltipsAvailable>
    );
}

// Split out into separate component to optimize rerenders
function TrackerStateSaver() {
    useSyncTrackerStateToLocalStorage();
    return null;
}

function Tracker() {
    return (
        <>
            <div
                style={{
                    width: '100vw',
                    height: '100vh',
                    overflow: 'hidden',
                    background: 'var(--scheme-background)',
                }}
            >
                <div
                    style={{
                        height: '95%',
                        position: 'relative',
                        display: 'flex',
                        flexFlow: 'row nowrap',
                    }}
                >
                    <TrackerContents />
                </div>
                <div
                    style={{
                        position: 'fixed',
                        bottom: 0,
                        left: 0,
                        width: '100%',
                        height: '5%',
                    }}
                >
                    <TrackerFooter />
                </div>
            </div>
        </>
    );
}

function TrackerContents() {
    const [trackerInterfaceState, trackerInterfaceDispatch] =
        useTrackerInterfaceReducer();

    const hasCustomLayout = useSelector(hasCustomLayoutSelector);

    return (
        <>
            <LocationContextMenu />
            <LocationGroupContextMenu
                interfaceDispatch={trackerInterfaceDispatch}
            />
            {hasCustomLayout ? (
                <TrackerLayoutCustom
                    interfaceDispatch={trackerInterfaceDispatch}
                    interfaceState={trackerInterfaceState}
                />
            ) : (
                <TrackerLayout
                    interfaceDispatch={trackerInterfaceDispatch}
                    interfaceState={trackerInterfaceState}
                />
            )}
        </>
    );
}

function TrackerFooter() {
    const [showCustomizationDialog, setShowCustomizationDialog] =
        useState(false);
    const [showEntranceDialog, setShowEntranceDialog] = useState(false);

    return (
        <>
            <div
                style={{
                    background: 'lightgrey',
                    width: '100%',
                    height: '100%',
                    alignContent: 'center',
                    display: 'flex',
                    flexFlow: 'row nowrap',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                }}
            >
                <div>
                    <Link to="/">
                        <div className="tracker-button">← Options</div>
                    </Link>
                </div>
                <div>
                    <ExportButton />
                </div>
                <div>
                    <button
                        type="button"
                        className="tracker-button"
                        onClick={() => setShowEntranceDialog(true)}
                    >
                        Entrances
                    </button>
                </div>
                <div>
                    <button
                        type="button"
                        className="tracker-button"
                        onClick={() => setShowCustomizationDialog(true)}
                    >
                        Customization
                    </button>
                </div>
            </div>
            <CustomizationModal
                open={showCustomizationDialog}
                onOpenChange={setShowCustomizationDialog}
            />
            <EntranceTracker
                open={showEntranceDialog}
                onOpenChange={setShowEntranceDialog}
            />
        </>
    );
}
