#!/usr/bin/env node

/**
 * Firebase to Supabase Migration Script
 * Migrates data from Firebase export to Supabase PostgreSQL
 * 
 * Usage: node firebase-to-supabase-migration.js
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Configuration
const SUPABASE_URL = 'https://fnakxavwxubnbucfoujd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuYWt4YXZ3eHVibmJ1Y2ZvdWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU0NzI4NzQsImV4cCI6MjA1MTA0ODg3NH0.VGvp7zOmOdJOKOhJOqOqOqOqOqOqOqOqOqOqOqOqOqO';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Firebase data file path
const FIREBASE_DATA_FILE = './packages/web/scripts/firebase-data-export.json';

/**
 * Utility functions
 */
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: '📋',
    success: '✅',
    error: '❌',
    warning: '⚠️'
  }[type] || '📋';
  
  console.log(`${prefix} [${timestamp}] ${message}`);
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Transform Firebase timestamp to ISO string
 */
function transformTimestamp(timestamp) {
  if (!timestamp) return new Date().toISOString();
  
  if (timestamp._seconds) {
    return new Date(timestamp._seconds * 1000).toISOString();
  }
  
  if (typeof timestamp === 'string') {
    return new Date(timestamp).toISOString();
  }
  
  return new Date().toISOString();
}

/**
 * Load Firebase data from export file
 */
function loadFirebaseData() {
  try {
    log('Loading Firebase data from export file...');
    
    if (!fs.existsSync(FIREBASE_DATA_FILE)) {
      throw new Error(`Firebase data file not found: ${FIREBASE_DATA_FILE}`);
    }
    
    const rawData = fs.readFileSync(FIREBASE_DATA_FILE, 'utf8');
    const data = JSON.parse(rawData);
    
    log(`Loaded Firebase data: ${data.summary?.total_tasks || 0} tasks, ${data.summary?.total_users || 0} users, ${data.summary?.total_teams || 0} teams`, 'success');
    
    return data;
  } catch (error) {
    log(`Error loading Firebase data: ${error.message}`, 'error');
    throw error;
  }
}

/**
 * Create ID mapping for Firebase to Supabase migration
 */
function createIdMapping(firebaseData) {
  const mapping = {
    users: new Map(),
    teams: new Map(),
    tasks: new Map()
  };
  
  // Create UUID mappings for users
  if (firebaseData.users) {
    firebaseData.users.forEach(user => {
      const newId = generateUUID();
      mapping.users.set(user.id, newId);
    });
  }
  
  // Create UUID mappings for teams
  if (firebaseData.teams) {
    firebaseData.teams.forEach(team => {
      const newId = generateUUID();
      mapping.teams.set(team.id, newId);
    });
  }
  
  // Create UUID mappings for tasks
  if (firebaseData.tasks) {
    firebaseData.tasks.forEach(task => {
      const newId = generateUUID();
      mapping.tasks.set(task.id, newId);
    });
  }
  
  log(`Created ID mappings: ${mapping.users.size} users, ${mapping.teams.size} teams, ${mapping.tasks.size} tasks`);
  
  return mapping;
}

/**
 * Transform and migrate teams
 */
async function migrateTeams(firebaseData, idMapping) {
  log('Migrating teams...');
  
  if (!firebaseData.teams || firebaseData.teams.length === 0) {
    log('No teams to migrate', 'warning');
    return;
  }
  
  const transformedTeams = firebaseData.teams.map(team => ({
    id: idMapping.teams.get(team.id),
    name: team.name,
    leader_id: idMapping.users.get(team.leader_id) || null,
    location: team.location,
    description: team.description,
    department: team.department || 'retail',
    department_type: team.department_type || 'retail',
    created_at: transformTimestamp(team.created_at),
    updated_at: transformTimestamp(team.updated_at)
  }));
  
  // Insert teams in batches
  const batchSize = 10;
  for (let i = 0; i < transformedTeams.length; i += batchSize) {
    const batch = transformedTeams.slice(i, i + batchSize);
    
    const { data, error } = await supabase
      .from('teams')
      .upsert(batch, { onConflict: 'id' });
    
    if (error) {
      log(`Error inserting teams batch ${i / batchSize + 1}: ${error.message}`, 'error');
      throw error;
    }
    
    log(`Inserted teams batch ${i / batchSize + 1}: ${batch.length} teams`);
  }
  
  log(`Successfully migrated ${transformedTeams.length} teams`, 'success');
}

/**
 * Transform and migrate users
 */
async function migrateUsers(firebaseData, idMapping) {
  log('Migrating users...');
  
  if (!firebaseData.users || firebaseData.users.length === 0) {
    log('No users to migrate', 'warning');
    return;
  }
  
  const transformedUsers = firebaseData.users.map(user => ({
    id: idMapping.users.get(user.id),
    firebase_id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    team_id: idMapping.teams.get(user.team_id) || null,
    location: user.location,
    department: user.department || 'retail',
    department_type: user.department_type || 'retail',
    position: user.position,
    status: user.status || 'active',
    password_changed: user.password_changed || false,
    temp_password: user.password || '123456', // Store temporarily
    created_at: transformTimestamp(user.created_at),
    updated_at: transformTimestamp(user.updated_at)
  }));
  
  // Insert users in batches
  const batchSize = 10;
  for (let i = 0; i < transformedUsers.length; i += batchSize) {
    const batch = transformedUsers.slice(i, i + batchSize);
    
    const { data, error } = await supabase
      .from('users')
      .upsert(batch, { onConflict: 'id' });
    
    if (error) {
      log(`Error inserting users batch ${i / batchSize + 1}: ${error.message}`, 'error');
      throw error;
    }
    
    log(`Inserted users batch ${i / batchSize + 1}: ${batch.length} users`);
  }
  
  log(`Successfully migrated ${transformedUsers.length} users`, 'success');
}

/**
 * Transform and migrate tasks
 */
async function migrateTasks(firebaseData, idMapping) {
  log('Migrating tasks...');
  
  if (!firebaseData.tasks || firebaseData.tasks.length === 0) {
    log('No tasks to migrate', 'warning');
    return;
  }
  
  const transformedTasks = firebaseData.tasks.map(task => ({
    id: idMapping.tasks.get(task.id),
    firebase_id: task.id,
    title: task.title,
    description: task.description,
    type: task.type,
    date: task.date,
    time: task.time,
    status: task.status || 'todo',
    priority: task.priority || 'normal',
    progress: task.progress || 0,
    is_new: task.isNew !== undefined ? task.isNew : true,
    location: task.location,
    team_id: idMapping.teams.get(task.teamId || task.team_id) || null,
    assigned_to: idMapping.users.get(task.assignedTo) || null,
    user_id: idMapping.users.get(task.user_id),
    user_name: task.user_name,
    visibility: task.visibility || 'personal',
    shared_with: task.sharedWith ? task.sharedWith.map(id => idMapping.users.get(id)).filter(Boolean) : [],
    is_shared: task.isShared || false,
    created_at: transformTimestamp(task.created_at),
    updated_at: transformTimestamp(task.updated_at)
  })).filter(task => task.user_id); // Only include tasks with valid user_id
  
  // Insert tasks in batches
  const batchSize = 10;
  for (let i = 0; i < transformedTasks.length; i += batchSize) {
    const batch = transformedTasks.slice(i, i + batchSize);
    
    const { data, error } = await supabase
      .from('tasks')
      .upsert(batch, { onConflict: 'id' });
    
    if (error) {
      log(`Error inserting tasks batch ${i / batchSize + 1}: ${error.message}`, 'error');
      throw error;
    }
    
    log(`Inserted tasks batch ${i / batchSize + 1}: ${batch.length} tasks`);
  }
  
  log(`Successfully migrated ${transformedTasks.length} tasks`, 'success');
}

/**
 * Verify migration data integrity
 */
async function verifyMigration(firebaseData, idMapping) {
  log('Verifying migration data integrity...');
  
  try {
    // Count records in Supabase
    const [usersResult, teamsResult, tasksResult] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('teams').select('id', { count: 'exact', head: true }),
      supabase.from('tasks').select('id', { count: 'exact', head: true })
    ]);
    
    const supabaseCounts = {
      users: usersResult.count || 0,
      teams: teamsResult.count || 0,
      tasks: tasksResult.count || 0
    };
    
    const firebaseCounts = {
      users: firebaseData.users?.length || 0,
      teams: firebaseData.teams?.length || 0,
      tasks: firebaseData.tasks?.length || 0
    };
    
    log('Migration verification results:');
    log(`Users: Firebase ${firebaseCounts.users} → Supabase ${supabaseCounts.users}`);
    log(`Teams: Firebase ${firebaseCounts.teams} → Supabase ${supabaseCounts.teams}`);
    log(`Tasks: Firebase ${firebaseCounts.tasks} → Supabase ${supabaseCounts.tasks}`);
    
    // Check for discrepancies
    const discrepancies = [];
    if (supabaseCounts.users !== firebaseCounts.users) {
      discrepancies.push(`Users count mismatch: ${firebaseCounts.users} vs ${supabaseCounts.users}`);
    }
    if (supabaseCounts.teams !== firebaseCounts.teams) {
      discrepancies.push(`Teams count mismatch: ${firebaseCounts.teams} vs ${supabaseCounts.teams}`);
    }
    if (supabaseCounts.tasks !== firebaseCounts.tasks) {
      discrepancies.push(`Tasks count mismatch: ${firebaseCounts.tasks} vs ${supabaseCounts.tasks}`);
    }
    
    if (discrepancies.length > 0) {
      log('Migration discrepancies found:', 'warning');
      discrepancies.forEach(d => log(`  - ${d}`, 'warning'));
    } else {
      log('Migration verification successful - all counts match!', 'success');
    }
    
    return discrepancies.length === 0;
    
  } catch (error) {
    log(`Error verifying migration: ${error.message}`, 'error');
    return false;
  }
}

/**
 * Save ID mapping for reference
 */
function saveIdMapping(idMapping) {
  const mappingData = {
    timestamp: new Date().toISOString(),
    users: Object.fromEntries(idMapping.users),
    teams: Object.fromEntries(idMapping.teams),
    tasks: Object.fromEntries(idMapping.tasks)
  };
  
  const mappingFile = './firebase-supabase-id-mapping.json';
  fs.writeFileSync(mappingFile, JSON.stringify(mappingData, null, 2));
  
  log(`ID mapping saved to: ${mappingFile}`, 'success');
}

/**
 * Main migration function
 */
async function runMigration() {
  try {
    log('🚀 Starting Firebase to Supabase migration...');
    
    // Load Firebase data
    const firebaseData = loadFirebaseData();
    
    // Create ID mappings
    const idMapping = createIdMapping(firebaseData);
    
    // Save ID mapping for reference
    saveIdMapping(idMapping);
    
    // Migrate data in order (teams first, then users, then tasks)
    await migrateTeams(firebaseData, idMapping);
    await migrateUsers(firebaseData, idMapping);
    await migrateTasks(firebaseData, idMapping);
    
    // Verify migration
    const verificationSuccess = await verifyMigration(firebaseData, idMapping);
    
    if (verificationSuccess) {
      log('🎉 Migration completed successfully!', 'success');
    } else {
      log('⚠️ Migration completed with discrepancies - please review', 'warning');
    }
    
    log('Migration summary:');
    log(`- Teams: ${firebaseData.teams?.length || 0} migrated`);
    log(`- Users: ${firebaseData.users?.length || 0} migrated`);
    log(`- Tasks: ${firebaseData.tasks?.length || 0} migrated`);
    log(`- ID mapping saved for reference`);
    
  } catch (error) {
    log(`Migration failed: ${error.message}`, 'error');
    console.error(error);
    process.exit(1);
  }
}

// Run migration if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration();
}

export { runMigration };
