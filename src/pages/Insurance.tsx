
import React, { useEffect, useState } from 'react';
import { getInsurancePolicies } from '@/services/mockData';
import { InsurancePolicy } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { format, differenceInMonths } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';

const Insurance = () => {
  const [insurancePolicies, setInsurancePolicies] = useState<InsurancePolicy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsurancePolicies = async () => {
      try {
        const data = await getInsurancePolicies();
        setInsurancePolicies(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching insurance policies:', error);
        setLoading(false);
      }
    };

    fetchInsurancePolicies();
  }, []);

  const totalCoverAmount = insurancePolicies.reduce((sum, policy) => sum + policy.coverAmount, 0);
  const totalAnnualPremium = insurancePolicies.reduce((sum, policy) => {
    switch (policy.frequency) {
      case 'Monthly': return sum + (policy.premium * 12);
      case 'Quarterly': return sum + (policy.premium * 4);
      case 'Half-Yearly': return sum + (policy.premium * 2);
      case 'Yearly': return sum + policy.premium;
      default: return sum;
    }
  }, 0);

  const getInsuranceTypeColor = (type: string) => {
    switch (type) {
      case 'Life':
      case 'Term':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
      case 'Health':
        return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
      case 'Vehicle':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100';
      case 'Home':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-lg">Loading insurance policies data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Insurance Policies</h1>
        <p className="text-muted-foreground">
          Manage and track your insurance policies
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="finance-card">
          <CardHeader className="pb-2">
            <CardTitle>Total Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="stat-value">₹{totalCoverAmount.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="finance-card">
          <CardHeader className="pb-2">
            <CardTitle>Annual Premium</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="stat-value">₹{totalAnnualPremium.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="finance-card">
        <CardHeader>
          <CardTitle>Your Insurance Policies</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>All your insurance policies in one place</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Policy Number</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead className="text-right">Coverage</TableHead>
                <TableHead className="text-right">Premium</TableHead>
                <TableHead className="text-right">Frequency</TableHead>
                <TableHead className="text-right">Valid Until</TableHead>
                <TableHead className="text-right">Documents</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {insurancePolicies.map((policy) => (
                <TableRow key={policy.id}>
                  <TableCell className="font-medium">{policy.policyNumber}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getInsuranceTypeColor(policy.type)}>
                      {policy.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{policy.provider}</TableCell>
                  <TableCell className="text-right">₹{policy.coverAmount.toLocaleString()}</TableCell>
                  <TableCell className="text-right">₹{policy.premium.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{policy.frequency}</TableCell>
                  <TableCell className="text-right">{format(new Date(policy.endDate), 'dd MMM yyyy')}</TableCell>
                  <TableCell className="text-right">
                    <button className="p-1 rounded-md hover:bg-muted">
                      <FileText className="h-4 w-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Insurance;
