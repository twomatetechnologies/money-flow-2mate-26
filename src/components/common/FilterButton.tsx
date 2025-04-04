
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

export interface FilterOption {
  id: string;
  label: string;
  options: {
    value: string;
    label: string;
  }[];
  type: 'select' | 'range' | 'checkbox';
}

interface FilterButtonProps {
  options: FilterOption[];
  activeFilters: Record<string, any>;
  onFilterChange: (filterId: string, value: any) => void;
  onClearFilters: () => void;
}

const FilterButton: React.FC<FilterButtonProps> = ({
  options,
  activeFilters,
  onFilterChange,
  onClearFilters,
}) => {
  const [open, setOpen] = useState(false);
  
  const activeFilterCount = Object.keys(activeFilters).filter(key => 
    activeFilters[key] !== null && activeFilters[key] !== undefined && activeFilters[key] !== ''
  ).length;

  const handleSelectChange = (filterId: string, event: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange(filterId, event.target.value);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-1 relative">
          <Filter className="h-4 w-4 mr-1" />
          Filter
          {activeFilterCount > 0 && (
            <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium">Filters</h4>
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={onClearFilters}
            >
              <X className="h-3 w-3 mr-1" />
              Clear filters
            </Button>
          )}
        </div>
        
        <div className="space-y-4">
          {options.map((option) => (
            <div key={option.id} className="space-y-2">
              <label className="text-sm font-medium">{option.label}</label>
              
              {option.type === 'select' && (
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={activeFilters[option.id] || ''}
                  onChange={(e) => handleSelectChange(option.id, e)}
                >
                  <option value="">All</option>
                  {option.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}
              
              {/* Additional filter types can be added here */}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default FilterButton;
