import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  permissions: Set<string>;

  // Actions
  login: (user: User, token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
}

// Role-based permission mapping
const rolePermissions: Record<UserRole, string[]> = {
  SYSTEM_ADMIN: ['*'],
  NPC_ADMIN: [
    'system:read', 'system:write',
    'user:read', 'user:write', 'user:delete',
    'organization:read', 'organization:write',
    'tender:read', 'tender:write', 'tender:approve',
    'contract:read', 'contract:write', 'contract:approve',
    'supplier:read', 'supplier:write', 'supplier:approve',
    'report:read', 'report:write',
    'audit:read',
  ],
  NPC_OFFICER: [
    'tender:read', 'tender:write',
    'contract:read', 'contract:write',
    'supplier:read', 'supplier:write',
    'report:read',
  ],
  AGENCY_HEAD: [
    'plan:read', 'plan:write', 'plan:approve',
    'tender:read', 'tender:approve',
    'contract:read', 'contract:approve',
    'report:read',
  ],
  PROCUREMENT_OFFICER: [
    'plan:read', 'plan:write',
    'tender:read', 'tender:write',
    'bid:read',
    'evaluation:read',
    'contract:read', 'contract:write',
    'supplier:read',
  ],
  FINANCE_OFFICER: [
    'plan:read',
    'contract:read',
    'payment:read', 'payment:write', 'payment:approve',
    'report:read',
  ],
  EVALUATOR: [
    'tender:read',
    'bid:read',
    'evaluation:read', 'evaluation:write',
  ],
  AUDITOR: [
    'tender:read',
    'bid:read',
    'contract:read',
    'supplier:read',
    'audit:read',
    'report:read',
  ],
  SUPPLIER: [
    'tender:read',
    'bid:read', 'bid:write',
    'contract:read',
    'profile:read', 'profile:write',
  ],
  PUBLIC_VIEWER: [
    'tender:read',
    'contract:read',
  ],
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      permissions: new Set(),

      login: (user, token) => {
        const userPermissions = rolePermissions[user.role] || [];
        set({
          user,
          token,
          isAuthenticated: true,
          permissions: new Set(userPermissions),
        });
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          permissions: new Set(),
        });
      },

      setLoading: (loading) => set({ isLoading: loading }),

      hasPermission: (permission) => {
        const { permissions } = get();
        if (permissions.has('*')) return true;
        return permissions.has(permission);
      },

      hasRole: (role) => {
        const { user } = get();
        return user?.role === role;
      },

      hasAnyRole: (roles) => {
        const { user } = get();
        return user ? roles.includes(user.role) : false;
      },
    }),
    {
      name: 'egp-auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
