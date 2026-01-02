import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
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

@Component({
  selector: 'app-previous-month',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './previous-month.component.html',
  styleUrls: ['./previous-month.component.scss'],
})
export class PreviousMonthComponent
  implements OnInit, AfterViewInit, OnDestroy
{
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

  /* Period selection */
  availableYears: number[] = [];
  availableMonths: string[] = [];
  selectedYear!: number;
  selectedMonth!: string;

  /* State */
  loading = false;
  error: string | null = null;

  private rowChangeSub?: Subscription;

  private readonly allRegions: Region[] = [
    { id: 15, region: 'Metro', province: 'Metro 2', networkEngineer: 'NW/WPE' },
    { id: 16, region: 'Metro', province: 'Metro 2', networkEngineer: 'NW/WPS' },
    { id: 17, region: 'Metro', province: 'Metro 2', networkEngineer: 'NW/WPSW' },
    { id: 18, region: 'Metro', province: 'Metro 1', networkEngineer: 'NW/WPNE' },
    { id: 19, region: 'Metro', province: 'Metro 1', networkEngineer: 'NW/WPC-2 (CEN/HK/MD)' },
    { id: 20, region: 'Metro', province: 'Metro 1', networkEngineer: 'NW/WPC-1 (CEN/HK/MD)' },
  ];

  private readonly baseKpiRows: Omit<KpiRow, 'metrics'>[] = [
    {
      rowNumber: 1,
      perspectives: 'Customer',
      strategicObjectives: 'Service Assurance',
      kpi: 'Fiber Failures Restoration (General): < 4 Hrs',
      unit: '%',
      description: 'Above 85%',
      weightage: 8,
    },
    {
      rowNumber: 2,
      perspectives: 'Customer',
      strategicObjectives: 'Service Assurance',
      kpi: 'Fiber Failures Restoration (Large scale: Pole damages etc): < 8 Hrs',
      unit: '%',
      description: 'Above 80%',
      weightage: 8,
    },
    {
      rowNumber: 3,
      perspectives: 'Customer',
      strategicObjectives: 'Service Assurance',
      kpi: 'MSAN Power Failures Restoration: < 4 Hrs',
      unit: '%',
      description: 'Above 85%',
      weightage: 8,
    },
    {
      rowNumber: 5,
      perspectives: 'Customer',
      strategicObjectives: 'Service Assurance',
      kpi: 'Network Availability (MSAN, OLT, SLBN, SDH, Fiber NW, IP Core, Tellabs, Service Edge (CEA+PE))',
      unit: 'Rs. Mn',
      description: 'Above 99.899%',
      weightage: 7,
    },
    {
      rowNumber: 6,
      perspectives: 'Customer',
      strategicObjectives: 'Service Assurance',
      kpi: 'Routing maintenance',
      unit: '%',
      description: '100%',
      weightage: 3,
    },
    {
      rowNumber: 7,
      perspectives: 'Customer',
      strategicObjectives: 'Service Fulfillment',
      kpi: 'Enterprise/SME and Whole Sales Service Delivery - Fiber',
      unit: '%',
      description: 'Above 90%',
      weightage: 35,
    },
    {
      rowNumber: 10,
      perspectives: 'Customer',
      strategicObjectives: 'Service Assurance',
      kpi: 'Operation & Maintenance of SLT towers and tower premises',
      unit: '%',
      description: 'Above 95%',
      weightage: 10,
    },
  ];

  private readonly availableMonthsByYear: Record<number, string[]> = {
    2024: ['January', 'February', 'March', 'April', 'May', 'June'],
    2025: ['January', 'February', 'March', 'April', 'May', 'June'],
  };

  ngOnInit(): void {
    this.metroRegions = this.allRegions.filter(r => r.region === 'Metro');
    this.metroProvinceGroups = this.buildProvinceGroups(this.metroRegions);
    this.weightageSum = this.baseKpiRows.reduce((sum, row) => sum + row.weightage, 0);

    this.availableYears = Object.keys(this.availableMonthsByYear)
      .map(year => +year)
      .sort((a, b) => a - b);

    this.selectedYear = this.availableYears[this.availableYears.length - 1];
    this.setMonthsForYear(this.selectedYear);
    this.loadKpiForSelectedPeriod();
  }

  ngAfterViewInit(): void {
    // When rows change (after data load), sync heights
    this.rowChangeSub = this.leftRows.changes.subscribe(() => {
      // small timeout to wait for DOM layout
      setTimeout(() => this.syncRowHeights(), 0);
    });
    // Also watch right side in case it changes independently
    this.rightRows.changes.subscribe(() => {
      setTimeout(() => this.syncRowHeights(), 0);
    });
  }

  ngOnDestroy(): void {
    if (this.rowChangeSub) {
      this.rowChangeSub.unsubscribe();
    }
  }

  /* ==========================
   * PERIOD SELECTION
   * ========================== */

  onYearChange(): void {
    if (!this.selectedYear) return;
    this.setMonthsForYear(this.selectedYear);
    this.loadKpiForSelectedPeriod();
  }

  onMonthChange(): void {
    this.loadKpiForSelectedPeriod();
  }

  /* ==========================
   * LOAD KPI DATA FOR PERIOD
   * ========================== */

  private loadKpiForSelectedPeriod(): void {
    if (!this.selectedYear || !this.selectedMonth) {
      return;
    }

    this.loading = true;
    this.error = null;

    const months = this.availableMonthsByYear[this.selectedYear] || [];
    if (!months.length) {
      this.loading = false;
      this.error = 'No months configured for this year.';
      this.kpiRows = [];
      return;
    }

    if (!months.includes(this.selectedMonth)) {
      this.selectedMonth = months[0];
    }

    this.kpiRows = this.buildRowsForPeriod(this.selectedYear, this.selectedMonth);
    this.computeTotals();
    this.loading = false;

    setTimeout(() => this.syncRowHeights(), 0);
  }

  /* ==========================
   * SYNC ROW HEIGHTS (LEFT/RIGHT TABLE)
   * ========================== */

  private syncRowHeights(): void {
    const left = this.leftRows?.toArray() || [];
    const right = this.rightRows?.toArray() || [];
    const count = Math.min(left.length, right.length);

    for (let i = 0; i < count; i++) {
      const leftEl = left[i].nativeElement;
      const rightEl = right[i].nativeElement;

      // reset first
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
   * EXPORT TO EXCEL (BASIC)
   * ========================== */

  exportToExcel(): void {
    if (!this.kpiRows.length || !this.metroRegions.length) {
      alert('No data to export for this period.');
      return;
    }

    // Basic export: one sheet with left table data.
    // You can extend this later to match the complex ExcelJS layout from React.
    const dataForSheet: any[] = [];

    dataForSheet.push([
      `Previous Months KPI – ${this.selectedMonth} ${this.selectedYear}`,
    ]);
    dataForSheet.push([]); // empty row

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

  private buildRowsForPeriod(year: number, month: string): KpiRow[] {
    const monthIndex = this.getMonthIndex(month);
    const yearOffset = year % 10;

    return this.baseKpiRows.map((baseRow, rowIndex) => {
      const metrics = this.metroRegions.map((_, colIndex) => {
        const variance = (monthIndex + 1) * 0.6 + yearOffset * 0.3 + colIndex * 0.5;
        const rawAchieved = 96 - rowIndex * 2 - colIndex + variance;
        const achieved = this.clamp(65, 100, rawAchieved);
        const weighted = +(baseRow.weightage * achieved / 100).toFixed(2);
        return {
          achieved: +achieved.toFixed(2),
          weighted,
        };
      });

      return {
        ...baseRow,
        metrics,
      };
    });
  }

  private computeTotals(): void {
    this.totalWeightedByRegion = this.metroRegions.map((_, colIndex) =>
      this.kpiRows.reduce((sum, row) => sum + (row.metrics[colIndex]?.weighted ?? 0), 0)
    );

    this.totalWeightedNormalized = this.totalWeightedByRegion.map(total =>
      this.weightageSum ? +(total / this.weightageSum * 100).toFixed(2) : 0
    );
  }

  private getMonthIndex(month: string): number {
    const months = [
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
    const index = months.findIndex(name => name.toLowerCase() === month.toLowerCase());
    return index >= 0 ? index : 0;
  }

  private clamp(min: number, max: number, value: number): number {
    return Math.max(min, Math.min(max, value));
  }
}
