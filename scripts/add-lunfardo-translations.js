#!/usr/bin/env node

/**
 * ESA Layer 53: Add missing Lunfardo translations for Global Statistics
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the existing translations file
const translationsPath = path.join(__dirname, '../client/src/i18n/translations.json');
const translations = JSON.parse(fs.readFileSync(translationsPath, 'utf8'));

// Add missing es-AR-lunfardo translations
if (translations['es-AR-lunfardo']) {
  // Initialize community section if it doesn't exist
  if (!translations['es-AR-lunfardo'].translation.community) {
    translations['es-AR-lunfardo'].translation.community = {};
  }
  
  // Add missing translations with authentic Lunfardo expressions
  translations['es-AR-lunfardo'].translation.community.globalStatistics = "Estadísticas del Mundo Tanguero";
  translations['es-AR-lunfardo'].translation.community.globalDancers = "Milongueros en el Mundo";
  translations['es-AR-lunfardo'].translation.community.activeEvents = "Milongas Activas";
  translations['es-AR-lunfardo'].translation.community.communities = "Barrios Tangueros";
  translations['es-AR-lunfardo'].translation.community.yourCity = "Tu Barrio";
  
  console.log('✅ Added Lunfardo translations for Global Statistics:');
  console.log('  - globalStatistics: "Estadísticas del Mundo Tanguero"');
  console.log('  - globalDancers: "Milongueros en el Mundo"');
  console.log('  - activeEvents: "Milongas Activas"');
  console.log('  - communities: "Barrios Tangueros"');
  console.log('  - yourCity: "Tu Barrio"');
  
  // Save the updated translations file
  fs.writeFileSync(translationsPath, JSON.stringify(translations, null, 2), 'utf8');
  
  console.log('\n🎉 ESA Layer 53: Lunfardo translations complete!');
} else {
  console.error('❌ es-AR-lunfardo language not found in translations file');
}