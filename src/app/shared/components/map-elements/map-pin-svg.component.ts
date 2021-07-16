import { Component, Input } from '@angular/core';

@Component({
  selector: 'map-svg-pin',
  template: `
<svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 30 50">
    <path stroke="grey" [attr.fill]="fillColor" d="M2.11,21.61A14.31,14.31,0,0,1,.5,15a14.5,14.5,0,0,1,29,0,14.35,14.35,0,0,1-1.6,6.6L15,48.83Z"/>
    <circle fill="grey" cx="15" cy="14" r="5"/>
</svg>
  `,
  styles: []
})
export class SvgPinComponent {
  @Input() fillColor = 'rgb(255, 0, 0)';
}
