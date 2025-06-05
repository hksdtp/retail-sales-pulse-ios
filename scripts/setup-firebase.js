// Auto-setup Firebase configuration
console.log('🔥 Setting up Firebase configuration...');

// Firebase config for the project
const firebaseConfig = {
  apiKey: "AIzaSyBqJVJKvXxKxKxKxKxKxKxKxKxKxKxKxKx",
  authDomain: "appqlgd.firebaseapp.com", 
  projectId: "appqlgd",
  storageBucket: "appqlgd.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdefghijklmnop"
};

// Save to localStorage (for browser)
if (typeof window !== 'undefined' && window.localStorage) {
  localStorage.setItem('firebaseConfig', JSON.stringify(firebaseConfig));
  console.log('✅ Firebase config saved to localStorage');
} else {
  console.log('📝 Copy this config to your Firebase settings:');
  console.log(JSON.stringify(firebaseConfig, null, 2));
}

console.log('🎉 Firebase setup complete!');
