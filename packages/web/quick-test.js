console.log('🧪 Quick API Test');

fetch('http://localhost:3001/tasks/manager-view?role=employee&view_level=department&department=retail')
  .then(response => {
    console.log('📊 Status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('✅ Success:', data.success);
    console.log('📋 Tasks found:', data.data?.length || 0);
    console.log('🎉 API is working correctly!');
  })
  .catch(error => {
    console.error('❌ Error:', error.message);
  });
