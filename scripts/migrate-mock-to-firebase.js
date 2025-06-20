#!/usr/bin/env node

// Migration script: Mock API Server → Firebase Firestore
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD15K9FMm2J0Hq4yeacqL9fQ0TNK7NI7Lo",
  authDomain: "appqlgd.firebaseapp.com",
  projectId: "appqlgd",
  storageBucket: "appqlgd.appspot.com",
  messagingSenderId: "873528436407",
  appId: "1:873528436407:web:abcdefghijklmnop"
};

async function migrateMockToFirebase() {
  try {
    console.log('🔄 MIGRATION: Mock API Server → Firebase Firestore');
    console.log('================================================');

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // Step 1: Fetch data from Mock API Server
    console.log('\n📥 Step 1: Fetching data from Mock API Server...');
    
    const mockApiUrl = 'http://localhost:3003';
    
    // Fetch tasks
    const tasksResponse = await fetch(`${mockApiUrl}/tasks`);
    const tasksData = await tasksResponse.json();
    
    if (!tasksData.success) {
      throw new Error('Failed to fetch tasks from Mock API');
    }
    
    const mockTasks = tasksData.data;
    console.log(`✅ Fetched ${mockTasks.length} tasks from Mock API`);

    // Fetch users
    const usersResponse = await fetch(`${mockApiUrl}/users`);
    const usersData = await usersResponse.json();
    
    if (!usersData.success) {
      throw new Error('Failed to fetch users from Mock API');
    }
    
    const mockUsers = usersData.data;
    console.log(`✅ Fetched ${mockUsers.length} users from Mock API`);

    // Step 2: Check existing Firebase data
    console.log('\n📊 Step 2: Checking existing Firebase data...');
    
    const existingTasksSnapshot = await getDocs(collection(db, 'tasks'));
    const existingUsersSnapshot = await getDocs(collection(db, 'users'));
    
    console.log(`📋 Existing Firebase tasks: ${existingTasksSnapshot.size}`);
    console.log(`👥 Existing Firebase users: ${existingUsersSnapshot.size}`);

    // Step 3: Ask for confirmation if data exists
    if (existingTasksSnapshot.size > 0 || existingUsersSnapshot.size > 0) {
      console.log('\n⚠️  WARNING: Firebase already contains data!');
      console.log('This migration will:');
      console.log('1. DELETE all existing Firebase data');
      console.log('2. REPLACE with Mock API data');
      console.log('\nTo proceed, run with --force flag:');
      console.log('node scripts/migrate-mock-to-firebase.js --force');
      
      if (!process.argv.includes('--force')) {
        console.log('\n❌ Migration cancelled for safety');
        return;
      }
    }

    // Step 4: Clear existing Firebase data (if forced)
    if (process.argv.includes('--force')) {
      console.log('\n🗑️  Step 4: Clearing existing Firebase data...');
      
      // Delete existing tasks
      for (const doc of existingTasksSnapshot.docs) {
        await deleteDoc(doc.ref);
      }
      console.log(`✅ Deleted ${existingTasksSnapshot.size} existing tasks`);
      
      // Delete existing users
      for (const doc of existingUsersSnapshot.docs) {
        await deleteDoc(doc.ref);
      }
      console.log(`✅ Deleted ${existingUsersSnapshot.size} existing users`);
    }

    // Step 5: Migrate tasks to Firebase
    console.log('\n📤 Step 5: Migrating tasks to Firebase...');
    
    let tasksMigrated = 0;
    for (const task of mockTasks) {
      try {
        // Clean up task data for Firebase
        const firebaseTask = {
          ...task,
          createdAt: new Date(),
          updatedAt: new Date(),
          source: 'mock_api_migration'
        };
        
        await addDoc(collection(db, 'tasks'), firebaseTask);
        tasksMigrated++;
      } catch (error) {
        console.error(`❌ Failed to migrate task ${task.id}:`, error.message);
      }
    }
    
    console.log(`✅ Migrated ${tasksMigrated}/${mockTasks.length} tasks`);

    // Step 6: Migrate users to Firebase
    console.log('\n👥 Step 6: Migrating users to Firebase...');
    
    let usersMigrated = 0;
    for (const user of mockUsers) {
      try {
        // Clean up user data for Firebase
        const firebaseUser = {
          ...user,
          createdAt: new Date(),
          updatedAt: new Date(),
          source: 'mock_api_migration'
        };
        
        await addDoc(collection(db, 'users'), firebaseUser);
        usersMigrated++;
      } catch (error) {
        console.error(`❌ Failed to migrate user ${user.id}:`, error.message);
      }
    }
    
    console.log(`✅ Migrated ${usersMigrated}/${mockUsers.length} users`);

    // Step 7: Verification
    console.log('\n✅ Step 7: Verifying migration...');
    
    const newTasksSnapshot = await getDocs(collection(db, 'tasks'));
    const newUsersSnapshot = await getDocs(collection(db, 'users'));
    
    console.log(`📋 Firebase tasks after migration: ${newTasksSnapshot.size}`);
    console.log(`👥 Firebase users after migration: ${newUsersSnapshot.size}`);

    // Summary
    console.log('\n🎉 MIGRATION COMPLETED SUCCESSFULLY!');
    console.log('=====================================');
    console.log(`✅ Tasks migrated: ${tasksMigrated}`);
    console.log(`✅ Users migrated: ${usersMigrated}`);
    console.log('\n📝 Next steps:');
    console.log('1. Update App.tsx to use FirebaseTaskDataProvider');
    console.log('2. Test the application with Firebase data');
    console.log('3. Update environment configuration if needed');

  } catch (error) {
    console.error('\n❌ MIGRATION FAILED:');
    console.error('Error:', error.message);
    
    if (error.message.includes('fetch')) {
      console.log('\n💡 Make sure Mock API Server is running:');
      console.log('   cd packages/api-server && npm start');
    }
    
    if (error.message.includes('permission')) {
      console.log('\n💡 Check Firebase security rules:');
      console.log('   Firebase Console > Firestore > Rules');
    }
  }
}

// Run migration
migrateMockToFirebase();
