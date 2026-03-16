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
  template: `
    <h2 mat-dialog-title>{{ isEdit ? 'Edit Item' : 'Add Item' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-grid">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Title</mat-label>
          <input matInput formControlName="title" />
          @if (form.get('title')?.hasError('required')) {
            <mat-error>Required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Category</mat-label>
          <mat-select formControlName="category">
            @for (c of categories; track c) {
              <mat-option [value]="c">{{ c }}</mat-option>
            }
          </mat-select>
          @if (form.get('category')?.hasError('required')) {
            <mat-error>Required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Condition</mat-label>
          <mat-select formControlName="condition">
            @for (c of conditions; track c) {
              <mat-option [value]="c">{{ c }}</mat-option>
            }
          </mat-select>
          @if (form.get('condition')?.hasError('required')) {
            <mat-error>Required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Owner ID</mat-label>
          <input matInput formControlName="ownerId" type="number" />
          @if (form.get('ownerId')?.hasError('required')) {
            <mat-error>Required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="3"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button [disabled]="saving" (click)="save()">
        @if (saving) { <mat-spinner diameter="20" /> } @else { {{ isEdit ? 'Update' : 'Create' }} }
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; padding: 8px 0; min-width: 480px; }
      .full-width { grid-column: span 2; }
    `,
  ],
})
export class ItemFormComponent {
  private fb = inject(FormBuilder);
  private itemService = inject(ItemService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<ItemFormComponent>);
  data = inject<Item | null>(MAT_DIALOG_DATA);

  isEdit = !!this.data;
  saving = false;
  categories = Object.values(ItemCategory);
  conditions = Object.values(ItemCondition);

  form = this.fb.group({
    title: [this.data?.title ?? '', Validators.required],
    category: [this.data?.category ?? null, Validators.required],
    condition: [this.data?.condition ?? null, Validators.required],
    ownerId: [this.data?.ownerId ?? null, Validators.required],
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
      ownerId: Number(val.ownerId),
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
