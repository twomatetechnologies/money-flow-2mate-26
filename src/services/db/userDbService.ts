
/**
 * User service for database operations
 */
import { v4 as uuidv4 } from 'uuid';
import { User, UserCreatePayload, UserUpdatePayload } from '@/types/user';
import { executeQuery } from './dbConnector';
import { createAuditRecord } from '../auditService';

// Get all users
export const getUsers = async (): Promise<User[]> => {
  try {
    const users = await executeQuery<User[]>('/users');
    
    // Convert date strings to Date objects
    return users.map(user => ({
      ...user,
      createdAt: new Date(user.createdAt),
      lastLogin: user.lastLogin ? new Date(user.lastLogin) : null
    }));
  } catch (error) {
    console.error('Failed to fetch users from database:', error);
    throw error;
  }
};

// Add a new user
export const addUser = async (userData: UserCreatePayload): Promise<User> => {
  try {
    const newUser = {
      id: uuidv4(),
      name: userData.name,
      email: userData.email,
      role: userData.role || 'user',
      createdAt: new Date(),
      lastLogin: null,
      has2FAEnabled: userData.has2FAEnabled || false,
      settings: userData.settings || {
        darkMode: false,
        notifications: true
      }
    };
    
    const savedUser = await executeQuery<User>('/users', 'POST', newUser);
    
    // Convert date strings to Date objects
    const result = {
      ...savedUser,
      createdAt: new Date(savedUser.createdAt),
      lastLogin: savedUser.lastLogin ? new Date(savedUser.lastLogin) : null
    };
    
    createAuditRecord(result.id, 'user', 'create', result);
    return result;
  } catch (error) {
    console.error('Failed to add user to database:', error);
    throw error;
  }
};

// Update an existing user
export const updateUser = async (id: string, updates: UserUpdatePayload): Promise<User> => {
  try {
    const updatedUser = await executeQuery<User>(`/users/${id}`, 'PUT', updates);
    
    // Convert date strings to Date objects
    const result = {
      ...updatedUser,
      createdAt: new Date(updatedUser.createdAt),
      lastLogin: updatedUser.lastLogin ? new Date(updatedUser.lastLogin) : null
    };
    
    createAuditRecord(id, 'user', 'update', {
      current: result,
      changes: updates
    });
    
    return result;
  } catch (error) {
    console.error(`Failed to update user ${id} in database:`, error);
    throw error;
  }
};

// Delete a user
export const deleteUser = async (id: string): Promise<boolean> => {
  try {
    await executeQuery(`/users/${id}`, 'DELETE');
    createAuditRecord(id, 'user', 'delete', { id });
    return true;
  } catch (error) {
    console.error(`Failed to delete user ${id} from database:`, error);
    throw error;
  }
};

// Get a single user by ID
export const getUserById = async (id: string): Promise<User | null> => {
  try {
    const user = await executeQuery<User>(`/users/${id}`);
    
    // Convert date strings to Date objects
    return {
      ...user,
      createdAt: new Date(user.createdAt),
      lastLogin: user.lastLogin ? new Date(user.lastLogin) : null
    };
  } catch (error) {
    console.error(`Failed to fetch user ${id} from database:`, error);
    return null;
  }
};

// Get a user by email
export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    // This is a simplified implementation since we're using REST API
    // In a real database, we would use a query parameter or filter
    const users = await getUsers();
    const user = users.find(u => u.email === email);
    return user || null;
  } catch (error) {
    console.error(`Failed to fetch user with email ${email} from database:`, error);
    return null;
  }
};
