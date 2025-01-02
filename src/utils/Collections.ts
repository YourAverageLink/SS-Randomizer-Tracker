// eslint-disable-next-line no-restricted-imports
import { compact, flatten, zip, mapValues as mapValuesEsTk } from 'es-toolkit';

export function reorderLocationsForGrid<T>(locations: T[]) {
    const partitionPoint = Math.ceil(locations.length / 2);
    return compact(
        flatten(
            zip(
                locations.slice(0, partitionPoint),
                locations.slice(partitionPoint),
            ),
        ),
    );
}

export function isEmpty<T extends object | undefined | null>(obj: T) {
    if (!obj) {
        return true;
    }
    // eslint-disable-next-line sonarjs/no-unused-vars
    for (const _key in obj) {
        return false;
    }
    return true;
}

/** Like es-toolkit/mapValues, but uses correct key typing */
export function mapValues<T extends object, K extends keyof T & string, V>(
    object: T,
    getNewValue: (value: T[keyof T], key: K) => V,
) {
    return mapValuesEsTk(object, getNewValue);
}
