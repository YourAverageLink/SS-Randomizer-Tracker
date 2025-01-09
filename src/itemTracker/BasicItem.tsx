import clsx from 'clsx';
import { last } from 'es-toolkit';
import keyDownWrapper from '../utils/KeyDownWrapper';
import './BasicItem.css';
import { findRepresentativeIcon } from './Images';

/**
 * The fundamental controlled item component.
 * Should rarely be used directly, instead use Item / GratitudeCrystals / Wallet
 * components which internally use this BasicItem.
 */
export function BasicItem({
    itemName,
    images,
    imgWidth,
    className,
    count,
    onClick,
    dragItemName,
    children,
    style,
    ...restProps
}: {
    /** A human-readable accessibility name */
    itemName: string;
    /** The list of item images, one entry per possible count */
    images: string[];
    /** A fixed item width, if needed. Otherwise 100% */
    imgWidth?: number | string;
    /** An optional class name to customize this item's style */
    className?: string;
    /** The item count */
    count: number;
    /** Click callback for the main item */
    onClick: (take: boolean) => void;
    /** Item name to transfer when dragged onto a location or region */
    dragItemName: string;
    children?: React.ReactNode;
} & Omit<React.HTMLProps<HTMLDivElement>, 'onClick'>) {
    const handleClick = (e: React.UIEvent) => {
        if (e.type === 'contextmenu') {
            onClick(true);
            e.preventDefault();
        } else {
            onClick(false);
        }
    };

    const handleDragStart = (event: React.DragEvent<HTMLDivElement>) => {
        event.dataTransfer.setData("text/plain", dragItemName);
        event.dataTransfer.effectAllowed = "move";
        const dragIcon = new Image(36, 36);
        dragIcon.src = findRepresentativeIcon(dragItemName);
        event.dataTransfer.setDragImage(dragIcon, 18, 18);
    };

    return (
        <div
            className={clsx('item-container', className)}
            onClick={handleClick}
            onDragStart={handleDragStart}
            onContextMenu={handleClick}
            onKeyDown={keyDownWrapper(handleClick)}
            role="button"
            tabIndex={0}
            style={{ width: imgWidth, ...style }}
            {...restProps}
        >
            <img src={images[count] ?? last(images)} alt={itemName} />
            {children}
        </div>
    );
}
