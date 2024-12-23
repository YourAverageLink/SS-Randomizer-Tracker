import allImages from './Images';
import keyDownWrapper from '../KeyDownWrapper';
import { InventoryItem } from '../logic/Inventory';
import { useDispatch, useSelector } from 'react-redux';
import { rawItemCountSelector } from '../tracker/selectors';
import { clickItem } from '../tracker/slice';
import clsx from 'clsx';
import './Item.css';

type ItemProps = {
    images?: string[];
    itemName: InventoryItem;
    imgWidth?: number | string;
    grid?: boolean;
    className?: string;
};

const Item = (props: ItemProps) => {
    const { itemName, images, grid, imgWidth, className } = props;

    const dispatch = useDispatch();
    const count = useSelector(rawItemCountSelector(itemName));

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

    const handleClick = (e: React.UIEvent) => {
        if (e.type === 'contextmenu') {
            dispatch(clickItem({ item: itemName, take: true }));
            e.preventDefault();
        } else {
            dispatch(clickItem({ item: itemName, take: false }));
        }
    };

    return (
        <div
            className={clsx('item-container', className)}
            onClick={handleClick}
            onContextMenu={handleClick}
            onKeyDown={keyDownWrapper(handleClick)}
            role="button"
            tabIndex={0}
            style={{ width: imgWidth }}
        >
            <img src={itemImages[count]} alt={itemName} />
        </div>
    );
};

export default Item;
