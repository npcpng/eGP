/**
 * WebSocket Service for Real-Time Updates
 * Handles live bid submissions, auction updates, and system notifications
 */

export type WebSocketEventType =
  | 'BID_SUBMITTED'
  | 'BID_OPENED'
  | 'AUCTION_BID'
  | 'AUCTION_ENDED'
  | 'TENDER_PUBLISHED'
  | 'TENDER_CLOSED'
  | 'WORKFLOW_UPDATE'
  | 'SYSTEM_NOTIFICATION'
  | 'USER_CONNECTED'
  | 'USER_DISCONNECTED';

export interface WebSocketMessage<T = unknown> {
  type: WebSocketEventType;
  payload: T;
  timestamp: Date;
  senderId?: string;
  targetUserIds?: string[];
  targetRoles?: string[];
  broadcast?: boolean;
}

export interface BidSubmittedPayload {
  tenderId: string;
  tenderRef: string;
  bidId: string;
  supplierName: string;
  submittedAt: Date;
  totalBidsCount: number;
}

export interface AuctionBidPayload {
  auctionId: string;
  auctionTitle: string;
  bidderName: string;
  bidAmount: number;
  previousBid: number;
  timeRemaining: number;
  isLeading: boolean;
}

export interface WorkflowUpdatePayload {
  workflowId: string;
  entityType: string;
  entityRef: string;
  action: 'APPROVED' | 'REJECTED' | 'RETURNED';
  actorName: string;
  currentStep: number;
  totalSteps: number;
}

type MessageHandler<T = unknown> = (message: WebSocketMessage<T>) => void;

/**
 * WebSocket Client Manager
 * Manages WebSocket connections and message handling
 */
class WebSocketManager {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private handlers: Map<WebSocketEventType, Set<MessageHandler>> = new Map();
  private messageQueue: WebSocketMessage[] = [];
  private isConnected = false;
  private userId: string | null = null;
  private userRoles: string[] = [];

  /**
   * Connect to WebSocket server
   */
  connect(userId: string, roles: string[] = []): Promise<void> {
    this.userId = userId;
    this.userRoles = roles;

    return new Promise((resolve, reject) => {
      try {
        // In production, this would be the actual WebSocket server URL
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'wss://api.procurement.gov.pg/ws';

        // For demo purposes, we'll simulate the connection
        console.log(`[WebSocket] Connecting to ${wsUrl}...`);

        // Simulate connection establishment
        setTimeout(() => {
          this.isConnected = true;
          this.reconnectAttempts = 0;
          console.log('[WebSocket] Connected successfully');

          // Process queued messages
          this.processQueue();

          // Notify handlers of connection
          this.emit({
            type: 'USER_CONNECTED',
            payload: { userId, roles },
            timestamp: new Date(),
          });

          resolve();
        }, 500);

      } catch (error) {
        console.error('[WebSocket] Connection error:', error);
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.isConnected = false;
    this.userId = null;
    console.log('[WebSocket] Disconnected');
  }

  /**
   * Subscribe to specific event types
   */
  subscribe<T = unknown>(eventType: WebSocketEventType, handler: MessageHandler<T>): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler as MessageHandler);

    // Return unsubscribe function
    return () => {
      this.handlers.get(eventType)?.delete(handler as MessageHandler);
    };
  }

  /**
   * Send a message through WebSocket
   */
  send<T = unknown>(message: Omit<WebSocketMessage<T>, 'timestamp'>): void {
    const fullMessage: WebSocketMessage<T> = {
      ...message,
      timestamp: new Date(),
      senderId: this.userId || undefined,
    };

    if (this.isConnected) {
      // In production, this would send through actual WebSocket
      console.log('[WebSocket] Sending:', fullMessage.type);

      // Simulate broadcast to handlers (for demo)
      setTimeout(() => {
        this.emit(fullMessage as WebSocketMessage);
      }, 100);
    } else {
      // Queue message for later
      this.messageQueue.push(fullMessage as WebSocketMessage);
    }
  }

  /**
   * Emit message to handlers
   */
  private emit(message: WebSocketMessage): void {
    const handlers = this.handlers.get(message.type);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(message);
        } catch (error) {
          console.error(`[WebSocket] Handler error for ${message.type}:`, error);
        }
      });
    }
  }

  /**
   * Process queued messages after reconnection
   */
  private processQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.send(message);
      }
    }
  }

  /**
   * Attempt to reconnect
   */
  private reconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[WebSocket] Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      if (this.userId) {
        this.connect(this.userId, this.userRoles);
      }
    }, delay);
  }

  /**
   * Get connection status
   */
  getStatus(): { connected: boolean; userId: string | null; queuedMessages: number } {
    return {
      connected: this.isConnected,
      userId: this.userId,
      queuedMessages: this.messageQueue.length,
    };
  }
}

// Export singleton instance
export const wsManager = new WebSocketManager();

/**
 * React hook for WebSocket subscriptions
 */
export function createWebSocketHook() {
  return {
    useBidSubmissions: (tenderId: string, onBidReceived: (bid: BidSubmittedPayload) => void) => {
      const unsubscribe = wsManager.subscribe<BidSubmittedPayload>('BID_SUBMITTED', (message) => {
        if (message.payload.tenderId === tenderId) {
          onBidReceived(message.payload);
        }
      });
      return unsubscribe;
    },

    useAuctionBids: (auctionId: string, onBidReceived: (bid: AuctionBidPayload) => void) => {
      const unsubscribe = wsManager.subscribe<AuctionBidPayload>('AUCTION_BID', (message) => {
        if (message.payload.auctionId === auctionId) {
          onBidReceived(message.payload);
        }
      });
      return unsubscribe;
    },

    useWorkflowUpdates: (onUpdate: (update: WorkflowUpdatePayload) => void) => {
      return wsManager.subscribe<WorkflowUpdatePayload>('WORKFLOW_UPDATE', (message) => {
        onUpdate(message.payload);
      });
    },
  };
}

/**
 * Helper functions for common WebSocket operations
 */
export function broadcastBidSubmission(bid: BidSubmittedPayload): void {
  wsManager.send<BidSubmittedPayload>({
    type: 'BID_SUBMITTED',
    payload: bid,
    broadcast: true,
  });
}

export function broadcastAuctionBid(bid: AuctionBidPayload): void {
  wsManager.send<AuctionBidPayload>({
    type: 'AUCTION_BID',
    payload: bid,
    broadcast: true,
  });
}

export function notifyWorkflowUpdate(update: WorkflowUpdatePayload, targetUserIds?: string[]): void {
  wsManager.send<WorkflowUpdatePayload>({
    type: 'WORKFLOW_UPDATE',
    payload: update,
    targetUserIds,
  });
}
