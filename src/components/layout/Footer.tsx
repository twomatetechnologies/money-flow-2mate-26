
import React, { useState, useEffect } from 'react';
import { APP_VERSION } from '@/constants/version';
import { cn } from '@/lib/utils';
import { Info, Database } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CHANGELOG } from '@/constants/version';
import { useSettings } from '@/contexts/SettingsContext';
import { isPostgresEnabled } from '@/services/db/dbConnector';

export function Footer({ className }: { className?: string }) {
  const { settings } = useSettings();
  const appName = settings.appName || "Money Flow Guardian";
  const [storageInfo, setStorageInfo] = useState<{
    type: string;
    usage: string;
  }>({
    type: 'Loading...',
    usage: '0 KB',
  });
  
  useEffect(() => {
    // Calculate storage usage
    const calculateStorage = () => {
      if (isPostgresEnabled()) {
        setStorageInfo({
          type: 'PostgreSQL',
          usage: 'Database storage'
        });
      } else {
        // Calculate localStorage usage in KB
        let total = 0;
        for (const key in localStorage) {
          if (localStorage.hasOwnProperty(key)) {
            total += localStorage.getItem(key)?.length || 0;
          }
        }
        const usageInKB = Math.round(total / 1024);
        setStorageInfo({
          type: 'Local Storage',
          usage: `${usageInKB} KB used`
        });
      }
    };
    
    calculateStorage();
    // Recalculate when window gets focus, in case data changed
    window.addEventListener('focus', calculateStorage);
    
    return () => {
      window.removeEventListener('focus', calculateStorage);
    };
  }, []);
  
  return (
    <footer className={cn(
      "border-t py-3 px-6 flex justify-between items-center text-sm text-muted-foreground bg-background/80 backdrop-blur-sm",
      className
    )}>
      <div>
        <span>{appName}</span>
        <span className="mx-2">•</span>
        <span>© 2025</span>
      </div>
      
      <div className="flex items-center space-x-4">
        <Dialog>
          <DialogTrigger asChild>
            <button className="flex items-center hover:text-primary transition-colors">
              <Info className="h-3.5 w-3.5 mr-1" />
              <span>Changelog</span>
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Changelog</DialogTitle>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-auto pr-2">
              {CHANGELOG.map((release) => (
                <div key={release.version} className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold">Version {release.version}</h3>
                    <span className="text-sm text-muted-foreground">{release.date}</span>
                  </div>
                  <ul className="space-y-1 list-disc ml-5">
                    {release.changes.map((change, i) => (
                      <li key={i} className="text-sm">{change}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        <div className="flex items-center">
          <Database className="h-3.5 w-3.5 mr-1" />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>{storageInfo.type}</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{storageInfo.usage}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">v{APP_VERSION}</span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Application Version</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </footer>
  );
}

export default Footer;
