import {
    useMemo,
    useState,
    useSyncExternalStore,
} from 'react';
import { Button } from 'react-bootstrap';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
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
                <Col>
                    {itemTracker}
                </Col>
                <Col style={{ zIndex: 1 }}>
                    <NewLocationTracker
                        interfaceDispatch={trackerInterfaceDispatch}
                        interfaceState={trackerInterfaceState}
                        containerHeight={height * 0.95}
                    />
                </Col>
                <Col
                    style={{
                        display: 'flex',
                        flexFlow: 'column nowrap',
                        height: '100%',
                    }}
                >
                    <Row>
                        <BasicCounters />
                    </Row>
                    <Row>
                        <DungeonTracker setActiveArea={setActiveArea} />
                    </Row>
                    <Row style={{height: '100%'}}>
                        <HintsTracker />
                    </Row>
                </Col>
            </>
        );
    } else {
        mainTracker = (
            <>
                <Col xs={4}>
                    {itemTracker}
                    <DungeonTracker setActiveArea={setActiveArea} compact />
                </Col>
                <Col xs={6} style={{ zIndex: 1 }}>
                    <WorldMap
                        imgWidth={width * 0.5}
                        containerHeight={height * 0.95}
                        interfaceDispatch={trackerInterfaceDispatch}
                        interfaceState={trackerInterfaceState}
                    />
                </Col>
                <Col
                    xs={2}
                    style={{
                        display: 'flex',
                        flexFlow: 'column nowrap',
                        height: '100%',
                    }}
                >
                    <Row>
                        <BasicCounters />
                    </Row>
                    <Row style={{height: '100%'}}>
                        <HintsTracker />
                    </Row>
                </Col>
            </>
        );
    }

    return (
        <div
            style={{
                height: height * 0.95,
                overflow: 'hidden',
                background: 'var(--scheme-background)',
            }}
        >
            <Container fluid style={{ height: '100%' }}>
                <Row style={{ height: '100%' }}>{mainTracker}</Row>
                <div
                    style={{
                        position: 'fixed',
                        bottom: 0,
                        left: 0,
                        background: 'lightgrey',
                        width: '100%',
                        height: height * 0.05,
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
            </Container>
            <CustomizationModal
                show={showCustomizationDialog}
                onHide={() => setShowCustomizationDialog(false)}
            />
            <EntranceTracker
                show={showEntranceDialog}
                onHide={() => setShowEntranceDialog(false)}
            />
        </div>
    );
}
