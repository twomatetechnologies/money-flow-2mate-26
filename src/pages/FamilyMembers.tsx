
import React, { useEffect, useState } from 'react';
import { getFamilyMembers, createFamilyMember, updateFamilyMember, deleteFamilyMember } from '@/services/familyService';
import { FamilyMember } from '@/types';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, User, Users } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import FamilyMemberForm from '@/components/family/FamilyMemberForm';

const FamilyMembers = () => {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [currentMember, setCurrentMember] = useState<FamilyMember | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchFamilyMembers();
  }, []);

  const fetchFamilyMembers = async () => {
    try {
      const data = await getFamilyMembers();
      setFamilyMembers(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching family members:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch family members',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  const handleAddMember = async (data: Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newMember = await createFamilyMember(data);
      setFamilyMembers([...familyMembers, newMember]);
      toast({
        title: 'Success',
        description: 'Family member added successfully',
      });
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error adding family member:', error);
      toast({
        title: 'Error',
        description: 'Failed to add family member',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateMember = async (data: Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!currentMember) return;
    
    try {
      const updatedMember = await updateFamilyMember(currentMember.id, data);
      if (updatedMember) {
        setFamilyMembers(
          familyMembers.map((member) => member.id === currentMember.id ? updatedMember : member)
        );
        toast({
          title: 'Success',
          description: 'Family member updated successfully',
        });
      }
      setIsDialogOpen(false);
      setCurrentMember(null);
    } catch (error) {
      console.error('Error updating family member:', error);
      toast({
        title: 'Error',
        description: 'Failed to update family member',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteMember = async () => {
    if (!currentMember) return;
    
    try {
      const success = await deleteFamilyMember(currentMember.id);
      if (success) {
        setFamilyMembers(
          familyMembers.filter((member) => member.id !== currentMember.id)
        );
        toast({
          title: 'Success',
          description: 'Family member deleted successfully',
        });
      }
      setIsAlertOpen(false);
      setCurrentMember(null);
    } catch (error) {
      console.error('Error deleting family member:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete family member',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (member: FamilyMember) => {
    setCurrentMember(member);
    setIsDialogOpen(true);
  };

  const openDeleteAlert = (member: FamilyMember) => {
    setCurrentMember(member);
    setIsAlertOpen(true);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-lg">Loading family members data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Family Members</h1>
          <p className="text-muted-foreground">
            Manage your family members for wealth distribution tracking
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              Add Family Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-background">
            <DialogHeader>
              <DialogTitle>{currentMember ? 'Edit' : 'Add'} Family Member</DialogTitle>
            </DialogHeader>
            <FamilyMemberForm 
              onSubmit={currentMember ? handleUpdateMember : handleAddMember}
              onCancel={() => {
                setIsDialogOpen(false);
                setCurrentMember(null);
              }}
              initialData={currentMember || undefined}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="finance-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Your Family Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>All your family members for wealth distribution tracking</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Relationship</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Added On</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {familyMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium flex items-center">
                    <div 
                      className="w-4 h-4 rounded-full mr-2" 
                      style={{ backgroundColor: member.color }}
                    />
                    {member.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" style={{ 
                      backgroundColor: `${member.color}20`, 
                      color: member.color, 
                      borderColor: member.color 
                    }}>
                      {member.relationship}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={member.isActive ? "default" : "secondary"}>
                      {member.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(member.createdAt), 'dd MMM yyyy')}</TableCell>
                  <TableCell>{member.notes || '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(member)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => openDeleteAlert(member)}
                        disabled={member.id.includes('default')} // Prevent deletion of default members
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent className="bg-background">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Family Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this family member? This action cannot be undone.
              Any assets associated with this family member will remain but will no longer be associated with any family member.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMember}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FamilyMembers;
