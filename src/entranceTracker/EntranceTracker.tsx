import { useMemo, useState } from 'react';
import { FixedSizeList as List, type ListChildComponentProps } from 'react-window';
import Select, { type ActionMeta, type SingleValue } from 'react-select';
import { useDispatch, useSelector } from 'react-redux';
import { entrancePoolsSelector, exitsSelector, usedEntrancesSelector } from '../tracker/Selectors';
import { mapEntrance } from '../tracker/Slice';
import { selectStyles } from '../customization/ComponentStyles';
import { mapValues } from '../utils/Collections';
import { Dialog } from '../additionalComponents/Dialog';
// import EntranceGraph from './EntranceGraph';

type Entrance = {
    value: string;
    label: string;
};

const RESET_OPTION = 'RESET';

function EntranceTracker({ open, onOpenChange }: {open: boolean;
    onOpenChange: (open: boolean) => void;}) {
    const dispatch = useDispatch();
    const exits = useSelector(exitsSelector);
    const usedEntrances = useSelector(usedEntrancesSelector);
    const entrancePools = useSelector(entrancePoolsSelector);

    const [exitSearch, setExitSearch] = useState('');
    const [entranceSearch, setEntranceSearch] = useState('');
    const [clickthrough, setClickthrough] = useState(true);

    const clearFilters = () => {
        setExitSearch('');
        setEntranceSearch('');
    };

    const entranceOptions: Record<string, Entrance[]> = useMemo(
        () =>
            mapValues(entrancePools, (poolValue, pool) => {
                const entrances = poolValue.entrances
                    .filter(
                        (entrance) =>
                            !poolValue.usedEntrancesExcluded ||
                            !usedEntrances[pool].includes(entrance.id),
                    )
                    .map(({ id, name }) => ({
                        value: id,
                        label: name,
                    }));

                entrances.unshift({ value: RESET_OPTION, label: 'Reset' });

                return entrances;
            }),
        [entrancePools, usedEntrances],
    );

    const onEntranceChange = 
        (
            from: string,
            selectedOption: SingleValue<Entrance>,
            meta: ActionMeta<Entrance>,
        ) => {
            if (meta.action === 'select-option') {
                if (!selectedOption || selectedOption.value === RESET_OPTION) {
                    dispatch(mapEntrance({ from, to: undefined }))
                } else {
                    dispatch(mapEntrance({ from, to: selectedOption.value }))
                }
            }
        };

    const entranceLower = entranceSearch.toLowerCase();
    const exitLower = exitSearch.toLowerCase();

    const matches = (name: string, searchString: string) => {
        if (!searchString) {
            return true;
        }
        const fragments = searchString.split(' ');
        return fragments.every((fragment) => name.includes(fragment.trim()));
    }

    const filteredRows = exits.filter((e) => {
        return (
            matches(e.exit.name.toLowerCase(), exitLower) &&
            (!entranceSearch ||
                (e.entrance &&
                    matches(e.entrance.name.toLowerCase(), entranceLower)))
        );
    });

    const row = ({ index, style }: ListChildComponentProps) => {
        const exit = filteredRows[index];
        return (
            <div
                key={exit.exit.id}
                style={{
                    ...style,
                    display: 'flex',
                    gap: 4,
                    borderBottom: '1px solid black',
                    alignItems: 'center',
                    padding: '0.5%',
                    filter: !exit.canAssign ? 'opacity(0.5)' : undefined,
                }}
            >
                <div style={{ flex: '1', display: 'flex', alignItems: 'center' }}><span>{exit.exit.name}</span></div>
                <div style={{ flex: '1', minWidth: 0 }}>
                    <Select
                        styles={selectStyles<false, Entrance>()}
                        value={exit.entrance && { label: exit.entrance.name, value: exit.entrance.id }}
                        onChange={(...args) => onEntranceChange(exit.exit.id, ...args)}
                        options={exit.canAssign ? entranceOptions[exit.rule.pool] : undefined}
                        name={exit.entrance?.name}
                        isDisabled={!exit.canAssign}
                        filterOption={(option, search) => matches(option.data.label.toLowerCase(), search.toLowerCase())}
                    />
                </div>
                <div>
                    <button type="button" className="tracker-button"
                        disabled={!exit.entrance}
                        onClick={() =>
                            setExitSearch(
                                exit.entrance?.name.split('-')[0].trim() ?? '',
                            )
                        }
                    >
                        Go to
                    </button>
                </div>
            </div>
        );
    };
    return (
        <Dialog open={open} onOpenChange={onOpenChange} title="Entrances" wide>
            <div style={{ display: 'flex', gap: 4 }}>
                <input
                    className="tracker-input"
                    style={{ flex: '1' }}
                    type="search"
                    placeholder="Search exits"
                    onChange={(e) => setExitSearch(e.target.value)}
                    value={exitSearch}
                />
                <input
                    className="tracker-input"
                    style={{ flex: '1' }}
                    type="search"
                    placeholder="Search entrances"
                    onChange={(e) => setEntranceSearch(e.target.value)}
                    value={entranceSearch}
                />
                <div>
                    <button
                        type="button"
                        className="tracker-button"
                        onClick={clearFilters}
                    >
                        Clear Filters
                    </button>
                </div>
            </div>
            <div>
                <label htmlFor="clickthrough" style={{ paddingRight: 8 }}>
                    Clickthrough
                </label>
                <input
                    type="checkbox"
                    id="clickthrough"
                    checked={clickthrough}
                    onChange={() => setClickthrough(!clickthrough)}
                />
            </div>
            <List
                itemCount={filteredRows.length}
                height={600}
                width=""
                itemSize={60}
            >
                {row}
            </List>
        </Dialog>
        // <EntranceGraph />
    );
}

export default EntranceTracker;
