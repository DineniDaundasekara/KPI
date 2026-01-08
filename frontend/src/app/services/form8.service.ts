import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Form8Service {

  private baseUrl = 'http://localhost:5043/form8';

  constructor(private http: HttpClient) {}

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }

  add(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/add`, data);
  }

  update(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/update/${id}`, data);
  }

  delete(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/delete/${id}`);
  }
}
