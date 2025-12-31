import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Form4Row {
  id: string;
  no: number;
  kpi: string;
  target: string;
  calculation: string;
  platform: string;
  responsibledgm: string;
  definedoladetails: string;
  weightage?: number;
  datasources: string;

  CENHKMD: string; CENHKMD1: string; GQKINTB: string; NDRM: string; AWHO: string;
  KONKX: string; NGWT: string; KGKLY: string; CWPX: string; DBKYMT: string;
  GPHTNW: string; ADPR: string; BDBWMRG: string; KERN: string; EBMHMBH: string;
  AGGL: string; HRKTPH: string; BCAPKLTC: string; JA: string; KOMLTMBVA: string;

  v: number;

  areas_CENHKMD: number;
  areas_CENHKMD1: number;
  areas_GQKINTB: number;
  areas_NDRM: number;
  areas_AWHO: number;
  areas_KONKX: number;
  areas_NGWT: number;
  areas_KGKLY: number;
  areas_CWPX: number;
  areas_DBKYMT: number;
  areas_GPHTNW: number;
  areas_ADPR: number;
  areas_BDBWMRG: number;
  areas_KERN: number;
  areas_EBMHMBH: number;
  areas_AGGL: number;
  areas_HRKTPH: number;
  areas_BCAPKLTC: number;
  areas_JA: number;
  areas_KOMLTMBVA: number;

  updatedAt: string;

  year?: number;
  month?: number;
}

@Injectable({ providedIn: 'root' })
export class Form4ApiService {
  private baseUrl = 'http://localhost:5043/api/Form4';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Form4Row[]> {
    return this.http.get<Form4Row[]>(this.baseUrl);
  }

  create(row: Form4Row): Observable<Form4Row> {
    return this.http.post<Form4Row>(this.baseUrl, row);
  }

  update(id: string, row: Form4Row): Observable<Form4Row> {
    return this.http.put<Form4Row>(`${this.baseUrl}/${id}`, row);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
