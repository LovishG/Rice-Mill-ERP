import { Router } from 'express';
import { VouchersService } from './vouchers.service.js';
export const vouchersRouter = Router();
// GET /api/vouchers
vouchersRouter.get('/', (req, res) => {
    try {
        const filters = {
            type: req.query.type,
            fromDate: req.query.fromDate,
            toDate: req.query.toDate,
            limit: req.query.limit ? Number(req.query.limit) : undefined
        };
        const vouchers = VouchersService.getAllVouchers(filters);
        res.json({ success: true, data: vouchers });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
// GET /api/vouchers/:id
vouchersRouter.get('/:id', (req, res) => {
    try {
        const id = Number(req.params.id);
        const voucher = VouchersService.getVoucherById(id);
        res.json({ success: true, data: voucher });
    }
    catch (err) {
        res.status(404).json({ success: false, message: err.message });
    }
});
// POST /api/vouchers
vouchersRouter.post('/', (req, res) => {
    try {
        const voucher = VouchersService.createVoucher(req.body);
        res.status(201).json({ success: true, data: voucher });
    }
    catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});
