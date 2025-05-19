
/**
 * Settings API Implementation
 */

// In-memory data store for development
let appSettings = {
  stockPriceAlertThreshold: 5,
  stockApiKey: '',
  appName: "Money Flow Guardian",
  apiBaseUrl: ""
};

// Get current settings
const getSettings = (req, res) => {
  try {
    res.json(appSettings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update settings
const updateSettings = (req, res) => {
  try {
    const updatedSettings = req.body;
    
    // Validate the incoming settings
    if (!updatedSettings || typeof updatedSettings !== 'object') {
      return res.status(400).json({ error: 'Invalid settings data' });
    }
    
    // Update the settings
    appSettings = {
      ...appSettings,
      ...updatedSettings
    };
    
    res.json(appSettings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export {
  getSettings,
  updateSettings
};
