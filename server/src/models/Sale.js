import mongoose from 'mongoose';

const saleItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    sku: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
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
    lineTotal: {
      type: Number,
      required: true,
      min: 0
    }
  },
  { _id: false }
);

const saleSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      trim: true,
      default: 'Walk-in customer'
    },
    items: {
      type: [saleItemSchema],
      validate: {
        validator(items) {
          return items.length > 0;
        },
        message: 'A sale must include at least one item.'
      }
    },
    paymentMethod: {
      type: String,
      enum: ['Telebirr', 'CBE Birr', 'Cash', 'Bank Transfer', 'Card'],
      default: 'Telebirr'
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    totalCost: {
      type: Number,
      required: true,
      min: 0
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    }
  },
  { timestamps: true }
);

saleSchema.virtual('profit').get(function getProfit() {
  return this.totalAmount - this.totalCost;
});

saleSchema.set('toJSON', { virtuals: true });
saleSchema.set('toObject', { virtuals: true });

export default mongoose.model('Sale', saleSchema);
