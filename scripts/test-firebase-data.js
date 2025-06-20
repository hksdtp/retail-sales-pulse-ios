#!/usr/bin/env node

// Test Firebase Firestore data
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, connectFirestoreEmulator } from 'firebase/firestore';

// Firebase configuration (same as in config/firebase.ts)
const firebaseConfig = {
  apiKey: "AIzaSyD15K9FMm2J0Hq4yeacqL9fQ0TNK7NI7Lo",
  authDomain: "appqlgd.firebaseapp.com",
  projectId: "appqlgd",
  storageBucket: "appqlgd.appspot.com",
  messagingSenderId: "873528436407",
  appId: "1:873528436407:web:abcdefghijklmnop"
};

async function testFirebaseData() {
  try {
    console.log('🔥 Testing Firebase Firestore Connection...');
    console.log('==========================================');

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    console.log('✅ Firebase initialized successfully');
    console.log('📊 Project ID:', firebaseConfig.projectId);

    // Test connection by trying to read tasks collection
    console.log('\n📋 Attempting to read "tasks" collection...');
    
    const tasksRef = collection(db, 'tasks');
    const tasksSnapshot = await getDocs(tasksRef);
    
    if (tasksSnapshot.empty) {
      console.log('⚠️  Tasks collection is empty or does not exist');
    } else {
      console.log(`✅ Found ${tasksSnapshot.size} tasks in Firestore`);
      
      const tasks = [];
      tasksSnapshot.forEach((doc) => {
        tasks.push({
          id: doc.id,
          ...doc.data()
        });
      });

      console.log('\n📊 Tasks summary:');
      console.log('- Total tasks:', tasks.length);
      
      // Group by user
      const tasksByUser = tasks.reduce((acc, task) => {
        const user = task.user_name || task.assignedTo || 'Unknown';
        acc[user] = (acc[user] || 0) + 1;
        return acc;
      }, {});
      
      console.log('- Tasks by user:', tasksByUser);
      
      // Group by status
      const tasksByStatus = tasks.reduce((acc, task) => {
        const status = task.status || 'unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});
      
      console.log('- Tasks by status:', tasksByStatus);
      
      // Show first few tasks
      console.log('\n📝 Sample tasks:');
      tasks.slice(0, 3).forEach((task, index) => {
        console.log(`${index + 1}. ${task.title || 'No title'} (${task.status || 'no status'})`);
      });
    }

    // Test users collection
    console.log('\n👥 Attempting to read "users" collection...');
    
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    
    if (usersSnapshot.empty) {
      console.log('⚠️  Users collection is empty or does not exist');
    } else {
      console.log(`✅ Found ${usersSnapshot.size} users in Firestore`);
    }

    console.log('\n🎉 Firebase connection test completed successfully!');

  } catch (error) {
    console.error('❌ Firebase connection test failed:');
    console.error('Error:', error.message);
    
    if (error.code) {
      console.error('Error code:', error.code);
    }
    
    if (error.message.includes('permission-denied')) {
      console.log('\n💡 This might be due to Firestore security rules.');
      console.log('   Check Firebase Console > Firestore > Rules');
    }
    
    if (error.message.includes('not-found')) {
      console.log('\n💡 The project or collection might not exist.');
      console.log('   Check Firebase Console > Project Settings');
    }
  }
}

// Run the test
testFirebaseData();
