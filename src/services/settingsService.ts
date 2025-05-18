
import { executeQuery } from './db/dbConnector';
import type { Settings } from '@/contexts/SettingsContext'; // Using 'type' import

export const saveAppSettings = async (settingsData: Settings): Promise<Settings> => {
  // Assuming a PUT request to /api/settings updates or creates the settings
  return executeQuery<Settings>('/settings', 'PUT', settingsData);
};

export const getAppSettings = async (): Promise<Settings | null> => {
  try {
    // Assuming a GET request to /api/settings fetches the current settings
    const settings = await executeQuery<Settings | null>('/settings', 'GET');
    // Ensure that if settings are null or not what we expect, we handle it.
    // For example, an empty 200 response might be parsed as null by some fetch wrappers.
    // Or the API might return 404 if no settings are found.
    // executeQuery should ideally throw for non-2xx, so a 404 would be caught.
    // If the API returns 200 with an empty body for "no settings", that needs specific handling.
    // For now, assume executeQuery returns the parsed object or null.
    if (settings && typeof settings.appName === 'string') { // Basic validation
        return settings;
    }
    return null; // Return null if settings are not found or invalid
  } catch (error) {
    const dbError = error as any;
    // If settings are not found (e.g., 404), it's not necessarily a critical error for fetching.
    // It might just mean they haven't been set yet.
    if (dbError.statusCode === 404) {
      console.log("App settings not found in DB, will use defaults or localStorage.");
      return null;
    }
    console.error("Failed to fetch app settings from DB:", error);
    return null; // Fallback to null on other errors
  }
};
