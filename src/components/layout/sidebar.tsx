'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  Users,
  Building2,
  BarChart3,
  Settings,
  ShieldCheck,
  Gavel,
  Package,
  FileSearch,
  ChevronDown,
  ChevronRight,
  Calendar,
  ShoppingCart,
  Bell,
  HelpCircle,
  Database,
  Globe,
  Hammer,
  MessageSquare,
  BookOpen,
  UserCheck,
  History,
  Truck,
  Store,
  LayoutGrid,
  PieChart,
  Lock,
  Unlock,
  Target,
  Award,
  FileCheck,
  Wallet,
  TrendingUp,
  ClipboardCheck,
  CreditCard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';

interface NavItem {
  title: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeVariant?: 'default' | 'success' | 'warning';
  children?: NavItem[];
}

interface NavSection {
  title: string;
  description?: string;
  items: NavItem[];
}

// Logical procurement lifecycle navigation
const navigationSections: NavSection[] = [
  {
    title: 'Overview',
    items: [
      {
        title: 'Dashboard',
        href: '/',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: 'Planning',
    description: 'Procurement planning & budgeting',
    items: [
      {
        title: 'Annual Plans',
        href: '/planning/annual-plans',
        icon: Calendar,
      },
      {
        title: 'New Plan',
        href: '/planning/new',
        icon: ClipboardList,
      },
      {
        title: 'Consolidation',
        href: '/planning/consolidation',
        icon: Package,
      },
      {
        title: 'Procurement Calendar',
        href: '/planning/calendar',
        icon: Calendar,
      },
    ],
  },
  {
    title: 'Sourcing',
    description: 'Tenders & bidding',
    items: [
      {
        title: 'Tenders',
        icon: Gavel,
        badge: '5',
        children: [
          { title: 'All Tenders', href: '/tenders', icon: FileText },
          { title: 'Create Tender', href: '/tenders/new', icon: ClipboardList },
          { title: 'Quotations', href: '/tenders/quotations', icon: FileSearch },
          { title: 'Clarifications', href: '/tenders/clarifications', icon: HelpCircle },
        ],
      },
      {
        title: 'Notices & Documents',
        icon: FileText,
        children: [
          { title: 'All Notices', href: '/notices', icon: FileText },
          { title: 'Templates', href: '/notices/templates', icon: BookOpen },
          { title: 'Document Library', href: '/notices/documents', icon: FileSearch },
        ],
      },
      {
        title: 'Bid Submissions',
        href: '/bids',
        icon: FileCheck,
        badge: '3',
        badgeVariant: 'warning',
      },
      {
        title: 'Bidder Portal',
        href: '/tenders/bidder-portal',
        icon: Lock,
        badge: 'New',
        badgeVariant: 'success',
      },
      {
        title: 'Bid Opening',
        href: '/bids/opening',
        icon: Unlock,
      },
    ],
  },
  {
    title: 'Evaluation',
    description: 'Assessment & awards',
    items: [
      {
        title: 'Evaluations',
        href: '/evaluations',
        icon: ClipboardCheck,
      },
      {
        title: 'COI Declarations',
        href: '/evaluations/coi',
        icon: ShieldCheck,
      },
      {
        title: 'Awards',
        href: '/awards',
        icon: Award,
      },
    ],
  },
  {
    title: 'Contracts',
    description: 'Contract management',
    items: [
      {
        title: 'All Contracts',
        href: '/contracts',
        icon: FileText,
        badge: '3',
      },
      {
        title: 'Active Contracts',
        href: '/contracts/active',
        icon: Target,
      },
      {
        title: 'Milestones',
        href: '/contracts/milestones',
        icon: Calendar,
      },
      {
        title: 'Variations',
        href: '/contracts/variations',
        icon: Package,
      },
      {
        title: 'Contract Templates',
        href: '/contracts/templates',
        icon: BookOpen,
      },
      {
        title: 'eSignature',
        href: '/contracts/esignature',
        icon: Lock,
      },
    ],
  },
  {
    title: 'Marketplace',
    description: 'Catalogue purchasing',
    items: [
      {
        title: 'Browse Catalogue',
        href: '/marketplace/catalogue',
        icon: Store,
      },
      {
        title: 'Purchase Orders',
        href: '/marketplace/orders',
        icon: Truck,
      },
      {
        title: 'Framework Agreements',
        href: '/marketplace/frameworks',
        icon: FileText,
      },
      {
        title: 'Supplier Ratings',
        href: '/marketplace/ratings',
        icon: TrendingUp,
      },
    ],
  },
  {
    title: 'Auctions',
    description: 'Dynamic pricing',
    items: [
      {
        title: 'Active Auctions',
        href: '/auctions',
        icon: Hammer,
      },
      {
        title: 'Reverse Auctions',
        href: '/auctions/reverse',
        icon: Gavel,
      },
      {
        title: 'Asset Disposal',
        href: '/auctions/disposal',
        icon: Package,
      },
    ],
  },
  {
    title: 'Suppliers',
    description: 'Supplier management',
    items: [
      {
        title: 'Supplier Registry',
        href: '/suppliers',
        icon: Users,
      },
      {
        title: 'Registration',
        href: '/suppliers/register',
        icon: ClipboardList,
      },
      {
        title: 'My Subscription',
        href: '/suppliers/subscription',
        icon: CreditCard,
        badge: 'Active',
        badgeVariant: 'success',
      },
      {
        title: 'Pre-qualification',
        href: '/suppliers/prequalification',
        icon: ShieldCheck,
      },
      {
        title: 'Performance',
        href: '/suppliers/performance',
        icon: BarChart3,
      },
      {
        title: 'Agencies',
        href: '/agencies',
        icon: Building2,
      },
    ],
  },
  {
    title: 'Analytics',
    description: 'Reports & insights',
    items: [
      {
        title: 'Dashboard',
        href: '/reports/dashboard',
        icon: BarChart3,
      },
      {
        title: 'KPI Tracking',
        href: '/reports/kpi',
        icon: Target,
      },
      {
        title: 'Compliance',
        href: '/reports/compliance',
        icon: ShieldCheck,
      },
      {
        title: 'Procurement Reports',
        href: '/reports/procurement',
        icon: FileText,
      },
      {
        title: 'Data Exports',
        href: '/reports/exports',
        icon: Database,
      },
      {
        title: 'BI Connectors',
        href: '/reports/bi',
        icon: PieChart,
      },
      {
        title: 'OCDS Export',
        href: '/reports/ocds',
        icon: Globe,
      },
    ],
  },
  {
    title: 'Communications',
    description: 'Notifications & messages',
    items: [
      {
        title: 'Notifications',
        href: '/communications/notifications',
        icon: Bell,
        badge: '3',
        badgeVariant: 'warning',
      },
      {
        title: 'Messages',
        href: '/communications/messages',
        icon: MessageSquare,
      },
      {
        title: 'Announcements',
        href: '/communications/announcements',
        icon: Globe,
      },
    ],
  },
  {
    title: 'Public Portal',
    description: 'Open data access',
    items: [
      {
        title: 'Public Notices',
        href: '/portal/notices',
        icon: Globe,
      },
      {
        title: 'Open Data',
        href: '/portal/open-data',
        icon: Database,
      },
    ],
  },
  {
    title: 'Administration',
    description: 'System management',
    items: [
      {
        title: 'Users',
        href: '/admin/users',
        icon: Users,
      },
      {
        title: 'Organizations',
        href: '/admin/organizations',
        icon: Building2,
      },
      {
        title: 'Roles & Permissions',
        href: '/admin/roles',
        icon: UserCheck,
      },
      {
        title: 'Workflows',
        href: '/admin/workflows',
        icon: ClipboardList,
      },
      {
        title: 'Subscription Payments',
        href: '/admin/subscriptions',
        icon: CreditCard,
        badge: '3',
        badgeVariant: 'warning',
      },
      {
        title: 'AI Governance',
        href: '/admin/ai-governance',
        icon: ShieldCheck,
        badge: 'New',
        badgeVariant: 'success',
      },
      {
        title: 'Integrations',
        href: '/admin/integrations',
        icon: LayoutGrid,
      },
      {
        title: 'Audit Trail',
        href: '/audit',
        icon: History,
      },
      {
        title: 'System Settings',
        href: '/admin/settings',
        icon: Settings,
      },
    ],
  },
];

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ isCollapsed = false }: SidebarProps) {
  const pathname = usePathname();
  const [openSections, setOpenSections] = useState<string[]>(['Tenders']);

  const toggleSection = (title: string) => {
    setOpenSections((prev) =>
      prev.includes(title)
        ? prev.filter((t) => t !== title)
        : [...prev, title]
    );
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const renderNavItem = (item: NavItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openSections.includes(item.title);
    const active = item.href ? isActive(item.href) : false;

    if (hasChildren) {
      return (
        <Collapsible
          key={item.title}
          open={isOpen}
          onOpenChange={() => toggleSection(item.title)}
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                'w-full justify-start gap-3 px-3 py-2 h-auto font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100',
                depth > 0 && 'pl-8'
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!isCollapsed && (
                <>
                  <span className="flex-1 text-left text-sm">{item.title}</span>
                  {item.badge && (
                    <span className={cn(
                      'ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-medium text-white',
                      item.badgeVariant === 'warning' ? 'bg-amber-500' : 'bg-red-600'
                    )}>
                      {item.badge}
                    </span>
                  )}
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4 shrink-0 text-zinc-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 shrink-0 text-zinc-400" />
                  )}
                </>
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-0.5 pt-0.5">
            {item.children?.map((child) => renderNavItem(child, depth + 1))}
          </CollapsibleContent>
        </Collapsible>
      );
    }

    return (
      <Link key={item.title} href={item.href || '#'}>
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start gap-3 px-3 py-2 h-auto font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100',
            depth > 0 && 'pl-10 text-sm',
            active && 'bg-red-50 text-red-700 font-semibold border-l-2 border-red-600'
          )}
        >
          <item.icon className="h-4 w-4 shrink-0" />
          {!isCollapsed && (
            <>
              <span className="flex-1 text-left text-sm">{item.title}</span>
              {item.badge && (
                <span className={cn(
                  'ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-medium text-white',
                  item.badgeVariant === 'warning' ? 'bg-amber-500' : 'bg-red-600'
                )}>
                  {item.badge}
                </span>
              )}
            </>
          )}
        </Button>
      </Link>
    );
  };

  const renderSection = (section: NavSection, index: number) => {
    return (
      <div key={section.title} className="space-y-1">
        {index > 0 && <Separator className="my-3" />}
        {!isCollapsed && (
          <div className="px-3 py-1">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              {section.title}
            </span>
          </div>
        )}
        {section.items.map((item) => renderNavItem(item))}
      </div>
    );
  };

  return (
    <div className={cn(
      'flex h-full flex-col border-r border-zinc-200 bg-white transition-all duration-300',
      isCollapsed ? 'w-16' : 'w-64'
    )}>
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-zinc-200 px-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-red-600 to-amber-600">
            <Gavel className="h-5 w-5 text-white" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold text-zinc-900">PNG eGP</span>
              <span className="text-[10px] text-zinc-500">National Procurement</span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navigationSections.map((section, index) => renderSection(section, index))}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-zinc-200 p-4">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200">
              <HelpCircle className="h-4 w-4 text-zinc-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-zinc-600">Need Help?</p>
              <Link href="/support" className="text-xs text-zinc-400 hover:text-zinc-600">
                Contact NPC Support
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
