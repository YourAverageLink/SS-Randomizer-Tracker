import { CSSProperties } from 'react';
import ColorScheme from '../../customization/ColorScheme';
import Tooltip from '../../additionalComponents/Tooltip';
import { TriggerEvent } from 'react-contexify';

export type MarkerVariant = 'square' | 'rounded' | 'circle';

const borderRadiuses: Record<MarkerVariant, number> = {
    square: 0,
    rounded: 8,
    circle: 200,
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
}) {
    // TODO replace mapWidth with Container Queries, e.g. `5.5cqw`
    // once we drop support for Chrome < 105, which will happen
    // when OBS 31 releases since it includes CEF based on Chrome 126
    const markerStyle: CSSProperties = {
        position: 'absolute',
        top: `${y}%`,
        left: `${x}%`,
        borderRadius: `${borderRadiuses[variant]}px`,
        background: `var(--scheme-${color})`,
        color: 'black',
        width: mapWidth / 18,
        height: mapWidth / 18,
        border: '2px solid #000000',
        textAlign: 'center',
        fontSize: mapWidth / 27,
        lineHeight: '1.2',
    };

    return (
        <div>
            <Tooltip content={tooltip} placement="bottom" followCursor>
                <div
                    onClick={onClick}
                    onKeyDown={onClick}
                    role="button"
                    tabIndex={0}
                    onContextMenu={onContextMenu}
                >
                    <span style={markerStyle} id="marker">
                        {children}
                    </span>
                </div>
            </Tooltip>
        </div>
    );
}
