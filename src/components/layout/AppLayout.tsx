
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { UserMenu } from './UserMenu';
import { ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <div className={cn(
        "hidden md:flex transition-all duration-300 ease-in-out", 
        sidebarCollapsed ? "w-16" : "w-56"
      )}>
        <Sidebar collapsed={sidebarCollapsed} />
      </div>

      {/* Mobile Sidebar Overlay */}
      <div className={cn(
        "fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity",
        mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )} onClick={() => setMobileMenuOpen(false)} />

      {/* Mobile Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 z-50 h-screen w-64 bg-background shadow-lg transition-transform md:hidden",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Money Flow Guardian</h2>
        </div>
        <Sidebar collapsed={false} onNavItemClick={() => setMobileMenuOpen(false)} />
      </div>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="flex justify-between items-center p-4 border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center">
            {/* Mobile menu button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden mr-2"
              onClick={toggleMobileMenu}
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Sidebar collapse button - desktop only */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="hidden md:flex"
              onClick={toggleSidebar}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </Button>
          </div>
          <UserMenu />
        </header>
        <div className="p-6 overflow-auto h-full animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AppLayout;
