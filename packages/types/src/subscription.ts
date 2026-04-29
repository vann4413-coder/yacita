export type Plan = 'BASIC' | 'PRO';
export type SubStatus = 'ACTIVE' | 'PAST_DUE' | 'CANCELLED';

export interface Subscription {
  id: string;
  clinicId: string;
  stripeCustomerId: string;
  stripeSubId: string;
  plan: Plan;
  status: SubStatus;
  currentPeriodEnd: string;
}

export const PLAN_PRICES: Record<Plan, { monthly: number; label: string; gapsLimit: number | null }> = {
  BASIC: { monthly: 5.99, label: 'Básico', gapsLimit: 10 },
  PRO: { monthly: 14.99, label: 'Pro', gapsLimit: null },
};
