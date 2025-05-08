
import { v4 as uuidv4 } from 'uuid';
import { AuditRecord } from '@/types/audit';
import { isPostgresEnabled, executeQuery } from './db/dbConnector';

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

// Check if we should use database operations
const useDatabase = isPostgresEnabled();

export const createAuditRecord = async (
  entityId: string,
  entityType: 'stock' | 'fixedDeposit' | 'sip' | 'insurance' | 'gold' | 'familyMember' | 'savingsAccount' | 'providentFund',
  action: 'create' | 'update' | 'delete' | 'import',
  details: any
): Promise<AuditRecord> => {
  const record: AuditRecord = {
    id: uuidv4(),
    timestamp: new Date(),
    entityId,
    entityType,
    action,
    userId: 'current-user', // In a real app, get this from auth context
    details
  };

  if (useDatabase) {
    try {
      // When using PostgreSQL, send the record to the API
      await executeQuery('/audit-records', 'POST', record);
    } catch (error) {
      console.error('Failed to save audit record to database:', error);
    }
  } else {
    // When using localStorage, save locally
    auditRecords.push(record);
    saveAuditRecords(auditRecords);
  }
  
  return record;
};

export const getAuditRecordsForEntity = async (entityId: string): Promise<AuditRecord[]> => {
  if (useDatabase) {
    try {
      return await executeQuery<AuditRecord[]>(`/audit-records/entity/${entityId}`);
    } catch (error) {
      console.error(`Failed to fetch audit records for entity ${entityId} from database:`, error);
      return [];
    }
  }
  
  return auditRecords.filter(record => record.entityId === entityId);
};

export const getAuditRecordsByType = async (entityType: string): Promise<AuditRecord[]> => {
  if (useDatabase) {
    try {
      return await executeQuery<AuditRecord[]>(`/audit-records/type/${entityType}`);
    } catch (error) {
      console.error(`Failed to fetch audit records for type ${entityType} from database:`, error);
      return [];
    }
  }
  
  return auditRecords.filter(record => record.entityType === entityType);
};

export const getAllAuditRecords = async (): Promise<AuditRecord[]> => {
  if (useDatabase) {
    try {
      return await executeQuery<AuditRecord[]>('/audit-records');
    } catch (error) {
      console.error('Failed to fetch all audit records from database:', error);
      return [];
    }
  }
  
  return [...auditRecords];
};

export const clearAuditRecords = async (): Promise<void> => {
  if (useDatabase) {
    try {
      await executeQuery('/audit-records', 'DELETE');
    } catch (error) {
      console.error('Failed to clear audit records from database:', error);
    }
  } else {
    auditRecords = [];
    saveAuditRecords(auditRecords);
  }
};
