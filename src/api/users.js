/**
 * Users API Implementation
 */
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

// In-memory data store for development
let users = [
  {
    id: 'user-001',
    name: 'Kaushik Thanki',
    email: 'thanki.kaushik@gmail.com',
    passwordHash: '$2a$10$dPzE4X4FHDYgWWhVzrZAO.f8ZimRWOkr31b/fbwYhh52w2kJ1H5TG', // hashed password for 'password123'
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
  }
];

console.log('USERS INITIALIZED:', users);

// Get all users with optional filters
const getAllUsers = (req, res) => {
  try {
    const { role } = req.query;
    let filteredUsers = [...users];
    
    if (role) {
      filteredUsers = filteredUsers.filter(user => user.role === role);
    }
    
    // Don't send sensitive information like passwords
    const sanitizedUsers = filteredUsers.map(user => {
      const { passwordHash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    
    res.json(sanitizedUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a specific user by ID
const getUserById = (req, res) => {
  try {
    const { id } = req.params;
    const user = users.find(u => u.id === id);
    
    if (!user) {
      return res.status(404).json({ error: `User with ID ${id} not found` });
    }
    
    // Don't send sensitive information
    const { passwordHash, ...userWithoutPassword } = user;
    
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new user
const createUser = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, // We will hash this
      role,
      has2FAEnabled,
      settings
    } = req.body;
    
    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields (name, email, and password)' });
    }
    
    // Check if email already exists
    if (users.some(user => user.email === email)) {
      return res.status(400).json({ error: 'Email already in use' });
    }
    
    // Hash the password with bcrypt (10 rounds of salting)
    const passwordHash = await bcrypt.hash(password, 10);
    
    const newUser = {
      id: `user-${uuidv4().slice(0, 8)}`,
      name,
      email,
      passwordHash, // Store the hashed password
      role: role || 'user', // Default role
      createdAt: new Date().toISOString(),
      lastLogin: null,
      has2FAEnabled: has2FAEnabled || false,
      settings: settings || {
        darkMode: false,
        notifications: true
      }
    };
    
    users.push(newUser);
    
    // Don't send sensitive information
    const { passwordHash: _, ...userWithoutPassword } = newUser;
    
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update an existing user
const updateUser = (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const userIndex = users.findIndex(user => user.id === id);
    
    if (userIndex === -1) {
      return res.status(404).json({ error: `User with ID ${id} not found` });
    }
    
    // Don't allow direct update of sensitive fields
    const { passwordHash, ...safeUpdateData } = updateData;
    
    // Update only the fields provided in the request body
    users[userIndex] = {
      ...users[userIndex],
      ...safeUpdateData,
      lastUpdated: new Date().toISOString()
    };
    
    // Don't send sensitive information in response
    const { passwordHash: _, ...userWithoutPassword } = users[userIndex];
    
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a user
const deleteUser = (req, res) => {
  try {
    const { id } = req.params;
    const initialLength = users.length;
    
    users = users.filter(user => user.id !== id);
    
    if (users.length === initialLength) {
      return res.status(404).json({ error: `User with ID ${id} not found` });
    }
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update user password - separate endpoint for security
const updateUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;
    
    // Validate input
    if (!newPassword) {
      return res.status(400).json({ error: 'New password is required' });
    }
    
    const userIndex = users.findIndex(user => user.id === id);
    
    if (userIndex === -1) {
      return res.status(404).json({ error: `User with ID ${id} not found` });
    }
    
    // If the user has a password hash, verify the current password
    if (users[userIndex].passwordHash && currentPassword) {
      const isPasswordValid = await bcrypt.compare(currentPassword, users[userIndex].passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }
    }
    
    // Hash the new password
    const passwordHash = await bcrypt.hash(newPassword, 10);
    users[userIndex].passwordHash = passwordHash;
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Reset user password (for admins or password recovery)
const resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    
    // Validate input
    if (!newPassword) {
      return res.status(400).json({ error: 'New password is required' });
    }
    
    const userIndex = users.findIndex(user => user.id === id);
    
    if (userIndex === -1) {
      return res.status(404).json({ error: `User with ID ${id} not found` });
    }
    
    // Hash the new password
    const passwordHash = await bcrypt.hash(newPassword, 10);
    users[userIndex].passwordHash = passwordHash;
    
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserPassword,
  resetUserPassword,
  users
};
