import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { NzTableModule } from 'ng-zorro-antd/table';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzAlertModule } from 'ng-zorro-antd/alert';

import { ApiService } from '../../core/services/api.service';
import { Account } from '../../core/models/accounting.models';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzTableModule,
    NzCardModule,
    NzRadioModule,
    NzTagModule,
    NzStatisticModule,
    NzGridModule,
    NzAlertModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h2 class="title">📚 Chart of Accounts & Trial Balance</h2>
          <p class="subtitle">Complete General Ledger classification & double-entry balance verification</p>
        </div>
        <div>
          <nz-radio-group [(ngModel)]="activeView" nzButtonStyle="solid">
            <label nz-radio-button nzValue="CHART">Chart of Accounts</label>
            <label nz-radio-button nzValue="TRIAL">Trial Balance Check</label>
          </nz-radio-group>
        </div>
      </div>

      @if (activeView === 'CHART') {
        <nz-card>
          <nz-table #accTable [nzData]="accounts()" [nzLoading]="loading()" nzBordered nzSize="middle">
            <thead>
              <tr>
                <th style="width: 120px;">Code</th>
                <th>Account Head</th>
                <th style="width: 140px;">Classification</th>
                <th class="num-col" style="width: 180px;">Live Balance (₹)</th>
              </tr>
            </thead>
            <tbody>
              @for (acc of accTable.data; track acc.id) {
                <tr>
                  <td><strong>{{ acc.code }}</strong></td>
                  <td>{{ acc.name }}</td>
                  <td>
                    <nz-tag [nzColor]="getTypeColor(acc.type)">{{ acc.type }}</nz-tag>
                  </td>
                  <td class="num-col font-bold">
                    ₹{{ ((acc.balance || 0) | number:'1.2-2') || '0.00' }}
                  </td>
                </tr>
              }
            </tbody>
          </nz-table>
        </nz-card>
      } @else {
        @if (trialBalance(); as tb) {
          <div style="margin-bottom: 16px;">
            @if (Math.abs(tb.total_debit - tb.total_credit) < 0.01) {
              <nz-alert
                nzType="success"
                nzMessage="Trial Balance Matched Perfectly"
                nzDescription="Total Debits equal Total Credits. All double-entry books are strictly balanced."
                nzShowIcon>
              </nz-alert>
            } @else {
              <nz-alert
                nzType="error"
                nzMessage="Trial Balance Mismatch Detected"
                [nzDescription]="'Difference: ₹' + ((Math.abs(tb.total_debit - tb.total_credit) | number:'1.2-2') || '0.00')"
                nzShowIcon>
              </nz-alert>
            }
          </div>

          <nz-card>
            <nz-table #tbTable [nzData]="tb.accounts" [nzShowPagination]="false" nzBordered nzSize="middle">
              <thead>
                <tr>
                  <th style="width: 120px;">Code</th>
                  <th>Account Name</th>
                  <th style="width: 140px;">Type</th>
                  <th class="num-col" style="width: 180px;">Debit (₹)</th>
                  <th class="num-col" style="width: 180px;">Credit (₹)</th>
                </tr>
              </thead>
              <tbody>
                @for (item of tbTable.data; track item.account_id) {
                  @if (item.debit > 0 || item.credit > 0) {
                    <tr>
                      <td><strong>{{ item.code }}</strong></td>
                      <td>{{ item.name }}</td>
                      <td><nz-tag>{{ item.type }}</nz-tag></td>
                      <td class="num-col debit-val">
                        {{ item.debit > 0 ? ('₹' + (item.debit | number:'1.2-2')) : '-' }}
                      </td>
                      <td class="num-col credit-val">
                        {{ item.credit > 0 ? ('₹' + (item.credit | number:'1.2-2')) : '-' }}
                      </td>
                    </tr>
                  }
                }
                <tr style="background: #f0f5ff; font-size: 15px; font-weight: bold;">
                  <td colspan="3" style="text-align: right;">Total Balancing Check:</td>
                  <td class="num-col debit-val">₹{{ (tb.total_debit | number:'1.2-2') || '0.00' }}</td>
                  <td class="num-col credit-val">₹{{ (tb.total_credit | number:'1.2-2') || '0.00' }}</td>
                </tr>
              </tbody>
            </nz-table>
          </nz-card>
        }
      }
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; .title { margin: 0; font-weight: 600; } .subtitle { color: #8c8c8c; } }
  `]
})
export class AccountsComponent implements OnInit {
  private api = inject(ApiService);

  accounts = signal<Account[]>([]);
  trialBalance = signal<any>(null);
  loading = signal<boolean>(false);
  activeView: 'CHART' | 'TRIAL' = 'CHART';
  Math = Math;

  ngOnInit(): void {
    this.loading.set(true);
    this.api.getAccounts().subscribe(accs => {
      this.accounts.set(accs);
      this.loading.set(false);
    });

    this.api.getTrialBalance().subscribe(tb => {
      this.trialBalance.set(tb);
    });
  }

  getTypeColor(type: string): string {
    const map: Record<string, string> = {
      ASSET: 'blue',
      LIABILITY: 'red',
      EQUITY: 'purple',
      REVENUE: 'green',
      EXPENSE: 'orange'
    };
    return map[type] || 'default';
  }
}
