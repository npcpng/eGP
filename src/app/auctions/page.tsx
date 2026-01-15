'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
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
  Hammer,
  Search,
  Plus,
  Clock,
  TrendingDown,
  TrendingUp,
  Users,
  DollarSign,
  ArrowRight,
  Play,
  Pause,
  CheckCircle2,
  AlertTriangle,
  Timer,
  Bell,
} from 'lucide-react';
import { useAuctionStore } from '@/stores/auction-store';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';

const formatCurrency = (amount: number) => {
  return `K ${amount.toLocaleString()}`;
};

const getTimeRemaining = (endTime: Date) => {
  const now = new Date();
  const diff = endTime.getTime() - now.getTime();
  if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0, expired: true };

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { hours, minutes, seconds, expired: false };
};

export default function AuctionsPage() {
  const { auctions, auctionBids } = useAuctionStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second for live countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const filteredAuctions = useMemo(() => {
    return auctions.filter((auction) => {
      const matchesSearch = auction.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        auction.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === 'all' || auction.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || auction.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus && !auction.isDeleted;
    });
  }, [auctions, searchQuery, typeFilter, statusFilter]);

  const stats = useMemo(() => {
    const active = auctions.filter((a) => a.status === 'OPEN' && !a.isDeleted);
    const scheduled = auctions.filter((a) => a.status === 'SCHEDULED' && !a.isDeleted);
    const totalBids = auctionBids.length;
    const totalValue = active.reduce((sum, a) => sum + a.currentPrice.amount, 0);

    return {
      activeCount: active.length,
      scheduledCount: scheduled.length,
      totalBids,
      totalValue,
    };
  }, [auctions, auctionBids]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <Badge className="bg-emerald-100 text-emerald-700">Live</Badge>;
      case 'SCHEDULED':
        return <Badge className="bg-blue-100 text-blue-700">Scheduled</Badge>;
      case 'CLOSED':
        return <Badge className="bg-zinc-100 text-zinc-700">Closed</Badge>;
      case 'CANCELLED':
        return <Badge className="bg-red-100 text-red-700">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    if (type === 'REVERSE') {
      return (
        <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50">
          <TrendingDown className="h-3 w-3 mr-1" />
          Reverse
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="border-emerald-300 text-emerald-700 bg-emerald-50">
        <TrendingUp className="h-3 w-3 mr-1" />
        Forward
      </Badge>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">eAuctions (S05)</h1>
          <p className="text-sm text-zinc-500">
            Dynamic negotiations and real-time bidding platform
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Clock className="h-4 w-4 mr-2" />
            Auction History
          </Button>
          <Button size="sm" className="bg-red-600 hover:bg-red-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Auction
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Live Auctions</p>
                <p className="text-2xl font-bold text-zinc-900">{stats.activeCount}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Play className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Scheduled</p>
                <p className="text-2xl font-bold text-zinc-900">{stats.scheduledCount}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Total Bids</p>
                <p className="text-2xl font-bold text-zinc-900">{stats.totalBids}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Active Value</p>
                <p className="text-2xl font-bold text-zinc-900">{formatCurrency(stats.totalValue)}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search auctions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Auction Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="REVERSE">Reverse Auction</SelectItem>
            <SelectItem value="FORWARD">Forward Auction</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="OPEN">Live</SelectItem>
            <SelectItem value="SCHEDULED">Scheduled</SelectItem>
            <SelectItem value="CLOSED">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Auctions Tabs */}
      <Tabs defaultValue="live" className="space-y-4">
        <TabsList>
          <TabsTrigger value="live" className="gap-2">
            <Play className="h-4 w-4" />
            Live Auctions
            {stats.activeCount > 0 && (
              <Badge className="ml-1 bg-emerald-600">{stats.activeCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="gap-2">
            <Clock className="h-4 w-4" />
            Scheduled
          </TabsTrigger>
          <TabsTrigger value="all" className="gap-2">
            <Hammer className="h-4 w-4" />
            All Auctions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredAuctions
              .filter((a) => a.status === 'OPEN')
              .map((auction) => {
                const timeRemaining = getTimeRemaining(auction.endTime);
                const bidsCount = auctionBids.filter((b) => b.auctionId === auction.id).length;
                const percentChange = auction.type === 'REVERSE'
                  ? ((auction.reservePrice?.amount || 0) - auction.currentPrice.amount) / (auction.reservePrice?.amount || 1) * 100
                  : (auction.currentPrice.amount - (auction.reservePrice?.amount || 0)) / (auction.reservePrice?.amount || 1) * 100;

                return (
                  <Card key={auction.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className={cn(
                      'h-2',
                      auction.type === 'REVERSE' ? 'bg-amber-500' : 'bg-emerald-500'
                    )} />
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardDescription className="text-xs">{auction.referenceNumber}</CardDescription>
                          <CardTitle className="text-base line-clamp-2">{auction.title}</CardTitle>
                        </div>
                        {getTypeBadge(auction.type)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Current Price */}
                      <div className="p-3 rounded-lg bg-zinc-50 border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-zinc-500">Current Price</span>
                          <span className={cn(
                            'text-xs font-medium flex items-center gap-1',
                            auction.type === 'REVERSE' ? 'text-emerald-600' : 'text-emerald-600'
                          )}>
                            {auction.type === 'REVERSE' ? (
                              <TrendingDown className="h-3 w-3" />
                            ) : (
                              <TrendingUp className="h-3 w-3" />
                            )}
                            {percentChange.toFixed(1)}%
                          </span>
                        </div>
                        <p className="text-2xl font-bold text-zinc-900">
                          {formatCurrency(auction.currentPrice.amount)}
                        </p>
                        {auction.minimumDecrement && (
                          <p className="text-xs text-zinc-500 mt-1">
                            Min. decrement: {formatCurrency(auction.minimumDecrement.amount)}
                          </p>
                        )}
                      </div>

                      {/* Time Remaining */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-500 flex items-center gap-1">
                            <Timer className="h-3 w-3" />
                            Time Remaining
                          </span>
                          <span className="font-medium text-zinc-900">
                            {bidsCount} bids
                          </span>
                        </div>
                        <div className={cn(
                          'flex items-center justify-center gap-2 p-2 rounded-lg font-mono text-lg font-bold',
                          timeRemaining.hours < 1 ? 'bg-red-50 text-red-700' : 'bg-zinc-100 text-zinc-900'
                        )}>
                          <span>{String(timeRemaining.hours).padStart(2, '0')}</span>
                          <span>:</span>
                          <span>{String(timeRemaining.minutes).padStart(2, '0')}</span>
                          <span>:</span>
                          <span>{String(timeRemaining.seconds).padStart(2, '0')}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button className="flex-1 bg-red-600 hover:bg-red-700">
                          <Hammer className="h-4 w-4 mr-2" />
                          Place Bid
                        </Button>
                        <Button variant="outline" size="icon">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
          {filteredAuctions.filter((a) => a.status === 'OPEN').length === 0 && (
            <div className="text-center py-12 text-zinc-500">
              <Hammer className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No live auctions at the moment</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredAuctions
              .filter((a) => a.status === 'SCHEDULED')
              .map((auction) => (
                <Card key={auction.id} className="overflow-hidden">
                  <div className="h-2 bg-blue-500" />
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardDescription className="text-xs">{auction.referenceNumber}</CardDescription>
                        <CardTitle className="text-base line-clamp-2">{auction.title}</CardTitle>
                      </div>
                      {getTypeBadge(auction.type)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-500">Starting Price</span>
                        <span className="font-medium">{formatCurrency(auction.reservePrice?.amount || 0)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-500">Starts</span>
                        <span className="font-medium">{format(auction.startTime, 'dd MMM yyyy, HH:mm')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-500">Duration</span>
                        <span className="font-medium">
                          {Math.round((auction.endTime.getTime() - auction.startTime.getTime()) / (1000 * 60 * 60))} hours
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">
                      <Bell className="h-4 w-4 mr-2" />
                      Set Reminder
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Current Price</TableHead>
                  <TableHead>End Time</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAuctions.map((auction) => (
                  <TableRow key={auction.id}>
                    <TableCell className="font-medium text-sm">
                      {auction.referenceNumber}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {auction.title}
                    </TableCell>
                    <TableCell>{getTypeBadge(auction.type)}</TableCell>
                    <TableCell>{getStatusBadge(auction.status)}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(auction.currentPrice.amount)}
                    </TableCell>
                    <TableCell className="text-sm text-zinc-500">
                      {format(auction.endTime, 'dd MMM yyyy, HH:mm')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        View
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
