import React, { CSSProperties, useState } from 'react';
import { OptionsAction } from './OptionsReducer';
import { AllTypedOptions } from './permalink/SettingsTypes';
import { LogicBundle } from './logic/slice';
import { Button, Modal } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, useAppDispatch } from './store/store';
import { Preset, addPreset, removePreset } from './saves/slice';
import { formatRemote } from './loader/LogicLoader';
import { encodePermalink } from './permalink/Settings';
import { useSyncSavesToLocalStorage } from './LocalStorage';

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

    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>
                    Presets
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="show-grid">
                <div style={{ display: 'flex', flexFlow: 'column nowrap' }}>
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
}: {
    preset: Preset;
    dispatch: React.Dispatch<OptionsAction>;
    onHide: () => void;
}) {
    const appDispatch = useAppDispatch();
    return (
        // eslint-disable-next-line sonarjs/mouse-events-a11y
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
            className="presetRow"
        >
            <div style={{ display: 'flex', flexFlow: 'nowrap' }}>
                {preset.name}
                <div style={{ marginLeft: 'auto' }}>
                    <Button
                        onClick={(e) => {
                            if (confirm(`Delete Preset ${preset.name}?`)) {
                                appDispatch(removePreset(preset.id));
                            }
                            e.stopPropagation();
                        }}
                    >
                        🗑️
                    </Button>
                </div>
            </div>
            <div style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>
                {formatRemote(preset.remote)}
                <span className="presetLogicStringSep"></span>
                <span
                    style={{
                        overflowWrap: 'break-word',
                        whiteSpace: 'pre-line',
                    }}
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
        // eslint-disable-next-line sonarjs/mouse-events-a11y
        <div
            role="button"
            onClick={() => {
                const name = prompt('Enter preset name');
                if (!name) {
                    return;
                }
                dispatch(
                    addPreset({
                        name,
                        remote:
                            currentLogic.remote.type === 'latestRelease'
                                ? {
                                    type: 'releaseVersion',
                                    versionTag: currentLogic.remoteName,
                                }
                                : currentLogic.remote,
                        settings: currentSettings,
                        visualPermalink: encodePermalink(
                            currentLogic.options,
                            currentSettings,
                        ),
                    }),
                );
            }}
            className="presetRow"
        >
            +
        </div>
    );
}