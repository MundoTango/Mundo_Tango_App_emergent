/**
 * Generates a test image for avatar upload testing
 * This file creates a simple base64 encoded image that can be used in tests
 */

// Simple 1x1 pixel transparent PNG as base64
const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

// Create a buffer from base64
const createTestImageBuffer = () => {
  return Buffer.from(testImageBase64, 'base64');
};

// Generate test image file content
const generateTestImage = () => {
  return {
    name: 'test-avatar.jpg',
    mimeType: 'image/jpeg',
    buffer: createTestImageBuffer(),
    base64: testImageBase64,
  };
};

module.exports = {
  generateTestImage,
  testImageBase64,
  createTestImageBuffer,
};