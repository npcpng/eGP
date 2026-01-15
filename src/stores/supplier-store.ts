import { create } from 'zustand';
import type { Supplier, SupplierStatus, Money } from '@/types';

const generateMockSuppliers = (): Supplier[] => {
  const statuses: SupplierStatus[] = ['ACTIVE', 'ACTIVE', 'PENDING', 'ACTIVE', 'SUSPENDED'];
  const types = ['COMPANY', 'SOLE_TRADER', 'PARTNERSHIP', 'JOINT_VENTURE'] as const;

  const supplierNames = [
    'PNG Construction Ltd',
    'Melanesian Medical Supplies Pty Ltd',
    'Pacific IT Solutions',
    'Highland Agricultural Cooperative',
    'Southern Transport Services',
    'Coral Sea Trading Company',
    'Port Moresby Office Supplies',
    'National Engineering Consultants',
    'Island Security Services',
    'Paradise Catering Solutions',
    'Sepik Logistics Ltd',
    'Gulf Province Building Materials',
  ];

  return supplierNames.map((name, i) => ({
    id: `supplier-${i + 1}`,
    registrationNumber: `PNG-SUP-${String(i + 1).padStart(6, '0')}`,
    name,
    tradingName: name,
    type: types[i % types.length],
    status: statuses[i % statuses.length],
    address: {
      line1: `${100 + i} Business Street`,
      city: ['Port Moresby', 'Lae', 'Mount Hagen', 'Kokopo', 'Madang'][i % 5],
      province: ['NCD', 'Morobe', 'Western Highlands', 'East New Britain', 'Madang'][i % 5],
      country: 'Papua New Guinea',
    },
    contact: {
      email: `info@${name.toLowerCase().replace(/\s+/g, '')}.com.pg`,
      phone: `+675 ${300 + i} ${1000 + i}`,
      mobile: `+675 7${200 + i} ${1000 + i}`,
    },
    taxNumber: `TIN-${String(1000000 + i).padStart(8, '0')}`,
    businessRegistrationNumber: `IPA-${String(200000 + i).padStart(7, '0')}`,
    incorporationDate: new Date(2010 + (i % 10), i % 12, 1),
    classifications: i % 3 === 0 ? [
      {
        type: 'SME' as const,
        certificationDate: new Date(2024, 1, 1),
        isVerified: true,
      },
    ] : i % 3 === 1 ? [
      {
        type: 'WOMEN_OWNED' as const,
        certificationDate: new Date(2024, 1, 1),
        isVerified: true,
      },
    ] : [],
    qualifications: [
      {
        id: `qual-${i}-1`,
        supplierId: `supplier-${i + 1}`,
        category: ['Construction', 'IT Services', 'Medical Supplies', 'General Goods'][i % 4],
        level: (['BASIC', 'STANDARD', 'ADVANCED'] as const)[i % 3],
        maxContractValue: {
          amount: [5000000, 15000000, 50000000][i % 3],
          currency: 'PGK',
        } as Money,
        validFrom: new Date(2025, 0, 1),
        validTo: new Date(2027, 11, 31),
        documents: [],
        status: 'APPROVED' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        updatedBy: 'system',
        isDeleted: false,
      },
    ],
    bankDetails: {
      bankName: ['BSP', 'Westpac', 'Kina Bank', 'ANZ'][i % 4],
      branchName: 'Port Moresby Main',
      accountName: name,
      accountNumber: String(1000000000 + i * 12345),
      swiftCode: ['BSPNPGPM', 'WPACPGPM', 'KINAPGPM', 'ANZPPGPM'][i % 4],
    },
    categories: [
      ['Construction', 'Civil Works'],
      ['Medical', 'Healthcare'],
      ['IT', 'Technology'],
      ['Agriculture', 'Food Supply'],
      ['Transport', 'Logistics'],
      ['Trade', 'Import/Export'],
      ['Office Supplies', 'Stationery'],
      ['Consulting', 'Engineering'],
      ['Security', 'Protection'],
      ['Hospitality', 'Catering'],
      ['Logistics', 'Shipping'],
      ['Construction Materials', 'Building'],
    ][i],
    unspscCodes: [`${40 + (i % 20)}000000`],
    performanceHistory: [
      {
        id: `perf-${i}-1`,
        supplierId: `supplier-${i + 1}`,
        contractId: `contract-${i + 1}`,
        evaluationDate: new Date(2025, 6, 1),
        qualityScore: 70 + Math.floor(Math.random() * 30),
        deliveryScore: 65 + Math.floor(Math.random() * 35),
        priceScore: 75 + Math.floor(Math.random() * 25),
        overallScore: 70 + Math.floor(Math.random() * 30),
        evaluatedBy: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        updatedBy: 'system',
        isDeleted: false,
      },
    ],
    createdAt: new Date(2020 + (i % 5), i % 12, 1),
    updatedAt: new Date(),
    createdBy: 'system',
    updatedBy: 'system',
    isDeleted: false,
  }));
};

interface SupplierState {
  suppliers: Supplier[];
  selectedSupplierId: string | null;
  isLoading: boolean;
  searchQuery: string;
  statusFilter: SupplierStatus | null;
  categoryFilter: string | null;

  // Actions
  setSuppliers: (suppliers: Supplier[]) => void;
  addSupplier: (supplier: Supplier) => void;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;

  selectSupplier: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: SupplierStatus | null) => void;
  setCategoryFilter: (category: string | null) => void;

  getFilteredSuppliers: () => Supplier[];
  getSupplierById: (id: string) => Supplier | undefined;

  setLoading: (loading: boolean) => void;
  initializeMockData: () => void;
}

export const useSupplierStore = create<SupplierState>((set, get) => ({
  suppliers: [],
  selectedSupplierId: null,
  isLoading: false,
  searchQuery: '',
  statusFilter: null,
  categoryFilter: null,

  setSuppliers: (suppliers) => set({ suppliers }),

  addSupplier: (supplier) => set((state) => ({
    suppliers: [...state.suppliers, supplier],
  })),

  updateSupplier: (id, updates) => set((state) => ({
    suppliers: state.suppliers.map((s) =>
      s.id === id ? { ...s, ...updates, updatedAt: new Date() } : s
    ),
  })),

  deleteSupplier: (id) => set((state) => ({
    suppliers: state.suppliers.map((s) =>
      s.id === id ? { ...s, isDeleted: true } : s
    ),
  })),

  selectSupplier: (id) => set({ selectedSupplierId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setStatusFilter: (status) => set({ statusFilter: status }),
  setCategoryFilter: (category) => set({ categoryFilter: category }),

  getFilteredSuppliers: () => {
    const { suppliers, searchQuery, statusFilter, categoryFilter } = get();
    return suppliers.filter((s) => {
      if (s.isDeleted) return false;
      if (statusFilter && s.status !== statusFilter) return false;
      if (categoryFilter && !s.categories.includes(categoryFilter)) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          s.name.toLowerCase().includes(query) ||
          s.registrationNumber.toLowerCase().includes(query) ||
          s.contact.email.toLowerCase().includes(query)
        );
      }
      return true;
    });
  },

  getSupplierById: (id) => get().suppliers.find((s) => s.id === id),

  setLoading: (loading) => set({ isLoading: loading }),

  initializeMockData: () => {
    set({ suppliers: generateMockSuppliers() });
  },
}));
