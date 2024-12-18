import { createSelector } from '@reduxjs/toolkit';
import { getMapModel } from './MapModel';
import { areaGraphSelector } from '../../logic/selectors';
import { exitsSelector } from '../../tracker/selectors';

export const mapModelSelector = createSelector(
    [areaGraphSelector, exitsSelector],
    getMapModel,
);
