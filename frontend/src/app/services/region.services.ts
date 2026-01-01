import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Region {
  id: number;
  region: string;
  province: string;
  networkengineer: string;
  leacode: string;
}

@Injectable({ providedIn: 'root' })
export class RegionService {
  private apiUrl = 'http://localhost:5043/api/regiondata';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Region[]> {
    return this.http.get<Region[]>(this.apiUrl);
  }

  create(data: Omit<Region, 'id'>): Observable<Region> {
    return this.http.post<Region>(this.apiUrl, data);
  }

  update(id: number, data: Region): Observable<Region> {
    return this.http.put<Region>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
