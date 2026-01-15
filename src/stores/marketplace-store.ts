import { create } from 'zustand';
import type { CatalogItem, Money } from '@/types';

// Extended types for marketplace
export interface PurchaseOrder {
  id: string;
  referenceNumber: string;
  organizationId: string;
  organizationName: string;
  supplierId: string;
  supplierName: string;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'ORDERED' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED';
  items: PurchaseOrderItem[];
  totalAmount: Money;
  deliveryAddress: string;
  deliveryDate?: Date;
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseOrderItem {
  id: string;
  catalogItemId: string;
  itemName: string;
  quantity: number;
  unitPrice: Money;
  totalPrice: Money;
}

export interface FrameworkAgreement {
  id: string;
  referenceNumber: string;
  title: string;
  description: string;
  supplierId: string;
  supplierName: string;
  category: string;
  status: 'DRAFT' | 'ACTIVE' | 'EXPIRED' | 'SUSPENDED';
  startDate: Date;
  endDate: Date;
  maxValue: Money;
  usedValue: Money;
  itemCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SupplierRating {
  id: string;
  supplierId: string;
  supplierName: string;
  orderId: string;
  orderRef: string;
  qualityScore: number;
  deliveryScore: number;
  priceScore: number;
  overallScore: number;
  comments: string;
  ratedBy: string;
  ratedAt: Date;
}

interface MarketplaceState {
  catalogItems: CatalogItem[];
  purchaseOrders: PurchaseOrder[];
  frameworkAgreements: FrameworkAgreement[];
  supplierRatings: SupplierRating[];
  cart: { itemId: string; quantity: number }[];

  // Actions
  addCatalogItem: (item: CatalogItem) => void;
  updateCatalogItem: (id: string, updates: Partial<CatalogItem>) => void;
  deleteCatalogItem: (id: string) => void;
  addToCart: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  createPurchaseOrder: (order: PurchaseOrder) => void;
  updatePurchaseOrder: (id: string, updates: Partial<PurchaseOrder>) => void;
  addSupplierRating: (rating: SupplierRating) => void;
}

// Use a fixed base date for SSR hydration stability
const BASE_DATE = new Date('2026-01-11T10:00:00.000Z');

// Generate mock catalog items
const generateMockCatalogItems = (): CatalogItem[] => {
  const now = BASE_DATE;
  return [
    {
      id: 'CAT-001',
      supplierId: 'SUP-001',
      name: 'Dell Latitude 5540 Laptop',
      description: '15.6" FHD, Intel Core i7, 16GB RAM, 512GB SSD, Windows 11 Pro',
      category: 'IT Equipment',
      unspscCode: '43211503',
      unitPrice: { amount: 5500, currency: 'PGK' },
      unit: 'Each',
      minimumOrderQuantity: 1,
      leadTimeDays: 14,
      specifications: {
        'Processor': 'Intel Core i7-1365U',
        'RAM': '16GB DDR5',
        'Storage': '512GB NVMe SSD',
        'Display': '15.6" FHD (1920x1080)',
        'OS': 'Windows 11 Pro',
      },
      images: ['https://ext.same-assets.com/placeholder-laptop.jpg'],
      isActive: true,
      frameworkAgreementId: 'FWA-001',
      createdAt: now,
      updatedAt: now,
      createdBy: 'system',
      updatedBy: 'system',
      isDeleted: false,
    },
    {
      id: 'CAT-002',
      supplierId: 'SUP-001',
      name: 'HP ProDesk 400 G9 Desktop',
      description: 'Small Form Factor, Intel Core i5, 8GB RAM, 256GB SSD',
      category: 'IT Equipment',
      unspscCode: '43211501',
      unitPrice: { amount: 3200, currency: 'PGK' },
      unit: 'Each',
      minimumOrderQuantity: 1,
      leadTimeDays: 14,
      specifications: {
        'Processor': 'Intel Core i5-13500',
        'RAM': '8GB DDR4',
        'Storage': '256GB NVMe SSD',
        'Form Factor': 'Small Form Factor',
      },
      images: [],
      isActive: true,
      frameworkAgreementId: 'FWA-001',
      createdAt: now,
      updatedAt: now,
      createdBy: 'system',
      updatedBy: 'system',
      isDeleted: false,
    },
    {
      id: 'CAT-003',
      supplierId: 'SUP-002',
      name: 'Office Desk - Executive',
      description: 'L-shaped executive desk with drawers, mahogany finish',
      category: 'Office Furniture',
      unspscCode: '56101502',
      unitPrice: { amount: 2800, currency: 'PGK' },
      unit: 'Each',
      minimumOrderQuantity: 1,
      leadTimeDays: 21,
      specifications: {
        'Material': 'Solid Wood',
        'Finish': 'Mahogany',
        'Dimensions': '180cm x 160cm x 75cm',
        'Drawers': '4 lockable drawers',
      },
      images: [],
      isActive: true,
      frameworkAgreementId: 'FWA-002',
      createdAt: now,
      updatedAt: now,
      createdBy: 'system',
      updatedBy: 'system',
      isDeleted: false,
    },
    {
      id: 'CAT-004',
      supplierId: 'SUP-002',
      name: 'Ergonomic Office Chair',
      description: 'High-back mesh chair with lumbar support and adjustable arms',
      category: 'Office Furniture',
      unspscCode: '56101504',
      unitPrice: { amount: 850, currency: 'PGK' },
      unit: 'Each',
      minimumOrderQuantity: 1,
      leadTimeDays: 14,
      specifications: {
        'Type': 'High-back mesh',
        'Adjustable': 'Height, armrests, tilt',
        'Weight Capacity': '120kg',
        'Lumbar Support': 'Yes',
      },
      images: [],
      isActive: true,
      frameworkAgreementId: 'FWA-002',
      createdAt: now,
      updatedAt: now,
      createdBy: 'system',
      updatedBy: 'system',
      isDeleted: false,
    },
    {
      id: 'CAT-005',
      supplierId: 'SUP-003',
      name: 'A4 Copy Paper (Box of 5 Reams)',
      description: '80gsm white copy paper, 500 sheets per ream',
      category: 'Office Supplies',
      unspscCode: '14111507',
      unitPrice: { amount: 85, currency: 'PGK' },
      unit: 'Box',
      minimumOrderQuantity: 5,
      leadTimeDays: 3,
      specifications: {
        'Size': 'A4 (210mm x 297mm)',
        'Weight': '80gsm',
        'Sheets per Ream': '500',
        'Reams per Box': '5',
      },
      images: [],
      isActive: true,
      createdAt: now,
      updatedAt: now,
      createdBy: 'system',
      updatedBy: 'system',
      isDeleted: false,
    },
    {
      id: 'CAT-006',
      supplierId: 'SUP-003',
      name: 'Printer Toner - HP 26A',
      description: 'Compatible with HP LaserJet Pro M402/M426, Black',
      category: 'Office Supplies',
      unspscCode: '44103105',
      unitPrice: { amount: 320, currency: 'PGK' },
      unit: 'Each',
      minimumOrderQuantity: 1,
      leadTimeDays: 5,
      specifications: {
        'Type': 'Black Toner Cartridge',
        'Model': 'HP 26A (CF226A)',
        'Yield': '3,100 pages',
        'Compatible': 'HP LaserJet Pro M402, M426',
      },
      images: [],
      isActive: true,
      createdAt: now,
      updatedAt: now,
      createdBy: 'system',
      updatedBy: 'system',
      isDeleted: false,
    },
    {
      id: 'CAT-007',
      supplierId: 'SUP-004',
      name: 'First Aid Kit - Workplace',
      description: 'Comprehensive workplace first aid kit for up to 50 persons',
      category: 'Safety Equipment',
      unspscCode: '42171600',
      unitPrice: { amount: 450, currency: 'PGK' },
      unit: 'Each',
      minimumOrderQuantity: 1,
      leadTimeDays: 7,
      specifications: {
        'Type': 'Workplace First Aid Kit',
        'Capacity': 'Up to 50 persons',
        'Contents': 'Bandages, antiseptics, gloves, CPR mask',
        'Compliance': 'PNG Workplace Safety Standards',
      },
      images: [],
      isActive: true,
      createdAt: now,
      updatedAt: now,
      createdBy: 'system',
      updatedBy: 'system',
      isDeleted: false,
    },
    {
      id: 'CAT-008',
      supplierId: 'SUP-005',
      name: 'Air Conditioner - Split System 2.5kW',
      description: 'Inverter split system AC, cooling and heating',
      category: 'HVAC',
      unspscCode: '40101604',
      unitPrice: { amount: 2200, currency: 'PGK' },
      unit: 'Each',
      minimumOrderQuantity: 1,
      leadTimeDays: 14,
      specifications: {
        'Type': 'Inverter Split System',
        'Capacity': '2.5kW',
        'Mode': 'Cooling and Heating',
        'Energy Rating': '5 Star',
      },
      images: [],
      isActive: true,
      createdAt: now,
      updatedAt: now,
      createdBy: 'system',
      updatedBy: 'system',
      isDeleted: false,
    },
  ];
};

// Generate mock purchase orders
const generateMockPurchaseOrders = (): PurchaseOrder[] => {
  const now = BASE_DATE;
  return [
    {
      id: 'PO-001',
      referenceNumber: 'PNG-PO-2026-001',
      organizationId: 'ORG-001',
      organizationName: 'Department of Finance',
      supplierId: 'SUP-001',
      supplierName: 'PNG Tech Solutions Ltd',
      status: 'DELIVERED',
      items: [
        {
          id: 'POI-001',
          catalogItemId: 'CAT-001',
          itemName: 'Dell Latitude 5540 Laptop',
          quantity: 10,
          unitPrice: { amount: 5500, currency: 'PGK' },
          totalPrice: { amount: 55000, currency: 'PGK' },
        },
        {
          id: 'POI-002',
          catalogItemId: 'CAT-002',
          itemName: 'HP ProDesk 400 G9 Desktop',
          quantity: 5,
          unitPrice: { amount: 3200, currency: 'PGK' },
          totalPrice: { amount: 16000, currency: 'PGK' },
        },
      ],
      totalAmount: { amount: 71000, currency: 'PGK' },
      deliveryAddress: 'Department of Finance, Waigani, Port Moresby',
      deliveryDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      approvedBy: 'John Kaupa',
      approvedAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
      createdAt: new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000),
      updatedAt: now,
    },
    {
      id: 'PO-002',
      referenceNumber: 'PNG-PO-2026-002',
      organizationId: 'ORG-002',
      organizationName: 'Department of Health',
      supplierId: 'SUP-003',
      supplierName: 'Office Pro PNG',
      status: 'ORDERED',
      items: [
        {
          id: 'POI-003',
          catalogItemId: 'CAT-005',
          itemName: 'A4 Copy Paper (Box of 5 Reams)',
          quantity: 50,
          unitPrice: { amount: 85, currency: 'PGK' },
          totalPrice: { amount: 4250, currency: 'PGK' },
        },
        {
          id: 'POI-004',
          catalogItemId: 'CAT-006',
          itemName: 'Printer Toner - HP 26A',
          quantity: 20,
          unitPrice: { amount: 320, currency: 'PGK' },
          totalPrice: { amount: 6400, currency: 'PGK' },
        },
      ],
      totalAmount: { amount: 10650, currency: 'PGK' },
      deliveryAddress: 'Department of Health, Waigani, Port Moresby',
      approvedBy: 'Mary Sipu',
      approvedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      updatedAt: now,
    },
    {
      id: 'PO-003',
      referenceNumber: 'PNG-PO-2026-003',
      organizationId: 'ORG-003',
      organizationName: 'National Planning Office',
      supplierId: 'SUP-002',
      supplierName: 'Highlands Furniture Ltd',
      status: 'PENDING_APPROVAL',
      items: [
        {
          id: 'POI-005',
          catalogItemId: 'CAT-003',
          itemName: 'Office Desk - Executive',
          quantity: 3,
          unitPrice: { amount: 2800, currency: 'PGK' },
          totalPrice: { amount: 8400, currency: 'PGK' },
        },
        {
          id: 'POI-006',
          catalogItemId: 'CAT-004',
          itemName: 'Ergonomic Office Chair',
          quantity: 10,
          unitPrice: { amount: 850, currency: 'PGK' },
          totalPrice: { amount: 8500, currency: 'PGK' },
        },
      ],
      totalAmount: { amount: 16900, currency: 'PGK' },
      deliveryAddress: 'National Planning Office, Waigani, Port Moresby',
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      updatedAt: now,
    },
  ];
};

// Generate mock framework agreements
const generateMockFrameworkAgreements = (): FrameworkAgreement[] => {
  const now = BASE_DATE;
  return [
    {
      id: 'FWA-001',
      referenceNumber: 'PNG-FWA-2025-001',
      title: 'IT Equipment Supply Framework',
      description: 'Framework agreement for supply of laptops, desktops, and peripherals',
      supplierId: 'SUP-001',
      supplierName: 'PNG Tech Solutions Ltd',
      category: 'IT Equipment',
      status: 'ACTIVE',
      startDate: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000),
      maxValue: { amount: 5000000, currency: 'PGK' },
      usedValue: { amount: 1250000, currency: 'PGK' },
      itemCount: 25,
      createdAt: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000),
      updatedAt: now,
    },
    {
      id: 'FWA-002',
      referenceNumber: 'PNG-FWA-2025-002',
      title: 'Office Furniture Supply Framework',
      description: 'Framework agreement for office desks, chairs, and storage',
      supplierId: 'SUP-002',
      supplierName: 'Highlands Furniture Ltd',
      category: 'Office Furniture',
      status: 'ACTIVE',
      startDate: new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 245 * 24 * 60 * 60 * 1000),
      maxValue: { amount: 2000000, currency: 'PGK' },
      usedValue: { amount: 450000, currency: 'PGK' },
      itemCount: 18,
      createdAt: new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000),
      updatedAt: now,
    },
    {
      id: 'FWA-003',
      referenceNumber: 'PNG-FWA-2024-005',
      title: 'Vehicle Maintenance Services',
      description: 'Framework for government fleet maintenance and repairs',
      supplierId: 'SUP-006',
      supplierName: 'PNG Motors Service Centre',
      category: 'Vehicle Services',
      status: 'EXPIRED',
      startDate: new Date(now.getTime() - 400 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000),
      maxValue: { amount: 1500000, currency: 'PGK' },
      usedValue: { amount: 1380000, currency: 'PGK' },
      itemCount: 12,
      createdAt: new Date(now.getTime() - 400 * 24 * 60 * 60 * 1000),
      updatedAt: now,
    },
  ];
};

// Generate mock supplier ratings
const generateMockSupplierRatings = (): SupplierRating[] => {
  const now = BASE_DATE;
  return [
    {
      id: 'RAT-001',
      supplierId: 'SUP-001',
      supplierName: 'PNG Tech Solutions Ltd',
      orderId: 'PO-001',
      orderRef: 'PNG-PO-2026-001',
      qualityScore: 4.5,
      deliveryScore: 4.0,
      priceScore: 4.2,
      overallScore: 4.2,
      comments: 'Good quality products, delivery was on time. Pricing competitive.',
      ratedBy: 'John Kaupa',
      ratedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'RAT-002',
      supplierId: 'SUP-003',
      supplierName: 'Office Pro PNG',
      orderId: 'PO-002',
      orderRef: 'PNG-PO-2026-002',
      qualityScore: 4.0,
      deliveryScore: 4.5,
      priceScore: 4.0,
      overallScore: 4.2,
      comments: 'Quick delivery and good customer service.',
      ratedBy: 'Mary Sipu',
      ratedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'RAT-003',
      supplierId: 'SUP-002',
      supplierName: 'Highlands Furniture Ltd',
      orderId: 'PO-OLD-001',
      orderRef: 'PNG-PO-2025-045',
      qualityScore: 4.8,
      deliveryScore: 3.5,
      priceScore: 3.8,
      overallScore: 4.0,
      comments: 'Excellent quality furniture but delivery took longer than expected.',
      ratedBy: 'Peter Kila',
      ratedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    },
  ];
};

export const useMarketplaceStore = create<MarketplaceState>((set) => ({
  catalogItems: generateMockCatalogItems(),
  purchaseOrders: generateMockPurchaseOrders(),
  frameworkAgreements: generateMockFrameworkAgreements(),
  supplierRatings: generateMockSupplierRatings(),
  cart: [],

  addCatalogItem: (item) =>
    set((state) => ({
      catalogItems: [...state.catalogItems, item],
    })),

  updateCatalogItem: (id, updates) =>
    set((state) => ({
      catalogItems: state.catalogItems.map((item) =>
        item.id === id ? { ...item, ...updates, updatedAt: new Date() } : item
      ),
    })),

  deleteCatalogItem: (id) =>
    set((state) => ({
      catalogItems: state.catalogItems.map((item) =>
        item.id === id ? { ...item, isDeleted: true } : item
      ),
    })),

  addToCart: (itemId, quantity) =>
    set((state) => {
      const existingItem = state.cart.find((i) => i.itemId === itemId);
      if (existingItem) {
        return {
          cart: state.cart.map((i) =>
            i.itemId === itemId ? { ...i, quantity: i.quantity + quantity } : i
          ),
        };
      }
      return { cart: [...state.cart, { itemId, quantity }] };
    }),

  removeFromCart: (itemId) =>
    set((state) => ({
      cart: state.cart.filter((i) => i.itemId !== itemId),
    })),

  updateCartQuantity: (itemId, quantity) =>
    set((state) => ({
      cart: state.cart.map((i) =>
        i.itemId === itemId ? { ...i, quantity } : i
      ),
    })),

  clearCart: () => set({ cart: [] }),

  createPurchaseOrder: (order) =>
    set((state) => ({
      purchaseOrders: [...state.purchaseOrders, order],
      cart: [],
    })),

  updatePurchaseOrder: (id, updates) =>
    set((state) => ({
      purchaseOrders: state.purchaseOrders.map((order) =>
        order.id === id ? { ...order, ...updates, updatedAt: new Date() } : order
      ),
    })),

  addSupplierRating: (rating) =>
    set((state) => ({
      supplierRatings: [...state.supplierRatings, rating],
    })),
}));
