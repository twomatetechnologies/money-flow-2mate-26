import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { getSIPInvestments, addSIPInvestment, updateSIPInvestment, deleteSIPInvestment } from '@/services/sipService';
import { SIPInvestment } from '@/types';
import SIPForm from '@/components/sip/SIPForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import FamilyMemberDisplay from '@/components/common/FamilyMemberDisplay';

const SIPInvestments = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [sips, setSips] = useState<SIPInvestment[]>([]);
  const [editingSIP, setEditingSIP] = useState<SIPInvestment | undefined>();
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const { toast } = useToast();

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
        title: 'Error',
        description: 'Failed to load SIP investments',
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
    try {
      await deleteSIPInvestment(id);
      setSips(prevSips => prevSips.filter(sip => sip.id !== id));
      toast({
        title: 'Success',
        description: 'SIP investment deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting SIP:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete SIP investment',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (data: Partial<SIPInvestment>) => {
    try {
      if (formMode === 'create') {
        const newSIP = await addSIPInvestment(data);
        setSips(prev => [...prev, newSIP]);
        toast({
          title: 'Success',
          description: 'SIP investment added successfully',
        });
      } else {
        const updatedSIP = await updateSIPInvestment(editingSIP!.id, data);
        setSips(prev => prev.map(sip => sip.id === editingSIP!.id ? updatedSIP : sip));
        toast({
          title: 'Success',
          description: 'SIP investment updated successfully',
        });
      }
    } catch (error) {
      console.error('Error saving SIP:', error);
      toast({
        title: 'Error',
        description: 'Failed to save SIP investment',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">SIP Investments</h1>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add SIP Investment
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sips.map(sip => (
          <Card key={sip.id} className="relative">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{sip.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span>{sip.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span>₹{(sip.amount ?? 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Frequency:</span>
                  <span>{sip.frequency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Value:</span>
                  <span>₹{(sip.currentValue ?? 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Returns:</span>
                  <span className={sip.returns >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {sip.returns >= 0 ? '+' : ''}{(sip.returnsPercent ?? 0).toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Owner:</span>
                  <FamilyMemberDisplay memberId={sip.familyMemberId} />
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(sip)}>
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(sip.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <SIPForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingSIP}
        mode={formMode}
      />
    </div>
  );
};

export default SIPInvestments;
