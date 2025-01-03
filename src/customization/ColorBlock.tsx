import { useState } from 'react';
import { SketchPicker } from '@hello-pangea/color-picker';
import type { ColorScheme } from './ColorScheme';
import styles from './ColorBlock.module.css';

export default function ColorBlock({
    colorName,
    colorScheme,
    currentColor,
    schemeKey,
    updateColorScheme,
}: {
    colorName: string;
    schemeKey: keyof ColorScheme;
    currentColor: string;
    colorScheme: ColorScheme;
    updateColorScheme: (scheme: ColorScheme) => void;
}) {
    const [showPicker, setShowPicker] = useState(false);
    return (
        <>
            <div className={styles.colorBlock}>
                <div>{colorName}</div>
                <div
                    className={styles.color}
                    style={{
                        background: currentColor,
                        border: '2px solid var(--scheme-text)',
                    }}
                    onClick={() => setShowPicker((prevState) => !prevState)}
                />
            </div>
            {showPicker && (
                <div>
                    <SketchPicker
                        color={currentColor}
                        onChangeComplete={(color) => {
                            const newScheme: ColorScheme = {
                                ...colorScheme,
                                [schemeKey]: color.hex,
                            };
                            updateColorScheme(newScheme);
                        }}
                        disableAlpha
                        presetColors={[
                            '#FFFFFF',
                            '#00FFFF',
                            '#FF00FF',
                            '#FFFF00',
                            '#FF0000',
                            '#00FF00',
                            '#0000FF',
                        ]}
                    />
                </div>
            )}
        </>
    );
}
