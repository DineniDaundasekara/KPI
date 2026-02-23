import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import * as ExcelJS from 'exceljs';

/* ================= TYPES ================= */

type RoutineRecord = {
  _id?: number;  // Changed from string to number (int identity)
  no?: number;
  kpi?: string;
  target?: string;
  calculation?: string;
  platform?: string;
  responsibleDGM?: string;
  definedOLADetails?: string;
  dataSources?: string;
};

type PlatformDetail = {
  Column1: string;
  Column2?: number | string;
  Column3?: number | string;
  Column4?: number | string;
};

type PlatformRecord = {
  month: string;
  details: PlatformDetail[];
};

type PlatformKey = 'msan' | 'vpn' | 'slbn';

type PlaceholderMap = Record<string, string>;
type TowerSumRecord = Record<string, number>;

type PlatformTableConfig = {
  key: PlatformKey;
  title: string;
  monthsLimit: number;
};

type MaintenanceRow = {
  routine: RoutineRecord;
  platformKey: PlatformKey | null;
};

/* ================= CONSTANTS ================= */

const PLATFORM_COLUMNS = [
  'NW/WPC-1','NW/WPC-2','NW/WPNE','NW/WPSW','NW/WPSE',
  'NW/WPE','NW/WPN','NW/NWPE','NW/NWPW','NW/CPN',
  'NW/CPS','NW/NCP','NW/UVA','NW/SAB','NW/SPE',
  'NW/SPW','NW/WPS','NW/EP','NW/NP-1','NW/NP-2'
];

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

/* ================= COMPONENT ================= */

@Component({
  selector: 'app-routine-mtnc',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './routine-mtnc.component.html',
  styleUrls: ['./routine-mtnc.component.scss']
})
export class RoutineMtncComponent implements OnInit {
  private readonly http = inject(HttpClient);

  pageTitle = 'Routine MTNC';
  heroSubtitle = 'Routine maintenance cadence across IPNW, INT & NT, and BB&ANW footprints.';

  readonly columns = PLATFORM_COLUMNS;
  readonly efiberSourceColumn = 'NW/WPC-1';
  readonly combinedTableStaticColumns = 8;

  readonly platformConfigs: PlatformTableConfig[] = [
    { key: 'msan', title: 'MSAN Data Table', monthsLimit: 6 },
    { key: 'vpn', title: 'VPN Data Table', monthsLimit: 2 },
    { key: 'slbn', title: 'SLBN Data Table', monthsLimit: 2 }
  ];

  loading = false;
  errorMessage = '';

  routineData: RoutineRecord[] = [];

  platformDataMap: Record<PlatformKey, PlatformRecord[]> = {
    msan: [],
    vpn: [],
    slbn: []
  };

  placeholderMap: Record<PlatformKey, PlaceholderMap> = {
    msan: this.buildDefaultPlaceholders(),
    vpn: this.buildDefaultPlaceholders(),
    slbn: this.buildDefaultPlaceholders()
  };

  towerSumsMap: Record<PlatformKey, TowerSumRecord> = {
    msan: {},
    vpn: {},
    slbn: {}
  };

  readonly currentMonth = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date());

  ngOnInit(): void {
    this.fetchData();
  }

  /* ================= GETTERS ================= */

  get maintenanceRows(): MaintenanceRow[] {
    return this.routineData.map((routine, index) => ({
      routine,
      platformKey: this.platformConfigs[index]?.key ?? null
    }));
  }

  get combinedTableColspan(): number {
    return this.combinedTableStaticColumns + 1 + this.columns.length;
  }

  /* ================= API ================= */

  fetchData(): void {
    this.loading = true;
    this.errorMessage = '';

    forkJoin({
      msan: this.http.get<PlatformRecord[]>('/api/multi-table/fetchMsan').pipe(catchError(() => of([]))),
      vpn: this.http.get<PlatformRecord[]>('/api/multi-table/fetchVpn').pipe(catchError(() => of([]))),
      slbn: this.http.get<PlatformRecord[]>('/api/multi-table/fetchSlbn').pipe(catchError(() => of([]))),
      routine: this.http.get<RoutineRecord[]>('/api/mtnc-routine').pipe(
        catchError(err => {
          console.error(err);
          this.setError('Unable to load routine KPI definitions.');
          return of([]);
        })
      )
    })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(({ msan, vpn, slbn, routine }) => {
        this.platformDataMap = { msan, vpn, slbn };
        this.routineData = routine ?? [];

        (['msan','vpn','slbn'] as PlatformKey[]).forEach(key => {
          this.placeholderMap[key] = this.calculatePlaceholderValues(this.platformDataMap[key], key);
          const cfg = this.platformConfigs.find(c => c.key === key);
          this.towerSumsMap[key] = cfg
            ? this.calculateTowerSums(this.platformDataMap[key], cfg.monthsLimit)
            : {};
        });
      });
  }

  /* ================= TEMPLATE METHODS ================= */

  getPlatformRecords(key: PlatformKey): PlatformRecord[] {
    return this.platformDataMap[key] ?? [];
  }

  exportToExcel(): void {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Routine Maintenance');

    const headers = [
      'No','KPI','Target','Calculation','Platform',
      'Responsible DGM','Defined OLA Details','Data Sources',
      'E/Fiber', ...this.columns
    ];

    worksheet.addRow(headers);

    this.maintenanceRows.forEach(row => {
      worksheet.addRow([
        row.routine.no ?? '',
        row.routine.kpi ?? '',
        row.routine.target ?? '',
        row.routine.calculation ?? '',
        row.routine.platform ?? '',
        row.routine.responsibleDGM ?? '',
        row.routine.definedOLADetails ?? '',
        row.routine.dataSources ?? '',
        this.placeholderMap[row.platformKey!]?.[this.efiberSourceColumn] ?? '',
        ...this.columns.map(c => this.placeholderMap[row.platformKey!]?.[c] ?? '')
      ]);
    });

    workbook.xlsx.writeBuffer().then(buffer => {
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'Routine_Maintenance_KPI.xlsx';
      link.click();
    });
  }

  /* ================= HELPERS ================= */

  formatRoutineValue(value?: string): string {
    return value?.trim() || 'No data';
  }

  formatPlaceholderValue(platformKey: PlatformKey | null, column: string): string {
    if (!platformKey) return 'No data';
    return `${this.placeholderMap[platformKey]?.[column] ?? '0.00'}%`;
  }

  getDetailValue(record: PlatformRecord, column: string, field: 'Column2' | 'Column3'): string {
    const detail = record.details?.find(d => d.Column1 === column);
    const val = detail?.[field];
    return val === undefined || val === null || val === '' ? 'No data' : String(val);
  }

  getTowerSum(key: PlatformKey, column: string): number {
    return this.towerSumsMap[key]?.[column] ?? 0;
  }

  trackByMaintenanceRow = (_: number, item: MaintenanceRow) =>
    `${item.routine.no}-${item.platformKey}`;
  trackByColumn = (_: number, column: string) => column;
  trackByMonth = (_: number, record: PlatformRecord) => record.month;

  /* ================= CALCULATIONS ================= */

  private buildDefaultPlaceholders(): PlaceholderMap {
    const map: PlaceholderMap = {};
    PLATFORM_COLUMNS.forEach(c => (map[c] = '100.00'));
    return map;
  }

  private calculatePlaceholderValues(data: PlatformRecord[], platform: PlatformKey): PlaceholderMap {
    const result = this.buildDefaultPlaceholders();
    if (!data.length) return result;

    const months = this.getTargetMonths(platform);
    if (!months.length) return result;

    PLATFORM_COLUMNS.forEach(column => {
      let achieved = 0;
      let total = 0;

      months.forEach(m => {
        const entry = data.find(d => d.month === m);
        const detail = entry?.details?.find(d => d.Column1 === column);
        if (detail) {
          achieved += Number(detail.Column3) || 0;
          total += Number(platform === 'msan' ? detail.Column4 : detail.Column2) || 0;
        }
      });

      result[column] = total ? ((achieved / total) * 100).toFixed(2) : '0.00';
    });

    return result;
  }

  private calculateTowerSums(data: PlatformRecord[], limit: number): TowerSumRecord {
    const sums: TowerSumRecord = {};
    data.slice(0, limit).forEach(entry => {
      entry.details?.forEach(d => {
        sums[d.Column1] = (sums[d.Column1] ?? 0) + (Number(d.Column2) || 0);
      });
    });
    return sums;
  }

  private getTargetMonths(platform: PlatformKey): string[] {
    if (platform === 'msan') {
      if (this.currentMonth === 'June') return MONTH_NAMES.slice(0, 6);
      if (this.currentMonth === 'December') return MONTH_NAMES.slice(5);
      return [];
    }

    const valid = ['February','April','June','August','October','December'];
    if (!valid.includes(this.currentMonth)) return [];

    const idx = MONTH_NAMES.indexOf(this.currentMonth);
    return [MONTH_NAMES[idx - 1], this.currentMonth];
  }

  private setError(msg: string): void {
    if (!this.errorMessage) this.errorMessage = msg;
  }
}
