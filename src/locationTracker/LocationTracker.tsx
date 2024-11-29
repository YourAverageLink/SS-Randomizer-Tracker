
import LocationGroupHeader from "./LocationGroupHeader";
import { Locations } from "./Locations";
import '../locationTracker/locationTracker.css'
import { Col, Row } from "react-bootstrap";
import LocationGroupContextMenu from "./LocationGroupContextMenu";
import LocationContextMenu from "./LocationContextMenu";
import { useSelector } from "react-redux";
import { areasSelector } from "../tracker/selectors";
import { isDungeon } from "../logic/Locations";

export function NewLocationTracker({ containerHeight, activeArea, setActiveArea }: { containerHeight: number; activeArea: string | undefined, setActiveArea: (area: string) => void }) {
    const areas = useSelector(areasSelector);

    const selectedArea = activeArea && areas.find((a) => a.name === activeArea) || undefined;

    return (
        <Col className="location-tracker">
            <LocationContextMenu />
            <LocationGroupContextMenu />
            <Row
                style={{
                    height: containerHeight / 2,
                    overflowY: 'auto',
                    overflowX: 'visible',
                }}
            >
                <ul style={{ padding: '2%' }}>
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
                </ul>
            </Row>
            {selectedArea && (
                <div
                    style={{
                        height: containerHeight / 2,
                        overflowY: 'auto',
                        overflowX: 'visible',
                    }}
                >
                    <Locations hintRegion={selectedArea} />
                </div>
            )}
        </Col>
    );
}