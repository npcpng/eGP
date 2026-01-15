'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Globe,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileJson,
  Database,
  Eye,
  Play,
  Pause,
  Settings,
  Calendar,
  FileText,
  Package,
  TrendingUp,
  ExternalLink,
  Copy,
  Code,
} from 'lucide-react';
import { useProcurementStore } from '@/stores/procurement-store';
import { useContractStore } from '@/stores/contract-store';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

// Mock OCDS releases
const mockReleases = [
  {
    id: 'ocds-png-001-2026-0001',
    ocid: 'ocds-png-001-2026-0001',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    tag: ['tender'],
    tender: {
      id: 'NPC/2026/T-0001',
      title: 'Supply of Medical Equipment for Port Moresby General Hospital',
      status: 'active',
      value: 2200000,
    },
    status: 'published',
  },
  {
    id: 'ocds-png-001-2026-0002',
    ocid: 'ocds-png-001-2026-0002',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    tag: ['tender', 'award'],
    tender: {
      id: 'NPC/2026/T-0003',
      title: 'IT Infrastructure Upgrade for Department of Finance',
      status: 'complete',
      value: 8000000,
    },
    status: 'published',
  },
  {
    id: 'ocds-png-001-2026-0003',
    ocid: 'ocds-png-001-2026-0003',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    tag: ['planning'],
    tender: {
      id: 'NPC/2026/T-0005',
      title: 'Professional Audit Services for 2026',
      status: 'planned',
      value: 3200000,
    },
    status: 'pending',
  },
  {
    id: 'ocds-png-001-2026-0004',
    ocid: 'ocds-png-001-2026-0004',
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    tag: ['contract', 'implementation'],
    tender: {
      id: 'NPC/2026/C-0001',
      title: 'Medical Equipment Supply and Installation',
      status: 'implementation',
      value: 2200000,
    },
    status: 'published',
  },
];

const sampleOCDSRelease = {
  "ocid": "ocds-png-001-2026-0001",
  "id": "ocds-png-001-2026-0001-tender",
  "date": "2026-01-11T10:00:00Z",
  "tag": ["tender"],
  "initiationType": "tender",
  "parties": [
    {
      "id": "PNG-IPA-12345",
      "name": "Department of Health",
      "roles": ["buyer"]
    }
  ],
  "buyer": {
    "id": "PNG-IPA-12345",
    "name": "Department of Health"
  },
  "tender": {
    "id": "NPC/2026/T-0001",
    "title": "Supply of Medical Equipment",
    "status": "active",
    "value": {
      "amount": 2200000,
      "currency": "PGK"
    },
    "procurementMethod": "open"
  }
};

export default function OCDSExportPage() {
  const { tenders } = useProcurementStore();
  const { contracts } = useContractStore();
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishProgress, setPublishProgress] = useState(0);
  const [selectedReleases, setSelectedReleases] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const stats = useMemo(() => {
    const published = mockReleases.filter((r) => r.status === 'published').length;
    const pending = mockReleases.filter((r) => r.status === 'pending').length;
    const totalValue = mockReleases.reduce((sum, r) => sum + r.tender.value, 0);

    return {
      totalReleases: mockReleases.length,
      published,
      pending,
      totalValue,
    };
  }, []);

  const handlePublish = () => {
    setIsPublishing(true);
    setPublishProgress(0);

    const interval = setInterval(() => {
      setPublishProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsPublishing(false);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const handleSelectRelease = (releaseId: string) => {
    setSelectedReleases((prev) =>
      prev.includes(releaseId)
        ? prev.filter((id) => id !== releaseId)
        : [...prev, releaseId]
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getTagBadge = (tag: string) => {
    const colors: Record<string, string> = {
      planning: 'bg-blue-100 text-blue-700',
      tender: 'bg-amber-100 text-amber-700',
      award: 'bg-emerald-100 text-emerald-700',
      contract: 'bg-purple-100 text-purple-700',
      implementation: 'bg-zinc-100 text-zinc-700',
    };
    return <Badge className={colors[tag] || 'bg-zinc-100 text-zinc-700'}>{tag}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">OCDS Publishing Pipeline</h1>
          <p className="text-sm text-zinc-500">
            Open Contracting Data Standard (OCDS 1.1.5) exports and publishing
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
          <Button
            size="sm"
            className="bg-red-600 hover:bg-red-700"
            onClick={handlePublish}
            disabled={isPublishing}
          >
            {isPublishing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Publish Updates
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Publishing Progress */}
      {isPublishing && (
        <Alert className="border-blue-200 bg-blue-50">
          <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
          <AlertTitle className="text-blue-900">Publishing OCDS Releases</AlertTitle>
          <AlertDescription className="text-blue-700">
            <Progress value={publishProgress} className="h-2 mt-2" />
            <p className="text-xs mt-1">{publishProgress}% complete - Publishing to public API...</p>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Total Releases</p>
                <p className="text-2xl font-bold text-zinc-900">{stats.totalReleases}</p>
              </div>
              <Database className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Published</p>
                <p className="text-2xl font-bold text-zinc-900">{stats.published}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Pending</p>
                <p className="text-2xl font-bold text-zinc-900">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-zinc-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Total Value</p>
                <p className="text-2xl font-bold text-zinc-900">K {(stats.totalValue / 1000000).toFixed(1)}M</p>
              </div>
              <TrendingUp className="h-8 w-8 text-zinc-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="releases" className="space-y-4">
        <TabsList>
          <TabsTrigger value="releases" className="gap-2">
            <FileJson className="h-4 w-4" />
            Releases
          </TabsTrigger>
          <TabsTrigger value="preview" className="gap-2">
            <Code className="h-4 w-4" />
            JSON Preview
          </TabsTrigger>
          <TabsTrigger value="api" className="gap-2">
            <Globe className="h-4 w-4" />
            Public API
          </TabsTrigger>
          <TabsTrigger value="downloads" className="gap-2">
            <Download className="h-4 w-4" />
            Downloads
          </TabsTrigger>
        </TabsList>

        <TabsContent value="releases" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">OCDS Release Packages</CardTitle>
              <CardDescription>
                Procurement events published in Open Contracting Data Standard format
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Checkbox
                        checked={selectedReleases.length === mockReleases.length}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedReleases(mockReleases.map((r) => r.id));
                          } else {
                            setSelectedReleases([]);
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>OCID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Published</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockReleases.map((release) => (
                    <TableRow key={release.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedReleases.includes(release.id)}
                          onCheckedChange={() => handleSelectRelease(release.id)}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-xs">{release.ocid}</TableCell>
                      <TableCell className="max-w-[250px] truncate">{release.tender.title}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {release.tag.map((tag) => (
                            <span key={tag}>{getTagBadge(tag)}</span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {release.status === 'published' ? (
                          <Badge className="bg-emerald-100 text-emerald-700">Published</Badge>
                        ) : (
                          <Badge className="bg-amber-100 text-amber-700">Pending</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-zinc-500">
                        {format(release.date, 'dd MMM yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">OCDS Release JSON Preview</CardTitle>
                  <CardDescription>Sample release package in OCDS 1.1.5 format</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(JSON.stringify(sampleOCDSRelease, null, 2))}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy JSON
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] w-full rounded-lg border bg-zinc-950 p-4">
                <pre className="text-sm text-emerald-400 font-mono">
                  {JSON.stringify(sampleOCDSRelease, null, 2)}
                </pre>
              </ScrollArea>
            </CardContent>
          </Card>

          <Alert>
            <Globe className="h-4 w-4" />
            <AlertTitle>OCDS Compliance</AlertTitle>
            <AlertDescription>
              All releases follow the Open Contracting Data Standard version 1.1.5.
              Data is validated against the official OCDS schema before publication.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Public OCDS API</CardTitle>
              <CardDescription>
                REST API endpoints for accessing procurement data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>API Base URL</Label>
                <div className="flex gap-2">
                  <Input
                    value="https://api.procurement.gov.pg/ocds/v1"
                    readOnly
                    className="font-mono"
                  />
                  <Button variant="outline" onClick={() => copyToClipboard('https://api.procurement.gov.pg/ocds/v1')}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-medium text-sm">Available Endpoints</h4>

                <div className="rounded-lg border p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-emerald-100 text-emerald-700">GET</Badge>
                      <code className="text-sm font-mono">/releases</code>
                    </div>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-zinc-500">List all OCDS releases with pagination</p>
                </div>

                <div className="rounded-lg border p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-emerald-100 text-emerald-700">GET</Badge>
                      <code className="text-sm font-mono">/releases/{'{ocid}'}</code>
                    </div>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-zinc-500">Get a specific release by OCID</p>
                </div>

                <div className="rounded-lg border p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-emerald-100 text-emerald-700">GET</Badge>
                      <code className="text-sm font-mono">/records</code>
                    </div>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-zinc-500">Get compiled records (all releases for each OCID)</p>
                </div>

                <div className="rounded-lg border p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-emerald-100 text-emerald-700">GET</Badge>
                      <code className="text-sm font-mono">/packages/release</code>
                    </div>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-zinc-500">Download release packages</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="downloads" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="h-16 w-16 rounded-lg bg-blue-100 flex items-center justify-center mx-auto mb-4">
                  <FileJson className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-medium text-zinc-900">Full Release Package</h3>
                <p className="text-sm text-zinc-500 mt-1">All releases in JSON format</p>
                <p className="text-xs text-zinc-400 mt-2">{stats.totalReleases} releases - 2.4 MB</p>
                <Button className="mt-4 w-full" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download JSON
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="h-16 w-16 rounded-lg bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="font-medium text-zinc-900">CSV Export</h3>
                <p className="text-sm text-zinc-500 mt-1">Flattened data for analysis</p>
                <p className="text-xs text-zinc-400 mt-2">{stats.totalReleases} rows - 156 KB</p>
                <Button className="mt-4 w-full" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download CSV
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="h-16 w-16 rounded-lg bg-amber-100 flex items-center justify-center mx-auto mb-4">
                  <Package className="h-8 w-8 text-amber-600" />
                </div>
                <h3 className="font-medium text-zinc-900">Excel Workbook</h3>
                <p className="text-sm text-zinc-500 mt-1">Multi-sheet Excel export</p>
                <p className="text-xs text-zinc-400 mt-2">5 sheets - 312 KB</p>
                <Button className="mt-4 w-full" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download XLSX
                </Button>
              </CardContent>
            </Card>
          </div>

          <Alert>
            <Calendar className="h-4 w-4" />
            <AlertTitle>Scheduled Exports</AlertTitle>
            <AlertDescription>
              Full data exports are generated automatically every day at 00:00 UTC and stored for 30 days.
              <Button variant="link" className="p-0 h-auto ml-1">Configure schedule</Button>
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  );
}
