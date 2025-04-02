
import { AuditRecord } from '@/types/audit';
import { v4 as uuidv4 } from 'uuid';

// Mock user ID (in a real app, this would come from authentication)
const CURRENT_USER_ID = 'user-123';

// In-memory storage for audit records (in a real app, this would be stored in a database)
let auditRecords: AuditRecord[] = [];

export const createAuditRecord = (
  entityId: string,
  entityType: AuditRecord['entityType'],
  action: AuditRecord['action'],
  details: Record<string, any>
): AuditRecord => {
  const newRecord: AuditRecord = {
    id: uuidv4(),
    entityId,
    entityType,
    action,
    timestamp: new Date(),
    userId: CURRENT_USER_ID,
    details,
  };
  
  auditRecords.push(newRecord);
  
  // In a real app, this would be persisted to a database
  console.log('Audit record created:', newRecord);
  
  return newRecord;
};

export const getAuditRecordsForEntity = (
  entityId: string
): AuditRecord[] => {
  return auditRecords.filter(record => record.entityId === entityId);
};

export const getAllAuditRecords = (): AuditRecord[] => {
  return auditRecords;
};

export const getAuditRecordsByType = (
  entityType: AuditRecord['entityType']
): AuditRecord[] => {
  return auditRecords.filter(record => record.entityType === entityType);
};

// Clear all audit records (for testing purposes)
export const clearAuditRecords = (): void => {
  auditRecords = [];
};
