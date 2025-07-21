import Order from "../models/Order.js";
import User from "../models/User.js";
import Joi from 'joi';


export const getOrdersByUser = async (req, res) => {
    const userId = req.userId;

    try {
        // Obtenemos las órdenes del usuario
        const orders = await Order.find({ userId }).populate('products.productId');
        if (orders.length === 0) {
            return res.status(404).json({ message: 'No orders found for this user' });
        }
        res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getOrderById = async (req, res) => {
    const { id } = req.params;

    try {
        // Buscamos la orden por ID
        const order = await Order.findById(id).populate('products.productId');
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(200).json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    // Definimos el esquema de validación para actualizar el estado de la orden
    const statusSchema = Joi.object({
        status: Joi.string().valid('pending', 'completed', 'cancelled').required()
    });

    // Validamos los datos recibidos en la petición
    const { error } = statusSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    try {
        // Actualizamos el estado de la orden
        const updatedOrder = await Order.findByIdAndUpdate(id, { status }, { new: true });
        if (!updatedOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(200).json({ message: 'Order status updated successfully', order: updatedOrder });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const cancelOrder = async (req, res) => {
  const { id } = req.params;

  try {
    // Actualizamos el estado de la orden directamente a 'cancelled'
    const updatedOrder = await Order.findByIdAndUpdate(id, { status: 'cancelled' }, { new: true });
    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json({ message: 'Order cancelled successfully', order: updatedOrder });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

