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
        <mat-card-header class="auth-header">
          <mat-icon class="brand-icon">gavel</mat-icon>
          <mat-card-title>AuctionHub</mat-card-title>
          <mat-card-subtitle>Sign in to your account</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="submit()" class="auth-form">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>username</mat-label>
              <input matInput formControlName="username" type="username" />
              <mat-icon matSuffix>username</mat-icon>
              @if (form.get('username')?.hasError('required') && form.get('username')?.touched) {
                <mat-error>username is required</mat-error>
              } @else if (
                form.get('username')?.hasError('username') && form.get('username')?.touched
              ) {
                <mat-error>Enter a valid username</mat-error>
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
        <mat-card-actions class="auth-actions">
          <span>Don't have an account?</span>
          <a routerLink="/register" mat-button>Register</a>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .auth-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background: var(--mat-sys-surface-container-lowest);
        padding: 24px;
      }
      .auth-card {
        width: 100%;
        max-width: 420px;
        border-radius: 20px !important;
        padding: 8px;
      }
      .auth-header {
        flex-direction: column;
        align-items: center;
        padding: 24px 0 8px;
        gap: 8px;
      }
      .brand-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: var(--mat-sys-primary);
        margin-bottom: 4px;
      }
      .auth-form {
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 16px 0 8px;
      }
      .full-width {
        width: 100%;
      }
      .submit-btn {
        margin-top: 8px;
        height: 44px;
        font-size: 1rem;
      }
      .auth-actions {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        padding: 8px 16px 16px;
        font-size: 0.9rem;
        color: var(--mat-sys-on-surface-variant);
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
    username: ['', [Validators.required, Validators.required]],
    password: ['', Validators.required],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    const { username, password } = this.form.value;
    this.authService.login({ username: username!, password: password! }).subscribe({
      next: () => {
        this.snackBar.open('Welcome back!', 'Close', { duration: 2000 });
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.snackBar.open('Invalid username or password', 'Close', { duration: 3000 });
        this.loading = false;
      },
    });
  }
}
