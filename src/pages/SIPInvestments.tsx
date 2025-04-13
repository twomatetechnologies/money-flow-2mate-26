import React, { useEffect, useState } from 'react';
import { getSIPInvestments, createSIP, updateSIP, deleteSIP } from '@/services/crudService';
import { SIPInvestment } from '@/types';
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
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import SIPForm from '@/components/sip/SIPForm';
import { useToast } from '@/components/ui/use-toast';
import AuditTrail from '@/components/common/AuditTrail';
import { getAuditRecordsByType } from '@/services/auditService';
import { Badge } from '@/components/ui/badge';
import FamilyMemberDisplay from '@/components/common/FamilyMemberDisplay';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";

const SIPInvestments = () => {
  const [sipInvestments, setSipInvestments] = useState<SIPInvestment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedSIP, setSelectedSIP] = useState<SIPInvestment | undefined>(undefined);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [sipToDelete, setSipToDelete] = useState<string | null>(null);
  const [auditRecords, setAuditRecords] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchSIPInvestments();
    fetchAuditRecords();
  }, []);

  const fetchSIPInvestments = async () => {
    try {
      const data = await getSIPInvestments();
      setSipInvestments(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching SIP investments:', error);
      setLoading(false);
    }
  };

  const fetchAuditRecords = () => {
    try {
      const records = getAuditRecordsByType('sip');
      setAuditRecords(records);
    } catch (error) {
      console.error('Error fetching audit records:', error);
    }
  };

  const handleCreateSIP = (sipData: Partial<SIPInvestment>) => {
    try {
      const newSIP = createSIP(sipData);
      setSipInvestments([...sipInvestments, newSIP]);
      fetchAuditRecords();
      toast({
        title: "SIP Created",
        description: "Your SIP investment has been successfully added.",
      });
    } catch (error) {
      console.error('Error creating SIP investment:', error);
      toast({
        title: "Error",
        description: "Failed to create SIP investment.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateSIP = (sipData: Partial<SIPInvestment>) => {
    if (selectedSIP) {
      try {
        const updatedSIP = updateSIP(selectedSIP.id, sipData);
        if (updatedSIP) {
          setSipInvestments(sipInvestments.map(sip => sip.id === updatedSIP.id ? updatedSIP : sip));
          fetchAuditRecords();
          toast({
            title: "SIP Updated",
            description: "Your SIP investment has been successfully updated.",
          });
        }
      } catch (error) {
        console.error('Error updating SIP investment:', error);
        toast({
          title: "Error",
          description: "Failed to update SIP investment.",
          variant: "destructive",
        });
      }
    }
  };

  const handleDeleteSIP = () => {
    if (sipToDelete) {
      try {
        const success = deleteSIP(sipToDelete);
        if (success) {
          setSipInvestments(sipInvestments.filter(sip => sip.id !== sipToDelete));
          fetchAuditRecords();
          toast({
            title: "SIP Deleted",
            description: "Your SIP investment has been successfully deleted.",
          });
        }
      } catch (error) {
        console.error('Error deleting SIP investment:', error);
        toast({
          title: "Error",
          description: "Failed to delete SIP investment.",
          variant: "destructive",
        });
      }
      setSipToDelete(null);
    }
    setIsConfirmOpen(false);
  };

  const openCreateForm = () => {
    setFormMode('create');
    setSelectedSIP(undefined);
    setIsFormOpen(true);
  };

  const openEditForm = (sip: SIPInvestment) => {
    setFormMode('edit');
    setSelectedSIP(sip);
    setIsFormOpen(true);
  };

  const confirmDelete = (id: string) => {
    setSipToDelete(id);
    setIsConfirmOpen(true);
  };

  const handleFormSubmit = (sip: Partial<SIPInvestment>) => {
    if (formMode === 'create') {
      handleCreateSIP(sip);
    } else {
      handleUpdateSIP(sip);
    }
  };

  // Calculate summary data
  const totalInvestedAmount = sipInvestments.reduce((sum, sip) => sum + sip.amount, 0);
  const totalCurrentValue = sipInvestments.reduce((sum, sip) => sum + sip.currentValue, 0);
  const totalReturns = totalCurrentValue - totalInvestedAmount;
  const avgReturnsPercent = sipInvestments.length > 0 
    ? sipInvestments.reduce((sum, sip) => sum + sip.returnsPercent, 0) / sipInvestments.length
    : 0;

  // Helper function to get type color
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Mutual Fund':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
      case 'ELSS':
        return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
      case 'Index Fund':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-lg">Loading SIP investments data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SIP Investments</h1>
          <p className="text-muted-foreground">
            Track your Systematic Investment Plans
          </p>
        </div>
        <Button onClick={openCreateForm} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add SIP
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="finance-card">
          <CardHeader className="pb-2">
            <CardTitle>Invested Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="stat-value">₹{totalInvestedAmount.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="finance-card">
          <CardHeader className="pb-2">
            <CardTitle>Current Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="stat-value">₹{totalCurrentValue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="finance-card">
          <CardHeader className="pb-2">
            <CardTitle>Total Returns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`stat-value ${totalReturns >= 0 ? 'trend-up' : 'trend-down'}`}>
              {totalReturns >= 0 ? '+' : ''}₹{totalReturns.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card className="finance-card">
          <CardHeader className="pb-2">
            <CardTitle>Avg. Returns %</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`stat-value ${avgReturnsPercent >= 0 ? 'trend-up' : 'trend-down'}`}>
              {avgReturnsPercent >= 0 ? '+' : ''}{avgReturnsPercent.toFixed(2)}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="finance-card">
        <CardHeader>
          <CardTitle>Your SIP Investments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>Your SIP investments across different funds</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Fund Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Frequency</TableHead>
                <TableHead className="text-right">Start Date</TableHead>
                <TableHead className="text-right">Duration</TableHead>
                <TableHead className="text-right">Current Value</TableHead>
                <TableHead className="text-right">Returns %</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sipInvestments.map((sip) => (
                <TableRow key={sip.id}>
                  <TableCell className="font-medium">{sip.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getTypeColor(sip.type)}>
                      {sip.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">₹{sip.amount.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{sip.frequency}</TableCell>
                  <TableCell className="text-right">{format(new Date(sip.startDate), 'dd MMM yyyy')}</TableCell>
                  <TableCell className="text-right">{sip.duration} months</TableCell>
                  <TableCell className="text-right">₹{sip.currentValue.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <span className={sip.returnsPercent >= 0 ? 'trend-up' : 'trend-down'}>
                      {sip.returnsPercent >= 0 ? '+' : ''}{sip.returnsPercent.toFixed(2)}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <FamilyMemberDisplay memberId={sip.familyMemberId} />
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => openEditForm(sip)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => confirmDelete(sip.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Audit Trail */}
      <AuditTrail records={auditRecords} entityType="SIP Investment" />

      {/* Forms */}
      <SIPForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedSIP}
        mode={formMode}
      />

      {/* Confirmation Dialog */}
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected SIP investment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSIP}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SIPInvestments;
