import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface IpNwOpKpiDto {
  id: number;
  network_engineer_kpi: string;
  division: string;
  section: string;
  kpi_percent: number;
  updated_at?: string;
  unavailable_minutes?: Record<string, number | null>;
  total_minutes?: Record<string, number | null>;
  total_nodes?: Record<string, number | null>;
}

export interface IpNwOpMetricPayload {
  unavailableMinutes?: number | null;
  totalMinutes?: number | null;
  totalNodes?: number | null;
}

export interface IpNwOpMetric {
  ip_nw_op_kpi_id: number;
  area_code: string;
  month: number;
  year: number;
  unavailable_minutes?: number | null;
  total_minutes?: number | null;
  total_nodes?: number | null;
}

@Injectable({ providedIn: 'root' })
export class IpNwOpService {
  private readonly apiBase = 'http://localhost:5043/ip-nw-op';

  constructor(private http: HttpClient) {}

  getAll(month?: number, year?: number, area?: string): Observable<IpNwOpKpiDto[]> {
    let params = new HttpParams();
    if (month !== undefined) params = params.set('month', month.toString());
    if (year !== undefined) params = params.set('year', year.toString());
    if (area) params = params.set('area', area);
    
    return this.http.get<IpNwOpKpiDto[]>(`${this.apiBase}/`, { params });
  }

  add(data: Omit<IpNwOpKpiDto, 'id' | 'updated_at'>): Observable<IpNwOpKpiDto> {
    return this.http.post<IpNwOpKpiDto>(`${this.apiBase}/add`, data);
  }

  update(id: number, data: Partial<Omit<IpNwOpKpiDto, 'id'>>): Observable<IpNwOpKpiDto> {
    return this.http.put<IpNwOpKpiDto>(`${this.apiBase}/update/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiBase}/delete/${id}`);
  }

  upsertMetric(
    kpiId: number,
    areaCode: string,
    month: number,
    year: number,
    payload: IpNwOpMetricPayload
  ): Observable<IpNwOpKpiDto> {
    let params = new HttpParams();
    params = params.set('month', month.toString());
    params = params.set('year', year.toString());
    
    return this.http.put<IpNwOpKpiDto>(
      `${this.apiBase}/metrics/${kpiId}/${areaCode}`,
      payload,
      { params }
    );
  }

  getMetrics(month: number, year: number, areaCode?: string): Observable<IpNwOpMetric[]> {
    let params = new HttpParams();
    params = params.set('month', month.toString());
    params = params.set('year', year.toString());
    if (areaCode) params = params.set('areaCode', areaCode);
    
    return this.http.get<IpNwOpMetric[]>(`${this.apiBase}/metrics`, { params });
  }
}
