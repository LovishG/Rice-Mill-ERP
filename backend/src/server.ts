import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { initDatabase } from './database/db.js';
import { seedDefaultAccounts, seedSampleParties } from './database/seed.js';

import { partiesRouter } from './modules/parties/parties.controller.js';
import { accountsRouter } from './modules/accounts/accounts.controller.js';
import { vouchersRouter } from './modules/vouchers/vouchers.controller.js';
import { mandiPurchasesRouter } from './modules/mandi-purchases/mandi-purchases.controller.js';
import { reportsRouter } from './modules/reports/reports.controller.js';

const app = express();

// Middlewares
app.use(cors({ origin: config.corsOrigins }));
app.use(express.json());

// API Routes
app.use('/api/parties', partiesRouter);
app.use('/api/accounts', accountsRouter);
app.use('/api/vouchers', vouchersRouter);
app.use('/api/mandi-purchases', mandiPurchasesRouter);
app.use('/api/reports', reportsRouter);

// Healthcheck
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    service: 'Rice Mill ERP Backend API',
    timestamp: new Date().toISOString()
  });
});

// Initialize database schema and default seeds
try {
  console.log('Initializing Rice Mill SQLite Database...');
  initDatabase();
  seedDefaultAccounts();
  seedSampleParties();
  console.log('Database schema and seeds are up to date.');
} catch (err) {
  console.error('Database initialization error:', err);
}

// Start Server on dedicated API port (3000)
app.listen(config.port, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🌾 Rice Mill ERP Backend API (TypeScript)`);
  console.log(`🚀 API Server running on: http://127.0.0.1:${config.port}`);
  console.log(`💾 SQLite Database: ${config.dbPath}`);
  console.log(`=======================================================`);
});
