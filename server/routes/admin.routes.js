import express from 'express';
import { protect, requireRole } from '../middleware/auth.middleware.js';
import Order   from '../models/Order.model.js';
import Product from '../models/Product.model.js';
import User    from '../models/User.model.js';

const router = express.Router();
router.use(protect, requireRole('admin'));

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalOrders,
    todayOrders,
    pendingOrders,
    deliveredOrders,
    lowStockProducts,
    totalProducts,
    totalAgents,
    revenueData,
  ] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ createdAt: { $gte: today } }),
    Order.countDocuments({ status: { $in: ['placed', 'confirmed', 'picked', 'dispatched'] } }),
    Order.countDocuments({ status: 'delivered' }),
    Product.countDocuments({ stock: { $lt: 5 }, isAvailable: true }),
    Product.countDocuments(),
    User.countDocuments({ role: 'agent' }),

    // Last 7 days revenue
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          status: 'delivered',
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders:  { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  // Today's revenue
  const todayRevenue = await Order.aggregate([
    { $match: { createdAt: { $gte: today }, status: 'delivered' } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } },
  ]);

  res.json({
    success: true,
    stats: {
      totalOrders,
      todayOrders,
      pendingOrders,
      deliveredOrders,
      lowStockProducts,
      totalProducts,
      totalAgents,
      todayRevenue: todayRevenue[0]?.total || 0,
      revenueData,
    },
  });
});

// GET /api/admin/agents
router.get('/agents', async (req, res) => {
  const agents = await User.find({ role: 'agent' }).select('name phone pincode');
  res.json({ success: true, agents });
});

export default router;