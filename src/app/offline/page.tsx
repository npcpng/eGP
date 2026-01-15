'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  WifiOff,
  RefreshCw,
  Clock,
  FileText,
  Database,
  CheckCircle2,
} from 'lucide-react';

interface QueuedForm {
  id: number;
  url: string;
  timestamp: number;
  body: Record<string, unknown>;
}

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);
  const [queuedForms, setQueuedForms] = useState<QueuedForm[]>([]);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    // Check online status
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      // Redirect to home when back online
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load queued forms from IndexedDB
    loadQueuedForms();

    // Listen for sync messages from service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'FORM_SYNCED') {
          loadQueuedForms();
          setLastSync(new Date());
        }
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadQueuedForms = async () => {
    try {
      const request = indexedDB.open('png-egp-offline', 1);
      request.onsuccess = () => {
        const db = request.result;
        if (db.objectStoreNames.contains('png-egp-forms')) {
          const tx = db.transaction('png-egp-forms', 'readonly');
          const store = tx.objectStore('png-egp-forms');
          const getAllRequest = store.getAll();
          getAllRequest.onsuccess = () => {
            setQueuedForms(getAllRequest.result);
          };
        }
      };
    } catch (error) {
      console.error('Failed to load queued forms:', error);
    }
  };

  const handleRetry = () => {
    window.location.reload();
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-PG', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
      <div className="max-w-lg w-full space-y-6">
        {/* Main Card */}
        <Card className="border-t-4 border-t-amber-500">
          <CardHeader className="text-center">
            <div className="h-20 w-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
              <WifiOff className="h-10 w-10 text-amber-600" />
            </div>
            <CardTitle className="text-2xl">You're Offline</CardTitle>
            <CardDescription>
              Don't worry - your work is saved and will sync when you're back online.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isOnline ? (
              <Alert className="border-emerald-200 bg-emerald-50">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <AlertTitle className="text-emerald-900">Connection Restored!</AlertTitle>
                <AlertDescription className="text-emerald-700">
                  Redirecting you back to the application...
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <Button
                  className="w-full bg-red-600 hover:bg-red-700"
                  onClick={handleRetry}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>

                <div className="text-center text-sm text-zinc-500">
                  <p>While offline, you can still:</p>
                  <ul className="mt-2 space-y-1">
                    <li>• View previously loaded pages</li>
                    <li>• Fill out forms (they'll sync later)</li>
                    <li>• Access cached documents</li>
                  </ul>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Queued Forms */}
        {queuedForms.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-zinc-500" />
                <CardTitle className="text-base">Queued Submissions</CardTitle>
              </div>
              <CardDescription>
                These forms will be submitted when you're back online
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {queuedForms.map((form) => (
                  <div
                    key={form.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-zinc-50 border"
                  >
                    <FileText className="h-5 w-5 text-zinc-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {form.url.split('/').pop() || 'Form Submission'}
                      </p>
                      <p className="text-xs text-zinc-500">
                        Saved {formatTimestamp(form.timestamp)}
                      </p>
                    </div>
                    <Clock className="h-4 w-4 text-amber-500" />
                  </div>
                ))}
              </div>
              {lastSync && (
                <p className="text-xs text-zinc-500 mt-3">
                  Last sync: {lastSync.toLocaleTimeString()}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-zinc-400">
          <p>PNG eGP System</p>
          <p>National Procurement Commission</p>
        </div>
      </div>
    </div>
  );
}
