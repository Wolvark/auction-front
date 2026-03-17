import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Item, CreateItemDto, ItemStatus, ItemCategory, AddMediaDto, MediaLink } from '../models';

import { environment } from '../../environments/environment';

const BASE = environment.apiBaseUrl;

@Injectable({ providedIn: 'root' })
export class ItemService {
  private http = inject(HttpClient);

  getAll(): Observable<Item[]> {
    return this.http.get<Item[]>(`${BASE}/items`);
  }

  getById(id: number): Observable<Item> {
    return this.http.get<Item>(`${BASE}/items/${id}`);
  }

  getByOwner(ownerId: number): Observable<Item[]> {
    return this.http.get<Item[]>(`${BASE}/items/owner/${ownerId}`);
  }

  getByStatus(status: ItemStatus): Observable<Item[]> {
    return this.http.get<Item[]>(`${BASE}/items/status/${status}`);
  }

  getByCategory(category: ItemCategory): Observable<Item[]> {
    return this.http.get<Item[]>(`${BASE}/items/category/${category}`);
  }

  create(dto: CreateItemDto): Observable<Item> {
    return this.http.post<Item>(`${BASE}/items`, dto);
  }

  update(id: number, dto: CreateItemDto): Observable<Item> {
    return this.http.put<Item>(`${BASE}/items/${id}`, dto);
  }

  updateStatus(id: number, status: ItemStatus): Observable<Item> {
    return this.http.patch<Item>(`${BASE}/items/${id}/status`, { status });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${BASE}/items/${id}`);
  }

  addMedia(id: number, dto: AddMediaDto): Observable<MediaLink> {
    return this.http.post<MediaLink>(`${BASE}/items/${id}/media`, dto);
  }

  removeMedia(id: number, mediaId: number): Observable<void> {
    return this.http.delete<void>(`${BASE}/items/${id}/media/${mediaId}`);
  }
}
