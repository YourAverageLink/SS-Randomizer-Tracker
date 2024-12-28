import type { CSSProperties } from 'react';
import Item from './Item';
import miscItemBlock from '../assets/misc_items_block.png';
import { useSelector } from 'react-redux';
import { rawItemCountSelector } from '../tracker/selectors';

export default function AdditionalItems({ width }: { width: number }) {
    const pouchStyle: CSSProperties = {
        position: 'absolute',
        bottom: width * 0.43,
        left: width * 0.08,
    };
    const bottleStyle: CSSProperties = {
        position: 'absolute',
        bottom: width * 0.435,
        left: width * 0.31,
    };
    const chargeStyle: CSSProperties = {
        position: 'absolute',
        bottom: width * 0.435,
        left: width * 0.54,
    };
    const tadtoneStyle: CSSProperties = {
        position: 'absolute',
        bottom: width * 0.43,
        left: width * 0.785,
    };
    const keyStyle: CSSProperties = {
        position: 'absolute',
        bottom: width * 0.22,
        left: width * 0.08,
    };
    const chartStyle: CSSProperties = {
        position: 'absolute',
        bottom: width * 0.22,
        left: width * 0.35,
    };
    const fruitStyle: CSSProperties = {
        position: 'absolute',
        bottom: width * 0.22,
        left: width * 0.542,
    };
    const scrapperStyle: CSSProperties = {
        position: 'absolute',
        bottom: width * 0.22,
        left: width * 0.785,
    };

    const bottleCount = useSelector(rawItemCountSelector('Empty Bottle'));
    const tadtoneCount = useSelector(rawItemCountSelector('Group of Tadtones'));

    const keyWidth = width / 6.5;
    const chartWidth = width / 10;
    const chargeWidth = width / 6.5;
    const pouchWidth = width / 6.5;
    const bottleWidth = width / 6.5;
    const fruitWidth = width / 6.5;
    const tadtoneWidth = width / 7;
    const scrapperWidth = width / 6.5;
    return (
        <div id="misc-items" style={{ display: 'flex' }}>
            <img src={miscItemBlock} alt="" width={width} />
            <div style={pouchStyle}>
                <Item itemName="Progressive Pouch" imgWidth={pouchWidth} />
            </div>
            <div style={bottleStyle}>
                <Item itemName="Empty Bottle" imgWidth={bottleWidth} />
                <p
                    style={{
                        fontSize: width * 0.12,
                        position: 'absolute',
                        left: width * 0.1,
                        top: width * 0.05,
                    }}
                >
                    {bottleCount}
                </p>
            </div>
            <div style={chargeStyle}>
                <Item itemName="Spiral Charge" imgWidth={chargeWidth} />
            </div>
            <div style={tadtoneStyle}>
                <Item itemName="Group of Tadtones" imgWidth={tadtoneWidth} />
                <p
                    style={{
                        fontSize: width * 0.12,
                        position: 'absolute',
                        left: width * 0.1,
                        top: width * 0.05,
                    }}
                >
                    {tadtoneCount}
                </p>
            </div>
            <div style={keyStyle}>
                <Item itemName="Lanayru Caves Small Key" imgWidth={keyWidth} />
                <p
                    style={{
                        margin: 0,
                        fontSize: width / 20,
                        position: 'absolute',
                        top: `${keyWidth * 0.75}px`,
                        left: '1%',
                    }}
                >
                    Caves
                </p>
            </div>
            <div style={chartStyle}>
                <Item itemName="Sea Chart" imgWidth={chartWidth} />
            </div>
            <div style={fruitStyle}>
                <Item itemName="Life Tree Fruit" imgWidth={fruitWidth} />
            </div>
            <div style={scrapperStyle}>
                <Item itemName="Scrapper" imgWidth={scrapperWidth} />
            </div>
        </div>
    );
}
