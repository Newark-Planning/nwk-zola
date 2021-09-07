import { Component, Input, ViewEncapsulation} from '@angular/core';
import { ArcPropInfo } from '../../models';
@Component({
  selector: 'map-pane-content-property',
  styleUrls: ['./map-info-pane.component.scss'],
  template: `
  <ng-container>
    <table class="prop-fields" *ngFor="let group of propGroups">
      <tr><th>{{ group }}</th></tr>
      <tr *ngFor="let row of propFields[group]">
          <td class="prop-alias">{{ row.alias }}</td>
          <ng-container [ngSwitch]="row.valueType">
            <td class="prop-field" *ngSwitchCase="'number'">{{propInfo[row.field] ? propInfo[row.field] : '-'}}</td>
            <td class="prop-field currency" *ngSwitchCase="'number-currency'"><span>$</span><span>{{propInfo[row.field] ? (propInfo[row.field] | number:'1.2-2') : '-'}}</span></td>
            <td class="prop-field" *ngSwitchCase="'boolean'">{{row.fixFn(propInfo[row.field])}}</td>
            <td
              class="prop-field"
              [ngClass]="row.field === 'ZONING' ? 'Zone_'+ propInfo[row.field] : row.field + '_' + propInfo[row.field]"
              *ngSwitchCase="'fn-string'">
              {{ (propInfo[row.field] ? row.fixFn(propInfo[row.field]) : '-')}}
            </td>
            <td class="prop-field" *ngSwitchCase="'fn-link'">
              <a *ngIf="propInfo[row.field]; else noData" [href]="propInfo[row.field] ? row.fixFn(propInfo[row.field])[1] : undefined" target="_blank">{{ (propInfo[row.field] ? row.fixFn(propInfo[row.field])[0] : '-')}}</a>
              <ng-template #noData>-</ng-template>
            </td>
            <td class="prop-field" *ngSwitchDefault>{{ (propInfo[row.field] ? propInfo[row.field] : '-') | titlecase}}</td>
          </ng-container>
      </tr>
    </table>
  </ng-container>
  `,
  encapsulation: ViewEncapsulation.None
})
export class PaneContentPropertyComponent {
  @Input() propInfo: ArcPropInfo = {LOT_BLOCK_LOT: '', PROPLOC: ''};
  propFields: {[group: string]: Array<{alias: string; field: string; valueType: 'string' | 'number' | 'number-currency' | 'boolean' | 'fn-string' | 'fn-link'; fixFn?(value: string): string | [string, string]; }>} = {
    'ID': [
      {alias: 'Block-Lot', field: 'LOT_BLOCK_LOT', valueType: 'string'},
      {alias: 'Primary Parcel', field: 'MOD4_BLOCK_LOT', valueType: 'string'},
      {alias: 'Legal Address', field: 'PROPLOC', valueType: 'string'},
      {alias: 'Related Lots', field: 'ADDLOTS', valueType: 'string'}
    ],
    'Designations': [
      {alias: 'Zoning Designation', field: 'ZONING', valueType: 'fn-string', fixFn: this.zoneFilter},
      {alias: 'Redevelopment Plan', field: 'RDV_PLAN', valueType: 'string'},
      {alias: 'Redevelopment Zoning', field: 'RDV_CODE', valueType: 'fn-link', fixFn: this.redevCode},
      {alias: 'Historic District', field: 'HIST_DIST', valueType: 'string'},
      {alias: 'Historic Landmark', field: 'HIST_PROP', valueType: 'string'},
      {alias: 'Opportunity Zone', field: 'OPPO_ZONE', valueType: 'boolean', fixFn: (value?: string) => value ? value : 'N/A'},
      {alias: 'Within UEZ', field: 'IN_UEZ', valueType: 'boolean', fixFn: (value?: string) => value == '1' ? 'True' : 'False'}
    ],
    'Description': [
      {alias: 'Property Use', field: 'PROPCLASS', valueType: 'fn-string', fixFn: this.propClassFilter},
      {alias: 'Bldg. Description', field: 'BUILDDESC', valueType: 'fn-string', fixFn: this.buildDesc},
      {alias: 'Land Description', field: 'LANDDESC', valueType: 'string'},
      {alias: 'Acreage', field: 'ACREAGE', valueType: 'number'},
      {alias: 'Ward', field: 'CITYWARD', valueType: 'fn-string', fixFn: (value: string) => this.wardCodes[value]},
      {alias: 'Commercial Type', field: 'CLASS4TYPE', valueType: 'string'}
    ],
    'Tax Info': [
      {alias: 'Owner Name', field: 'OWNERSNAME', valueType: 'string'},
      {alias: 'Tax Map Page', field: 'TAXMAP', valueType: 'number'},
      {alias: 'Assessment - Land', field: 'LANDVALUE', valueType: 'number-currency'},
      {alias: 'Assessment - Improvements', field: 'IMPRVALUE', valueType: 'number-currency'},
      {alias: 'Assessment - Total', field: 'NETVALUE', valueType: 'number-currency'},
      {alias: 'Last Year Tax', field: 'LSTYRTAX', valueType: 'number-currency'},
      {alias: 'Old Block No.', field: 'OLDBLOCKNO', valueType: 'string'},
      {alias: 'Old Lot No.', field: 'OLDLOTNO', valueType: 'string'},
      {alias: 'Old Qual Code', field: 'OLDQUALCODE', valueType: 'string'}
    ]
  };
  propGroups: Array<string> = Object.keys(this.propFields);
  wardCodes: {[ward: string]: string} = {
      NW: 'North',
      SW: 'South',
      CW: 'Central',
      EW: 'East',
      WW: 'West',
      undefined: 'N/A'
  };
  isArray = (value: any): boolean => Array.isArray(value);
  propClassFilter(classCode: string): string {
    const propClasses: Array<{ name: string; desc: string; }> = [
      { name: '1', desc: 'Vacant Property' },
      { name: '2', desc: 'Residential: < 4 Units' },
      { name: '4A', desc: 'Commercial' },
      { name: '4B', desc: 'Industrial' },
      { name: '4C', desc: 'Apartments' },
      { name: '5A', desc: 'Railroad: Class I' },
      { name: '5B', desc: 'Railroad: Class II' },
      { name: '15A', desc: 'Exempt: Public School Property' },
      { name: '15B', desc: 'Exempt: Other School Property' },
      { name: '15C', desc: 'Exempt: Public Property' },
      { name: '15D', desc: 'Exempt: Church & Charitable Property' },
      { name: '15E', desc: 'Exempt: Cemeteries & Graveyards' },
      { name: '15F', desc: 'Exempt: Other' }
    ];
    return propClasses.filter(c => c.name === classCode).length > 0 ? `${classCode} | ${propClasses.filter(c => c.name === classCode)[0].desc}` : 'Unclassed Property';
  }
  zoneFilter(zone: string): string {
      const zones: Array<{ name: string; desc: string; }> = [
          { name: 'R-1', desc: 'Residential: 1 Family' },
          { name: 'R-2', desc: 'Residential: 1-2 Family' },
          { name: 'R-3', desc: 'Residential: 1-3 Family' },
          { name: 'R-4', desc: 'Residential: Low-Rise Multi-Family' },
          { name: 'R-5', desc: 'Residential: Mid-Rise Multi-Family' },
          { name: 'R-6', desc: 'Residential: High-Rise Multi-Family' },
          { name: 'C-1', desc: 'Commercial: Neighborhood' },
          { name: 'C-2', desc: 'Commercial: Community' },
          { name: 'C-3', desc: 'Commercial: Regional' },
          { name: 'I-1', desc: 'Industrial: Light' },
          { name: 'I-2', desc: 'Industrial: Medium' },
          { name: 'I-3', desc: 'Industrial: Heavy' },
          { name: 'MX-1', desc: 'Mixed-Use: Low Intensity' },
          { name: 'MX-2', desc: 'Mixed-Use: Medium Intensity' },
          { name: 'MX-3', desc: 'Mixed-Use: High Intensity' },
          { name: 'INST', desc: 'Institutional' },
          { name: 'PARK', desc: 'Parks & Open Space' },
          { name: 'CEM', desc: 'Cemeteries' },
          { name: 'RDV', desc: 'Redevelopment Zone' },
          { name: 'EWR', desc: 'Airport' },
          { name: 'EWR-S', desc: 'Airport Support' },
          { name: 'PORT', desc: 'Port Industrial' }
      ];
      return zones.filter(c => c.name === zone).length > 0 ? `${zone} | ${zones.filter(c => c.name === zone)[0].desc}` : 'N/A';
  }
  redevCode(code: string): [string, string] {
      const redevcodes: {[zoneCode: string]: {page: number; zone: string}} = {
          '3RD-COM-N': {page: 0, zone: 'Commercial: Neighborhood'},
          '3RD-MAKER': {page: 0, zone: 'Maker Village'},
          '3RD-MU-H': {page: 0, zone: 'Mixed-Use: High Density'},
          '3RD-MU-M': {page: 0, zone: 'Mixed-Use: Medium Density'},
          '3RD-PUBLIC': {page: 0, zone: 'Public Facilities'},
          '3RD-RES-H': {page: 0, zone: 'Residential: High Density'},
          '3RD-RES-L': {page: 0, zone: 'Residential: Low Density'},
          '3RD-RES-M': {page: 0, zone: 'Residential: Medium Density'},
          '3RD-SEMIPUBLIC': {page: 0, zone: 'Semi-Public'},
          'BS-A': {zone:'Sub-district A: Broad Street Station Transit Hub', page:	136},
          'BS-B': {zone:'Sub-district B: Orange Street Retail Corridor', page:	142},
          'BS-C': {zone:'Sub-district C: Washington Park Cultural District', page:	148},
          'BS-D': {zone:'Sub-district D: James Street Commons Historic District', page:	154},
          'BS-E': {zone:'Sub-district E: Nesbitt Street Residential District', page:	164},
          'BS-F': {zone:'Sub-district F: 8th Avenue Gateway District', page:	174},
          'BS-G': {zone:'Sub-district G: NJIT Greek Village', page:	180},
          'DC-': {zone: 'Downtown Core', page: 0},
          'FC-C-2': {page: 0, zone: 'Community Commercial'},
          'FC-C-3': {page: 0, zone: 'Neighborhood Commercial'},
          'FC-PARK': {page: 0, zone: 'Park/Open Space'},
          'FC-R-3': {page: 0, zone: '1-3 Family & Townhouse Residential'},
          'FC-R-4': {page: 0, zone: 'Low-Rise Multifamily Residential'},
          'KB-MUCR': {page: 0, zone: 'Mixed-use Commercial Residential'},
          'KB-MURRR': {page: 0, zone: 'Mixed-use Regional Retail-Residential'},
          'KB-NC': {page: 0, zone: 'Neighborhood Commercial'},
          'KB-PR': {page: 0, zone: 'Parkfront Residential'},
          'KB-R': {page: 0, zone: 'Residential'},
          'LD-': {zone: 'Living Downtown', page: 0},
          'LP-CIVIC-MU': {page: 0, zone: 'Cultural-Civic Mixed Use'},
          'LP-HP': {page: 0, zone: 'Historic Park'},
          'LP-MULB-MU': {page: 0, zone: 'Mulberry Street Mixed Use'},
          'LP-RES-LM': {page: 0, zone: 'Residential-Low to Medium'},
          'LP-RESMH-MU': {page: 0, zone: 'Residential-Medium to High/Mixed Use'},
          'LP-STR-MU': {page: 0, zone: 'Streetlevel Mixed Use'},
          'NF-B-2': {page: 0, zone: 'B-2'},
          'NF-I-1': {page: 0, zone: 'I-1'},
          'NF-NUC': {page: 0, zone: 'New United Campus'},
          'NF-R-3': {page: 0, zone: 'R-3'},
          'SB-MUNC': {page: 0, zone: 'Mixed-Use Neighborhood Commercial'},
          'SB-MUNR': {page: 0, zone: 'Mixed-Use Neighborhood Residential'},
          'SB-PS': {page: 0, zone: 'Public Safety'},
          'RIV-BallantineMU': {page: 0, zone: 'Ballantine Site - Mixed Use'},
          'RIV-IND': {page: 0, zone: 'Dedicated Industrial'},
          'RIV-MU-1': {page: 0, zone: 'Mixed Use 1 (Light Industrial, Residential, Retail)'},
          'RIV-MU-2': {page: 0, zone: 'Mixed Use 2 (Medium-Density Residential, Office, Retail)'},
          'RIV-MU-3': {page: 0, zone: 'Mixed Use 3 (High-Density Residential, Office, Retail)'},
          'RIV-OS': {page: 0, zone: 'Open Space'},
          'RIV-PARK': {page: 0, zone: 'Park'},
          'RIV-RES': {page: 0, zone: 'Dedicated Residential'},
          'WWMNI-C-1': {page: 0, zone: 'Neighborhood Commercial'},
          'WWMNI-C-2': {page: 0, zone: 'Community Commercial'},
          'WWMNI-CEM': {page: 0, zone: 'Cemetery'},
          'WWMNI-E': {page: 0, zone: 'Educational'},
          'WWMNI-P': {page: 0, zone: 'Public'},
          'WWMNI-WS-R': {page: 0, zone: 'West Side Residential'}
      };
      const planIDs: {[plan: string]: string;} = {
        '3RD': '1r0NvK51tnOeDy2pYzCUEy9PbVn8o0tY3',
        BS: '1qjt3hK8FAzbkOCM3zOMy2rdam9O0hrLQ',
        DC: '1YGa0PMS5bggyLZPzPOvDUJka6OTUQ-PE',
        DS: '',
        FC: '',
        KB: '1I79cSbNr2MBW7XTUA4dsVi1Tw5ktFtcg',
        LD: '11dBu7vKbJ6qVJslZjUD250WXnH0XckBs',
        LP: '1XiKV5msWgYxzhk-fApGE7okTkSRuBkWd',
        NF: '1_OkGJZd5RNjLrEJ3qsd_v3yPo5TE2LWl',
        SB: '1iMhMk7nw2_1LURkGPmfRcBGuoOQui1E3',
        RIV: '12jNloFP9PCgCACE8D2NkjaEBRA3bzYOe',
        WWMNI: '1dJaTBlRQJNbVFntMRwUGugQjDXn4CQ7j',
        undefined: ''
      };
      const plan = code.search('-') === -1 ? 'undefined' : code.slice(0, code.search('-'));
      const makePageLink = (planID: string, page: number): string => `https://drive.google.com/uc?export=view&id=${planID}#page=${page}`;
      return redevcodes[code]
        ? [redevcodes[code].zone, makePageLink(planIDs[plan], redevcodes[code].page)]
        : ['N/A', ''];
  }
  buildDesc(codes: string): string {
      const desc: Array<string> = [];
      if (codes.match(/^[1-9.]*S/i)) {
          desc.push(`${codes.slice(0, codes.indexOf('S'))} Stories`);
      }
      if (codes.match(/(?:AG|UG)$/i)) {
          desc.push(codes.slice(codes.length - 2) === 'UG' ? 'Unattached Garage' : 'Attached Garage');
      }

      return desc.length > 0 ? desc.join(',') : 'N/A';
  }
}
