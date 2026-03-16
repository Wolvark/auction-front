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
  template: `
    <div class="page-header">
      <h1>Items</h1>
      <button mat-flat-button (click)="openForm()">
        <mat-icon>add</mat-icon> Add Item
      </button>
    </div>

    <div class="filters">
      <mat-form-field appearance="outline" class="filter-field">
        <mat-label>Filter by Status</mat-label>
        <mat-select [(ngModel)]="selectedStatus" (ngModelChange)="applyFilter()">
          <mat-option [value]="null">All</mat-option>
          @for (s of itemStatuses; track s) {
            <mat-option [value]="s">{{ s }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
      <mat-form-field appearance="outline" class="filter-field">
        <mat-label>Filter by Category</mat-label>
        <mat-select [(ngModel)]="selectedCategory" (ngModelChange)="applyFilter()">
          <mat-option [value]="null">All</mat-option>
          @for (c of itemCategories; track c) {
            <mat-option [value]="c">{{ c }}</mat-option>
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
            <mat-icon>inventory_2</mat-icon>
            <p>No items found.</p>
          </div>
        } @else {
          <table mat-table [dataSource]="filtered()" class="mat-elevation-z0">
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef>#</th>
              <td mat-cell *matCellDef="let i">{{ i.id }}</td>
            </ng-container>
            <ng-container matColumnDef="title">
              <th mat-header-cell *matHeaderCellDef>Title</th>
              <td mat-cell *matCellDef="let i">{{ i.title }}</td>
            </ng-container>
            <ng-container matColumnDef="category">
              <th mat-header-cell *matHeaderCellDef>Category</th>
              <td mat-cell *matCellDef="let i">{{ i.category }}</td>
            </ng-container>
            <ng-container matColumnDef="condition">
              <th mat-header-cell *matHeaderCellDef>Condition</th>
              <td mat-cell *matCellDef="let i">{{ i.condition }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let i">
                <span class="status-chip status-{{ i.status.toLowerCase() }}">{{ i.status }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let i">
                <a mat-icon-button matTooltip="View" [routerLink]="['/items', i.id]">
                  <mat-icon>visibility</mat-icon>
                </a>
                <button mat-icon-button matTooltip="Edit" (click)="openForm(i)">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button matTooltip="Delete" color="warn" (click)="confirmDelete(i)">
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
      .filters { display: flex; gap: 16px; margin-bottom: 16px; flex-wrap: wrap; }
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
export class ItemListComponent implements OnInit {
  private itemService = inject(ItemService);
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
    this.itemService.getAll().subscribe({
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
