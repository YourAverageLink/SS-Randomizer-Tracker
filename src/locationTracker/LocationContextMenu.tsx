import { useCallback } from 'react';
import { Menu, Item, Separator, Submenu, type ItemParams } from 'react-contexify';

import hintItems from '../data/hintItems.json';
import type { LocationContextMenuProps } from './Location';
import { useDispatch } from 'react-redux';
import { clickCheck, setCheckHint } from '../tracker/Slice';
import images from '../itemTracker/Images';
import { last } from 'es-toolkit';

type CtxProps<T = void> = ItemParams<LocationContextMenuProps, T>;
interface ItemData {
    item: string;
}

export default function LocationContextMenu() {
    const dispatch = useDispatch();

    const handleCheckClick = useCallback(
        (params: CtxProps) =>
            dispatch(clickCheck({
                checkId: params.props!.checkId,
                markChecked: true,
            })),
        [dispatch],
    );

    const handleUncheckClick = useCallback(
        (params: CtxProps) =>
            dispatch(clickCheck({
                checkId: params.props!.checkId,
                markChecked: false,
            })),
        [dispatch],
    );

    const handleSetItemClick = useCallback(
        (params: CtxProps<ItemData>) =>
            dispatch(setCheckHint({
                checkId: params.props!.checkId,
                hint: params.data!.item,
            })),
        [dispatch],
    );

    const handleClearItemClick = useCallback(
        (params: CtxProps<ItemData>) =>
            dispatch(setCheckHint({
                checkId: params.props!.checkId,
                hint: undefined,
            })),
        [dispatch],
    );

    return (
        <Menu id="location-context">
            <Item onClick={handleCheckClick}>Check</Item>
            <Item onClick={handleUncheckClick}>Uncheck</Item>
            <Separator />
            <Submenu label="Set Item">
                {Object.entries(hintItems).map(([category, items]) => (
                    <Submenu key={category} label={category}>
                        {items.map((listItem) => (
                            <Item
                                key={listItem}
                                onClick={handleSetItemClick}
                                data={{ item: listItem } satisfies ItemData}
                            >
                                <HintItem itemName={listItem} />
                            </Item>
                        ))}
                    </Submenu>
                ))}
            </Submenu>
            <Item onClick={handleClearItemClick}>Clear Item</Item>
        </Menu>
    );
}

export function HintItem({ itemName }: { itemName: string }) {
    const image = last(images[itemName]);
    return (<span style={{ display: 'flex', flexFlow: 'row nowrap' }}>
        <div style={{ width: '36px', height: '36px', paddingRight: '6px' }}>
            <img style={{ width: '100%', height: '100%', objectFit: 'contain' }} src={image} alt={itemName} />
        </div>
        {itemName}
    </span>);
}