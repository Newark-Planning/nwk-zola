import { Component, EventEmitter, Input, Output } from '@angular/core';
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

@Component({
    selector: 'map-search-bar',
    // tslint:disable: component-max-inline-declarations template-i18n template-use-track-by-function
    template: `
      <mat-icon class="search-icon">search</mat-icon>
      <div class="search-box" matAutocompleteOrigin #origin="matAutocompleteOrigin">
        <input type="text" [placeholder]="placeholderText[searchType]" #input
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
      <mat-autocomplete #auto="matAutocomplete" [displayWith]="displayFn" (optionSelected)="goTo($event, input)" autoActiveFirstOption="true">
          <mat-option *ngFor="let option of (filteredOptions | async); let i = index" [disabled]="option.POINT_X === 0" [value]="option.POINT_X === 0 ? undefined : option">
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
    {field: 'BLOCK_LOT', name:'Block-Lot'},
    {field: 'ADDR_STREET', name:'Street Address'},
    {field: 'ADDR_LEGAL', name:'Legal Address'}
  ];
  @Input() overlay: Overlay = new Overlay({});
  @Output() readonly searchSelection: EventEmitter<{layer: string; value: string;}> = new EventEmitter();
  constructor(
    readonly searchData: JsonDataService
  ) {}
  _filter(value: any, type: 'BLOCK_LOT' | 'ADDR_STREET' | 'ADDR_LEGAL'): void {
    this.filteredOptions = this.searchData.getSearchOptions(value, type)
      .pipe(
        map( res => res.features.length > 0
          ? res.features.map(r => r.properties)
          : [{ADDR_LEGAL: 'No Address Matches', ADDR_STREET: 'No Address Matches', BLOCK_LOT: 'No Block-Lot Matches', POINT_X: 0, POINT_Y: 0}])
      );
  }
  displayFn = (opt: ArcAddressPt['attributes']): string => opt && opt[this.searchType] ? opt[this.searchType] : '';
  goTo(e: MatAutocompleteSelectedEvent, inputEl: HTMLInputElement): void {
    const option: ArcAddressPt['attributes'] = e.option.value;
    const coordinates: Coordinate = fromLonLat([option.POINT_X, option.POINT_Y]);
    console.info(`Finding Info for ${option[this.searchType]}`);
    this.searchSelection.emit({layer: 'Parcels-Zoning', value: option.BLOCK_LOT});
    this.map.getView().animate({
      center: coordinates,
      resolution: 0.5971642835598172,
      duration: 300
    });
    this.searchControl.reset();
    inputEl.blur();
  }
}
