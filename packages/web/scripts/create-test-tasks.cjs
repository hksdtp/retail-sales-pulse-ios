const fetch = require('node-fetch');

const API_BASE = 'https://api-adwc442mha-uc.a.run.app';

// Dữ liệu trống - sẵn sàng cho production
const testTasks = [];

async function createTestTasks() {
  console.log('🚀 Creating test tasks...');

  for (let i = 0; i < testTasks.length; i++) {
    const task = testTasks[i];

    try {
      console.log(`📝 Creating task ${i + 1}/${testTasks.length}: ${task.title}`);

      const response = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(task),
      });

      const result = await response.json();

      if (result.success) {
        console.log(`✅ Created: ${task.title} (assigned to: ${task.assignedTo})`);
      } else {
        console.error(`❌ Failed to create: ${task.title}`, result.error);
      }

      // Delay để tránh rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`❌ Error creating task: ${task.title}`, error.message);
    }
  }

  console.log('🎉 Test tasks creation completed!');
}

// Run the script
createTestTasks().catch(console.error);
