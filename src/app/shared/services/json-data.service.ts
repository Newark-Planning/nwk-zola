import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ArcGeoJSONPropResponse, ArcGeoJSONResponse, ArcPropResponse, SearchFeature, SearchResult } from '../models';

@Injectable()
export class JsonDataService {

    constructor(readonly http: HttpClient) { }

    async getAddressPt(input: string, field = 'STREET_ADD'): Promise<Array<SearchFeature>> {
        const baseUrl = 'https://services1.arcgis.com/WAUuvHqqP3le2PMh/ArcGIS/rest/services/addrsspointwblklotzoning/FeatureServer/0';

        return this.http.get<SearchResult>(
            `${baseUrl}/query?f=geojson&where=${field} LIKE '%${input}%'&returnGeometry=true&outFields=STREET_ADD,BLOCK_LOT&resultRecordCount=5`
            )
            .toPromise()
            .then(res => res!.features);
    }
    getPropByBlockLot(API_WHERE_BLOCK: string, API_WHERE_LOT: string): Observable<ArcPropResponse> {
        const arcBaseUrl = 'https://services1.arcgis.com/WAUuvHqqP3le2PMh/ArcGIS/rest/services/2017_zoning_layer/FeatureServer/0/query?';
        const arcQuery = `where="BLOCK_LOT"='${API_WHERE_BLOCK}-${API_WHERE_LOT}'`;
        const returnFields = ['AREA', 'ADDLOTS', 'BLOCK_LOT', 'PROPLOC', 'BUILDDESC', 'PROPCLASS', 'LANDVALUE', 'IMPRVALUE', 'REDEV_AREA', 'HISTORIC', 'ZONING'];
        const arcParams = `&outFields=${returnFields.join(',')}&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Foot&returnGeodetic=false&returnGeometry=false&returnCentroid=true&featureEncoding=esriDefault&multipatchOption=none&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pjson`;

        return this.http.get<ArcPropResponse>(
          `${arcBaseUrl}${arcQuery}${arcParams}`
        )
        .pipe(resp => resp);
    }
    getInfoFromPoint(pointGeom: [number, number], type: 'Basic' | 'Expanded' = 'Basic'): Observable<ArcGeoJSONPropResponse> {
        const returnFields = (queryType: 'Basic' | 'Expanded'): string => {
            switch (queryType) {
                case 'Basic': return [
                    'PROPLOC',
                    'MOD4_BLOCK_LOT',
                    'ZONING',
                    'PROPCLASS',
                    'RDV_PLAN',
                    'HIST_DIST',
                    'HIST_PROP',
                    'IN_UEZ',
                    'OPPO_ZONE'
                ].join(',');
                default: return [
                    'PROPLOC',
                    'MOD4_BLOCK_LOT',
                    'ADDLOTS',
                    'CITYWARD',
                    'PROPCLASS',
                    'ZONING',
                    'BUILDDESC',
                    'ACREAGE',
                    'LANDVALUE',
                    'IMPRVALUE',
                    'LSTYRTAX',
                    'HIST_DIST',
                    'HIST_PROP',
                    'OPPO_ZONE',
                    'IN_UEZ',
                    'RDV_PLAN',
                    'RDV_CODE'
                ].join(',');
            }
        };
        const arcBaseUrl = 'https://services1.arcgis.com/WAUuvHqqP3le2PMh/ArcGIS/rest/services/Newark_Parcels/FeatureServer/0/query?';
        const arcParams = `&outFields=${returnFields(type)}&geometry={"x":${pointGeom[0]},"y":${pointGeom[1]},"spatialReference":{"wkid" : 4326}}&geometryType=esriGeometryPoint&returnGeometry=false&resultRecordCount=1&f=geojson`;

        return this.http.get<ArcGeoJSONPropResponse>(
          `${arcBaseUrl}${arcParams}`
        );
    }
    getInfoFromBL(blocklot: string, type: 'Basic' | 'Expanded' = 'Basic'): Observable<ArcGeoJSONPropResponse> {
        const returnFields = (queryType: 'Basic' | 'Expanded'): string => {
            switch (queryType) {
                case 'Basic': return [
                    'PROPLOC',
                    'MOD4_BLOCK_LOT',
                    'ZONING',
                    'PROPCLASS',
                    'RDV_PLAN',
                    'HIST_DIST',
                    'HIST_PROP',
                    'IN_UEZ',
                    'OPPO_ZONE'
                ].join(',');
                default: return [
                    'PROPLOC',
                    'MOD4_BLOCK_LOT',
                    'ADDLOTS',
                    'CITYWARD',
                    'PROPCLASS',
                    'ZONING',
                    'BUILDDESC',
                    'ACREAGE',
                    'LANDVALUE',
                    'IMPRVALUE',
                    'LSTYRTAX',
                    'HIST_DIST',
                    'HIST_PROP',
                    'OPPO_ZONE',
                    'IN_UEZ',
                    'RDV_PLAN',
                    'RDV_CODE'
                ].join(',');
            }
        };
        const arcBaseUrl = 'https://services1.arcgis.com/WAUuvHqqP3le2PMh/ArcGIS/rest/services/Newark_Parcels/FeatureServer/0/query?';
        const arcParams = `&outFields=${returnFields(type)}&where="MOD4_BLOCK_LOT"='${blocklot}'&returnGeometry=false&resultRecordCount=1&f=geojson`;

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
