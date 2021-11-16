import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ArcGISItemInfo, LayerInfoPaneContent, LayerDetailOptions, PlanDetails, ArcGeoJSONPropResponse } from '../models';
import { map } from 'rxjs/operators';
import { Layer } from 'ol/layer';
import VectorSource from 'ol/source/Vector';
import { LayerDetail } from '../classes/layer-detail.class';
/**
 * Service to generate map and set up layers
 * @method initMap() Instantiate new map instance
 */
@Injectable({ providedIn: 'root' })
export class MapInfoService {
  propFields: {[group: string]: Array<{alias: string; field: string;}>} = {
    'ID': [
      {alias: 'Block-Lot', field: 'LOT_BLOCK_LOT'},
      {alias: 'Primary Parcel', field: 'MOD4_BLOCK_LOT'},
      {alias: 'Legal Address', field: 'PROPLOC'},
      {alias: 'Related Lots', field: 'ADDLOTS'}
    ],
    'Designations': [
      {alias: 'Zoning Designation', field: 'ZONING'},
      {alias: 'Redevelopment Plan', field: 'RDV_PLAN'},
      {alias: 'Redevelopment Zoning', field: 'RDV_CODE'},
      {alias: 'Historic District', field: 'HIST_DIST'},
      {alias: 'Historic Landmark', field: 'HIST_PROP'},
      {alias: 'Opportunity Zone', field: 'OPPO_ZONE'},
      {alias: 'Within UEZ', field: 'IN_UEZ'},
      {alias: 'Property Use', field: 'PROPCLASS'},
      {alias: 'Bldg. Description', field: 'BUILDDESC'},
      {alias: 'Land Description', field: 'LANDDESC'},
      {alias: 'Acreage', field: 'ACREAGE'},
      {alias: 'Ward', field: 'CITYWARD'},
      {alias: 'Commercial Type', field: 'CLASS4TYPE'}
    ],
    'Tax Info': [
      {alias: 'Owner Name', field: 'OWNERSNAME'},
      {alias: 'Tax Map Page', field: 'TAXMAP'},
      {alias: 'Assessment - Land', field: 'LANDVALUE'},
      {alias: 'Assessment - Improvements', field: 'IMPRVALUE'},
      {alias: 'Assessment - Total', field: 'NETVALUE'},
      {alias: 'Last Year Tax', field: 'LSTYRTAX'},
      {alias: 'Old Block No.', field: 'OLDBLOCKNO'},
      {alias: 'Old Lot No.', field: 'OLDLOTNO'},
      {alias: 'Old Qual Code', field: 'OLDQUALCODE'}
    ]
  };
  constructor(
    private http: HttpClient
  ) {}
  /**
 * Get Zoning Information From Firebase
 * @param zone name of zone to retrieve info on
 */
  getFirebaseZoneInfo(zone: string): Observable<LayerInfoPaneContent> {
    const isRdv = (z: string) => z.startsWith('RDV') ? 'RDV' : z;
    return this.http.get<LayerInfoPaneContent>(`https://nwkehd.firebaseio.com/Zoning/${isRdv(zone)}.json`);
  }
  getLocalPaneInfo(data: {layer: string; value: string;}): Observable<LayerInfoPaneContent> {
    return this.http.get<{[key: string]: LayerInfoPaneContent}>('assets/data/paneInfo.json')
      .pipe(
        map((r: {[key: string]: LayerInfoPaneContent}) => r[data.value] ? r[data.value] : {NAME: data.value, TYPE: data.layer, DESCRIPTION: ''})
      );
  }
  getRDVPlanInfo(id: string): Observable<any> {
    return this.http.get<Array<PlanDetails>>('assets/data/redevelopment_plans.json')
      .pipe(
        map((r: Array<PlanDetails>) => r.find(p => p.ID === id))
      );
  }
  getPropInfo(queryType: 'LOT_BLOCK_LOT' | 'PROPLOC' | 'XY', queryValue: string | [number, number], outFields: 'basic' | 'detailed' | 'geometry'): Observable<ArcGeoJSONPropResponse> {
    const fields: {[type: string]: Array<string>;} = {
      basic: [ 'LOT_BLOCK_LOT', 'MOD4_BLOCK_LOT', 'PROPLOC', 'ADDLOTS', 'ZONING', 'RDV_PLAN', 'RDV_CODE', 'HIST_DIST', 'HIST_PROP', 'OPPO_ZONE', 'IN_UEZ' ],
      detailed: [],
      geometry: ['LOT_BLOCK_LOT']
    };
    if (outFields === 'detailed') {
      Object.keys(this.propFields).forEach(k => {
        this.propFields[k].forEach(f => fields.detailed.push(f.field));
      });
    }
    const arcBaseUrl = 'https://services1.arcgis.com/WAUuvHqqP3le2PMh/ArcGIS/rest/services/Newark_Parcels_with_Ownership/FeatureServer/0/query?';
    const arcQuery = queryType === 'XY' ? `geometry={"x":${queryValue[0]},"y":${queryValue[1]},"spatialReference":{"wkid" : 4326}}` : `where="${queryType}"='${queryValue}'`;
    const arcParams = `&outFields=${fields[outFields].join(',')}&${arcQuery}&returnGeometry=${String(outFields === 'geometry')}&resultRecordCount=1&f=geojson`;

    return this.http.get<ArcGeoJSONPropResponse>(
      `${arcBaseUrl}${arcParams}`
    );
  }
  getLayerInfo(layer: Layer): Observable<ArcGISItemInfo> {
    const url: string = (layer.getSource() as VectorSource).getUrl()!.toString();
    const urlBase = url.substr(0, url.search('/query?'));

    return this.http.get<ArcGISItemInfo>(`${urlBase}?f=json`)
      .pipe(
        map((r: ArcGISItemInfo) => r),
      );
  }
  getInitLayerData(): Observable<Array<LayerDetail>> {
    return this.http.get<Array<LayerDetailOptions>>('assets/data/initLayers.json')
    .pipe(
      map((r: Array<LayerDetailOptions>) => r.map(l => new LayerDetail(l, this.getLayerAttributions(l.className))))
    );
  }
  getLayerAttributions(className: string): Array<string> {
    switch (className) {
        case 'Census_Tracts': return ['<a href="https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_Current/MapServer/8">US Census TIGER: Census Tracts</a>'];
        case 'Zipcodes': return ['<a href="https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_Current/MapServer/2">US Census TIGER: 2010 Zip Code Tabulation Areas</a>'];
        case 'Historic_Districts': return ['<a href="https://data-newgin.opendata.arcgis.com/datasets/NewGIN::newark-historic-districts">NewGIN: Newark Historic Districts</a>'];
        case 'Redevelopment_Plans': return ['<a href="https://data-newgin.opendata.arcgis.com/datasets/NewGIN::newark-redevelopment-plan-areas">NewGIN: Newark Redevelopment Plan Areas</a>'];
        case 'Opportunity_Zones': return ['<a href="https://data-newgin.opendata.arcgis.com/datasets/NewGIN::newark-opportunity-zones">NewGIN: Newark Opportunity Zones</a>'];
        case 'Urban_Enterprise_Zone': return ['<a href="https://data-newgin.opendata.arcgis.com/datasets/NewGIN::newark-urban-enterprise-zone">NewGIN: Newark Urban Enterprise Zone</a>'];
        case 'Neighborhoods': return ['<a href="https://data-newgin.opendata.arcgis.com/datasets/NewGIN::newark-neighborhoods">NewGIN: Newark Neighborhoods</a>'];
        case 'Wards': return ['<a href="https://data-newgin.opendata.arcgis.com/datasets/NewGIN::newark-wards">NewGIN: Newark Wards</a>'];
        case 'Parcels': return ['<a href="https://njgin.nj.gov/">NJ GIN</a>', 'City of Newark Office of Planning & Zoning'];
        default: return [''];
    }
  }
  getLayerInfoOld(className: string): { name: string; description: string; source: Array<string> } {
    const infoText: { [key: string]: Array<string> } = {
        'Census_Tracts': ['Newark Census Tracts', 'City of Newark Census Tracts, as delineated by the 2020 release of US Census TIGER Boundaries'],
        'Neighborhoods': ['Newark Neighborhoods', 'City of Newark Neighborhods, as used by Newark Planning & Zoning Office and codified in the 2015 Zoning and Land Use Regulations.'],
        'Zipcodes': ['Newark 2010 Zipcodes', 'City of Newark Zipcodes Tabulation Areas, as delineated by the 2010 release of US Census TIGER Boundaries'],
        'Wards': ['Newark Wards', 'City of Newark Ward Boundaries as delineated in 2012, the last census redistricting. Boundaries drawn to reflect similar similar population totals amongst the five wards.'],
        'Parcels': ['Newark Parcels', "City of Newark Parcel boundaries, current as of the December 2018 release from the Tax Assessors' office. Incorporates information from State MODIV tax data"],
        'Historic_Districts': ['Newark Historic Districts'],
        'Redevelopment_Plans': ['Major Redevelopment Plan Areas'],
        'Opportunity_Zones': ['Newark Opportunity Zones'],
        'Urban_Enterprise_Zone': ['Newark Urban Enterprise Zone']
    };

    return {
        name: infoText[className][0] || `Newark ${className.replace(/[_-]/g,' ')}`,
        description: infoText[className][1] || '',
        source: this.getLayerAttributions(className)
    };
}
}
