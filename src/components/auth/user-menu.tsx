'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/auth-provider';
import { useAuthStore } from '@/stores/auth-store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  User,
  Settings,
  LogOut,
  Shield,
  Building2,
  ChevronDown,
  Loader2
} from 'lucide-react';

export function UserMenu() {
  const { user, signOut, isLoading } = useAuth();
  const { user: authUser, isAuthenticated } = useAuthStore();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    setIsSigningOut(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2">
        <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
      </div>
    );
  }

  // Demo mode: show demo user info
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  if (!isAuthenticated && !user) {
    if (isDemoMode) {
      // Show demo user for demo mode
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-3 py-2 h-auto">
              <Avatar className="h-8 w-8 bg-emerald-100">
                <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm font-medium">
                  SA
                </AvatarFallback>
              </Avatar>
              <div className="text-left hidden md:block">
                <p className="text-sm font-medium text-slate-900">System Administrator</p>
                <p className="text-xs text-slate-500">SYSTEM ADMIN</p>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400 hidden md:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">Demo Mode</p>
                <p className="text-xs text-slate-500">Authentication is disabled</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/login" className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Sign In
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <Button asChild variant="outline" size="sm">
        <Link href="/login">Sign In</Link>
      </Button>
    );
  }

  const displayName = authUser
    ? `${authUser.firstName} ${authUser.lastName}`.trim() || authUser.email
    : user?.user_metadata?.first_name
      ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`.trim()
      : user?.email;

  const initials = authUser
    ? `${authUser.firstName?.[0] || ''}${authUser.lastName?.[0] || ''}`.toUpperCase()
    : (user?.user_metadata?.first_name?.[0] || user?.email?.[0] || 'U').toUpperCase();

  const role = authUser?.role || user?.user_metadata?.role || 'USER';
  const roleDisplay = role.replace(/_/g, ' ');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 px-3 py-2 h-auto">
          <Avatar className="h-8 w-8 bg-emerald-100">
            <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="text-left hidden md:block">
            <p className="text-sm font-medium text-slate-900">{displayName}</p>
            <p className="text-xs text-slate-500">{roleDisplay}</p>
          </div>
          <ChevronDown className="h-4 w-4 text-slate-400 hidden md:block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{displayName}</p>
            <p className="text-xs text-slate-500">{user?.email || authUser?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings" className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        {(role === 'SYSTEM_ADMIN' || role === 'NPC_ADMIN') && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin/users" className="cursor-pointer">
                <Shield className="mr-2 h-4 w-4" />
                User Management
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/organizations" className="cursor-pointer">
                <Building2 className="mr-2 h-4 w-4" />
                Organizations
              </Link>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="text-red-600 focus:text-red-600 cursor-pointer"
        >
          {isSigningOut ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="mr-2 h-4 w-4" />
          )}
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
