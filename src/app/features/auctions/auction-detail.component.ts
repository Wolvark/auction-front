import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { forkJoin, Subscription } from 'rxjs';
import { AuctionService } from '../../services/auction.service';
import { BidService } from '../../services/bid.service';
import { WebSocketService } from '../../services/websocket.service';
import { AuthService } from '../../services/auth.service';
import { Auction, AuctionStatus, Bid, BidStatus } from '../../models';

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
    MatInputModule,
    MatTableModule,
    MatDividerModule,
    MatChipsModule,
    MatTooltipModule,
  ],
  templateUrl: './auction-detail.component.html',
  styleUrl: './auction-detail.component.css',
})
export class AuctionDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private auctionService = inject(AuctionService);
  private bidService = inject(BidService);
  private wsService = inject(WebSocketService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  auction = signal<Auction | null>(null);
  bids = signal<Bid[]>([]);
  loading = signal(true);
  updatingStatus = signal(false);
  placingBid = signal(false);
  newStatus: AuctionStatus | null = null;
  auctionStatuses = Object.values(AuctionStatus);
  bidColumns = ['createdAt', 'customerEmail', 'amount', 'status'];
  BidStatus = BidStatus;
  AuctionStatus = AuctionStatus;

  bidAmount: number | null = null;
  private wsSub: Subscription | null = null;
  private timerInterval: ReturnType<typeof setInterval> | null = null;
  timeLeft = signal('');

  get currentHighestBid(): Bid | null {
    const activeBids = this.bids().filter((b) => b.status === BidStatus.ACTIVE);
    if (activeBids.length === 0) return null;
    return activeBids.reduce((prev, curr) => (curr.amount > prev.amount ? curr : prev));
  }

  get minNextBid(): number {
    const a = this.auction();
    if (!a) return 0;
    const highest = this.currentHighestBid;
    return highest ? highest.amount + a.minBidIncrement : a.startPrice;
  }

  get isActive(): boolean {
    return this.auction()?.status === AuctionStatus.ACTIVE;
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    forkJoin({
      auction: this.auctionService.getById(id),
      bids: this.bidService.getAll(),
    }).subscribe({
      next: ({ auction, bids }) => {
        this.auction.set(auction);
        this.newStatus = auction.status;
        this.bids.set(bids.filter((b) => b.auctionId === id));
        this.bidAmount = this.minNextBid;
        this.loading.set(false);
        this.startTimer();
      },
      error: () => {
        this.snackBar.open('Failed to load auction', 'Close', { duration: 3000 });
        this.loading.set(false);
      },
    });

    this.wsSub = this.wsService.subscribeToAuctionBids(id).subscribe((bid) => {
      const newBid = bid as Bid;
      this.bids.update((existing) => {
        const updated = existing.map((b) =>
          b.status === BidStatus.ACTIVE && b.id !== newBid.id
            ? { ...b, status: BidStatus.OUTBID }
            : b,
        );
        const exists = updated.find((b) => b.id === newBid.id);
        return exists ? updated.map((b) => (b.id === newBid.id ? newBid : b)) : [...updated, newBid];
      });
      this.bidAmount = this.minNextBid;
    });
  }

  ngOnDestroy(): void {
    this.wsSub?.unsubscribe();
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  private startTimer(): void {
    this.updateTimeLeft();
    this.timerInterval = setInterval(() => this.updateTimeLeft(), 1000);
  }

  private updateTimeLeft(): void {
    const a = this.auction();
    if (!a) return;
    const end = new Date(a.endTime).getTime();
    const now = Date.now();
    const diff = end - now;
    if (diff <= 0) {
      this.timeLeft.set('Auction ended');
      if (this.timerInterval) clearInterval(this.timerInterval);
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    if (d > 0) this.timeLeft.set(`${d}d ${h}h ${m}m`);
    else if (h > 0) this.timeLeft.set(`${h}h ${m}m ${s}s`);
    else this.timeLeft.set(`${m}m ${s}s`);
  }

  placeBid(): void {
    const a = this.auction();
    const customer = this.authService.currentCustomer();
    if (!a || !customer || !this.bidAmount) return;
    if (this.bidAmount < this.minNextBid) {
      this.snackBar.open(`Minimum bid is ${this.minNextBid}`, 'Close', { duration: 3000 });
      return;
    }
    this.placingBid.set(true);
    this.bidService
      .create({
        itemName: a.itemTitle ?? `Auction #${a.id}`,
        amount: this.bidAmount,
        customerId: customer.id,
        auctionId: a.id,
      })
      .subscribe({
        next: () => {
          this.snackBar.open('Bid placed successfully!', 'Close', { duration: 2000 });
          this.placingBid.set(false);
        },
        error: (err) => {
          const msg = err?.error?.message ?? 'Failed to place bid. Check your balance.';
          this.snackBar.open(msg, 'Close', { duration: 4000 });
          this.placingBid.set(false);
        },
      });
  }

  adjustBid(delta: number): void {
    const a = this.auction();
    if (!a) return;
    const step = a.minBidIncrement;
    this.bidAmount = Math.max(this.minNextBid, (this.bidAmount ?? this.minNextBid) + delta * step);
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
      error: () => {
        this.snackBar.open('Failed to update status', 'Close', { duration: 3000 });
        this.updatingStatus.set(false);
      },
    });
  }
}

