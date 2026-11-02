import { db } from '../../database/db.js';
export class ReportsRepository {
    /**
     * Generates detailed Party Ledger (Khata) with running balance
     */
    static getPartyLedger(partyId, fromDate, toDate) {
        const party = db.prepare('SELECT * FROM parties WHERE id = ?').get(partyId);
        if (!party)
            throw new Error(`Party with ID ${partyId} not found.`);
        // 1. Calculate opening balance before `fromDate`
        let effectiveOpeningBalance = party.opening_balance || 0;
        if (fromDate) {
            const priorRows = db.prepare(`
        SELECT COALESCE(SUM(vl.debit), 0) as prior_debit, COALESCE(SUM(vl.credit), 0) as prior_credit
        FROM voucher_lines vl
        JOIN vouchers v ON vl.voucher_id = v.id
        WHERE vl.party_id = ? AND v.voucher_date < ?
      `).get(partyId, fromDate);
            effectiveOpeningBalance += (priorRows.prior_debit - priorRows.prior_credit);
        }
        // 2. Fetch ledger entries in range
        let sql = `
      SELECT 
        v.id as voucher_id,
        v.voucher_no,
        v.voucher_type,
        v.voucher_date,
        v.reference_no,
        COALESCE(vl.line_narration, v.narration) as narration,
        a.name as account_name,
        vl.debit,
        vl.credit
      FROM voucher_lines vl
      JOIN vouchers v ON vl.voucher_id = v.id
      JOIN accounts a ON vl.account_id = a.id
      WHERE vl.party_id = ?
    `;
        const params = [partyId];
        if (fromDate) {
            sql += ' AND v.voucher_date >= ?';
            params.push(fromDate);
        }
        if (toDate) {
            sql += ' AND v.voucher_date <= ?';
            params.push(toDate);
        }
        sql += ' ORDER BY v.voucher_date ASC, v.id ASC, vl.id ASC';
        const rawEntries = db.prepare(sql).all(...params);
        // 3. Compute running balance row by row
        let runningBalance = effectiveOpeningBalance;
        let totalDebit = 0;
        let totalCredit = 0;
        const entries = rawEntries.map(row => {
            totalDebit += row.debit;
            totalCredit += row.credit;
            runningBalance += (row.debit - row.credit);
            return {
                voucher_id: row.voucher_id,
                voucher_no: row.voucher_no,
                voucher_type: row.voucher_type,
                voucher_date: row.voucher_date,
                reference_no: row.reference_no,
                narration: row.narration,
                account_name: row.account_name,
                debit: row.debit,
                credit: row.credit,
                running_balance: Number(runningBalance.toFixed(2))
            };
        });
        return {
            party_id: party.id,
            party_name: party.name,
            party_type: party.party_type,
            mandi_name: party.mandi_name,
            from_date: fromDate,
            to_date: toDate,
            opening_balance: Number(effectiveOpeningBalance.toFixed(2)),
            entries,
            total_debit: Number(totalDebit.toFixed(2)),
            total_credit: Number(totalCredit.toFixed(2)),
            closing_balance: Number(runningBalance.toFixed(2))
        };
    }
    /**
     * Generates Daily Cash Book (Mill Counter) for a given date
     */
    static getDailyCashBook(dateStr) {
        const cashAccount = db.prepare("SELECT * FROM accounts WHERE code = '1001'").get();
        if (!cashAccount)
            throw new Error("Cash account ('1001') not found.");
        // Opening cash balance prior to date
        const priorRow = db.prepare(`
      SELECT COALESCE(SUM(vl.debit), 0) - COALESCE(SUM(vl.credit), 0) as prior_balance
      FROM voucher_lines vl
      JOIN vouchers v ON vl.voucher_id = v.id
      WHERE vl.account_id = ? AND v.voucher_date < ?
    `).get(cashAccount.id, dateStr);
        const openingBalance = Number((priorRow.prior_balance || 0).toFixed(2));
        // Entries for the day
        const rows = db.prepare(`
      SELECT 
        v.id as voucher_id,
        v.voucher_no,
        v.voucher_type,
        v.voucher_date,
        v.reference_no,
        COALESCE(vl.line_narration, v.narration) as narration,
        p.name as party_name,
        vl.debit as cash_in,
        vl.credit as cash_out
      FROM voucher_lines vl
      JOIN vouchers v ON vl.voucher_id = v.id
      LEFT JOIN parties p ON vl.party_id = p.id
      WHERE vl.account_id = ? AND v.voucher_date = ?
      ORDER BY v.id ASC, vl.id ASC
    `).all(cashAccount.id, dateStr);
        let runningBalance = openingBalance;
        let totalCashIn = 0;
        let totalCashOut = 0;
        const entries = rows.map(r => {
            totalCashIn += r.cash_in;
            totalCashOut += r.cash_out;
            runningBalance += (r.cash_in - r.cash_out);
            return {
                voucher_id: r.voucher_id,
                voucher_no: r.voucher_no,
                voucher_type: r.voucher_type,
                voucher_date: r.voucher_date,
                reference_no: r.reference_no,
                narration: r.narration,
                party_name: r.party_name,
                cash_in: r.cash_in,
                cash_out: r.cash_out,
                running_balance: Number(runningBalance.toFixed(2))
            };
        });
        return {
            date: dateStr,
            opening_balance: openingBalance,
            entries,
            total_cash_in: Number(totalCashIn.toFixed(2)),
            total_cash_out: Number(totalCashOut.toFixed(2)),
            closing_balance: Number(runningBalance.toFixed(2))
        };
    }
    /**
     * Trial Balance for all accounts
     */
    static getTrialBalance() {
        const rows = db.prepare(`
      SELECT 
        a.id as account_id,
        a.code,
        a.name,
        a.type,
        COALESCE(SUM(vl.debit), 0) as debit,
        COALESCE(SUM(vl.credit), 0) as credit
      FROM accounts a
      LEFT JOIN voucher_lines vl ON a.id = vl.account_id
      GROUP BY a.id
      ORDER BY a.code ASC
    `).all();
        let totalDebit = 0;
        let totalCredit = 0;
        const accounts = rows.map(r => {
            totalDebit += r.debit;
            totalCredit += r.credit;
            return {
                account_id: r.account_id,
                code: r.code,
                name: r.name,
                type: r.type,
                debit: Number(r.debit.toFixed(2)),
                credit: Number(r.credit.toFixed(2))
            };
        });
        return {
            accounts,
            total_debit: Number(totalDebit.toFixed(2)),
            total_credit: Number(totalCredit.toFixed(2))
        };
    }
}
