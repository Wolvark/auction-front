import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomerService } from '../../services/customer.service';
import { Customer } from '../../models';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './customer-form.component.html',
  styleUrl: './customer-form.component.css',
})
export class CustomerFormComponent {
  private fb = inject(FormBuilder);
  private customerService = inject(CustomerService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<CustomerFormComponent>);
  data = inject<Customer | null>(MAT_DIALOG_DATA);

  isEdit = !!this.data;
  saving = false;

  form = this.fb.group({
    firstName: [this.data?.firstName ?? '', Validators.required],
    lastName: [this.data?.lastName ?? '', Validators.required],
    email: [this.data?.email ?? '', [Validators.required, Validators.email]],
    phone: [this.data?.phone ?? '', Validators.required],
  });

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    const dto = this.form.value as { firstName: string; lastName: string; email: string; phone: string };
    const op = this.isEdit
      ? this.customerService.update(this.data!.id, dto)
      : this.customerService.create(dto);

    op.subscribe({
      next: () => {
        this.snackBar.open(`Customer ${this.isEdit ? 'updated' : 'created'}`, 'Close', { duration: 2000 });
        this.dialogRef.close(true);
      },
      error: () => {
        this.snackBar.open('Operation failed', 'Close', { duration: 3000 });
        this.saving = false;
      },
    });
  }
}
