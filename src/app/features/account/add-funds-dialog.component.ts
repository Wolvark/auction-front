import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { AccountService } from '../../services/account.service';
import { PaymentMethod } from '../../models';

@Component({
  selector: 'app-add-funds-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  template: `
    <h2 mat-dialog-title>Add Funds</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="funds-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Payment Method</mat-label>
          <mat-select formControlName="paymentMethod" (selectionChange)="onMethodChange()">
            @for (method of paymentMethods; track method.value) {
              <mat-option [value]="method.value">
                <div class="method-option">
                  <mat-icon>{{ method.icon }}</mat-icon>
                  {{ method.label }}
                </div>
              </mat-option>
            }
          </mat-select>
          @if (form.get('paymentMethod')?.hasError('required') && form.get('paymentMethod')?.touched) {
            <mat-error>Please select a payment method</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Amount (USD)</mat-label>
          <input matInput formControlName="amount" type="number" min="1" step="0.01" />
          <span matTextPrefix>$&nbsp;</span>
          @if (form.get('amount')?.hasError('required') && form.get('amount')?.touched) {
            <mat-error>Amount is required</mat-error>
          }
          @if (form.get('amount')?.hasError('min') && form.get('amount')?.touched) {
            <mat-error>Minimum deposit is $1.00</mat-error>
          }
        </mat-form-field>

        @if (isCardPayment()) {
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Card Holder Name</mat-label>
            <input matInput formControlName="cardHolderName" autocomplete="cc-name" />
            @if (form.get('cardHolderName')?.hasError('required') && form.get('cardHolderName')?.touched) {
              <mat-error>Card holder name is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Card Number</mat-label>
            <input
              matInput
              formControlName="cardNumber"
              placeholder="1234 5678 9012 3456"
              maxlength="19"
              autocomplete="cc-number"
            />
            <mat-icon matSuffix>credit_card</mat-icon>
            @if (form.get('cardNumber')?.hasError('required') && form.get('cardNumber')?.touched) {
              <mat-error>Card number is required</mat-error>
            }
            @if (form.get('cardNumber')?.hasError('pattern') && form.get('cardNumber')?.touched) {
              <mat-error>Enter a valid card number (13–19 digits, no spaces)</mat-error>
            }
          </mat-form-field>

          <div class="card-row">
            <mat-form-field appearance="outline">
              <mat-label>Expiry Date</mat-label>
              <input
                matInput
                formControlName="expiryDate"
                placeholder="MM/YY"
                maxlength="5"
                autocomplete="cc-exp"
              />
              @if (form.get('expiryDate')?.hasError('required') && form.get('expiryDate')?.touched) {
                <mat-error>Required</mat-error>
              }
              @if (form.get('expiryDate')?.hasError('pattern') && form.get('expiryDate')?.touched) {
                <mat-error>Use MM/YY format</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>CVV</mat-label>
              <input
                matInput
                formControlName="cvv"
                type="password"
                maxlength="4"
                autocomplete="cc-csc"
              />
              @if (form.get('cvv')?.hasError('required') && form.get('cvv')?.touched) {
                <mat-error>Required</mat-error>
              }
              @if (form.get('cvv')?.hasError('pattern') && form.get('cvv')?.touched) {
                <mat-error>3-4 digits</mat-error>
              }
            </mat-form-field>
          </div>
        }

        @if (isDigitalWallet()) {
          <div class="wallet-info">
            <mat-icon class="wallet-icon">info</mat-icon>
            <p>You will be redirected to {{ walletName() }} to complete the payment securely.</p>
          </div>
        }
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button [disabled]="saving" (click)="submit()">
        @if (saving) {
          <mat-spinner diameter="20" />
        } @else {
          Add Funds
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .funds-form {
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 8px 0;
        min-width: 360px;
      }
      .full-width { width: 100%; }
      .card-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      .method-option {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .wallet-info {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        background: var(--mat-sys-secondary-container);
        border-radius: 8px;
        padding: 12px;
        color: var(--mat-sys-on-secondary-container);
      }
      .wallet-icon {
        flex-shrink: 0;
        margin-top: 2px;
      }
      .wallet-info p {
        margin: 0;
        font-size: 0.9rem;
      }
      mat-spinner { display: inline-block; }
    `,
  ],
})
export class AddFundsDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private accountService = inject(AccountService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<AddFundsDialogComponent>);
  private customerId = inject<number>(MAT_DIALOG_DATA);

  saving = false;

  paymentMethods = [
    { value: PaymentMethod.VISA, label: 'Visa', icon: 'credit_card' },
    { value: PaymentMethod.MASTERCARD, label: 'Mastercard', icon: 'credit_card' },
    { value: PaymentMethod.GOOGLE_PAY, label: 'Google Pay', icon: 'account_balance_wallet' },
    { value: PaymentMethod.APPLE_PAY, label: 'Apple Pay', icon: 'account_balance_wallet' },
  ];

  selectedMethod = signal<PaymentMethod | null>(null);

  form = this.fb.group({
    paymentMethod: [null as PaymentMethod | null, Validators.required],
    amount: [null as number | null, [Validators.required, Validators.min(1)]],
    cardHolderName: [''],
    cardNumber: [''],
    expiryDate: [''],
    cvv: [''],
  });

  ngOnInit(): void {
    this.form.get('paymentMethod')?.valueChanges.subscribe((method) => {
      this.selectedMethod.set(method);
    });
  }

  isCardPayment(): boolean {
    const m = this.selectedMethod();
    return m === PaymentMethod.VISA || m === PaymentMethod.MASTERCARD;
  }

  isDigitalWallet(): boolean {
    const m = this.selectedMethod();
    return m === PaymentMethod.GOOGLE_PAY || m === PaymentMethod.APPLE_PAY;
  }

  walletName(): string {
    return this.selectedMethod() === PaymentMethod.GOOGLE_PAY ? 'Google Pay' : 'Apple Pay';
  }

  onMethodChange(): void {
    if (this.isCardPayment()) {
      this.form.get('cardHolderName')?.setValidators(Validators.required);
      this.form.get('cardNumber')?.setValidators([
        Validators.required,
        Validators.pattern(/^\d{13,19}$/),
      ]);
      this.form.get('expiryDate')?.setValidators([
        Validators.required,
        Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/),
      ]);
      this.form.get('cvv')?.setValidators([Validators.required, Validators.pattern(/^\d{3,4}$/)]);
    } else {
      ['cardHolderName', 'cardNumber', 'expiryDate', 'cvv'].forEach((f) => {
        this.form.get(f)?.clearValidators();
        this.form.get(f)?.setValue('');
      });
    }
    ['cardHolderName', 'cardNumber', 'expiryDate', 'cvv'].forEach((f) =>
      this.form.get(f)?.updateValueAndValidity(),
    );
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving = true;
    const { paymentMethod, amount, cardNumber, cardHolderName, expiryDate, cvv } =
      this.form.value as {
        paymentMethod: PaymentMethod;
        amount: number;
        cardNumber?: string;
        cardHolderName?: string;
        expiryDate?: string;
        cvv?: string;
      };

    // Strip spaces from card number before sending
    const sanitizedCardNumber = cardNumber?.replace(/\s/g, '') ?? undefined;

    this.accountService
      .addFunds(this.customerId, {
        amount,
        paymentMethod,
        cardNumber: sanitizedCardNumber,
        cardHolderName: cardHolderName || undefined,
        expiryDate: expiryDate || undefined,
        cvv: cvv || undefined,
      })
      .subscribe({
        next: () => {
          this.snackBar.open(`$${amount.toFixed(2)} added successfully!`, 'Close', {
            duration: 3000,
          });
          this.dialogRef.close(true);
        },
        error: () => {
          this.snackBar.open('Failed to add funds. Please try again.', 'Close', { duration: 3000 });
          this.saving = false;
        },
      });
  }
}
