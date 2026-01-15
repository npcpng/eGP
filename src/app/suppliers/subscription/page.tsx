'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSubscriptionStore } from '@/stores/subscription-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Clock,
  CreditCard,
  Calendar,
  FileText,
  ArrowUpRight,
  RefreshCw,
  XCircle
} from 'lucide-react';
import type { SubscriptionStatus, PaymentStatus } from '@/types/subscription';

function formatCurrency(amount: number, currency: string = 'PGK') {
  return new Intl.NumberFormat('en-PG', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateString: string | null) {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-PG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

const statusConfig: Record<SubscriptionStatus, { color: string; icon: React.ReactNode; label: string }> = {
  PENDING: {
    color: 'bg-amber-100 text-amber-800',
    icon: <Clock className="h-4 w-4" />,
    label: 'Pending Verification'
  },
  ACTIVE: {
    color: 'bg-emerald-100 text-emerald-800',
    icon: <CheckCircle2 className="h-4 w-4" />,
    label: 'Active'
  },
  EXPIRED: {
    color: 'bg-red-100 text-red-800',
    icon: <XCircle className="h-4 w-4" />,
    label: 'Expired'
  },
  CANCELLED: {
    color: 'bg-slate-100 text-slate-800',
    icon: <XCircle className="h-4 w-4" />,
    label: 'Cancelled'
  },
  SUSPENDED: {
    color: 'bg-orange-100 text-orange-800',
    icon: <AlertCircle className="h-4 w-4" />,
    label: 'Suspended'
  },
};

const paymentStatusConfig: Record<PaymentStatus, { color: string; label: string }> = {
  PENDING: { color: 'bg-amber-100 text-amber-800', label: 'Pending' },
  COMPLETED: { color: 'bg-emerald-100 text-emerald-800', label: 'Completed' },
  FAILED: { color: 'bg-red-100 text-red-800', label: 'Failed' },
  REFUNDED: { color: 'bg-blue-100 text-blue-800', label: 'Refunded' },
};

// Demo data
const demoSubscription = {
  id: 'sub-001',
  planId: 'plan-standard',
  status: 'ACTIVE' as SubscriptionStatus,
  startDate: '2026-01-01',
  endDate: '2027-01-01',
  bidsUsed: 3,
  plan: {
    name: 'Standard',
    type: 'STANDARD',
    maxActiveBids: 15,
    maxTenderValue: 2000000,
    priceAmount: 5000,
  },
};

const demoPayments = [
  {
    id: 'pay-001',
    amount: 5000,
    currency: 'PGK',
    paymentMethod: 'BANK_TRANSFER',
    status: 'COMPLETED' as PaymentStatus,
    transactionReference: 'BSP-2026011401234',
    paymentDate: '2025-12-28',
    verifiedDate: '2026-01-01',
  },
];

export default function SubscriptionStatusPage() {
  const { checkSubscriptionStatus, plans } = useSubscriptionStore();
  const [activeTab, setActiveTab] = useState('overview');

  // Use demo data for display
  const subscription = demoSubscription;
  const payments = demoPayments;
  const status = statusConfig[subscription.status];

  const daysRemaining = subscription.endDate
    ? Math.ceil((new Date(subscription.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const bidsRemaining = subscription.plan.maxActiveBids
    ? subscription.plan.maxActiveBids - subscription.bidsUsed
    : null;

  const bidsPercentage = subscription.plan.maxActiveBids
    ? (subscription.bidsUsed / subscription.plan.maxActiveBids) * 100
    : 0;

  const isExpiringSoon = daysRemaining > 0 && daysRemaining <= 30;
  const isExpired = daysRemaining <= 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Subscription</h1>
          <p className="text-slate-600">Manage your eGP subscription and billing</p>
        </div>
        <Button asChild>
          <Link href="/subscribe">
            <RefreshCw className="mr-2 h-4 w-4" />
            {isExpired ? 'Renew Subscription' : 'Upgrade Plan'}
          </Link>
        </Button>
      </div>

      {/* Alert for expiring/expired subscription */}
      {(isExpiringSoon || isExpired) && (
        <Card className={isExpired ? 'border-red-200 bg-red-50' : 'border-amber-200 bg-amber-50'}>
          <CardContent className="flex items-center gap-4 py-4">
            <AlertCircle className={`h-6 w-6 ${isExpired ? 'text-red-600' : 'text-amber-600'}`} />
            <div className="flex-1">
              <p className={`font-medium ${isExpired ? 'text-red-900' : 'text-amber-900'}`}>
                {isExpired
                  ? 'Your subscription has expired'
                  : `Your subscription expires in ${daysRemaining} days`
                }
              </p>
              <p className={`text-sm ${isExpired ? 'text-red-700' : 'text-amber-700'}`}>
                {isExpired
                  ? 'Renew now to continue bidding on tenders.'
                  : 'Renew now to avoid any interruption to your bidding access.'
                }
              </p>
            </div>
            <Button asChild variant={isExpired ? 'destructive' : 'outline'}>
              <Link href="/subscribe">Renew Now</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Subscription Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Status</span>
              <Badge className={status.color}>
                {status.icon}
                <span className="ml-1">{status.label}</span>
              </Badge>
            </div>
            <p className="text-2xl font-bold text-slate-900">{subscription.plan.name}</p>
            <p className="text-sm text-slate-500">Plan</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Valid Until</span>
              <Calendar className="h-4 w-4 text-slate-400" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{formatDate(subscription.endDate)}</p>
            <p className={`text-sm ${isExpired ? 'text-red-600' : isExpiringSoon ? 'text-amber-600' : 'text-slate-500'}`}>
              {isExpired ? 'Expired' : `${daysRemaining} days remaining`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Bids Used</span>
              <FileText className="h-4 w-4 text-slate-400" />
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {subscription.bidsUsed}/{subscription.plan.maxActiveBids || '∞'}
            </p>
            {subscription.plan.maxActiveBids && (
              <Progress value={bidsPercentage} className="mt-2 h-2" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Tender Limit</span>
              <CreditCard className="h-4 w-4 text-slate-400" />
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {subscription.plan.maxTenderValue
                ? formatCurrency(subscription.plan.maxTenderValue)
                : 'Unlimited'
              }
            </p>
            <p className="text-sm text-slate-500">Maximum tender value</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Details */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Plan Details</TabsTrigger>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Plan Features</CardTitle>
              <CardDescription>What's included in your {subscription.plan.name} subscription</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-slate-900">Bidding Access</h4>
                  <div className="space-y-2">
                    <FeatureRow label="Goods Tenders" enabled={true} />
                    <FeatureRow label="Works Tenders" enabled={subscription.plan.type !== 'BASIC'} />
                    <FeatureRow label="Services Tenders" enabled={true} />
                    <FeatureRow label="Consultancy Tenders" enabled={subscription.plan.type !== 'BASIC'} />
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium text-slate-900">Benefits</h4>
                  <div className="space-y-2">
                    <FeatureRow
                      label={`Up to ${subscription.plan.maxActiveBids || 'Unlimited'} active bids`}
                      enabled={true}
                    />
                    <FeatureRow
                      label="Priority support"
                      enabled={subscription.plan.type !== 'BASIC'}
                    />
                    <FeatureRow
                      label="Featured listing"
                      enabled={subscription.plan.type === 'PREMIUM' || subscription.plan.type === 'ENTERPRISE'}
                    />
                    <FeatureRow
                      label="Dedicated account manager"
                      enabled={subscription.plan.type === 'ENTERPRISE'}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>Your subscription payment records</CardDescription>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <p className="text-center text-slate-500 py-8">No payment records found</p>
              ) : (
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-slate-100 rounded-lg">
                          <CreditCard className="h-5 w-5 text-slate-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {formatCurrency(payment.amount, payment.currency)}
                          </p>
                          <p className="text-sm text-slate-500">
                            {payment.paymentMethod.replace('_', ' ')} • {payment.transactionReference}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={paymentStatusConfig[payment.status].color}>
                          {paymentStatusConfig[payment.status].label}
                        </Badge>
                        <p className="text-sm text-slate-500 mt-1">
                          {formatDate(payment.paymentDate)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-4">
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/tenders/bidder-portal">
                <FileText className="mr-2 h-4 w-4" />
                Browse Tenders
                <ArrowUpRight className="ml-auto h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/bids">
                <ShieldCheck className="mr-2 h-4 w-4" />
                My Bids
                <ArrowUpRight className="ml-auto h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/subscribe">
                <RefreshCw className="mr-2 h-4 w-4" />
                Change Plan
                <ArrowUpRight className="ml-auto h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FeatureRow({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {enabled ? (
        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
      ) : (
        <XCircle className="h-4 w-4 text-slate-300" />
      )}
      <span className={enabled ? 'text-slate-700' : 'text-slate-400'}>{label}</span>
    </div>
  );
}
