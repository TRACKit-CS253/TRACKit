const bcrypt = require('bcryptjs');
const db = require('../models');
const User = db.User;
const Admin = db.Admin;

module.exports = async function initAdmin() {
  try {
    // Check if admin already exists
    const adminExists = await User.findOne({
      where: { username: 'admin' }
    });

    if (adminExists) {
      console.log('Admin user already exists, skipping initialization');
      return;
    }

    // Create default admin user
    const hashedPassword = bcrypt.hashSync('admin123', 8);
    
    const admin = await User.create({
      username: 'admin',
      email: 'admin@trackit.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      userType: 'admin'
    });

    await Admin.create({
      userId: admin.id
    });

    console.log('Admin user created successfully');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('IMPORTANT: Change this password after first login!');
  } catch (error) {
    console.error('Failed to create admin user:', error);
  }
};
