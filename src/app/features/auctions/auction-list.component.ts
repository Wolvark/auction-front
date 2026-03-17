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
  templateUrl: './auction-list.component.html',
  styleUrl: './auction-list.component.css',
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
