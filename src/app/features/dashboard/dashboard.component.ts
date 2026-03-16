import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CustomerService } from '../../services/customer.service';
import { ItemService } from '../../services/item.service';
import { AuctionService } from '../../services/auction.service';
import { BidService } from '../../services/bid.service';
import { AuctionStatus, BidStatus, ItemStatus } from '../../models';

interface StatCard {
  title: string;
  value: number;
  icon: string;
  color: string;
  route: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="dashboard-container">
      <div class="page-header">
        <h1>Dashboard</h1>
        <span class="subtitle">Welcome to AuctionHub Management</span>
      </div>

      @if (loading()) {
        <div class="loading-center">
          <mat-spinner diameter="48" />
        </div>
      } @else {
        <div class="stats-grid">
          @for (card of statCards(); track card.title) {
            <mat-card class="stat-card" [routerLink]="card.route" tabindex="0">
              <mat-card-content>
                <div class="stat-content">
                  <div class="stat-icon" [style.background]="card.color + '22'">
                    <mat-icon [style.color]="card.color">{{ card.icon }}</mat-icon>
                  </div>
                  <div class="stat-info">
                    <div class="stat-value">{{ card.value }}</div>
                    <div class="stat-title">{{ card.title }}</div>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          }
        </div>

        <div class="summary-grid">
          <mat-card class="summary-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>inventory_2</mat-icon>
              <mat-card-title>Items by Status</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="status-list">
                @for (s of itemStatuses(); track s.status) {
                  <div class="status-row">
                    <span class="status-chip status-{{ s.status.toLowerCase() }}">{{ s.status }}</span>
                    <span class="status-count">{{ s.count }}</span>
                  </div>
                }
              </div>
            </mat-card-content>
            <mat-card-actions>
              <a mat-button color="primary" routerLink="/items">View All Items</a>
            </mat-card-actions>
          </mat-card>

          <mat-card class="summary-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>gavel</mat-icon>
              <mat-card-title>Auctions by Status</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="status-list">
                @for (s of auctionStatuses(); track s.status) {
                  <div class="status-row">
                    <span class="status-chip status-{{ s.status.toLowerCase() }}">{{ s.status }}</span>
                    <span class="status-count">{{ s.count }}</span>
                  </div>
                }
              </div>
            </mat-card-content>
            <mat-card-actions>
              <a mat-button color="primary" routerLink="/auctions">View All Auctions</a>
            </mat-card-actions>
          </mat-card>

          <mat-card class="summary-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>price_check</mat-icon>
              <mat-card-title>Bids by Status</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="status-list">
                @for (s of bidStatuses(); track s.status) {
                  <div class="status-row">
                    <span class="status-chip status-{{ s.status.toLowerCase() }}">{{ s.status }}</span>
                    <span class="status-count">{{ s.count }}</span>
                  </div>
                }
              </div>
            </mat-card-content>
            <mat-card-actions>
              <a mat-button color="primary" routerLink="/bids">View All Bids</a>
            </mat-card-actions>
          </mat-card>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .dashboard-container {
        max-width: 1200px;
      }
      .page-header {
        margin-bottom: 32px;
        flex-direction: column;
        align-items: flex-start;
      }
      .page-header h1 {
        margin-bottom: 4px;
      }
      .subtitle {
        color: var(--mat-sys-on-surface-variant);
        font-size: 0.95rem;
      }
      .loading-center {
        display: flex;
        justify-content: center;
        padding: 80px 0;
      }
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 16px;
        margin-bottom: 32px;
      }
      .stat-card {
        cursor: pointer;
        transition: transform 0.15s ease, box-shadow 0.15s ease;
        border-radius: 16px !important;
      }
      .stat-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 20px rgba(0,0,0,0.12) !important;
      }
      .stat-content {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 8px 0;
      }
      .stat-icon {
        width: 56px;
        height: 56px;
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .stat-icon mat-icon {
        font-size: 28px;
        width: 28px;
        height: 28px;
      }
      .stat-value {
        font-size: 2rem;
        font-weight: 700;
        line-height: 1;
        color: var(--mat-sys-on-surface);
      }
      .stat-title {
        font-size: 0.875rem;
        color: var(--mat-sys-on-surface-variant);
        margin-top: 4px;
      }
      .summary-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 16px;
      }
      .summary-card {
        border-radius: 16px !important;
      }
      .summary-card mat-card-header {
        margin-bottom: 8px;
      }
      .status-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding-top: 8px;
      }
      .status-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .status-count {
        font-weight: 600;
        font-size: 1rem;
        color: var(--mat-sys-on-surface);
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  private customerService = inject(CustomerService);
  private itemService = inject(ItemService);
  private auctionService = inject(AuctionService);
  private bidService = inject(BidService);

  loading = signal(true);
  statCards = signal<StatCard[]>([]);
  itemStatuses = signal<{ status: string; count: number }[]>([]);
  auctionStatuses = signal<{ status: string; count: number }[]>([]);
  bidStatuses = signal<{ status: string; count: number }[]>([]);

  ngOnInit(): void {
    forkJoin({
      customers: this.customerService.getAll(),
      items: this.itemService.getAll(),
      auctions: this.auctionService.getAll(),
      bids: this.bidService.getAll(),
    }).subscribe({
      next: ({ customers, items, auctions, bids }) => {
        this.statCards.set([
          { title: 'Total Customers', value: customers.length, icon: 'people', color: '#7c3aed', route: '/customers' },
          { title: 'Total Items', value: items.length, icon: 'inventory_2', color: '#0891b2', route: '/items' },
          { title: 'Total Auctions', value: auctions.length, icon: 'gavel', color: '#059669', route: '/auctions' },
          { title: 'Total Bids', value: bids.length, icon: 'price_check', color: '#d97706', route: '/bids' },
          {
            title: 'Active Auctions',
            value: auctions.filter((a) => a.status === AuctionStatus.ACTIVE).length,
            icon: 'local_fire_department',
            color: '#dc2626',
            route: '/auctions',
          },
          {
            title: 'Pending Bids',
            value: bids.filter((b) => b.status === BidStatus.PENDING).length,
            icon: 'pending_actions',
            color: '#db2777',
            route: '/bids',
          },
        ]);

        const itemStatusMap: Record<string, number> = {};
        for (const s of Object.values(ItemStatus)) itemStatusMap[s] = 0;
        for (const item of items) itemStatusMap[item.status] = (itemStatusMap[item.status] || 0) + 1;
        this.itemStatuses.set(Object.entries(itemStatusMap).map(([status, count]) => ({ status, count })));

        const auctionStatusMap: Record<string, number> = {};
        for (const s of Object.values(AuctionStatus)) auctionStatusMap[s] = 0;
        for (const a of auctions) auctionStatusMap[a.status] = (auctionStatusMap[a.status] || 0) + 1;
        this.auctionStatuses.set(Object.entries(auctionStatusMap).map(([status, count]) => ({ status, count })));

        const bidStatusMap: Record<string, number> = {};
        for (const s of Object.values(BidStatus)) bidStatusMap[s] = 0;
        for (const b of bids) bidStatusMap[b.status] = (bidStatusMap[b.status] || 0) + 1;
        this.bidStatuses.set(Object.entries(bidStatusMap).map(([status, count]) => ({ status, count })));

        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }
}
