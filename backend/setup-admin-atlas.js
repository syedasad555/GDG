require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const GDGMember = require('./models/GDGMember');

async function setupAdmin() {
  try {
    // Connect to MongoDB Atlas
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✓ Connected to MongoDB Atlas');

    // Admin credentials
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@gdg.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const adminName = process.env.ADMIN_NAME || 'Admin User';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    // Delete existing admin if exists to start fresh
    await User.deleteOne({ email: adminEmail.toLowerCase().trim() });
    console.log('Cleared any existing admin user...');

    // Create new admin user - password will be hashed by pre-save hook
    console.log('Creating new admin user...');
    const admin = new User({
      name: adminName,
      email: adminEmail.toLowerCase().trim(),
      password: adminPassword, // Will be hashed automatically by pre-save hook
      role: 'admin',
      isGDGMember: true,
    });
    // Skip validation for admin (no rollNumber, branch, etc. required)
    await admin.save({ validateBeforeSave: false });
    console.log('✓ Created new admin user');

    // Add/Update admin in GDG members collection
    const existingMember = await GDGMember.findOne({ email: adminEmail.toLowerCase() });
    if (existingMember) {
      existingMember.name = adminName;
      existingMember.role = 'Core Team';
      await existingMember.save();
      console.log('✓ Updated GDG member record');
    } else {
      await GDGMember.create({
        name: adminName,
        email: adminEmail.toLowerCase(),
        rollNumber: 'ADMIN001',
        branch: 'Administration',
        year: 4,
        role: 'Core Team'
      });
      console.log('✓ Created GDG member record');
    }

    console.log('\n✅ Admin setup complete!');
    console.log(`\n📧 Email: ${adminEmail}`);
    console.log(`🔑 Password: ${adminPassword}`);
    console.log('\n⚠️  Please change the password after first login for security!');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error setting up admin:', err.message);
    process.exit(1);
  }
}

setupAdmin();
