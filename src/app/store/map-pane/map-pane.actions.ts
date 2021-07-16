import { createAction, props } from '@ngrx/store';

export const toggle = createAction(
  '[Map Pane] Toggle'
);
export const setOpened = createAction(
  '[Map Pane] Set Opened',
  props<{payload: boolean}>()
);
export const setTitle = createAction(
  '[Map Pane] Set Title',
  props<{payload: string}>()
);
export const setSelectedModule = createAction(
  '[Map Pane] Set Selected Module',
  props<{payload: number}>()
);
