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
import { Coordinate } from 'ol/coordinate';
import Point from 'ol/geom/Point';
import Polygon from 'ol/geom/Polygon';
import MultiPolygon from 'ol/geom/MultiPolygon';
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
import { Draw, Select } from 'ol/interaction';
import { MapInfoService } from '../../services/map-info.service';

@Component({
  selector: 'app-map-view',
  styleUrls: ['./map-view.component.scss'],
  templateUrl: './map-view.component.html'
})
// tslint:disable: no-non-null-assertion
export class MapViewComponent implements OnInit, AfterViewInit, OnDestroy {
  instance: Map = new Map({});
  infoPaneActive = false;
  basemapGroup: LayerGroup = new LayerGroup;
  transitGroup: LayerGroup = new LayerGroup;
  parcelsZoningGroup: LayerGroup = new LayerGroup;
  boundariesGroup: LayerGroup = new LayerGroup;
  economicDevelopmentGroup: LayerGroup = new LayerGroup;
  otherLayersGroup: LayerGroup = new LayerGroup;
  pointerPopup: Overlay = new Overlay({});
  loadingIndicator = false;
  layersPaneActive = true;
  zoneSelection: FeatureLike | undefined;
  highlightStyle = (strokeColor = 'rgba(254, 241, 96, 0.85)') => new Style({zIndex:4, stroke: new Stroke({color: strokeColor, width: 3, lineDash: [3,1]})});
  zoneClickSelector = new Select();
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
  // parcelsLayer = new MapboxVector({
  //     maxResolution: 1,
  //     declutter: true,
  //     styleUrl: 'mapbox://styles/nterwin714/ckpwqn5ho4tbu17njefoah795',
  //     accessToken: 'pk.eyJ1IjoibnRlcndpbjcxNCIsImEiOiJjajhvOG9tMmIwMGwyMzJta2tobHNzdnp5In0.ARLvEr-BhYrmAQkpMSZ-QQ',
  //     layers: ['choropleth-fill']
  // });
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
      if (e.dragging) {
        this.hoverSelectionLayer.getSource().clear();
        return;
      };
      this.pointerPopup.setPosition(e.coordinate);
      const features: Array<{layer: string; feat: FeatureLike}> = [];
      this.instance.forEachFeatureAtPixel(e.pixel,(f,l,g) => {
        features.push({layer: l.getClassName(), feat: f});
      }, {layerFilter: (l) => !['basemap','basemap-labels','selection-hover','selection-click'].includes(l.getClassName())});
      if (features.length > 0) {
        this.hoverSelectionLayer.getSource().clear();
        const styleData = this.layerService.initialLayerData.filter(il => il.className === features[0].layer);
        const keyField = styleData.length > 0 ? styleData[0].styles[0].keyField : '';
        !['Commuter_Rail','Light_Rail'].includes(features[0].layer)
        ? this.hoverSelectionLayer.getSource().addFeature(new Feature(features[0].feat.getGeometry()))
        : console.info('No Hover Feature Added to Selected Layer');
        this.mouseTooltip = {layer: features[0].layer.replace(/_/gi," "), value: features[0].feat.get(keyField)};
      } else {
        this.mouseTooltip = {layer: '', value: ''};
      }
    });
    this.instance.on('singleclick', (e) => {
      const features: Array<{layer: string; feat: FeatureLike}> = [];
      this.instance.forEachFeatureAtPixel(e.pixel,(f,l,g) => {
        features.push({layer: l.getClassName(), feat: f});
      }, {layerFilter: (l) => !['basemap','basemap-labels','Census_Tracts','Zipcodes','Neighborhoods','Wards','selection-hover','selection-click'].includes(l.getClassName())});
      this.clickSelectionLayer.getSource().clear();
      this.infoPaneActive = features.length > 0;
      console.info(features);
      if (this.infoPaneActive) {
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
      }
      setTimeout(() => {
        this.instance.updateSize();
      },600);
    });
    this.instance.getInteractions().on('add', (e) => {
      console.log(e.element instanceof Draw)
    });
    this.instance.updateSize();
  }
  initLayers(): void {
    const lgname = ['Basemap', 'Parcels & Zoning', 'Transit', 'Boundaries','Economic Development', 'Other Layers'];
    this.basemapGroup = this.layerService.makeLayerGroup('Basemap');
    this.parcelsZoningGroup = this.layerService.makeLayerGroup('Parcels & Zoning', ['Zoning_Districts']);
    this.transitGroup = this.layerService.makeLayerGroup('Transit', ['Commuter_Rail','Light_Rail']);
    this.boundariesGroup = this.layerService.makeLayerGroup('Boundaries');
    this.economicDevelopmentGroup = this.layerService.makeLayerGroup('Economic Development');
    this.otherLayersGroup = this.layerService.makeLayerGroup('Other Layers');
    [ this.basemapGroup, this.parcelsZoningGroup, this.transitGroup, this.boundariesGroup, this.economicDevelopmentGroup, this.otherLayersGroup ].forEach(
      (grp: LayerGroup, i: number) => {
        grp.set('className', lgname[i]);
        this.instance.addLayer(grp);
      }
    );
    this.instance.getLayers().changed();
    this.controls.setBasemapLayer('base', this.basemapGroup);
    this.instance.addOverlay(this.pointerPopup);
    this.instance.addLayer(this.hoverSelectionLayer);
    this.instance.addLayer(this.clickSelectionLayer);
    // this.instance.addLayer(this.parcelsLayer);
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
  makeZoningStyle(feat: FeatureLike, resolution: number, type: 'base' | 'click' = 'base'): [Style, Style] {
    const zoneColor = `${this.layerService.zones[feat.get('ZONING') === undefined ? 'N/A' : this.checkRDV(feat.get('ZONING'))][1]}`;
    const typeObj = {
      base: {strokeWidth: 0.2, strokeColor: 'rgb(150,150,150)', fillOpacity: '66', fontSize: '14px', fontColor: 'grey', fontStrokeColor: 'white', fontStrokeWidth: 4 },
      click: {strokeWidth: 1.5, strokeColor: 'rgb(50,50,50)', fillOpacity: '1A', fontSize: '16px', fontColor: 'white', fontStrokeColor: 'black', fontStrokeWidth: 6}
    }
    const polyStyle = new Style({
      zIndex: 3,
      stroke: new Stroke({width: typeObj[type].strokeWidth, color: typeObj[type].strokeColor}),
      fill: new Fill({color: `${zoneColor}${typeObj[type].fillOpacity}`})
    });
    const zone = feat.get('ZONING') === 'RDV' ? `${feat.get('ZONING')} - ${feat.get('RDV_PLAN')}` : feat.get('ZONING')
    const textStyle = new Style({
      zIndex: 6,
      text: resolution < 3 && (feat.getGeometry() as MultiPolygon).getArea() > 500 ? new Text({
        overflow: true,
        font: `bold ${typeObj[type].fontSize} SegoeUI,arial,sans-serif`,
        text: zone,
        fill: new Fill({color: typeObj[type].fontColor}),
        stroke: new Stroke({ color: typeObj[type].fontStrokeColor, width: typeObj[type].fontStrokeWidth })
      }) : undefined,
      geometry: (feat: FeatureLike) => {
        let retPoint: Coordinate;
        let finalGeom: Polygon | Point | undefined;
        const size = this.instance.getSize()!;
        const extent = this.instance.getView().calculateExtent([size[0],size[1]]);
        if (feat.getGeometry()?.getType() === 'MultiPolygon') {
          const interiorPoints = (feat.getGeometry() as MultiPolygon).getInteriorPoints();
          retPoint = (feat.getGeometry() as MultiPolygon).getClosestPoint(getCenter((feat.getGeometry() as MultiPolygon).getExtent()));
          finalGeom = (feat.getGeometry() as MultiPolygon).getPolygons().filter(p => p.intersectsCoordinate(retPoint))[0]
          ? (feat.getGeometry() as MultiPolygon).getPolygons().filter(p => p.intersectsCoordinate(retPoint))[0].getInteriorPoint()
          : new Point(retPoint);
          if (!finalGeom.intersectsExtent(extent) && interiorPoints.intersectsExtent(extent)) {
            finalGeom = new Point(interiorPoints.getClosestPoint(this.instance.getView().getCenter()!));
          }
        } else if (feat.getGeometry()?.getType() === 'Polygon') {
          finalGeom = (feat.getGeometry() as Polygon).getInteriorPoint();
        }
        return finalGeom;
      }
    });
    return [polyStyle, textStyle];
  }
  ngAfterViewInit(): void { setTimeout(() => { this.instance.updateSize(); }, 500); }
  ngOnDestroy(): void { this.instance.dispose(); }
}
