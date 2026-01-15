'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
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
  FileText,
  Download,
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
  Calendar,
  Building2,
  DollarSign,
  BarChart3,
  Target,
} from 'lucide-react';
import { useProcurementStore } from '@/stores/procurement-store';
import { cn } from '@/lib/utils';

type PlanStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'PUBLISHED';

const statusColors: Record<PlanStatus, string> = {
  DRAFT: 'bg-zinc-100 text-zinc-700',
  SUBMITTED: 'bg-blue-100 text-blue-700',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  PUBLISHED: 'bg-green-100 text-green-700',
};

const statusIcons: Record<PlanStatus, React.ComponentType<{ className?: string }>> = {
  DRAFT: FileText,
  SUBMITTED: Send,
  APPROVED: CheckCircle2,
  PUBLISHED: CheckCircle2,
};

const formatCurrency = (amount: number) => {
  if (amount >= 1000000) {
    return `K ${(amount / 1000000).toFixed(1)}M`;
  }
  return `K ${(amount / 1000).toFixed(0)}K`;
};

// Mock organizations for display
const organizations: Record<string, string> = {
  'org-1': 'Department of Finance',
  'org-2': 'Department of Health',
  'org-3': 'Department of Education',
  'org-4': 'Department of Works',
  'org-5': 'Department of Transport',
};

export default function AnnualPlansPage() {
  const { plans, tenders } = useProcurementStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<string>('2026');

  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      if (plan.isDeleted) return false;

      if (statusFilter !== 'all' && plan.status !== statusFilter) {
        return false;
      }

      if (yearFilter !== 'all' && plan.fiscalYear !== parseInt(yearFilter)) {
        return false;
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const orgName = organizations[plan.organizationId]?.toLowerCase() || '';
        return orgName.includes(query);
      }

      return true;
    });
  }, [plans, searchQuery, statusFilter, yearFilter]);

  const stats = useMemo(() => {
    const totalBudget = plans.reduce((sum, p) => sum + p.totalBudget.amount, 0);
    const linkedTenders = tenders.filter((t) => t.linkedPlanItemId).length;

    return {
      total: plans.length,
      approved: plans.filter((p) => p.status === 'APPROVED' || p.status === 'PUBLISHED').length,
      pending: plans.filter((p) => p.status === 'SUBMITTED').length,
      draft: plans.filter((p) => p.status === 'DRAFT').length,
      totalBudget,
      linkedTenders,
    };
  }, [plans, tenders]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Annual Procurement Plans</h1>
          <p className="text-sm text-zinc-500">
            Manage agency procurement plans and budget allocations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm" className="bg-red-600 hover:bg-red-700" asChild>
            <Link href="/planning/new">
              <Plus className="h-4 w-4 mr-2" />
              New Plan
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-zinc-100 flex items-center justify-center">
                <FileText className="h-5 w-5 text-zinc-600" />
              </div>
              <div>
                <p className="text-xs text-zinc-500">Total Plans</p>
                <p className="text-xl font-bold text-zinc-900">{stats.total}</p>
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
                <p className="text-xs text-zinc-500">Approved</p>
                <p className="text-xl font-bold text-emerald-600">{stats.approved}</p>
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
                <p className="text-xs text-zinc-500">Pending</p>
                <p className="text-xl font-bold text-blue-600">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-zinc-500">Total Budget</p>
                <p className="text-xl font-bold text-red-600">{formatCurrency(stats.totalBudget)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Target className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-zinc-500">Linked Tenders</p>
                <p className="text-xl font-bold text-amber-600">{stats.linkedTenders}</p>
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
                placeholder="Search by organization..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-3">
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Fiscal Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  <SelectItem value="2026">FY 2026</SelectItem>
                  <SelectItem value="2025">FY 2025</SelectItem>
                  <SelectItem value="2024">FY 2024</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="SUBMITTED">Submitted</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plans Table */}
      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-base">
            {filteredPlans.length} Plan{filteredPlans.length !== 1 ? 's' : ''}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organization</TableHead>
                <TableHead>Fiscal Year</TableHead>
                <TableHead>Total Budget</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Execution</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[70px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlans.map((plan) => {
                const StatusIcon = statusIcons[plan.status];
                const orgName = organizations[plan.organizationId] || 'Unknown Organization';
                const executionRate = Math.floor(Math.random() * 40) + 30; // Mock execution rate

                return (
                  <TableRow key={plan.id} className="hover:bg-zinc-50/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-zinc-100 flex items-center justify-center">
                          <Building2 className="h-4 w-4 text-zinc-600" />
                        </div>
                        <div>
                          <p className="font-medium text-zinc-900">{orgName}</p>
                          <p className="text-xs text-zinc-500">Plan ID: {plan.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        <Calendar className="h-3 w-3 mr-1" />
                        FY {plan.fiscalYear}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="font-semibold text-zinc-900">
                        {formatCurrency(plan.totalBudget.amount)}
                      </p>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{plan.items.length} items</span>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 w-24">
                        <Progress value={executionRate} className="h-2" />
                        <p className="text-xs text-zinc-500">{executionRate}% executed</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn('text-xs gap-1', statusColors[plan.status])}>
                        <StatusIcon className="h-3 w-3" />
                        {plan.status}
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
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Plan
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <BarChart3 className="h-4 w-4 mr-2" />
                            View Analytics
                          </DropdownMenuItem>
                          {plan.status === 'DRAFT' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-blue-600">
                                <Send className="h-4 w-4 mr-2" />
                                Submit for Approval
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

      {/* Planning Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">Annual Procurement Planning</p>
              <p className="text-sm text-blue-700 mt-1">
                All government agencies must submit their Annual Procurement Plans (APP) by
                September 30th for the following fiscal year. Plans must be approved by the
                Agency Head and published on the eGP portal. All procurement activities must
                be linked to an approved plan item.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
