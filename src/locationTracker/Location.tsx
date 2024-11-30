import { Col, Row } from 'react-bootstrap';
import keyDownWrapper from '../KeyDownWrapper';
import { useContextMenu } from './context-menu';
import { CSSProperties, useCallback } from 'react';
import { TriggerEvent } from 'react-contexify';
import images from '../itemTracker/Images';
import placeholderImg from '../assets/slot test.png';
import '../locationTracker/Location.css';
import { useEntrancePath, useTooltipExpr } from '../tooltips/TooltipHooks';
import RequirementsTooltip from './RequirementsTooltip';
import { useDispatch, useSelector } from 'react-redux';
import { checkHintSelector, checkSelector, isCheckBannedSelector } from '../tracker/selectors';
import { clickCheck } from '../tracker/slice';
import PathTooltip from './PathTooltip';
import Tooltip from '../additionalComponents/Tooltip';
import { RootState } from '../store/store';

export interface LocationContextMenuProps {
    checkId: string;
}

export default function Location({
    id,
}: {
    id: string;
}) {
    const dispatch = useDispatch();
    const hintItem = useSelector(checkHintSelector(id));
    const isBanned = useSelector((state: RootState) => isCheckBannedSelector(state)(id));

    const check = useSelector(checkSelector(id));

    function onClick(e: React.UIEvent) {
        if (!(e.target as Element | null)?.id) {
            return;
        }
        dispatch(clickCheck({ checkId: id }));
    }

    const style = {
        textDecoration: check.checked ? 'line-through' : 'none',
        userSelect: 'none',
        cursor: 'pointer',
        color: check.checked ? `var(--scheme-checked)` : `var(--scheme-${check.logicalState})`,
        paddingLeft: 6,
        paddingRight: 0,
    } satisfies CSSProperties;

    const { show } = useContextMenu<LocationContextMenuProps>({
        id: 'location-context',
    });

    const displayMenu = useCallback((e: TriggerEvent) => {
        show({ event: e, props: { checkId: id } });
    }, [id, show]);

    const expr = useTooltipExpr(id);
    const path = useEntrancePath(id);

    return (
        <Tooltip content={
            <>
                <RequirementsTooltip requirements={expr} />
                {path && <><hr /><PathTooltip segments={path} /></>}
                {isBanned && (
                    <span style={{ color: 'grey', fontStyle: 'italic' }}>
                        This location is excluded by current settings and
                        will never be logically required.
                    </span>
                )}
            </>
        }>
            <div
                className="location-container"
                onClick={onClick}
                onKeyDown={keyDownWrapper(onClick)}
                role="button"
                tabIndex={0}
                onContextMenu={displayMenu}
            >
                <Row>
                    <Col
                        style={style}
                        id={id}
                    >
                        {check.checkName}
                    </Col>
                    {hintItem && (
                        <Col sm={2} style={{ padding: 0 }}>
                            <img src={images[hintItem]?.[images[hintItem].length - 1] || placeholderImg} height={30} title={hintItem} alt={hintItem} />
                        </Col>
                    )}
                </Row>
            </div>
        </Tooltip>
    );
}
