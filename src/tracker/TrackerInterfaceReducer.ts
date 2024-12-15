import { useSelector } from 'react-redux';
import { areaGraphSelector } from '../logic/selectors';
import { exitsSelector } from '../tracker/selectors';
import { AreaGraph, Logic } from '../logic/Logic';
import { ExitMapping } from '../logic/Locations';
import { useReducer } from 'react';
import { startingEntrancePool } from '../logic/Entrances';
import {
    getOwningProvince,
    MapModel,
} from '../locationTracker/mapTracker/MapModel';
import { mapModelSelector } from '../locationTracker/mapTracker/Selectors';

export type InterfaceState =
    | {
          /**
           * The tracker is prompting the user to pick the entrance corresponding to
           * a given exit.
           */
          type: 'choosingEntrance';
          mapView: string | undefined;
          exitId: string;
          previousHintRegion: string | undefined;
      }
    | {
          /**
           * The normal tracker view, possibly presenting the user with a list of checks.
           */
          type: 'viewingChecks';
          hintRegion: string | undefined;
          mapView: string | undefined;
      };

type InterfaceStateInternal =
    | InterfaceState
    | {
          /**
           * The tracker is in its initial state. If starting entrance is randomized,
           * this will resolve to picking the starting entrance, otherwise it will
           * resolve to the starting region.
           */
          type: 'initial';
      };

export type InterfaceAction =
    | {
          /** Clicking on Faron, Eldin, Lanayru, or Skyloft */
          type: 'selectMapView';
          province: string;
      }
    | {
          /** Selecting a particular hint region */
          type: 'selectHintRegion';
          hintRegion: string;
      }
    | {
          /** Back to Sky */
          type: 'leaveMapView';
      }
    | {
          /** Choose an entrance */
          type: 'chooseEntrance';
          exitId: string;
      }
    | {
          /** Selected an entrance, or canceled the dialog */
          type: 'cancelChooseEntrance';
          selectedEntrance: string | undefined;
      };

function getHintRegionForEntrance(
    entranceId: string,
    areaGraph: Logic['areaGraph'],
): string {
    return areaGraph.entranceHintRegions[entranceId];
}

function getInitialState(exits: ExitMapping[]): InterfaceState {
    const startingExit = exits.find(
        (e) => e.canAssign && e.rule.pool === startingEntrancePool,
    );

    if (startingExit) {
        return {
            type: 'choosingEntrance',
            mapView: undefined,
            exitId: startingExit.exit.id,
            previousHintRegion: undefined,
        };
    }
    return {
        type: 'viewingChecks',
        mapView: undefined,
        hintRegion: undefined,
    };
}

function interfaceReducer(
    mapModel: MapModel,
    areaGraph: AreaGraph,
    exits: ExitMapping[],
) {
    return (
        state_: InterfaceStateInternal,
        action: InterfaceAction,
    ): InterfaceStateInternal => {
        // Make sure initial state is resolved
        const state =
            state_.type === 'initial' ? getInitialState(exits) : state_;
        switch (action.type) {
            case 'selectMapView': {
                if (state.type === 'choosingEntrance') {
                    return {
                        ...state,
                        mapView: action.province,
                    };
                }
                return {
                    type: 'viewingChecks',
                    mapView: action.province,
                    hintRegion:
                        state.type === 'viewingChecks'
                            ? state.hintRegion
                            : undefined,
                };
            }

            case 'selectHintRegion':
                return {
                    type: 'viewingChecks',
                    mapView: getOwningProvince(mapModel, action.hintRegion),
                    hintRegion: action.hintRegion,
                };
            case 'leaveMapView':
                return {
                    type: 'viewingChecks',
                    mapView: undefined,
                    hintRegion:
                        state.type === 'viewingChecks'
                            ? state.hintRegion
                            : undefined,
                };
            case 'chooseEntrance':
                return {
                    type: 'choosingEntrance',
                    exitId: action.exitId,
                    mapView: state.mapView,
                    previousHintRegion:
                        state.type === 'viewingChecks'
                            ? state.hintRegion
                            : undefined,
                };
            case 'cancelChooseEntrance': {
                const hintRegion = action.selectedEntrance
                    ? getHintRegionForEntrance(
                          action.selectedEntrance,
                          areaGraph,
                      )
                    : state.type === 'choosingEntrance'
                      ? state.previousHintRegion
                      : undefined;
                return {
                    type: 'viewingChecks',
                    hintRegion,
                    mapView: hintRegion
                        ? getOwningProvince(mapModel, hintRegion)
                        : undefined,
                };
            }
        }
    };
}

const initialMapState: InterfaceStateInternal = {
    type: 'initial',
};

export function useTrackerInterfaceReducer(): [
    InterfaceState,
    React.Dispatch<InterfaceAction>,
] {
    const mapModel = useSelector(mapModelSelector);
    const areaGraph = useSelector(areaGraphSelector);
    const exits = useSelector(exitsSelector);
    const [internalTrackerState, dispatch] = useReducer(
        interfaceReducer(mapModel, areaGraph, exits),
        undefined,
        () => initialMapState,
    );

    if (internalTrackerState.type === 'initial') {
        // Resolve initial state
        return [getInitialState(exits), dispatch];
    }

    return [internalTrackerState, dispatch];
}
