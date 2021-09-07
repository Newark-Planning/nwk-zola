import { createReducer, on } from '@ngrx/store';
import { ArcPropInfo, SearchItem } from '../../shared/models';
import * as PropPaneActions from './prop-pane.actions';

export interface State {
  opened: boolean;
  title: string;
  selectedProp: SearchItem;
  selectedGeo: { layer: string; selectedGeo: string; };
  propInfo: ArcPropInfo;
}

const initialState: State = {
  opened: false,
  title: '',
  selectedProp: {
     BLOCK_LOT: '',
     STREET_ADD: '',
     geometry: [ 0, 0 ]
  },
  propInfo: {
    PROPLOC: '',
    LOT_BLOCK_LOT: ''
  },
  selectedGeo: {layer: '', selectedGeo: ''}
};

export const propPaneReducer = createReducer(
  initialState,
    on(PropPaneActions.toggle, state => ({ ...state, opened: !state.opened })),
    on(PropPaneActions.setOpened, (state, action) => ({ ...state, opened: action.payload })),
    on(PropPaneActions.setTitle, (state, action) => ({ ...state, title: action.payload })),
    on(PropPaneActions.setSelectedProp, (state, action) => ({ ...state, selectedProp: action.payload })),
    on(PropPaneActions.setSelectedGeo, (state, action) => ({ ...state, selectedGeo: action.payload })),
    on(PropPaneActions.setPropInfo, (state, action) => ({ ...state, propInfo: action.payload }))
);
