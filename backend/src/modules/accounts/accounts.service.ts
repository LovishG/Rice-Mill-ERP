import { AccountsRepository } from './accounts.repository.js';
import { Account, CreateAccountInput, AccountType } from './accounts.types.js';

export class AccountsService {
  static getAllAccounts(type?: AccountType): Account[] {
    return AccountsRepository.findAll(type);
  }

  static getAccountById(id: number): Account {
    const acc = AccountsRepository.findById(id);
    if (!acc) throw new Error(`Account with ID ${id} not found.`);
    return acc;
  }

  static createAccount(input: CreateAccountInput): Account {
    if (!input.code || !input.name || !input.type) {
      throw new Error('Code, name, and account type are required.');
    }
    const existing = AccountsRepository.findByCode(input.code);
    if (existing) {
      throw new Error(`Account code ${input.code} already exists.`);
    }
    return AccountsRepository.create(input);
  }
}
