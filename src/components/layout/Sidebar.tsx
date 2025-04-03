import React from 'react';
import { useLocation } from 'react-router-dom';
import { Settings as SettingsIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export const SidebarSettings = () => {
  const location = useLocation();
  const isActive = location.pathname === '/settings';

  return (
    <a 
      href="/settings"
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-base transition-all hover:text-primary",
        isActive ? "bg-accent text-primary" : "text-muted-foreground"
      )}
    >
      <SettingsIcon className="h-5 w-5" />
      <span>Settings</span>
    </a>
  );
};
