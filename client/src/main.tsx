import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App"; 
import "./index.css";
// Initialize console security - hides framework references
import "./utils/console-cleanup";
// ESA Life CEO 61x21 - Initialize monitoring services
import { monitoring } from "./services/monitoring";

console.log('Starting React app...');

// Initialize monitoring services before app starts
const initializeMonitoring = async () => {
  try {
    await monitoring.initialize({
      maskTextContent: false,
      maskInputContent: true,
      maskEmails: true,
      maskPhoneNumbers: true,
      blockClass: 'no-monitor',
      ignoreClass: 'monitor-ignore',
      maskTextClass: 'monitor-mask',
      captureNetwork: true,
      captureConsole: true
    });
    console.log('[ESA Monitoring] Services initialized successfully');
  } catch (error) {
    console.error('[ESA Monitoring] Failed to initialize:', error);
  }
};

initializeMonitoring();

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Failed to find the root element");
}

const root = createRoot(rootElement);

root.render(
  // ESA LIFE CEO 56x21 - StrictMode disabled to prevent map double-rendering
  // <React.StrictMode>
    <App />
  // </React.StrictMode>
);

console.log('React app mounted');
