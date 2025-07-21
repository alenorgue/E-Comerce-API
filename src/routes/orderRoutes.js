import express from 'express';
import { tokenValidation } from '../controllers/authController.js';
import { getOrders, getOrderById, updateOrderStatus, cancelOrder } from '../controllers/orderController.js';
import isAdmin from '../middlewares/isAdmin.js';
import { processPaymentAndOrder } from '../controllers/paymentController.js';


const router = express.Router();

// Rutas protegidas (requieren autenticación)
router.post('/checkout', tokenValidation, processPaymentAndOrder);
router.get('/orders', tokenValidation, getOrders);
router.get('/orders/:id', tokenValidation, getOrderById);
router.delete('/orders/:id/cancel', tokenValidation, cancelOrder);

//Ruta protegida para actualizar el estado de la orden (solo admin)
router.put('/orders/:id/status', tokenValidation, isAdmin, updateOrderStatus);

export default router;

