const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for seeding...');

    // Clear existing users
    await User.deleteMany();
    console.log('Users cleared.');

    const users = [
      {
        name: 'Viewer User',
        email: 'viewer@pulse.com',
        password: '123456',
        role: 'Viewer',
        tenantId: 'pulse-demo-tenant'
      },
      {
        name: 'Editor User',
        email: 'editor@pulse.com',
        password: '123456',
        role: 'Editor',
        tenantId: 'pulse-demo-tenant'
      },
      {
        name: 'Admin User',
        email: 'admin@pulse.com',
        password: '123456',
        role: 'Admin',
        tenantId: 'pulse-demo-tenant'
      }
    ];

    for (const u of users) {
      await User.create(u);
      console.log(`Created user: ${u.email} (${u.role})`);
    }

    console.log('Seeding complete.');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedUsers();
