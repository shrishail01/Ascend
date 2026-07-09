import { z } from 'zod';
import { createEndpoint, Users } from 'zite-integrations-backend-sdk';

export default createEndpoint({
  authenticated: true,
  inputSchema: z.object({
    razorpayOrderId: z.string(),
    razorpayPaymentId: z.string(),
    razorpaySignature: z.string(),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    plan: z.string(),
  }),
  execute: async ({ input, context }) => {
    const keySecret = process.env.ZITE_RAZORPAY_KEY_SECRET;

    // Verify signature using Web Crypto API (available in Cloudflare Workers)
    const payload = `${input.razorpayOrderId}|${input.razorpayPaymentId}`;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(keySecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );
    const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (expectedSignature !== input.razorpaySignature) {
      throw new Error('Payment verification failed. Invalid signature.');
    }

    // Upgrade user to Premium
    await Users.update({
      id: context.user.id,
      record: { plan: 'Premium' },
    });

    return { success: true, plan: 'Premium' };
  },
});
