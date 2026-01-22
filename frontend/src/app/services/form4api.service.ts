import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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

interface ServiceFulfilmentMetricResponse {
  id?: string;
  no: number;
  kpi: string;
  target: string;
  platform: string;
  responsibleDgm: string;
  weightage: number;
  area: string;
  kpi_value: number;
  month: number;
  year: number;
}

export interface ServiceFulfilmentMetric {
  id?: string;
  no: number;
  kpi: string;
  target: string;
  platform: string;
  responsibleDgm: string;
  weightage: number;
  area: string;
  kpiValue: number;
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

  getMetrics(month: number, year: number, area?: string): Observable<ServiceFulfilmentMetric[]> {
    let params = new HttpParams()
      .set('month', month.toString())
      .set('year', year.toString());

    if (area) {
      params = params.set('area', area);
    }

    return this.http
      .get<ServiceFulfilmentMetricResponse[]>(`${this.apiUrl}/metrics`, { params })
      .pipe(
        map((items) =>
          items.map((item) => ({
            id: item.id,
            no: item.no,
            kpi: item.kpi,
            target: item.target,
            platform: item.platform,
            responsibleDgm: item.responsibleDgm,
            weightage: item.weightage,
            area: item.area,
            kpiValue: item.kpi_value,
            month: item.month,
            year: item.year
          }))
        )
      );
  }
}
