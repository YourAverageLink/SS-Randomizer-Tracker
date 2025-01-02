import type { Logic } from '../logic/Logic';
import BooleanExpression, {
    type Item,
    type Op,
} from '../logic/booleanlogic/BooleanExpression';
import type { LogicalState } from '../logic/Locations';
import prettyItemNames_ from '../data/prettyItemNames.json';
import { last, sortBy, sumBy } from 'es-toolkit';

const prettyItemNames: Record<
    string,
    Record<number, string>
> = prettyItemNames_;

export interface TerminalRequirement {
    type: 'item';
    item: string;
    logicalState: LogicalState;
}

export interface NonterminalRequirement {
    type: 'expr';
    items: TooltipExpression[];
    op: Op;
}

export type TooltipExpression = TerminalRequirement | NonterminalRequirement;

export interface RootTooltipExpression {
    op: 'and';
    items: TooltipExpression[];
}

const impossible: RootTooltipExpression = {
    op: 'and',
    items: [
        {
            type: 'item',
            item: 'Impossible (discover an entrance first)',
            logicalState: 'outLogic',
        },
    ],
};

const nothing: RootTooltipExpression = {
    op: 'and',
    items: [
        {
            type: 'item',
            item: 'Nothing',
            logicalState: 'inLogic',
        },
    ],
};

function numTerms(item: TooltipExpression): number {
    if (item.type === 'expr') {
        return sumBy(item.items, numTerms);
    }
    return 1;
}

function getLength(item: TooltipExpression): number {
    if (item.type === 'expr') {
        return numTerms(item);
    } else {
        return -1;
    }
}

function getName(item: TooltipExpression): string {
    if (item.type === 'expr') {
        return "";
    } else {
        return item.item;
    }
}

function booleanExprToTooltipExprRecursive(
    logic: Logic,
    expr: BooleanExpression,
    getRequirementLogicalState: (requirement: string) => LogicalState,
): NonterminalRequirement {
    const mapItem = (item: Item): TooltipExpression => {
        if (BooleanExpression.isExpression(item)) {
            return booleanExprToTooltipExprRecursive(logic, item, getRequirementLogicalState);
        } else {
            return {
                type: 'item',
                item: getReadableItemName(logic, item),
                logicalState: getRequirementLogicalState(item),
            };
        }
    }
    const items = expr.items.map(mapItem);
    return {
        type: 'expr',
        op: expr.type,
        items: sortBy(items, [getLength, getName]),
    }
}

export function booleanExprToTooltipExpr(
    logic: Logic,
    expr: BooleanExpression,
    getRequirementLogicalState: (requirement: string) => LogicalState,
): RootTooltipExpression {
    const ntExpr = booleanExprToTooltipExprRecursive(logic, expr, getRequirementLogicalState);

    if (!ntExpr.items.length) {
        return ntExpr.op === 'and' ? nothing : impossible;
    }

    if (ntExpr.op === 'and') {
        return {
            items: ntExpr.items,
            op: ntExpr.op,
        };
    } else {
        return {
            items: [ntExpr],
            op: 'and',
        };
    }
}

const itemCountPat = /^(.+) x (\d+)$/;

function getReadableItemName(logic: Logic, item: string) {
    if (item in prettyItemNames) {
        return prettyItemNames[item][1];
    }

    const match = item.match(itemCountPat);
    if (match) {
        const [, baseName, count] = match;
        if (baseName in prettyItemNames) {
            const pretty = prettyItemNames[baseName][parseInt(count, 10)];
            if (pretty) {
                return pretty;
            }
        }
    }

    const check = logic.checks[item];
    if (check) {
        return check.name;
    }

    return last(item.split('\\'))!;
}
