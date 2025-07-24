// Mock de Stripe para Jest (ESM)
class Stripe {
  constructor() {
    this.paymentIntents = {
      create: () => {}
    };
  }
}

export default Stripe;
