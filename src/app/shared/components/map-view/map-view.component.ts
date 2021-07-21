import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { Overlay } from 'ol';
import VectorLayer from 'ol/layer/Vector';
import Map from 'ol/Map';
import OverlayPositioning from 'ol/OverlayPositioning';
import { StoreService } from '../../../store/store.service';
import { GoogleService } from '../../services/google.service';
import { MapLayerService } from '../../services/maplayer.service';
import VectorSource from 'ol/source/Vector';
import Feature, { FeatureLike } from 'ol/Feature';
import { Fill, Stroke, Style, Text } from 'ol/style';
import { getCenter } from 'ol/extent';
import { MapControlsService } from '../../services/map-controls.service';
import { MapService } from '../../services/map.service';
import LayerGroup from 'ol/layer/Group';
import { Draw } from 'ol/interaction';
import { MapInfoService } from '../../services/map-info.service';

@Component({
  selector: 'app-map-view',
  styleUrls: ['./map-view.component.scss'],
  templateUrl: './map-view.component.html'
})
// tslint:disable: no-non-null-assertion
export class MapViewComponent implements OnInit, AfterViewInit, OnDestroy {
  instance: Map = new Map({});
  infoPaneActive = true;
  basemapGroup: LayerGroup = new LayerGroup;
  transitGroup: LayerGroup = new LayerGroup;
  parcelsZoningGroup: LayerGroup = new LayerGroup;
  boundariesGroup: LayerGroup = new LayerGroup;
  economicDevelopmentGroup: LayerGroup = new LayerGroup;
  otherLayersGroup: LayerGroup = new LayerGroup;
  hiddenLayersGroup: LayerGroup = new LayerGroup;
  pointerPopup: Overlay = new Overlay({});
  loadingIndicator = false;
  layersPaneActive = true;
  hoverSelectionLayer = new VectorLayer({
    className: 'selection-hover',
    zIndex: 5,
    style: new Style({stroke: new Stroke({color: 'rgba(0, 0, 0, 0.5)', width: 1.5, lineDash: [4, 4]})}),
    source: new VectorSource({wrapX: false})
  });
  clickSelectionLayer = new VectorLayer({
    className: 'selection-click',
    zIndex: 4,
    style: new Style({stroke: new Stroke({color: 'rgba(0, 0, 0, 0.5)', width: 1.5})}),
    source: new VectorSource({wrapX: false})
  });
  drawInteraction: Draw | undefined;
  mouseTooltip = {layer: 'Zoning District', value: ''};
  @Output() readonly selection: EventEmitter<{layer: string; value: string;}> = new EventEmitter();
  constructor(
    private readonly host: ElementRef,
    readonly storeService: StoreService,
    readonly mapService: MapService,
    readonly mapInfoService: MapInfoService,
    readonly layerService: MapLayerService,
    readonly controls: MapControlsService,
    readonly google: GoogleService) {}
  ngOnInit(): void {
    this.instance = this.mapService.initMap(this.host.nativeElement.firstElementChild);
    this.pointerPopup = new Overlay({
      className: 'ol-overlay-container ol-unselectable ol-pointer-tooltip',
      positioning: 'top-left' as OverlayPositioning,
      offset: [18,18],
      element: document.getElementById('pointer-popup')!
    });
    this.mapInfoService.getInitLayerData()
      .subscribe(r => {this.layerService.initialLayerData = r;})
      .add(() => this.initLayers())
    this.instance.on('pointermove', (e) => {
      if (e.dragging || (this.drawInteraction && this.drawInteraction.getActive())) {
        this.hoverSelectionLayer.getSource().clear();
        this.mouseTooltip = {layer: '', value: ''};
        return;
      };
      this.pointerPopup.setPosition(e.coordinate);
      const features: Array<{layer: string; feat: FeatureLike}> = [];
      this.instance.forEachFeatureAtPixel(e.pixel,(f,l) => {
        features.push({layer: l.getClassName(), feat: f});
      }, {layerFilter: (l) => !['selection-hover','selection-click','DrawLayer'].includes(l.getClassName())});
      if (features.length > 0) {
        this.hoverSelectionLayer.getSource().clear();
        const styleData = this.layerService.initialLayerData.filter(il => il.className === features[0].layer);
        const keyField = styleData.length > 0 ? styleData[0].styles[0].keyField : '';
        ['Commuter_Rail','Light_Rail','High_Frequency_Bus','Standard_Bus'].includes(features[0].layer)
        ? console.info('No Hover Feature Added to Selected Layer')
        : this.hoverSelectionLayer.getSource().addFeature(new Feature(features[0].feat.getGeometry()));
        this.mouseTooltip = {layer: features[0].layer.replace(/_/gi," "), value: features[0].feat.get(keyField)};
      } else {
        this.mouseTooltip = {layer: '', value: ''};
      }
    });
    this.instance.on('singleclick', (e) => {
      if (!this.infoPaneActive || (this.drawInteraction && this.drawInteraction.getActive())) {
        return;
      };
      const features: Array<{layer: string; feat: FeatureLike}> = [];
      this.instance.forEachFeatureAtPixel(e.pixel,(f,l,g) => {
        features.push({layer: l.getClassName(), feat: f});
      }, {layerFilter: (l) => !['Census_Tracts','Zipcodes','Neighborhoods','Wards','selection-hover','selection-click'].includes(l.getClassName())});
      this.clickSelectionLayer.getSource().clear();
      if (features.length > 0) {
        const keyField = this.layerService.initialLayerData.filter(il => il.className === features[0].layer)[0].styles[0].keyField;
        let clickSelectionValue: string;
        if (features[0].layer === 'Zoning_Districts') {
          this.clickSelectionLayer.getSource().addFeature(new Feature(features[0].feat.getGeometry()));
          clickSelectionValue = features[0].feat.get('ZONING') === 'RDV' ? `${features[0].feat.get('ZONING')} - ${features[0].feat.get('RDV_PLAN')}` : features[0].feat.get('ZONING');
        } else {
          clickSelectionValue = features[0].feat.get(keyField) ? features[0].feat.get(keyField) : '';
        }
        this.selection.emit({layer: features[0].layer, value: clickSelectionValue});
        this.instance.getView().animate({
          center: e.coordinate,
          zoom: 5,
          duration: 150
        })
      } else {
        this.selection.emit({layer: '', value: ''})
      }
      setTimeout(() => {
        this.instance.updateSize();
      },600);
    });
    this.instance.getInteractions().on(['add','remove'], (e) => {
      if (e.element instanceof Draw) {
        this.drawInteraction = e.type === 'add' ?  e.element : undefined;
      }
    });
    this.instance.updateSize();
  }
  initLayers(): void {
    const lgname = ['Basemap', 'Parcels & Zoning', 'Transit', 'Boundaries','Economic Development', 'Other Layers', 'Hidden'];
    this.basemapGroup = this.layerService.makeLayerGroup('Basemap');
    this.parcelsZoningGroup = this.layerService.makeLayerGroup('Parcels & Zoning', ['Zoning_Districts']);
    this.transitGroup = this.layerService.makeLayerGroup('Transit', ['Commuter_Rail','Light_Rail']);
    this.boundariesGroup = this.layerService.makeLayerGroup('Boundaries');
    this.economicDevelopmentGroup = this.layerService.makeLayerGroup('Economic Development');
    this.otherLayersGroup = this.layerService.makeLayerGroup('Other Layers');
    this.hiddenLayersGroup.getLayers().extend([this.hoverSelectionLayer,this.clickSelectionLayer]);
    [ this.basemapGroup, this.parcelsZoningGroup, this.transitGroup, this.boundariesGroup, this.economicDevelopmentGroup, this.otherLayersGroup, this.hiddenLayersGroup ].forEach(
      (grp: LayerGroup, i: number) => {
        grp.set('className', lgname[i]);
        this.instance.addLayer(grp);
      }
    );
    this.instance.getLayers().changed();
    this.controls.setBasemapLayer('base', this.basemapGroup);
    this.instance.addOverlay(this.pointerPopup);
    this.instance.on('precompose', () => { this.loadingIndicator = true; });
    this.instance.on('rendercomplete', () => { this.loadingIndicator = false; });
  }
  toggleLayersPane(): void {
    this.layersPaneActive = !this.layersPaneActive;
    setTimeout(() => {
      this.instance.updateSize();
      console.info(`Layers Pane ${this.layersPaneActive ? 'Opened' : 'Closed'}, Map Redrawn!`);
    },500);
  }
  checkRDV(zone: string): string {
    return zone.startsWith('RDV') ? 'RDV' : zone;
  }
  ngAfterViewInit(): void { setTimeout(() => { this.instance.updateSize(); }, 500); }
  ngOnDestroy(): void { this.instance.dispose(); }
}
