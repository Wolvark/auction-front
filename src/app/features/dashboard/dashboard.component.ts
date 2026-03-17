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
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
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
