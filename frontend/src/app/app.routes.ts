import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'mandi-purchases', pathMatch: 'full' },
  {
    path: 'mandi-purchases',
    loadComponent: () => import('./pages/mandi-purchases/mandi-purchases.component').then(m => m.MandiPurchasesComponent)
  },
  {
    path: 'parties',
    loadComponent: () => import('./pages/parties/parties.component').then(m => m.PartiesComponent)
  },
  {
    path: 'ledger',
    loadComponent: () => import('./pages/party-ledger/party-ledger.component').then(m => m.PartyLedgerComponent)
  },
  {
    path: 'cash-book',
    loadComponent: () => import('./pages/cash-book/cash-book.component').then(m => m.CashBookComponent)
  },
  {
    path: 'accounts',
    loadComponent: () => import('./pages/accounts/accounts.component').then(m => m.AccountsComponent)
  },
  { path: '**', redirectTo: 'mandi-purchases' }
];
