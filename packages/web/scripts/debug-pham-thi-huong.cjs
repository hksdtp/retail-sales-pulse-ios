#!/usr/bin/env node

/**
 * Script để debug vấn đề phân quyền của Phạm Thị Hương
 * Kiểm tra user data, tasks data, và logic phân quyền
 */

const API_BASE = 'http://localhost:3003';

async function debugPhamThiHuong() {
  console.log('🔍 DEBUGGING PHẠM THỊ HƯƠNG PERMISSION ISSUE');
  console.log('='.repeat(60));

  try {
    // 1. Kiểm tra API Server data
    console.log('\n1. 📊 KIỂM TRA API SERVER DATA:');
    console.log('-'.repeat(40));
    
    const usersResponse = await fetch(`${API_BASE}/users`);
    const usersResult = await usersResponse.json();
    
    console.log(`👥 Users trong API: ${usersResult.data?.length || 0}`);
    if (usersResult.data) {
      usersResult.data.forEach(user => {
        console.log(`   - ${user.name} (${user.email}) - Role: ${user.role}, Team: ${user.team_id}`);
      });
    }

    const tasksResponse = await fetch(`${API_BASE}/tasks`);
    const tasksResult = await tasksResponse.json();
    
    console.log(`📋 Tasks trong API: ${tasksResult.data?.length || 0}`);
    if (tasksResult.data && tasksResult.data.length > 0) {
      tasksResult.data.forEach(task => {
        console.log(`   - ${task.title} - Assigned: ${task.assignedTo}, Team: ${task.teamId}`);
      });
    }

    // 2. Kiểm tra Mock Data
    console.log('\n2. 🎭 KIỂM TRA MOCK DATA:');
    console.log('-'.repeat(40));
    
    // Import mock data
    const path = require('path');
    const mockAuthPath = path.join(__dirname, '../src/services/mockAuth.ts');
    
    console.log('Mock data location:', mockAuthPath);
    
    // Tìm Phạm Thị Hương trong mock data
    const fs = require('fs');
    const mockContent = fs.readFileSync(mockAuthPath, 'utf8');
    
    const huongMatches = mockContent.match(/Phạm Thị Hương.*?\n.*?email.*?\n.*?role.*?\n.*?team_id.*?\n/g);
    if (huongMatches) {
      console.log('✅ Tìm thấy Phạm Thị Hương trong mock data:');
      huongMatches.forEach(match => {
        console.log(match.trim());
      });
    } else {
      console.log('❌ Không tìm thấy Phạm Thị Hương trong mock data');
    }

    // 3. Thêm Phạm Thị Hương vào API Server
    console.log('\n3. ➕ THÊM PHẠM THỊ HƯƠNG VÀO API SERVER:');
    console.log('-'.repeat(40));
    
    const huongData = {
      id: 'pham_thi_huong_id',
      name: 'Phạm Thị Hương',
      email: 'huong.pham@example.com',
      role: 'team_leader',
      team_id: '5',
      location: 'Hà Nội',
      department: 'Bán lẻ',
      department_type: 'retail',
      position: 'Trưởng nhóm',
      status: 'active',
      password_changed: true
    };

    try {
      const createResponse = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(huongData)
      });

      const createResult = await createResponse.json();
      if (createResult.success) {
        console.log(`✅ Đã thêm Phạm Thị Hương vào API: ${createResult.data.id}`);
      } else {
        console.log(`❌ Lỗi thêm vào API: ${createResult.error}`);
      }
    } catch (error) {
      console.log(`❌ Lỗi khi thêm vào API: ${error.message}`);
    }

    // 4. Thêm một số tasks mẫu cho team 5
    console.log('\n4. 📋 THÊM TASKS MẪU CHO TEAM 5:');
    console.log('-'.repeat(40));
    
    const sampleTasks = [
      {
        id: 'task_team5_1',
        title: 'Khảo sát khách hàng mới - Team 5',
        description: 'Khảo sát nhu cầu của khách hàng mới tại khu vực Hà Nội',
        assignedTo: 'pham_thi_huong_id',
        teamId: '5',
        status: 'pending',
        priority: 'high',
        type: 'KTS mới',
        date: new Date().toISOString().split('T')[0],
        location: 'Hà Nội',
        user_id: 'pham_thi_huong_id',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'task_team5_2', 
        title: 'Báo cáo doanh số tuần - Team 5',
        description: 'Tổng hợp báo cáo doanh số bán hàng tuần của team',
        assignedTo: 'pham_thi_huong_id',
        teamId: '5',
        status: 'in_progress',
        priority: 'medium',
        type: 'Báo cáo',
        date: new Date().toISOString().split('T')[0],
        location: 'Hà Nội',
        user_id: 'pham_thi_huong_id',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'task_other_team',
        title: 'Công việc của team khác - Team 1',
        description: 'Đây là công việc của team 1, Phạm Thị Hương không được xem',
        assignedTo: 'Ue4vzSj1KDg4vZyXwlHJ', // Lương Việt Anh
        teamId: '1',
        status: 'pending',
        priority: 'low',
        type: 'KH/CĐT',
        date: new Date().toISOString().split('T')[0],
        location: 'Hà Nội',
        user_id: 'Ue4vzSj1KDg4vZyXwlHJ',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    for (const task of sampleTasks) {
      try {
        const taskResponse = await fetch(`${API_BASE}/tasks`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(task)
        });

        const taskResult = await taskResponse.json();
        if (taskResult.success) {
          console.log(`✅ Đã thêm task: ${task.title}`);
        } else {
          console.log(`❌ Lỗi thêm task: ${taskResult.error}`);
        }
      } catch (error) {
        console.log(`❌ Lỗi khi thêm task: ${error.message}`);
      }
    }

    // 5. Kiểm tra lại data sau khi thêm
    console.log('\n5. 🔄 KIỂM TRA LẠI DATA SAU KHI THÊM:');
    console.log('-'.repeat(40));
    
    const finalUsersResponse = await fetch(`${API_BASE}/users`);
    const finalUsersResult = await finalUsersResponse.json();
    
    console.log(`👥 Users cuối cùng: ${finalUsersResult.data?.length || 0}`);
    const huongUser = finalUsersResult.data?.find(u => u.name.includes('Phạm Thị Hương'));
    if (huongUser) {
      console.log(`✅ Phạm Thị Hương: ${huongUser.name} (ID: ${huongUser.id}, Team: ${huongUser.team_id}, Role: ${huongUser.role})`);
    }

    const finalTasksResponse = await fetch(`${API_BASE}/tasks`);
    const finalTasksResult = await finalTasksResponse.json();
    
    console.log(`📋 Tasks cuối cùng: ${finalTasksResult.data?.length || 0}`);
    if (finalTasksResult.data) {
      const team5Tasks = finalTasksResult.data.filter(t => t.teamId === '5');
      const otherTasks = finalTasksResult.data.filter(t => t.teamId !== '5');
      
      console.log(`   - Tasks của Team 5: ${team5Tasks.length}`);
      team5Tasks.forEach(task => {
        console.log(`     * ${task.title} (${task.status})`);
      });
      
      console.log(`   - Tasks của teams khác: ${otherTasks.length}`);
      otherTasks.forEach(task => {
        console.log(`     * ${task.title} (Team: ${task.teamId})`);
      });
    }

    // 6. Hướng dẫn test
    console.log('\n6. 🧪 HƯỚNG DẪN TEST:');
    console.log('-'.repeat(40));
    console.log('1. Mở trình duyệt: http://localhost:8088');
    console.log('2. Đăng nhập với:');
    console.log('   - Email: huong.pham@example.com');
    console.log('   - Password: haininh1 (admin master password)');
    console.log('3. Kiểm tra trang Tasks:');
    console.log('   - Phạm Thị Hương chỉ thấy 2 tasks của team 5');
    console.log('   - Không thấy task của team 1');
    console.log('4. Kiểm tra trang "Công việc của Nhóm":');
    console.log('   - Chỉ hiển thị tasks của team 5');
    console.log('   - Không hiển thị tasks của teams khác');

    console.log('\n✅ HOÀN THÀNH DEBUG SCRIPT!');
    
  } catch (error) {
    console.error('❌ Lỗi trong quá trình debug:', error);
  }
}

// Chạy script
debugPhamThiHuong().catch(console.error);
