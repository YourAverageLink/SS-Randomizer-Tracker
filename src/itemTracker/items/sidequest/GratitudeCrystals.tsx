import allImages from '../../Images';
import { totalGratitudeCrystalsSelector } from '../../../tracker/Selectors';
import { useDispatch, useSelector } from 'react-redux';
import { clickItem } from '../../../tracker/Slice';
import { BasicItem } from '../../BasicItem';

export function GratitudeCrystals({
    className,
    imgWidth,
    grid,
}: {
    className?: string;
    imgWidth?: number;
    grid?: boolean;
}) {
    const dispatch = useDispatch();
    const handleClick = (take: boolean) => {
        dispatch(clickItem({ item: 'Gratitude Crystal Pack', take }));
    };

    const count = useSelector(totalGratitudeCrystalsSelector);

    const itemImages =
        allImages[grid ? 'Gratitude Crystals Grid' : 'Gratitude Crystals'];
    return (
        <BasicItem
            className={className}
            itemName="Gratitude Crystals"
            images={itemImages}
            count={count}
            imgWidth={imgWidth}
            onClick={handleClick}
        />
    );
}
