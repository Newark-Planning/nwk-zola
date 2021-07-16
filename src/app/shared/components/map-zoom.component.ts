import { Component, ChangeDetectionStrategy, Input, ElementRef, OnChanges, SimpleChanges } from '@angular/core';
import Map from 'ol/Map';
import { Zoom } from 'ol/control';

@Component({
  selector: 'map-zoom',
  styles: [`
  :host {
    display: flex;
    top: 0.55em;
    left: 1.35em;
    position: absolute;
    font-size: 1em;
  }
  `],
  template: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapZoomComponent implements OnChanges {
  @Input() map: Map = new Map({});
  control: Zoom;
  ZoomInLabel: HTMLElement;
  ZoomOutLabel: HTMLElement;

  constructor(private elementRef: ElementRef) {
    this.ZoomInLabel = document.createElement('span');
    this.ZoomOutLabel = document.createElement('span');
    this.ZoomInLabel.innerHTML = 'zoom_in';
    this.ZoomOutLabel.innerHTML = 'zoom_out';
    this.ZoomInLabel.classList.add('material-icons');
    this.ZoomOutLabel.classList.add('material-icons');
    this.control = new Zoom({
      zoomInLabel: this.ZoomInLabel,
      zoomOutLabel: this.ZoomOutLabel,
      zoomInTipLabel: 'Zoom In',
      zoomOutTipLabel: 'Zoom Out',
      target: this.elementRef.nativeElement
    });
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.hasOwnProperty('map')) {
      this.map.addControl(this.control);
      (this.elementRef.nativeElement as HTMLElement).querySelectorAll('button')!.forEach(b => b.className = 'icon-button control-button');
    }
  }
}
