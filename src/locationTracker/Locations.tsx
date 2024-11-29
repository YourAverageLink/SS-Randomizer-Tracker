import { HintRegion } from '../logic/Locations';
import LocationGroup from './LocationGroup';

export function Locations({ hintRegion }: { hintRegion: HintRegion<string> }) {
    return (
        <>
            <LocationGroup locations={hintRegion.checks} />
            {Boolean(hintRegion.extraChecks.loose_crystal?.length) && (
                <>
                    <hr />
                    <LocationGroup
                        locations={hintRegion.extraChecks.loose_crystal!}
                    />
                </>
            )}
            {Boolean(hintRegion.extraChecks.tr_cube?.length) && (
                <>
                    <hr />
                    <LocationGroup
                        locations={hintRegion.extraChecks.tr_cube!}
                    />
                </>
            )}
            {Boolean(hintRegion.extraChecks.gossip_stone?.length) && (
                <>
                    <hr />
                    <LocationGroup
                        locations={hintRegion.extraChecks.gossip_stone!}
                    />
                </>
            )}
            {Boolean(hintRegion.exits.length) && (
                <>
                    <hr />
                    <LocationGroup locations={hintRegion.exits} />
                </>
            )}
        </>
    );
}
