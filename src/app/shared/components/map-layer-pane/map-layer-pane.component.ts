import { SelectionModel } from '@angular/cdk/collections';
import {
  AfterViewInit,
  Component,
  Input
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSliderChange } from '@angular/material/slider';
import { DomSanitizer } from '@angular/platform-browser';
import Map from 'ol/Map';
import Layer from 'ol/layer/Layer';
import BaseLayer from 'ol/layer/Base';
import LayerGroup from 'ol/layer/Group';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import XYZ from 'ol/source/XYZ';
import { LegendItem, StyleOptions } from '../../models';
import { MapInfoService, MapLayerService} from '../../services';
import { rowExpand } from '../../utils/animations';
import { ModalComponent } from '../modal.component';

@Component({
    animations: [rowExpand],
    selector: 'map-layer-pane',
    templateUrl: './map-layer-pane.component.html',
    styleUrls: ['./map-layer-pane.component.scss']
})
export class MapLayerPaneComponent implements AfterViewInit {
  @Input() map: Map = new Map({});
  @Input() paneopen = true;
  layers: Array<BaseLayer | LayerGroup> = [];
  isExpansionDetailRow = (i: number, row: BaseLayer) => row.hasOwnProperty('expanded');
  cols: Array<any> = ['expand',  'name', 'visible'];
  currentLegendElements: {[layer: string]: Array<LegendItem>} = {};
  selection = new SelectionModel<BaseLayer>(false, []);
  constructor(
    readonly dialog: MatDialog,
    readonly lyrService: MapLayerService,
    readonly mapInfoService: MapInfoService,
    readonly sanitizer: DomSanitizer) {
  }
  ngAfterViewInit(): void {
    setTimeout(() => {
        this.layers = this.map.getLayers().getArray().filter(l => l.get('className') !== 'Hidden') as Array<BaseLayer | LayerGroup>;
      }, 1000);
  }
  goToLyrSource(lyr: Layer): void {
    let urlString: string;
    const className = lyr.getClassName();
    const resourceinfo = this.lyrService.initialLayerData.filter(il => className.search(il.className) > -1)[0];
    const parseURL = {
      resourceName: resourceinfo.source.url.slice(resourceinfo.source.url.search('services/') + 9, resourceinfo.source.url.search('/FeatureServer')),
      resourceNum: resourceinfo.source.url.slice(resourceinfo.source.url.search('FeatureServer/') + 14, resourceinfo.source.url.search('FeatureServer/') + 16)
    };
    urlString = String(lyr instanceof VectorLayer
        ? `https://data-newgin.opendata.arcgis.com/datasets/${parseURL.resourceName.toLowerCase().replace(/_/gi, '-')}?layer=${parseURL.resourceNum ? parseURL.resourceNum : 0}`
        : (lyr.getSource() as XYZ).getUrls()![0]);
    window.open(urlString, '_blank')
  }
  replaceUnderscore = (layer: string): string => layer.replace(/[_\-]/gi, ' ');
  setOpacity(e: MatSliderChange, layer: BaseLayer): void { layer.setOpacity(e.value!); }
  toggleVisible(e: MouseEvent, layer: BaseLayer, group?: LayerGroup): void {
    e.stopPropagation();
    layer.setVisible(!layer.getVisible());
    const className = layer.get('className') ? layer.get('className') : layer.getClassName();
    console.info(className +' set to ' + `${layer.getVisible() ? 'visible' : 'hidden'}`);
    if (group && (layer.getClassName()).search(/(Basemap|Rail|Bus|Parcels|Grid)/gi) === -1) {
        group.getLayers()
            .forEach(lyr => {if (lyr !== layer) { lyr.setVisible(false); } });
    }
  }
  generateLegend(lyr: LayerGroup) {
    lyr.getLayers().forEach(l => {
      if (!this.currentLegendElements.hasOwnProperty(l.getClassName())) {
        const info = this.getLegendInfo(l as Layer);
        this.currentLegendElements[l.getClassName()] = info;
      }
    });
  }
  getLegendInfo(lyr: Layer): Array<LegendItem> {
    const name = lyr.getClassName();
    const styleOptions = lyr.get('styleOptions') as Array<StyleOptions>;
    const imgSizeDefault = [5,5] as [number,number];
    const hasStyle = styleOptions.length > 0 ? styleOptions.length > 0 : false;
    if (hasStyle && ['unique','special-zoning'].includes(styleOptions[0].type)) {
      const cats = styleOptions[0].symbolCategories!.map(c => ({
        key: c.class.value,
        description: c.class.description,
        type: lyr.get('layerType')?.geometryType,
        patch: c.image ? undefined : {
          outline: `rgba(${Array(c.outline ? c.outline.color : [100,100,100]).join(',')})`,
          fill: `rgba(${Array(c.fill ? c.fill : [0,0,0,0]).join(',')})`
        },
        image: c.image ? {
          src: c.image.src,
          imgSize: c.image.imgSize ? c.image.imgSize : imgSizeDefault,
          svg: c.image.src.slice(-3) === 'svg' ? this.sanitizer.bypassSecurityTrustUrl(c.image.src) : undefined
        } : undefined
      }));
      const defSymbol = styleOptions[0].defaultSymbol;
      cats.push(({
        key: defSymbol.class.value,
        description: defSymbol.class.description,
        type: lyr.get('layerType')?.geometryType,
        patch: defSymbol.image ? undefined : {
          outline: `rgba(${Array(defSymbol.outline ? defSymbol.outline.color : [100,100,100]).join(',')})`,
          fill: `rgba(${Array(defSymbol.fill ? defSymbol.fill : [0,0,0,0]).join(',')})`
        },
        image: defSymbol.image ? {
          src: defSymbol.image.src, imgSize: defSymbol.image.imgSize ? defSymbol.image.imgSize : imgSizeDefault,
          svg: defSymbol.image.src.slice(-3) === 'svg' ? this.sanitizer.bypassSecurityTrustUrl(defSymbol.image.src) : undefined
        } : undefined
      }))
      return cats;
    } else if (hasStyle && styleOptions[0].type === 'single') {
      const defSymbol = styleOptions[0].defaultSymbol;
      return [({
        key: defSymbol.class.value,
        description: defSymbol.class.description,
        type: lyr.get('layerType')?.geometryType,
        patch: defSymbol.image ? undefined : {
          outline: `rgba(${Array(defSymbol.outline ? defSymbol.outline.color : [100,100,100]).join(',')})`,
          fill: `rgba(${Array(defSymbol.fill ? defSymbol.fill : [0,0,0,0]).join(',')})`
        },
        image: defSymbol.image ? {
          src: defSymbol.image.src,
          imgSize: defSymbol.image.imgSize ? defSymbol.image.imgSize : imgSizeDefault,
          svg: defSymbol.image.src.slice(-3) === 'svg' ? this.sanitizer.bypassSecurityTrustUrl(defSymbol.image.src) : undefined,
          color: defSymbol.image.color ? `rgba(${Array(defSymbol.image.color).join(',')})` : undefined
        } : undefined
      })];
    } else {
      return [];
    }
  }
  openDetails(lyr: VectorLayer | TileLayer): void {
    const layerinfo = this.mapInfoService.getLayerInfo(lyr);
    layerinfo.subscribe(r => {
      this.dialog.open(ModalComponent, {
        maxWidth: '100vw',
        data: {
          header: `<b>${r.name}</b>`,
          message: r.description
        }
      });
    })
  }
}
