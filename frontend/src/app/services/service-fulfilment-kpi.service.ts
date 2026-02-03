import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ServiceFulfilmentKpiDto {
  id?: number | string;
  kpi: string;
  target: string;
  calculation: string;
  platform: string;
  responsibleDgm: string;
  defineDoladetails?: string;
  definedoladetails?: string;
  weightage: number;
  dataSources: string;
  month: number;
  year: number;
  updatedAt?: string;
  displayOrder?: number;
}

interface ServiceFulfilmentMetricResponse {
  id?: number | string;
  kpi: string;
  target: string;
  platform: string;
  responsibleDgm: string;
  definedoladetails?: string;
  weightage: number;
  area: string;
  kpi_value: number;
  month: number;
  year: number;
}

export interface UpsertServiceFulfilmentMetricRequest {
  serviceFulfilmentKpiId: number;
  areaCode: string;
  kpiValue: number | null;
  month: number;
  year: number;
}

export interface ServiceFulfilmentMetricDto {
  id?: number | string;
  kpi: string;
  target: string;
  platform: string;
  responsibleDgm: string;
  definedoladetails?: string;
  weightage: number;
  area: string;
  kpiValue: number;
  month: number;
  year: number;
}

@Injectable({
  providedIn: 'root'
})
export class ServiceFulfilmentKpiService {
  private readonly apiUrl = 'http://localhost:5043/service-fulfilment-kpi';

  constructor(private http: HttpClient) {}

  getAll(month?: number, year?: number): Observable<ServiceFulfilmentKpiDto[]> {
    let params = new HttpParams();

    if (month) {
      params = params.set('month', month.toString());
    }

    if (year) {
      params = params.set('year', year.toString());
    }

    const options = params.keys().length ? { params } : {};
    return this.http
      .get<ServiceFulfilmentKpiDto[]>(this.apiUrl, options)
      .pipe(
        map((items) =>
          items.map((item, index) => {
            const definedOla =
              item.defineDoladetails ?? (item as any).definedoladetails ?? '';
            return {
              ...item,
              defineDoladetails: definedOla,
              definedoladetails: definedOla,
              displayOrder: (item as any).no ?? index + 1
            } as ServiceFulfilmentKpiDto;
          })
        )
      );
  }

  getById(id: number | string): Observable<ServiceFulfilmentKpiDto> {
    return this.http.get<ServiceFulfilmentKpiDto>(`${this.apiUrl}/${id}`);
  }

  add(data: ServiceFulfilmentKpiDto): Observable<ServiceFulfilmentKpiDto> {
    return this.http.post<ServiceFulfilmentKpiDto>(`${this.apiUrl}/add`, data);
  }

  update(id: number | string, data: ServiceFulfilmentKpiDto): Observable<ServiceFulfilmentKpiDto> {
    return this.http.put<ServiceFulfilmentKpiDto>(`${this.apiUrl}/update/${id}`, data);
  }

  delete(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }

  getMetrics(month: number, year: number, area?: string): Observable<ServiceFulfilmentMetricDto[]> {
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
            kpi: item.kpi,
            target: item.target,
            platform: item.platform,
            responsibleDgm: item.responsibleDgm,
            definedoladetails: item.definedoladetails ?? (item as any).defineDoladetails,
            weightage: item.weightage,
            area: item.area,
            kpiValue: item.kpi_value,
            month: item.month,
            year: item.year
          }))
        )
      );
  }

  upsertMetric(request: UpsertServiceFulfilmentMetricRequest): Observable<ServiceFulfilmentMetricDto> {
    return this.http
      .post<ServiceFulfilmentMetricResponse>(`${this.apiUrl}/metrics`, request)
      .pipe(
        map((item) => ({
          id: item.id,
          kpi: item.kpi,
          target: item.target,
          platform: item.platform,
          responsibleDgm: item.responsibleDgm,
          definedoladetails: item.definedoladetails ?? (item as any).defineDoladetails,
          weightage: item.weightage,
          area: item.area,
          kpiValue: item.kpi_value,
          month: item.month,
          year: item.year
        }))
      );
  }
}
