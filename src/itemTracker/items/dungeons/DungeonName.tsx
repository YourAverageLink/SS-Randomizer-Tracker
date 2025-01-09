import clsx from 'clsx';
import { useDispatch, useSelector } from 'react-redux';
import type { DungeonName as DungeonNameType } from '../../../logic/Locations';
import type { RootState } from '../../../store/Store';
import {
    dungeonCompletedSelector,
    requiredDungeonsSelector,
} from '../../../tracker/Selectors';
import { clickDungeonName } from '../../../tracker/Slice';
import keyDownWrapper from '../../../utils/KeyDownWrapper';
import styles from './DungeonName.module.css';

type DungeonNameProps = {
    dungeonAbbr: string;
    dungeonName: DungeonNameType;
    setActiveArea: (area: string) => void;
};

const DungeonName = (props: DungeonNameProps) => {
    const { dungeonName, dungeonAbbr, setActiveArea } = props;
    const required = useSelector((state: RootState) =>
        requiredDungeonsSelector(state).includes(dungeonName),
    );
    const completed = useSelector(dungeonCompletedSelector(dungeonName));
    const dispatch = useDispatch();

    const currentStyle = {
        color: `var(--scheme-${required ? 'required' : 'unrequired'})`,
    };

    const dungeonChange = () =>
        dungeonName !== 'Sky Keep' &&
        dispatch(clickDungeonName({ dungeonName }));
    const onRightClick = (e: React.UIEvent) => {
        setActiveArea(dungeonName);
        e.preventDefault();
    };

    return (
        <div
            onClick={dungeonChange}
            onKeyDown={keyDownWrapper(dungeonChange)}
            role="button"
            tabIndex={0}
            onContextMenu={onRightClick}
        >
            <span
                className={clsx(styles.dungeonName, {
                    [styles.complete]: completed,
                })}
                style={currentStyle}
            >
                {dungeonAbbr}
            </span>
        </div>
    );
};

export default DungeonName;
