import { create } from 'zustand';
import type { AuditLog, AuditAction } from '@/types';

interface AuditState {
  logs: AuditLog[];
  isLoading: boolean;

  // Actions
  addLog: (log: Omit<AuditLog, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'isDeleted'>) => void;
  getLogs: (filters?: {
    userId?: string;
    entityType?: string;
    entityId?: string;
    action?: AuditAction;
    startDate?: Date;
    endDate?: Date;
  }) => AuditLog[];
  getLogsByEntity: (entityType: string, entityId: string) => AuditLog[];
  getLogsByUser: (userId: string) => AuditLog[];

  setLoading: (loading: boolean) => void;
  initializeMockData: () => void;
}

// Use a fixed base date for SSR hydration stability
const BASE_DATE = new Date('2026-01-11T10:00:00.000Z');

const generateMockAuditLogs = (): AuditLog[] => {
  const actions: AuditAction[] = [
    'CREATE', 'UPDATE', 'READ', 'APPROVE', 'SUBMIT', 'PUBLISH', 'LOGIN'
  ];
  const entityTypes = ['Tender', 'Bid', 'Contract', 'Supplier', 'User'];
  const users = ['admin', 'john.doe', 'jane.smith', 'procurement.officer', 'evaluator1'];

  return Array.from({ length: 50 }, (_, i) => {
    const now = BASE_DATE;
    const createdAt = new Date(now.getTime() - i * 3600000);

    return {
      id: `audit-${i + 1}`,
      userId: users[i % users.length],
      sessionId: `session-${Math.floor(i / 10) + 1}`,
      action: actions[i % actions.length],
      entityType: entityTypes[i % entityTypes.length],
      entityId: `${entityTypes[i % entityTypes.length].toLowerCase()}-${(i % 12) + 1}`,
      previousState: i % 3 === 0 ? JSON.stringify({ status: 'DRAFT' }) : undefined,
      newState: i % 3 === 0 ? JSON.stringify({ status: 'SUBMITTED' }) : undefined,
      ipAddress: `192.168.1.${100 + (i % 50)}`,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
      metadata: {
        browser: 'Chrome',
        platform: 'Windows',
      },
      createdAt,
      updatedAt: createdAt,
      createdBy: 'system',
      updatedBy: 'system',
      isDeleted: false,
    };
  });
};

export const useAuditStore = create<AuditState>((set, get) => ({
  logs: [],
  isLoading: false,

  addLog: (logData) => {
    const now = new Date();
    const newLog: AuditLog = {
      ...logData,
      id: `audit-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
      createdBy: 'system',
      updatedBy: 'system',
      isDeleted: false,
    };
    set((state) => ({ logs: [newLog, ...state.logs] }));
  },

  getLogs: (filters) => {
    const { logs } = get();
    return logs.filter((log) => {
      if (filters?.userId && log.userId !== filters.userId) return false;
      if (filters?.entityType && log.entityType !== filters.entityType) return false;
      if (filters?.entityId && log.entityId !== filters.entityId) return false;
      if (filters?.action && log.action !== filters.action) return false;
      if (filters?.startDate && log.createdAt < filters.startDate) return false;
      if (filters?.endDate && log.createdAt > filters.endDate) return false;
      return true;
    });
  },

  getLogsByEntity: (entityType, entityId) => {
    return get().logs.filter(
      (log) => log.entityType === entityType && log.entityId === entityId
    );
  },

  getLogsByUser: (userId) => {
    return get().logs.filter((log) => log.userId === userId);
  },

  setLoading: (loading) => set({ isLoading: loading }),

  initializeMockData: () => {
    set({ logs: generateMockAuditLogs() });
  },
}));
