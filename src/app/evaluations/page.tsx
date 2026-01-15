'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  FileSearch,
  Search,
  Users,
  ClipboardCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Star,
  Shield,
  FileText,
  ArrowRight,
  Play,
  Pause,
  Lock,
  Unlock,
  Eye,
  BarChart3,
} from 'lucide-react';
import { useProcurementStore } from '@/stores/procurement-store';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const mockEvaluations = [
  {
    id: 'EVAL-001',
    tenderId: 'TND-2026-0001',
    tenderTitle: 'Supply of IT Equipment for Government Departments',
    status: 'IN_PROGRESS',
    method: 'QUALITY_COST',
    technicalWeight: 70,
    financialWeight: 30,
    bidsCount: 8,
    evaluatedCount: 5,
    committeeMembers: [
      { id: 'U1', name: 'John Kaupa', role: 'CHAIR', coiDeclared: true, assigned: true },
      { id: 'U2', name: 'Mary Sipu', role: 'MEMBER', coiDeclared: true, assigned: true },
      { id: 'U3', name: 'Peter Kila', role: 'MEMBER', coiDeclared: true, assigned: true },
      { id: 'U4', name: 'Sarah Moi', role: 'SECRETARY', coiDeclared: false, assigned: true },
    ],
    startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'EVAL-002',
    tenderId: 'TND-2026-0005',
    tenderTitle: 'Construction of Provincial Health Centre',
    status: 'PENDING',
    method: 'LOWEST_PRICE',
    technicalWeight: 100,
    financialWeight: 0,
    bidsCount: 12,
    evaluatedCount: 0,
    committeeMembers: [
      { id: 'U5', name: 'James Tau', role: 'CHAIR', coiDeclared: false, assigned: true },
      { id: 'U6', name: 'Anna Ravu', role: 'MEMBER', coiDeclared: false, assigned: true },
    ],
    startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'EVAL-003',
    tenderId: 'TND-2026-0003',
    tenderTitle: 'Medical Supplies for Provincial Hospitals',
    status: 'COMPLETED',
    method: 'QUALITY_COST',
    technicalWeight: 60,
    financialWeight: 40,
    bidsCount: 6,
    evaluatedCount: 6,
    committeeMembers: [
      { id: 'U7', name: 'Dr. Paul Nao', role: 'CHAIR', coiDeclared: true, assigned: true },
      { id: 'U8', name: 'Nurse Helen', role: 'MEMBER', coiDeclared: true, assigned: true },
      { id: 'U9', name: 'Mark Alu', role: 'MEMBER', coiDeclared: true, assigned: true },
    ],
    startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
];

const mockBidScores = [
  { bidId: 'BID-001', supplier: 'PNG Tech Solutions', technical: 85, financial: 92, combined: 87.1, rank: 1, status: 'RESPONSIVE' },
  { bidId: 'BID-002', supplier: 'Islands IT Services', technical: 78, financial: 88, combined: 81.0, rank: 2, status: 'RESPONSIVE' },
  { bidId: 'BID-003', supplier: 'Pacific Systems Ltd', technical: 72, financial: 95, combined: 78.9, rank: 3, status: 'RESPONSIVE' },
  { bidId: 'BID-004', supplier: 'Global Tech PNG', technical: 65, financial: 82, combined: 70.1, rank: 4, status: 'RESPONSIVE' },
  { bidId: 'BID-005', supplier: 'Highlands Computing', technical: 45, financial: 90, combined: 58.5, rank: 5, status: 'NON_RESPONSIVE' },
];

export default function EvaluationsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [coiDialogOpen, setCoiDialogOpen] = useState(false);
  const [coiConfirmed, setCoiConfirmed] = useState(false);

  const filteredEvaluations = useMemo(() => {
    return mockEvaluations.filter((evaluation) => {
      const matchesSearch = evaluation.tenderTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evaluation.tenderId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || evaluation.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  const stats = useMemo(() => {
    const pending = mockEvaluations.filter((e) => e.status === 'PENDING').length;
    const inProgress = mockEvaluations.filter((e) => e.status === 'IN_PROGRESS').length;
    const completed = mockEvaluations.filter((e) => e.status === 'COMPLETED').length;
    const pendingCoi = mockEvaluations.reduce((count, e) => {
      return count + e.committeeMembers.filter((m) => !m.coiDeclared).length;
    }, 0);

    return { pending, inProgress, completed, pendingCoi };
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge className="bg-amber-100 text-amber-700">Pending</Badge>;
      case 'IN_PROGRESS':
        return <Badge className="bg-blue-100 text-blue-700">In Progress</Badge>;
      case 'COMPLETED':
        return <Badge className="bg-emerald-100 text-emerald-700">Completed</Badge>;
      case 'APPROVED':
        return <Badge className="bg-zinc-100 text-zinc-700">Approved</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Evaluations (S04)</h1>
          <p className="text-sm text-zinc-500">
            Bid evaluation workspace with committee management
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Evaluation Reports
          </Button>
        </div>
      </div>

      {/* COI Warning Alert */}
      {stats.pendingCoi > 0 && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-900">COI Declarations Required</AlertTitle>
          <AlertDescription className="text-amber-700">
            {stats.pendingCoi} committee member(s) have not yet submitted their Conflict of Interest declarations.
            Evaluations cannot proceed until all declarations are complete.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Pending Start</p>
                <p className="text-2xl font-bold text-zinc-900">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">In Progress</p>
                <p className="text-2xl font-bold text-zinc-900">{stats.inProgress}</p>
              </div>
              <Play className="h-8 w-8 text-blue-500" />
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
                <p className="text-sm text-zinc-500">Pending COI</p>
                <p className="text-2xl font-bold text-zinc-900">{stats.pendingCoi}</p>
              </div>
              <Shield className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search evaluations..."
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
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Evaluations List */}
      <div className="space-y-4">
        {filteredEvaluations.map((evaluation) => {
          const progress = (evaluation.evaluatedCount / evaluation.bidsCount) * 100;
          const pendingCoi = evaluation.committeeMembers.filter((m) => !m.coiDeclared).length;

          return (
            <Card key={evaluation.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-base">{evaluation.tenderId}</CardTitle>
                      {getStatusBadge(evaluation.status)}
                      <Badge variant="outline">
                        {evaluation.method === 'QUALITY_COST' ? 'QCBS' : 'Lowest Price'}
                      </Badge>
                    </div>
                    <CardDescription>{evaluation.tenderTitle}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {pendingCoi > 0 && (
                      <Badge className="bg-red-100 text-red-700">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {pendingCoi} COI Pending
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500">Evaluation Progress</span>
                    <span className="font-medium">
                      {evaluation.evaluatedCount} / {evaluation.bidsCount} bids evaluated
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                {/* Evaluation Method Details */}
                <div className="flex flex-wrap gap-4 p-3 rounded-lg bg-zinc-50">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-zinc-500" />
                    <span className="text-sm text-zinc-500">Technical:</span>
                    <span className="text-sm font-medium">{evaluation.technicalWeight}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-zinc-500">Financial:</span>
                    <span className="text-sm font-medium">{evaluation.financialWeight}%</span>
                  </div>
                  <Separator orientation="vertical" className="h-4" />
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-zinc-500" />
                    <span className="text-sm text-zinc-500">Due:</span>
                    <span className="text-sm font-medium">
                      {format(evaluation.dueDate, 'dd MMM yyyy')}
                    </span>
                  </div>
                </div>

                {/* Committee Members */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-zinc-700">Evaluation Committee</p>
                  <div className="flex flex-wrap gap-2">
                    {evaluation.committeeMembers.map((member) => (
                      <div
                        key={member.id}
                        className={cn(
                          'flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm',
                          member.coiDeclared
                            ? 'border-emerald-200 bg-emerald-50'
                            : 'border-red-200 bg-red-50'
                        )}
                      >
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {member.name.split(' ').map((n) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{member.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {member.role}
                        </Badge>
                        {member.coiDeclared ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2">
                  {pendingCoi > 0 && (
                    <Dialog open={coiDialogOpen} onOpenChange={setCoiDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Shield className="h-4 w-4 mr-2" />
                          Submit COI Declaration
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Conflict of Interest Declaration</DialogTitle>
                          <DialogDescription>
                            Please read and confirm the following declaration
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Alert>
                            <Shield className="h-4 w-4" />
                            <AlertTitle>Declaration Statement</AlertTitle>
                            <AlertDescription className="mt-2 text-sm">
                              I hereby declare that:
                              <ul className="list-disc ml-4 mt-2 space-y-1">
                                <li>I have no personal, financial, or other interest in any bidder participating in this procurement</li>
                                <li>I have no family relationship with any owner, director, or employee of any bidder</li>
                                <li>I have not received any gifts, hospitality, or other benefits from any bidder</li>
                                <li>I will maintain strict confidentiality of all evaluation proceedings</li>
                                <li>I will evaluate bids fairly and objectively based on the stated criteria</li>
                              </ul>
                            </AlertDescription>
                          </Alert>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="coi-confirm"
                              checked={coiConfirmed}
                              onCheckedChange={(checked) => setCoiConfirmed(checked as boolean)}
                            />
                            <Label htmlFor="coi-confirm">
                              I confirm that I have read and understood the above declaration and that the information provided is true and accurate.
                            </Label>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setCoiDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button
                            className="bg-emerald-600 hover:bg-emerald-700"
                            disabled={!coiConfirmed}
                            onClick={() => setCoiDialogOpen(false)}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Submit Declaration
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                  {evaluation.status === 'IN_PROGRESS' && pendingCoi === 0 && (
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <ClipboardCheck className="h-4 w-4 mr-2" />
                      Continue Evaluation
                    </Button>
                  )}
                  {evaluation.status === 'PENDING' && pendingCoi === 0 && (
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                      <Play className="h-4 w-4 mr-2" />
                      Start Evaluation
                    </Button>
                  )}
                  {evaluation.status === 'COMPLETED' && (
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      View Results
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Sample Bid Scores Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sample Evaluation Scores</CardTitle>
          <CardDescription>
            Automated scoring and ranking for EVAL-001
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead className="text-center">Technical (70%)</TableHead>
                <TableHead className="text-center">Financial (30%)</TableHead>
                <TableHead className="text-center">Combined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Recommendation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockBidScores.map((score) => (
                <TableRow key={score.bidId} className={score.status === 'NON_RESPONSIVE' ? 'opacity-50' : ''}>
                  <TableCell className="font-bold text-lg">#{score.rank}</TableCell>
                  <TableCell className="font-medium">{score.supplier}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Progress value={score.technical} className="w-16 h-2" />
                      <span className="text-sm">{score.technical}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Progress value={score.financial} className="w-16 h-2" />
                      <span className="text-sm">{score.financial}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-bold">{score.combined.toFixed(1)}</TableCell>
                  <TableCell>
                    {score.status === 'RESPONSIVE' ? (
                      <Badge className="bg-emerald-100 text-emerald-700">Responsive</Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-700">Non-Responsive</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {score.rank === 1 && score.status === 'RESPONSIVE' && (
                      <Badge className="bg-amber-100 text-amber-700">
                        <Star className="h-3 w-3 mr-1" />
                        Recommend Award
                      </Badge>
                    )}
                    {score.rank > 1 && score.status === 'RESPONSIVE' && (
                      <span className="text-sm text-zinc-500">Standby</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
