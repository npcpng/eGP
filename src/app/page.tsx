'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  FileText,
  Users,
  Building2,
  Gavel,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Calendar,
  DollarSign,
} from 'lucide-react';
import { useProcurementStore } from '@/stores/procurement-store';
import { useSupplierStore } from '@/stores/supplier-store';
import { useContractStore } from '@/stores/contract-store';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

// Chart data
const procurementTrendData = [
  { month: 'Jul', tenders: 12, contracts: 8, value: 45 },
  { month: 'Aug', tenders: 18, contracts: 12, value: 62 },
  { month: 'Sep', tenders: 15, contracts: 10, value: 55 },
  { month: 'Oct', tenders: 22, contracts: 15, value: 78 },
  { month: 'Nov', tenders: 19, contracts: 14, value: 68 },
  { month: 'Dec', tenders: 25, contracts: 18, value: 95 },
  { month: 'Jan', tenders: 28, contracts: 20, value: 110 },
];

const categoryData = [
  { name: 'IT & Technology', value: 35, color: '#dc2626' },
  { name: 'Construction', value: 28, color: '#f97316' },
  { name: 'Medical', value: 20, color: '#eab308' },
  { name: 'Professional Services', value: 12, color: '#22c55e' },
  { name: 'Other', value: 5, color: '#64748b' },
];

const complianceData = [
  { month: 'Jul', rate: 92 },
  { month: 'Aug', rate: 88 },
  { month: 'Sep', rate: 94 },
  { month: 'Oct', rate: 91 },
  { month: 'Nov', rate: 96 },
  { month: 'Dec', rate: 93 },
  { month: 'Jan', rate: 95 },
];

const formatCurrency = (amount: number) => {
  if (amount >= 1000000) {
    return `K ${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `K ${(amount / 1000).toFixed(0)}K`;
  }
  return `K ${amount}`;
};

export default function DashboardPage() {
  const { tenders, bids } = useProcurementStore();
  const { suppliers } = useSupplierStore();
  const { contracts } = useContractStore();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Calculate metrics
  const activeTenders = tenders.filter((t) =>
    ['PUBLISHED', 'OPEN_FOR_BIDDING', 'UNDER_EVALUATION'].includes(t.status)
  );
  const activeContracts = contracts.filter((c) => c.status === 'ACTIVE');
  const activeSuppliers = suppliers.filter((s) => s.status === 'ACTIVE');

  const totalProcurementValue = tenders.reduce(
    (sum, t) => sum + t.estimatedValue.amount,
    0
  );
  const totalContractValue = contracts.reduce(
    (sum, c) => sum + c.value.amount,
    0
  );

  const pendingApprovals = tenders.filter((t) => t.status === 'PENDING_APPROVAL').length;
  const upcomingDeadlines = tenders.filter((t) => {
    const deadline = new Date(t.submissionDeadline);
    const now = new Date();
    const daysDiff = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff > 0 && daysDiff <= 7;
  });

  if (!isHydrated) {
    return null;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Dashboard</h1>
          <p className="text-sm text-zinc-500">
            Welcome to the PNG National e-Government Procurement System
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            FY 2025-2026
          </Button>
          <Button size="sm" className="bg-red-600 hover:bg-red-700">
            <Gavel className="h-4 w-4 mr-2" />
            New Tender
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-red-600">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">
              Active Tenders
            </CardTitle>
            <Gavel className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900">
              {activeTenders.length}
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-600">
              <TrendingUp className="h-3 w-3" />
              <span>+12% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">
              Active Contracts
            </CardTitle>
            <FileText className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900">
              {activeContracts.length}
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-600">
              <TrendingUp className="h-3 w-3" />
              <span>+8% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">
              Registered Suppliers
            </CardTitle>
            <Users className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900">
              {activeSuppliers.length}
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-600">
              <TrendingUp className="h-3 w-3" />
              <span>+5 new this month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-zinc-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">
              Total Procurement Value
            </CardTitle>
            <DollarSign className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900">
              {formatCurrency(totalProcurementValue)}
            </div>
            <div className="flex items-center gap-1 text-xs text-zinc-500">
              <span>PGK (Kina)</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Attention Required</CardTitle>
            <CardDescription>Items that need your immediate action</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingApprovals > 0 && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-900">
                    {pendingApprovals} tender(s) pending approval
                  </p>
                  <p className="text-xs text-amber-700">
                    Review and approve to publish
                  </p>
                </div>
                <Button variant="outline" size="sm" className="shrink-0">
                  Review
                </Button>
              </div>
            )}
            {upcomingDeadlines.length > 0 && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
                <Clock className="h-5 w-5 text-red-600 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900">
                    {upcomingDeadlines.length} deadline(s) in next 7 days
                  </p>
                  <p className="text-xs text-red-700">
                    Ensure all submissions are complete
                  </p>
                </div>
                <Button variant="outline" size="sm" className="shrink-0">
                  View
                </Button>
              </div>
            )}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-emerald-900">
                  3 contracts ready for signature
                </p>
                <p className="text-xs text-emerald-700">
                  Proceed to contract signing
                </p>
              </div>
              <Button variant="outline" size="sm" className="shrink-0">
                Sign
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Compliance Score</CardTitle>
            <CardDescription>Current month performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <div className="relative h-32 w-32">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#e4e4e7"
                    strokeWidth="12"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={`${95 * 2.51} ${100 * 2.51}`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-zinc-900">95%</span>
                  <span className="text-xs text-zinc-500">Compliant</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 w-full text-center">
                <div>
                  <p className="text-lg font-semibold text-zinc-900">98%</p>
                  <p className="text-xs text-zinc-500">On-time</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-zinc-900">92%</p>
                  <p className="text-xs text-zinc-500">Documentation</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Procurement Trend</CardTitle>
            <CardDescription>Tenders and contracts over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={procurementTrendData}>
                  <defs>
                    <linearGradient id="colorTenders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#dc2626" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorContracts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#a1a1aa" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#a1a1aa" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e4e4e7',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="tenders"
                    stroke="#dc2626"
                    strokeWidth={2}
                    fill="url(#colorTenders)"
                    name="Tenders"
                  />
                  <Area
                    type="monotone"
                    dataKey="contracts"
                    stroke="#f97316"
                    strokeWidth={2}
                    fill="url(#colorContracts)"
                    name="Contracts"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Procurement by Category</CardTitle>
            <CardDescription>Distribution of tender categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center">
              <div className="w-1/2">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e4e4e7',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-1/2 space-y-2">
                {categoryData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs text-zinc-600 flex-1">{item.name}</span>
                    <span className="text-xs font-medium text-zinc-900">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tenders and Activity */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Recent Tenders</CardTitle>
              <CardDescription>Latest procurement activities</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/tenders" className="flex items-center gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-80">
              <div className="space-y-3">
                {tenders.slice(0, 6).map((tender) => (
                  <div
                    key={tender.id}
                    className="flex items-start gap-4 p-3 rounded-lg border border-zinc-100 hover:border-zinc-200 hover:bg-zinc-50/50 transition-colors"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 shrink-0">
                      <Gavel className="h-5 w-5 text-zinc-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-zinc-900 truncate">
                            {tender.title}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {tender.referenceNumber}
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className={cn(
                            'shrink-0 text-xs',
                            tender.status === 'PUBLISHED' && 'bg-emerald-100 text-emerald-700',
                            tender.status === 'OPEN_FOR_BIDDING' && 'bg-amber-100 text-amber-700',
                            tender.status === 'UNDER_EVALUATION' && 'bg-blue-100 text-blue-700',
                            tender.status === 'DRAFT' && 'bg-zinc-100 text-zinc-700',
                            tender.status === 'AWARDED' && 'bg-emerald-100 text-emerald-700'
                          )}
                        >
                          {tender.status.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-zinc-500">
                          {formatCurrency(tender.estimatedValue.amount)}
                        </span>
                        <span className="text-xs text-zinc-400">
                          Due: {format(new Date(tender.submissionDeadline), 'dd MMM yyyy')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upcoming Deadlines</CardTitle>
            <CardDescription>Next 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-80">
              <div className="space-y-4">
                {tenders
                  .filter((t) => {
                    const deadline = new Date(t.submissionDeadline);
                    const now = new Date();
                    const daysDiff = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
                    return daysDiff > 0 && daysDiff <= 14;
                  })
                  .sort((a, b) =>
                    new Date(a.submissionDeadline).getTime() - new Date(b.submissionDeadline).getTime()
                  )
                  .slice(0, 5)
                  .map((tender) => {
                    const deadline = new Date(tender.submissionDeadline);
                    const now = new Date();
                    const daysDiff = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

                    return (
                      <div key={tender.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-zinc-900 truncate max-w-[160px]">
                            {tender.referenceNumber}
                          </span>
                          <Badge
                            variant="secondary"
                            className={cn(
                              'text-xs',
                              daysDiff <= 2 && 'bg-red-100 text-red-700',
                              daysDiff > 2 && daysDiff <= 5 && 'bg-amber-100 text-amber-700',
                              daysDiff > 5 && 'bg-emerald-100 text-emerald-700'
                            )}
                          >
                            {daysDiff}d left
                          </Badge>
                        </div>
                        <p className="text-xs text-zinc-500 line-clamp-2">
                          {tender.title}
                        </p>
                        <Progress
                          value={Math.max(0, 100 - (daysDiff / 14) * 100)}
                          className="h-1"
                        />
                      </div>
                    );
                  })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Footer Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-red-600 to-red-700 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-100">Bids Received</p>
                <p className="text-2xl font-bold">{bids.length}</p>
              </div>
              <FileText className="h-8 w-8 text-red-300" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-100">Avg. Processing</p>
                <p className="text-2xl font-bold">18 days</p>
              </div>
              <Clock className="h-8 w-8 text-amber-300" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-100">Savings</p>
                <p className="text-2xl font-bold">K 12.5M</p>
              </div>
              <TrendingUp className="h-8 w-8 text-emerald-300" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-zinc-700 to-zinc-800 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-300">Agencies</p>
                <p className="text-2xl font-bold">42</p>
              </div>
              <Building2 className="h-8 w-8 text-zinc-400" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
