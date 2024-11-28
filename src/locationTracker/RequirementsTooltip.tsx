import React from 'react';
import './RequirementsTooltip.css';
import { cloneElement } from 'react';
import { Op } from '../logic/booleanlogic/BooleanExpression';
import { RootTooltipExpression, TooltipExpression } from '../tooltips/TooltipExpression';

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
                {parentOp && '('}
                {addDividers(
                    expr.items.map((val, idx) => (
                        <Expr
                            key={idx}
                            expr={val}
                            parentOp={expr.op}
                        />
                    )),
                    // eslint-disable-next-line sonarjs/jsx-no-useless-fragment
                    <>{` ${expr.op} `}</>,
                )}
                {parentOp && ')'}
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

/** places a divider between each element of arr */
function addDividers<T extends React.ReactNode>(
    arr: T[],
    divider: React.ReactElement,
): React.ReactNode[] {
    return arr.flatMap((e, i) => [
        i ? cloneElement(divider, { key: `divider-${i}` }) : null,
        e,
    ]);
}
