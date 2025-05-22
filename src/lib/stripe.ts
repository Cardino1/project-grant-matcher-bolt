import { loadStripe } from '@stripe/stripe-js';
import { stripeProducts } from '../stripe-config';

const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

if (!stripePublicKey) {
  console.error('Missing Stripe public key. Please set VITE_STRIPE_PUBLIC_KEY environment variable.');
}

export const stripePromise = loadStripe(stripePublicKey || '');

export async function createCheckoutSession(userId: string) {
  try {
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        price_id: stripeProducts.grantMatching.priceId,
        success_url: `${window.location.origin}/stripe-redirect?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${window.location.origin}/checkout/cancel`,
        mode: stripeProducts.grantMatching.mode,
      }),
    });
    
    const session = await response.json();
    
    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}