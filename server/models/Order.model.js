import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name:    { type: String, required: true },
  image:   { type: String },
  price:   { type: Number, required: true },
  qty:     { type: Number, required: true },
});

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [orderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    pincode: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['placed', 'confirmed', 'picked', 'dispatched', 'delivered', 'cancelled'],
      default: 'placed',
    },
    assignedAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    paymentId:    { type: String, default: '' },
    razorpayOrderId: { type: String, default: '' },
    isPaid:       { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Index for fast queries
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ assignedAgent: 1, status: 1 });
orderSchema.index({ pincode: 1, status: 1 });

export default mongoose.model('Order', orderSchema);