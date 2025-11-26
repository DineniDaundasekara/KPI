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
    try {
      // Mock data for demonstration - replace with actual API call
      const items: any[] = [
        // Add your mock data here for testing
        // { region: 'Metro', networkEngineer: 'Engineer A' },
        // { region: 'Region 1', networkEngineer: 'Engineer B' },
      ];
      
      const byRegion = new Map<string, Set<string>>();
      items.forEach(({ region, networkEngineer }) => {
        const code = this.normalizeEngineer(networkEngineer);
        if (!byRegion.has(region)) byRegion.set(region, new Set());
        byRegion.get(region)!.add(code);
      });

      this.regions = Array.from(byRegion.entries())
        .sort(([a], [b]) => this.sortRegionNames(a, b))
        .map(([title, set]) => ({ title, meters: Array.from(set) }));
    } catch (e) {
      console.error('Failed to load region table', e);
      this.regions = [];
    }
  }

  private initializeTotals(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    let attempts = 0;
    const maxAttempts = 20;

    const tryLoad = () => {
      const ls = this.readRow12FromLocalStorage();
      if (ls && Object.keys(ls).length) {
        this.totals = ls;
        this.loading = false;
      } else if (attempts < maxAttempts) {
        attempts += 1;
        setTimeout(tryLoad, 1000);
      } else {
        this.totals = {};
        this.loading = false;
      }
    };

    tryLoad();

    // Set up storage event listener
    this.storageEventListener = (event: StorageEvent) => {
      if (event.key === 'row12Payload') {
        const map = this.readRow12FromLocalStorage();
        if (map) this.totals = map;
      }
    };

    window.addEventListener('storage', this.storageEventListener);
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
      return 'limegreen';
    }
    
    const opacity = value / 100;
    return `rgba(62, 152, 199, ${opacity})`;
  }

  getMeterTextColor(meter: string, meters: string[]): string {
    return this.isMaxValue(meter, meters) ? 'limegreen' : '#444';
  }

  getMeterFontWeight(meter: string, meters: string[]): string {
    return this.isMaxValue(meter, meters) ? 'bold' : 'normal';
  }

  getCircularProgressBackground(meter: string, meters: string[]): string {
    const value = this.valueForMeter(meter);
    const isMax = this.isMaxValue(meter, meters);
    const color = isMax ? 'limegreen' : `rgba(62, 152, 199, ${value / 100})`;
    
    return `conic-gradient(${color} 0% ${value}%, #eee ${value}% 100%)`;
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