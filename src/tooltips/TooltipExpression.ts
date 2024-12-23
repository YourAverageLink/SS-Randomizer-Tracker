import type { Logic } from '../logic/Logic';
import BooleanExpression, {
    Op,
    type ReducerArg,
} from '../logic/booleanlogic/BooleanExpression';
import type { LogicalState } from '../logic/Locations';
import prettyItemNames_ from '../data/prettyItemNames.json';
import _ from 'lodash';
import { type InventoryItem, itemOrder } from '../logic/Inventory';

const prettyItemNames: Record<
    string,
    Record<number, string>
> = prettyItemNames_;

export interface TerminalRequirement {
    type: 'item';
    sortIndex: number;
    item: string;
    logicalState: LogicalState;
}

export interface NonterminalRequirement {
    type: 'expr';
    sortIndex: number;
    items: TooltipExpression[];
    op: Op;
}

export type TooltipExpression = TerminalRequirement | NonterminalRequirement;

export interface RootTooltipExpression {
    op: Op.And;
    items: TooltipExpression[];
}

const impossible: RootTooltipExpression = {
    op: Op.And,
    items: [
        {
            type: 'item',
            item: 'Impossible (discover an entrance first)',
            sortIndex: 0,
            logicalState: 'outLogic',
        },
    ],
};

const nothing: RootTooltipExpression = {
    op: Op.And,
    items: [
        {
            type: 'item',
            item: 'Nothing',
            sortIndex: 0,
            logicalState: 'inLogic',
        },
    ],
};

function sortRequirements(exprs: TooltipExpression[]) {
    return _.sortBy(exprs, (expr: TooltipExpression) => (expr.sortIndex));
}

export function booleanExprToTooltipExpr(
    logic: Logic,
    expr: BooleanExpression,
    getRequirementLogicalState: (requirement: string) => LogicalState,
): RootTooltipExpression {
    const reducer = (arg: ReducerArg<NonterminalRequirement>): NonterminalRequirement => {
        if (arg.isReduced) {
            return {
                ...arg.accumulator,
                sortIndex:
                    arg.accumulator.op === Op.Or
                        ? Math.min(
                            arg.accumulator.sortIndex,
                            arg.item.sortIndex,
                        )
                        : Math.max(
                            arg.accumulator.sortIndex,
                            arg.item.sortIndex,
                        ),
                items: sortRequirements([...arg.accumulator.items, arg.item]),
            };
        } else {
            const wrappedItem: TerminalRequirement = {
                type: 'item',
                sortIndex: itemOrder[getBaseItem(arg.item) as InventoryItem] ?? 0,
                item: getReadableItemName(logic, arg.item),
                logicalState: getRequirementLogicalState(arg.item),
            };
            return {
                ...arg.accumulator,
                sortIndex:
                    arg.accumulator.op === Op.Or
                        ? Math.min(
                            arg.accumulator.sortIndex,
                            wrappedItem.sortIndex,
                        )
                        : Math.max(
                            arg.accumulator.sortIndex,
                            wrappedItem.sortIndex,
                        ),
                items: sortRequirements([...arg.accumulator.items, wrappedItem]),
            };
        }
    };

    const ntExpr = expr.reduce<NonterminalRequirement>({
        andInitialValue: {
            type: 'expr',
            items: [],
            sortIndex: Number.MIN_SAFE_INTEGER,
            op: Op.And,
        },
        orInitialValue: {
            type: 'expr',
            items: [],
            sortIndex: Number.MAX_SAFE_INTEGER,
            op: Op.Or,
        },
        andReducer: reducer,
        orReducer: reducer,
    });

    if (!ntExpr.items.length) {
        return ntExpr.op === Op.And ? nothing : impossible;
    }

    if (ntExpr.op === Op.And) {
        return {
            items: ntExpr.items,
            op: ntExpr.op,
        };
    } else {
        return {
            items: [ntExpr],
            op: Op.And,
        };
    }
}

const itemCountPat = /^(.+) x (\d+)$/;

function getBaseItem(item: string) {
    const match = item.match(itemCountPat);
    if (match) {
        const [, baseName] = match;
        return baseName;
    }

    return item;
}

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

    return _.last(item.split('\\'))!;
}
