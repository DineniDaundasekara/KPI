import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ActivityRecord {
  id?: number;
  no: string;
  kpi: string;
  target: string;
  calculation: string;
  platform: string;
  responsibleDGM: string;
  definedOLADetails: string;
  dataSources: string;
}

@Injectable({
  providedIn: 'root'
})
export class TmActivityService {
  private apiBase = 'http://localhost:5043/api/TmActivityPlans';

  constructor(private http: HttpClient) {}

  getAll(): Observable<ActivityRecord[]> {
    return this.http.get<ActivityRecord[]>(this.apiBase);
  }

  add(data: Omit<ActivityRecord, 'id'>): Observable<ActivityRecord> {
    return this.http.post<ActivityRecord>(this.apiBase, data);
  }

  update(id: number, data: Partial<ActivityRecord>): Observable<ActivityRecord> {
    return this.http.put<ActivityRecord>(`${this.apiBase}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiBase}/${id}`);
  }
}
