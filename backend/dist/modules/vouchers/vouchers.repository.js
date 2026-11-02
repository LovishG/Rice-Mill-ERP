import { db } from '../../database/db.js';
export class VouchersRepository {
    /**
     * Generates a unique sequential voucher number like PAY-2026-0001
     */
    static generateVoucherNo(type, dateStr) {
        const prefixMap = {
            PAYMENT: 'PAY',
            RECEIPT: 'RCP',
            JOURNAL: 'JV',
            CONTRA: 'CTR',
            MANDI_PURCHASE: 'MND',
            SALES_INVOICE: 'INV'
        };
        const prefix = prefixMap[type] || 'VCH';
        const year = dateStr.slice(0, 4) || new Date().getFullYear().toString();
        const countRow = db.prepare(`
      SELECT COUNT(*) as count 
      FROM vouchers 
      WHERE voucher_type = ? AND voucher_date LIKE ?
    `).get(type, `${year}%`);
        const seq = (countRow.count + 1).toString().padStart(4, '0');
        return `${prefix}-${year}-${seq}`;
    }
    /**
     * Find voucher by ID with all its lines
     */
    static findById(id) {
        const voucher = db.prepare('SELECT * FROM vouchers WHERE id = ?').get(id);
        if (!voucher)
            return undefined;
        const lines = db.prepare(`
      SELECT 
        vl.*,
        a.name as account_name,
        a.code as account_code,
        p.name as party_name
      FROM voucher_lines vl
      JOIN accounts a ON vl.account_id = a.id
      LEFT JOIN parties p ON vl.party_id = p.id
      WHERE vl.voucher_id = ?
      ORDER BY vl.id ASC
    `).all(id);
        return { ...voucher, lines };
    }
    /**
     * List vouchers with optional filters
     */
    static findAll(options) {
        let sql = 'SELECT * FROM vouchers WHERE 1=1';
        const params = [];
        if (options?.type) {
            sql += ' AND voucher_type = ?';
            params.push(options.type);
        }
        if (options?.fromDate) {
            sql += ' AND voucher_date >= ?';
            params.push(options.fromDate);
        }
        if (options?.toDate) {
            sql += ' AND voucher_date <= ?';
            params.push(options.toDate);
        }
        sql += ' ORDER BY voucher_date DESC, id DESC LIMIT ?';
        params.push(options?.limit || 100);
        return db.prepare(sql).all(...params);
    }
    /**
     * Create a double-entry voucher atomically
     */
    static create(input) {
        // 1. Calculate and verify debit = credit
        let totalDebit = 0;
        let totalCredit = 0;
        for (const line of input.lines) {
            totalDebit += Number(line.debit) || 0;
            totalCredit += Number(line.credit) || 0;
        }
        const diff = Math.abs(totalDebit - totalCredit);
        if (diff > 0.01) {
            throw new Error(`Double-entry balance mismatch! Total Debit: ₹${totalDebit.toFixed(2)}, Total Credit: ₹${totalCredit.toFixed(2)}`);
        }
        const voucherNo = this.generateVoucherNo(input.voucher_type, input.voucher_date);
        const insertVoucher = db.prepare(`
      INSERT INTO vouchers (voucher_no, voucher_type, voucher_date, reference_no, narration, total_amount)
      VALUES (@voucher_no, @voucher_type, @voucher_date, @reference_no, @narration, @total_amount)
    `);
        const insertLine = db.prepare(`
      INSERT INTO voucher_lines (voucher_id, account_id, party_id, debit, credit, line_narration)
      VALUES (@voucher_id, @account_id, @party_id, @debit, @credit, @line_narration)
    `);
        // Execute in an atomic SQLite transaction
        const execute = db.transaction(() => {
            const vResult = insertVoucher.run({
                voucher_no: voucherNo,
                voucher_type: input.voucher_type,
                voucher_date: input.voucher_date,
                reference_no: input.reference_no || null,
                narration: input.narration || null,
                total_amount: totalDebit
            });
            const voucherId = Number(vResult.lastInsertRowid);
            for (const line of input.lines) {
                insertLine.run({
                    voucher_id: voucherId,
                    account_id: line.account_id,
                    party_id: line.party_id || null,
                    debit: line.debit || 0,
                    credit: line.credit || 0,
                    line_narration: line.line_narration || null
                });
            }
            return voucherId;
        });
        const newId = execute();
        return this.findById(newId);
    }
}
