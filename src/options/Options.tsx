import type {
    AllTypedOptions,
    OptionDefs,
    OptionValue,
    OptionsCommand,
} from '../permalink/SettingsTypes';
import {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from 'react';
import { decodePermalink, encodePermalink } from '../permalink/Settings';
import type { Option } from '../permalink/SettingsTypes';
import {
    Tab,
    Tabs,
} from 'react-bootstrap';
import {
    LATEST_STRING,
    type RemoteReference,
    formatRemote,
    parseRemote,
} from '../loader/LogicLoader';
import { acceptSettings, reset } from '../tracker/Slice';
import Acknowledgement from './Acknowledgment';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store/Store';
import { type LogicBundle, loadLogic } from '../logic/Slice';
import Select, { type MultiValue, type ActionMeta, type SingleValue } from 'react-select';
import { selectStyles } from '../customization/ComponentStyles';
import DiscordButton from '../additionalComponents/DiscordButton';
import React from 'react';
import { ImportButton } from '../ImportExport';
import Tooltip from '../additionalComponents/Tooltip';
import { type LoadingState, type OptionsAction, useOptionsState } from './OptionsReducer';
import { useReleases } from '../loader/ReleasesLoader';
import { satisfies as semverSatisfies } from 'semver';
import { OptionsPresets } from './OptionsPresets';
import styles from './Options.module.css';
import clsx from 'clsx';
import { isEqual, range } from 'es-toolkit';

/** The tracker will only show these options, and tracker logic code is only allowed to access these! */
const optionCategorization_ = {
    Shuffles: [
        'rupeesanity',
        'shopsanity',
        'beedle-shopsanity',
        'luv-shopsanity',
        'rupin-shopsanity',
        'gondo-upgrades',
        'tadtonesanity',
        'treasuresanity-in-silent-realms',
        'trial-treasure-amount',
        'small-key-mode',
        'boss-key-mode',
        'empty-unrequired-dungeons',
    ],
    'Starting Items': [
        'starting-sword',
        'upgraded-skyward-strike',
        'starting-tablet-count',
        'starting-bottles',
        'starting-crystal-packs',
        'starting-tadtones',
        'starting-items',
    ],
    Entrances: [
        'random-start-entrance',
        'random-start-statues',
        'randomize-entrances',
        'randomize-dungeon-entrances',
        'randomize-trials',
        'random-puzzles',
    ],
    Convenience: [
        'open-lake-floria',
        'open-et',
        'open-lmf',
        'open-thunderhead',
        'fs-lava-flow',
        'open-shortcuts',
    ],
    Victory: [
        'got-start',
        'got-sword-requirement',
        'got-dungeon-requirement',
        'required-dungeon-count',
        'triforce-required',
        'triforce-shuffle',
    ],
    Miscellaneous: [
        'logic-mode',
        'bit-patches',
        'damage-multiplier',
        'enabled-tricks-bitless',
        'enabled-tricks-glitched',
        'excluded-locations',
        'hint-distribution',
    ],
} as const satisfies Record<string, readonly OptionsCommand[]>;

export type LogicOption =
    (typeof optionCategorization_)[keyof typeof optionCategorization_][number];
const optionCategorization: Record<string, readonly LogicOption[]> =
    optionCategorization_;

const wellKnownRemotes: {
    prettyName: string;
    remoteName: string;
}[] = [
    {
        prettyName: 'Latest Stable Release',
        remoteName: LATEST_STRING,
    },
    {
        prettyName: 'Racing Season 3',
        remoteName: 'alkalineace/season-3',
    },
    {
        prettyName: 'Latest Development Build',
        remoteName: 'ssrando/main',
    },
];

/**
 * The default landing page for the tracker. Allows choosing logic source, permalink, and settings,
 * and allows moving to the main tracker.
 *
 * This component does not expect logic to be loaded, and will help loading logic.
 * As a result, it does not access any selectors that assume logic has already loaded unless we know it's loaded.
 */
export default function Options() {
    const {
        counters,
        dispatch,
        hasChanges,
        loaded,
        loadingState,
        settings,
        selectedRemote,
    } = useOptionsState();
    const appDispatch = useAppDispatch();
    const navigate = useNavigate();

    const launch = useCallback(
        (shouldReset?: boolean) => {
            if (!loaded) {
                return;
            }
            appDispatch(loadLogic(loaded));
            if (shouldReset) {
                appDispatch(reset({ settings: settings! }));
            } else {
                appDispatch(acceptSettings({ settings: settings! }));
            }
            navigate('/tracker');
        },
        [appDispatch, loaded, navigate, settings],
    );

    return (
        <div className={styles.optionsPage}>
            <h1>Skyward Sword Randomizer Tracker</h1>
            <div className={styles.logicAndPermalink}>
                <LogicChooser
                    selectedRemote={selectedRemote}
                    dispatch={dispatch}
                    loadingState={loadingState}
                    loadedRemoteName={loaded?.remoteName}
                />
                <PermalinkChooser dispatch={dispatch} options={loaded?.options} settings={settings} />
            </div>
            <LaunchButtons
                hasChanges={hasChanges}
                counters={counters}
                loaded={Boolean(loaded)}
                launch={launch}
                dispatch={dispatch}
                currentLogic={loaded}
                currentSettings={settings}
            />
            {loaded && (
                <OptionsList
                    options={loaded.options}
                    settings={settings!}
                    dispatch={dispatch}
                />
            )}
            <hr />
            <Acknowledgement />
        </div>
    );
}

function LaunchButtons({
    loaded,
    hasChanges,
    counters,
    launch,
    dispatch,
    currentLogic,
    currentSettings,
}: {
    loaded: boolean;
    hasChanges: boolean;
    counters:
        | { numChecked: number; numAccessible: number; numRemaining: number }
        | undefined;
    launch: (shouldReset?: boolean) => void;
    dispatch: React.Dispatch<OptionsAction>;
    currentLogic: LogicBundle | undefined;
    currentSettings: AllTypedOptions | undefined;
}) {
    const canStart = loaded;
    const canResume = loaded && Boolean(counters);

    const confirmLaunch = useCallback(
        (shouldReset?: boolean) => {
            const allow =
                !shouldReset ||
                (canStart &&
                    (!canResume ||
                        window.confirm(
                            'Reset your tracker and start a new run?',
                        )));
            if (allow) {
                launch(shouldReset);
            }
        },
        [canResume, canStart, launch],
    );

    return (
        <div className={styles.launchButtons}>
            <button type="button" className="tracker-button" disabled={!canResume} onClick={() => confirmLaunch()}>
                <div className={styles.continueButton}>
                    <span>Continue Tracker</span>
                    <span
                        className={styles.counters}
                    >
                        {counters && `${counters.numChecked}/${counters.numRemaining}`}
                    </span>
                </div>
            </button>
            <button type="button" className="tracker-button" disabled={!canStart} onClick={() => confirmLaunch(true)}>
                Launch New Tracker
            </button>
            <ImportButton
                setLogicBranch={(remote) =>
                    dispatch({ type: 'selectRemote', remote, viaImport: true })
                }
            />
            <button type="button" className="tracker-button"
                disabled={!hasChanges}
                onClick={() => dispatch({ type: 'revertChanges' })}
            >
                Undo Changes
            </button>

            <OptionsPresets
                style={{ marginLeft: 'auto' }}
                dispatch={dispatch}
                currentLogic={currentLogic}
                currentSettings={currentSettings}
            />
        </div>
    );
}

const leastSupportedRelease = ">=2.1.1";

function useRemoteOptions() {
    const githubReleases = useReleases();

    return useMemo(() => {
        const niceRemoteName = (remoteName: string, prettyName: string) => {
            if (remoteName === LATEST_STRING) {
                return githubReleases
                    ? `${prettyName} (${githubReleases.latest})`
                    : prettyName;
            } else {
                return `${prettyName} (${remoteName})`;
            }
        };

        const remotes = wellKnownRemotes.map(({ prettyName, remoteName }) => ({
            value: parseRemote(remoteName)!,
            label: niceRemoteName(remoteName, prettyName),
        }));

        if (githubReleases) {
            const supportedReleases = githubReleases.releases.filter((r) => semverSatisfies(r, leastSupportedRelease));
            remotes.push(...supportedReleases.map((r) => ({
                value: { type: 'releaseVersion', versionTag: r } as const,
                label: r,
            })));
        }
        return remotes;
    }, [githubReleases]);
}


/** A component to choose your logic release. */
function LogicChooser({
    selectedRemote,
    dispatch,
    loadingState,
    loadedRemoteName,
}: {
    selectedRemote: RemoteReference;
    dispatch: React.Dispatch<OptionsAction>;
    loadingState: LoadingState | undefined;
    loadedRemoteName: string | undefined;
}) {
    const inputRef = useRef<PlaintextRef>(null);
    const wellKnownSelectOptions = useRemoteOptions();

    const activeOption = wellKnownSelectOptions.find((option) =>
        isEqual(option.value, selectedRemote),
    );

    const setSelectedRemote = useCallback(
        (remote: RemoteReference) => dispatch({ type: 'selectRemote', remote }),
        [dispatch],
    );

    const onRemoteChange = (
        selectedOption: SingleValue<{ label: string; value: RemoteReference }>,
        meta: ActionMeta<{ label: string; value: RemoteReference }>,
    ) => {
        if (meta.action === 'select-option' && selectedOption) {
            setSelectedRemote(selectedOption.value);
        }
    };

    return (
        <div className={clsx(styles.optionsCategory, styles.logicChooser)}>
            <legend>
                Randomizer Version
                {activeOption
                    ? `: ${activeOption.label}`
                    : loadedRemoteName && `: ${loadedRemoteName}`}
            </legend>
            <Tabs
                defaultActiveKey="wellKnown"
                onSelect={(e) => {
                    if (e === 'raw') {
                        inputRef.current?.setInput(
                            formatRemote(selectedRemote),
                        );
                    }
                }}
            >
                <Tab key="wellKnown" eventKey="wellKnown" title="Releases">
                    <Select
                        styles={selectStyles<
                            false,
                            { label: string; value: RemoteReference }
                        >()}
                        value={activeOption}
                        onChange={onRemoteChange}
                        options={wellKnownSelectOptions}
                        name="Select remote"
                    />
                </Tab>
                <Tab key="raw" eventKey="raw" title="Beta Feature">
                    <span>
                        Find cool beta features on the Discord <DiscordButton />
                    </span>
                    <PlaintextLogicInput
                        ref={inputRef}
                        selectedRemote={selectedRemote}
                        setSelectedRemote={setSelectedRemote}
                    />
                </Tab>
            </Tabs>
            <LoadingStateIndicator loadingState={loadingState} />
        </div>
    );
}

export interface PlaintextRef {
    setInput: (text: string) => void;
}

const PlaintextLogicInput = forwardRef(function PlaintextLogicInput(
    {
        selectedRemote,
        setSelectedRemote,
    }: {
        selectedRemote: RemoteReference;
        setSelectedRemote: (ref: RemoteReference) => void;
    },
    ref: React.ForwardedRef<PlaintextRef>,
) {
    const [input, setInput] = useState(() => formatRemote(selectedRemote));
    const parsed = useMemo(() => parseRemote(input), [input]);
    const badFormat = !parsed;
    useEffect(() => {
        if (parsed) {
            setSelectedRemote(parsed);
        }
    }, [parsed, setSelectedRemote]);

    useImperativeHandle(ref, () => ({ setInput }), []);

    return (
        <div>
            <input
                type="text"
                className={clsx('form-control', {
                    [styles.optionsBadRemote]: badFormat,
                })}
                value={input}
                onChange={(e) => setInput(e.target.value)}
            />
        </div>
    );
});

function LoadingStateIndicator({
    loadingState,
}: {
    loadingState: LoadingState | undefined;
}) {
    return (
        <div>
            <span>
                {loadingState?.type === 'loading'
                    ? '⏳'
                    : loadingState
                        ? `❌ ${loadingState.error}`
                        : '✅'}
            </span>
        </div>
    );
}

/** A component to choose your logic release. */
function PermalinkChooser({
    options,
    settings,
    dispatch,
}: {
    options: OptionDefs | undefined;
    settings: AllTypedOptions | undefined;
    dispatch: React.Dispatch<OptionsAction>;
}) {
    const permalink = useMemo(
        () => options && encodePermalink(options, settings!),
        [options, settings],
    );

    const onChangePermalink = useCallback(
        (link: string) => {
            try {
                if (options) {
                    const settings = decodePermalink(options, link);
                    dispatch({ type: 'changeSettings', settings });
                }
            } catch (e) {
                console.error('invalid permalink', link, e);
            }
        },
        [dispatch, options],
    );

    return (
        <div className={clsx(styles.optionsCategory, styles.permalinkChooser)}>
            <legend>Settings String</legend>
            <input
                type="text"
                className={clsx(styles.permalinkInput, 'form-control')}
                disabled={!permalink}
                placeholder="Select a Randomizer version first"
                value={permalink ?? ''}
                onChange={(e) => onChangePermalink(e.target.value)}
            />
        </div>
    );
}

/** A list of all options categories. */
function OptionsList({
    options,
    settings,
    dispatch,
}: {
    options: OptionDefs;
    settings: AllTypedOptions;
    dispatch: React.Dispatch<OptionsAction>;
}) {
    return (
        <div className={styles.optionsCategory}>
            <Tabs defaultActiveKey="Shuffles">
                {Object.entries(optionCategorization).map(
                    ([title, categoryOptions]) => {
                        return (
                            <Tab eventKey={title} key={title} title={title}>
                                <div className={styles.optionsTab}>
                                    {categoryOptions.map((command) => {
                                        const entry = options.find(
                                            (o) => o.command === command,
                                        );
                                        if (!entry) {
                                            return null;
                                        }
                                        return (
                                            <Setting
                                                key={command}
                                                def={entry}
                                                value={settings[command]!}
                                                setValue={(value) =>
                                                    dispatch({
                                                        type: 'changeSetting',
                                                        command,
                                                        value,
                                                    })
                                                }
                                            />
                                        );
                                    })}
                                </div>
                            </Tab>
                        );
                    },
                )}
            </Tabs>
        </div>
    );
}

function Setting({
    def,
    value,
    setValue,
}: {
    def: Option;
    value: OptionValue;
    setValue: (val: OptionValue) => void;
}) {
    switch (def.type) {
        case 'boolean':
            return (
                <>
                    <div>
                        <OptionLabel option={def} />
                    </div>
                    <div className={styles.checkboxOption}>
                        <div>
                            <input
                                type="checkbox"
                                id={def.name}
                                checked={value as boolean}
                                onChange={(e) => setValue(e.target.checked)}
                            />
                        </div>
                    </div>
                </>
            );
        case 'int':
            return (
                <>
                    <div>
                        <OptionLabel option={def} />
                    </div>
                    <div>
                        <Select
                            styles={selectStyles<
                                false,
                                { label: string; value: number }
                            >()}
                            isSearchable={false}
                            value={{
                                value: value as number,
                                label: (value as number).toString(),
                            }}
                            onChange={(e) => e && setValue(e.value)}
                            options={range(def.min, def.max + 1).map((val) => ({
                                value: val,
                                label: val.toString(),
                            }))}
                            name={def.name}
                            id={def.name}
                        />
                    </div>
                </>
            );
        case 'singlechoice':
            return (
                <>
                    <div>
                        <OptionLabel option={def} />
                    </div>
                    <div>
                        <Select
                            styles={selectStyles<
                                false,
                                { label: string; value: string }
                            >()}
                            isSearchable={false}
                            value={{
                                value: value as string,
                                label: value as string,
                            }}
                            onChange={(e) => e && setValue(e.value)}
                            options={def.choices.map((val) => ({
                                value: val,
                                label: val,
                            }))}
                            name={def.name}
                            id={def.name}
                        />
                    </div>
                </>
            );
        case 'multichoice': {
            type Option = {
                value: string;
                label: string;
            };
            const numPaddingDigits = 4;
            const onChange = (
                selectedOption: MultiValue<Option>,
                meta: ActionMeta<Option>,
            ) => {
                if (
                    meta.action === 'select-option' ||
                    meta.action === 'remove-value'
                ) {
                    setValue(
                        selectedOption.map((o) =>
                            o.value.slice(0, -numPaddingDigits),
                        ),
                    );
                } else if (meta.action === 'clear') {
                    setValue([]);
                }
            };
            // Hack: Ensure unique keys...........
            const options = def.choices.map((val, idx) => ({
                value: val + idx.toString().padStart(numPaddingDigits, '0'),
                label: val,
            }));
            return (
                <>
                    <div>
                        <OptionLabel option={def} />
                    </div>
                    <div>
                        <Select
                            styles={selectStyles<
                                true,
                                { label: string; value: string }
                            >()}
                            isMulti
                            value={(value as string[]).map((val, idx) => ({
                                value:
                                    val +
                                    idx
                                        .toString()
                                        .padStart(numPaddingDigits, '0'),
                                label: val,
                            }))}
                            onChange={onChange}
                            options={options}
                            name={def.name}
                            id={def.name}
                        />
                    </div>
                </>
            );
        }
    }
}

function OptionTooltip({ children }: { children: string }) {
    const split = children.split('**');
    return (
        <>
            {split.map((part, index) => (
                <React.Fragment key={index}>
                    {index % 2 === 1 && <br />}
                    <span
                        className={clsx(styles.optionsTooltip, {
                            [styles.bold]: index % 2 === 1,
                        })}
                    >
                        {part}
                    </span>
                </React.Fragment>
            ))}
        </>
    );
}

const OptionLabel = React.memo(function OptionLabel({
    option,
}: {
    option: Option;
}) {
    return (
        <Tooltip content={<OptionTooltip>{option.help}</OptionTooltip>}>
            <label htmlFor={option.name}>{option.name}</label>
        </Tooltip>
    );
});
