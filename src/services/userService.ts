
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
    let users = stored ? JSON.parse(stored) : [];
    
    // If no users exist, add the admin user
    if (users.length === 0) {
      users = [{
        id: 'user-001',
        name: 'Kaushik Thanki',
        email: 'thanki.kaushik@gmail.com',
        // This is the same hashed password as in the backend
        passwordHash: '$2a$10$dPzE4X4FHDYgWWhVzrZAO.f8ZimRWOkr31b/fbwYhh52w2kJ1H5TG',
        role: 'admin',
        createdAt: new Date().toISOString(),
        lastLogin: null,
        has2FAEnabled: false,
        settings: {
          darkMode: false,
          notifications: true,
          stockPriceAlertThreshold: 5.0,
          appName: 'Money Flow Guardian',
          stockApiKey: 'LR78N65XUDF2EZDB'
        }
      }];
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));
    }
    
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
