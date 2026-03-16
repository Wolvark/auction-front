import { Component, inject, OnInit, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CustomerService } from '../../services/customer.service';
import { Customer } from '../../models';
import { CustomerFormComponent } from './customer-form.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog.component';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  template: `
    <div class="page-header">
      <h1>Customers</h1>
      <button mat-flat-button (click)="openForm()">
        <mat-icon>add</mat-icon> Add Customer
      </button>
    </div>

    <mat-card class="table-card">
      <mat-card-content>
        @if (loading()) {
          <div class="loading-center">
            <mat-spinner diameter="40" />
          </div>
        } @else if (customers().length === 0) {
          <div class="empty-state">
            <mat-icon>people_outline</mat-icon>
            <p>No customers found. Add your first customer!</p>
          </div>
        } @else {
          <table mat-table [dataSource]="customers()" class="mat-elevation-z0">
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef>#</th>
              <td mat-cell *matCellDef="let c">{{ c.id }}</td>
            </ng-container>
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let c">{{ c.firstName }} {{ c.lastName }}</td>
            </ng-container>
            <ng-container matColumnDef="email">
              <th mat-header-cell *matHeaderCellDef>Email</th>
              <td mat-cell *matCellDef="let c">{{ c.email }}</td>
            </ng-container>
            <ng-container matColumnDef="phone">
              <th mat-header-cell *matHeaderCellDef>Phone</th>
              <td mat-cell *matCellDef="let c">{{ c.phone }}</td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let c">
                <button mat-icon-button matTooltip="Edit" (click)="openForm(c)">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button matTooltip="Delete" color="warn" (click)="confirmDelete(c)">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns"></tr>
          </table>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: [
    `
      .table-card { border-radius: 16px !important; }
      .loading-center { display: flex; justify-content: center; padding: 48px 0; }
      .empty-state {
        display: flex; flex-direction: column; align-items: center;
        padding: 48px 0; color: var(--mat-sys-on-surface-variant);
      }
      .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 12px; }
      td.mat-mdc-cell { padding: 12px 16px; }
      th.mat-mdc-header-cell { font-weight: 600; padding: 12px 16px; }
    `,
  ],
})
export class CustomerListComponent implements OnInit {
  private customerService = inject(CustomerService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  customers = signal<Customer[]>([]);
  loading = signal(true);
  columns = ['id', 'name', 'email', 'phone', 'actions'];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.customerService.getAll().subscribe({
      next: (data) => { this.customers.set(data); this.loading.set(false); },
      error: () => { this.snackBar.open('Failed to load customers', 'Close', { duration: 3000 }); this.loading.set(false); },
    });
  }

  openForm(customer?: Customer): void {
    const ref = this.dialog.open(CustomerFormComponent, {
      width: '480px',
      data: customer ?? null,
    });
    ref.afterClosed().subscribe((result) => {
      if (result) this.load();
    });
  }

  confirmDelete(customer: Customer): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete Customer', message: `Delete ${customer.firstName} ${customer.lastName}?` },
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) this.deleteCustomer(customer.id);
    });
  }

  private deleteCustomer(id: number): void {
    this.customerService.delete(id).subscribe({
      next: () => { this.snackBar.open('Customer deleted', 'Close', { duration: 2000 }); this.load(); },
      error: () => this.snackBar.open('Failed to delete customer', 'Close', { duration: 3000 }),
    });
  }
}
