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
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { Region as RegionApi, RegionService } from '../../../../services/region.service';

type Region = {
  id: number;
  region: string;
  province: string;
  networkEngineer: string;
  lea: string;
};

interface KpiMetric {
  achieved: number; // %
  maximumPoints: number; // Points Per KPI
  pointsAchieved: number; // Points achieved (achieved % * max points / 100)
}

interface KpiRow {
  id: number;
  number: number;
  perspectives: string;
  strategicObjectives: string;
  kpi: string;

  // ✅ LEFT TABLE new structure
  target: string; // target = descriptionOfKPI (same)
  weightage: number;
  pointsApplicable: number;

  metrics: KpiMetric[];
}

/** final table API response */
type KpiDefinition = {
  id: number;
  perspectives: string;
  strategicObjectives: string;
  keyPerformanceIndicators: string;

  // backend still returns these
  unit: string;
  descriptionOfKPI: string;
  weightage: number;

  // ✅ NEW FIELD from backend
  pointsApplicable: number;

  month?: number;
  year?: number;
};

type OverallKpiResultApi = {
  id: number;
  kpiDefinitionId: number;
  areaCode: string;
  achievedKpi: number;
  maximumPointsPerKpi: number;
  pointsAchieved: number;
  month: number;
  year: number;
};

@Component({
  selector: 'app-current-month',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './current-month.component.html',
  styleUrls: ['./current-month.component.scss'],
})
export class CurrentMonthComponent implements OnInit, AfterViewInit, OnDestroy {
  currentMonth: string;
  currentYear: number;

  loading = false;
  error: string | null = null;

  /** same API you used in FinalTableComponent */
  private readonly apiBase = 'http://localhost:5043/api/kpi-definitions';
  private readonly overallResultsApiBase = 'http://localhost:5043/api/overall-kpi-results';

  @ViewChildren('leftRowRef', { read: ElementRef })
  private leftRowElements!: QueryList<ElementRef<HTMLTableRowElement>>;

  @ViewChildren('rightRowRef', { read: ElementRef })
  private rightRowElements!: QueryList<ElementRef<HTMLTableRowElement>>;

  regions: Region[] = [];
  regionGroups: {
    region: string;
    provinces: { province: string; engineers: Region[] }[];
    totalEngineers: number;
  }[] = [];
  engineersFlat: Region[] = [];

  kpiRows: KpiRow[] = [];
  weightageSum = 0;
  totalPointsApplicable = 0;
  totalPointsAchievedByRegion: number[] = [];
  totalPointsNormalized: number[] = [];
  totalMaximumPointsByRegion: number[] = [];

  private readonly rowChangesSub = new Subscription();
  private pendingFrame: number | null = null;
  private refreshInterval: any = null;

  constructor(private http: HttpClient, private regionService: RegionService) {
    const now = new Date();
    this.currentYear = now.getFullYear();
    this.currentMonth = now.toLocaleString('en-US', { month: 'long' });
  }

  ngOnInit(): void {
    this.loadRegions();
    // Auto-refresh every 5 seconds to sync with changes from admin panel
    this.refreshInterval = setInterval(() => this.loadRegions(), 5000);
  }

  @HostListener('window:focus')
  onWindowFocus(): void {
    this.loadRegions();
  }

  ngAfterViewInit(): void {
    this.scheduleRowSync();

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
    if (this.refreshInterval !== null) clearInterval(this.refreshInterval);
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.scheduleRowSync();
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
        this.loadLeftTableFromApi();
      },
      error: (err) => {
        console.error('Failed loading regions:', err);
        this.error = 'Unable to load regions from backend.';
        this.regions = [];
        this.regionGroups = [];
        this.engineersFlat = [];
        this.loading = false;
        this.kpiRows = [];
        this.computeTotals();
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
          ([province, engineers]) => ({
            province,
            engineers,
          })
        );

        const totalEngineers = provinces.reduce(
          (sum, p) => sum + p.engineers.length,
          0
        );

        return { region, provinces, totalEngineers };
      }
    );

    this.engineersFlat = this.regionGroups.flatMap((g) =>
      g.provinces.flatMap((p) => p.engineers)
    );
  }

  /** ✅ Fetch KPI definitions from backend (LEFT table data) */
  private loadLeftTableFromApi(): void {
    this.loading = true;
    this.error = null;

    this.http
      .get<KpiDefinition[]>(this.apiBase)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          const list = (res ?? []).sort((a, b) => a.id - b.id);

          this.kpiRows = list.map((row, rowIndex) => {
            const metrics: KpiMetric[] = this.engineersFlat.map(
              () => {
                return { achieved: 0, maximumPoints: 0, pointsAchieved: 0 };
              }
            );

            return {
              id: row.id,
              number: rowIndex + 1,
              perspectives: row.perspectives,
              strategicObjectives: row.strategicObjectives,
              kpi: row.keyPerformanceIndicators,

              // ✅ Target = DescriptionOfKPI (same)
              target: row.descriptionOfKPI,

              weightage: row.weightage,

              // ✅ new field from backend
              pointsApplicable: row.pointsApplicable ?? 0,

              metrics,
            };
          });

          this.computeTotals();
          this.scheduleRowSync();
          this.loadOverallResultsFromApi();
        },
        error: (err) => {
          console.error('Failed loading final table KPI rows:', err);
          this.error = 'Unable to load KPI rows from backend.';
          this.kpiRows = [];
          this.computeTotals();
          this.scheduleRowSync();
        },
      });
  }

  private loadOverallResultsFromApi(): void {
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();
    const url = `${this.overallResultsApiBase}/calculate?month=${month}&year=${year}`;

    this.http.post<OverallKpiResultApi[]>(url, {}).subscribe({
      next: (rows) => {
        const list = Array.isArray(rows) ? rows : [];
        const grouped = new Map<number, OverallKpiResultApi[]>();

        list.forEach((row) => {
          const bucket = grouped.get(row.kpiDefinitionId) ?? [];
          bucket.push(row);
          grouped.set(row.kpiDefinitionId, bucket);
        });

        this.kpiRows = this.kpiRows.map((kpiRow) => {
          const byKpi = grouped.get(kpiRow.id) ?? [];
          const metrics = this.engineersFlat.map((engineer) => {
            const match = this.findOverallResultForArea(byKpi, engineer.lea);
            return {
              achieved: Number(match?.achievedKpi ?? 0),
              maximumPoints: Number(match?.maximumPointsPerKpi ?? 0),
              pointsAchieved: Number(match?.pointsAchieved ?? 0),
            };
          });

          return { ...kpiRow, metrics };
        });

        this.computeTotals();
        this.scheduleRowSync();
      },
      error: (err) => {
        console.error('Failed loading overall KPI results:', err);
        this.computeTotals();
        this.scheduleRowSync();
      },
    });
  }

  private findOverallResultForArea(rows: OverallKpiResultApi[], areaCode: string): OverallKpiResultApi | undefined {
    const normalizedTarget = this.normalizeArea(areaCode);
    const exact = rows.find((x) => this.normalizeArea(x.areaCode) === normalizedTarget);
    if (exact) return exact;

    const partial = rows.find((x) => {
      const n = this.normalizeArea(x.areaCode);
      return n.includes(normalizedTarget) || normalizedTarget.includes(n);
    });
    return partial;
  }

  private normalizeArea(value: string): string {
    return (value ?? '').replace(/[^A-Za-z0-9]/g, '').toLowerCase();
  }

  private computeTotals(): void {
    this.weightageSum = this.kpiRows.reduce(
      (sum, row) => sum + (row.weightage ?? 0),
      0
    );

    // ✅ Calculate total points applicable
    this.totalPointsApplicable = this.kpiRows.reduce(
      (sum, row) => sum + (row.pointsApplicable ?? 0),
      0
    );

    this.totalMaximumPointsByRegion = this.engineersFlat.map((_, colIndex) =>
      this.kpiRows.reduce(
        (sum, row) => sum + (row.metrics[colIndex]?.maximumPoints ?? 0),
        0
      )
    );

    // ✅ Calculate total points achieved by region
    this.totalPointsAchievedByRegion = this.engineersFlat.map((_, colIndex) =>
      this.kpiRows.reduce(
        (sum, row) => sum + (row.metrics[colIndex]?.pointsAchieved ?? 0),
        0
      )
    );

    // ✅ Normalized: percentage of total possible points
    // Formula: (Total Points Achieved) / (Total Maximum Points Per KPI) × 100%
    this.totalPointsNormalized = this.totalPointsAchievedByRegion.map((total, colIndex) =>
      this.totalMaximumPointsByRegion[colIndex]
        ? +((total / this.totalMaximumPointsByRegion[colIndex]) * 100).toFixed(2)
        : 0
    );
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
    const leftRows = this.leftRowElements.toArray().map((ref) => ref.nativeElement);
    const rightRows = this.rightRowElements.toArray().map((ref) => ref.nativeElement);

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

  /** Compute weightage dynamically based on total points (normalized to 100%) */
  getComputedWeightage(row: KpiRow): string {
    if (this.totalPointsApplicable <= 0) return '0.00%';
    const weightage = (Number(row.pointsApplicable ?? 0) / this.totalPointsApplicable) * 100;
    return `${weightage.toFixed(2)}%`;
  }
}
