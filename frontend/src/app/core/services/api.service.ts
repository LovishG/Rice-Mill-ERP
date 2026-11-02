import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  Party,
  Account,
  MandiPurchase,
  Voucher,
  PartyLedgerReport,
  DailyCashBookReport,
  ApiResponse,
  PartyType
} from '../models/accounting.models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = '/api';

  // Parties & Mandis
  getParties(type?: PartyType): Observable<Party[]> {
    const url = type ? `${this.baseUrl}/parties?type=${type}` : `${this.baseUrl}/parties`;
    return this.http.get<ApiResponse<Party[]>>(url).pipe(map(res => res.data));
  }

  getPartyById(id: number): Observable<Party> {
    return this.http.get<ApiResponse<Party>>(`${this.baseUrl}/parties/${id}`).pipe(map(res => res.data));
  }

  createParty(party: Partial<Party>): Observable<Party> {
    return this.http.post<ApiResponse<Party>>(`${this.baseUrl}/parties`, party).pipe(map(res => res.data));
  }

  updateParty(id: number, party: Partial<Party>): Observable<Party> {
    return this.http.put<ApiResponse<Party>>(`${this.baseUrl}/parties/${id}`, party).pipe(map(res => res.data));
  }

  deleteParty(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/parties/${id}`);
  }

  // Chart of Accounts
  getAccounts(): Observable<Account[]> {
    return this.http.get<ApiResponse<Account[]>>(`${this.baseUrl}/accounts`).pipe(map(res => res.data));
  }

  // Mandi Purchases
  getMandiPurchases(): Observable<MandiPurchase[]> {
    return this.http.get<ApiResponse<MandiPurchase[]>>(`${this.baseUrl}/mandi-purchases`).pipe(map(res => res.data));
  }

  createMandiPurchase(purchase: any): Observable<MandiPurchase> {
    return this.http.post<ApiResponse<MandiPurchase>>(`${this.baseUrl}/mandi-purchases`, purchase).pipe(map(res => res.data));
  }

  // Vouchers
  getVouchers(filters?: any): Observable<Voucher[]> {
    return this.http.get<ApiResponse<Voucher[]>>(`${this.baseUrl}/vouchers`, { params: filters }).pipe(map(res => res.data));
  }

  createVoucher(voucher: any): Observable<Voucher> {
    return this.http.post<ApiResponse<Voucher>>(`${this.baseUrl}/vouchers`, voucher).pipe(map(res => res.data));
  }

  // Reports
  getPartyLedger(partyId: number, fromDate?: string, toDate?: string): Observable<PartyLedgerReport> {
    let url = `${this.baseUrl}/reports/party-ledger/${partyId}`;
    const params: any = {};
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;
    return this.http.get<ApiResponse<PartyLedgerReport>>(url, { params }).pipe(map(res => res.data));
  }

  getDailyCashBook(dateStr?: string): Observable<DailyCashBookReport> {
    const url = dateStr ? `${this.baseUrl}/reports/cash-book?date=${dateStr}` : `${this.baseUrl}/reports/cash-book`;
    return this.http.get<ApiResponse<DailyCashBookReport>>(url).pipe(map(res => res.data));
  }

  getTrialBalance(): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/reports/trial-balance`).pipe(map(res => res.data));
  }
}
