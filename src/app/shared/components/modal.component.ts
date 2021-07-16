import { Component, HostListener, Inject, TrackByFunction } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { ModalConfig } from '../models/';

@Component({
  selector: 'app-modal',
  // tslint:disable: component-max-inline-declarations template-use-track-by-function template-no-call-expression
  template: `
<h1 mat-dialog-title [innerHtml]="data.header"></h1>
<div mat-dialog-content *ngIf="data.message !== 'event' && data.message" [innerHtml]="data.message"></div>
<a *ngIf="data.download" [href]="data.download?.href" [download]="data.download?.filename">{{data.download?.text}}</a>
<iframe *ngIf="data.link" [src]="link" style="width: 88vw; height: 70vh; border: none;"></iframe>
<div mat-dialog-actions><button mat-raised-button color="primary" (click)="dialogRef.close()">Close</button></div>
  `
})

export class ModalComponent {
  link;
  constructor(
    public dialogRef: MatDialogRef<ModalComponent>,
    public sanitizer: DomSanitizer,
    @Inject(MAT_DIALOG_DATA) public data: ModalConfig
    ) {
      // tslint:disable-next-line: no-non-null-assertion
      this.link = sanitizer.bypassSecurityTrustResourceUrl(this.data.link!);
    }
  @HostListener('click') onClick(e: Event): void {
    if (this.data.message !== 'event') {
    this.dialogRef.close();
  }
  }
  goTo(url?: string): void {
    if (url) {window.open(url, '_self'); }
  }
  trackByFn(index: number, item: any): TrackByFunction<string> {
    // tslint:disable-next-line: restrict-plus-operands
    return index + item;
  }
}
