import { AfterViewInit, Component, ElementRef, OnInit } from '@angular/core';
import Map from 'ol/Map';
import LayerGroup from 'ol/layer/Group';
import { MapControlsService, MapInfoService, MapLayerService } from '../shared';
import { MapService } from '../shared/services/map.service';
import {
  Circle as CircleStyle,
  Fill,
  RegularShape,
  Stroke,
  Style,
  Text,
} from 'ol/style';
import { Draw, Modify } from 'ol/interaction';
import { LineString, Point, Polygon } from 'ol/geom';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import { getArea, getLength } from 'ol/sphere';
import { FeatureLike } from 'ol/Feature';
import GeometryType from 'ol/geom/GeometryType';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styles: [
    `:host {
        position: relative;
        flex: 1 1 auto;
        min-width: 20rem;
        height: 100%;
    }
    div:active {cursor: grabbing;}
    .map {
        width: 100%;
        height: calc(100vh - 1.5rem);
    }`
  ]
})
export class TestComponent implements OnInit, AfterViewInit {
  instance: Map = new Map({});
  basemapGroup: LayerGroup = new LayerGroup;
  transitGroup: LayerGroup = new LayerGroup;
  showSegments = true;
  clearPrevious = true;
  typeSelect: GeometryType = GeometryType.POLYGON;
  style = new Style({
    fill: new Fill({
      color: 'rgba(255, 255, 255, 0.2)',
    }),
    stroke: new Stroke({
      color: 'rgba(0, 0, 0, 0.5)',
      lineDash: [10, 10],
      width: 2,
    }),
    image: new CircleStyle({
      radius: 5,
      stroke: new Stroke({
        color: 'rgba(0, 0, 0, 0.7)',
      }),
      fill: new Fill({
        color: 'rgba(255, 255, 255, 0.2)',
      }),
    }),
  });
  labelStyle = new Style({
    text: new Text({
      font: '14px Calibri,sans-serif',
      fill: new Fill({
        color: 'rgba(255, 255, 255, 1)',
      }),
      backgroundFill: new Fill({
        color: 'rgba(0, 0, 0, 0.7)',
      }),
      padding: [3, 3, 3, 3],
      textBaseline: 'bottom',
      offsetY: -15,
    }),
    image: new RegularShape({
      radius: 8,
      points: 3,
      angle: Math.PI,
      displacement: [0, 10],
      fill: new Fill({
        color: 'rgba(0, 0, 0, 0.7)',
      }),
    }),
  });
  tipStyle = new Style({
    text: new Text({
      font: '12px Calibri,sans-serif',
      fill: new Fill({
        color: 'rgba(255, 255, 255, 1)',
      }),
      backgroundFill: new Fill({
        color: 'rgba(0, 0, 0, 0.4)',
      }),
      padding: [2, 2, 2, 2],
      textAlign: 'left',
      offsetX: 15,
    }),
  });

  modifyStyle = new Style({
    image: new CircleStyle({
      radius: 5,
      stroke: new Stroke({
        color: 'rgba(0, 0, 0, 0.7)',
      }),
      fill: new Fill({
        color: 'rgba(0, 0, 0, 0.4)',
      }),
    }),
    text: new Text({
      text: 'Drag to modify',
      font: '12px Calibri,sans-serif',
      fill: new Fill({
        color: 'rgba(255, 255, 255, 1)',
      }),
      backgroundFill: new Fill({
        color: 'rgba(0, 0, 0, 0.7)',
      }),
      padding: [2, 2, 2, 2],
      textAlign: 'left',
      offsetX: 15,
    }),
  });

  segmentStyle = new Style({
    text: new Text({
      font: '12px Calibri,sans-serif',
      fill: new Fill({
        color: 'rgba(255, 255, 255, 1)',
      }),
      backgroundFill: new Fill({
        color: 'rgba(0, 0, 0, 0.4)',
      }),
      padding: [2, 2, 2, 2],
      textBaseline: 'bottom',
      offsetY: -12,
    }),
    image: new RegularShape({
      radius: 6,
      points: 3,
      angle: Math.PI,
      displacement: [0, 8],
      fill: new Fill({
        color: 'rgba(0, 0, 0, 0.4)',
      }),
    }),
  });
  source = new VectorSource();
  modify = new Modify({ source: this.source, style: this.modifyStyle });
  tipPoint: any;
  segmentStyles = [this.segmentStyle];
  vector = new VectorLayer({
    source: this.source,
    style: (feature) => {
      return this.styleFunction(feature, this.showSegments);
    }
  });
  draw: any;
  constructor(
    private readonly host: ElementRef,
    readonly mapService: MapService,
    readonly mapInfoService: MapInfoService,
    readonly mapLyrService: MapLayerService,
    readonly controls: MapControlsService
  ) {
  }
  ngOnInit(): void {
    this.instance = this.mapService.initMap('mapEl', { defaultControls: true });
    this.mapInfoService.getInitLayerData()
      .subscribe(r => { this.mapLyrService.initialLayerData = r; })
      .add(() => this.initLayers());
  }
  ngAfterViewInit(): void { setTimeout(() => { this.instance.updateSize(); }, 500); }
  initLayers(): void {
    const lgname = ['Basemap', 'Transit'];
    this.basemapGroup = this.mapLyrService.makeLayerGroup('Basemap');
    this.transitGroup = this.mapLyrService.makeLayerGroup('Transit', ['Commuter_Rail', 'Light_Rail']);
    [this.basemapGroup, this.transitGroup].forEach(
      (grp: LayerGroup, i: number) => {
        grp.set('className', lgname[i]);
        this.instance.addLayer(grp);
        console.log(this.instance);
      }
    );
    this.instance.getLayers().changed();
    this.controls.setBasemapLayer('base', this.basemapGroup);
    this.instance.updateSize();
    this.instance.addInteraction(this.modify);
  }

  formatLength(line: any): string {
    const length = getLength(line);
    let output;
    if (length > 100) {
      output = Math.round((length / 1000) * 100) / 100 + ' km';
    } else {
      output = Math.round(length * 100) / 100 + ' m';
    }
    return output;
  };

  formatArea(polygon: any): string {
    const area = getArea(polygon);
    let output;
    if (area > 10000) {
      output = Math.round((area / 1000000) * 100) / 100 + ' km\xB2';
    } else {
      output = Math.round(area * 100) / 100 + ' m\xB2';
    }
    return output;
  }

  styleFunction(feature: FeatureLike, segments: any, drawType?: string, tip?: any) {
    const styles = [this.style];
    const geometry = feature.getGeometry();
    const type = geometry!.getType();
    let point, label, line;
    if (!drawType || drawType === type) {
      if (type === 'Polygon') {
        point = (geometry as Polygon).getInteriorPoint();
        label = this.formatArea(geometry);
        line = new LineString((geometry as Polygon).getCoordinates()[0]);
      } else if (type === 'LineString') {
        point = new Point((geometry as LineString).getLastCoordinate());
        label = this.formatLength(geometry);
        line = geometry;
      }
    }
    if (segments && line) {
      let count = 0;
      (line as LineString).forEachSegment((a, b) => {
        const segment = new LineString([a, b]);
        const label = this.formatLength(segment);
        if (this.segmentStyles.length - 1 < count) {
          this.segmentStyles.push(this.segmentStyle.clone());
        }
        const segmentPoint = new Point(segment.getCoordinateAt(0.5));
        this.segmentStyles[count].setGeometry(segmentPoint);
        this.segmentStyles[count].getText().setText(label);
        styles.push(this.segmentStyles[count]);
        count++;
      });
    }
    if (label) {
      this.labelStyle.setGeometry(point as Point);
      this.labelStyle.getText().setText(label);
      styles.push(this.labelStyle);
    }
    if (
      tip &&
      type === 'Point' &&
      !this.modify.getOverlay().getSource().getFeatures().length
    ) {
      this.tipPoint = geometry;
      this.tipStyle.getText().setText(tip);
      styles.push(this.tipStyle);
    }
    return styles;
  }
  addInteraction(): void {
    const drawType = this.typeSelect;
    const activeTip =
      'Click to continue drawing the ' +
      (drawType === 'Polygon' ? 'polygon' : 'line');
    const idleTip = 'Click to start measuring';
    let tip = idleTip;
    this.draw = new Draw({
      source: this.source,
      type: drawType,
      style: (feature) => {
        return this.styleFunction(feature, this.showSegments, drawType, tip);
      },
    });
    this.draw.on('drawstart', () => {
      if (this.clearPrevious) {
        this.source.clear();
      }
      this.modify.setActive(false);
      tip = activeTip;
    });
    this.draw.on('drawend', () => {
      this.modifyStyle.setGeometry(this.tipPoint);
      this.modify.setActive(true);
      this.instance.once('pointermove', () => {
        this.modifyStyle.setGeometry('');
      });
      tip = idleTip;
    });
    this.modify.setActive(true);
    this.instance.addInteraction(this.draw);
  }

}
