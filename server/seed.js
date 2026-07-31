const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Role = require('./models/Role');
const Permission = require('./models/Permission');
const RolePermission = require('./models/RolePermission');

// Load environment variables
dotenv.config();

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/erp-portal';
    console.log(`Connecting to database at ${mongoUri}...`);
    
    await mongoose.connect(mongoUri);
    console.log('Database connected.');

    // Clear existing collections
    await User.deleteMany();
    await RolePermission.deleteMany();
    await Role.deleteMany();
    await Permission.deleteMany();
    console.log('Cleared existing collections.');

    // 1. Create Permissions
    const permissionsData = [
      {
        name: 'Attendance Module Access',
        code: 'access_attendance',
        module: 'Attendance Management',
        route: '/attendance',
        icon: 'ClipboardList',
        description: 'Read and write attendance access logs.'
      },

      {
        name: 'Fees Module Access',
        code: 'access_fees',
        module: 'Fees Management',
        route: '/fees-management',
        icon: 'DollarSign',
        description: 'Oversee invoice receipts and due collections.'
      },
      {
        name: 'Lead Module Access',
        code: 'access_leads',
        module: 'Lead Management',
        route: '/lead-management',
        icon: 'UserCheck',
        description: 'Read and write leads database logs.'
      },
      {
        name: 'Certificate Module Access',
        code: 'access_certificates',
        module: 'Certificate Management',
        route: '/certificate-management',
        icon: 'Award',
        description: 'Create and verify student certificates.'
      }
    ];

    const permissions = {};
    for (let pData of permissionsData) {
      const p = await Permission.create(pData);
      permissions[p.code] = p._id;
      console.log(`Seeded Permission: ${p.code}`);
    }

    // 2. Create Roles
    const rolesList = [
      { name: 'Super Admin', description: 'Full access across all modules.' },
      { name: 'Attendance Admin', description: 'Restricted access to Personnel logbooks.' },
      { name: 'Website Admin', description: 'Restricted access to Site operations.' },
      { name: 'Fees Admin', description: 'Restricted access to financials and billings.' }
    ];

    const roles = {};
    for (let rData of rolesList) {
      const r = await Role.create(rData);
      roles[r.name] = r._id;
      console.log(`Seeded Role: ${r.name}`);
    }

    // 3. Map Roles to Permissions (RolePermission)
    const rolePermissionMappings = [
      {roleName: 'Super Admin', permissionCode: 'access_attendance'},
      {roleName: 'Super Admin', permissionCode: 'access_fees'},
      {roleName: 'Super Admin', permissionCode: 'access_leads'},
      {roleName: 'Super Admin', permissionCode: 'access_certificates'},

      // Module Admins get respective permissions
      {roleName: 'Attendance Admin', permissionCode: 'access_attendance'},
      {roleName: 'Fees Admin', permissionCode: 'access_fees'}
    ];

    for (let mapping of rolePermissionMappings) {
      const roleId = roles[mapping.roleName];
      const permissionId = permissions[mapping.permissionCode];
      
      await RolePermission.create({ role: roleId, permission: permissionId });
      console.log(`Linked Role ${mapping.roleName} -> Permission ${mapping.permissionCode}`);
    }

    // 4. Create Users (with role objectIds)
    const usersData = [
      {
        name: 'Super Admin User',
        email: 'superadmin@erp.com',
        password: 'admin123',
        role: roles['Super Admin'],
        status: 'active'
      },
      {
        name: 'Attendance Admin User',
        email: 'attendance@erp.com',
        password: 'admin123',
        role: roles['Attendance Admin'],
        status: 'active'
      },
      {
        name: 'Website Admin User',
        email: 'website@erp.com',
        password: 'admin123',
        role: roles['Website Admin'],
        status: 'active'
      },
      {
        name: 'Fees Admin User',
        email: 'fees@erp.com',
        password: 'admin123',
        role: roles['Fees Admin'],
        status: 'active'
      },
      {
        name: 'Inactive Admin User',
        email: 'inactive@erp.com',
        password: 'admin123',
        role: roles['Super Admin'],
        status: 'inactive'
      }
    ];

    for (let uData of usersData) {
      await User.create(uData);
      console.log(`Seeded User: ${uData.email}`);
    }

    console.log('Database seeding successfully updated with relational RBAC model!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
};

seedData();
