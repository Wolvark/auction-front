import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
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
import { FormsModule } from '@angular/forms';
import { ItemService } from '../../services/item.service';
import { AuthService } from '../../services/auth.service';
import { Item, ItemStatus, ItemCategory } from '../../models';
import { ItemFormComponent } from './item-form.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog.component';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSelectModule,
    MatFormFieldModule,
  ],
  templateUrl: './item-list.component.html',
  styleUrl: './item-list.component.css',
})
export class ItemListComponent implements OnInit {
  private itemService = inject(ItemService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  items = signal<Item[]>([]);
  filtered = signal<Item[]>([]);
  loading = signal(true);
  selectedStatus: ItemStatus | null = null;
  selectedCategory: ItemCategory | null = null;
  columns = ['id', 'title', 'category', 'condition', 'status', 'actions'];
  itemStatuses = Object.values(ItemStatus);
  itemCategories = Object.values(ItemCategory);

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    const customer = this.authService.currentCustomer();
    const obs = customer
      ? this.itemService.getByOwner(customer.id)
      : this.itemService.getAll();
    obs.subscribe({
      next: (data) => { this.items.set(data); this.applyFilter(); this.loading.set(false); },
      error: () => { this.snackBar.open('Failed to load items', 'Close', { duration: 3000 }); this.loading.set(false); },
    });
  }

  applyFilter(): void {
    let data = this.items();
    if (this.selectedStatus) data = data.filter((i) => i.status === this.selectedStatus);
    if (this.selectedCategory) data = data.filter((i) => i.category === this.selectedCategory);
    this.filtered.set(data);
  }

  openForm(item?: Item): void {
    const ref = this.dialog.open(ItemFormComponent, { width: '560px', data: item ?? null });
    ref.afterClosed().subscribe((r) => { if (r) this.load(); });
  }

  confirmDelete(item: Item): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete Item', message: `Delete "${item.title}"?` },
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) this.itemService.delete(item.id).subscribe({
        next: () => { this.snackBar.open('Item deleted', 'Close', { duration: 2000 }); this.load(); },
        error: () => this.snackBar.open('Failed to delete', 'Close', { duration: 3000 }),
      });
    });
  }
}
