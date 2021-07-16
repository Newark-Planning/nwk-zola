import { Component, ChangeDetectionStrategy, Input, ElementRef, OnChanges, SimpleChanges } from '@angular/core';
import Map from 'ol/Map';
import 'ol/ol.css';
import Draw, { DrawEvent } from 'ol/interaction/Draw';
import Overlay from 'ol/Overlay';
import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style';
import {LineString, Polygon} from 'ol/geom';
import {Vector as VectorSource} from 'ol/source';
import {Vector as VectorLayer} from 'ol/layer';
import {getArea, getLength} from 'ol/sphere';
import {unByKey} from 'ol/Observable';
import Feature from 'ol/Feature';
import MapBrowserEvent from 'ol/MapBrowserEvent';
import OverlayPositioning from 'ol/OverlayPositioning';
import { Coordinate } from 'ol/coordinate';
import GeometryType from 'ol/geom/GeometryType';
import { EventsKey } from 'ol/events';
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
  <button type="button" title="Measure Distance or Area" class='icon-button control-button' [ngClass]="drawing ? 'active' : ''" [matMenuTriggerFor]="measureMenu" aria-label="Ruler Icon, Open Measure Tool Menu">
    <mat-icon>design_services</mat-icon>
  </button>
  <button type="button" title="Close Measure Tool" *ngIf="drawing" class='icon-button measure-button close' (click)="endDraw()" aria-label="Ruler Icon, Open Measure Tool Menu">
    <mat-icon>close</mat-icon>
  </button>
  <mat-menu #measureMenu="matMenu">
    <p class="menuTitle">Measure Type</p>
    <button mat-menu-item type="button" title="Measure Distance" (click)="drawType = 'distance';launchDraw()">
      <mat-icon>moving</mat-icon>
      <span>Distance</span>
    </button>
    <button mat-menu-item type="button" title="Measure Area" (click)="drawType = 'area';launchDraw()">
      <mat-icon>highlight_alt</mat-icon>
      <span>Area</span>
    </button>
  </mat-menu>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapMeasureComponent implements OnChanges {
  @Input() map: Map = new Map({});
  draw: Draw = new Draw({type: GeometryType.LINE_STRING});
  source = new VectorSource();
  vector = new VectorLayer({
    source: this.source,
    style: new Style({
      fill: new Fill({
        color: 'rgba(255, 255, 255, 0.2)',
      }),
      stroke: new Stroke({
        color: '#ffcc33',
        width: 2,
      }),
      image: new CircleStyle({
        radius: 7,
        fill: new Fill({
          color: '#ffcc33',
        }),
      }),
    }),
  });
  sketch: Feature = new Feature();
  helpTooltipElement: HTMLElement | undefined;
  helpTooltip: Overlay = new Overlay({});
  measureTooltipElement: HTMLElement | undefined;
  measureTooltip: Overlay = new Overlay({});
  continuePolygonMsg = 'Click to continue drawing the polygon';
  continueLineMsg = 'Click to continue drawing the line';
  drawType: 'distance' | 'area' = 'distance';
  drawListener: EventsKey | undefined;
  drawing = false;
  constructor(private elementRef: ElementRef) {
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.hasOwnProperty('map')) {

    }
  }
  pointerMoveHandler(evt: MapBrowserEvent) {
    if (evt.dragging) {return;}
    let helpMsg = 'Click to start drawing';
    if (this.sketch) {
      const geom = this.sketch.getGeometry();
      if (geom instanceof Polygon) {
        helpMsg = this.continuePolygonMsg;
      } else if (geom instanceof LineString) {
        helpMsg = this.continueLineMsg;
      }
    }
    this.helpTooltipElement!.innerHTML = helpMsg;
    this.helpTooltip.setPosition(evt.coordinate);
    this.helpTooltipElement!.classList.remove('hidden');
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
    const output = Math.round(area * 10.7639).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' ' + 'ft<sup>2</sup>';

    return output;
  }

  launchDraw(): void {
    this.map.removeInteraction(this.draw);
    const type: GeometryType = this.drawType === 'area' ? GeometryType.POLYGON : GeometryType.LINE_STRING;
    this.draw = new Draw({
      source: this.source,
      stopClick: true,
      type: type,
      style: new Style({
        fill: new Fill({color: 'rgba(255, 255, 255, 0.4)'}),
        stroke: new Stroke({
          color: 'rgba(0, 0, 0, 0.5)',
          lineDash: [10, 10],
          width: 2
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
      }),
    });
    this.map.addInteraction(this.draw);
    this.drawing = true;

    this.createMeasureTooltip();
    this.createHelpTooltip();

    this.draw.on('drawstart', (evt: DrawEvent | MapBrowserEvent) => {
      this.sketch = (evt as DrawEvent).feature;
      let tooltipCoord: Coordinate | undefined = (evt as MapBrowserEvent).coordinate;

      this.drawListener = this.sketch.getGeometry()?.on('change', (evt) => {
        const geom = evt.target;
        let output = '';
        if (geom instanceof Polygon) {
          output = this.formatArea(geom);
          tooltipCoord = geom.getInteriorPoint().getCoordinates();
        } else if (geom instanceof LineString) {
          output = this.formatLength(geom);
          tooltipCoord = geom.getLastCoordinate();
        }
        this.measureTooltipElement!.innerHTML = output;
        this.measureTooltip.setPosition(tooltipCoord);
      });
    });

    this.draw.on('drawend', this.endDraw);
  }
  endDraw(): void {
    this.measureTooltipElement!.className = 'ol-tooltip ol-tooltip-static';
    this.measureTooltip.setOffset([0, -7]);
    // unset sketch
    this.sketch.dispose();
    // unset tooltip so that a new one can be created
    this.measureTooltipElement!.remove();
    this.createMeasureTooltip();
    unByKey(this.drawListener!);
    this.drawing = false;
    this.map.removeInteraction(this.draw);
  }
  /**
   * Creates a new help tooltip
   */
  createHelpTooltip() {
    if (this.helpTooltipElement) {
      this.helpTooltipElement.remove();
    }
    this.helpTooltipElement = document.createElement('div');
    this.helpTooltipElement.className = 'ol-tooltip hidden';
    this.helpTooltip = new Overlay({
      element: this.helpTooltipElement,
      offset: [15, 0],
      positioning: OverlayPositioning.BOTTOM_CENTER
    });
    this.map.addOverlay(this.helpTooltip);
  }

  /**
   * Creates a new measure tooltip
   */
  createMeasureTooltip() {
    if (this.measureTooltipElement) {
      this.measureTooltipElement.remove();
    }
    this.measureTooltipElement = document.createElement('div');
    this.measureTooltipElement.className = 'ol-tooltip ol-tooltip-measure';
    this.measureTooltip = new Overlay({
      element: this.measureTooltipElement,
      offset: [0, -15],
      positioning: OverlayPositioning.BOTTOM_CENTER
    });
    this.map.addOverlay(this.measureTooltip);
  }
}
