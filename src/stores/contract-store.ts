import { create } from 'zustand';
import type { Contract, ContractStatus, Money } from '@/types';

const generateMockContracts = (): Contract[] => {
  const statuses: ContractStatus[] = ['DRAFT', 'ACTIVE', 'ACTIVE', 'COMPLETED', 'ACTIVE'];
  const types = ['GOODS', 'WORKS', 'SERVICES', 'CONSULTANCY'] as const;

  const contractTitles = [
    'Medical Equipment Supply and Installation',
    'Provincial Health Center Construction',
    'IT Infrastructure Upgrade Implementation',
    'Office Furniture Supply',
    'Annual Audit Services',
    'Vehicle Fleet Supply and Maintenance',
    'Road Maintenance Works',
    'Educational Materials Supply',
  ];

  return contractTitles.map((title, i) => ({
    id: `contract-${i + 1}`,
    referenceNumber: `NPC/2026/C-${String(i + 1).padStart(4, '0')}`,
    tenderId: `tender-${i + 1}`,
    bidId: `bid-${i + 1}`,
    supplierId: `supplier-${(i % 8) + 1}`,
    organizationId: `org-${(i % 5) + 1}`,
    title,
    description: `Contract for ${title.toLowerCase()} as per tender specifications.`,
    status: statuses[i % statuses.length],
    contractType: types[i % types.length],
    value: {
      amount: [2200000, 14500000, 8000000, 1100000, 3200000, 11500000, 42000000, 900000][i],
      currency: 'PGK',
    } as Money,
    period: {
      startDate: new Date(2026, 0, 1),
      endDate: new Date(2026 + (i % 2), 11, 31),
      durationInDays: 365 * (1 + (i % 2)),
    },
    signedDate: statuses[i % statuses.length] !== 'DRAFT' ? new Date(2025, 11, 15) : undefined,
    effectiveDate: statuses[i % statuses.length] !== 'DRAFT' ? new Date(2026, 0, 1) : undefined,
    clauses: [],
    milestones: [
      {
        id: `milestone-${i}-1`,
        contractId: `contract-${i + 1}`,
        number: 1,
        title: 'Initial Delivery / Mobilization',
        description: 'First phase of contract execution',
        dueDate: new Date(2026, 2, 31),
        deliverables: ['Initial report', 'Work plan'],
        paymentPercentage: 30,
        status: i > 3 ? 'COMPLETED' as const : 'PENDING' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        updatedBy: 'system',
        isDeleted: false,
      },
      {
        id: `milestone-${i}-2`,
        contractId: `contract-${i + 1}`,
        number: 2,
        title: 'Mid-term Delivery',
        description: 'Second phase of contract execution',
        dueDate: new Date(2026, 6, 30),
        deliverables: ['Progress report', 'Deliverables batch 2'],
        paymentPercentage: 40,
        status: 'PENDING' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        updatedBy: 'system',
        isDeleted: false,
      },
      {
        id: `milestone-${i}-3`,
        contractId: `contract-${i + 1}`,
        number: 3,
        title: 'Final Delivery / Completion',
        description: 'Final phase and project closure',
        dueDate: new Date(2026, 11, 15),
        deliverables: ['Final report', 'All deliverables', 'Handover documentation'],
        paymentPercentage: 30,
        status: 'PENDING' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        updatedBy: 'system',
        isDeleted: false,
      },
    ],
    variations: [],
    payments: [],
    documents: [],
    performanceRating: i > 3 ? 75 + Math.floor(Math.random() * 25) : undefined,
    createdAt: new Date(2025, 10, 1),
    updatedAt: new Date(),
    createdBy: 'system',
    updatedBy: 'system',
    isDeleted: false,
  }));
};

interface ContractState {
  contracts: Contract[];
  selectedContractId: string | null;
  isLoading: boolean;
  searchQuery: string;
  statusFilter: ContractStatus | null;

  // Actions
  setContracts: (contracts: Contract[]) => void;
  addContract: (contract: Contract) => void;
  updateContract: (id: string, updates: Partial<Contract>) => void;
  deleteContract: (id: string) => void;

  selectContract: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: ContractStatus | null) => void;

  getFilteredContracts: () => Contract[];
  getContractById: (id: string) => Contract | undefined;
  getContractsBySupplier: (supplierId: string) => Contract[];

  setLoading: (loading: boolean) => void;
  initializeMockData: () => void;
}

export const useContractStore = create<ContractState>((set, get) => ({
  contracts: [],
  selectedContractId: null,
  isLoading: false,
  searchQuery: '',
  statusFilter: null,

  setContracts: (contracts) => set({ contracts }),

  addContract: (contract) => set((state) => ({
    contracts: [...state.contracts, contract],
  })),

  updateContract: (id, updates) => set((state) => ({
    contracts: state.contracts.map((c) =>
      c.id === id ? { ...c, ...updates, updatedAt: new Date() } : c
    ),
  })),

  deleteContract: (id) => set((state) => ({
    contracts: state.contracts.map((c) =>
      c.id === id ? { ...c, isDeleted: true } : c
    ),
  })),

  selectContract: (id) => set({ selectedContractId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setStatusFilter: (status) => set({ statusFilter: status }),

  getFilteredContracts: () => {
    const { contracts, searchQuery, statusFilter } = get();
    return contracts.filter((c) => {
      if (c.isDeleted) return false;
      if (statusFilter && c.status !== statusFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          c.title.toLowerCase().includes(query) ||
          c.referenceNumber.toLowerCase().includes(query)
        );
      }
      return true;
    });
  },

  getContractById: (id) => get().contracts.find((c) => c.id === id),

  getContractsBySupplier: (supplierId) =>
    get().contracts.filter((c) => c.supplierId === supplierId && !c.isDeleted),

  setLoading: (loading) => set({ isLoading: loading }),

  initializeMockData: () => {
    set({ contracts: generateMockContracts() });
  },
}));
