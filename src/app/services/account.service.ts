import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Account, Bid, DepositRequestDto, Transaction } from '../models';

const BASE = 'http://localhost:8080/api/v1';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private http = inject(HttpClient);

  getMyAccount(): Observable<Account> {
    return this.http.get<Account>(`${BASE}/accounts/me`);
  }

  deposit(dto: DepositRequestDto): Observable<Account> {
    return this.http.post<Account>(`${BASE}/accounts/me/deposit`, dto);
  }

  getTransactionHistory(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${BASE}/accounts/me/transactions`);
  }

  getBidHistory(): Observable<Bid[]> {
    return this.http.get<Bid[]>(`${BASE}/accounts/me/bids`);
  }
}
