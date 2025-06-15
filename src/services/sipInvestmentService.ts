
import { SIPInvestment } from '@/types';
import { createAuditRecord } from './auditService';
import { executeQuery } from './db/dbConnector';

const API_BASE_URL = '/sipInvestments';

// CRUD operations for SIP Investments - PostgreSQL only
export const createSIP = async (sip: Partial<SIPInvestment>): Promise<SIPInvestment> => {
  try {
    const newSIP = await executeQuery<SIPInvestment>(API_BASE_URL, 'POST', sip);
    createAuditRecord(newSIP.id, 'sip', 'create', newSIP);
    return newSIP;
  } catch (error) {
    console.error('Error creating SIP investment:', error);
    throw new Error('Failed to create SIP investment. Database connection required.');
  }
};

export const updateSIP = async (id: string, updates: Partial<SIPInvestment>): Promise<SIPInvestment | null> => {
  try {
    const updatedSIP = await executeQuery<SIPInvestment>(`${API_BASE_URL}/${id}`, 'PUT', updates);
    createAuditRecord(id, 'sip', 'update', {
      current: updatedSIP,
      changes: updates
    });
    return updatedSIP;
  } catch (error) {
    console.error(`Error updating SIP investment ${id}:`, error);
    throw new Error(`Failed to update SIP investment. Database connection required.`);
  }
};

export const deleteSIP = async (id: string): Promise<boolean> => {
  try {
    await executeQuery<{ success: boolean }>(`${API_BASE_URL}/${id}`, 'DELETE');
    createAuditRecord(id, 'sip', 'delete', { id });
    return true;
  } catch (error) {
    console.error(`Error deleting SIP investment ${id}:`, error);
    throw new Error(`Failed to delete SIP investment. Database connection required.`);
  }
};

export const getSIPById = async (id: string): Promise<SIPInvestment | null> => {
  try {
    return await executeQuery<SIPInvestment | null>(`${API_BASE_URL}/${id}`, 'GET');
  } catch (error) {
    console.error(`Error fetching SIP investment ${id}:`, error);
    throw new Error(`Failed to fetch SIP investment. Database connection required.`);
  }
};

export const getSIPInvestments = async (): Promise<SIPInvestment[]> => {
  try {
    return await executeQuery<SIPInvestment[]>(API_BASE_URL, 'GET');
  } catch (error) {
    console.error('Error fetching SIP investments:', error);
    throw new Error('Failed to fetch SIP investments. Database connection required.');
  }
};
