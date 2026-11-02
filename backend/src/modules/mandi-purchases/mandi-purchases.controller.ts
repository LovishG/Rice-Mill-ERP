import { Router, Request, Response } from 'express';
import { MandiPurchasesService } from './mandi-purchases.service.js';

export const mandiPurchasesRouter = Router();

// GET /api/mandi-purchases
mandiPurchasesRouter.get('/', (req: Request, res: Response) => {
  try {
    const purchases = MandiPurchasesService.getAllPurchases();
    res.json({ success: true, data: purchases });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/mandi-purchases/:id
mandiPurchasesRouter.get('/:id', (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const purchase = MandiPurchasesService.getPurchaseById(id);
    res.json({ success: true, data: purchase });
  } catch (err: any) {
    res.status(404).json({ success: false, message: err.message });
  }
});

// POST /api/mandi-purchases
mandiPurchasesRouter.post('/', (req: Request, res: Response) => {
  try {
    const purchase = MandiPurchasesService.createPurchase(req.body);
    res.status(201).json({ success: true, data: purchase });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});
