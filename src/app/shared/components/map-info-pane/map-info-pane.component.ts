import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Map } from 'ol';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { LayerInfoPaneContent, FirebaseZoneUse, PlanDetails } from '../../models';
import { MapInfoService } from '../../services/map-info.service';
import { MapLayerService } from '../../services/maplayer.service';

@Component({
    styleUrls: ['./map-info-pane.component.scss'],
    selector: 'map-info-pane',
    templateUrl: './map-info-pane.component.html'
})
export class MapInfoPaneComponent implements OnInit, OnChanges {
    @Input() map: Map = new Map({});
    @Input() paneOpen = false;
    @Input() selection: {layer: string; value: string;} = {layer: '', value: ''};
    @Output() readonly paneClose: EventEmitter<boolean> = new EventEmitter();
    paneContent: Observable<LayerInfoPaneContent>;
    planDetails: Observable<PlanDetails>;
    zoneUsesSource = new MatTableDataSource<FirebaseZoneUse>();
    zoneUsesFilterStatus = {USE_TYPE: '', ALLOWANCE: ''};
    constructor(
        readonly layerService: MapLayerService,
        readonly mapInfoService: MapInfoService
    ) {
      this.paneContent = new Observable();
      this.planDetails = new Observable();
    }
    ngOnInit(): void {
      this.zoneUsesSource.filterPredicate = (data: FirebaseZoneUse, filterValue: string) => {
        const filter = filterValue.split('.');
        this.zoneUsesFilterStatus[filter[0] as ('USE_TYPE'|'ALLOWANCE')] = filter[1] === 'All' ? '' : filter[1];
        if (Object.values(this.zoneUsesFilterStatus).every(v => v === '')) {
          return true;
        } else if (Object.values(this.zoneUsesFilterStatus).includes('')) {
          const entry = Object.entries(this.zoneUsesFilterStatus).filter(e => e[1] !== '')[0];
          return data[entry[0] as ('USE_TYPE' | 'ALLOWANCE')] === entry[1];
        } else {
          return Object.entries(this.zoneUsesFilterStatus).every(v => data[v[0] as ('USE_TYPE'|'ALLOWANCE')] === v[1]);
        }
      }
    }
    ngOnChanges(changes: SimpleChanges): void {
      if (changes.hasOwnProperty('map')) {
        this.map = changes.map.currentValue;
      }
      if (changes.hasOwnProperty('paneOpen')) {
        this.paneOpen = changes.paneOpen.currentValue;
      }
      if (changes.hasOwnProperty('selection') && changes.selection.currentValue) {
        const newSelection = changes.selection.currentValue;
        switch (newSelection.layer) {
          case 'Zoning_Districts': {
            this.paneContent = this.mapInfoService.getFirebaseZoneInfo(newSelection.value);
            this.paneContent.pipe(take(1))
              .subscribe(r => this.zoneUsesSource.data = r.USES ? r.USES : []);
            this.planDetails = newSelection.value.startsWith('RDV')
            ? this.mapInfoService.getRDVPlanInfo(newSelection.value)
            : new Observable();
          };
          break;
          default: {
            this.paneContent = this.mapInfoService.getLocalPaneInfo(newSelection);
            this.planDetails = new Observable();
          };
          break;
        }
      }
    }
    checkNotes(index: number, rowData: LayerInfoPaneContent): boolean {
      return rowData.NOTES ? rowData.NOTES.length > 0 : false;
    }
    filterUses(type:string) {
      this.zoneUsesSource.filter = type;
    }
    getBldgTypeLink(zone: string, bldgType: string): string {
      const bldgTypeLink = {
        'One-family in R-1': '36749307',
        'One-family': '36749308',
        'Two-family': '36749309',
        'Three-family': '36749310',
        'Townhouse': '36749311',
        'Low-rise multifamily & Four-family': '36749312',
        'Mid-rise multifamily': '36749313',
        'High-rise multifamily': '36749314',
        'Ground-floor commercial with commercial or residential above': '36749315',
        'Detached commercial': '36749316',
        'Industrial': '36749317',
        'University': '36749318',
        'Hospital or Medical Institution': '36749319',
        'Schools (Elementary, Middle, High Schools)': '36749320',
        'Place of Worship': '36749321',
        'Community Center, Stand-Alone Daycare or Preschool in a Non-residential Area, and other Civic Buildings': '36749322'
      };
      if (zone === 'R-1') {
        return `https://ecode360.com/36749296#${bldgTypeLink['One-family in R-1']}`;
      } else {
        return `https://ecode360.com/36749296#${Object.entries(bldgTypeLink).filter(e => e[0].toLowerCase() === bldgType.toLowerCase())[0]?.[1]}`;
      }
    }
    closePane() {
      this.paneOpen = false;
      this.paneClose.emit(false);
      setTimeout(() => {this.map.updateSize();},300)
    }

}
