
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatIndianNumber(num: number): string {
  const numStr = Math.abs(num).toString();
  let result = '';
  
  // Handle decimals
  const [intPart, decPart] = numStr.split('.');
  
  // Add commas for Indian numbering system
  let remaining = intPart;
  // First group of 3 from right
  if (remaining.length > 3) {
    result = ',' + remaining.slice(-3) + result;
    remaining = remaining.slice(0, -3);
  } else {
    result = remaining + result;
    remaining = '';
  }
  
  // Rest of the groups of 2
  while (remaining.length > 0) {
    if (remaining.length >= 2) {
      result = ',' + remaining.slice(-2) + result;
      remaining = remaining.slice(0, -2);
    } else {
      result = remaining + result;
      remaining = '';
    }
  }

  // Add negative sign if needed
  if (num < 0) {
    result = '-' + result;
  }
  
  // Add decimals back if they existed
  if (decPart !== undefined) {
    result = result + '.' + decPart;
  }

  // Return with rupee symbol (just once)
  return '₹' + result;
}
