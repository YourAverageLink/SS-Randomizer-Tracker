import keyDownWrapper from '../KeyDownWrapper';
import clsx from 'clsx';
import './BasicItem.css';
import _ from 'lodash';

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
    children,
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
    children?: React.ReactNode,
}) {
    const handleClick = (e: React.UIEvent) => {
        if (e.type === 'contextmenu') {
            onClick(true);
            e.preventDefault();
        } else {
            onClick(false);
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
            <img src={images[count] ?? _.last(images)} alt={itemName} />
            {children}
        </div>
    );
}
