
import { v4 as uuidv4 } from 'uuid';
import { User, UserCreatePayload, UserUpdatePayload } from '@/types/user';
import { createAuditRecord } from './auditService';
import { isPostgresEnabled } from './db/dbConnector';
import * as userDbService from './db/userDbService';

const USER_STORAGE_KEY = 'users';

// Load users from localStorage
const loadUsers = (): User[] => {
  try {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    const users = stored ? JSON.parse(stored) : [];
    
    // Convert date strings back to Date objects
    return users.map((user: any) => ({
      ...user,
      createdAt: new Date(user.createdAt),
      lastLogin: user.lastLogin ? new Date(user.lastLogin) : null
    }));
  } catch (error) {
    console.error('Error loading users:', error);
    return [];
  }
};

// Save users to localStorage
const saveUsers = (users: User[]): void => {
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('Error saving users:', error);
  }
};

// In-memory datastore with persistence
let users = loadUsers();

// Create a sample user if none exist (only for localStorage mode)
if (users.length === 0 && !isPostgresEnabled()) {
  const sampleUser: User = {
    id: uuidv4(),
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin',
    createdAt: new Date(),
    lastLogin: new Date(),
    has2FAEnabled: false,
    settings: {
      darkMode: false,
      notifications: true
    }
  };
  
  users.push(sampleUser);
  saveUsers(users);
}

// Check if we should use database operations
const useDatabase = isPostgresEnabled();

// CRUD operations for Users with conditional DB/localStorage usage
export const createUser = async (userData: UserCreatePayload): Promise<User> => {
  if (useDatabase) {
    return await userDbService.addUser(userData);
  }
  
  // Check if email already exists
  if (users.some(user => user.email === userData.email)) {
    throw new Error('Email already in use');
  }
  
  const newUser: User = {
    id: uuidv4(),
    name: userData.name,
    email: userData.email,
    role: userData.role || 'user',
    createdAt: new Date(),
    lastLogin: null,
    has2FAEnabled: userData.has2FAEnabled || false,
    settings: {
      darkMode: userData.settings?.darkMode ?? false,
      notifications: userData.settings?.notifications ?? true,
      ...(userData.settings || {})
    }
  };
  
  users.push(newUser);
  saveUsers(users);
  createAuditRecord(newUser.id, 'user', 'create', newUser);
  return newUser;
};

export const updateUser = async (id: string, updates: UserUpdatePayload): Promise<User | null> => {
  if (useDatabase) {
    return await userDbService.updateUser(id, updates);
  }
  
  const index = users.findIndex(user => user.id === id);
  if (index === -1) return null;
  
  const originalUser = { ...users[index] };
  
  users[index] = {
    ...users[index],
    ...updates,
    settings: updates.settings ? {
      ...users[index].settings,
      ...updates.settings
    } : users[index].settings
  };
  
  saveUsers(users);
  createAuditRecord(id, 'user', 'update', {
    previous: originalUser,
    current: users[index],
    changes: updates
  });
  
  return users[index];
};

export const deleteUser = async (id: string): Promise<boolean> => {
  if (useDatabase) {
    return await userDbService.deleteUser(id);
  }
  
  const index = users.findIndex(user => user.id === id);
  if (index === -1) return false;
  
  const deletedUser = users[index];
  users.splice(index, 1);
  
  saveUsers(users);
  createAuditRecord(id, 'user', 'delete', deletedUser);
  return true;
};

export const getUserById = async (id: string): Promise<User | null> => {
  if (useDatabase) {
    return await userDbService.getUserById(id);
  }
  
  return users.find(user => user.id === id) || null;
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  if (useDatabase) {
    return await userDbService.getUserByEmail(email);
  }
  
  return users.find(user => user.email === email) || null;
};

export const getUsers = async (): Promise<User[]> => {
  if (useDatabase) {
    return await userDbService.getUsers();
  }
  
  return Promise.resolve([...users]);
};

// Alias for addUser to maintain compatibility with existing code
export const addUser = async (userData: UserCreatePayload): Promise<User> => {
  return await createUser(userData);
};
