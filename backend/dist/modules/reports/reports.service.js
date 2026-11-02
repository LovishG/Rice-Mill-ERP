import { ReportsRepository } from './reports.repository.js';
export class ReportsService {
    static getPartyLedger(partyId, fromDate, toDate) {
        return ReportsRepository.getPartyLedger(partyId, fromDate, toDate);
    }
    static getDailyCashBook(dateStr) {
        if (!dateStr) {
            dateStr = new Date().toISOString().slice(0, 10);
        }
        return ReportsRepository.getDailyCashBook(dateStr);
    }
    static getTrialBalance() {
        return ReportsRepository.getTrialBalance();
    }
}
