// Thêm dòng này để chạy script cấu hình
import { createRoot } from 'react-dom/client';

import '../setup-sheets.js';
import App from './App.tsx';
import './index.css';

// Initialize Firebase
import { FirebaseService } from './services/FirebaseService';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD15K9FMm2J0Hq4yeacqL9fQ0TNK7NI7Lo",
  authDomain: "appqlgd.firebaseapp.com",
  projectId: "appqlgd",
  storageBucket: "appqlgd.appspot.com",
  messagingSenderId: "873528436407",
  appId: "1:873528436407:web:abcdefghijklmnop"
};

// Initialize Firebase
try {
  FirebaseService.initializeApp(firebaseConfig);
  console.log('🔥 Firebase initialized successfully');
} catch (error) {
  console.error('🔥 Firebase initialization failed:', error);
}
import './styles/dark-theme.css';
import './styles/login-theme.css';
import './styles/macos.css';
import './utils/dialog-centering-fix.js';
import './utils/versionManager.ts';
import './utils/cacheHelper.ts';
import './utils/test-kpi.ts';

createRoot(document.getElementById('root')!).render(<App />);
