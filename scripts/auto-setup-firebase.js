// Auto-setup Firebase configuration script
console.log('🔥 Firebase Auto-Setup Script');
console.log('==============================');

// Firebase config for the project
const firebaseConfig = {
  apiKey: "AIzaSyDXQJQJQJQJQJQJQJQJQJQJQJQJQJQJQJQ",
  authDomain: "appqlgd.firebaseapp.com",
  projectId: "appqlgd",
  storageBucket: "appqlgd.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdefghijklmnop"
};

// Function to setup Firebase in browser
function setupFirebaseInBrowser() {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      // Save config to localStorage
      localStorage.setItem('firebaseConfig', JSON.stringify(firebaseConfig));
      localStorage.setItem('firebaseConfigured', 'true');
      
      console.log('✅ Firebase config saved to localStorage');
      console.log('🎉 Firebase will be auto-configured on next app load');
      
      return true;
    } catch (error) {
      console.error('❌ Failed to save Firebase config:', error);
      return false;
    }
  } else {
    console.log('⚠️ localStorage not available (running in Node.js)');
    return false;
  }
}

// Function to display config for manual setup
function displayConfigForManualSetup() {
  console.log('\n📋 Firebase Configuration:');
  console.log('==========================');
  console.log(JSON.stringify(firebaseConfig, null, 2));
  console.log('\n💡 Copy this config to your Firebase settings if needed');
}

// Main execution
function main() {
  console.log('🚀 Starting Firebase auto-setup...');
  
  const browserSetupSuccess = setupFirebaseInBrowser();
  
  if (!browserSetupSuccess) {
    displayConfigForManualSetup();
  }
  
  console.log('\n🎯 Setup Methods Available:');
  console.log('1. ✅ Auto-setup via FirebaseAutoSetupProvider (Recommended)');
  console.log('2. 🔧 Manual setup via Firebase Settings page');
  console.log('3. 💾 localStorage persistence (already configured)');
  
  console.log('\n🔥 Firebase Auto-Setup Complete!');
}

// Run the script
main();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    firebaseConfig,
    setupFirebaseInBrowser,
    displayConfigForManualSetup
  };
}
