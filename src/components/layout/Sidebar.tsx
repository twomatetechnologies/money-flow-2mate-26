
import React from 'react';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { 
  Home, 
  TrendingUp, 
  Landmark, 
  PiggyBank, 
  Shield, 
  GalleryThumbnails,
  FileBarChart, 
  History,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarLinkProps {
  href: string;
  icon: React.ElementType;
  children: React.ReactNode;
}

const SidebarLink = ({ href, icon: Icon, children }: SidebarLinkProps) => {
  const location = useLocation();
  const isActive = location.pathname === href;

  return (
    <Link
      to={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-base transition-all hover:text-primary",
        isActive ? "bg-accent text-primary" : "text-muted-foreground"
      )}
    >
      <Icon className="h-5 w-5" />
      <span>{children}</span>
    </Link>
  );
};

export const Sidebar = () => {
  return (
    <div className="hidden border-r bg-card md:block md:w-64 p-6">
      <div className="flex flex-col gap-1">
        <h2 className="mb-6 px-4 text-lg font-semibold">Finance Tracker</h2>
        <nav className="space-y-1">
          <SidebarLink href="/" icon={Home}>Dashboard</SidebarLink>
          <SidebarLink href="/stocks" icon={TrendingUp}>Stocks</SidebarLink>
          <SidebarLink href="/fixed-deposits" icon={Landmark}>Fixed Deposits</SidebarLink>
          <SidebarLink href="/sip" icon={PiggyBank}>SIP Investments</SidebarLink>
          <SidebarLink href="/insurance" icon={Shield}>Insurance</SidebarLink>
          <SidebarLink href="/gold" icon={GalleryThumbnails}>Gold</SidebarLink>
          <SidebarLink href="/reports" icon={FileBarChart}>Reports</SidebarLink>
          <SidebarLink href="/audit" icon={History}>Audit Trail</SidebarLink>
          <SidebarLink href="/settings" icon={Settings}>Settings</SidebarLink>
        </nav>
      </div>
    </div>
  );
};

export const SidebarSettings = () => {
  const location = useLocation();
  const isActive = location.pathname === '/settings';

  return (
    <Link 
      to="/settings"
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-base transition-all hover:text-primary",
        isActive ? "bg-accent text-primary" : "text-muted-foreground"
      )}
    >
      <Settings className="h-5 w-5" />
      <span>Settings</span>
    </Link>
  );
};
