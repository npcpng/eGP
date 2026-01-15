import { create } from 'zustand';
import type {
  Tender,
  TenderStatus,
  Bid,
  AnnualProcurementPlan,
  Evaluation,
  ProcurementMethod,
  Money,
} from '@/types';

// Use a fixed base date for SSR hydration stability
const BASE_DATE = new Date('2026-01-11T10:00:00.000Z');

// Mock data generator
const generateMockTenders = (): Tender[] => {
  const now = BASE_DATE;
  const statuses: TenderStatus[] = [
    'DRAFT', 'PUBLISHED', 'OPEN_FOR_BIDDING', 'UNDER_EVALUATION', 'AWARDED'
  ];
  const methods: ProcurementMethod[] = [
    'OPEN_TENDER', 'RESTRICTED_TENDER', 'REQUEST_FOR_QUOTATION'
  ];
  const categories = [
    'Information Technology',
    'Medical Supplies',
    'Construction Works',
    'Office Supplies',
    'Professional Services',
    'Vehicles & Equipment',
  ];

  return Array.from({ length: 12 }, (_, i) => ({
    id: `tender-${i + 1}`,
    referenceNumber: `NPC/2026/T-${String(i + 1).padStart(4, '0')}`,
    title: [
      'Supply of Medical Equipment for Port Moresby General Hospital',
      'Construction of Provincial Health Center in Eastern Highlands',
      'IT Infrastructure Upgrade for Department of Finance',
      'Supply of Office Furniture for National Parliament',
      'Professional Audit Services for 2026 Financial Year',
      'Vehicle Fleet Procurement for PNG Power Ltd',
      'Road Maintenance Works - Highlands Highway Section 4',
      'Supply of Educational Materials for Primary Schools',
      'Water Treatment Plant Equipment - Lae City',
      'Telecommunications Equipment Supply and Installation',
      'Security Services for Government Buildings',
      'Consulting Services for National Development Plan',
    ][i],
    description: 'Detailed specifications and requirements are provided in the attached tender documents.',
    organizationId: `org-${(i % 5) + 1}`,
    procurementMethod: methods[i % methods.length],
    status: statuses[i % statuses.length],
    category: categories[i % categories.length],
    unspscCode: `${40 + (i % 10)}00000`,
    estimatedValue: {
      amount: [2500000, 15000000, 8500000, 1200000, 3500000, 12000000, 45000000, 950000, 22000000, 18500000, 2800000, 5600000][i],
      currency: 'PGK',
    } as Money,
    currency: 'PGK',
    submissionDeadline: new Date(now.getTime() + (i - 3) * 7 * 24 * 60 * 60 * 1000),
    openingDate: new Date(now.getTime() + (i - 3) * 7 * 24 * 60 * 60 * 1000 + 24 * 60 * 60 * 1000),
    validityPeriod: 90,
    bidSecurityRequired: [true, true, false, true, false][i % 5],
    bidSecurityAmount: { amount: [50000, 300000, 0, 24000, 0][i % 5], currency: 'PGK' } as Money,
    documents: [],
    lots: [],
    evaluationCriteria: [],
    clarifications: [],
    addenda: [],
    approvalChain: [],
    createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
    createdBy: 'system',
    updatedBy: 'system',
    isDeleted: false,
  }));
};

const generateMockBids = (): Bid[] => {
  return Array.from({ length: 25 }, (_, i) => ({
    id: `bid-${i + 1}`,
    tenderId: `tender-${(i % 12) + 1}`,
    supplierId: `supplier-${(i % 8) + 1}`,
    referenceNumber: `BID/2026/${String(i + 1).padStart(5, '0')}`,
    status: (['SUBMITTED', 'UNDER_EVALUATION', 'RESPONSIVE', 'AWARDED'] as const)[i % 4],
    submittedAt: new Date(),
    technicalProposal: [],
    financialProposal: [],
    totalPrice: {
      amount: 1000000 + Math.floor(Math.random() * 5000000),
      currency: 'PGK',
    } as Money,
    validityPeriod: 90,
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system',
    updatedBy: 'system',
    isDeleted: false,
  }));
};

const generateMockPlans = (): AnnualProcurementPlan[] => {
  return Array.from({ length: 5 }, (_, i) => ({
    id: `plan-${i + 1}`,
    fiscalYear: 2026,
    organizationId: `org-${i + 1}`,
    status: (['DRAFT', 'SUBMITTED', 'APPROVED', 'PUBLISHED'] as const)[i % 4],
    totalBudget: {
      amount: 50000000 + i * 10000000,
      currency: 'PGK',
    } as Money,
    items: [],
    approvalChain: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system',
    updatedBy: 'system',
    isDeleted: false,
  }));
};

interface ProcurementState {
  // Data
  tenders: Tender[];
  bids: Bid[];
  plans: AnnualProcurementPlan[];
  evaluations: Evaluation[];

  // UI State
  selectedTenderId: string | null;
  selectedBidId: string | null;
  isLoading: boolean;

  // Filters
  tenderStatusFilter: TenderStatus | null;
  searchQuery: string;

  // Actions
  setTenders: (tenders: Tender[]) => void;
  addTender: (tender: Tender) => void;
  updateTender: (id: string, updates: Partial<Tender>) => void;
  deleteTender: (id: string) => void;

  setBids: (bids: Bid[]) => void;
  addBid: (bid: Bid) => void;
  updateBid: (id: string, updates: Partial<Bid>) => void;

  setPlans: (plans: AnnualProcurementPlan[]) => void;
  addPlan: (plan: AnnualProcurementPlan) => void;
  updatePlan: (id: string, updates: Partial<AnnualProcurementPlan>) => void;

  // Selection
  selectTender: (id: string | null) => void;
  selectBid: (id: string | null) => void;

  // Filters
  setTenderStatusFilter: (status: TenderStatus | null) => void;
  setSearchQuery: (query: string) => void;

  // Computed
  getFilteredTenders: () => Tender[];
  getTenderById: (id: string) => Tender | undefined;
  getBidsForTender: (tenderId: string) => Bid[];

  // Loading
  setLoading: (loading: boolean) => void;

  // Initialize
  initializeMockData: () => void;
}

export const useProcurementStore = create<ProcurementState>((set, get) => ({
  tenders: [],
  bids: [],
  plans: [],
  evaluations: [],
  selectedTenderId: null,
  selectedBidId: null,
  isLoading: false,
  tenderStatusFilter: null,
  searchQuery: '',

  setTenders: (tenders) => set({ tenders }),

  addTender: (tender) => set((state) => ({
    tenders: [...state.tenders, tender]
  })),

  updateTender: (id, updates) => set((state) => ({
    tenders: state.tenders.map((t) =>
      t.id === id ? { ...t, ...updates, updatedAt: new Date() } : t
    ),
  })),

  deleteTender: (id) => set((state) => ({
    tenders: state.tenders.map((t) =>
      t.id === id ? { ...t, isDeleted: true } : t
    ),
  })),

  setBids: (bids) => set({ bids }),

  addBid: (bid) => set((state) => ({
    bids: [...state.bids, bid]
  })),

  updateBid: (id, updates) => set((state) => ({
    bids: state.bids.map((b) =>
      b.id === id ? { ...b, ...updates, updatedAt: new Date() } : b
    ),
  })),

  setPlans: (plans) => set({ plans }),

  addPlan: (plan) => set((state) => ({
    plans: [...state.plans, plan]
  })),

  updatePlan: (id, updates) => set((state) => ({
    plans: state.plans.map((p) =>
      p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
    ),
  })),

  selectTender: (id) => set({ selectedTenderId: id }),
  selectBid: (id) => set({ selectedBidId: id }),

  setTenderStatusFilter: (status) => set({ tenderStatusFilter: status }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  getFilteredTenders: () => {
    const { tenders, tenderStatusFilter, searchQuery } = get();
    return tenders.filter((t) => {
      if (t.isDeleted) return false;
      if (tenderStatusFilter && t.status !== tenderStatusFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          t.title.toLowerCase().includes(query) ||
          t.referenceNumber.toLowerCase().includes(query) ||
          t.category.toLowerCase().includes(query)
        );
      }
      return true;
    });
  },

  getTenderById: (id) => get().tenders.find((t) => t.id === id),

  getBidsForTender: (tenderId) =>
    get().bids.filter((b) => b.tenderId === tenderId && !b.isDeleted),

  setLoading: (loading) => set({ isLoading: loading }),

  initializeMockData: () => {
    set({
      tenders: generateMockTenders(),
      bids: generateMockBids(),
      plans: generateMockPlans(),
    });
  },
}));
