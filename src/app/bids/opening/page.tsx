'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Lock,
  Unlock,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  Shield,
  Eye,
  Play,
  FileText,
  DollarSign,
  Calendar,
  RefreshCw,
  Key,
  ShieldCheck,
  Download,
  Printer,
} from 'lucide-react';
import { useSealedBidsStore, type BidOpeningSession } from '@/stores/sealed-bids-store';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { downloadBidOpeningReport, type BidOpeningReportData } from '@/lib/pdf-generator';

const formatCurrency = (amount: number) => {
  return `K ${amount.toLocaleString()}`;
};

export default function BidOpeningPage() {
  const {
    sealedBids,
    openingSessions,
    startOpeningSession,
    completeOpeningSession,
    openBid,
    getSealedBidsByTender,
  } = useSealedBidsStore();

  const [selectedSession, setSelectedSession] = useState<BidOpeningSession | null>(null);
  const [openingDialogOpen, setOpeningDialogOpen] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [openingProgress, setOpeningProgress] = useState(0);
  const [currentBidIndex, setCurrentBidIndex] = useState(0);
  const [committeeConfirmed, setCommitteeConfirmed] = useState<string[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const pendingSessions = useMemo(() => {
    return openingSessions.filter((s) => s.status === 'PENDING');
  }, [openingSessions]);

  const completedSessions = useMemo(() => {
    return openingSessions.filter((s) => s.status === 'COMPLETED');
  }, [openingSessions]);

  const canStartOpening = (session: BidOpeningSession) => {
    const now = new Date();
    return now >= session.scheduledAt && session.status === 'PENDING';
  };

  const getTimeUntilOpening = (scheduledAt: Date) => {
    const now = new Date();
    const diff = scheduledAt.getTime() - now.getTime();
    if (diff <= 0) return 'Ready to open';
    return formatDistanceToNow(scheduledAt, { addSuffix: true });
  };

  const handleStartOpening = (session: BidOpeningSession) => {
    setSelectedSession(session);
    setOpeningDialogOpen(true);
    setCommitteeConfirmed([]);
    setOpeningProgress(0);
    setCurrentBidIndex(0);
  };

  const handleConfirmAndOpen = async () => {
    if (!selectedSession) return;

    setIsOpening(true);
    startOpeningSession(selectedSession.id);

    // Get sealed bids for this tender
    const bids = getSealedBidsByTender(selectedSession.tenderId);
    const sealedBidsToOpen = bids.filter((b) => b.status === 'SEALED');

    // Simulate opening bids one by one with progress
    for (let i = 0; i < sealedBidsToOpen.length; i++) {
      setCurrentBidIndex(i);
      setOpeningProgress(((i + 1) / sealedBidsToOpen.length) * 100);

      // Simulate decryption delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock decrypted data
      const mockDecryptedData = {
        tenderId: sealedBidsToOpen[i].tenderId,
        tenderRef: sealedBidsToOpen[i].tenderRef,
        supplierId: sealedBidsToOpen[i].supplierId,
        supplierName: sealedBidsToOpen[i].supplierName,
        bidAmount: Math.floor(1500000 + Math.random() * 1000000),
        currency: 'PGK',
        validityDays: 90,
        declarations: {
          accuracyConfirmed: true,
          conflictOfInterestDeclared: false,
          termsAccepted: true,
        },
        submittedAt: sealedBidsToOpen[i].sealedAt,
        submittedBy: `${sealedBidsToOpen[i].supplierId}-user`,
      };

      openBid(sealedBidsToOpen[i].id, mockDecryptedData, 'admin');
    }

    completeOpeningSession(selectedSession.id);
    setIsOpening(false);
  };

  const toggleCommitteeMember = (userId: string) => {
    setCommitteeConfirmed((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleDownloadReport = (session: BidOpeningSession) => {
    const bids = getSealedBidsByTender(session.tenderId);
    const openedBids = bids
      .filter((b) => b.status === 'OPENED' && b.decryptedBid)
      .sort((a, b) => (a.decryptedBid?.bidAmount || 0) - (b.decryptedBid?.bidAmount || 0));

    const reportData: BidOpeningReportData = {
      session: {
        id: session.id,
        tenderRef: session.tenderRef,
        tenderTitle: session.tenderTitle,
        openingDate: session.scheduledAt,
        completedAt: session.completedAt,
        venue: 'NPC Conference Room, Waigani',
      },
      committee: session.committee.map((m) => ({
        name: m.name,
        role: m.role,
        attended: m.attended,
      })),
      bids: openedBids.map((bid, index) => ({
        rank: index + 1,
        supplierName: bid.supplierName,
        bidAmount: bid.decryptedBid?.bidAmount || 0,
        currency: bid.decryptedBid?.currency || 'PGK',
        submittedAt: bid.sealedAt,
        documents: ['Technical Proposal.pdf', 'Financial Proposal.pdf'],
        status: 'VALID',
      })),
      summary: {
        totalBids: openedBids.length,
        validBids: openedBids.length,
        disqualifiedBids: 0,
        lowestBid: Math.min(...openedBids.map((b) => b.decryptedBid?.bidAmount || 0)),
        highestBid: Math.max(...openedBids.map((b) => b.decryptedBid?.bidAmount || 0)),
        averageBid: openedBids.reduce((sum, b) => sum + (b.decryptedBid?.bidAmount || 0), 0) / openedBids.length || 0,
      },
    };

    downloadBidOpeningReport(reportData);
  };

  if (!isHydrated) {
    return null;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Sealed Bid Opening</h1>
          <p className="text-sm text-zinc-500">
            Secure bid opening with encryption verification
          </p>
        </div>
      </div>

      {/* Security Notice */}
      <Alert className="border-emerald-200 bg-emerald-50">
        <ShieldCheck className="h-4 w-4 text-emerald-600" />
        <AlertTitle className="text-emerald-900">AES-256-GCM Encryption</AlertTitle>
        <AlertDescription className="text-emerald-700">
          All sealed bids are protected with military-grade encryption. Bids can only be decrypted after
          the scheduled opening time, ensuring fair and transparent procurement.
        </AlertDescription>
      </Alert>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Sealed Bids</p>
                <p className="text-2xl font-bold text-zinc-900">
                  {sealedBids.filter((b) => b.status === 'SEALED').length}
                </p>
              </div>
              <Lock className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Opened Bids</p>
                <p className="text-2xl font-bold text-zinc-900">
                  {sealedBids.filter((b) => b.status === 'OPENED').length}
                </p>
              </div>
              <Unlock className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Pending Sessions</p>
                <p className="text-2xl font-bold text-zinc-900">{pendingSessions.length}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-zinc-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Completed</p>
                <p className="text-2xl font-bold text-zinc-900">{completedSessions.length}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-zinc-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="h-4 w-4" />
            Upcoming Openings
            {pendingSessions.length > 0 && (
              <Badge className="ml-1 bg-amber-600">{pendingSessions.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="sealed" className="gap-2">
            <Lock className="h-4 w-4" />
            Sealed Bids
          </TabsTrigger>
          <TabsTrigger value="opened" className="gap-2">
            <Unlock className="h-4 w-4" />
            Opened Bids
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <div className="space-y-4">
            {pendingSessions.map((session) => {
              const bids = getSealedBidsByTender(session.tenderId);
              const sealedCount = bids.filter((b) => b.status === 'SEALED').length;
              const isReady = canStartOpening(session);

              return (
                <Card key={session.id} className="overflow-hidden">
                  <div className={cn(
                    'h-2',
                    isReady ? 'bg-emerald-500' : 'bg-amber-500'
                  )} />
                  <CardHeader>
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{session.tenderRef}</Badge>
                          {isReady ? (
                            <Badge className="bg-emerald-100 text-emerald-700">Ready to Open</Badge>
                          ) : (
                            <Badge className="bg-amber-100 text-amber-700">Scheduled</Badge>
                          )}
                        </div>
                        <CardTitle className="text-base">{session.tenderTitle}</CardTitle>
                        <CardDescription className="mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Opening: {format(session.scheduledAt, 'dd MMM yyyy, HH:mm')}
                            <span className="ml-2 text-xs">
                              ({getTimeUntilOpening(session.scheduledAt)})
                            </span>
                          </span>
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right mr-4">
                          <p className="text-lg font-bold text-zinc-900">{sealedCount}</p>
                          <p className="text-xs text-zinc-500">Sealed Bids</p>
                        </div>
                        <Button
                          className="bg-red-600 hover:bg-red-700"
                          disabled={!isReady}
                          onClick={() => handleStartOpening(session)}
                        >
                          <Key className="h-4 w-4 mr-2" />
                          Start Opening
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Opening Committee</h4>
                        <div className="flex flex-wrap gap-2">
                          {session.committee.map((member) => (
                            <div
                              key={member.userId}
                              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-50 border"
                            >
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">
                                  {member.name.split(' ').map((n) => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-xs font-medium">{member.name}</p>
                                <p className="text-xs text-zinc-500">{member.role}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-2">Sealed Bids</h4>
                        <div className="grid gap-2 md:grid-cols-3">
                          {bids.filter((b) => b.status === 'SEALED').map((bid) => (
                            <div
                              key={bid.id}
                              className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200"
                            >
                              <Lock className="h-5 w-5 text-amber-600 shrink-0" />
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">{bid.supplierName}</p>
                                <p className="text-xs text-amber-700">
                                  Sealed {formatDistanceToNow(bid.sealedAt, { addSuffix: true })}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {pendingSessions.length === 0 && (
              <div className="text-center py-12 text-zinc-500">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No upcoming bid openings</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="sealed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sealed Bids</CardTitle>
              <CardDescription>
                Encrypted bids awaiting opening
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bid ID</TableHead>
                    <TableHead>Tender</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Sealed At</TableHead>
                    <TableHead>Opening Deadline</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sealedBids
                    .filter((b) => b.status === 'SEALED')
                    .map((bid) => (
                      <TableRow key={bid.id}>
                        <TableCell className="font-mono text-xs">{bid.id}</TableCell>
                        <TableCell className="text-sm">{bid.tenderRef}</TableCell>
                        <TableCell className="text-sm">{bid.supplierName}</TableCell>
                        <TableCell className="text-sm text-zinc-500">
                          {format(bid.sealedAt, 'dd MMM yyyy, HH:mm')}
                        </TableCell>
                        <TableCell className="text-sm text-zinc-500">
                          {format(bid.openingDeadline, 'dd MMM yyyy, HH:mm')}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-amber-100 text-amber-700">
                            <Lock className="h-3 w-3 mr-1" />
                            Sealed
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="opened" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Opened Bids</CardTitle>
              <CardDescription>
                Decrypted bids with revealed amounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bid ID</TableHead>
                    <TableHead>Tender</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead className="text-right">Bid Amount</TableHead>
                    <TableHead>Opened At</TableHead>
                    <TableHead>Opened By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sealedBids
                    .filter((b) => b.status === 'OPENED')
                    .map((bid) => (
                      <TableRow key={bid.id}>
                        <TableCell className="font-mono text-xs">{bid.id}</TableCell>
                        <TableCell className="text-sm">{bid.tenderRef}</TableCell>
                        <TableCell className="text-sm">{bid.supplierName}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {bid.decryptedBid
                            ? formatCurrency(bid.decryptedBid.bidAmount)
                            : '-'}
                        </TableCell>
                        <TableCell className="text-sm text-zinc-500">
                          {bid.openedAt ? format(bid.openedAt, 'dd MMM yyyy, HH:mm') : '-'}
                        </TableCell>
                        <TableCell className="text-sm">{bid.openedBy || '-'}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="space-y-4">
            {completedSessions.map((session) => (
              <Card key={session.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{session.tenderRef}</span>
                        <Badge className="bg-emerald-100 text-emerald-700">Completed</Badge>
                      </div>
                      <p className="text-sm text-zinc-600 truncate">{session.tenderTitle}</p>
                      <p className="text-xs text-zinc-500">
                        Opened {session.completedAt ? format(session.completedAt, 'dd MMM yyyy, HH:mm') : '-'}
                        {' · '}{session.openedBids} bids opened
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadReport(session)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        PDF
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Opening Dialog */}
      <Dialog open={openingDialogOpen} onOpenChange={setOpeningDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bid Opening Session</DialogTitle>
            <DialogDescription>
              {selectedSession?.tenderRef} - {selectedSession?.tenderTitle}
            </DialogDescription>
          </DialogHeader>

          {isOpening ? (
            <div className="py-8 space-y-6">
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                  <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-900">
                  Decrypting Sealed Bids...
                </h3>
                <p className="text-sm text-zinc-500 mt-1">
                  Opening bid {currentBidIndex + 1} of {selectedSession?.totalBids}
                </p>
              </div>
              <Progress value={openingProgress} className="h-3" />
              <div className="p-4 rounded-lg bg-zinc-50 text-center">
                <div className="flex items-center justify-center gap-2 text-sm">
                  <Key className="h-4 w-4 text-blue-600 animate-pulse" />
                  <span>Verifying encryption integrity and decrypting data...</span>
                </div>
              </div>
            </div>
          ) : openingProgress === 100 ? (
            <div className="py-8 text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-900">
                  All Bids Successfully Opened!
                </h3>
                <p className="text-sm text-zinc-500 mt-1">
                  {selectedSession?.totalBids} bids have been decrypted and verified.
                </p>
              </div>
              <Button onClick={() => setOpeningDialogOpen(false)}>
                View Results
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertTitle>Opening Committee Confirmation</AlertTitle>
                <AlertDescription>
                  All committee members must confirm their attendance before bids can be opened.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Committee Members</h4>
                <div className="space-y-2">
                  {selectedSession?.committee.map((member) => (
                    <div
                      key={member.userId}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={committeeConfirmed.includes(member.userId)}
                          onCheckedChange={() => toggleCommitteeMember(member.userId)}
                        />
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {member.name.split(' ').map((n) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{member.name}</p>
                          <p className="text-xs text-zinc-500">{member.role}</p>
                        </div>
                      </div>
                      {committeeConfirmed.includes(member.userId) && (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="p-4 rounded-lg bg-zinc-50">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium">
                    {selectedSession?.totalBids} Sealed Bids Ready
                  </span>
                </div>
                <p className="text-xs text-zinc-500">
                  Once opened, bid amounts will be revealed and the process cannot be reversed.
                </p>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setOpeningDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-700"
                  disabled={committeeConfirmed.length < (selectedSession?.committee.length || 0)}
                  onClick={handleConfirmAndOpen}
                >
                  <Key className="h-4 w-4 mr-2" />
                  Open All Sealed Bids
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
