import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ArcGeoJSONPropResponse, ArcGeoJSONResponse, ArcPropResponse, SearchFeature, SearchResult } from '../models';

@Injectable({
  providedIn: 'root'
})
export class JsonDataService {

    constructor(readonly http: HttpClient) { }
    getPropInfo(queryType: 'LOT_BLOCK_LOT' | 'PROPLOC' | 'XY', queryValue: string | [number, number], outFields?: []): Observable<ArcGeoJSONPropResponse> {
      const defaultFields = [ 'LOT_BLOCK_LOT', 'MOD4_BLOCK_LOT', 'PROPLOC', 'ADDLOTS', 'ZONING', 'RDV_PLAN', 'RDV_CODE', 'HIST_DIST', 'HIST_PROP', 'OPPO_ZONE', 'IN_UEZ' ];
      const arcBaseUrl = 'https://services1.arcgis.com/WAUuvHqqP3le2PMh/ArcGIS/rest/services/Newark_Parcels_with_Ownership/FeatureServer/0/query?';
      const arcQuery = queryType === 'XY' ? `geometry={"x":${queryValue[0]},"y":${queryValue[1]},"spatialReference":{"wkid" : 4326}}` : `where="${queryType}"='${queryValue}'`;
      const arcParams = `&outFields=${outFields ? outFields : defaultFields}&${arcQuery}&returnGeometry=false&resultRecordCount=1&f=geojson`;

      return this.http.get<ArcGeoJSONPropResponse>(
        `${arcBaseUrl}${arcParams}`
      );
    }
    getSearchOptions(input = '', type: 'BLOCK_LOT' | 'ADDR_STREET' | 'ADDR_LEGAL'= 'ADDR_STREET'): Observable<ArcGeoJSONResponse> {
        const fields = 'ADDR_STREET,ADDR_LEGAL,BLOCK_LOT,POINT_X,POINT_Y';
        const arcBaseUrl = 'https://services1.arcgis.com/WAUuvHqqP3le2PMh/ArcGIS/rest/services/Newark_Addresses_with_Parcel_Info/FeatureServer/0/query?';
        const arcParams = `&outFields=${fields}&where="${type}" like '${input}%'&resultRecordCount=5&f=geojson`;

        return this.http.get<ArcGeoJSONResponse>(
          `${arcBaseUrl}${arcParams}`
        );
        }
}
