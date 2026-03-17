import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ItemService } from '../../services/item.service';
import { AuthService } from '../../services/auth.service';
import { Item, ItemCategory, ItemCondition } from '../../models';

@Component({
  selector: 'app-item-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './item-form.component.html',
  styleUrl: './item-form.component.css',
})
export class ItemFormComponent {
  private fb = inject(FormBuilder);
  private itemService = inject(ItemService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<ItemFormComponent>);
  data = inject<Item | null>(MAT_DIALOG_DATA);

  isEdit = !!this.data;
  saving = false;
  categories = Object.values(ItemCategory);
  conditions = Object.values(ItemCondition);

  private get currentOwnerId(): number {
    const id = this.data?.ownerId ?? this.authService.currentCustomer()?.id;
    if (!id) {
      console.warn('ItemFormComponent: currentCustomer is not available');
    }
    return id ?? 0;
  }

  form = this.fb.group({
    title: [this.data?.title ?? '', Validators.required],
    category: [this.data?.category ?? null, Validators.required],
    condition: [this.data?.condition ?? null, Validators.required],
    description: [this.data?.description ?? ''],
  });

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    const val = this.form.value;
    const dto = {
      title: val.title!,
      category: val.category as ItemCategory,
      condition: val.condition as ItemCondition,
      ownerId: this.currentOwnerId,
      description: val.description ?? '',
      mediaLinks: this.data?.mediaLinks ?? [],
    };
    const op = this.isEdit
      ? this.itemService.update(this.data!.id, dto)
      : this.itemService.create(dto);

    op.subscribe({
      next: () => {
        this.snackBar.open(`Item ${this.isEdit ? 'updated' : 'created'}`, 'Close', { duration: 2000 });
        this.dialogRef.close(true);
      },
      error: () => { this.snackBar.open('Operation failed', 'Close', { duration: 3000 }); this.saving = false; },
    });
  }
}
