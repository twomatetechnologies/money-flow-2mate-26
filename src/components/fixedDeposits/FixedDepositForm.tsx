
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FixedDeposit } from '@/types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import FamilyMemberSelect from '@/components/common/FamilyMemberSelect';
import { zodResolver } from '@hookform/resolvers/zod';
import * as RZod from 'zod';
import { Textarea } from '@/components/ui/textarea'; // Added missing import

interface FixedDepositFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (fd: Partial<FixedDeposit>) => void;
  initialData?: FixedDeposit;
  mode: 'create' | 'edit';
}

const formSchema = RZod.object({
  bank_name: RZod.string().min(2, { message: "Bank name must be at least 2 characters." }),
  account_number: RZod.string().optional(),
  principal: RZod.number().positive({ message: "Principal amount must be positive." }),
  interest_rate: RZod.number().positive({ message: "Interest rate must be positive." }),
  start_date: RZod.date({ required_error: "Start date is required." }),
  maturity_date: RZod.date({ required_error: "Maturity date is required." }),
  maturity_amount: RZod.number().positive({ message: "Maturity amount must be positive." }).optional(),
  is_auto_renewal: RZod.boolean().default(false),
  notes: RZod.string().optional(),
  family_member_id: RZod.string().optional(),
  fd_number: RZod.string().optional(),
}).refine(data => data.maturity_date > data.start_date, {
  message: "Maturity date must be after start date.",
  path: ["maturity_date"],
});

const FixedDepositForm = ({ isOpen, onClose, onSubmit, initialData, mode }: FixedDepositFormProps) => {
  const form = useForm<Partial<FixedDeposit>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
        ...initialData,
        start_date: initialData.start_date ? new Date(initialData.start_date) : undefined,
        maturity_date: initialData.maturity_date ? new Date(initialData.maturity_date) : undefined,
      } : {
      bank_name: '',
      account_number: '',
      principal: 0,
      interest_rate: 0,
      start_date: new Date(),
      maturity_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // Default to 1 year maturity
      maturity_amount: 0,
      is_auto_renewal: false,
      notes: '',
      family_member_id: '',
      fd_number: '',
    }
  });

  useEffect(() => {
    if (isOpen) {
      const resetData = initialData ? {
        ...initialData,
        start_date: initialData.start_date ? new Date(initialData.start_date) : new Date(),
        maturity_date: initialData.maturity_date ? new Date(initialData.maturity_date) : new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      } : {
        bank_name: '',
        account_number: '',
        principal: 0,
        interest_rate: 0,
        start_date: new Date(),
        maturity_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        maturity_amount: 0,
        is_auto_renewal: false,
        notes: '',
        family_member_id: '',
        fd_number: '',
      };
      form.reset(resetData as any); // Use 'as any' if type issues persist with react-hook-form reset and complex types
    }
  }, [initialData, isOpen, mode, form]);

  const handleFormSubmit = (data: Partial<FixedDeposit>) => {
    const principal = Number(data.principal);
    const interestRate = Number(data.interest_rate) / 100; // Convert to decimal for calculation
    
    let termMonths = 0;
    if (data.start_date && data.maturity_date) {
        const startDate = new Date(data.start_date);
        const maturityDate = new Date(data.maturity_date);
        termMonths = (maturityDate.getFullYear() - startDate.getFullYear()) * 12 + (maturityDate.getMonth() - startDate.getMonth());
    }

    const calculatedMaturityAmount = data.maturity_amount && data.maturity_amount > 0 
        ? Number(data.maturity_amount) 
        : principal * Math.pow((1 + interestRate / 12), termMonths); // Approximate monthly compounding

    const submissionData: Partial<FixedDeposit> = {
      ...data,
      principal: principal,
      amount: principal, // Assuming 'amount' field in type is the principal
      interest_rate: Number(data.interest_rate), // Store as percentage
      term_months: termMonths > 0 ? termMonths : undefined,
      maturity_amount: parseFloat(calculatedMaturityAmount.toFixed(2)),
      start_date: data.start_date ? new Date(data.start_date).toISOString() : undefined,
      maturity_date: data.maturity_date ? new Date(data.maturity_date).toISOString() : undefined,
    };
    onSubmit(submissionData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Add New Fixed Deposit' : 'Edit Fixed Deposit'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
            <FormField
              control={form.control}
              name="bank_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., HDFC Bank" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="account_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Number (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="FD Account Number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="fd_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>FD Number / Reference (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="FD Certificate Number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="principal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Principal Amount (₹)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="interest_rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Interest Rate (%)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="0" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="start_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                     <Input 
                        type="date" 
                        {...field} 
                        value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                        onChange={e => field.onChange(new Date(e.target.value))}
                      />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="maturity_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Maturity Date</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      {...field}
                      value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                      onChange={e => field.onChange(new Date(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="maturity_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maturity Amount (₹) (Optional - will be calculated if empty)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="is_auto_renewal"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Auto Renewal</FormLabel>
                     <FormDescription>
                        Will this FD auto-renew upon maturity?
                     </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value as boolean | undefined}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="family_member_id"
              render={({ field }) => (
                <FormItem>
                  <FamilyMemberSelect
                    value={field.value}
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
                    <Textarea placeholder="Any additional notes..." {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit">{mode === 'create' ? 'Add Fixed Deposit' : 'Update Fixed Deposit'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default FixedDepositForm;

