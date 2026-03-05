/*
 File: dashboard.component.ts
 Description:
 Angular standalone dashboard component responsible for displaying
 regional KPI performance using circular meters.

 Data Sources:
 - Region API
 - RTOM Area API
 - Overall KPI Results API

 Features:
 - Dynamic KPI meters by region
 - Modal KPI breakdown
 - Hover animations
 - Loading and error states
*/

import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { forkJoin } from 'rxjs';


/* =========================================================
   DATA INTERFACES
========================================================= */

/* Meter displayed inside each region */
interface MeterData {
  code: string;
  label: string;
  engineer?: string;
}

/* Region container */
interface RegionData {
  title: string;
  meters: MeterData[];
}

/* KPI totals lookup */
interface TotalsData {
  [key: string]: number;
}

/* Region API response */
type RegionApi = {
  id: number;
  region: string;
  province: string;
  networkEngineer: string;
  leaCode: string;
};

/* RTOM Area API response */
type RtomAreaApi = {
  areaCode: string;
  displayName: string;
};

/* Overall KPI result API response */
type OverallKpiResultApi = {
  areaCode: string;
  overallKpiValuePercent: number;
  kpiDefinitionId: number;
  kpiName?: string;
  achievedKpi: number;
  maximumPointsPerKpi: number;
  pointsAchieved: number;
};

/* KPI row inside modal */
type MeterKpiRow = {
  kpiDefinitionId: number;
  kpiName: string;
  achievedKpi: number;
  maximumPointsPerKpi: number;
  pointsAchieved: number;
};

/* Detailed modal data */
type MeterDetails = {
  region: string;
  province: string;
  networkEngineer: string;
  leaCode: string;
  displayName: string;
  overallPercent: number;
  totalMaximumPoints: number;
  totalPointsAchieved: number;
  kpiRows: MeterKpiRow[];
};


/* =========================================================
   DASHBOARD COMPONENT
========================================================= */

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],

  /* UI animations */
  animations: [

    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('600ms ease-out', style({ opacity: 1 }))
      ])
    ]),

    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),

    trigger('scaleIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ]),

    trigger('hoverScale', [
      state('normal', style({ transform: 'scale(1)', boxShadow: '0 8px 20px rgba(0,0,0,0.1)' })),
      state('hover', style({ transform: 'scale(1.02)', boxShadow: '0 12px 30px rgba(0,0,0,0.15)' })),
      transition('normal <=> hover', animate('200ms ease-in-out'))
    ]),

    trigger('meterHover', [
      state('normal', style({ transform: 'scale(1)' })),
      state('hover', style({ transform: 'scale(1.1)' })),
      transition('normal <=> hover', animate('200ms ease-in-out'))
    ])
  ]
})

export class DashboardComponent implements OnInit, OnDestroy {

  /* =============================
     DASHBOARD DATA
  ============================== */

  regions: RegionData[] = [];
  totals: TotalsData = {};

  loading = true;
  error: string | null = null;

  selectedDetails: MeterDetails | null = null;
  selectedRegionTitle = '';

  regionCount = 0;
  engineerCount = 0;
  provinceCount = 0;
  leaCount = 0;

  /* Hover states */
  regionHoverStates: { [key: number]: boolean } = {};
  meterHoverStates: { [key: string]: boolean } = {};

  /* API endpoints */
  private readonly regionApiBase = 'http://localhost:5043/api/regiondata';
  private readonly rtomApiBase = 'http://localhost:5043/api/rtom-areas';
  private readonly overallKpiApiBase = 'http://localhost:5043/api/overall-kpi-results';

  /* Raw API data */
  private regionRows: RegionApi[] = [];
  private overallRows: OverallKpiResultApi[] = [];

  /* Lookup maps */
  private engineerLookup = new Map<string, string>();


  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: any
  ) {}



  /* =========================================================
     COMPONENT LIFECYCLE
  ========================================================= */

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
  }



  /* =========================================================
     LOAD DASHBOARD DATA
  ========================================================= */

  private loadDashboardData(): void {

    if (!isPlatformBrowser(this.platformId)) {
      this.loading = false;
      return;
    }

    this.loading = true;
    this.error = null;

    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    forkJoin({

      regions: this.http.get<RegionApi[]>(this.regionApiBase),

      rtomAreas: this.http.get<RtomAreaApi[]>(this.rtomApiBase),

      overall: this.http.get<OverallKpiResultApi[]>(
        `${this.overallKpiApiBase}?month=${month}&year=${year}`
      ),

    }).subscribe({

      next: ({ regions, rtomAreas, overall }) => {

        this.regionRows = regions ?? [];
        this.overallRows = overall ?? [];

        /* =============================
           BUILD LOOKUP MAPS
        ============================== */

        const rtomLookup = new Map<string, string>();

        (rtomAreas ?? []).forEach((area) => {

          const code = this.normalizeArea(
            (area as any).areaCode ?? (area as any).AreaCode ?? ''
          );

          const name =
            (area as any).displayName ??
            (area as any).DisplayName ??
            '';

          if (code) rtomLookup.set(code, name);
        });


        const engineerLookup = new Map<string, string>();

        (regions ?? []).forEach((row) => {

          const code = this.normalizeArea(
            (row as any).leaCode ?? (row as any).LeaCode ?? ''
          );

          const engineer = this.normalizeName(
            (row as any).networkEngineer ??
            (row as any).NetworkEngineer ??
            ''
          );

          if (code && engineer && !engineerLookup.has(code)) {
            engineerLookup.set(code, engineer);
          }

        });

        this.engineerLookup = engineerLookup;


        /* =============================
           BUILD KPI PERCENT LOOKUP
        ============================== */

        const percentLookup = new Map<string, number>();

        (overall ?? []).forEach((row) => {

          const code = this.normalizeArea(
            (row as any).areaCode ?? (row as any).AreaCode ?? ''
          );

          if (!code || percentLookup.has(code)) return;

          const raw =
            (row as any).overallKpiValuePercent ??
            (row as any).OverallKpiValuePercent ??
            0;

          percentLookup.set(code, Number(raw) || 0);

        });


        /* =============================
           BUILD REGION STRUCTURE
        ============================== */

        const regionMap = new Map<string, Set<string>>();

        (regions ?? []).forEach((row) => {

          const regionName =
            (row as any).region ??
            (row as any).Region ??
            'Unknown';

          const areaCode =
            (row as any).leaCode ??
            (row as any).LeaCode ??
            '';

          if (!areaCode) return;

          const set = regionMap.get(regionName) ?? new Set<string>();

          set.add(areaCode);

          regionMap.set(regionName, set);

        });


        /* =============================
           BUILD REGION METERS
        ============================== */

        this.regions = Array.from(regionMap.entries())
          .map(([regionName, areaCodes]) => {

            const meters = Array.from(areaCodes)
              .map((code) => {

                const normalizedCode = this.normalizeArea(code);

                const label =
                  rtomLookup.get(normalizedCode) || code;

                const engineer =
                  engineerLookup.get(normalizedCode);

                return { code, label, engineer } as MeterData;

              })
              .sort((a, b) => a.label.localeCompare(b.label));

            return { title: regionName, meters } as RegionData;

          });

        /* KPI totals */
        const totals: TotalsData = {};

        percentLookup.forEach((value, code) => {
          totals[code] = value;
        });

        this.totals = totals;

        this.loading = false;

        this.cdr.detectChanges();

      },

      error: (err) => {

        console.error('Failed to load dashboard data', err);

        this.error = 'Unable to load dashboard data.';

        this.loading = false;

        this.regions = [];
        this.totals = {};

        this.cdr.detectChanges();

      }

    });

  }



  /* =========================================================
     HELPER FUNCTIONS
  ========================================================= */

  private normalizeArea(value: string): string {
    return String(value ?? '')
      .replace(/[^A-Za-z0-9]/g, '')
      .toLowerCase();
  }

  private normalizeName(value: string): string {
    return String(value ?? '').trim();
  }


  valueForMeter(meter: MeterData): number {

    const key = this.normalizeArea(meter.code);

    const exact = this.totals[key];

    return Number.isFinite(exact) ? exact : 0;

  }


  getEngineerForMeter(meter: MeterData): string {

    const key = this.normalizeArea(meter.code);

    return meter.engineer || this.engineerLookup.get(key) || '—';

  }



  /* =========================================================
     KPI COLOR LOGIC
  ========================================================= */

  getColorForValue(value: number): string {

    if (value > 80) {
      return '#28A745';
    }

    if (value >= 30) {
      return '#FFC107';
    }

    return '#DC3545';
  }



  getCircularProgressBackground(
    meter: MeterData,
    meters: MeterData[]
  ): string {

    const value = this.valueForMeter(meter);

    const maxValue = 102;

    const normalizedValue = Math.min(value, maxValue);

    const color = this.getColorForValue(value);

    const trailColor = '#E0E0E0';

    return `conic-gradient(${color} 0% ${normalizedValue}%, ${trailColor} ${normalizedValue}% 100%)`;

  }



  /* =========================================================
     MODAL FUNCTIONS
  ========================================================= */

  openMeterDetails(region: RegionData, meter: MeterData): void {

    const areaKey = this.normalizeArea(meter.code);

    const matchingRegion = this.regionRows.find((row) =>
      this.normalizeArea(
        (row as any).leaCode ?? (row as any).LeaCode ?? ''
      ) === areaKey
    );


    const rows = this.overallRows.filter((row) =>
      this.normalizeArea(
        (row as any).areaCode ?? (row as any).AreaCode ?? ''
      ) === areaKey
    );


    const totalMaximumPoints = rows.reduce(
      (sum, row) =>
        sum +
        Number(
          (row as any).maximumPointsPerKpi ??
          (row as any).MaximumPointsPerKpi ??
          0
        ),
      0
    );


    const totalPointsAchieved = rows.reduce(
      (sum, row) =>
        sum +
        Number(
          (row as any).pointsAchieved ??
          (row as any).PointsAchieved ??
          0
        ),
      0
    );


    const overallPercent =
      totalMaximumPoints > 0
        ? (totalPointsAchieved / totalMaximumPoints) * 100
        : 0;


    const kpiRows: MeterKpiRow[] = rows.map((row) => ({
      kpiDefinitionId: Number(
        (row as any).kpiDefinitionId ??
        (row as any).KpiDefinitionId ??
        0
      ),
      kpiName: String(
        (row as any).kpiName ??
        (row as any).KpiName ??
        ''
      ),
      achievedKpi: Number(
        (row as any).achievedKpi ??
        (row as any).AchievedKpi ??
        0
      ),
      maximumPointsPerKpi: Number(
        (row as any).maximumPointsPerKpi ??
        (row as any).MaximumPointsPerKpi ??
        0
      ),
      pointsAchieved: Number(
        (row as any).pointsAchieved ??
        (row as any).PointsAchieved ??
        0
      ),
    }));


    this.selectedDetails = {

      region: matchingRegion?.region ?? region.title,

      province: matchingRegion?.province ?? '—',

      networkEngineer:
        matchingRegion?.networkEngineer ??
        this.getEngineerForMeter(meter),

      leaCode: matchingRegion?.leaCode ?? meter.code,

      displayName: meter.label || meter.code,

      overallPercent: Number(overallPercent.toFixed(2)),

      totalMaximumPoints: Number(totalMaximumPoints.toFixed(4)),

      totalPointsAchieved: Number(totalPointsAchieved.toFixed(4)),

      kpiRows,

    };

  }


  closeDetails(): void {

    this.selectedDetails = null;

    this.selectedRegionTitle = '';

  }

}