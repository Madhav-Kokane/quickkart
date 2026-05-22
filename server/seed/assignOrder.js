import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Order from '../models/Order.model.js';
import User  from '../models/User.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

const assign = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const agent = await User.findOne({ role: 'agent' });
  const order = await Order.findOne({ status: 'placed' }).sort({ createdAt: -1 });

  if (!order) return console.log('No placed orders found. Place an order first.'), process.exit();
  if (!agent) return console.log('No agent found.'), process.exit();

  order.assignedAgent = agent._id;
  order.status = 'confirmed';
  await order.save();

  console.log(`✅ Assigned order ${order._id} to agent ${agent.name}`);
  process.exit();
};

assign();