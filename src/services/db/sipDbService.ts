
/**
 * SIP Investments service for database operations
 */
import { v4 as uuidv4 } from 'uuid';
import { SIPInvestment } from '@/types';
import { executeQuery } from './dbConnector'; // Assuming this correctly handles API calls
import { createAuditRecord } from '../auditService';

// Helper to convert snake_case API response to camelCase SIPInvestment
const mapApiToSipInvestment = (apiData: any): SIPInvestment => {
  return {
    id: apiData.id,
    name: apiData.name,
    amount: apiData.amount,
    frequency: apiData.frequency,
    startDate: apiData.start_date ? new Date(apiData.start_date) : new Date(), // Ensure Date object
    endDate: apiData.end_date ? new Date(apiData.end_date) : undefined, // Ensure Date object or undefined
    fundType: apiData.fund_type,
    units: apiData.units,
    currentNav: apiData.current_nav,
    familyMemberId: apiData.family_member_id,
    notes: apiData.notes,
    lastUpdated: apiData.last_updated ? new Date(apiData.last_updated) : undefined,
    currentValue: apiData.current_value,
    returns: apiData.returns,
    returnsPercent: apiData.returns_percent,
    type: apiData.type, // Assuming 'type' from API maps to 'type' in SIPInvestment
    duration: apiData.duration,
  };
};

// Helper to convert camelCase SIPInvestment to snake_case for API payload
const mapSipInvestmentToApi = (sipData: Partial<SIPInvestment>): any => {
  const apiPayload: any = {};
  if (sipData.id !== undefined) apiPayload.id = sipData.id;
  if (sipData.name !== undefined) apiPayload.name = sipData.name;
  if (sipData.amount !== undefined) apiPayload.amount = sipData.amount;
  if (sipData.frequency !== undefined) apiPayload.frequency = sipData.frequency;
  if (sipData.startDate !== undefined) apiPayload.start_date = sipData.startDate instanceof Date ? sipData.startDate.toISOString() : sipData.startDate;
  if (sipData.endDate !== undefined) apiPayload.end_date = sipData.endDate instanceof Date ? sipData.endDate.toISOString() : sipData.endDate;
  if (sipData.fundType !== undefined) apiPayload.fund_type = sipData.fundType;
  if (sipData.units !== undefined) apiPayload.units = sipData.units;
  if (sipData.currentNav !== undefined) apiPayload.current_nav = sipData.currentNav;
  if (sipData.familyMemberId !== undefined) apiPayload.family_member_id = sipData.familyMemberId;
  if (sipData.notes !== undefined) apiPayload.notes = sipData.notes;
  // lastUpdated is usually set by backend
  if (sipData.currentValue !== undefined) apiPayload.current_value = sipData.currentValue;
  if (sipData.returns !== undefined) apiPayload.returns = sipData.returns;
  if (sipData.returnsPercent !== undefined) apiPayload.returns_percent = sipData.returnsPercent;
  if (sipData.type !== undefined) apiPayload.type = sipData.type;
  if (sipData.duration !== undefined) apiPayload.duration = sipData.duration;
  return apiPayload;
};


// Get all SIP investments
export const getSIPInvestments = async (): Promise<SIPInvestment[]> => {
  try {
    // The API is expected to return snake_case data
    const apiInvestments = await executeQuery<any[]>('/sip-investments');
    return apiInvestments.map(mapApiToSipInvestment);
  } catch (error) {
    console.error('Failed to fetch SIP investments from database:', error);
    throw error;
  }
};

// Add a new SIP investment
export const addSIPInvestment = async (investment: Partial<SIPInvestment>): Promise<SIPInvestment> => {
  try {
    const newInvestmentRequest: Partial<SIPInvestment> = { // Work with camelCase internally
      id: investment.id || uuidv4(), // Generate client-side if not provided, API might override/ignore
      name: investment.name || '',
      type: investment.type || 'Mutual Fund', // Matches form
      fundType: investment.fundType || 'Equity', // Matches form
      amount: Number(investment.amount) || 0,
      frequency: investment.frequency || 'Monthly',
      startDate: investment.startDate || new Date().toISOString(),
      endDate: investment.endDate ? (investment.endDate instanceof Date ? investment.endDate.toISOString() : investment.endDate) : undefined,
      duration: investment.duration ? Number(investment.duration) : undefined,
      currentValue: Number(investment.currentValue) || 0,
      returns: Number(investment.returns) || 0,
      returnsPercent: Number(investment.returnsPercent) || 0,
      familyMemberId: investment.familyMemberId || undefined,
      units: investment.units ? Number(investment.units) : undefined,
      currentNav: investment.currentNav ? Number(investment.currentNav) : undefined,
      notes: investment.notes,
    };

    const apiPayload = mapSipInvestmentToApi(newInvestmentRequest);
    
    // API expects camelCase based on its destructuring, but DB stores snake_case
    // The API /sip-investments (POST) needs to handle mapping from its req.body (camelCase) to DB (snake_case)
    // For now, let's assume executeQuery sends the payload as-is, and API handles it.
    // The API will return snake_case data
    const savedApiInvestment = await executeQuery<any>('/sip-investments', 'POST', apiPayload);
    
    const result = mapApiToSipInvestment(savedApiInvestment);
    
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
    const apiPayload = mapSipInvestmentToApi(updates);
    // API will return snake_case data
    const updatedApiInvestment = await executeQuery<any>(`/sip-investments/${id}`, 'PUT', apiPayload);
    
    const result = mapApiToSipInvestment(updatedApiInvestment);
    
    createAuditRecord(id, 'sip', 'update', {
      current: result,
      changes: updates // Log original camelCase updates for audit clarity
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
    const investmentToDelete = await getSIPInvestmentById(id); // This will be camelCase
    if (!investmentToDelete) {
      // This should ideally not happen if called from UI where ID exists
      console.warn(`SIP investment ${id} not found before deletion attempt.`);
    }
    
    // API expects just ID, no payload transformation needed for DELETE method itself
    // The response from API should indicate success. executeQuery handles non-2xx as errors.
    await executeQuery<any>(`/sip-investments/${id}`, 'DELETE'); 
    // Assuming a 200/204 from API on successful delete, executeQuery won't throw for these.
    // If API returns { success: true }, this isn't captured here but success is implied by no error.
    
    if (investmentToDelete) {
        createAuditRecord(id, 'sip', 'delete', investmentToDelete); // Log camelCase data
    } else {
        createAuditRecord(id, 'sip', 'delete', {id}); // Log at least the ID if full data wasn't fetched
    }
    return true;
  } catch (error) {
    console.error(`Failed to delete SIP investment ${id} from database:`, error);
    throw error; // Re-throw to be caught by UI
  }
};

// Get a single SIP investment by ID
export const getSIPInvestmentById = async (id: string): Promise<SIPInvestment | null> => {
  try {
    // API will return snake_case data
    const apiInvestment = await executeQuery<any>(`/sip-investments/${id}`);
    if (!apiInvestment) return null;
    return mapApiToSipInvestment(apiInvestment);
  } catch (error) {
    // If API returns 404, executeQuery might throw DatabaseError.
    // We need to distinguish "not found" from other errors if possible.
    // For now, console log and return null.
    console.error(`Failed to fetch SIP investment ${id} from database:`, error);
    return null;
  }
};
