import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe, DatePipe } from '@angular/common';
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
import { AuctionService } from '../../services/auction.service';
import { Auction, AuctionStatus } from '../../models';
import { AuctionFormComponent } from './auction-form.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog.component';

@Component({
  selector: 'app-auction-list',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    CurrencyPipe,
    DatePipe,
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
      <h1>Auctions</h1>
      <button mat-flat-button (click)="openForm()">
        <mat-icon>add</mat-icon> New Auction
      </button>
    </div>

    <div class="filters">
      <mat-form-field appearance="outline" class="filter-field">
        <mat-label>Filter by Status</mat-label>
        <mat-select [(ngModel)]="selectedStatus" (ngModelChange)="applyFilter()">
          <mat-option [value]="null">All</mat-option>
          @for (s of auctionStatuses; track s) {
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
            <mat-icon>gavel</mat-icon>
            <p>No auctions found.</p>
          </div>
        } @else {
          <table mat-table [dataSource]="filtered()" class="mat-elevation-z0">
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef>#</th>
              <td mat-cell *matCellDef="let a">{{ a.id }}</td>
            </ng-container>
            <ng-container matColumnDef="itemId">
              <th mat-header-cell *matHeaderCellDef>Item ID</th>
              <td mat-cell *matCellDef="let a">{{ a.itemId }}</td>
            </ng-container>
            <ng-container matColumnDef="startPrice">
              <th mat-header-cell *matHeaderCellDef>Start Price</th>
              <td mat-cell *matCellDef="let a">{{ a.startPrice | currency }}</td>
            </ng-container>
            <ng-container matColumnDef="startTime">
              <th mat-header-cell *matHeaderCellDef>Start</th>
              <td mat-cell *matCellDef="let a">{{ a.startTime | date:'short' }}</td>
            </ng-container>
            <ng-container matColumnDef="endTime">
              <th mat-header-cell *matHeaderCellDef>End</th>
              <td mat-cell *matCellDef="let a">{{ a.endTime | date:'short' }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let a">
                <span class="status-chip status-{{ a.status.toLowerCase() }}">{{ a.status }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let a">
                <a mat-icon-button matTooltip="View" [routerLink]="['/auctions', a.id]">
                  <mat-icon>visibility</mat-icon>
                </a>
                <button mat-icon-button matTooltip="Edit" (click)="openForm(a)">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button matTooltip="Delete" color="warn" (click)="confirmDelete(a)">
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
export class AuctionListComponent implements OnInit {
  private auctionService = inject(AuctionService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  auctions = signal<Auction[]>([]);
  filtered = signal<Auction[]>([]);
  loading = signal(true);
  selectedStatus: AuctionStatus | null = null;
  auctionStatuses = Object.values(AuctionStatus);
  columns = ['id', 'itemId', 'startPrice', 'startTime', 'endTime', 'status', 'actions'];

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.auctionService.getAll().subscribe({
      next: (data) => { this.auctions.set(data); this.applyFilter(); this.loading.set(false); },
      error: () => { this.snackBar.open('Failed to load auctions', 'Close', { duration: 3000 }); this.loading.set(false); },
    });
  }

  applyFilter(): void {
    let data = this.auctions();
    if (this.selectedStatus) data = data.filter((a) => a.status === this.selectedStatus);
    this.filtered.set(data);
  }

  openForm(auction?: Auction): void {
    const ref = this.dialog.open(AuctionFormComponent, { width: '560px', data: auction ?? null });
    ref.afterClosed().subscribe((r) => { if (r) this.load(); });
  }

  confirmDelete(auction: Auction): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete Auction', message: `Delete Auction #${auction.id}?` },
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) this.auctionService.delete(auction.id).subscribe({
        next: () => { this.snackBar.open('Auction deleted', 'Close', { duration: 2000 }); this.load(); },
        error: () => this.snackBar.open('Failed to delete', 'Close', { duration: 3000 }),
      });
    });
  }
}
