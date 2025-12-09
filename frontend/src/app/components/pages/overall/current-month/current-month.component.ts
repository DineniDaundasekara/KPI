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
  metrics: KpiMetric[]; // ordered same as metroRegions
}

@Component({
  selector: 'app-current-month',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './current-month.component.html',
  styleUrls: ['./current-month.component.scss'],
})
export class CurrentMonthComponent implements OnInit, AfterViewInit, OnDestroy {
  currentMonth: string;
  currentYear: number;

  @ViewChildren('leftRowRef', { read: ElementRef })
  private leftRowElements!: QueryList<ElementRef<HTMLTableRowElement>>;

  @ViewChildren('rightRowRef', { read: ElementRef })
  private rightRowElements!: QueryList<ElementRef<HTMLTableRowElement>>;

  // All regions (same data you shared)
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

    // Metro (these are the columns we show on the right table)
    { id: 15, region: 'Metro',    province: 'Metro 2',   networkEngineer: 'NW/WPE',                lea: 'KON / KK' },
    { id: 16, region: 'Metro',    province: 'Metro 2',   networkEngineer: 'NW/WPS',                lea: 'AW / HO' },
    { id: 17, region: 'Metro',    province: 'Metro 2',   networkEngineer: 'NW/WPSW',               lea: 'ND / RM' },

    { id: 18, region: 'Metro',    province: 'Metro 1',   networkEngineer: 'NW/WPNE',               lea: 'GQ / KI / NTB' },
    { id: 19, region: 'Metro',    province: 'Metro 1',   networkEngineer: 'NW/WPC-2 (CEN/HK/MD)',  lea: 'CEN / MD' },
    { id: 20, region: 'Metro',    province: 'Metro 1',   networkEngineer: 'NW/WPC-1 (CEN/HK/MD)',  lea: 'HK' }
  ];

  // Only Metro columns for this view (like your Metro screenshot)
  metroRegions: Region[] = [];
  metroProvinceGroups: { province: string; engineers: Region[] }[] = [];

  kpiRows: KpiRow[] = [];
  weightageSum = 0;
  totalWeightedByRegion: number[] = [];            // Σ(weighted) per Metro column
  totalWeightedNormalized: number[] = [];          // (Σ(weighted) / totalWeightage) * 100 per Metro column

  private readonly rowChangesSub = new Subscription();
  private pendingFrame: number | null = null;

  constructor() {
    const now = new Date();
    this.currentYear = now.getFullYear();
    this.currentMonth = now.toLocaleString('en-US', { month: 'long' });
  }

  ngOnInit(): void {
    // Only Metro region on right side
    this.metroRegions = this.regions.filter(r => r.region === 'Metro');

    // Group Metro by province: Metro 1 / Metro 2
    const provinceMap = new Map<string, Region[]>();
    this.metroRegions.forEach(r => {
      const arr = provinceMap.get(r.province) ?? [];
      arr.push(r);
      provinceMap.set(r.province, arr);
    });

    this.metroProvinceGroups = Array.from(provinceMap.entries()).map(
      ([province, engineers]) => ({ province, engineers })
    );

    this.buildDummyKpiRows();
    this.computeTotals();
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

    if (this.pendingFrame !== null) {
      cancelAnimationFrame(this.pendingFrame);
      this.pendingFrame = null;
    }
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.scheduleRowSync();
  }

  // Dummy KPI rows – later you can replace with data from API / DB
  private buildDummyKpiRows(): void {
    const baseRows: Omit<KpiRow, 'metrics'>[] = [
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

    this.kpiRows = baseRows.map((baseRow, rowIndex) => {
      const metrics: KpiMetric[] = this.metroRegions.map((_, colIndex) => {
        // Dummy pattern – replace with real values later
        const achieved = 100 - (rowIndex * 2 + colIndex); // 100, 99, 98...
        const weighted = +(baseRow.weightage * achieved / 100).toFixed(2);
        return { achieved, weighted };
      });

      return {
        ...baseRow,
        metrics,
      };
    });
  }

  private computeTotals(): void {
    // Total KPI weightage (used for bottom row normalisation)
    this.weightageSum = this.kpiRows.reduce(
      (sum, row) => sum + row.weightage,
      0
    );

    // Σ(weighted) per Metro column
    this.totalWeightedByRegion = this.metroRegions.map((_, colIndex) =>
      this.kpiRows.reduce(
        (sum, row) => sum + (row.metrics[colIndex]?.weighted ?? 0),
        0
      )
    );

    // Normalised final row = (Σ(weighted) / totalWeightage) * 100
    this.totalWeightedNormalized = this.totalWeightedByRegion.map(total =>
      this.weightageSum ? +(total / this.weightageSum * 100).toFixed(2) : 0
    );
  }

  private scheduleRowSync(): void {
    if (!this.leftRowElements || !this.rightRowElements) {
      return;
    }

    if (this.pendingFrame !== null) {
      cancelAnimationFrame(this.pendingFrame);
    }

    this.pendingFrame = requestAnimationFrame(() => {
      this.pendingFrame = null;
      this.syncRowHeights();
    });
  }

  private syncRowHeights(): void {
    const leftRows = this.leftRowElements.toArray().map(ref => ref.nativeElement);
    const rightRows = this.rightRowElements.toArray().map(ref => ref.nativeElement);

    if (!leftRows.length || !rightRows.length) {
      return;
    }

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
