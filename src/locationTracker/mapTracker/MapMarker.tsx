import { type MouseEvent, useCallback } from 'react';
import 'react-contexify/dist/ReactContexify.css';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import { areaHintSelector, areasSelector } from '../../tracker/selectors';
import HintDescription, { decodeHint } from '../Hints';
import { useContextMenu } from '../context-menu';
import { Marker } from './Marker';
import type { TriggerEvent } from 'react-contexify';
import { getMarkerColor, getRegionData, getSubmarkerData } from './MapUtils';
import type { LocationGroupContextMenuProps } from '../LocationGroupContextMenu';

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
    const data = getRegionData(area);
    const markerColor = getMarkerColor(data.checks);

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
            <div> {title} ({data.checks.numAccessible}/{data.checks.numRemaining}) </div>
            {hint && <HintDescription hint={hint} />}
        </center>
    );

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
            submarkers={getSubmarkerData(data)}
        >
            {Boolean(data.checks.numAccessible) && data.checks.numAccessible}
        </Marker>
    );
};

export default MapMarker;