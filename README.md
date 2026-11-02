# 🌾 Rice Mill ERP (Commercial & CMR Operations)

A specialized enterprise resource planning system built specifically for modern rice milling operations handling **Raw, Parboiled, Steamed, Basmati**, and **Government CMR (Custom Milling of Rice)** workflows.

---

## 🛠️ Technology Stack
* **Frontend (Port 4200):** Angular `^22` with **NG-ZORRO `22.1.2`** (Native Less theme)
* **Backend API (Port 3000):** Node.js (TypeScript) + Express
* **Database:** **`better-sqlite3`** (Embedded SQLite with WAL mode & strict ACID compliance)
* **Language:** 100% Strict TypeScript (No plain JS)

---

## 🏗️ Project Architecture (Decoupled & Modular)

```
Rice Mill ERP/
├── package.json                  # Root scripts (Starts both backend & frontend)
│
├── backend/                      # Dedicated Backend API (Port 3000)
│   ├── src/
│   │   ├── config.ts             # Port & database configuration
│   │   ├── database/
│   │   │   ├── db.ts             # better-sqlite3 with WAL mode & foreign keys
│   │   │   ├── schema.sql        # Clean SQL DDL (Accounts, Parties, Vouchers, Mandi Bills)
│   │   │   └── seed.ts           # Pre-seeded Rice Mill Chart of Accounts & sample Mandis
│   │   ├── modules/
│   │   │   ├── parties/          # Mandi agents, brokers, buyers, transporters (types/repo/service/ctrl)
│   │   │   ├── accounts/         # Chart of accounts (Asset, Liability, Equity, Revenue, Expense)
│   │   │   ├── vouchers/         # Double-entry voucher engine with atomic balance verification
│   │   │   ├── mandi-purchases/  # Mandi bills, moisture cut formulas, cess & arhat breakdown
│   │   │   └── reports/          # Party Ledger (Khata), Daily Cash Book, Trial Balance
│   │   └── server.ts             # Pure REST API server (Port 3000)
│   ├── tsconfig.json
│   └── package.json
│
└── frontend/                     # Dedicated Angular 22 SPA (Port 4200)
    ├── proxy.conf.json           # Dev proxy forwarding /api -> http://127.0.0.1:3000
    ├── src/
    │   ├── styles.less           # Native Less styling & Rice Mill palette overrides
    │   └── app/
    │       ├── core/
    │       │   ├── models/       # TypeScript accounting models
    │       │   └── services/     # ApiService
    │       ├── pages/
    │       │   ├── mandi-purchases/  # Mandi Bikri Parchi, live moisture cut & cess calculator
    │       │   ├── parties/          # Mandi Agent & Party Khata master with live Dr/Cr balance
    │       │   ├── party-ledger/     # Printable Statement of Account with running balance
    │       │   ├── cash-book/        # Mill Counter Cash Book with daily opening & safe tally
    │       │   └── accounts/         # Chart of Accounts tree & Trial Balance checker
    │       ├── app.ts            # Sider navigation & enterprise header layout
    │       └── app.routes.ts     # Angular lazy routes
    ├── angular.json
    └── package.json
```

---

## 🚀 Running the ERP

To start the system, simply run from the root directory:

```powershell
npm start
```

This starts both services concurrently with live reloading:
* **`[API]` Backend Server:** Running on `http://127.0.0.1:3000`
* **`[UI]` Frontend Web App:** Running on `http://localhost:4200`
