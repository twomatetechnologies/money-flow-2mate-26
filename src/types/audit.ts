
export interface AuditRecord {
  id: string;
  entityId: string;
  entityType: 'stock' | 'fixedDeposit' | 'sip' | 'insurance' | 'gold' | 'familyMember' | 'savingsAccount' | 'providentFund' | 'user';
  action: 'create' | 'update' | 'delete' | 'import';
  timestamp: Date;
  userId: string;
  details: Record<string, any>;
}
