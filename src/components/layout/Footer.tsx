
import React from 'react';
import { APP_VERSION } from '@/constants/version';
import { cn } from '@/lib/utils';
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CHANGELOG } from '@/constants/version';

export function Footer({ className }: { className?: string }) {
  return (
    <footer className={cn(
      "border-t py-3 px-6 flex justify-between items-center text-sm text-muted-foreground bg-background/80 backdrop-blur-sm",
      className
    )}>
      <div>
        <span>Money Flow Guardian</span>
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
