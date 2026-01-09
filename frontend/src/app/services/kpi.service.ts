import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface KpiRecord {
  id?: string;
  no: number;
  network_Engineer_Kpi: string;
  division: string;
  section: string;
  kpi_Percent: number;
}

@Injectable({
  providedIn: 'root'
})
export class KpiService {
  private apiUrl = 'http://localhost:5043/api/kpi' ; // example

  constructor(private http: HttpClient) {}

  getAll(): Observable<KpiRecord[]> {
    return this.http.get<KpiRecord[]>(this.apiUrl);
  }

  create(data: KpiRecord): Observable<void> {
    return this.http.post<void>(this.apiUrl, data);
  }

  update(id: string, data: KpiRecord): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
