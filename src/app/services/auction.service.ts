import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Auction, CreateAuctionDto, AuctionStatus } from '../models';

const BASE = 'http://localhost:8080/api/v1';

@Injectable({ providedIn: 'root' })
export class AuctionService {
  private http = inject(HttpClient);

  getAll(): Observable<Auction[]> {
    return this.http.get<Auction[]>(`${BASE}/auctions`);
  }

  getById(id: number): Observable<Auction> {
    return this.http.get<Auction>(`${BASE}/auctions/${id}`);
  }

  getByItem(itemId: number): Observable<Auction[]> {
    return this.http.get<Auction[]>(`${BASE}/auctions/item/${itemId}`);
  }

  getByStatus(status: AuctionStatus): Observable<Auction[]> {
    return this.http.get<Auction[]>(`${BASE}/auctions/status/${status}`);
  }

  create(dto: CreateAuctionDto): Observable<Auction> {
    return this.http.post<Auction>(`${BASE}/auctions`, dto);
  }

  update(id: number, dto: CreateAuctionDto): Observable<Auction> {
    return this.http.put<Auction>(`${BASE}/auctions/${id}`, dto);
  }

  updateStatus(id: number, status: AuctionStatus): Observable<Auction> {
    return this.http.patch<Auction>(`${BASE}/auctions/${id}/status`, { status });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${BASE}/auctions/${id}`);
  }
}
