import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Overlay } from 'ol';
import { Observable } from 'rxjs';
import Map from 'ol/Map';
import { map } from 'rxjs/operators';
import { ArcAddressPt } from '../models';
import { JsonDataService } from '../services/json-data.service';
import { fromLonLat } from 'ol/proj';
import { Coordinate } from 'ol/coordinate';
import { Pixel } from 'ol/pixel';

@Component({
    selector: 'map-search-bar',
    // tslint:disable: component-max-inline-declarations template-i18n template-use-track-by-function
    template: `
      <mat-icon class="search-icon">search</mat-icon>
      <div class="search-box" matAutocompleteOrigin #origin="matAutocompleteOrigin">
        <input type="text" [placeholder]="placeholderText[searchType]"
            aria-label="Search Input" matInput [formControl]="searchControl" [matAutocomplete]="auto" [matAutocompleteConnectedTo]="origin" (ngModelChange)="_filter($event, searchType)">
        <button class="icon-button" *ngIf="searchControl.value" aria-label="Clear" (click)="searchControl.setValue('')">
          <mat-icon>close</mat-icon>
        </button>
      </div>
      <div class="change-search-type">
        <p>Search by: </p>
        <mat-select [(value)]="searchType" disableOptionCentering="true" (selectionChange)="this.searchControl.setValue('')">
          <mat-optgroup label="Block-Lot">
            <mat-option *ngFor="let opt of options.slice(0,1)" [value]="opt.field">{{ opt.name }}</mat-option>
          </mat-optgroup>
          <mat-optgroup label="Address">
            <mat-option *ngFor="let opt of options.slice(1)" [value]="opt.field">{{ opt.name }}</mat-option>
          </mat-optgroup>
        </mat-select>
      </div>
      <mat-autocomplete #auto="matAutocomplete" [displayWith]="displayFn" (optionSelected)="goTo($event)" autoActiveFirstOption="true">
          <mat-option *ngFor="let option of (filteredOptions | async); let i = index" [value]="option">
            {{option[searchType]}}
          </mat-option>
      </mat-autocomplete>
    `
})
export class MapSearchBarComponent {
  @Input() map: Map = new Map({});
  results: Array<ArcAddressPt['attributes']> = [];
  searchControl = new FormControl();
  filteredOptions: Observable<Array<ArcAddressPt['attributes']>> = new Observable();
  searchType: 'BLOCK_LOT' | 'ADDR_STREET' | 'ADDR_LEGAL' = 'ADDR_STREET';
  placeholderText = {
    ADDR_LEGAL: 'Search Legal Addresses',
    ADDR_STREET: 'Search any Address',
    BLOCK_LOT: 'Search any Block-Lot'
  };
  options: Array<{field: string; name: string;}> = [
    {field: 'BLOCK_LOT',name:'Block-Lot'},
    {field: 'ADDR_STREET',name:'Street Address'},
    {field: 'ADDR_LEGAL',name:'Legal Address'}
  ];
  @Input() overlay: Overlay = new Overlay({});
  constructor(
    readonly searchData: JsonDataService
  ) {}
  _filter(value: any, type: 'BLOCK_LOT' | 'ADDR_STREET' | 'ADDR_LEGAL'): void {
    this.filteredOptions = this.searchData.getSearchOptions(value, type)
      .pipe(
        map( res => res.features.map(r => r.properties))
      );
  }
  displayFn(opt: ArcAddressPt['attributes']): string {
    return opt && opt[this.searchType] ? opt[this.searchType] : '';
  }
  goTo(e: MatAutocompleteSelectedEvent): any {
    const option: ArcAddressPt['attributes'] = e.option.value;
    const coordinates: Coordinate = fromLonLat([option.POINT_X, option.POINT_Y]);
    const pixel: Pixel= this.map.getPixelFromCoordinate(coordinates);
    // const features = this.map.getFeaturesAtPixel(pixel)
    //   .filter(ft => ft.get('layer') === 'Newark_Parcels_2020_07_31');
    this.map.getView().animate({
      center: coordinates,
      resolution: 0.9
    });
    console.info(`Finding Info for ${option[this.searchType]}`);
    this.searchControl.setValue(option[this.searchType]);
    // this.popup.setPosition(coordinates);
    }
}
