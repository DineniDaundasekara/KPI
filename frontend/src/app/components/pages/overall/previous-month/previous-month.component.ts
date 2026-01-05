import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import {
  HttpClient,
  HttpClientModule,
  HttpParams,
} from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { Region as RegionApi, RegionService } from '../../../../services/region.service';
import * as XLSX from 'xlsx';

type Region = {
  id: number;
  region: string;
  province: string;
  networkEngineer: string;
  lea: string;
};

interface RegionGroup {
  region: string;
  provinces: { province: string; engineers: Region[] }[];
  totalEngineers: number;
}

interface KpiMetric {
  achieved: number;   // %
  weighted: number;   // %
}

type KpiMetricCell = KpiMetric | null;

interface KpiRow {
  rowNumber: number;
  perspectives: string;
  strategicObjectives: string;
  kpi: string;
  unit: string;
  description: string;
  weightage: number;
  metrics: KpiMetricCell[];
}

type KpiDefinition = {
  id: string;
  rowNumber: number;
  perspectives: string;
  strategicObjectives: string;
  keyPerformanceIndicators: string;
  unit: string;
  descriptionOfKPI: string;
  weightage: number;
  month?: number;
  year?: number;
};

@Component({
  selector: 'app-previous-month',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './previous-month.component.html',
  styleUrls: ['./previous-month.component.scss'],
})
export class PreviousMonthComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly apiBase = 'http://localhost:5043/api/kpi-definitions';
  readonly Math = Math;

  readonly monthNames = [
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
    'December',
  ];

  selectedYear: number;
  selectedMonth: number;
  availableYears: number[] = [];

  loading = false;
  metricsLoading = false;
  error: string | null = null;
  hasMetricsData = true;

  regions: Region[] = [];
  regionGroups: RegionGroup[] = [];
  engineersFlat: Region[] = [];

  kpiRows: KpiRow[] = [];
  weightageSum = 0;
  totalWeightedByRegion: number[] = [];
  totalWeightedNormalized: number[] = [];

  private readonly rowChangesSub = new Subscription();
  private pendingFrame: number | null = null;

  @ViewChildren('leftRowRef', { read: ElementRef })
  private leftRowElements!: QueryList<ElementRef<HTMLTableRowElement>>;

  @ViewChildren('rightRowRef', { read: ElementRef })
  private rightRowElements!: QueryList<ElementRef<HTMLTableRowElement>>;

  constructor(private http: HttpClient, private regionService: RegionService) {
    const { year, month } = this.getPreviousMonth();
    this.selectedYear = year;
    this.selectedMonth = month;
    this.availableYears = this.buildYearOptions(year);
  }

  ngOnInit(): void {
    this.loadRegions();
  }

  ngAfterViewInit(): void {
    this.rowChangesSub.add(
      this.leftRowElements.changes.subscribe(() => this.scheduleRowSync())
    );

    this.rowChangesSub.add(
      this.rightRowElements.changes.subscribe(() => this.scheduleRowSync())
    );
  }

  ngOnDestroy(): void {
    this.rowChangesSub.unsubscribe();
    if (this.pendingFrame !== null) cancelAnimationFrame(this.pendingFrame);
  }

  @HostListener('window:focus')
  onWindowFocus(): void {
    this.loadRegions();
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.scheduleRowSync();
  }

  onYearChange(): void {
    this.refreshMetricsForPeriod();
  }

  onMonthChange(): void {
    this.refreshMetricsForPeriod();
  }

  exportToExcel(): void {
    if (!this.kpiRows.length) {
      alert('No data to export for this period.');
      return;
    }

    const sheetData: any[] = [];
    sheetData.push([
      `Previous Month KPI – ${this.monthNames[this.selectedMonth - 1]} ${this.selectedYear}`,
    ]);
    sheetData.push([]);
    sheetData.push([
      '#',
      'Perspectives',
      'Strategic Objectives (KRA)',
      'Key Performance Indicators (KPI)',
      'Unit',
      'Description of KPI',
      'Weightage (%)',
    ]);

    this.kpiRows.forEach((row) => {
      sheetData.push([
        row.rowNumber,
        row.perspectives,
        row.strategicObjectives,
        row.kpi,
        row.unit,
        row.description,
        row.weightage,
      ]);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Previous KPI');
    XLSX.writeFile(
      workbook,
      `Previous_Month_KPI_${this.monthNames[this.selectedMonth - 1]}_${this.selectedYear}.xlsx`
    );
  }

  private loadRegions(): void {
    this.loading = true;
    this.error = null;

    this.regionService.getAll().subscribe({
      next: (res) => {
        this.regions = (res ?? []).map((r: RegionApi) => {
          const networkEngineer =
            (r as any).networkEngineer ??
            (r as any).networkengineer ??
            (r as any)['network_engineer'] ??
            '';
          const lea =
            (r as any).lea ??
            (r as any).leaCode ??
            (r as any).leacode ??
            (r as any)['lea_code'] ??
            '';

          return {
            id: r.id,
            region: r.region,
            province: r.province,
            networkEngineer: networkEngineer || '—',
            lea: lea || '—',
          };
        });

        this.buildRegionGrouping();
        this.loadKpiDefinitions();
      },
      error: (err) => {
        console.error('Failed loading regions:', err);
        this.error = 'Unable to load regions from backend.';
        this.loading = false;
        this.regions = [];
        this.regionGroups = [];
        this.engineersFlat = [];
        this.clearMetrics();
        this.scheduleRowSync();
      },
    });
  }

  private buildRegionGrouping(): void {
    const regionMap = new Map<string, Map<string, Region[]>>();

    this.regions.forEach((item) => {
      const provinceMap =
        regionMap.get(item.region) ?? new Map<string, Region[]>();
      const engineers = provinceMap.get(item.province) ?? [];
      engineers.push(item);
      provinceMap.set(item.province, engineers);
      regionMap.set(item.region, provinceMap);
    });

    this.regionGroups = Array.from(regionMap.entries()).map(
      ([region, provinceMap]) => {
        const provinces = Array.from(provinceMap.entries()).map(
          ([province, engineers]) => ({ province, engineers })
        );
        const totalEngineers = provinces.reduce(
          (sum, p) => sum + p.engineers.length,
          0
        );
        return { region, provinces, totalEngineers };
      }
    );

    this.engineersFlat = this.regionGroups.flatMap((group) =>
      group.provinces.flatMap((p) => p.engineers)
    );
  }

  private loadKpiDefinitions(): void {
    this.http
      .get<KpiDefinition[]>(this.apiBase)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          const sorted = (res ?? []).sort((a, b) => a.rowNumber - b.rowNumber);
          this.kpiRows = sorted.map((row) => ({
            rowNumber: row.rowNumber,
            perspectives: row.perspectives,
            strategicObjectives: row.strategicObjectives,
            kpi: row.keyPerformanceIndicators,
            unit: row.unit,
            description: row.descriptionOfKPI,
            weightage: row.weightage,
            metrics: this.engineersFlat.map(() => null),
          }));

          this.weightageSum = this.kpiRows.reduce(
            (sum, item) => sum + (item.weightage ?? 0),
            0
          );

          this.refreshMetricsForPeriod();
        },
        error: (err) => {
          console.error('Failed loading KPI rows:', err);
          this.error = 'Unable to load KPI definitions from backend.';
          this.kpiRows = [];
          this.weightageSum = 0;
          this.clearMetrics();
        },
      });
  }

  private refreshMetricsForPeriod(): void {
    if (!this.kpiRows.length) {
      this.clearMetrics();
      return;
    }

    const month = this.selectedMonth ?? 1;
    const year = this.selectedYear ?? this.availableYears[0];

    this.error = null;

    this.metricsLoading = true;
    const params = new HttpParams()
      .set('month', String(month))
      .set('year', String(year));

    this.http
      .get<KpiDefinition[]>(this.apiBase, { params })
      .pipe(finalize(() => (this.metricsLoading = false)))
      .subscribe({
        next: (res) => {
          const filteredMap = new Map<number, KpiDefinition>(
            (res ?? []).map((row) => [row.rowNumber, row])
          );

          this.hasMetricsData = filteredMap.size > 0;

          this.kpiRows = this.kpiRows.map((row, index) => ({
            ...row,
            metrics: this.buildMetricsForRow(
              row,
              index,
              filteredMap.get(row.rowNumber)
            ),
          }));

          this.computeTotals();
          this.scheduleRowSync();
        },
        error: (err) => {
          console.error('Failed loading KPI metrics:', err);
          this.error = 'Unable to load KPI data for selected period.';
          this.hasMetricsData = false;
          this.clearMetrics();
          this.scheduleRowSync();
        },
      });
  }

  private buildMetricsForRow(
    row: KpiRow,
    rowIndex: number,
    definition?: KpiDefinition
  ): KpiMetricCell[] {
    if (!definition) {
      return this.engineersFlat.map(() => null);
    }

    return this.engineersFlat.map((_, colIndex) => {
      const seed =
        (definition.month ?? this.selectedMonth) +
        (definition.year ?? this.selectedYear) +
        rowIndex +
        colIndex;
      const achieved = this.clamp(0, 100, 98 - rowIndex * 2 - colIndex - seed * 0.05);
      const roundedAchieved = +achieved.toFixed(2);
      const weighted = +((row.weightage * roundedAchieved) / 100).toFixed(2);
      return { achieved: roundedAchieved, weighted };
    });
  }

  private computeTotals(): void {
    this.totalWeightedByRegion = this.engineersFlat.map((_, colIndex) =>
      this.kpiRows.reduce((sum, row) => {
        const metric = row.metrics[colIndex];
        return sum + (metric?.weighted ?? 0);
      }, 0)
    );

    this.totalWeightedNormalized = this.totalWeightedByRegion.map((total) =>
      this.weightageSum ? +((total / this.weightageSum) * 100).toFixed(2) : 0
    );
  }

  private clearMetrics(): void {
    this.kpiRows = this.kpiRows.map((row) => ({
      ...row,
      metrics: this.engineersFlat.map(() => null),
    }));

    this.totalWeightedByRegion = this.engineersFlat.map(() => 0);
    this.totalWeightedNormalized = this.engineersFlat.map(() => 0);
  }

  private scheduleRowSync(): void {
    if (!this.leftRowElements || !this.rightRowElements) return;

    if (this.pendingFrame !== null) cancelAnimationFrame(this.pendingFrame);

    this.pendingFrame = requestAnimationFrame(() => {
      this.pendingFrame = null;
      this.syncRowHeights();
    });
  }

  private syncRowHeights(): void {
    const leftRows = this.leftRowElements
      ?.toArray()
      .map((ref) => ref.nativeElement) ?? [];
    const rightRows = this.rightRowElements
      ?.toArray()
      .map((ref) => ref.nativeElement) ?? [];

    if (!leftRows.length || !rightRows.length) return;

    leftRows.forEach((row) => row.style.removeProperty('height'));
    rightRows.forEach((row) => row.style.removeProperty('height'));

    const pairCount = Math.min(leftRows.length, rightRows.length);

    for (let i = 0; i < pairCount; i++) {
      const leftHeight = leftRows[i].getBoundingClientRect().height;
      const rightHeight = rightRows[i].getBoundingClientRect().height;
      const maxHeight = Math.max(leftHeight, rightHeight);

      leftRows[i].style.height = `${maxHeight}px`;
      rightRows[i].style.height = `${maxHeight}px`;
    }
  }

  private getPreviousMonth(): { year: number; month: number } {
    const ref = new Date();
    ref.setMonth(ref.getMonth() - 1);
    return { year: ref.getFullYear(), month: ref.getMonth() + 1 };
  }

  private buildYearOptions(defaultYear: number): number[] {
    const currentYear = new Date().getFullYear();
    const firstYear = Math.min(defaultYear, currentYear) - 2;
    const years = new Set<number>();
    for (let year = firstYear; year <= currentYear; year++) {
      years.add(year);
    }
    years.add(defaultYear);
    return Array.from(years).sort((a, b) => a - b);
  }

  private clamp(min: number, max: number, value: number): number {
    return Math.max(min, Math.min(max, value));
  }
}
