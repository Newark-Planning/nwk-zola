import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { Collection, MapBrowserEvent, Overlay } from 'ol';
import Feature, { FeatureLike } from 'ol/Feature';
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
  mouseTooltip = {layer: 'Zoning District', value: ''};
  hiddenLayersGroup: LayerGroup = new LayerGroup;
  pointerPopup: Overlay = new Overlay({});
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
  @Output() readonly selection: EventEmitter<{layer: string; value: string;}> = new EventEmitter();
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
    this.pointerPopup = new Overlay({
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
          this.instance.addOverlay(this.pointerPopup);
        }
      }
    );
    this.instance.on('pointermove', e => this.handleMapAction(e));
    this.instance.on('singleclick', e => this.handleMapAction(e));
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
      this.mouseTooltip = {layer: '', value: ''};
      return;
    }
    if (!this.infoPaneActive && e.type === 'singleclick') {
      return;
    }
    const selectedFeat: {layer: string; feat: FeatureLike} | undefined = this.instance.forEachFeatureAtPixel(e.pixel,(f,l,g) => {
      return ({layer: l.getClassName(), feat: f});
    }, {layerFilter: (l) => !['Census_Tracts','Zipcodes','Neighborhoods','Wards','DrawLayer','selection-hover','selection-click'].includes(l.getClassName())});
    this.clickSelectionLayer.getSource().clear();
    if (selectedFeat) {
      this.hoverSelectionLayer.getSource().clear();
      const styleData = this.layerService.initialLayerData.filter(il => il.className === selectedFeat.layer);
      const keyField = styleData.length > 0 ? styleData[0].styles[0].keyField : '';
      let clickSelectionValue: string;
      if (e.type === 'singleclick') {
        const fixRdv = (currentFeat: FeatureLike): string => currentFeat.get('ZONING') === 'RDV' ? `${currentFeat.get('ZONING')} - ${currentFeat.get('RDV_PLAN')}` : currentFeat.get('ZONING');
        if (selectedFeat.layer === 'Zoning_Districts') {
          this.clickSelectionLayer.getSource().addFeature(new Feature(selectedFeat.feat.getGeometry()));
          clickSelectionValue = fixRdv(selectedFeat.feat);
        } else if (selectedFeat.layer === 'Parcels-Zoning') {
          clickSelectionValue = selectedFeat.feat.getId() as string;
        } else {
          clickSelectionValue = selectedFeat.feat.get(keyField) as string;
        };
        this.selection.emit({layer: selectedFeat.layer, value: clickSelectionValue || ''});
        this.instance.getView().animate({
          center: e.coordinate,
          zoom: selectedFeat.layer === 'Parcels-Zoning' ? undefined : 5,
          duration: 150
        });
      } else {
        this.pointerPopup.setPosition(e.coordinate);
        if (!['Commuter_Rail','Light_Rail','High_Frequency_Bus','Standard_Bus','Parcels-Zoning'].includes(selectedFeat.layer)) {
          this.hoverSelectionLayer.getSource().addFeature(new Feature(selectedFeat.feat.getGeometry()));
        }
        this.mouseTooltip = {layer: selectedFeat.layer.replace(/[_-]/gi," "), value: selectedFeat.layer === 'Parcels-Zoning' ? (selectedFeat.feat.getId() as string): selectedFeat.feat.get(keyField)};
      }
    } else {
      e.type === 'singleclick' ? this.selection.emit({layer: '', value: ''}) : this.mouseTooltip = {layer: '', value: ''};
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
