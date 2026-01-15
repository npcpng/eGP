'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import {
  Package,
  Search,
  FileText,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  Calendar,
  DollarSign,
  Eye,
  Star,
  Download,
} from 'lucide-react';
import { useMarketplaceStore } from '@/stores/marketplace-store';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const formatCurrency = (amount: number) => {
  return `K ${amount.toLocaleString()}`;
};

export default function MarketplaceOrdersPage() {
  const { purchaseOrders, catalogItems } = useMarketplaceStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredOrders = useMemo(() => {
    return purchaseOrders.filter((order) => {
      const matchesSearch = order.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.organizationName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [purchaseOrders, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    const pending = purchaseOrders.filter((o) => o.status === 'PENDING_APPROVAL').length;
    const ordered = purchaseOrders.filter((o) => o.status === 'ORDERED').length;
    const delivered = purchaseOrders.filter((o) => o.status === 'DELIVERED').length;
    const completed = purchaseOrders.filter((o) => o.status === 'COMPLETED').length;
    const totalValue = purchaseOrders.reduce((sum, o) => sum + o.totalAmount.amount, 0);

    return { pending, ordered, delivered, completed, totalValue };
  }, [purchaseOrders]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <Badge variant="outline">Draft</Badge>;
      case 'PENDING_APPROVAL':
        return <Badge className="bg-amber-100 text-amber-700">Pending Approval</Badge>;
      case 'APPROVED':
        return <Badge className="bg-blue-100 text-blue-700">Approved</Badge>;
      case 'ORDERED':
        return <Badge className="bg-purple-100 text-purple-700">Ordered</Badge>;
      case 'DELIVERED':
        return <Badge className="bg-emerald-100 text-emerald-700">Delivered</Badge>;
      case 'COMPLETED':
        return <Badge className="bg-zinc-100 text-zinc-700">Completed</Badge>;
      case 'CANCELLED':
        return <Badge className="bg-red-100 text-red-700">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusProgress = (status: string) => {
    switch (status) {
      case 'DRAFT': return 10;
      case 'PENDING_APPROVAL': return 25;
      case 'APPROVED': return 40;
      case 'ORDERED': return 60;
      case 'DELIVERED': return 80;
      case 'COMPLETED': return 100;
      default: return 0;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Purchase Orders</h1>
          <p className="text-sm text-zinc-500">
            Track and manage your marketplace orders
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
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Pending Approval</p>
                <p className="text-2xl font-bold text-zinc-900">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Ordered</p>
                <p className="text-2xl font-bold text-zinc-900">{stats.ordered}</p>
              </div>
              <Truck className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Delivered</p>
                <p className="text-2xl font-bold text-zinc-900">{stats.delivered}</p>
              </div>
              <Package className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-zinc-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Completed</p>
                <p className="text-2xl font-bold text-zinc-900">{stats.completed}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-zinc-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Total Value</p>
                <p className="text-2xl font-bold text-zinc-900">{formatCurrency(stats.totalValue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="PENDING_APPROVAL">Pending Approval</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="ORDERED">Ordered</SelectItem>
            <SelectItem value="DELIVERED">Delivered</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <Card key={order.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-base">{order.referenceNumber}</CardTitle>
                    {getStatusBadge(order.status)}
                  </div>
                  <CardDescription className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {order.organizationName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(order.createdAt, 'dd MMM yyyy')}
                    </span>
                  </CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-zinc-900">
                    {formatCurrency(order.totalAmount.amount)}
                  </p>
                  <p className="text-sm text-zinc-500">
                    {order.items.length} item(s)
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Progress Bar */}
              <div className="space-y-2">
                <Progress value={getStatusProgress(order.status)} className="h-2" />
                <div className="flex justify-between text-xs text-zinc-500">
                  <span>Draft</span>
                  <span>Approved</span>
                  <span>Ordered</span>
                  <span>Delivered</span>
                  <span>Completed</span>
                </div>
              </div>

              {/* Order Details */}
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between p-4 rounded-lg bg-zinc-50">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center border">
                    <Building2 className="h-5 w-5 text-zinc-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-900">{order.supplierName}</p>
                    <p className="text-xs text-zinc-500">Supplier</p>
                  </div>
                </div>
                {order.deliveryDate && (
                  <div className="flex items-center gap-2 text-sm">
                    <Truck className="h-4 w-4 text-zinc-500" />
                    <span className="text-zinc-500">Delivered:</span>
                    <span className="font-medium">{format(order.deliveryDate, 'dd MMM yyyy')}</span>
                  </div>
                )}
                {order.approvedBy && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span className="text-zinc-500">Approved by:</span>
                    <span className="font-medium">{order.approvedBy}</span>
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-zinc-50">
                      <TableHead>Item</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.itemName}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.unitPrice.amount)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(item.totalPrice.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2">
                {order.status === 'PENDING_APPROVAL' && (
                  <>
                    <Button variant="outline" size="sm">
                      Reject
                    </Button>
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                  </>
                )}
                {order.status === 'DELIVERED' && (
                  <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
                    <Star className="h-4 w-4 mr-2" />
                    Rate Supplier
                  </Button>
                )}
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12 text-zinc-500">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No orders found</p>
        </div>
      )}
    </div>
  );
}
