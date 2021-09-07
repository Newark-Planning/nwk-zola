import { SafeResourceUrl } from "@angular/platform-browser";
export interface MapConstants {
  groups: 'Basemap' | 'Transit' | 'Parcels & Zoning' | 'Boundaries' | 'Economic Development' | 'Other Layers' | 'Hidden';
}
export interface StyleOptions {
  type: 'single'|'unique'|'ramp'|'special-zoning';
  keyField: string;
  defaultSymbol: {
    class: {value: string; rampKey?: string; rampBreak?: number; rampType?: '==='|'>='|'<='|'<'|'>'; description?: string;};
    fill?: [number, number, number, number?];
    image?: {src: string; color?: [number,number,number,number?], crossOrigin?: 'anonymous'; scale?: number; imgSize?: [number,number], anchor?: [number,number]};
    outline?: { type: 'normal'|'dashed'; color: [number, number, number, number?]; width?: number; }
  };
  symbolCategories?: Array<{
    class: {value: string; rampKey?: string; rampBreak?: string; rampType?: '==='|'>='|'<='|'<'|'>'; description?: string;};
    fill?: [number, number, number, number?];
    image?: {src: string; color?: [number,number,number,number?], crossOrigin?: 'anonymous'; scale?: number; imgSize?: [number,number], anchor?: [number,number]};
    outline?: { type: 'normal'|'dashed'; color: [number, number, number, number?]; width?: number; }
  }>;
  labels?: {
    textContent: string;
    fill?: [number, number, number, number?];
    outline?: {color: [number, number, number, number?]; width?: number;};
    minZoom?: number;
    maxZoom?: number;
    minResolution?: number;
    maxResolution?: number;
    fontSize?: number;
    textAlignment?: 'left'|'right'|'center';
    offsetXVal?: number;
    offsetYVal?: number;
    scaleVal?: number;
    placement?: 'point' | 'line';
  };
  zIndex?: number;
};
export interface LayerDetailOptions {
  className: string;
  group: MapConstants['groups'];
  zIndex: number;
  layerType: {type: 'ArcGISVector' | 'LocalVector' | 'TileLayer'; geometryType: 'multipolygon' | 'polygon' | 'line' | 'point' | 'featurecollection' | 'none'};
  source: {type: 'ArcGISVector' | 'XYZ' | 'LocalVector'; url: string};
  visible?: boolean;
  opacity?: number;
  styles?:  Array<StyleOptions>;
  declutter?: boolean;
  maxResolution?: number;
  minResolution?: number;
}
export interface LegendItem {
  key: string;
  type: 'multipolygon' | 'polygon' | 'line' | 'point' | 'featurecollection' | 'none';
  patch?: {fill: string; outline: string;}
  image?: {src: string; imgSize: [number,number]; svg?: SafeResourceUrl; color?: string};
  description?: string;
}
export interface ModalConfig {
  header?: string;
  message?: string;
  link?: string;
  tabIndex?: number;
  download?: {
      href: SafeResourceUrl;
      filename: string;
      text: string;
  };
  eventButtons?: Array<{ id: string; link: string; linkText: string; icon: string; styling?: string; }>;
}
export interface MapInput {
    hood: string;
    block?: string;
    lot?: string;
    proploc?: string;
    zoneColor?: string;
    labelStyle?: string;
}
export interface SearchItem {
  STREET_ADD: string;
  BLOCK_LOT: string;
  geometry: [number, number];
}
