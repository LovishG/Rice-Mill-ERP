import { db } from '../../database/db.js';
import { MandiPurchase } from './mandi-purchases.types.js';

export class MandiPurchasesRepository {
  static findAll(): MandiPurchase[] {
    const sql = `
      SELECT 
        mp.*,
        p.name as mandi_party_name
      FROM mandi_purchases mp
      JOIN parties p ON mp.mandi_party_id = p.id
      ORDER BY mp.bill_date DESC, mp.id DESC
    `;
    return db.prepare(sql).all() as MandiPurchase[];
  }

  static findById(id: number): MandiPurchase | undefined {
    const sql = `
      SELECT 
        mp.*,
        p.name as mandi_party_name
      FROM mandi_purchases mp
      JOIN parties p ON mp.mandi_party_id = p.id
      WHERE mp.id = ?
    `;
    return db.prepare(sql).get(id) as MandiPurchase | undefined;
  }

  static create(data: Omit<MandiPurchase, 'id' | 'created_at'>): MandiPurchase {
    const stmt = db.prepare(`
      INSERT INTO mandi_purchases (
        voucher_id, mandi_party_id, bill_no, bill_date, gate_pass_no, paddy_variety,
        total_bags, bag_type, gross_weight_qtl, tare_weight_qtl, net_weight_qtl,
        moisture_percent, moisture_cut_qtl, final_billable_qtl, rate_per_qtl,
        base_paddy_amount, mandi_cess_percent, mandi_cess_amount, arhat_percent,
        arhat_amount, rdf_percent, rdf_amount, mandi_labor_amount, freight_paid_by_mandi,
        other_deductions_amount, net_payable_amount, status
      ) VALUES (
        @voucher_id, @mandi_party_id, @bill_no, @bill_date, @gate_pass_no, @paddy_variety,
        @total_bags, @bag_type, @gross_weight_qtl, @tare_weight_qtl, @net_weight_qtl,
        @moisture_percent, @moisture_cut_qtl, @final_billable_qtl, @rate_per_qtl,
        @base_paddy_amount, @mandi_cess_percent, @mandi_cess_amount, @arhat_percent,
        @arhat_amount, @rdf_percent, @rdf_amount, @mandi_labor_amount, @freight_paid_by_mandi,
        @other_deductions_amount, @net_payable_amount, @status
      )
    `);

    const res = stmt.run(data);
    return this.findById(Number(res.lastInsertRowid))!;
  }
}
