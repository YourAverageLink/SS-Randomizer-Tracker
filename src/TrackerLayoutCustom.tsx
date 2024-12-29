import type React from 'react';
import type {
    InterfaceAction,
    InterfaceState,
} from './tracker/TrackerInterfaceReducer';
import GridTracker from './itemTracker/GridTracker';
import ItemTracker from './itemTracker/ItemTracker';
import { LocationGroupList } from './locationTracker/LocationGroupList';
import WorldMap from './locationTracker/mapTracker/WorldMap';
import { LocationsEntrancesList } from './locationTracker/LocationsEntrancesList';
import DungeonTracker from './itemTracker/DungeonTracker';
import BasicCounters from './BasicCounters';
import { HintsTracker } from './hints/HintsTracker';
import { useSelector } from 'react-redux';
import { customLayoutSelector } from './customization/selectors';
import { useMemo } from 'react';
import { stringifyError } from './utils/Errors';

interface TrackerComponentLayout {
    x: number;
    y: number;
    width: number;
    height?: number;
}

type TrackerComponent = (interaction: {
    interfaceState: InterfaceState;
    interfaceDispatch: React.Dispatch<InterfaceAction>;
}) => React.ReactNode;

type TrackerComponentFactory = (
    layout: TrackerComponentLayout,
    params?: Record<string, string | number | boolean | undefined>,
) => TrackerComponent;

const components: Record<string, TrackerComponentFactory> = {
    gridInventory: (layout, _params) => () => (
        <GridTracker width={layout.width} />
    ),
    ingameInventory: (layout, _params) => () => (
        <ItemTracker width={layout.width} />
    ),
    regionList: () => (interaction) => (
        <div
            style={{ width: '100%', height: '100%', overflow: 'visible auto' }}
        >
            <LocationGroupList
                interfaceDispatch={interaction.interfaceDispatch}
            />
        </div>
    ),
    regionMap: (layout) => (interaction) => (
        <WorldMap
            interfaceDispatch={interaction.interfaceDispatch}
            interfaceState={interaction.interfaceState}
            width={layout.width}
        />
    ),
    locationsEntrances: (_layout, params) => (interaction) => (
        <LocationsEntrancesList
            wide={Boolean(params?.['wide'])}
            includeHeader={Boolean(params?.['includeHeader'])}
            interfaceDispatch={interaction.interfaceDispatch}
            interfaceState={interaction.interfaceState}
        />
    ),
    dungeonTracker: (_layout, params) => (interaction) => (
        <DungeonTracker
            interfaceDispatch={interaction.interfaceDispatch}
            compact={Boolean(params?.['compact'])}
        />
    ),
    counters: () => () => <BasicCounters />,
    hints: () => () => <HintsTracker />,
};

interface TrackerComponentDescription {
    id: string;
    layout: TrackerComponentLayout;
    params: Record<string, string | number | boolean | undefined>;
}

interface CustomLayout {
    components: TrackerComponentDescription[];
}

// Not a component!
function parseLayout(layout: string): TrackerComponent[] {
    const data = JSON.parse(layout) as CustomLayout;
    const ret: TrackerComponent[] = [];
    let key = 0;
    for (const component of data.components) {
        const def = components[component.id];
        if (!def) {
            throw new Error(`Unknown component ${component.id}`);
        }
        const factory = def(component.layout, component.params);
        const myKey = key;
        ret.push((interaction) => {
            return (
                <div
                    key={myKey}
                    style={{
                        position: 'absolute',
                        top: component.layout.y,
                        left: component.layout.x,
                        width: component.layout.width,
                        height: component.layout.height,
                    }}
                >
                    {factory(interaction)}
                </div>
            );
        });
        key++;
    }

    return ret;
}

export function TrackerLayoutCustom({
    interfaceState,
    interfaceDispatch,
}: {
    interfaceState: InterfaceState;
    interfaceDispatch: React.Dispatch<InterfaceAction>;
}) {
    const customLayout = useSelector(customLayoutSelector);
    const parseResult = useMemo(() => {
        try {
            return parseLayout(customLayout);
        } catch (e) {
            return stringifyError(e);
        }
    }, [customLayout]);

    if (typeof parseResult === 'string') {
        return parseResult;
    }

    return (
        <>
            {parseResult.map((component) =>
                component({ interfaceDispatch, interfaceState }),
            )}
        </>
    );
}
