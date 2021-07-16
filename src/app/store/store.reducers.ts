import { ActionReducerMap, createAction, createReducer, on } from '@ngrx/store';

import * as fromMapPane from './map-pane/map-pane.reducers';
import * as fromPropPane from './prop-pane/prop-pane.reducers';

export const clearStateAction = createAction(
  '[Store] Clear State'
);

export interface StoreState {
  mapPane: fromMapPane.State;
  propPane: fromPropPane.State;
}

export const storeReducers: ActionReducerMap<StoreState> = {
  mapPane: fromMapPane.mapPaneReducer,
  propPane: fromPropPane.propPaneReducer
};

export const clearStateReducer = createReducer(
  storeReducers,
  on(clearStateAction, state => ({ ...state, state: undefined }))
);
