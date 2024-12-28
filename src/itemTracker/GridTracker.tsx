import type { CSSProperties } from 'react';
import Item from './Item';
import CrystalCounter from './items/sidequest/CrystalCounter';
import { GratitudeCrystals } from './items/sidequest/GratitudeCrystals';

import noTablets from '../assets/tablets/no_tablets.png';
import { CounterItem } from './items/CounterItem';
import { useDispatch, useSelector } from 'react-redux';
import {
    rawItemCountSelector,
    totalGratitudeCrystalsSelector,
} from '../tracker/selectors';
import { clickItem } from '../tracker/slice';
import { tumbleweedSelector } from '../customization/selectors';
import styles from './GridTracker.module.css';

export const GRID_TRACKER_ASPECT_RATIO = 1.063;

export default function GridTracker({ width }: { width: number }) {
    const dispatch = useDispatch();
    const handleExtraWalletClick = () => {
        dispatch(clickItem({ item: 'Extra Wallet', take: false }));
    };

    const emeraldTabletStyle: CSSProperties = {
        position: 'absolute',
        left: '100%',
        bottom: '0%',
        transform: 'translate(-100%)',
    };

    const rubyTabletStyle: CSSProperties = {
        position: 'absolute',
        left: '100%',
        top: '0%',
        transform: 'translate(-100%)',
    };

    const amberTabletStyle: CSSProperties = {
        position: 'absolute',
        left: '0%',
        top: '0%',
    };

    const imgWidth = width / 8.1;

    const emptyTabWidth = imgWidth * 2.5;
    const emeraldWidth = emptyTabWidth * 0.54;
    const rubyWidth = emptyTabWidth * 0.74;
    const amberWidth = emptyTabWidth * 0.505;

    const walletCount = useSelector(rawItemCountSelector('Extra Wallet')) ?? 0;
    const crystalCount = useSelector(totalGratitudeCrystalsSelector);
    const tumbleweed = useSelector(tumbleweedSelector);

    return (
        <div className={styles.itemGrid}>
            <div style={{ gridRow: '1 / span 2' }}>
                <Item itemName="Progressive Sword" imgWidth={imgWidth} />
            </div>
            <div>
                <Item itemName="Progressive Beetle" imgWidth={imgWidth} />
            </div>
            <div>
                <Item itemName="Progressive Slingshot" imgWidth={imgWidth} />
            </div>
            <div>
                <Item itemName="Bomb Bag" imgWidth={imgWidth} />
            </div>
            <div>
                <Item itemName="Progressive Bug Net" imgWidth={imgWidth} />
            </div>
            <div
                style={{
                    position: 'relative',
                    gridRow: '1 / span 2',
                    gridColumn: '6 / span 2',
                }}
            >
                <img src={noTablets} alt="" width={emptyTabWidth} />
                <div style={amberTabletStyle}>
                    <Item imgWidth={amberWidth} itemName="Amber Tablet" />
                </div>
                <div style={emeraldTabletStyle}>
                    <Item imgWidth={emeraldWidth} itemName="Emerald Tablet" />
                </div>
                <div style={rubyTabletStyle}>
                    <Item imgWidth={rubyWidth} itemName="Ruby Tablet" />
                </div>
            </div>
            <div>
                <Item itemName="Progressive Bow" imgWidth={imgWidth} />
            </div>
            <div>
                <Item itemName="Clawshots" imgWidth={imgWidth} />
            </div>
            <div>
                <Item itemName="Whip" imgWidth={imgWidth} />
            </div>
            <div>
                <Item itemName="Gust Bellows" imgWidth={imgWidth} />
            </div>
            <div>
                <Item
                    itemName="Lanayru Caves Small Key"
                    imgWidth={imgWidth}
                    className={styles.cavesKey}
                >
                    <div className={styles.cavesKeyLabel}>Caves</div>
                </Item>
            </div>
            <div>
                <Item itemName="Sea Chart" imgWidth={(imgWidth * 2) / 3} />
            </div>
            <div>
                <Item itemName="Spiral Charge" imgWidth={imgWidth} />
            </div>
            <div>
                <Item itemName="Progressive Pouch" imgWidth={imgWidth} />
            </div>
            <div>
                <CounterItem itemName="Empty Bottle" imgWidth={imgWidth} />
            </div>
            <div style={{ position: 'relative' }}>
                <div
                    style={{
                        position: 'absolute',
                        left: 0,
                        width: '100%',
                        textAlign: 'right',
                        bottom: '10%',
                        lineHeight: 1,
                    }}
                    onClick={handleExtraWalletClick}
                    onKeyDown={handleExtraWalletClick}
                    tabIndex={0}
                    role="button"
                >
                    <CrystalCounter
                        current={`+${walletCount * 300}`}
                        fontSize={imgWidth * 0.4}
                    />
                </div>
                <div>
                    <Item itemName="Progressive Wallet" imgWidth={imgWidth} />
                </div>
            </div>
            <div>
                <Item itemName="Progressive Mitts" imgWidth={imgWidth} grid />
            </div>
            <div>
                <Item itemName="Goddess's Harp" imgWidth={imgWidth} grid />
            </div>
            <div>
                <Item
                    itemName="Ballad of the Goddess"
                    imgWidth={imgWidth}
                    grid
                />
            </div>
            <div>
                <Item itemName="Farore's Courage" imgWidth={imgWidth} grid />
            </div>
            <div>
                <Item itemName="Nayru's Wisdom" imgWidth={imgWidth} grid />
            </div>
            <div>
                <Item itemName="Din's Power" imgWidth={imgWidth} grid />
            </div>
            <div
                style={{
                    position: 'relative',
                }}
            >
                <CounterItem
                    itemName="Song of the Hero"
                    imgWidth={imgWidth}
                    grid
                />
            </div>
            <div>
                <Item itemName="Triforce" imgWidth={imgWidth} grid />
            </div>
            <div>
                <Item
                    itemName="Water Dragon's Scale"
                    imgWidth={imgWidth}
                    grid
                />
            </div>
            <div>
                <Item itemName="Fireshield Earrings" imgWidth={imgWidth} grid />
            </div>
            <div>
                <Item itemName="Cawlin's Letter" imgWidth={imgWidth} grid />
            </div>
            <div>
                <Item
                    itemName="Horned Colossus Beetle"
                    imgWidth={imgWidth}
                    grid
                />
            </div>
            <div>
                <Item itemName="Baby Rattle" imgWidth={imgWidth} grid />
            </div>
            <div style={{ position: 'relative' }}>
                <div
                    style={{
                        position: 'absolute',
                        left: 0,
                        width: '100%',
                        textAlign: 'right',
                        bottom: 0,
                        lineHeight: 1,
                        pointerEvents: 'none',
                    }}
                >
                    <CrystalCounter
                        current={crystalCount}
                        fontSize={imgWidth * 0.5}
                    />
                </div>
                <GratitudeCrystals imgWidth={imgWidth} grid />
            </div>
            <div>
                <Item itemName="Life Tree Fruit" imgWidth={imgWidth} />
            </div>
            <div>
                <CounterItem itemName="Group of Tadtones" imgWidth={imgWidth} />
            </div>
            <div>
                <Item itemName="Scrapper" imgWidth={imgWidth} />
            </div>
            {tumbleweed && (
                <div>
                    <Item itemName="Tumbleweed" imgWidth={imgWidth} />
                </div>
            )}
        </div>
    );
}
