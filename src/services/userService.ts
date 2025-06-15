import { v4 as uuidv4 } from 'uuid';
import { User, UserCreatePayload, UserUpdatePayload } from '@/types/user';
import { createAuditRecord } from './auditService';
import { executeQuery } from './db/dbConnector';

// CRUD operations for Users
export const getUsers = async (): Promise<User[]> => {
  try {
    return await executeQuery<User[]>('/users');
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const getUserById = async (id: string): Promise<User | null> => {
  try {
    return await executeQuery<User>(`/users/${id}`);
  } catch (error) {
    console.error(`Error fetching user ${id}:`, error);
    throw error;
  }
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    return await executeQuery<User>(`/users/email/${email}`);
  } catch (error) {
    console.error(`Error fetching user with email ${email}:`, error);
    throw error;
  }
};

export const createUser = async (userData: UserCreatePayload): Promise<User> => {
  try {
    const newUser = {
      ...userData,
      id: userData.id || `user-${uuidv4()}`,
      createdAt: new Date(),
      lastLogin: null,
      has2FAEnabled: userData.has2FAEnabled || false
    };
    
    const createdUser = await executeQuery<User>('/users', 'POST', newUser);
    
    await createAuditRecord(
      createdUser.id,
      'user',
      'create',
      {
        email: createdUser.email,
        role: createdUser.role
      }
    );
    
    return createdUser;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const updateUser = async (id: string, updates: UserUpdatePayload): Promise<User | null> => {
  try {
    // Get the original user for audit
    const originalUser = await getUserById(id);
    
    if (!originalUser) {
      throw new Error(`User with ID ${id} not found`);
    }
    
    const updatedUser = await executeQuery<User>(`/users/${id}`, 'PUT', updates);
    
    await createAuditRecord(
      id,
      'user',
      'update',
      {
        original: originalUser,
        current: updatedUser,
        changes: Object.keys(updates)
      }
    );
    
    return updatedUser;
  } catch (error) {
    console.error(`Error updating user ${id}:`, error);
    throw error;
  }
};

export const deleteUser = async (id: string): Promise<boolean> => {
  try {
    // Get the original user for audit
    const originalUser = await getUserById(id);
    
    if (!originalUser) {
      throw new Error(`User with ID ${id} not found`);
    }
    
    await executeQuery(`/users/${id}`, 'DELETE');
    
    await createAuditRecord(
      id,
      'user',
      'delete',
      {
        deleted: {
          id: originalUser.id,
          email: originalUser.email,
          role: originalUser.role
        }
      }
    );
    
    return true;
  } catch (error) {
    console.error(`Error deleting user ${id}:`, error);
    throw error;
  }
};

export const updateLastLogin = async (id: string): Promise<User | null> => {
  try {
    return await updateUser(id, { lastLogin: new Date() });
  } catch (error) {
    console.error(`Error updating last login for user ${id}:`, error);
    throw error;
  }
};

export const update2FAStatus = async (id: string, status: boolean): Promise<User | null> => {
  try {
    return await updateUser(id, { has2FAEnabled: status });
  } catch (error) {
    console.error(`Error updating 2FA status for user ${id}:`, error);
    throw error;
  }
};

export const getAdminUser = async (): Promise<User | null> => {
  try {
    const users = await getUsers();
    return users.find(user => user.role === 'admin') || null;
  } catch (error) {
    console.error('Error getting admin user:', error);
    throw error;
  }
};

// Alias for backward compatibility
export const addUser = createUser;
