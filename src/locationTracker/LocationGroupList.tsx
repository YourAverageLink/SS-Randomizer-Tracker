import { useSelector } from 'react-redux';
import { isDungeon } from '../logic/Locations';
import { areasSelector } from '../tracker/selectors';
import type { InterfaceAction } from '../tracker/TrackerInterfaceReducer';
import LocationGroupHeader from './LocationGroupHeader';

export function LocationGroupList({
    interfaceDispatch,
}: {
    interfaceDispatch: React.Dispatch<InterfaceAction>;
}) {
    const areas = useSelector(areasSelector);
    const setActiveArea = (area: string) =>
        interfaceDispatch({ type: 'selectHintRegion', hintRegion: area });

    return (
        <div style={{ padding: '2%' }}>
            {areas
                .filter(
                    (area) =>
                        !isDungeon(area.name) &&
                        !area.name.includes('Silent Realm') &&
                        !area.nonProgress,
                )
                .map((value) => (
                    <LocationGroupHeader
                        setActiveArea={setActiveArea}
                        key={value.name}
                        area={value}
                    />
                ))}
        </div>
    );
}
