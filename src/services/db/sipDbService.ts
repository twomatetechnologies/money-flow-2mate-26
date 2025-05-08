
/**
 * SIP Investments service for database operations
 */
import { v4 as uuidv4 } from 'uuid';
import { SIPInvestment } from '@/types';
import { executeQuery } from './dbConnector';
import { createAuditRecord } from '../auditService';

// Get all SIP investments
export const getSIPInvestments = async (): Promise<SIPInvestment[]> => {
  try {
    const investments = await executeQuery<SIPInvestment[]>('/sip-investments');
    
    // Convert date strings to Date objects
    return investments.map(investment => ({
      ...investment,
      startDate: new Date(investment.startDate)
    }));
  } catch (error) {
    console.error('Failed to fetch SIP investments from database:', error);
    throw error;
  }
};

// Add a new SIP investment
export const addSIPInvestment = async (investment: Partial<SIPInvestment>): Promise<SIPInvestment> => {
  try {
    const newInvestment = {
      id: investment.id || uuidv4(),
      name: investment.name || '',
      type: investment.type || 'Mutual Fund',
      amount: investment.amount || 0,
      frequency: investment.frequency || 'Monthly',
      startDate: investment.startDate || new Date(),
      duration: investment.duration,
      currentValue: investment.currentValue || 0,
      returns: investment.returns || 0,
      returnsPercent: investment.returnsPercent || 0,
      familyMemberId: investment.familyMemberId || '',
    };
    
    const savedInvestment = await executeQuery<SIPInvestment>('/sip-investments', 'POST', newInvestment);
    
    // Convert date strings to Date objects
    const result = {
      ...savedInvestment,
      startDate: new Date(savedInvestment.startDate)
    };
    
    createAuditRecord(result.id, 'sip', 'create', result);
    return result;
  } catch (error) {
    console.error('Failed to add SIP investment to database:', error);
    throw error;
  }
};

// Update an existing SIP investment
export const updateSIPInvestment = async (id: string, updates: Partial<SIPInvestment>): Promise<SIPInvestment> => {
  try {
    const updatedInvestment = await executeQuery<SIPInvestment>(`/sip-investments/${id}`, 'PUT', updates);
    
    // Convert date strings to Date objects
    const result = {
      ...updatedInvestment,
      startDate: new Date(updatedInvestment.startDate)
    };
    
    createAuditRecord(id, 'sip', 'update', {
      current: result,
      changes: updates
    });
    
    return result;
  } catch (error) {
    console.error(`Failed to update SIP investment ${id} in database:`, error);
    throw error;
  }
};

// Delete a SIP investment
export const deleteSIPInvestment = async (id: string): Promise<boolean> => {
  try {
    await executeQuery(`/sip-investments/${id}`, 'DELETE');
    createAuditRecord(id, 'sip', 'delete', { id });
    return true;
  } catch (error) {
    console.error(`Failed to delete SIP investment ${id} from database:`, error);
    throw error;
  }
};

// Get a single SIP investment by ID
export const getSIPInvestmentById = async (id: string): Promise<SIPInvestment | null> => {
  try {
    const investment = await executeQuery<SIPInvestment>(`/sip-investments/${id}`);
    
    // Convert date strings to Date objects
    return {
      ...investment,
      startDate: new Date(investment.startDate)
    };
  } catch (error) {
    console.error(`Failed to fetch SIP investment ${id} from database:`, error);
    return null;
  }
};
