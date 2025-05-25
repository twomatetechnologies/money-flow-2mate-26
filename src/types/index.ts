export interface AuditRecord {
  id: string;
  entityId: string;
  entityType: string;
  action: string;
  timestamp: Date;
  userId: string;
  details: any;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
  last_login?: Date;
}

export interface Settings {
  id: string;
  userId: string;
  stock_price_alert_threshold: number;
  stock_api_key?: string;
  app_name: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface Stock {
  id: string;
  symbol: string;
  company_name: string;
  quantity: number;
  purchase_price: number;
  purchase_date: Date | string;
  current_price?: number;
  sector?: string;
  family_member_id?: string;
  notes?: string;
  last_updated?: Date;
  value?: number;
  investment_value?: number;
  gain_loss?: number;
}

export interface FixedDeposit {
  id: string;
  bank_name: string;
  amount: number;
  interest_rate: number;
  start_date: Date | string;
  maturity_date: Date | string;
  term_months: number;
  fd_number?: string;
  is_auto_renewal?: boolean;
  family_member_id?: string;
  notes?: string;
  last_updated?: Date;
  principal?: number;
  maturity_amount?: number;
  account_number?: string;
}

export interface SIPInvestment {
  id: string;
  name: string;
  amount: number;
  frequency: string;
  start_date: Date | string;
  end_date?: Date | string;
  fund_type: string;
  units?: number;
  current_nav?: number;
  family_member_id?: string;
  notes?: string;
  last_updated?: Date;
  current_value?: number;
  returns?: number;
  returns_percent?: number;
  type?: string;
  duration?: number;
}

export interface InsurancePolicy {
  id: string;
  type: string;
  policy_number: string;
  provider: string;
  cover_amount: number;
  premium: number;
  frequency: string;
  start_date: Date | string;
  end_date: Date | string;
  family_member_id?: string;
  documents?: string[];
  notes?: string;
  last_updated?: Date;
}

export interface GoldInvestment {
  id: string;
  type: string;
  quantity: number;
  purchase_date: Date | string;
  purchase_price: number;
  current_price?: number;
  value: number;
  location?: string;
  notes?: string;
  family_member_id?: string;
  last_updated?: Date;
}

export interface FinancialGoal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: Date | string;
  category: string;
  notes?: string;
  type?: string;
  start_date?: Date | string;
  priority?: string;
  family_member_id?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface NetWorthData {
  total: number;
  breakdown: {
    stocks: number;
    fixedDeposits: number;
    sip: number;
    gold: number;
    providentFund: number;
    other: number;
  };
  history: {
    date: Date;
    value: number;
  }[];
}

export interface ProvidentFund {
    id: string;
    account_number: string;
    employee_contribution?: number;
    employer_contribution?: number;
    total_balance?: number;
    interest_rate?: number;
    start_date?: Date | string;
    family_member_id?: string;
    notes?: string;
    last_updated?: Date;
    employer_name?: string;
    monthly_contribution?: number;
}

export interface MarketIndex {
  isSimulated: boolean;
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  lastUpdated: Date | string; // Allow string for API response, parse to Date if needed
}

export interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  dateOfBirth?: string | Date | null; // Allow string for API, Date for client
  color: string;
  isActive?: boolean;
  notes?: string | null;
  createdAt: string | Date; // Allow string for API, Date for client
  updatedAt: string | Date; // Allow string for API, Date for client
}
