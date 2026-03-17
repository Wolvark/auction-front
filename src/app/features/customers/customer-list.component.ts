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
  templateUrl: './customer-list.component.html',
  styleUrl: './customer-list.component.css',
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
