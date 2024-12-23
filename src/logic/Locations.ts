import type { ExitRule } from './Entrances';
import type { LogicalCheck } from './Logic';

export interface HintRegion<N extends string = string> {
    name: N;
    nonProgress: boolean;
    hidden: boolean;
    numTotalChecks: number;
    numChecksRemaining: number;
    numChecksAccessible: number;
    numExitsAccessible: number;
    checks: string[];
    extraChecks: {
        tr_cube?: string[];
        loose_crystal?: string[];
        gossip_stone?: string[];
    };
    exits: string[];
}

export type LogicalState = 'outLogic' | 'inLogic' | 'semiLogic' | 'trickLogic';

export interface Check {
    type: LogicalCheck['type'] | 'exit';
    checkId: string;
    checkName: string;
    logicalState: LogicalState;
    checked: boolean;
}

interface AbstractExitMapping {
    exit: {
        id: string;
        name: string;
    };
    entrance:
        | {
              id: string;
              name: string;
              region: string;
          }
        | undefined;
    canAssign: boolean;
    rule: ExitRule;
}

export interface ReadOnlyExitMapping extends AbstractExitMapping {
    canAssign: false;
    rule: ExitRule & { type: 'vanilla' | 'follow' | 'lmfSecondExit' | 'linked' };
}

export interface AssignableExitMapping extends AbstractExitMapping {
    canAssign: true;
    rule: ExitRule & { type: 'random' };
}

export type ExitMapping = ReadOnlyExitMapping | AssignableExitMapping;

export const dungeonNames = [
    'Skyview',
    'Earth Temple',
    'Lanayru Mining Facility',
    'Ancient Cistern',
    'Sandship',
    'Fire Sanctuary',
    'Sky Keep',
] as const;

export type DungeonName = (typeof dungeonNames)[number];
export type RegularDungeon = Exclude<DungeonName, 'Sky Keep'>;
export function isDungeon(id: string): id is DungeonName {
    const names: readonly string[] = dungeonNames;
    return names.includes(id);
}

export function isRegularDungeon(id: string): id is RegularDungeon {
    return isDungeon(id) && id !== 'Sky Keep';
}