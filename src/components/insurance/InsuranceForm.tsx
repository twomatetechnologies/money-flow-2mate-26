
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { InsurancePolicy } from '@/types';
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
import FamilyMemberSelect from '@/components/common/FamilyMemberSelect';
import PolicyDocumentUpload from './PolicyDocumentUpload';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  type: z.enum(['Life', 'Health', 'Vehicle', 'Home', 'Term', 'Other']),
  policyNumber: z.string().min(1, { message: 'Policy number is required' }),
  provider: z.string().min(1, { message: 'Provider is required' }),
  coverAmount: z.coerce.number().positive({ message: 'Cover amount must be positive' }),
  premium: z.coerce.number().positive({ message: 'Premium must be positive' }),
  frequency: z.enum(['Monthly', 'Quarterly', 'Half-Yearly', 'Yearly']),
  startDate: z.date(),
  endDate: z.date(),
  notes: z.string().optional(),
  familyMemberId: z.string().optional(),
});

type InsuranceFormProps = {
  onSubmit: (data: Omit<InsurancePolicy, 'id'>) => void;
  onCancel: () => void;
  initialData?: Partial<InsurancePolicy>;
};

const InsuranceForm = ({ onSubmit, onCancel, initialData }: InsuranceFormProps) => {
  const { toast } = useToast();
  const [documents, setDocuments] = React.useState<string[]>(initialData?.documents || []);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: (initialData?.type as any) || 'Life',
      policyNumber: initialData?.policyNumber || '',
      provider: initialData?.provider || '',
      coverAmount: initialData?.coverAmount || 0,
      premium: initialData?.premium || 0,
      frequency: (initialData?.frequency as any) || 'Yearly',
      startDate: initialData?.startDate ? new Date(initialData.startDate) : new Date(),
      endDate: initialData?.endDate ? new Date(initialData.endDate) : new Date(),
      notes: initialData?.notes || '',
      familyMemberId: initialData?.familyMemberId || undefined,
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    try {
      // Include documents in the submission
      onSubmit({
        ...values,
        documents,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save insurance policy',
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Policy Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select policy type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-popover">
                    <SelectItem value="Life">Life</SelectItem>
                    <SelectItem value="Health">Health</SelectItem>
                    <SelectItem value="Vehicle">Vehicle</SelectItem>
                    <SelectItem value="Home">Home</SelectItem>
                    <SelectItem value="Term">Term</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="policyNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Policy Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter policy number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="provider"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Insurance Provider</FormLabel>
                <FormControl>
                  <Input placeholder="Enter provider name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="coverAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Coverage Amount (₹)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="premium"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Premium (₹)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
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
                <FormLabel>Payment Frequency</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment frequency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-popover">
                    <SelectItem value="Monthly">Monthly</SelectItem>
                    <SelectItem value="Quarterly">Quarterly</SelectItem>
                    <SelectItem value="Half-Yearly">Half-Yearly</SelectItem>
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
              <FormItem className="flex flex-col">
                <FormLabel>Start Date</FormLabel>
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
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>End Date</FormLabel>
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
                        date < new Date("1900-01-01")
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
            name="familyMemberId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Policy Owner</FormLabel>
                <FormControl>
                  <FamilyMemberSelect
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes</FormLabel>
              <FormControl>
                <Input placeholder="Any additional information..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator className="my-4" />
        
        <div>
          <FormLabel>Policy Documents</FormLabel>
          <div className="mt-2">
            <PolicyDocumentUpload 
              documents={documents}
              onDocumentsChange={setDocuments}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {initialData?.id ? 'Update Policy' : 'Add Policy'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default InsuranceForm;
