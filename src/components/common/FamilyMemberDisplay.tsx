
import React, { useEffect, useState } from 'react';
import { getFamilyMemberById } from '@/services/familyService';
import { FamilyMember } from '@/types';

interface FamilyMemberDisplayProps {
  memberId?: string;
}

const FamilyMemberDisplay: React.FC<FamilyMemberDisplayProps> = ({ memberId }) => {
  const [member, setMember] = useState<FamilyMember | null>(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (!memberId) return;
    
    const fetchMember = async () => {
      try {
        setLoading(true);
        console.log('Fetching member with ID:', memberId);
        const memberData = await getFamilyMemberById(memberId);
        console.log('Fetched member data:', memberData);
        if (memberData) {
          setMember(memberData);
        }
      } catch (error) {
        console.error('Error fetching family member:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMember();
  }, [memberId]);
  
  if (!memberId) return <span className="text-muted-foreground">-</span>;
  if (loading) return <span className="text-muted-foreground">Loading...</span>;
  if (!member) return <span className="text-muted-foreground">Not found</span>;
  
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
