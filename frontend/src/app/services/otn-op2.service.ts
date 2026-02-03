import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaces
export interface OtnOpKpi {
  id: number;
  networkEngineerKpi: string;
  division?: string;
  section?: string;
  kpiPercent?: number;
}

export interface CreateOtnOpKpi {
  networkEngineerKpi: string;
  division?: string;
  section?: string;
  kpiPercent?: number;
}

export interface OtnOp2Metric {
  id: number;
  otnOp2Id: number;
  site: string;
  totalFailedLinks: number;
  linksSlaNotViolated: number;
  year: number;
  month: number;
}

@Injectable({
  providedIn: 'root'
})
export class OtnOp2Service {
  private readonly apiUrl = 'http://localhost:5043';

  constructor(private http: HttpClient) {}

  /**
   * Get all OtnOp2 KPIs
   */
  getAllKpis(): Observable<OtnOpKpi[]> {
    return this.http.get<OtnOpKpi[]>(`${this.apiUrl}/api/OtnOp2`);
  }

  /**
   * Create a new OtnOp2 KPI
   */
  createKpi(payload: CreateOtnOpKpi): Observable<OtnOpKpi> {
    return this.http.post<OtnOpKpi>(`${this.apiUrl}/api/OtnOp2`, payload);
  }

  /**
   * Update an existing OtnOp2 KPI
   */
  updateKpi(id: number, payload: CreateOtnOpKpi): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/api/OtnOp2/${id}`, payload);
  }

  /**
   * Delete an OtnOp2 KPI
   */
  deleteKpi(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/OtnOp2/${id}`);
  }

  /**
   * Get metrics for a specific OtnOp2 KPI by year and month
   */
  getMetrics(id: number, year: number, month: number): Observable<OtnOp2Metric[]> {
    return this.http.get<OtnOp2Metric[]>(
      `${this.apiUrl}/api/OtnOp2/${id}/metrics?year=${year}&month=${month}`
    );
  }

  /**
   * Upsert (create or update) metrics for an OtnOp2 KPI
   */
  upsertMetrics(id: number, metrics: OtnOp2Metric[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/OtnOp2/${id}/metrics`, metrics);
  }
}
