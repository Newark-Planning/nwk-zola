import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Map } from 'ol';
import { MapViewComponent } from '../shared';
import { togglePanel } from '../shared/utils/animations';

@Component({
  animations: [togglePanel],
  selector: 'app-main-view',
  template: `
  <map-layer-pane [@togglePanel]="map1.layersPaneActive ? 'shown' : 'hidden'" [paneopen]="layersPaneActive" [map]="mapInstance">
    <map-search-bar header [map]="mapInstance"></map-search-bar>
  </map-layer-pane>
  <app-map-view #map1 (selection)="selection = $event"></app-map-view>
  <map-info-pane *ngIf="map1.infoPaneActive" [map]="mapInstance" [selection]="selection" (paneClose)="closeInfoPane()"></map-info-pane>
  `,
  styles: [
    ':host { height: 100%; width: 100%;display: flex;}'
  ]
})
export class MainViewComponent implements AfterViewInit {
  mapInstance: Map = new Map({});
  selection: { layer: string; value: string; } = { layer: '', value: '' };
  infoPaneActive = true;
  layersPaneActive = true;
  @ViewChild('map1') mapView: MapViewComponent | undefined;
  constructor() {
  }
  ngAfterViewInit(): void {
    this.mapInstance = this.mapView!.instance;
  }
  closeInfoPane(): void {
    this.mapView!.infoPaneActive = false;
    console.info('Info Pane Closed, Selection Reset!');
  }
  toggleLayersPane(): void {
    this.layersPaneActive = !this.layersPaneActive;
    setTimeout(() => {
      this.mapInstance.updateSize();
      console.info(`Layers Pane ${this.layersPaneActive ? 'Opened' : 'Closed'}, Map Redrawn!`);
    },500);
  }
}
