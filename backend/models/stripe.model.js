import Stripe from 'stripe';

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey) {
    throw new Error('Falta STRIPE_SECRET_KEY en backend/.env');
}

export const stripe = new Stripe(secretKey);