import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { ArcFeature, SearchItem } from '../shared/models';
import * as fromStore from '../store/store.reducers';
import * as MapPaneActions from './map-pane/map-pane.actions';
import * as fromMapPane from './map-pane/map-pane.reducers';
import * as PropPaneActions from './prop-pane/prop-pane.actions';
import * as fromPropPane from './prop-pane/prop-pane.reducers';
@Injectable({
    providedIn: 'root'
})
export class StoreService {
    mapPaneState$: Observable<fromMapPane.State>;
    propPaneState$: Observable<fromPropPane.State>;

    constructor(private readonly store: Store<fromStore.StoreState>) {
        this.mapPaneState$ = this.store.select(state => state.mapPane);
        this.propPaneState$ = this.store.select(state => state.propPane);
    }
    /**
     * Resets the Store State
     */
    resetStoreState(): void {
        this.store.dispatch(fromStore.clearStateAction());
    }
    /*
    * Map Pane state functions
    */
    toggleMapPane(): void {
        this.store.dispatch(MapPaneActions.toggle());
    }
    setMapPaneOpened(opened: boolean): void {
        this.store.dispatch(MapPaneActions.setOpened({payload: opened}));
    }
    setMapPaneTitle(title: string): void {
        this.store.dispatch(MapPaneActions.setTitle({payload: title}));
    }
    setMapPaneSelectedModule(selectedModule: number): void {
        this.store.dispatch(MapPaneActions.setSelectedModule({ payload: selectedModule }));
    }
    /*
    * Prop Pane state functions
    */
    togglePropPane(): void {
        this.store.dispatch(PropPaneActions.toggle());
    }
    setPropPaneOpened(opened: boolean): void {
        this.store.dispatch(PropPaneActions.setOpened({ payload: opened }));
    }
    setPropPaneTitle(title: string): void {
        this.store.dispatch(PropPaneActions.setTitle({ payload: title}));
    }
    setPropPaneSelectedProp(selectedProp: SearchItem): void {
        this.store.dispatch(PropPaneActions.setSelectedProp({ payload: selectedProp}));
    }
    setPropPaneSelectedGeo(layer: string, selectedGeo: any): void {
        this.store.dispatch(PropPaneActions.setSelectedGeo({ payload: {layer, selectedGeo}}));
    }
    setPropPanePropInfo(propInfo: ArcFeature['attributes']): void {
        this.store.dispatch(PropPaneActions.setPropInfo({ payload: propInfo}));
    }
}
