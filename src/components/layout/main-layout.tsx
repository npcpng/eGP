'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { cn } from '@/lib/utils';
import { useProcurementStore } from '@/stores/procurement-store';
import { useSupplierStore } from '@/stores/supplier-store';
import { useContractStore } from '@/stores/contract-store';
import { useAuditStore } from '@/stores/audit-store';
import { useAuthStore } from '@/stores/auth-store';
import { UserRole } from '@/types';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  const initProcurement = useProcurementStore((s) => s.initializeMockData);
  const initSuppliers = useSupplierStore((s) => s.initializeMockData);
  const initContracts = useContractStore((s) => s.initializeMockData);
  const initAudit = useAuditStore((s) => s.initializeMockData);
  const { login, isAuthenticated } = useAuthStore();

  useEffect(() => {
    setIsHydrated(true);

    // Initialize mock data
    initProcurement();
    initSuppliers();
    initContracts();
    initAudit();

    // Set up mock user if not authenticated
    if (!isAuthenticated) {
      login(
        {
          id: 'user-1',
          username: 'admin',
          email: 'admin@egp.gov.pg',
          firstName: 'System',
          lastName: 'Administrator',
          role: UserRole.SYSTEM_ADMIN,
          organizationId: 'npc',
          isActive: true,
          mfaEnabled: false,
          permissions: ['*'],
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'system',
          updatedBy: 'system',
          isDeleted: false,
        },
        'mock-jwt-token'
      );
    }
  }, [initProcurement, initSuppliers, initContracts, initAudit, login, isAuthenticated]);

  if (!isHydrated) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-red-600" />
          <p className="text-sm text-zinc-500">Loading eGP System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar isCollapsed={sidebarCollapsed} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 lg:hidden',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
