import { Router, Request, Response } from 'express';
import { ReportsService } from './reports.service.js';

export const reportsRouter = Router();

// GET /api/reports/party-ledger/:partyId
reportsRouter.get('/party-ledger/:partyId', (req: Request, res: Response) => {
  try {
    const partyId = Number(req.params.partyId);
    const fromDate = req.query.fromDate as string | undefined;
    const toDate = req.query.toDate as string | undefined;

    const report = ReportsService.getPartyLedger(partyId, fromDate, toDate);
    res.json({ success: true, data: report });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// GET /api/reports/cash-book
reportsRouter.get('/cash-book', (req: Request, res: Response) => {
  try {
    const dateStr = (req.query.date as string) || new Date().toISOString().slice(0, 10);
    const report = ReportsService.getDailyCashBook(dateStr);
    res.json({ success: true, data: report });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// GET /api/reports/trial-balance
reportsRouter.get('/trial-balance', (_req: Request, res: Response) => {
  try {
    const report = ReportsService.getTrialBalance();
    res.json({ success: true, data: report });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});
