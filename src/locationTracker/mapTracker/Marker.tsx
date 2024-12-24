import type { CSSProperties } from 'react';
import type { ColorScheme } from '../../customization/ColorScheme';
import Tooltip from '../../additionalComponents/Tooltip';
import type { TriggerEvent } from 'react-contexify';
import styles from './Marker.module.css';
import clsx from 'clsx';

export type MarkerVariant = 'square' | 'rounded' | 'circle';
export type SubmarkerPlacement = 'left' | 'right';
export interface SubmarkerData {
    key: string;
    image: string;
    color: keyof ColorScheme;
};

const borderRadiuses: Record<MarkerVariant, string | undefined> = {
    square: styles.square,
    rounded: styles.rounded,
    circle: styles.circle,
};

export function Marker({
    variant,
    color,
    x,
    y,
    mapWidth,
    children,
    submarkers,
    submarkerPlacement = 'right',
    tooltip,
    onClick,
    onContextMenu,
    selected,
}: {
    variant: MarkerVariant;
    color: keyof ColorScheme;
    x: number;
    y: number;
    mapWidth: number;
    children: React.ReactNode;
    submarkers?: SubmarkerData[];
    submarkerPlacement?: SubmarkerPlacement;
    tooltip?: React.ReactNode;
    onClick: (ev: TriggerEvent) => void;
    onContextMenu?: (ev: React.MouseEvent) => void;
    selected: boolean;
}) {
    // TODO replace mapWidth with Container Queries, e.g. `5.5cqw`
    // once we drop support for Chrome < 105, which will happen
    // when OBS 31 releases since it includes CEF based on Chrome 126
    const markerSize = mapWidth / 18;
    const markerStyle: CSSProperties = {
        top: `${y}%`,
        left: `${x}%`,
        background: `var(--scheme-${color})`,
        width: markerSize,
        height: markerSize,
        fontSize: mapWidth / 27,
    };

    const submarkersStyle: CSSProperties = {
        top: `${y}%`,
        height: 1.5 * markerSize,
    };

    if (submarkerPlacement === 'left') {
        submarkersStyle.left = `calc(${x}% - ${markerSize / 2}px)`;
    } else {
        submarkersStyle.left = `calc(${x}% + ${markerSize}px)`;
    }

    const submarkerStyle: CSSProperties = {
        width: markerSize / 2,
        height: markerSize / 2,
    };

    if (selected) {
        markerStyle.boxShadow = `0 0 20px var(--scheme-${color})`;
    }

    return (
        // I really don't like followCursor here but otherwise the tooltip teleports to (0, 0)
        // when the marker is removed, which may overlap with the item or dungeon tracker
        <>
            <Tooltip content={tooltip} placement="bottom" followCursor>
                <div
                    onClick={onClick}
                    onKeyDown={onClick}
                    role="button"
                    tabIndex={0}
                    onContextMenu={onContextMenu}
                    style={markerStyle}
                    className={clsx(styles.marker, borderRadiuses[variant])}
                >
                    <span>{children}</span>
                </div>
            </Tooltip>
            {submarkers && (
                <div className={styles.submarkers} style={submarkersStyle}>
                    {submarkers?.map((data) => (
                        <div
                            key={data.key}
                            className={styles.submarker}
                            style={{
                                ...submarkerStyle,
                                background: `var(--scheme-${data.color})`,
                            }}
                        >
                            <img src={data.image}></img>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}
