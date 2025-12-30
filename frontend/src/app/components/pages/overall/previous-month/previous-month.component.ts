import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription, finalize } from 'rxjs';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import * as XLSX from 'xlsx';

interface KpiMetric {
  achieved: number;
  weighted: number;
}

interface KpiRow {
  rowNumber: number;
  perspectives: string;
  strategicObjectives: string;
  kpi: string;
  unit: string;
  description: string;
  weightage: number;
  metrics: KpiMetric[];
}

interface Region {
  id: number;
  region: string;
  province: string;
  networkEngineer: string;
}

interface MetroProvinceGroup {
  province: string;
  engineers: Region[];
}

// Same shape as your Final Table API returns
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
  private readonly http = inject(HttpClient);

  /* Template row refs for left/right table height sync */
  @ViewChildren('leftRowRef') leftRows!: QueryList<ElementRef<HTMLTableRowElement>>;
  @ViewChildren('rightRowRef') rightRows!: QueryList<ElementRef<HTMLTableRowElement>>;

  /* KPI + Metro data */
  kpiRows: KpiRow[] = [];
  weightageSum = 0;

  metroRegions: Region[] = [];
  metroProvinceGroups: MetroProvinceGroup[] = [];
  totalWeightedByRegion: number[] = [];
  totalWeightedNormalized: number[] = [];

  // For dynamic right table: store metrics by [row][region]
  kpiMetrics: (KpiMetric | null)[][] = [];

  /* Period selection */
  availableYears: number[] = [];
  availableMonths: string[] = [];
  selectedYear!: number;
  selectedMonth!: string;

  /* State */
  loading = false;
  error: string | null = null;

  private rowChangeSub?: Subscription;

  // ✅ Final-table API
  private readonly apiBase = 'http://localhost:5043/api/kpi-definitions';

  private readonly allRegions: Region[] = [
    { id: 15, region: 'Metro', province: 'Metro 2', networkEngineer: 'NW/WPE' },
    { id: 16, region: 'Metro', province: 'Metro 2', networkEngineer: 'NW/WPS' },
    { id: 17, region: 'Metro', province: 'Metro 2', networkEngineer: 'NW/WPSW' },
    { id: 18, region: 'Metro', province: 'Metro 1', networkEngineer: 'NW/WPNE' },
    { id: 19, region: 'Metro', province: 'Metro 1', networkEngineer: 'NW/WPC-2 (CEN/HK/MD)' },
    { id: 20, region: 'Metro', province: 'Metro 1', networkEngineer: 'NW/WPC-1 (CEN/HK/MD)' },
  ];

  private readonly availableMonthsByYear: Record<number, string[]> = {
    2024: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ],
    2025: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ],
  };

  ngOnInit(): void {
    this.metroRegions = this.allRegions.filter(r => r.region === 'Metro');
    this.metroProvinceGroups = this.buildProvinceGroups(this.metroRegions);

    this.availableYears = Object.keys(this.availableMonthsByYear)
      .map(year => +year)
      .sort((a, b) => a - b);

    this.selectedYear = this.availableYears[this.availableYears.length - 1];
    this.setMonthsForYear(this.selectedYear);

    // ✅ Fetch real left-table rows from API
    this.loadKpiForSelectedPeriod();
  }

  ngAfterViewInit(): void {
    this.rowChangeSub = this.leftRows.changes.subscribe(() => {
      setTimeout(() => this.syncRowHeights(), 0);
    });

    this.rightRows.changes.subscribe(() => {
      setTimeout(() => this.syncRowHeights(), 0);
    });
  }

  ngOnDestroy(): void {
    this.rowChangeSub?.unsubscribe();
  }

  onYearChange(): void {
    if (!this.selectedYear) return;
    this.setMonthsForYear(this.selectedYear);
    this.loadKpiForSelectedPeriod();
  }

  onMonthChange(): void {
    this.loadKpiForSelectedPeriod();
  }

  /* ==========================
   * LOAD KPI DATA (REAL LEFT TABLE)
   * ========================== */
  private loadKpiForSelectedPeriod(): void {
    if (!this.selectedYear || !this.selectedMonth) return;

    this.loading = true;
    this.error = null;

    const months = this.availableMonthsByYear[this.selectedYear] || [];
    if (!months.length) {
      this.loading = false;
      this.error = 'No months configured for this year.';
      this.kpiRows = [];
      this.kpiMetrics = [];
      return;
    }

    if (!months.includes(this.selectedMonth)) {
      this.selectedMonth = months[0];
    }

    const monthNo = this.getMonthNumber(this.selectedMonth);
    const yearNo = this.selectedYear;

    this.http
      .get<KpiDefinition[]>(`${this.apiBase}?month=${monthNo}&year=${yearNo}`)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          const defs = (res ?? []).slice().sort((a, b) => a.rowNumber - b.rowNumber);

          // Build left table rows dynamically from API
          this.kpiRows = defs.map((d) => {
            const weight = Number(d.weightage ?? 0);
            return {
              rowNumber: Number(d.rowNumber),
              perspectives: d.perspectives ?? '',
              strategicObjectives: d.strategicObjectives ?? '',
              kpi: d.keyPerformanceIndicators ?? '',
              unit: d.unit ?? '',
              description: d.descriptionOfKPI ?? '',
              weightage: weight,
              metrics: [], // not used for right table anymore
            };
          });

          // Build right table metrics: [row][region] (simulate or fetch real data if available)
          this.kpiMetrics = this.kpiRows.map((row, rowIndex) =>
            this.metroRegions.map((_, colIndex) => {
              // Simulate: if rowIndex+colIndex is even, show data, else null (for demo)
              // Replace this logic with real data lookup if available
              if ((rowIndex + colIndex) % 2 === 0) {
                const achieved = this.clamp(0, 100, 96 - rowIndex * 2 - colIndex);
                const weighted = +(row.weightage * achieved / 100).toFixed(2);
                return { achieved: +achieved.toFixed(2), weighted };
              } else {
                return null; // No data for this cell
              }
            })
          );

          this.weightageSum = this.kpiRows.reduce((sum, r) => sum + (r.weightage ?? 0), 0);
          this.computeTotals();

          setTimeout(() => this.syncRowHeights(), 0);
        },
        error: (err) => {
          console.error('GET kpi-definitions failed:', err);
          this.error = 'Unable to load KPI definitions for selected month/year.';
          this.kpiRows = [];
          this.kpiMetrics = [];
          this.weightageSum = 0;
          this.totalWeightedByRegion = [];
          this.totalWeightedNormalized = [];
        },
      });
  }

  /* ==========================
   * SYNC ROW HEIGHTS
   * ========================== */
  private syncRowHeights(): void {
    const left = this.leftRows?.toArray() || [];
    const right = this.rightRows?.toArray() || [];
    const count = Math.min(left.length, right.length);

    for (let i = 0; i < count; i++) {
      const leftEl = left[i].nativeElement;
      const rightEl = right[i].nativeElement;

      leftEl.style.height = 'auto';
      rightEl.style.height = 'auto';

      const lh = leftEl.getBoundingClientRect().height;
      const rh = rightEl.getBoundingClientRect().height;
      const h = Math.max(lh, rh);

      leftEl.style.height = `${h}px`;
      rightEl.style.height = `${h}px`;
    }
  }

  /* ==========================
   * EXPORT
   * ========================== */
  exportToExcel(): void {
    if (!this.kpiRows.length || !this.metroRegions.length) {
      alert('No data to export for this period.');
      return;
    }

    const dataForSheet: any[] = [];
    dataForSheet.push([`Previous Months KPI – ${this.selectedMonth} ${this.selectedYear}`]);
    dataForSheet.push([]);

    dataForSheet.push([
      '#',
      'Perspectives',
      'Strategic Objectives (KRA)',
      'KPI',
      'Unit',
      'Description',
      'Weightage (%)',
    ]);

    this.kpiRows.forEach((row) => {
      dataForSheet.push([
        row.rowNumber,
        row.perspectives,
        row.strategicObjectives,
        row.kpi,
        row.unit,
        row.description,
        row.weightage,
      ]);
    });

    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(dataForSheet);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Previous KPI');

    XLSX.writeFile(
      wb,
      `Previous_Months_KPI_${this.selectedMonth}_${this.selectedYear}.xlsx`
    );
  }

  private setMonthsForYear(year: number): void {
    this.availableMonths = [...(this.availableMonthsByYear[year] || [])];
    if (this.availableMonths.length) {
      if (!this.availableMonths.includes(this.selectedMonth)) {
        this.selectedMonth = this.availableMonths[0];
      }
    } else {
      this.selectedMonth = '';
    }
  }

  private buildProvinceGroups(regions: Region[]): MetroProvinceGroup[] {
    const provinceMap = new Map<string, Region[]>();
    regions.forEach(region => {
      const arr = provinceMap.get(region.province) ?? [];
      arr.push(region);
      provinceMap.set(region.province, arr);
    });
    return Array.from(provinceMap.entries()).map(([province, engineers]) => ({ province, engineers }));
  }

  private computeTotals(): void {
    this.totalWeightedByRegion = this.metroRegions.map((_, colIndex) =>
      this.kpiRows.reduce((sum, row) => sum + (row.metrics[colIndex]?.weighted ?? 0), 0)
    );

    this.totalWeightedNormalized = this.totalWeightedByRegion.map(total =>
      this.weightageSum ? +(total / this.weightageSum * 100).toFixed(2) : 0
    );
  }

  private getMonthNumber(monthName: string): number {
    const months = [
      'January','February','March','April','May','June',
      'July','August','September','October','November','December',
    ];
    const idx = months.findIndex(m => m.toLowerCase() === monthName.toLowerCase());
    return idx >= 0 ? idx + 1 : 1;
  }

  private clamp(min: number, max: number, value: number): number {
    return Math.max(min, Math.min(max, value));
  }
}
