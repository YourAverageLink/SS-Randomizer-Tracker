import { useLayoutEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
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
        </MakeTooltipsAvailable>
    );
}

function Tracker() {
    useSyncTrackerStateToLocalStorage();

    useLayoutEffect(() => {
        document.querySelector('html')?.classList.add('overflowHidden');
        return () =>
            document.querySelector('html')?.classList.remove('overflowHidden');
    }, []);

    return (
        <>
            <div
                style={{
                    position: 'absolute',
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
                        <Button>← Options</Button>
                    </Link>
                </div>
                <div>
                    <ExportButton />
                </div>
                <div>
                    <Button
                        variant="primary"
                        onClick={() => setShowEntranceDialog(true)}
                    >
                        Entrances
                    </Button>
                </div>
                <div>
                    <Button
                        variant="primary"
                        onClick={() => setShowCustomizationDialog(true)}
                    >
                        Customization
                    </Button>
                </div>
            </div>
            <CustomizationModal
                show={showCustomizationDialog}
                onHide={() => setShowCustomizationDialog(false)}
            />
            <EntranceTracker
                show={showEntranceDialog}
                onHide={() => setShowEntranceDialog(false)}
            />
        </>
    );
}
