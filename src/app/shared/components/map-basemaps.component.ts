import { Component, ChangeDetectionStrategy, Input, ElementRef, OnChanges, SimpleChanges, AfterViewInit } from '@angular/core';
import { Control } from 'ol/control';
import LayerGroup from 'ol/layer/Group';
import Map from 'ol/Map';
import 'ol/ol.css';
import { MapControlsService } from '../services/map-controls.service';
@Component({
  selector: 'map-basemaps',
  styles: [`
  :host {
    display: flex;
    top: 8.6em;
    left: 1.35em;
    font-size: 1rem !important;
    position: absolute;
    }
  `],
  template: `
  <button type="button" title="Set Basemap" class='icon-button control-button' [ngClass]="" [matMenuTriggerFor]="basemapMenu" aria-label="Ruler Icon, Open Measure Tool Menu">
    <mat-icon>map</mat-icon>
  </button>
  <mat-menu #basemapMenu="matMenu">
    <p class="menuTitle">Set Basemap</p>
    <button mat-menu-item type="button" title="Set to Default Basemap" (click)="setBasemap('base')">
      <mat-icon>public</mat-icon>
      <span>Base</span>
    </button>
    <button mat-menu-item type="button" title="Set to Satellite Basemap" (click)="setBasemap('satellite')">
      <mat-icon>satellite</mat-icon>
      <span>Satellite</span>
    </button>
  </mat-menu>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapBasemapsComponent implements OnChanges {
  @Input() map: Map = new Map({});
  control: Control;

  constructor(private elementRef: ElementRef, readonly controlService: MapControlsService) {
    this.control = new Control({
      element: this.elementRef.nativeElement
    });
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.hasOwnProperty('map')) {
      this.map.addControl(this.control);
    }
  }
  setBasemap(type: 'base' | 'satellite'): void {
    this.map.getLayers().forEach(l => {
      if (l.get('className') === 'Basemap') {
        this.controlService.setBasemapLayer(type, l as LayerGroup);
      }
    });
  }
}
