import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BbAnwNodeDto {
  nodeCode: string;
  unavailableMinutes?: number | null;
  totalMinutes?: number | null;
  totalNodes?: number | null;
}

export interface BbAnwDto {
  kpiId?: string;
  mongoObjectId?: string | null;
  no: number;
  networkEngineerKpi: string;
  division?: string | null;
  section?: string | null;
  kpiPercent?: number | null;
  nodes: BbAnwNodeDto[];
}

// ✅ ADMIN HEADER ONLY
export interface BbAnwHeaderDto {
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
  private readonly apiUrl = 'http://localhost:5043/api/bb-anw';

  constructor(private http: HttpClient) {}

  // ---------------------------
  // PLATFORM KPI (FULL)
  // ---------------------------
  getAll(): Observable<BbAnwDto[]> {
    return this.http.get<BbAnwDto[]>(this.apiUrl);
  }

  add(data: BbAnwDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/add`, data);
  }

  update(id: string, data: BbAnwDto): Observable<any> {
    return this.http.put(`${this.apiUrl}/update/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }

  // ---------------------------
  // ADMIN PAGE (HEADER ONLY) ✅
  // ---------------------------
  getHeaders(): Observable<BbAnwHeaderDto[]> {
    return this.http.get<BbAnwHeaderDto[]>(`${this.apiUrl}/headers`);
  }

  addHeader(data: BbAnwHeaderDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/add-header`, data);
  }

  updateHeader(id: string, data: BbAnwHeaderDto): Observable<any> {
    return this.http.put(`${this.apiUrl}/update-header/${id}`, data);
  }
}
