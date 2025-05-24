import { 
  FixedDeposit, 
  SIPInvestment, 
  InsurancePolicy, 
  GoldInvestment,
  NetWorthData,
  ProvidentFund
} from '@/types';

// Mock fixed deposit data (empty for clean start)
export const mockFixedDeposits: FixedDeposit[] = [];

// Mock SIP data (empty for clean start)
export const mockSIPInvestments: SIPInvestment[] = [];

// Mock insurance data (empty for clean start)
export const mockInsurancePolicies: InsurancePolicy[] = [];

// Mock gold investment data (empty for clean start)
export const mockGoldInvestments: GoldInvestment[] = [];

// Mock Provident Fund data (empty for clean start)
export const mockProvidentFunds: ProvidentFund[] = [];

// Mock net worth data (starts with zero values for clean start)
export const mockNetWorthData: NetWorthData = {
  total: 0,
  breakdown: {
    stocks: 0,
    fixedDeposits: 0,
    sip: 0,
    gold: 0,
    providentFund: 0,
    other: 0,
  },
  history: [
    { date: new Date('2024-05-01'), value: 0 }
  ]
};

// Helper functions to get mock data (for non-stock entities)
export function getFixedDeposits(): Promise<FixedDeposit[]> {
  return Promise.resolve(mockFixedDeposits);
}

export function getSIPInvestments(): Promise<SIPInvestment[]> {
  return Promise.resolve(mockSIPInvestments);
}

export function getInsurancePolicies(): Promise<InsurancePolicy[]> {
  return Promise.resolve(mockInsurancePolicies);
}

export function getGoldInvestments(): Promise<GoldInvestment[]> {
  return Promise.resolve(mockGoldInvestments);
}

export function getProvidentFunds(): Promise<ProvidentFund[]> {
  return Promise.resolve(mockProvidentFunds);
}

export function getNetWorth(): Promise<NetWorthData> {
  // This mock getNetWorth is generally overridden by the one in crudService or netWorthService
  // which calculate live values. It serves as a fallback if directly called.
  // Since mock data is now empty, just return the zero-state data
  return Promise.resolve(mockNetWorthData);
}
