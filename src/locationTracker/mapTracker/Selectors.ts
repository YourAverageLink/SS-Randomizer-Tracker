import { createSelector } from '@reduxjs/toolkit';
import { getMapModel } from './MapModel';
import { areaGraphSelector } from '../../logic/selectors';
import { exitsByIdSelector } from '../../tracker/selectors';

export const mapModelSelector = createSelector(
    [areaGraphSelector, exitsByIdSelector],
    getMapModel,
);
