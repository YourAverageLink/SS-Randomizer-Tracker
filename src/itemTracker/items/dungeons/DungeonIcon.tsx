import keyDownWrapper from '../../../utils/KeyDownWrapper';

type DungeonIconProps = {
    image: string;
    iconLabel: string;
    width?: number;
    groupClicked: (group: string) => void;
    area: string;
};
const DungeonIcon = (props: DungeonIconProps) => {
    const { image, iconLabel, width, groupClicked, area } = props;

    const onClick = () => {
        groupClicked(area);
    };
    return (
        <div
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={keyDownWrapper(onClick)}
            style={{...(width ? {} : { width: '100%' })}}
        >
            <img src={image} alt={iconLabel} width={width} style={{...(width ? {} : { width: '100%' })}} />
        </div>
    );
};

export default DungeonIcon;
