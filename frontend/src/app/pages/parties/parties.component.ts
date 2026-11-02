import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzDividerModule } from 'ng-zorro-antd/divider';

import { ApiService } from '../../core/services/api.service';
import { Party, PartyType } from '../../core/models/accounting.models';

@Component({
  selector: 'app-parties',
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
    NzTagModule,
    NzRadioModule,
    NzGridModule,
    NzDividerModule
  ],
  templateUrl: './parties.component.html',
  styleUrls: ['./parties.component.less']
})
export class PartiesComponent implements OnInit {
  private api = inject(ApiService);
  private msg = inject(NzMessageService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  parties = signal<Party[]>([]);
  filteredParties = signal<Party[]>([]);
  loading = signal<boolean>(false);
  activeTab: string = 'ALL';

  drawerVisible = false;
  partyForm!: FormGroup;
  Math = Math;

  ngOnInit(): void {
    this.initForm();
    this.loadParties();
  }

  private initForm(): void {
    this.partyForm = this.fb.group({
      name: ['', [Validators.required]],
      party_type: ['MANDI_AGENT', [Validators.required]],
      contact_person: [''],
      phone: [''],
      email: [''],
      city: [''],
      state: [''],
      mandi_name: [''],
      apmc_license_no: [''],
      pan: [''],
      gstin: [''],
      bank_name: [''],
      bank_account_no: [''],
      bank_ifsc: [''],
      default_brokerage_rate: [0],
      default_brokerage_type: ['PER_QTL'],
      opening_balance: [0]
    });
  }

  loadParties(): void {
    this.loading.set(true);
    this.api.getParties().subscribe({
      next: (data) => {
        this.parties.set(data);
        this.applyFilter();
        this.loading.set(false);
      },
      error: (err) => {
        this.msg.error('Failed to load parties: ' + err.message);
        this.loading.set(false);
      }
    });
  }

  onTabChange(tab: string): void {
    this.activeTab = tab;
    this.applyFilter();
  }

  applyFilter(): void {
    if (this.activeTab === 'ALL') {
      this.filteredParties.set(this.parties());
    } else {
      this.filteredParties.set(this.parties().filter(p => p.party_type === this.activeTab));
    }
  }

  openNewPartyDrawer(): void {
    this.partyForm.reset({
      party_type: 'MANDI_AGENT',
      default_brokerage_rate: 0,
      default_brokerage_type: 'PER_QTL',
      opening_balance: 0
    });
    this.drawerVisible = true;
  }

  closeDrawer(): void {
    this.drawerVisible = false;
  }

  saveParty(): void {
    if (this.partyForm.invalid) {
      this.msg.warning('Please enter valid party details');
      return;
    }

    const payload = this.partyForm.getRawValue();
    this.loading.set(true);
    this.api.createParty(payload).subscribe({
      next: () => {
        this.msg.success('Party / Mandi Firm saved successfully');
        this.drawerVisible = false;
        this.loadParties();
      },
      error: (err) => {
        this.msg.error('Error: ' + err.message);
        this.loading.set(false);
      }
    });
  }

  viewLedger(partyId: number): void {
    this.router.navigate(['/ledger'], { queryParams: { partyId } });
  }

  getPartyTypeTag(type: PartyType): { label: string; color: string } {
    const map: Record<PartyType, { label: string; color: string }> = {
      MANDI_AGENT: { label: 'Mandi Arhatiya', color: 'orange' },
      COMMERCIAL_BUYER: { label: 'Rice Buyer', color: 'green' },
      BROKER: { label: 'Broker (Dalal)', color: 'blue' },
      TRANSPORTER: { label: 'Transporter', color: 'cyan' },
      HAMALI_CONTRACTOR: { label: 'Hamali Labor', color: 'purple' },
      CMR_AGENCY: { label: 'Govt CMR Agency', color: 'red' },
      OTHER_VENDOR: { label: 'Vendor', color: 'default' }
    };
    return map[type] || { label: type, color: 'default' };
  }
}
