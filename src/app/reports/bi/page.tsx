'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
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
  Database,
  BarChart3,
  PieChart,
  Download,
  RefreshCw,
  Key,
  Link2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  FileJson,
  FileSpreadsheet,
  Globe,
  Shield,
  Zap,
  Copy,
  Eye,
  EyeOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const connectors = [
  {
    id: 'power-bi',
    name: 'Power BI',
    icon: BarChart3,
    status: 'connected',
    lastSync: new Date(Date.now() - 30 * 60 * 1000),
    description: 'Microsoft Power BI Desktop and Service',
    datasets: ['Procurement Events', 'Contracts', 'Suppliers'],
  },
  {
    id: 'tableau',
    name: 'Tableau',
    icon: PieChart,
    status: 'available',
    lastSync: null,
    description: 'Tableau Desktop and Tableau Server',
    datasets: [],
  },
  {
    id: 'excel',
    name: 'Excel / CSV',
    icon: FileSpreadsheet,
    status: 'connected',
    lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000),
    description: 'Microsoft Excel and CSV exports',
    datasets: ['All Datasets'],
  },
  {
    id: 'api',
    name: 'REST API',
    icon: Globe,
    status: 'connected',
    lastSync: new Date(Date.now() - 5 * 60 * 1000),
    description: 'Direct API access for custom integrations',
    datasets: ['All Endpoints'],
  },
];

const dataModels = [
  {
    name: 'Procurement Events',
    tables: 12,
    rows: '125,847',
    lastUpdate: new Date(Date.now() - 15 * 60 * 1000),
    status: 'synced',
  },
  {
    name: 'Supplier Registry',
    tables: 8,
    rows: '3,421',
    lastUpdate: new Date(Date.now() - 15 * 60 * 1000),
    status: 'synced',
  },
  {
    name: 'Contracts',
    tables: 10,
    rows: '8,654',
    lastUpdate: new Date(Date.now() - 15 * 60 * 1000),
    status: 'synced',
  },
  {
    name: 'Marketplace Transactions',
    tables: 6,
    rows: '45,892',
    lastUpdate: new Date(Date.now() - 15 * 60 * 1000),
    status: 'synced',
  },
  {
    name: 'Audit Logs',
    tables: 3,
    rows: '1,245,678',
    lastUpdate: new Date(Date.now() - 5 * 60 * 1000),
    status: 'synced',
  },
  {
    name: 'OCDS Releases',
    tables: 15,
    rows: '98,234',
    lastUpdate: new Date(Date.now() - 60 * 60 * 1000),
    status: 'pending',
  },
];

const apiEndpoints = [
  { endpoint: '/api/v1/tenders', method: 'GET', description: 'List all tenders', rateLimit: '1000/hour' },
  { endpoint: '/api/v1/contracts', method: 'GET', description: 'List all contracts', rateLimit: '1000/hour' },
  { endpoint: '/api/v1/suppliers', method: 'GET', description: 'List all suppliers', rateLimit: '1000/hour' },
  { endpoint: '/api/v1/ocds/releases', method: 'GET', description: 'OCDS release packages', rateLimit: '500/hour' },
  { endpoint: '/api/v1/analytics/kpi', method: 'GET', description: 'KPI metrics', rateLimit: '100/hour' },
  { endpoint: '/api/v1/reports/export', method: 'POST', description: 'Generate reports', rateLimit: '50/hour' },
];

export default function BIConnectorsPage() {
  const [showApiKey, setShowApiKey] = useState(false);
  const apiKey = 'egp_live_sk_1234567890abcdef1234567890abcdef';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">BI Connectors (S15)</h1>
          <p className="text-sm text-zinc-500">
            Connect your business intelligence tools to the eGP Data Warehouse
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync All
          </Button>
          <Button size="sm" className="bg-red-600 hover:bg-red-700">
            <Key className="h-4 w-4 mr-2" />
            New API Key
          </Button>
        </div>
      </div>

      {/* Alert */}
      <Alert className="border-blue-200 bg-blue-50">
        <Database className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-900">Data Warehouse Status</AlertTitle>
        <AlertDescription className="text-blue-700">
          All data models are synchronized. Last full sync completed at 14:30 today. Next scheduled sync in 25 minutes.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="connectors" className="space-y-4">
        <TabsList>
          <TabsTrigger value="connectors" className="gap-2">
            <Link2 className="h-4 w-4" />
            Connectors
          </TabsTrigger>
          <TabsTrigger value="data-models" className="gap-2">
            <Layers className="h-4 w-4" />
            Data Models
          </TabsTrigger>
          <TabsTrigger value="api" className="gap-2">
            <Globe className="h-4 w-4" />
            API Access
          </TabsTrigger>
        </TabsList>

        <TabsContent value="connectors" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {connectors.map((connector) => (
              <Card key={connector.id} className={cn(
                'overflow-hidden',
                connector.status === 'connected' && 'border-l-4 border-l-emerald-500'
              )}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-zinc-100 flex items-center justify-center">
                        <connector.icon className="h-6 w-6 text-zinc-600" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{connector.name}</CardTitle>
                        <CardDescription>{connector.description}</CardDescription>
                      </div>
                    </div>
                    {connector.status === 'connected' ? (
                      <Badge className="bg-emerald-100 text-emerald-700">Connected</Badge>
                    ) : (
                      <Badge variant="outline">Available</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {connector.status === 'connected' ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-500">Last Sync</span>
                        <span className="flex items-center gap-1 text-emerald-600">
                          <CheckCircle2 className="h-3 w-3" />
                          {connector.lastSync && (
                            <span>
                              {Math.round((Date.now() - connector.lastSync.getTime()) / 60000)} min ago
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {connector.datasets.map((dataset) => (
                          <Badge key={dataset} variant="secondary" className="text-xs">
                            {dataset}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Sync Now
                        </Button>
                        <Button variant="outline" size="sm">
                          Configure
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button className="w-full bg-red-600 hover:bg-red-700">
                      <Link2 className="h-4 w-4 mr-2" />
                      Connect
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="data-models" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Unified Data Models</CardTitle>
              <CardDescription>
                ETL pipelines replicate data from Lots 1-3 into the analytics warehouse
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data Model</TableHead>
                    <TableHead className="text-center">Tables</TableHead>
                    <TableHead className="text-right">Rows</TableHead>
                    <TableHead>Last Update</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dataModels.map((model) => (
                    <TableRow key={model.name}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Database className="h-4 w-4 text-zinc-400" />
                          <span className="font-medium">{model.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{model.tables}</TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {model.rows}
                      </TableCell>
                      <TableCell className="text-sm text-zinc-500">
                        {Math.round((Date.now() - model.lastUpdate.getTime()) / 60000)} min ago
                      </TableCell>
                      <TableCell>
                        {model.status === 'synced' ? (
                          <Badge className="bg-emerald-100 text-emerald-700">Synced</Badge>
                        ) : (
                          <Badge className="bg-amber-100 text-amber-700">Pending</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Schema Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Schema Documentation</CardTitle>
              <CardDescription>
                Download schema documentation for your BI tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                  <FileJson className="h-8 w-8 text-zinc-600" />
                  <span>JSON Schema</span>
                  <span className="text-xs text-zinc-500">For API integration</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                  <FileSpreadsheet className="h-8 w-8 text-zinc-600" />
                  <span>Data Dictionary</span>
                  <span className="text-xs text-zinc-500">Excel format</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                  <Database className="h-8 w-8 text-zinc-600" />
                  <span>ERD Diagram</span>
                  <span className="text-xs text-zinc-500">Entity relationships</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          {/* API Key */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">API Authentication</CardTitle>
              <CardDescription>
                Use this key to authenticate API requests
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>API Key</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      type={showApiKey ? 'text' : 'password'}
                      value={apiKey}
                      readOnly
                      className="font-mono pr-20"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Button variant="outline" onClick={() => copyToClipboard(apiKey)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-zinc-500">
                  Include this key in the Authorization header: Bearer {showApiKey ? apiKey.substring(0, 20) : '***'}...
                </p>
              </div>

              <Alert className="border-amber-200 bg-amber-50">
                <Shield className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-900">Security Notice</AlertTitle>
                <AlertDescription className="text-amber-700">
                  Keep your API key secure. Do not share it publicly or commit it to source control.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* API Endpoints */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Available Endpoints</CardTitle>
              <CardDescription>
                REST API endpoints for data access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Endpoint</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Rate Limit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiEndpoints.map((ep) => (
                    <TableRow key={ep.endpoint}>
                      <TableCell className="font-mono text-sm">{ep.endpoint}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn(
                          ep.method === 'GET' && 'border-emerald-300 text-emerald-700',
                          ep.method === 'POST' && 'border-blue-300 text-blue-700'
                        )}>
                          {ep.method}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-zinc-600">{ep.description}</TableCell>
                      <TableCell className="text-sm text-zinc-500">{ep.rateLimit}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-zinc-900">99.9%</p>
                    <p className="text-sm text-zinc-500">API Uptime</p>
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
                    <p className="text-2xl font-bold text-zinc-900">45ms</p>
                    <p className="text-sm text-zinc-500">Avg Response</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Globe className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-zinc-900">12,456</p>
                    <p className="text-sm text-zinc-500">API Calls Today</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
