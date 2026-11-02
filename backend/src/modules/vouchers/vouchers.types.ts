export type VoucherType = 
  | 'PAYMENT'
  | 'RECEIPT'
  | 'JOURNAL'
  | 'CONTRA'
  | 'MANDI_PURCHASE'
  | 'SALES_INVOICE';

export interface VoucherLine {
  id?: number;
  voucher_id?: number;
  account_id: number;
  account_name?: string;
  account_code?: string;
  party_id?: number | null;
  party_name?: string | null;
  debit: number;
  credit: number;
  line_narration?: string | null;
}

export interface Voucher {
  id: number;
  voucher_no: string;
  voucher_type: VoucherType;
  voucher_date: string;
  reference_no?: string | null;
  narration?: string | null;
  total_amount: number;
  created_at: string;
  lines?: VoucherLine[];
}

export interface CreateVoucherInput {
  voucher_type: VoucherType;
  voucher_date: string;
  reference_no?: string;
  narration?: string;
  lines: {
    account_id: number;
    party_id?: number | null;
    debit: number;
    credit: number;
    line_narration?: string;
  }[];
}
