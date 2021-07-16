import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import Feature, { FeatureLike } from 'ol/Feature';
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
 * @method makeTransitGroup() Return Layer Group with Commuter and Light Rail layers
 * @method makeLayerGroup(): Return Layer Group with Poltiical Geographies or Overlay Layers
 * @method makeParcelGroup() Return Layer Group with Parcel and Parcel Grid Layers
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
    basicColorRamp = ['#00334d','#d82929','#fb8100','#ffc14a','#ece4c0'];
    initialLayerData: Array<LayerDetail> = [];
    initParcelData = [{ name: 'Parcels', group: 'Parcels', legendColor: [0, 0, 0], zIndex: 2 }];
    constructor(readonly http: HttpClient, readonly mapInfoService: MapInfoService) {}
    makeBasemapGroup(): LayerGroup {
        return new LayerGroup({ layers: [
                new TileLayer({ className: 'basemap', zIndex: 0, source: new XYZ({ crossOrigin: 'anonymous' }) }),
                new TileLayer({ className: 'basemap-labels', zIndex: 4, opacity: 0.8, source: new XYZ({ crossOrigin: 'anonymous' }) })
        ]});
    }
    makeTransitGroup(): LayerGroup {
        return new LayerGroup({ layers: [
            new VectorLayer({
                className: 'Commuter Rail',
                zIndex: 6,
                source: new VectorSource({ url: 'assets/data/transit_njt.geojson', format: new GeoJSON() }),
                style: (feat: FeatureLike) => new Style({
                    image: new Icon({ src: `assets/img/icons/${feat.get('ICON')}.png`, crossOrigin: 'anonymous', scale: 0.5 }),
                    text: this.makeText(feat.get('STATION'), undefined, undefined, 25, 0, 0.7, '#1a73e8', 'white')
                })
            }),
            new VectorLayer({
                className: 'Light Rail',
                maxResolution:  9.554628535634155,
                zIndex: 6,
                source: new VectorSource({ url: 'assets/data/transit_nlr.geojson', format: new GeoJSON() }),
                style: feat => new Style({
                    image: new Icon({ src: 'assets/img/icons/Logo_NLR.png', crossOrigin: 'anonymous', scale: 0.6 }),
                    text: this.makeText(feat.get('STATION'), undefined, undefined, 15, 0, 0.7, '#1a73e8', 'white')
                })
            })]
        });
    }
    makeLayerGroup(group: MapConstants['groups'], visibleLyrs: Array<string> = []): LayerGroup {
      const layerArray = this.initialLayerData.filter(il => il.group === group)
      .map(il => {
        const baseLyrObj = (obj: any) => Object.assign({
          className: il.className,
          zIndex: il.zIndex,
          opacity: il.opacity,
          visible: visibleLyrs.length > 0 ? visibleLyrs.includes(il.className) : il.visible,
          maxResolution: il.maxResolution ? il.maxResolution : undefined,
          minResolution: il.minResolution ? il.minResolution : undefined
        }, obj);
        switch (il.layerType.type) {
          case 'TileLayer': return new TileLayer(baseLyrObj({source: new XYZ({ crossOrigin: 'anonymous', url: il.source.url })}));
          case 'VectorTileLayer': return new VectorTileLayer(baseLyrObj({
            source: new VectorTileSource({format: new MVTFormat(), url: il.source.url}),
            style: il.styles ? (feat: Feature) => il.styles.map(s => (this.styleFunction(s, feat))) : undefined
          }));
          default: return new VectorLayer(baseLyrObj({
            source: new VectorSource({url: il.source.url, format: new GeoJSON({featureProjection: 'EPSG:4326'}), attributions: il.attributions }),
            style: il.styles ? (feat: Feature) => il.styles.map(s => (this.styleFunction(s, feat))) : undefined
          }));
      }});
      console.info(group + ' layer group generated'+ (visibleLyrs.length > 0 ? `\n\t${visibleLyrs} visible` : ''));
      return new LayerGroup({layers: layerArray});
    }
    setParcelStyle(attr: 'Zoning' | 'LandUse' | 'Base', feat: FeatureLike): Style {
        const checkRDV = (zone: string) => zone.startsWith('RDV') ? 'RDV' : zone;
        const styler = (l: string, f: FeatureLike) => {
            switch (l) {
            case 'Zoning': return ({color: `${this.zones[f.get('ZONING') === undefined ? 'N/A' : checkRDV(f.get('ZONING'))][1]}CC`});
            case 'LandUse': return ({color: `${this.landUses[f.get('PROPCLASS') === undefined ? 'Unclassed' : f.get('PROPCLASS')][1].slice(0, -1)},.8)`});
            default: return ({color: 'transparent'});
        }};

        return new Style({
            fill: new Fill(styler(attr, feat)),
            stroke: new Stroke({width: 0.2, color: 'grey'})
        });
    }
    makeParcelGroup(layer: 'Zoning' | 'LandUse' | 'Base'): LayerGroup {
        return new LayerGroup({ layers:
            this.initParcelData.map(
                (ip, i) => new VectorTileLayer({
                    className: ip.name, zIndex: ip.zIndex,
                    source: new VectorTileSource({
                        format: new MVTFormat(),
                        url: 'https://vectortileservices1.arcgis.com/WAUuvHqqP3le2PMh/arcgis/rest/services/Newark_Parcels_Zoning/VectorTileServer/tile/{z}/{y}/{x}.pbf'
                    }),
                    style: feat => this.setParcelStyle(layer, feat)
                })
        )});
    }
    buildArcGISURL(resourceName: string, resourceNum: number, keyField: string): string {
      const checkHist = () => resourceName === 'Newark_Historic_Assets' && resourceNum === 1 ? ` AND "STATUS"='LISTED'` : '';
      return `https://services1.arcgis.com/WAUuvHqqP3le2PMh/ArcGIS/rest/services/${resourceName}/FeatureServer/${resourceNum}/query?where="OBJECTID" is not null${checkHist()}&outFields=${keyField}&returnGeometry=true&f=geojson`;
    }
    styleFunction(styleOptions: StyleOptions, feature: FeatureLike): Style {
        const featLabeller = styleOptions.labels;
        const colorToString = (rgba: [number,number,number,number?]) => `rgba(${rgba.join(',')})`;
        const textContent = (label: string): string => label.match(/(\[.*?\])/g) === null
        ? label
        : label.match(/(\[.*?\])/g)!.reduce((p,c) => {return p.replace(c, feature.get(c.replace(/(\[|\])/g,'')));}, label);
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
          labeller.placement
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
        scaleVal = 0.7, fillColor = '#1a73e8', strokeColor = 'white', placementVal = 'point' ): Text {
        return new Text({
            text: textContent,
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
