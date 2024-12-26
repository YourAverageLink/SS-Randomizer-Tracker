import useResizeObserver from '@react-hook/resize-observer';
import { useRef, useState } from 'react';

/** A wrapper component for the ItemTracker that fills the available space while retaining aspect ratio */
export function ItemTrackerContainer({
    itemTracker,
    aspectRatio,
}: {
    itemTracker: (width: number) => React.ReactNode;
    aspectRatio: number;
}) {
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);
    const ref = useRef<HTMLDivElement | null>(null);
    useResizeObserver(ref, () => {
        const elem = ref.current;
        if (!elem) {
            return;
        }
        setWidth(elem.clientWidth);
        setHeight(elem.clientHeight);
    });
    const targetWidth = Math.min(width, height * aspectRatio);
    return (
        <div style={{ width: '100%', height: '100%' }} ref={ref}>
            {/* placed absolutely in here so that we don't end up influencing our measurement */}
            <div style={{ position: 'absolute' }}>
                {itemTracker(targetWidth)}
            </div>
        </div>
    );
}
