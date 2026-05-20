require('dotenv').config();
const connectDB = require('../../config/database');
const User = require('../../models/User');
const Subscription = require('../../models/Subscription');

const seedData = async () => {
  try {
    await connectDB();

    // Create sample users
    const users = [
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phoneNumber: '254712345678',
        password: 'password123',
        company: 'Example Business Ltd',
        industry: 'Retail',
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        phoneNumber: '254723456789',
        password: 'password123',
        company: 'Smith Enterprises',
        industry: 'Real Estate',
      },
    ];

    for (const userData of users) {
      const existingUser = await User.findOne({ email: userData.email });
      
      if (!existingUser) {
        const user = new User({
          ...userData,
          role: 'user',
          isActive: true,
          isVerified: true,
        });
        await user.save();
        console.log(`Created user: ${user.email}`);

        // Create subscription for user
        const subscription = new Subscription({
          userId: user._id,
          plan: 'BASIC',
          status: 'ACTIVE',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          monthlyPrice: 1000,
          mpesaPhoneNumber: user.phoneNumber,
          autoRenew: true,
        });
        await subscription.save();
        console.log(`Created subscription for ${user.email}`);
      }
    }

    console.log('Seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
