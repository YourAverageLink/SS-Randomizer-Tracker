import { createSelector } from '@reduxjs/toolkit';
import { getMapModel } from './MapModel';
import { areaGraphSelector } from '../../logic/Selectors';
import { exitsByIdSelector } from '../../tracker/Selectors';

export const mapModelSelector = createSelector(
    [areaGraphSelector, exitsByIdSelector],
    getMapModel,
);
