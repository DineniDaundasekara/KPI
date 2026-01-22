import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';
import { Form4ApiService, ServiceFulfilmentKpi, ServiceFulfilmentMetric } from '../../../../services/form4api.service';
import { RegionService, Region } from '../../../../services/region.service';

interface KpiData {
  _id: { $oid: string } | number;
  no: number;
  kpi: string;
  target: string;
  calculation: string;
  platform: string;
  responsibledgm: string;
  definedoladetails: string;
  weightage: string;
  datasources: string;
  areas?: { [key: string]: number };
  updatedAt?: { $date: string };
  __v?: number;
  [key: string]: any; // For dynamic area columns
}

interface RegionData {
  id?: number;
  region: string;
  province: string;
  networkEngineer: string;
  lea: string;
}

@Component({
  selector: 'app-service-fulfilment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './service-fulfilment.component.html',
  styleUrls: ['./service-fulfilment.component.scss']
})
export class ServiceFulfilmentComponent implements OnInit {
  pageTitle = 'Platform KPI — Service Fulfilment';
  
  // Form values
  formValues = {
    dropdown1: '',
    dropdown2: '',
    dropdown3: '',
    dropdown4: ''
  };

  // Data
  data: KpiData[] = [];
  regionTable: RegionData[] = [];
  adminKpiRows: ServiceFulfilmentKpi[] = [];
  editingCell: { rowId: string | number | null, key: string | null } = { rowId: null, key: null };
  
  // Dropdown options
  dropdown2Options: string[] = [];
  dropdown3Options: string[] = [];
  dropdown4Options: string[] = [];
  
  // Columns
  visibleColumns: string[] = [];
  
  // States
  loading = true;
  error: string | null = null;
  isEditingAllowed = true;
  userRole: string = 'user';
  private editingMessageShown = false;
  
  // Constants
  nonEditableColumns = [
    'no', 'kpi', 'target', 'calculation', 'platform', 'responsibledgm',
    'definedoladetails', 'weightage', 'datasources'
  ];

  baseColumns = [
    'no', 'kpi', 'target', 'calculation', 'platform', 'responsibledgm',
    'definedoladetails', 'weightage', 'datasources'
  ];

  headerMapping: { [key: string]: string } = {
    no: 'No',
    kpi: 'KPI',
    target: 'Target',
    calculation: 'Calculation',
    platform: 'Platform',
    responsibledgm: 'Responsible DGM',
    definedoladetails: 'Defined OLA Details',
    weightage: 'Weightage',
    datasources: 'Data Sources'
  };

  optionMapping: { [key: string]: string } = {
    CENHKMD: 'CEN/HK/MD',
    CENHKMD1: 'CEN/HK/MD 1',
    GQKINTB: 'GQ / KI / NTB',
    NDRM: 'ND / RM',
    AWHO: 'AW / HO',
    KONKX: 'KON / KK',
    NGWT: 'NG / WT',
    KGKLY: 'KG / KLY',
    CWPX: 'CW / PX',
    DBKYMT: 'DB / KY / MT',
    GPHTNW: 'GP / HT / NW',
    ADPR: 'AD / PR',
    BDBWMRG: 'BD / BW / MRG',
    KERN: 'KE / RN',
    EBMHMBH: 'EMB / HB / MH',
    AGGL: 'AG / GL',
    HRKTPH: 'HR / KT / PH',
    BCAPKLTC: 'BC / AP / KL / TC',
    JA: 'JA',
    KOMLTMBVA: 'KO / MLT / MB / VA'
  };

  metricsRows: ServiceFulfilmentMetric[] = [];
  metricsLoading = false;
  metricsError: string | null = null;

  selectedMonth = new Date().getMonth() + 1;
  selectedYear = new Date().getFullYear();
  private periodLockedByUser = false;
  readonly monthOptions = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];
  yearOptions: number[] = [];

  // Region data (simplified for now - in real app, this would come from API)
  regionData: RegionData[] = [
    { id: 1, region: 'Region 3', province: 'NP', networkEngineer: 'NW/NP-2', lea: 'KOMLTMBVA' },
    { id: 2, region: 'Region 3', province: 'NP', networkEngineer: 'NW/NP-1', lea: 'JA' },
    { id: 3, region: 'Region 3', province: 'EP', networkEngineer: 'NW/EP', lea: 'BCAPKLTC' },
    { id: 4, region: 'Region 2', province: 'WPS & SP', networkEngineer: 'NW/WPS', lea: 'HRKTPH' },
    { id: 5, region: 'Region 2', province: 'WPS & SP', networkEngineer: 'NW/SPW', lea: 'AGGL' },
    { id: 6, region: 'Region 2', province: 'WPS & SP', networkEngineer: 'NW/SPE', lea: 'EBMHMBH' },
    { id: 7, region: 'Region 2', province: 'SAB & UVA', networkEngineer: 'NW/SAB', lea: 'KERN' },
    { id: 8, region: 'Region 2', province: 'SAB & UVA', networkEngineer: 'NW/UVA', lea: 'BDBWMRG' },
    { id: 9, region: 'Region 1', province: 'CP & NCP', networkEngineer: 'NW/NCP', lea: 'ADPR' },
    { id: 10, region: 'Region 1', province: 'CP & NCP', networkEngineer: 'NW/CPS', lea: 'GPHTNW' },
    { id: 11, region: 'Region 1', province: 'CP & NCP', networkEngineer: 'NW/CPN', lea: 'DBKYMT' },
    { id: 12, region: 'Region 1', province: 'WPN & NWP', networkEngineer: 'NW/NWPW', lea: 'CWPX' },
    { id: 13, region: 'Region 1', province: 'WPN & NWP', networkEngineer: 'NW/NWPE', lea: 'KGKLY' },
    { id: 14, region: 'Region 1', province: 'WPN & NWP', networkEngineer: 'NW/WPN', lea: 'NGWT' },
    { id: 15, region: 'Metro', province: 'Metro 2', networkEngineer: 'NWWPE', lea: 'KONKX' },
    { id: 16, region: 'Metro', province: 'Metro 2', networkEngineer: 'NWWPSE', lea: 'AWHO' },
    { id: 17, region: 'Metro', province: 'Metro 2', networkEngineer: 'NWWPSW', lea: 'NDRM' },
    { id: 18, region: 'Metro', province: 'Metro 1', networkEngineer: 'NWWPNE', lea: 'GQKINTB' },
    { id: 19, region: 'Metro', province: 'Metro 1', networkEngineer: 'NWWPC-2 (CEN/HKMD)', lea: 'CENHKMD' },
    { id: 20, region: 'Metro', province: 'Metro 1', networkEngineer: 'NWWPC-1 (CEN/HK/MD)', lea: 'CENHKMD1' }
  ];

  constructor(
    private toastr: ToastrService,
    private form4Api: Form4ApiService,
    private regionService: RegionService
  ) {
    this.yearOptions = this.generateYearOptions();
  }

  toggleRoleSimulation() {
    this.userRole = this.userRole === 'padmin' ? 'user' : 'padmin';
    this.recomputeEditPermission();
    this.toastr.info(
      `Simulated as ${this.userRole === 'padmin' ? 'Platform Admin' : 'User'}.`,
      'Role Simulation'
    );
  }

  ngOnInit() {
    this.loadRegionTable();
    this.loadData();
    this.checkUserRole();
    this.setupEditPermissionCheck();
  }

  loadData() {
    this.loading = true;
    this.form4Api.getAll().subscribe({
      next: (kpis) => {
        const rows = Array.isArray(kpis) ? kpis : [];
        this.adminKpiRows = rows;
        this.syncSelectedPeriodFromData(rows);
        this.rebuildKpiMatrix();
        this.loading = false;
        this.loadMetrics();
      },
      error: (err) => {
        console.error('Failed to load Service Fulfilment admin data:', err);
        this.adminKpiRows = [];
        this.loading = false;
        this.error = 'Failed to load Service Fulfilment KPI data.';
      }
    });
  }

  loadMetrics() {
    const month = Number(this.selectedMonth);
    const year = Number(this.selectedYear);
    if (!month || !year) {
      console.warn('Service Fulfilment: Cannot load metrics - month or year not set', { month, year });
      return;
    }

    this.metricsLoading = true;
    this.metricsError = null;

    const areaFilter = this.resolveAreaCode(this.formValues.dropdown4);

    console.log('Service Fulfilment: Loading metrics', { month, year, areaFilter });

    this.form4Api.getMetrics(month, year, areaFilter || undefined).subscribe({
      next: (metrics) => {
        console.log('Service Fulfilment: Metrics loaded', { count: metrics?.length, metrics: metrics?.slice(0, 3) });
        this.metricsRows = Array.isArray(metrics) ? metrics : [];
        
        // If we got metrics, sync the period from them (in case admin rows had wrong period)
        if (this.metricsRows.length > 0 && !this.periodLockedByUser) {
          const firstMetric = this.metricsRows[0];
          if (firstMetric.month && firstMetric.year) {
            if (firstMetric.month !== this.selectedMonth || firstMetric.year !== this.selectedYear) {
              console.log('Service Fulfilment: Syncing period from metrics', {
                from: { month: this.selectedMonth, year: this.selectedYear },
                to: { month: firstMetric.month, year: firstMetric.year }
              });
              this.selectedMonth = firstMetric.month;
              this.selectedYear = firstMetric.year;
            }
          }
        }
        
        this.metricsLoading = false;
        this.rebuildKpiMatrix();
        console.log('Service Fulfilment: KPI matrix rebuilt', { 
          dataRows: this.data.length, 
          areaKeys: this.getAreaKeys(),
          visibleColumns: this.visibleColumns 
        });
      },
      error: (err) => {
        console.error('Failed to load Service Fulfilment metrics:', err);
        this.metricsRows = [];
        this.metricsLoading = false;
        this.metricsError = `Failed to load KPI metrics for ${this.getMonthLabel(month)} ${year}. Please check if data exists for this period.`;
        this.rebuildKpiMatrix();
      }
    });
  }

  loadRegionTable() {
    this.regionService.getAll().subscribe({
      next: (res: Region[] | any[]) => {
        const source = Array.isArray(res) ? res : [];
        const mapped: RegionData[] = source.map((item: any) => ({
          region: item.region ?? item.Region ?? '',
          province: item.province ?? item.Province ?? '',
          networkEngineer: item.networkEngineer ?? item.networkengineer ?? item.NetworkEngineer ?? '',
          lea: item.lea ?? item.leacode ?? item.leaCode ?? item.LEA ?? ''
        }));
        this.regionTable = mapped.length ? mapped : [...this.regionData];
      },
      error: (err) => {
        console.error('Failed to fetch region table from API, using local fallback:', err);
        this.regionTable = [...this.regionData];
      }
    });
  }

  checkUserRole() {
    // In real app, get from auth service or localStorage
    const token = localStorage.getItem('token');
    if (token) {
      // Decode token or make API call to get role
      this.userRole = 'padmin'; // Default for testing
    } else {
      this.userRole = 'user';
    }
    this.recomputeEditPermission();
  }

  setupEditPermissionCheck() {
    this.checkEditPermission();
    // Check permission every minute
    setInterval(() => {
      this.checkEditPermission();
    }, 60000);
  }

  checkEditPermission(): boolean {
    // Only platform admins can edit
    this.recomputeEditPermission();
    return this.isEditingAllowed;
  }

  private recomputeEditPermission() {
    const roleAllowsEdit = this.userRole === 'padmin';
    const hasAreaFilter = !!this.formValues.dropdown4;
    this.isEditingAllowed = roleAllowsEdit && hasAreaFilter;
  }

  private generateYearOptions(span: number = 10): number[] {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - (span - 1);
    const years: number[] = [];
    for (let year = startYear; year <= currentYear; year++) {
      years.push(year);
    }
    return years;
  }

  getUniqueRegions(): string[] {
    return Array.from(new Set(this.regionTable.map(r => r.region))).filter(Boolean);
  }

  getMonthLabel(value: number): string {
    const month = this.monthOptions.find(option => option.value === value);
    return month?.label ?? `M${value}`;
  }

  private rebuildKpiMatrix() {
    if (!this.metricsRows.length) {
      console.log('Service Fulfilment: No metrics, building base data from admin rows', { adminRows: this.adminKpiRows.length });
      this.data = this.buildBaseKpiDataFromAdmin();
      this.visibleColumns = [...this.baseColumns];
      return;
    }
    console.log('Service Fulfilment: Building KPI matrix from metrics', { metricsCount: this.metricsRows.length });
    this.data = this.buildKpiDataFromMetrics(this.metricsRows);
    this.refreshColumnsFromData();
    console.log('Service Fulfilment: Columns refreshed', { visibleColumns: this.visibleColumns.length, columns: this.visibleColumns });
  }

  private buildBaseKpiDataFromAdmin(): KpiData[] {
    if (!this.adminKpiRows.length) {
      return [];
    }

    return this.adminKpiRows.map((kpi, index) => ({
      _id: kpi.id ? { $oid: kpi.id } : kpi.no ?? index + 1,
      no: kpi.no,
      kpi: kpi.kpi,
      target: kpi.target,
      calculation: kpi.calculation ?? '',
      platform: kpi.platform ?? '',
      responsibledgm: kpi.responsibleDgm ?? '',
      definedoladetails: kpi.definedoladetails ?? '',
      weightage: this.formatWeightageValue(kpi.weightage),
      datasources: kpi.dataSources ?? '',
      areas: {}
    }));
  }

  private syncSelectedPeriodFromData(rows: ServiceFulfilmentKpi[]) {
    if (this.periodLockedByUser || !rows || !rows.length) {
      console.log('Service Fulfilment: Period sync skipped', { 
        periodLocked: this.periodLockedByUser, 
        rowsCount: rows?.length || 0 
      });
      return;
    }

    const ordered = rows
      .filter(row => row.month > 0 && row.year > 0)
      .sort((a, b) => {
        if (a.year === b.year) {
          return a.month - b.month;
        }
        return a.year - b.year;
      });

    console.log('Service Fulfilment: Period sync from admin rows', {
      totalRows: rows.length,
      rowsWithPeriod: ordered.length,
      currentPeriod: { month: this.selectedMonth, year: this.selectedYear }
    });

    if (!ordered.length) {
      console.warn('Service Fulfilment: No admin rows with valid month/year found');
      return;
    }

    const latest = ordered[ordered.length - 1];
    const periodChanged = latest.year !== this.selectedYear || latest.month !== this.selectedMonth;

    if (periodChanged) {
      console.log('Service Fulfilment: Period changed', {
        from: { month: this.selectedMonth, year: this.selectedYear },
        to: { month: latest.month, year: latest.year }
      });
      this.selectedYear = latest.year;
      this.selectedMonth = latest.month;
    } else {
      console.log('Service Fulfilment: Period unchanged', {
        month: this.selectedMonth,
        year: this.selectedYear
      });
    }
  }

  private buildKpiDataFromMetrics(metrics: ServiceFulfilmentMetric[]): KpiData[] {
    if (!metrics || !metrics.length) {
      return [];
    }

    const masterById = new Map<string, ServiceFulfilmentKpi>();
    const masterByNo = new Map<number, ServiceFulfilmentKpi>();

    this.adminKpiRows.forEach((kpi) => {
      if (kpi.id) {
        masterById.set(kpi.id, kpi);
      }
      masterByNo.set(kpi.no, kpi);
    });

    const grouped = new Map<string, KpiData>();

    metrics.forEach((metric) => {
      const groupKey = metric.id ?? metric.no.toString();
      if (!grouped.has(groupKey)) {
        const master = (metric.id ? masterById.get(metric.id) : undefined) ?? masterByNo.get(metric.no);
        grouped.set(groupKey, {
          _id: metric.id ? { $oid: metric.id } : metric.no,
          no: master?.no ?? metric.no,
          kpi: master?.kpi ?? metric.kpi ?? '',
          target: master?.target ?? metric.target ?? '',
          calculation: master?.calculation ?? '',
          platform: master?.platform ?? metric.platform ?? '',
          responsibledgm: master?.responsibleDgm ?? metric.responsibleDgm ?? '',
          definedoladetails: master?.definedoladetails ?? '',
          weightage: this.formatWeightageValue(master?.weightage ?? metric.weightage),
          datasources: master?.dataSources ?? '',
          areas: {}
        });
      }

      const row = grouped.get(groupKey)!;
      // Use the area code directly from the metric
      const areaCode = metric.area ? metric.area.trim().toUpperCase() : '';
      // Normalize it to get the standard area key
      const areaKey = this.normalizeAreaKey(areaCode);
      
      console.log('Service Fulfilment: Building metric row', { 
        no: row.no, 
        areaCode, 
        areaKey, 
        kpiValue: metric.kpiValue,
        form4Dropdown4: this.formValues.dropdown4
      });
      
      if (!row.areas) {
        row.areas = {};
      }
      
      // Store the value using the normalized key (this is what will be used for lookup)
      row.areas[areaKey] = metric.kpiValue;
      row[areaKey] = metric.kpiValue;
      
      // Also store with the original area code from database (in case it differs)
      if (areaCode && areaCode !== areaKey) {
        row.areas[areaCode] = metric.kpiValue;
        row[areaCode] = metric.kpiValue;
      }
      
      // If we have a filtered area, also store it with that exact key
      if (this.formValues.dropdown4 && this.formValues.dropdown4 !== areaKey && this.formValues.dropdown4 !== areaCode) {
        row.areas[this.formValues.dropdown4] = metric.kpiValue;
        row[this.formValues.dropdown4] = metric.kpiValue;
      }
    });

    const result = Array.from(grouped.values()).sort((a, b) => a.no - b.no);
    console.log('Service Fulfilment: Built KPI data', { 
      rowCount: result.length,
      firstRowAreas: result[0]?.areas,
      firstRowKeys: result[0] ? Object.keys(result[0]).filter(k => !this.baseColumns.includes(k) && k !== '_id' && k !== '__v') : []
    });
    return result;
  }

  private normalizeAreaValue(value?: string | null): string {
    return value ? value.replace(/[^A-Za-z0-9]/g, '').toUpperCase() : '';
  }

  private resolveAreaCode(value?: string | null): string {
    const normalized = this.normalizeAreaValue(value);
    if (!normalized) {
      return '';
    }

    const directMatch = Object.keys(this.optionMapping).find(
      key => this.normalizeAreaValue(key) === normalized
    );
    if (directMatch) {
      return directMatch;
    }

    const labelMatch = Object.entries(this.optionMapping).find(
      ([key, label]) => this.normalizeAreaValue(label) === normalized
    );
    if (labelMatch) {
      return labelMatch[0];
    }

    return normalized;
  }

  private normalizeAreaKey(area?: string | null): string {
    const resolved = this.resolveAreaCode(area);
    return resolved || 'UNKNOWN';
  }

  private formatWeightageValue(value?: number | string | null): string {
    if (value === undefined || value === null) {
      return '';
    }
    if (typeof value === 'number') {
      return `${value}%`;
    }
    const clean = value.toString().trim();
    return clean.endsWith('%') ? clean : `${clean}%`;
  }

  updateDropdown2Options() {
    if (!this.formValues.dropdown1) {
      this.dropdown2Options = [];
      this.formValues.dropdown2 = '';
      return;
    }
    const provinces = Array.from(
      new Set(
        this.regionTable
          .filter(x => x.region === this.formValues.dropdown1)
          .map(x => x.province)
      )
    ).filter(Boolean);
    this.dropdown2Options = provinces;
    this.formValues.dropdown2 = '';
    this.dropdown3Options = [];
    this.formValues.dropdown3 = '';
    this.dropdown4Options = [];
    this.formValues.dropdown4 = '';
    this.visibleColumns = [...this.baseColumns];
  }

  updateDropdown3Options() {
    if (!this.formValues.dropdown2 || !this.formValues.dropdown1) {
      this.dropdown3Options = [];
      this.formValues.dropdown3 = '';
      return;
    }
    const engineers = Array.from(
      new Set(
        this.regionTable
          .filter(x => 
            x.region === this.formValues.dropdown1 && 
            x.province === this.formValues.dropdown2
          )
          .map(x => x.networkEngineer)
      )
    ).filter(Boolean);
    this.dropdown3Options = engineers;
    this.formValues.dropdown3 = '';
    this.dropdown4Options = [];
    this.formValues.dropdown4 = '';
    this.visibleColumns = [...this.baseColumns];
  }

  updateDropdown4Options() {
    if (!this.formValues.dropdown3 || !this.formValues.dropdown1 || !this.formValues.dropdown2) {
      this.dropdown4Options = [];
      this.formValues.dropdown4 = '';
      this.loadMetrics();
      this.recomputeEditPermission();
      return;
    }
    const leas = this.regionTable
      .filter(x => 
        x.region === this.formValues.dropdown1 &&
        x.province === this.formValues.dropdown2 &&
        x.networkEngineer === this.formValues.dropdown3
      )
      .map(x => this.resolveAreaCode(x.lea))
      .filter(code => !!code);

    this.dropdown4Options = Array.from(new Set(leas));
    this.formValues.dropdown4 = '';
    this.visibleColumns = [...this.baseColumns];
    this.loadMetrics();
    this.recomputeEditPermission();
  }

  updateVisibleColumns() {
    this.refreshColumnsFromData();
  }

  onDropdownChange(field: string, value: string) {
    const normalizedValue = field === 'dropdown4' ? this.resolveAreaCode(value) : value;
    (this.formValues as any)[field] = normalizedValue;
    
    switch (field) {
      case 'dropdown1':
        this.formValues.dropdown2 = '';
        this.formValues.dropdown3 = '';
        this.formValues.dropdown4 = '';
        this.dropdown3Options = [];
        this.dropdown4Options = [];
        this.visibleColumns = [...this.baseColumns];
        this.updateDropdown2Options();
        this.loadMetrics();
        this.recomputeEditPermission();
        break;
      case 'dropdown2':
        this.formValues.dropdown3 = '';
        this.formValues.dropdown4 = '';
        this.dropdown4Options = [];
        this.visibleColumns = [...this.baseColumns];
        this.updateDropdown3Options();
        this.loadMetrics();
        this.recomputeEditPermission();
        break;
      case 'dropdown3':
        this.formValues.dropdown4 = '';
        this.visibleColumns = [...this.baseColumns];
        this.updateDropdown4Options();
        this.recomputeEditPermission();
        break;
      case 'dropdown4':
        this.updateVisibleColumns();
        this.loadMetrics();
        this.recomputeEditPermission();
        break;
    }
  }

  onPeriodChange() {
    this.periodLockedByUser = true;
    this.loadMetrics();
  }

  resetAreaFilter() {
    if (!this.formValues.dropdown4) {
      return;
    }
    this.formValues.dropdown4 = '';
    this.updateVisibleColumns();
    this.loadMetrics();
    this.recomputeEditPermission();
  }

  formatPercent(val: any): string {
    if (val === undefined || val === null || val === '') return '-';
    if (typeof val === 'number') {
      // Format to 2 decimal places
      return `${val.toFixed(2)}%`;
    }
    const s = String(val).trim();
    // Remove existing % and add back
    const cleanValue = s.replace(/%/g, '');
    const numValue = parseFloat(cleanValue);
    if (!isNaN(numValue)) {
      return `${numValue.toFixed(2)}%`;
    }
    return s.endsWith('%') ? s : `${s}%`;
  }

  getCellValue(item: KpiData, key: string): any {
    // First check direct property
    if (item[key] !== undefined && item[key] !== null && item[key] !== '') {
      return item[key];
    }
    
    // Then check areas object with exact key
    if (item.areas && typeof item.areas === 'object' && item.areas[key] !== undefined) {
      return item.areas[key];
    }
    
    // Try to normalize key for area lookup
    const normalizedKey = this.normalizeAreaKey(key);
    if (normalizedKey && item.areas && item.areas[normalizedKey] !== undefined) {
      return item.areas[normalizedKey];
    }
    
    // Try resolving the area code (in case key is a display label)
    const resolvedKey = this.resolveAreaCode(key);
    if (resolvedKey && item.areas && item.areas[resolvedKey] !== undefined) {
      return item.areas[resolvedKey];
    }
    
    // Try direct uppercase match
    const upperKey = key.toUpperCase().trim();
    if (upperKey && item.areas && item.areas[upperKey] !== undefined) {
      return item.areas[upperKey];
    }
    
    // Debug logging for area columns that return null
    if (!this.baseColumns.includes(key) && item.areas) {
      console.warn('Service Fulfilment: Could not find value for area column', {
        key,
        normalizedKey,
        resolvedKey,
        upperKey,
        availableAreas: Object.keys(item.areas),
        availableDirectKeys: Object.keys(item).filter(k => !this.baseColumns.includes(k) && k !== '_id' && k !== '__v' && typeof item[k] === 'number')
      });
    }
    
    return null;
  }

  getRowId(item: KpiData): string | number {
    if (typeof item._id === 'object' && item._id.$oid) {
      return item._id.$oid;
    }
    return item._id as number;
  }

  isEditingCell(item: KpiData, key: string): boolean {
    return (
      this.editingCell.rowId === this.getRowId(item) &&
      this.editingCell.key === key
    );
  }

  selectMetricInput(event: Event) {
    const target = event.target as HTMLInputElement | null;
    if (!target) {
      return;
    }
    requestAnimationFrame(() => target.select());
  }

  startEdit(item: KpiData, key: string) {
    if (this.nonEditableColumns.includes(key)) {
      return;
    }

    if (!this.isEditingAllowed) {
      if (!this.editingMessageShown) {
        if (this.userRole !== 'padmin') {
          this.toastr.error('Only Platform Admins can edit KPI values.', 'Access Denied');
        } else {
          this.toastr.info('Select an RTOM area to enable inline editing.', 'Filter Required');
        }
        this.editingMessageShown = true;
        setTimeout(() => (this.editingMessageShown = false), 3000);
      }
      return;
    }
    this.editingCell = { rowId: this.getRowId(item), key };
  }

  cancelEdit() {
    this.editingCell = { rowId: null, key: null };
  }

  saveEdit(item: KpiData, key: string) {
    // In real implementation, this would update the backend
    this.editingCell = { rowId: null, key: null };
    this.toastr.success(`Updated ${this.headerMapping[key] || key} successfully!`, 'Success');
  }

  handleFieldChange(event: Event, rowId: string | number, key: string) {
    if (!this.isEditingAllowed) return;
    
    const input = event.target as HTMLInputElement;
    const value = input.value;
    
    this.data = this.data.map(item => {
      const currentRowId = this.getRowId(item);
      if (currentRowId !== rowId) return item;
      
      const updatedItem = { ...item };
      
      // Try to parse as number
      const cleanValue = value.replace(/%/g, '').trim();
      const numValue = parseFloat(cleanValue);
      
      if (!isNaN(numValue)) {
        updatedItem[key] = numValue;
        if (updatedItem.areas) {
          updatedItem.areas[key] = numValue;
        }
      } else {
        updatedItem[key] = value;
      }
      
      return updatedItem;
    });
  }

  saveAllChanges() {
    if (!this.isEditingAllowed) {
      this.toastr.error('You do not have permission to edit. Only Platform Admins can edit KPI data.', 'Permission Denied');
      return;
    }

    this.loading = true;
    
    // Simulate API call
    setTimeout(() => {
      this.loading = false;
      this.editingCell = { rowId: null, key: null };
      this.toastr.success('✅ All changes have been saved successfully!', 'Success', {
        timeOut: 2500,
        progressBar: true
      });
    }, 1500);
  }

  generateExcelReport() {
    this.loading = true;
    
    setTimeout(() => {
      this.loading = false;
      
      // Create Excel workbook
      const dataToExport = this.data.map(item => {
        const row: any = {};
        
        // Add all columns
        this.getColumnsToRender().forEach(col => {
          const value = this.getCellValue(item, col);
          row[this.headerMapping[col] || this.optionMapping[col] || col] = 
            this.nonEditableColumns.includes(col) ? value : this.formatPercent(value);
        });
        
        return row;
      });
      
      // Convert to Excel
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'KPI Report');
      
      // Generate and download
      const date = new Date().toISOString().split('T')[0];
      const filename = `KPI_Report_${date}.xlsx`;
      XLSX.writeFile(workbook, filename);
      
      this.toastr.success(`Excel report "${filename}" generated successfully!`, 'Report Generated');
    }, 2000);
  }

  getColumnsToRender(): string[] {
    const areaKeys = this.getAreaKeys();

    // When a specific area is selected, prioritize it
    if (this.formValues.dropdown4) {
      return [...this.baseColumns, this.formValues.dropdown4];
    }

    // Otherwise render all discovered area columns
    if (areaKeys.length) {
      return [...this.baseColumns, ...areaKeys];
    }

    // Fallback to base columns
    return this.baseColumns;
  }

  getAreaKeys(): string[] {
    const keys = new Set<string>();
    this.data.forEach(item => {
      // Check areas object first
      if (item.areas && typeof item.areas === 'object') {
        Object.keys(item.areas).forEach(key => {
          if (key && key !== 'UNKNOWN') {
            keys.add(key);
          }
        });
      }
      // Also check direct properties that look like area codes
      Object.keys(item).forEach(key => {
        // Match area codes: uppercase letters, 3-12 characters, not in base columns
        if (/^[A-Z0-9]+$/.test(key) && key.length >= 3 && key.length <= 12 && !this.baseColumns.includes(key) && key !== '_id' && key !== '__v') {
          keys.add(key);
        }
      });
    });
    
    // Sort area keys for consistent display
    const sortedKeys = Array.from(keys).sort();
    
    // Filter out any keys that are in optionMapping (these are valid area codes)
    // or ensure all valid area codes from optionMapping that have data are included
    const validAreaCodes = Object.keys(this.optionMapping);
    const result = new Set<string>();
    
    // Add all keys that match valid area codes
    sortedKeys.forEach(key => {
      if (validAreaCodes.includes(key) || validAreaCodes.some(code => this.normalizeAreaValue(code) === this.normalizeAreaValue(key))) {
        result.add(key);
      }
    });
    
    // Also add any keys that have actual data (non-null values)
    this.data.forEach(item => {
      sortedKeys.forEach(key => {
        const value = item[key] ?? (item.areas && item.areas[key]);
        if (value !== null && value !== undefined && value !== '') {
          result.add(key);
        }
      });
    });
    
    return Array.from(result).sort();
  }

  private refreshColumnsFromData() {
    const areaKeys = this.getAreaKeys();
    if (this.formValues.dropdown4) {
      // When a specific area is selected, use the resolved area code
      const selectedAreaKey = this.resolveAreaCode(this.formValues.dropdown4) || this.formValues.dropdown4;
      console.log('Service Fulfilment: Refreshing columns with selected area', {
        dropdown4: this.formValues.dropdown4,
        selectedAreaKey,
        areaKeys,
        hasData: this.data.length > 0,
        firstRowAreas: this.data[0]?.areas
      });
      this.visibleColumns = [...this.baseColumns, selectedAreaKey];
      return;
    }
    if (areaKeys.length) {
      console.log('Service Fulfilment: Refreshing columns with all area keys', { areaKeys });
      this.visibleColumns = [...this.baseColumns, ...areaKeys];
      return;
    }
    console.log('Service Fulfilment: Refreshing columns - base columns only');
    this.visibleColumns = [...this.baseColumns];
  }

  getLastUpdated(item: KpiData): string {
    if (item.updatedAt && item.updatedAt.$date) {
      const date = new Date(item.updatedAt.$date);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return 'N/A';
  }
}