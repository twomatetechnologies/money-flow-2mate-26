
import { executeQuery } from './db/dbConnector';
import type { Settings } from '@/contexts/SettingsContext'; // Using 'type' import

export const saveAppSettings = async (settingsData: Settings): Promise<Settings> => {
  try {
    // Update or create settings
    return await executeQuery<Settings>('/settings', 'PUT', settingsData);
  } catch (error) {
    console.error("Failed to save app settings:", error);
    throw new Error("Failed to save app settings. Database connection required.");
  }
};

export const getAppSettings = async (): Promise<Settings | null> => {
  try {
    // Fetch the current settings from the database
    const settings = await executeQuery<Settings | null>('/settings', 'GET');
    
    // Basic validation before returning
    if (settings && typeof settings.appName === 'string') {
        return settings;
    }
    
    // If settings not found or invalid
    console.log("No valid app settings found in database. Using defaults.");
    return null;
  } catch (error) {
    console.error("Failed to fetch app settings from database:", error);
    throw new Error("Failed to fetch app settings. Database connection required.");
  }
};
