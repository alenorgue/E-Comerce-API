import express from 'express';
import User from '../models/User.js';
import { tokenValidation, isAdmin } from '../controllers/authController.js';
import Product from "../models/Product.js";
import Joi from 'joi';

export const createProduct = async (req, res) => {
  const { name, description, price, category, stock, imageUrl } = req.body;

  // Definimos el esquema de validación para crear un producto
  const productSchema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().min(10).max(500).required(),
    price: Joi.number().min(0).required(),
    category: Joi.string().valid('electronics', 'clothing', 'home', 'books', 'toys').required(),
    stock: Joi.number().min(0).required(),
    imageUrl: Joi.string().uri().pattern(/^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))$/i).required()
  });

  // Validamos los datos recibidos en la petición
  const { error } = productSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
 
  try {
    // Creamos un nuevo producto
    const newProduct = new Product({ name, description, price, category, stock, imageUrl });
    await newProduct.save();

    res.status(201).json({ message: 'Product created successfully', product: newProduct });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export const getProducts = async (req, res) => {
  try {
    // Obtenemos todos los productos de la base de datos
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    // Buscamos el producto por ID
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    } 
    res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, category, stock, imageUrl } = req.body;

  // Definimos el esquema de validación para actualizar un producto
  const productSchema = Joi.object({
    name: Joi.string().min(2).max(100),
    description: Joi.string().min(10).max(500),
    price: Joi.number().min(0),
    category: Joi.string().valid('electronics', 'clothing', 'home', 'books', 'toys'),
    stock: Joi.number().min(0),
    imageUrl: Joi.string().uri().pattern(/^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))$/i)
  });

  // Validamos los datos recibidos en la petición
  const { error } = productSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    // Actualizamos el producto
    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    // Eliminamos el producto por ID
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

