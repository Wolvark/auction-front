import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AuctionService } from '../../services/auction.service';
import { BidService } from '../../services/bid.service';
import { Auction, AuctionStatus, Bid } from '../../models';

@Component({
  selector: 'app-auction-detail',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    CurrencyPipe,
    DatePipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatFormFieldModule,
    MatTableModule,
    MatDividerModule,
  ],
  template: `
    <div class="page-header">
      <div class="back-btn">
        <a mat-icon-button routerLink="/auctions"><mat-icon>arrow_back</mat-icon></a>
        <h1>Auction Detail</h1>
      </div>
    </div>

    @if (loading()) {
      <div class="loading-center"><mat-spinner diameter="48" /></div>
    } @else if (!auction()) {
      <mat-card><mat-card-content>Auction not found.</mat-card-content></mat-card>
    } @else {
      <div class="detail-grid">
        <mat-card class="info-card">
          <mat-card-header>
            <mat-card-title>Auction #{{ auction()!.id }}</mat-card-title>
            <mat-card-subtitle>
              <span class="status-chip status-{{ auction()!.status.toLowerCase() }}">{{ auction()!.status }}</span>
            </mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Item ID</span>
                <span class="info-value">
                  <a [routerLink]="['/items', auction()!.itemId]">#{{ auction()!.itemId }}</a>
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">Start Price</span>
                <span class="info-value">{{ auction()!.startPrice | currency }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Min Bid Increment</span>
                <span class="info-value">{{ auction()!.minBidIncrement | currency }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Reserve Price</span>
                <span class="info-value">{{ auction()!.reservePrice | currency }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Buy-Out Price</span>
                <span class="info-value">{{ auction()!.buyOutPrice | currency }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Start Time</span>
                <span class="info-value">{{ auction()!.startTime | date:'medium' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">End Time</span>
                <span class="info-value">{{ auction()!.endTime | date:'medium' }}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="status-card">
          <mat-card-header>
            <mat-card-title>Update Status</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>New Status</mat-label>
              <mat-select [(value)]="newStatus">
                @for (s of auctionStatuses; track s) {
                  <mat-option [value]="s">{{ s }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          </mat-card-content>
          <mat-card-actions>
            <button mat-flat-button [disabled]="updatingStatus()" (click)="updateStatus()">
              @if (updatingStatus()) { <mat-spinner diameter="20" /> } @else { Update Status }
            </button>
          </mat-card-actions>
        </mat-card>

        <mat-card class="bids-card">
          <mat-card-header>
            <mat-card-title>Bids ({{ bids().length }})</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            @if (bids().length === 0) {
              <div class="empty-state">
                <mat-icon>price_check</mat-icon>
                <p>No bids yet.</p>
              </div>
            } @else {
              <table mat-table [dataSource]="bids()" class="mat-elevation-z0">
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
                <tr mat-header-row *matHeaderRowDef="bidColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: bidColumns"></tr>
              </table>
            }
          </mat-card-content>
        </mat-card>
      </div>
    }
  `,
  styles: [
    `
      .back-btn { display: flex; align-items: center; gap: 8px; }
      .loading-center { display: flex; justify-content: center; padding: 80px 0; }
      .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; max-width: 1000px; }
      .info-card { grid-column: span 2; border-radius: 16px !important; }
      .status-card { border-radius: 16px !important; }
      .bids-card { grid-column: span 2; border-radius: 16px !important; }
      .info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; padding-top: 12px; }
      .info-item { display: flex; flex-direction: column; gap: 2px; }
      .info-label { font-size: 0.75rem; color: var(--mat-sys-on-surface-variant); text-transform: uppercase; letter-spacing: 0.5px; }
      .info-value { font-size: 1rem; color: var(--mat-sys-on-surface); }
      .full-width { width: 100%; }
      .empty-state { display: flex; flex-direction: column; align-items: center; padding: 32px 0; color: var(--mat-sys-on-surface-variant); }
      .empty-state mat-icon { font-size: 40px; width: 40px; height: 40px; margin-bottom: 8px; }
      td.mat-mdc-cell { padding: 12px 16px; }
      th.mat-mdc-header-cell { font-weight: 600; padding: 12px 16px; }
    `,
  ],
})
export class AuctionDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private auctionService = inject(AuctionService);
  private bidService = inject(BidService);
  private snackBar = inject(MatSnackBar);

  auction = signal<Auction | null>(null);
  bids = signal<Bid[]>([]);
  loading = signal(true);
  updatingStatus = signal(false);
  newStatus: AuctionStatus | null = null;
  auctionStatuses = Object.values(AuctionStatus);
  bidColumns = ['id', 'itemName', 'amount', 'customerId', 'status'];

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    forkJoin({
      auction: this.auctionService.getById(id),
      bids: this.bidService.getAll(),
    }).subscribe({
      next: ({ auction, bids }) => {
        this.auction.set(auction);
        this.newStatus = auction.status;
        this.bids.set(bids);
        this.loading.set(false);
      },
      error: () => { this.snackBar.open('Failed to load auction', 'Close', { duration: 3000 }); this.loading.set(false); },
    });
  }

  updateStatus(): void {
    if (!this.newStatus || !this.auction()) return;
    this.updatingStatus.set(true);
    this.auctionService.updateStatus(this.auction()!.id, this.newStatus).subscribe({
      next: (updated) => {
        this.auction.set(updated);
        this.snackBar.open('Status updated', 'Close', { duration: 2000 });
        this.updatingStatus.set(false);
      },
      error: () => { this.snackBar.open('Failed to update status', 'Close', { duration: 3000 }); this.updatingStatus.set(false); },
    });
  }
}
