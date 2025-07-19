import mongoose from "mongoose";


const Schema = mongoose.Schema;
const productSchema = new Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 100,
    trim: true
  },
  description: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 500,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['electronics', 'clothing', 'home', 'books', 'toys'],
    trim: true
  },
  stock: {
    type: Number,
    required: true,
    min: 0
  },
  imageUrl: {
    type: String,
    required: true,
    match: /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))$/i
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model('Product', productSchema);