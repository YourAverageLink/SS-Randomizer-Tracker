import React from 'react';
import { Op } from '../logic/booleanlogic/BooleanExpression';
import { RootTooltipExpression, TooltipExpression } from '../tooltips/TooltipExpression';
import { addDividers } from '../utils/React';

export default function RequirementsTooltip({
    requirements,
}: {
    requirements: RootTooltipExpression | undefined;
}) {
    return (
        <div>
            {requirements ? (
                <TopLevelExpr
                    expr={requirements}
                />
            ) : (
                'Loading...'
            )}
        </div>
    );
}

function TopLevelExpr({
    expr,
}: {
    expr: RootTooltipExpression;
}) {
    return (
        <>
            {expr.items.map((item, idx) => (
                <li key={idx}>
                    <Expr
                        expr={item}
                        parentOp={undefined}
                    />
                </li>
            ))}
        </>
    );
}

function Expr({
    expr,
    parentOp,
}: {
    expr: TooltipExpression;
    parentOp: Op | undefined;
}): React.ReactElement {
    if (expr.type === 'expr') {
        return (
            <>
                {parentOp !== undefined && '('}
                {addDividers(
                    expr.items.map((val, idx) => (
                        <Expr
                            key={idx}
                            expr={val}
                            parentOp={expr.op}
                        />
                    )),
                    <>{` ${expr.op} `}</>,
                )}
                {parentOp !== undefined && ')'}
            </>
        );
    } else {
        return (
            <span
                style={{
                    color: `var(--scheme-${expr.logicalState})`,
                }}
            >
                {expr.item}
            </span>
        );
    }
}


