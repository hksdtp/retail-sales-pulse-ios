# 🎯 Hướng Dẫn Sử Dụng Stagewise - retail-sales-pulse-ios

**Stagewise** cho phép bạn visual coding trực tiếp từ browser đến AI agents trong VS Code/Cursor. Đây là hướng dẫn từng bước để sử dụng hiệu quả.

---

## 🚀 **BƯỚC 1: KHỞI ĐỘNG DEVELOPMENT ENVIRONMENT**

### **1.1 Start Development Server:**
```bash
cd packages/web
npm run dev
# hoặc
bun run dev
```

### **1.2 Mở Browser:**
- Navigate to: `http://localhost:8088`
- **Mở Developer Console** (F12) để xem Stagewise logs

### **1.3 Kiểm tra Stagewise đã load:**
Trong console, bạn sẽ thấy:
```
🚀 [Stagewise] Initializing toolbar for retail-sales-pulse-ios...
✅ [Stagewise] Toolbar initialized successfully!
💡 [Stagewise] You can now:
   - Select any DOM element in your app
   - Leave comments on UI components
   - Send context directly to your AI agent
```

---

## 🧩 **BƯỚC 2: CÀI ĐẶT VS CODE EXTENSION**

### **2.1 Install Extension:**
1. **Mở VS Code/Cursor**
2. **Extensions** (Ctrl+Shift+X hoặc Cmd+Shift+X)
3. **Search:** `stagewise.stagewise-vscode-extension`
4. **Click Install**

### **2.2 Verify Installation:**
- **Restart VS Code/Cursor** sau khi install
- **Open project** retail-sales-pulse-ios
- **Check** extension đã active trong Extensions tab

---

## 🎨 **BƯỚC 3: VISUAL CODING WORKFLOW**

### **3.1 Select Elements:**

#### **Cách 1: Click trực tiếp**
- **Hover** over any element trong app
- **Click** để select element
- **Stagewise toolbar** sẽ xuất hiện

#### **Cách 2: Inspect mode**
- **Right-click** → **Inspect Element**
- **Select element** trong DevTools
- **Stagewise** sẽ detect selection

### **3.2 Leave Comments:**

#### **Basic Comments:**
```
"Make this button blue with rounded corners"
"Add loading spinner to this form"
"Change font size to 16px"
"Add hover effect with shadow"
```

#### **Advanced Comments:**
```
"Convert this to a reusable component with props for color and size"
"Add TypeScript interfaces for this form data"
"Implement error handling for this API call"
"Add accessibility attributes to this button"
```

#### **Component-specific Comments:**
```
"Update TaskCard component to show priority badges"
"Add real-time updates to this task list"
"Implement drag-and-drop for task reordering"
"Add filter functionality to this table"
```

### **3.3 Send to AI Agent:**
- **Type comment** trong Stagewise input
- **Press Enter** hoặc **Click Send**
- **Wait** for AI agent response trong VS Code

---

## 🤖 **BƯỚC 4: AI AGENT INTERACTION**

### **4.1 Context được gửi:**
Khi bạn select element và comment, AI agent nhận được:

```json
{
  "element": {
    "tagName": "button",
    "className": "bg-blue-500 hover:bg-blue-700",
    "textContent": "Đăng nhập",
    "attributes": { "type": "submit" }
  },
  "component": {
    "filePath": "src/components/login/LoginForm.tsx",
    "componentName": "LoginForm"
  },
  "relatedFiles": [
    "src/components/login/LoginForm.tsx",
    "src/styles/login-theme.css",
    "src/types/auth.ts"
  ],
  "projectContext": {
    "framework": "react",
    "typescript": true,
    "styling": "tailwind"
  }
}
```

### **4.2 AI Agent Response:**
AI agent sẽ:
- **Analyze** selected element và context
- **Suggest** code changes
- **Show** file modifications
- **Apply** changes nếu bạn approve

---

## 🎯 **BƯỚC 5: PRACTICAL EXAMPLES**

### **Example 1: Styling Changes**

#### **Scenario:** Thay đổi button color
1. **Select** login button
2. **Comment:** "Make this button green instead of blue"
3. **AI Response:**
```tsx
// Before
<button className="bg-blue-500 hover:bg-blue-700">

// After  
<button className="bg-green-500 hover:bg-green-700">
```

### **Example 2: Component Enhancement**

#### **Scenario:** Add loading state
1. **Select** submit button trong form
2. **Comment:** "Add loading spinner when form is submitting"
3. **AI Response:**
```tsx
// AI sẽ suggest:
const [isLoading, setIsLoading] = useState(false);

<button 
  disabled={isLoading}
  className="bg-blue-500 hover:bg-blue-700 disabled:opacity-50"
>
  {isLoading ? (
    <div className="flex items-center">
      <Spinner className="mr-2" />
      Đang xử lý...
    </div>
  ) : (
    'Đăng nhập'
  )}
</button>
```

### **Example 3: Task Management Features**

#### **Scenario:** Enhance TaskCard component
1. **Select** task card trong tasks page
2. **Comment:** "Add priority badge and due date to this task card"
3. **AI Response:**
```tsx
// AI sẽ suggest thêm:
<div className="flex items-center justify-between">
  <div className="flex items-center space-x-2">
    <PriorityBadge priority={task.priority} />
    <span className="text-sm text-gray-500">
      Due: {formatDate(task.dueDate)}
    </span>
  </div>
</div>
```

---

## 🔧 **BƯỚC 6: ADVANCED USAGE**

### **6.1 Multi-file Changes:**
```
"Convert this inline styles to a separate CSS module and make it reusable"
```
AI sẽ:
- Create new CSS module file
- Update component imports
- Refactor styling approach

### **6.2 State Management:**
```
"Move this local state to global context for sharing between components"
```
AI sẽ:
- Create context provider
- Update component to use context
- Handle state management patterns

### **6.3 API Integration:**
```
"Connect this form to Supabase API for user authentication"
```
AI sẽ:
- Add Supabase client calls
- Implement error handling
- Update form submission logic

---

## 🚨 **TROUBLESHOOTING**

### **❌ Toolbar không xuất hiện:**
```bash
# Check console logs
# Look for: [Stagewise] logs

# Restart development server
npm run dev

# Clear browser cache
Ctrl+Shift+R (hard refresh)
```

### **❌ AI Agent không nhận context:**
1. **Check** VS Code extension đã install
2. **Restart** VS Code/Cursor
3. **Verify** chỉ có 1 VS Code window mở
4. **Check** project workspace đúng

### **❌ Element selection không work:**
1. **Try** different elements
2. **Use** right-click → inspect
3. **Check** element có visible không
4. **Refresh** page và thử lại

---

## 💡 **BEST PRACTICES**

### **1. Clear Comments:**
```
✅ Good: "Add loading state with spinner to this submit button"
❌ Bad: "Make it better"
```

### **2. Specific Requests:**
```
✅ Good: "Change background color to #3B82F6 and add 2px border radius"
❌ Bad: "Make it look nice"
```

### **3. Context-aware:**
```
✅ Good: "Update this TaskCard to match the design system colors"
❌ Bad: "Change colors"
```

### **4. Component-focused:**
```
✅ Good: "Extract this form validation logic into a custom hook"
❌ Bad: "Fix the code"
```

---

## 🎊 **WORKFLOW EXAMPLES FOR RETAIL-SALES-PULSE-IOS**

### **Task Management Enhancements:**
1. **Select** task list → "Add drag-and-drop reordering"
2. **Select** task card → "Add priority color coding"
3. **Select** filter bar → "Add date range picker"

### **User Interface Improvements:**
1. **Select** sidebar → "Add collapse/expand animation"
2. **Select** dashboard cards → "Add loading skeletons"
3. **Select** forms → "Add real-time validation"

### **Performance Optimizations:**
1. **Select** large lists → "Implement virtual scrolling"
2. **Select** images → "Add lazy loading"
3. **Select** components → "Add React.memo optimization"

---

## 📞 **SUPPORT & RESOURCES**

### **🔗 Links:**
- **GitHub:** https://github.com/stagewise-io/stagewise
- **Discord:** https://discord.gg/gkdGsDYaKA
- **Documentation:** https://stagewise.io

### **🐛 Common Issues:**
- **Extension not connecting:** Restart VS Code
- **Toolbar not visible:** Check development mode
- **Context not sending:** Verify extension active

---

## 🎯 **NEXT LEVEL USAGE**

### **Custom Plugins:**
Bạn có thể extend Stagewise với custom plugins trong `stagewise.ts`:

```typescript
plugins: [
  {
    name: 'task-management-helper',
    description: 'Helper for task components',
    patterns: ['TaskCard', 'TaskList', 'TaskForm'],
    suggestions: [
      'Add real-time updates',
      'Implement optimistic updates',
      'Add offline support'
    ]
  }
]
```

**🎉 Bây giờ bạn đã sẵn sàng để visual coding với Stagewise!** 🚀
