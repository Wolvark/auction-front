import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'account',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/account/account.component').then((m) => m.AccountComponent),
  },
  {
    path: 'customers',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/customers/customer-list.component').then((m) => m.CustomerListComponent),
  },
  {
    path: 'items',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/items/item-list.component').then((m) => m.ItemListComponent),
  },
  {
    path: 'items/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/items/item-detail.component').then((m) => m.ItemDetailComponent),
  },
  {
    path: 'auctions',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/auctions/auction-list.component').then((m) => m.AuctionListComponent),
  },
  {
    path: 'auctions/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/auctions/auction-detail.component').then((m) => m.AuctionDetailComponent),
  },
  {
    path: 'bids',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/bids/bid-list.component').then((m) => m.BidListComponent),
  },
  { path: '**', redirectTo: 'dashboard' },
];
