
import React, { useState, useEffect, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, ArrowUpDown, MoreHorizontal } from 'lucide-react';
import { getSIPInvestments, addSIPInvestment, updateSIPInvestment, deleteSIPInvestment } from '@/services/sipService';
import { SIPInvestment } from '@/types';
import SIPForm from '@/components/sip/SIPForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import FamilyMemberDisplay from '@/components/common/FamilyMemberDisplay';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from '@/components/ui/input';


type SortField = keyof SIPInvestment | '';
type SortDirection = 'asc' | 'desc';

const SIPInvestments = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [sips, setSips] = useState<SIPInvestment[]>([]);
  const [editingSIP, setEditingSIP] = useState<SIPInvestment | undefined>();
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('startDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');


  useEffect(() => {
    loadSIPs();
  }, []);

  const loadSIPs = async () => {
    try {
      const data = await getSIPInvestments();
      setSips(data);
    } catch (error) {
      console.error('Error loading SIPs:', error);
      toast({
        title: 'Error Loading SIPs',
        description: 'Failed to load SIP investments. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleAdd = () => {
    setFormMode('create');
    setEditingSIP(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (sip: SIPInvestment) => {
    setFormMode('edit');
    setEditingSIP(sip);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this SIP investment?')) return;
    try {
      await deleteSIPInvestment(id);
      setSips(prevSips => prevSips.filter(sip => sip.id !== id));
      toast({
        title: 'SIP Deleted',
        description: 'SIP investment deleted successfully.',
      });
    } catch (error) {
      console.error('Error deleting SIP:', error);
      toast({
        title: 'Error Deleting SIP',
        description: 'Failed to delete SIP investment. It might be in use or a server error occurred.',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (data: Partial<SIPInvestment>) => {
    try {
      if (formMode === 'create') {
        const newSIP = await addSIPInvestment(data);
        setSips(prev => [newSIP, ...prev]); // Add to top for visibility
        toast({
          title: 'SIP Added',
          description: 'New SIP investment added successfully.',
        });
      } else if (editingSIP && editingSIP.id) {
        const updatedSIP = await updateSIPInvestment(editingSIP.id, data);
        setSips(prev => prev.map(sip => sip.id === editingSIP!.id ? updatedSIP : sip));
        toast({
          title: 'SIP Updated',
          description: 'SIP investment updated successfully.',
        });
      }
      setIsFormOpen(false); // Close form on success
      setEditingSIP(undefined);
    } catch (error: any) {
      console.error('Error saving SIP:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to save SIP investment.';
      toast({
        title: 'Error Saving SIP',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleSort = (field: SortField) => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
  };

  const filteredAndSortedSips = useMemo(() => {
    let filtered = sips.filter(sip => 
        sip.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sip.fundType && sip.fundType.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (sip.type && sip.type.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (sortField) {
      filtered.sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];

        if (valA === undefined || valA === null) return sortDirection === 'asc' ? 1 : -1;
        if (valB === undefined || valB === null) return sortDirection === 'asc' ? -1 : 1;
        
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDirection === 'asc' ? valA - valB : valB - valA;
        }
        if (valA instanceof Date && valB instanceof Date) {
          return sortDirection === 'asc' ? valA.getTime() - valB.getTime() : valB.getTime() - valA.getTime();
        }
        // Default to string comparison
        return sortDirection === 'asc' 
          ? String(valA).localeCompare(String(valB)) 
          : String(valB).localeCompare(String(valA));
      });
    }
    return filtered;
  }, [sips, searchTerm, sortField, sortDirection]);
  
  const renderSortIcon = (field: SortField) => {
    if (sortField === field) {
      return sortDirection === 'asc' ? ' ▲' : ' ▼';
    }
    return <ArrowUpDown className="ml-2 h-4 w-4 inline opacity-50" />;
  };


  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">SIP Investments</CardTitle>
            <CardDescription>Manage your Systematic Investment Plans.</CardDescription>
          </div>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add SIP
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input 
              placeholder="Search SIPs by name, fund type, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {filteredAndSortedSips.length === 0 && !searchTerm && sips.length > 0 && (
             <p className="text-center text-muted-foreground py-4">No SIPs match your search criteria.</p>
          )}
          {sips.length === 0 && (
            <div className="text-center py-10">
                <p className="text-xl text-muted-foreground mb-4">No SIP investments yet.</p>
                <Button onClick={handleAdd}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First SIP
                </Button>
            </div>
          )}

          {filteredAndSortedSips.length > 0 && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead onClick={() => handleSort('name')} className="cursor-pointer">Name {renderSortIcon('name')}</TableHead>
                    <TableHead onClick={() => handleSort('type')} className="cursor-pointer">Category {renderSortIcon('type')}</TableHead>
                    <TableHead onClick={() => handleSort('fundType')} className="cursor-pointer">Fund Type {renderSortIcon('fundType')}</TableHead>
                    <TableHead onClick={() => handleSort('amount')} className="text-right cursor-pointer">Amount (₹) {renderSortIcon('amount')}</TableHead>
                    <TableHead onClick={() => handleSort('frequency')} className="cursor-pointer">Frequency {renderSortIcon('frequency')}</TableHead>
                    <TableHead onClick={() => handleSort('startDate')} className="cursor-pointer">Start Date {renderSortIcon('startDate')}</TableHead>
                    <TableHead onClick={() => handleSort('currentValue')} className="text-right cursor-pointer">Current Value (₹) {renderSortIcon('currentValue')}</TableHead>
                    <TableHead onClick={() => handleSort('returnsPercent')} className="text-right cursor-pointer">Returns (%) {renderSortIcon('returnsPercent')}</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedSips.map(sip => (
                    <TableRow key={sip.id}>
                      <TableCell className="font-medium">{sip.name}</TableCell>
                      <TableCell>{sip.type}</TableCell>
                      <TableCell>{sip.fundType}</TableCell>
                      <TableCell className="text-right">{(sip.amount ?? 0).toLocaleString()}</TableCell>
                      <TableCell>{sip.frequency}</TableCell>
                      <TableCell>{sip.startDate ? format(new Date(sip.startDate), 'dd MMM yyyy') : 'N/A'}</TableCell>
                      <TableCell className="text-right">{(sip.currentValue ?? 0).toLocaleString()}</TableCell>
                      <TableCell className={`text-right font-medium ${Number(sip.returnsPercent) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {(Number(sip.returnsPercent) ?? 0).toFixed(2)}%
                      </TableCell>
                      <TableCell><FamilyMemberDisplay memberId={sip.familyMemberId} /></TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(sip)}>
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(sip.id)} className="text-red-600 focus:text-red-700 focus:bg-red-50">
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        {filteredAndSortedSips.length > 0 && (
             <CardFooter className="text-sm text-muted-foreground">
                Showing {filteredAndSortedSips.length} of {sips.length} SIP investments.
            </CardFooter>
        )}
      </Card>

      <SIPForm
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingSIP(undefined); }}
        onSubmit={handleSubmit}
        initialData={editingSIP}
        mode={formMode}
      />
    </div>
  );
};

export default SIPInvestments;

