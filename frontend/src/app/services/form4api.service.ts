import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ServiceFulfilmentKpi {
  id?: string;
  no: number;
  kpi: string;
  target: string;
  calculation: string;
  platform: string;
  responsibleDgm: string;
  definedoladetails: string;
  weightage: number;
  dataSources: string;
  month: number;
  year: number;
}

@Injectable({
  providedIn: 'root'
})
export class Form4ApiService {

  private readonly apiUrl = 'http://localhost:5043/form4';

  constructor(private http: HttpClient) {}

  getAll(): Observable<ServiceFulfilmentKpi[]> {
    return this.http.get<ServiceFulfilmentKpi[]>(this.apiUrl);
  }

  add(data: ServiceFulfilmentKpi): Observable<ServiceFulfilmentKpi> {
    return this.http.post<ServiceFulfilmentKpi>(`${this.apiUrl}/add`, data);
  }

  update(id: string, data: ServiceFulfilmentKpi): Observable<ServiceFulfilmentKpi> {
    return this.http.put<ServiceFulfilmentKpi>(`${this.apiUrl}/update/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }
}
