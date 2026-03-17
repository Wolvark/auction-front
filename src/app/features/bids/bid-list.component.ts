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
  templateUrl: './bid-list.component.html',
  styleUrl: './bid-list.component.css',
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
