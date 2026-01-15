'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Search,
  FileText,
  Upload,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  Eye,
  Download,
  Send,
  Building2,
  Calendar,
  DollarSign,
  Shield,
  FileCheck,
  Package,
  ArrowRight,
  RefreshCw,
  Info,
} from 'lucide-react';
import { useProcurementStore } from '@/stores/procurement-store';
import { useSubscriptionStore } from '@/stores/subscription-store';
import { useSubscriptionCheck } from '@/components/subscription/subscription-gate';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';

const formatCurrency = (amount: number) => {
  return `K ${amount.toLocaleString()}`;
};

// Mock supplier bids
const mockSupplierBids = [
  {
    id: 'BID-SUP-001',
    tenderId: 'tender-1',
    tenderRef: 'NPC/2026/T-0001',
    tenderTitle: 'Supply of Medical Equipment for Port Moresby General Hospital',
    status: 'SUBMITTED',
    submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    bidAmount: 1850000,
    isSealed: true,
    documents: ['Technical Proposal.pdf', 'Financial Proposal.pdf', 'Company Profile.pdf'],
  },
  {
    id: 'BID-SUP-002',
    tenderId: 'tender-3',
    tenderRef: 'NPC/2026/T-0003',
    tenderTitle: 'IT Infrastructure Upgrade for Department of Finance',
    status: 'DRAFT',
    submittedAt: null,
    bidAmount: 0,
    isSealed: false,
    documents: ['Technical Proposal.pdf'],
  },
  {
    id: 'BID-SUP-003',
    tenderId: 'tender-5',
    tenderRef: 'NPC/2026/T-0005',
    tenderTitle: 'Professional Audit Services for 2026 Financial Year',
    status: 'UNDER_EVALUATION',
    submittedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    bidAmount: 2800000,
    isSealed: false,
    documents: ['Technical Proposal.pdf', 'Financial Proposal.pdf', 'Team CVs.pdf'],
  },
];

export default function BidderPortalPage() {
  const { tenders } = useProcurementStore();
  const subscription = useSubscriptionCheck();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedTender, setSelectedTender] = useState<string | null>(null);
  const [bidDialogOpen, setBidDialogOpen] = useState(false);
  const [bidSubmitting, setBidSubmitting] = useState(false);
  const [bidSubmitted, setBidSubmitted] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Filter open tenders
  const openTenders = useMemo(() => {
    return tenders.filter((tender) => {
      const isOpen = ['PUBLISHED', 'OPEN_FOR_BIDDING'].includes(tender.status);
      const matchesSearch = tender.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tender.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || tender.category === categoryFilter;
      return isOpen && matchesSearch && matchesCategory;
    });
  }, [tenders, searchQuery, categoryFilter]);

  const categories = useMemo(() => {
    const cats = new Set(tenders.map((t) => t.category));
    return Array.from(cats);
  }, [tenders]);

  const getTimeRemaining = (deadline: Date) => {
    const now = new Date();
    const diff = new Date(deadline).getTime() - now.getTime();
    if (diff <= 0) return { text: 'Closed', urgent: true };

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 7) return { text: `${days} days remaining`, urgent: false };
    if (days > 0) return { text: `${days} days remaining`, urgent: true };

    const hours = Math.floor(diff / (1000 * 60 * 60));
    return { text: `${hours} hours remaining`, urgent: true };
  };

  const handleSubmitBid = () => {
    setBidSubmitting(true);
    // Simulate encryption and submission
    setTimeout(() => {
      setBidSubmitting(false);
      setBidSubmitted(true);
    }, 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <Badge variant="outline">Draft</Badge>;
      case 'SUBMITTED':
        return <Badge className="bg-emerald-100 text-emerald-700">Submitted</Badge>;
      case 'UNDER_EVALUATION':
        return <Badge className="bg-blue-100 text-blue-700">Under Evaluation</Badge>;
      case 'AWARDED':
        return <Badge className="bg-amber-100 text-amber-700">Awarded</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-700">Not Selected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Bidder Portal</h1>
          <p className="text-sm text-zinc-500">
            Discover opportunities and submit bids securely
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-2 py-1.5">
            <Building2 className="h-4 w-4" />
            PNG Tech Solutions Ltd
          </Badge>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Secure Submission Notice */}
      <Alert className="border-emerald-200 bg-emerald-50">
        <Shield className="h-4 w-4 text-emerald-600" />
        <AlertTitle className="text-emerald-900">Secure Bid Submission</AlertTitle>
        <AlertDescription className="text-emerald-700">
          All bids are encrypted using AES-256 encryption and remain sealed until the official opening time.
          Your bid cannot be viewed by anyone until the deadline passes.
        </AlertDescription>
      </Alert>

      {/* Subscription Status Banner */}
      {!subscription.hasActiveSubscription ? (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-900">Subscription Required</AlertTitle>
          <AlertDescription className="text-amber-700 flex items-center justify-between">
            <span>You need an active subscription to submit bids on tenders.</span>
            <Button asChild size="sm" className="ml-4 bg-amber-600 hover:bg-amber-700">
              <Link href="/subscribe">
                Subscribe Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </AlertDescription>
        </Alert>
      ) : subscription.bidsRemaining !== null && subscription.bidsRemaining <= 3 && (
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-900">Low Bid Allowance</AlertTitle>
          <AlertDescription className="text-blue-700 flex items-center justify-between">
            <span>You have {subscription.bidsRemaining} bids remaining in your {subscription.plan?.name} plan.</span>
            <Button asChild size="sm" variant="outline" className="ml-4">
              <Link href="/subscribe">
                Upgrade Plan
              </Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="opportunities" className="space-y-4">
        <TabsList>
          <TabsTrigger value="opportunities" className="gap-2">
            <Search className="h-4 w-4" />
            Open Opportunities
          </TabsTrigger>
          <TabsTrigger value="my-bids" className="gap-2">
            <FileText className="h-4 w-4" />
            My Bids
            <Badge className="ml-1 bg-red-600">{mockSupplierBids.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="awarded" className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Awards
          </TabsTrigger>
        </TabsList>

        <TabsContent value="opportunities" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Search tenders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tender Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {openTenders.map((tender) => {
              const timeRemaining = getTimeRemaining(tender.submissionDeadline);

              return (
                <Card key={tender.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className={cn(
                    'h-2',
                    timeRemaining.urgent ? 'bg-red-500' : 'bg-emerald-500'
                  )} />
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <Badge variant="outline" className="text-xs shrink-0">
                        {tender.category}
                      </Badge>
                      <Badge className={cn(
                        'shrink-0',
                        tender.procurementMethod === 'OPEN_TENDER' && 'bg-blue-100 text-blue-700',
                        tender.procurementMethod === 'REQUEST_FOR_QUOTATION' && 'bg-amber-100 text-amber-700'
                      )}>
                        {tender.procurementMethod.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs mt-2">
                      {tender.referenceNumber}
                    </CardDescription>
                    <CardTitle className="text-sm line-clamp-2 mt-1">
                      {tender.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1 text-zinc-500">
                        <DollarSign className="h-3 w-3" />
                        <span>{formatCurrency(tender.estimatedValue.amount)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-zinc-500">
                        <Calendar className="h-3 w-3" />
                        <span>{format(new Date(tender.submissionDeadline), 'dd MMM yyyy')}</span>
                      </div>
                    </div>

                    <div className={cn(
                      'flex items-center gap-2 p-2 rounded-lg text-xs font-medium',
                      timeRemaining.urgent ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
                    )}>
                      <Clock className="h-3 w-3" />
                      {timeRemaining.text}
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Dialog open={bidDialogOpen && selectedTender === tender.id} onOpenChange={(open) => {
                        setBidDialogOpen(open);
                        if (open) {
                          setSelectedTender(tender.id);
                          setBidSubmitted(false);
                          setAcceptedTerms(false);
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                            disabled={!subscription.hasActiveSubscription}
                            title={!subscription.hasActiveSubscription ? 'Subscription required to bid' : 'Submit a bid'}
                          >
                            {subscription.hasActiveSubscription ? (
                              <>
                                <Send className="h-4 w-4 mr-1" />
                                Bid
                              </>
                            ) : (
                              <>
                                <Lock className="h-4 w-4 mr-1" />
                                Subscribe
                              </>
                            )}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Submit Bid</DialogTitle>
                            <DialogDescription>
                              {tender.referenceNumber} - {tender.title}
                            </DialogDescription>
                          </DialogHeader>

                          {bidSubmitted ? (
                            <div className="py-8 text-center space-y-4">
                              <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-zinc-900">Bid Submitted Successfully!</h3>
                                <p className="text-sm text-zinc-500 mt-1">
                                  Your bid has been encrypted and sealed. It will remain locked until the official opening time.
                                </p>
                              </div>
                              <div className="p-4 rounded-lg bg-zinc-50 text-left">
                                <div className="flex items-center gap-2 text-sm">
                                  <Lock className="h-4 w-4 text-emerald-600" />
                                  <span className="font-medium">Bid Reference:</span>
                                  <span className="font-mono">BID-{Date.now().toString(36).toUpperCase()}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm mt-2">
                                  <Clock className="h-4 w-4 text-zinc-500" />
                                  <span className="font-medium">Opening:</span>
                                  <span>{format(new Date(tender.submissionDeadline), 'dd MMM yyyy, HH:mm')}</span>
                                </div>
                              </div>
                              <Button onClick={() => setBidDialogOpen(false)}>
                                Close
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <Alert>
                                <Lock className="h-4 w-4" />
                                <AlertTitle>Sealed Bid Submission</AlertTitle>
                                <AlertDescription>
                                  Your bid will be encrypted and sealed until {format(new Date(tender.submissionDeadline), 'dd MMM yyyy, HH:mm')}.
                                  No one can view your submission until the official opening.
                                </AlertDescription>
                              </Alert>

                              <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                  <Label>Bid Amount (PGK)</Label>
                                  <Input type="number" placeholder="Enter bid amount" />
                                </div>
                                <div className="space-y-2">
                                  <Label>Validity Period (Days)</Label>
                                  <Input type="number" defaultValue="90" />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label>Technical Proposal</Label>
                                <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-red-300 transition-colors cursor-pointer">
                                  <Upload className="h-8 w-8 text-zinc-400 mx-auto mb-2" />
                                  <p className="text-sm text-zinc-600">Click to upload or drag and drop</p>
                                  <p className="text-xs text-zinc-400">PDF, DOC, DOCX up to 50MB</p>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label>Financial Proposal</Label>
                                <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-red-300 transition-colors cursor-pointer">
                                  <Upload className="h-8 w-8 text-zinc-400 mx-auto mb-2" />
                                  <p className="text-sm text-zinc-600">Click to upload or drag and drop</p>
                                  <p className="text-xs text-zinc-400">PDF, XLS, XLSX up to 50MB</p>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label>Additional Comments</Label>
                                <Textarea placeholder="Any additional information for your bid..." />
                              </div>

                              <Separator />

                              <div className="flex items-start space-x-2">
                                <Checkbox
                                  id="terms"
                                  checked={acceptedTerms}
                                  onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                                />
                                <label htmlFor="terms" className="text-sm text-zinc-600 leading-tight">
                                  I confirm that all information provided is accurate and complete. I understand that this bid will be encrypted and sealed until the official opening time, and cannot be modified after submission.
                                </label>
                              </div>

                              <DialogFooter>
                                <Button variant="outline" onClick={() => setBidDialogOpen(false)}>
                                  Cancel
                                </Button>
                                <Button
                                  className="bg-red-600 hover:bg-red-700"
                                  disabled={!acceptedTerms || bidSubmitting}
                                  onClick={handleSubmitBid}
                                >
                                  {bidSubmitting ? (
                                    <>
                                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                      Encrypting & Submitting...
                                    </>
                                  ) : (
                                    <>
                                      <Lock className="h-4 w-4 mr-2" />
                                      Submit Sealed Bid
                                    </>
                                  )}
                                </Button>
                              </DialogFooter>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {openTenders.length === 0 && (
            <div className="text-center py-12 text-zinc-500">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No open opportunities found</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-bids" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">My Bid Submissions</CardTitle>
              <CardDescription>Track the status of your submitted bids</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>Tender</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Bid Amount</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Sealed</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockSupplierBids.map((bid) => (
                    <TableRow key={bid.id}>
                      <TableCell className="font-mono text-sm">{bid.tenderRef}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{bid.tenderTitle}</TableCell>
                      <TableCell>{getStatusBadge(bid.status)}</TableCell>
                      <TableCell className="text-right font-medium">
                        {bid.bidAmount > 0 ? formatCurrency(bid.bidAmount) : '-'}
                      </TableCell>
                      <TableCell className="text-sm text-zinc-500">
                        {bid.submittedAt ? format(bid.submittedAt, 'dd MMM yyyy') : '-'}
                      </TableCell>
                      <TableCell>
                        {bid.isSealed ? (
                          <Badge className="bg-emerald-100 text-emerald-700">
                            <Lock className="h-3 w-3 mr-1" />
                            Sealed
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            <Unlock className="h-3 w-3 mr-1" />
                            Open
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="awarded" className="space-y-4">
          <div className="text-center py-12 text-zinc-500">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No awarded contracts yet</p>
            <p className="text-sm mt-1">Awards will appear here once evaluation is complete</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
