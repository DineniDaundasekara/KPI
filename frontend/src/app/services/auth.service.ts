import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, map, tap } from 'rxjs'; // Import necessary RxJS operators

export interface User {
  token: string;
  name: string;
  role: string;
  pages?: string[]; // Added pages
  assignedPages?: string[];
}

type LoginResponse = {
  token: string;
  Name?: string;
  Role?: string;
  Pages?: string[];
  AssignedPages?: string[];
  name?: string;
  role?: string;
  pages?: string[];
  assignedPages?: string[];
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5043/api/auth'; // Hardcoded for simplicity
  private userSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public user$ = this.userSubject.asObservable(); // Expose as user$

  constructor(private http: HttpClient, private router: Router) { }

  public get userValue(): User | null {
    return this.userSubject.value;
  }

  login(serviceId: string): Observable<User> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { serviceId })
      .pipe(
        map((res) => ({
          token: res.token,
          name: res.name ?? res.Name ?? '',
          role: res.role ?? res.Role ?? '',
          pages: res.pages ?? res.Pages ?? [],
          assignedPages: res.assignedPages ?? res.AssignedPages ?? []
        })),
        tap(user => {
          localStorage.setItem('user', JSON.stringify(user));
          this.userSubject.next(user);
        })
      );
  }

  logout() {
    localStorage.removeItem('user');
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  private getUserFromStorage(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  getToken(): string | null {
    return this.userValue?.token || null;
  }

  getRole(): string | null {
    return this.userValue?.role || null;
  }

  getAllowedPages(): string[] {
    return this.userValue?.pages || [];
  }

  getAssignedPages(): string[] {
    return this.userValue?.assignedPages || [];
  }

  canEditPage(pageName: string): boolean {
    const normalize = (value: string | null | undefined) =>
      (value ?? '').trim().toLowerCase().replace(/[\s_-]+/g, '');

    const role = normalize(this.getRole());
    if (!role) {
      return false;
    }

    // Only PlatformAdmin can edit, and only for explicitly assigned pages
    if (role !== 'platformadmin') {
      return false;
    }

    const needle = normalize(pageName);
    if (!needle) {
      return false;
    }

    const assigned = this.getAssignedPages().map(normalize).filter(Boolean);
    if (!assigned.length) {
      return false;
    }

    return assigned.includes(needle);
  }
}
