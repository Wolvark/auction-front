import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuctionService } from '../../services/auction.service';
import { Auction } from '../../models';

@Component({
  selector: 'app-auction-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ isEdit ? 'Edit Auction' : 'Create Auction' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-grid">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Item ID</mat-label>
          <input matInput formControlName="itemId" type="number" />
          @if (form.get('itemId')?.hasError('required')) {
            <mat-error>Required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Start Price</mat-label>
          <input matInput formControlName="startPrice" type="number" step="0.01" />
          @if (form.get('startPrice')?.hasError('required')) {
            <mat-error>Required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Min Bid Increment</mat-label>
          <input matInput formControlName="minBidIncrement" type="number" step="0.01" />
          @if (form.get('minBidIncrement')?.hasError('required')) {
            <mat-error>Required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Reserve Price</mat-label>
          <input matInput formControlName="reservePrice" type="number" step="0.01" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Buy-Out Price</mat-label>
          <input matInput formControlName="buyOutPrice" type="number" step="0.01" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Start Time</mat-label>
          <input matInput [matDatepicker]="startPicker" formControlName="startTime" />
          <mat-datepicker-toggle matIconSuffix [for]="startPicker" />
          <mat-datepicker #startPicker />
          @if (form.get('startTime')?.hasError('required')) {
            <mat-error>Required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>End Time</mat-label>
          <input matInput [matDatepicker]="endPicker" formControlName="endTime" />
          <mat-datepicker-toggle matIconSuffix [for]="endPicker" />
          <mat-datepicker #endPicker />
          @if (form.get('endTime')?.hasError('required')) {
            <mat-error>Required</mat-error>
          }
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
export class AuctionFormComponent {
  private fb = inject(FormBuilder);
  private auctionService = inject(AuctionService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<AuctionFormComponent>);
  data = inject<Auction | null>(MAT_DIALOG_DATA);

  isEdit = !!this.data;
  saving = false;

  form = this.fb.group({
    itemId: [this.data?.itemId ?? null, Validators.required],
    startPrice: [this.data?.startPrice ?? null, Validators.required],
    minBidIncrement: [this.data?.minBidIncrement ?? null, Validators.required],
    reservePrice: [this.data?.reservePrice ?? null],
    buyOutPrice: [this.data?.buyOutPrice ?? null],
    startTime: [this.data ? new Date(this.data.startTime) : null, Validators.required],
    endTime: [this.data ? new Date(this.data.endTime) : null, Validators.required],
  });

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    const val = this.form.value;
    const dto = {
      itemId: Number(val.itemId),
      startPrice: Number(val.startPrice),
      minBidIncrement: Number(val.minBidIncrement),
      reservePrice: Number(val.reservePrice ?? 0),
      buyOutPrice: Number(val.buyOutPrice ?? 0),
      startTime: (val.startTime as Date).toISOString(),
      endTime: (val.endTime as Date).toISOString(),
    };
    const op = this.isEdit
      ? this.auctionService.update(this.data!.id, dto)
      : this.auctionService.create(dto);

    op.subscribe({
      next: () => {
        this.snackBar.open(`Auction ${this.isEdit ? 'updated' : 'created'}`, 'Close', { duration: 2000 });
        this.dialogRef.close(true);
      },
      error: () => { this.snackBar.open('Operation failed', 'Close', { duration: 3000 }); this.saving = false; },
    });
  }
}
