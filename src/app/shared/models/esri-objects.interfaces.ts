export enum ArcGISSymbolType {
  PictureFillSymbols = 'esriPFS',
  PictureMarkerSymbol = 'esriPMS',
  SimpleFillSymbol = 'esriSFS',
  SimpleLineSymbol = 'esriSLS',
  SimpleMarkerSymbol = 'esriSMS',
  TextSymbol = 'esriTS'
}
export enum ArcGISSimpleFillSymbolType {
  BackwardDiagonal = 'esriSFSBackwardDiagonal',
  Cross = 'esriSFSCross',
  DiagonalCross = 'esriSFSDiagonalCross',
  ForwardDiagonal = 'esriSFSForwardDiagonal',
  Horizontal = 'esriSFSHorizontal',
  Null = 'esriSFSNull',
  Solid = 'esriSFSSolid',
  Vertical = 'esriSFSVertical'
}
export enum ArcGISSimpleLineSymbolType {
  Dash = 'esriSLSDash',
  DashDot = 'esriSLSDashDot',
  DashDotDot = 'esriSLSDashDotDot',
  Dot = 'esriSLSDot',
  LongDash = 'esriSLSLongDash',
  LongDashDot = 'esriSLSLongDashDot',
  Null = 'esriSLSNull',
  ShortDash = 'esriSLSShortDash',
  ShortDashDot = 'esriSLSShortDashDot',
  ShortDashDotDot = 'esriSLSShortDashDotDot',
  ShortDot = 'esriSLSShortDot',
  Solid = 'esriSLSSolid'
}
export interface ArcGISSimpleLineSymbol {
  type: ArcGISSymbolType.SimpleLineSymbol;
  style: ArcGISSimpleLineSymbolType;
  color: [number,number,number,number?];
  width: number;
}
export interface ArcGISSimpleFillSymbol {
  type: ArcGISSymbolType.SimpleFillSymbol;
  style: ArcGISSimpleFillSymbolType;
  color: [number,number,number,number?];
  outline: ArcGISSimpleLineSymbol
}
export interface ArcGISPictureMarkerSymbol {
  type: ArcGISSymbolType.PictureMarkerSymbol;
  url: string;
  imageData: string;
  contentType: 'image/png' | string;
  width: number;
  height: number;
  angle: number;
  xoffset: number;
  yoffset: number;
}
export interface ArcGISSimpleMarkerSymbol {
  type: ArcGISSymbolType.SimpleMarkerSymbol;
  style: 'esriSMSCircle' | 'esriSMSCross' | 'esriSMSDiamond' | 'esriSMSSquare' | 'esriSMSTriangle' | 'esriSMSX';
  color: [number,number,number,number?];
  size: number;
  angle: number;
  xoffset: number;
  yoffset: number;
  outline: { color: [number,number,number,number?]; width: number; }
}
export interface ArcGISTextSymbol {
  type: ArcGISSymbolType.TextSymbol;
  color:[number,number,number,number?];
  backgroundColor: [number,number,number,number?];
  borderLineSize: number;
  borderLineColor: [number,number,number,number?];
  haloSize: number;
  haloColor: [number,number,number,number?];
  verticalAlignment: 'baseline'|'bottom'|'middle'|'top';
  horizontalAlignment: 'center'|'justify'|'left'|'right';
  rightToLeft: boolean;
  angle: number;
  xoffset: number;
  yoffset: number;
  kerning: boolean;
  font: {family: string; size: number; style: string; weight: string; decoration: string;};
}
export interface ArcGISSimpleRenderer {
  type: 'simple';
  symbol: ArcGISSimpleFillSymbol | ArcGISSimpleLineSymbol | ArcGISPictureMarkerSymbol | ArcGISSimpleMarkerSymbol | ArcGISTextSymbol;
}
export interface ArcGISUniqueValueRenderer {
  type: 'uniqueValue';
  field1: string;
  field2: string;
  field3: string;
  fieldDelimiter: string;
  defaultSymbol: ArcGISSimpleFillSymbol | ArcGISSimpleLineSymbol | ArcGISPictureMarkerSymbol | ArcGISSimpleMarkerSymbol | ArcGISTextSymbol;
  defaultLabel: string;
  uniqueValueInfos: Array<{
    symbol: ArcGISSimpleFillSymbol | ArcGISSimpleLineSymbol | ArcGISPictureMarkerSymbol | ArcGISSimpleMarkerSymbol | ArcGISTextSymbol;
    value: string;
    label: string;
  }>;
};
//https://developers.arcgis.com/web-map-specification/objects/labelingInfo/
export interface ArcGISLabellingInfo {
  where?: string;
  labelExpression: string;
  labelExpressionInfo: { expression?: string; title?: string; value: string; };
  fieldInfos: Array<{ fieldName: string; format: { places: number; digitSeparator: boolean; dateFormat?: string;} }>;
  useCodedValues: boolean;
  maxScale: number;
  minScale: number;
  labelPlacement: string;
  symbol: ArcGISTextSymbol
}
//https://developers.arcgis.com/web-map-specification/objects/drawingInfo/
export interface ArcGISDrawingInfo {
    renderer: ArcGISSimpleRenderer | ArcGISUniqueValueRenderer;
    scaleSymbols: boolean;
    showLabels: boolean;
    transparency: number;
    labelingInfo: ArcGISLabellingInfo;
}
export interface ArcGISItemInfo {
  id: number;
  name: string;
  type: string;
  serviceItemId: string;
  displayField: string;
  description: string;
  copyrightText: string;
  defaultVisibility: boolean;
  editingInfo: { lastEditDate: number; },
  geometryProperties: { shapeAreaFieldName: string; shapeLengthFieldName: string; units: string; };
  geometryType: string;
  minScale: number;
  maxScale: number;
  extent: {
    xmin: number;
    ymin: number;
    xmax: number;
    ymax: number;
    spatialReference: {
      wkid: number;
      latestWkid: number;
    };
  };
  drawingInfo: ArcGISDrawingInfo;
  hasAttachments: boolean;
  htmlPopupType: string;
  hasMetadata: boolean;
  hasM: boolean;
  hasZ: boolean;
  objectIdField: string;
  uniqueIdField: { name: string; isSystemMaintained: boolean; };
  fields: Array<{
    name: string;
    type: string;
    alias: string;
    sqlType: string;
    length?: number;
    nullable: boolean;
    editable: boolean;
    domain: any;
    defaultValue: any;
  }>;
}
