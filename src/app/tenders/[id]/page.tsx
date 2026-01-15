'use client';

import { use } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  ArrowLeft,
  Edit,
  Send,
  FileText,
  Download,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Building2,
  DollarSign,
  Users,
  Eye,
  Lock,
  MessageSquare,
  Paperclip,
  History,
} from 'lucide-react';
import { useProcurementStore } from '@/stores/procurement-store';
import { useSupplierStore } from '@/stores/supplier-store';
import { cn } from '@/lib/utils';
import { format, differenceInDays } from 'date-fns';
import type { TenderStatus } from '@/types';

const statusColors: Record<TenderStatus, string> = {
  DRAFT: 'bg-zinc-100 text-zinc-700',
  PENDING_APPROVAL: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-blue-100 text-blue-700',
  PUBLISHED: 'bg-emerald-100 text-emerald-700',
  OPEN_FOR_BIDDING: 'bg-green-100 text-green-700',
  CLOSED: 'bg-zinc-200 text-zinc-700',
  UNDER_EVALUATION: 'bg-amber-100 text-amber-700',
  EVALUATED: 'bg-blue-100 text-blue-700',
  AWARDED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-PG', {
    style: 'currency',
    currency: 'PGK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace('PGK', 'K');
};

export default function TenderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { tenders, getBidsForTender } = useProcurementStore();
  const { suppliers } = useSupplierStore();

  const tender = tenders.find((t) => t.id === id);
  const bids = getBidsForTender(id);

  if (!tender) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-zinc-900 mb-2">Tender Not Found</h2>
            <p className="text-sm text-zinc-500 mb-4">
              The tender you are looking for does not exist or has been removed.
            </p>
            <Button asChild>
              <Link href="/tenders">Back to Tenders</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getSupplierName = (supplierId: string) => {
    const supplier = suppliers.find((s) => s.id === supplierId);
    return supplier?.name || 'Unknown Supplier';
  };

  const deadline = new Date(tender.submissionDeadline);
  const now = new Date();
  const daysRemaining = differenceInDays(deadline, now);
  const isOpen = tender.status === 'OPEN_FOR_BIDDING' || tender.status === 'PUBLISHED';

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/tenders">Tenders</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{tender.referenceNumber}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/tenders">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-xl font-bold text-zinc-900">{tender.title}</h1>
              <Badge className={cn('text-xs', statusColors[tender.status])}>
                {tender.status.replace(/_/g, ' ')}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-zinc-500">
              <span className="font-mono">{tender.referenceNumber}</span>
              <span className="flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                {tender.category}
              </span>
              <span className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                {formatCurrency(tender.estimatedValue.amount)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Documents
          </Button>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          {tender.status === 'DRAFT' && (
            <Button size="sm" className="bg-red-600 hover:bg-red-700">
              <Send className="h-4 w-4 mr-2" />
              Submit for Approval
            </Button>
          )}
        </div>
      </div>

      {/* Quick Info Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                'h-10 w-10 rounded-lg flex items-center justify-center',
                isOpen && daysRemaining > 0 ? 'bg-emerald-100' : 'bg-zinc-100'
              )}>
                <Clock className={cn(
                  'h-5 w-5',
                  isOpen && daysRemaining > 0 ? 'text-emerald-600' : 'text-zinc-600'
                )} />
              </div>
              <div>
                <p className="text-xs text-zinc-500">Deadline</p>
                <p className="font-semibold text-zinc-900">
                  {format(deadline, 'dd MMM yyyy')}
                </p>
                {isOpen && daysRemaining > 0 && (
                  <p className="text-xs text-emerald-600">{daysRemaining} days left</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-zinc-500">Bids Received</p>
                <p className="font-semibold text-zinc-900">{bids.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-zinc-500">Clarifications</p>
                <p className="font-semibold text-zinc-900">{tender.clarifications.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Paperclip className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-zinc-500">Documents</p>
                <p className="font-semibold text-zinc-900">{tender.documents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="bids">Bids ({bids.length})</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Tender Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  {tender.description}
                </p>

                <Separator className="my-4" />

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="text-sm font-medium text-zinc-900 mb-2">Procurement Details</h4>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-zinc-500">Method:</dt>
                        <dd className="font-medium">{tender.procurementMethod.replace(/_/g, ' ')}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-zinc-500">Category:</dt>
                        <dd className="font-medium">{tender.category}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-zinc-500">Estimated Value:</dt>
                        <dd className="font-medium">{formatCurrency(tender.estimatedValue.amount)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-zinc-500">Currency:</dt>
                        <dd className="font-medium">{tender.currency}</dd>
                      </div>
                    </dl>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-zinc-900 mb-2">Timeline</h4>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-zinc-500">Submission Deadline:</dt>
                        <dd className="font-medium">{format(new Date(tender.submissionDeadline), 'dd MMM yyyy HH:mm')}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-zinc-500">Bid Opening:</dt>
                        <dd className="font-medium">{format(new Date(tender.openingDate), 'dd MMM yyyy HH:mm')}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-zinc-500">Validity Period:</dt>
                        <dd className="font-medium">{tender.validityPeriod} days</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Bid Security</CardTitle>
              </CardHeader>
              <CardContent>
                {tender.bidSecurityRequired ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-emerald-600">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm font-medium">Required</span>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500">Amount</p>
                      <p className="text-lg font-bold text-zinc-900">
                        {tender.bidSecurityAmount ? formatCurrency(tender.bidSecurityAmount.amount) : 'Not specified'}
                      </p>
                    </div>
                    <p className="text-xs text-zinc-500">
                      Bidders must submit a bid security in the form of a bank guarantee,
                      insurance bond, or certified check.
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-zinc-500">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">Not required for this tender</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bids">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Submitted Bids</CardTitle>
                {tender.status === 'UNDER_EVALUATION' && (
                  <Button size="sm">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Start Evaluation
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {bids.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bids.map((bid) => (
                      <TableRow key={bid.id}>
                        <TableCell className="font-medium">
                          {getSupplierName(bid.supplierId)}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {bid.referenceNumber}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {bid.encryptedData ? (
                              <Lock className="h-3 w-3 text-amber-500" />
                            ) : (
                              <span className="font-semibold">{formatCurrency(bid.totalPrice.amount)}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {bid.submittedAt && format(new Date(bid.submittedAt), 'dd MMM yyyy')}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {bid.status.replace(/_/g, ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-8 text-center">
                  <Users className="h-12 w-12 text-zinc-200 mx-auto mb-3" />
                  <p className="text-sm text-zinc-500">No bids received yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Tender Documents</CardTitle>
                <Button variant="outline" size="sm">
                  <Paperclip className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="p-8 text-center border-2 border-dashed border-zinc-200 rounded-lg">
                <FileText className="h-12 w-12 text-zinc-200 mx-auto mb-3" />
                <p className="text-sm text-zinc-500 mb-2">No documents uploaded yet</p>
                <Button variant="outline" size="sm">Upload Documents</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { action: 'Tender Created', user: 'System Administrator', time: tender.createdAt, icon: FileText },
                  { action: 'Status Updated', user: 'System', time: tender.updatedAt, icon: History },
                ].map((event, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center">
                        <event.icon className="h-4 w-4 text-zinc-600" />
                      </div>
                      {i < 1 && <div className="flex-1 w-px bg-zinc-200 my-2" />}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="text-sm font-medium text-zinc-900">{event.action}</p>
                      <p className="text-xs text-zinc-500">by {event.user}</p>
                      <p className="text-xs text-zinc-400 mt-1">
                        {format(new Date(event.time), 'dd MMM yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
