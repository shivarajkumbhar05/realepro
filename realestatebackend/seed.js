/**
 * Seed Script — creates default admin user
 * Run: node seed.js
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      console.log('⚠️  Admin user already exists:', adminExists.email);
      process.exit(0);
    }

    const admin = await User.create({
      name: 'Super Admin',
      email: 'admin@realestate.com',
      password: 'Admin@123',
      role: 'admin',
      phone: '9999999999',
    });

    console.log('✅ Admin user created:');
    console.log('   Email   :', admin.email);
    console.log('   Password: Admin@123');
    console.log('   Role    :', admin.role);
    console.log('\n⚠️  Please change the password after first login!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
};

seedAdmin();
