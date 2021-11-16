import { Injectable } from '@angular/core';
import { Map } from 'ol';
import { FeatureLike } from 'ol/Feature';
import { MVT as MVTFormat } from 'ol/format';
import GeoJSON from 'ol/format/GeoJSON';
import LayerGroup from 'ol/layer/Group';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorTileLayer from 'ol/layer/VectorTile';
import { Vector as VectorSource, VectorTile as VectorTileSource, XYZ } from 'ol/source';
import { Fill, Icon, Stroke, Style, Text } from 'ol/style';
import { LayerDetail } from '../classes/layer-detail.class';
import { MapConstants, StyleOptions } from '../models';
import { MapInfoService } from './map-info.service';

/**
 * Service to generate map groups and set up layers
 * @method makeBasemapGroup() Return Layer Group with Basemap and Basemap Labels layers
 * @method makeLayerGroup() Return Layer Group with Poltiical Geographies or Overlay Layers
 */
@Injectable({ providedIn: 'root' })
export class MapLayerService {
    zones: {[key: string]: Array<string>} = {
        'R-1': ['Residential: 1 Family', '#FFFFBE'],
        'R-2': ['Residential: 1-2 Family', '#FFFF00'],
        'R-3': ['Residential: 1-3 Family', '#E6E600'],
        'R-4': ['Residential: Low-Rise Multi-Family', '#e4a024'],
        'R-5': ['Residential: Mid-Rise Multi-Family', '#FF8C00'],
        'R-6': ['Residential: High-Rise Multi-Family', '#f37520'],
        'C-1': ['Commercial: Neighborhood', '#FFBEBE'],
        'C-2': ['Commercial: Community', '#FF7F7F'],
        'C-3': ['Commercial: Regional', '#A80000'],
        'I-1': ['Industrial: Light', '#E8BEFF'],
        'I-2': ['Industrial: Medium', '#DF73FF'],
        'I-3': ['Industrial: Heavy', '#8400A8'],
        'MX-1': ['Mixed-Use: Low Intensity', '#BEFFE8'],
        'MX-2': ['Mixed-Use: Medium Intensity', '#00E6A9'],
        'MX-3': ['Mixed-Use: High Intensity', '#00A884'],
        'INST': ['Institutional', '#73B2FF'],
        'PARK': ['Parks & Open Space', '#98E600'],
        'CEM': ['Cemeteries', '#70A800'],
        'RDV': ['Redevelopment Zone', '#E1E1E1'],
        'EWR': ['Airport & Airport Support', '#B2B2B2'],
        'PORT': ['Port Related Industrial', '#686868'],
        'N/A': ['Not Available', '#000000']
    };
    landUses: {[key: string]: Array<string>} = {
        1: ['Vacant Property', 'rgba(204,204,204)'],
        2: ['Residential: < 4 Units', 'rgba(255,235,175)'],
        '4A': ['Commercial', 'rgba(255,127,127)'],
        '4B': ['Industrial', 'rgba(170,102,205)'],
        '4C': ['Apartments', 'rgba(230,152,0)'],
        '5A': ['Railroad: Class I/II', 'rgba(78,78,78)'],
        '5B': ['Railroad: Class I/II', 'rgba(78,78,78)'],
        '5A/B': ['Railroad: Class I/II', 'rgba(78,78,78)'],
        '15A': ['Exempt: Public/Other School Property', 'rgba(190,210,255)'],
        '15B': ['Exempt: Public/Other School Property', 'rgba(190,210,255)'],
        '15A/B': ['Exempt: Public/Other School Property', 'rgba(190,210,255)'],
        '15C': ['Exempt: Public Property', 'rgba(158,170,215)'],
        '15D': ['Exempt: Church & Charitable Property', 'rgba(122,142,245)'],
        '15E': ['Exempt: Cemeteries & Graveyards', 'rgba(163,255,115)'],
        '15F': ['Exempt: Other', 'rgba(102,119,205)'],
        Unclassed: ['Unclassed Properties', 'rgba(0,0,0,0.2)']
    };
    initialLayerData: Array<LayerDetail> = [];
    constructor(readonly mapInfoService: MapInfoService) {}
    initLayers(instance: Map, initialLayerData: Array<LayerDetail>, layers: Array<{className: MapConstants['groups'], visibleLyrs?: Array<string>}>): void {
      this.initialLayerData = initialLayerData;
      layers.forEach(lyrInfo => {
        const newlayer = this.makeLayerGroup(lyrInfo.className, lyrInfo.visibleLyrs);
        newlayer.set('className', lyrInfo.className);
        instance.addLayer(newlayer);
      });
      instance.getLayers().changed();
      instance.changed();
    }
    makeLayerGroup(group: MapConstants['groups'], visibleLyrs: Array<string> = []): LayerGroup {
      const layerArray = this.initialLayerData.filter(il => il.group === group)
      .map(il => {
        const baseLyrObj = (obj: any) => Object.assign({
          className: il.className,
          group: il.group,
          layerType: il.layerType,
          zIndex: il.zIndex,
          opacity: il.opacity,
          visible: visibleLyrs.length > 0 ? visibleLyrs.includes(il.className) : il.visible,
          maxResolution: il.maxResolution ? il.maxResolution : undefined,
          minResolution: il.minResolution ? il.minResolution : undefined,
          styleOptions: il.styles ? il.styles : undefined
        }, obj);
        switch (il.layerType.type) {
          case 'TileLayer': return new TileLayer(baseLyrObj({preload: Infinity, source: new XYZ({ crossOrigin: 'anonymous', url: il.source.url })}));
          case 'VectorTileLayer': return new VectorTileLayer(baseLyrObj({
            source: new VectorTileSource({format: new MVTFormat({idProperty: il.styles && il.styles[0].keyField === 'ZONING' ? 'LOT_BLOCK_LOT' : il.styles[0].keyField}), url: il.source.url,overlaps: false}),
            style: il.styles ? (feat: FeatureLike, resolution: number) => il.styles.map(s => (this.styleFunction(s, feat, resolution))) : undefined
          }));
          default: return new VectorLayer(baseLyrObj({
            source: new VectorSource({url: il.source.url, format: new GeoJSON({featureProjection: 'EPSG:4326'}), attributions: il.attributions }),
            style: il.styles ? (feat: FeatureLike, resolution: number) => il.styles.map(s => (this.styleFunction(s, feat, resolution))) : undefined
          }));
      }});
      console.info(group + ' layer group generated'+ (visibleLyrs.length > 0 ? `\n\t${visibleLyrs} visible` : ''));
      return new LayerGroup({layers: layerArray});
    }
    buildArcGISURL(resourceName: string, resourceNum: number, keyField: string): string {
      const checkHist = () => resourceName === 'Newark_Historic_Assets' && resourceNum === 1 ? ` AND "STATUS"='LISTED'` : '';
      return `https://services1.arcgis.com/WAUuvHqqP3le2PMh/ArcGIS/rest/services/${resourceName}/FeatureServer/${resourceNum}/query?where="OBJECTID" is not null${checkHist()}&outFields=${keyField}&returnGeometry=true&f=geojson`;
    }
    styleFunction(styleOptions: StyleOptions, feature: FeatureLike, resolution: number): Style {
        const featLabeller = styleOptions.labels;
        const colorToString = (rgba: [number,number,number,number?]) => `rgba(${rgba.join(',')})`;
        const textContent = (label: string): string => label.match(/(\[.*?\])/g) === null
        ? label
        : label.match(/(\[.*?\])/g)!.reduce((p,c) => {return p.replace(c, feature.get(c.replace(/(\[|\])/g,'')) === undefined ? feature.getId() : feature.get(c.replace(/(\[|\])/g,'')));}, label);
        const getText = (labeller: StyleOptions['labels']) => feature && labeller
        ? this.makeText(
          this.stringDivider(textContent(labeller.textContent), 20, '\n'),
          labeller.fontSize ? labeller.fontSize : 1.15,
          labeller.textAlignment ? labeller.textAlignment : 'left',
          labeller.offsetXVal ? labeller.offsetXVal : 0,
          labeller.offsetYVal ? labeller.offsetYVal : 0,
          labeller.scaleVal ? labeller.scaleVal : 0.75,
          labeller.fill ? colorToString(labeller.fill) : undefined,
          labeller.outline ? colorToString(labeller.outline.color) : undefined,
          labeller.placement,
          styleOptions.type === 'special-zoning'
          )
        : undefined;
        const checkRDV = (zone: string) => styleOptions.type === 'special-zoning' && zone.startsWith('RDV') ? 'RDV' : zone;
        const featStylerNonRamp = (styleOpts: StyleOptions) => styleOpts.symbolCategories && styleOpts.symbolCategories!.filter(c => c.class.value === checkRDV(feature.get(styleOpts.keyField) ? feature.get(styleOpts.keyField) : '')).length > 0
          ? styleOpts.symbolCategories!.filter(c => c.class.value === checkRDV(feature.get(styleOpts.keyField)))[0]
          : styleOpts.defaultSymbol;
        const featStylerRamp = (styleOpts: StyleOptions) => styleOpts.symbolCategories && styleOpts.symbolCategories!.filter(c => eval(`${feature.get(c.class.rampKey!)} ${c.class.rampType} ${c.class.rampBreak}`)).length > 0
          ? styleOpts.symbolCategories!.filter(c => eval(`${feature.get(c.class.rampKey!)} ${c.class.rampType} ${c.class.rampBreak}`))[0]
          : styleOpts.defaultSymbol;
        const featStyler = styleOptions.type === 'ramp' ? featStylerRamp(styleOptions) : featStylerNonRamp(styleOptions);
        return new Style({
          fill: featStyler.fill ? new Fill({color: `rgba(${featStyler.fill.join(',')})`}) : undefined,
          image: featStyler.image ? new Icon({color: featStyler.image.color ? `rgb(${featStyler.image.color.join(',')})` : undefined, src: featStyler.image.src, crossOrigin: 'anonymous', scale: featStyler.image.scale, imgSize: featStyler.image.imgSize, anchor: featStyler.image.anchor}) : undefined,
          stroke: featStyler.outline ? new Stroke({color: `rgba(${featStyler.outline.color.join(',')})`, width: featStyler.outline.width || 1.5}) : undefined,
          text: featLabeller ? getText(featLabeller) : undefined,
          zIndex: styleOptions.zIndex
        });
    }
    makeText(
        textContent: string, fontSize = 1, textAlignment = 'left', offsetXVal = 25, offsetYVal = 0,
        scaleVal = 0.7, fillColor = '#1a73e8', strokeColor = 'white', placementVal = 'point', justLot = false): Text {
        return new Text({
            text: justLot ? textContent.split('-')[1] : textContent,
            font: `500 calc(${(fontSize * 0.15).toString()}rem + 14.5px) 'Segoe UI Semibold', Verdana, sans-serif`,
            textAlign: textAlignment,
            offsetX: offsetXVal,
            offsetY: offsetYVal,
            overflow: true,
            scale: scaleVal,
            placement: placementVal,
            padding: [5, 5, 5, 5],
            fill: new Fill({ color: fillColor }),
            stroke: new Stroke({ color: strokeColor, width: 6 })
        });
    }
    stringDivider(str: string, width: number, spaceReplacer: any): string {
        if (str.length > width) {
            let p = width;
            while (p > 0 && (str[p] !== ' ' && str[p] !== '-')) { p--; }
            if (p > 0) {
                const left = (str.substring(p, p + 1) === '-') ? str.substring(0, p + 1) : str.substring(0, p);
                const right = str.substring(p + 1);

                return `${left}${spaceReplacer}${this.stringDivider(right, width, spaceReplacer)}`;
            }
        }

        return str.replace(/(Redevelopment Plan|District Plan|Census Tract)/gi, '')
            .replace(/\w+/g, txt => txt.charAt(0)
                .toUpperCase() + txt.substr(1)
            );
    }
}
