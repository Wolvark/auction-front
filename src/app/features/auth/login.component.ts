import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="auth-container">
      <mat-card class="auth-card">
        <mat-card-header>
          <div class="auth-header">
            <mat-icon class="brand-icon">gavel</mat-icon>
            <h1 class="brand-title">AuctionHub</h1>
            <p class="auth-subtitle">Sign in to your account</p>
          </div>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="login()" class="auth-form">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" type="email" autocomplete="email" />
              <mat-icon matSuffix>email</mat-icon>
              @if (form.get('email')?.hasError('required') && form.get('email')?.touched) {
                <mat-error>Email is required</mat-error>
              }
              @if (form.get('email')?.hasError('email') && form.get('email')?.touched) {
                <mat-error>Enter a valid email address</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input
                matInput
                formControlName="password"
                [type]="hidePassword ? 'password' : 'text'"
                autocomplete="current-password"
              />
              <button
                mat-icon-button
                matSuffix
                type="button"
                (click)="hidePassword = !hidePassword"
                [attr.aria-label]="hidePassword ? 'Show password' : 'Hide password'"
              >
                <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (form.get('password')?.hasError('required') && form.get('password')?.touched) {
                <mat-error>Password is required</mat-error>
              }
            </mat-form-field>

            <button
              mat-flat-button
              class="full-width submit-btn"
              type="submit"
              [disabled]="loading"
            >
              @if (loading) {
                <mat-spinner diameter="20" />
              } @else {
                Sign In
              }
            </button>
          </form>
        </mat-card-content>
        <mat-card-actions class="auth-footer">
          <span class="footer-text">Don't have an account?</span>
          <a mat-button routerLink="/register">Create Account</a>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .auth-container {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--mat-sys-surface-container-lowest);
        padding: 16px;
      }
      .auth-card {
        width: 100%;
        max-width: 420px;
        border-radius: 20px !important;
        padding: 8px;
      }
      .auth-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        padding: 24px 0 16px;
        gap: 4px;
      }
      .brand-icon {
        color: var(--mat-sys-primary);
        font-size: 48px;
        width: 48px;
        height: 48px;
        margin-bottom: 8px;
      }
      .brand-title {
        font-size: 1.75rem;
        font-weight: 700;
        color: var(--mat-sys-primary);
        margin: 0;
      }
      .auth-subtitle {
        color: var(--mat-sys-on-surface-variant);
        font-size: 0.95rem;
        margin: 4px 0 0;
      }
      .auth-form {
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 8px 0;
      }
      .full-width {
        width: 100%;
      }
      .submit-btn {
        margin-top: 8px;
        height: 48px;
        font-size: 1rem;
        font-weight: 600;
      }
      mat-spinner {
        display: inline-block;
      }
      .auth-footer {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        padding: 8px 16px 16px;
      }
      .footer-text {
        color: var(--mat-sys-on-surface-variant);
        font-size: 0.9rem;
      }
    `,
  ],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  hidePassword = true;
  loading = false;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  login(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    const { email, password } = this.form.value as { email: string; password: string };
    this.authService.login({ email, password }).subscribe({
      next: () => {
        this.snackBar.open('Welcome back!', 'Close', { duration: 2000 });
        void this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.snackBar.open('Invalid email or password', 'Close', { duration: 3000 });
        this.loading = false;
      },
    });
  }
}
