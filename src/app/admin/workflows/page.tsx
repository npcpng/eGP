'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Search,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Clock,
  FileText,
  ShoppingCart,
  Award,
  Calendar,
  DollarSign,
  User,
  ArrowRight,
  AlertTriangle,
  Filter,
  ChevronRight,
  Package,
} from 'lucide-react';
import { useWorkflowStore, type ApprovalWorkflow, type WorkflowEntityType } from '@/stores/workflow-store';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const formatCurrency = (amount: number) => {
  return `K ${amount.toLocaleString()}`;
};

const entityTypeLabels: Record<WorkflowEntityType, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  ANNUAL_PLAN: { label: 'Annual Plan', icon: Calendar },
  TENDER: { label: 'Tender', icon: FileText },
  PURCHASE_ORDER: { label: 'Purchase Order', icon: ShoppingCart },
  AWARD: { label: 'Award', icon: Award },
  CONTRACT: { label: 'Contract', icon: FileText },
  VARIATION: { label: 'Variation', icon: Package },
};

export default function WorkflowsPage() {
  const { workflows, approveStep, rejectStep, returnStep } = useWorkflowStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedWorkflow, setSelectedWorkflow] = useState<ApprovalWorkflow | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'return'>('approve');
  const [actionComments, setActionComments] = useState('');

  const pendingWorkflows = useMemo(() => {
    return workflows.filter((wf) => {
      if (wf.status !== 'IN_PROGRESS') return false;
      const matchesSearch = wf.entityTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wf.entityRef.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === 'all' || wf.entityType === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [workflows, searchQuery, typeFilter]);

  const completedWorkflows = useMemo(() => {
    return workflows.filter((wf) => wf.status !== 'IN_PROGRESS');
  }, [workflows]);

  const stats = useMemo(() => {
    const pending = workflows.filter((wf) => wf.status === 'IN_PROGRESS').length;
    const approved = workflows.filter((wf) => wf.status === 'APPROVED').length;
    const rejected = workflows.filter((wf) => wf.status === 'REJECTED').length;
    const pendingValue = workflows
      .filter((wf) => wf.status === 'IN_PROGRESS')
      .reduce((sum, wf) => sum + (wf.requestedValue || 0), 0);

    return { pending, approved, rejected, pendingValue };
  }, [workflows]);

  const handleAction = () => {
    if (!selectedWorkflow) return;

    const currentStepIndex = selectedWorkflow.currentStep - 1;
    const currentStep = selectedWorkflow.steps[currentStepIndex];

    if (!currentStep) return;

    switch (actionType) {
      case 'approve':
        approveStep(selectedWorkflow.id, currentStep.id, actionComments);
        break;
      case 'reject':
        rejectStep(selectedWorkflow.id, currentStep.id, actionComments);
        break;
      case 'return':
        returnStep(selectedWorkflow.id, currentStep.id, actionComments);
        break;
    }

    setActionDialogOpen(false);
    setSelectedWorkflow(null);
    setActionComments('');
  };

  const openActionDialog = (workflow: ApprovalWorkflow, type: 'approve' | 'reject' | 'return') => {
    setSelectedWorkflow(workflow);
    setActionType(type);
    setActionDialogOpen(true);
  };

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-emerald-500';
      case 'PENDING':
        return 'bg-amber-500';
      case 'REJECTED':
        return 'bg-red-500';
      case 'RETURNED':
        return 'bg-blue-500';
      default:
        return 'bg-zinc-300';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Approval Workflows</h1>
          <p className="text-sm text-zinc-500">
            Manage approval requests for plans, orders, and awards
          </p>
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
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Approved</p>
                <p className="text-2xl font-bold text-zinc-900">{stats.approved}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Rejected</p>
                <p className="text-2xl font-bold text-zinc-900">{stats.rejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-zinc-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Pending Value</p>
                <p className="text-2xl font-bold text-zinc-900">{formatCurrency(stats.pendingValue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-zinc-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="h-4 w-4" />
            Pending
            {stats.pending > 0 && (
              <Badge className="ml-1 bg-amber-600">{stats.pending}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Completed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Search approvals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="ANNUAL_PLAN">Annual Plans</SelectItem>
                <SelectItem value="TENDER">Tenders</SelectItem>
                <SelectItem value="PURCHASE_ORDER">Purchase Orders</SelectItem>
                <SelectItem value="AWARD">Awards</SelectItem>
                <SelectItem value="CONTRACT">Contracts</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Pending Approvals List */}
          <div className="space-y-4">
            {pendingWorkflows.map((workflow) => {
              const entityConfig = entityTypeLabels[workflow.entityType];
              const EntityIcon = entityConfig.icon;
              const currentStep = workflow.steps[workflow.currentStep - 1];
              const progress = ((workflow.currentStep - 1) / workflow.totalSteps) * 100;

              return (
                <Card key={workflow.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0">
                          <EntityIcon className="h-6 w-6 text-zinc-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">{entityConfig.label}</Badge>
                            <span className="text-xs text-zinc-500">{workflow.entityRef}</span>
                          </div>
                          <CardTitle className="text-base">{workflow.entityTitle}</CardTitle>
                          {workflow.requestedValue && (
                            <CardDescription className="flex items-center gap-1 mt-1">
                              <DollarSign className="h-3 w-3" />
                              {formatCurrency(workflow.requestedValue)}
                            </CardDescription>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openActionDialog(workflow, 'return')}
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Return
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => openActionDialog(workflow, 'reject')}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => openActionDialog(workflow, 'approve')}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-500">Workflow Progress</span>
                        <span className="font-medium">
                          Step {workflow.currentStep} of {workflow.totalSteps}
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    {/* Steps Timeline */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                      {workflow.steps.map((step, index) => (
                        <div key={step.id} className="flex items-center">
                          <div className={cn(
                            'flex items-center gap-2 px-3 py-2 rounded-lg border min-w-[180px]',
                            step.status === 'PENDING' && index === workflow.currentStep - 1 && 'border-amber-300 bg-amber-50',
                            step.status === 'APPROVED' && 'border-emerald-200 bg-emerald-50',
                            step.status === 'REJECTED' && 'border-red-200 bg-red-50',
                            step.status === 'PENDING' && index !== workflow.currentStep - 1 && 'border-zinc-200 bg-zinc-50'
                          )}>
                            <div className={cn(
                              'h-6 w-6 rounded-full flex items-center justify-center text-white text-xs font-medium shrink-0',
                              getStepStatusColor(step.status)
                            )}>
                              {step.status === 'APPROVED' ? (
                                <CheckCircle2 className="h-4 w-4" />
                              ) : step.status === 'REJECTED' ? (
                                <XCircle className="h-4 w-4" />
                              ) : (
                                step.stepNumber
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-zinc-900 truncate">{step.title}</p>
                              <p className="text-xs text-zinc-500">
                                {step.assignedToName || step.requiredRole}
                              </p>
                            </div>
                          </div>
                          {index < workflow.steps.length - 1 && (
                            <ChevronRight className="h-4 w-4 text-zinc-300 mx-1 shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Current Step Info */}
                    {currentStep && (
                      <Alert>
                        <User className="h-4 w-4" />
                        <AlertTitle>Current Step: {currentStep.title}</AlertTitle>
                        <AlertDescription>
                          Assigned to {currentStep.assignedToName || 'Unassigned'} ({currentStep.requiredRole})
                          {currentStep.dueDate && (
                            <span className="ml-2">
                              - Due: {format(currentStep.dueDate, 'dd MMM yyyy')}
                            </span>
                          )}
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {pendingWorkflows.length === 0 && (
            <div className="text-center py-12 text-zinc-500">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No pending approvals</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="space-y-4">
            {completedWorkflows.map((workflow) => {
              const entityConfig = entityTypeLabels[workflow.entityType];
              const EntityIcon = entityConfig.icon;

              return (
                <Card key={workflow.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0">
                        <EntityIcon className="h-5 w-5 text-zinc-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium truncate">{workflow.entityTitle}</span>
                          <Badge className={cn(
                            workflow.status === 'APPROVED' && 'bg-emerald-100 text-emerald-700',
                            workflow.status === 'REJECTED' && 'bg-red-100 text-red-700',
                            workflow.status === 'RETURNED' && 'bg-blue-100 text-blue-700'
                          )}>
                            {workflow.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-zinc-500">{workflow.entityRef}</p>
                      </div>
                      <div className="text-right text-sm text-zinc-500">
                        {format(workflow.updatedAt, 'dd MMM yyyy')}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' && 'Approve Request'}
              {actionType === 'reject' && 'Reject Request'}
              {actionType === 'return' && 'Return for Revision'}
            </DialogTitle>
            <DialogDescription>
              {selectedWorkflow?.entityTitle}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {actionType === 'reject' && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-900">Rejection Notice</AlertTitle>
                <AlertDescription className="text-red-700">
                  This action will permanently reject the request. Please provide a reason.
                </AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label>Comments {actionType !== 'approve' && <span className="text-red-500">*</span>}</Label>
              <Textarea
                placeholder={
                  actionType === 'approve'
                    ? 'Optional comments...'
                    : 'Please provide a reason for this action...'
                }
                value={actionComments}
                onChange={(e) => setActionComments(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className={cn(
                actionType === 'approve' && 'bg-emerald-600 hover:bg-emerald-700',
                actionType === 'reject' && 'bg-red-600 hover:bg-red-700',
                actionType === 'return' && 'bg-blue-600 hover:bg-blue-700'
              )}
              disabled={actionType !== 'approve' && !actionComments.trim()}
              onClick={handleAction}
            >
              {actionType === 'approve' && (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Approve
                </>
              )}
              {actionType === 'reject' && (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </>
              )}
              {actionType === 'return' && (
                <>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Return
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
