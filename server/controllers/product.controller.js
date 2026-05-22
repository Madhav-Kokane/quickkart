import Product from '../models/Product.model.js';
import { uploadToCloudinary } from '../middleware/upload.middleware.js';

// GET /api/products?pincode=411001&category=fruits&search=apple
export const getProducts = async (req, res) => {
  const { pincode, category, search } = req.query;

  const query = { isAvailable: true };

  if (pincode)  query.pincode  = pincode;
  if (category && category !== 'all') query.category = category;
  if (search)   query.$text = { $search: search };

  const products = await Product.find(query).sort({ createdAt: -1 });
  res.json({ success: true, products });
};

// GET /api/products/:id
export const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  res.json({ success: true, product });
};

// POST /api/products  (admin only)
export const createProduct = async (req, res) => {
  const {
    name, description, price, discountedPrice,
    category, stock, unit, pincode,
  } = req.body;

  let images = [];

  if (req.files && req.files.length > 0) {
    const uploads = req.files.map((f) => uploadToCloudinary(f.buffer));
    images = await Promise.all(uploads);
  }

  const product = await Product.create({
    name, description, price, discountedPrice,
    category, stock, unit, pincode, images,
  });

  res.status(201).json({ success: true, product });
};

// PATCH /api/products/:id  (admin only)
export const updateProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { ...req.body },
    { new: true, runValidators: true }
  );
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  res.json({ success: true, product });
};

// DELETE /api/products/:id  (admin only)
export const deleteProduct = async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Product deleted' });
};

// GET /api/products/admin/all  (admin only — includes unavailable)
export const getAllProductsAdmin = async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json({ success: true, products });
};