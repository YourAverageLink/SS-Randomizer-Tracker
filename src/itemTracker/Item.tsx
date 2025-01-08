import allImages from './Images';
import type { InventoryItem } from '../logic/Inventory';
import { useDispatch, useSelector } from 'react-redux';
import { locationsForItemSelector, rawItemCountSelector } from '../tracker/Selectors';
import { clickItem } from '../tracker/Slice';
import { BasicItem } from './BasicItem';
import Tooltip from '../additionalComponents/Tooltip';
import { addDividers } from '../utils/React';
import type { CSSProperties } from 'react';

function Item({
    itemName,
    images,
    grid,
    imgWidth,
    className,
    style,
    children,
}: {
    images?: string[];
    itemName: InventoryItem;
    imgWidth?: number | string;
    grid?: boolean;
    className?: string;
    style?: CSSProperties,
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

    const relevantLocations = useSelector(locationsForItemSelector(itemName));

    return (
        <Tooltip
            delay={500}
            content={addDividers(['Found at:', ...relevantLocations], <br />)}
            disabled={!relevantLocations.length}
        >
            <BasicItem
                style={style}
                className={className}
                itemName={itemName}
                images={itemImages}
                count={count}
                imgWidth={imgWidth}
                onClick={handleClick}
            >
                {children}
            </BasicItem>
        </Tooltip>
    );
}

export default Item;
