import type { CSSProperties } from 'react';
import Item from './Item';
import allImages from './Images';
import swordBlock from '../assets/Sword_Block.png';

import CrystalCounter from './items/sidequest/CrystalCounter';
import keyDownWrapper from '../KeyDownWrapper';
import { useDispatch, useSelector } from 'react-redux';
import { rawItemCountSelector } from '../tracker/selectors';
import { clickItem } from '../tracker/slice';

export default function SwordBlock({width}: {width: number}) {
    const dispatch = useDispatch();
    const handleExtraWalletClick = () => {
        dispatch(clickItem({ item: 'Extra Wallet', take: false }));
    };

    const swordStyle: CSSProperties = {
        position: 'relative',
        bottom: width / 0.84,
        left: width / 2.85,
    };

    const faroresFlameStyle: CSSProperties = {
        position: 'relative',
        bottom: width / 1.07,
        left: width / 1.36,
    };

    const nayrusFlameStyle: CSSProperties = {
        position: 'relative',
        bottom: width / 1.12,
        left: width / 20,
    };

    const dinsFlameStyle: CSSProperties = {
        position: 'relative',
        bottom: width / 0.69,
        left: width / 2.55,
    };

    const walletStyle: CSSProperties = {
        position: 'relative',
        bottom: width / 2.46,
        left: width / 1.6,
    };
    const extraWalletStyle: CSSProperties = {
        userSelect: 'none',
        position: 'relative',
        bottom: width / 4.6,
        left: width / 1.2,
    };

    const swordWidth = width / 3.1;
    const flameWidth = width / 4.4;
    const walletWidth = width / 3;

    const extraWalletCount = useSelector(rawItemCountSelector('Extra Wallet'));

    return (
        <div>
            <img src={swordBlock} alt="" width={width} />
            <div style={swordStyle}>
                <Item itemName="Progressive Sword" imgWidth={swordWidth} />
            </div>
            <div style={faroresFlameStyle}>
                <Item
                    itemName="Progressive Sword"
                    images={allImages["Farore's Flame"]}
                    imgWidth={flameWidth}
                />
            </div>
            <div style={nayrusFlameStyle}>
                <Item
                    itemName="Progressive Sword"
                    images={allImages["Nayru's Flame"]}
                    imgWidth={flameWidth}
                />
            </div>
            <div style={dinsFlameStyle}>
                <Item
                    itemName="Progressive Sword"
                    images={allImages["Din's Flame"]}
                    imgWidth={flameWidth}
                />
            </div>
            <div style={walletStyle}>
                <Item itemName="Progressive Wallet" imgWidth={walletWidth} />
            </div>
            <div
                style={extraWalletStyle}
                onClick={handleExtraWalletClick}
                onKeyDown={keyDownWrapper(handleExtraWalletClick)}
                tabIndex={0}
                role="button"
            >
                <CrystalCounter
                    current={`+${extraWalletCount * 300}`}
                    fontSize={width * 0.12}
                />
            </div>
        </div>
    );
};
