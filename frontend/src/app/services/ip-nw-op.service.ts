import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface IpNwOpKpiDto {
  _id: string;
  no: number;
  network_engineer_kpi: string;
  division: string;
  section: string;
  kpi_percent: number;
  unavailable_minutes?: Record<string, number | null>;
  total_minutes?: Record<string, number | null>;
  total_nodes?: Record<string, number | null>;
}

export interface IpNwOpMetricPayload {
  unavailableMinutes?: number | null;
  totalMinutes?: number | null;
  totalNodes?: number | null;
}

@Injectable({ providedIn: 'root' })
export class IpNwOpService {
  private readonly apiBase = 'http://localhost:5043/ip-nw-op';

  constructor(private http: HttpClient) {}

  getAll(): Observable<IpNwOpKpiDto[]> {
    return this.http.get<IpNwOpKpiDto[]>(`${this.apiBase}/`);
  }

  add(data: Omit<IpNwOpKpiDto, '_id'>): Observable<IpNwOpKpiDto> {
    return this.http.post<IpNwOpKpiDto>(`${this.apiBase}/add`, data);
  }

  update(id: string, data: Partial<IpNwOpKpiDto>): Observable<IpNwOpKpiDto> {
    return this.http.put<IpNwOpKpiDto>(`${this.apiBase}/update/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiBase}/delete/${id}`);
  }

  upsertMetric(id: string, areaCode: string, payload: IpNwOpMetricPayload): Observable<IpNwOpKpiDto> {
    return this.http.put<IpNwOpKpiDto>(`${this.apiBase}/metrics/${id}/${areaCode}`, payload);
  }
}
