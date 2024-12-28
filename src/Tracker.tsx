import {
    useLayoutEffect,
    useMemo,
    useState,
    useSyncExternalStore,
} from 'react';
import { Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import BasicCounters from './BasicCounters';
import EntranceTracker from './entranceTracker/EntranceTracker';
import DungeonTracker from './itemTracker/DungeonTracker';
import GridTracker, { GRID_TRACKER_ASPECT_RATIO } from './itemTracker/GridTracker';
import ItemTracker, { ITEM_TRACKER_ASPECT_RATIO } from './itemTracker/ItemTracker';
import { LocationTracker } from './locationTracker/LocationTracker';
import { MakeTooltipsAvailable } from './tooltips/TooltipHooks';
import CustomizationModal from './customization/CustomizationModal';
import { itemLayoutSelector, locationLayoutSelector } from './customization/selectors';
import WorldMap from './locationTracker/mapTracker/WorldMap';
import { Link, Navigate } from 'react-router-dom';
import { isLogicLoadedSelector } from './logic/selectors';
import { ExportButton } from './ImportExport';
import { useSyncTrackerStateToLocalStorage } from './LocalStorage';
import { HintsTracker } from './hints/HintsTracker';
import { useTrackerInterfaceReducer } from './tracker/TrackerInterfaceReducer';
import { ItemTrackerContainer } from './itemTracker/ItemTrackerContainer';
import LocationContextMenu from './locationTracker/LocationContextMenu';
import LocationGroupContextMenu from './locationTracker/LocationGroupContextMenu';

function subscribeToWindowResize(callback: () => void) {
    window.addEventListener('resize', callback);
    return () => {
        window.removeEventListener('resize', callback);
    };
}

function useWindowDimensions() {
    const width = useSyncExternalStore(
        subscribeToWindowResize,
        () => window.innerWidth,
    );
    const height = useSyncExternalStore(
        subscribeToWindowResize,
        () => window.innerHeight,
    );

    return useMemo(
        () => ({
            width,
            height,
        }),
        [width, height],
    );
}

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
    const { height, width } = useWindowDimensions();

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
                    <TrackerContents width={width} height={height * 0.95} />
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

function TrackerContents({ width, height }: { width: number; height: number }) {
    const itemLayout = useSelector(itemLayoutSelector);
    const locationLayout = useSelector(locationLayoutSelector);

    const [trackerInterfaceState, trackerInterfaceDispatch] =
        useTrackerInterfaceReducer();

    const setActiveArea = (area: string) =>
        trackerInterfaceDispatch({
            type: 'selectHintRegion',
            hintRegion: area,
        });

    // Warning: Layout horrors below.
    // This main tracker area used to be implemented with react-bootstrap's
    // Row and Col types while importing bootstrap v4 AND bootstrap v5 CSS
    // at the same time, and then there was some manual adjustment and
    // styling to get things to behave. So there's a bit of a chicken-and-egg
    // problem where much of the calculations and widths rely on the bootstrap
    // styles, both in this component and the subcomponents. bootstrap has been
    // removed from everything in <Tracker> and below, but we need some of the existing
    // styles so that e.g. the item tracker width calculations match up and I don't
    // want to revamp the main layout yet until more components behave predictably
    // and use modern CSS solutions with fewer manual calculations.

    let itemTracker;
    if (itemLayout === 'inventory') {
        itemTracker = (
            <ItemTrackerContainer
                aspectRatio={ITEM_TRACKER_ASPECT_RATIO}
                itemTracker={(width) => <ItemTracker width={width} />}
            />
        );
    } else if (itemLayout === 'grid') {
        itemTracker = (
            <ItemTrackerContainer
                aspectRatio={GRID_TRACKER_ASPECT_RATIO}
                itemTracker={(width) => <GridTracker width={width} />}
            />
        );
    }

    const contextMenus = (
        <>
            <LocationContextMenu />
            <LocationGroupContextMenu interfaceDispatch={trackerInterfaceDispatch} />
        </>
    );

    if (locationLayout === 'list') {
        return (
            <>
                {contextMenus}
                <div style={{ flex: '0 0 auto', width: '33.333%' }}>
                    <div
                        style={{
                            padding: '0.75rem',
                            height: '100%',
                            width: '100%',
                        }}
                    >
                        {itemTracker}
                    </div>
                </div>
                <div style={{ flex: '0 0 auto', width: '33.333%' }}>
                    <div style={{ padding: '0 0.75rem' }}>
                        <LocationTracker
                            interfaceDispatch={trackerInterfaceDispatch}
                            interfaceState={trackerInterfaceState}
                            containerHeight={height}
                        />
                    </div>
                </div>
                <div
                    style={{
                        flex: '0 0 auto',
                        height: '100%',
                        width: '33.333%',
                    }}
                >
                    <div
                        style={{
                            padding: '0 0.75rem 2% 0.75rem',
                            display: 'flex',
                            height: '100%',
                            flexFlow: 'column nowrap',
                            gap: '2%',
                        }}
                    >
                        <BasicCounters />
                        <DungeonTracker setActiveArea={setActiveArea} />
                        <div style={{ height: '100%' }}>
                            <HintsTracker />
                        </div>
                    </div>
                </div>
            </>
        );
    } else {
        return (
            <>
                {contextMenus}
                <div style={{ flex: '0 0 auto', width: '33.333%' }}>
                    <div
                        style={{
                            padding: '0 0.75rem 0.75rem 0.75rem',
                            display: 'flex',
                            flexFlow: 'column',
                            height: '100%',
                            width: '100%',
                            gap: '1%',
                        }}
                    >
                        <DungeonTracker setActiveArea={setActiveArea} compact />
                        {itemTracker}
                    </div>
                </div>
                <div style={{ flex: '0 0 auto', width: '50%' }}>
                    <div style={{ padding: '0 0.75rem' }}>
                        <WorldMap
                            imgWidth={width * 0.5}
                            containerHeight={height}
                            interfaceDispatch={trackerInterfaceDispatch}
                            interfaceState={trackerInterfaceState}
                        />
                    </div>
                </div>
                <div
                    style={{
                        flex: '0 0 auto',
                        height: '100%',
                        width: '16.666667%',
                    }}
                >
                    <div
                        style={{
                            padding: '0 0.75rem',
                            display: 'flex',
                            height: '100%',
                            flexFlow: 'column nowrap',
                            gap: '2%',
                        }}
                    >
                        <BasicCounters />
                        <div style={{ height: '100%' }}>
                            <HintsTracker />
                        </div>
                    </div>
                </div>
            </>
        );
    }
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
