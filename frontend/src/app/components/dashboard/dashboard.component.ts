import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { trigger, transition, style, animate, state } from '@angular/animations';

interface RegionData {
  title: string;
  meters: string[];
}

interface TotalsData {
  [key: string]: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
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
  regions: RegionData[] = [];
  totals: TotalsData = {};
  loading = true;
  
  // Hover state management
  regionHoverStates: { [key: number]: boolean } = {};
  meterHoverStates: { [key: string]: boolean } = {};

  private storageEventListener?: (event: StorageEvent) => void;

  constructor(@Inject(PLATFORM_ID) private platformId: any) {}

  ngOnInit(): void {
    this.loadRegionData();
    this.initializeTotals();
  }

  ngOnDestroy(): void {
    if (this.storageEventListener && isPlatformBrowser(this.platformId)) {
      window.removeEventListener('storage', this.storageEventListener);
    }
  }

  private baseMeter(col: string): string {
    return String(col || '').replace(/-\d+$/, '');
  }

  private normalizeEngineer(str: string = ''): string {
    return String(str).split('(')[0].trim();
  }

  private sortRegionNames(a: string, b: string): number {
    if (a === 'Metro' && b !== 'Metro') return -1;
    if (b === 'Metro' && a !== 'Metro') return 1;

    const ra = a.match(/Region\s*(\d+)/i);
    const rb = b.match(/Region\s*(\d+)/i);
    if (ra && rb) return Number(ra[1]) - Number(rb[1]);

    return a.localeCompare(b);
  }

  private readRow12FromLocalStorage(): TotalsData | null {
    if (!isPlatformBrowser(this.platformId)) return null;

    try {
      const raw = localStorage.getItem('row12Payload');
      if (!raw) return null;

      const parsed = JSON.parse(raw);

      if (parsed?.valuesByMeter && typeof parsed.valuesByMeter === 'object') {
        return parsed.valuesByMeter;
      }

      if (Array.isArray(parsed?.columns) && Array.isArray(parsed?.values)) {
        const map: TotalsData = {};
        parsed.columns.forEach((m: string, i: number) => {
          const v = parseFloat(parsed.values[i]);
          map[m] = Number.isFinite(v) ? v : 0;
        });
        return map;
      }
    } catch (e) {
      console.warn('Failed to parse localStorage row12Payload', e);
    }

    return null;
  }

  private async loadRegionData(): Promise<void> {
    // Hardcoded regions to match React component exactly
    this.regions = [
      { title: 'Metro', meters: ['NW/WPC', 'NW/WPNE', 'NW/WPSW', 'NW/WPSE', 'NW/WPE'] },
      { title: 'Region1', meters: ['NW/WPN', 'NW/NWPE', 'NW/NWPW', 'NW/CPN', 'NW/CPS', 'NW/NCP'] },
      { title: 'Region2', meters: ['NW/UVA', 'NW/SAB', 'NW/SPE', 'NW/SPW', 'NW/WPS'] },
      { title: 'Region3', meters: ['NW/EP', 'NW/NP-1', 'NW/NP-2'] },
    ];
  }

  private initializeTotals(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.loading = false;
      return;
    }

    // Check immediately first
    const ls = this.readRow12FromLocalStorage();
    if (ls && Object.keys(ls).length) {
      this.totals = ls;
      this.loading = false;
    } else {
      // If no data, show dashboard with empty totals (will display 0.00%)
      this.totals = {};
      this.loading = false;
    }

    // Set up storage event listener for future updates
    this.storageEventListener = (event: StorageEvent) => {
      if (event.key === 'row12Payload') {
        const map = this.readRow12FromLocalStorage();
        if (map) {
          this.totals = map;
        }
      }
    };

    window.addEventListener('storage', this.storageEventListener);

    // Also listen for same-tab localStorage changes (using a custom event or polling)
    // For now, we'll check periodically if data becomes available
    const checkInterval = setInterval(() => {
      const currentData = this.readRow12FromLocalStorage();
      if (currentData && Object.keys(currentData).length > 0 && Object.keys(this.totals).length === 0) {
        this.totals = currentData;
        clearInterval(checkInterval);
      }
    }, 2000);

    // Clean up interval after 60 seconds
    setTimeout(() => clearInterval(checkInterval), 60000);
  }

  valueForMeter(meter: string): number {
    const exact = this.totals[meter];
    if (Number.isFinite(exact)) return exact;

    const base = this.totals[this.baseMeter(meter)];
    if (Number.isFinite(base)) return base;

    return 0;
  }

  getMaxValue(meters: string[]): number {
    const values = meters.map(m => this.valueForMeter(m));
    return values.length ? Math.max(...values) : 0;
  }

  isMaxValue(meter: string, meters: string[]): boolean {
    const value = this.valueForMeter(meter);
    const max = this.getMaxValue(meters);
    return Math.abs(value - max) < 0.0001 && max > 0;
  }

  getProgressBarColor(meter: string, meters: string[]): string {
    const value = this.valueForMeter(meter);
    const isMax = this.isMaxValue(meter, meters);
    
    if (isMax) {
      // 10% Accent - Green for good KPIs
      return '#28A745';
    }
    
    // 30% Secondary - SLT Blue with opacity
    const opacity = value / 100;
    return `rgba(0, 87, 166, ${opacity})`;
  }

  getMeterTextColor(meter: string, meters: string[]): string {
    // 10% Accent - Green for max values (good KPIs)
    return this.isMaxValue(meter, meters) ? '#28A745' : '#000';
  }

  getMeterFontWeight(meter: string, meters: string[]): string {
    return this.isMaxValue(meter, meters) ? 'bold' : 'normal';
  }

  getCircularProgressBackground(meter: string, meters: string[]): string {
    const value = this.valueForMeter(meter);
    const isMax = this.isMaxValue(meter, meters);
    const maxValue = 102; // Match React's maxValue
    const normalizedValue = Math.min(value, maxValue);
    // 10% Accent - Green for max (good KPIs), 30% Secondary - SLT Blue for others
    const color = isMax ? '#28A745' : `rgba(0, 87, 166, ${normalizedValue / 100})`;
    // 60% Primary - Light grey trail
    const trailColor = '#E0E0E0';
    
    return `conic-gradient(${color} 0% ${normalizedValue}%, ${trailColor} ${normalizedValue}% 100%)`;
  }

  getProgressTextColor(meter: string, meters: string[]): string {
    // 10% Accent - Green for max values (good KPIs)
    return this.isMaxValue(meter, meters) ? '#28A745' : '#000';
  }

  // Fix: Add Object reference for template
  get Object() {
    return Object;
  }

  trackByRegion(index: number, region: RegionData): string {
    return region.title;
  }

  trackByMeter(index: number, meter: string): string {
    return meter;
  }
}