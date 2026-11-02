import { db } from '../../database/db.js';
import { Party, CreatePartyInput, PartyType } from './parties.types.js';

export class PartiesRepository {
  /**
   * List all parties with their calculated live balance
   */
  static findAll(partyType?: PartyType): Party[] {
    let sql = `
      SELECT 
        p.*,
        (p.opening_balance + COALESCE(SUM(vl.debit), 0) - COALESCE(SUM(vl.credit), 0)) AS current_balance
      FROM parties p
      LEFT JOIN voucher_lines vl ON p.id = vl.party_id
    `;
    const params: any[] = [];

    if (partyType) {
      sql += ` WHERE p.party_type = ?`;
      params.push(partyType);
    }

    sql += ` GROUP BY p.id ORDER BY p.name ASC`;
    return db.prepare(sql).all(...params) as Party[];
  }

  /**
   * Find party by ID with live ledger balance
   */
  static findById(id: number): Party | undefined {
    const sql = `
      SELECT 
        p.*,
        (p.opening_balance + COALESCE(SUM(vl.debit), 0) - COALESCE(SUM(vl.credit), 0)) AS current_balance
      FROM parties p
      LEFT JOIN voucher_lines vl ON p.id = vl.party_id
      WHERE p.id = ?
      GROUP BY p.id
    `;
    return db.prepare(sql).get(id) as Party | undefined;
  }

  /**
   * Create a new party
   */
  static create(input: CreatePartyInput): Party {
    const stmt = db.prepare(`
      INSERT INTO parties (
        name, party_type, contact_person, phone, email, address, city, state,
        mandi_name, apmc_license_no, pan, gstin, bank_name, bank_account_no, bank_ifsc,
        default_brokerage_rate, default_brokerage_type, opening_balance, opening_balance_date
      ) VALUES (
        @name, @party_type, @contact_person, @phone, @email, @address, @city, @state,
        @mandi_name, @apmc_license_no, @pan, @gstin, @bank_name, @bank_account_no, @bank_ifsc,
        @default_brokerage_rate, @default_brokerage_type, @opening_balance, @opening_balance_date
      )
    `);

    const result = stmt.run({
      name: input.name,
      party_type: input.party_type,
      contact_person: input.contact_person || null,
      phone: input.phone || null,
      email: input.email || null,
      address: input.address || null,
      city: input.city || null,
      state: input.state || null,
      mandi_name: input.mandi_name || null,
      apmc_license_no: input.apmc_license_no || null,
      pan: input.pan || null,
      gstin: input.gstin || null,
      bank_name: input.bank_name || null,
      bank_account_no: input.bank_account_no || null,
      bank_ifsc: input.bank_ifsc || null,
      default_brokerage_rate: input.default_brokerage_rate || 0,
      default_brokerage_type: input.default_brokerage_type || 'PER_QTL',
      opening_balance: input.opening_balance || 0,
      opening_balance_date: input.opening_balance_date || null
    });

    return this.findById(Number(result.lastInsertRowid))!;
  }

  /**
   * Update party details
   */
  static update(id: number, input: Partial<CreatePartyInput>): Party | undefined {
    const fields: string[] = [];
    const values: any = { id };

    for (const [key, val] of Object.entries(input)) {
      if (val !== undefined) {
        fields.push(`${key} = @${key}`);
        values[key] = val;
      }
    }

    if (fields.length === 0) return this.findById(id);

    const sql = `UPDATE parties SET ${fields.join(', ')} WHERE id = @id`;
    db.prepare(sql).run(values);
    return this.findById(id);
  }

  /**
   * Delete party (if no transactions)
   */
  static delete(id: number): boolean {
    const hasTransactions = db.prepare(
      'SELECT COUNT(*) as count FROM voucher_lines WHERE party_id = ?'
    ).get(id) as { count: number };

    if (hasTransactions.count > 0) {
      throw new Error('Cannot delete party with existing financial transactions.');
    }

    const res = db.prepare('DELETE FROM parties WHERE id = ?').run(id);
    return res.changes > 0;
  }
}
