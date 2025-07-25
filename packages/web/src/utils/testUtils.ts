// Test utilities for bypassing authentication and improving test stability
export const isTestEnvironment = () => {
  return (
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      process.env.NODE_ENV === 'test' ||
      // Check for Playwright user agent
      navigator.userAgent.includes('Playwright'))
  );
};

export const getTestUser = () => ({
  id: '1', // Match với user ID trong localStorage
  name: 'Khổng Đức Mạnh',
  email: 'manh@company.com',
  role: 'retail_director' as const,
  team_id: '0',
  team: 'Phòng Kinh Doanh',
  department: 'retail',
  department_type: 'retail',
  location: 'hanoi',
  position: 'Trưởng phòng kinh doanh bán lẻ',
  status: 'active',
  password_changed: true,
});

export const getTestAuthToken = () => 'test-auth-token-12345';

export const setupTestAuth = () => {
  if (isTestEnvironment()) {
    const testUser = getTestUser();
    const testToken = getTestAuthToken();
    
    localStorage.setItem('currentUser', JSON.stringify(testUser));
    localStorage.setItem('authToken', testToken);
    localStorage.setItem('isAuthenticated', 'true');
    
    console.log('🧪 Test authentication setup completed');
    return true;
  }
  return false;
};

export const clearTestAuth = () => {
  if (isTestEnvironment()) {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    localStorage.removeItem('isAuthenticated');
    
    console.log('🧪 Test authentication cleared');
    return true;
  }
  return false;
};

// Test data selectors for improved test reliability
export const testSelectors = {
  // Login form
  loginForm: '[data-testid="login-form"]',
  userSelector: '[data-testid="user-selector"]',
  passwordInput: '[data-testid="password-input"]',
  loginButton: '[data-testid="login-submit-button"]',
  
  // Navigation
  tasksMenu: '[data-testid="tasks-menu"]',
  reportsMenu: '[data-testid="reports-menu"]',
  dashboardMenu: '[data-testid="dashboard-menu"]',
  
  // Tasks
  tasksTable: '[data-testid="tasks-table"]',
  taskRow: '[data-testid="task-row"]',
  taskEditButton: '[data-testid="task-edit-button"]',
  taskDeleteButton: '[data-testid="task-delete-button"]',
  taskDetailPanel: '.task-detail-panel',
  
  // Task creation
  createTaskButton: '[data-testid="create-task-button"]',
  taskForm: '[data-testid="task-form"]',
  taskTitleInput: '[data-testid="task-title-input"]',
  taskDescriptionInput: '[data-testid="task-description-input"]',
  
  // Common
  loadingSpinner: '[data-testid="loading-spinner"]',
  errorMessage: '[data-testid="error-message"]',
  successMessage: '[data-testid="success-message"]',
};

// Helper functions for test interactions
export const waitForElement = async (page: any, selector: string, timeout = 10000) => {
  try {
    await page.waitForSelector(selector, { timeout });
    return true;
  } catch (error) {
    console.warn(`Element not found: ${selector}`);
    return false;
  }
};

export const safeClick = async (page: any, selector: string, options = {}) => {
  try {
    const element = page.locator(selector);
    await element.waitFor({ state: 'visible', timeout: 5000 });
    await element.click({ force: true, ...options });
    return true;
  } catch (error) {
    console.warn(`Failed to click: ${selector}`, error);
    return false;
  }
};

export const safeFill = async (page: any, selector: string, value: string) => {
  try {
    const element = page.locator(selector);
    await element.waitFor({ state: 'visible', timeout: 5000 });
    await element.clear();
    await element.fill(value);
    return true;
  } catch (error) {
    console.warn(`Failed to fill: ${selector}`, error);
    return false;
  }
};

// Mock data for testing - Đã xóa dữ liệu giả, chỉ giữ cấu trúc
export const mockTasks: any[] = [];

export const addTestDataAttribute = (element: HTMLElement, testId: string) => {
  if (isTestEnvironment()) {
    element.setAttribute('data-testid', testId);
  }
};
