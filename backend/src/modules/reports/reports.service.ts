import { ReportsRepository } from './reports.repository.js';
import { PartyLedgerReport, DailyCashBookReport, TrialBalanceItem } from './reports.types.js';

export class ReportsService {
  static getPartyLedger(partyId: number, fromDate?: string, toDate?: string): PartyLedgerReport {
    return ReportsRepository.getPartyLedger(partyId, fromDate, toDate);
  }

  static getDailyCashBook(dateStr: string): DailyCashBookReport {
    if (!dateStr) {
      dateStr = new Date().toISOString().slice(0, 10);
    }
    return ReportsRepository.getDailyCashBook(dateStr);
  }

  static getTrialBalance(): { accounts: TrialBalanceItem[]; total_debit: number; total_credit: number } {
    return ReportsRepository.getTrialBalance();
  }
}
