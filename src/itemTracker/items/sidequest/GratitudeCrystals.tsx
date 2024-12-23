import allImages from '../../Images';
import keyDownWrapper from '../../../KeyDownWrapper';
import { totalGratitudeCrystalsSelector } from '../../../tracker/selectors';
import { useDispatch, useSelector } from 'react-redux';
import { clickItem } from '../../../tracker/slice';
import '../../Item.css';

type GratitudeCrystalsProps = {
    images?: string[];
    imgWidth: number;
    grid?: boolean;
};

const GratitudeCrystals = (props: GratitudeCrystalsProps) => {
    const { images, imgWidth, grid } = props;
    const dispatch = useDispatch();
    const handleClick = (e: React.UIEvent) => {
        if (e.type === 'click') {
            dispatch(clickItem({ item: 'Gratitude Crystal Pack', take: false }));
        } else if (e.type === 'contextmenu') {
            dispatch(clickItem({ item: 'Gratitude Crystal Pack', take: true }));
            e.preventDefault();
        }
    };

    const count = useSelector(totalGratitudeCrystalsSelector);

    const current = count >= 1 ? 1 : 0;
    let itemImages;
    if (!images) {
        if (grid) {
            itemImages = allImages['Gratitude Crystals Grid'];
        } else {
            itemImages = allImages['Gratitude Crystals'];
        }
    } else {
        itemImages = images;
    }
    return (
        <div
            className="item-container"
            onClick={handleClick}
            onContextMenu={handleClick}
            onKeyDown={keyDownWrapper(handleClick)}
            role="button"
            tabIndex={0}
            style={{ width: imgWidth }}
        >
            <img
                src={itemImages[current]}
                alt="Gratitude Crystals"
            />
        </div>
    );
};

export default GratitudeCrystals;
