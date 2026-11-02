# 🌾 Rice Mill ERP (Commercial & CMR Operations)

A specialized enterprise resource planning system built specifically for modern rice milling operations handling **Raw, Parboiled, Steamed, Basmati**, and **Government CMR (Custom Milling of Rice)** workflows.

---

## 🛠️ Technology Stack
* **Frontend:** Angular `^22` with **NG-ZORRO `22.1.2`** (Ant Design for Angular)
* **Backend:** Node.js (TypeScript) + Express
* **Database:** **`better-sqlite3`** (High-performance embedded SQLite with WAL mode & strict ACID compliance)
* **Language:** 100% Strict TypeScript (No plain JS)
* **Deployment Mode:** Single-server local LAN web application (Multi-PC accessible) + ready for packaging as a Desktop `.exe`.

---

## 🏗️ Project Architecture (Decoupled & Modular)

```
Rice Mill ERP/
├── Start-Rice-Mill-ERP.bat       # One-click Windows desktop launcher
├── package.json                  # Root scripts
│
├── backend/                      # Node.js + TypeScript + better-sqlite3
│   ├── src/
│   │   ├── config.ts             # App configuration
│   │   ├── database/
│   │   │   ├── db.ts             # better-sqlite3 connection with WAL mode & foreign keys
│   │   │   ├── schema.sql        # Clean SQL DDL (Accounts, Parties, Vouchers, Mandi Bills)
│   │   │   └── seed.ts           # Pre-seeded Rice Mill Chart of Accounts & sample Mandis
│   │   ├── modules/
│   │   │   ├── parties/          # Mandi agents, brokers, buyers, transporters (types/repo/service/ctrl)
│   │   │   ├── accounts/         # Chart of accounts (Asset, Liability, Equity, Revenue, Expense)
│   │   │   ├── vouchers/         # Double-entry voucher engine with atomic balance verification
│   │   │   ├── mandi-purchases/  # Mandi bills, moisture cut formulas, cess & arhat breakdown
│   │   │   └── reports/          # Party Ledger (Khata), Daily Cash Book, Trial Balance
│   │   └── server.ts             # Server entry point & Angular static files host
│   ├── tsconfig.json
│   └── package.json
│
└── frontend/                     # Angular 22 + NG-ZORRO 22.1.2
    ├── src/app/
    │   ├── core/
    │   │   ├── models/           # Strict TypeScript accounting models
    │   │   └── services/         # ApiService (HttpClient)
    │   ├── pages/
    │   │   ├── mandi-purchases/  # Inward Mandi Bikri Parchi, live moisture cut & cess calculator
    │   │   ├── parties/          # Mandi Agent & Party Khata master with live Dr/Cr balance
    │   │   ├── party-ledger/     # Printable Statement of Account with running balance
    │   │   ├── cash-book/        # Mill Counter Cash Book with daily opening & safe tally
    │   │   └── accounts/         # Chart of Accounts tree & Trial Balance checker
    │   ├── app.ts                # Sider navigation & enterprise header layout
    │   └── app.routes.ts         # Angular lazy routes
    ├── angular.json
    └── package.json
```

---

## 💰 Specialized Accounting Engine Features

### 1. Mandi Procurement Accounting (No Direct Farmer Payments)
* **Bikri Parchi Inward:** Inward bills are issued against the **Mandi Commission Agent (Arhatiya / Mandi Firm)**.
* **Moisture Refraction Formula:** Benchmark moisture at $14\%$. Excess moisture automatically calculates weight cut ($Qtl$).
* **Mandi Levies Breakdown:**
  * Base Paddy Cost ($Qtl \times Rate$)
  * Mandi Cess / Market Fee ($1.5\% - 2.0\%$)
  * Arhat / Commission ($2.0\% - 2.5\%$)
  * RDF (Rural Development Fund) ($1.0\%$)
  * Mandi Yard Labor / Dami charges
* **Automatic Balanced Voucher:** Saving a Mandi bill atomically creates a double-entry voucher debited to Paddy Purchase & Mandi Expense accounts and credited to the Mandi Agent's ledger.

### 2. Party & Mandi Khata Master
* Categorized by **Mandi Arhatiyas, Rice Buyers, Brokers, Transporters, Hamali Labor Gangs, and Govt CMR Agencies**.
* Live ledger balances:
  * 🔴 **Credit (Cr):** Net Payable to the party.
  * 🟢 **Debit (Dr):** Net Receivable or pre-season advance given.

### 3. Printable Party Ledger Statement
* Complete Statement of Account filtered by date range.
* Running balance column with Dr/Cr notation.
* One-click print styling ready for physical reconciliation with Mandi agents and brokers.

### 4. Mill Counter Daily Cash Book
* Handles daily cash flow: truck driver diesel advances, petty yard expenses, and spot receipts.
* Daily opening cash, daytime transactions, and end-of-day physical safe balance tally.

### 5. Chart of Accounts & Trial Balance
* Pre-configured with rice-mill-specific accounts (Paddy Stock, CMR Custody, Rice Bran by-products, Husk, Hamali labor, Boiler fuel, Rubber roll consumables).
* Real-time Trial Balance verifying that Total Debits equal Total Credits down to the paisa.

---

## 🚀 How to Run the ERP

### Option 1: Quick Launch (Double Click)
Double-click `Start-Rice-Mill-ERP.bat`. It will start the local engine and open your browser to `http://localhost:3000`.

### Option 2: Command Line
```powershell
# Run the integrated application (serves both API and UI)
npm start

# Open http://localhost:3000 in any browser
```

### Option 3: Development Mode (Hot Reloading)
```powershell
# Terminal 1: Backend in watch mode
npm run dev:backend

# Terminal 2: Angular frontend dev server
npm run dev:frontend
```

---

## 🖥️ LAN Access Across the Mill Cabins
Because the backend serves the built Angular SPA directly:
1. Find the local IP address of the main PC (e.g. `192.168.1.100`).
2. Any computer connected to the mill's local Wi-Fi or LAN cable (Weighbridge PC, Lab QC laptop, Owner's cabin) can open:
   `http://192.168.1.100:3000`
3. All workstations share the exact same `better-sqlite3` database in real time.
