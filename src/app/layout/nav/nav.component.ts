import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatTooltipModule,
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav mode="side" opened class="sidenav">
        <div class="sidenav-header">
          <mat-icon class="brand-icon">gavel</mat-icon>
          <span class="brand-title">AuctionHub</span>
        </div>
        <mat-nav-list>
          @for (item of navItems; track item.route) {
            <a
              mat-list-item
              [routerLink]="item.route"
              routerLinkActive="active-link"
              [routerLinkActiveOptions]="{ exact: item.route === '/dashboard' }"
              class="nav-item"
            >
              <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
              <span matListItemTitle>{{ item.label }}</span>
            </a>
          }
        </mat-nav-list>
      </mat-sidenav>
      <mat-sidenav-content class="content">
        <mat-toolbar class="top-toolbar">
          <span class="toolbar-title">Auction Management Platform</span>
          <span class="spacer"></span>
          @if (authService.currentCustomer()) {
            <span class="user-name">{{ authService.currentCustomer()!.firstName }} {{ authService.currentCustomer()!.lastName }}</span>
          }
          <button mat-icon-button [matMenuTriggerFor]="accountMenu" matTooltip="Account">
            <mat-icon>account_circle</mat-icon>
          </button>
          <mat-menu #accountMenu="matMenu">
            @if (authService.currentCustomer()) {
              <div class="menu-user-info">
                <span class="menu-user-name">{{ authService.currentCustomer()!.firstName }} {{ authService.currentCustomer()!.lastName }}</span>
                <span class="menu-user-email">{{ authService.currentCustomer()!.email }}</span>
              </div>
            }
            <button mat-menu-item (click)="logout()">
              <mat-icon>logout</mat-icon>
              <span>Sign Out</span>
            </button>
          </mat-menu>
        </mat-toolbar>
        <div class="page-content">
          <router-outlet />
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [
    `
      .sidenav-container {
        height: 100vh;
      }
      .sidenav {
        width: 240px;
        background: var(--mat-sys-surface-container-low);
        border-right: 1px solid var(--mat-sys-outline-variant);
      }
      .sidenav-header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 20px 16px 16px;
        border-bottom: 1px solid var(--mat-sys-outline-variant);
        margin-bottom: 8px;
      }
      .brand-icon {
        color: var(--mat-sys-primary);
        font-size: 32px;
        width: 32px;
        height: 32px;
      }
      .brand-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--mat-sys-primary);
        letter-spacing: 0.5px;
      }
      .nav-item {
        border-radius: 28px;
        margin: 2px 8px;
      }
      .active-link {
        background: var(--mat-sys-secondary-container) !important;
        color: var(--mat-sys-on-secondary-container);
      }
      .active-link mat-icon {
        color: var(--mat-sys-on-secondary-container);
      }
      .top-toolbar {
        background: var(--mat-sys-surface);
        border-bottom: 1px solid var(--mat-sys-outline-variant);
        position: sticky;
        top: 0;
        z-index: 100;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      }
      .toolbar-title {
        font-size: 1.1rem;
        font-weight: 500;
        color: var(--mat-sys-on-surface);
      }
      .spacer {
        flex: 1;
      }
      .user-name {
        font-size: 0.9rem;
        color: var(--mat-sys-on-surface-variant);
        margin-right: 8px;
      }
      .content {
        background: var(--mat-sys-surface-container-lowest);
      }
      .page-content {
        padding: 24px;
        min-height: calc(100vh - 64px);
      }
      .menu-user-info {
        display: flex;
        flex-direction: column;
        padding: 12px 16px 8px;
        border-bottom: 1px solid var(--mat-sys-outline-variant);
        margin-bottom: 4px;
      }
      .menu-user-name {
        font-weight: 600;
        font-size: 0.95rem;
      }
      .menu-user-email {
        font-size: 0.8rem;
        color: var(--mat-sys-on-surface-variant);
      }
    `,
  ],
})
export class NavComponent {
  authService = inject(AuthService);

  navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'My Items', icon: 'inventory_2', route: '/items' },
    { label: 'Auctions', icon: 'gavel', route: '/auctions' },
    { label: 'My Bids', icon: 'price_check', route: '/bids' },
  ];

  logout(): void {
    this.authService.logout();
  }
}
