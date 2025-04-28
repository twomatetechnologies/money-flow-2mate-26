
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import FamilyMemberSelect from '@/components/common/FamilyMemberSelect';
import { ProvidentFund } from '@/types';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';

interface ProvidentFundFormProps {
  providentFund?: ProvidentFund;
  onSubmit: (data: ProvidentFundFormData) => void;
  onCancel: () => void;
}

export type ProvidentFundFormData = Omit<ProvidentFund, 'id' | 'lastUpdated'>;

const formSchema = z.object({
  employerName: z.string().min(1, { message: 'Employer name is required' }),
  accountNumber: z.string().min(1, { message: 'Account number is required' }),
  employeeContribution: z.coerce.number().min(0, { message: 'Employee contribution must be a positive number' }),
  employerContribution: z.coerce.number().min(0, { message: 'Employer contribution must be a positive number' }),
  totalBalance: z.coerce.number().min(0, { message: 'Total balance must be a positive number' }),
  interestRate: z.coerce.number().min(0, { message: 'Interest rate must be a positive number' }),
  startDate: z.date({ required_error: 'Start date is required' }),
  monthlyContribution: z.coerce.number().min(0, { message: 'Monthly contribution must be a positive number' }),
  notes: z.string().optional(),
  familyMemberId: z.string().optional(),
});

export default function ProvidentFundForm({ providentFund, onSubmit, onCancel }: ProvidentFundFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: providentFund
      ? {
          ...providentFund,
          startDate: new Date(providentFund.startDate),
        }
      : {
          employerName: '',
          accountNumber: '',
          employeeContribution: 0,
          employerContribution: 0,
          totalBalance: 0,
          interestRate: 8.15, // Default EPF interest rate
          startDate: new Date(),
          monthlyContribution: 0,
          notes: '',
        },
  });

  const handleAutoCalculate = () => {
    const employeeContribution = form.getValues('employeeContribution');
    const employerContribution = form.getValues('employerContribution');
    
    form.setValue('totalBalance', employeeContribution + employerContribution);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="employerName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Employer Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter employer name" {...field} />
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
              <FormLabel>PF Account Number</FormLabel>
              <FormControl>
                <Input placeholder="Enter PF account number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="employeeContribution"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Contribution</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" {...field} onChange={(e) => {
                    field.onChange(e);
                    form.trigger('employeeContribution');
                  }} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="employerContribution"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Employer Contribution</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" {...field} onChange={(e) => {
                    field.onChange(e);
                    form.trigger('employerContribution');
                  }} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex items-center">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleAutoCalculate}
          >
            Auto Calculate Total
          </Button>
        </div>

        <FormField
          control={form.control}
          name="totalBalance"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total Balance</FormLabel>
              <FormControl>
                <Input type="number" placeholder="0" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="interestRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Interest Rate (%)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="8.15" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="monthlyContribution"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monthly Contribution</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Start Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
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
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
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
                <Textarea placeholder="Add any additional information here..." {...field} />
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
              <FormLabel>Family Member</FormLabel>
              <FormControl>
                <FamilyMemberSelect
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormDescription>Associate this PF account with a family member</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {providentFund ? 'Update' : 'Create'} Provident Fund
          </Button>
        </div>
      </form>
    </Form>
  );
}
