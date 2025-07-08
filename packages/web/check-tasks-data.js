// Check tasks data in localStorage and console
import { chromium } from 'playwright';

async function checkTasksData() {
  console.log('🔍 Checking tasks data...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:8088');
    await page.waitForLoadState('networkidle');
    
    // Check localStorage data
    const localStorageData = await page.evaluate(() => {
      const rawTasks = localStorage.getItem('rawTasks');
      const tasks = localStorage.getItem('tasks');
      
      return {
        rawTasks: rawTasks ? JSON.parse(rawTasks) : null,
        tasks: tasks ? JSON.parse(tasks) : null,
        rawTasksCount: rawTasks ? JSON.parse(rawTasks).length : 0,
        tasksCount: tasks ? JSON.parse(tasks).length : 0
      };
    });
    
    console.log('📊 LocalStorage data:');
    console.log(`  - rawTasks: ${localStorageData.rawTasksCount} items`);
    console.log(`  - tasks: ${localStorageData.tasksCount} items`);
    
    if (localStorageData.rawTasks && localStorageData.rawTasks.length > 0) {
      console.log('\n📋 Sample rawTasks data:');
      localStorageData.rawTasks.slice(0, 3).forEach((task, index) => {
        console.log(`  Task ${index + 1}:`, {
          title: task.title,
          team_id: task.team_id,
          teamId: task.teamId,
          user_name: task.user_name,
          user_id: task.user_id
        });
      });
    }
    
    // Check API response
    console.log('\n🌐 Checking API response...');
    const apiResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/tasks');
        const data = await response.json();
        return data;
      } catch (error) {
        return { error: error.message };
      }
    });
    
    console.log('📊 API response:');
    console.log(`  - Success: ${apiResponse.success}`);
    console.log(`  - Count: ${apiResponse.count || 0}`);
    
    if (apiResponse.data && apiResponse.data.length > 0) {
      console.log('\n📋 Sample API tasks data:');
      apiResponse.data.slice(0, 3).forEach((task, index) => {
        console.log(`  Task ${index + 1}:`, {
          title: task.title,
          team_id: task.team_id,
          teamId: task.teamId,
          user_name: task.user_name,
          user_id: task.user_id
        });
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await browser.close();
  }
}

checkTasksData();
