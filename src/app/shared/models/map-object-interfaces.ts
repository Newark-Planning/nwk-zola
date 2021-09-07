interface IObject {
  [key: string]: string | number | undefined;
}
export interface SearchFeature {
  _id: {
    $oid: string;
  };
  Address: string;
  X: number;
  Y: number;
  BlockLot: string;
  PropLoc: string;
}
export interface ArcAddressPt {
  attributes: {
    ADDR_STREET: string;
    ADDR_LEGAL: string;
    BLOCK_LOT: string;
    POINT_X: number;
    POINT_Y: number;
  };
}
export interface SearchResult {
  type: 'FeatureCollection';
  properties: {
    exceededTransferLimit: boolean;
  };
  features: Array<SearchFeature>;
}
export interface ArcFeature {
  attributes: {
    PROPLOC: string;
    MOD4_BLOCK_LOT: string;
    ADDLOTS?: string;
    ZONING?: string;
    PROPCLASS?: string;
    BUILDDESC?: string;
    RDV_PLAN?: string;
    RDV_CODE?: string;
    HIST_DIST?: string;
    HIST_PROP?: string;
    IN_UEZ?: number;
    OPPO_ZONE?: string;
    LANDVALUE?: number;
    IMPRVALUE?: number;
    CITYWARD?: string;
    ACREAGE?: number;
    LSTYRTAX?: number;
  };
  centroid: { x: number; y: number; };
}
export interface ArcPropInfo extends IObject {
  MAPID?: string;
  BLOCK?: string;
  LOT?: string;
  QCODE?: string;
  AREA?: number;
  PERIMETER?: number;
  EASTING?: number;
  NORTHING?: number;
  LOT_BLOCK_LOT: string;
  LOT_PAMS_PIN?: string;
  MOD4_BLOCKNO?: number;
  MOD4_LOTNO?: number;
  MOD4_QUALNO?: string;
  MOD4_LASTUPDATE?: string;
  PROPLOC: string;
  PROPCLASS?: string;
  LANDDESC?: string;
  ACREAGE?: number;
  ADDLOTS?: string;
  ZONING?: string;
  TAXMAP?: number;
  BUILDDESC?: string;
  OWNERSNAME?: string;
  OWNERADD1?: string;
  OWNERADD2?: string;
  ZIPCODE?: number;
  NUMOWNERS?: number;
  NUMVETDEDS?: number;
  NUMWIDDEDS?: number;
  NUMSENDEDS?: number;
  NUMSURDEDS?: number;
  NUMDISDEDS?: number;
  NUMTOTDEDS?: number;
  DEDTOTAMT?: number;
  DEDUCTIONS?: string;
  TAXACCT?: string;
  BANKCODE?: number;
  MORTACCT?: string;
  DEEDBOOK?: string;
  DEEDPAGE?: number;
  SALESDATE?: string;
  SALESPRICE?: number;
  PRICECODE?: string;
  NUCODE1?: number;
  ASMNTCODE?: string;
  LANDVALUE?: number;
  IMPRVALUE?: number;
  NETVALUE?: number;
  EXMTCODE?: string;
  EXMTAMT?: number;
  EXMTAMT2?: number;
  EXMTTOT?: number;
  SPTAXCODE?: string;
  LSTYRTAX?: number;
  TENREBYR?: number;
  TENREBTAX?: number;
  EPLPART1?: number;
  EPLPART2?: number;
  EPLPART3?: number;
  INITFILING?: string;
  FURTHFILING?: string;
  STATUTE?: string;
  FACILITY?: string;
  SPECTAXDIST?: string;
  CITYWARD?: string;
  CLASS4TYPE?: string;
  OLDBLOCKNO?: string;
  OLDLOTNO?: string;
  OLDQUALCODE?: string;
  MOD4_BLOCK_LOT?: string;
  MOD4_PAMS_PIN?: string;
  OPPO_ZONE?: string;
  IN_UEZ?: number;
  HIST_DIST?: string;
  HIST_PROP?: string;
  RDV_PLAN?: string;
  RDV_CODE?: string;
  Shape__Area?: number;
  Shape__Length?: number;
}
export interface ArcPropResponse {
  objectIdFieldName: 'FID' | string;
  uniqueIdField: { name: 'FID' | string; isSystemMaintained: boolean; };
  globalIdFieldName: any;
  geometryType: 'esriGeometryPolygon';
  spatialReference: { wkid: 102100 | number; latestWkid: 3857 | number; };
  fields: Array<{
    name: string;
    type: 'esriFieldTypeDouble',
    alias: string;
    sqlType: string;
    domain: any;
    defaultValue: any;
  }>;
  features: Array<ArcFeature>;
}
export interface ArcJSONResponse {
  objectIdFieldName: 'FID' | string;
  uniqueIdField: { name: 'FID' | string; isSystemMaintained: boolean; };
  globalIdFieldName: any;
  geometryType: string;
  spatialReference: { wkid: 102100 | number; latestWkid: 3857 | number; };
  fields: Array<{
    name: string;
    type: string,
    alias: string;
    sqlType: string;
    domain: any;
    defaultValue: any;
  }>;
  features: Array<ArcAddressPt>;
}
export interface ArcGeoJSONResponse {
  features: Array<{
    geometry: any;
    properties: ArcAddressPt['attributes'];
    type: string;
  }>;
  type: string;
}
export interface ArcGeoJSONPropResponse {
  features: Array<{
    geometry: any;
    properties: ArcPropInfo;
    type: string;
  }>;
  type: string;
}
export interface LayerInfoPaneContent {
  TYPE: string;
  NAME: string;
  DESCRIPTION: string;
  IMGSRC?: string;
  USES?: Array<FirebaseZoneUse>;
  BUILDING_TYPES?: Array<string>;
  TABLE?: ArcPropInfo;
  NOTES?: string;
}
export interface FirebaseZoneUse {
  USE: string;
  USE_TYPE: 'Principal' | 'Accessory';
  ALLOWANCE: 'P' | 'C' | string;
  NOTES?: string;
}
export interface PlanDetails {
  ID: string;
  PLAN: string;
  DATE: string;
  DOCUMENTS: Array<{ name: string; link: string }>;
  WARDS: Array<string>;
  DESCRIPTION: string;
}
