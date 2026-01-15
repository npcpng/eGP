'use client';

import { useMemo, useState } from 'react';
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
  Package,
  Search,
  Plus,
  Truck,
  Hammer,
  FileText,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  DollarSign,
  Trash2,
  Car,
  Monitor,
  Armchair,
  Stethoscope,
} from 'lucide-react';
import { useAuctionStore } from '@/stores/auction-store';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const formatCurrency = (amount: number) => {
  return `K ${amount.toLocaleString()}`;
};

const getAssetIcon = (assetType: string) => {
  switch (assetType.toLowerCase()) {
    case 'vehicles':
      return Car;
    case 'it equipment':
      return Monitor;
    case 'furniture':
      return Armchair;
    case 'medical equipment':
      return Stethoscope;
    default:
      return Package;
  }
};

export default function AssetDisposalPage() {
  const { assetDisposals, auctions } = useAuctionStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');

  const filteredDisposals = useMemo(() => {
    return assetDisposals.filter((disposal) => {
      const matchesSearch = disposal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        disposal.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || disposal.status === statusFilter;
      const matchesMethod = methodFilter === 'all' || disposal.disposalMethod === methodFilter;
      return matchesSearch && matchesStatus && matchesMethod && !disposal.isDeleted;
    });
  }, [assetDisposals, searchQuery, statusFilter, methodFilter]);

  const stats = useMemo(() => {
    const pending = assetDisposals.filter((d) => d.status === 'PENDING').length;
    const inProgress = assetDisposals.filter((d) => d.status === 'IN_PROGRESS').length;
    const completed = assetDisposals.filter((d) => d.status === 'COMPLETED').length;
    const totalValue = assetDisposals.reduce((sum, d) => sum + d.reservePrice.amount, 0);

    return { pending, inProgress, completed, totalValue };
  }, [assetDisposals]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge className="bg-amber-100 text-amber-700">Pending Approval</Badge>;
      case 'APPROVED':
        return <Badge className="bg-blue-100 text-blue-700">Approved</Badge>;
      case 'IN_PROGRESS':
        return <Badge className="bg-purple-100 text-purple-700">In Progress</Badge>;
      case 'COMPLETED':
        return <Badge className="bg-emerald-100 text-emerald-700">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getConditionBadge = (condition: string) => {
    switch (condition) {
      case 'NEW':
        return <Badge className="bg-emerald-100 text-emerald-700">New</Badge>;
      case 'GOOD':
        return <Badge className="bg-blue-100 text-blue-700">Good</Badge>;
      case 'FAIR':
        return <Badge className="bg-amber-100 text-amber-700">Fair</Badge>;
      case 'POOR':
        return <Badge className="bg-red-100 text-red-700">Poor</Badge>;
      case 'SCRAP':
        return <Badge className="bg-zinc-100 text-zinc-700">Scrap</Badge>;
      default:
        return <Badge variant="outline">{condition}</Badge>;
    }
  };

  const getMethodBadge = (method: string) => {
    switch (method) {
      case 'AUCTION':
        return <Badge variant="outline" className="border-purple-300 text-purple-700">Auction</Badge>;
      case 'TENDER':
        return <Badge variant="outline" className="border-blue-300 text-blue-700">Tender</Badge>;
      case 'DIRECT_SALE':
        return <Badge variant="outline" className="border-emerald-300 text-emerald-700">Direct Sale</Badge>;
      case 'TRANSFER':
        return <Badge variant="outline" className="border-amber-300 text-amber-700">Transfer</Badge>;
      case 'DESTROY':
        return <Badge variant="outline" className="border-red-300 text-red-700">Destroy</Badge>;
      default:
        return <Badge variant="outline">{method}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Asset Disposal</h1>
          <p className="text-sm text-zinc-500">
            Manage disposal of surplus government assets
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Disposal Register
          </Button>
          <Button size="sm" className="bg-red-600 hover:bg-red-700">
            <Plus className="h-4 w-4 mr-2" />
            New Disposal
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
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
                <p className="text-sm text-zinc-500">In Progress</p>
                <p className="text-2xl font-bold text-zinc-900">{stats.inProgress}</p>
              </div>
              <Hammer className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Completed</p>
                <p className="text-2xl font-bold text-zinc-900">{stats.completed}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Total Reserve Value</p>
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
            placeholder="Search disposals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={methodFilter} onValueChange={setMethodFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Methods</SelectItem>
            <SelectItem value="AUCTION">Auction</SelectItem>
            <SelectItem value="TENDER">Tender</SelectItem>
            <SelectItem value="DIRECT_SALE">Direct Sale</SelectItem>
            <SelectItem value="TRANSFER">Transfer</SelectItem>
            <SelectItem value="DESTROY">Destroy</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Disposals List */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredDisposals.map((disposal) => {
          const AssetIcon = getAssetIcon(disposal.assetType);
          const linkedAuction = disposal.auctionId
            ? auctions.find((a) => a.id === disposal.auctionId)
            : null;

          return (
            <Card key={disposal.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0">
                    <AssetIcon className="h-6 w-6 text-zinc-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <CardDescription className="text-xs">{disposal.referenceNumber}</CardDescription>
                      {getStatusBadge(disposal.status)}
                    </div>
                    <CardTitle className="text-base line-clamp-1">{disposal.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-zinc-500 line-clamp-2">{disposal.description}</p>

                <div className="grid grid-cols-2 gap-4 p-3 rounded-lg bg-zinc-50">
                  <div>
                    <p className="text-xs text-zinc-500">Asset Type</p>
                    <p className="text-sm font-medium">{disposal.assetType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">Condition</p>
                    {getConditionBadge(disposal.condition)}
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">Reserve Price</p>
                    <p className="text-sm font-bold text-zinc-900">
                      {formatCurrency(disposal.reservePrice.amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">Disposal Method</p>
                    {getMethodBadge(disposal.disposalMethod)}
                  </div>
                </div>

                {linkedAuction && (
                  <div className="flex items-center gap-2 p-2 rounded-lg border border-purple-200 bg-purple-50">
                    <Hammer className="h-4 w-4 text-purple-600" />
                    <span className="text-sm text-purple-700">
                      Linked to Auction: {linkedAuction.referenceNumber}
                    </span>
                    <Badge className={cn(
                      'ml-auto',
                      linkedAuction.status === 'OPEN' && 'bg-emerald-100 text-emerald-700',
                      linkedAuction.status === 'CLOSED' && 'bg-zinc-100 text-zinc-700'
                    )}>
                      {linkedAuction.status}
                    </Badge>
                  </div>
                )}

                <div className="flex gap-2">
                  {disposal.status === 'PENDING' && (
                    <Button size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                  )}
                  {disposal.status === 'APPROVED' && disposal.disposalMethod === 'AUCTION' && (
                    <Button size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700">
                      <Hammer className="h-4 w-4 mr-2" />
                      Create Auction
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    View Details
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredDisposals.length === 0 && (
        <div className="text-center py-12 text-zinc-500">
          <Trash2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No disposals found</p>
        </div>
      )}
    </div>
  );
}
