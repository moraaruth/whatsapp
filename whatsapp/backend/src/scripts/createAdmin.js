require('dotenv').config();
const connectDB = require('../../config/database');
const User = require('../../models/User');
const config = require('../../config/config');

const createAdmin = async () => {
  try {
    await connectDB();

    const admin = await User.findOne({ email: 'admin@whatsappleadtracker.com' });

    if (admin) {
      console.log('Admin user already exists');
      return;
    }

    const newUser = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@whatsappleadtracker.com',
      phoneNumber: '254712345678',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      role: 'admin',
      isActive: true,
      isVerified: true,
    });

    await newUser.save();

    console.log('Admin user created successfully!');
    console.log('Email: admin@whatsappleadtracker.com');
    console.log('Password:', process.env.ADMIN_PASSWORD || 'admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();
