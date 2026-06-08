import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    supplier: {
      type: String,
      trim: true,
      default: ''
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    cost: {
      type: Number,
      required: true,
      min: 0
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    reorderLevel: {
      type: Number,
      required: true,
      min: 0,
      default: 10
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

productSchema.virtual('inventoryValue').get(function getInventoryValue() {
  return this.stock * this.cost;
});

productSchema.virtual('status').get(function getStatus() {
  if (!this.isActive) return 'Inactive';
  if (this.stock === 0) return 'Out of stock';
  if (this.stock <= this.reorderLevel) return 'Low stock';
  return 'In stock';
});

export default mongoose.model('Product', productSchema);
