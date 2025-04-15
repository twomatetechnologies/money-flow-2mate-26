
import React, { useEffect, useState } from 'react';
import { getActiveFamilyMembers } from '@/services/familyService';
import { FamilyMember } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';

interface FamilyMemberSelectProps {
  value: string | undefined;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  label?: string;
}

const FamilyMemberSelect: React.FC<FamilyMemberSelectProps> = ({
  value,
  onChange,
  disabled = false,
  required = false,
  label = "Family Member"
}) => {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFamilyMembers = async () => {
      try {
        const members = await getActiveFamilyMembers();
        setFamilyMembers(members);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching family members:', error);
        setLoading(false);
      }
    };

    fetchFamilyMembers();
  }, []);

  // Handle the case of empty value by converting it to "none" internally
  const handleValueChange = (selectedValue: string) => {
    if (selectedValue === "none") {
      onChange("");
    } else {
      onChange(selectedValue);
    }
  };

  // Convert empty string to "none" for the Select component
  const selectValue = !value ? "none" : value;

  return (
    <div className="flex flex-col space-y-1.5">
      <label className="text-sm font-medium">{label}{required && <span className="text-destructive"> *</span>}</label>
      <Select
        value={selectValue}
        onValueChange={handleValueChange}
        disabled={disabled || loading}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select family member" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Not assigned</SelectItem>
          {familyMembers.map((member) => (
            <SelectItem key={member.id} value={member.id}>
              <div className="flex items-center">
                <Badge variant="outline" className="mr-2" style={{ 
                  backgroundColor: `${member.color}20`, 
                  color: member.color, 
                  borderColor: member.color 
                }}>
                  {member.relationship}
                </Badge>
                {member.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default FamilyMemberSelect;
