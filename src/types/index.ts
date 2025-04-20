// Finance data types
export interface StockHolding {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  averageBuyPrice: number;
  currentPrice: number;
  change: number;
  changePercent: number;
  value: number;
  sector?: string;
  lastUpdated: Date;
  familyMemberId?: string; // Associate with family member
}

export interface FixedDeposit {
  id: string;
  bankName: string;
  accountNumber: string;
  principal: number;
  interestRate: number;
  startDate: Date;
  maturityDate: Date;
  maturityAmount: number;
  isAutoRenew: boolean;
  notes?: string;
  familyMemberId?: string; // Associate with family member
  lastUpdated: Date; // Added to match usage in fixedDepositService.ts
}

export interface SIPInvestment {
  id: string;
  name: string;
  type: 'Mutual Fund' | 'ELSS' | 'Index Fund' | 'Other';
  amount: number;
  frequency: 'Monthly' | 'Quarterly' | 'Yearly';
  startDate: Date;
  duration?: number; // in months
  currentValue: number;
  returns: number;
  returnsPercent: number;
  familyMemberId?: string; // Associate with family member
}

export interface InsurancePolicy {
  id: string;
  type: 'Life' | 'Health' | 'Vehicle' | 'Home' | 'Term' | 'Other';
  policyNumber: string;
  provider: string;
  coverAmount: number;
  premium: number;
  frequency: 'Monthly' | 'Quarterly' | 'Half-Yearly' | 'Yearly';
  startDate: Date;
  endDate: Date;
  nominees?: string[];
  documents?: string[];
  notes?: string;
  familyMemberId?: string; // Associate with family member
}

export interface GoldInvestment {
  id: string;
  type: 'Physical' | 'Digital' | 'ETF' | 'SGB';
  quantity: number; // in grams for physical/digital, units for ETF/SGB
  purchaseDate: Date;
  purchasePrice: number;
  currentPrice: number;
  value: number;
  location?: string; // for physical gold
  notes?: string;
  familyMemberId?: string; // Associate with family member
  lastUpdated: Date; // Added to match usage in goldService.ts
}

export interface NetWorthData {
  total: number;
  breakdown: {
    stocks: number;
    fixedDeposits: number;
    sip: number;
    gold: number;
    other: number;
  };
  history: {
    date: Date;
    value: number;
  }[];
}

// Family member type
export interface FamilyMember {
  id: string;
  name: string;
  relationship: 'Self' | 'Spouse' | 'Parent' | 'Child' | 'Sibling' | 'Other';
  color: string; // For visual representation in charts and UI
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

// Savings Account types
export interface SavingsAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountType: 'Savings' | 'Salary' | 'Zero Balance' | 'Other';
  balance: number;
  interestRate: number;
  branchName: string;
  ifscCode: string;
  familyMemberId?: string; // Primary account holder
  nominees?: Nominee[];
  notes?: string;
  lastUpdated: Date;
}

export interface Nominee {
  name: string;
  relationship: string;
  sharePercentage: number;
}
