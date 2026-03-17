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
  templateUrl: './auction-detail.component.html',
  styleUrl: './auction-detail.component.css',
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
