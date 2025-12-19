import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RegionDto {
  id: string;
  region: string;
  province: string;
  networkEngineer: string;
  lea: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class RegionService {
  private apiUrl = 'http://localhost:5043/api/region';  // Your backend API URL

  constructor(private http: HttpClient) {}

  // Get all regions
  getAllRegions(): Observable<RegionDto[]> {
    return this.http.get<RegionDto[]>(this.apiUrl);
  }

  // Get a region by ID
  getRegionById(id: string): Observable<RegionDto> {
    return this.http.get<RegionDto>(`${this.apiUrl}/${id}`);
  }

  // Create a new region
  createRegion(region: RegionDto): Observable<RegionDto> {
    return this.http.post<RegionDto>(this.apiUrl, region);
  }

  // Update an existing region
  updateRegion(id: string, region: RegionDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, region);
  }

  // Delete a region
  deleteRegion(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
