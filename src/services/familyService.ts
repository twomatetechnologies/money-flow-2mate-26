import { FamilyMember } from '@/types';

const API_BASE_URL = '/api/family-members';

// Helper to parse dates from API response
const parseFamilyMemberDates = (member: any): FamilyMember => ({
  ...member,
  dateOfBirth: member.dateOfBirth ? new Date(member.dateOfBirth) : null,
  createdAt: new Date(member.createdAt),
  updatedAt: new Date(member.updatedAt),
});

// In-memory datastore for family members
let familyMembers: FamilyMember[] = [
  {
    id: "self-default",
    name: "Self",
    relationship: "Self",
    color: "#3b82f6", // blue
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true
  },
  {
    id: "spouse-default",
    name: "Spouse",
    relationship: "Spouse",
    color: "#ec4899", // pink
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true
  },
  {
    id: "parent-default",
    name: "Parent",
    relationship: "Parent",
    color: "#14b8a6", // teal
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true
  }
];

// CRUD operations for Family Members
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
  return parseFamilyMemberDates(newMember);
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
  return parseFamilyMemberDates(updatedMember);
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
  // Backend returns { success: true, message: ... } or 204 No Content usually
  // If 200 with body:
  // const result = await response.json();
  // return result.success;
  // If 204:
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
  // The backend API GET /family-members currently returns all.
  // We can add a query param ?isActive=true to the API later if needed for optimization.
  // For now, fetch all and filter on the client.
  console.log('Fetching active family members (all then filtering)');
  const allMembers = await getFamilyMembers();
  return allMembers.filter(member => member.isActive);
};

export const getDefaultFamilyMemberId = (): string => {
  // This can remain client-side logic as it might be a user preference
  // or a default setting not tied to a specific existing member's ID from DB,
  // especially if it refers to a conceptual "Self" that might be created
  // if not present. However, the backend seed data now includes 'fam-001' as 'Self'.
  // Let's ensure this matches or can be configured.
  // For now, keeping as is, but this might need adjustment based on how "default" is truly defined.
  // The current `migrate-postgres.sh` creates 'fam-001' for 'John Smith' (Self).
  // If we want a generic default, this might need to fetch a member named 'Self' or similar.
  // Sticking to the old default "self-default" might cause issues if no such ID exists in DB.
  // Let's assume for now, the UI will handle selecting a valid member.
  // A better approach would be to fetch members and pick one, or have settings.
  // For now, return a known ID from seed data if that's the intent.
  return "fam-001"; // Assuming 'fam-001' is 'Self' or the primary user.
};
