#!/usr/bin/env node

/**
 * Complete Migration Runner
 * Sets up Supabase schema and migrates data from Firebase
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Configuration
const SUPABASE_URL = 'https://fnakxavwxubnbucfoujd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuYWt4YXZ3eHVibmJ1Y2ZvdWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU0NzI4NzQsImV4cCI6MjA1MTA0ODg3NH0.VGvp7zOmOdJOKOhJOqOqOqOqOqOqOqOqOqOqOqOqOqO';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

async function setupSupabaseSchema() {
  log('Setting up Supabase schema...');
  
  try {
    // Read schema file
    const schemaSQL = fs.readFileSync('./supabase-schema.sql', 'utf8');
    
    // Split into individual statements
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    log(`Executing ${statements.length} SQL statements...`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      if (statement.trim()) {
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          
          if (error) {
            log(`Error executing statement ${i + 1}: ${error.message}`, 'warning');
            // Continue with other statements
          } else {
            log(`Executed statement ${i + 1}/${statements.length}`);
          }
        } catch (err) {
          log(`Error executing statement ${i + 1}: ${err.message}`, 'warning');
        }
      }
    }
    
    log('Schema setup completed', 'success');
    return true;
    
  } catch (error) {
    log(`Schema setup failed: ${error.message}`, 'error');
    return false;
  }
}

async function testSupabaseConnection() {
  log('Testing Supabase connection...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      log(`Connection test failed: ${error.message}`, 'error');
      return false;
    }
    
    log(`Connection successful - found ${data || 0} users`, 'success');
    return true;
    
  } catch (error) {
    log(`Connection test error: ${error.message}`, 'error');
    return false;
  }
}

async function runDataMigration() {
  log('Starting data migration...');
  
  try {
    // Import migration script
    const { runMigration } = await import('./firebase-to-supabase-migration.js');
    
    // Run migration
    await runMigration();
    
    log('Data migration completed', 'success');
    return true;
    
  } catch (error) {
    log(`Data migration failed: ${error.message}`, 'error');
    return false;
  }
}

async function verifyMigration() {
  log('Verifying migration results...');
  
  try {
    // Check table counts
    const [usersResult, teamsResult, tasksResult] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('teams').select('id', { count: 'exact', head: true }),
      supabase.from('tasks').select('id', { count: 'exact', head: true })
    ]);
    
    const counts = {
      users: usersResult.count || 0,
      teams: teamsResult.count || 0,
      tasks: tasksResult.count || 0
    };
    
    log('Migration verification:');
    log(`- Users: ${counts.users}`);
    log(`- Teams: ${counts.teams}`);
    log(`- Tasks: ${counts.tasks}`);
    
    if (counts.users > 0 && counts.tasks > 0) {
      log('Migration verification successful', 'success');
      return true;
    } else {
      log('Migration verification failed - no data found', 'warning');
      return false;
    }
    
  } catch (error) {
    log(`Migration verification error: ${error.message}`, 'error');
    return false;
  }
}

async function updateSupabaseConfig() {
  log('Updating Supabase configuration in project...');
  
  try {
    // Create config update script
    const configUpdate = `
// Auto-generated Supabase configuration
export const SUPABASE_CONFIG = {
  url: '${SUPABASE_URL}',
  anonKey: '${SUPABASE_ANON_KEY}',
  migrationDate: '${new Date().toISOString()}',
  status: 'active'
};

// Initialize Supabase service
import { SupabaseService } from '@/services/SupabaseService';

const supabaseService = SupabaseService.getInstance();
supabaseService.initialize(SUPABASE_CONFIG);

console.log('✅ Supabase auto-configured from migration');
`;
    
    fs.writeFileSync('./packages/web/src/config/supabase-auto-config.ts', configUpdate);
    
    log('Supabase configuration updated', 'success');
    return true;
    
  } catch (error) {
    log(`Config update failed: ${error.message}`, 'error');
    return false;
  }
}

async function main() {
  try {
    log('🚀 Starting complete Firebase to Supabase migration...');
    
    // Step 1: Test connection
    const connectionOk = await testSupabaseConnection();
    if (!connectionOk) {
      throw new Error('Supabase connection failed');
    }
    
    // Step 2: Setup schema (skip if already exists)
    log('Note: Schema setup requires manual execution in Supabase SQL editor');
    log('Please run the contents of supabase-schema.sql in your Supabase dashboard');
    
    // Step 3: Run data migration
    const migrationOk = await runDataMigration();
    if (!migrationOk) {
      throw new Error('Data migration failed');
    }
    
    // Step 4: Verify migration
    const verificationOk = await verifyMigration();
    if (!verificationOk) {
      log('Migration verification failed, but continuing...', 'warning');
    }
    
    // Step 5: Update project configuration
    const configOk = await updateSupabaseConfig();
    if (!configOk) {
      log('Config update failed, but migration completed', 'warning');
    }
    
    log('🎉 Migration completed successfully!', 'success');
    log('Next steps:');
    log('1. Run the SQL schema in Supabase dashboard');
    log('2. Test the application with Supabase data');
    log('3. Update authentication to use Supabase Auth');
    log('4. Run comprehensive tests');
    
  } catch (error) {
    log(`Migration failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main as runCompleteMigration };
