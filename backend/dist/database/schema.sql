-- Rice Mill ERP Core Accounting & Mandi Procurement Schema
PRAGMA foreign_keys = ON;

-- 1. Chart of Accounts
CREATE TABLE IF NOT EXISTS accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE')),
  parent_id INTEGER REFERENCES accounts(id),
  is_system INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 2. Party Master (Mandi Agents, Buyers, Brokers, Transporters, CMR Agencies)
CREATE TABLE IF NOT EXISTS parties (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  party_type TEXT NOT NULL CHECK(party_type IN (
    'MANDI_AGENT',
    'COMMERCIAL_BUYER',
    'BROKER',
    'TRANSPORTER',
    'HAMALI_CONTRACTOR',
    'CMR_AGENCY',
    'OTHER_VENDOR'
  )),
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  mandi_name TEXT,
  apmc_license_no TEXT,
  pan TEXT,
  gstin TEXT,
  bank_name TEXT,
  bank_account_no TEXT,
  bank_ifsc TEXT,
  default_brokerage_rate REAL DEFAULT 0,
  default_brokerage_type TEXT DEFAULT 'PER_QTL' CHECK(default_brokerage_type IN ('PER_QTL', 'PER_BAG', 'PERCENTAGE')),
  opening_balance REAL DEFAULT 0, -- Positive = Debit (Receivable), Negative = Credit (Payable)
  opening_balance_date TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 3. Double-Entry Vouchers Header
CREATE TABLE IF NOT EXISTS vouchers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  voucher_no TEXT UNIQUE NOT NULL,
  voucher_type TEXT NOT NULL CHECK(voucher_type IN (
    'PAYMENT',
    'RECEIPT',
    'JOURNAL',
    'CONTRA',
    'MANDI_PURCHASE',
    'SALES_INVOICE'
  )),
  voucher_date TEXT NOT NULL,
  reference_no TEXT,
  narration TEXT,
  total_amount REAL NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 4. Double-Entry Voucher Lines
CREATE TABLE IF NOT EXISTS voucher_lines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  voucher_id INTEGER NOT NULL REFERENCES vouchers(id) ON DELETE CASCADE,
  account_id INTEGER NOT NULL REFERENCES accounts(id),
  party_id INTEGER REFERENCES parties(id),
  debit REAL DEFAULT 0,
  credit REAL DEFAULT 0,
  line_narration TEXT
);

-- 5. Mandi Purchase Detailed Bills
CREATE TABLE IF NOT EXISTS mandi_purchases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  voucher_id INTEGER REFERENCES vouchers(id) ON DELETE SET NULL,
  mandi_party_id INTEGER NOT NULL REFERENCES parties(id),
  bill_no TEXT NOT NULL,
  bill_date TEXT NOT NULL,
  gate_pass_no TEXT,
  paddy_variety TEXT NOT NULL,
  total_bags INTEGER NOT NULL,
  bag_type TEXT DEFAULT 'HDPE' CHECK(bag_type IN ('JUTE', 'HDPE', 'LOOSE')),
  gross_weight_qtl REAL NOT NULL,
  tare_weight_qtl REAL NOT NULL,
  net_weight_qtl REAL NOT NULL,
  moisture_percent REAL DEFAULT 0,
  moisture_cut_qtl REAL DEFAULT 0,
  final_billable_qtl REAL NOT NULL,
  rate_per_qtl REAL NOT NULL,
  base_paddy_amount REAL NOT NULL,
  mandi_cess_percent REAL DEFAULT 0,
  mandi_cess_amount REAL DEFAULT 0,
  arhat_percent REAL DEFAULT 0,
  arhat_amount REAL DEFAULT 0,
  rdf_percent REAL DEFAULT 0,
  rdf_amount REAL DEFAULT 0,
  mandi_labor_amount REAL DEFAULT 0,
  freight_paid_by_mandi REAL DEFAULT 0,
  other_deductions_amount REAL DEFAULT 0,
  net_payable_amount REAL NOT NULL,
  status TEXT DEFAULT 'CONFIRMED' CHECK(status IN ('DRAFT', 'CONFIRMED', 'CANCELLED')),
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_voucher_lines_voucher_id ON voucher_lines(voucher_id);
CREATE INDEX IF NOT EXISTS idx_voucher_lines_account_id ON voucher_lines(account_id);
CREATE INDEX IF NOT EXISTS idx_voucher_lines_party_id ON voucher_lines(party_id);
CREATE INDEX IF NOT EXISTS idx_vouchers_date ON vouchers(voucher_date);
CREATE INDEX IF NOT EXISTS idx_mandi_purchases_party ON mandi_purchases(mandi_party_id);
