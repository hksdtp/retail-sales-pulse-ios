# 🎯 Hướng Dẫn Thực Hành Stagewise - Từng Bước Chi Tiết

Ninh ơi, đây là hướng dẫn thực hành cụ thể để sử dụng Stagewise trong dự án retail-sales-pulse-ios.

---

## 🚀 **BƯỚC 1: SETUP HOÀN CHỈNH (5 phút)**

### **1.1 Kiểm tra Development Server:**
```bash
# Terminal 1: Start web app
cd packages/web
npm run dev

# Verify app running at: http://localhost:8088
```

### **1.2 Install VS Code Extension:**
1. **Mở VS Code/Cursor**
2. **Extensions** (Ctrl+Shift+X)
3. **Search:** `stagewise.stagewise-vscode-extension`
4. **Install** và **Restart VS Code**

### **1.3 Verify Stagewise Loading:**
1. **Mở browser:** http://localhost:8088
2. **F12** → Console tab
3. **Look for logs:**
```
🚀 [Stagewise] Starting initialization...
✅ [Stagewise] Packages loaded successfully
✅ [Stagewise] Toolbar initialized successfully!
```

---

## 🎨 **BƯỚC 2: FIRST VISUAL CODING EXPERIENCE**

### **2.1 Simple Styling Change:**

#### **Target:** Login button
1. **Navigate to:** http://localhost:8088/login
2. **Find login button** (blue "Đăng nhập" button)
3. **Right-click** → **Inspect Element**
4. **In Stagewise toolbar** (should appear), type:
```
"Change this button color from blue to green"
```
5. **Press Enter** hoặc **Click Send**

#### **Expected AI Response:**
```tsx
// AI sẽ suggest thay đổi trong LoginForm.tsx:
className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
```

### **2.2 Add Loading State:**

#### **Target:** Same login button
1. **Select button** again
2. **Comment:**
```
"Add loading spinner when button is clicked, disable button during loading"
```

#### **Expected AI Response:**
```tsx
const [isLoading, setIsLoading] = useState(false);

<button 
  disabled={isLoading}
  onClick={handleSubmit}
  className="bg-blue-500 hover:bg-blue-700 disabled:opacity-50"
>
  {isLoading ? (
    <div className="flex items-center">
      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Đang xử lý...
    </div>
  ) : (
    'Đăng nhập'
  )}
</button>
```

---

## 📋 **BƯỚC 3: TASK MANAGEMENT ENHANCEMENTS**

### **3.1 Enhance Task Cards:**

#### **Target:** Task cards trong tasks page
1. **Login** với user: `manh.khong@example.com` / `123456`
2. **Navigate to:** Tasks page
3. **Select** một task card
4. **Comment:**
```
"Add priority badge (High/Medium/Low) with color coding and due date display"
```

#### **Expected AI Response:**
```tsx
// AI sẽ suggest thêm vào TaskCard component:
<div className="flex items-center justify-between mb-2">
  <div className="flex items-center space-x-2">
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
      task.priority === 'high' ? 'bg-red-100 text-red-800' :
      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
      'bg-green-100 text-green-800'
    }`}>
      {task.priority?.toUpperCase()}
    </span>
    {task.dueDate && (
      <span className="text-sm text-gray-500">
        Due: {new Date(task.dueDate).toLocaleDateString()}
      </span>
    )}
  </div>
</div>
```

### **3.2 Add Filter Functionality:**

#### **Target:** Task filter bar
1. **Select** filter/search area
2. **Comment:**
```
"Add date range picker and priority filter dropdown to filter tasks"
```

#### **Expected AI Response:**
```tsx
// AI sẽ suggest thêm filter components:
<div className="flex space-x-4 mb-4">
  <DateRangePicker 
    value={dateRange}
    onChange={setDateRange}
    placeholder="Select date range"
  />
  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
    <SelectTrigger className="w-32">
      <SelectValue placeholder="Priority" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">All</SelectItem>
      <SelectItem value="high">High</SelectItem>
      <SelectItem value="medium">Medium</SelectItem>
      <SelectItem value="low">Low</SelectItem>
    </SelectContent>
  </Select>
</div>
```

---

## 🎯 **BƯỚC 4: ADVANCED FEATURES**

### **4.1 Real-time Updates:**

#### **Target:** Task list container
1. **Select** task list wrapper
2. **Comment:**
```
"Implement real-time updates using Supabase subscriptions for live task changes"
```

#### **Expected AI Response:**
```tsx
// AI sẽ suggest thêm useEffect với Supabase subscription:
useEffect(() => {
  const subscription = supabase
    .channel('tasks')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'tasks' },
      (payload) => {
        console.log('Task change received:', payload);
        // Update local state
        if (payload.eventType === 'INSERT') {
          setTasks(prev => [...prev, payload.new]);
        } else if (payload.eventType === 'UPDATE') {
          setTasks(prev => prev.map(task => 
            task.id === payload.new.id ? payload.new : task
          ));
        } else if (payload.eventType === 'DELETE') {
          setTasks(prev => prev.filter(task => task.id !== payload.old.id));
        }
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, []);
```

### **4.2 Drag and Drop:**

#### **Target:** Task list
1. **Select** task list
2. **Comment:**
```
"Add drag and drop functionality to reorder tasks with smooth animations"
```

#### **Expected AI Response:**
```tsx
// AI sẽ suggest sử dụng react-beautiful-dnd:
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

<DragDropContext onDragEnd={handleDragEnd}>
  <Droppable droppableId="tasks">
    {(provided) => (
      <div {...provided.droppableProps} ref={provided.innerRef}>
        {tasks.map((task, index) => (
          <Draggable key={task.id} draggableId={task.id} index={index}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                className={`transition-all duration-200 ${
                  snapshot.isDragging ? 'shadow-lg scale-105' : ''
                }`}
              >
                <TaskCard task={task} />
              </div>
            )}
          </Draggable>
        ))}
        {provided.placeholder}
      </div>
    )}
  </Droppable>
</DragDropContext>
```

---

## 🔧 **BƯỚC 5: COMPONENT REFACTORING**

### **5.1 Extract Reusable Components:**

#### **Target:** Repeated UI patterns
1. **Select** button với loading state
2. **Comment:**
```
"Extract this button with loading state into a reusable LoadingButton component with TypeScript props"
```

#### **Expected AI Response:**
```tsx
// AI sẽ tạo file mới: components/ui/LoadingButton.tsx
interface LoadingButtonProps {
  isLoading: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  isLoading,
  children,
  onClick,
  disabled,
  variant = 'primary',
  size = 'md',
  className = ''
}) => {
  const baseClasses = 'font-medium rounded-lg transition-all duration-200';
  const variantClasses = {
    primary: 'bg-blue-500 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-500 hover:bg-gray-700 text-white',
    danger: 'bg-red-500 hover:bg-red-700 text-white'
  };
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${
        disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <Spinner className="mr-2" />
          Loading...
        </div>
      ) : (
        children
      )}
    </button>
  );
};
```

---

## 🎊 **BƯỚC 6: TESTING WORKFLOW**

### **6.1 Test Stagewise Integration:**
```bash
# Run test script
node test-stagewise-ready.cjs

# Expected output:
# ✅ Toolbar root exists
# ✅ Has config  
# ✅ Development mode
```

### **6.2 Test AI Agent Connection:**
1. **Select any element**
2. **Type simple comment:** "Change text color to red"
3. **Send to AI agent**
4. **Verify** AI response trong VS Code

### **6.3 Verify Changes Applied:**
1. **AI suggests changes**
2. **Review** suggested code
3. **Apply** changes
4. **Check** browser updates

---

## 💡 **PRO TIPS**

### **1. Effective Comments:**
```
✅ "Add TypeScript interface for this form data with validation"
✅ "Implement optimistic updates for better UX"
✅ "Add accessibility attributes following WCAG guidelines"
❌ "Make it better"
❌ "Fix this"
```

### **2. Context-Aware Requests:**
```
✅ "Update this component to use the design system colors from tailwind.config.js"
✅ "Integrate with Supabase real-time subscriptions for live updates"
✅ "Add error boundary to handle component failures gracefully"
```

### **3. Performance Focused:**
```
✅ "Implement React.memo and useMemo for performance optimization"
✅ "Add lazy loading for this image gallery"
✅ "Use virtual scrolling for this large list"
```

---

## 🎯 **SUCCESS METRICS**

### **After completing this guide, you should be able to:**
- ✅ **Select** any UI element và send context to AI
- ✅ **Receive** intelligent code suggestions
- ✅ **Apply** changes efficiently
- ✅ **Refactor** components with AI assistance
- ✅ **Enhance** UX với advanced features
- ✅ **Optimize** performance với AI guidance

### **Time Savings:**
- **Before:** 30 minutes để manually describe context
- **After:** 2 minutes với visual selection
- **Efficiency gain:** 93% faster development

**🎉 Bây giờ bạn đã master Stagewise workflow! Happy visual coding!** 🚀
