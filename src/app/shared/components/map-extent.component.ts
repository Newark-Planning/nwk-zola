import { Component, ChangeDetectionStrategy, Input, ElementRef, OnChanges, SimpleChanges } from '@angular/core';
import Map from 'ol/Map';
import { ZoomToExtent } from 'ol/control';
import { fromLonLat } from 'ol/proj';

@Component({
  selector: 'map-extent',
  styles: [`
  :host {
    display: flex;
    top: 4.3em;
    left: 1.35em;
    position: absolute;
    font-size: 1em;
  }
  `],
  template: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapExtentComponent implements OnChanges {
  @Input() map: Map = new Map({});
  control: ZoomToExtent;
  label: HTMLElement;

  constructor(private elementRef: ElementRef) {
    this.label = document.createElement('span');
    this.label.innerHTML = 'home';
    this.label.classList.add('material-icons');
    this.control = new ZoomToExtent({
      className: 'zoom-extent-control',
      label: this.label,
      target: this.elementRef.nativeElement,
      tipLabel: 'Reset View',
      extent: [
        fromLonLat([-74.0617852, 40.6733126])[0],
        fromLonLat([-74.0617852, 40.6733126])[1],
        fromLonLat([-74.2853199, 40.7910592])[0],
        fromLonLat([-74.2853199, 40.7910592])[1]
      ]
    });
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.hasOwnProperty('map')) {
      this.map.addControl(this.control);
      (this.elementRef.nativeElement as HTMLElement).querySelector('button')!.className = 'icon-button control-button';
    }
  }
}
