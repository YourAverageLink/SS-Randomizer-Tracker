import { useMemo, useState } from 'react';
import {
    Modal,
    Button,
    Row,
    Col,
    FormCheck,
    FormControl,
} from 'react-bootstrap';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import Select, { ActionMeta, SingleValue } from 'react-select';
import { useDispatch, useSelector } from 'react-redux';
import { entrancePoolsSelector, exitsSelector, usedEntrancesSelector } from '../tracker/selectors';
import { mapEntrance } from '../tracker/slice';
import { selectStyles } from '../customization/ComponentStyles';
import _ from 'lodash';
// import EntranceGraph from './EntranceGraph';

type EntranceTrackerProps = {
    show: boolean;
    onHide: () => void;
};

type Entrance = {
    value: string;
    label: string;
};

const RESET_OPTION = 'RESET';

function EntranceTracker({ show, onHide }: EntranceTrackerProps) {
    const dispatch = useDispatch();
    const exits = useSelector(exitsSelector);
    const usedEntrances = useSelector(usedEntrancesSelector);
    const entrancePools = useSelector(entrancePoolsSelector);

    const [exitSearch, setExitSearch] = useState('');
    const [entranceSearch, setEntranceSearch] = useState('');
    const [clickthrough, setClickthrough] = useState(true);

    const clearFilters = () => {
        setExitSearch('');
        setEntranceSearch('');
    };

    const entranceOptions: Record<string, Entrance[]> = useMemo(
        () =>
            _.mapValues(entrancePools, (poolValue, pool) => {
                const entrances = poolValue.entrances
                    .filter(
                        (entrance) =>
                            !poolValue.usedEntrancesExcluded ||
                            !usedEntrances[pool].includes(entrance.id),
                    )
                    .map(({ id, name }) => ({
                        value: id,
                        label: name,
                    }));

                entrances.unshift({ value: RESET_OPTION, label: 'Reset' });

                return entrances;
            }),
        [entrancePools, usedEntrances],
    );

    const onEntranceChange = 
        (
            from: string,
            selectedOption: SingleValue<Entrance>,
            meta: ActionMeta<Entrance>,
        ) => {
            if (meta.action === 'select-option') {
                if (!selectedOption || selectedOption.value === RESET_OPTION) {
                    dispatch(mapEntrance({ from, to: undefined }))
                } else {
                    dispatch(mapEntrance({ from, to: selectedOption.value }))
                }
            }
        };

    const entranceLower = entranceSearch.toLowerCase();
    const exitLower = exitSearch.toLowerCase();

    const matches = (name: string, searchString: string) => {
        if (!searchString) {
            return true;
        }
        const fragments = searchString.split(' ');
        return fragments.every((fragment) => name.includes(fragment.trim()));
    }

    const filteredRows = exits.filter((e) => {
        return (
            matches(e.exit.name.toLowerCase(), exitLower) &&
            (!entranceSearch ||
                (e.entrance &&
                    matches(e.entrance.name.toLowerCase(), entranceLower)))
        );
    });

    const row = ({ index, style }: ListChildComponentProps) => {
        const exit = filteredRows[index];
        return (
            <Row
                key={exit.exit.id}
                style={{
                    ...style,
                    borderBottom: '1px solid black',
                    paddingTop: '1%',
                    filter: !exit.canAssign ? 'opacity(0.5)' : undefined,
                }}
            >
                <Col style={{ display: 'flex', alignItems: 'center' }}><span>{exit.exit.name}</span></Col>
                <Col>
                    <Select
                        styles={selectStyles<false, Entrance>()}
                        value={exit.entrance && { label: exit.entrance.name, value: exit.entrance.id }}
                        onChange={(...args) => onEntranceChange(exit.exit.id, ...args)}
                        options={exit.canAssign ? entranceOptions[exit.rule.pool] : undefined}
                        name={exit.entrance?.name}
                        isDisabled={!exit.canAssign}
                        filterOption={(option, search) => matches(option.data.label.toLowerCase(), search.toLowerCase())}
                    />
                </Col>
                <Col xs="auto">
                    <Button
                        disabled={!exit.entrance}
                        onClick={() =>
                            setExitSearch(
                                exit.entrance?.name.split('-')[0].trim() ?? '',
                            )
                        }
                    >
                        Go to
                    </Button>
                </Col>
            </Row>
        );
    };
    return (
        <Modal show={show} onHide={onHide} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>
                    Entrances
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="show-grid">
                <Row style={{ paddingBottom: '3%' }}>
                    <Col>
                        <FormControl
                            type="search"
                            placeholder="Search exits"
                            onChange={(e) => setExitSearch(e.target.value)}
                            value={exitSearch}
                        />
                    </Col>
                    <Col className="vr" style={{ background: 'transparent' }} />
                    <Col>
                        <FormControl
                            type="search"
                            placeholder="Search entrances"
                            onChange={(e) => setEntranceSearch(e.target.value)}
                            value={entranceSearch}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <FormCheck
                            type="switch"
                            label="Clickthrough"
                            id="clickthrough"
                            checked={clickthrough}
                            onChange={() => setClickthrough(!clickthrough)}
                        />
                    </Col>
                    <Col className="vr" style={{ background: 'transparent' }} />
                    <Col style={{ justifyContent: 'end' }}>
                        <Button onClick={clearFilters}>Clear Filters</Button>
                    </Col>
                </Row>
                <List
                    itemCount={filteredRows.length}
                    height={600}
                    width=""
                    itemSize={60}
                >
                    {row}
                </List>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={onHide}>Close</Button>
            </Modal.Footer>
        </Modal>
        // <EntranceGraph />
    );
}

export default EntranceTracker;
