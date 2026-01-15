export type SubscriptionPlanType = 'BASIC' | 'STANDARD' | 'PREMIUM' | 'ENTERPRISE';

export type SubscriptionStatus = 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'SUSPENDED';

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export type PaymentMethod = 'BANK_TRANSFER' | 'MOBILE_MONEY' | 'CREDIT_CARD' | 'CASH' | 'CHEQUE';

export interface SubscriptionPlan {
  id: string;
  name: string;
  code: string;
  type: SubscriptionPlanType;
  description: string;
  priceAmount: number;
  priceCurrency: string;
  durationMonths: number;
  maxActiveBids: number | null;
  maxTenderValue: number | null;
  canBidOnGoods: boolean;
  canBidOnWorks: boolean;
  canBidOnServices: boolean;
  canBidOnConsultancy: boolean;
  prioritySupport: boolean;
  featuredListing: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierSubscription {
  id: string;
  supplierId: string;
  planId: string;
  plan?: SubscriptionPlan;
  status: SubscriptionStatus;
  startDate: string | null;
  endDate: string | null;
  autoRenew: boolean;
  bidsUsed: number;
  paymentId: string | null;
  notes: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  // Computed fields
  daysRemaining?: number;
  bidsRemaining?: number;
}

export interface SubscriptionPayment {
  id: string;
  subscriptionId: string;
  supplierId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  transactionReference: string | null;
  bankReference: string | null;
  receiptNumber: string | null;
  paymentDate: string | null;
  verifiedDate: string | null;
  verifiedBy: string | null;
  proofDocumentUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionHistory {
  id: string;
  subscriptionId: string;
  action: string;
  previousStatus: SubscriptionStatus | null;
  newStatus: SubscriptionStatus | null;
  previousEndDate: string | null;
  newEndDate: string | null;
  performedBy: string | null;
  notes: string | null;
  createdAt: string;
}

export interface SubscriptionCheckResult {
  hasActiveSubscription: boolean;
  subscription: SupplierSubscription | null;
  plan: SubscriptionPlan | null;
  canBid: boolean;
  canBidOnType: {
    goods: boolean;
    works: boolean;
    services: boolean;
    consultancy: boolean;
  };
  bidsRemaining: number | null;
  daysRemaining: number | null;
  message: string;
}
