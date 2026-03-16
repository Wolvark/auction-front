import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { ItemService } from '../../services/item.service';
import { Item, ItemStatus, MediaType, AddMediaDto } from '../../models';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog.component';

@Component({
  selector: 'app-item-detail',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatDividerModule,
  ],
  template: `
    <div class="page-header">
      <div class="back-btn">
        <a mat-icon-button routerLink="/items"><mat-icon>arrow_back</mat-icon></a>
        <h1>Item Detail</h1>
      </div>
    </div>

    @if (loading()) {
      <div class="loading-center"><mat-spinner diameter="48" /></div>
    } @else if (!item()) {
      <mat-card><mat-card-content>Item not found.</mat-card-content></mat-card>
    } @else {
      <div class="detail-grid">
        <mat-card class="info-card">
          <mat-card-header>
            <mat-card-title>{{ item()!.title }}</mat-card-title>
            <mat-card-subtitle>
              <span class="status-chip status-{{ item()!.status.toLowerCase() }}">{{ item()!.status }}</span>
            </mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Category</span>
                <span class="info-value">{{ item()!.category }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Condition</span>
                <span class="info-value">{{ item()!.condition }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Owner ID</span>
                <span class="info-value">{{ item()!.ownerId }}</span>
              </div>
              <div class="info-item full-width">
                <span class="info-label">Description</span>
                <span class="info-value">{{ item()!.description || '—' }}</span>
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
                @for (s of itemStatuses; track s) {
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

        <mat-card class="media-card">
          <mat-card-header>
            <mat-card-title>Media Links</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            @if (item()!.mediaLinks.length === 0) {
              <p class="no-media">No media attached.</p>
            } @else {
              <div class="media-list">
                @for (m of item()!.mediaLinks; track m.id) {
                  <div class="media-item">
                    <mat-icon>{{ m.mediaType === 'IMAGE' ? 'image' : 'videocam' }}</mat-icon>
                    <a [href]="m.url" target="_blank" class="media-url">{{ m.url }}</a>
                    <button mat-icon-button color="warn" matTooltip="Remove" (click)="removeMedia(m.id)">
                      <mat-icon>close</mat-icon>
                    </button>
                  </div>
                }
              </div>
            }
            <mat-divider style="margin: 16px 0" />
            <form [formGroup]="mediaForm" class="media-add-form">
              <mat-form-field appearance="outline">
                <mat-label>Media Type</mat-label>
                <mat-select formControlName="mediaType">
                  @for (t of mediaTypes; track t) {
                    <mat-option [value]="t">{{ t }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline" class="url-field">
                <mat-label>URL</mat-label>
                <input matInput formControlName="url" />
              </mat-form-field>
              <button mat-flat-button type="button" [disabled]="addingMedia()" (click)="addMedia()">
                @if (addingMedia()) { <mat-spinner diameter="20" /> } @else { Add }
              </button>
            </form>
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
      .status-card, .media-card { border-radius: 16px !important; }
      .media-card { grid-column: span 2; }
      .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding-top: 12px; }
      .info-item { display: flex; flex-direction: column; gap: 2px; }
      .info-item.full-width { grid-column: span 2; }
      .info-label { font-size: 0.75rem; color: var(--mat-sys-on-surface-variant); text-transform: uppercase; letter-spacing: 0.5px; }
      .info-value { font-size: 1rem; color: var(--mat-sys-on-surface); }
      .no-media { color: var(--mat-sys-on-surface-variant); }
      .media-list { display: flex; flex-direction: column; gap: 8px; }
      .media-item { display: flex; align-items: center; gap: 8px; padding: 8px; background: var(--mat-sys-surface-container-low); border-radius: 8px; }
      .media-url { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.875rem; }
      .media-add-form { display: flex; align-items: flex-start; gap: 12px; flex-wrap: wrap; }
      .url-field { flex: 1; min-width: 200px; }
      .full-width { width: 100%; }
    `,
  ],
})
export class ItemDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private itemService = inject(ItemService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private fb = inject(FormBuilder);

  item = signal<Item | null>(null);
  loading = signal(true);
  updatingStatus = signal(false);
  addingMedia = signal(false);
  newStatus: ItemStatus | null = null;
  itemStatuses = Object.values(ItemStatus);
  mediaTypes = Object.values(MediaType);

  mediaForm = this.fb.group({
    mediaType: [MediaType.IMAGE, Validators.required],
    url: ['', Validators.required],
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.itemService.getById(id).subscribe({
      next: (data) => {
        this.item.set(data);
        this.newStatus = data.status;
        this.loading.set(false);
      },
      error: () => { this.snackBar.open('Failed to load item', 'Close', { duration: 3000 }); this.loading.set(false); },
    });
  }

  updateStatus(): void {
    if (!this.newStatus || !this.item()) return;
    this.updatingStatus.set(true);
    this.itemService.updateStatus(this.item()!.id, this.newStatus).subscribe({
      next: (updated) => {
        this.item.set(updated);
        this.snackBar.open('Status updated', 'Close', { duration: 2000 });
        this.updatingStatus.set(false);
      },
      error: () => { this.snackBar.open('Failed to update status', 'Close', { duration: 3000 }); this.updatingStatus.set(false); },
    });
  }

  addMedia(): void {
    if (this.mediaForm.invalid) { this.mediaForm.markAllAsTouched(); return; }
    this.addingMedia.set(true);
    const dto = this.mediaForm.value as AddMediaDto;
    this.itemService.addMedia(this.item()!.id, dto).subscribe({
      next: (media) => {
        const curr = this.item()!;
        this.item.set({ ...curr, mediaLinks: [...curr.mediaLinks, media] });
        this.mediaForm.reset({ mediaType: MediaType.IMAGE, url: '' });
        this.snackBar.open('Media added', 'Close', { duration: 2000 });
        this.addingMedia.set(false);
      },
      error: () => { this.snackBar.open('Failed to add media', 'Close', { duration: 3000 }); this.addingMedia.set(false); },
    });
  }

  removeMedia(mediaId: number): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Remove Media', message: 'Remove this media link?' },
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.itemService.removeMedia(this.item()!.id, mediaId).subscribe({
        next: () => {
          const curr = this.item()!;
          this.item.set({ ...curr, mediaLinks: curr.mediaLinks.filter((m) => m.id !== mediaId) });
          this.snackBar.open('Media removed', 'Close', { duration: 2000 });
        },
        error: () => this.snackBar.open('Failed to remove media', 'Close', { duration: 3000 }),
      });
    });
  }
}
