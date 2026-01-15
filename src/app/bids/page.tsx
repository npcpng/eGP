'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  FileText,
  Download,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Lock,
  Unlock,
  Building2,
  DollarSign,
  Shield,
  ClipboardCheck,
} from 'lucide-react';
import { useProcurementStore } from '@/stores/procurement-store';
import { useSupplierStore } from '@/stores/supplier-store';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { BidStatus } from '@/types';
import { LiveBidFeed } from '@/components/bids/live-bid-feed';

const statusColors: Record<BidStatus, string> = {
  DRAFT: 'bg-zinc-100 text-zinc-700',
  SUBMITTED: 'bg-blue-100 text-blue-700',
  WITHDRAWN: 'bg-zinc-200 text-zinc-600',
  UNDER_EVALUATION: 'bg-amber-100 text-amber-700',
  RESPONSIVE: 'bg-emerald-100 text-emerald-700',
  NON_RESPONSIVE: 'bg-red-100 text-red-700',
  AWARDED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
};

const statusIcons: Record<BidStatus, React.ComponentType<{ className?: string }>> = {
  DRAFT: FileText,
  SUBMITTED: Clock,
  WITHDRAWN: XCircle,
  UNDER_EVALUATION: ClipboardCheck,
  RESPONSIVE: CheckCircle2,
  NON_RESPONSIVE: XCircle,
  AWARDED: CheckCircle2,
  REJECTED: XCircle,
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-PG', {
    style: 'currency',
    currency: 'PGK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace('PGK', 'K');
};

export default function BidsPage() {
  const { bids, tenders } = useProcurementStore();
  const { suppliers } = useSupplierStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tenderFilter, setTenderFilter] = useState<string>('all');
  const [selectedBid, setSelectedBid] = useState<string | null>(null);

  const getTenderTitle = (tenderId: string) => {
    const tender = tenders.find((t) => t.id === tenderId);
    return tender?.title || 'Unknown Tender';
  };

  const getTenderRef = (tenderId: string) => {
    const tender = tenders.find((t) => t.id === tenderId);
    return tender?.referenceNumber || 'N/A';
  };

  const getSupplierName = (supplierId: string) => {
    const supplier = suppliers.find((s) => s.id === supplierId);
    return supplier?.name || 'Unknown Supplier';
  };

  const filteredBids = useMemo(() => {
    return bids.filter((bid) => {
      if (bid.isDeleted) return false;

      if (statusFilter !== 'all' && bid.status !== statusFilter) {
        return false;
      }

      if (tenderFilter !== 'all' && bid.tenderId !== tenderFilter) {
        return false;
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const supplierName = getSupplierName(bid.supplierId).toLowerCase();
        const tenderTitle = getTenderTitle(bid.tenderId).toLowerCase();
        return (
          bid.referenceNumber.toLowerCase().includes(query) ||
          supplierName.includes(query) ||
          tenderTitle.includes(query)
        );
      }

      return true;
    });
  }, [bids, searchQuery, statusFilter, tenderFilter, suppliers, tenders]);

  const stats = useMemo(() => ({
    total: bids.length,
    submitted: bids.filter((b) => b.status === 'SUBMITTED').length,
    underEvaluation: bids.filter((b) => b.status === 'UNDER_EVALUATION').length,
    responsive: bids.filter((b) => b.status === 'RESPONSIVE').length,
    awarded: bids.filter((b) => b.status === 'AWARDED').length,
  }), [bids]);

  const tendersWithBids = useMemo(() => {
    const tenderIds = new Set(bids.map((b) => b.tenderId));
    return tenders.filter((t) => tenderIds.has(t.id));
  }, [bids, tenders]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Bid Submissions</h1>
          <p className="text-sm text-zinc-500">
            Review and evaluate submitted bids
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-zinc-100 flex items-center justify-center">
                <FileText className="h-5 w-5 text-zinc-600" />
              </div>
              <div>
                <p className="text-xs text-zinc-500">Total Bids</p>
                <p className="text-xl font-bold text-zinc-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-zinc-500">Submitted</p>
                <p className="text-xl font-bold text-blue-600">{stats.submitted}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <ClipboardCheck className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-zinc-500">Evaluating</p>
                <p className="text-xl font-bold text-amber-600">{stats.underEvaluation}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-zinc-500">Responsive</p>
                <p className="text-xl font-bold text-emerald-600">{stats.responsive}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-zinc-500">Awarded</p>
                <p className="text-xl font-bold text-green-600">{stats.awarded}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                placeholder="Search bids by reference, supplier, tender..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="SUBMITTED">Submitted</SelectItem>
                  <SelectItem value="UNDER_EVALUATION">Under Evaluation</SelectItem>
                  <SelectItem value="RESPONSIVE">Responsive</SelectItem>
                  <SelectItem value="NON_RESPONSIVE">Non-Responsive</SelectItem>
                  <SelectItem value="AWARDED">Awarded</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Select value={tenderFilter} onValueChange={setTenderFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select Tender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tenders</SelectItem>
                  {tendersWithBids.map((tender) => (
                    <SelectItem key={tender.id} value={tender.id}>
                      {tender.referenceNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bids Table */}
      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-base">
            {filteredBids.length} Bid{filteredBids.length !== 1 ? 's' : ''}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[140px]">Bid Reference</TableHead>
                <TableHead>Tender</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[70px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBids.map((bid) => {
                const StatusIcon = statusIcons[bid.status];
                const supplierName = getSupplierName(bid.supplierId);
                const tenderRef = getTenderRef(bid.tenderId);
                const tenderTitle = getTenderTitle(bid.tenderId);

                return (
                  <TableRow key={bid.id} className="hover:bg-zinc-50/50">
                    <TableCell className="font-mono text-xs">
                      <div className="flex items-center gap-2">
                        {bid.encryptedData ? (
                          <Lock className="h-3 w-3 text-amber-500" />
                        ) : (
                          <Unlock className="h-3 w-3 text-emerald-500" />
                        )}
                        {bid.referenceNumber}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px]">
                        <p className="text-xs text-zinc-500 font-mono">{tenderRef}</p>
                        <p className="text-sm truncate">{tenderTitle}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="bg-gradient-to-br from-red-500 to-amber-500 text-white text-[10px] font-semibold">
                            {supplierName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{supplierName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-zinc-400" />
                        <span className="font-semibold">{formatCurrency(bid.totalPrice.amount)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {bid.submittedAt ? (
                        <span className="text-sm text-zinc-600">
                          {format(new Date(bid.submittedAt), 'dd MMM yyyy HH:mm')}
                        </span>
                      ) : (
                        <span className="text-xs text-zinc-400">Not submitted</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={cn('text-xs gap-1', statusColors[bid.status])}>
                        <StatusIcon className="h-3 w-3" />
                        {bid.status.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setSelectedBid(bid.id)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="h-4 w-4 mr-2" />
                            Technical Proposal
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <DollarSign className="h-4 w-4 mr-2" />
                            Financial Proposal
                          </DropdownMenuItem>
                          {bid.status === 'UNDER_EVALUATION' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-emerald-600">
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Mark Responsive
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <XCircle className="h-4 w-4 mr-2" />
                                Mark Non-Responsive
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Live Bid Feed */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {/* Bid Security Info */}
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Lock className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-900">Bid Security & Encryption</p>
                  <p className="text-sm text-amber-700 mt-1">
                    All financial proposals are encrypted until the official bid opening date and time.
                    Technical proposals can be reviewed during the evaluation period.
                    Bid opening events are logged for audit purposes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div>
          <LiveBidFeed />
        </div>
      </div>
    </div>
  );
}
