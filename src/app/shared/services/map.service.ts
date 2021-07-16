import { Injectable } from '@angular/core';
import { Attribution, defaults as defaultControls, Zoom } from 'ol/control';
import {
  defaults as defaultInteractions, DragPan
} from 'ol/interaction';
import Map from 'ol/Map';
import View from 'ol/View';
import { fromLonLat } from 'ol/proj';
import { MapLayerService } from './maplayer.service';
/**
 * Service to generate map and set up layers
 * @method initMap() Instantiate new map instance
 */
@Injectable({ providedIn: 'root' })
export class MapService {
  constructor(
    readonly layerService: MapLayerService
  ) {}
  /**
 * Instantiate new map instance
 * @param targetEl Target element for map to initialize into
 */
  initMap(targetEl: any): Map {
    return new Map({
      layers: [],
      overlays: [],
      interactions: defaultInteractions({ pinchRotate: false })
        .extend(
          // tslint:disable-next-line: no-string-literal
          [new DragPan({ condition: e => (e.originalEvent['which'] === 2) })]
        ),
      controls: [
        new Attribution()
      ],
      target: targetEl,
      view: new View({
        center: fromLonLat([-74.1723667, 40.735657]),
        zoom: 2,
        enableRotation: false,
        constrainResolution: true,
        resolutions: [
          76.43702828507324, 38.21851414253662, 19.10925707126831,
          9.554628535634155, 4.77731426794937, 2.388657133974685,
          1.1943285668550503, 0.5971642835598172, 0.29858214164761665
        ]
      })
    });
  }
}
