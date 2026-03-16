import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BidService } from '../../services/bid.service';
import { Bid, BidStatus } from '../../models';

@Component({
  selector: 'app-bid-form',
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
    <h2 mat-dialog-title>{{ isStatusUpdate ? 'Update Bid Status' : 'Place Bid' }}</h2>
    <mat-dialog-content>
      @if (isStatusUpdate) {
        <form [formGroup]="statusForm" class="form-single" style="padding: 8px 0; min-width: 380px;">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Status</mat-label>
            <mat-select formControlName="status">
              @for (s of bidStatuses; track s) {
                <mat-option [value]="s">{{ s }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </form>
      } @else {
        <form [formGroup]="form" class="form-grid">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Item Name</mat-label>
            <input matInput formControlName="itemName" />
            @if (form.get('itemName')?.hasError('required')) {
              <mat-error>Required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Amount</mat-label>
            <input matInput formControlName="amount" type="number" step="0.01" />
            @if (form.get('amount')?.hasError('required')) {
              <mat-error>Required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Customer ID</mat-label>
            <input matInput formControlName="customerId" type="number" />
            @if (form.get('customerId')?.hasError('required')) {
              <mat-error>Required</mat-error>
            }
          </mat-form-field>
        </form>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button [disabled]="saving" (click)="save()">
        @if (saving) { <mat-spinner diameter="20" /> } @else { {{ isStatusUpdate ? 'Update' : 'Place Bid' }} }
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; padding: 8px 0; min-width: 400px; }
      .full-width { grid-column: span 2; }
    `,
  ],
})
export class BidFormComponent {
  private fb = inject(FormBuilder);
  private bidService = inject(BidService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<BidFormComponent>);
  data = inject<Bid | null>(MAT_DIALOG_DATA);

  isStatusUpdate = !!this.data;
  saving = false;
  bidStatuses = Object.values(BidStatus);

  form = this.fb.group({
    itemName: ['', Validators.required],
    amount: [null as number | null, Validators.required],
    customerId: [null as number | null, Validators.required],
  });

  statusForm = this.fb.group({
    status: [this.data?.status ?? BidStatus.PENDING, Validators.required],
  });

  save(): void {
    if (this.isStatusUpdate) {
      if (this.statusForm.invalid) { this.statusForm.markAllAsTouched(); return; }
      this.saving = true;
      this.bidService.updateStatus(this.data!.id, this.statusForm.value.status as BidStatus).subscribe({
        next: () => { this.snackBar.open('Bid status updated', 'Close', { duration: 2000 }); this.dialogRef.close(true); },
        error: () => { this.snackBar.open('Operation failed', 'Close', { duration: 3000 }); this.saving = false; },
      });
    } else {
      if (this.form.invalid) { this.form.markAllAsTouched(); return; }
      this.saving = true;
      const val = this.form.value;
      const dto = {
        itemName: val.itemName!,
        amount: Number(val.amount),
        customerId: Number(val.customerId),
      };
      this.bidService.create(dto).subscribe({
        next: () => { this.snackBar.open('Bid placed', 'Close', { duration: 2000 }); this.dialogRef.close(true); },
        error: () => { this.snackBar.open('Operation failed', 'Close', { duration: 3000 }); this.saving = false; },
      });
    }
  }
}
