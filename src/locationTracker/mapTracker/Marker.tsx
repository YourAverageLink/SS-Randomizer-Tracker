import clsx from 'clsx';
import { type CSSProperties } from 'react';
import type { TriggerEvent } from 'react-contexify';
import Tooltip from '../../additionalComponents/Tooltip';
import type { ColorScheme } from '../../customization/ColorScheme';
import styles from './Marker.module.css';
import type { ItemData } from '../Location';

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
    onItemDrag,
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
    onItemDrag: (params: ItemData) => void;
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

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    };
    
    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const itemName = event.dataTransfer.getData("text/plain");
        console.log(itemName);
        onItemDrag({item: itemName});
    };

    return (
        <>
            <Tooltip content={tooltip} placement="bottom">
                <div
                    onClick={onClick}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onKeyDown={onClick}
                    role="button"
                    tabIndex={0}
                    onContextMenu={(ev) => {
                        ev.preventDefault();
                        onContextMenu?.(ev);
                    }}
                    style={{ ...markerStyle, ...positionVars }}
                    className={clsx(styles.marker, borderRadiuses[variant])}
                >
                    <span>{children}</span>
                </div>
            </Tooltip>
            {submarkers && (
                <div
                    className={clsx(styles.submarkers, {
                        [styles.left]: submarkerPlacement === 'left',
                    })}
                    style={positionVars as CSSProperties}
                >
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
