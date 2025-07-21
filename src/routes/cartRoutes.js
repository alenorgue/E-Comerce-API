import express from 'express';
import { tokenValidation } from '../controllers/authController.js';
import { addProductToCart, deleteProductFromCart, updateProductQuantityInCart, getCart, clearCart } from '../controllers/cartController.js';

const router = express.Router();

router.post('/cart', tokenValidation, addProductToCart);
router.delete('/cart/:productId', tokenValidation, deleteProductFromCart);
router.put('/cart/:productId', tokenValidation, updateProductQuantityInCart);
router.get('/cart', tokenValidation, getCart);
router.delete('/cart/clear', tokenValidation, clearCart);

export default router;