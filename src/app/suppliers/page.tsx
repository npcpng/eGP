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
import { Progress } from '@/components/ui/progress';
import {
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Ban,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  Mail,
  Phone,
  MapPin,
  Star,
  Download,
  Users,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { useSupplierStore } from '@/stores/supplier-store';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { SupplierStatus } from '@/types';

const statusColors: Record<SupplierStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  SUSPENDED: 'bg-red-100 text-red-700',
  BLACKLISTED: 'bg-zinc-800 text-white',
  INACTIVE: 'bg-zinc-100 text-zinc-600',
};

const statusIcons: Record<SupplierStatus, React.ComponentType<{ className?: string }>> = {
  PENDING: Clock,
  ACTIVE: CheckCircle2,
  SUSPENDED: AlertTriangle,
  BLACKLISTED: Ban,
  INACTIVE: Clock,
};

export default function SuppliersPage() {
  const { suppliers } = useSupplierStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const categories = useMemo(() => {
    const cats = new Set<string>();
    suppliers.forEach((s) => s.categories.forEach((c) => cats.add(c)));
    return Array.from(cats);
  }, [suppliers]);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((supplier) => {
      if (supplier.isDeleted) return false;

      if (statusFilter !== 'all' && supplier.status !== statusFilter) {
        return false;
      }

      if (categoryFilter !== 'all' && !supplier.categories.includes(categoryFilter)) {
        return false;
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          supplier.name.toLowerCase().includes(query) ||
          supplier.registrationNumber.toLowerCase().includes(query) ||
          supplier.contact.email.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [suppliers, searchQuery, statusFilter, categoryFilter]);

  const stats = useMemo(() => ({
    total: suppliers.length,
    active: suppliers.filter((s) => s.status === 'ACTIVE').length,
    pending: suppliers.filter((s) => s.status === 'PENDING').length,
    suspended: suppliers.filter((s) => s.status === 'SUSPENDED').length,
    sme: suppliers.filter((s) => s.classifications.some((c) => c.type === 'SME')).length,
    womenOwned: suppliers.filter((s) => s.classifications.some((c) => c.type === 'WOMEN_OWNED')).length,
  }), [suppliers]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Supplier Registry</h1>
          <p className="text-sm text-zinc-500">
            Manage registered suppliers and their qualifications
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm" className="bg-red-600 hover:bg-red-700" asChild>
            <Link href="/suppliers/register">
              <Plus className="h-4 w-4 mr-2" />
              Register Supplier
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-zinc-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-zinc-600" />
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
              <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-zinc-500">Suspended</p>
                <p className="text-xl font-bold text-red-600">{stats.suspended}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-zinc-500">SME</p>
                <p className="text-xl font-bold text-blue-600">{stats.sme}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-pink-100 flex items-center justify-center">
                <Award className="h-5 w-5 text-pink-600" />
              </div>
              <div>
                <p className="text-xs text-zinc-500">Women-Owned</p>
                <p className="text-xl font-bold text-pink-600">{stats.womenOwned}</p>
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
                placeholder="Search suppliers by name, registration number, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                  <SelectItem value="BLACKLISTED">Blacklisted</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[160px]">
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

      {/* Suppliers Table */}
      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-base">
            {filteredSuppliers.length} Supplier{filteredSuppliers.length !== 1 ? 's' : ''}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supplier</TableHead>
                <TableHead>Registration</TableHead>
                <TableHead>Categories</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[70px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuppliers.map((supplier) => {
                const StatusIcon = statusIcons[supplier.status];
                const avgPerformance = supplier.performanceHistory.length > 0
                  ? Math.round(
                      supplier.performanceHistory.reduce((sum, p) => sum + p.overallScore, 0) /
                      supplier.performanceHistory.length
                    )
                  : null;

                return (
                  <TableRow key={supplier.id} className="hover:bg-zinc-50/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-gradient-to-br from-red-500 to-amber-500 text-white text-sm font-semibold">
                            {supplier.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-zinc-900">{supplier.name}</p>
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3 text-zinc-400" />
                            <span className="text-xs text-zinc-500">{supplier.contact.email}</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-mono text-xs">{supplier.registrationNumber}</p>
                      <p className="text-xs text-zinc-500">{supplier.type.replace(/_/g, ' ')}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[180px]">
                        {supplier.categories.slice(0, 2).map((cat) => (
                          <Badge key={cat} variant="outline" className="text-xs">
                            {cat}
                          </Badge>
                        ))}
                        {supplier.categories.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{supplier.categories.length - 2}
                          </Badge>
                        )}
                      </div>
                      {supplier.classifications.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {supplier.classifications.map((c) => (
                            <Badge key={c.type} className="text-[10px] bg-blue-100 text-blue-700">
                              {c.type.replace(/_/g, ' ')}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3 text-zinc-400" />
                        <span>{supplier.address.city}, {supplier.address.province}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {avgPerformance !== null ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Progress value={avgPerformance} className="h-2 w-20" />
                            <span className={cn(
                              'text-sm font-medium',
                              avgPerformance >= 80 && 'text-emerald-600',
                              avgPerformance >= 60 && avgPerformance < 80 && 'text-amber-600',
                              avgPerformance < 60 && 'text-red-600'
                            )}>
                              {avgPerformance}%
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={cn(
                                  'h-3 w-3',
                                  star <= Math.round(avgPerformance / 20)
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-zinc-200'
                                )}
                              />
                            ))}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-400">No data</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={cn('text-xs gap-1', statusColors[supplier.status])}>
                        <StatusIcon className="h-3 w-3" />
                        {supplier.status}
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
                            <Link href={`/suppliers/${supplier.id}`} className="flex items-center gap-2">
                              <Eye className="h-4 w-4" />
                              View Profile
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <ShieldCheck className="h-4 w-4 mr-2" />
                            Qualifications
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {supplier.status === 'ACTIVE' && (
                            <DropdownMenuItem className="text-red-600">
                              <Ban className="h-4 w-4 mr-2" />
                              Suspend
                            </DropdownMenuItem>
                          )}
                          {supplier.status === 'SUSPENDED' && (
                            <DropdownMenuItem className="text-emerald-600">
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Reactivate
                            </DropdownMenuItem>
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
    </div>
  );
}
