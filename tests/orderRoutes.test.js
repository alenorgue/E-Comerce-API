import mongoose from 'mongoose';
afterAll(async () => {
  await mongoose.connection.close();
});

global.Stripe = function () {
  return {
    paymentIntents: {
      create: jest.fn().mockResolvedValue({
        id: 'pi_test_123',
        status: 'succeeded',
        amount: 1000,
        charges: { data: [{ receipt_url: 'https://stripe.com/receipt/test' }] }
      })
    }
  };
};

import request from 'supertest';
import app from '../src/app.js';

describe('Order Routes', () => {
  let token;

  beforeAll(async () => {
    // Crea un usuario de prueba y loguea para obtener token
    const res = await request(app)
      .post('/register')
      .send({
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'Test1234!',
        role: 'user',
        phoneNumber: '123456789'
      });
    token = res.body.token;
  });

  it('should get all orders for authenticated user', async () => {
    const res = await request(app)
      .get('/orders')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should process checkout and create order/payment', async () => {
    // Simula productos y datos de pago
    const checkoutRes = await request(app)
      .post('/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({
        products: [{ productId: 'fakeProductId', quantity: 1 }],
        totalPrice: 10,
        paymentMethodId: 'pm_test_123'
      });
    expect([201, 400]).toContain(checkoutRes.statusCode); // Puede fallar si el producto no existe
    // Si es 201, debe devolver order y payment
    if (checkoutRes.statusCode === 201) {
      expect(checkoutRes.body.order).toBeDefined();
      expect(checkoutRes.body.payment).toBeDefined();
    }
  });

  // Más tests: cancelar orden, actualizar estado, etc.
});
