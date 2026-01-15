'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  XCircle,
  Calendar,
  Building2,
  DollarSign,
  TrendingUp,
  Pause,
} from 'lucide-react';
import { useContractStore } from '@/stores/contract-store';
import { useSupplierStore } from '@/stores/supplier-store';
import { cn } from '@/lib/utils';
import { format, differenceInDays } from 'date-fns';
import type { ContractStatus } from '@/types';

const statusColors: Record<ContractStatus, string> = {
  DRAFT: 'bg-zinc-100 text-zinc-700',
  PENDING_SIGNATURE: 'bg-amber-100 text-amber-700',
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  SUSPENDED: 'bg-red-100 text-red-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
  TERMINATED: 'bg-zinc-800 text-white',
};

const statusIcons: Record<ContractStatus, React.ComponentType<{ className?: string }>> = {
  DRAFT: FileText,
  PENDING_SIGNATURE: Clock,
  ACTIVE: CheckCircle2,
  SUSPENDED: Pause,
  COMPLETED: CheckCircle2,
  TERMINATED: XCircle,
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-PG', {
    style: 'currency',
    currency: 'PGK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace('PGK', 'K');
};

export default function ContractsPage() {
  const { contracts } = useContractStore();
  const { suppliers } = useSupplierStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const getSupplierName = (supplierId: string) => {
    const supplier = suppliers.find((s) => s.id === supplierId);
    return supplier?.name || 'Unknown Supplier';
  };

  const filteredContracts = useMemo(() => {
    return contracts.filter((contract) => {
      if (contract.isDeleted) return false;
      if (statusFilter !== 'all' && contract.status !== statusFilter) return false;
      if (typeFilter !== 'all' && contract.contractType !== typeFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const supplierName = getSupplierName(contract.supplierId).toLowerCase();
        return (
          contract.title.toLowerCase().includes(query) ||
          contract.referenceNumber.toLowerCase().includes(query) ||
          supplierName.includes(query)
        );
      }
      return true;
    });
  }, [contracts, searchQuery, statusFilter, typeFilter, suppliers]);

  const stats = useMemo(() => {
    const activeContracts = contracts.filter((c) => c.status === 'ACTIVE');
    const totalValue = activeContracts.reduce((sum, c) => sum + c.value.amount, 0);
    return {
      total: contracts.length,
      active: activeContracts.length,
      pending: contracts.filter((c) => c.status === 'PENDING_SIGNATURE').length,
      completed: contracts.filter((c) => c.status === 'COMPLETED').length,
      totalValue,
    };
  }, [contracts]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Contracts</h1>
          <p className="text-sm text-zinc-500">Manage contracts and track performance</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm" className="bg-red-600 hover:bg-red-700" asChild>
            <Link href="/contracts/new">
              <Plus className="h-4 w-4 mr-2" />
              New Contract
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-zinc-100 flex items-center justify-center">
                <FileText className="h-5 w-5 text-zinc-600" />
              </div>
              <div>
                <p className="text-xs text-zinc-500">Total</p>
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
                <p className="text-xs text-zinc-500">Active</p>
                <p className="text-xl font-bold text-emerald-600">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-zinc-500">Pending</p>
                <p className="text-xl font-bold text-amber-600">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-zinc-500">Completed</p>
                <p className="text-xl font-bold text-blue-600">{stats.completed}</p>
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
                <p className="text-xs text-zinc-500">Active Value</p>
                <p className="text-xl font-bold text-red-600">{formatCurrency(stats.totalValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                placeholder="Search contracts..."
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
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="PENDING_SIGNATURE">Pending</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="GOODS">Goods</SelectItem>
                  <SelectItem value="WORKS">Works</SelectItem>
                  <SelectItem value="SERVICES">Services</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-base">{filteredContracts.length} Contracts</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Reference</TableHead>
                <TableHead>Contract</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[70px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContracts.map((contract) => {
                const StatusIcon = statusIcons[contract.status];
                const supplierName = getSupplierName(contract.supplierId);
                const today = new Date();
                const startDate = new Date(contract.period.startDate);
                const endDate = new Date(contract.period.endDate);
                const totalDays = differenceInDays(endDate, startDate);
                const elapsedDays = differenceInDays(today, startDate);
                const progress = Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));
                const completedMilestones = contract.milestones.filter((m) => m.status === 'COMPLETED').length;

                return (
                  <TableRow key={contract.id}>
                    <TableCell className="font-mono text-xs">{contract.referenceNumber}</TableCell>
                    <TableCell>
                      <div className="max-w-[280px]">
                        <p className="font-medium text-zinc-900 truncate">{contract.title}</p>
                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                          <Badge variant="outline" className="text-[10px]">{contract.contractType}</Badge>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(endDate, 'dd MMM yyyy')}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-zinc-400" />
                        <span className="text-sm">{supplierName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">{formatCurrency(contract.value.amount)}</TableCell>
                    <TableCell>
                      <div className="space-y-1 min-w-[100px]">
                        <Progress value={progress} className="h-1.5" />
                        <div className="flex items-center gap-1 text-xs text-zinc-500">
                          <CheckCircle2 className="h-3 w-3" />
                          {completedMilestones}/{contract.milestones.length} milestones
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn('text-xs gap-1', statusColors[contract.status])}>
                        <StatusIcon className="h-3 w-3" />
                        {contract.status.replace(/_/g, ' ')}
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
                            <Link href={`/contracts/${contract.id}`}>
                              <Eye className="h-4 w-4 mr-2" />View
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem><Edit className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                          <DropdownMenuItem><TrendingUp className="h-4 w-4 mr-2" />Milestones</DropdownMenuItem>
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
    </div>
  );
}
