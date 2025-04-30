
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  BarChart,
  Coins,
  Heart,
  Home,
  Package,
  PiggyBank,
  ScrollText,
  Settings,
  Shield,
  TrendingUp,
  Users,
  Wallet,
  Award,
  Layers
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarProps {
  collapsed?: boolean;
  onNavItemClick?: () => void;
}

const Sidebar = ({ collapsed = false, onNavItemClick }: SidebarProps) => {
  const { isDevelopmentMode } = useAuth();
  
  const handleNavClick = () => {
    if (onNavItemClick) {
      onNavItemClick();
    }
  };
  
  return (
    <aside className={cn(
      "flex h-screen sticky top-0 flex-col border-r bg-background transition-all duration-300",
      collapsed ? "w-16" : "w-56"
    )}>
      <div className={cn(
        "px-3 py-2 h-16 flex items-center border-b overflow-hidden",
        collapsed ? "justify-center" : ""
      )}>
        {collapsed ? (
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-semibold">
            MF
          </div>
        ) : (
          <h2 className="text-lg font-semibold">Money Flow Guardian</h2>
        )}
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          <NavLink
            to="/"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                isActive ? "bg-muted text-primary" : "text-muted-foreground hover:bg-muted hover:text-primary",
                collapsed && "justify-center px-0"
              )
            }
            onClick={handleNavClick}
          >
            <Home className="h-4 w-4" />
            {!collapsed && <span>Dashboard</span>}
          </NavLink>
          <NavLink
            to="/stocks"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                isActive ? "bg-muted text-primary" : "text-muted-foreground hover:bg-muted hover:text-primary",
                collapsed && "justify-center px-0"
              )
            }
            onClick={handleNavClick}
          >
            <TrendingUp className="h-4 w-4" />
            {!collapsed && <span>Stocks</span>}
          </NavLink>
          <NavLink
            to="/fixed-deposits"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                isActive ? "bg-muted text-primary" : "text-muted-foreground hover:bg-muted hover:text-primary",
                collapsed && "justify-center px-0" 
              )
            }
            onClick={handleNavClick}
          >
            <Package className="h-4 w-4" />
            {!collapsed && <span>Fixed Deposits</span>}
          </NavLink>
          <NavLink
            to="/sip-investments"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                isActive ? "bg-muted text-primary" : "text-muted-foreground hover:bg-muted hover:text-primary",
                collapsed && "justify-center px-0"
              )
            }
            onClick={handleNavClick}
          >
            <BarChart className="h-4 w-4" />
            {!collapsed && <span>SIP Investments</span>}
          </NavLink>
          <NavLink
            to="/provident-fund"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                isActive ? "bg-muted text-primary" : "text-muted-foreground hover:bg-muted hover:text-primary",
                collapsed && "justify-center px-0"
              )
            }
            onClick={handleNavClick}
          >
            <PiggyBank className="h-4 w-4" />
            {!collapsed && <span>Provident Fund</span>}
          </NavLink>
          <NavLink
            to="/insurance"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                isActive ? "bg-muted text-primary" : "text-muted-foreground hover:bg-muted hover:text-primary",
                collapsed && "justify-center px-0"
              )
            }
            onClick={handleNavClick}
          >
            <Shield className="h-4 w-4" />
            {!collapsed && <span>Insurance</span>}
          </NavLink>
          <NavLink
            to="/gold"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                isActive ? "bg-muted text-primary" : "text-muted-foreground hover:bg-muted hover:text-primary",
                collapsed && "justify-center px-0"
              )
            }
            onClick={handleNavClick}
          >
            <Coins className="h-4 w-4" />
            {!collapsed && <span>Gold</span>}
          </NavLink>
          <NavLink
            to="/savings-accounts"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                isActive ? "bg-muted text-primary" : "text-muted-foreground hover:bg-muted hover:text-primary",
                collapsed && "justify-center px-0"
              )
            }
            onClick={handleNavClick}
          >
            <Wallet className="h-4 w-4" />
            {!collapsed && <span>Savings Accounts</span>}
          </NavLink>
          <NavLink
            to="/goals"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                isActive ? "bg-muted text-primary" : "text-muted-foreground hover:bg-muted hover:text-primary",
                collapsed && "justify-center px-0"
              )
            }
            onClick={handleNavClick}
          >
            <Award className="h-4 w-4" />
            {!collapsed && <span>Financial Goals</span>}
          </NavLink>
          <NavLink
            to="/family-members"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                isActive ? "bg-muted text-primary" : "text-muted-foreground hover:bg-muted hover:text-primary",
                collapsed && "justify-center px-0"
              )
            }
            onClick={handleNavClick}
          >
            <Users className="h-4 w-4" />
            {!collapsed && <span>Family Members</span>}
          </NavLink>
          <NavLink
            to="/reports"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                isActive ? "bg-muted text-primary" : "text-muted-foreground hover:bg-muted hover:text-primary",
                collapsed && "justify-center px-0"
              )
            }
            onClick={handleNavClick}
          >
            <ScrollText className="h-4 w-4" />
            {!collapsed && <span>Reports</span>}
          </NavLink>
          <NavLink
            to="/audit-trail"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                isActive ? "bg-muted text-primary" : "text-muted-foreground hover:bg-muted hover:text-primary",
                collapsed && "justify-center px-0"
              )
            }
            onClick={handleNavClick}
          >
            <Layers className="h-4 w-4" />
            {!collapsed && <span>Audit Logs</span>}
          </NavLink>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
