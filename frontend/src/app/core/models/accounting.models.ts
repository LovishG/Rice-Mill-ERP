export type PartyType = 
  | 'MANDI_AGENT'
  | 'COMMERCIAL_BUYER'
  | 'BROKER'
  | 'TRANSPORTER'
  | 'HAMALI_CONTRACTOR'
  | 'CMR_AGENCY'
  | 'OTHER_VENDOR';

export interface Party {
  id: number;
  name: string;
  party_type: PartyType;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  mandi_name?: string;
  apmc_license_no?: string;
  pan?: string;
  gstin?: string;
  bank_name?: string;
  bank_account_no?: string;
  bank_ifsc?: string;
  default_brokerage_rate: number;
  default_brokerage_type: string;
  opening_balance: number;
  current_balance?: number;
}

export interface Account {
  id: number;
  code: string;
  name: string;
  type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
  balance?: number;
}

export interface MandiPurchase {
  id: number;
  voucher_id?: number;
  mandi_party_id: number;
  mandi_party_name?: string;
  bill_no: string;
  bill_date: string;
  gate_pass_no?: string;
  paddy_variety: string;
  total_bags: number;
  bag_type: 'JUTE' | 'HDPE' | 'LOOSE';
  gross_weight_qtl: number;
  tare_weight_qtl: number;
  net_weight_qtl: number;
  moisture_percent: number;
  moisture_cut_qtl: number;
  final_billable_qtl: number;
  rate_per_qtl: number;
  base_paddy_amount: number;
  mandi_cess_percent: number;
  mandi_cess_amount: number;
  arhat_percent: number;
  arhat_amount: number;
  rdf_percent: number;
  rdf_amount: number;
  mandi_labor_amount: number;
  freight_paid_by_mandi: number;
  other_deductions_amount: number;
  net_payable_amount: number;
  status: string;
  created_at: string;
}

export interface Voucher {
  id: number;
  voucher_no: string;
  voucher_type: string;
  voucher_date: string;
  reference_no?: string;
  narration?: string;
  total_amount: number;
  created_at: string;
  lines?: {
    account_id: number;
    account_name?: string;
    account_code?: string;
    party_id?: number;
    party_name?: string;
    debit: number;
    credit: number;
    line_narration?: string;
  }[];
}

export interface PartyLedgerReport {
  party_id: number;
  party_name: string;
  party_type: string;
  mandi_name?: string;
  from_date?: string;
  to_date?: string;
  opening_balance: number;
  entries: {
    voucher_id: number;
    voucher_no: string;
    voucher_type: string;
    voucher_date: string;
    reference_no?: string;
    narration?: string;
    account_name: string;
    debit: number;
    credit: number;
    running_balance: number;
  }[];
  total_debit: number;
  total_credit: number;
  closing_balance: number;
}

export interface DailyCashBookReport {
  date: string;
  opening_balance: number;
  entries: {
    voucher_id: number;
    voucher_no: string;
    voucher_type: string;
    voucher_date: string;
    reference_no?: string;
    narration?: string;
    party_name?: string;
    cash_in: number;
    cash_out: number;
    running_balance: number;
  }[];
  total_cash_in: number;
  total_cash_out: number;
  closing_balance: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
