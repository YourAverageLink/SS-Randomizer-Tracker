import React, { type CSSProperties, useMemo, useState } from 'react';
import type { OptionsAction } from './OptionsReducer';
import type { AllTypedOptions } from '../permalink/SettingsTypes';
import type { LogicBundle } from '../logic/Slice';
import { Button, Modal } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { type RootState, useAppDispatch } from '../store/Store';
import { type Preset, addPreset, removePreset } from '../saves/Slice';
import { formatRemote, type RemoteReference } from '../loader/LogicLoader';
import { encodePermalink, validateSettings } from '../permalink/Settings';
import { useSyncSavesToLocalStorage } from '../LocalStorage';
import styles from './OptionsPresets.module.css'

export function OptionsPresets({
    style,
    currentLogic,
    currentSettings,
    dispatch,
}: {
    style: CSSProperties
    currentLogic: LogicBundle | undefined;
    currentSettings: AllTypedOptions | undefined;
    dispatch: React.Dispatch<OptionsAction>;
}) {
    const [showModal, setShowModal] = useState(false);
    useSyncSavesToLocalStorage();

    return (
        <>
            <Button style={style} onClick={() => setShowModal(true)}>Presets</Button>
            <PresetsModal
                currentLogic={currentLogic}
                currentSettings={currentSettings}
                dispatch={dispatch}
                onHide={() => setShowModal(false)}
                show={showModal}
            />
        </>
    );
}

function permaifyRelease(
    logic: LogicBundle,
): Exclude<RemoteReference, { type: 'latestRelease' }> {
    return logic.remote.type === 'latestRelease'
        ? {
              type: 'releaseVersion',
              versionTag: logic.remoteName,
          }
        : logic.remote;
}

function PresetsModal({
    currentLogic,
    currentSettings,
    dispatch,
    show,
    onHide,
}: {
    currentLogic: LogicBundle | undefined;
    currentSettings: AllTypedOptions | undefined;
    dispatch: React.Dispatch<OptionsAction>;
    show: boolean;
    onHide: () => void;
}) {
    const presets = useSelector((state: RootState) => state.saves.presets);
    const remotePresets: Preset[] | undefined = useMemo(
        () =>
            currentLogic &&
            Object.entries(currentLogic?.presets).map(([name, data]) => {
                const validatedSettings = validateSettings(
                    currentLogic.options,
                    data,
                );
                return {
                    id: `remote-${name}`,
                    name,
                    remote: permaifyRelease(currentLogic),
                    settings: validatedSettings,
                    visualPermalink: encodePermalink(
                        currentLogic.options,
                        validatedSettings,
                    ),
                } satisfies Preset;
            }),
        [currentLogic],
    );

    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>
                    Presets
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="show-grid">
                <div className={styles.presetList}>
                    {remotePresets?.map((p) => (<PresetRow preset={p} isRemotePreset dispatch={dispatch} key={p.id} onHide={onHide} />))}
                    {presets.map((p) => (<PresetRow preset={p} dispatch={dispatch} key={p.id} onHide={onHide} />))}
                    {currentLogic && currentSettings && <AddPresetRow currentLogic={currentLogic} currentSettings={currentSettings} />}
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={onHide}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
}

function PresetRow({
    preset,
    dispatch,
    onHide,
    isRemotePreset,
}: {
    preset: Preset;
    dispatch: React.Dispatch<OptionsAction>;
    onHide: () => void;
    isRemotePreset?: boolean;
}) {
    const appDispatch = useAppDispatch();
    return (
        <div
            role="button"
            onClick={() => {
                dispatch({
                    type: 'applyPreset',
                    remote: preset.remote,
                    settings: preset.settings,
                });
                onHide();
            }}
            className={styles.presetRow}
        >
            <div className={styles.header}>
                {preset.name}
                {!isRemotePreset && (
                    <div>
                        <Button
                            onClick={(e) => {
                                if (window.confirm(`Delete Preset ${preset.name}?`)) {
                                    appDispatch(removePreset(preset.id));
                                }
                                e.stopPropagation();
                            }}
                        >
                            🗑️
                        </Button>
                    </div>
                )}
            </div>
            <div className={styles.body}>
                {formatRemote(preset.remote)}
                <span className={styles.presetLogicStringSep}></span>
                <span
                    className={styles.permalink}
                >
                    {preset.visualPermalink}
                </span>
            </div>
        </div>
    );
}

function AddPresetRow({
    currentLogic,
    currentSettings,
}: {
    currentLogic: LogicBundle;
    currentSettings: AllTypedOptions;
}) {
    const dispatch = useDispatch();
    return (
        <div
            role="button"
            onClick={() => {
                const name = window.prompt('Enter preset name');
                if (!name) {
                    return;
                }
                dispatch(
                    addPreset({
                        name,
                        remote: permaifyRelease(currentLogic),
                        settings: currentSettings,
                        visualPermalink: encodePermalink(
                            currentLogic.options,
                            currentSettings,
                        ),
                    }),
                );
            }}
            className={styles.presetRow}
        >
            +
        </div>
    );
}