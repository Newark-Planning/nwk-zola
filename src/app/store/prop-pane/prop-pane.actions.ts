import { createAction, props } from '@ngrx/store';
import { ArcPropInfo, SearchItem } from '../../shared/models';

export const toggle = createAction(
  '[Prop Pane] Toggle'
);
export const setOpened = createAction(
  '[Prop Pane] SET_OPENED',
  props<{ payload: boolean }>()
);
export const setTitle = createAction(
  '[Prop Pane] Set Title',
  props<{ payload: string }>()
);
export const setSelectedProp = createAction(
  '[Prop Pane] Set Selected Property',
  props<{ payload: SearchItem }>()
);
export const setSelectedGeo = createAction(
  '[Prop Pane] Set Selected Geo Feature',
  props<{ payload: {layer: string; selectedGeo: string; } }>()
);
export const setPropInfo = createAction(
  '[Prop Pane] SET_PROP_INFO',
  props<{ payload: ArcPropInfo }>()
);
