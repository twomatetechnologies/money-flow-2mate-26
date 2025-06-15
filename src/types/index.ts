
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
  value?: number; // Calculated: quantity * current_price
  investment_value?: number; // Calculated: quantity * purchase_price
  gain_loss?: number; // Calculated: value - investment_value
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
  principal?: number; // Often same as amount initially
  maturity_amount?: number;
  account_number?: string;
  
  // UI convenience fields (mapped from DB fields)
  bankName?: string;
  interestRate?: number;
  startDate?: Date | string;
  maturityDate?: Date | string;
  isAutoRenew?: boolean;
  familyMemberId?: string;
  lastUpdated?: Date;
  maturityAmount?: number;
  accountNumber?: string;
}
}

export interface SIPInvestment {
  id: string;
  name: string;
  amount: number;
  frequency: string; // e.g., 'Monthly', 'Quarterly'
  startDate: Date | string;
  endDate?: Date | string; // Optional
  fundType: string; // e.g., 'Equity', 'Debt', 'Hybrid', ELSS, Index Fund
  units?: number;
  currentNav?: number;
  familyMemberId?: string;
  notes?: string;
  lastUpdated?: Date;
  currentValue?: number; // Calculated: units * currentNav or estimated
  returns?: number; // Calculated: currentValue - totalInvestedAmount
  returnsPercent?: number; // Calculated: (returns / totalInvestedAmount) * 100
  type?: string; // This seems redundant with fundType, consider consolidating or clarifying. For now, keeping as per original.
  duration?: number; // in months or years, needs context
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
  type: string; // e.g., 'Physical', 'SGB', 'Gold ETF'
  quantity: number; // in grams or units
  purchase_date: Date | string;
  purchase_price: number; // per gram or per unit
  current_price?: number; // per gram or per unit
  value: number; // Calculated: quantity * current_price
  location?: string; // For physical gold
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
  lastUpdated: Date | string;
}

export interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  dateOfBirth?: string | Date | null;
  color: string;
  isActive?: boolean;
  notes?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}
