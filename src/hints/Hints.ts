import sotsImage from '../assets/hints/sots.png';
import barrenImage from '../assets/hints/barren.png';

import g1 from '../assets/hints/g1.png';
import scaldera from '../assets/hints/scaldera.png';
import moldarach from '../assets/hints/moldarach.png';
import koloktos from '../assets/hints/koloktos.png';
import tentalus from '../assets/hints/tentalus.png';
import g2 from '../assets/hints/g2.png';
import type { ColorScheme } from '../customization/ColorScheme';
import { findRepresentativeIcon } from '../itemTracker/Images';

export type Hint =
    | { type: 'barren' }
    | { type: 'sots' }
    | { type: 'path'; index: number }
    | { type: 'item'; item: string };

export const pathImages = [
    g1,
    scaldera,
    moldarach,
    koloktos,
    tentalus,
    g2,
];

export const bosses = [
    'Ghirahim 1',
    'Scaldera',
    'Moldarach',
    'Koloktos',
    'Tentalus',
    'Ghirahim 2',
];

export interface DecodedHint {
    image: string;
    description: string;
    style: keyof ColorScheme;
}

export function decodeHint(hint: Hint): DecodedHint {
    switch (hint.type) {
        case 'barren':
            return { description: 'Barren', image: barrenImage, style: 'outLogic' };
        case 'sots':
            return { description: 'Spirit of the Sword', image: sotsImage, style: 'inLogic' };
        case 'path':
            return {
                description: `Path to ${bosses[hint.index]}`,
                image: pathImages[hint.index],
                style: 'inLogic',
            };
        case 'item':
            return {
                description: hint.item,
                image: findRepresentativeIcon(hint.item),
                style: 'inLogic',
            };
    }
}