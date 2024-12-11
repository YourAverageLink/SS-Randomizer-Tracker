import _ from 'lodash';

export function reorderLocationsForGrid<T>(locations: T[]) {
    const partitionPoint = Math.ceil(locations.length / 2);
    return _.compact(
        _.flatten(
            _.zip(
                locations.slice(0, partitionPoint),
                locations.slice(partitionPoint),
            ),
        ),
    );
}
