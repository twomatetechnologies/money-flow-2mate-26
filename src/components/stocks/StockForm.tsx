
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { StockHolding } from '@/types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface StockFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (stock: Partial<StockHolding>) => void;
  initialData?: StockHolding;
  mode: 'create' | 'edit';
}

const StockForm = ({ isOpen, onClose, onSubmit, initialData, mode }: StockFormProps) => {
  const form = useForm<Partial<StockHolding>>({
    defaultValues: initialData || {
      symbol: '',
      name: '',
      quantity: 0,
      averageBuyPrice: 0,
      currentPrice: 0,
      sector: ''
    }
  });

  // Reset form with initialData values when they change or mode changes
  useEffect(() => {
    if (initialData && mode === 'edit') {
      form.reset(initialData);
    } else if (mode === 'create') {
      form.reset({
        symbol: '',
        name: '',
        quantity: 0,
        averageBuyPrice: 0,
        currentPrice: 0,
        sector: ''
      });
    }
  }, [initialData, mode, form]);

  const handleSubmit = (data: Partial<StockHolding>) => {
    // Calculate derived values
    const quantity = Number(data.quantity);
    const averageBuyPrice = Number(data.averageBuyPrice);
    const currentPrice = Number(data.currentPrice);
    const value = quantity * currentPrice;
    const change = currentPrice - averageBuyPrice;
    const changePercent = (change / averageBuyPrice) * 100;

    const formattedData = {
      ...data,
      quantity,
      averageBuyPrice,
      currentPrice,
      value,
      change,
      changePercent
    };

    onSubmit(formattedData);
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Add New Stock' : 'Edit Stock'}</DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Add a new stock to your portfolio.' 
              : 'Update the details of your stock.'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="symbol"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Symbol</FormLabel>
                  <FormControl>
                    <Input placeholder="AAPL" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Apple Inc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="averageBuyPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Average Buy Price (₹)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="0.01" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="currentPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Price (₹)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="0.01" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="sector"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sector</FormLabel>
                  <FormControl>
                    <Input placeholder="Technology" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit">{mode === 'create' ? 'Add Stock' : 'Update Stock'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default StockForm;
