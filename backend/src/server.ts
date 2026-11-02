import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
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
    app: 'Rice Mill ERP Accounting Core',
    timestamp: new Date().toISOString()
  });
});

// Serve Angular frontend if built
const frontendDist = path.resolve(process.cwd(), '..', 'frontend', 'dist', 'frontend', 'browser');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  
  // SPA fallback middleware for Angular routing
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(frontendDist, 'index.html'));
    }
    next();
  });
}

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

// Start Server
app.listen(config.port, () => {
  console.log(`=======================================================`);
  console.log(`🌾 Rice Mill ERP Backend Service (TypeScript)`);
  console.log(`🚀 Server listening on http://localhost:${config.port}`);
  console.log(`💾 SQLite DB: ${config.dbPath}`);
  console.log(`💻 Web UI available at: http://localhost:${config.port}`);
  console.log(`=======================================================`);
});
