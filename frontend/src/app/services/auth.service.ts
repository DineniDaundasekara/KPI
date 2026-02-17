import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs'; // Import necessary RxJS operators

export interface User {
  token: string;
  name: string;
  role: string;
}

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
    return this.http.post<User>(`${this.apiUrl}/login`, { serviceId })
      .pipe(tap(user => {
        localStorage.setItem('user', JSON.stringify(user));
        this.userSubject.next(user);
      }));
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
}
