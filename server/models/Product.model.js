import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
    },
    discountedPrice: {
      type: Number,
      required: [true, 'Discounted price is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'fruits', 'vegetables', 'dairy', 'beverages',
        'snacks', 'bakery', 'meat', 'household', 'personal care'
      ],
    },
    images: [{ type: String }],   // Cloudinary URLs
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    unit: {
      type: String,
      default: 'pcs',             // kg / L / pcs / dozen
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Index for fast pincode + category queries
productSchema.index({ pincode: 1, category: 1 });
productSchema.index({ name: 'text', description: 'text' }); // text search

export default mongoose.model('Product', productSchema);