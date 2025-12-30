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

interface Region {
  id: number;
  region: string;
  province: string;
  networkEngineer: string;
  lea: string;
}

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

  regions: Region[] = [
    { id: 1,  region: 'Region 3', province: 'NP',        networkEngineer: 'NW/NP-2',               lea: 'KO / MLT / MB / VA' },
    { id: 2,  region: 'Region 3', province: 'NP',        networkEngineer: 'NW/NP-1',               lea: 'JA' },
    { id: 3,  region: 'Region 3', province: 'EP',        networkEngineer: 'NW/EP',                 lea: 'BC / AP / KL / TC' },

    { id: 4,  region: 'Region 2', province: 'WPS & SP',  networkEngineer: 'NW/WPS',                lea: 'HR / KT / PH' },
    { id: 5,  region: 'Region 2', province: 'WPS & SP',  networkEngineer: 'NW/SPW',                lea: 'AG / GL' },
    { id: 6,  region: 'Region 2', province: 'WPS & SP',  networkEngineer: 'NW/SPE',                lea: 'EMB / HB / MH' },

    { id: 7,  region: 'Region 2', province: 'SAB & UVA', networkEngineer: 'NW/SAB',                lea: 'KE / RN' },
    { id: 8,  region: 'Region 2', province: 'SAB & UVA', networkEngineer: 'NW/UVA',                lea: 'BD / BW / MRG' },

    { id: 9,  region: 'Region 1', province: 'CP & NCP',  networkEngineer: 'NW/NCP',                lea: 'AD / PR' },
    { id: 10, region: 'Region 1', province: 'CP & NCP',  networkEngineer: 'NW/CPS',                lea: 'GP / HT / NW' },
    { id: 11, region: 'Region 1', province: 'CP & NCP',  networkEngineer: 'NW/CPN',                lea: 'DB / KY / MT' },

    { id: 12, region: 'Region 1', province: 'WPN & NWP', networkEngineer: 'NW/NWPW',               lea: 'CW / PX' },
    { id: 13, region: 'Region 1', province: 'WPN & NWP', networkEngineer: 'NW/NWPE',               lea: 'KG / KLY' },
    { id: 14, region: 'Region 1', province: 'WPN & NWP', networkEngineer: 'NW/WPN',                lea: 'NG / WT' },

    // Metro
    { id: 15, region: 'Metro',    province: 'Metro 2',   networkEngineer: 'NW/WPE',                lea: 'KON / KK' },
    { id: 16, region: 'Metro',    province: 'Metro 2',   networkEngineer: 'NW/WPS',                lea: 'AW / HO' },
    { id: 17, region: 'Metro',    province: 'Metro 2',   networkEngineer: 'NW/WPSW',               lea: 'ND / RM' },

    { id: 18, region: 'Metro',    province: 'Metro 1',   networkEngineer: 'NW/WPNE',               lea: 'GQ / KI / NTB' },
    { id: 19, region: 'Metro',    province: 'Metro 1',   networkEngineer: 'NW/WPC-2 (CEN/HK/MD)',  lea: 'CEN / MD' },
    { id: 20, region: 'Metro',    province: 'Metro 1',   networkEngineer: 'NW/WPC-1 (CEN/HK/MD)',  lea: 'HK' },
  ];

  metroRegions: Region[] = [];
  metroProvinceGroups: { province: string; engineers: Region[] }[] = [];

  kpiRows: KpiRow[] = [];
  weightageSum = 0;
  totalWeightedByRegion: number[] = [];
  totalWeightedNormalized: number[] = [];

  private readonly rowChangesSub = new Subscription();
  private pendingFrame: number | null = null;

  constructor(private http: HttpClient) {
    const now = new Date();
    this.currentYear = now.getFullYear();
    this.currentMonth = now.toLocaleString('en-US', { month: 'long' });
  }

  ngOnInit(): void {
    // right side columns remain same
    this.metroRegions = this.regions.filter(r => r.region === 'Metro');

    const provinceMap = new Map<string, Region[]>();
    this.metroRegions.forEach(r => {
      const arr = provinceMap.get(r.province) ?? [];
      arr.push(r);
      provinceMap.set(r.province, arr);
    });

    this.metroProvinceGroups = Array.from(provinceMap.entries()).map(
      ([province, engineers]) => ({ province, engineers })
    );

    // ✅ Load left table from API (NO month/year filter)
    this.loadLeftTableFromApi();
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

  /** ✅ Fetch KPI definitions from backend (real data for LEFT table) */
  private loadLeftTableFromApi(): void {
    this.loading = true;
    this.error = null;

    this.http
      .get<KpiDefinition[]>(this.apiBase) // ✅ IMPORTANT: fetch ALL
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          const list = (res ?? []).sort((a, b) => a.rowNumber - b.rowNumber);

          this.kpiRows = list.map((row, rowIndex) => {
            // right side metrics still dummy
            const metrics: KpiMetric[] = this.metroRegions.map((_, colIndex) => {
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

    this.totalWeightedByRegion = this.metroRegions.map((_, colIndex) =>
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
