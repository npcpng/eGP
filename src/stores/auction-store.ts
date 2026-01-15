import { create } from 'zustand';
import type { Auction, AuctionBid, AssetDisposal } from '@/types';

interface AuctionState {
  auctions: Auction[];
  auctionBids: AuctionBid[];
  assetDisposals: AssetDisposal[];

  // Actions
  addAuction: (auction: Auction) => void;
  updateAuction: (id: string, updates: Partial<Auction>) => void;
  deleteAuction: (id: string) => void;
  addBid: (bid: AuctionBid) => void;
  addAssetDisposal: (disposal: AssetDisposal) => void;
  updateAssetDisposal: (id: string, updates: Partial<AssetDisposal>) => void;
}

// Use a fixed base date for SSR hydration stability
const BASE_DATE = new Date('2026-01-11T10:00:00.000Z');

// Generate mock auctions
const generateMockAuctions = (): Auction[] => {
  const now = BASE_DATE;
  return [
    {
      id: 'AUC-001',
      referenceNumber: 'PNG-AUC-2026-001',
      tenderId: 'TND-001',
      type: 'REVERSE',
      title: 'IT Equipment Supply for Government Departments',
      description: 'Reverse auction for bulk procurement of laptops and desktops',
      status: 'OPEN',
      startTime: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      endTime: new Date(now.getTime() + 4 * 60 * 60 * 1000),
      reservePrice: { amount: 500000, currency: 'PGK' },
      currentPrice: { amount: 485000, currency: 'PGK' },
      minimumDecrement: { amount: 5000, currency: 'PGK' },
      bids: [],
      createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      updatedAt: now,
      createdBy: 'system',
      updatedBy: 'system',
      isDeleted: false,
    },
    {
      id: 'AUC-002',
      referenceNumber: 'PNG-AUC-2026-002',
      type: 'REVERSE',
      title: 'Office Furniture Procurement',
      description: 'Reverse auction for office furniture for new government building',
      status: 'SCHEDULED',
      startTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      endTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
      reservePrice: { amount: 250000, currency: 'PGK' },
      currentPrice: { amount: 250000, currency: 'PGK' },
      minimumDecrement: { amount: 2500, currency: 'PGK' },
      bids: [],
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      updatedAt: now,
      createdBy: 'system',
      updatedBy: 'system',
      isDeleted: false,
    },
    {
      id: 'AUC-003',
      referenceNumber: 'PNG-AUC-2026-003',
      type: 'FORWARD',
      title: 'Surplus Government Vehicles Sale',
      description: 'Forward auction for sale of 15 government vehicles',
      status: 'OPEN',
      startTime: new Date(now.getTime() - 1 * 60 * 60 * 1000),
      endTime: new Date(now.getTime() + 5 * 60 * 60 * 1000),
      reservePrice: { amount: 150000, currency: 'PGK' },
      currentPrice: { amount: 185000, currency: 'PGK' },
      bids: [],
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      updatedAt: now,
      createdBy: 'system',
      updatedBy: 'system',
      isDeleted: false,
    },
    {
      id: 'AUC-004',
      referenceNumber: 'PNG-AUC-2026-004',
      type: 'FORWARD',
      title: 'Decommissioned IT Assets Disposal',
      description: 'Forward auction for old computer equipment and servers',
      status: 'CLOSED',
      startTime: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      endTime: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      reservePrice: { amount: 25000, currency: 'PGK' },
      currentPrice: { amount: 42000, currency: 'PGK' },
      winnerId: 'SUP-005',
      bids: [],
      createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      updatedAt: now,
      createdBy: 'system',
      updatedBy: 'system',
      isDeleted: false,
    },
    {
      id: 'AUC-005',
      referenceNumber: 'PNG-AUC-2026-005',
      type: 'REVERSE',
      title: 'Medical Supplies Procurement',
      description: 'Reverse auction for bulk medical supplies for provincial hospitals',
      status: 'OPEN',
      startTime: new Date(now.getTime() - 30 * 60 * 1000),
      endTime: new Date(now.getTime() + 3 * 60 * 60 * 1000),
      reservePrice: { amount: 800000, currency: 'PGK' },
      currentPrice: { amount: 765000, currency: 'PGK' },
      minimumDecrement: { amount: 10000, currency: 'PGK' },
      bids: [],
      createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
      updatedAt: now,
      createdBy: 'system',
      updatedBy: 'system',
      isDeleted: false,
    },
  ];
};

const generateMockBids = (): AuctionBid[] => {
  const now = BASE_DATE;
  return [
    {
      id: 'BID-AUC-001',
      auctionId: 'AUC-001',
      supplierId: 'SUP-001',
      price: { amount: 495000, currency: 'PGK' },
      bidTime: new Date(now.getTime() - 90 * 60 * 1000),
      isWinning: false,
      createdAt: new Date(now.getTime() - 90 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 90 * 60 * 1000),
      createdBy: 'supplier-1',
      updatedBy: 'supplier-1',
      isDeleted: false,
    },
    {
      id: 'BID-AUC-002',
      auctionId: 'AUC-001',
      supplierId: 'SUP-003',
      price: { amount: 490000, currency: 'PGK' },
      bidTime: new Date(now.getTime() - 60 * 60 * 1000),
      isWinning: false,
      createdAt: new Date(now.getTime() - 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 60 * 60 * 1000),
      createdBy: 'supplier-3',
      updatedBy: 'supplier-3',
      isDeleted: false,
    },
    {
      id: 'BID-AUC-003',
      auctionId: 'AUC-001',
      supplierId: 'SUP-002',
      price: { amount: 485000, currency: 'PGK' },
      bidTime: new Date(now.getTime() - 30 * 60 * 1000),
      isWinning: true,
      createdAt: new Date(now.getTime() - 30 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 30 * 60 * 1000),
      createdBy: 'supplier-2',
      updatedBy: 'supplier-2',
      isDeleted: false,
    },
    {
      id: 'BID-AUC-004',
      auctionId: 'AUC-003',
      supplierId: 'SUP-004',
      price: { amount: 160000, currency: 'PGK' },
      bidTime: new Date(now.getTime() - 50 * 60 * 1000),
      isWinning: false,
      createdAt: new Date(now.getTime() - 50 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 50 * 60 * 1000),
      createdBy: 'supplier-4',
      updatedBy: 'supplier-4',
      isDeleted: false,
    },
    {
      id: 'BID-AUC-005',
      auctionId: 'AUC-003',
      supplierId: 'SUP-005',
      price: { amount: 175000, currency: 'PGK' },
      bidTime: new Date(now.getTime() - 40 * 60 * 1000),
      isWinning: false,
      createdAt: new Date(now.getTime() - 40 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 40 * 60 * 1000),
      createdBy: 'supplier-5',
      updatedBy: 'supplier-5',
      isDeleted: false,
    },
    {
      id: 'BID-AUC-006',
      auctionId: 'AUC-003',
      supplierId: 'SUP-001',
      price: { amount: 185000, currency: 'PGK' },
      bidTime: new Date(now.getTime() - 20 * 60 * 1000),
      isWinning: true,
      createdAt: new Date(now.getTime() - 20 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 20 * 60 * 1000),
      createdBy: 'supplier-1',
      updatedBy: 'supplier-1',
      isDeleted: false,
    },
  ];
};

const generateMockDisposals = (): AssetDisposal[] => {
  const now = BASE_DATE;
  return [
    {
      id: 'DISP-001',
      referenceNumber: 'PNG-DISP-2026-001',
      title: 'Government Fleet Vehicles',
      description: '15 Toyota Land Cruisers (2018-2020 models) for disposal',
      assetType: 'Vehicles',
      condition: 'FAIR',
      reservePrice: { amount: 150000, currency: 'PGK' },
      disposalMethod: 'AUCTION',
      status: 'IN_PROGRESS',
      auctionId: 'AUC-003',
      createdAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
      updatedAt: now,
      createdBy: 'system',
      updatedBy: 'system',
      isDeleted: false,
    },
    {
      id: 'DISP-002',
      referenceNumber: 'PNG-DISP-2026-002',
      title: 'Old IT Equipment',
      description: 'Decommissioned servers, desktops, and networking equipment',
      assetType: 'IT Equipment',
      condition: 'POOR',
      reservePrice: { amount: 25000, currency: 'PGK' },
      disposalMethod: 'AUCTION',
      status: 'COMPLETED',
      auctionId: 'AUC-004',
      createdAt: new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000),
      updatedAt: now,
      createdBy: 'system',
      updatedBy: 'system',
      isDeleted: false,
    },
    {
      id: 'DISP-003',
      referenceNumber: 'PNG-DISP-2026-003',
      title: 'Office Furniture Disposal',
      description: 'Old office desks, chairs, and filing cabinets',
      assetType: 'Furniture',
      condition: 'FAIR',
      reservePrice: { amount: 8000, currency: 'PGK' },
      disposalMethod: 'TENDER',
      status: 'PENDING',
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      updatedAt: now,
      createdBy: 'system',
      updatedBy: 'system',
      isDeleted: false,
    },
    {
      id: 'DISP-004',
      referenceNumber: 'PNG-DISP-2026-004',
      title: 'Medical Equipment Write-off',
      description: 'Obsolete medical diagnostic equipment',
      assetType: 'Medical Equipment',
      condition: 'SCRAP',
      reservePrice: { amount: 5000, currency: 'PGK' },
      disposalMethod: 'DESTROY',
      status: 'APPROVED',
      createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      updatedAt: now,
      createdBy: 'system',
      updatedBy: 'system',
      isDeleted: false,
    },
  ];
};

export const useAuctionStore = create<AuctionState>((set) => ({
  auctions: generateMockAuctions(),
  auctionBids: generateMockBids(),
  assetDisposals: generateMockDisposals(),

  addAuction: (auction) =>
    set((state) => ({
      auctions: [...state.auctions, auction],
    })),

  updateAuction: (id, updates) =>
    set((state) => ({
      auctions: state.auctions.map((auction) =>
        auction.id === id ? { ...auction, ...updates, updatedAt: new Date() } : auction
      ),
    })),

  deleteAuction: (id) =>
    set((state) => ({
      auctions: state.auctions.map((auction) =>
        auction.id === id ? { ...auction, isDeleted: true } : auction
      ),
    })),

  addBid: (bid) =>
    set((state) => ({
      auctionBids: [...state.auctionBids, bid],
    })),

  addAssetDisposal: (disposal) =>
    set((state) => ({
      assetDisposals: [...state.assetDisposals, disposal],
    })),

  updateAssetDisposal: (id, updates) =>
    set((state) => ({
      assetDisposals: state.assetDisposals.map((disposal) =>
        disposal.id === id ? { ...disposal, ...updates, updatedAt: new Date() } : disposal
      ),
    })),
}));
