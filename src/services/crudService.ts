/**
 * CRUD Service - API Client for Financial Data
 * 
 * This service now requires PostgreSQL and doesn't use localStorage or in-memory storage.
 * All operations are delegated to the appropriate database service.
 */
import { executeQuery } from './db/dbConnector';
import { createAuditRecord } from './auditService';
import { v4 as uuidv4 } from 'uuid';

// Re-export stock operations from dedicated service
import * as stockService from './stockService';
export const createStock = stockService.createStock;
export const updateStock = stockService.updateStock;
export const deleteStock = stockService.deleteStock;
export const getStockById = stockService.getStockById;
export const getStocks = stockService.getStocks;

// Fixed Deposits
export const createFixedDeposit = async (fd: any): Promise<any> => {
  try {
    const newFD = {
      ...fd,
      id: fd.id || `fd-${uuidv4()}`,
      lastUpdated: new Date()
    };
    
    const result = await executeQuery('/fixed-deposits', 'POST', newFD);
    
    // Create audit record
    await createAuditRecord(
      newFD.id,
      'fixedDeposit',
      'create',
      { amount: newFD.amount, bankName: newFD.bankName }
    );
    
    return result;
  } catch (error) {
    console.error('Error in createFixedDeposit:', error);
    throw error;
  }
};

export const updateFixedDeposit = async (id: string, updates: any): Promise<any> => {
  try {
    // Get the original FD to track changes
    const originalFD = await getFixedDepositById(id);
    
    if (!originalFD) {
      throw new Error(`Fixed deposit with ID ${id} not found`);
    }
    
    const updatedFD = await executeQuery(`/fixed-deposits/${id}`, 'PUT', updates);
    
    // Create audit record
    await createAuditRecord(
      id,
      'fixedDeposit',
      'update',
      {
        original: originalFD,
        current: updatedFD,
        changes: Object.keys(updates)
      }
    );
    
    return updatedFD;
  } catch (error) {
    console.error('Error in updateFixedDeposit:', error);
    throw error;
  }
};

export const deleteFixedDeposit = async (id: string): Promise<boolean> => {
  try {
    // Get the original FD for audit
    const originalFD = await getFixedDepositById(id);
    
    if (!originalFD) {
      throw new Error(`Fixed deposit with ID ${id} not found`);
    }
    
    await executeQuery(`/fixed-deposits/${id}`, 'DELETE');
    
    // Create audit record
    await createAuditRecord(
      id,
      'fixedDeposit',
      'delete',
      { deleted: originalFD }
    );
    
    return true;
  } catch (error) {
    console.error('Error in deleteFixedDeposit:', error);
    throw error;
  }
};

export const getFixedDepositById = async (id: string): Promise<any> => {
  try {
    return await executeQuery(`/fixed-deposits/${id}`);
  } catch (error) {
    console.error(`Error in getFixedDepositById for ID ${id}:`, error);
    throw error;
  }
};

export const getFixedDeposits = async (): Promise<any[]> => {
  try {
    return await executeQuery('/fixed-deposits');
  } catch (error) {
    console.error('Error in getFixedDeposits:', error);
    throw error;
  }
};

// SIP Investments
export const createSIPInvestment = async (sip: any): Promise<any> => {
  try {
    const newSIP = {
      ...sip,
      id: sip.id || `sip-${uuidv4()}`,
      lastUpdated: new Date()
    };
    
    const result = await executeQuery('/sip-investments', 'POST', newSIP);
    
    // Create audit record
    await createAuditRecord(
      newSIP.id,
      'sip',
      'create',
      { name: newSIP.name, amount: newSIP.amount }
    );
    
    return result;
  } catch (error) {
    console.error('Error in createSIPInvestment:', error);
    throw error;
  }
};

export const updateSIPInvestment = async (id: string, updates: any): Promise<any> => {
  try {
    // Get the original SIP to track changes
    const originalSIP = await getSIPInvestmentById(id);
    
    if (!originalSIP) {
      throw new Error(`SIP investment with ID ${id} not found`);
    }
    
    const updatedSIP = await executeQuery(`/sip-investments/${id}`, 'PUT', updates);
    
    // Create audit record
    await createAuditRecord(
      id,
      'sip',
      'update',
      {
        original: originalSIP,
        current: updatedSIP,
        changes: Object.keys(updates)
      }
    );
    
    return updatedSIP;
  } catch (error) {
    console.error('Error in updateSIPInvestment:', error);
    throw error;
  }
};

export const deleteSIPInvestment = async (id: string): Promise<boolean> => {
  try {
    // Get the original SIP for audit
    const originalSIP = await getSIPInvestmentById(id);
    
    if (!originalSIP) {
      throw new Error(`SIP investment with ID ${id} not found`);
    }
    
    await executeQuery(`/sip-investments/${id}`, 'DELETE');
    
    // Create audit record
    await createAuditRecord(
      id,
      'sip',
      'delete',
      { deleted: originalSIP }
    );
    
    return true;
  } catch (error) {
    console.error('Error in deleteSIPInvestment:', error);
    throw error;
  }
};

export const getSIPInvestmentById = async (id: string): Promise<any> => {
  try {
    return await executeQuery(`/sip-investments/${id}`);
  } catch (error) {
    console.error(`Error in getSIPInvestmentById for ID ${id}:`, error);
    throw error;
  }
};

export const getSIPInvestments = async (): Promise<any[]> => {
  try {
    return await executeQuery('/sip-investments');
  } catch (error) {
    console.error('Error in getSIPInvestments:', error);
    throw error;
  }
};

// Insurance Policies
export const createInsurancePolicy = async (policy: any): Promise<any> => {
  try {
    const newPolicy = {
      ...policy,
      id: policy.id || `ins-${uuidv4()}`,
      lastUpdated: new Date()
    };
    
    const result = await executeQuery('/insurance-policies', 'POST', newPolicy);
    
    // Create audit record
    await createAuditRecord(
      newPolicy.id,
      'insurance',
      'create',
      { 
        type: newPolicy.type, 
        provider: newPolicy.provider,
        premium: newPolicy.premium
      }
    );
    
    return result;
  } catch (error) {
    console.error('Error in createInsurancePolicy:', error);
    throw error;
  }
};

export const updateInsurancePolicy = async (id: string, updates: any): Promise<any> => {
  try {
    // Get the original policy to track changes
    const originalPolicy = await getInsurancePolicyById(id);
    
    if (!originalPolicy) {
      throw new Error(`Insurance policy with ID ${id} not found`);
    }
    
    const updatedPolicy = await executeQuery(`/insurance-policies/${id}`, 'PUT', updates);
    
    // Create audit record
    await createAuditRecord(
      id,
      'insurance',
      'update',
      {
        original: originalPolicy,
        current: updatedPolicy,
        changes: Object.keys(updates)
      }
    );
    
    return updatedPolicy;
  } catch (error) {
    console.error('Error in updateInsurancePolicy:', error);
    throw error;
  }
};

export const deleteInsurancePolicy = async (id: string): Promise<boolean> => {
  try {
    // Get the original policy for audit
    const originalPolicy = await getInsurancePolicyById(id);
    
    if (!originalPolicy) {
      throw new Error(`Insurance policy with ID ${id} not found`);
    }
    
    await executeQuery(`/insurance-policies/${id}`, 'DELETE');
    
    // Create audit record
    await createAuditRecord(
      id,
      'insurance',
      'delete',
      { deleted: originalPolicy }
    );
    
    return true;
  } catch (error) {
    console.error('Error in deleteInsurancePolicy:', error);
    throw error;
  }
};

export const getInsurancePolicyById = async (id: string): Promise<any> => {
  try {
    return await executeQuery(`/insurance-policies/${id}`);
  } catch (error) {
    console.error(`Error in getInsurancePolicyById for ID ${id}:`, error);
    throw error;
  }
};

export const getInsurancePolicies = async (): Promise<any[]> => {
  try {
    return await executeQuery('/insurance-policies');
  } catch (error) {
    console.error('Error in getInsurancePolicies:', error);
    throw error;
  }
};

// Gold Investments
export const createGoldInvestment = async (gold: any): Promise<any> => {
  try {
    const newGold = {
      ...gold,
      id: gold.id || `gold-${uuidv4()}`,
      lastUpdated: new Date()
    };
    
    const result = await executeQuery('/gold-investments', 'POST', newGold);
    
    // Create audit record
    await createAuditRecord(
      newGold.id,
      'gold',
      'create',
      { 
        type: newGold.type, 
        quantity: newGold.quantity,
        value: newGold.value
      }
    );
    
    return result;
  } catch (error) {
    console.error('Error in createGoldInvestment:', error);
    throw error;
  }
};

export const updateGoldInvestment = async (id: string, updates: any): Promise<any> => {
  try {
    // Get the original gold investment to track changes
    const originalGold = await getGoldInvestmentById(id);
    
    if (!originalGold) {
      throw new Error(`Gold investment with ID ${id} not found`);
    }
    
    const updatedGold = await executeQuery(`/gold-investments/${id}`, 'PUT', updates);
    
    // Create audit record
    await createAuditRecord(
      id,
      'gold',
      'update',
      {
        original: originalGold,
        current: updatedGold,
        changes: Object.keys(updates)
      }
    );
    
    return updatedGold;
  } catch (error) {
    console.error('Error in updateGoldInvestment:', error);
    throw error;
  }
};

export const deleteGoldInvestment = async (id: string): Promise<boolean> => {
  try {
    // Get the original gold investment for audit
    const originalGold = await getGoldInvestmentById(id);
    
    if (!originalGold) {
      throw new Error(`Gold investment with ID ${id} not found`);
    }
    
    await executeQuery(`/gold-investments/${id}`, 'DELETE');
    
    // Create audit record
    await createAuditRecord(
      id,
      'gold',
      'delete',
      { deleted: originalGold }
    );
    
    return true;
  } catch (error) {
    console.error('Error in deleteGoldInvestment:', error);
    throw error;
  }
};

export const getGoldInvestmentById = async (id: string): Promise<any> => {
  try {
    return await executeQuery(`/gold-investments/${id}`);
  } catch (error) {
    console.error(`Error in getGoldInvestmentById for ID ${id}:`, error);
    throw error;
  }
};

export const getGoldInvestments = async (): Promise<any[]> => {
  try {
    return await executeQuery('/gold-investments');
  } catch (error) {
    console.error('Error in getGoldInvestments:', error);
    throw error;
  }
};

// Provident Fund
export const createProvidentFund = async (pf: any): Promise<any> => {
  try {
    const newPF = {
      ...pf,
      id: pf.id || `pf-${uuidv4()}`,
      lastUpdated: new Date()
    };
    
    const result = await executeQuery('/provident-funds', 'POST', newPF);
    
    // Create audit record
    await createAuditRecord(
      newPF.id,
      'providentFund',
      'create',
      { type: newPF.type, amount: newPF.amount }
    );
    
    return result;
  } catch (error) {
    console.error('Error in createProvidentFund:', error);
    throw error;
  }
};

export const updateProvidentFund = async (id: string, updates: any): Promise<any> => {
  try {
    // Get the original provident fund to track changes
    const originalPF = await getProvidentFundById(id);
    
    if (!originalPF) {
      throw new Error(`Provident fund with ID ${id} not found`);
    }
    
    const updatedPF = await executeQuery(`/provident-funds/${id}`, 'PUT', updates);
    
    // Create audit record
    await createAuditRecord(
      id,
      'providentFund',
      'update',
      {
        original: originalPF,
        current: updatedPF,
        changes: Object.keys(updates)
      }
    );
    
    return updatedPF;
  } catch (error) {
    console.error('Error in updateProvidentFund:', error);
    throw error;
  }
};

export const deleteProvidentFund = async (id: string): Promise<boolean> => {
  try {
    // Get the original provident fund for audit
    const originalPF = await getProvidentFundById(id);
    
    if (!originalPF) {
      throw new Error(`Provident fund with ID ${id} not found`);
    }
    
    await executeQuery(`/provident-funds/${id}`, 'DELETE');
    
    // Create audit record
    await createAuditRecord(
      id,
      'providentFund',
      'delete',
      { deleted: originalPF }
    );
    
    return true;
  } catch (error) {
    console.error('Error in deleteProvidentFund:', error);
    throw error;
  }
};

export const getProvidentFundById = async (id: string): Promise<any> => {
  try {
    return await executeQuery(`/provident-funds/${id}`);
  } catch (error) {
    console.error(`Error in getProvidentFundById for ID ${id}:`, error);
    throw error;
  }
};

export const getProvidentFunds = async (): Promise<any[]> => {
  try {
    return await executeQuery('/provident-funds');
  } catch (error) {
    console.error('Error in getProvidentFunds:', error);
    throw error;
  }
};

// Net Worth data
export const getNetWorthData = async (): Promise<any> => {
  try {
    return await executeQuery('/net-worth');
  } catch (error) {
    console.error('Error in getNetWorthData:', error);
    throw error;
  }
};

// Aliases for backward compatibility
export const createGold = createGoldInvestment;
export const updateGold = updateGoldInvestment;
export const deleteGold = deleteGoldInvestment;
export const createInsurance = createInsurancePolicy;
export const updateInsurance = updateInsurancePolicy;
export const deleteInsurance = deleteInsurancePolicy;
export const getInsuranceById = getInsurancePolicyById;
