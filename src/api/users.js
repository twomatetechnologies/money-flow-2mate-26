
/**
 * Users API Implementation
 */
import { v4 as uuidv4 } from 'uuid';

// In-memory data store for development
let users = [
  {
    id: 'user-001',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin',
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: '2024-05-11T00:00:00Z',
    has2FAEnabled: false,
    settings: {
      darkMode: false,
      notifications: true
    }
  }
];

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
const createUser = (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, // We will not store raw password
      role,
      has2FAEnabled,
      settings
    } = req.body;
    
    // Basic validation
    if (!name || !email) {
      return res.status(400).json({ error: 'Missing required fields (name and email)' });
    }
    
    // Check if email already exists
    if (users.some(user => user.email === email)) {
      return res.status(400).json({ error: 'Email already in use' });
    }
    
    const newUser = {
      id: `user-${uuidv4().slice(0, 8)}`,
      name,
      email,
      role: role || 'user', // Default role
      createdAt: new Date().toISOString(),
      lastLogin: null,
      has2FAEnabled: has2FAEnabled || false,
      settings: settings || {
        darkMode: false,
        notifications: true
      },
      // In a real app, we would hash the password
      // passwordHash: await bcrypt.hash(password, 10)
    };
    
    users.push(newUser);
    
    // Don't send sensitive information
    const { passwordHash, ...userWithoutPassword } = newUser;
    
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
const updateUserPassword = (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;
    
    const userIndex = users.findIndex(user => user.id === id);
    
    if (userIndex === -1) {
      return res.status(404).json({ error: `User with ID ${id} not found` });
    }
    
    // In a real app, we would verify the current password and hash the new one
    // const isPasswordValid = await bcrypt.compare(currentPassword, users[userIndex].passwordHash);
    // if (!isPasswordValid) {
    //   return res.status(401).json({ error: 'Current password is incorrect' });
    // }
    // users[userIndex].passwordHash = await bcrypt.hash(newPassword, 10);
    
    res.json({ message: 'Password updated successfully' });
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
  updateUserPassword
};
