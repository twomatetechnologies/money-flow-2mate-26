
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  BarChart,
  Coins,
  Heart,
  Home,
  Package,
  ScrollText,
  Settings,
  Shield,
  TrendingUp,
  Users
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export const Sidebar = () => {
  const { isDevelopmentMode } = useAuth();
  
  return (
    <aside className="hidden md:flex h-screen sticky top-0 w-56 flex-col border-r bg-background">
      <div className="px-3 py-2 h-16 flex items-center border-b">
        <h2 className="text-lg font-semibold">Money Flow Guardian</h2>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          <NavLink
            to="/"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                isActive ? "bg-muted text-primary" : "text-muted-foreground hover:bg-muted hover:text-primary"
              )
            }
          >
            <Home className="h-4 w-4" />
            <span>Dashboard</span>
          </NavLink>
          <NavLink
            to="/stocks"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                isActive
                  ? "bg-muted text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-primary"
              )
            }
          >
            <TrendingUp className="h-4 w-4" />
            <span>Stocks</span>
          </NavLink>
          <NavLink
            to="/fixed-deposits"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                isActive
                  ? "bg-muted text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-primary"
              )
            }
          >
            <Package className="h-4 w-4" />
            <span>Fixed Deposits</span>
          </NavLink>
          <NavLink
            to="/sip-investments"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                isActive
                  ? "bg-muted text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-primary"
              )
            }
          >
            <BarChart className="h-4 w-4" />
            <span>SIP Investments</span>
          </NavLink>
          <NavLink
            to="/insurance"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                isActive
                  ? "bg-muted text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-primary"
              )
            }
          >
            <Shield className="h-4 w-4" />
            <span>Insurance</span>
          </NavLink>
          <NavLink
            to="/gold"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                isActive
                  ? "bg-muted text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-primary"
              )
            }
          >
            <Coins className="h-4 w-4" />
            <span>Gold</span>
          </NavLink>
          <NavLink
            to="/family-members"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                isActive
                  ? "bg-muted text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-primary"
              )
            }
          >
            <Users className="h-4 w-4" />
            <span>Family Members</span>
          </NavLink>
          <NavLink
            to="/reports"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                isActive
                  ? "bg-muted text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-primary"
              )
            }
          >
            <ScrollText className="h-4 w-4" />
            <span>Reports</span>
          </NavLink>
        </nav>
      </div>
      <div className="border-t p-4">
        <nav className="grid gap-1">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                isActive
                  ? "bg-muted text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-primary"
              )
            }
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </NavLink>
          {isDevelopmentMode && (
            <NavLink
              to="/audit-trail"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                  isActive
                    ? "bg-muted text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-primary"
                )
              }
            >
              <ScrollText className="h-4 w-4" />
              <span>Audit Trail</span>
            </NavLink>
          )}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
