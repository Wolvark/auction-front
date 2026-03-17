import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';

const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password')?.value as string | null;
  const confirm = control.get('confirmPassword')?.value as string | null;
  return password && confirm && password !== confirm ? { passwordMismatch: true } : null;
};

@Component({
  selector: 'app-register',
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
            <p class="auth-subtitle">Create your account</p>
          </div>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="register()" class="auth-form">
            <div class="name-row">
              <mat-form-field appearance="outline">
                <mat-label>First Name</mat-label>
                <input matInput formControlName="firstName" autocomplete="given-name" />
                @if (form.get('firstName')?.hasError('required') && form.get('firstName')?.touched) {
                  <mat-error>Required</mat-error>
                }
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Last Name</mat-label>
                <input matInput formControlName="lastName" autocomplete="family-name" />
                @if (form.get('lastName')?.hasError('required') && form.get('lastName')?.touched) {
                  <mat-error>Required</mat-error>
                }
              </mat-form-field>
            </div>

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
              <mat-label>Phone</mat-label>
              <input matInput formControlName="phone" type="tel" autocomplete="tel" />
              <mat-icon matSuffix>phone</mat-icon>
              @if (form.get('phone')?.hasError('required') && form.get('phone')?.touched) {
                <mat-error>Phone is required</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Username</mat-label>
              <input matInput formControlName="username" autocomplete="username" />
              <mat-icon matSuffix>person</mat-icon>
              @if (form.get('username')?.hasError('required') && form.get('username')?.touched) {
                <mat-error>Username is required</mat-error>
              }
              @if (form.get('username')?.hasError('minlength') && form.get('username')?.touched) {
                <mat-error>Username must be at least 3 characters</mat-error>
              }
              @if (form.get('username')?.hasError('pattern') && form.get('username')?.touched) {
                <mat-error>Only letters, numbers, dots and underscores allowed</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input
                matInput
                formControlName="password"
                [type]="hidePassword ? 'password' : 'text'"
                autocomplete="new-password"
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
              @if (form.get('password')?.hasError('minlength') && form.get('password')?.touched) {
                <mat-error>Password must be at least 8 characters</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Confirm Password</mat-label>
              <input
                matInput
                formControlName="confirmPassword"
                [type]="hideConfirm ? 'password' : 'text'"
                autocomplete="new-password"
              />
              <button
                mat-icon-button
                matSuffix
                type="button"
                (click)="hideConfirm = !hideConfirm"
                [attr.aria-label]="hideConfirm ? 'Show password' : 'Hide password'"
              >
                <mat-icon>{{ hideConfirm ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (form.get('confirmPassword')?.hasError('required') && form.get('confirmPassword')?.touched) {
                <mat-error>Please confirm your password</mat-error>
              }
              @if (form.hasError('passwordMismatch') && form.get('confirmPassword')?.touched) {
                <mat-error>Passwords do not match</mat-error>
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
                Create Account
              }
            </button>
          </form>
        </mat-card-content>
        <mat-card-actions class="auth-footer">
          <span class="footer-text">Already have an account?</span>
          <a mat-button routerLink="/login">Sign In</a>
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
        max-width: 480px;
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
      .name-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
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
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  hidePassword = true;
  hideConfirm = true;
  loading = false;

  form = this.fb.group(
    {
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      username: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.pattern(/^[a-zA-Z0-9._]+$/),
        ],
      ],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordMatchValidator },
  );

  register(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    const { firstName, lastName, email, phone, username, password } = this.form.value as {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      username: string;
      password: string;
    };
    this.authService.register({ firstName, lastName, email, phone, username, password }).subscribe({
      next: () => {
        this.snackBar.open('Account created successfully!', 'Close', { duration: 2000 });
        void this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        const message: string =
          (err?.error?.message as string | undefined) ?? 'Registration failed. Please try again.';
        this.snackBar.open(message, 'Close', { duration: 4000 });
        this.loading = false;
      },
    });
  }
}
