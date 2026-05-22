import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProductsAdmin,
} from '../controllers/product.controller.js';
import { protect, requireRole } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = express.Router();

// Public
router.get('/',     getProducts);
router.get('/:id',  getProductById);

// Admin only
router.get('/admin/all', protect, requireRole('admin'), getAllProductsAdmin);
router.post('/',         protect, requireRole('admin'), upload.array('images', 4), createProduct);
router.patch('/:id',     protect, requireRole('admin'), updateProduct);
router.delete('/:id',    protect, requireRole('admin'), deleteProduct);

export default router;