export type PartyType = 
  | 'MANDI_AGENT'
  | 'COMMERCIAL_BUYER'
  | 'BROKER'
  | 'TRANSPORTER'
  | 'HAMALI_CONTRACTOR'
  | 'CMR_AGENCY'
  | 'OTHER_VENDOR';

export type BrokerageType = 'PER_QTL' | 'PER_BAG' | 'PERCENTAGE';

export interface Party {
  id: number;
  name: string;
  party_type: PartyType;
  contact_person?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  mandi_name?: string | null;
  apmc_license_no?: string | null;
  pan?: string | null;
  gstin?: string | null;
  bank_name?: string | null;
  bank_account_no?: string | null;
  bank_ifsc?: string | null;
  default_brokerage_rate: number;
  default_brokerage_type: BrokerageType;
  opening_balance: number;
  opening_balance_date?: string | null;
  is_active: number;
  created_at: string;
  current_balance?: number; // Calculated dynamically from ledger
}

export interface CreatePartyInput {
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
  default_brokerage_rate?: number;
  default_brokerage_type?: BrokerageType;
  opening_balance?: number;
  opening_balance_date?: string;
}
