import { SelectionModel } from '@angular/cdk/collections';
import {
  Component,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSliderChange } from '@angular/material/slider';
import { Map } from 'ol';
import { Layer } from 'ol/layer';
import BaseLayer from 'ol/layer/Base';
import LayerGroup from 'ol/layer/Group';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import { XYZ } from 'ol/source';
import { LegendItem } from '../../models';
import { MapInfoService } from '../../services/map-info.service';
import { MapLayerService } from '../../services/maplayer.service';
import { rowExpand } from '../../utils/animations';
import { ModalComponent } from '../modal.component';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    animations: [rowExpand],
    selector: 'map-layer-pane',
    templateUrl: './map-layer-pane.component.html',
    styleUrls: ['./map-layer-pane.component.scss']
})
export class MapLayerPaneComponent implements OnChanges {
  @Input() map: Map = new Map({});
  @Input() paneopen = true;
  layers: Array<BaseLayer | LayerGroup> = [];
  geoOpacity = 1;
  geoVis = true;
  parcelsOpacity = 1;
  parcelsVis = true;
  overlayOpacity = 1;
  geographiesControl = new FormControl();
  isExpansionDetailRow = (i: number, row: BaseLayer) => row.hasOwnProperty('expanded');
  expandedElement: BaseLayer | undefined;
  cols: Array<any> = ['expand',  'name', 'visible'];
  selection = new SelectionModel<BaseLayer>(false, []);
  constructor(
    readonly dialog: MatDialog,
    readonly lyrService: MapLayerService,
    readonly mapInfoService: MapInfoService,
    readonly sanitizer: DomSanitizer) {
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.hasOwnProperty('map')) {
      this.map.getLayers().on('change', () => {
        this.layers = this.map.getLayers().getArray().filter(l => l.get('className') !== 'Hidden');
      });
    }
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
  replaceUnderscore(layer: string): string {
    const newtext = layer.replace(/[_\-]/gi, ' ');
    return newtext;
  }
  setOpacity(e: MatSliderChange, layer: BaseLayer): void {
    layer.setOpacity(e.value!);
  }
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
  getLegendInfo(lyr: Layer): Array<LegendItem> {
    const name = lyr.getClassName();
    const styleInfo = this.lyrService.initialLayerData.filter(il => il.className === name);
    const imgSizeDefault = [5,5] as [number,number];
    const hasStyle = styleInfo.length > 0 ? styleInfo[0].styles.length > 0 : false;
    if (hasStyle && ['unique','special-zoning'].includes(styleInfo[0].styles[0].type)) {
      const cats = styleInfo[0].styles[0].symbolCategories!.map(c => ({
        key: c.class.value,
        description: c.class.description,
        type: styleInfo[0].layerType.geometryType,
        patch: c.image ? undefined : {
          outline: `rgba(${Array(c.outline ? c.outline.color : [100,100,100]).join(',')})`,
          fill: `rgba(${Array(c.fill ? c.fill : [0,0,0,0]).join(',')})`
        },
        image: c.image ? {
          src: c.image.src,
          imgSize: c.image.imgSize ? c.image.imgSize : imgSizeDefault,
          svg: c.image.src.slice(-3) === 'svg' ? this.sanitizer.bypassSecurityTrustResourceUrl(c.image.src) : undefined
        } : undefined
      }));
      const defSymbol = styleInfo[0].styles[0].defaultSymbol;
      cats.push(({
        key: defSymbol.class.value,
        description: defSymbol.class.description,
        type: styleInfo[0].layerType.geometryType,
        patch: defSymbol.image ? undefined : {
          outline: `rgba(${Array(defSymbol.outline ? defSymbol.outline.color : [100,100,100]).join(',')})`,
          fill: `rgba(${Array(defSymbol.fill ? defSymbol.fill : [0,0,0,0]).join(',')})`
        },
        image: defSymbol.image ? {
          src: defSymbol.image.src, imgSize: defSymbol.image.imgSize ? defSymbol.image.imgSize : imgSizeDefault,
          svg: defSymbol.image.src.slice(-3) === 'svg' ? this.sanitizer.bypassSecurityTrustResourceUrl(defSymbol.image.src) : undefined
        } : undefined
      }))
      return cats;
    } else if (hasStyle && styleInfo[0].styles[0].type === 'single') {
      const defSymbol = styleInfo[0].styles[0].defaultSymbol;
      return [({
        key: defSymbol.class.value,
        description: defSymbol.class.description,
        type: styleInfo[0].layerType.geometryType,
        patch: defSymbol.image ? undefined : {
          outline: `rgba(${Array(defSymbol.outline ? defSymbol.outline.color : [100,100,100]).join(',')})`,
          fill: `rgba(${Array(defSymbol.fill ? defSymbol.fill : [0,0,0,0]).join(',')})`
        },
        image: defSymbol.image ? {
          src: defSymbol.image.src,
          imgSize: defSymbol.image.imgSize ? defSymbol.image.imgSize : imgSizeDefault,
          svg: defSymbol.image.src.slice(-3) === 'svg' ? this.sanitizer.bypassSecurityTrustResourceUrl(defSymbol.image.src) : undefined,
          color: defSymbol.image.color ? `rgba(${Array(defSymbol.image.color).join(',')})` : undefined
        } : undefined
      })];
    } else {
      return [];
    }
  }
  openDetails(lyr: VectorLayer | TileLayer): void {
    // const className: string = lyr.getClassName();
    // const lyrInfo = this.lyrService.getLayerInfo(className);
    // let urlString: string;
    // if (['Zoning', 'Land Use', 'Base'].includes(className)) {
    //     urlString = 'https://data-newgin.opendata.arcgis.com/datasets/newark-parcels?layer=0';
    // } else {
    //     const resourceinfo = this.lyrService.initialLayerData.filter(il => className.search(il.name) > -1)[0];
    //     urlString = String(lyr instanceof VectorLayer
    //         ? `https://data-newgin.opendata.arcgis.com/datasets/${resourceinfo.resource.toLowerCase().replace(/_/gi, '-')}?layer=${resourceinfo.resourceNum ? resourceinfo.resourceNum : 0}`
    //         : (lyr.getSource() as XYZ).getUrls()![0]);
    // }
    // const addLink = className.search(/(Parcels|Grid|Basemap)/gi) === -1
    //     ? `<tr><td class="side-header">Source</td><td class="propVals"><a class="mat-stroked-button" download="Newark_${className.replace(/\s/gi, '_')}.geojson"
    //         href="${urlString}${urlString.startsWith('https://nzlur.carto.com/') ? ('&filename=Newark_').concat(className.replace(/\s/gi, '_')) : ''
    //         }">${urlString.startsWith('https://nzlur.carto.com/') ? 'CARTO' : 'Data'} Source</a></td></tr>`
    //     : '';
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
