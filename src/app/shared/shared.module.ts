import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatRippleModule, MAT_RIPPLE_GLOBAL_OPTIONS, RippleGlobalOptions } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTreeModule } from '@angular/material/tree';
import { DomSanitizer } from '@angular/platform-browser';

import * as index from './';

const matModules = [
MatAutocompleteModule,
MatButtonModule,
MatButtonToggleModule,
MatCardModule,
MatCheckboxModule,
MatChipsModule,
MatDialogModule,
MatDividerModule,
MatExpansionModule,
MatFormFieldModule,
MatIconModule,
MatInputModule,
MatListModule,
MatMenuModule,
MatPaginatorModule,
MatProgressSpinnerModule,
MatRadioModule,
MatRippleModule,
MatSelectModule,
MatSliderModule,
MatSlideToggleModule,
MatSortModule,
MatTableModule,
MatTabsModule,
MatTreeModule,
MatToolbarModule,
MatTooltipModule
];

const globalRippleConfig: RippleGlobalOptions = {
  animation: {
    enterDuration: 200,
    exitDuration: 200
  },
  terminateOnPointerUp: true
};

@NgModule({
  declarations: [
    ...index.components
  ],
  exports: [
    FormsModule,
    ReactiveFormsModule,
    ...index.components,
    matModules
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    matModules
  ],
  providers: [
    ...index.services,
    { provide: MAT_RIPPLE_GLOBAL_OPTIONS, useValue: globalRippleConfig }
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SharedModule {
  constructor(
    public iconRegistry: MatIconRegistry,
    readonly sanitizer: DomSanitizer
    ) {
    this.iconRegistry.addSvgIcon(
      'newarkgo',
      this.sanitizer.bypassSecurityTrustResourceUrl('assets/img/icons/newarkgo.svg'));
    this.iconRegistry.addSvgIcon(
      'blocklot',
      this.sanitizer.bypassSecurityTrustResourceUrl('assets/img/icons/blocklot-24px.svg'));
    }
}
