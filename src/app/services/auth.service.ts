import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Customer, RegisterDto, LoginDto, AuthResponse } from '../models';

const BASE = 'http://localhost:8080/api/v1';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  currentCustomer = signal<Customer | null>(null);

  constructor() {
    const stored = localStorage.getItem('currentCustomer');
    if (stored) {
      try {
        this.currentCustomer.set(JSON.parse(stored));
      } catch {
        localStorage.removeItem('currentCustomer');
        localStorage.removeItem('authToken');
      }
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  register(dto: RegisterDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${BASE}/auth/register`, dto);
  }

  login(dto: LoginDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${BASE}/auth/login`, dto).pipe(
      tap((resp) => {
        localStorage.setItem('authToken', resp.token);
        localStorage.setItem('currentCustomer', JSON.stringify(resp.customer));
        this.currentCustomer.set(resp.customer);
      }),
    );
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentCustomer');
    this.currentCustomer.set(null);
    this.router.navigate(['/login']);
  }
}
