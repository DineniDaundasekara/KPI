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

export interface OtnOp1Metric {
  id: number;
  otnOp1Id: number;
  site: string;
  unavailableMinutes: number;
  totalMinutes: number;
  totalNodes: number;
  year: number;
  month: number;
}

@Injectable({
  providedIn: 'root'
})
export class OtnOp1Service {
  private readonly apiUrl = 'http://localhost:5043';

  constructor(private http: HttpClient) {}

  /**
   * Get all OtnOp1 KPIs
   */
  getAllKpis(): Observable<OtnOpKpi[]> {
    return this.http.get<OtnOpKpi[]>(`${this.apiUrl}/api/OtnOp1`);
  }

  /**
   * Create a new OtnOp1 KPI
   */
  createKpi(payload: CreateOtnOpKpi): Observable<OtnOpKpi> {
    return this.http.post<OtnOpKpi>(`${this.apiUrl}/api/OtnOp1`, payload);
  }

  /**
   * Update an existing OtnOp1 KPI
   */
  updateKpi(id: number, payload: CreateOtnOpKpi): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/api/OtnOp1/${id}`, payload);
  }

  /**
   * Delete an OtnOp1 KPI
   */
  deleteKpi(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/OtnOp1/${id}`);
  }

  /**
   * Get metrics for a specific OtnOp1 KPI by year and month
   */
  getMetrics(id: number, year: number, month: number): Observable<OtnOp1Metric[]> {
    return this.http.get<OtnOp1Metric[]>(
      `${this.apiUrl}/api/OtnOp1/${id}/metrics?year=${year}&month=${month}`
    );
  }

  /**
   * Upsert (create or update) metrics for an OtnOp1 KPI
   */
  upsertMetrics(id: number, metrics: OtnOp1Metric[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/OtnOp1/${id}/metrics`, metrics);
  }
}
