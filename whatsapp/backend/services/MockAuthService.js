const jwt = require('jsonwebtoken');
const config = require('../config/config');

// Mock user storage (in-memory)
const users = [
  {
    _id: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@whatsappleadtracker.com',
    phoneNumber: '254707438317',
    password: '$2a$10$mockhashedpassword', // This is a placeholder - we'll bypass password check
    role: 'admin',
    isActive: true,
    isVerified: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

class AuthService {
  async register(userData) {
    const { firstName, lastName, email, phoneNumber, password } = userData;

    // Check if user already exists
    const existingUser = users.find(u => 
      u.email === email || u.phoneNumber === phoneNumber
    );

    if (existingUser) {
      throw new Error('User with this email or phone number already exists');
    }

    // Create user
    const user = {
      _id: `user_${Date.now()}`,
      firstName,
      lastName,
      email,
      phoneNumber,
      password: password, // In mock mode, store plain password (not secure for production!)
      role: 'user',
      isActive: true,
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    users.push(user);

    // Generate token
    const token = this.generateToken(user);

    return {
      user: this.getPublicProfile(user),
      token,
    };
  }

  async login(emailOrPhone, password) {
    // Find user
    const user = users.find(u => 
      u.email === emailOrPhone || u.phoneNumber === emailOrPhone
    );

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // In mock mode, skip password check for easier testing
    // For production, use: const isPasswordValid = await user.comparePassword(password);
    const isPasswordValid = true; // Bypass password check for mock mode

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    user.lastLogin = new Date();
    user.updatedAt = new Date();

    // Generate token
    const token = this.generateToken(user);

    return {
      user: this.getPublicProfile(user),
      token,
    };
  }

  getPublicProfile(user) {
    const { password, ...publicUser } = user;
    return publicUser;
  }

  generateToken(user) {
    return jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  }

  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  async getUserById(userId) {
    const user = users.find(u => u._id === userId);
    if (user) {
      return this.getPublicProfile(user);
    }
    return null;
  }

  async updateProfile(userId, updateData) {
    const user = users.find(u => u._id === userId);
    if (!user) {
      throw new Error('User not found');
    }

    const allowedUpdates = ['firstName', 'lastName', 'email', 'phoneNumber', 'company', 'industry', 'whatsappBusinessNumber'];
    
    const updates = {};
    Object.keys(updateData).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = updateData[key];
      }
    });

    Object.assign(user, updates, { updatedAt: new Date() });

    return this.getPublicProfile(user);
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = users.find(u => u._id === userId);
    if (!user) {
      throw new Error('User not found');
    }

    // In mock mode, skip current password check
    user.password = newPassword;
    user.updatedAt = new Date();

    return { message: 'Password changed successfully' };
  }
}

module.exports = new AuthService();
