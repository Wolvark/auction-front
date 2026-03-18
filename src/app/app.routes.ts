import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: '',
    loadComponent: () =>
      import('./layout/nav/nav.component').then((m) => m.NavComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'items',
        loadComponent: () =>
          import('./features/items/item-list.component').then((m) => m.ItemListComponent),
      },
      {
        path: 'items/:id',
        loadComponent: () =>
          import('./features/items/item-detail.component').then((m) => m.ItemDetailComponent),
      },
      {
        path: 'auctions',
        loadComponent: () =>
          import('./features/auctions/auction-list.component').then((m) => m.AuctionListComponent),
      },
      {
        path: 'auctions/:id',
        loadComponent: () =>
          import('./features/auctions/auction-detail.component').then(
            (m) => m.AuctionDetailComponent,
          ),
      },
      {
        path: 'bids',
        loadComponent: () =>
          import('./features/bids/bid-list.component').then((m) => m.BidListComponent),
      },
      {
        path: 'account',
        loadComponent: () =>
          import('./features/account/account.component').then((m) => m.AccountComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
