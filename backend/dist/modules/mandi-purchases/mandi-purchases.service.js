import { db } from '../../database/db.js';
import { MandiPurchasesRepository } from './mandi-purchases.repository.js';
import { VouchersRepository } from '../vouchers/vouchers.repository.js';
import { AccountsRepository } from '../accounts/accounts.repository.js';
export class MandiPurchasesService {
    static getAllPurchases() {
        return MandiPurchasesRepository.findAll();
    }
    static getPurchaseById(id) {
        const purchase = MandiPurchasesRepository.findById(id);
        if (!purchase)
            throw new Error(`Mandi purchase bill with ID ${id} not found.`);
        return purchase;
    }
    static createPurchase(input) {
        const netWeight = Number((input.gross_weight_qtl - input.tare_weight_qtl).toFixed(2));
        if (netWeight <= 0) {
            throw new Error('Net weight must be greater than zero.');
        }
        // Standard Rice Mill Refraction Formula: Moisture benchmark is 14%
        const moisture = input.moisture_percent || 0;
        let moistureCutQtl = 0;
        if (moisture > 14) {
            const excessMoisturePercent = moisture - 14;
            moistureCutQtl = Number((netWeight * (excessMoisturePercent / 100)).toFixed(2));
        }
        const finalBillableQtl = Number((netWeight - moistureCutQtl).toFixed(2));
        const basePaddyAmount = Number((finalBillableQtl * input.rate_per_qtl).toFixed(2));
        const cessPercent = input.mandi_cess_percent || 0;
        const mandiCessAmount = Number((basePaddyAmount * (cessPercent / 100)).toFixed(2));
        const arhatPercent = input.arhat_percent || 0;
        const arhatAmount = Number((basePaddyAmount * (arhatPercent / 100)).toFixed(2));
        const rdfPercent = input.rdf_percent || 0;
        const rdfAmount = Number((basePaddyAmount * (rdfPercent / 100)).toFixed(2));
        const mandiLaborAmount = Number(input.mandi_labor_amount || 0);
        const freightPaidByMandi = Number(input.freight_paid_by_mandi || 0);
        const otherDeductions = Number(input.other_deductions_amount || 0);
        const netPayable = Number((basePaddyAmount +
            mandiCessAmount +
            arhatAmount +
            rdfAmount +
            mandiLaborAmount -
            freightPaidByMandi -
            otherDeductions).toFixed(2));
        // Lookup System Accounts
        const accPaddy = AccountsRepository.findByCode('5001'); // Paddy Purchase
        const accCess = AccountsRepository.findByCode('5002'); // Mandi Cess
        const accArhat = AccountsRepository.findByCode('5003'); // Arhat Exp
        const accRdf = AccountsRepository.findByCode('5004'); // RDF Exp
        const accLabor = AccountsRepository.findByCode('5005'); // Labor Exp
        const accCreditor = AccountsRepository.findByCode('2001'); // Sundry Creditors (Mandi)
        // Build Voucher Lines
        const voucherLines = [
            {
                account_id: accPaddy.id,
                debit: basePaddyAmount,
                credit: 0,
                line_narration: `Paddy ${input.paddy_variety}: ${finalBillableQtl} Qtl @ ₹${input.rate_per_qtl}/Qtl (Bill #${input.bill_no})`
            }
        ];
        if (mandiCessAmount > 0) {
            voucherLines.push({
                account_id: accCess.id,
                debit: mandiCessAmount,
                credit: 0,
                line_narration: `Mandi Cess @ ${cessPercent}%`
            });
        }
        if (arhatAmount > 0) {
            voucherLines.push({
                account_id: accArhat.id,
                debit: arhatAmount,
                credit: 0,
                line_narration: `Arhat / Commission @ ${arhatPercent}%`
            });
        }
        if (rdfAmount > 0) {
            voucherLines.push({
                account_id: accRdf.id,
                debit: rdfAmount,
                credit: 0,
                line_narration: `RDF @ ${rdfPercent}%`
            });
        }
        if (mandiLaborAmount > 0) {
            voucherLines.push({
                account_id: accLabor.id,
                debit: mandiLaborAmount,
                credit: 0,
                line_narration: 'Mandi Yard Labor / Dami'
            });
        }
        // Credit Mandi Arhatiya
        voucherLines.push({
            account_id: accCreditor.id,
            party_id: input.mandi_party_id,
            debit: 0,
            credit: netPayable,
            line_narration: `Paddy Purchase Bill #${input.bill_no}`
        });
        // If freight paid by mandi, credit freight account
        if (freightPaidByMandi > 0) {
            const accFreight = AccountsRepository.findByCode('5010');
            voucherLines.push({
                account_id: accFreight.id,
                debit: 0,
                credit: freightPaidByMandi,
                line_narration: 'Freight deducted from Mandi Bill'
            });
        }
        // Run in a single atomic database transaction
        const execute = db.transaction(() => {
            // 1. Create the double-entry voucher
            const voucher = VouchersRepository.create({
                voucher_type: 'MANDI_PURCHASE',
                voucher_date: input.bill_date,
                reference_no: input.bill_no,
                narration: `Mandi Paddy Purchase Bill #${input.bill_no} - ${input.paddy_variety} (${input.total_bags} bags)`,
                lines: voucherLines
            });
            // 2. Create the detailed Mandi Purchase record
            const purchaseRecord = MandiPurchasesRepository.create({
                voucher_id: voucher.id,
                mandi_party_id: input.mandi_party_id,
                bill_no: input.bill_no,
                bill_date: input.bill_date,
                gate_pass_no: input.gate_pass_no || null,
                paddy_variety: input.paddy_variety,
                total_bags: input.total_bags,
                bag_type: input.bag_type || 'HDPE',
                gross_weight_qtl: input.gross_weight_qtl,
                tare_weight_qtl: input.tare_weight_qtl,
                net_weight_qtl: netWeight,
                moisture_percent: moisture,
                moisture_cut_qtl: moistureCutQtl,
                final_billable_qtl: finalBillableQtl,
                rate_per_qtl: input.rate_per_qtl,
                base_paddy_amount: basePaddyAmount,
                mandi_cess_percent: cessPercent,
                mandi_cess_amount: mandiCessAmount,
                arhat_percent: arhatPercent,
                arhat_amount: arhatAmount,
                rdf_percent: rdfPercent,
                rdf_amount: rdfAmount,
                mandi_labor_amount: mandiLaborAmount,
                freight_paid_by_mandi: freightPaidByMandi,
                other_deductions_amount: otherDeductions,
                net_payable_amount: netPayable,
                status: 'CONFIRMED'
            });
            return purchaseRecord;
        });
        return execute();
    }
}
