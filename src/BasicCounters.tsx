import { useSelector } from 'react-redux';
import {
    exitsSelector,
    getRequirementLogicalStateSelector,
    totalCountersSelector,
} from './tracker/selectors';
import Tooltip from './additionalComponents/Tooltip';
import { counterBasisSelector } from './customization/selectors';
import { ExitMapping, LogicalState } from './logic/Locations';

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
        <div style={{display: 'flex', flexFlow: 'column nowrap', gap: '16px'}}>
            <span>{`Locations Checked: ${state.numChecked}`}</span>
            <span>{`Locations Accessible: ${state.numAccessible}`}</span>
            <span>{`Locations Remaining: ${state.numRemaining}`}</span>
            <Tooltip
                disabled={!relevantExits.length}
                content={<EntrancesTooltip exits={relevantExits} />}
            >
                <span>{`Entrances Accessible: ${state.numExitsAccessible}`}</span>
            </Tooltip>
        </div>
    );
}

function EntrancesTooltip({ exits }: { exits: ExitMapping[] }) {
    return (
        <ul>
            {exits.map((e) => (
                <li key={e.exit.id}>
                    <span style={{ color: '#00AFFF' }}>{e.exit.name}</span>
                </li>
            ))}
        </ul>
    );
}
