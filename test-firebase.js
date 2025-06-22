// Test Firebase connection and add sample tasks
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';

// Firebase config - REAL CONFIG from the project
const firebaseConfig = {
  apiKey: "AIzaSyD15K9FMm2J0Hq4yeacqL9fQ0TNK7NI7Lo",
  authDomain: "appqlgd.firebaseapp.com",
  projectId: "appqlgd",
  storageBucket: "appqlgd.appspot.com",
  messagingSenderId: "873528436407",
  appId: "1:873528436407:web:abcdefghijklmnop"
};

// Sample tasks data
const sampleTasks = [
  {
    id: 'firebase_task_001',
    title: 'Kiểm tra hàng tồn kho từ Firebase',
    description: 'Kiểm tra số lượng hàng tồn kho tại kho chính - dữ liệu từ Firebase',
    date: '2024-01-15',
    type: 'inventory',
    status: 'pending',
    priority: 'high',
    progress: 0,
    location: 'Kho chính',
    user_id: 'Ve7sGRnMoRvT1E0VL5Ds',
    user_name: 'Khổng Đức Mạnh',
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2024-01-15T08:00:00Z',
    isNew: false,
    isShared: false,
    isSharedWithTeam: false
  },
  {
    id: 'firebase_task_002',
    title: 'Báo cáo doanh thu từ Firebase',
    description: 'Tổng hợp báo cáo doanh thu tuần này - dữ liệu từ Firebase',
    date: '2024-01-16',
    type: 'report',
    status: 'in_progress',
    priority: 'normal',
    progress: 50,
    location: 'Văn phòng',
    user_id: 'Ve7sGRnMoRvT1E0VL5Ds',
    user_name: 'Khổng Đức Mạnh',
    created_at: '2024-01-16T09:00:00Z',
    updated_at: '2024-01-16T09:00:00Z',
    isNew: false,
    isShared: true,
    isSharedWithTeam: true
  },
  {
    id: 'firebase_task_003',
    title: 'Họp team từ Firebase',
    description: 'Cuộc họp team để review công việc tuần - dữ liệu từ Firebase',
    date: '2024-01-17',
    type: 'meeting',
    status: 'completed',
    priority: 'normal',
    progress: 100,
    location: 'Phòng họp A',
    user_id: 'Ve7sGRnMoRvT1E0VL5Ds',
    user_name: 'Khổng Đức Mạnh',
    created_at: '2024-01-17T10:00:00Z',
    updated_at: '2024-01-17T10:00:00Z',
    isNew: false,
    isShared: false,
    isSharedWithTeam: false
  }
];

async function testFirebase() {
  try {
    console.log('🔥 Testing Firebase connection...');
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('✅ Firebase initialized successfully');
    
    // Check existing tasks
    console.log('📋 Checking existing tasks...');
    const tasksSnapshot = await getDocs(collection(db, 'tasks'));
    console.log(`📋 Found ${tasksSnapshot.size} existing tasks`);
    
    // Add sample tasks if none exist
    if (tasksSnapshot.size === 0) {
      console.log('📝 Adding sample tasks...');
      
      for (const task of sampleTasks) {
        const docRef = await addDoc(collection(db, 'tasks'), task);
        console.log(`✅ Added task: ${task.title} (ID: ${docRef.id})`);
      }
      
      console.log('🎉 Sample tasks added successfully!');
    } else {
      console.log('📋 Tasks already exist, skipping sample data creation');
      
      // List existing tasks
      tasksSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`📋 Existing task: ${data.title} (ID: ${doc.id})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Firebase test failed:', error);
    console.log('💡 Please check your Firebase configuration in the script');
  }
}

// Run the test
testFirebase();
