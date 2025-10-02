/**
 * Update City Group Photos Script
 * 
 * This script updates all city group photos using the CityPhotoService.
 * It uses curated photos for major cities and falls back to Pexels API for others.
 * 
 * Usage: tsx server/scripts/update-city-photos.ts
 */

import { CityPhotoService } from '../services/cityPhotoService';

async function updateCityPhotos() {
  console.log('🚀 Starting city photo update script...\n');
  
  try {
    await CityPhotoService.updateAllGroupPhotos();
    console.log('\n✅ City photo update completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error updating city photos:', error);
    process.exit(1);
  }
}

updateCityPhotos();
