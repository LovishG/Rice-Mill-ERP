import { Router } from 'express';
import { AccountsService } from './accounts.service.js';
export const accountsRouter = Router();
// GET /api/accounts
accountsRouter.get('/', (req, res) => {
    try {
        const type = req.query.type;
        const accounts = AccountsService.getAllAccounts(type);
        res.json({ success: true, data: accounts });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
// GET /api/accounts/:id
accountsRouter.get('/:id', (req, res) => {
    try {
        const id = Number(req.params.id);
        const account = AccountsService.getAccountById(id);
        res.json({ success: true, data: account });
    }
    catch (err) {
        res.status(404).json({ success: false, message: err.message });
    }
});
// POST /api/accounts
accountsRouter.post('/', (req, res) => {
    try {
        const account = AccountsService.createAccount(req.body);
        res.status(201).json({ success: true, data: account });
    }
    catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});
