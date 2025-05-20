import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAppSettings, saveAppSettings } from '@/services/settingsService';
import { toast } from '@/hooks/use-toast'; // Ensure use-toast is correctly imported

// Export the Settings interface
export interface Settings {
  stockPriceAlertThreshold: number;
  stockApiKey?: string;
  appName: string;
  apiBaseUrl?: string;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>; // Make async
  isLoading: boolean;
}

const defaultSettings: Settings = {
  stockPriceAlertThreshold: 5,
  stockApiKey: "LR78N65XUDF2EZDB", // Added the default API key here
  appName: "Money Flow Guardian",
  apiBaseUrl: "",
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      try {
        const dbSettings = await getAppSettings();
        if (dbSettings) {
          // Ensure stockApiKey from DB is used, even if it's an empty string or null
          // defaultSettings provides a fallback if dbSettings or specific fields are missing
          setSettings({ ...defaultSettings, ...dbSettings });
        } else {
          const savedSettings = localStorage.getItem('finance-app-settings');
          if (savedSettings) {
            const parsed = JSON.parse(savedSettings);
            // Ensure stockApiKey from localStorage is used, providing default if missing
            setSettings({ ...defaultSettings, ...parsed });
          } else {
            // If neither DB nor localStorage, defaultSettings are already set
            setSettings(defaultSettings);
          }
        }
      } catch (error) {
        console.error("Failed to load settings during init, using defaults/localStorage:", error);
        const savedSettings = localStorage.getItem('finance-app-settings');
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          setSettings({ ...defaultSettings, ...parsed });
        } else {
          setSettings(defaultSettings);
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('finance-app-settings', JSON.stringify(settings));
    }
  }, [settings, isLoading]);

  const updateSettingsAndPersist = async (newSettings: Partial<Settings>) => {
    const updatedSettingsData = { ...settings, ...newSettings };
    setSettings(updatedSettingsData); // Optimistically update UI and localStorage (via useEffect)

    try {
      await saveAppSettings(updatedSettingsData);
      toast({
        title: "Settings Saved",
        description: "Your settings have been successfully saved to the database.",
      });
    } catch (error) {
      console.error("Failed to save settings to DB:", error);
      toast({
        title: "Save Error",
        description: "Failed to save settings to the database. Changes are saved locally.",
        variant: "destructive",
      });
      // Potentially revert optimistic update or handle error state
    }
  };

  if (isLoading && typeof window !== 'undefined' ) { // Added typeof window check for SSR safety, though likely not an issue here
    // Avoid showing loading indicator if it's an SSR environment or not yet mounted.
    // For a pure CSR app like this, it's generally fine.
     return <div>Loading application settings...</div>; 
  }


  return (
    <SettingsContext.Provider value={{ settings, updateSettings: updateSettingsAndPersist, isLoading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
