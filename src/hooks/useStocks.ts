import { useState, useEffect, useRef } from 'react';
import { Stock } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/contexts/SettingsContext';
import { getStocks, createStock, updateStock, deleteStock } from '@/services/stockService'; // This uses stockDbService
import { startStockPriceMonitoring } from '@/services/stockPriceService';

// StockHolding interface that maps to the UI representation of a Stock
interface StockHolding {
  id: string;
  symbol: string;
  name?: string;
  quantity: number;
  averageBuyPrice: number;
  currentPrice: number;
  purchaseDate?: Date | string;
  sector?: string;
  familyMemberId?: string;
  notes?: string;
  lastUpdated?: Date;
  value?: number;
  change?: number;
  changePercent?: number;
}

// Helper function to map Stock (DB model) to StockHolding (UI model)
const mapStockToStockHolding = (stock: Stock): StockHolding => {
  return {
    id: stock.id,
    symbol: stock.symbol,
    name: stock.company_name,
    quantity: Number(stock.quantity) || 0,
    averageBuyPrice: Number(stock.purchase_price) || 0,
    currentPrice: Number(stock.current_price) || 0,
    purchaseDate: stock.purchase_date,
    sector: stock.sector,
    familyMemberId: stock.family_member_id,
    notes: stock.notes,
    lastUpdated: stock.last_updated ? new Date(stock.last_updated) : undefined,
    value: Number(stock.value) || 0,
    // Calculate change and changePercent if not provided
    change: (stock.current_price || 0) - (stock.purchase_price || 0),
    changePercent: stock.purchase_price ? ((stock.current_price || 0) - stock.purchase_price) / stock.purchase_price * 100 : 0
  };
};

// Helper function to map StockHolding (UI model) back to Stock (DB model) for updates
const mapStockHoldingToStock = (stockHolding: Partial<StockHolding>): Partial<Stock> => {
  const result: Partial<Stock> = {};

  if (stockHolding.symbol !== undefined) result.symbol = stockHolding.symbol;
  if (stockHolding.name !== undefined) result.company_name = stockHolding.name;
  if (stockHolding.quantity !== undefined) result.quantity = stockHolding.quantity;
  if (stockHolding.averageBuyPrice !== undefined) result.purchase_price = stockHolding.averageBuyPrice;
  if (stockHolding.currentPrice !== undefined) result.current_price = stockHolding.currentPrice;
  if (stockHolding.purchaseDate !== undefined) result.purchase_date = stockHolding.purchaseDate;
  if (stockHolding.sector !== undefined) result.sector = stockHolding.sector;
  if (stockHolding.familyMemberId !== undefined) result.family_member_id = stockHolding.familyMemberId;
  if (stockHolding.notes !== undefined) result.notes = stockHolding.notes;
  
  return result;
};

export const useStocks = () => {
  const [stocks, setStocks] = useState<StockHolding[]>([]);
  const [displayedStocks, setDisplayedStocks] = useState<StockHolding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSort, setCurrentSort] = useState<string | null>(null);
  const [currentDirection, setCurrentDirection] = useState<'asc' | 'desc' | null>(null);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const monitoringInitializedRef = useRef(false);
  const { toast } = useToast();
  const { settings } = useSettings();

  const fetchStocks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching stocks data using stockService...');
      const data = await getStocks();
      console.log('Received stocks data:', data);
      
      const safeData = Array.isArray(data) ? data : [];
      
      // Map DB Stock models to UI StockHolding models
      const processedData = safeData.map(stock => {
        const mappedStock = mapStockToStockHolding(stock);
        console.log(`Mapped stock ${stock.symbol}: DB currentPrice=${stock.current_price}, UI currentPrice=${mappedStock.currentPrice}`);
        return mappedStock;
      });
      
      setStocks(processedData);
      setDisplayedStocks(processedData);
    } catch (error) {
      console.error('Error fetching stocks:', error);
      setError('Failed to load stocks data');
      setStocks([]);
      setDisplayedStocks([]);
      
      toast({
        title: "Error",
        description: "Failed to load stocks data. Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateGainPercent = (stock: StockHolding) => {
    if (!stock || !(stock.averageBuyPrice) || stock.averageBuyPrice <= 0) return 0;
    return ((stock.currentPrice || 0) - stock.averageBuyPrice) / stock.averageBuyPrice * 100;
  };

  const applyFiltersAndSort = () => {
    if (!Array.isArray(stocks)) {
      console.log('Stocks is not an array:', stocks);
      setDisplayedStocks([]);
      return;
    }
    
    let result = [...stocks];
    
    // Apply filters
    if (Object.keys(activeFilters).length > 0) {
      Object.entries(activeFilters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          switch (key) {
            case 'performanceFilter':
              if (value === 'gainers') {
                result = result.filter(stock => calculateGainPercent(stock) > 0);
              } else if (value === 'losers') {
                result = result.filter(stock => calculateGainPercent(stock) < 0);
              }
              break;
              
            case 'searchFilter':
              const searchTerm = String(value).toLowerCase();
              result = result.filter(stock => 
                ((stock.symbol || '').toLowerCase()).includes(searchTerm) || 
                ((stock.name || '').toLowerCase()).includes(searchTerm)
              );
              break;
              
            case 'sectorFilter':
              result = result.filter(stock => stock.sector === value);
              break;
              
            case 'familyMemberFilter':
              result = result.filter(stock => stock.familyMemberId === value);
              break;
              
            case 'priceRangeFilter':
              if (typeof value === 'object' && value !== null) {
                if (value.min !== null && typeof value.min === 'number') {
                  result = result.filter(stock => (stock.currentPrice || 0) >= value.min);
                }
                if (value.max !== null && typeof value.max === 'number') {
                  result = result.filter(stock => (stock.currentPrice || 0) <= value.max);
                }
              }
              break;
              
            case 'valueRangeFilter':
               if (typeof value === 'object' && value !== null) {
                if (value.min !== null && typeof value.min === 'number') {
                  result = result.filter(stock => (stock.value || 0) >= value.min);
                }
                if (value.max !== null && typeof value.max === 'number') {
                  result = result.filter(stock => (stock.value || 0) <= value.max);
                }
              }
              break;
              
            case 'selectedSectors':
              if (Array.isArray(value) && value.length > 0) {
                result = result.filter(stock => 
                  stock.sector && value.includes(stock.sector)
                );
              }
              break;
          }
        }
      });
    }
    
    // Apply sorting
    if (currentSort && currentDirection) {
      result.sort((a, b) => {
        let aValue, bValue;
        
        if (currentSort === 'gainPercent') {
          aValue = calculateGainPercent(a);
          bValue = calculateGainPercent(b);
        } else if (currentSort === 'familyMemberId') {
          aValue = a.familyMemberId || '';
          bValue = b.familyMemberId || '';
        } else {
          aValue = a[currentSort as keyof StockHolding];
          bValue = b[currentSort as keyof StockHolding];
          
          if (aValue === undefined || aValue === null) aValue = '';
          if (bValue === undefined || bValue === null) bValue = '';

          if (typeof aValue === 'string' && !isNaN(Number(aValue)) && typeof bValue === 'string' && !isNaN(Number(bValue))) {
            aValue = Number(aValue);
            bValue = Number(bValue);
          }
        }
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return currentDirection === 'asc' ? aValue - bValue : bValue - aValue;
        } else if (typeof aValue === 'string' && typeof bValue === 'string') {
          return currentDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        if (aValue < bValue) return currentDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return currentDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    setDisplayedStocks(result);
  };

  useEffect(() => {
    fetchStocks();
    
    // Only initialize price monitoring once
    if (!monitoringInitializedRef.current) {
      let stopMonitoringFn: (() => void) | undefined;
      
      (async () => {
        try {
          const threshold = settings?.stockPriceAlertThreshold || 5;
          
          // Initialize stock price monitoring
          stopMonitoringFn = await startStockPriceMonitoring(threshold);
          monitoringInitializedRef.current = true;
        } catch (error) {
          console.error('Error initializing stock price monitoring:', error);
        }
      })();
      
      return () => {
        if (stopMonitoringFn) {
          stopMonitoringFn();
        }
      };
    }
  }, [settings]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [stocks, activeFilters, currentSort, currentDirection]);

  return {
    stocks,
    displayedStocks,
    loading,
    error,
    currentSort,
    currentDirection,
    activeFilters,
    setCurrentSort,
    setCurrentDirection,
    setActiveFilters,
    fetchStocks,
    calculateGainPercent
  };
};
