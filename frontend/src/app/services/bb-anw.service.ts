import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Form7Record {
  [x: string]: any;
  id?: string;
  no: number;
  networkEngineerKpi: string;
  division: string;
  section: string;
  kpiPercent: number;
  unavailableMinutes: number;
  totalMinutes: number;
  totalNodes: number;
  month: number;
  year: number;
}

@Injectable({ providedIn: 'root' })
export class BbAnwService {
  private readonly apiUrl = 'http://localhost:5043/api/form7';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Form7Record[]> {
    return this.http.get<Form7Record[]>(this.apiUrl);
  }

  add(data: Form7Record): Observable<Form7Record> {
    return this.http.post<Form7Record>(`${this.apiUrl}/add`, data);
  }

  update(id: string, data: Form7Record): Observable<Form7Record> {
    return this.http.put<Form7Record>(`${this.apiUrl}/update/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }
}
