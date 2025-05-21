/**
 * Authentication API Implementation
 */
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

// In-memory token store
const tokens = new Map();

// Generate a JWT-like token (simplified for demo)
const generateToken = (userId) => {
  const token = uuidv4();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24); // 24-hour expiry
  
  tokens.set(token, {
    userId,
    expiresAt
  });
  
  return token;
};

// Verify and validate a token
const verifyToken = (token) => {
  if (!tokens.has(token)) {
    return null;
  }
  
  const tokenData = tokens.get(token);
  
  if (new Date() > tokenData.expiresAt) {
    tokens.delete(token);
    return null;
  }
  
  return tokenData.userId;
};

// Login endpoint
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Find user by email - use the global users array from the app context
    const users = req.app.locals.users || [];
    const user = users.find(u => u.email === email);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Check if the user has a passwordHash
    if (!user.passwordHash) {
      // For demo users without a hashed password, check if it's one of our test users
      if (email === 'user@example.com' && password === 'password') {
        const token = generateToken(user.id);
        return res.json({
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          },
          requiresTwoFactor: false
        });
      } else if (email === 'test@example.com' && password === 'password') {
        const token = generateToken(user.id);
        return res.json({
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          },
          requiresTwoFactor: true
        });
      }
      
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Verify password with bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Check if 2FA is required
    if (user.has2FAEnabled) {
      // Generate and return token, but indicate 2FA is required
      const token = generateToken(user.id);
      
      return res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        requiresTwoFactor: true
      });
    }
    
    // Generate and return token
    const token = generateToken(user.id);
    
    // Update last login time
    user.lastLogin = new Date().toISOString();
    
    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      requiresTwoFactor: false
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Two-factor authentication verification
const verifyTwoFactor = (req, res) => {
  try {
    const { code, token } = req.body;
    
    if (!code || !token) {
      return res.status(400).json({ error: 'Code and token are required' });
    }
    
    // Verify the token is valid
    const userId = verifyToken(token);
    
    if (!userId) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    // In a real app, we would validate the code against a stored OTP
    // For demo purposes, accept any 6-digit code
    if (code.length !== 6 || !/^\d+$/.test(code)) {
      return res.status(400).json({ error: 'Invalid code format. 6 digits required.' });
    }
    
    // Generate a new token that's marked as fully authenticated
    const newToken = generateToken(userId);
    
    return res.json({
      token: newToken,
      success: true
    });
  } catch (error) {
    console.error('2FA verification error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Logout endpoint
const logout = (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(400).json({ error: 'Invalid authorization header' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Check if token exists before deleting
    if (!tokens.has(token)) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    // Remove token from the token store
    tokens.delete(token);
    
    return res.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Refresh token endpoint
const refreshToken = (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }
    
    // In a real implementation, we would validate against a stored refresh token
    // For demo, we'll just reuse the verifyToken mechanism
    const userId = verifyToken(refreshToken);
    
    if (!userId) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }
    
    // Generate a new token
    const newToken = generateToken(userId);
    
    return res.json({ token: newToken });
  } catch (error) {
    console.error('Token refresh error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a middleware to verify authentication for protected routes
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const token = authHeader.split(' ')[1];
    const userId = verifyToken(token);
    
    if (!userId) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    // Add the user ID to the request for use in route handlers
    req.userId = userId;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Export the authentication functions
export {
  login,
  logout,
  verifyTwoFactor,
  refreshToken,
  authMiddleware,
  verifyToken
};
