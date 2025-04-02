
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { SIPInvestment } from '@/types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SIPFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (sip: Partial<SIPInvestment>) => void;
  initialData?: SIPInvestment;
  mode: 'create' | 'edit';
}

const SIPForm = ({ isOpen, onClose, onSubmit, initialData, mode }: SIPFormProps) => {
  const form = useForm<Partial<SIPInvestment>>({
    defaultValues: initialData || {
      name: '',
      type: 'Mutual Fund',
      amount: 0,
      frequency: 'Monthly',
      startDate: new Date(),
      duration: 12,
      currentValue: 0,
      returns: 0,
      returnsPercent: 0
    }
  });

  // Reset form with initialData when it changes or mode changes
  useEffect(() => {
    if (initialData && mode === 'edit') {
      form.reset(initialData);
    } else if (mode === 'create') {
      form.reset({
        name: '',
        type: 'Mutual Fund',
        amount: 0,
        frequency: 'Monthly',
        startDate: new Date(),
        duration: 12,
        currentValue: 0,
        returns: 0,
        returnsPercent: 0
      });
    }
  }, [initialData, mode, form]);

  const handleSubmit = (data: Partial<SIPInvestment>) => {
    // Calculate some values if not provided
    const amount = Number(data.amount);
    const currentValue = data.currentValue ? Number(data.currentValue) : amount * 1.05; // Default 5% returns
    const returns = currentValue - amount;
    const returnsPercent = (returns / amount) * 100;

    const formattedData = {
      ...data,
      amount,
      currentValue,
      returns,
      returnsPercent
    };

    onSubmit(formattedData);
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Add New SIP' : 'Edit SIP'}</DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Add a new SIP investment to your portfolio.' 
              : 'Update the details of your SIP investment.'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SIP Name/Fund</FormLabel>
                  <FormControl>
                    <Input placeholder="HDFC Top 100 Fund" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SIP Type</FormLabel>
                  <Select 
                    defaultValue={field.value} 
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select investment type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Mutual Fund">Mutual Fund</SelectItem>
                      <SelectItem value="ELSS">ELSS</SelectItem>
                      <SelectItem value="Index Fund">Index Fund</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Amount (₹)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" {...field} onChange={e => field.onChange(Number(e.target.value))} />
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
                    defaultValue={field.value} 
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
                      <SelectItem value="Yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
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
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (months)</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="currentValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Value (₹)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" {...field} onChange={e => field.onChange(Number(e.target.value))} />
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
