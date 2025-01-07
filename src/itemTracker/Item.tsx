import allImages from './Images';
import type { InventoryItem } from '../logic/Inventory';
import { useDispatch, useSelector } from 'react-redux';
import { rawItemCountSelector } from '../tracker/Selectors';
import { clickItem } from '../tracker/Slice';
import { BasicItem } from './BasicItem';

function Item({
    itemName,
    images,
    grid,
    imgWidth,
    className,
    children,
}: {
    images?: string[];
    itemName: InventoryItem;
    imgWidth?: number | string;
    grid?: boolean;
    className?: string;
    children?: React.ReactNode;
}) {
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

    const handleClick = (take: boolean) => {
        dispatch(clickItem({ item: itemName, take }));
    };

    return (
        <BasicItem
            className={className}
            itemName={itemName}
            images={itemImages}
            count={count}
            imgWidth={imgWidth}
            onClick={handleClick}
        >
            {children}
        </BasicItem>
    );
}

export default Item;
