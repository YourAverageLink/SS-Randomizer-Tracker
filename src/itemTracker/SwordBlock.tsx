import type { CSSProperties } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import swordBlock from '../assets/Sword_Block.png';
import { rawItemCountSelector } from '../tracker/Selectors';
import { clickItem } from '../tracker/Slice';
import keyDownWrapper from '../utils/KeyDownWrapper';
import allImages, { findRepresentativeIcon } from './Images';
import Item from './Item';

export default function SwordBlock({ width }: { width: number }) {
    const dispatch = useDispatch();
    const handleExtraWalletClick = () => {
        dispatch(clickItem({ item: 'Extra Wallet', take: false }));
    };

    const handleExtraWalletDrag = (event: React.DragEvent<HTMLDivElement>) => {
        // This doesn't seem to work
        event.dataTransfer.setData("text/plain", 'Extra Wallet');
        event.dataTransfer.effectAllowed = "move";
        const dragIcon = new Image(36, 36);
        dragIcon.src = findRepresentativeIcon('Extra Wallet');
        event.dataTransfer.setDragImage(dragIcon, 18, 18);
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
                style={{ ...extraWalletStyle, fontSize: width * 0.12 }}
                onClick={handleExtraWalletClick}
                onDragStart={handleExtraWalletDrag}
                onKeyDown={keyDownWrapper(handleExtraWalletClick)}
                tabIndex={0}
                role="button"
            >
                {`+${extraWalletCount * 300}`}
            </div>
        </div>
    );
}
