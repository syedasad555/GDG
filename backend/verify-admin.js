require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function verifyAdmin() {
  try {
    // Connect to MongoDB Atlas
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✓ Connected to MongoDB Atlas\n');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@gdg.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    // Check if admin exists
    const admin = await User.findOne({ email: adminEmail.toLowerCase().trim() }).select('+password');
    
    if (!admin) {
      console.log('❌ Admin user not found!');
      console.log(`\nRun: npm run setup-admin`);
      console.log(`Or: node setup-admin-atlas.js\n`);
      process.exit(1);
    }

    console.log('✓ Admin user found:');
    console.log(`  - Name: ${admin.name}`);
    console.log(`  - Email: ${admin.email}`);
    console.log(`  - Role: ${admin.role}`);
    console.log(`  - isGDGMember: ${admin.isGDGMember}`);
    console.log(`  - Password hash exists: ${admin.password ? 'Yes' : 'No'}\n`);

    // Test password
    if (admin.password) {
      const passwordMatch = await bcrypt.compare(adminPassword, admin.password);
      console.log(`Password test: ${passwordMatch ? '✓ CORRECT' : '✗ INCORRECT'}`);
      
      if (!passwordMatch) {
        console.log('\n⚠️  Password mismatch!');
        console.log('Run: npm run setup-admin to reset the password\n');
      } else {
        console.log('\n✅ Credentials are correct!');
        console.log(`You can login with:`);
        console.log(`  Email: ${adminEmail}`);
        console.log(`  Password: ${adminPassword}\n`);
      }
    } else {
      console.log('⚠️  Password field is missing!');
      console.log('Run: npm run setup-admin to set the password\n');
    }

    // Check role
    if (admin.role !== 'admin') {
      console.log('⚠️  User role is not "admin"!');
      console.log('Updating role to admin...');
      admin.role = 'admin';
      admin.isGDGMember = true;
      await admin.save({ validateBeforeSave: false });
      console.log('✓ Role updated to admin\n');
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

verifyAdmin();
