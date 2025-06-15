import { createAuditRecord } from './auditService';

const API_BASE_URL = '/api/family-members';

// Define the FamilyMember interface
interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  color: string;
  dateOfBirth?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

// Helper to parse dates from API response
const parseFamilyMemberDates = (member: any): FamilyMember => ({
  ...member,
  dateOfBirth: member.dateOfBirth ? new Date(member.dateOfBirth) : null,
  createdAt: new Date(member.createdAt),
  updatedAt: new Date(member.updatedAt),
});

// CRUD operations for Family Members - PostgreSQL only
export const createFamilyMember = async (memberData: Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt'>): Promise<FamilyMember> => {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(memberData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to create family member' }));
    throw new Error(errorData.message || 'Failed to create family member');
  }
  const newMember = await response.json();
  const parsedMember = parseFamilyMemberDates(newMember);
  createAuditRecord(parsedMember.id, 'familyMember', 'create', parsedMember);
  return parsedMember;
};

export const updateFamilyMember = async (id: string, updates: Partial<Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt'>>): Promise<FamilyMember | null> => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });
  if (!response.ok) {
    if (response.status === 404) return null;
    const errorData = await response.json().catch(() => ({ message: 'Failed to update family member' }));
    throw new Error(errorData.message || 'Failed to update family member');
  }
  const updatedMember = await response.json();
  const parsedMember = parseFamilyMemberDates(updatedMember);
  createAuditRecord(id, 'familyMember', 'update', {
    current: parsedMember,
    changes: updates
  });
  return parsedMember;
};

export const deleteFamilyMember = async (id: string): Promise<boolean> => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    if (response.status === 404) return false; // Not found is not an error for delete, but indicates failure
    // Handle other errors (e.g., 409 Conflict if member is referenced)
    const errorData = await response.json().catch(() => ({ message: 'Failed to delete family member' }));
    console.error('Error deleting family member:', errorData);
    // Rethrow a more specific error or return false based on how UI should react
    throw new Error(errorData.error || errorData.message || 'Failed to delete family member');
  }
  createAuditRecord(id, 'familyMember', 'delete', { id });
  // Backend returns { success: true, message: ... } or 204 No Content usually
  return response.status === 200 || response.status === 204;
};

export const getFamilyMemberById = async (id: string): Promise<FamilyMember | null> => {
  console.log('Fetching family member by ID via API:', id);
  const response = await fetch(`${API_BASE_URL}/${id}`);
  if (!response.ok) {
    if (response.status === 404) {
      console.log(`Family member with ID ${id} not found via API.`);
      return null;
    }
    const errorData = await response.json().catch(() => ({ message: `Failed to fetch family member ${id}` }));
    throw new Error(errorData.message || `Failed to fetch family member ${id}`);
  }
  const member = await response.json();
  return parseFamilyMemberDates(member);
};

export const getFamilyMembers = async (): Promise<FamilyMember[]> => {
  console.log('Fetching all family members via API');
  const response = await fetch(API_BASE_URL);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to fetch family members' }));
    throw new Error(errorData.message || 'Failed to fetch family members');
  }
  const members = await response.json();
  return members.map(parseFamilyMemberDates);
};

export const getActiveFamilyMembers = async (): Promise<FamilyMember[]> => {
  // Fetch all and filter on the client
  console.log('Fetching active family members (all then filtering)');
  const allMembers = await getFamilyMembers();
  return allMembers.filter(member => member.isActive);
};

export const getDefaultFamilyMemberId = async (): Promise<string> => {
  try {
    // Try to get the 'Self' member from the database
    const members = await getActiveFamilyMembers();
    const selfMember = members.find(m => m.relationship === 'Self');
    if (selfMember) {
      return selfMember.id;
    }
    
    // If no 'Self' member found, return the first active member
    if (members.length > 0) {
      return members[0].id;
    }
    
    // If no active members, return the first family member (active or not)
    const allMembers = await getFamilyMembers();
    if (allMembers.length > 0) {
      return allMembers[0].id;
    }
    
    // If no family members at all, return a fallback ID
    return "fam-001"; // Assuming 'fam-001' is created in the seed data
  } catch (error) {
    console.error("Error getting default family member ID:", error);
    return "fam-001"; // Fallback to a known ID
  }
};
