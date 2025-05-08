
import { v4 as uuidv4 } from 'uuid';
import { AuditRecord } from '@/types/audit';

// Load audit records from localStorage or initialize empty array
const loadAuditRecords = (): AuditRecord[] => {
  try {
    const storedRecords = localStorage.getItem('auditRecords');
    return storedRecords ? JSON.parse(storedRecords) : [];
  } catch (error) {
    console.error('Error loading audit records from localStorage:', error);
    return [];
  }
};

// Save audit records to localStorage
const saveAuditRecords = (records: AuditRecord[]): void => {
  try {
    localStorage.setItem('auditRecords', JSON.stringify(records));
  } catch (error) {
    console.error('Error saving audit records to localStorage:', error);
  }
};

// In-memory store with persistence
let auditRecords: AuditRecord[] = loadAuditRecords();

export const createAuditRecord = (
  entityId: string,
  entityType: 'stock' | 'fixedDeposit' | 'sip' | 'insurance' | 'gold' | 'familyMember' | 'savingsAccount' | 'providentFund',
  action: 'create' | 'update' | 'delete' | 'import',
  details: any
): AuditRecord => {
  const record: AuditRecord = {
    id: uuidv4(),
    timestamp: new Date(),
    entityId,
    entityType,
    action,
    userId: 'current-user', // In a real app, get this from auth context
    details
  };

  auditRecords.push(record);
  saveAuditRecords(auditRecords);
  return record;
};

export const getAuditRecordsForEntity = (entityId: string): AuditRecord[] => {
  return auditRecords.filter(record => record.entityId === entityId);
};

export const getAuditRecordsByType = (entityType: string): AuditRecord[] => {
  return auditRecords.filter(record => record.entityType === entityType);
};

export const getAllAuditRecords = (): AuditRecord[] => {
  return [...auditRecords];
};

export const clearAuditRecords = (): void => {
  auditRecords = [];
  saveAuditRecords(auditRecords);
};
