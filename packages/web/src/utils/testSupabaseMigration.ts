import { SupabaseService } from '@/services/SupabaseService';

export interface MigrationTestResult {
  success: boolean;
  tests: {
    connection: boolean;
    authentication: boolean;
    users: boolean;
    teams: boolean;
    tasks: boolean;
  };
  errors: string[];
  details: Record<string, any>;
}

export const testSupabaseMigration = async (): Promise<MigrationTestResult> => {
  const result: MigrationTestResult = {
    success: false,
    tests: {
      connection: false,
      authentication: false,
      users: false,
      teams: false,
      tasks: false,
    },
    errors: [],
    details: {},
  };

  try {
    console.log('🧪 Starting Supabase migration test...');
    
    const supabaseService = SupabaseService.getInstance();

    // Test 1: Connection
    console.log('🔗 Testing connection...');
    try {
      const connectionTest = await supabaseService.testConnection();
      result.tests.connection = connectionTest;
      result.details.connection = { connected: connectionTest };
      
      if (!connectionTest) {
        result.errors.push('Failed to connect to Supabase');
      }
    } catch (error) {
      result.errors.push(`Connection test failed: ${error.message}`);
    }

    // Test 2: Authentication (if connection works)
    if (result.tests.connection) {
      console.log('🔐 Testing authentication...');
      try {
        // Try to get current session
        const user = await supabaseService.getCurrentUser();
        result.tests.authentication = true;
        result.details.authentication = { 
          hasUser: !!user,
          userId: user?.id || null 
        };
      } catch (error) {
        result.errors.push(`Authentication test failed: ${error.message}`);
      }
    }

    // Test 3: Users table
    console.log('👥 Testing users table...');
    try {
      const users = await supabaseService.getUsers();
      result.tests.users = Array.isArray(users);
      result.details.users = { 
        count: users.length,
        sample: users.slice(0, 2).map(u => ({ id: u.id, name: u.name, email: u.email }))
      };
      
      if (!Array.isArray(users)) {
        result.errors.push('Users table test failed - not an array');
      }
    } catch (error) {
      result.errors.push(`Users table test failed: ${error.message}`);
    }

    // Test 4: Teams table
    console.log('🏢 Testing teams table...');
    try {
      const teams = await supabaseService.getTeams();
      result.tests.teams = Array.isArray(teams);
      result.details.teams = { 
        count: teams.length,
        sample: teams.slice(0, 2).map(t => ({ id: t.id, name: t.name }))
      };
      
      if (!Array.isArray(teams)) {
        result.errors.push('Teams table test failed - not an array');
      }
    } catch (error) {
      result.errors.push(`Teams table test failed: ${error.message}`);
    }

    // Test 5: Tasks table
    console.log('📋 Testing tasks table...');
    try {
      const tasks = await supabaseService.getTasks();
      result.tests.tasks = Array.isArray(tasks);
      result.details.tasks = { 
        count: tasks.length,
        sample: tasks.slice(0, 2).map(t => ({ id: t.id, title: t.title, status: t.status }))
      };
      
      if (!Array.isArray(tasks)) {
        result.errors.push('Tasks table test failed - not an array');
      }
    } catch (error) {
      result.errors.push(`Tasks table test failed: ${error.message}`);
    }

    // Overall success
    result.success = Object.values(result.tests).every(test => test === true);

    console.log('🧪 Migration test completed:', result);
    return result;

  } catch (error) {
    result.errors.push(`Migration test failed: ${error.message}`);
    console.error('❌ Migration test error:', error);
    return result;
  }
};

// Test specific operations
export const testSupabaseOperations = async () => {
  console.log('🔧 Testing Supabase CRUD operations...');
  
  const supabaseService = SupabaseService.getInstance();
  
  try {
    // Test adding a task
    const testTask = {
      title: 'Test Task from Migration',
      description: 'This is a test task created during migration testing',
      status: 'pending',
      priority: 'low',
      type: 'test',
      assigned_to: 'user_1',
      created_by: 'user_1',
      team_id: 'team_1',
      tags: ['test', 'migration']
    };

    console.log('➕ Testing add task...');
    const addedTask = await supabaseService.addTask(testTask);
    
    if (addedTask) {
      console.log('✅ Task added successfully:', addedTask.id);
      
      // Test updating the task
      console.log('✏️ Testing update task...');
      const updatedTask = await supabaseService.updateTask(addedTask.id, {
        status: 'completed',
        description: 'Updated during migration test'
      });
      
      if (updatedTask) {
        console.log('✅ Task updated successfully');
        
        // Test deleting the task
        console.log('🗑️ Testing delete task...');
        const deleted = await supabaseService.deleteTask(addedTask.id);
        
        if (deleted) {
          console.log('✅ Task deleted successfully');
        } else {
          console.error('❌ Failed to delete test task');
        }
      } else {
        console.error('❌ Failed to update test task');
      }
    } else {
      console.error('❌ Failed to add test task');
    }
    
  } catch (error) {
    console.error('❌ CRUD operations test failed:', error);
  }
};

// Expose to window for console testing
if (typeof window !== 'undefined') {
  (window as any).testSupabaseMigration = testSupabaseMigration;
  (window as any).testSupabaseOperations = testSupabaseOperations;
}
