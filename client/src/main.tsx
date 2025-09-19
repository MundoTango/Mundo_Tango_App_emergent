import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App"; 
import "./index.css";
// Initialize console security - hides framework references
import "./utils/console-cleanup";
// ESA Life CEO 61x21 - Monitoring is managed by MonitoringProvider
// Users can enable analytics via Settings → Privacy tab
// No automatic initialization to respect user privacy

console.log('Starting React app...');

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
