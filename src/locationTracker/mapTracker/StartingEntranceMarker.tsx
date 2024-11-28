import { useCallback, useState } from 'react';
import 'react-contexify/dist/ReactContexify.css';
import { useSelector } from 'react-redux';
import { exitsSelector, settingSelector } from '../../tracker/selectors';
import ColorScheme from '../../customization/ColorScheme';
import EntranceSelectionDialog from '../EntranceSelectionDialog';
import { Marker } from './Marker';

const StartingEntranceMarker = ({ mapWidth }: { mapWidth: number }) => {
    
    const startingEntranceRando = useSelector(settingSelector('random-start-entrance')) !== 'Vanilla';
    const startMapping = useSelector(exitsSelector).find((e) => e.exit.id === '\\Start')!;
    const [showEntranceDialog, setShowEntranceDialog] = useState(false);
    const showDialog = useCallback(() => setShowEntranceDialog(true), []);

    if (!startingEntranceRando) {
        return null;
    }

    const hasSelectedEntrance = Boolean(startMapping.entrance);

    const markerColor: keyof ColorScheme = hasSelectedEntrance ? 'checked' : 'inLogic';

    const tooltip = (
        <center>
            <div>Starting Entrance</div>
            <div>Click to choose starting entrance</div>
            {startMapping.entrance  && <div>{startMapping.entrance.name}</div>}
        </center>
    );

    return (
        <>
            <EntranceSelectionDialog
                exitId={startMapping.exit.id}
                show={showEntranceDialog}
                onHide={() => setShowEntranceDialog(false)}
            />
            <Marker
                x={85}
                y={40}
                variant="square"
                color={markerColor}
                mapWidth={mapWidth}
                tooltip={tooltip}
                onClick={showDialog}
            >
                {!hasSelectedEntrance && '?'}
            </Marker>
        </>
    );
};

export default StartingEntranceMarker;