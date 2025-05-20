import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatIndianNumber(num: number, decimals: number = 2): string {
  // Handle NaN, infinity and undefined
  if (!Number.isFinite(num)) return '₹0.00';
  
  // Round to specified decimals first to avoid floating point issues
  const roundedNum = Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
  
  // Convert to string with fixed decimals
  const numStr = Math.abs(roundedNum).toFixed(decimals);
  const [intPart, decPart] = numStr.split('.');
  
  // Format the integer part with Indian grouping (e.g., 1,00,00,000)
  const lastThree = intPart.slice(-3);
  const otherNumbers = intPart.slice(0, -3);
  let formattedInt = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  formattedInt = formattedInt ? formattedInt + ',' + lastThree : lastThree;
  
  // Combine all parts
  let result = (roundedNum < 0 ? '-' : '') + '₹' + formattedInt + '.' + decPart;
  
  return result;
}
