import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Bid, CreateBidDto, BidStatus } from '../models';

import { environment } from '../../environments/environment';

const BASE = environment.apiBaseUrl;

@Injectable({ providedIn: 'root' })
export class BidService {
  private http = inject(HttpClient);

  getAll(): Observable<Bid[]> {
    return this.http.get<Bid[]>(`${BASE}/bids`);
  }

  getById(id: number): Observable<Bid> {
    return this.http.get<Bid>(`${BASE}/bids/${id}`);
  }

  getByCustomer(customerId: number): Observable<Bid[]> {
    return this.http.get<Bid[]>(`${BASE}/bids/customer/${customerId}`);
  }

  getByStatus(status: BidStatus): Observable<Bid[]> {
    return this.http.get<Bid[]>(`${BASE}/bids/status/${status}`);
  }

  create(dto: CreateBidDto): Observable<Bid> {
    return this.http.post<Bid>(`${BASE}/bids`, dto);
  }

  updateStatus(id: number, status: BidStatus): Observable<Bid> {
    return this.http.patch<Bid>(`${BASE}/bids/${id}/status`, { status });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${BASE}/bids/${id}`);
  }
}
