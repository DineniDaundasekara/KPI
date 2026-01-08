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

  // 🔴 FIXED: route must match backend Form9Controller
  // Backend routes:
  // GET    /form9
  // POST   /form9/add
  // PUT    /form9/update/{id}
  // DELETE /form9/delete/{id}
  private readonly apiUrl = 'http://localhost:5043/form9';

  constructor(private http: HttpClient) {}

  // GET all Form9 records
  getAll(): Observable<KpiRecord[]> {
    return this.http.get<KpiRecord[]>(this.apiUrl);
  }

  // CREATE new Form9 record
  create(data: KpiRecord): Observable<KpiRecord> {
    return this.http.post<KpiRecord>(`${this.apiUrl}/add`, data);
  }

  // UPDATE existing Form9 record
  update(id: string, data: KpiRecord): Observable<KpiRecord> {
    return this.http.put<KpiRecord>(`${this.apiUrl}/update/${id}`, data);
  }

  // DELETE Form9 record
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }
}
