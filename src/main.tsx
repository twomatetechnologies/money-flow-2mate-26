
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initDatabasePreferences } from './services/db/dbConnector.ts'

// Initialize database preferences
initDatabasePreferences();

// Create root element
const rootElement = document.getElementById("root");

// Ensure the root element exists
if (!rootElement) {
  throw new Error("Root element not found");
}

// Add animation classes to the root element
rootElement.classList.add("animate-fade-in");

// Create root
const root = createRoot(rootElement);

// Render the app
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
