import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Product from '../models/Product.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

const products = [
  { name: 'Fresh Bananas', description: 'Ripe yellow bananas', price: 60, discountedPrice: 49, category: 'fruits', stock: 50, unit: 'dozen', pincode: '411001', images: ['https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=400'] },
  { name: 'Red Apples',    description: 'Crisp Shimla apples', price: 180, discountedPrice: 149, category: 'fruits', stock: 30, unit: 'kg', pincode: '411001', images: ['https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400'] },
  { name: 'Tomatoes',      description: 'Farm fresh tomatoes', price: 40, discountedPrice: 32, category: 'vegetables', stock: 60, unit: 'kg', pincode: '411001', images: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400'] },
  { name: 'Spinach',       description: 'Organic palak',       price: 30, discountedPrice: 25, category: 'vegetables', stock: 40, unit: 'pcs', pincode: '411001', images: ['https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400'] },
  { name: 'Amul Milk 1L',  description: 'Full cream milk',     price: 68, discountedPrice: 68, category: 'dairy', stock: 100, unit: 'L', pincode: '411001', images: ['https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400'] },
  { name: 'Amul Butter',   description: 'Salted butter 500g',  price: 280, discountedPrice: 260, category: 'dairy', stock: 25, unit: 'pcs', pincode: '411001', images: ['https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400'] },
  { name: 'Coca Cola 2L',  description: 'Chilled cold drink',  price: 95, discountedPrice: 85, category: 'beverages', stock: 45, unit: 'pcs', pincode: '411001', images: ['https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400'] },
  { name: 'Lays Classic',  description: 'American style salted chips', price: 30, discountedPrice: 30, category: 'snacks', stock: 80, unit: 'pcs', pincode: '411001', images: ['https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400'] },
  { name: 'Brown Bread',   description: 'Whole wheat bread',   price: 45, discountedPrice: 40, category: 'bakery', stock: 35, unit: 'pcs', pincode: '411001', images: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400'] },
  { name: 'Surf Excel 1kg', description: 'Detergent powder',  price: 220, discountedPrice: 199, category: 'household', stock: 20, unit: 'pcs', pincode: '411001', images: ['https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400'] },
];

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Product.deleteMany({});
  await Product.insertMany(products);
  console.log(`✅ Seeded ${products.length} products for pincode 411001`);
  process.exit();
};

seed();