import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'customers',
    loadComponent: () =>
      import('./features/customers/customer-list.component').then((m) => m.CustomerListComponent),
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
      import('./features/auctions/auction-detail.component').then((m) => m.AuctionDetailComponent),
  },
  {
    path: 'bids',
    loadComponent: () =>
      import('./features/bids/bid-list.component').then((m) => m.BidListComponent),
  },
  { path: '**', redirectTo: 'dashboard' },
];
