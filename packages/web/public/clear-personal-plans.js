
// Auto-clear personal plans localStorage for fresh start
console.log('🧹 Clearing personal plans localStorage...');

// Get all localStorage keys
const allKeys = Object.keys(localStorage);

// Find and remove personal plans keys
const personalPlanKeys = allKeys.filter(key => 
  key.startsWith('personal_plans_') || 
  key.startsWith('plan_stats_')
);

console.log('Found personal plan keys:', personalPlanKeys);

// Remove all personal plan data
personalPlanKeys.forEach(key => {
  localStorage.removeItem(key);
  console.log('Removed:', key);
});

console.log('✅ Personal plans localStorage cleared!');
console.log('📅 Ready for real data input');
