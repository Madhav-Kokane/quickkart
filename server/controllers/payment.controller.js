import Razorpay from 'razorpay';
import crypto   from 'crypto';

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// POST /api/payment/create-order
export const createRazorpayOrder = async (req, res) => {
  const { amount } = req.body; // amount in rupees

  const options = {
    amount:   Math.round(amount * 100), // Razorpay needs paise
    currency: 'INR',
    receipt:  `receipt_${Date.now()}`,
  };

  const order = await razorpay.orders.create(options);
  res.json({ success: true, order });
};

// POST /api/payment/verify
export const verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const body      = razorpay_order_id + '|' + razorpay_payment_id;
  const expected  = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expected !== razorpay_signature) {
    return res.status(400).json({ success: false, message: 'Payment verification failed' });
  }

  res.json({ success: true, message: 'Payment verified', paymentId: razorpay_payment_id });
};