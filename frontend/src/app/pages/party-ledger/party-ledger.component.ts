import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzMessageService } from 'ng-zorro-antd/message';

import { ApiService } from '../../core/services/api.service';
import { Party, PartyLedgerReport } from '../../core/models/accounting.models';

@Component({
  selector: 'app-party-ledger',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzTableModule,
    NzButtonModule,
    NzCardModule,
    NzSelectModule,
    NzDatePickerModule,
    NzStatisticModule,
    NzGridModule,
    NzTagModule,
    NzDividerModule
  ],
  templateUrl: './party-ledger.component.html',
  styleUrls: ['./party-ledger.component.less']
})
export class PartyLedgerComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private msg = inject(NzMessageService);

  parties = signal<Party[]>([]);
  selectedPartyId: number | null = null;
  ledgerData = signal<PartyLedgerReport | null>(null);
  loading = signal<boolean>(false);

  fromDate: string = '';
  toDate: string = '';
  Math = Math;

  ngOnInit(): void {
    this.api.getParties().subscribe({
      next: (parties) => {
        this.parties.set(parties);

        // Check if query params have partyId
        this.route.queryParams.subscribe(params => {
          if (params['partyId']) {
            this.selectedPartyId = Number(params['partyId']);
            this.fetchLedger();
          } else if (parties.length > 0) {
            this.selectedPartyId = parties[0].id;
            this.fetchLedger();
          }
        });
      }
    });
  }

  fetchLedger(): void {
    if (!this.selectedPartyId) return;

    this.loading.set(true);
    this.api.getPartyLedger(this.selectedPartyId, this.fromDate || undefined, this.toDate || undefined).subscribe({
      next: (data) => {
        this.ledgerData.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.msg.error('Failed to load ledger: ' + err.message);
        this.loading.set(false);
      }
    });
  }

  onPartyChange(id: number): void {
    this.selectedPartyId = id;
    this.fetchLedger();
  }

  printStatement(): void {
    window.print();
  }
}
