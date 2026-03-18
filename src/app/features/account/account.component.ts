import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { AccountService } from '../../services/account.service';
import { Account, PaymentMethod, Transaction, TransactionType } from '../../models';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CurrencyPipe,
    DatePipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatDividerModule,
    MatChipsModule,
  ],
  templateUrl: './account.component.html',
  styleUrl: './account.component.css',
})
export class AccountComponent implements OnInit {
  private accountService = inject(AccountService);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);

  account = signal<Account | null>(null);
  transactions = signal<Transaction[]>([]);
  loading = signal(true);
  depositing = signal(false);
  transactionsLoading = signal(true);

  paymentMethods = Object.values(PaymentMethod);
  transactionColumns = ['createdAt', 'type', 'amount', 'paymentMethod', 'status'];
  TransactionType = TransactionType;

  depositForm = this.fb.group({
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    paymentMethod: [null as PaymentMethod | null, Validators.required],
  });

  ngOnInit(): void {
    this.loadAccount();
    this.loadTransactions();
  }

  loadAccount(): void {
    this.loading.set(true);
    this.accountService.getMyAccount().subscribe({
      next: (acc) => {
        this.account.set(acc);
        this.loading.set(false);
      },
      error: () => {
        this.snackBar.open('Failed to load account', 'Close', { duration: 3000 });
        this.loading.set(false);
      },
    });
  }

  loadTransactions(): void {
    this.transactionsLoading.set(true);
    this.accountService.getTransactionHistory().subscribe({
      next: (txns) => {
        this.transactions.set(txns);
        this.transactionsLoading.set(false);
      },
      error: () => {
        this.transactionsLoading.set(false);
      },
    });
  }

  deposit(): void {
    if (this.depositForm.invalid) {
      this.depositForm.markAllAsTouched();
      return;
    }
    this.depositing.set(true);
    const { amount, paymentMethod } = this.depositForm.value;
    this.accountService
      .deposit({ amount: amount!, paymentMethod: paymentMethod! })
      .subscribe({
        next: (acc) => {
          this.account.set(acc);
          this.snackBar.open(`Deposit of ${amount} successful!`, 'Close', { duration: 3000 });
          this.depositForm.reset();
          this.depositing.set(false);
          this.loadTransactions();
        },
        error: () => {
          this.snackBar.open('Deposit failed. Please try again.', 'Close', { duration: 3000 });
          this.depositing.set(false);
        },
      });
  }

  getPaymentMethodIcon(method: PaymentMethod): string {
    const icons: Record<PaymentMethod, string> = {
      [PaymentMethod.VISA]: 'credit_card',
      [PaymentMethod.MASTERCARD]: 'credit_card',
      [PaymentMethod.GOOGLE_PAY]: 'payment',
      [PaymentMethod.APPLE_PAY]: 'phone_iphone',
      [PaymentMethod.INTERNAL]: 'account_balance_wallet',
    };
    return icons[method] ?? 'payment';
  }
}
