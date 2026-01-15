'use client';

import Link from 'next/link';
import { useSubscriptionStore } from '@/stores/subscription-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  ShieldAlert,
  Clock,
  AlertTriangle,
  ArrowRight,
  XCircle
} from 'lucide-react';

interface SubscriptionGateProps {
  children: React.ReactNode;
  tenderType?: string;
  tenderValue?: number;
  fallback?: React.ReactNode;
}

export function SubscriptionGate({
  children,
  tenderType,
  tenderValue,
  fallback
}: SubscriptionGateProps) {
  const { checkSubscriptionStatus, canBidOnTender } = useSubscriptionStore();
  const status = checkSubscriptionStatus();

  // Check if demo mode - allow access in demo mode
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
  if (isDemoMode) {
    return <>{children}</>;
  }

  // Check subscription status
  if (!status.hasActiveSubscription) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <SubscriptionRequired
        status={status.subscription?.status || 'NONE'}
        message={status.message}
      />
    );
  }

  // Check if can bid on this specific tender
  if (tenderType && tenderValue !== undefined) {
    if (!canBidOnTender(tenderType, tenderValue)) {
      return (
        <SubscriptionUpgradeRequired
          tenderType={tenderType}
          tenderValue={tenderValue}
          currentPlan={status.plan?.name || 'Basic'}
        />
      );
    }
  }

  // Check remaining bids
  if (status.bidsRemaining !== null && status.bidsRemaining <= 0) {
    return (
      <BidLimitReached
        planName={status.plan?.name || 'Basic'}
        maxBids={status.plan?.maxActiveBids || 0}
      />
    );
  }

  return <>{children}</>;
}

function SubscriptionRequired({
  status,
  message
}: {
  status: string;
  message: string;
}) {
  const config: Record<string, { icon: React.ReactNode; title: string; color: string }> = {
    NONE: {
      icon: <ShieldAlert className="h-8 w-8" />,
      title: 'Subscription Required',
      color: 'text-amber-600',
    },
    PENDING: {
      icon: <Clock className="h-8 w-8" />,
      title: 'Subscription Pending',
      color: 'text-amber-600',
    },
    EXPIRED: {
      icon: <XCircle className="h-8 w-8" />,
      title: 'Subscription Expired',
      color: 'text-red-600',
    },
    SUSPENDED: {
      icon: <AlertTriangle className="h-8 w-8" />,
      title: 'Subscription Suspended',
      color: 'text-orange-600',
    },
    CANCELLED: {
      icon: <XCircle className="h-8 w-8" />,
      title: 'Subscription Cancelled',
      color: 'text-slate-600',
    },
  };

  const { icon, title, color } = config[status] || config.NONE;

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardContent className="py-8 text-center">
        <div className={`mx-auto w-16 h-16 rounded-full bg-white flex items-center justify-center mb-4 ${color}`}>
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-600 mb-6 max-w-md mx-auto">{message}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
            <Link href="/subscribe">
              {status === 'EXPIRED' || status === 'CANCELLED' ? 'Renew Subscription' : 'Subscribe Now'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          {status === 'PENDING' && (
            <Button variant="outline" asChild>
              <Link href="/suppliers/subscription">Check Status</Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function SubscriptionUpgradeRequired({
  tenderType,
  tenderValue,
  currentPlan,
}: {
  tenderType: string;
  tenderValue: number;
  currentPlan: string;
}) {
  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="py-8 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-white flex items-center justify-center mb-4 text-blue-600">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Plan Upgrade Required</h3>
        <p className="text-slate-600 mb-6 max-w-md mx-auto">
          Your {currentPlan} plan doesn't include access to {tenderType.toLowerCase()} tenders
          {tenderValue > 0 && ` of this value`}. Please upgrade to bid on this tender.
        </p>
        <Button asChild className="bg-blue-600 hover:bg-blue-700">
          <Link href="/subscribe">
            Upgrade Plan
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function BidLimitReached({
  planName,
  maxBids,
}: {
  planName: string;
  maxBids: number;
}) {
  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardContent className="py-8 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-white flex items-center justify-center mb-4 text-orange-600">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Bid Limit Reached</h3>
        <p className="text-slate-600 mb-6 max-w-md mx-auto">
          You've used all {maxBids} bids included in your {planName} plan.
          Upgrade to a higher plan or wait for existing bids to be resolved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="bg-orange-600 hover:bg-orange-700">
            <Link href="/subscribe">
              Upgrade Plan
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/bids">View My Bids</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Hook for checking subscription in components
export function useSubscriptionCheck() {
  const { checkSubscriptionStatus, canBidOnTender } = useSubscriptionStore();
  const status = checkSubscriptionStatus();

  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  return {
    hasActiveSubscription: isDemoMode || status.hasActiveSubscription,
    canBid: isDemoMode || status.canBid,
    subscription: status.subscription,
    plan: status.plan,
    bidsRemaining: status.bidsRemaining,
    daysRemaining: status.daysRemaining,
    message: status.message,
    canBidOnTender: (type: string, value: number) =>
      isDemoMode || canBidOnTender(type, value),
  };
}
