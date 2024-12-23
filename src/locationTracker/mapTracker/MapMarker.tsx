import { type MouseEvent, useCallback } from 'react';
import 'react-contexify/dist/ReactContexify.css';
import type { ColorScheme } from '../../customization/ColorScheme';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import { areaHintSelector, areasSelector } from '../../tracker/selectors';
import HintDescription, { decodeHint } from '../Hints';
import { useContextMenu } from '../context-menu';
import type { LocationGroupContextMenuProps } from '../LocationGroupHeader';
import { Marker } from './Marker';
import type { TriggerEvent } from 'react-contexify';

type MapMarkerProps = {
    markerX: number;
    markerY: number;
    title: string;
    onGlickGroup: (region: string) => void;
    mapWidth: number;
    selected: boolean;
};

const MapMarker = (props: MapMarkerProps) => {
    const { onGlickGroup, title, markerX, markerY, mapWidth, selected } = props;
    const area = useSelector((state: RootState) => areasSelector(state).find((a) => a.name === title))!;
    const remainingChecks = area?.numChecksRemaining;
    const accessibleChecks = area?.numChecksAccessible;
    let markerColor: keyof ColorScheme = 'outLogic';
    if (accessibleChecks !== 0) {
        markerColor = 'semiLogic';
    }
    if (accessibleChecks === remainingChecks) {
        markerColor = 'inLogic';
    }
    if (remainingChecks === 0) {
        markerColor = 'checked';
    }

    const { show } = useContextMenu<LocationGroupContextMenuProps>({
        id: 'group-context',
    });

    const displayMenu = useCallback((e: MouseEvent) => {
        show({ event: e, props: { area: area.name } });
    }, [area, show]);

    const areaHint = useSelector(areaHintSelector(title));
    const hint = areaHint && decodeHint(areaHint);

    const tooltip = (
        <center>
            <div> {title} ({accessibleChecks}/{remainingChecks}) </div>
            {hint && <HintDescription hint={hint} />}
        </center>
    )

    const handleClick = (e: TriggerEvent) => {
        if (e.type === 'contextmenu') {
            onGlickGroup(title);
            e.preventDefault();
        } else {
            onGlickGroup(title);
        }
    };

    return (
        <Marker
            x={markerX}
            y={markerY}
            variant="rounded"
            color={markerColor}
            mapWidth={mapWidth}
            tooltip={tooltip}
            onClick={handleClick}
            onContextMenu={displayMenu}
            selected={selected}
        >
            {Boolean(accessibleChecks) && accessibleChecks}
        </Marker>
    );
};

export default MapMarker;