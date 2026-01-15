'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Bell,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Gavel,
  AlertTriangle,
  Wifi,
  WifiOff,
  RefreshCw,
  Trash2,
  CheckCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { wsManager, type WebSocketMessage, type BidSubmittedPayload, type WorkflowUpdatePayload } from '@/lib/websocket';
import { isOnline, getUnsyncedForms, syncPendingForms } from '@/lib/offline';
import { formatDistanceToNow } from 'date-fns';

export interface Notification {
  id: string;
  type: 'BID_SUBMITTED' | 'WORKFLOW_UPDATE' | 'TENDER_PUBLISHED' | 'SYSTEM' | 'SYNC';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  data?: unknown;
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [online, setOnline] = useState(true);
  const [pendingSync, setPendingSync] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    setIsHydrated(true);

    // Check online status
    setOnline(isOnline());

    const handleOnline = () => {
      setOnline(true);
      addNotification({
        type: 'SYSTEM',
        title: 'Connection Restored',
        message: 'You are back online. Syncing pending forms...',
      });
      handleSync();
    };

    const handleOffline = () => {
      setOnline(false);
      addNotification({
        type: 'SYSTEM',
        title: 'You are Offline',
        message: 'Forms will be saved locally and synced when you reconnect.',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check for pending forms
    checkPendingForms();

    // Subscribe to WebSocket events
    const unsubBid = wsManager.subscribe<BidSubmittedPayload>('BID_SUBMITTED', (message) => {
      addNotification({
        type: 'BID_SUBMITTED',
        title: 'New Bid Received',
        message: `${message.payload.supplierName} submitted a bid for ${message.payload.tenderRef}`,
        data: message.payload,
      });
    });

    const unsubWorkflow = wsManager.subscribe<WorkflowUpdatePayload>('WORKFLOW_UPDATE', (message) => {
      const actionText = message.payload.action === 'APPROVED'
        ? 'approved'
        : message.payload.action === 'REJECTED'
          ? 'rejected'
          : 'returned';

      addNotification({
        type: 'WORKFLOW_UPDATE',
        title: `Workflow ${message.payload.action}`,
        message: `${message.payload.entityRef} was ${actionText} by ${message.payload.actorName}`,
        data: message.payload,
      });
    });

    // Add some initial demo notifications (use fixed base date for SSR stability)
    const baseDate = new Date('2026-01-11T10:00:00.000Z');
    setNotifications([
      {
        id: 'demo-1',
        type: 'BID_SUBMITTED',
        title: 'New Bid Received',
        message: 'Pacific IT Solutions submitted a bid for NPC/2026/T-0001',
        timestamp: new Date(baseDate.getTime() - 5 * 60 * 1000),
        read: false,
      },
      {
        id: 'demo-2',
        type: 'WORKFLOW_UPDATE',
        title: 'Workflow Approved',
        message: 'Annual Plan APP/2026/DOF-001 approved by Mary Smith',
        timestamp: new Date(baseDate.getTime() - 30 * 60 * 1000),
        read: false,
      },
      {
        id: 'demo-3',
        type: 'TENDER_PUBLISHED',
        title: 'Tender Published',
        message: 'New tender NPC/2026/T-0006 is now open for bidding',
        timestamp: new Date(baseDate.getTime() - 2 * 60 * 60 * 1000),
        read: true,
      },
    ]);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubBid();
      unsubWorkflow();
    };
  }, []);

  const checkPendingForms = async () => {
    try {
      const forms = await getUnsyncedForms();
      setPendingSync(forms.length);
    } catch (error) {
      console.error('Failed to check pending forms:', error);
    }
  };

  const handleSync = async () => {
    if (!online || isSyncing) return;

    setIsSyncing(true);
    try {
      const result = await syncPendingForms();
      if (result.success > 0) {
        addNotification({
          type: 'SYNC',
          title: 'Forms Synced',
          message: `${result.success} form(s) successfully synced`,
        });
      }
      await checkPendingForms();
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const addNotification = (data: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const notification: Notification = {
      ...data,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
    };
    setNotifications((prev) => [notification, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'BID_SUBMITTED':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'WORKFLOW_UPDATE':
        return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case 'TENDER_PUBLISHED':
        return <Gavel className="h-5 w-5 text-amber-500" />;
      case 'SYNC':
        return <RefreshCw className="h-5 w-5 text-zinc-500" />;
      default:
        return <Bell className="h-5 w-5 text-zinc-500" />;
    }
  };

  // Prevent hydration mismatch by not rendering dynamic content until hydrated
  if (!isHydrated) {
    return (
      <Button variant="ghost" size="icon" className="relative">
        <Bell className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-600 text-white text-xs flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[440px]">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle>Notifications</SheetTitle>
            <div className="flex items-center gap-2">
              {online ? (
                <Badge variant="outline" className="text-emerald-600 border-emerald-200">
                  <Wifi className="h-3 w-3 mr-1" />
                  Online
                </Badge>
              ) : (
                <Badge variant="outline" className="text-amber-600 border-amber-200">
                  <WifiOff className="h-3 w-3 mr-1" />
                  Offline
                </Badge>
              )}
            </div>
          </div>
          <SheetDescription>
            Real-time updates and system notifications
          </SheetDescription>
        </SheetHeader>

        {/* Pending Sync Banner */}
        {pendingSync > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-600" />
                <span className="text-sm text-amber-800">
                  {pendingSync} pending form(s)
                </span>
              </div>
              <Button
                size="sm"
                variant="outline"
                disabled={!online || isSyncing}
                onClick={handleSync}
              >
                {isSyncing ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Sync
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mt-4 mb-2">
          <Button variant="ghost" size="sm" onClick={markAllAsRead}>
            <CheckCheck className="h-4 w-4 mr-1" />
            Mark all read
          </Button>
          <Button variant="ghost" size="sm" onClick={clearAll}>
            <Trash2 className="h-4 w-4 mr-1" />
            Clear all
          </Button>
        </div>

        <Separator />

        {/* Notification List */}
        <ScrollArea className="h-[calc(100vh-280px)] mt-4">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>No notifications</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    'p-3 rounded-lg border cursor-pointer transition-colors',
                    notification.read
                      ? 'bg-white border-zinc-100'
                      : 'bg-blue-50 border-blue-100 hover:bg-blue-100'
                  )}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex gap-3">
                    <div className="shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn(
                          'text-sm',
                          !notification.read && 'font-medium'
                        )}>
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {notification.message}
                      </p>
                      <p className="text-xs text-zinc-400 mt-1">
                        {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
