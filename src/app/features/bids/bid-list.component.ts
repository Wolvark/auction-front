import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { BidService } from '../../services/bid.service';
import { Bid, BidStatus } from '../../models';
import { BidFormComponent } from './bid-form.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog.component';

@Component({
  selector: 'app-bid-list',
  standalone: true,
  imports: [
    FormsModule,
    CurrencyPipe,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSelectModule,
    MatFormFieldModule,
  ],
  template: `
    <div class="page-header">
      <h1>Bids</h1>
      <button mat-flat-button (click)="openForm()">
        <mat-icon>add</mat-icon> Place Bid
      </button>
    </div>

    <div class="filters">
      <mat-form-field appearance="outline" class="filter-field">
        <mat-label>Filter by Status</mat-label>
        <mat-select [(ngModel)]="selectedStatus" (ngModelChange)="applyFilter()">
          <mat-option [value]="null">All</mat-option>
          @for (s of bidStatuses; track s) {
            <mat-option [value]="s">{{ s }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
    </div>

    <mat-card class="table-card">
      <mat-card-content>
        @if (loading()) {
          <div class="loading-center"><mat-spinner diameter="40" /></div>
        } @else if (filtered().length === 0) {
          <div class="empty-state">
            <mat-icon>price_check</mat-icon>
            <p>No bids found.</p>
          </div>
        } @else {
          <table mat-table [dataSource]="filtered()" class="mat-elevation-z0">
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef>#</th>
              <td mat-cell *matCellDef="let b">{{ b.id }}</td>
            </ng-container>
            <ng-container matColumnDef="itemName">
              <th mat-header-cell *matHeaderCellDef>Item Name</th>
              <td mat-cell *matCellDef="let b">{{ b.itemName }}</td>
            </ng-container>
            <ng-container matColumnDef="amount">
              <th mat-header-cell *matHeaderCellDef>Amount</th>
              <td mat-cell *matCellDef="let b">{{ b.amount | currency }}</td>
            </ng-container>
            <ng-container matColumnDef="customerId">
              <th mat-header-cell *matHeaderCellDef>Customer ID</th>
              <td mat-cell *matCellDef="let b">{{ b.customerId }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let b">
                <span class="status-chip status-{{ b.status.toLowerCase() }}">{{ b.status }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let b">
                <button mat-icon-button matTooltip="Update Status" (click)="openStatusUpdate(b)">
                  <mat-icon>update</mat-icon>
                </button>
                <button mat-icon-button matTooltip="Delete" color="warn" (click)="confirmDelete(b)">
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
      .filters { display: flex; gap: 16px; margin-bottom: 16px; }
      .filter-field { min-width: 200px; }
      .table-card { border-radius: 16px !important; }
      .loading-center { display: flex; justify-content: center; padding: 48px 0; }
      .empty-state { display: flex; flex-direction: column; align-items: center; padding: 48px 0; color: var(--mat-sys-on-surface-variant); }
      .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 12px; }
      td.mat-mdc-cell { padding: 12px 16px; }
      th.mat-mdc-header-cell { font-weight: 600; padding: 12px 16px; }
    `,
  ],
})
export class BidListComponent implements OnInit {
  private bidService = inject(BidService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  bids = signal<Bid[]>([]);
  filtered = signal<Bid[]>([]);
  loading = signal(true);
  selectedStatus: BidStatus | null = null;
  bidStatuses = Object.values(BidStatus);
  columns = ['id', 'itemName', 'amount', 'customerId', 'status', 'actions'];

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.bidService.getAll().subscribe({
      next: (data) => { this.bids.set(data); this.applyFilter(); this.loading.set(false); },
      error: () => { this.snackBar.open('Failed to load bids', 'Close', { duration: 3000 }); this.loading.set(false); },
    });
  }

  applyFilter(): void {
    let data = this.bids();
    if (this.selectedStatus) data = data.filter((b) => b.status === this.selectedStatus);
    this.filtered.set(data);
  }

  openForm(): void {
    const ref = this.dialog.open(BidFormComponent, { width: '480px', data: null });
    ref.afterClosed().subscribe((r) => { if (r) this.load(); });
  }

  openStatusUpdate(bid: Bid): void {
    const ref = this.dialog.open(BidFormComponent, { width: '480px', data: bid });
    ref.afterClosed().subscribe((r) => { if (r) this.load(); });
  }

  confirmDelete(bid: Bid): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete Bid', message: `Delete Bid #${bid.id}?` },
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) this.bidService.delete(bid.id).subscribe({
        next: () => { this.snackBar.open('Bid deleted', 'Close', { duration: 2000 }); this.load(); },
        error: () => this.snackBar.open('Failed to delete', 'Close', { duration: 3000 }),
      });
    });
  }
}
