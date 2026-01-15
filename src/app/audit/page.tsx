'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Search,
  Filter,
  Download,
  ShieldCheck,
  Clock,
  User,
  FileText,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  LogIn,
  Send,
  RefreshCw,
} from 'lucide-react';
import { useAuditStore } from '@/stores/audit-store';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { AuditAction } from '@/types';

const actionColors: Record<AuditAction, string> = {
  CREATE: 'bg-emerald-100 text-emerald-700',
  READ: 'bg-blue-100 text-blue-700',
  UPDATE: 'bg-amber-100 text-amber-700',
  DELETE: 'bg-red-100 text-red-700',
  APPROVE: 'bg-emerald-100 text-emerald-700',
  REJECT: 'bg-red-100 text-red-700',
  SUBMIT: 'bg-blue-100 text-blue-700',
  PUBLISH: 'bg-emerald-100 text-emerald-700',
  AWARD: 'bg-emerald-100 text-emerald-700',
  SIGN: 'bg-emerald-100 text-emerald-700',
  LOGIN: 'bg-zinc-100 text-zinc-700',
  LOGOUT: 'bg-zinc-100 text-zinc-700',
};

const actionIcons: Record<AuditAction, React.ComponentType<{ className?: string }>> = {
  CREATE: FileText,
  READ: Eye,
  UPDATE: Edit,
  DELETE: Trash2,
  APPROVE: CheckCircle2,
  REJECT: XCircle,
  SUBMIT: Send,
  PUBLISH: Send,
  AWARD: CheckCircle2,
  SIGN: FileText,
  LOGIN: LogIn,
  LOGOUT: LogIn,
};

export default function AuditPage() {
  const { logs } = useAuditStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [entityFilter, setEntityFilter] = useState<string>('all');

  const entityTypes = useMemo(() => {
    const types = new Set(logs.map((l) => l.entityType));
    return Array.from(types);
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (actionFilter !== 'all' && log.action !== actionFilter) return false;
      if (entityFilter !== 'all' && log.entityType !== entityFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          log.userId.toLowerCase().includes(query) ||
          log.entityId.toLowerCase().includes(query) ||
          log.entityType.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [logs, searchQuery, actionFilter, entityFilter]);

  const stats = useMemo(() => ({
    total: logs.length,
    creates: logs.filter((l) => l.action === 'CREATE').length,
    updates: logs.filter((l) => l.action === 'UPDATE').length,
    approvals: logs.filter((l) => l.action === 'APPROVE').length,
    logins: logs.filter((l) => l.action === 'LOGIN').length,
  }), [logs]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Audit Trail</h1>
          <p className="text-sm text-zinc-500">
            Complete record of all system activities for compliance and oversight
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-zinc-100 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-zinc-600" />
              </div>
              <div>
                <p className="text-xs text-zinc-500">Total Records</p>
                <p className="text-xl font-bold text-zinc-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <FileText className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-zinc-500">Creates</p>
                <p className="text-xl font-bold text-emerald-600">{stats.creates}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Edit className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-zinc-500">Updates</p>
                <p className="text-xl font-bold text-amber-600">{stats.updates}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-zinc-500">Approvals</p>
                <p className="text-xl font-bold text-emerald-600">{stats.approvals}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <LogIn className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-zinc-500">Logins</p>
                <p className="text-xl font-bold text-blue-600">{stats.logins}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                placeholder="Search by user, entity ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-3">
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="CREATE">Create</SelectItem>
                  <SelectItem value="UPDATE">Update</SelectItem>
                  <SelectItem value="DELETE">Delete</SelectItem>
                  <SelectItem value="APPROVE">Approve</SelectItem>
                  <SelectItem value="SUBMIT">Submit</SelectItem>
                  <SelectItem value="LOGIN">Login</SelectItem>
                </SelectContent>
              </Select>
              <Select value={entityFilter} onValueChange={setEntityFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Entity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entities</SelectItem>
                  {entityTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-zinc-500" />
            {filteredLogs.length} Audit Records
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Entity ID</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead className="w-[100px]">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => {
                  const ActionIcon = actionIcons[log.action];
                  return (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-xs">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3 text-zinc-400" />
                          {format(new Date(log.createdAt), 'dd MMM yyyy HH:mm:ss')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-zinc-400" />
                          <span className="font-medium">{log.userId}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn('gap-1', actionColors[log.action])}>
                          <ActionIcon className="h-3 w-3" />
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.entityType}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {log.entityId}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-zinc-500">
                        {log.ipAddress}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-zinc-500 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-zinc-900">Audit Compliance Notice</p>
            <p className="text-sm text-zinc-500 mt-1">
              All audit records are immutable and cryptographically signed. Records are retained
              for a minimum of 7 years in compliance with PNG Government audit requirements.
              For audit inquiries, contact the National Procurement Commission.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
