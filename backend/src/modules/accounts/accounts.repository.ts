import { db } from '../../database/db.js';
import { Account, CreateAccountInput, AccountType } from './accounts.types.js';

export class AccountsRepository {
  /**
   * List all accounts with current debit/credit balance
   */
  static findAll(type?: AccountType): Account[] {
    let sql = `
      SELECT 
        a.*,
        COALESCE(
          CASE 
            WHEN a.type IN ('ASSET', 'EXPENSE') THEN SUM(vl.debit) - SUM(vl.credit)
            ELSE SUM(vl.credit) - SUM(vl.debit)
          END, 0
        ) AS balance
      FROM accounts a
      LEFT JOIN voucher_lines vl ON a.id = vl.account_id
    `;
    const params: any[] = [];

    if (type) {
      sql += ` WHERE a.type = ?`;
      params.push(type);
    }

    sql += ` GROUP BY a.id ORDER BY a.code ASC`;
    return db.prepare(sql).all(...params) as Account[];
  }

  /**
   * Find by code
   */
  static findByCode(code: string): Account | undefined {
    return db.prepare('SELECT * FROM accounts WHERE code = ?').get(code) as Account | undefined;
  }

  /**
   * Find by ID
   */
  static findById(id: number): Account | undefined {
    return db.prepare('SELECT * FROM accounts WHERE id = ?').get(id) as Account | undefined;
  }

  /**
   * Create account
   */
  static create(input: CreateAccountInput): Account {
    const stmt = db.prepare(`
      INSERT INTO accounts (code, name, type, parent_id)
      VALUES (@code, @name, @type, @parent_id)
    `);

    const res = stmt.run({
      code: input.code,
      name: input.name,
      type: input.type,
      parent_id: input.parent_id || null
    });

    return this.findById(Number(res.lastInsertRowid))!;
  }
}
