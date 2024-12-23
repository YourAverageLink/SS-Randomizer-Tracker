import type { CSSProperties } from 'react';
import type { ColorScheme } from '../../customization/ColorScheme';
import Tooltip from '../../additionalComponents/Tooltip';
import type { TriggerEvent } from 'react-contexify';
import styles from './Marker.module.css';
import clsx from 'clsx';

export type MarkerVariant = 'square' | 'rounded' | 'circle';

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
    tooltip,
    children,
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
    tooltip?: React.ReactNode;
    onClick: (ev: TriggerEvent) => void;
    onContextMenu?: (ev: React.MouseEvent) => void;
    selected: boolean;
}) {
    // TODO replace mapWidth with Container Queries, e.g. `5.5cqw`
    // once we drop support for Chrome < 105, which will happen
    // when OBS 31 releases since it includes CEF based on Chrome 126
    const markerStyle: CSSProperties = {
        top: `${y}%`,
        left: `${x}%`,
        background: `var(--scheme-${color})`,
        width: mapWidth / 18,
        height: mapWidth / 18,
        fontSize: mapWidth / 27,
    };

    if (selected) {
        markerStyle.boxShadow = `0 0 20px var(--scheme-${color})`;
    }

    return (
        // I really don't like followCursor here but otherwise the tooltip teleports to (0, 0)
        // when the marker is removed, which may overlap with the item or dungeon tracker
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
                <span>
                    {children}
                </span>
            </div>
        </Tooltip>
    );
}
