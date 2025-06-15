
import { v4 as uuidv4 } from 'uuid';
import { AuditRecord } from '@/types/audit';
import { executeQuery } from './db/dbConnector';
import { handleError, withErrorHandling } from '@/utils/errorHandler';

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
    // Send the record to the API
    await executeQuery('/audit-records', 'POST', record);
    
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
    return await executeQuery<AuditRecord[]>(`/audit-records/entity/${entityId}`);
  },
  'Failed to fetch audit records for entity',
  { severity: 'low' }
);

export const getAuditRecordsByType = withErrorHandling(
  async (entityType: string): Promise<AuditRecord[]> => {
    return await executeQuery<AuditRecord[]>(`/audit-records/type/${entityType}`);
  },
  'Failed to fetch audit records by type',
  { severity: 'low' }
);

export const getAllAuditRecords = withErrorHandling(
  async (): Promise<AuditRecord[]> => {
    return await executeQuery<AuditRecord[]>('/audit-records');
  },
  'Failed to fetch all audit records',
  { severity: 'low' }
);

export const clearAuditRecords = withErrorHandling(
  async (): Promise<void> => {
    await executeQuery('/audit-records', 'DELETE');
    console.log('All audit records cleared');
  },
  'Failed to clear audit records',
  { severity: 'medium' }
);
