import { create } from 'zustand';
import type {
  SubscriptionPlan,
  SupplierSubscription,
  SubscriptionPayment,
  SubscriptionCheckResult,
  PaymentMethod
} from '@/types/subscription';

interface SubscriptionState {
  // Data
  plans: SubscriptionPlan[];
  currentSubscription: SupplierSubscription | null;
  subscriptionHistory: SupplierSubscription[];
  payments: SubscriptionPayment[];

  // UI State
  isLoading: boolean;
  selectedPlan: SubscriptionPlan | null;

  // Actions
  setPlans: (plans: SubscriptionPlan[]) => void;
  setCurrentSubscription: (subscription: SupplierSubscription | null) => void;
  setSubscriptionHistory: (history: SupplierSubscription[]) => void;
  setPayments: (payments: SubscriptionPayment[]) => void;
  setLoading: (loading: boolean) => void;
  selectPlan: (plan: SubscriptionPlan | null) => void;

  // Computed
  checkSubscriptionStatus: () => SubscriptionCheckResult;
  canBidOnTender: (tenderType: string, tenderValue: number) => boolean;
}

// Mock plans for demo mode
const mockPlans: SubscriptionPlan[] = [
  {
    id: 'plan-basic',
    name: 'Basic',
    code: 'BASIC',
    type: 'BASIC',
    description: 'Entry-level subscription for small businesses. Bid on goods and services tenders up to K500,000.',
    priceAmount: 2500,
    priceCurrency: 'PGK',
    durationMonths: 12,
    maxActiveBids: 5,
    maxTenderValue: 500000,
    canBidOnGoods: true,
    canBidOnWorks: false,
    canBidOnServices: true,
    canBidOnConsultancy: false,
    prioritySupport: false,
    featuredListing: false,
    isActive: true,
    sortOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'plan-standard',
    name: 'Standard',
    code: 'STANDARD',
    type: 'STANDARD',
    description: 'For established businesses. Bid on all tender types up to K2,000,000. Includes priority support.',
    priceAmount: 5000,
    priceCurrency: 'PGK',
    durationMonths: 12,
    maxActiveBids: 15,
    maxTenderValue: 2000000,
    canBidOnGoods: true,
    canBidOnWorks: true,
    canBidOnServices: true,
    canBidOnConsultancy: true,
    prioritySupport: true,
    featuredListing: false,
    isActive: true,
    sortOrder: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'plan-premium',
    name: 'Premium',
    code: 'PREMIUM',
    type: 'PREMIUM',
    description: 'For medium enterprises. Unlimited tender value access with featured listing.',
    priceAmount: 10000,
    priceCurrency: 'PGK',
    durationMonths: 12,
    maxActiveBids: 50,
    maxTenderValue: null,
    canBidOnGoods: true,
    canBidOnWorks: true,
    canBidOnServices: true,
    canBidOnConsultancy: true,
    prioritySupport: true,
    featuredListing: true,
    isActive: true,
    sortOrder: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'plan-enterprise',
    name: 'Enterprise',
    code: 'ENTERPRISE',
    type: 'ENTERPRISE',
    description: 'For large corporations and joint ventures. Unlimited access with dedicated account manager.',
    priceAmount: 25000,
    priceCurrency: 'PGK',
    durationMonths: 12,
    maxActiveBids: null,
    maxTenderValue: null,
    canBidOnGoods: true,
    canBidOnWorks: true,
    canBidOnServices: true,
    canBidOnConsultancy: true,
    prioritySupport: true,
    featuredListing: true,
    isActive: true,
    sortOrder: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  // Initial state
  plans: mockPlans,
  currentSubscription: null,
  subscriptionHistory: [],
  payments: [],
  isLoading: false,
  selectedPlan: null,

  // Actions
  setPlans: (plans) => set({ plans }),

  setCurrentSubscription: (subscription) => set({ currentSubscription: subscription }),

  setSubscriptionHistory: (history) => set({ subscriptionHistory: history }),

  setPayments: (payments) => set({ payments }),

  setLoading: (loading) => set({ isLoading: loading }),

  selectPlan: (plan) => set({ selectedPlan: plan }),

  // Check subscription status
  checkSubscriptionStatus: () => {
    const { currentSubscription, plans } = get();

    if (!currentSubscription) {
      return {
        hasActiveSubscription: false,
        subscription: null,
        plan: null,
        canBid: false,
        canBidOnType: {
          goods: false,
          works: false,
          services: false,
          consultancy: false,
        },
        bidsRemaining: null,
        daysRemaining: null,
        message: 'No active subscription. Please subscribe to bid on tenders.',
      };
    }

    const plan = plans.find(p => p.id === currentSubscription.planId);

    if (currentSubscription.status !== 'ACTIVE') {
      return {
        hasActiveSubscription: false,
        subscription: currentSubscription,
        plan: plan || null,
        canBid: false,
        canBidOnType: {
          goods: false,
          works: false,
          services: false,
          consultancy: false,
        },
        bidsRemaining: null,
        daysRemaining: null,
        message: `Subscription is ${currentSubscription.status.toLowerCase()}. Please renew to continue bidding.`,
      };
    }

    // Check if subscription has expired
    if (currentSubscription.endDate) {
      const endDate = new Date(currentSubscription.endDate);
      const today = new Date();
      const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (daysRemaining < 0) {
        return {
          hasActiveSubscription: false,
          subscription: currentSubscription,
          plan: plan || null,
          canBid: false,
          canBidOnType: {
            goods: false,
            works: false,
            services: false,
            consultancy: false,
          },
          bidsRemaining: null,
          daysRemaining: 0,
          message: 'Subscription has expired. Please renew to continue bidding.',
        };
      }

      const bidsRemaining = plan?.maxActiveBids
        ? plan.maxActiveBids - currentSubscription.bidsUsed
        : null;

      return {
        hasActiveSubscription: true,
        subscription: currentSubscription,
        plan: plan || null,
        canBid: bidsRemaining === null || bidsRemaining > 0,
        canBidOnType: {
          goods: plan?.canBidOnGoods ?? false,
          works: plan?.canBidOnWorks ?? false,
          services: plan?.canBidOnServices ?? false,
          consultancy: plan?.canBidOnConsultancy ?? false,
        },
        bidsRemaining,
        daysRemaining,
        message: daysRemaining <= 30
          ? `Subscription expires in ${daysRemaining} days. Consider renewing soon.`
          : 'Subscription is active.',
      };
    }

    return {
      hasActiveSubscription: false,
      subscription: currentSubscription,
      plan: plan || null,
      canBid: false,
      canBidOnType: {
        goods: false,
        works: false,
        services: false,
        consultancy: false,
      },
      bidsRemaining: null,
      daysRemaining: null,
      message: 'Subscription dates are not set. Please contact support.',
    };
  },

  // Check if can bid on specific tender
  canBidOnTender: (tenderType: string, tenderValue: number) => {
    const status = get().checkSubscriptionStatus();

    if (!status.hasActiveSubscription || !status.canBid) {
      return false;
    }

    // Check tender type permission
    const typeMap: Record<string, keyof typeof status.canBidOnType> = {
      'GOODS': 'goods',
      'WORKS': 'works',
      'SERVICES': 'services',
      'CONSULTANCY': 'consultancy',
    };

    const typeKey = typeMap[tenderType.toUpperCase()];
    if (typeKey && !status.canBidOnType[typeKey]) {
      return false;
    }

    // Check tender value limit
    if (status.plan?.maxTenderValue && tenderValue > status.plan.maxTenderValue) {
      return false;
    }

    // Check remaining bids
    if (status.bidsRemaining !== null && status.bidsRemaining <= 0) {
      return false;
    }

    return true;
  },
}));
