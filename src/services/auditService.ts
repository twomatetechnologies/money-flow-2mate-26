
import { v4 as uuidv4 } from 'uuid';
import { AuditRecord } from '@/types/audit';
import { isPostgresEnabled, executeQuery } from './db/dbConnector';
import { handleError, withErrorHandling } from '@/utils/errorHandler';

// Load audit records from localStorage or initialize empty array
const loadAuditRecords = (): AuditRecord[] => {
  try {
    const storedRecords = localStorage.getItem('auditRecords');
    return storedRecords ? JSON.parse(storedRecords) : [];
  } catch (error) {
    handleError(error, 'Failed to load audit records', { 
      severity: 'medium',
      context: { source: 'localStorage' }
    });
    return [];
  }
};

// Save audit records to localStorage
const saveAuditRecords = (records: AuditRecord[]): void => {
  try {
    localStorage.setItem('auditRecords', JSON.stringify(records));
  } catch (error) {
    handleError(error, 'Failed to save audit records', { 
      severity: 'medium',
      context: { count: records.length }
    });
  }
};

// In-memory store with persistence
let auditRecords: AuditRecord[] = loadAuditRecords();

// Create an audit record
export const createAuditRecord = async (
  entityId: string,
  entityType: 'stock' | 'fixedDeposit' | 'sip' | 'insurance' | 'gold' | 'familyMember' | 'savingsAccount' | 'providentFund' | 'user',
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

  try {
    if (isPostgresEnabled()) {
      // When using PostgreSQL, send the record to the API
      await executeQuery('/audit-records', 'POST', record);
    } else {
      // When using localStorage, save locally
      auditRecords.push(record);
      saveAuditRecords(auditRecords);
    }
    
    console.log(`Audit: [${action.toUpperCase()}] ${entityType} ${entityId}`);
    return record;
  } catch (error) {
    handleError(error, `Failed to create audit record for ${entityType}`, {
      severity: 'low', // Non-critical for app functionality
      context: { entityId, entityType, action }
    });
    
    // Still return the record even if storage failed
    return record;
  }
};

// Get audit records with error handling
export const getAuditRecordsForEntity = withErrorHandling(
  async (entityId: string): Promise<AuditRecord[]> => {
    if (isPostgresEnabled()) {
      return await executeQuery<AuditRecord[]>(`/audit-records/entity/${entityId}`);
    }
    
    return auditRecords.filter(record => record.entityId === entityId);
  },
  'Failed to fetch audit records for entity',
  { severity: 'low' }
);

export const getAuditRecordsByType = withErrorHandling(
  async (entityType: string): Promise<AuditRecord[]> => {
    if (isPostgresEnabled()) {
      return await executeQuery<AuditRecord[]>(`/audit-records/type/${entityType}`);
    }
    
    return auditRecords.filter(record => record.entityType === entityType);
  },
  'Failed to fetch audit records by type',
  { severity: 'low' }
);

export const getAllAuditRecords = withErrorHandling(
  async (): Promise<AuditRecord[]> => {
    if (isPostgresEnabled()) {
      return await executeQuery<AuditRecord[]>('/audit-records');
    }
    
    return [...auditRecords];
  },
  'Failed to fetch all audit records',
  { severity: 'low' }
);

export const clearAuditRecords = withErrorHandling(
  async (): Promise<void> => {
    if (isPostgresEnabled()) {
      await executeQuery('/audit-records', 'DELETE');
    } else {
      auditRecords = [];
      saveAuditRecords(auditRecords);
    }
    console.log('All audit records cleared');
  },
  'Failed to clear audit records',
  { severity: 'medium' }
);
