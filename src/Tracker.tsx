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
import GridTracker from './itemTracker/GridTracker';
import ItemTracker from './itemTracker/ItemTracker';
import { NewLocationTracker } from './locationTracker/LocationTracker';
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
        return <Navigate to="/" />
    }

    return (
        <MakeTooltipsAvailable>
            <Tracker />
        </MakeTooltipsAvailable>
    );
}

function Tracker() {
    const { height, width } = useWindowDimensions();

    const [showCustomizationDialog, setShowCustomizationDialog] = useState(false);
    const [showEntranceDialog, setShowEntranceDialog] = useState(false);
    const itemLayout = useSelector(itemLayoutSelector);
    const locationLayout = useSelector(locationLayoutSelector);

    useSyncTrackerStateToLocalStorage();

    const [trackerInterfaceState, trackerInterfaceDispatch] = useTrackerInterfaceReducer();

    const setActiveArea = (area: string) => trackerInterfaceDispatch({ type: 'selectHintRegion', hintRegion: area })

    useLayoutEffect(() => {
        document.querySelector('html')?.classList.add('overflowHidden');
        return () => document.querySelector('html')?.classList.remove('overflowHidden');
    }, []);

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
            <ItemTracker
                maxHeight={height * (locationLayout === 'map' ? 0.9 : 1)}
                /* this is supposed to be *a bit* more than 1/3. Min keeps it visible when the window is short */
                maxWidth={(12 * width) / 30}
                mapMode={locationLayout === 'map'}
            />
        );
    } else if (itemLayout === 'grid') {
        itemTracker = (
            <GridTracker
                width={2 * width / 5}
                maxHeight={height}
                mapMode={locationLayout === 'map'}
            />
        );
    }


    let mainTracker: React.ReactNode;
    if (locationLayout === 'list') {
        mainTracker = (
            <>
                <div style={{ flex: '0 0 auto', width: '33.333%' }}>
                    <div style={{ padding: '0 0.75rem' }}>{itemTracker}</div>
                </div>
                <div style={{ flex: '0 0 auto', width: '33.333%', zIndex: 1 }}>
                    <div style={{ padding: '0 0.75rem' }}>
                        <NewLocationTracker
                            interfaceDispatch={trackerInterfaceDispatch}
                            interfaceState={trackerInterfaceState}
                            containerHeight={height * 0.95}
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
                            padding: '0 0.75rem',
                            display: 'flex',
                            height: '100%',
                            flexFlow: 'column nowrap',
                            gap: '2%',
                            paddingBottom: '2%',
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
        mainTracker = (
            <>
                <div style={{ flex: '0 0 auto', width: '33.333%' }}>
                    <div style={{padding: '0 0.75rem'}}>
                        <DungeonTracker setActiveArea={setActiveArea} compact />
                        {itemTracker}
                    </div>
                </div>
                <div style={{ zIndex: 1, flex: '0 0 auto', width: '50%' }}>
                    <div style={{padding: '0 0.75rem'}}>
                        <WorldMap
                            imgWidth={width * 0.5}
                            containerHeight={height * 0.95}
                            interfaceDispatch={trackerInterfaceDispatch}
                            interfaceState={trackerInterfaceState}
                        />
                    </div>
                </div>
                <div
                    style={{
                        flex: '0 0 auto',
                        height: '100%',
                        width: '16.666667%'
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
                        <div style={{height: '100%'}}>
                            <HintsTracker />
                        </div>
                    </div>
                </div>
            </>
        );
    }

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
                <div style={{ height: '95%', position: 'relative', zIndex: 0, display: 'flex', flexFlow: 'row nowrap' }}>{mainTracker}</div>
                <div
                    style={{
                        position: 'fixed',
                        bottom: 0,
                        left: 0,
                        background: 'lightgrey',
                        width: '100%',
                        height: '5%',
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
