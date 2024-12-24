import 'react-contexify/dist/ReactContexify.css';
import { useSelector } from 'react-redux';
import { exitsByIdSelector, settingSelector } from '../../tracker/selectors';
import type { ColorScheme } from '../../customization/ColorScheme';
import { Marker } from './Marker';

const StartingEntranceMarker = ({ mapWidth, onClick, selected }: { mapWidth: number; onClick: (exitId: string) => void; selected: boolean }) => {
    
    const startingEntranceRando = useSelector(settingSelector('random-start-entrance')) !== 'Vanilla';
    const startMapping = useSelector(exitsByIdSelector)['\\Start'];

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
            <Marker
                x={40}
                y={85}
                variant="square"
                color={markerColor}
                mapWidth={mapWidth}
                tooltip={tooltip}
                onClick={() => onClick(startMapping.exit.id)}
                selected={selected}
            >
                {!hasSelectedEntrance && '?'}
            </Marker>
        </>
    );
};

export default StartingEntranceMarker;