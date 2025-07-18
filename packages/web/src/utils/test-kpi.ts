// Test KPI calculation with sample data

export const testKpiCalculation = () => {
  console.log('🧪 Testing KPI Calculation...');
  
  // Sample tasks data
  const sampleTasks = [
    // KTS tasks
    { id: '1', type: 'architect_new', status: 'completed', title: 'KTS mới 1' },
    { id: '2', type: 'architect_new', status: 'in-progress', title: 'KTS mới 2' },
    { id: '3', type: 'architect_old', status: 'completed', title: 'KTS cũ 1' },
    
    // Partner tasks
    { id: '4', type: 'partner_new', status: 'completed', title: 'Đối tác mới 1' },
    { id: '5', type: 'partner_old', status: 'todo', title: 'Đối tác cũ 1' },
    
    // Client tasks
    { id: '6', type: 'client_new', status: 'completed', title: 'Khách hàng mới 1' },
    { id: '7', type: 'client_new', status: 'in-progress', title: 'Khách hàng mới 2' },
    { id: '8', type: 'client_old', status: 'on-hold', title: 'Khách hàng cũ 1' },
    
    // Quote tasks
    { id: '9', type: 'quote_new', status: 'completed', title: 'Báo giá mới 1' },
    { id: '10', type: 'quote_old', status: 'todo', title: 'Báo giá cũ 1' },
    
    // Other tasks
    { id: '11', type: 'other', status: 'completed', title: 'Công việc khác 1' },
    { id: '12', type: 'other', status: 'in-progress', title: 'Công việc khác 2' },
  ];

  // Test KPI calculation function
  const calculateTaskKpiByCategory = (tasks: any[], taskTypes: string[]) => {
    const categoryTasks = tasks.filter(task => taskTypes.includes(task.type));

    const total = categoryTasks.length;
    const completed = categoryTasks.filter(task => task.status === 'completed').length;
    const inProgress = categoryTasks.filter(task => task.status === 'in-progress').length;
    const onHold = categoryTasks.filter(task => task.status === 'on-hold').length;
    const todo = categoryTasks.filter(task => task.status === 'todo').length;

    return {
      total,
      completed,
      inProgress,
      onHold,
      todo,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      taskTypes: taskTypes,
      breakdown: taskTypes.map(type => ({
        type,
        count: categoryTasks.filter(task => task.type === type).length,
        completed: categoryTasks.filter(task => task.type === type && task.status === 'completed').length
      }))
    };
  };

  // Test each category
  console.log('📊 KTS KPI:', calculateTaskKpiByCategory(sampleTasks, ['architect_new', 'architect_old']));
  console.log('📊 Đối tác KPI:', calculateTaskKpiByCategory(sampleTasks, ['partner_new', 'partner_old']));
  console.log('📊 Khách hàng KPI:', calculateTaskKpiByCategory(sampleTasks, ['client_new', 'client_old']));
  console.log('📊 Báo giá KPI:', calculateTaskKpiByCategory(sampleTasks, ['quote_new', 'quote_old']));
  console.log('📊 Công việc khác KPI:', calculateTaskKpiByCategory(sampleTasks, ['other']));

  // Expected results:
  
  console.log('- KTS: Total=3, Completed=2, InProgress=1, OnHold=0, Todo=0, Rate=67%');
  console.log('- Đối tác: Total=2, Completed=1, InProgress=0, OnHold=0, Todo=1, Rate=50%');
  console.log('- Khách hàng: Total=3, Completed=1, InProgress=1, OnHold=1, Todo=0, Rate=33%');
  console.log('- Báo giá: Total=2, Completed=1, InProgress=0, OnHold=0, Todo=1, Rate=50%');
  console.log('- Công việc khác: Total=2, Completed=1, InProgress=1, OnHold=0, Todo=0, Rate=50%');
};

// Test task type display
export const testTaskTypeDisplay = () => {
  console.log('🎨 Testing Task Type Display...');
  
  const getTaskTypeName = (type: string) => {
    const typeMapping = {
      'partner_new': 'Đối tác mới',
      'partner_old': 'Đối tác cũ',
      'architect_new': 'KTS mới',
      'architect_old': 'KTS cũ',
      'client_new': 'Khách hàng mới',
      'client_old': 'Khách hàng cũ',
      'quote_new': 'Báo giá mới',
      'quote_old': 'Báo giá cũ',
      'other': 'Công việc khác'
    };
    return typeMapping[type as keyof typeof typeMapping] || type;
  };

  const taskTypes = ['partner_new', 'architect_old', 'client_new', 'quote_old', 'other'];
  
  taskTypes.forEach(type => {
    console.log(`${type} → ${getTaskTypeName(type)}`);
  });
};

// Run tests
if (typeof window !== 'undefined') {
  (window as any).testKPI = testKpiCalculation;
  (window as any).testTaskTypeDisplay = testTaskTypeDisplay;
  console.log('🧪 Test functions available: testKPI(), testTaskTypeDisplay()');
}
