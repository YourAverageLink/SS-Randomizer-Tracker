import { type AppAction, type RootState, type Store, createStore } from '../store/Store';
import { getAndPatchLogic, type RemoteReference } from '../loader/LogicLoader';
import type { AllTypedOptions } from '../permalink/SettingsTypes';

import fs from 'node:fs';
import { loadLogic } from '../logic/Slice';
import { defaultSettings } from '../permalink/Settings';
import { reset } from '../tracker/Slice';
import { logicSelector } from '../logic/Selectors';
import {
    areasSelector,
    entrancePoolsSelector,
    exitsByIdSelector,
} from '../tracker/Selectors';

const main: RemoteReference = {
    type: 'forkBranch',
    author: 'ssrando',
    repoName: 'ssrando',
    branch: 'main',
};

export function createTestLogic() {
    let store: Store;
    let defaultSet: AllTypedOptions;

    const tester = {
        async beforeAll() {
            store = createStore();

            const loader = async (fileName: string) => {
                if (fileName.includes('presets')) {
                    return '{}';
                }
                return await fs.promises.readFile(
                    `./testData/${fileName}`,
                    'utf-8',
                );
            };

            const [logic, options] = await getAndPatchLogic(loader);
            defaultSet = defaultSettings(options);
            store.dispatch(
                loadLogic({
                    logic,
                    options,
                    presets: {},
                    remote: main,
                    remoteName: 'ssrando/main',
                }),
            );
        },

        beforeEach() {
            store.dispatch(reset({ settings: defaultSet }));
        },

        /**
         * Read the value of a selector. The result is not reactive,
         * so for updated state you must read again after dispatching any actions.
         */
        readSelector<T>(selector: (state: RootState) => T): T {
            return selector(store.getState());
        },

        dispatch(action: AppAction) {
            return store.dispatch(action);
        },

        tryFindCheckId(areaName: string, checkName: string) {
            const area = tester.findArea(areaName);
            return (
                area.checks.list.find((c) => c.includes(checkName)) ??
                area.extraLocations.tr_cube?.list.find((c) => c.includes(checkName)) ??
                area.extraLocations.gossip_stone?.list.find((c) =>
                    c.includes(checkName),
                )
            );
        },

        /**
         * Check that a check of the given name exists in the area, and return its id.
         */
        findCheckId(areaName: string, checkName: string) {
            const check = tester.tryFindCheckId(areaName, checkName);
            expect(check).toBeDefined();
            return check!;
        },

        /**
         * Finds an area by name and asserts that it exists.
         */
        findArea(areaName: string) {
            const area = tester
                .readSelector(areasSelector)
                .find((a) => a.name === areaName)!;
            expect(area).toBeDefined();
            return area;
        },

        /**
         * Asserts that a given exit exists and is randomized.
         */
        findExit(areaName: string, exitName: string) {
            const area = tester.findArea(areaName);
            const exitId = area.extraLocations.exits?.list.find((e) => e.includes(exitName));
            expect(exitId).toBeTruthy();
            const exit = tester
                .readSelector(exitsByIdSelector)[exitId!];
            expect(exit).toBeDefined();
            return exit;
        },

        /**
         * Asserts that a given exit is not randomized and thus
         * doesn't appear in the given area's exits.
         */
        expectExitAbsent(areaName: string, exitName: string) {
            const area = tester.findArea(areaName);
            const exitId = area.extraLocations.exits?.list.find((e) => e.includes(exitName));
            expect(exitId).toBeUndefined();
        },

        /**
         * Asserts that a given exit exists, is randomized, can be assigned,
         * and returns its list of possible entrances.
         */
        getExitPool(areaName: string, exitName: string) {
            const pools = tester.readSelector(entrancePoolsSelector);
            const exit = tester.findExit(areaName, exitName);
            expect(exit.entrance).toBeUndefined();
            expect(exit.canAssign).toBe(true);
            expect(exit.rule.type).toBe('random');
            if (exit.rule.type !== 'random') {
                throw new Error('unreachable');
            }
            return pools[exit.rule.pool];
        },

        expectRandomExitIrrelevant(areaName: string, exitName: string) {
            const exit = tester.findExit(areaName, exitName);
            expect(exit.entrance).toBeUndefined();
            expect(exit.canAssign).toBe(true);
            expect(exit.rule.type).toBe('random');
            if (exit.rule.type !== 'random') {
                throw new Error('unreachable');
            }
            expect(exit.rule.isKnownIrrelevant).toBe(true);
        },

        findEntranceId(areaName: string, entranceName: string) {
            const logic = tester.readSelector(logicSelector);
            const entrance = Object.entries(logic.areaGraph.entrances).find(
                ([id, e]) =>
                    logic.areaGraph.entranceHintRegions[id] === areaName &&
                    e.short_name.includes(entranceName),
            );
            const id = entrance?.[0];
            expect(id).toBeTruthy();
            return id;
        },
    };

    return tester;
}
