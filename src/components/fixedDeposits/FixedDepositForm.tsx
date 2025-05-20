
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FixedDeposit } from '@/types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import FamilyMemberSelect from '@/components/common/FamilyMemberSelect';

interface FixedDepositFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (fd: Partial<FixedDeposit>) => void;
  initialData?: FixedDeposit;
  mode: 'create' | 'edit';
}

const FixedDepositForm = ({ isOpen, onClose, onSubmit, initialData, mode }: FixedDepositFormProps) => {
  const form = useForm<Partial<FixedDeposit>>({
    defaultValues: initialData || {
      bankName: '',
      accountNumber: '',
      principal: 0,
      interestRate: 0,
      startDate: new Date(),
      maturityDate: new Date(),
      maturityAmount: 0,
      isAutoRenew: false,
      notes: '',
      familyMemberId: 'self-default' // Default to self
    }
  });

  // Reset form with initialData when it changes or mode changes
  useEffect(() => {
    if (initialData && mode === 'edit') {
      form.reset(initialData);
    } else if (mode === 'create') {
      form.reset({
        bankName: '',
        accountNumber: '',
        principal: 0,
        interestRate: 0,
        startDate: new Date(),
        maturityDate: new Date(),
        maturityAmount: 0,
        isAutoRenew: false,
        notes: '',
        familyMemberId: 'self-default' // Default to self
      });
    }
  }, [initialData, mode, form]);

  // Calculate maturity amount when principal, interest rate, or dates change
  useEffect(() => {
    const calculateMaturityAmount = () => {
      const principal = Number(form.getValues('principal')) || 0;
      const interestRate = Number(form.getValues('interestRate')) || 0;
      const startDate = new Date(form.getValues('startDate') || new Date());
      const maturityDate = new Date(form.getValues('maturityDate') || new Date());
      
      // Calculate time difference in years
      const timeDiffMs = maturityDate.getTime() - startDate.getTime();
      if (timeDiffMs <= 0) return; // Invalid date range
      
      const timeDiffYears = timeDiffMs / (1000 * 3600 * 24 * 365);
      
      // Simple interest calculation
      const maturityAmount = principal + (principal * interestRate * timeDiffYears) / 100;
      
      // Only update if the value is a valid number
      if (!isNaN(maturityAmount) && isFinite(maturityAmount)) {
        form.setValue('maturityAmount', maturityAmount);
      }
    };
    
    // Watch for changes to relevant fields
    const subscription = form.watch((value, { name }) => {
      if (name === 'principal' || name === 'interestRate' || name === 'startDate' || name === 'maturityDate') {
        calculateMaturityAmount();
      }
    });
    
    // Initial calculation
    calculateMaturityAmount();
    
    // Cleanup subscription
    return () => subscription.unsubscribe();
  }, [form]);

  const handleSubmit = (data: Partial<FixedDeposit>) => {
    // Calculate maturity amount if not provided or invalid
    const principal = Number(data.principal) || 0;
    const interestRate = Number(data.interestRate) || 0;
    const startDate = new Date(data.startDate || new Date());
    const maturityDate = new Date(data.maturityDate || new Date());
    
    // Calculate time difference in years
    const timeDiff = Math.max(0, (maturityDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24 * 365));
    
    // Simple interest calculation
    const maturityAmount = principal + (principal * interestRate * timeDiff) / 100;
    
    // Update form with calculated maturity amount before submission
    form.setValue('maturityAmount', maturityAmount);

    const formattedData = {
      ...data,
      principal,
      interestRate,
      startDate,
      maturityDate,
      maturityAmount: isNaN(maturityAmount) ? 0 : maturityAmount // Ensure we never pass NaN
    };

    onSubmit(formattedData);
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Add New Fixed Deposit' : 'Edit Fixed Deposit'}</DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Add a new fixed deposit to your portfolio.' 
              : 'Update the details of your fixed deposit.'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="bankName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Name</FormLabel>
                  <FormControl>
                    <Input placeholder="HDFC Bank" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="accountNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account/FD Number</FormLabel>
                  <FormControl>
                    <Input placeholder="XXXX1234" {...field} />
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
                    <Input type="number" min="0" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="interestRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Interest Rate (%)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="0.01" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''} onChange={e => field.onChange(new Date(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="maturityDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maturity Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''} onChange={e => field.onChange(new Date(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="isAutoRenew"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Auto Renewal</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            {/* Add the Family Member Select component */}
            <FormField
              control={form.control}
              name="familyMemberId"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <FamilyMemberSelect
                      value={field.value}
                      onChange={field.onChange}
                      label="Owner"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Input placeholder="Additional Notes" {...field} />
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
