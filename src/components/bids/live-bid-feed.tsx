'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Activity,
  FileText,
  Clock,
  Building2,
  Wifi,
  WifiOff,
  RefreshCw,
} from 'lucide-react';
import { wsManager, broadcastBidSubmission, type BidSubmittedPayload } from '@/lib/websocket';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface LiveBid {
  id: string;
  tenderId: string;
  tenderRef: string;
  supplierName: string;
  submittedAt: Date;
  totalBidsCount: number;
}

export function LiveBidFeed({ tenderId }: { tenderId?: string }) {
  const [bids, setBids] = useState<LiveBid[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isAnimating, setIsAnimating] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);

    // Check connection status
    const status = wsManager.getStatus();
    setIsConnected(status.connected);

    // Subscribe to bid submissions
    const unsubscribe = wsManager.subscribe<BidSubmittedPayload>('BID_SUBMITTED', (message) => {
      const newBid: LiveBid = {
        id: message.payload.bidId,
        tenderId: message.payload.tenderId,
        tenderRef: message.payload.tenderRef,
        supplierName: message.payload.supplierName,
        submittedAt: new Date(message.payload.submittedAt),
        totalBidsCount: message.payload.totalBidsCount,
      };

      // Filter by tenderId if provided
      if (tenderId && message.payload.tenderId !== tenderId) {
        return;
      }

      // Add to feed with animation
      setBids((prev) => [newBid, ...prev.slice(0, 19)]);
      setIsAnimating(newBid.id);
      setTimeout(() => setIsAnimating(null), 1000);
    });

    // Add some demo data (use fixed base date for SSR stability)
    const baseDate = new Date('2026-01-11T10:00:00.000Z');
    const demoData: LiveBid[] = [
      {
        id: 'demo-1',
        tenderId: 'tender-1',
        tenderRef: 'NPC/2026/T-0001',
        supplierName: 'Pacific IT Solutions',
        submittedAt: new Date(baseDate.getTime() - 5 * 60 * 1000),
        totalBidsCount: 3,
      },
      {
        id: 'demo-2',
        tenderId: 'tender-1',
        tenderRef: 'NPC/2026/T-0001',
        supplierName: 'Melanesian Medical Supplies',
        submittedAt: new Date(baseDate.getTime() - 15 * 60 * 1000),
        totalBidsCount: 2,
      },
      {
        id: 'demo-3',
        tenderId: 'tender-3',
        tenderRef: 'NPC/2026/T-0003',
        supplierName: 'National Engineering Consultants',
        submittedAt: new Date(baseDate.getTime() - 45 * 60 * 1000),
        totalBidsCount: 5,
      },
    ];
    setBids(demoData);

    return () => {
      unsubscribe();
    };
  }, [tenderId]);

  const simulateNewBid = () => {
    const suppliers = [
      'Highland Construction Ltd',
      'Coral Sea Trading',
      'Port Moresby Supplies',
      'Island Logistics PNG',
      'Sepik Services Ltd',
    ];

    broadcastBidSubmission({
      tenderId: tenderId || 'tender-1',
      tenderRef: tenderId ? `NPC/2026/T-${tenderId.split('-')[1]?.padStart(4, '0')}` : 'NPC/2026/T-0001',
      bidId: `BID-${Date.now().toString(36).toUpperCase()}`,
      supplierName: suppliers[Math.floor(Math.random() * suppliers.length)],
      submittedAt: new Date(),
      totalBidsCount: bids.length + 1,
    });
  };

  if (!isHydrated) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-red-600" />
            <CardTitle className="text-base">Live Bid Feed</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Badge variant="outline" className="text-emerald-600 border-emerald-200">
                <Wifi className="h-3 w-3 mr-1" />
                Live
              </Badge>
            ) : (
              <Badge variant="outline" className="text-zinc-500 border-zinc-200">
                <WifiOff className="h-3 w-3 mr-1" />
                Offline
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={simulateNewBid}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardDescription>Real-time bid submission updates</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          {bids.length === 0 ? (
            <div className="text-center py-8 text-zinc-500">
              <FileText className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No bids received yet</p>
              <p className="text-xs mt-1">Bids will appear here in real-time</p>
            </div>
          ) : (
            <div className="space-y-2">
              {bids.map((bid) => (
                <div
                  key={bid.id}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg border transition-all duration-500',
                    isAnimating === bid.id
                      ? 'bg-emerald-50 border-emerald-300 scale-[1.02]'
                      : 'bg-white border-zinc-100 hover:border-zinc-200'
                  )}
                >
                  <div className="h-10 w-10 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0">
                    <Building2 className="h-5 w-5 text-zinc-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{bid.supplierName}</p>
                      {isAnimating === bid.id && (
                        <Badge className="bg-emerald-500 text-white text-xs animate-pulse">
                          New
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500">{bid.tenderRef}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-zinc-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(bid.submittedAt, { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
