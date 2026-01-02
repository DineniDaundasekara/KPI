import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as ExcelJS from 'exceljs';

const MOCK_FORM6_DATA: Form6Entry[] = [
  {
    _id: 'kpi-8',
    no: 8,
    network_engineer_kpi: 'IP Core NW Availability',
    division: 'TRANSPORT & ACCESS',
    section: 'IPNWOP',
    kpi_percent: 99.999,
    unavailable_minutes: {
      cenhkmd: '15',
      gqkintb: '200',
      kgkly: '23',
      gphtnw: '4500',
      adipr: '102',
    },
    total_minutes: {
      cenhkmd: '86400',
      konix: '44640',
      kgkly: '89280',
      debkymt: '43200',
      gphtnw: '44640',
      adipr: '43200',
    },
    total_nodes: {
      cenhkmd: '20',
      gqkintb: '2',
      kgkly: '2',
      debkymt: '1',
      gphtnw: '1',
      adipr: '20',
    },
  },
  {
    _id: 'kpi-9',
    no: 9,
    network_engineer_kpi: 'BSR NW Availability',
    division: 'TRANSPORT & ACCESS',
    section: 'IPNWOP',
    kpi_percent: 99.99,
    unavailable_minutes: {
      cenhkmd: '120',
      ndfrm: '300',
      awho: '65',
      kgkly: '10',
    },
    total_minutes: {
      cenhkmd: '86400',
      ndfrm: '86400',
      awho: '43200',
      kgkly: '44640',
    },
    total_nodes: {
      cenhkmd: '15',
      ndfrm: '4',
      awho: '3',
      kgkly: '2',
    },
  },
  {
    _id: 'kpi-10',
    no: 10,
    network_engineer_kpi: 'Service Edge NW Availability',
    division: 'TRANSPORT & ACCESS',
    section: 'IPNWOP',
    kpi_percent: 99.95,
    unavailable_minutes: {
      cwpx: '400',
      debkymt: '150',
      hrktph: '50',
      komltmbva: '200',
    },
    total_minutes: {
      cwpx: '44640',
      debkymt: '86400',
      hrktph: '43200',
      komltmbva: '44640',
    },
    total_nodes: {
      cwpx: '2',
      debkymt: '3',
      hrktph: '2',
      komltmbva: '1',
    },
  },
];

type Dict<T = any> = Record<string, T>;

interface RegionRow {
  region?: string;
  province?: string;
  networkEngineer?: string;
  lea?: string; // friendly string in DB like "AD / PR"
}

interface Form6Entry {
  _id: string;
  no?: any;
  network_engineer_kpi?: string;
  division?: string;
  section?: string;
  kpi_percent?: any;

  total_minutes?: Dict<any>;
  unavailable_minutes?: Dict<any>;
  total_nodes?: Dict<any>;
}

const LOCAL_REGION_TABLE: RegionRow[] = [
  { region: 'Region 3', province: 'NP', networkEngineer: 'NW/NP-2', lea: 'KOMLTMBVA' },
  { region: 'Region 3', province: 'NP', networkEngineer: 'NW/NP-1', lea: 'JA' },
  { region: 'Region 3', province: 'EP', networkEngineer: 'NW/EP', lea: 'BCAPKLTC' },
  { region: 'Region 2', province: 'WPS & SP', networkEngineer: 'NW/WPS', lea: 'HRKTPH' },
  { region: 'Region 2', province: 'WPS & SP', networkEngineer: 'NW/SPW', lea: 'AGGL' },
  { region: 'Region 2', province: 'WPS & SP', networkEngineer: 'NW/SPE', lea: 'EMBMBMH' },
  { region: 'Region 2', province: 'SAB & UVA', networkEngineer: 'NW/SAB', lea: 'KERN' },
  { region: 'Region 2', province: 'SAB & UVA', networkEngineer: 'NW/UVA', lea: 'BDBWMRG' },
  { region: 'Region 1', province: 'CP & NCP', networkEngineer: 'NW/NCP', lea: 'ADPR' },
  { region: 'Region 1', province: 'CP & NCP', networkEngineer: 'NW/CPS', lea: 'GPHTNW' },
  { region: 'Region 1', province: 'CP & NCP', networkEngineer: 'NW/CPN', lea: 'DBKYMT' },
  { region: 'Region 1', province: 'WPN & NWP', networkEngineer: 'NW/NWPW', lea: 'CWPX' },
  { region: 'Region 1', province: 'WPN & NWP', networkEngineer: 'NW/NWPE', lea: 'KGKLY' },
  { region: 'Region 1', province: 'WPN & NWP', networkEngineer: 'NW/WPN', lea: 'NGWT' },
  { region: 'Metro', province: 'Metro 2', networkEngineer: 'NWWPE', lea: 'KONKX' },
  { region: 'Metro', province: 'Metro 2', networkEngineer: 'NWWPSE', lea: 'AWHO' },
  { region: 'Metro', province: 'Metro 2', networkEngineer: 'NWWPSW', lea: 'NDRM' },
  { region: 'Metro', province: 'Metro 1', networkEngineer: 'NWWPNE', lea: 'GQKINTB' },
  { region: 'Metro', province: 'Metro 1', networkEngineer: 'NWWPC-2 (CEN/HK/MD)', lea: 'CENHKMD' },
  { region: 'Metro', province: 'Metro 1', networkEngineer: 'NWWPC-1 (CEN/HK/MD)', lea: 'CENHKMD1' },
];

@Component({
  selector: 'app-ip-nw-op',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ip-nw-op.component.html',
  styleUrls: ['./ip-nw-op.component.scss'],
})
export class IpNwOpComponent implements OnInit, OnDestroy {
  pageTitle = 'Platform KPI — IP NW OP';

  // placeholder data; replace with backend payload when ready
  data: Form6Entry[] = [...MOCK_FORM6_DATA];
  regionTable: RegionRow[] = [...LOCAL_REGION_TABLE];

  loading = true;
  error: string | null = null;

  role: string | null = null;
  isEditingAllowed = false;

  private permissionTimer: any = null;

  // current month days
  readonly daysInMonth: number = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0
  ).getDate();

  // dropdown form
  formValues = {
    dropdown1: '', // Region
    dropdown2: '', // Province
    dropdown3: '', // Engineer
    dropdown4: '', // RTOM area db key (lowercase)
  };

  dropdown2Options: string[] = [];
  dropdown3Options: string[] = [];
  dropdown4Options: string[] = [];

  // edit cell state (nested key like "total_nodes.adipr")
  editCell: { rowId: string | null; key: string | null; value: string } = {
    rowId: null,
    key: null,
    value: '',
  };

  // simple toast system (no external lib)
  toasts: Array<{ id: number; type: 'success' | 'danger'; text: string }> = [];
  private toastId = 1;

  // ---- Form6 mapping (DB keys are LOWERCASE) ----
  optionMapping: Record<string, string> = {
    cenhkmd: 'CEN/HK/MD',
    cenhkmd1: 'CEN/HK/MD',
    gqkintb: 'GQ / KI / NTB',
    ndfrm: 'ND / RM',
    awho: 'AW / HO',
    konix: 'KON / KX',
    ngivt: 'NG / WT',
    kgkly: 'KG / KLY',
    cwpx: 'CW / PX',
    debkymt: 'DB / KY / MT',
    gphtnw: 'GP / HT / NW',
    adipr: 'AD / PR',
    bddwmrg: 'BD / BW / MRG',
    keirn: 'KE / RN',
    embmbmh: 'EMB / HB / MH',
    aggl: 'AG / GL',
    hrktph: 'HR / KT / PH',
    bcjrdkltc: 'BC / AP / KL / TC',
    ja: 'JA',
    komltmbva: 'KO / MLT / MB / VA',
  };

  // friendly → dbKey (built once)
  private friendlyToDbKey: Record<string, string> = {};
  private filtersInitialized = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.buildFriendlyMap();
    this.loadRole();
    this.loadRegionTable();
    this.initializeFilters();
    this.loadData();

    // keep permission check alive (like your React interval)
    this.permissionTimer = setInterval(() => this.refreshEditPermission(), 60000);
  }

  ngOnDestroy(): void {
    if (this.permissionTimer) clearInterval(this.permissionTimer);
  }

  // -------------------------
  // Helpers
  // -------------------------
  private norm(s: any): string {
    return s ? String(s).replace(/[^A-Za-z0-9]/g, '').toLowerCase() : '';
  }

  private buildFriendlyMap(): void {
    const out: Record<string, string> = {};
    Object.keys(this.optionMapping).forEach((dbKey) => {
      out[this.norm(this.optionMapping[dbKey])] = dbKey;
      out[this.norm(dbKey)] = dbKey;
    });
    this.friendlyToDbKey = out;
  }

  private showToast(type: 'success' | 'danger', text: string): void {
    const id = this.toastId++;
    this.toasts.push({ id, type, text });
    setTimeout(() => this.dismissToast(id), 2600);
  }

  dismissToast(id: number): void {
    this.toasts = this.toasts.filter((t) => t.id !== id);
  }

  // Selected RTOM db key (lowercase)
  get selectedKey(): string {
    return this.formValues.dropdown4 ? this.norm(this.formValues.dropdown4) : '';
  }

  // Regions list
  get regions(): string[] {
    return Array.from(new Set(this.regionTable.map((r) => r.region).filter(Boolean) as string[]));
  }

  // -------------------------
  // API Calls
  // -------------------------
  loadRole(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.role = null;
      this.isEditingAllowed = false;
      return;
    }

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<any>('/auth/current-role', { headers }).subscribe({
      next: (res) => {
        this.role = res?.role ?? null;
        this.refreshEditPermission();
      },
      error: () => {
        this.error = 'Failed to fetch role. Please log in again.';
        this.role = null;
        this.isEditingAllowed = false;
      },
    });
  }

  private refreshEditPermission(): void {
    // keep same behavior: platform admin can edit
    this.isEditingAllowed = this.role === 'padmin';
  }

  loadRegionTable(): void {
    this.http.get<any>('/api/region-table').subscribe({
      next: (res) => {
        const rows = Array.isArray(res?.data) && res.data.length ? res.data : LOCAL_REGION_TABLE;
        this.regionTable = [...rows];
        this.initializeFilters();
      },
      error: (err) => {
        console.error('Failed to fetch region table:', err);
        this.regionTable = [...LOCAL_REGION_TABLE];
        this.initializeFilters();
      },
    });
  }

  loadData(): void {
    // Assign mock data for now; swap back to HTTP call when backend is ready.
    this.loading = false;
    this.error = null;
    this.data = [...MOCK_FORM6_DATA];
  }

  // -------------------------
  // Dropdown cascading
  // -------------------------
  private updateDropdown2Options(region: string): void {
    if (!region) {
      this.dropdown2Options = [];
      return;
    }
    const provinces = Array.from(
      new Set(
        this.regionTable
          .filter((x) => x.region === region)
          .map((x) => x.province)
          .filter(Boolean) as string[]
      )
    );
    this.dropdown2Options = provinces;
  }

  private updateDropdown3Options(province: string): void {
    if (!province || !this.formValues.dropdown1) {
      this.dropdown3Options = [];
      return;
    }
    const engineers = Array.from(
      new Set(
        this.regionTable
          .filter((x) => x.region === this.formValues.dropdown1 && x.province === province)
          .map((x) => x.networkEngineer)
          .filter(Boolean) as string[]
      )
    );
    this.dropdown3Options = engineers;
  }

  private updateDropdown4Options(engineer: string): void {
    if (!engineer || !this.formValues.dropdown1 || !this.formValues.dropdown2) {
      this.dropdown4Options = [];
      return;
    }

    const leas = Array.from(
      new Set(
        this.regionTable
          .filter(
            (x) =>
              x.region === this.formValues.dropdown1 &&
              x.province === this.formValues.dropdown2 &&
              x.networkEngineer === engineer
          )
          .map((x) => this.friendlyToDbKey[this.norm(x.lea)] || this.norm(x.lea))
          .filter(Boolean)
      )
    );

    this.dropdown4Options = leas;
  }

  private initializeFilters(): void {
    if (this.filtersInitialized) return;
    if (!this.regions.length) return;

    const firstRegion = this.regions[0];
    if (!firstRegion) return;

    this.formValues.dropdown1 = firstRegion;
    this.updateDropdown2Options(firstRegion);

    const firstProvince = this.dropdown2Options[0];
    if (!firstProvince) {
      this.filtersInitialized = true;
      return;
    }

    this.formValues.dropdown2 = firstProvince;
    this.updateDropdown3Options(firstProvince);

    const firstEngineer = this.dropdown3Options[0];
    if (!firstEngineer) {
      this.filtersInitialized = true;
      return;
    }

    this.formValues.dropdown3 = firstEngineer;
    this.updateDropdown4Options(firstEngineer);

    const firstArea = this.dropdown4Options[0];
    if (firstArea) {
      this.formValues.dropdown4 = firstArea;
    }

    this.filtersInitialized = true;
  }

  onDropdownChange(name: 'dropdown1' | 'dropdown2' | 'dropdown3' | 'dropdown4', value: string): void {
    if (name === 'dropdown1') {
      this.formValues.dropdown1 = value;
      this.formValues.dropdown2 = '';
      this.formValues.dropdown3 = '';
      this.formValues.dropdown4 = '';

      this.updateDropdown2Options(value);
      this.dropdown3Options = [];
      this.dropdown4Options = [];
      this.cancelEdit();
      return;
    }

    if (name === 'dropdown2') {
      this.formValues.dropdown2 = value;
      this.formValues.dropdown3 = '';
      this.formValues.dropdown4 = '';

      this.updateDropdown3Options(value);
      this.dropdown4Options = [];
      this.cancelEdit();
      return;
    }

    if (name === 'dropdown3') {
      this.formValues.dropdown3 = value;
      this.formValues.dropdown4 = '';

      this.updateDropdown4Options(value);
      this.cancelEdit();
      return;
    }

    // dropdown4
    this.formValues.dropdown4 = value;
    this.cancelEdit();
  }

  // -------------------------
  // KPI calculations
  // -------------------------
  calculatePercentage(totalMinutes: any, unavailableMinutes: any, totalNodes: any): number {
    const tm = Number(totalMinutes) || 0;
    const um = Number(unavailableMinutes) || 0;
    const tn = Number(totalNodes) || 0;

    const totalAvailableMinutes = tm - um;
    const totalMin = 24 * 60 * this.daysInMonth * tn;
    if (totalMin === 0) return 100;
    return (100 * totalAvailableMinutes) / totalMin;
  }

  // -------------------------
  // Editing
  // -------------------------
  startEdit(entry: Form6Entry, key: 'unavailable_minutes' | 'total_minutes' | 'total_nodes'): void {
    if (!this.isEditingAllowed || !this.selectedKey) return;

    const k = this.selectedKey;
    const nestedKey = `${key}.${k}`;
    const currentVal =
      key === 'unavailable_minutes'
        ? entry.unavailable_minutes?.[k]
        : key === 'total_minutes'
        ? entry.total_minutes?.[k]
        : entry.total_nodes?.[k];

    this.editCell = {
      rowId: entry._id,
      key: nestedKey,
      value: currentVal === undefined || currentVal === null ? '' : String(currentVal),
    };
  }

  onEditInput(value: string): void {
    this.editCell = { ...this.editCell, value };
  }

  doneEdit(): void {
    if (!this.editCell.rowId || !this.editCell.key) return;

    const [parentKey, childKey] = this.editCell.key.split('.');
    const newValue = this.editCell.value;

    this.data = this.data.map((entry) => {
      if (entry._id !== this.editCell.rowId) return entry;

      const next: Form6Entry = { ...entry };
      const parent = (next as any)[parentKey] || {};
      (next as any)[parentKey] = { ...parent, [childKey]: newValue };

      // If total_nodes edited, sync total_minutes
      if (parentKey === 'total_nodes') {
        const nodes = Number(newValue) || 0;
        next.total_minutes = {
          ...(next.total_minutes || {}),
          [childKey]: 24 * 60 * this.daysInMonth * nodes,
        };
      }

      return next;
    });

    this.cancelEdit();
  }

  cancelEdit(): void {
    this.editCell = { rowId: null, key: null, value: '' };
  }

  // -------------------------
  // Save All
  // -------------------------
  async saveAllChanges(): Promise<void> {
    if (!this.isEditingAllowed) return;

    try {
      await Promise.all(
        this.data.map((entry) => this.http.put(`/form6/update/${entry._id}`, entry).toPromise())
      );

      this.loadData();
      this.showToast('success', 'All changes have been saved successfully!');
    } catch (e) {
      console.error('Error saving data:', e);
      this.showToast('danger', 'Failed to save changes. Please try again.');
    }
  }

  // -------------------------
  // Excel Export (same structure as React)
  // -------------------------
  async exportToExcel(): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet('Network Availability');

    const areas = Object.keys(this.optionMapping);

    ws.addRow(['KPI (NW Availability - IP Core NW / BSR NW / Service Edge NW)']);
    ws.addRow([`Generated Date: ${new Date().toISOString().split('T')[0]}`]);
    ws.addRow([]);

    const headers = [
      'No',
      'Network Engineer KPI',
      'Division',
      'Section',
      'KPI Percent',
      ...areas.map((a) => this.optionMapping[a] || a),
    ];

    const headerRow = ws.addRow(headers);
    headerRow.eachCell((cell: ExcelJS.Cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0070C0' } };
      cell.font = { bold: true, color: { argb: 'FFFFFF' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    this.data.forEach((entry) => {
      const row: any[] = [
        entry.no,
        entry.network_engineer_kpi,
        entry.division,
        entry.section,
        entry.kpi_percent,
      ];

      areas.forEach((a) => {
        const k = this.norm(a);
        let pct = '';
        if (
          entry.total_minutes?.[k] !== undefined ||
          entry.unavailable_minutes?.[k] !== undefined ||
          entry.total_nodes?.[k] !== undefined
        ) {
          pct =
            this.calculatePercentage(
              entry.total_minutes?.[k],
              entry.unavailable_minutes?.[k],
              entry.total_nodes?.[k]
            ).toFixed(2) + '%';
        }
        row.push(pct);
      });

      const r = ws.addRow(row);
      r.eachCell((cell: ExcelJS.Cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });

      // Sub-rows
      const tm: any[] = ['', 'Total Minutes', '', '', ''];
      const um: any[] = ['', 'Unavailable Minutes', '', '', ''];
      const tn: any[] = ['', 'Total Nodes', '', '', ''];

      areas.forEach((a) => {
        const k = this.norm(a);
        tm.push(entry.total_minutes?.[k] ?? '');
        um.push(entry.unavailable_minutes?.[k] ?? '');
        tn.push(entry.total_nodes?.[k] ?? '');
      });

      [tm, um, tn].forEach((arr) => {
        const rr = ws.addRow(arr);
        rr.eachCell((cell: ExcelJS.Cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });
      });
    });

    ws.columns.forEach((column: Partial<ExcelJS.Column>) => {
      if (column) {
        column.width = 15;
      }
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `KPI_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
    link.click();

    URL.revokeObjectURL(link.href);
  }
}
