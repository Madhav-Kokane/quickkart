import Order   from '../models/Order.model.js';
import Product from '../models/Product.model.js';
import { io }  from '../index.js';

// POST /api/orders  — create order after payment verified
export const createOrder = async (req, res) => {
  const { items, address, pincode, phone, totalAmount, paymentId, razorpayOrderId } = req.body;

  // Validate stock and deduct
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) return res.status(404).json({ success: false, message: `Product not found: ${item.name}` });
    if (product.stock < item.qty) return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.qty } });
  }

  const order = await Order.create({
    customer: req.user._id,
    items,
    address,
    pincode,
    phone,
    totalAmount,
    paymentId,
    razorpayOrderId,
    isPaid: true,
    status: 'placed',
  });

  // Notify admin via socket
  io.emit('new-order', { orderId: order._id, totalAmount, pincode });

  res.status(201).json({ success: true, order });
};

// GET /api/orders/my  — customer's own orders
export const getMyOrders = async (req, res) => {
  const orders = await Order.find({ customer: req.user._id })
    .sort({ createdAt: -1 })
    .populate('assignedAgent', 'name phone');
  res.json({ success: true, orders });
};

// GET /api/orders/assigned  — agent's assigned orders
export const getAssignedOrders = async (req, res) => {
  const orders = await Order.find({
    assignedAgent: req.user._id,
    status: { $in: ['confirmed', 'picked', 'dispatched'] },
  })
    .sort({ createdAt: -1 })
    .populate('customer', 'name phone address');
  res.json({ success: true, orders });
};

// GET /api/orders  — all orders (admin)
export const getAllOrders = async (req, res) => {
  const { status, pincode } = req.query;
  const query = {};
  if (status)  query.status  = status;
  if (pincode) query.pincode = pincode;

  const orders = await Order.find(query)
    .sort({ createdAt: -1 })
    .populate('customer',      'name phone')
    .populate('assignedAgent', 'name phone');
  res.json({ success: true, orders });
};

// GET /api/orders/:id  — single order
export const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('customer',      'name phone address')
    .populate('assignedAgent', 'name phone');
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  res.json({ success: true, order });
};

// PATCH /api/orders/:id/status  — update status (agent or admin)
export const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  // 🔴 Real-time: emit to order room so customer sees live update
  io.to(order._id.toString()).emit('order-status-update', {
    status,
    updatedAt: new Date(),
  });

  res.json({ success: true, order });
};

// PATCH /api/orders/:id/assign  — assign agent (admin only)
export const assignAgent = async (req, res) => {
  const { agentId } = req.body;
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { assignedAgent: agentId, status: 'confirmed' },
    { new: true }
  ).populate('assignedAgent', 'name phone');

  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  // Notify customer — order confirmed
  io.to(order._id.toString()).emit('order-status-update', {
    status: 'confirmed',
    updatedAt: new Date(),
  });

  // Notify the assigned agent directly
  io.to(`agent_${agentId}`).emit('new-assignment', {
    orderId:   order._id,
    address:   order.address,
    items:     order.items.length,
    total:     order.totalAmount,
  });

  res.json({ success: true, order });
};