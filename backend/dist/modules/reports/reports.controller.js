import { Router } from 'express';
import { ReportsService } from './reports.service.js';
export const reportsRouter = Router();
// GET /api/reports/party-ledger/:partyId
reportsRouter.get('/party-ledger/:partyId', (req, res) => {
    try {
        const partyId = Number(req.params.partyId);
        const fromDate = req.query.fromDate;
        const toDate = req.query.toDate;
        const report = ReportsService.getPartyLedger(partyId, fromDate, toDate);
        res.json({ success: true, data: report });
    }
    catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});
// GET /api/reports/cash-book
reportsRouter.get('/cash-book', (req, res) => {
    try {
        const dateStr = req.query.date || new Date().toISOString().slice(0, 10);
        const report = ReportsService.getDailyCashBook(dateStr);
        res.json({ success: true, data: report });
    }
    catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});
// GET /api/reports/trial-balance
reportsRouter.get('/trial-balance', (_req, res) => {
    try {
        const report = ReportsService.getTrialBalance();
        res.json({ success: true, data: report });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
