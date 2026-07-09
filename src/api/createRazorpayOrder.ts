import { z } from 'zod';
import { createEndpoint } from 'zite-integrations-backend-sdk';

export default createEndpoint({
  authenticated: true,
  inputSchema: z.object({}),
  outputSchema: z.object({
    orderId: z.string(),
    amount: z.number(),
    currency: z.string(),
    keyId: z.string(),
    userName: z.string(),
    userEmail: z.string(),
  }),
  execute: async ({ context }) => {
    const keyId = process.env.ZITE_RAZORPAY_KEY_ID;
    const keySecret = process.env.ZITE_RAZORPAY_KEY_SECRET;

    const auth = btoa(`${keyId}:${keySecret}`);

    const res = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount: 8900, // ₹89 in paise
        currency: 'INR',
        receipt: `ascend_pro_${context.user.id.slice(0, 8)}_${Date.now()}`,
        notes: {
          userId: context.user.id,
          userEmail: context.user.email,
          plan: 'Premium',
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Razorpay order creation failed: ${errText}`);
    }

    const order = await res.json() as any;

    return {
      orderId: order.id,
      amount: 8900,
      currency: 'INR',
      keyId,
      userName: [context.user.firstName, context.user.lastName].filter(Boolean).join(' ') || 'User',
      userEmail: context.user.email,
    };
  },
});
