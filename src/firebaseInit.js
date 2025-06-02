// Khởi tạo Firebase
import { firebaseService } from './services/FirebaseService';

// Cấu hình Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAN6pg2WpzHnwLQ5_U_qhWKW660gkCoL98",
  authDomain: "qlpbl-b10fc.firebaseapp.com",
  projectId: "qlpbl-b10fc",
  storageBucket: "qlpbl-b10fc.firebasestorage.app",
  messagingSenderId: "351550514869",
  appId: "1:351550514869:web:7e0c6f79a4f67f081c80fc",
  measurementId: "G-V7SZMDWMEC"
};

// Lưu cấu hình vào localStorage và khởi tạo Firebase
const initFirebase = () => {
  try {
    console.log('Đang cấu hình Firebase...');
    const result = firebaseService.configure(firebaseConfig);
    
    if (result) {
      console.log('✅ Firebase đã được cấu hình thành công!');
      return true;
    } else {
      console.error('❌ Không thể cấu hình Firebase');
      return false;
    }
  } catch (error) {
    console.error('❌ Lỗi khi cấu hình Firebase:', error);
    return false;
  }
};

// Khởi tạo Firebase khi file được import
const firebaseInitialized = initFirebase();
export { firebaseInitialized };
