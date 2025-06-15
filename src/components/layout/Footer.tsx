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

export function Footer({ className }: { className?: string }) {
  const { settings } = useSettings();
  const appName = settings.appName || "Money Flow Guardian";
  const [storageInfo, setStorageInfo] = useState<{
    type: string;
    usage: string;
  }>({
    type: 'PostgreSQL',
    usage: 'Database storage'
  });
  
  return (
    <footer className={cn("border-t py-2 px-4 flex justify-between items-center text-xs text-muted-foreground", className)}>
      <div className="flex items-center gap-2">
        <span>{appName}</span>
        <span className="text-muted-foreground">v{APP_VERSION}</span>
        <Dialog>
          <DialogTrigger asChild>
            <button className="inline-flex items-center justify-center w-5 h-5 rounded-full hover:bg-accent hover:text-accent-foreground">
              <Info className="w-3 h-3" />
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Version History</DialogTitle>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto">
              <div className="space-y-4">
                {CHANGELOG.map((entry, index) => (
                  <div key={index} className="border-b pb-2 last:border-0">
                    <h4 className="font-semibold">v{entry.version} - {entry.date}</h4>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      {entry.changes.map((change, i) => (
                        <li key={i} className="text-xs">{change}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1">
              <Database className="w-3 h-3" />
              <span>{storageInfo.type}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{storageInfo.usage}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </footer>
  );
}

export default Footer;
