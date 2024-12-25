import type { CSSProperties } from 'react';
import BWheel from './BWheel';
import SwordBlock from './SwordBlock';
import SongBlock from './SongBlock';
import QuestItems from './QuestItems';
import AdditionalItems from './AdditionalItems';
import styles from './ItemTracker.module.css';

type ItemTrackerProps = {
    maxWidth: number;
    maxHeight: number;
    mapMode: boolean;
};

const ItemTracker = ({
    mapMode: map,
    maxHeight,
    maxWidth,
}: ItemTrackerProps) => {
    const aspectRatio = 0.65;
    let width = maxWidth;
    if (width > maxHeight * aspectRatio) {
        width = maxHeight * aspectRatio; // ensure the tracker isn't so wide that it ends up too tall
    }
    const swordBlockStyle = {
        position: 'fixed',
        height: 0,
        width: width / 2.5,
        left: 0,
        top: (map ? width / 9 + width / 50 + 10 : 0), // scaling here is complicated 
        margin: '0.5%',
    } satisfies CSSProperties;

    const songBlockStyle = {
        position: 'fixed',
        width: width / 2.5,
        left: swordBlockStyle.width * 1.1,
        margin: '0.5%',
        top: swordBlockStyle.top,
        // border: '3px solid #73AD21',
    } satisfies CSSProperties;

    const bWheelStyle = {
        position: 'fixed',
        width: 2 * width / 3,
        left: swordBlockStyle.width * 0.28, // don't ask, this has to be like this so the b-wheel is somewhat centered
        top: swordBlockStyle.top + width * 0.8,
        margin: '0%',
    } satisfies CSSProperties;

    const additionalItemsStyle = {
        position: 'fixed',
        width: width / 2.5,
        top: swordBlockStyle.top + width * 0.55,
        left: width * 0.44,
        margin: '0.5%',
    } satisfies CSSProperties;

    const questItemsStyle = {
        position: 'fixed',
        width: width / 2.5,
        top: additionalItemsStyle.top + additionalItemsStyle.top / 14,
        left: 0,
        margin: '0.5%',
    } satisfies CSSProperties;

    return (
        <>
            {/* debugging temp
            <div style={{position: 'fixed', height: width / aspectRatio, width, background: 'grey', margin: '0.5%', top: swordBlockStyle.top}}>

            </div>
             */}
            <div className={styles.inGameTracker}>
                <div style={swordBlockStyle}>
                    <SwordBlock width={swordBlockStyle.width} />
                </div>
                <div style={songBlockStyle}>
                    <SongBlock width={songBlockStyle.width} />
                </div>
                <div style={questItemsStyle}>
                    <QuestItems width={questItemsStyle.width} />
                </div>
                <div style={additionalItemsStyle}>
                    <AdditionalItems width={additionalItemsStyle.width} />
                </div>
                <div style={bWheelStyle}>
                    <BWheel width={bWheelStyle.width} />
                </div>
            </div>
        </>
    );
};

export default ItemTracker;
