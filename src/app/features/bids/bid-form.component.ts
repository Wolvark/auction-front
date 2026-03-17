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
import { AuthService } from '../../services/auth.service';
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
  templateUrl: './bid-form.component.html',
  styleUrl: './bid-form.component.css',
})
export class BidFormComponent {
  private fb = inject(FormBuilder);
  private bidService = inject(BidService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<BidFormComponent>);
  data = inject<Bid | null>(MAT_DIALOG_DATA);

  isStatusUpdate = !!this.data;
  saving = false;
  bidStatuses = Object.values(BidStatus);

  form = this.fb.group({
    itemName: ['', Validators.required],
    amount: [null as number | null, Validators.required],
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
      const customerId = this.authService.currentCustomer()?.id;
      if (!customerId) {
        console.warn('BidFormComponent: currentCustomer is not available');
      }
      const dto = {
        itemName: val.itemName!,
        amount: Number(val.amount),
        customerId: customerId ?? 0,
      };
      this.bidService.create(dto).subscribe({
        next: () => { this.snackBar.open('Bid placed', 'Close', { duration: 2000 }); this.dialogRef.close(true); },
        error: () => { this.snackBar.open('Operation failed', 'Close', { duration: 3000 }); this.saving = false; },
      });
    }
  }
}
