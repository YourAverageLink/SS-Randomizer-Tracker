import { Col, Row } from 'react-bootstrap';
import keyDownWrapper from '../KeyDownWrapper';
import { useDispatch, useAppState, useDerivedState } from '../newApp/Context';
import { LogicalState } from '../newApp/DerivedState';
import { useContextMenu } from './context-menu';
import { useCallback } from 'react';
import { TriggerEvent } from 'react-contexify';
import images from '../itemTracker/Images';
import placeholderImg from '../assets/slot test.png';
import '../locationTracker/Location.css';
import Tippy from '@tippyjs/react';

export interface LocationContextMenuProps {
    checkId: string;
}

export default function Location({
    name,
    id,
    checked,
    logicalState,
    hintItem,
}: {
    name: string;
    id: string;
    checked: boolean;
    logicalState: LogicalState;
    hintItem?: string;
}) {
    const dispatch = useDispatch();
    const colorScheme = useAppState().colorScheme;

    function onClick(e: React.UIEvent) {
        if (!(e.target as Element | null)?.id) {
            return;
        }
        dispatch({ type: 'onCheckClick', check: id });
    }

    const style = {
        textDecoration: checked ? 'line-through' : 'none',
        cursor: 'pointer',
        color: checked ? colorScheme.checked : colorScheme[logicalState],
        paddingLeft: 6,
        paddingRight: 0,
    };

    const { show } = useContextMenu<LocationContextMenuProps>({
        id: 'location-context',
    });

    const displayMenu = useCallback((e: TriggerEvent) => {
        show({ event: e, props: { checkId: id } });
    }, [id, show]);

    return (
        <Tippy content={<Tooltip checkId={id} />}>
            <div
                className="location-container"
                onClick={onClick}
                onKeyDown={keyDownWrapper(onClick)}
                role="button"
                tabIndex={0}
                onContextMenu={displayMenu}
            >
                <Row className="g-0">
                    <Col
                        style={style}
                        id={id}
                    >
                        {name}
                    </Col>
                    {hintItem && (
                        <Col sm={2} style={{ padding: 0 }}>
                            <img src={images[hintItem]?.[images[hintItem].length - 1] || placeholderImg} height={30} title={hintItem} alt={hintItem} />
                        </Col>
                    )}
                </Row>
            </div>
        </Tippy>
    );
}

function Tooltip({ checkId }: { checkId: string }) {
    return <>{useDerivedState().tooltipComputer(checkId)}</>;
}