
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { User, Users, X } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { getActiveFamilyMembers } from '@/services/familyService';
import { FamilyMember } from '@/types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface FamilyMemberFilterProps {
  selectedMemberId: string | null;
  onSelect: (memberId: string | null) => void;
}

const FamilyMemberFilter: React.FC<FamilyMemberFilterProps> = ({
  selectedMemberId,
  onSelect,
}) => {
  const [open, setOpen] = useState(false);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);

  useEffect(() => {
    const fetchFamilyMembers = async () => {
      try {
        const members = await getActiveFamilyMembers();
        setFamilyMembers(members);
        
        if (selectedMemberId) {
          const member = members.find(m => m.id === selectedMemberId);
          if (member) {
            setSelectedMember(member);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching family members:', error);
        setLoading(false);
      }
    };

    fetchFamilyMembers();
  }, [selectedMemberId]);

  const handleSelect = (id: string | null) => {
    onSelect(id);
    
    if (id) {
      const member = familyMembers.find(m => m.id === id);
      if (member) {
        setSelectedMember(member);
      }
    } else {
      setSelectedMember(null);
    }
    
    setOpen(false);
  };

  const clearFilter = () => {
    handleSelect(null);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-1 relative">
          {selectedMember ? (
            <>
              <div 
                className="w-3 h-3 rounded-full mr-1" 
                style={{ backgroundColor: selectedMember.color }}
              />
              {selectedMember.name}
            </>
          ) : (
            <>
              <Users className="h-4 w-4 mr-1" />
              All Members
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60" align="end">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium flex items-center">
            <Users className="h-4 w-4 mr-1" />
            Family Members
          </h4>
          {selectedMember && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={clearFilter}
            >
              <X className="h-3 w-3 mr-1" />
              Clear filter
            </Button>
          )}
        </div>
        
        <Separator className="mb-4" />
        
        {loading ? (
          <div className="py-2 text-center">Loading...</div>
        ) : (
          <RadioGroup 
            value={selectedMemberId || ''} 
            onValueChange={(value) => handleSelect(value || null)}
          >
            <div className="flex items-center space-x-2 mb-3">
              <RadioGroupItem value="" id="all-members" />
              <Label htmlFor="all-members" className="cursor-pointer">All Members</Label>
            </div>
            
            {familyMembers.map((member) => (
              <div key={member.id} className="flex items-center space-x-2 mb-3">
                <RadioGroupItem value={member.id} id={member.id} />
                <Label htmlFor={member.id} className="cursor-pointer flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: member.color }}
                  />
                  {member.name}
                  <Badge variant="outline" className="ml-2" style={{ 
                    backgroundColor: `${member.color}20`, 
                    color: member.color, 
                    borderColor: member.color,
                    fontSize: '0.6rem'
                  }}>
                    {member.relationship}
                  </Badge>
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default FamilyMemberFilter;
