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
  templateUrl: './item-detail.component.html',
  styleUrl: './item-detail.component.css',
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
