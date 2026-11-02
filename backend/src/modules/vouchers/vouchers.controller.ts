import { Router, Request, Response } from 'express';
import { VouchersService } from './vouchers.service.js';
import { VoucherType } from './vouchers.types.js';

export const vouchersRouter = Router();

// GET /api/vouchers
vouchersRouter.get('/', (req: Request, res: Response) => {
  try {
    const filters = {
      type: req.query.type as VoucherType | undefined,
      fromDate: req.query.fromDate as string | undefined,
      toDate: req.query.toDate as string | undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined
    };
    const vouchers = VouchersService.getAllVouchers(filters);
    res.json({ success: true, data: vouchers });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/vouchers/:id
vouchersRouter.get('/:id', (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const voucher = VouchersService.getVoucherById(id);
    res.json({ success: true, data: voucher });
  } catch (err: any) {
    res.status(404).json({ success: false, message: err.message });
  }
});

// POST /api/vouchers
vouchersRouter.post('/', (req: Request, res: Response) => {
  try {
    const voucher = VouchersService.createVoucher(req.body);
    res.status(201).json({ success: true, data: voucher });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});
