import {
    bottomUpTooltipPropagation,
    removeDuplicates,
    shallowSimplify,
    unifyRequirements,
} from '../../logic/bitlogic/BitLogic';
import { BitVector } from '../../logic/bitlogic/BitVector';
import { LogicalExpression } from '../../logic/bitlogic/LogicalExpression';
import {
    deserializeLogicalExpression,
    serializeBooleanExpression,
} from './Utils';
import type { LeanLogic, WorkerRequest, WorkerResponse } from './Types';
import BooleanExpression from '../../logic/booleanlogic/BooleanExpression';
import { dnfToRequirementExpr } from './Algorithms';

/**
 * This module contains various strategies to turn the requirements into a more compact and readable
 * form, with the goal of creating readable and understandable requirements for tooltips.
 */

/**
 * Global application state. Will be initialized with the first message.
 */
interface GlobalState {
    logic: LeanLogic;
    opaqueBits: BitVector;
    learned: Set<number>;
    requirementsForBottomUp: LogicalExpression[];
}

let g: GlobalState;

console.log('Hello from worker!');

onmessage = (ev: MessageEvent<WorkerRequest>) => {
    const start = performance.now();
    switch (ev.data.type) {
        case 'initialize': {
            const opaqueBits = new BitVector();
            for (const bit of ev.data.opaqueBits) {
                opaqueBits.setBit(bit);
            }
            const requirements = ev.data.requirements.map(
                deserializeLogicalExpression,
            );
            g = {
                logic: ev.data.logic,
                opaqueBits,
                learned: new Set(),
                requirementsForBottomUp: requirements,
            };

            do {
                // First, perform some cheap optimizations that will help every
                // query afterwards.
                removeDuplicates(g.requirementsForBottomUp);
                while (shallowSimplify(g.opaqueBits, g.requirementsForBottomUp)) {
                    removeDuplicates(g.requirementsForBottomUp);
                }
            } while (unifyRequirements(g.opaqueBits, g.requirementsForBottomUp));
            console.log('worker', 'initializing and pre-simplifying took', performance.now() - start, 'ms');

            const start2 = performance.now();
            bottomUpTooltipPropagation(g.opaqueBits, g.requirementsForBottomUp);
            console.log('worker', 'fixpoint propagation took', performance.now() - start2, 'ms');

            break;
        }
        case 'analyze': {
            if (!g) {
                throw new Error('needs to be initialized first!!!!');
            }
            const expr = analyze(ev.data.checkId);
            console.log('worker', 'total time for', ev.data.checkId, 'was', performance.now() - start, 'ms');
            postMessage({
                checkId: ev.data.checkId,
                expression: serializeBooleanExpression(expr),
            } satisfies WorkerResponse);
        }
    }
};

function analyze(checkId: string): BooleanExpression {
    const bit = g.logic.itemBits[checkId];
    const bottomUpExpression = g.requirementsForBottomUp[bit].removeDuplicates();
    const simplifyStart = performance.now();
    const simplified = dnfToRequirementExpr(g.logic, bottomUpExpression.conjunctions);
    console.log('  ', 'worker', 'simplifying took', performance.now() - simplifyStart, 'ms');
    return simplified;
}
