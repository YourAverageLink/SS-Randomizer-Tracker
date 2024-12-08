import React, { cloneElement } from 'react';

/** places a divider between each element of arr */
export function addDividers<T extends React.ReactNode>(
    arr: T[],
    divider: React.ReactElement,
): React.ReactNode[] {
    return arr.flatMap((e, i) => [
        // eslint-disable-next-line @eslint-react/no-clone-element
        i ? cloneElement(divider, { key: `divider-${i}` }) : null,
        e,
    ]);
}
