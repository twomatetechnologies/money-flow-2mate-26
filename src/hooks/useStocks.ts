
import { useState, useEffect } from 'react';
import { StockHolding } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/contexts/SettingsContext';
import { getStocks, createStock, updateStock, deleteStock } from '@/services/crudService';
import { startStockPriceMonitoring, simulateStockPriceUpdates } from '@/services/stockPriceService';

export const useStocks = () => {
  const [stocks, setStocks] = useState<StockHolding[]>([]);
  const [displayedStocks, setDisplayedStocks] = useState<StockHolding[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSort, setCurrentSort] = useState<string | null>(null);
  const [currentDirection, setCurrentDirection] = useState<'asc' | 'desc' | null>(null);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const { toast } = useToast();
  const { settings } = useSettings();

  const fetchStocks = async () => {
    try {
      const data = await getStocks();
      setStocks(data);
      setDisplayedStocks(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stocks:', error);
      setLoading(false);
      toast({
        title: "Error",
        description: "Failed to load stocks data",
        variant: "destructive"
      });
    }
  };

  const calculateGainPercent = (stock: StockHolding) => {
    return ((stock.currentPrice - stock.averageBuyPrice) / stock.averageBuyPrice) * 100;
  };

  const applyFiltersAndSort = () => {
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
              const searchTerm = value.toLowerCase();
              result = result.filter(stock => 
                stock.symbol.toLowerCase().includes(searchTerm) || 
                stock.name.toLowerCase().includes(searchTerm)
              );
              break;
              
            case 'sectorFilter':
              result = result.filter(stock => stock.sector === value);
              break;
              
            case 'familyMemberFilter':
              result = result.filter(stock => stock.familyMemberId === value);
              break;
              
            case 'priceRangeFilter':
              if (value.min !== null) {
                result = result.filter(stock => stock.currentPrice >= value.min);
              }
              if (value.max !== null) {
                result = result.filter(stock => stock.currentPrice <= value.max);
              }
              break;
              
            case 'valueRangeFilter':
              if (value.min !== null) {
                result = result.filter(stock => stock.value >= value.min);
              }
              if (value.max !== null) {
                result = result.filter(stock => stock.value <= value.max);
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
          // Special case for family member sorting - could be enhanced to use actual names
          aValue = a.familyMemberId || '';
          bValue = b.familyMemberId || '';
        } else {
          aValue = a[currentSort as keyof StockHolding];
          bValue = b[currentSort as keyof StockHolding];
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
    
    let stopMonitoringFn: (() => void) | undefined;
    
    (async () => {
      try {
        stopMonitoringFn = await startStockPriceMonitoring(settings.stockPriceAlertThreshold);
        console.log("Using real market data for stock prices");
      } catch (error) {
        console.error('Error starting real stock monitoring, falling back to simulation:', error);
        stopMonitoringFn = await simulateStockPriceUpdates(settings.stockPriceAlertThreshold);
        console.log("Using simulated market data for stock prices");
        
        toast({
          title: "Using Simulated Data",
          description: "Could not connect to live market data. Using simulated stock prices instead.",
          variant: "destructive",
        });
      }
    })();
    
    return () => {
      if (typeof stopMonitoringFn === 'function') {
        stopMonitoringFn();
      }
    };
  }, [settings.stockPriceAlertThreshold]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [stocks, currentSort, currentDirection, activeFilters]);

  return {
    stocks,
    displayedStocks,
    loading,
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
