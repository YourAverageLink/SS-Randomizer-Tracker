import { Col, Row } from 'react-bootstrap';
import '../locationTracker/Location.css';
import { useEntrancePath, useTooltipExpr } from '../tooltips/TooltipHooks';
import RequirementsTooltip from './RequirementsTooltip';
import { useSelector } from 'react-redux';
import { checkSelector, exitsSelector } from '../tracker/selectors';
import { RootState } from '../store/store';
import EntranceSelectionDialog from './EntranceSelectionDialog';
import { useState } from 'react';
import PathTooltip from './PathTooltip';
import Tooltip from '../additionalComponents/Tooltip';

export default function Exit({
    id,
    setActiveArea,
}: {
    id: string;
    setActiveArea: (area: string) => void;
}) {
    const exit = useSelector((state: RootState) => exitsSelector(state).find((e) => e.exit.id === id))!;
    const check = useSelector(checkSelector(id));
    const [showEntranceDialog, setShowEntranceDialog] = useState(false);

    const style = {
        textDecoration: 'none',
        color: check.checked ? `var(--scheme-checked)` : `var(--scheme-${check.logicalState})`,
        paddingLeft: 6,
        paddingRight: 0,
    };

    const expr = useTooltipExpr(id);
    const path = useEntrancePath(id);

    return (
        <>
            <EntranceSelectionDialog exitId={id} show={showEntranceDialog} onHide={() => setShowEntranceDialog(false)} />
            <div
                className="location-container"
                style={{ cursor: 'default' }}
            >
                <Row>
                    <Tooltip content={
                        <>
                            <RequirementsTooltip requirements={expr} />
                            {path && <><hr /><PathTooltip segments={path} /></>}
                        </>
                    }>
                        <Col
                            style={style}
                        >
                            {check.checkName}
                        </Col>
                    </Tooltip>
                    <Col xs="auto">
                        {' ➡️ '}
                    </Col>
                    <Col role="button" onClick={() => setShowEntranceDialog(true)}>
                        {exit.entrance?.name ?? 'Select entrance...'}
                    </Col>
                    <Col style={exit.entrance ? {} : { visibility: 'hidden' }} role="button" xs="auto" onClick={() => exit.entrance?.region && setActiveArea(exit.entrance.region)}>
                        {' 🔎 '}
                    </Col>
                </Row>
            </div>
        </>
    );
}
