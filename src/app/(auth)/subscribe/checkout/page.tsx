'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useSubscriptionStore } from '@/stores/subscription-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  ShieldCheck,
  ArrowLeft,
  Building2,
  Smartphone,
  CreditCard,
  Loader2,
  CheckCircle2,
  Upload,
  Copy,
  Info
} from 'lucide-react';
import type { PaymentMethod } from '@/types/subscription';

const paymentMethods: { value: PaymentMethod; label: string; icon: React.ReactNode; description: string }[] = [
  {
    value: 'BANK_TRANSFER',
    label: 'Bank Transfer',
    icon: <Building2 className="h-5 w-5" />,
    description: 'Transfer to NPC bank account',
  },
  {
    value: 'MOBILE_MONEY',
    label: 'Mobile Money',
    icon: <Smartphone className="h-5 w-5" />,
    description: 'Pay via Digicel or bmobile',
  },
  {
    value: 'CREDIT_CARD',
    label: 'Credit/Debit Card',
    icon: <CreditCard className="h-5 w-5" />,
    description: 'Visa, Mastercard accepted',
  },
];

const bankDetails = {
  bankName: 'Bank of South Pacific',
  accountName: 'National Procurement Commission',
  accountNumber: '1001234567',
  branchCode: 'BSPPGPG',
  reference: 'SUB-', // Will be appended with subscription ID
};

function formatCurrency(amount: number, currency: string = 'PGK') {
  return new Intl.NumberFormat('en-PG', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planCode = searchParams.get('plan');

  const { plans, selectedPlan, selectPlan } = useSubscriptionStore();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('BANK_TRANSFER');
  const [transactionRef, setTransactionRef] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Find plan from URL param if not already selected
  useEffect(() => {
    if (!selectedPlan && planCode) {
      const plan = plans.find(p => p.code === planCode);
      if (plan) {
        selectPlan(plan);
      }
    }
  }, [planCode, plans, selectedPlan, selectPlan]);

  const plan = selectedPlan || plans.find(p => p.code === planCode);

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-slate-600 mb-4">No subscription plan selected.</p>
            <Button asChild>
              <Link href="/subscribe">View Plans</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate based on payment method
      if (paymentMethod === 'BANK_TRANSFER' && !transactionRef) {
        throw new Error('Please enter the bank transaction reference');
      }

      // In production, this would:
      // 1. Create subscription record with PENDING status
      // 2. Create payment record
      // 3. Upload proof document
      // 4. Send notification to NPC for verification

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-emerald-100 rounded-full">
                <CheckCircle2 className="h-12 w-12 text-emerald-600" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              Payment Submitted Successfully
            </h2>
            <p className="text-slate-600 mb-6">
              Your payment is being verified. You will receive an email confirmation
              once your subscription is activated. This usually takes 1-2 business days.
            </p>
            <div className="bg-slate-50 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-slate-600 mb-1">Subscription Plan</p>
              <p className="font-medium text-slate-900">{plan.name}</p>
              <p className="text-sm text-slate-600 mt-3 mb-1">Amount</p>
              <p className="font-medium text-slate-900">{formatCurrency(plan.priceAmount)}</p>
            </div>
            <div className="space-y-3">
              <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
                <Link href="/">Go to Dashboard</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/suppliers/subscription">View Subscription Status</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/subscribe"
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Plans
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600 rounded-lg">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Complete Your Subscription</h1>
              <p className="text-slate-600">Secure payment for {plan.name} Plan</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
                <CardDescription>
                  Choose your payment method and complete the transaction
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* Payment Method Selection */}
                  <div className="space-y-3">
                    <Label>Payment Method</Label>
                    <RadioGroup
                      value={paymentMethod}
                      onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
                      className="grid gap-3"
                    >
                      {paymentMethods.map((method) => (
                        <label
                          key={method.value}
                          className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                            paymentMethod === method.value
                              ? 'border-emerald-500 bg-emerald-50'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <RadioGroupItem value={method.value} />
                          <div className={`p-2 rounded-lg ${
                            paymentMethod === method.value
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {method.icon}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-slate-900">{method.label}</p>
                            <p className="text-sm text-slate-500">{method.description}</p>
                          </div>
                        </label>
                      ))}
                    </RadioGroup>
                  </div>

                  <Separator />

                  {/* Bank Transfer Instructions */}
                  {paymentMethod === 'BANK_TRANSFER' && (
                    <div className="space-y-4">
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          Transfer the exact amount to the account below, then enter the transaction reference.
                        </AlertDescription>
                      </Alert>

                      <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-600">Bank Name</span>
                          <span className="font-medium">{bankDetails.bankName}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-600">Account Name</span>
                          <span className="font-medium">{bankDetails.accountName}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-600">Account Number</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium font-mono">{bankDetails.accountNumber}</span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(bankDetails.accountNumber)}
                              className="p-1 hover:bg-slate-200 rounded"
                            >
                              <Copy className="h-4 w-4 text-slate-400" />
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-600">Reference</span>
                          <span className="font-medium font-mono text-emerald-600">
                            {bankDetails.reference}{plan.code}-{Date.now().toString().slice(-6)}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="transactionRef">Transaction Reference *</Label>
                        <Input
                          id="transactionRef"
                          placeholder="Enter bank transaction reference"
                          value={transactionRef}
                          onChange={(e) => setTransactionRef(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Mobile Money Instructions */}
                  {paymentMethod === 'MOBILE_MONEY' && (
                    <div className="space-y-4">
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          Send payment via Digicel CellMoni or bmobile, then enter the transaction ID.
                        </AlertDescription>
                      </Alert>

                      <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-600">Digicel CellMoni</span>
                          <span className="font-medium font-mono">7000 1234</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-600">bmobile</span>
                          <span className="font-medium font-mono">6800 5678</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="transactionRef">Transaction ID *</Label>
                        <Input
                          id="transactionRef"
                          placeholder="Enter mobile money transaction ID"
                          value={transactionRef}
                          onChange={(e) => setTransactionRef(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Credit Card - Coming Soon */}
                  {paymentMethod === 'CREDIT_CARD' && (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Online card payments are coming soon. Please use bank transfer or mobile money for now.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Proof of Payment Upload */}
                  <div className="space-y-2">
                    <Label htmlFor="proof">Proof of Payment (Optional)</Label>
                    <div className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-slate-50 transition-colors">
                      <input
                        type="file"
                        id="proof"
                        accept="image/*,.pdf"
                        onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                      <label htmlFor="proof" className="cursor-pointer">
                        <Upload className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                        {proofFile ? (
                          <p className="text-sm text-emerald-600 font-medium">{proofFile.name}</p>
                        ) : (
                          <>
                            <p className="text-sm text-slate-600">Click to upload receipt or screenshot</p>
                            <p className="text-xs text-slate-400 mt-1">PNG, JPG or PDF up to 5MB</p>
                          </>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any additional information..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-emerald-600 hover:bg-emerald-700"
                    disabled={isSubmitting || paymentMethod === 'CREDIT_CARD'}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      `Submit Payment - ${formatCurrency(plan.priceAmount)}`
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <h3 className="font-semibold text-lg text-slate-900 mb-1">{plan.name} Plan</h3>
                  <p className="text-sm text-slate-600">{plan.description}</p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Duration</span>
                    <span className="font-medium">{plan.durationMonths} months</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Active Bids</span>
                    <span className="font-medium">{plan.maxActiveBids || 'Unlimited'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Tender Limit</span>
                    <span className="font-medium">
                      {plan.maxTenderValue ? formatCurrency(plan.maxTenderValue) : 'No limit'}
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                  <span className="font-semibold text-lg">Total</span>
                  <span className="font-bold text-2xl text-emerald-600">
                    {formatCurrency(plan.priceAmount)}
                  </span>
                </div>

                <p className="text-xs text-slate-500 text-center">
                  Subscription activates after payment verification (1-2 business days)
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
