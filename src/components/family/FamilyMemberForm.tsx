
import React, { useState } from 'react';
import { FamilyMember } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FamilyMemberFormProps {
  onSubmit: (data: Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  initialData?: FamilyMember;
}

const relationshipOptions: Array<FamilyMember['relationship']> = [
  'Self',
  'Spouse',
  'Parent',
  'Child',
  'Sibling',
  'Other'
];

const colorOptions = [
  { value: '#3b82f6', label: 'Blue' },
  { value: '#ec4899', label: 'Pink' },
  { value: '#10b981', label: 'Green' },
  { value: '#f59e0b', label: 'Yellow' },
  { value: '#8b5cf6', label: 'Purple' },
  { value: '#ef4444', label: 'Red' },
  { value: '#6b7280', label: 'Gray' },
  { value: '#14b8a6', label: 'Teal' },
  { value: '#f97316', label: 'Orange' },
  { value: '#a855f7', label: 'Violet' }
];

const FamilyMemberForm: React.FC<FamilyMemberFormProps> = ({
  onSubmit,
  onCancel,
  initialData
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [relationship, setRelationship] = useState<FamilyMember['relationship']>(initialData?.relationship || 'Other');
  const [color, setColor] = useState(initialData?.color || colorOptions[0].value);
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [isActive, setIsActive] = useState(initialData?.isActive !== false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const data: Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt'> = {
      name,
      relationship,
      color,
      notes,
      isActive
    };
    
    onSubmit(data);
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="relationship">Relationship <span className="text-red-500">*</span></Label>
            <Select
              value={relationship}
              onValueChange={(value: FamilyMember['relationship']) => setRelationship(value)}
            >
              <SelectTrigger id="relationship">
                <SelectValue placeholder="Select relationship" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {relationshipOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <div className="flex items-center space-x-2">
              <div
                className="w-6 h-6 rounded-full border"
                style={{ backgroundColor: color }}
              />
              <Select
                value={color}
                onValueChange={setColor}
              >
                <SelectTrigger id="color" className="flex-1">
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {colorOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center">
                          <div
                            className="w-4 h-4 rounded-full mr-2"
                            style={{ backgroundColor: option.value }}
                          />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="isActive">Status</Label>
            <div className="flex items-center space-x-2 pt-2">
              <Switch
                id="isActive"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                {isActive ? 'Active' : 'Inactive'}
              </Label>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Optional notes about this family member"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Add'} Family Member
        </Button>
      </div>
    </form>
  );
};

export default FamilyMemberForm;
