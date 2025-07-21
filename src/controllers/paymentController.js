import Order from "../models/Order.js";
import User from "../models/User.js";
import Joi from 'joi';
import Stripe from "stripe";
import Payment from "../models/Payment.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);



// Ejemplo de flujo correcto en el controlador:
export const processPaymentAndOrder = async (req, res) => {
  // 1. Obtener los datos necesarios del request
  const userId = req.userId;
  const { products, totalPrice, paymentMethodId } = req.body;

  const paymentSchema = Joi.object({
    amount: Joi.number().min(1).required(),
    paymentMethodId: Joi.string().required(),
    products: Joi.array().items(Joi.object({
      productId: Joi.string().required(),
      quantity: Joi.number().min(1).required()
    })).required()
  });
  const { error } = paymentSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  // 2. Procesar el pago con Stripe
  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalPrice * 100, // Stripe usa centavos
    currency: "eur", // o "usd"
    payment_method: paymentMethodId, // recibido del frontend
    confirm: true
  });

  // 3. Si el pago es exitoso, crear la orden
  if (paymentIntent.status === 'succeeded') {
    const order = await Order.create({
      userId,
      products,
      totalPrice,
      paymentDetails: null, // se actualiza después
      status: 'completed'
    });

    // 4. Crear el registro de pago usando el id de la orden
    const payment = new Payment({
      orderId: order._id,
      amount: paymentIntent.amount / 100,
      paymentMethod: 'stripe',
      status: paymentIntent.status,
      transactionId: paymentIntent.id,
      stripeReceiptUrl: paymentIntent.charges.data[0]?.receipt_url
    });
    await payment.save();

    // 5. Actualizar la orden con el id del pago
    order.paymentDetails = payment._id;
    await order.save();

    // 6. Responder al frontend
    res.status(201).json({ message: 'Order and payment created successfully', order, payment });
  } else {
    res.status(400).json({ message: 'Payment failed', paymentIntent });
  }
};

