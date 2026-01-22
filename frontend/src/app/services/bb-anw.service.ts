import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Form7NodeDto {
  nodeCode: string;
  unavailableMinutes?: number | null;
  totalMinutes?: number | null;
  totalNodes?: number | null;
}

export interface Form7Dto {
  kpiId?: string;
  mongoObjectId?: string | null;
  no: number;
  networkEngineerKpi: string;
  division?: string | null;
  section?: string | null;
  kpiPercent?: number | null;
  nodes: Form7NodeDto[];
}

// ✅ ADMIN HEADER ONLY
export interface Form7HeaderDto {
  kpiId?: string;
  mongoObjectId?: string | null;
  no: number;
  networkEngineerKpi: string;
  division?: string | null;
  section?: string | null;
  kpiPercent?: number | null;
}

@Injectable({ providedIn: 'root' })
export class BbAnwService {
  private readonly apiUrl = 'http://localhost:5043/api/form7';

  constructor(private http: HttpClient) {}

  // ---------------------------
  // PLATFORM KPI (FULL)
  // ---------------------------
  getAll(): Observable<Form7Dto[]> {
    return this.http.get<Form7Dto[]>(this.apiUrl);
  }

  add(data: Form7Dto): Observable<any> {
    return this.http.post(`${this.apiUrl}/add`, data);
  }

  update(id: string, data: Form7Dto): Observable<any> {
    return this.http.put(`${this.apiUrl}/update/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }

  // ---------------------------
  // ADMIN PAGE (HEADER ONLY) ✅
  // ---------------------------
  getHeaders(): Observable<Form7HeaderDto[]> {
    return this.http.get<Form7HeaderDto[]>(`${this.apiUrl}/headers`);
  }

  addHeader(data: Form7HeaderDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/add-header`, data);
  }

  updateHeader(id: string, data: Form7HeaderDto): Observable<any> {
    return this.http.put(`${this.apiUrl}/update-header/${id}`, data);
  }
}
