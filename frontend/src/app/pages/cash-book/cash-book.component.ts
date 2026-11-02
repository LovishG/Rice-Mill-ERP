import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzMessageService } from 'ng-zorro-antd/message';

import { ApiService } from '../../core/services/api.service';
import { DailyCashBookReport, Party, Account } from '../../core/models/accounting.models';

@Component({
  selector: 'app-cash-book',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzTableModule,
    NzButtonModule,
    NzCardModule,
    NzStatisticModule,
    NzGridModule,
    NzTagModule,
    NzModalModule,
    NzFormModule,
    NzInputModule,
    NzInputNumberModule,
    NzSelectModule
  ],
  templateUrl: './cash-book.component.html',
  styleUrls: ['./cash-book.component.less']
})
export class CashBookComponent implements OnInit {
  private api = inject(ApiService);
  private msg = inject(NzMessageService);
  private fb = inject(FormBuilder);

  selectedDate: string = new Date().toISOString().slice(0, 10);
  cashBook = signal<DailyCashBookReport | null>(null);
  parties = signal<Party[]>([]);
  accounts = signal<Account[]>([]);
  loading = signal<boolean>(false);

  quickVoucherModal = false;
  voucherForm!: FormGroup;

  ngOnInit(): void {
    this.initForm();
    this.loadAccountsAndParties();
    this.loadCashBook();
  }

  private initForm(): void {
    this.voucherForm = this.fb.group({
      type: ['PAYMENT', [Validators.required]], // PAYMENT = Cash Out, RECEIPT = Cash In
      account_id: [null, [Validators.required]],
      party_id: [null],
      amount: [5000, [Validators.required, Validators.min(1)]],
      reference_no: [''],
      narration: ['', [Validators.required]]
    });
  }

  loadAccountsAndParties(): void {
    this.api.getAccounts().subscribe(accs => this.accounts.set(accs));
    this.api.getParties().subscribe(parts => this.parties.set(parts));
  }

  loadCashBook(): void {
    this.loading.set(true);
    this.api.getDailyCashBook(this.selectedDate).subscribe({
      next: (data) => {
        this.cashBook.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.msg.error('Failed to load cash book: ' + err.message);
        this.loading.set(false);
      }
    });
  }

  openQuickModal(type: 'PAYMENT' | 'RECEIPT'): void {
    this.voucherForm.patchValue({
      type,
      amount: 1000,
      narration: type === 'PAYMENT' ? 'Cash payment for ' : 'Cash received from '
    });
    this.quickVoucherModal = true;
  }

  saveCashVoucher(): void {
    if (this.voucherForm.invalid) {
      this.msg.warning('Please fill all required fields');
      return;
    }

    const val = this.voucherForm.getRawValue();
    const cashAcc = this.accounts().find(a => a.code === '1001');
    if (!cashAcc) {
      this.msg.error('Cash account (1001) not found');
      return;
    }

    // Build balanced double-entry lines
    const lines = [];
    if (val.type === 'PAYMENT') {
      // Cash Out: Debit expense/party, Credit Cash (1001)
      lines.push({
        account_id: val.account_id,
        party_id: val.party_id || null,
        debit: val.amount,
        credit: 0,
        line_narration: val.narration
      });
      lines.push({
        account_id: cashAcc.id,
        debit: 0,
        credit: val.amount,
        line_narration: 'Cash Out at Mill Counter'
      });
    } else {
      // Cash In: Debit Cash (1001), Credit revenue/party
      lines.push({
        account_id: cashAcc.id,
        debit: val.amount,
        credit: 0,
        line_narration: 'Cash In at Mill Counter'
      });
      lines.push({
        account_id: val.account_id,
        party_id: val.party_id || null,
        debit: 0,
        credit: val.amount,
        line_narration: val.narration
      });
    }

    const payload = {
      voucher_type: val.type,
      voucher_date: this.selectedDate,
      reference_no: val.reference_no,
      narration: val.narration,
      lines
    };

    this.loading.set(true);
    this.api.createVoucher(payload).subscribe({
      next: () => {
        this.msg.success('Cash transaction recorded successfully');
        this.quickVoucherModal = false;
        this.loadCashBook();
      },
      error: (err) => {
        this.msg.error('Error saving cash entry: ' + err.message);
        this.loading.set(false);
      }
    });
  }

  printCashBook(): void {
    window.print();
  }
}
