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

async function debugUserPermission() {
  console.log('🔍 Debugging user permission issue...');
  
  try {
    // Get tasks
    const tasksRef = collection(db, 'tasks');
    const tasksSnapshot = await getDocs(tasksRef);
    
    // Get users
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    
    console.log(`📋 Found ${tasksSnapshot.size} tasks`);
    console.log(`👥 Found ${usersSnapshot.size} users`);
    
    // Analyze user IDs in tasks
    const taskUserIds = new Set();
    tasksSnapshot.forEach((doc) => {
      const task = doc.data();
      if (task.user_id) taskUserIds.add(task.user_id);
      if (task.assignedTo) taskUserIds.add(task.assignedTo);
    });
    
    console.log('\n📊 User IDs found in tasks:');
    Array.from(taskUserIds).forEach(userId => {
      console.log(`   - ${userId}`);
    });
    
    // Analyze users
    console.log('\n👥 Users in database:');
    usersSnapshot.forEach((doc) => {
      const user = doc.data();
      console.log(`   - ID: ${doc.id}`);
      console.log(`     Name: ${user.name || 'N/A'}`);
      console.log(`     Role: ${user.role || 'N/A'}`);
      console.log(`     Department: ${user.department || 'N/A'}`);
      console.log(`     Team ID: ${user.team_id || 'N/A'}`);
      console.log('');
    });
    
    // Check current user from API calls
    console.log('\n🔍 Current user from API calls: Ve7sGRnMoRvT1E0VL5Ds');
    console.log('❌ This user ID does NOT exist in tasks!');
    
    // Find potential matches
    console.log('\n🔍 Potential solutions:');
    console.log('1. Update current user ID to match existing task user IDs');
    console.log('2. Update task user IDs to match current user');
    console.log('3. Temporarily disable permission filtering for testing');
    
    // Show task distribution by user
    console.log('\n📊 Task distribution by user:');
    const userTaskCount = {};
    tasksSnapshot.forEach((doc) => {
      const task = doc.data();
      const userId = task.user_id || task.assignedTo || 'unknown';
      userTaskCount[userId] = (userTaskCount[userId] || 0) + 1;
    });
    
    Object.entries(userTaskCount).forEach(([userId, count]) => {
      console.log(`   ${userId}: ${count} tasks`);
    });
    
  } catch (error) {
    console.error('❌ Error debugging user permission:', error);
  }
}

debugUserPermission().then(() => {
  console.log('✅ User permission debug completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
