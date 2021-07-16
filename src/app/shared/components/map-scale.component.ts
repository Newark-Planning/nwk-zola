import { Component, ChangeDetectionStrategy, Input, ElementRef, OnChanges, SimpleChanges } from '@angular/core';
import Map from 'ol/Map';
import ControlScaleLine from 'ol/control/ScaleLine';

@Component({
  selector: 'map-scale',
  template: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapScaleComponent implements OnChanges {
  @Input() map: Map = new Map({});
  scaleControl: ControlScaleLine;

  constructor(private elementRef: ElementRef) {
    this.scaleControl = new ControlScaleLine({
      target: this.elementRef.nativeElement,
      units: 'us'
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.hasOwnProperty('map')) {
      this.map.addControl(this.scaleControl);
    }
  }
}
