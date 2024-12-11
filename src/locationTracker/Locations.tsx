import { HintRegion } from '../logic/Locations';
import LocationGroup from './LocationGroup';

export function Locations({
    hintRegion,
    onChooseEntrance,
}: {
    hintRegion: HintRegion<string>;
    onChooseEntrance: (exitId: string) => void;
}) {
    return (
        <>
            <LocationGroup
                onChooseEntrance={onChooseEntrance}
                locations={hintRegion.checks}
            />
            {Boolean(hintRegion.extraChecks.loose_crystal?.length) && (
                <>
                    <hr />
                    <LocationGroup
                        onChooseEntrance={onChooseEntrance}
                        locations={hintRegion.extraChecks.loose_crystal!}
                    />
                </>
            )}
            {Boolean(hintRegion.extraChecks.tr_cube?.length) && (
                <>
                    <hr />
                    <LocationGroup
                        onChooseEntrance={onChooseEntrance}
                        locations={hintRegion.extraChecks.tr_cube!}
                    />
                </>
            )}
            {Boolean(hintRegion.extraChecks.gossip_stone?.length) && (
                <>
                    <hr />
                    <LocationGroup
                        onChooseEntrance={onChooseEntrance}
                        locations={hintRegion.extraChecks.gossip_stone!}
                    />
                </>
            )}
            {Boolean(hintRegion.exits.length) && (
                <>
                    <hr />
                    <LocationGroup
                        onChooseEntrance={onChooseEntrance}
                        locations={hintRegion.exits}
                    />
                </>
            )}
        </>
    );
}
