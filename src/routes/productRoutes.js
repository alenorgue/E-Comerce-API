import express from "express";
import { createProduct, updateProduct, deleteProduct, getProducts, getProductById } from "../controllers/productController.js";
import { tokenValidation } from '../controllers/authController.js';
import isAdmin from '../middlewares/isAdmin.js';

const router = express.Router();

// Rutas públicas
router.get('/products', getProducts);
router.get('/products/:id', getProductById);

// Rutas protegidas (solo admin)
router.post('/products', tokenValidation, isAdmin, createProduct);
router.put('/products/:id', tokenValidation, isAdmin, updateProduct);
router.delete('/products/:id', tokenValidation, isAdmin, deleteProduct);

export default router;