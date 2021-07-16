import { createReducer, on } from '@ngrx/store';
import * as MapPaneActions from './map-pane.actions';

export interface State {
  opened: boolean;
  title: string;
  selectedModule: number;
}

const initialState: State = {
  opened: false,
  title: '',
  selectedModule: 0
};

export const mapPaneReducer = createReducer(
  initialState,
  on(MapPaneActions.toggle, state => ({...state, opened: !state.opened})),
  on(MapPaneActions.setOpened, (state, action) => ({ ...state, opened: action.payload })),
  on(MapPaneActions.setTitle, (state, action) => ({ ...state, title: action.payload })),
  on(MapPaneActions.setSelectedModule, (state, action) => ({ ...state, selectedModule: action.payload }))
);
