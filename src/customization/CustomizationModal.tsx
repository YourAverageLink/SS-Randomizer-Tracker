import { Modal, Button, Container, Row, Col, FormCheck } from 'react-bootstrap';
import ColorBlock from './ColorBlock';
import { type ColorScheme, darkColorScheme, lightColorScheme } from './ColorScheme';
import { type CounterBasis, type ItemLayout, type LocationLayout, setColorScheme, setCounterBasis, setEnabledSemilogicTricks, setItemLayout, setLocationLayout, setTrackTumbleweed, setTrickSemiLogic } from './slice';
import { useDispatch, useSelector } from 'react-redux';
import { colorSchemeSelector, counterBasisSelector, itemLayoutSelector, locationLayoutSelector, trickSemiLogicSelector, trickSemiLogicTrickListSelector, tumbleweedSelector } from './selectors';
import { useCallback, useMemo } from 'react';
import { selectStyles } from './ComponentStyles';
import Select, { type ActionMeta, type MultiValue } from 'react-select';
import Tooltip from '../additionalComponents/Tooltip';
import { optionsSelector } from '../logic/selectors';

const defaultColorSchemes = {
    Light: lightColorScheme,
    Dark: darkColorScheme,
};

const locationLayouts = [
    {value: 'list', label: 'List Layout'},
    {value: 'map', label: 'Map Layout'}
];
const itemLayouts = [
    {value: 'inventory', label: 'In-Game Inventory'},
    {value: 'grid', label: 'Grid Layout'}
];
const counterBases = [
    {value: 'logic', label: 'In Logic'},
    {value: 'semilogic', label: 'Semilogic'}
];

export default function CustomizationModal({
    onHide,
    show,
}: {
    show: boolean,
    onHide: () => void,
}) {
    const dispatch = useDispatch();
    const colorScheme = useSelector(colorSchemeSelector);
    const layout = useSelector(itemLayoutSelector);
    const locationLayout = useSelector(locationLayoutSelector);
    const trickSemiLogic = useSelector(trickSemiLogicSelector);
    const counterBasis = useSelector(counterBasisSelector);
    const tumbleweed = useSelector(tumbleweedSelector);

    const updateColorScheme = useCallback((scheme: ColorScheme) => dispatch(setColorScheme(scheme)), [dispatch]);

    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>
                    Tracker Customization
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="show-grid">
                <Container>
                    <Row>
                        <h4>Presets</h4>
                    </Row>
                    <Row>
                        {
                            Object.entries(defaultColorSchemes).map(([key, scheme]) => (
                                <Col key={key}>
                                    <Button
                                        style={{ background: scheme.background, color: scheme.text, border: '1px solid var(--scheme-text)' }}
                                        onClick={() => updateColorScheme(scheme)}
                                    >
                                        {key}
                                    </Button>
                                </Col>
                            ))
                        }
                    </Row>
                    <Row>
                        <h4>Colors</h4>
                    </Row>
                    <ColorBlock colorName="Background" schemeKey="background" currentColor={colorScheme.background} colorScheme={colorScheme} updateColorScheme={updateColorScheme} />
                    <ColorBlock colorName="Foreground" schemeKey="text" currentColor={colorScheme.text} colorScheme={colorScheme} updateColorScheme={updateColorScheme} />
                    <ColorBlock colorName="In Logic Check" schemeKey="inLogic" currentColor={colorScheme.inLogic} colorScheme={colorScheme} updateColorScheme={updateColorScheme} />
                    <ColorBlock colorName="Out of Logic Check" schemeKey="outLogic" currentColor={colorScheme.outLogic} colorScheme={colorScheme} updateColorScheme={updateColorScheme} />
                    <ColorBlock colorName="Semi Logic Check" schemeKey="semiLogic" currentColor={colorScheme.semiLogic} colorScheme={colorScheme} updateColorScheme={updateColorScheme} />
                    <ColorBlock colorName="Unrequired Dungeon" schemeKey="unrequired" currentColor={colorScheme.unrequired} colorScheme={colorScheme} updateColorScheme={updateColorScheme} />
                    <ColorBlock colorName="Required Dungeon" schemeKey="required" currentColor={colorScheme.required} colorScheme={colorScheme} updateColorScheme={updateColorScheme} />
                    <ColorBlock colorName="Completed Checks" schemeKey="checked" currentColor={colorScheme.checked} colorScheme={colorScheme} updateColorScheme={updateColorScheme} />
                    <Row>
                        <h4>Item Tracker Settings</h4>
                    </Row>
                    <Row>
                        <Select
                            styles={selectStyles<
                                false,
                                { label: string; value: string }
                            >()}
                            isSearchable={false}
                            value={itemLayouts.find((l) => l.value === layout)}
                            onChange={(e) => e && dispatch(setItemLayout(e.value as ItemLayout))}
                            options={itemLayouts}
                            name="Item Layout"
                        />
                    </Row>
                    <Row>
                        <h4>Location Tracker Settings</h4>
                    </Row>
                    <Row>
                        <Select
                            styles={selectStyles<
                                false,
                                { label: string; value: string }
                            >()}
                            isSearchable={false}
                            value={locationLayouts.find((l) => l.value === locationLayout)}
                            onChange={(e) => e && dispatch(setLocationLayout(e.value as LocationLayout))}
                            options={locationLayouts}
                            name="Location Layout"
                        />
                    </Row>
                    <Row>
                        <Tooltip content="Choose whether checks reachable only with tricks should be highlighted in a separate color."><h4>Show Trick Logic</h4></Tooltip>
                    </Row>
                    <Row>
                        <FormCheck
                            // hack
                            style={{ height: '30px', paddingLeft: '3.5em' }}
                            type="switch"
                            checked={trickSemiLogic}
                            onChange={(e) => dispatch(setTrickSemiLogic(e.target.checked))}
                        />
                    </Row>
                    <TricksChooser enabled={trickSemiLogic} />
                    <Row>
                        <Tooltip content="Choose whether the Area/Total Locations Accessible counters should include items in semilogic."><h4>Counter Basis</h4></Tooltip>
                    </Row>
                    <Row>
                        <Select
                            styles={selectStyles<
                                false,
                                { label: string; value: string }
                            >()}
                            isSearchable={false}
                            value={counterBases.find((l) => l.value === counterBasis)}
                            onChange={(e) => e && dispatch(setCounterBasis(e.value as CounterBasis))}
                            options={counterBases}
                            name="Counter Basis"
                        />
                    </Row>
                    <Row>
                        <h4>Track Tim</h4>
                    </Row>
                    <Row>
                        <FormCheck
                            // hack
                            style={{ height: '30px', paddingLeft: '3.5em' }}
                            type="switch"
                            checked={tumbleweed}
                            onChange={(e) => dispatch(setTrackTumbleweed(e.target.checked))}
                        />
                    </Row>
                </Container>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={onHide}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
}

interface Option {
    label: string;
    value: string;
}

function TricksChooser({ enabled }: { enabled: boolean }) {
    const dispatch = useDispatch();
    const options = useSelector(optionsSelector);
    const enabledTricks = useSelector(trickSemiLogicTrickListSelector);

    const onChange = useCallback((
        selectedOption: MultiValue<Option>,
        meta: ActionMeta<Option>,
    ) => {
        if (
            meta.action === 'select-option' ||
            meta.action === 'remove-value'
        ) {
            dispatch(
                setEnabledSemilogicTricks(selectedOption.map((o) => o.value)),
            );
        } else if (meta.action === 'clear') {
            // do not allow accidentally clearing everything until we have an undo
        }
    }, [dispatch]);

    const choices = useMemo(
        () =>
            options
                .filter(
                    (o) =>
                        o.command === 'enabled-tricks-bitless' ||
                        o.command === 'enabled-tricks-glitched',
                )
                .flatMap((o) => (o.type === 'multichoice' ? o.choices : []))
                .map((o) => ({ value: o, label: o })),
        [options],
    );

    const value = useMemo(
        () => [...enabledTricks].map((o) => ({ value: o, label: o })),
        [enabledTricks],
    );

    return (
        <>
            <Row>
                <Tooltip content="Enable tricks to be considered in trick logic. If no tricks are chosen, all tricks will be enabled."><h4>Enabled Tricks</h4></Tooltip>
            </Row>
            <Row>
                <Select
                    styles={selectStyles<
                        true,
                        Option
                    >()}
                    isMulti
                    isDisabled={!enabled}
                    value={value}
                    onChange={onChange}
                    options={choices}
                    name="Enabled Tricks"
                />
            </Row>
        </>
    );
}