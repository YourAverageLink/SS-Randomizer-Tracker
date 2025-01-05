import { type MouseEvent, useCallback } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/Store';
import { areaHintSelector, areasSelector } from '../../tracker/Selectors';
import HintDescription, { decodeHint } from '../Hints';
import { useContextMenu } from '../context-menu';
import { Marker } from './Marker';
import type { TriggerEvent } from 'react-contexify';
import { getMarkerColor, getRegionData, getSubmarkerData } from './MapUtils';
import type { LocationGroupContextMenuProps } from '../LocationGroupContextMenu';
import { hintsToSubmarkers } from '../../hints/HintsParser';

type MapMarkerProps = {
    markerX: number;
    markerY: number;
    submarkerPlacement: 'left' | 'right';
    title: string;
    onGlickGroup: (region: string) => void;
    selected: boolean;
};


const MapMarker = (props: MapMarkerProps) => {
    const { onGlickGroup, title, markerX, markerY, submarkerPlacement, selected } = props;
    const area = useSelector((state: RootState) => areasSelector(state).find((a) => a.name === title))!;
    const data = getRegionData(area);
    const markerColor = getMarkerColor(data.checks);

    const { show } = useContextMenu<LocationGroupContextMenuProps>({
        id: 'group-context',
    });

    const displayMenu = useCallback((e: MouseEvent) => {
        show({ event: e, props: { area: area.name } });
    }, [area, show]);

    const hints = useSelector(areaHintSelector(title));

    const tooltip = (
        <center>
            <div>{title} ({data.checks.numAccessible}/{data.checks.numRemaining})</div>
            {hints.map((hint, idx) => <HintDescription key={idx} hint={decodeHint(hint)} />)}
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
            tooltip={tooltip}
            onClick={handleClick}
            onContextMenu={displayMenu}
            selected={selected}
            submarkerPlacement={submarkerPlacement}
            submarkers={[...getSubmarkerData(data), ...hintsToSubmarkers(hints)]}
        >
            {Boolean(data.checks.numAccessible) && data.checks.numAccessible}
        </Marker>
    );
};

export default MapMarker;