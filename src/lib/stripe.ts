import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey) {
  throw new Error(
    "Brak zmiennej środowiskowej STRIPE_SECRET_KEY."
  );
}

export const stripe = new Stripe(secretKey);
