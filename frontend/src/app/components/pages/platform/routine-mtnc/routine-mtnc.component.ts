import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { catchError, finalize } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';
import * as ExcelJS from 'exceljs';

type RoutineRecord = {
  _id?: string;
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

const PLATFORM_COLUMNS = [
  'NW/WPC-1',
  'NW/WPC-2',
  'NW/WPNE',
  'NW/WPSW',
  'NW/WPSE',
  'NW/WPE',
  'NW/WPN',
  'NW/NWPE',
  'NW/NWPW',
  'NW/CPN',
  'NW/CPS',
  'NW/NCP',
  'NW/UVA',
  'NW/SAB',
  'NW/SPE',
  'NW/SPW',
  'NW/WPS',
  'NW/EP',
  'NW/NP-1',
  'NW/NP-2'
];

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

const ROUTINE_FALLBACK: RoutineRecord[] = [
  {
    no: 1,
    kpi: 'Routing maintenance - IPNW (every two months)',
    target: '100.000%',
    calculation: '# completed nodes / Total # Nodes',
    platform: 'IPNW',
    responsibleDGM: 'NW Mng',
    definedOLADetails: 'Every 2 Months',
    dataSources: 'NW Report'
  },
  {
    no: 2,
    kpi: 'Routing maintenance - SDH/SLBN (every two months)',
    target: '100.000%',
    calculation: '# completed nodes / Total # Nodes',
    platform: 'Int & NT',
    responsibleDGM: 'NW Mng',
    definedOLADetails: 'Every 2 Months',
    dataSources: 'NW Report'
  },
  {
    no: 3,
    kpi: 'Routing maintenance - MSAN/OLTE (every six months)',
    target: '100.000%',
    calculation: '# completed nodes / Total # Nodes',
    platform: 'BB&ANW',
    responsibleDGM: 'NW Mng',
    definedOLADetails: 'Every 4 Months',
    dataSources: 'NW Report'
  }
];

@Component({
  selector: 'app-routine-mtnc',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './routine-mtnc.component.html',
  styleUrls: ['./routine-mtnc.component.scss']
})
export class RoutineMtncComponent implements OnInit {
  private readonly http = inject(HttpClient);

  pageTitle = 'Platform KPI — Routine MTNC';
  readonly columns = PLATFORM_COLUMNS;
  readonly heroSubtitle = 'Routine maintenance cadence across IPNW, INT & NT, and BB&ANW footprints.';
  readonly efiberSourceColumn = 'NW/WPC-1';
  readonly combinedTableStaticColumns = 8;
  readonly platformConfigs: PlatformTableConfig[] = [
    { key: 'msan', title: 'MSAN Data Table', monthsLimit: 6 },
    { key: 'vpn', title: 'VPN Data Table', monthsLimit: 2 },
    { key: 'slbn', title: 'SLBN Data Table', monthsLimit: 2 }
  ];

  loading = false;
  errorMessage = '';
  routineData: RoutineRecord[] = [...ROUTINE_FALLBACK];
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

  get maintenanceRows(): MaintenanceRow[] {
    return this.routineData.map((routine, index) => ({
      routine,
      platformKey: this.platformConfigs[index]?.key ?? null
    }));
  }

  get combinedTableColspan(): number {
    return this.combinedTableStaticColumns + 1 + this.columns.length;
  }

  fetchData(): void {
    this.loading = true;
    this.errorMessage = '';

    forkJoin({
      msan: this.http.get<PlatformRecord[]>('/api/multi-table/fetchMsan').pipe(
        catchError(err => {
          console.error('Failed to fetch MSAN data', err);
          this.setError('Unable to load MSAN maintenance feeds. Showing sample datas.');
          return of([]);
        })
      ),
      vpn: this.http.get<PlatformRecord[]>('/api/multi-table/fetchVpn').pipe(
        catchError(err => {
          console.error('Failed to fetch VPN data', err);
          this.setError('Unable to load VPN maintenance feeds. Showing cached snapshot.');
          return of([]);
        })
      ),
      slbn: this.http.get<PlatformRecord[]>('/api/multi-table/fetchSlbn').pipe(
        catchError(err => {
          console.error('Failed to fetch SLBN data', err);
          this.setError('Unable to load SLBN maintenance feeds. Showing cached snapshot.');
          return of([]);
        })
      ),
      routine: this.http.get<RoutineRecord[]>('/api/mtnc-routine').pipe(
        catchError(err => {
          console.error('Failed to fetch routine KPI definitions', err);
          this.setError('Unable to load routine KPI definitions. Showing cached snapshot.');
          return of([...ROUTINE_FALLBACK]);
        })
      )
    })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(({ msan, vpn, slbn, routine }) => {
        this.platformDataMap = {
          msan: msan ?? [],
          vpn: vpn ?? [],
          slbn: slbn ?? []
        };
        this.routineData = routine?.length ? routine : [...ROUTINE_FALLBACK];

        (['msan', 'vpn', 'slbn'] as PlatformKey[]).forEach(key => {
          this.placeholderMap[key] = this.calculatePlaceholderValues(this.platformDataMap[key], key);
          const config = this.platformConfigs.find(cfg => cfg.key === key);
          this.towerSumsMap[key] = config
            ? this.calculateTowerSums(this.platformDataMap[key], config.monthsLimit)
            : {};
        });
      });
  }

  exportToExcel(): void {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Routine Maintenance');

    const headerStyle = {
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '0070C0' } },
      font: { color: { argb: 'FFFFFFFF' }, bold: true },
      alignment: { horizontal: 'center', vertical: 'middle' },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    };

    const dataStyle = {
      alignment: { horizontal: 'center', vertical: 'middle' },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    } as const;

    const combinedHeaders = [
      'No',
      'KPI',
      'Target',
      'Calculation',
      'Platform',
      'Responsible DGM',
      'Defined OLA Details',
      'Data Sources',
      'E/Fiber',
      ...this.columns
    ];

    worksheet.addRow(['Multi-Platform Maintenance Tables']);
    worksheet.addRow([]);
    const combinedHeaderRow = worksheet.addRow(combinedHeaders);
    combinedHeaderRow.eachCell(cell => Object.assign(cell, headerStyle));

    this.maintenanceRows.forEach(rowData => {
      const placeholderCells = this.getPlaceholderValuesForExport(rowData.platformKey);
      const row = worksheet.addRow([
        rowData.routine.no ?? '-',
        rowData.routine.kpi ?? 'No data',
        rowData.routine.target ?? 'No data',
        rowData.routine.calculation ?? 'No data',
        rowData.routine.platform ?? 'No data',
        rowData.routine.responsibleDGM ?? 'No data',
        rowData.routine.definedOLADetails ?? 'No data',
        rowData.routine.dataSources ?? 'No data',
        ...placeholderCells
      ]);
      row.eachCell(cell => Object.assign(cell, dataStyle));
    });

    worksheet.addRow([]);

    this.platformConfigs.forEach(config => {
      worksheet.addRow([config.title]);
      const dynamicHeaders = ['Month'];
      this.columns.forEach(col => {
        dynamicHeaders.push(`${col} Distribution`, `${col} Achievement`);
      });
      const dynamicHeaderRow = worksheet.addRow(dynamicHeaders);
      dynamicHeaderRow.eachCell(cell => Object.assign(cell, headerStyle));

      const towerRow = worksheet.addRow([
        '# Towers',
        ...this.columns.flatMap(col => [this.getTowerSum(config.key, col), ''])
      ]);
      towerRow.eachCell(cell => Object.assign(cell, dataStyle));

      this.platformDataMap[config.key].forEach(record => {
        const row = worksheet.addRow([
          record.month,
          ...this.columns.flatMap(col => [
            this.getDetailValue(record, col, 'Column2'),
            this.getDetailValue(record, col, 'Column3')
          ])
        ]);
        row.eachCell(cell => Object.assign(cell, dataStyle));
      });

      worksheet.addRow([]);
    });

    worksheet.columns.forEach(column => {
      column.width = 16;
    });

    workbook.xlsx.writeBuffer().then(buffer => {
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Routine_Maintenance_KPI.xlsx';
      link.click();
      URL.revokeObjectURL(url);
    });
  }

  getPlatformRecords(key: PlatformKey): PlatformRecord[] {
    return this.platformDataMap[key] ?? [];
  }

  getPlaceholderValue(key: PlatformKey, column: string): string {
    return this.placeholderMap[key]?.[column] ?? '100.00';
  }

  getTowerSum(key: PlatformKey, column: string): number {
    return this.towerSumsMap[key]?.[column] ?? 0;
  }

  getDetailValue(record: PlatformRecord, column: string, field: 'Column2' | 'Column3'): string {
    const detail = record.details?.find(item => item.Column1 === column);
    const value = detail ? detail[field] : undefined;
    if (value === undefined || value === null || value === '') {
      return 'No data';
    }
    return String(value);
  }

  formatRoutineValue(value?: string): string {
    if (!value) {
      return 'No data';
    }
    return value;
  }

  trackByMaintenanceRow = (_: number, item: MaintenanceRow) => `${item.routine.no}-${item.platformKey}`;
  trackByColumn = (_: number, column: string) => column;
  trackByMonth = (_: number, record: PlatformRecord) => record.month;

  private buildDefaultPlaceholders(): PlaceholderMap {
    const map: PlaceholderMap = {};
    PLATFORM_COLUMNS.forEach(col => {
      map[col] = '100.00';
    });
    map[this.efiberSourceColumn] = '100.00';
    return map;
  }

  private calculatePlaceholderValues(data: PlatformRecord[], platform: PlatformKey): PlaceholderMap {
    const result: PlaceholderMap = this.buildDefaultPlaceholders();

    if (!data.length) {
      return result;
    }

    const targetMonths = this.getTargetMonths(platform);
    const shouldCalculate = targetMonths.length > 0;

    PLATFORM_COLUMNS.forEach(column => {
      if (!shouldCalculate) {
        result[column] = '100.00';
        return;
      }

      let sumAchievement = 0;
      let denominator = 0;

      targetMonths.forEach(month => {
        const entry = data.find(item => item.month === month);
        const detail = entry?.details?.find(item => item.Column1 === column);
        if (detail) {
          sumAchievement += Number(detail.Column3) || 0;
          const slice = platform === 'msan' ? detail.Column4 : detail.Column2;
          denominator += Number(slice) || 0;
        }
      });

      if (denominator > 0) {
        result[column] = ((sumAchievement / denominator) * 100).toFixed(2);
      } else {
        result[column] = '0.00';
      }
    });

    result[this.efiberSourceColumn] = result[this.efiberSourceColumn] ?? '100.00';
    return result;
  }

  formatPlaceholderValue(platformKey: PlatformKey | null, column: string): string {
    if (!platformKey) {
      return 'No data';
    }
    return `${this.getPlaceholderValue(platformKey, column)}%`;
  }

  private getPlaceholderValuesForExport(platformKey: PlatformKey | null): string[] {
    if (!platformKey) {
      return ['No data', ...this.columns.map(() => 'No data')];
    }
    return [
      this.getPlaceholderValue(platformKey, this.efiberSourceColumn),
      ...this.columns.map(col => this.getPlaceholderValue(platformKey, col))
    ];
  }

  private calculateTowerSums(data: PlatformRecord[], monthsLimit: number): TowerSumRecord {
    const sums: TowerSumRecord = {};
    if (!monthsLimit || !data.length) {
      return sums;
    }

    data.slice(0, monthsLimit).forEach(entry => {
      entry.details?.forEach(detail => {
        const key = detail.Column1;
        const value = Number(detail.Column2) || 0;
        sums[key] = Number(((sums[key] ?? 0) + value).toFixed(2));
      });
    });
    return sums;
  }

  private getTargetMonths(platform: PlatformKey): string[] {
    if (platform === 'msan') {
      if (this.currentMonth === 'June') {
        return MONTH_NAMES.slice(0, 6);
      }
      if (this.currentMonth === 'December') {
        return MONTH_NAMES.slice(5);
      }
      return [];
    }

    if (platform === 'vpn' || platform === 'slbn') {
      const calculationMonths = ['February', 'April', 'June', 'August', 'October', 'December'];
      if (calculationMonths.includes(this.currentMonth)) {
        const currentIndex = MONTH_NAMES.indexOf(this.currentMonth);
        const previousMonth = currentIndex === 0 ? 'December' : MONTH_NAMES[currentIndex - 1];
        return [previousMonth, this.currentMonth];
      }
      return [];
    }

    return [];
  }

  private setError(message: string): void {
    if (!this.errorMessage) {
      this.errorMessage = message;
    }
  }
}

