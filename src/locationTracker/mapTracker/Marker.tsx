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
}

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
    children: React.ReactNode;
    submarkers?: SubmarkerData[];
    submarkerPlacement?: SubmarkerPlacement;
    tooltip?: React.ReactNode;
    onClick: (ev: TriggerEvent) => void;
    onContextMenu?: (ev: React.MouseEvent) => void;
    selected: boolean;
}) {
    const positionVars = {
        '--map-marker-y': `${y}%`,
        '--map-marker-x': `${x}%`,
    };
    const markerStyle: CSSProperties = {
        background: `var(--scheme-${color})`,
    };

    if (selected) {
        markerStyle.boxShadow = `0 0 20px var(--scheme-${color})`;
    }

    return (
        // I really don't like followCursor here but otherwise the tooltip teleports to (0, 0)
        // when the marker is removed, where it overlaps with the item or dungeon tracker
        <>
            <Tooltip content={tooltip} placement="bottom" followCursor>
                <div
                    onClick={onClick}
                    onKeyDown={onClick}
                    role="button"
                    tabIndex={0}
                    onContextMenu={onContextMenu}
                    style={{ ...markerStyle, ...positionVars }}
                    className={clsx(styles.marker, borderRadiuses[variant])}
                >
                    <span>{children}</span>
                </div>
            </Tooltip>
            {submarkers && (
                <div className={clsx(styles.submarkers, {[styles.left]: submarkerPlacement === 'left'})} style={positionVars as CSSProperties}>
                    {submarkers?.map((data) => (
                        <div
                            key={data.key}
                            className={styles.submarker}
                            style={{
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
