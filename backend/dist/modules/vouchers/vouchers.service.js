import { VouchersRepository } from './vouchers.repository.js';
export class VouchersService {
    static getAllVouchers(filters) {
        return VouchersRepository.findAll(filters);
    }
    static getVoucherById(id) {
        const vch = VouchersRepository.findById(id);
        if (!vch)
            throw new Error(`Voucher with ID ${id} not found.`);
        return vch;
    }
    static createVoucher(input) {
        if (!input.voucher_type || !input.voucher_date) {
            throw new Error('Voucher type and voucher date are required.');
        }
        if (!input.lines || input.lines.length < 2) {
            throw new Error('A voucher must have at least two entries (one debit and one credit).');
        }
        return VouchersRepository.create(input);
    }
}
