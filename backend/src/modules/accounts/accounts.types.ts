export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';

export interface Account {
  id: number;
  code: string;
  name: string;
  type: AccountType;
  parent_id?: number | null;
  is_system: number;
  created_at: string;
  balance?: number;
}

export interface CreateAccountInput {
  code: string;
  name: string;
  type: AccountType;
  parent_id?: number | null;
}
