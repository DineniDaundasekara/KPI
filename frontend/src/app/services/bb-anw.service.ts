import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BbAnwNodeDto {
  nodeCode: string;
  unavailableMinutes?: number | null;
  totalMinutes?: number | null;
  totalNodes?: number | null;
  month: number; // ✅ new
  year: number;  // ✅ new
}

export interface BbAnwDto {
  id?: number; // ✅ int id now
  networkEngineerKpi: string;
  division?: string | null;
  section?: string | null;
  kpiPercent?: number | null; // ok (backend returns decimal -> json number)
  nodes?: BbAnwNodeDto[] | null;
}

// ✅ ADMIN HEADER ONLY
export interface BbAnwHeaderDto {
  id?: number; // ✅ int id now
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

  getById(id: number): Observable<BbAnwDto> {
    return this.http.get<BbAnwDto>(`${this.apiUrl}/${id}`);
  }

  add(data: BbAnwDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/add`, data);
  }

  update(id: number, data: BbAnwDto): Observable<any> {
    return this.http.put(`${this.apiUrl}/update/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }

  // ---------------------------
  // ADMIN PAGE (HEADER ONLY)
  // ---------------------------
  getHeaders(): Observable<BbAnwHeaderDto[]> {
    return this.http.get<BbAnwHeaderDto[]>(`${this.apiUrl}/headers`);
  }

  addHeader(data: BbAnwHeaderDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/add-header`, data);
  }

  updateHeader(id: number, data: BbAnwHeaderDto): Observable<any> {
    return this.http.put(`${this.apiUrl}/update-header/${id}`, data);
  }
}
