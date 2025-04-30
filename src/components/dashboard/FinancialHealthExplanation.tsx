
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { InfoIcon, TrendingUp } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const FinancialHealthExplanation = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-6 gap-1">
          <InfoIcon className="h-3.5 w-3.5" />
          <span className="text-xs">How is this calculated?</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Financial Health Score Calculation
          </DialogTitle>
          <DialogDescription>
            Understanding how your financial health score is determined
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 my-2 text-sm">
          <p>
            Your Financial Health Score is calculated based on a comprehensive evaluation 
            of your overall financial position across multiple dimensions. The score ranges 
            from 0 to 100, with higher scores indicating stronger financial health.
          </p>
          
          <Separator />
          
          <div>
            <h3 className="font-semibold mb-2">Score Components and Weights</h3>
            <ul className="list-disc pl-5 space-y-3">
              <li>
                <span className="font-medium">Emergency Fund Ratio (20%)</span>
                <p className="text-muted-foreground">
                  Measures if you have adequate emergency savings (typically 3-6 months of expenses).
                  A full score is given when your emergency fund covers 6+ months of expenses.
                </p>
              </li>
              
              <li>
                <span className="font-medium">Debt Management (25%)</span>
                <p className="text-muted-foreground">
                  Evaluates your debt-to-income ratio and debt management practices.
                  Lower debt-to-income ratios (under 36%) and on-time payments receive higher scores.
                </p>
              </li>
              
              <li>
                <span className="font-medium">Investment Diversification (15%)</span>
                <p className="text-muted-foreground">
                  Assesses the diversity of your investment portfolio across different asset classes.
                  Well-diversified portfolios with appropriate risk balance score higher.
                </p>
              </li>
              
              <li>
                <span className="font-medium">Insurance Coverage (15%)</span>
                <p className="text-muted-foreground">
                  Evaluates if you have adequate insurance coverage across health, life, and property.
                  Full coverage in all essential areas receives maximum points.
                </p>
              </li>
              
              <li>
                <span className="font-medium">Retirement Readiness (15%)</span>
                <p className="text-muted-foreground">
                  Measures your progress toward retirement goals based on age and income.
                  Higher scores for those on track to meet retirement targets.
                </p>
              </li>
              
              <li>
                <span className="font-medium">Goal Progress (10%)</span>
                <p className="text-muted-foreground">
                  Evaluates your progress toward defined financial goals.
                  Higher scores for consistent progress on high-priority goals.
                </p>
              </li>
            </ul>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="font-semibold mb-2">Score Interpretation</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li><span className="font-medium">90-100:</span> Excellent financial health</li>
              <li><span className="font-medium">80-89:</span> Very good financial position</li>
              <li><span className="font-medium">70-79:</span> Good financial foundation</li>
              <li><span className="font-medium">60-69:</span> Adequate financial health with room for improvement</li>
              <li><span className="font-medium">Below 60:</span> Financial health needs attention</li>
            </ul>
          </div>
          
          <Separator />
          
          <p className="text-muted-foreground">
            Your score is recalculated whenever there are significant changes to your financial data
            or at least once per month. Recommendations are provided based on your current score
            and areas that need improvement.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FinancialHealthExplanation;
