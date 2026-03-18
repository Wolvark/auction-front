import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { BidService } from '../../services/bid.service';
import { AuthService } from '../../services/auth.service';
import { Bid, BidStatus } from '../../models';

@Component({
  selector: 'app-bid-list',
  standalone: true,
  imports: [
    FormsModule,
    CurrencyPipe,
    MatTableModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatFormFieldModule,
  ],
  templateUrl: './bid-list.component.html',
  styleUrl: './bid-list.component.css',
})
export class BidListComponent implements OnInit {
  private bidService = inject(BidService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  bids = signal<Bid[]>([]);
  filtered = signal<Bid[]>([]);
  loading = signal(true);
  selectedStatus: BidStatus | null = null;
  bidStatuses = Object.values(BidStatus);
  columns = ['id', 'itemName', 'amount', 'status'];

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    const customerId = this.authService.currentCustomer()?.id;
    if (!customerId) {
      this.loading.set(false);
      return;
    }
    this.bidService.getByCustomer(customerId).subscribe({
      next: (data) => { this.bids.set(data); this.applyFilter(); this.loading.set(false); },
      error: () => { this.snackBar.open('Failed to load bids', 'Close', { duration: 3000 }); this.loading.set(false); },
    });
  }

  applyFilter(): void {
    let data = this.bids();
    if (this.selectedStatus) data = data.filter((b) => b.status === this.selectedStatus);
    this.filtered.set(data);
  }
}
