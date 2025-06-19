#!/usr/bin/env node

/**
 * Debug script để kiểm tra API URL configuration
 * Ninh ơi - Retail Sales Pulse iOS Project
 */

// Simulate environment variables
const mockEnv = {
  DEV: true,
  VITE_API_URL: undefined, // Simulate no custom URL
};

// Simulate the API config logic
const API_CONFIG = {
  BASE_URL: mockEnv.VITE_API_URL || 'https://api-adwc442mha-uc.a.run.app',
  LOCAL_URL: mockEnv.VITE_API_URL || 'http://127.0.0.1:5001/appqlgd/us-central1/api',
  TEST_URL: mockEnv.VITE_API_URL || 'http://localhost:3003',
  IS_DEVELOPMENT: mockEnv.DEV,
};

const getApiUrl = () => {
  // Check if we have a custom API URL from environment
  if (mockEnv.VITE_API_URL) {
    console.log('🔧 Using custom API URL from environment:', mockEnv.VITE_API_URL);
    return mockEnv.VITE_API_URL;
  }

  // For development, use test server if available, otherwise production API
  if (API_CONFIG.IS_DEVELOPMENT) {
    console.log('🔧 Development mode: Using test server for local development');
    return API_CONFIG.TEST_URL;
  }

  // Use production API for production
  return API_CONFIG.BASE_URL;
};

console.log('🔍 DEBUG API URL CONFIGURATION');
console.log('==============================\n');

console.log('📊 Environment Variables:');
console.log(`  DEV: ${mockEnv.DEV}`);
console.log(`  VITE_API_URL: ${mockEnv.VITE_API_URL || 'undefined'}`);
console.log('');

console.log('📊 API Configuration:');
console.log(`  BASE_URL: ${API_CONFIG.BASE_URL}`);
console.log(`  LOCAL_URL: ${API_CONFIG.LOCAL_URL}`);
console.log(`  TEST_URL: ${API_CONFIG.TEST_URL}`);
console.log(`  IS_DEVELOPMENT: ${API_CONFIG.IS_DEVELOPMENT}`);
console.log('');

console.log('🎯 Selected API URL:');
const selectedUrl = getApiUrl();
console.log(`  ${selectedUrl}`);
console.log('');

console.log('🧪 Testing API URL:');
console.log('==================');

async function testApiUrl() {
  try {
    console.log(`📡 Testing: ${selectedUrl}/health`);
    const response = await fetch(`${selectedUrl}/health`);
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ SUCCESS: API is reachable');
      console.log(`📋 Response: ${JSON.stringify(data, null, 2)}`);
    } else {
      console.log('❌ ERROR: API returned error status');
    }
  } catch (error) {
    console.log(`❌ ERROR: Cannot reach API - ${error.message}`);
  }
  
  console.log('');
  console.log('🔧 TROUBLESHOOTING:');
  console.log('===================');
  console.log('1. Make sure test server is running: node test-server.js');
  console.log('2. Check if port 3003 is available');
  console.log('3. Verify no firewall blocking localhost:3003');
  console.log('4. Try production API if test server fails');
}

testApiUrl().catch(console.error);
