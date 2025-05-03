
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type SortDirection = 'asc' | 'desc' | null;

export interface SortOption {
  label: string;
  value: string;
}

interface SortButtonProps {
  options: SortOption[];
  currentSort: string | null;
  currentDirection: SortDirection;
  onSortChange: (value: string, direction: SortDirection) => void;
  minimal?: boolean;
}

const SortButton: React.FC<SortButtonProps> = ({
  options,
  currentSort,
  currentDirection,
  onSortChange,
  minimal = false,
}) => {
  const getIcon = () => {
    if (!currentSort || !currentDirection) return <ArrowUpDown className="h-4 w-4 ml-1" />;
    return currentDirection === 'asc' 
      ? <ArrowUp className="h-4 w-4 ml-1" /> 
      : <ArrowDown className="h-4 w-4 ml-1" />;
  };

  const handleSortClick = (value: string) => {
    let newDirection: SortDirection = 'asc';
    
    if (currentSort === value) {
      if (currentDirection === 'asc') newDirection = 'desc';
      else if (currentDirection === 'desc') newDirection = null;
    }
    
    onSortChange(value, newDirection);
  };

  const getCurrentSortLabel = () => {
    if (!currentSort) return 'Sort';
    const option = options.find(opt => opt.value === currentSort);
    return option ? option.label : 'Sort';
  };

  if (minimal) {
    return (
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-8 w-8 p-0" 
        onClick={() => {
          const option = options[0];
          if (option) {
            handleSortClick(option.value);
          }
        }}
      >
        {getIcon()}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-1">
          {getCurrentSortLabel()}
          {getIcon()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-popover">
        {options.map((option) => (
          <DropdownMenuItem 
            key={option.value}
            onClick={() => handleSortClick(option.value)}
            className="cursor-pointer"
          >
            {option.label}
            {currentSort === option.value && currentDirection === 'asc' && (
              <ArrowUp className="h-4 w-4 ml-auto" />
            )}
            {currentSort === option.value && currentDirection === 'desc' && (
              <ArrowDown className="h-4 w-4 ml-auto" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SortButton;
