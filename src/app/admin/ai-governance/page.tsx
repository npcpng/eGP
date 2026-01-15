'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
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
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  Brain,
  Shield,
  Settings,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Lock,
  FileText,
  BarChart3,
  Clock,
  Users,
  Zap,
  Info,
  RefreshCw,
} from 'lucide-react';
import { DEFAULT_AI_MODULES, AI_GOVERNANCE_RULES, type AIModuleConfig, type AIRiskLevel } from '@/lib/ai/ai-config';

const riskColors: Record<AIRiskLevel, string> = {
  LOW: 'bg-emerald-100 text-emerald-700',
  MEDIUM: 'bg-amber-100 text-amber-700',
  MEDIUM_HIGH: 'bg-orange-100 text-orange-700',
  HIGH: 'bg-red-100 text-red-700',
};

const phaseDescriptions: Record<number, string> = {
  1: 'Planning & Document Drafting',
  2: 'Supplier Support & Compliance',
  3: 'Risk Scoring & Anomaly Detection',
  4: 'Predictive Analytics & Optimization',
};

// Mock AI usage statistics
const mockAIStats = {
  totalDecisions: 1247,
  humanOverrides: 23,
  avgConfidence: 0.82,
  modulesActive: 6,
  lastUpdated: new Date(),
};

const mockRecentDecisions = [
  {
    id: 'ai-001',
    module: 'Spend Classification',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    input: 'Medical equipment for hospital',
    output: 'UNSPSC: 42000000',
    confidence: 0.89,
    humanOverride: false,
  },
  {
    id: 'ai-002',
    module: 'Duplicate Detection',
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    input: 'IT Infrastructure Upgrade',
    output: '1 potential duplicate found',
    confidence: 0.76,
    humanOverride: true,
  },
  {
    id: 'ai-003',
    module: 'Price Benchmarking',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    input: 'Office Supplies - K50,000',
    output: 'Market rate confirmed',
    confidence: 0.91,
    humanOverride: false,
  },
];

export default function AIGovernancePage() {
  const [modules, setModules] = useState<AIModuleConfig[]>(DEFAULT_AI_MODULES);
  const [selectedModule, setSelectedModule] = useState<AIModuleConfig | null>(null);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);

  const toggleModule = (moduleId: string) => {
    setModules(prev => prev.map(m =>
      m.id === moduleId ? { ...m, enabled: !m.enabled } : m
    ));
  };

  const updateThreshold = (moduleId: string, key: string, value: number) => {
    setModules(prev => prev.map(m =>
      m.id === moduleId
        ? { ...m, thresholds: { ...m.thresholds, [key]: value } }
        : m
    ));
  };

  const activeModules = modules.filter(m => m.enabled);
  const phaseModules = (phase: number) => modules.filter(m => m.phase === phase);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">AI Governance Dashboard</h1>
            <p className="text-slate-600">Configure and monitor AI capabilities</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-2 py-1.5">
            <Activity className="h-4 w-4 text-emerald-500" />
            {activeModules.length} Modules Active
          </Badge>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Governance Principles Alert */}
      <Alert className="border-violet-200 bg-violet-50">
        <Shield className="h-4 w-4 text-violet-600" />
        <AlertTitle className="text-violet-900">AI Governance Principles</AlertTitle>
        <AlertDescription className="text-violet-700">
          AI capabilities support human decision-making but never replace it. All AI outputs are
          explainable, auditable, and require human validation for high-risk actions.
        </AlertDescription>
      </Alert>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">AI Decisions (30d)</p>
                <p className="text-2xl font-bold text-slate-900">{mockAIStats.totalDecisions.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-violet-100 rounded-lg">
                <Brain className="h-6 w-6 text-violet-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Human Overrides</p>
                <p className="text-2xl font-bold text-slate-900">{mockAIStats.humanOverrides}</p>
                <p className="text-xs text-slate-500">{((mockAIStats.humanOverrides / mockAIStats.totalDecisions) * 100).toFixed(1)}% override rate</p>
              </div>
              <div className="p-3 bg-amber-100 rounded-lg">
                <Users className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Avg Confidence</p>
                <p className="text-2xl font-bold text-slate-900">{(mockAIStats.avgConfidence * 100).toFixed(0)}%</p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
            <Progress value={mockAIStats.avgConfidence * 100} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Active Modules</p>
                <p className="text-2xl font-bold text-slate-900">{activeModules.length} / {modules.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="modules">
        <TabsList>
          <TabsTrigger value="modules" className="gap-2">
            <Settings className="h-4 w-4" />
            AI Modules
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-2">
            <Eye className="h-4 w-4" />
            Audit Log
          </TabsTrigger>
          <TabsTrigger value="governance" className="gap-2">
            <Shield className="h-4 w-4" />
            Governance Rules
          </TabsTrigger>
        </TabsList>

        {/* AI Modules Tab */}
        <TabsContent value="modules" className="mt-4 space-y-6">
          {[1, 2, 3, 4].map(phase => (
            <Card key={phase}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      Phase {phase}: {phaseDescriptions[phase]}
                      <Badge variant="outline" className="ml-2">
                        {phaseModules(phase).filter(m => m.enabled).length}/{phaseModules(phase).length} active
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {phase === 1 && 'Low risk - Immediate productivity gains'}
                      {phase === 2 && 'Medium risk - Supplier support and compliance'}
                      {phase === 3 && 'Medium-high risk - Strict controls required'}
                      {phase === 4 && 'High risk - Future implementation'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {phaseModules(phase).map(module => (
                    <div
                      key={module.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-4">
                        <Switch
                          checked={module.enabled}
                          onCheckedChange={() => toggleModule(module.id)}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-slate-900">{module.name}</p>
                            <Badge className={riskColors[module.riskLevel]}>
                              {module.riskLevel.replace('_', '-')}
                            </Badge>
                            {module.requiresHumanApproval && (
                              <Badge variant="outline" className="gap-1">
                                <Lock className="h-3 w-3" />
                                HITL
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-500">{module.description}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedModule(module);
                          setConfigDialogOpen(true);
                        }}
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        Configure
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Audit Log Tab */}
        <TabsContent value="audit" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent AI Decisions</CardTitle>
              <CardDescription>Audit trail of AI-assisted decisions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Module</TableHead>
                    <TableHead>Input</TableHead>
                    <TableHead>Output</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockRecentDecisions.map(decision => (
                    <TableRow key={decision.id}>
                      <TableCell className="text-sm text-slate-500">
                        {decision.timestamp.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{decision.module}</Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {decision.input}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {decision.output}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={decision.confidence * 100} className="w-16 h-2" />
                          <span className="text-sm">{(decision.confidence * 100).toFixed(0)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {decision.humanOverride ? (
                          <Badge className="bg-amber-100 text-amber-700">
                            <Users className="h-3 w-3 mr-1" />
                            Overridden
                          </Badge>
                        ) : (
                          <Badge className="bg-emerald-100 text-emerald-700">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Accepted
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Governance Rules Tab */}
        <TabsContent value="governance" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-5 w-5 text-violet-600" />
                  Core Governance Rules
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <span className="text-sm font-medium">Final Decisions: Human Only</span>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700">Enforced</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <span className="text-sm font-medium">Explainability Required</span>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700">Enforced</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <span className="text-sm font-medium">Audit Logging Mandatory</span>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700">Enforced</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <span className="text-sm font-medium">Dual Validation (High Risk)</span>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700">Enforced</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <span className="text-sm font-medium">Override Justification Required</span>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700">Enforced</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-5 w-5 text-violet-600" />
                  Data & Compliance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Audit Data Retention</span>
                    <span className="text-sm text-slate-600">{AI_GOVERNANCE_RULES.AUDIT_RETENTION_DAYS} days (~7 years)</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Max Displayed Confidence</span>
                    <span className="text-sm text-slate-600">{(AI_GOVERNANCE_RULES.MAX_DISPLAYED_CONFIDENCE * 100)}%</span>
                  </div>
                  <p className="text-xs text-slate-500">AI never claims 100% certainty</p>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    All AI models and data are exportable. No vendor lock-in by design.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Module Configuration Dialog */}
      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Configure {selectedModule?.name}</DialogTitle>
            <DialogDescription>
              Adjust thresholds and settings for this AI module
            </DialogDescription>
          </DialogHeader>

          {selectedModule && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium">Module Enabled</span>
                <Switch
                  checked={selectedModule.enabled}
                  onCheckedChange={() => toggleModule(selectedModule.id)}
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="text-sm font-medium">Thresholds</h4>
                {Object.entries(selectedModule.thresholds).map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <Label className="text-sm capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={value}
                      onChange={(e) => updateThreshold(
                        selectedModule.id,
                        key,
                        parseFloat(e.target.value)
                      )}
                    />
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex justify-between">
                  <span>Risk Level:</span>
                  <Badge className={riskColors[selectedModule.riskLevel]}>
                    {selectedModule.riskLevel}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Human Approval:</span>
                  <span>{selectedModule.requiresHumanApproval ? 'Required' : 'Optional'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Updated:</span>
                  <span>{selectedModule.lastUpdated.toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfigDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setConfigDialogOpen(false)}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
