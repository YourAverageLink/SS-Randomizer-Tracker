import {
    CSSProperties,
    useEffect,
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
import ImportExport from './ImportExport';
import EntranceTracker from './entranceTracker/EntranceTracker';
import DungeonTracker from './itemTracker/DungeonTracker';
import GridTracker from './itemTracker/GridTracker';
import ItemTracker from './itemTracker/ItemTracker';
import ExtraLocationTracker from './locationTracker/ExtraLocationTracker';
import { NewLocationTracker } from './locationTracker/LocationTracker';
import { MakeTooltipsAvailable } from './tooltips/TooltipHooks';
import CustomizationModal from './customization/CustomizationModal';
import { colorSchemeSelector, itemLayoutSelector, locationLayoutSelector } from './customization/selectors';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorPage from './ErrorPage';
import { RootState } from './store/store';
import WorldMap from './locationTracker/mapTracker/WorldMap';
import { Link, Navigate } from 'react-router-dom';
import { isLogicLoadedSelector } from './logic/selectors';

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
        <ErrorBoundary FallbackComponent={ErrorPage}>
            <MakeTooltipsAvailable>
                <Tracker />
            </MakeTooltipsAvailable>
        </ErrorBoundary>
    );
}

function Tracker() {
    const { height, width } = useWindowDimensions();

    const [showCustomizationDialog, setShowCustomizationDialog] = useState(false);
    const [showEntranceDialog, setShowEntranceDialog] = useState(false);
    const [activeArea, setActiveArea] = useState<string | undefined>(undefined);
    const [activeSubmap, setActiveSubmap] = useState<string | undefined>(undefined);

    const colorScheme = useSelector(colorSchemeSelector);
    const itemLayout = useSelector(itemLayoutSelector);
    const locationLayout = useSelector(locationLayoutSelector);
    const rawRemote = useSelector((state: RootState) => state.logic.remote!);

    // TODO: Store observers
    useEffect(() => {
        localStorage.setItem('ssrTrackerColorScheme', JSON.stringify(colorScheme));
    }, [colorScheme]);

    useEffect(() => {
        localStorage.setItem('ssrTrackerLayout', itemLayout);
    }, [itemLayout]);

    useEffect(() => {
        localStorage.setItem('ssrTrackerLocationLayout', locationLayout);
    }, [locationLayout]);

    useEffect(() => {
        localStorage.setItem('ssrTrackerRemoteLogic', JSON.stringify(rawRemote));
    }, [rawRemote]);

    const itemTrackerStyle: CSSProperties = {
        position: 'fixed',
        width: (12 * width) / 30, // this is supposed to be *a bit* more than 1/3. Min keeps it visible when the window is short
        height: height * (locationLayout === 'map' ? 0.9 : 1),
        left: '1%',
        top: 0,
        margin: '1%',
    };
    const gridTrackerStyle: CSSProperties = {
        position: 'relative',
        width: (2 * width) / 5,
        height,
        left: 0,
        top: 0,
        margin: '1%',
    };

    let itemTracker;
    if (itemLayout === 'inventory') {
        itemTracker = (
            <ItemTracker
                styleProps={itemTrackerStyle}
                mapMode={locationLayout === 'map'}
            />
        );
    } else if (itemLayout === 'grid') {
        itemTracker = (
            <GridTracker
                styleProps={gridTrackerStyle}
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
                <Col>
                    <NewLocationTracker
                        activeArea={activeArea}
                        setActiveArea={setActiveArea}
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
                    <Row
                        style={{
                            paddingRight: '10%',
                            paddingTop: '2.5%',
                            height: '100%',
                            overflow: 'auto',
                        }}
                    >
                        <Col>
                            <ExtraLocationTracker
                                activeArea={activeArea}
                                setActiveArea={setActiveArea}
                            />
                        </Col>
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
                <Col xs={6}>
                    <WorldMap
                        imgWidth={width * 0.5}
                        handleGroupClick={setActiveArea}
                        handleSubmapClick={setActiveSubmap}
                        containerHeight={height * 0.95}
                        expandedGroup={activeArea}
                        activeSubmap={activeSubmap}
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
                    <Row
                        style={{
                            paddingRight: '10%',
                            paddingTop: '2.5%',
                            height: '100%',
                            overflow: 'auto',
                        }}
                    >
                        <Col>
                            <ExtraLocationTracker
                                activeArea={activeArea}
                                setActiveArea={setActiveArea}
                            />
                        </Col>
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
                background: colorScheme.background,
            }}
        >
            <Container fluid style={{ height: '100%' }}>
                <Row style={{ height: '100%' }}>
                    {mainTracker}
                </Row>
                <Row
                    style={{
                        position: 'fixed',
                        bottom: 0,
                        background: 'lightgrey',
                        width: '100%',
                        padding: '0.5%',
                        height: height * 0.05,
                        alignContent: 'center',
                    }}
                >
                    <Col xs="auto">
                        <ImportExport />
                    </Col>
                    <Col>
                        <Link
                            className={`btn btn-primary`}
                            to="/"
                        >
                            Options
                        </Link>
                    </Col>
                    <Col>
                        <Button
                            variant="primary"
                            onClick={() => setShowCustomizationDialog(true)}
                        >
                            Customization
                        </Button>
                    </Col>
                    <Col>
                        <Button
                            variant="primary"
                            onClick={() => setShowEntranceDialog(true)}
                        >
                            Entrances
                        </Button>
                    </Col>
                </Row>
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
