import allImages from '../Images';
import keyDownWrapper from '../../KeyDownWrapper';
import { InventoryItem } from '../../logic/Inventory';
import { useDispatch, useSelector } from 'react-redux';
import { clickItem } from '../../tracker/slice';
import { rawItemCountSelector } from '../../tracker/selectors';
import { CSSProperties } from 'react';

type CounterItemProps = {
    images?: string[];
    itemName: InventoryItem;
    imgWidth: number;
    ignoreItemClass: boolean;
    grid?: boolean;
    asSpan?: boolean;
    fontSize: number;
};

const CounterItem = (props: CounterItemProps) => {
    const {
        images,
        itemName,
        imgWidth,
        ignoreItemClass,
        grid,
        asSpan,
        fontSize,
    } = props;

    const dispatch = useDispatch();

    const handleClick = (e: React.UIEvent) => {
        if (e.type === 'contextmenu') {
            dispatch(clickItem({ item: itemName, take: true }));
            e.preventDefault();
        } else {
            dispatch(clickItem({ item: itemName, take: false }));
        }
    };

    const current = useSelector(rawItemCountSelector(itemName));

    let itemImages: string[];
    if (!images) {
        if (grid) {
            itemImages = allImages[`${itemName} Grid`];
        } else {
            itemImages = allImages[itemName];
        }
    } else {
        itemImages = images;
    }
    const image = current === 0 ? itemImages[0] : itemImages[1];
    const className = ignoreItemClass ? '' : 'item';

    const style: CSSProperties = { position: 'relative', textAlign: 'center', width: imgWidth };
    

    if (asSpan) {
        return (
            <span
                className={`item-container ${className}`}
                style={style}
                onClick={handleClick}
                onContextMenu={handleClick}
                onKeyDown={keyDownWrapper(handleClick)}
                role="button"
                tabIndex={0}
            >
                <img src={image} alt={itemName} />
                {current > 0 && (
                    <div
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            background: 'var(--scheme-background)',
                            width: '80%',
                            height: '150%',
                            fontSize,
                            pointerEvents: 'none',
                        }}
                    >
                        <p
                            style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                            }}
                        >
                            {current}
                        </p>
                    </div>
                )}
            </span>
        );
    }
    return (
        <div
            className={`item-container ${className}`}
            style={style}
            onClick={handleClick}
            onContextMenu={handleClick}
            onKeyDown={keyDownWrapper(handleClick)}
            role="button"
            tabIndex={0}
        >
            <img src={image} alt={itemName} />
            {current > 0 && (
                <div
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        background: 'grey',
                        width: '40%',
                        height: '60%',
                        fontSize,
                        pointerEvents: 'none',
                    }}
                >
                    <p
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                        }}
                    >
                        {current}
                    </p>
                </div>
            )}
        </div>
    );
};

export default CounterItem;
