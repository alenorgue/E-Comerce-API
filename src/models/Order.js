import mongoose from "mongoose";

const Schema = mongoose.Schema;
const orderSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  products: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    }
  }],
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  paymentDetails: {
   type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model('Order', orderSchema);