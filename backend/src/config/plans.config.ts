export interface PlanDetails {
  name: string;
  monthlyCredits: number;
  resumeLimit: number;
  atsLimit: number;
  interviewLimit: number;
  roadmapLimit: number;
  projectLimit: number;
  linkedinLimit: number;
  coverLetterLimit: number;
  priorityProcessing: boolean;
  premiumTemplates: boolean;
  supportLevel: 'Email' | 'Priority' | 'Dedicated';
  priceINR: number;
}

/**
 * Simplified plan details.
 * Free plan: 2 free trial runs for every tool.
 * Pro plan: ₹89 (Unlimited access to all features).
 */
export const subscriptionPlans: Record<string, PlanDetails> = {
  Free: {
    name: 'Free',
    monthlyCredits: 2,
    resumeLimit: 2,
    atsLimit: 2,
    interviewLimit: 2,
    roadmapLimit: 2,
    projectLimit: 2,
    linkedinLimit: 2,
    coverLetterLimit: 2,
    priorityProcessing: false,
    premiumTemplates: false,
    supportLevel: 'Email',
    priceINR: 0,
  },
  Pro: {
    name: 'Pro',
    monthlyCredits: 9999,
    resumeLimit: 9999,
    atsLimit: 9999,
    interviewLimit: 9999,
    roadmapLimit: 9999,
    projectLimit: 9999,
    linkedinLimit: 9999,
    coverLetterLimit: 9999,
    priorityProcessing: true,
    premiumTemplates: true,
    supportLevel: 'Priority',
    priceINR: 89,
  },
  Premium: {
    name: 'Premium',
    monthlyCredits: 9999,
    resumeLimit: 9999,
    atsLimit: 9999,
    interviewLimit: 9999,
    roadmapLimit: 9999,
    projectLimit: 9999,
    linkedinLimit: 9999,
    coverLetterLimit: 9999,
    priorityProcessing: true,
    premiumTemplates: true,
    supportLevel: 'Priority',
    priceINR: 89,
  },
};

export default subscriptionPlans;
