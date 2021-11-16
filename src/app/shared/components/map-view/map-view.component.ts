import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { MapBrowserEvent, Overlay } from 'ol';
import Feature, { FeatureLike } from 'ol/Feature';
import { Geometry, Polygon } from 'ol/geom';
import { Draw } from 'ol/interaction';
import BaseLayer from 'ol/layer/Base';
import LayerGroup from 'ol/layer/Group';
import VectorLayer from 'ol/layer/Vector';
import Map from 'ol/Map';
import OverlayPositioning from 'ol/OverlayPositioning';
import VectorSource from 'ol/source/Vector';
import { Stroke, Style } from 'ol/style';
import { StoreService } from '../../../store/store.service';
import { MapConstants } from '../../models';
import { GoogleService, MapControlsService, MapInfoService, MapService, MapLayerService } from '../../services';
import RenderFeature from 'ol/render/Feature';
import GeometryLayout from 'ol/geom/GeometryLayout';

@Component({
  selector: 'app-map-view',
  styleUrls: ['./map-view.component.scss'],
  templateUrl: './map-view.component.html'
})

export class MapViewComponent implements OnInit, AfterViewInit, OnDestroy {
  instance: Map = new Map({});
  infoPaneActive = true;
  loadingIndicator = false;
  layersPaneActive = true;
  drawInteraction: Draw | undefined;
  mouseTooltip: {layer: string; props: Array<{prop: string; value: string;}>} = {layer: 'Zoning District', props: []};
  hiddenLayersGroup: LayerGroup = new LayerGroup;
  pointerTooltip: Overlay = new Overlay({});
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
  layers: Array<{className: MapConstants['groups'], visibleLyrs?: Array<string>}> = [
    {className:'Basemap'},
    {className:'Parcels & Zoning', visibleLyrs: ['Zoning_Districts']},
    {className:'Transit', visibleLyrs: ['Commuter_Rail','Light_Rail']},
    {className:'Boundaries'},
    {className:'Economic Development'},
    {className:'Other Layers'},
    {className:'Hidden'}
  ];
  @Output() readonly selection: EventEmitter<{layer: string; value: string; details: Array<{prop: string, value: any}>}> = new EventEmitter();
  constructor(
    private readonly host: ElementRef,
    readonly controls: MapControlsService,
    readonly google: GoogleService,
    readonly layerService: MapLayerService,
    readonly mapInfoService: MapInfoService,
    readonly mapService: MapService,
    readonly storeService: StoreService
    ) {}
  ngOnInit(): void {
    this.instance = this.mapService.initMap(this.host.nativeElement.firstElementChild);
    this.pointerTooltip = new Overlay({
      className: 'ol-overlay-container ol-unselectable ol-pointer-tooltip',
      positioning: 'top-left' as OverlayPositioning,
      offset: [18,18],
      element: document.getElementById('pointer-popup')!
    });
    this.mapInfoService.getInitLayerData()
      .subscribe({
        next: r => {
          this.layerService.initLayers(this.instance, r, this.layers);
        },
        complete: () => {
          this.controls.setBasemapLayer(
            'base',
            this.getLayerByID('Basemap') as LayerGroup
          );
          (this.getLayerByID('Hidden') as LayerGroup).getLayers().extend([this.hoverSelectionLayer, this.clickSelectionLayer]);
          this.instance.addOverlay(this.pointerTooltip);
        }
      }
    );
    this.instance.on('pointermove', e => this.handleMapAction(e));
    this.instance.on('singleclick', e => this.handleMapAction(e));
    this.instance.getView().on('change:resolution', e => {
      if (e.target.get(e.key) <= 1) {
        const clickFeats = this.clickSelectionLayer.getSource().getFeatures().filter(f => f.get('name') === 'Zoning_Districts');
        // clickFeats.length > 0 ? clickFeats[0].
      }
    });
    this.instance.getInteractions().on(['add','remove'], (e) => {
      if (e.element instanceof Draw) {
        this.drawInteraction = e.type === 'add' ?  e.element : undefined;
      }
    });
    this.instance.updateSize();
  }
  checkRDV = (zone: string): string => zone.startsWith('RDV') ? 'RDV' : zone;
  handleMapAction(e: MapBrowserEvent): void {
    if (e.dragging || (this.drawInteraction && this.drawInteraction.getActive())) {
      this.hoverSelectionLayer.getSource().clear();
      this.mouseTooltip = {layer: '', props: []};
      return;
    }
    if (!this.infoPaneActive && e.type === 'singleclick') {
      return;
    }
    const selectedFeat: {layer: string; feat: FeatureLike; layerO?: any} | undefined = this.instance.forEachFeatureAtPixel(e.pixel,(f,l,g) => {
      return ({layer: l.getClassName(), feat: f, layerO: l});
    }, {layerFilter: (l) => !['Census_Tracts','Zipcodes','Neighborhoods','Wards','DrawLayer','selection-hover','selection-click'].includes(l.getClassName())});
    if (selectedFeat) {
      const addFeat = (geom: Geometry, type: 'click' | 'hover'): void => (
        type === 'click' ? this.clickSelectionLayer : this.hoverSelectionLayer
        ).getSource().addFeature(new Feature({geometry: geom, layer: selectedFeat.layer}));
      this.hoverSelectionLayer.getSource().clear();
      const styleData = this.layerService.initialLayerData.filter(il => il.className === selectedFeat.layer);
      const keyField = styleData.length > 0 ? styleData[0].styles[0].keyField : '';
      let clickSelectionValue: string;
      let clickSelectionDetails: Array<{prop: string; value: any;}> = [];
      if (e.type === 'singleclick') {
        this.clickSelectionLayer.getSource().clear();
        const fixRdv = (currentFeat: FeatureLike): string => currentFeat.get('ZONING') === 'RDV' ? `${currentFeat.get('ZONING')} - ${currentFeat.get('RDV_PLAN')}` : currentFeat.get('ZONING');
        if (selectedFeat.layer === 'Zoning_Districts') {
          addFeat(selectedFeat.feat.getGeometry() as Geometry, 'click');
          clickSelectionValue = fixRdv(selectedFeat.feat);
        } else if (selectedFeat.layer === 'Parcels-Zoning') {
          clickSelectionValue = selectedFeat.feat.getId() as string;
          console.info(selectedFeat.layerO);
          const renderFeat = selectedFeat.feat as RenderFeature;
          addFeat(new Polygon(renderFeat.getOrientedFlatCoordinates(), GeometryLayout.XY, renderFeat.getEnds() as Array<number>),'click');
        } else {
          clickSelectionValue = selectedFeat.feat.get(keyField) as string;
          clickSelectionDetails = Object.entries(selectedFeat.feat.getProperties()).slice(1).map(item => ({prop: item[0], value: item[1]}));
        };
        this.selection.emit({layer: selectedFeat.layer, value: clickSelectionValue || '', details: clickSelectionDetails || []});
        this.instance.getView().animate({
          center: e.coordinate,
          zoom: selectedFeat.layer === 'Parcels-Zoning' ? undefined : 5,
          duration: 150
        });
      } else {
        this.pointerTooltip.setPosition(e.coordinate);
        this.mouseTooltip = {layer: selectedFeat.layer.replace(/[_-]/gi," "), props: [{prop: keyField, value: selectedFeat.feat.get(keyField) as string}]};
        if (!['Commuter_Rail','Light_Rail','High_Frequency_Bus','Standard_Bus','Parcels-Zoning'].includes(selectedFeat.layer)) {
          addFeat(selectedFeat.feat.getGeometry() as Geometry, 'hover');
        } else if (['Parcels-Zoning'].includes(selectedFeat.layer)) {
          const renderFeat = selectedFeat.feat as RenderFeature;
          addFeat(new Polygon(renderFeat.getOrientedFlatCoordinates(), GeometryLayout.XY, renderFeat.getEnds() as Array<number>),'hover');
          this.mouseTooltip = {layer: selectedFeat.layer.replace(/[_-]/gi," "), props: [
            {prop: 'Block-Lot', value: selectedFeat.feat.getId() as string},
            {prop: 'Legal Address', value: selectedFeat.feat.get('PROPLOC') as string}
          ]};
        }
      }
    } else {
      e.type === 'singleclick' ? this.selection.emit({layer: '', value: '', details: []}) : this.mouseTooltip = {layer: '', props: []};
    }
    setTimeout(() => {
      this.instance.updateSize();
    },600);
  }
  getLayerByID(group: MapConstants['groups'], layer?: string): BaseLayer | LayerGroup {
    const layerGroup = this.instance.getLayers().getArray().filter(l => l.get('className') === group)[0];
    if (layer) {
      return layerGroup.getLayersArray().filter(l => l.getClassName() === layer)[0];
    }
    return layerGroup;
  }
  toggleLayersPane(): void {
    this.layersPaneActive = !this.layersPaneActive;
    setTimeout(() => {
      this.instance.updateSize();
      console.info(`Layers Pane ${this.layersPaneActive ? 'Opened' : 'Closed'}, Map Redrawn!`);
    },500);
  }
  ngAfterViewInit(): void { setTimeout(() => { this.instance.updateSize(); }, 500); }
  ngOnDestroy(): void { this.instance.dispose(); }
}
