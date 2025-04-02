
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  ChevronLeft, ChevronRight, Home, PieChart, Banknote, 
  GanttChart, FileText, Award, ScrollText
} from 'lucide-react';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
}

const NavItem = ({ to, icon, label, collapsed }: NavItemProps) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all",
        collapsed ? "justify-center" : "",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
      )
    }
  >
    <span className="h-5 w-5">{icon}</span>
    {!collapsed && <span>{label}</span>}
  </NavLink>
);

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={cn(
        "flex h-screen flex-col border-r bg-sidebar transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-14 items-center border-b px-3">
        {!collapsed && (
          <h2 className="text-lg font-semibold text-sidebar-foreground">
            Money Flow Guardian
          </h2>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto flex h-8 w-8 items-center justify-center rounded-md hover:bg-sidebar-accent text-sidebar-foreground"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          <NavItem to="/" icon={<Home size={18} />} label="Dashboard" collapsed={collapsed} />
          <NavItem to="/stocks" icon={<GanttChart size={18} />} label="Stocks" collapsed={collapsed} />
          <NavItem to="/fixed-deposits" icon={<Banknote size={18} />} label="Fixed Deposits" collapsed={collapsed} />
          <NavItem to="/sip" icon={<PieChart size={18} />} label="SIP" collapsed={collapsed} />
          <NavItem to="/insurance" icon={<FileText size={18} />} label="Insurance" collapsed={collapsed} />
          <NavItem to="/gold" icon={<Award size={18} />} label="Gold" collapsed={collapsed} />
          <NavItem to="/reports" icon={<ScrollText size={18} />} label="Reports" collapsed={collapsed} />
        </nav>
      </div>
      <div className="border-t p-3">
        {!collapsed && (
          <p className="text-xs text-sidebar-foreground/70">
            © 2024 Money Flow Guardian
          </p>
        )}
      </div>
    </div>
  );
}
