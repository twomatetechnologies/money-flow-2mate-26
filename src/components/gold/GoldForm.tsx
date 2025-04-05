
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { GoldInvestment } from '@/types';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  type: z.enum(['Physical', 'Digital', 'ETF', 'SGB']),
  quantity: z.coerce.number().positive({ message: 'Quantity must be positive' }),
  purchaseDate: z.date(),
  purchasePrice: z.coerce.number().positive({ message: 'Purchase price must be positive' }),
  currentPrice: z.coerce.number().positive({ message: 'Current price must be positive' }),
  location: z.string().optional(),
  notes: z.string().optional(),
});

type GoldFormProps = {
  onSubmit: (data: z.infer<typeof formSchema>) => void;
  onCancel: () => void;
  initialData?: Partial<GoldInvestment>;
};

const GoldForm = ({ onSubmit, onCancel, initialData }: GoldFormProps) => {
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: (initialData?.type as any) || 'Physical',
      quantity: initialData?.quantity || 0,
      purchaseDate: initialData?.purchaseDate ? new Date(initialData.purchaseDate) : new Date(),
      purchasePrice: initialData?.purchasePrice || 0,
      currentPrice: initialData?.currentPrice || 0,
      location: initialData?.location || '',
      notes: initialData?.notes || '',
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    try {
      const calculatedValue = values.quantity * values.currentPrice;
      onSubmit({
        ...values,
        value: calculatedValue, // Calculate the value
      } as any);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save gold investment',
        variant: 'destructive',
      });
    }
  };

  const goldType = form.watch('type');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type of Gold</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gold type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-popover">
                    <SelectItem value="Physical">Physical Gold</SelectItem>
                    <SelectItem value="Digital">Digital Gold</SelectItem>
                    <SelectItem value="ETF">Gold ETF</SelectItem>
                    <SelectItem value="SGB">Sovereign Gold Bond</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Quantity ({goldType === 'ETF' || goldType === 'SGB' ? 'units' : 'grams'})
                </FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="purchaseDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Purchase Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-popover" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="purchasePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purchase Price (₹ per {goldType === 'ETF' || goldType === 'SGB' ? 'unit' : 'gram'})</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
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
                <FormLabel>Current Price (₹ per {goldType === 'ETF' || goldType === 'SGB' ? 'unit' : 'gram'})</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {(goldType === 'Physical') && (
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Storage Location</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g., Home safe, Bank locker" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Input placeholder="Any additional information..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {initialData?.id ? 'Update Investment' : 'Add Investment'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default GoldForm;
