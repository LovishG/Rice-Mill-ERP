export interface MandiPurchase {
  id: number;
  voucher_id?: number | null;
  mandi_party_id: number;
  mandi_party_name?: string;
  bill_no: string;
  bill_date: string;
  gate_pass_no?: string | null;
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
  status: 'DRAFT' | 'CONFIRMED' | 'CANCELLED';
  created_at: string;
}

export interface CreateMandiPurchaseInput {
  mandi_party_id: number;
  bill_no: string;
  bill_date: string;
  gate_pass_no?: string;
  paddy_variety: string;
  total_bags: number;
  bag_type?: 'JUTE' | 'HDPE' | 'LOOSE';
  gross_weight_qtl: number;
  tare_weight_qtl: number;
  moisture_percent?: number;
  rate_per_qtl: number;
  mandi_cess_percent?: number;
  arhat_percent?: number;
  rdf_percent?: number;
  mandi_labor_amount?: number;
  freight_paid_by_mandi?: number;
  other_deductions_amount?: number;
}
