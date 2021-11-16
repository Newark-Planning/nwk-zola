import { Component, ChangeDetectionStrategy, Input, OnChanges, SimpleChanges } from '@angular/core';
import Map from 'ol/Map';
import 'ol/ol.css';
import Draw from 'ol/interaction/Draw';
import {Circle as CircleStyle, Fill, RegularShape, Stroke, Style, Text} from 'ol/style';
import {LineString, Polygon, Point, Circle as CircleGeom} from 'ol/geom';
import {Vector as VectorSource} from 'ol/source';
import {Vector as VectorLayer} from 'ol/layer';
import {getArea, getLength} from 'ol/sphere';
import { FeatureLike } from 'ol/Feature';
import GeometryType from 'ol/geom/GeometryType';
import LayerGroup from 'ol/layer/Group';
import { Modify } from 'ol/interaction';
@Component({
  selector: 'map-measure',
  styles: [`:host {
    display: flex;
    top: 6.45em;
    left: 1.35em;
    position: absolute;
    font-size: 1em;
  }`],
  template: `
  <button type="button" title="Measure Distance, Radius, or Area" class='icon-button control-button' [ngClass]="drawing ? 'active' : ''" [matMenuTriggerFor]="measureMenu" aria-label="Ruler Icon, Open Measure Tool Menu">
    <mat-icon>design_services</mat-icon>
  </button>
  <button type="button" title="Close Measure Tool" *ngIf="drawing" class='icon-button control-button close' (click)="endInteraction()" aria-label="Close Icon, Exit Draw Mode">
    <mat-icon>close</mat-icon>
  </button>
  <mat-menu #measureMenu="matMenu">
    <p class="menuTitle">Measure Type</p>
    <button mat-menu-item type="button" title="Measure Distance" (click)="drawType = 'distance';addInteraction()">
      <mat-icon>moving</mat-icon>
      <span>Distance</span>
    </button>
    <button mat-menu-item type="button" title="Measure Area" (click)="drawType = 'area';addInteraction()">
      <mat-icon>highlight_alt</mat-icon>
      <span>Area</span>
    </button>
    <button mat-menu-item type="button" title="Measure Radius" (click)="drawType = 'radius';addInteraction()">
      <mat-icon>circle</mat-icon>
      <span>Radius</span>
    </button>
  </mat-menu>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapMeasureComponent implements OnChanges {
  @Input() instance: Map = new Map({});
  source = new VectorSource();
  drawInteraction: Draw;
  drawLayer = new VectorLayer({
    className: 'DrawLayer',
    source: this.source,
    style: (feature) => { return this.styleFunction(feature); }
  });
  drawType: 'distance' | 'area' | 'radius' = 'distance';
  drawing = false;
  geomType: {[key: string]: GeometryType} = {
    area: GeometryType.POLYGON,
    distance: GeometryType.LINE_STRING,
    radius: GeometryType.CIRCLE
  };
  style = new Style({
    fill: new Fill({color: 'rgba(255, 255, 255, 0.2)'}),
    stroke: new Stroke({color: 'rgba(0, 0, 0, 0.5)', lineDash: [10, 10], width: 2}),
    image: new CircleStyle({
      radius: 5,
      stroke: new Stroke({ color: 'rgba(0, 0, 0, 0.7)' }),
      fill: new Fill({ color: 'rgba(255, 255, 255, 0.2)' })
    })
  });
  labelStyle = new Style({
    text: new Text({
      font: '14px Segoe UI,Calibri,sans-serif',
      fill: new Fill({ color: 'rgba(255, 255, 255, 1)' }),
      backgroundFill: new Fill({ color: 'rgba(0, 0, 0, 0.7)' }),
      padding: [3, 3, 3, 3],
      textBaseline: 'bottom',
      offsetY: -15
    }),
    image: new RegularShape({
      radius: 8,
      points: 3,
      angle: Math.PI,
      displacement: [0, 10],
      fill: new Fill({ color: 'rgba(0, 0, 0, 0.7)' })
    })
  });
  tipStyle = new Style({
    text: new Text({
      font: '12px Segoe UI,Calibri, sans-serif',
      fill: new Fill({ color: 'rgba(255, 255, 255, 1)' }),
      backgroundFill: new Fill({ color: 'rgba(0, 0, 0, 0.4)' }),
      padding: [2, 2, 2, 2],
      textAlign: 'left',
      offsetX: 15
    })
  });
  modifyStyle = new Style({
    image: new CircleStyle({
      radius: 5,
      stroke: new Stroke({
        color: 'rgba(0, 0, 0, 0.7)',
      }),
      fill: new Fill({ color: 'rgba(0, 0, 0, 0.4)' })
    }),
    text: new Text({
      font: '12px Segoe UI,Calibri, sans-serif',
      fill: new Fill({ color: 'rgba(255, 255, 255, 1)' }),
      backgroundFill: new Fill({ color: 'rgba(0, 0, 0, 0.7)' }),
      padding: [2, 2, 2, 2],
      textAlign: 'left',
      offsetX: 15
    })
  });
  centroidStyle = new Style({
    image: new CircleStyle({
      radius: 5,
      stroke: new Stroke({
        color: 'rgba(0, 0, 0, 0.7)',
      }),
      fill: new Fill({ color: 'rgba(0, 0, 0, 0.4)' })
    })
  });
  segmentStyle = new Style({
    text: new Text({
      font: '12px Segoe UI,Calibri, sans-serif',
      fill: new Fill({ color: 'rgba(255, 255, 255, 1)' }),
      backgroundFill: new Fill({color: 'rgba(0, 0, 0, 0.4)'}),
      padding: [2, 2, 2, 2],
      textBaseline: 'bottom',
      offsetY: -12
    }),
    image: new RegularShape({
      radius: 6,
      points: 3,
      angle: Math.PI,
      displacement: [0, 8],
      fill: new Fill({ color: 'rgba(0, 0, 0, 0.4)' })
    })
  });
  modify = new Modify({ source: this.source, style: this.modifyStyle });
  tipPoint: any;
  segmentStyles = [this.segmentStyle];
  constructor() {
    this.drawInteraction = new Draw({type: this.geomType[this.drawType]});
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.hasOwnProperty('instance')) {
      this.instance.addInteraction(this.modify);
      this.instance.getLayers().forEach(l => {
        if (l.get('className') === 'Hidden') {
          (l as LayerGroup).getLayers().getArray().find(l => l.getClassName() === 'DrawLayer')
          ? (l as LayerGroup).getLayers().extend([this.drawLayer])
          : undefined;
        }
      });
    }
  }
  /**
   * Format length output.
   * @param {LineString} line The line.
   * @return {string} The formatted length.
   */
  formatLength(line: LineString): string {
    const length = getLength(line, {projection: ''});
    const output = Math.round(length * 3.28084).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' ' + 'ft';

    return output;
  }

  /**
   * Format area output.
   * @param {Polygon} polygon The polygon.
   * @return {string} Formatted area.
   */
  formatArea(polygon: Polygon): string {
    const area = getArea(polygon);
    const output = Math.round(area * 10.7639).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' ' + 'ft\xB2';

    return output;
  }
  /**
 * Format radius output.
 * @param {CircleGeom} circle The polygon.
 * @return {string} Formatted radius.
 */
  formatRadius(circle: CircleGeom): string {
    const radius = circle.getRadius();
    const area = Math.PI * Math.pow(radius,2);
    const output = `Radius: ${Math.round(radius * 3.28084).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ft\nArea: ${Math.round(area * 10.7639).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ft\xB2`;

    return output;
  }
  addInteraction(): void {
    const activeTip = this.drawType === 'radius'
    ? 'Click to finish drawing'
    : 'Click to continue drawing; double-click to finish';
    const idleTip = 'Click to start measuring';
    let tip = idleTip;
    this.drawing = true;
    this.drawInteraction = new Draw({
      source: this.source,
      type: this.geomType[this.drawType],
      stopClick: true,
      style: (feature) => {
        return this.styleFunction(feature, tip);
      }
    });
    this.drawInteraction.on('drawstart', () => {
      this.source.clear();
      this.modify.setActive(false);
      tip = activeTip;
    });
    this.drawInteraction.on('drawend', () => {
      this.modifyStyle.setGeometry(this.tipPoint);
      this.modifyStyle.getText().setText(idleTip);
      this.modify.setActive(true);
      this.instance.once('pointermove', () => {
        this.modifyStyle.setGeometry('');
      });
      tip = idleTip;
    });
    this.modify.setActive(true);
    this.instance.addInteraction(this.drawInteraction);
    this.drawLayer.setSource(this.source);
  }
  endInteraction(): void {
    this.modify.setActive(false);
    this.drawing = false;
    this.instance.removeInteraction(this.drawInteraction);
  }
  styleFunction(feature: FeatureLike, tip?: any): Style | Array<Style> {
    const styles = [this.style];
    const geometry = feature.getGeometry();
    const type = geometry!.getType();
    let point, label, line;
    if (geometry instanceof Polygon) {
      point = (geometry as Polygon).getInteriorPoint();
      label = this.formatArea(geometry);
      line = new LineString((geometry as Polygon).getCoordinates()[0]);
    } else if (geometry instanceof CircleGeom) {
      point = new Point(geometry.getCenter());
      this.centroidStyle.setGeometry(point);
      styles.push(this.centroidStyle);
      label = this.formatRadius(geometry);
      line = new LineString(geometry.getExtent());
    } else if (geometry instanceof LineString) {
      point = new Point((geometry as LineString).getLastCoordinate());
      label = this.formatLength(geometry);
      line = geometry;
    }
    if (line) {
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
}
