import api from '@/services/axios';

/**
 * Creates a Razorpay checkout order for subscription upgrades.
 */
export async function createRazorpayOrder(input: { plan: string }): Promise<{
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  userName: string;
  userEmail: string;
}> {
  const res = await api.post('/subscriptions', input);
  return res.data;
}

/**
 * Verifies Razorpay payment signature after successful checkout.
 */
export async function verifyRazorpayPayment(input: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): Promise<{ success: boolean; plan: string }> {
  const res = await api.post('/subscriptions/verify', input);
  return res.data;
}

export interface BillingInvoice {
  invoiceId: string;
  amount: number;
  currency: string;
  status: string;
  transactionId: string;
  plan: string;
  billedAt: string;
}

export interface BillingUsageItem {
  feature: string;
  used: number;
  limit: number;
}

export interface PlanDetails {
  name: string;
  monthlyCredits: number;
  resumeLimit: number;
  atsLimit: number;
  interviewLimit: number;
  roadmapLimit: number;
  projectLimit: number;
  linkedinLimit: number;
  priorityProcessing: boolean;
  premiumTemplates: boolean;
  supportLevel: string;
  priceINR: number;
}

export interface BillingInfoType {
  plan: string;
  status: string;
  renewalDate: string | null;
  invoices: BillingInvoice[];
  usage: BillingUsageItem[];
  planDetails: PlanDetails;
}

/**
 * Fetches billing history invoices and usage dashboard limits from backend.
 */
export async function getBillingInfo(): Promise<BillingInfoType> {
  const res = await api.get('/subscriptions/billing');
  return res.data;
}
