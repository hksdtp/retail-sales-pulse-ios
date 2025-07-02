import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

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
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkTaskDates() {
  console.log('🔍 Checking task date formats from Firebase...');
  
  try {
    const tasksRef = collection(db, 'tasks');
    const snapshot = await getDocs(tasksRef);
    
    console.log(`📋 Found ${snapshot.size} tasks`);
    
    // Lấy 5 tasks đầu tiên để kiểm tra format
    let count = 0;
    snapshot.forEach((doc) => {
      if (count < 5) {
        const task = doc.data();
        console.log(`\n📅 Task ${count + 1}: ${task.title}`);
        console.log(`   ID: ${doc.id}`);
        console.log(`   date: ${task.date} (type: ${typeof task.date})`);
        console.log(`   created_at: ${task.created_at} (type: ${typeof task.created_at})`);
        console.log(`   user_id: ${task.user_id}`);
        console.log(`   assignedTo: ${task.assignedTo}`);
        
        // Parse dates để test
        if (task.created_at) {
          console.log(`   created_at raw value:`, task.created_at);
          console.log(`   created_at constructor:`, task.created_at.constructor.name);

          try {
            let createdDate;
            if (task.created_at.toDate) {
              // Firestore Timestamp
              createdDate = task.created_at.toDate();
              console.log(`   created_at is Firestore Timestamp`);
            } else {
              // String or other format
              createdDate = new Date(task.created_at);
              console.log(`   created_at is string/other`);
            }
            console.log(`   created_at parsed: ${createdDate.toISOString()}`);
            console.log(`   created_at date only: ${createdDate.toISOString().split('T')[0]}`);
          } catch (error) {
            console.log(`   ❌ Error parsing created_at:`, error.message);
          }
        }

        if (task.date) {
          const taskDate = new Date(task.date);
          console.log(`   date parsed: ${taskDate.toISOString()}`);
          console.log(`   date date only: ${taskDate.toISOString().split('T')[0]}`);
        }
        
        count++;
      }
    });
    
    // Kiểm tra ngày hôm nay
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    console.log(`\n🗓️ Today reference: ${today.toISOString()}`);
    console.log(`🗓️ Today timestamp: ${today.getTime()}`);
    console.log(`🗓️ Today date string: ${today.toISOString().split('T')[0]}`);
    
  } catch (error) {
    console.error('❌ Error checking task dates:', error);
  }
}

checkTaskDates().then(() => {
  console.log('✅ Task date check completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
