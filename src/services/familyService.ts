
import { v4 as uuidv4 } from 'uuid';
import { FamilyMember } from '@/types';
import { createAuditRecord } from './auditService';

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
export const createFamilyMember = (member: Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt'>): FamilyMember => {
  const now = new Date();
  const newMember: FamilyMember = {
    ...member,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now
  };
  
  familyMembers.push(newMember);
  createAuditRecord(newMember.id, 'familyMember', 'create', newMember);
  return newMember;
};

export const updateFamilyMember = (id: string, updates: Partial<FamilyMember>): FamilyMember | null => {
  const index = familyMembers.findIndex(member => member.id === id);
  if (index === -1) return null;
  
  const originalMember = { ...familyMembers[index] };
  
  familyMembers[index] = {
    ...familyMembers[index],
    ...updates,
    updatedAt: new Date()
  };
  
  createAuditRecord(id, 'familyMember', 'update', {
    previous: originalMember,
    current: familyMembers[index],
    changes: updates
  });
  
  return familyMembers[index];
};

export const deleteFamilyMember = (id: string): boolean => {
  const index = familyMembers.findIndex(member => member.id === id);
  if (index === -1) return false;
  
  const deletedMember = familyMembers[index];
  familyMembers.splice(index, 1);
  
  createAuditRecord(id, 'familyMember', 'delete', deletedMember);
  return true;
};

export const getFamilyMemberById = (id: string): FamilyMember | null => {
  return familyMembers.find(member => member.id === id) || null;
};

export const getFamilyMembers = (): Promise<FamilyMember[]> => {
  return Promise.resolve(familyMembers);
};

export const getActiveFamilyMembers = (): Promise<FamilyMember[]> => {
  return Promise.resolve(familyMembers.filter(member => member.isActive));
};

export const getDefaultFamilyMemberId = (): string => {
  return "self-default"; // Default to self
};
