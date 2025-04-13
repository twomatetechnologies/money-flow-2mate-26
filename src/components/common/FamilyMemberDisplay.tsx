
import React, { useEffect, useState } from 'react';
import { getFamilyMemberById } from '@/services/familyService';
import { FamilyMember } from '@/types';

interface FamilyMemberDisplayProps {
  memberId?: string;
}

const FamilyMemberDisplay: React.FC<FamilyMemberDisplayProps> = ({ memberId }) => {
  const [member, setMember] = useState<FamilyMember | null>(null);
  
  useEffect(() => {
    if (!memberId) return;
    
    const fetchMember = async () => {
      try {
        const memberData = await getFamilyMemberById(memberId);
        if (memberData) {
          setMember(memberData);
        }
      } catch (error) {
        console.error('Error fetching family member:', error);
      }
    };
    
    fetchMember();
  }, [memberId]);
  
  if (!memberId || !member) return <span>-</span>;
  
  return (
    <div className="flex items-center">
      <div 
        className="w-3 h-3 rounded-full mr-1" 
        style={{ backgroundColor: member.color }}
      />
      <span>{member.name}</span>
    </div>
  );
};

export default FamilyMemberDisplay;
