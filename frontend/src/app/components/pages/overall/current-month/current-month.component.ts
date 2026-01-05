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
  achieved: number;   // %
  weighted: number;   // %
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

/** final table API response */
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
  totalWeightedByRegion: number[] = [];
  totalWeightedNormalized: number[] = [];

  private readonly rowChangesSub = new Subscription();
  private pendingFrame: number | null = null;

  constructor(private http: HttpClient, private regionService: RegionService) {
    const now = new Date();
    this.currentYear = now.getFullYear();
    this.currentMonth = now.toLocaleString('en-US', { month: 'long' });
  }

  ngOnInit(): void {
    this.loadRegions();
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
          const networkEngineer = (r as any).networkEngineer ?? (r as any).networkengineer ?? (r as any)['network_engineer'] ?? '';
          const lea = (r as any).lea ?? (r as any).leaCode ?? (r as any).leacode ?? (r as any)['lea_code'] ?? '';

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
      const provinceMap = regionMap.get(item.region) ?? new Map<string, Region[]>();
      const engineers = provinceMap.get(item.province) ?? [];
      engineers.push(item);
      provinceMap.set(item.province, engineers);
      regionMap.set(item.region, provinceMap);
    });

    this.regionGroups = Array.from(regionMap.entries()).map(([region, provinceMap]) => {
      const provinces = Array.from(provinceMap.entries()).map(([province, engineers]) => ({
        province,
        engineers,
      }));

      const totalEngineers = provinces.reduce((sum, p) => sum + p.engineers.length, 0);

      return { region, provinces, totalEngineers };
    });

    this.engineersFlat = this.regionGroups.flatMap(g => g.provinces.flatMap(p => p.engineers));
  }

  /** ✅ Fetch KPI definitions from backend (real data for LEFT table) */
  private loadLeftTableFromApi(): void {
    this.loading = true;
    this.error = null;

    this.http
      .get<KpiDefinition[]>(this.apiBase)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          const list = (res ?? []).sort((a, b) => a.rowNumber - b.rowNumber);

          this.kpiRows = list.map((row, rowIndex) => {
            const metrics: KpiMetric[] = this.engineersFlat.map((_, colIndex) => {
              const achieved = 100 - (rowIndex * 2 + colIndex);
              const weighted = +(row.weightage * achieved / 100).toFixed(2);
              return { achieved, weighted };
            });

            return {
              rowNumber: row.rowNumber,
              perspectives: row.perspectives,
              strategicObjectives: row.strategicObjectives,
              kpi: row.keyPerformanceIndicators,
              unit: row.unit,
              description: row.descriptionOfKPI,
              weightage: row.weightage,
              metrics,
            };
          });

          this.computeTotals();
          this.scheduleRowSync();
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

  private computeTotals(): void {
    this.weightageSum = this.kpiRows.reduce((sum, row) => sum + (row.weightage ?? 0), 0);

    this.totalWeightedByRegion = this.engineersFlat.map((_, colIndex) =>
      this.kpiRows.reduce((sum, row) => sum + (row.metrics[colIndex]?.weighted ?? 0), 0)
    );

    this.totalWeightedNormalized = this.totalWeightedByRegion.map(total =>
      this.weightageSum ? +(total / this.weightageSum * 100).toFixed(2) : 0
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
    const leftRows = this.leftRowElements.toArray().map(ref => ref.nativeElement);
    const rightRows = this.rightRowElements.toArray().map(ref => ref.nativeElement);

    if (!leftRows.length || !rightRows.length) return;

    leftRows.forEach(row => row.style.removeProperty('height'));
    rightRows.forEach(row => row.style.removeProperty('height'));

    const pairCount = Math.min(leftRows.length, rightRows.length);

    for (let i = 0; i < pairCount; i++) {
      const leftHeight = leftRows[i].getBoundingClientRect().height;
      const rightHeight = rightRows[i].getBoundingClientRect().height;
      const maxHeight = Math.max(leftHeight, rightHeight);

      leftRows[i].style.height = `${maxHeight}px`;
      rightRows[i].style.height = `${maxHeight}px`;
    }
  }
}

