const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/config');

class AuthService {
  async register(userData) {
    const { firstName, lastName, email, phoneNumber, password } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phoneNumber }],
    });

    if (existingUser) {
      throw new Error('User with this email or phone number already exists');
    }

    // Create user
    const user = new User({
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
      role: 'user',
      isActive: true,
      isVerified: true, // Auto-verify for now
    });

    await user.save();

    // Create subscription with trial
    const SubscriptionService = require('./SubscriptionService');
    await SubscriptionService.createSubscription(
      user._id,
      null,
      null,
      'BASIC'
    );

    // Generate token
    const token = this.generateToken(user);

    return {
      user: user.getPublicProfile(),
      token,
    };
  }

  async login(emailOrPhone, password) {
    // Find user
    const user = await User.findOne({
      $or: [{ email: emailOrPhone }, { phoneNumber: emailOrPhone }],
    }).select('+password');

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = this.generateToken(user);

    return {
      user: user.getPublicProfile(),
      token,
    };
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
    return await User.findById(userId).select('-password');
  }

  async updateProfile(userId, updateData) {
    const allowedUpdates = ['firstName', 'lastName', 'email', 'phoneNumber', 'company', 'industry', 'whatsappBusinessNumber'];
    
    const updates = {};
    Object.keys(updateData).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = updateData[key];
      }
    });

    const user = await User.findByIdAndUpdate(userId, updates, { new: true }).select('-password');

    return user;
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+password');

    if (!user) {
      throw new Error('User not found');
    }

    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();

    return { message: 'Password changed successfully' };
  }
}

module.exports = new AuthService();
