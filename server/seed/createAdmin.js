import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import User from '../models/User.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const users = [
    { name: 'QuickKart Admin',  email: 'admin@quickkart.com',    password: 'admin123', role: 'admin',    pincode: '411001', phone: '9999999999' },
    { name: 'Raju Delivery',    email: 'agent@quickkart.com',    password: 'agent123', role: 'agent',    pincode: '411001', phone: '9888888888' },
    { name: 'Priya Customer',   email: 'customer@quickkart.com', password: 'cust123',  role: 'customer', pincode: '411001', phone: '9777777777' },
  ];

  for (const u of users) {
    const exists = await User.findOne({ email: u.email });
    if (!exists) {
      await User.create(u);
      console.log(`✅ Created: ${u.email}`);
    } else {
      console.log(`⏭  Already exists: ${u.email}`);
    }
  }

  console.log('\nDemo credentials:');
  console.log('Admin    → admin@quickkart.com    / admin123');
  console.log('Agent    → agent@quickkart.com    / agent123');
  console.log('Customer → customer@quickkart.com / cust123');
  process.exit();
};

seed();