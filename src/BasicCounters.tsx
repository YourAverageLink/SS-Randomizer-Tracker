import { useSelector } from 'react-redux';
import {
    exitsSelector,
    getRequirementLogicalStateSelector,
    totalCountersSelector,
} from './tracker/selectors';
import Tooltip from './additionalComponents/Tooltip';
import { counterBasisSelector } from './customization/selectors';
import type { ExitMapping, LogicalState } from './logic/Locations';
import styles from './BasicCounters.module.css';

export default function BasicCounters() {
    const state = useSelector(totalCountersSelector);

    const exits = useSelector(exitsSelector);
    const getLogicalState = useSelector(getRequirementLogicalStateSelector);
    const counterBasis = useSelector(counterBasisSelector);
    const shouldCount = (state: LogicalState) =>
        counterBasis === 'logic' ? state === 'inLogic' : state !== 'outLogic';

    const relevantExits = exits.filter(
        (e) =>
            e.canAssign &&
            !e.rule.isKnownIrrelevant &&
            !e.entrance &&
            shouldCount(getLogicalState(e.exit.id)),
    );

    return (
        <div className={styles.counters}>
            <div className={styles.counter}>{state.numChecked}</div>
            <div>Locations Checked</div>
            <div className={styles.counter}>{state.numAccessible}</div>
            <div>Locations Accessible</div>
            <div className={styles.counter}>{state.numRemaining}</div>
            <div>Locations Remaining</div>

            <div className={styles.counter}>{state.numExitsAccessible}</div>
            <Tooltip
                disabled={!relevantExits.length}
                content={<EntrancesTooltip exits={relevantExits} />}
            >
                <div>Entrances Accessible</div>
            </Tooltip>
        </div>
    );
}

function EntrancesTooltip({ exits }: { exits: ExitMapping[] }) {
    return (
        <ul>
            {exits.map((e) => (
                <li key={e.exit.id}>
                    <span className={styles.accessibleEntrance}>
                        {e.exit.name}
                    </span>
                </li>
            ))}
        </ul>
    );
}
