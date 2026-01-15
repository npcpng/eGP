'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Search,
  Bell,
  Menu,
  User,
  Settings,
  LogOut,
  HelpCircle,
  ChevronDown,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { NotificationCenter } from '@/components/notifications/notification-center';

interface HeaderProps {
  onMenuToggle?: () => void;
}

const mockNotifications = [
  {
    id: 1,
    type: 'action',
    title: 'Tender Approval Required',
    message: 'NPC/2026/T-0005 requires your approval',
    time: '5 min ago',
    read: false,
  },
  {
    id: 2,
    type: 'info',
    title: 'Bid Submission Received',
    message: '3 new bids for Health Equipment tender',
    time: '1 hour ago',
    read: false,
  },
  {
    id: 3,
    type: 'success',
    title: 'Contract Signed',
    message: 'IT Infrastructure contract is now active',
    time: '2 hours ago',
    read: true,
  },
  {
    id: 4,
    type: 'warning',
    title: 'Deadline Approaching',
    message: '2 tenders closing in 24 hours',
    time: '3 hours ago',
    read: true,
  },
];

export function Header({ onMenuToggle }: HeaderProps) {
  const { user, logout, isAuthenticated } = useAuthStore();
  const [searchOpen, setSearchOpen] = useState(false);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'action':
        return <FileText className="h-4 w-4 text-amber-600" />;
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-zinc-500" />;
    }
  };

  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center border-b border-zinc-200 bg-white px-4 lg:px-6">
      {/* Mobile Menu Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden mr-2"
        onClick={onMenuToggle}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Search */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            placeholder="Search tenders, suppliers, contracts..."
            className={cn(
              'pl-10 bg-zinc-50 border-zinc-200 focus:bg-white transition-all',
              searchOpen ? 'w-full' : 'w-64 lg:w-80'
            )}
            onFocus={() => setSearchOpen(true)}
            onBlur={() => setSearchOpen(false)}
          />
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-2 ml-4">
        {/* Quick Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="hidden md:flex gap-2">
              Quick Actions
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link href="/tenders/new">Create Tender</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/suppliers/register">Register Supplier</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/contracts/new">New Contract</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/reports/dashboard">View Reports</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <NotificationCenter />

        {/* Help */}
        <Button variant="ghost" size="icon" className="hidden md:flex">
          <HelpCircle className="h-5 w-5 text-zinc-600" />
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 pl-2 pr-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/avatars/user.png" />
                <AvatarFallback className="bg-gradient-to-br from-red-600 to-amber-600 text-white text-xs">
                  {user?.firstName?.[0] || 'A'}{user?.lastName?.[0] || 'D'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-medium text-zinc-900">
                  {user?.firstName || 'Admin'} {user?.lastName || 'User'}
                </span>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                  {user?.role?.replace('_', ' ') || 'SYSTEM ADMIN'}
                </Badge>
              </div>
              <ChevronDown className="h-4 w-4 text-zinc-400 hidden md:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{user?.firstName || 'Admin'} {user?.lastName || 'User'}</span>
                <span className="text-xs font-normal text-zinc-500">
                  {user?.email || 'admin@egp.gov.pg'}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600 focus:bg-red-50"
              onClick={() => logout()}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
