import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthResponse, LoginDto, RegisterDto } from '../models';

import { environment } from '../../environments/environment';

const BASE = environment.apiBaseUrl;
const TOKEN_KEY = 'auction_token';
const USER_KEY = 'auction_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private _authResponse = signal<AuthResponse | null>(this.loadUser());
  readonly currentUser = this._authResponse.asReadonly();
  readonly isLoggedIn = () => this._authResponse() !== null;

  register(dto: RegisterDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${BASE}/auth/register`, dto).pipe(
      tap((res) => this.persistSession(res)),
    );
  }

  login(dto: LoginDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${BASE}/auth/login`, dto).pipe(
      tap((res) => this.persistSession(res)),
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._authResponse.set(null);
    void this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private persistSession(res: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res));
    this._authResponse.set(res);
  }

  private loadUser(): AuthResponse | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as AuthResponse) : null;
    } catch {
      return null;
    }
  }
}
