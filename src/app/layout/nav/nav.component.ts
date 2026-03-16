import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

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
          <button mat-icon-button>
            <mat-icon>notifications</mat-icon>
          </button>
          <button mat-icon-button>
            <mat-icon>account_circle</mat-icon>
          </button>
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
      .content {
        background: var(--mat-sys-surface-container-lowest);
      }
      .page-content {
        padding: 24px;
        min-height: calc(100vh - 64px);
      }
    `,
  ],
})
export class NavComponent {
  navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Customers', icon: 'people', route: '/customers' },
    { label: 'Items', icon: 'inventory_2', route: '/items' },
    { label: 'Auctions', icon: 'gavel', route: '/auctions' },
    { label: 'Bids', icon: 'price_check', route: '/bids' },
  ];
}
