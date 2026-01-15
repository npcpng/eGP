'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  FileText,
  Download,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Gavel,
  Calendar,
  Building2,
} from 'lucide-react';
import { useProcurementStore } from '@/stores/procurement-store';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
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

const statusIcons: Record<TenderStatus, React.ComponentType<{ className?: string }>> = {
  DRAFT: FileText,
  PENDING_APPROVAL: Clock,
  APPROVED: CheckCircle2,
  PUBLISHED: Gavel,
  OPEN_FOR_BIDDING: Gavel,
  CLOSED: XCircle,
  UNDER_EVALUATION: Clock,
  EVALUATED: CheckCircle2,
  AWARDED: CheckCircle2,
  CANCELLED: XCircle,
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-PG', {
    style: 'currency',
    currency: 'PGK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace('PGK', 'K');
};

export default function TendersPage() {
  const { tenders } = useProcurementStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [view, setView] = useState<'table' | 'cards'>('table');

  const categories = useMemo(() => {
    const cats = new Set(tenders.map((t) => t.category));
    return Array.from(cats);
  }, [tenders]);

  const filteredTenders = useMemo(() => {
    return tenders.filter((tender) => {
      if (tender.isDeleted) return false;

      if (statusFilter !== 'all' && tender.status !== statusFilter) {
        return false;
      }

      if (categoryFilter !== 'all' && tender.category !== categoryFilter) {
        return false;
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          tender.title.toLowerCase().includes(query) ||
          tender.referenceNumber.toLowerCase().includes(query) ||
          tender.description.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [tenders, searchQuery, statusFilter, categoryFilter]);

  const stats = useMemo(() => ({
    total: tenders.length,
    published: tenders.filter((t) => t.status === 'PUBLISHED').length,
    openForBidding: tenders.filter((t) => t.status === 'OPEN_FOR_BIDDING').length,
    underEvaluation: tenders.filter((t) => t.status === 'UNDER_EVALUATION').length,
    awarded: tenders.filter((t) => t.status === 'AWARDED').length,
  }), [tenders]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Tenders</h1>
          <p className="text-sm text-zinc-500">
            Manage procurement tenders and quotations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm" className="bg-red-600 hover:bg-red-700" asChild>
            <Link href="/tenders/new">
              <Plus className="h-4 w-4 mr-2" />
              New Tender
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="cursor-pointer hover:border-zinc-300 transition-colors" onClick={() => setStatusFilter('all')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-zinc-500 uppercase">Total</p>
                <p className="text-2xl font-bold text-zinc-900">{stats.total}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-zinc-100 flex items-center justify-center">
                <FileText className="h-5 w-5 text-zinc-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-emerald-300 transition-colors" onClick={() => setStatusFilter('PUBLISHED')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-zinc-500 uppercase">Published</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.published}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Gavel className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-green-300 transition-colors" onClick={() => setStatusFilter('OPEN_FOR_BIDDING')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-zinc-500 uppercase">Open</p>
                <p className="text-2xl font-bold text-green-600">{stats.openForBidding}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-amber-300 transition-colors" onClick={() => setStatusFilter('UNDER_EVALUATION')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-zinc-500 uppercase">Evaluating</p>
                <p className="text-2xl font-bold text-amber-600">{stats.underEvaluation}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-emerald-300 transition-colors" onClick={() => setStatusFilter('AWARDED')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-zinc-500 uppercase">Awarded</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.awarded}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
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
                placeholder="Search tenders by title, reference number..."
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
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PENDING_APPROVAL">Pending Approval</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="OPEN_FOR_BIDDING">Open for Bidding</SelectItem>
                  <SelectItem value="UNDER_EVALUATION">Under Evaluation</SelectItem>
                  <SelectItem value="AWARDED">Awarded</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
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

      {/* Results */}
      <Card>
        <CardHeader className="py-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              {filteredTenders.length} Tender{filteredTenders.length !== 1 ? 's' : ''} Found
            </CardTitle>
            <Tabs value={view} onValueChange={(v) => setView(v as 'table' | 'cards')}>
              <TabsList className="h-8">
                <TabsTrigger value="table" className="text-xs px-3">Table</TabsTrigger>
                <TabsTrigger value="cards" className="text-xs px-3">Cards</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {view === 'table' ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Reference</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTenders.map((tender) => {
                  const StatusIcon = statusIcons[tender.status];
                  return (
                    <TableRow key={tender.id} className="hover:bg-zinc-50/50">
                      <TableCell className="font-mono text-xs">
                        {tender.referenceNumber}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[300px]">
                          <p className="font-medium text-zinc-900 truncate">
                            {tender.title}
                          </p>
                          <p className="text-xs text-zinc-500 truncate">
                            {tender.procurementMethod.replace(/_/g, ' ')}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {tender.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(tender.estimatedValue.amount)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-zinc-400" />
                          <span className="text-sm">
                            {format(new Date(tender.submissionDeadline), 'dd MMM yyyy')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn('text-xs gap-1', statusColors[tender.status])}>
                          <StatusIcon className="h-3 w-3" />
                          {tender.status.replace(/_/g, ' ')}
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
                            <DropdownMenuItem asChild>
                              <Link href={`/tenders/${tender.id}`} className="flex items-center gap-2">
                                <Eye className="h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FileText className="h-4 w-4 mr-2" />
                              Documents
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTenders.map((tender) => {
                const StatusIcon = statusIcons[tender.status];
                return (
                  <Card key={tender.id} className="hover:border-zinc-300 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <Badge className={cn('text-xs gap-1', statusColors[tender.status])}>
                          <StatusIcon className="h-3 w-3" />
                          {tender.status.replace(/_/g, ' ')}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/tenders/${tender.id}`}>View Details</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <p className="text-xs font-mono text-zinc-500 mb-1">
                        {tender.referenceNumber}
                      </p>
                      <h3 className="font-medium text-zinc-900 line-clamp-2 mb-2">
                        {tender.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-zinc-500 mb-3">
                        <Building2 className="h-3 w-3" />
                        <span>{tender.category}</span>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
                        <div>
                          <p className="text-xs text-zinc-500">Value</p>
                          <p className="font-semibold text-zinc-900">
                            {formatCurrency(tender.estimatedValue.amount)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-zinc-500">Deadline</p>
                          <p className="text-sm font-medium text-zinc-900">
                            {format(new Date(tender.submissionDeadline), 'dd MMM yyyy')}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
