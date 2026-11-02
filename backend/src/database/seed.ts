import { db } from './db.js';

export function seedDefaultAccounts(): void {
  const countRow = db.prepare('SELECT COUNT(*) as count FROM accounts').get() as { count: number };
  if (countRow.count > 0) {
    return; // Already seeded
  }

  const defaultAccounts = [
    // Assets (1xxx)
    { code: '1001', name: 'Cash in Hand (Mill Counter)', type: 'ASSET', is_system: 1 },
    { code: '1002', name: 'Current Bank Account (Primary)', type: 'ASSET', is_system: 1 },
    { code: '1101', name: 'Paddy Stock (Raw Material)', type: 'ASSET', is_system: 1 },
    { code: '1102', name: 'Finished Rice Stock', type: 'ASSET', is_system: 1 },
    { code: '1103', name: 'By-Products Stock (Bran/Husk/Broken)', type: 'ASSET', is_system: 1 },
    { code: '1104', name: 'Bardana / Gunny Bags Stock', type: 'ASSET', is_system: 1 },
    { code: '1201', name: 'Mandi Pre-Season Advances', type: 'ASSET', is_system: 1 },
    { code: '1202', name: 'Sundry Debtors (Rice Buyers)', type: 'ASSET', is_system: 1 },

    // Liabilities (2xxx)
    { code: '2001', name: 'Sundry Creditors (Mandi Arhatiyas)', type: 'LIABILITY', is_system: 1 },
    { code: '2002', name: 'Brokerage (Dalali) Payable', type: 'LIABILITY', is_system: 1 },
    { code: '2003', name: 'Transporter Freight Payable', type: 'LIABILITY', is_system: 1 },
    { code: '2004', name: 'Hamali Labor Payable', type: 'LIABILITY', is_system: 1 },
    { code: '2005', name: 'Mandi Samiti / APMC Cess Payable', type: 'LIABILITY', is_system: 1 },
    { code: '2006', name: 'CMR Security Deposit / Bank Guarantee', type: 'LIABILITY', is_system: 1 },

    // Equity (3xxx)
    { code: '3001', name: 'Partners / Proprietor Capital', type: 'EQUITY', is_system: 1 },
    { code: '3002', name: 'Retained Earnings / Reserves', type: 'EQUITY', is_system: 1 },

    // Revenue (4xxx)
    { code: '4001', name: 'Commercial Rice Sales', type: 'REVENUE', is_system: 1 },
    { code: '4002', name: 'By-Product Sales - Rice Bran', type: 'REVENUE', is_system: 1 },
    { code: '4003', name: 'By-Product Sales - Broken Rice', type: 'REVENUE', is_system: 1 },
    { code: '4004', name: 'By-Product Sales - Paddy Husk', type: 'REVENUE', is_system: 1 },
    { code: '4005', name: 'CMR Milling Charges (Govt Reimbursement)', type: 'REVENUE', is_system: 1 },

    // Expenses (5xxx)
    { code: '5001', name: 'Paddy Purchase Account', type: 'EXPENSE', is_system: 1 },
    { code: '5002', name: 'Mandi Shulk / Market Fee Expense', type: 'EXPENSE', is_system: 1 },
    { code: '5003', name: 'Mandi Arhat / Commission Expense', type: 'EXPENSE', is_system: 1 },
    { code: '5004', name: 'Mandi RDF / Rural Development Fund', type: 'EXPENSE', is_system: 1 },
    { code: '5005', name: 'Mandi Labor & Loading Expense', type: 'EXPENSE', is_system: 1 },
    { code: '5010', name: 'Inward Freight & Transportation', type: 'EXPENSE', is_system: 1 },
    { code: '5011', name: 'Outward Dispatch Freight', type: 'EXPENSE', is_system: 1 },
    { code: '5020', name: 'Hamali (Mill Yard Loading/Unloading)', type: 'EXPENSE', is_system: 1 },
    { code: '5021', name: 'Boiler Fuel Expense', type: 'EXPENSE', is_system: 1 },
    { code: '5022', name: 'Electricity & Plant Power', type: 'EXPENSE', is_system: 1 },
    { code: '5023', name: 'Mill Consumables & Rubber Rolls', type: 'EXPENSE', is_system: 1 },
    { code: '5030', name: 'Brokerage (Dalali) Expense', type: 'EXPENSE', is_system: 1 }
  ];

  const insertStmt = db.prepare(`
    INSERT INTO accounts (code, name, type, is_system)
    VALUES (@code, @name, @type, @is_system)
  `);

  const runSeed = db.transaction(() => {
    for (const acc of defaultAccounts) {
      insertStmt.run(acc);
    }
  });

  runSeed();
  console.log(`Seeded ${defaultAccounts.length} core Rice Mill accounts.`);
}

export function seedSampleParties(): void {
  const partyCount = db.prepare('SELECT COUNT(*) as count FROM parties').get() as { count: number };
  if (partyCount.count > 0) {
    return;
  }

  const sampleParties = [
    {
      name: 'M/s Aggarwal Trading Co. (Karnal Mandi)',
      party_type: 'MANDI_AGENT',
      contact_person: 'Ramesh Aggarwal',
      phone: '9876543210',
      city: 'Karnal',
      state: 'Haryana',
      mandi_name: 'Karnal Grain Mandi',
      apmc_license_no: 'APMC/KNL/2024/88',
      pan: 'ABCDE1234F',
      gstin: '06ABCDE1234F1Z5',
      bank_name: 'HDFC Bank',
      bank_account_no: '50200012345678',
      bank_ifsc: 'HDFC0001234',
      opening_balance: -250000 // Rs 2,50,000 payable
    },
    {
      name: 'Kisan Arhat Kendra (Tarn Taran Mandi)',
      party_type: 'MANDI_AGENT',
      contact_person: 'Gurpreet Singh',
      phone: '9812345678',
      city: 'Tarn Taran',
      state: 'Punjab',
      mandi_name: 'Tarn Taran Mandi',
      apmc_license_no: 'APMC/TT/542',
      pan: 'BCDEF2345G',
      bank_name: 'Punjab National Bank',
      bank_account_no: '01234567890123',
      bank_ifsc: 'PUNB0012345',
      opening_balance: 100000 // Rs 1,00,000 advance given
    },
    {
      name: 'Shree Krishna Rice Brokers',
      party_type: 'BROKER',
      contact_person: 'Vinod Sharma',
      phone: '9416012345',
      city: 'Delhi',
      state: 'Delhi',
      default_brokerage_rate: 2.0, // Rs 2 per bag or quintal
      default_brokerage_type: 'PER_QTL',
      opening_balance: 0
    },
    {
      name: 'Haryana Road Carrier',
      party_type: 'TRANSPORTER',
      contact_person: 'Baljit Singh',
      phone: '9872012345',
      city: 'Ambala',
      state: 'Haryana',
      opening_balance: -45000
    },
    {
      name: 'Radhe Shyam & Sons (Rice Wholesaler)',
      party_type: 'COMMERCIAL_BUYER',
      contact_person: 'Radhe Shyam',
      phone: '9988776655',
      city: 'Ahmedabad',
      state: 'Gujarat',
      gstin: '24AAACR1234M1Z2',
      opening_balance: 650000 // Rs 6,50,000 receivable
    }
  ];

  const insertParty = db.prepare(`
    INSERT INTO parties (
      name, party_type, contact_person, phone, city, state, mandi_name,
      apmc_license_no, pan, gstin, bank_name, bank_account_no, bank_ifsc,
      default_brokerage_rate, default_brokerage_type, opening_balance
    ) VALUES (
      @name, @party_type, @contact_person, @phone, @city, @state, @mandi_name,
      @apmc_license_no, @pan, @gstin, @bank_name, @bank_account_no, @bank_ifsc,
      @default_brokerage_rate, @default_brokerage_type, @opening_balance
    )
  `);

  const runSeedParties = db.transaction(() => {
    for (const p of sampleParties) {
      insertParty.run({
        name: p.name,
        party_type: p.party_type,
        contact_person: p.contact_person || null,
        phone: p.phone || null,
        city: p.city || null,
        state: p.state || null,
        mandi_name: p.mandi_name || null,
        apmc_license_no: p.apmc_license_no || null,
        pan: p.pan || null,
        gstin: p.gstin || null,
        bank_name: p.bank_name || null,
        bank_account_no: p.bank_account_no || null,
        bank_ifsc: p.bank_ifsc || null,
        default_brokerage_rate: p.default_brokerage_rate || 0,
        default_brokerage_type: p.default_brokerage_type || 'PER_QTL',
        opening_balance: p.opening_balance || 0
      });
    }
  });

  runSeedParties();
  console.log(`Seeded ${sampleParties.length} sample rice mill parties.`);
}
