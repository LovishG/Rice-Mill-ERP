import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';

import { ApiService } from '../../core/services/api.service';
import { MandiPurchase, Party } from '../../core/models/accounting.models';

@Component({
  selector: 'app-mandi-purchases',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzTableModule,
    NzButtonModule,
    NzCardModule,
    NzDrawerModule,
    NzFormModule,
    NzInputModule,
    NzInputNumberModule,
    NzSelectModule,
    NzDatePickerModule,
    NzTagModule,
    NzModalModule,
    NzDividerModule,
    NzGridModule,
    NzStatisticModule
  ],
  templateUrl: './mandi-purchases.component.html',
  styleUrls: ['./mandi-purchases.component.less']
})
export class MandiPurchasesComponent implements OnInit {
  private api = inject(ApiService);
  private msg = inject(NzMessageService);
  private fb = inject(FormBuilder);

  purchases = signal<MandiPurchase[]>([]);
  mandiParties = signal<Party[]>([]);
  loading = signal<boolean>(false);
  drawerVisible = false;

  // Selected for view details
  selectedPurchase: MandiPurchase | null = null;
  detailsModalVisible = false;

  purchaseForm!: FormGroup;

  // Live calculation signals for the form
  calculatedNetWeight = signal<number>(0);
  calculatedMoistureCut = signal<number>(0);
  calculatedBillableWeight = signal<number>(0);
  calculatedBaseAmount = signal<number>(0);
  calculatedMandiCess = signal<number>(0);
  calculatedArhat = signal<number>(0);
  calculatedRdf = signal<number>(0);
  calculatedNetPayable = signal<number>(0);

  paddyVarieties = [
    'Basmati 1121 (Raw)',
    'Basmati 1509 (Steamed)',
    'Pusa Basmati 1401 (Steamed)',
    'Sugandha (Parboiled)',
    'Sharbati (Raw)',
    'PR 106 (Raw)',
    'PR 114 (Parboiled)',
    'Sona Masoori (Raw)',
    'Govt CMR Paddy (Grade A)',
    'Govt CMR Paddy (Common)'
  ];

  ngOnInit(): void {
    this.initForm();
    this.loadData();
  }

  private initForm(): void {
    this.purchaseForm = this.fb.group({
      mandi_party_id: [null, [Validators.required]],
      bill_no: ['', [Validators.required]],
      bill_date: [new Date().toISOString().slice(0, 10), [Validators.required]],
      gate_pass_no: [''],
      paddy_variety: [this.paddyVarieties[0], [Validators.required]],
      total_bags: [250, [Validators.required, Validators.min(1)]],
      bag_type: ['HDPE'],
      gross_weight_qtl: [130.0, [Validators.required, Validators.min(0.1)]],
      tare_weight_qtl: [5.0, [Validators.required, Validators.min(0)]],
      moisture_percent: [14.0, [Validators.required, Validators.min(0), Validators.max(35)]],
      rate_per_qtl: [3750, [Validators.required, Validators.min(1)]],
      mandi_cess_percent: [2.0],
      arhat_percent: [2.5],
      rdf_percent: [1.0],
      mandi_labor_amount: [1500],
      freight_paid_by_mandi: [0],
      other_deductions_amount: [0]
    });

    // Listen to value changes to update live calculations
    this.purchaseForm.valueChanges.subscribe(() => {
      this.recalculateFormValues();
    });

    this.recalculateFormValues();
  }

  recalculateFormValues(): void {
    const val = this.purchaseForm.getRawValue();
    const gross = Number(val.gross_weight_qtl) || 0;
    const tare = Number(val.tare_weight_qtl) || 0;
    const net = Math.max(0, Number((gross - tare).toFixed(2)));

    const moisture = Number(val.moisture_percent) || 0;
    let cut = 0;
    if (moisture > 14) {
      cut = Number((net * ((moisture - 14) / 100)).toFixed(2));
    }

    const billable = Math.max(0, Number((net - cut).toFixed(2)));
    const rate = Number(val.rate_per_qtl) || 0;
    const base = Number((billable * rate).toFixed(2));

    const cessPct = Number(val.mandi_cess_percent) || 0;
    const cess = Number((base * (cessPct / 100)).toFixed(2));

    const arhatPct = Number(val.arhat_percent) || 0;
    const arhat = Number((base * (arhatPct / 100)).toFixed(2));

    const rdfPct = Number(val.rdf_percent) || 0;
    const rdf = Number((base * (rdfPct / 100)).toFixed(2));

    const labor = Number(val.mandi_labor_amount) || 0;
    const freight = Number(val.freight_paid_by_mandi) || 0;
    const other = Number(val.other_deductions_amount) || 0;

    const netPayable = Number((base + cess + arhat + rdf + labor - freight - other).toFixed(2));

    this.calculatedNetWeight.set(net);
    this.calculatedMoistureCut.set(cut);
    this.calculatedBillableWeight.set(billable);
    this.calculatedBaseAmount.set(base);
    this.calculatedMandiCess.set(cess);
    this.calculatedArhat.set(arhat);
    this.calculatedRdf.set(rdf);
    this.calculatedNetPayable.set(netPayable);
  }

  calculatedTotalQtl(): number {
    return this.purchases().reduce((acc, p) => acc + (p.net_weight_qtl || 0), 0);
  }

  calculatedTotalAmount(): number {
    return this.purchases().reduce((acc, p) => acc + (p.net_payable_amount || 0), 0);
  }

  loadData(): void {
    this.loading.set(true);
    this.api.getMandiPurchases().subscribe({
      next: (data) => {
        this.purchases.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.msg.error('Failed to load mandi purchases: ' + err.message);
        this.loading.set(false);
      }
    });

    this.api.getParties('MANDI_AGENT').subscribe({
      next: (parties) => {
        this.mandiParties.set(parties);
      }
    });
  }

  openNewBillDrawer(): void {
    this.drawerVisible = true;
  }

  closeDrawer(): void {
    this.drawerVisible = false;
  }

  submitPurchase(): void {
    if (this.purchaseForm.invalid) {
      Object.values(this.purchaseForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      this.msg.warning('Please fill all mandatory fields properly.');
      return;
    }

    const payload = this.purchaseForm.getRawValue();
    this.loading.set(true);

    this.api.createMandiPurchase(payload).subscribe({
      next: (created) => {
        this.msg.success(`Mandi Bill #${created.bill_no} saved & balanced voucher posted!`);
        this.drawerVisible = false;
        this.loadData();
      },
      error: (err) => {
        this.msg.error('Error creating purchase bill: ' + err.message);
        this.loading.set(false);
      }
    });
  }

  viewDetails(p: MandiPurchase): void {
    this.selectedPurchase = p;
    this.detailsModalVisible = true;
  }

  printCurrentBill(): void {
    window.print();
  }
}
