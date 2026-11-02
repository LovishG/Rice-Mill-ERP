export interface LedgerEntry {
  voucher_id: number;
  voucher_no: string;
  voucher_type: string;
  voucher_date: string;
  reference_no?: string | null;
  narration?: string | null;
  account_name: string;
  debit: number;
  credit: number;
  running_balance: number;
}

export interface PartyLedgerReport {
  party_id: number;
  party_name: string;
  party_type: string;
  mandi_name?: string | null;
  from_date?: string;
  to_date?: string;
  opening_balance: number;
  entries: LedgerEntry[];
  total_debit: number;
  total_credit: number;
  closing_balance: number;
}

export interface CashBookEntry {
  voucher_id: number;
  voucher_no: string;
  voucher_type: string;
  voucher_date: string;
  reference_no?: string | null;
  narration?: string | null;
  party_name?: string | null;
  cash_in: number;
  cash_out: number;
  running_balance: number;
}

export interface DailyCashBookReport {
  date: string;
  opening_balance: number;
  entries: CashBookEntry[];
  total_cash_in: number;
  total_cash_out: number;
  closing_balance: number;
}

export interface TrialBalanceItem {
  account_id: number;
  code: string;
  name: string;
  type: string;
  debit: number;
  credit: number;
}
