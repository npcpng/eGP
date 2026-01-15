'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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
  AreaChart,
  Area,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Download,
  FileText,
  Users,
  Building2,
  DollarSign,
  Clock,
  CheckCircle2,
  BarChart3,
  PieChartIcon,
  Calendar,
} from 'lucide-react';
import { useProcurementStore } from '@/stores/procurement-store';
import { useSupplierStore } from '@/stores/supplier-store';
import { useContractStore } from '@/stores/contract-store';

const monthlyData = [
  { month: 'Jul', tenders: 12, value: 45, savings: 4.2 },
  { month: 'Aug', tenders: 18, value: 62, savings: 5.8 },
  { month: 'Sep', tenders: 15, value: 55, savings: 4.9 },
  { month: 'Oct', tenders: 22, value: 78, savings: 7.2 },
  { month: 'Nov', tenders: 19, value: 68, savings: 6.1 },
  { month: 'Dec', tenders: 25, value: 95, savings: 8.5 },
  { month: 'Jan', tenders: 28, value: 110, savings: 9.8 },
];

const categoryData = [
  { name: 'IT & Technology', value: 35, amount: 45.2 },
  { name: 'Construction', value: 28, amount: 36.4 },
  { name: 'Medical', value: 20, amount: 26.0 },
  { name: 'Services', value: 12, amount: 15.6 },
  { name: 'Other', value: 5, amount: 6.5 },
];

const colors = ['#dc2626', '#f97316', '#eab308', '#22c55e', '#64748b'];

const processingTimeData = [
  { stage: 'Planning', days: 5 },
  { stage: 'Preparation', days: 8 },
  { stage: 'Bidding', days: 21 },
  { stage: 'Evaluation', days: 12 },
  { stage: 'Award', days: 3 },
  { stage: 'Contract', days: 7 },
];

const complianceMetrics = [
  { name: 'On-time Delivery', value: 94, target: 90 },
  { name: 'Documentation', value: 98, target: 95 },
  { name: 'Budget Adherence', value: 91, target: 85 },
  { name: 'Approval Workflow', value: 100, target: 100 },
];

export default function ReportsDashboardPage() {
  const { tenders, bids } = useProcurementStore();
  const { suppliers } = useSupplierStore();
  const { contracts } = useContractStore();

  const stats = useMemo(() => {
    const totalTenderValue = tenders.reduce((sum, t) => sum + t.estimatedValue.amount, 0);
    const totalContractValue = contracts.reduce((sum, c) => sum + c.value.amount, 0);
    const activeSuppliers = suppliers.filter((s) => s.status === 'ACTIVE').length;
    const activeTenders = tenders.filter((t) =>
      ['PUBLISHED', 'OPEN_FOR_BIDDING', 'UNDER_EVALUATION'].includes(t.status)
    ).length;
    const activeContracts = contracts.filter((c) => c.status === 'ACTIVE').length;
    const avgBidsPerTender = bids.length / Math.max(tenders.length, 1);

    return {
      totalTenderValue,
      totalContractValue,
      activeSuppliers,
      activeTenders,
      activeContracts,
      avgBidsPerTender: avgBidsPerTender.toFixed(1),
      savingsRate: 12.5,
    };
  }, [tenders, contracts, suppliers, bids]);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) return `K ${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `K ${(amount / 1000).toFixed(0)}K`;
    return `K ${amount}`;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Reports & Analytics</h1>
          <p className="text-sm text-zinc-500">
            Comprehensive procurement insights and KPI tracking
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            FY 2025-2026
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-red-600 to-red-700 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-100">Total Procurement Value</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalTenderValue)}</p>
                <div className="flex items-center gap-1 mt-1 text-xs text-red-200">
                  <TrendingUp className="h-3 w-3" />
                  <span>+15% vs last FY</span>
                </div>
              </div>
              <DollarSign className="h-10 w-10 text-red-300 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-100">Savings Achieved</p>
                <p className="text-2xl font-bold">K 12.5M</p>
                <div className="flex items-center gap-1 mt-1 text-xs text-emerald-200">
                  <TrendingUp className="h-3 w-3" />
                  <span>{stats.savingsRate}% savings rate</span>
                </div>
              </div>
              <TrendingUp className="h-10 w-10 text-emerald-300 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-100">Avg. Processing Time</p>
                <p className="text-2xl font-bold">56 days</p>
                <div className="flex items-center gap-1 mt-1 text-xs text-amber-200">
                  <TrendingDown className="h-3 w-3" />
                  <span>-8 days vs target</span>
                </div>
              </div>
              <Clock className="h-10 w-10 text-amber-300 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-zinc-700 to-zinc-800 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-300">Avg. Bids per Tender</p>
                <p className="text-2xl font-bold">{stats.avgBidsPerTender}</p>
                <div className="flex items-center gap-1 mt-1 text-xs text-zinc-400">
                  <Users className="h-3 w-3" />
                  <span>{stats.activeSuppliers} active suppliers</span>
                </div>
              </div>
              <Users className="h-10 w-10 text-zinc-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-zinc-500" />
              Procurement Trend
            </CardTitle>
            <CardDescription>Monthly tender volume and value</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="valueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#dc2626" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
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
                    dataKey="value"
                    stroke="#dc2626"
                    strokeWidth={2}
                    fill="url(#valueGradient)"
                    name="Value (M Kina)"
                  />
                  <Line
                    type="monotone"
                    dataKey="tenders"
                    stroke="#f97316"
                    strokeWidth={2}
                    dot={{ fill: '#f97316', r: 3 }}
                    name="Tenders"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-zinc-500" />
              Procurement by Category
            </CardTitle>
            <CardDescription>Distribution of procurement categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 flex items-center">
              <div className="w-1/2">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
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
              <div className="w-1/2 space-y-3">
                {categoryData.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full shrink-0"
                        style={{ backgroundColor: colors[index] }}
                      />
                      <span className="text-sm text-zinc-600">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-zinc-900">{item.value}%</span>
                      <span className="text-xs text-zinc-500 ml-2">K{item.amount}M</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Processing Time by Stage</CardTitle>
            <CardDescription>Average days per procurement stage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={processingTimeData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 12 }} stroke="#a1a1aa" />
                  <YAxis dataKey="stage" type="category" tick={{ fontSize: 12 }} stroke="#a1a1aa" width={80} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e4e4e7',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="days" fill="#dc2626" radius={[0, 4, 4, 0]} name="Days" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Compliance Metrics</CardTitle>
            <CardDescription>Performance against targets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {complianceMetrics.map((metric) => (
                <div key={metric.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-600">{metric.name}</span>
                    <span className="font-medium text-zinc-900">{metric.value}%</span>
                  </div>
                  <div className="relative">
                    <Progress value={metric.value} className="h-2" />
                    <div
                      className="absolute top-0 h-2 w-0.5 bg-zinc-800"
                      style={{ left: `${metric.target}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>Target: {metric.target}%</span>
                    {metric.value >= metric.target ? (
                      <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">Met</Badge>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-700 text-[10px]">Below</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-zinc-100 flex items-center justify-center">
                <FileText className="h-6 w-6 text-zinc-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-zinc-900">{tenders.length}</p>
                <p className="text-sm text-zinc-500">Total Tenders</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-zinc-100 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-zinc-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-zinc-900">{contracts.length}</p>
                <p className="text-sm text-zinc-500">Contracts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-zinc-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-zinc-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-zinc-900">{suppliers.length}</p>
                <p className="text-sm text-zinc-500">Suppliers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-zinc-100 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-zinc-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-zinc-900">42</p>
                <p className="text-sm text-zinc-500">Agencies</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
