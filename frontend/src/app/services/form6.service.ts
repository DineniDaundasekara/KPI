import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Form6Record {
  _id: string;
  no: number;
  network_engineer_kpi: string;
  division: string;
  section: string;
  kpi_percent: number;

  total_minutes?: Record<string, string | number>;
  unavailable_minutes?: Record<string, string | number>;
  total_nodes?: Record<string, string | number>;
}

@Injectable({
  providedIn: 'root'
})
export class Form6Service {
  private apiBase = 'http://localhost:5043/form6';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Form6Record[]> {
    return this.http.get<Form6Record[]>(`${this.apiBase}/`);
  }

  add(data: Omit<Form6Record, '_id'>): Observable<Form6Record> {
    return this.http.post<Form6Record>(`${this.apiBase}/add`, data);
  }

  update(id: string, data: Partial<Form6Record>): Observable<Form6Record> {
    return this.http.put<Form6Record>(`${this.apiBase}/update/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiBase}/delete/${id}`);
  }
}
