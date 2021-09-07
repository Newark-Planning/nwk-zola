import { MapInfoPaneComponent } from './components/map-info-pane/map-info-pane.component';
import { MapLayerPaneComponent } from './components/map-layer-pane/map-layer-pane.component';
import { MapMeasureComponent } from './components/map-measure.component';
import { MapScaleComponent } from './components/map-scale.component';
import { MapSearchBarComponent } from './components/search.component';
import { MapViewComponent } from './components/map-view/map-view.component';
import { ModalComponent } from './components/modal.component';
import { MapExtentComponent } from './components/map-extent.component';
import { MapBasemapsComponent } from './components/map-basemaps.component';
import { MapZoomComponent } from './components/map-zoom.component';

import { PaneContentPropertyComponent } from './components/map-info-pane/pane-content-property.component';

import { GoogleService } from './services/google.service';
import { JsonDataService } from './services/json-data.service';
import { MapLayerService } from './services/maplayer.service';
import { MapControlsService } from './services/map-controls.service';
import { MapInfoService } from './services/map-info.service';
import { SvgPinComponent } from './components/map-elements/map-pin-svg.component';


export const components = [
  MapViewComponent,
  MapBasemapsComponent,
  MapExtentComponent,
  MapInfoPaneComponent,
  MapLayerPaneComponent,
  MapMeasureComponent,
  MapSearchBarComponent,
  MapScaleComponent,
  MapZoomComponent,
  ModalComponent,
  PaneContentPropertyComponent,
  SvgPinComponent
];

export const services = [
  GoogleService,
  JsonDataService,
  MapInfoService,
  MapLayerService,
  MapControlsService
];

export * from './components/map-info-pane/map-info-pane.component';
export * from './components/map-layer-pane/map-layer-pane.component';
export * from './components/search.component';
export * from './components/map-basemaps.component';
export * from './components/map-extent.component';
export * from './components/map-measure.component';
export * from './components/map-scale.component';
export * from './components/map-view/map-view.component';
export * from './components/map-zoom.component';
export * from './components/modal.component';
export * from './components/map-elements/map-pin-svg.component';

export * from './components/map-info-pane/pane-content-property.component';

export * from './services/google.service';
export * from './services/json-data.service';
export * from './services/map-controls.service';
export * from './services/maplayer.service';
export * from './services/map-info.service';
