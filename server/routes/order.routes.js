import express from 'express';
import {
  createOrder,
  getMyOrders,
  getAssignedOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  assignAgent,
} from '../controllers/order.controller.js';
import { protect, requireRole } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect); // all order routes need auth

router.post('/',              requireRole('customer'),        createOrder);
router.get('/my',             requireRole('customer'),        getMyOrders);
router.get('/assigned',       requireRole('agent'),           getAssignedOrders);
router.get('/',               requireRole('admin'),           getAllOrders);
router.get('/:id',                                            getOrderById);
router.patch('/:id/status',   requireRole('agent', 'admin'),  updateOrderStatus);
router.patch('/:id/assign',   requireRole('admin'),           assignAgent);

export default router;