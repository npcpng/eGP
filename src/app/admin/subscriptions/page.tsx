'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  FileText,
  Building2,
  CreditCard,
  Calendar,
  DollarSign,
  AlertTriangle,
  Download,
  RefreshCw,
  Filter,
  Loader2,
} from 'lucide-react';

// Mock pending payments data
const mockPendingPayments = [
  {
    id: 'pay-001',
    supplierId: 'sup-001',
    supplierName: 'PNG Tech Solutions Ltd',
    supplierEmail: 'info@pngtechsolutions.com.pg',
    subscriptionId: 'sub-001',
    planName: 'Standard',
    planCode: 'STANDARD',
    amount: 5000,
    currency: 'PGK',
    paymentMethod: 'BANK_TRANSFER',
    transactionReference: 'BSP-2026011401234',
    proofDocumentUrl: '/documents/proof-001.pdf',
    status: 'PENDING',
    submittedAt: '2026-01-12T10:30:00Z',
    notes: '',
  },
  {
    id: 'pay-002',
    supplierId: 'sup-002',
    supplierName: 'Highlands Construction Co',
    supplierEmail: 'accounts@highlandsconstruction.pg',
    subscriptionId: 'sub-002',
    planName: 'Premium',
    planCode: 'PREMIUM',
    amount: 10000,
    currency: 'PGK',
    paymentMethod: 'MOBILE_MONEY',
    transactionReference: 'CELLMONI-7891234',
    proofDocumentUrl: null,
    status: 'PENDING',
    submittedAt: '2026-01-13T14:45:00Z',
    notes: 'Sent via Digicel CellMoni',
  },
  {
    id: 'pay-003',
    supplierId: 'sup-003',
    supplierName: 'Pacific Supplies PNG',
    supplierEmail: 'finance@pacificsupplies.com.pg',
    subscriptionId: 'sub-003',
    planName: 'Basic',
    planCode: 'BASIC',
    amount: 2500,
    currency: 'PGK',
    paymentMethod: 'BANK_TRANSFER',
    transactionReference: 'ANZ-5678901',
    proofDocumentUrl: '/documents/proof-003.pdf',
    status: 'PENDING',
    submittedAt: '2026-01-14T09:15:00Z',
    notes: '',
  },
];

const mockVerifiedPayments = [
  {
    id: 'pay-004',
    supplierId: 'sup-004',
    supplierName: 'Morobe Engineering Ltd',
    supplierEmail: 'info@morobeeng.com.pg',
    subscriptionId: 'sub-004',
    planName: 'Enterprise',
    planCode: 'ENTERPRISE',
    amount: 25000,
    currency: 'PGK',
    paymentMethod: 'BANK_TRANSFER',
    transactionReference: 'BSP-2026010512345',
    status: 'COMPLETED',
    submittedAt: '2026-01-05T11:00:00Z',
    verifiedAt: '2026-01-06T09:30:00Z',
    verifiedBy: 'John Kila',
  },
];

const mockRejectedPayments = [
  {
    id: 'pay-005',
    supplierId: 'sup-005',
    supplierName: 'Test Company Ltd',
    supplierEmail: 'test@example.com',
    subscriptionId: 'sub-005',
    planName: 'Standard',
    planCode: 'STANDARD',
    amount: 5000,
    currency: 'PGK',
    paymentMethod: 'BANK_TRANSFER',
    transactionReference: 'INVALID-123',
    status: 'FAILED',
    submittedAt: '2026-01-10T15:00:00Z',
    rejectedAt: '2026-01-11T10:00:00Z',
    rejectedBy: 'Mary Tau',
    rejectionReason: 'Transaction reference not found in bank records',
  },
];

function formatCurrency(amount: number, currency: string = 'PGK') {
  return new Intl.NumberFormat('en-PG', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-PG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const planColors: Record<string, string> = {
  BASIC: 'bg-slate-100 text-slate-700',
  STANDARD: 'bg-blue-100 text-blue-700',
  PREMIUM: 'bg-amber-100 text-amber-700',
  ENTERPRISE: 'bg-emerald-100 text-emerald-700',
};

export default function SubscriptionAdminPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<typeof mockPendingPayments[0] | null>(null);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');

  const handleVerify = async () => {
    if (!selectedPayment) return;
    setIsProcessing(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsProcessing(false);
    setVerifyDialogOpen(false);
    setSelectedPayment(null);
    // In production: Call API to verify payment and activate subscription
  };

  const handleReject = async () => {
    if (!selectedPayment || !rejectionReason) return;
    setIsProcessing(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsProcessing(false);
    setRejectDialogOpen(false);
    setSelectedPayment(null);
    setRejectionReason('');
    // In production: Call API to reject payment and notify supplier
  };

  const filteredPending = mockPendingPayments.filter(p =>
    p.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.transactionReference.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Subscription Payments</h1>
          <p className="text-slate-600">Verify and manage supplier subscription payments</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Pending Verification</p>
                <p className="text-2xl font-bold text-amber-600">{mockPendingPayments.length}</p>
              </div>
              <div className="p-3 bg-amber-100 rounded-lg">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Verified This Month</p>
                <p className="text-2xl font-bold text-emerald-600">12</p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">2</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Revenue This Month</p>
                <p className="text-2xl font-bold text-slate-900">K 87,500</p>
              </div>
              <div className="p-3 bg-slate-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="h-4 w-4" />
              Pending
              <Badge className="bg-amber-500">{mockPendingPayments.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="verified" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Verified
            </TabsTrigger>
            <TabsTrigger value="rejected" className="gap-2">
              <XCircle className="h-4 w-4" />
              Rejected
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by supplier or reference..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-[300px]"
              />
            </div>
          </div>
        </div>

        {/* Pending Payments */}
        <TabsContent value="pending" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payments Awaiting Verification</CardTitle>
              <CardDescription>
                Review payment details and verify or reject submissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredPending.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No pending payments to verify</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPending.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{payment.supplierName}</p>
                            <p className="text-sm text-slate-500">{payment.supplierEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={planColors[payment.planCode]}>
                            {payment.planName}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(payment.amount, payment.currency)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {payment.paymentMethod === 'BANK_TRANSFER' ? (
                              <Building2 className="h-4 w-4 text-slate-400" />
                            ) : (
                              <CreditCard className="h-4 w-4 text-slate-400" />
                            )}
                            <span className="text-sm">
                              {payment.paymentMethod.replace('_', ' ')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                            {payment.transactionReference}
                          </code>
                        </TableCell>
                        <TableCell className="text-sm text-slate-500">
                          {formatDate(payment.submittedAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {payment.proofDocumentUrl && (
                              <Button variant="ghost" size="sm">
                                <FileText className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700"
                              onClick={() => {
                                setSelectedPayment(payment);
                                setVerifyDialogOpen(true);
                              }}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Verify
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => {
                                setSelectedPayment(payment);
                                setRejectDialogOpen(true);
                              }}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Verified Payments */}
        <TabsContent value="verified" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Verified Payments</CardTitle>
              <CardDescription>Successfully verified subscription payments</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Verified By</TableHead>
                    <TableHead>Verified At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockVerifiedPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{payment.supplierName}</p>
                          <p className="text-sm text-slate-500">{payment.supplierEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={planColors[payment.planCode]}>
                          {payment.planName}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(payment.amount, payment.currency)}
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                          {payment.transactionReference}
                        </code>
                      </TableCell>
                      <TableCell>{payment.verifiedBy}</TableCell>
                      <TableCell className="text-sm text-slate-500">
                        {formatDate(payment.verifiedAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rejected Payments */}
        <TabsContent value="rejected" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Rejected Payments</CardTitle>
              <CardDescription>Payments that failed verification</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Rejection Reason</TableHead>
                    <TableHead>Rejected At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockRejectedPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{payment.supplierName}</p>
                          <p className="text-sm text-slate-500">{payment.supplierEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={planColors[payment.planCode]}>
                          {payment.planName}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(payment.amount, payment.currency)}
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                          {payment.transactionReference}
                        </code>
                      </TableCell>
                      <TableCell className="text-sm text-red-600 max-w-[200px]">
                        {payment.rejectionReason}
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">
                        {formatDate(payment.rejectedAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Verify Dialog */}
      <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Payment</DialogTitle>
            <DialogDescription>
              Confirm that you have verified this payment in the bank records
            </DialogDescription>
          </DialogHeader>

          {selectedPayment && (
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Supplier</span>
                  <span className="font-medium">{selectedPayment.supplierName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Plan</span>
                  <Badge className={planColors[selectedPayment.planCode]}>
                    {selectedPayment.planName}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Amount</span>
                  <span className="font-bold text-emerald-600">
                    {formatCurrency(selectedPayment.amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Reference</span>
                  <code className="text-xs bg-white px-2 py-1 rounded border">
                    {selectedPayment.transactionReference}
                  </code>
                </div>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  By verifying this payment, the supplier's subscription will be activated immediately
                  and they will receive a confirmation email.
                </AlertDescription>
              </Alert>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setVerifyDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={handleVerify}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Confirm Verification
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Payment</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this payment
            </DialogDescription>
          </DialogHeader>

          {selectedPayment && (
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Supplier</span>
                  <span className="font-medium">{selectedPayment.supplierName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Amount</span>
                  <span className="font-medium">
                    {formatCurrency(selectedPayment.amount)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Rejection Reason *</label>
                <Select onValueChange={setRejectionReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Transaction reference not found">
                      Transaction reference not found
                    </SelectItem>
                    <SelectItem value="Amount does not match">
                      Amount does not match
                    </SelectItem>
                    <SelectItem value="Payment not received">
                      Payment not received
                    </SelectItem>
                    <SelectItem value="Duplicate submission">
                      Duplicate submission
                    </SelectItem>
                    <SelectItem value="Invalid proof document">
                      Invalid proof document
                    </SelectItem>
                    <SelectItem value="other">
                      Other (specify below)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {rejectionReason === 'other' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Custom Reason</label>
                  <Textarea
                    placeholder="Enter the reason for rejection..."
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />
                </div>
              )}

              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  The supplier will be notified via email about this rejection
                  and can submit a new payment.
                </AlertDescription>
              </Alert>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setRejectDialogOpen(false);
              setRejectionReason('');
            }}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isProcessing || !rejectionReason}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Rejecting...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Payment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
