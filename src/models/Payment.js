import mongoose from "mongoose";

const Schema = mongoose.Schema;
const paymentSchema = new Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ['stripe'],
    default: 'stripe',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  transactionId: {
    type: String,
    required: true // Stripe paymentIntent.id
  },
  stripeReceiptUrl: {
    type: String,
    required: true // URL del recibo de Stripe
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});