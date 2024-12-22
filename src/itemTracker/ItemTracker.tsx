import { CSSProperties } from 'react';
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
    let wid = maxWidth;
    if (wid > maxHeight * aspectRatio) {
        wid = maxHeight * aspectRatio; // ensure the tracker isn't so wide that it ends up too tall
    }
    const swordBlockStyle = {
        position: 'fixed',
        height: 0,
        width: wid / 2.5,
        left: 0,
        top: (map ? wid / 9 + wid / 50 + 10 : 0), // scaling here is complicated 
        margin: '0.5%',
    } satisfies CSSProperties;

    const songBlockStyle = {
        position: 'fixed',
        width: wid / 2.5,
        left: swordBlockStyle.width * 1.1,
        margin: '0.5%',
        top: swordBlockStyle.top,
        // border: '3px solid #73AD21',
    } satisfies CSSProperties;

    const bWheelStyle = {
        position: 'fixed',
        width: 2 * wid / 3,
        left: swordBlockStyle.width * 0.28, // don't ask, this has to be like this so the b-wheel is somewhat centered
        top: swordBlockStyle.top + wid * 0.8,
        margin: '0%',
    } satisfies CSSProperties;

    const additionalItemsStyle = {
        position: 'fixed',
        width: wid / 2.5,
        top: swordBlockStyle.top + wid * 0.55,
        left: wid * 0.44,
        margin: '0.5%',
    } satisfies CSSProperties;

    const questItemsStyle = {
        position: 'fixed',
        width: wid / 2.5,
        top: additionalItemsStyle.top + additionalItemsStyle.top / 14,
        left: 0,
        margin: '0.5%',
    } satisfies CSSProperties;

    return (
        // eslint-disable-next-line sonarjs/table-header
        <table className={styles.inGameTracker}>
            <tbody>
                <tr>
                    <td style={swordBlockStyle}>
                        <div id="swordBlock">
                            <SwordBlock width={swordBlockStyle.width} />
                        </div>
                    </td>
                    <td style={songBlockStyle}>
                        <div id="songBlock">
                            <SongBlock width={songBlockStyle.width} />
                        </div>
                    </td>
                </tr>
                <tr>
                    <td style={questItemsStyle}>
                        <QuestItems width={questItemsStyle.width} />
                    </td>
                    <td style={additionalItemsStyle}>
                        <AdditionalItems width={additionalItemsStyle.width} />
                    </td>
                </tr>
                <tr>
                    <td colSpan={2} style={bWheelStyle}>
                        <div id="bWheel">
                            <BWheel width={bWheelStyle.width} />
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    );
};

export default ItemTracker;
