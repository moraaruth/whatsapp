require('dotenv').config();
const connectDB = require('../../config/database');
const User = require('../../models/User');

const resetAdmin = async () => {
  try {
    await connectDB();

    // Delete existing admin
    await User.deleteOne({ email: 'admin@whatsappleadtracker.com' });
    console.log('Deleted existing admin user (if any)');

    // Create fresh admin - let MongoDB auto-generate _id
    const newUser = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@whatsappleadtracker.com',
      phoneNumber: '254707438317',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      role: 'admin',
      isActive: true,
      isVerified: true,
    });

    await newUser.save();

    console.log('Admin user created successfully!');
    console.log('Email: admin@whatsappleadtracker.com');
    console.log('Password:', process.env.ADMIN_PASSWORD || 'admin123');
    console.log('_id:', newUser._id.toString());

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

resetAdmin();
