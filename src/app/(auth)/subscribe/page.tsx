'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSubscriptionStore } from '@/stores/subscription-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ShieldCheck,
  Check,
  X,
  ArrowRight,
  Star,
  Zap,
  Building2,
  Crown
} from 'lucide-react';
import type { SubscriptionPlan } from '@/types/subscription';

const planIcons: Record<string, React.ReactNode> = {
  BASIC: <Zap className="h-6 w-6" />,
  STANDARD: <Star className="h-6 w-6" />,
  PREMIUM: <Crown className="h-6 w-6" />,
  ENTERPRISE: <Building2 className="h-6 w-6" />,
};

const planColors: Record<string, string> = {
  BASIC: 'bg-slate-100 text-slate-700',
  STANDARD: 'bg-blue-100 text-blue-700',
  PREMIUM: 'bg-amber-100 text-amber-700',
  ENTERPRISE: 'bg-emerald-100 text-emerald-700',
};

function formatCurrency(amount: number, currency: string = 'PGK') {
  return new Intl.NumberFormat('en-PG', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function PlanCard({ plan, isPopular }: { plan: SubscriptionPlan; isPopular?: boolean }) {
  const router = useRouter();
  const { selectPlan } = useSubscriptionStore();

  const handleSelect = () => {
    selectPlan(plan);
    router.push(`/subscribe/checkout?plan=${plan.code}`);
  };

  return (
    <Card className={`relative flex flex-col ${isPopular ? 'border-2 border-emerald-500 shadow-lg' : ''}`}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-emerald-500 hover:bg-emerald-500">Most Popular</Badge>
        </div>
      )}

      <CardHeader className="text-center pb-2">
        <div className={`mx-auto mb-3 p-3 rounded-xl ${planColors[plan.type]}`}>
          {planIcons[plan.type]}
        </div>
        <CardTitle className="text-xl">{plan.name}</CardTitle>
        <div className="mt-2">
          <span className="text-3xl font-bold">{formatCurrency(plan.priceAmount)}</span>
          <span className="text-slate-500 text-sm">/{plan.durationMonths} months</span>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <p className="text-sm text-slate-600 text-center mb-4">{plan.description}</p>

        <ul className="space-y-2">
          <FeatureItem
            enabled={true}
            text={plan.maxActiveBids ? `Up to ${plan.maxActiveBids} active bids` : 'Unlimited active bids'}
          />
          <FeatureItem
            enabled={true}
            text={plan.maxTenderValue ? `Tenders up to ${formatCurrency(plan.maxTenderValue)}` : 'No tender value limit'}
          />
          <FeatureItem enabled={plan.canBidOnGoods} text="Bid on Goods tenders" />
          <FeatureItem enabled={plan.canBidOnWorks} text="Bid on Works tenders" />
          <FeatureItem enabled={plan.canBidOnServices} text="Bid on Services tenders" />
          <FeatureItem enabled={plan.canBidOnConsultancy} text="Bid on Consultancy tenders" />
          <FeatureItem enabled={plan.prioritySupport} text="Priority support" />
          <FeatureItem enabled={plan.featuredListing} text="Featured listing" />
        </ul>
      </CardContent>

      <CardFooter>
        <Button
          onClick={handleSelect}
          className={`w-full ${isPopular ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
          variant={isPopular ? 'default' : 'outline'}
        >
          Select Plan
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}

function FeatureItem({ enabled, text }: { enabled: boolean; text: string }) {
  return (
    <li className={`flex items-center gap-2 text-sm ${enabled ? 'text-slate-700' : 'text-slate-400'}`}>
      {enabled ? (
        <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
      ) : (
        <X className="h-4 w-4 text-slate-300 flex-shrink-0" />
      )}
      <span>{text}</span>
    </li>
  );
}

export default function SubscribePage() {
  const { plans } = useSubscriptionStore();
  const activePlans = plans.filter(p => p.isActive).sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-emerald-600 rounded-xl">
              <ShieldCheck className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Choose Your Subscription Plan
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Subscribe to the PNG eGP System to start bidding on government tenders.
            Choose the plan that best fits your business needs.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {activePlans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isPopular={plan.type === 'STANDARD'}
            />
          ))}
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-xl p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900 mb-6 text-center">
            Frequently Asked Questions
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-slate-900 mb-1">
                How long is the subscription valid?
              </h3>
              <p className="text-sm text-slate-600">
                All subscriptions are valid for 12 months from the date of activation.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-slate-900 mb-1">
                What payment methods are accepted?
              </h3>
              <p className="text-sm text-slate-600">
                We accept bank transfers, mobile money, credit cards, and cheques.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-slate-900 mb-1">
                Can I upgrade my plan?
              </h3>
              <p className="text-sm text-slate-600">
                Yes, you can upgrade anytime. The price difference will be prorated.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-slate-900 mb-1">
                What happens when my subscription expires?
              </h3>
              <p className="text-sm text-slate-600">
                You won't be able to submit new bids, but you can still view your existing bids and contracts.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="text-center mt-8">
          <p className="text-sm text-slate-600">
            Already have an account?{' '}
            <Link href="/login" className="text-emerald-600 hover:text-emerald-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
