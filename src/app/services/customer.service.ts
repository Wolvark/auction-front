import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Customer, CreateCustomerDto } from '../models';

const BASE = 'http://localhost:8080/api/v1';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private http = inject(HttpClient);

  getAll(): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${BASE}/customers`);
  }

  getById(id: number): Observable<Customer> {
    return this.http.get<Customer>(`${BASE}/customers/${id}`);
  }

  create(dto: CreateCustomerDto): Observable<Customer> {
    return this.http.post<Customer>(`${BASE}/customers`, dto);
  }

  update(id: number, dto: CreateCustomerDto): Observable<Customer> {
    return this.http.put<Customer>(`${BASE}/customers/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${BASE}/customers/${id}`);
  }
}
