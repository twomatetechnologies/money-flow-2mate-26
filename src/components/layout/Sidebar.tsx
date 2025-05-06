
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BarChart2, Settings, Users, Shield, FileText, Gem, PiggyBank, TrendingUp, Lock, Calendar, BrainCircuit, Zap } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const Sidebar: React.FC<{ collapsed: boolean, onNavItemClick?: () => void }> = ({ collapsed, onNavItemClick }) => {
  const location = useLocation();
  const { user, isDevelopmentMode } = useAuth();

  const navItems: NavItem[] = [
    { path: '/', label: 'Dashboard', icon: <Home className="h-4 w-4" /> },
    { path: '/stocks', label: 'Stocks', icon: <TrendingUp className="h-4 w-4" /> },
    { path: '/fixed-deposits', label: 'Fixed Deposits', icon: <PiggyBank className="h-4 w-4" /> },
    { path: '/savings-accounts', label: 'Savings Accounts', icon: <Calendar className="h-4 w-4" /> },
    { path: '/sip-investments', label: 'SIP Investments', icon: <BarChart2 className="h-4 w-4" /> },
    { path: '/provident-fund', label: 'Provident Fund', icon: <Lock className="h-4 w-4" /> },
    { path: '/insurance', label: 'Insurance', icon: <Shield className="h-4 w-4" /> },
    { path: '/gold', label: 'Gold', icon: <Gem className="h-4 w-4" /> },
    { path: '/goals', label: 'Goals', icon: <BrainCircuit className="h-4 w-4" /> },
    { path: '/reports', label: 'Reports', icon: <FileText className="h-4 w-4" /> },
  ];

  const adminNavItems: NavItem[] = [
    { path: '/audit-trail', label: 'Audit Trail', icon: <FileText className="h-4 w-4" /> },
    { path: '/family-members', label: 'Family Members', icon: <Users className="h-4 w-4" /> },
  ];

  // Add AI Settings to the nav items
  const settingsNavItems: NavItem[] = [
    { path: '/settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
    { path: '/ai-settings', label: 'AI Settings', icon: <Zap className="h-4 w-4" /> },
  ];

  return (
    <div className={cn(
      "flex flex-col h-full bg-gray-50 border-r border-gray-200 dark:bg-gray-900 dark:border-gray-800",
      collapsed ? "w-16" : "w-56"
    )}>
      <div className="p-4">
        <Link to="/" className="flex items-center justify-center">
          <img src="/logo.png" alt="Logo" className={cn(
            "h-8 transition-all duration-300 ease-in-out",
            collapsed ? "w-8" : "w-auto"
          )} />
          {!collapsed && <span className="ml-2 text-lg font-bold dark:text-white">Money Flow Guardian</span>}
        </Link>
      </div>

      <Separator className="my-2 dark:bg-gray-800" />

      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => (
          <Button
            key={item.path}
            asChild
            variant="ghost"
            className={cn(
              "w-full justify-start font-normal",
              location.pathname === item.path ? "bg-gray-200 dark:bg-gray-700 text-primary" : "hover:bg-gray-100 dark:hover:bg-gray-800",
              collapsed ? "px-2 py-1.5" : "px-3 py-2"
            )}
          >
            <Link to={item.path} onClick={onNavItemClick}>
              <div className="flex items-center">
                {item.icon}
                {!collapsed && <span className="ml-2">{item.label}</span>}
              </div>
            </Link>
          </Button>
        ))}
      </nav>

      {/* Use isDevelopmentMode from AuthContext instead of user.isAdmin */}
      {isDevelopmentMode && (
        <>
          <Separator className="my-2 dark:bg-gray-800" />
          <nav className="flex-1 px-2 py-4 space-y-1">
            {adminNavItems.map((item) => (
              <Button
                key={item.path}
                asChild
                variant="ghost"
                className={cn(
                  "w-full justify-start font-normal",
                  location.pathname === item.path ? "bg-gray-200 dark:bg-gray-700 text-primary" : "hover:bg-gray-100 dark:hover:bg-gray-800",
                  collapsed ? "px-2 py-1.5" : "px-3 py-2"
                )}
              >
                <Link to={item.path} onClick={onNavItemClick}>
                  <div className="flex items-center">
                    {item.icon}
                    {!collapsed && <span className="ml-2">{item.label}</span>}
                  </div>
                </Link>
              </Button>
            ))}
          </nav>
        </>
      )}

      <Separator className="my-2 dark:bg-gray-800" />

      <nav className="px-2 py-4 space-y-1">
        {settingsNavItems.map((item) => (
          <Button
            key={item.path}
            asChild
            variant="ghost"
            className={cn(
              "w-full justify-start font-normal",
              location.pathname === item.path ? "bg-gray-200 dark:bg-gray-700 text-primary" : "hover:bg-gray-100 dark:hover:bg-gray-800",
              collapsed ? "px-2 py-1.5" : "px-3 py-2"
            )}
          >
            <Link to={item.path} onClick={onNavItemClick}>
              <div className="flex items-center">
                {item.icon}
                {!collapsed && <span className="ml-2">{item.label}</span>}
              </div>
            </Link>
          </Button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
