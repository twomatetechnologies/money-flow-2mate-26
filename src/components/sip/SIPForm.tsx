import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { SIPInvestment } from '@/types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FamilyMemberSelect from '@/components/common/FamilyMemberSelect';
import { zodResolver } from '@hookform/resolvers/zod';
import * as RZod from 'zod'; // Renamed to avoid conflict
import { Textarea } from '@/components/ui/textarea';

interface SIPFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (sip: Partial<SIPInvestment>) => void;
  initialData?: SIPInvestment;
  mode: 'create' | 'edit';
}

const sipFormSchema = RZod.object({
  name: RZod.string().min(3, { message: "SIP Name must be at least 3 characters." }),
  type: RZod.string().min(1, { message: "SIP Type is required." }), // Using 'type' as it was in type, can be fundType if preferred
  amount: RZod.number().positive({ message: "Amount must be a positive number." }),
  frequency: RZod.string().min(1, { message: "Frequency is required." }),
  startDate: RZod.date({ required_error: "Start date is required." }),
  endDate: RZod.date().optional(),
  duration: RZod.number().int().positive({ message: "Duration must be a positive integer (months)." }).optional(),
  fundType: RZod.string().min(1, {message: "Fund type is required."}),
  currentValue: RZod.number().min(0, { message: "Current value cannot be negative." }).optional(),
  // returns and returnsPercent are calculated, so not typically in form validation unless user input is allowed
  familyMemberId: RZod.string().optional().nullable(),
  notes: RZod.string().optional().nullable(),
  units: RZod.number().min(0).optional(),
  currentNav: RZod.number().min(0).optional(),
}).refine(data => {
    if (data.endDate && data.startDate && data.endDate < data.startDate) {
        return false;
    }
    return true;
}, {
    message: "End date cannot be before start date.",
    path: ["endDate"],
});

const SIPForm = ({ isOpen, onClose, onSubmit, initialData, mode }: SIPFormProps) => {
  const form = useForm<Partial<SIPInvestment>>({
    resolver: zodResolver(sipFormSchema),
    defaultValues: {
      name: '',
      type: 'Mutual Fund', // SIP Type (can be MF, ELSS etc.)
      fundType: 'Equity', // Fund Type (Equity, Debt, Hybrid)
      amount: 0,
      frequency: 'Monthly',
      startDate: new Date(),
      duration: 12, // months
      currentValue: 0,
      familyMemberId: '',
      notes: '',
      units: 0,
      currentNav: 0,
    }
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData && mode === 'edit') {
        form.reset({
          ...initialData,
          startDate: initialData.startDate ? new Date(initialData.startDate) : new Date(),
          endDate: initialData.endDate ? new Date(initialData.endDate) : undefined,
        });
      } else {
        form.reset({
          name: '',
          type: 'Mutual Fund',
          fundType: 'Equity',
          amount: 0,
          frequency: 'Monthly',
          startDate: new Date(),
          endDate: undefined,
          duration: 12,
          currentValue: 0,
          familyMemberId: '',
          notes: '',
          units: 0,
          currentNav: 0,
        });
      }
    }
  }, [initialData, isOpen, mode, form]);

  const handleFormSubmit = (data: Partial<SIPInvestment>) => {
    const amountInvested = Number(data.amount) || 0;
    // If units and NAV are provided, currentValue is units * NAV
    // Otherwise, if only currentValue is provided, use that.
    // If neither, it might default or be calculated based on returns.
    let calculatedCurrentValue = Number(data.currentValue) || 0;
    if (data.units && data.currentNav) {
        calculatedCurrentValue = Number(data.units) * Number(data.currentNav);
    } else if (!data.currentValue && data.amount) { // Basic default if no current value provided
        calculatedCurrentValue = amountInvested; // Default to amount invested if no other info
    }


    // This calculation of returns/returnsPercent might be simplistic if duration is involved.
    // For a simple case:
    const totalInvestedOverTime = data.duration ? amountInvested * data.duration : amountInvested; // simplified
    const returns = calculatedCurrentValue - totalInvestedOverTime; // This is a very rough estimate.
    const returnsPercent = totalInvestedOverTime > 0 ? (returns / totalInvestedOverTime) * 100 : 0;

    const formattedData: Partial<SIPInvestment> = {
      ...data,
      amount: Number(data.amount),
      startDate: data.startDate ? new Date(data.startDate).toISOString() : new Date().toISOString(),
      endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined,
      duration: data.duration ? Number(data.duration) : undefined,
      currentValue: calculatedCurrentValue,
      returns: isNaN(returns) ? 0 : parseFloat(returns.toFixed(2)),
      returnsPercent: isNaN(returnsPercent) ? 0 : parseFloat(returnsPercent.toFixed(2)),
      units: data.units ? Number(data.units) : undefined,
      currentNav: data.currentNav ? Number(data.currentNav) : undefined,
    };
    
    onSubmit(formattedData);
    // form.reset(); // Keep form open for review or if submission fails
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(openState) => !openState && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Add New SIP' : 'Edit SIP'}</DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Add a new SIP investment to your portfolio.' 
              : 'Update the details of your SIP investment.'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SIP Name/Fund Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., HDFC Top 100 Fund" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type" // This is for broad category like MF, ELSS
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SIP Category</FormLabel>
                    <Select 
                      value={field.value} 
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select SIP category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Mutual Fund">Mutual Fund</SelectItem>
                        <SelectItem value="ELSS">ELSS (Tax Saver)</SelectItem>
                        <SelectItem value="Index Fund">Index Fund</SelectItem>
                        <SelectItem value="ETF">ETF (Exchange Traded Fund)</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fundType" // This is for asset class like Equity, Debt
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fund Type / Asset Class</FormLabel>
                    <Select 
                      value={field.value} 
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select fund type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Equity">Equity</SelectItem>
                        <SelectItem value="Debt">Debt</SelectItem>
                        <SelectItem value="Hybrid">Hybrid</SelectItem>
                        <SelectItem value="Gold">Gold</SelectItem>
                        <SelectItem value="International">International</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Installment Amount (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequency</FormLabel>
                    <Select 
                      value={field.value} 
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Monthly">Monthly</SelectItem>
                        <SelectItem value="Quarterly">Quarterly</SelectItem>
                        <SelectItem value="Half-Yearly">Half-Yearly</SelectItem>
                        <SelectItem value="Yearly">Yearly</SelectItem>
                        <SelectItem value="One-Time">One-Time (Lumpsum)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                        <Input 
                        type="date" 
                        {...field} 
                        value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''} 
                        onChange={e => field.onChange(new Date(e.target.value))} 
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                 <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>End Date (Optional)</FormLabel>
                        <FormControl>
                            <Input 
                            type="date" 
                            {...field} 
                            value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : (field.value === null || field.value === undefined ? '' : String(field.value))}
                            onChange={e => field.onChange(e.target.value ? new Date(e.target.value) : null)} 
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                 />
            </div>
            
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (months, optional if end date provided)</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="units"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Units Held (Optional)</FormLabel>
                    <FormControl>
                        <Input type="number" min="0" step="any" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="currentNav"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Current NAV (₹, Optional)</FormLabel>
                    <FormControl>
                        <Input type="number" min="0" step="any" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <FormField
              control={form.control}
              name="currentValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Value (₹, Optional - calculated if units & NAV provided)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="familyMemberId"
              render={({ field }) => (
                <FormItem>
                   <FamilyMemberSelect
                    value={field.value || ''}
                    onChange={field.onChange}
                    label="Belongs to (Family Member)"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any specific details about this SIP..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit">{mode === 'create' ? 'Add SIP' : 'Update SIP'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default SIPForm;
