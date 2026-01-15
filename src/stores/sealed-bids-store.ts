import { create } from 'zustand';
import type { SealedBid, BidSubmissionData } from '@/lib/encryption';

// Use fixed base date for SSR stability
const BASE_DATE = new Date('2026-01-11T10:00:00.000Z');

export type BidOpeningStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface BidOpeningSession {
  id: string;
  tenderId: string;
  tenderRef: string;
  tenderTitle: string;
  scheduledAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  status: BidOpeningStatus;
  totalBids: number;
  openedBids: number;
  committee: Array<{
    userId: string;
    name: string;
    role: string;
    attended: boolean;
  }>;
  bids: SealedBid[];
}

interface SealedBidsState {
  sealedBids: SealedBid[];
  openingSessions: BidOpeningSession[];
  currentOpeningSession: string | null;

  // Actions
  addSealedBid: (bid: SealedBid) => void;
  updateSealedBid: (id: string, updates: Partial<SealedBid>) => void;
  openBid: (bidId: string, decryptedData: BidSubmissionData, userId: string) => void;
  withdrawBid: (bidId: string) => void;

  // Opening sessions
  createOpeningSession: (session: Omit<BidOpeningSession, 'id'>) => void;
  startOpeningSession: (sessionId: string) => void;
  completeOpeningSession: (sessionId: string) => void;
  setCurrentOpeningSession: (sessionId: string | null) => void;

  // Queries
  getSealedBidsByTender: (tenderId: string) => SealedBid[];
  getPendingOpenings: () => BidOpeningSession[];
  getBidsByStatus: (status: SealedBid['status']) => SealedBid[];
}

// Generate mock sealed bids
const generateMockSealedBids = (): SealedBid[] => {
  const now = BASE_DATE;

  return [
    {
      id: 'SEALED-BID-001',
      tenderId: 'tender-1',
      tenderRef: 'NPC/2026/T-0001',
      supplierId: 'supplier-2',
      supplierName: 'Melanesian Medical Supplies Pty Ltd',
      encryptedBid: {
        encryptedData: 'encrypted_base64_data_here...',
        iv: 'random_iv_base64...',
        hash: 'sha256_hash_base64...',
        encryptedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        algorithm: 'AES-256-GCM',
      },
      sealedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      openingDeadline: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
      status: 'SEALED',
    },
    {
      id: 'SEALED-BID-002',
      tenderId: 'tender-1',
      tenderRef: 'NPC/2026/T-0001',
      supplierId: 'supplier-3',
      supplierName: 'Pacific IT Solutions',
      encryptedBid: {
        encryptedData: 'encrypted_base64_data_here...',
        iv: 'random_iv_base64...',
        hash: 'sha256_hash_base64...',
        encryptedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        algorithm: 'AES-256-GCM',
      },
      sealedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      openingDeadline: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
      status: 'SEALED',
    },
    {
      id: 'SEALED-BID-003',
      tenderId: 'tender-1',
      tenderRef: 'NPC/2026/T-0001',
      supplierId: 'supplier-5',
      supplierName: 'Southern Transport Services',
      encryptedBid: {
        encryptedData: 'encrypted_base64_data_here...',
        iv: 'random_iv_base64...',
        hash: 'sha256_hash_base64...',
        encryptedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        algorithm: 'AES-256-GCM',
      },
      sealedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      openingDeadline: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
      status: 'SEALED',
    },
    {
      id: 'SEALED-BID-004',
      tenderId: 'tender-5',
      tenderRef: 'NPC/2026/T-0005',
      supplierId: 'supplier-8',
      supplierName: 'National Engineering Consultants',
      encryptedBid: {
        encryptedData: 'encrypted_base64_data_here...',
        iv: 'random_iv_base64...',
        hash: 'sha256_hash_base64...',
        encryptedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        algorithm: 'AES-256-GCM',
      },
      sealedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      openingDeadline: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      status: 'OPENED',
      openedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      openedBy: 'admin',
      decryptedBid: {
        tenderId: 'tender-5',
        tenderRef: 'NPC/2026/T-0005',
        supplierId: 'supplier-8',
        supplierName: 'National Engineering Consultants',
        bidAmount: 2800000,
        currency: 'PGK',
        validityDays: 90,
        declarations: {
          accuracyConfirmed: true,
          conflictOfInterestDeclared: false,
          termsAccepted: true,
        },
        submittedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        submittedBy: 'supplier-8-user',
      },
    },
  ];
};

const generateMockOpeningSessions = (): BidOpeningSession[] => {
  const now = BASE_DATE;

  return [
    {
      id: 'OPENING-001',
      tenderId: 'tender-1',
      tenderRef: 'NPC/2026/T-0001',
      tenderTitle: 'Supply of Medical Equipment for Port Moresby General Hospital',
      scheduledAt: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
      status: 'PENDING',
      totalBids: 3,
      openedBids: 0,
      committee: [
        { userId: 'user-1', name: 'John Doe', role: 'Procurement Officer', attended: false },
        { userId: 'user-5', name: 'Dr. Paul Nao', role: 'Evaluation Lead', attended: false },
        { userId: 'user-6', name: 'Anna Ravu', role: 'Agency Head', attended: false },
      ],
      bids: [],
    },
    {
      id: 'OPENING-002',
      tenderId: 'tender-5',
      tenderRef: 'NPC/2026/T-0005',
      tenderTitle: 'Professional Audit Services for 2026 Financial Year',
      scheduledAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      startedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      completedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
      status: 'COMPLETED',
      totalBids: 4,
      openedBids: 4,
      committee: [
        { userId: 'user-1', name: 'John Doe', role: 'Procurement Officer', attended: true },
        { userId: 'user-3', name: 'Peter Kila', role: 'Finance Officer', attended: true },
        { userId: 'user-7', name: 'Grace Manus', role: 'Audit Representative', attended: true },
      ],
      bids: [],
    },
  ];
};

export const useSealedBidsStore = create<SealedBidsState>((set, get) => ({
  sealedBids: generateMockSealedBids(),
  openingSessions: generateMockOpeningSessions(),
  currentOpeningSession: null,

  addSealedBid: (bid) =>
    set((state) => ({
      sealedBids: [...state.sealedBids, bid],
    })),

  updateSealedBid: (id, updates) =>
    set((state) => ({
      sealedBids: state.sealedBids.map((bid) =>
        bid.id === id ? { ...bid, ...updates } : bid
      ),
    })),

  openBid: (bidId, decryptedData, userId) =>
    set((state) => ({
      sealedBids: state.sealedBids.map((bid) =>
        bid.id === bidId
          ? {
              ...bid,
              status: 'OPENED' as const,
              openedAt: new Date(),
              openedBy: userId,
              decryptedBid: decryptedData,
            }
          : bid
      ),
    })),

  withdrawBid: (bidId) =>
    set((state) => ({
      sealedBids: state.sealedBids.map((bid) =>
        bid.id === bidId ? { ...bid, status: 'WITHDRAWN' as const } : bid
      ),
    })),

  createOpeningSession: (session) =>
    set((state) => ({
      openingSessions: [
        ...state.openingSessions,
        { ...session, id: `OPENING-${Date.now().toString(36).toUpperCase()}` },
      ],
    })),

  startOpeningSession: (sessionId) =>
    set((state) => ({
      openingSessions: state.openingSessions.map((session) =>
        session.id === sessionId
          ? { ...session, status: 'IN_PROGRESS' as const, startedAt: new Date() }
          : session
      ),
    })),

  completeOpeningSession: (sessionId) =>
    set((state) => ({
      openingSessions: state.openingSessions.map((session) =>
        session.id === sessionId
          ? { ...session, status: 'COMPLETED' as const, completedAt: new Date() }
          : session
      ),
    })),

  setCurrentOpeningSession: (sessionId) =>
    set({ currentOpeningSession: sessionId }),

  getSealedBidsByTender: (tenderId) =>
    get().sealedBids.filter((bid) => bid.tenderId === tenderId),

  getPendingOpenings: () =>
    get().openingSessions.filter((session) => session.status === 'PENDING'),

  getBidsByStatus: (status) =>
    get().sealedBids.filter((bid) => bid.status === status),
}));
