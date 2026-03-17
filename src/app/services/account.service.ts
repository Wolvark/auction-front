import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Account, AddFundsDto, Transaction } from '../models';

import { environment } from '../../environments/environment';

const BASE = environment.apiBaseUrl;

@Injectable({ providedIn: 'root' })
export class AccountService {
  private http = inject(HttpClient);

  getByCustomer(customerId: number): Observable<Account> {
    return this.http.get<Account>(`${BASE}/accounts/customer/${customerId}`);
  }

  addFunds(customerId: number, dto: AddFundsDto): Observable<Transaction> {
    return this.http.post<Transaction>(`${BASE}/accounts/customer/${customerId}/deposit`, dto);
  }
}
