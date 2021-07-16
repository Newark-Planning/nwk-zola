import { LayerDetailOptions, MapConstants, StyleOptions } from "../models";

export class LayerDetail {
    className: string;
    group: MapConstants['groups'];
    zIndex: number;
    visible: boolean;
    styles:  Array<StyleOptions>;
    declutter: boolean;
    opacity: number;
    maxResolution: number | undefined;
    minResolution: number | undefined;
    layerType: {type: 'ArcGISVector' | 'LocalVector' | 'TileLayer' | 'VectorTileLayer'; geometryType: 'multipolygon' | 'polygon' | 'line' | 'point' | 'featurecollection' | 'none'};
    source: {type: 'XYZ' | 'LocalVector' | 'ArcGISVector'| 'ArcGISVectorTileLayer'; url: string;};
    attributions: Array<string>;
    constructor(
        options: LayerDetailOptions,
        attributions: Array<string>
        ) {
        this.className = options.className;
        this.group = options.group;
        this.zIndex = options.zIndex;
        this.visible = options.visible || false;
        this.styles = options.styles || [];
        this.declutter = options.declutter || false;
        this.opacity = options.opacity || 1;
        this.layerType = options.layerType;
        this.maxResolution = options.maxResolution;
        this.minResolution = options.minResolution;
        this.source = {
          type: options.source.type,
          url: options.source.url
        };
        this.attributions = attributions || [''];
    }
}
