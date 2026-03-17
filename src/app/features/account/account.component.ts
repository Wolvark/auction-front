import { Component, inject, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { AccountService } from '../../services/account.service';
import { AuthService } from '../../services/auth.service';
import { AddFundsDialogComponent } from './add-funds-dialog.component';
import { Account, BidStatus, TransactionType } from '../../models';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDividerModule,
    DatePipe,
    CurrencyPipe,
  ],
  template: `
    <div class="account-container">
      <div class="page-header">
        <h1>My Account</h1>
        <span class="subtitle">Manage your wallet and payment history</span>
      </div>

      @if (loading()) {
        <div class="loading-center">
          <mat-spinner diameter="48" />
        </div>
      } @else if (account()) {
        <!-- Balance Cards -->
        <div class="balance-grid">
          <mat-card class="balance-card primary-balance">
            <mat-card-content>
              <div class="balance-content">
                <div class="balance-icon">
                  <mat-icon>account_balance_wallet</mat-icon>
                </div>
                <div class="balance-info">
                  <div class="balance-label">Total Balance</div>
                  <div class="balance-amount">{{ account()!.balance | currency }}</div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="balance-card available-balance">
            <mat-card-content>
              <div class="balance-content">
                <div class="balance-icon available-icon">
                  <mat-icon>check_circle</mat-icon>
                </div>
                <div class="balance-info">
                  <div class="balance-label">Available Balance</div>
                  <div class="balance-amount">{{ account()!.availableBalance | currency }}</div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="balance-card held-balance">
            <mat-card-content>
              <div class="balance-content">
                <div class="balance-icon held-icon">
                  <mat-icon>lock_clock</mat-icon>
                </div>
                <div class="balance-info">
                  <div class="balance-label">On Hold (Active Bids)</div>
                  <div class="balance-amount">{{ account()!.heldAmount | currency }}</div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <div class="add-funds-row">
          <button mat-flat-button (click)="openAddFunds()">
            <mat-icon>add</mat-icon>
            Add Funds
          </button>
        </div>

        <!-- Transaction History -->
        <mat-card class="history-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>receipt_long</mat-icon>
            <mat-card-title>Transaction History</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            @if (account()!.transactions.length === 0) {
              <div class="empty-state">
                <mat-icon>receipt</mat-icon>
                <p>No transactions yet</p>
              </div>
            } @else {
              <div class="transaction-list">
                @for (tx of account()!.transactions; track tx.id) {
                  <div class="transaction-row">
                    <div class="tx-icon" [class]="txIconClass(tx.type)">
                      <mat-icon>{{ txIcon(tx.type) }}</mat-icon>
                    </div>
                    <div class="tx-info">
                      <div class="tx-description">{{ tx.description }}</div>
                      <div class="tx-meta">
                        <span class="tx-method">{{ tx.paymentMethod ?? '' }}</span>
                        <span class="tx-date">{{ tx.createdAt | date: 'medium' }}</span>
                      </div>
                    </div>
                    <div class="tx-amount" [class.positive]="isPositive(tx.type)" [class.negative]="!isPositive(tx.type)">
                      {{ isPositive(tx.type) ? '+' : '-' }}{{ tx.amount | currency }}
                    </div>
                  </div>
                  <mat-divider />
                }
              </div>
            }
          </mat-card-content>
        </mat-card>

        <!-- Bid History -->
        <mat-card class="history-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>gavel</mat-icon>
            <mat-card-title>Bid History</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            @if (account()!.bidHistory.length === 0) {
              <div class="empty-state">
                <mat-icon>gavel</mat-icon>
                <p>No bids placed yet</p>
              </div>
            } @else {
              <div class="transaction-list">
                @for (bid of account()!.bidHistory; track bid.bidId) {
                  <div class="transaction-row">
                    <div class="tx-icon bid-icon">
                      <mat-icon>gavel</mat-icon>
                    </div>
                    <div class="tx-info">
                      <div class="tx-description">{{ bid.itemName }}</div>
                      <div class="tx-meta">
                        <mat-chip [class]="'bid-status-' + bid.status.toLowerCase()">
                          {{ bid.status }}
                        </mat-chip>
                        <span class="tx-date">{{ bid.placedAt | date: 'medium' }}</span>
                      </div>
                    </div>
                    <div class="tx-amount bid-amount">{{ bid.amount | currency }}</div>
                  </div>
                  <mat-divider />
                }
              </div>
            }
          </mat-card-content>
        </mat-card>
      } @else {
        <mat-card class="error-card">
          <mat-card-content>
            <div class="empty-state">
              <mat-icon>error_outline</mat-icon>
              <p>Could not load account information.</p>
              <button mat-flat-button (click)="loadAccount()">Retry</button>
            </div>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [
    `
      .account-container {
        max-width: 900px;
      }
      .page-header {
        margin-bottom: 32px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
      }
      .page-header h1 {
        margin-bottom: 4px;
      }
      .subtitle {
        color: var(--mat-sys-on-surface-variant);
        font-size: 0.95rem;
      }
      .loading-center {
        display: flex;
        justify-content: center;
        padding: 80px 0;
      }
      .balance-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 16px;
        margin-bottom: 16px;
      }
      .balance-card {
        border-radius: 16px !important;
      }
      .balance-content {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 8px 0;
      }
      .balance-icon {
        width: 56px;
        height: 56px;
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--mat-sys-primary-container);
        flex-shrink: 0;
      }
      .balance-icon mat-icon {
        color: var(--mat-sys-on-primary-container);
        font-size: 28px;
        width: 28px;
        height: 28px;
      }
      .available-icon {
        background: #d1fae5;
      }
      .available-icon mat-icon {
        color: #059669;
      }
      .held-icon {
        background: #fef3c7;
      }
      .held-icon mat-icon {
        color: #d97706;
      }
      .balance-label {
        font-size: 0.8rem;
        color: var(--mat-sys-on-surface-variant);
        margin-bottom: 4px;
      }
      .balance-amount {
        font-size: 1.75rem;
        font-weight: 700;
        color: var(--mat-sys-on-surface);
        line-height: 1;
      }
      .add-funds-row {
        display: flex;
        justify-content: flex-end;
        margin-bottom: 24px;
      }
      .history-card {
        border-radius: 16px !important;
        margin-bottom: 24px;
      }
      .transaction-list {
        display: flex;
        flex-direction: column;
        padding-top: 8px;
      }
      .transaction-row {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 12px 0;
      }
      .tx-icon {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--mat-sys-surface-container);
        flex-shrink: 0;
      }
      .tx-icon mat-icon {
        font-size: 22px;
        width: 22px;
        height: 22px;
        color: var(--mat-sys-primary);
      }
      .deposit-icon {
        background: #d1fae5;
      }
      .deposit-icon mat-icon {
        color: #059669;
      }
      .hold-icon {
        background: #fef3c7;
      }
      .hold-icon mat-icon {
        color: #d97706;
      }
      .bid-icon {
        background: var(--mat-sys-secondary-container);
      }
      .bid-icon mat-icon {
        color: var(--mat-sys-on-secondary-container);
      }
      .tx-info {
        flex: 1;
        min-width: 0;
      }
      .tx-description {
        font-weight: 500;
        font-size: 0.95rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .tx-meta {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 2px;
      }
      .tx-method, .tx-date {
        font-size: 0.8rem;
        color: var(--mat-sys-on-surface-variant);
      }
      .tx-amount {
        font-weight: 700;
        font-size: 1rem;
        flex-shrink: 0;
      }
      .tx-amount.positive {
        color: #059669;
      }
      .tx-amount.negative {
        color: #dc2626;
      }
      .bid-amount {
        color: var(--mat-sys-on-surface);
      }
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 32px 0;
        gap: 8px;
        color: var(--mat-sys-on-surface-variant);
      }
      .empty-state mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        opacity: 0.4;
      }
    `,
  ],
})
export class AccountComponent implements OnInit {
  private accountService = inject(AccountService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);

  loading = signal(true);
  account = signal<Account | null>(null);

  ngOnInit(): void {
    this.loadAccount();
  }

  loadAccount(): void {
    const user = this.authService.currentUser();
    if (!user) return;
    this.loading.set(true);
    this.accountService.getByCustomer(user.customerId).subscribe({
      next: (acc) => {
        this.account.set(acc);
        this.loading.set(false);
      },
      error: () => {
        this.account.set(null);
        this.loading.set(false);
      },
    });
  }

  openAddFunds(): void {
    const user = this.authService.currentUser();
    if (!user) return;
    const ref = this.dialog.open(AddFundsDialogComponent, {
      data: user.customerId,
      width: '460px',
    });
    ref.afterClosed().subscribe((updated: boolean | undefined) => {
      if (updated) this.loadAccount();
    });
  }

  txIcon(type: TransactionType): string {
    switch (type) {
      case TransactionType.DEPOSIT:
        return 'add_circle';
      case TransactionType.WITHDRAWAL:
        return 'remove_circle';
      case TransactionType.BID_HOLD:
        return 'lock';
      case TransactionType.BID_RELEASE:
        return 'lock_open';
      case TransactionType.BID_CHARGE:
        return 'payments';
      default:
        return 'swap_horiz';
    }
  }

  txIconClass(type: TransactionType): string {
    switch (type) {
      case TransactionType.DEPOSIT:
      case TransactionType.BID_RELEASE:
        return 'tx-icon deposit-icon';
      case TransactionType.BID_HOLD:
      case TransactionType.WITHDRAWAL:
      case TransactionType.BID_CHARGE:
        return 'tx-icon hold-icon';
      default:
        return 'tx-icon';
    }
  }

  isPositive(type: TransactionType): boolean {
    return type === TransactionType.DEPOSIT || type === TransactionType.BID_RELEASE;
  }

  readonly BidStatus = BidStatus;
}
