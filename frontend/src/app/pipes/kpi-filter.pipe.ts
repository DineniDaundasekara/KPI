// src/app/pipes/kpi-filter.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

export interface KpiRow {
  rowNumber?: number | null;
  perspectives?: string | null;
  strategicObjectives?: string | null;
  keyPerformanceIndicators?: string | null;
  unit?: string | null;
  descriptionOfKPI?: string | null;
  weightage?: number | null;
}

@Pipe({
  name: 'kpiFilter',
  standalone: true,   // important for standalone components
  pure: true
})
export class KpiFilterPipe implements PipeTransform {
  transform(
    rows: KpiRow[] | null | undefined,
    excludedRowNumbers: number[] = []
  ): KpiRow[] {
    if (!Array.isArray(rows)) {
      return [];
    }
    if (!excludedRowNumbers || excludedRowNumbers.length === 0) {
      return rows;
    }

    return rows.filter(row => {
      const num = row.rowNumber != null ? Number(row.rowNumber) : NaN;
      return !excludedRowNumbers.includes(num);
    });
  }
}
