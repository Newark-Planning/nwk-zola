import { Injectable } from '@angular/core';
import { XYZ } from 'ol/source';
import LayerGroup from 'ol/layer/Group';
/**
 * Service to provide functionality to custom map controls
 * @method setBasemapLayer() Set Basemap Source
 **/
@Injectable({ providedIn: 'root' })
export class MapControlsService {
  constructor() {}
  /**
 * Set basemap
 * @param basemap Name of basemap to set as current basemap
 */
  setBasemapLayer(basemap: 'base' | 'satellite', basemapGroup: LayerGroup): void {
    const cartoBaseUrl = (name: 'nolabels' | 'only_labels') => `https://{a-d}.basemaps.cartocdn.com/rastertiles/voyager_${name}/{z}/{x}/{y}.png`;
    const gglBaseUrl = (name: 'basemap' | 'labels') => `https://mt{1-3}.google.com/vt/lyrs=${name === 'labels' ? 'h' : 's'}&hl=en&x={x}&y={y}&z={z}`;
    const info = {
      satellite: [gglBaseUrl('basemap'), gglBaseUrl('labels'), '<span>Imagery ©2020 Bluesky, Maxar Technologies, Sanborn, USDA Farm Service Agency, <a href="https://www.google.com/permissions/geoguidelines/attr-guide/">Google Streets & Satellite 2020</a></span>'],
      base: [cartoBaseUrl('nolabels'), cartoBaseUrl('only_labels'), '<span><a href="http://www.openstreetmap.org/copyright">© OpenStreetMap</a> contributors, <a href="https://carto.com/attribution">© CARTO</a></span>']
    };
    (basemapGroup.getLayersArray()[0]
      .getSource() as XYZ)
      .setUrl(info[basemap][0]);
      basemapGroup.getLayersArray()[0]
      .getSource()
      .setAttributions(info[basemap][2]);
    (basemapGroup.getLayersArray()[1]
      .getSource() as XYZ)
      .setUrl(info[basemap][1]);
    console.info('Basemap layers set to '+ basemap)
  }
}
