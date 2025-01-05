import ColorBlock from './ColorBlock';
import {
    type ColorScheme,
    darkColorScheme,
    lightColorScheme,
} from './ColorScheme';
import {
    type CounterBasis,
    type ItemLayout,
    type LocationLayout,
    setColorScheme,
    setCounterBasis,
    setCustomLayout,
    setEnabledSemilogicTricks,
    setItemLayout,
    setLocationLayout,
    setTrackTumbleweed,
    setTrickSemiLogic,
} from './Slice';
import { useDispatch, useSelector } from 'react-redux';
import {
    colorSchemeSelector,
    counterBasisSelector,
    hasCustomLayoutSelector,
    itemLayoutSelector,
    locationLayoutSelector,
    trickSemiLogicSelector,
    trickSemiLogicTrickListSelector,
    tumbleweedSelector,
} from './Selectors';
import { useCallback, useMemo } from 'react';
import { selectStyles } from './ComponentStyles';
import Select, { type ActionMeta, type MultiValue } from 'react-select';
import { Dialog } from '../additionalComponents/Dialog';
import Tooltip from '../additionalComponents/Tooltip';
import { optionsSelector } from '../logic/Selectors';
import { useAppDispatch, type ThunkResult } from '../store/Store';
import styles from './CustomizationModal.module.css';

const defaultColorSchemes = {
    Light: lightColorScheme,
    Dark: darkColorScheme,
};

const locationLayouts = [
    { value: 'list', label: 'List Layout' },
    { value: 'map', label: 'Map Layout' },
];
const itemLayouts = [
    { value: 'inventory', label: 'In-Game Inventory' },
    { value: 'grid', label: 'Grid Layout' },
];
const counterBases = [
    { value: 'logic', label: 'In Logic' },
    { value: 'semilogic', label: 'Semilogic' },
];

const colors: { key: keyof ColorScheme; name: string }[] = [
    { key: 'background', name: 'Background' },
    { key: 'text', name: 'Foreground' },
    { key: 'inLogic', name: 'In Logic Check' },
    { key: 'outLogic', name: 'Out of Logic Check' },
    { key: 'semiLogic', name: 'Semi Logic Check' },
    { key: 'unrequired', name: 'Unrequired Dungeon' },
    { key: 'required', name: 'Required Dungeon' },
    { key: 'checked', name: 'Completed Check' },
];

function importCustomLayout(): ThunkResult {
    return (dispatch, getState) => {
        const existingLayout = getState().customization.customLayout;
        const newLayout =
            window.prompt(
                'Paste custom layout here (empty to clear)',
                existingLayout,
            ) || undefined;
        dispatch(setCustomLayout(newLayout));
    };
}

function Setting({
    name,
    tooltip,
    children,
}: {
    name: string;
    tooltip?: string;
    children: React.ReactNode;
}) {
    return (
        <div className={styles.setting}>
            <Tooltip content={tooltip ?? ''} disabled={!tooltip}>
                <div className={styles.header}>{name}</div>
            </Tooltip>
            <div className={styles.contents}>{children}</div>
        </div>
    );
}

export default function CustomizationModal({
    open,
    onOpenChange,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const dispatch = useAppDispatch();
    const colorScheme = useSelector(colorSchemeSelector);
    const layout = useSelector(itemLayoutSelector);
    const locationLayout = useSelector(locationLayoutSelector);
    const trickSemiLogic = useSelector(trickSemiLogicSelector);
    const counterBasis = useSelector(counterBasisSelector);
    const tumbleweed = useSelector(tumbleweedSelector);

    const updateColorScheme = useCallback(
        (scheme: ColorScheme) => dispatch(setColorScheme(scheme)),
        [dispatch],
    );

    const hasCustomLayout = useSelector(hasCustomLayoutSelector);

    return (
        <Dialog
            open={open}
            onOpenChange={onOpenChange}
            title="Tracker Customization"
            className={styles.modal}
        >
            <Setting name="Presets">
                <div className={styles.colorPresets}>
                    {Object.entries(defaultColorSchemes).map(
                        ([key, scheme]) => (
                            <div key={key}>
                                <button
                                    type="button"
                                    className="tracker-button"
                                    style={{
                                        background: scheme.background,
                                        color: scheme.text,
                                        border: '1px solid var(--scheme-text)',
                                    }}
                                    onClick={() => updateColorScheme(scheme)}
                                >
                                    {key}
                                </button>
                            </div>
                        ),
                    )}
                </div>
            </Setting>
            <Setting name="Colors">
                {colors.map(({ key, name }) => (
                    <ColorBlock
                        key={key}
                        colorName={name}
                        schemeKey={key}
                        colorScheme={colorScheme}
                        updateColorScheme={updateColorScheme}
                    />
                ))}
            </Setting>

            <Setting name="Item Tracker Settings">
                <Select
                    styles={selectStyles<
                        false,
                        { label: string; value: string }
                    >()}
                    isDisabled={hasCustomLayout}
                    isSearchable={false}
                    value={itemLayouts.find((l) => l.value === layout)}
                    onChange={(e) =>
                        e && dispatch(setItemLayout(e.value as ItemLayout))
                    }
                    options={itemLayouts}
                    name="Item Layout"
                />
            </Setting>
            <Setting name="Location Tracker Settings">
                <Select
                    styles={selectStyles<
                        false,
                        { label: string; value: string }
                    >()}
                    isDisabled={hasCustomLayout}
                    isSearchable={false}
                    value={locationLayouts.find(
                        (l) => l.value === locationLayout,
                    )}
                    onChange={(e) =>
                        e &&
                        dispatch(setLocationLayout(e.value as LocationLayout))
                    }
                    options={locationLayouts}
                    name="Location Layout"
                />
            </Setting>
            <Setting
                name="Trick Logic"
                tooltip="Choose whether checks reachable only with tricks should be highlighted in a separate color, and which checks should be shown. An empty tricks list shows all tricks."
            >
                <label htmlFor="trickLogic" className={styles.checkboxLabel}>
                    Show Trick Logic
                </label>
                <input
                    type="checkbox"
                    id="trickLogic"
                    checked={trickSemiLogic}
                    onChange={(e) =>
                        dispatch(setTrickSemiLogic(e.target.checked))
                    }
                />
                <TricksChooser enabled={trickSemiLogic} />
            </Setting>
            <Setting
                name="Counter Basis"
                tooltip="Choose whether the Area/Total Locations Accessible counters should include items in semilogic."
            >
                <Select
                    styles={selectStyles<
                        false,
                        { label: string; value: string }
                    >()}
                    isSearchable={false}
                    value={counterBases.find((l) => l.value === counterBasis)}
                    onChange={(e) =>
                        e && dispatch(setCounterBasis(e.value as CounterBasis))
                    }
                    options={counterBases}
                    name="Counter Basis"
                />
            </Setting>
            <Setting name="Additional Settings">
                <label htmlFor="trackTim" className={styles.checkboxLabel}>
                    Track Tim
                </label>
                <input
                    type="checkbox"
                    id="trackTim"
                    checked={tumbleweed}
                    onChange={(e) =>
                        dispatch(setTrackTumbleweed(e.target.checked))
                    }
                />
            </Setting>
            <Setting name="Custom Layout (experimental!)">
                <div>
                    <button
                        type="button"
                        className="tracker-button"
                        onClick={() => {
                            dispatch(importCustomLayout());
                        }}
                    >
                        Import custom layout
                    </button>
                </div>
            </Setting>
        </Dialog>
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

    const onChange = useCallback(
        (selectedOption: MultiValue<Option>, meta: ActionMeta<Option>) => {
            if (
                meta.action === 'select-option' ||
                meta.action === 'remove-value'
            ) {
                dispatch(
                    setEnabledSemilogicTricks(
                        selectedOption.map((o) => o.value),
                    ),
                );
            } else if (meta.action === 'clear') {
                // do not allow accidentally clearing everything until we have an undo
            }
        },
        [dispatch],
    );

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
        <Select
            styles={selectStyles<true, Option>()}
            isMulti
            isDisabled={!enabled}
            value={value}
            onChange={onChange}
            options={choices}
            name="Enabled Tricks"
        />
    );
}
