import Product from "../models/Product.js";
import Cart from '../models/Cart.js';
import Joi from 'joi';

export const addProductToCart = async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const userId = req.userId;

  // Validar que productId y quantity sean correctos
  const schema = Joi.object({
    productId: Joi.string().required(),
    quantity: Joi.number().min(1).default(1)
  });
  const { error } = schema.validate({ productId, quantity });
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found. Cannot add to cart.' });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, products: [], totalPrice: 0 });
    }

    // Verifica si el producto ya está en el carrito
    const cartProduct = cart.products.find(p => p.productId.equals(product._id));
    if (cartProduct) {
      cartProduct.quantity += quantity;
    } else {
      cart.products.push({ productId: product._id, quantity });
    }
    cart.totalPrice += product.price * quantity;
    await cart.save();

    res.status(201).json({ message: 'Product added to cart successfully', cart });
  } catch (error) {
    console.error('Error adding product to cart:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteProductFromCart = async (req, res) => {
  const { productId } = req.params;
  const userId = req.userId;

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    const productIndex = cart.products.findIndex(p => p.productId.equals(productId));
    if (productIndex === -1) {
      return res.status(404).json({ message: 'Product not found in cart' });
    } 
    const product = cart.products[productIndex];
    cart.totalPrice -= product.quantity * (await Product.findById(product.productId)).price;
    cart.products.splice(productIndex, 1);
    await cart.save();
    res.status(200).json({ message: 'Product removed from cart successfully', cart });
  } catch (error) {
    console.error('Error removing product from cart:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getCart = async (req, res) => {
  const userId = req.userId;

  try {
    const cart = await Cart.findOne({ userId }).populate('products.productId');
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    res.status(200).json(cart);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const clearCart = async (req, res) => {
  const userId = req.userId;

  try {
    const cart = await Cart.findOneAndDelete({ userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    res.status(200).json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateProductQuantityInCart = async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;
  const userId = req.userId;

  // Validar que quantity sea un número válido
  const schema = Joi.object({
    quantity: Joi.number().min(1).required()
  });
  const { error } = schema.validate({ quantity });
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    const productIndex = cart.products.findIndex(p => p.productId.equals(productId));
    if (productIndex === -1) {
      return res.status(404).json({ message: 'Product not found in cart' });
    }
    
    const product = cart.products[productIndex];
    const oldQuantity = product.quantity;
    product.quantity = quantity;
    
    // Actualizar el totalPrice del carrito
    const productDetails = await Product.findById(product.productId);
    cart.totalPrice += (quantity - oldQuantity) * productDetails.price;
    
    await cart.save();
    res.status(200).json({ message: 'Product quantity updated successfully', cart });
  } catch (error) {
    console.error('Error updating product quantity in cart:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

