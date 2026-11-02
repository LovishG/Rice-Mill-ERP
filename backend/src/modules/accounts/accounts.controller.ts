import { Router, Request, Response } from 'express';
import { AccountsService } from './accounts.service.js';
import { AccountType } from './accounts.types.js';

export const accountsRouter = Router();

// GET /api/accounts
accountsRouter.get('/', (req: Request, res: Response) => {
  try {
    const type = req.query.type as AccountType | undefined;
    const accounts = AccountsService.getAllAccounts(type);
    res.json({ success: true, data: accounts });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/accounts/:id
accountsRouter.get('/:id', (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const account = AccountsService.getAccountById(id);
    res.json({ success: true, data: account });
  } catch (err: any) {
    res.status(404).json({ success: false, message: err.message });
  }
});

// POST /api/accounts
accountsRouter.post('/', (req: Request, res: Response) => {
  try {
    const account = AccountsService.createAccount(req.body);
    res.status(201).json({ success: true, data: account });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});
