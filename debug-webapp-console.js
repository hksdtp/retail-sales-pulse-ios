// Debug script để kiểm tra webapp console
console.log('🔍 DEBUG: Checking webapp state...');

// Check localStorage
console.log('📦 LocalStorage data:');
console.log('- currentUser:', localStorage.getItem('currentUser'));
console.log('- rawTasks:', localStorage.getItem('rawTasks'));
console.log('- filteredTasks:', localStorage.getItem('filteredTasks'));

// Check if TaskDataProvider is working
console.log('🔧 TaskDataProvider state:');
if (window.React && window.React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
  console.log('React is available');
} else {
  console.log('React not found');
}

// Check Firebase connection
console.log('🔥 Firebase check:');
try {
  if (window.firebase) {
    console.log('Firebase SDK loaded');
  } else {
    console.log('Firebase SDK not found');
  }
} catch (error) {
  console.log('Firebase error:', error);
}

// Check API calls
console.log('📡 Making test API call...');
fetch('/tasks')
  .then(response => response.json())
  .then(data => {
    console.log('API /tasks response:', data);
  })
  .catch(error => {
    console.log('API error:', error);
  });

// Check if tasks are in DOM
console.log('🎯 DOM check:');
const taskElements = document.querySelectorAll('[data-testid*="task"], .task-item, .task-card');
console.log('Task elements found:', taskElements.length);

// Check for error messages
const errorElements = document.querySelectorAll('.error, [class*="error"], .alert-destructive');
console.log('Error elements found:', errorElements.length);
if (errorElements.length > 0) {
  errorElements.forEach((el, i) => {
    console.log(`Error ${i + 1}:`, el.textContent);
  });
}

// Check loading states
const loadingElements = document.querySelectorAll('.loading, [class*="loading"], .spinner');
console.log('Loading elements found:', loadingElements.length);

console.log('✅ Debug script completed. Check console for results.');
