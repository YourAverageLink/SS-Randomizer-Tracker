import { ExitMapping } from '../../logic/Locations';
import { AreaGraph } from '../../logic/Logic';
import mapData from '../../data/mapData.json';

export type MapHintRegion = {
    /**
     * The hint region behind this map node.
     * Uses the bound dungeon/silent realm for exits.
     */
    hintRegion: string | undefined;
    markerX: number;
    markerY: number;
} & (
    | { type: 'hint_region' }
    | {
          type: 'exit';
          exitPool: keyof AreaGraph['linkedEntrancePools'];
          exitId: string;
      }
);

export interface MapProvince {
    provinceId: 'skyloftSubmap' | 'faronSubmap' | 'eldinSubmap' | 'lanayruSubmap';
    name: string;
    regions: MapHintRegion[];
}

/** A resolved map model for the tracker, to simplify common map operations */
export interface MapModel {
    provinces: MapProvince[];
    regions: MapHintRegion[];
}

function getMarker(marker: (typeof mapData)['sky']): MapHintRegion {
    return {
        type: 'hint_region',
        markerX: marker.markerX,
        markerY: marker.markerY,
        hintRegion: marker.region,
    };
}

type MapDataEntranceMarker =
    (typeof mapData)['faronSubmap']['entranceMarkers'][number];

function getEntranceMarker(
    marker: MapDataEntranceMarker,
    areaGraph: AreaGraph,
    exits: ExitMapping[],
): MapHintRegion {
    const exitPool = marker.exitPool as keyof AreaGraph['linkedEntrancePools'];
    const exitId =
        areaGraph.linkedEntrancePools[exitPool][marker.entryName].exits[0];
    const mapping = exits.find((e) => e.exit.id === exitId);
    return {
        type: 'exit',
        exitPool,
        exitId,
        markerX: marker.markerX,
        markerY: marker.markerY,
        hintRegion: mapping?.entrance?.region,
    };
}

function getProvince(
    provinceId: MapProvince['provinceId'],
    areaGraph: AreaGraph,
    exits: ExitMapping[],
): MapProvince {
    const province = mapData[provinceId];
    const getEntrance = (m: MapDataEntranceMarker) =>
        getEntranceMarker(m, areaGraph, exits);
    return {
        provinceId,
        name: province.name,
        regions: [
            ...province.markers.map(getMarker),
            ...province.entranceMarkers.map(getEntrance),
        ],
    };
}

/** For a given hint region, get the owning map view. */
export function getOwningProvince(
    model: MapModel,
    hintRegion: string,
): string | undefined {
    for (const region of model.regions) {
        if (region.hintRegion === hintRegion) {
            return undefined;
        }
    }

    for (const province of model.provinces) {
        for (const region of province.regions) {
            if (region.hintRegion === hintRegion) {
                return province.provinceId;
            }
        }
    }

    return undefined;
}

export function getMapModel(
    areaGraph: AreaGraph,
    exits: ExitMapping[],
): MapModel {
    return {
        provinces: [
            getProvince('skyloftSubmap', areaGraph, exits),
            getProvince('faronSubmap', areaGraph, exits),
            getProvince('eldinSubmap', areaGraph, exits),
            getProvince('lanayruSubmap', areaGraph, exits),
        ],
        regions: [getMarker(mapData.sky), getMarker(mapData.thunderhead)],
    };
}
