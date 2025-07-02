# 🚀 Stagewise Setup Guide - retail-sales-pulse-ios

**Stagewise** là một công cụ visual coding cho phép kết nối trực tiếp giữa browser UI và AI agents trong code editor như Cursor, VS Code, và Windsurf.

## 🎯 **Tính năng chính:**
- 🧠 **Select any DOM element** và comment trực tiếp
- 💬 **Send real context** đến AI agents
- ⚡ **Save time** không cần paste folder paths vào prompts
- 🎨 **Visual vibe coding** right in your codebase

---

## 📦 **BƯỚC 1: CÀI ĐẶT PACKAGES**

### **✅ Đã hoàn thành:**
```bash
cd packages/web
npm install -D @stagewise/toolbar @stagewise/toolbar-react
```

**Packages đã được cài đặt:**
- `@stagewise/toolbar` - Core toolbar functionality
- `@stagewise/toolbar-react` - React-specific components

---

## 🔧 **BƯỚC 2: INTEGRATION CODE**

### **✅ Đã hoàn thành:**

#### **1. Main.tsx Integration:**
File `packages/web/src/main.tsx` đã được cập nhật với:
```typescript
// Initialize Stagewise Toolbar separately (only in development)
if (import.meta.env.DEV) {
  import('./config/stagewise').then(({ initStagewise }) => {
    document.addEventListener('DOMContentLoaded', () => {
      initStagewise();
    });
  }).catch((error) => {
    console.warn('⚠️ Stagewise Toolbar not available:', error);
  });
}
```

#### **2. Stagewise Config:**
File `packages/web/src/config/stagewise.ts` đã được tạo với:
- ✅ **Framework detection:** React + TypeScript + Vite
- ✅ **Project context:** retail-sales-pulse-ios specific
- ✅ **AI hints:** Code style và patterns
- ✅ **Development workflow** integration

---

## 🧩 **BƯỚC 3: CÀI ĐẶT VS CODE EXTENSION**

### **⚠️ CẦN THỰC HIỆN:**

#### **Option 1: Từ VS Code/Cursor:**
1. **Mở VS Code hoặc Cursor**
2. **Vào Extensions** (Ctrl+Shift+X hoặc Cmd+Shift+X)
3. **Tìm kiếm:** `stagewise.stagewise-vscode-extension`
4. **Click Install**

#### **Option 2: Từ Marketplace:**
Truy cập: https://marketplace.visualstudio.com/items?itemName=stagewise.stagewise-vscode-extension

#### **Option 3: Command Palette (Cursor):**
1. **Press** `CMD + Shift + P` (Mac) hoặc `Ctrl + Shift + P` (Windows)
2. **Enter** `setupToolbar`
3. **Execute** command để auto-install

---

## 🧪 **BƯỚC 4: KIỂM TRA HOẠT ĐỘNG**

### **1. Start Development Server:**
```bash
cd packages/web
npm run dev
# hoặc
bun run dev
```

### **2. Mở Browser:**
- Navigate to: `http://localhost:8088`
- **Mở Developer Console** (F12)
- **Tìm logs:** `[Stagewise]`

### **3. Expected Console Output:**
```
🚀 [Stagewise] Initializing toolbar for retail-sales-pulse-ios...
✅ [Stagewise] Toolbar initialized successfully!
💡 [Stagewise] You can now:
   - Select any DOM element in your app
   - Leave comments on UI components
   - Send context directly to your AI agent
   - Get intelligent code suggestions
🔧 [Stagewise] Config available at window.stagewiseConfig
```

---

## 🎯 **BƯỚC 5: SỬ DỤNG STAGEWISE**

### **1. Select Elements:**
- **Click** vào bất kỳ element nào trong app
- **Stagewise toolbar** sẽ xuất hiện
- **Highlight** element được chọn

### **2. Leave Comments:**
- **Type comment** mô tả thay đổi bạn muốn
- **Example:** "Make this button blue and add hover effect"
- **Example:** "Add loading spinner to this form"

### **3. Send to AI Agent:**
- **Click Send** hoặc **Press Enter**
- **Context** sẽ được gửi đến AI agent trong VS Code/Cursor
- **AI agent** sẽ nhận được:
  - Selected DOM element
  - Component file path
  - Related files
  - Project context

### **4. AI Agent Response:**
- **AI agent** sẽ suggest code changes
- **Apply changes** directly trong editor
- **Real-time updates** trong browser

---

## 🔧 **TROUBLESHOOTING**

### **❌ Toolbar không xuất hiện:**
1. **Check console** cho Stagewise logs
2. **Verify** development mode: `import.meta.env.DEV === true`
3. **Restart** development server
4. **Clear browser cache**

### **❌ Extension không connect:**
1. **Install** VS Code extension
2. **Restart** VS Code/Cursor
3. **Check** chỉ có 1 VS Code window mở
4. **Verify** localhost:8088 đang chạy

### **❌ AI Agent không nhận context:**
1. **Check** extension đã được activate
2. **Verify** VS Code workspace đúng
3. **Try** close/reopen VS Code
4. **Check** network connectivity

---

## 📊 **CURRENT STATUS**

### **✅ COMPLETED:**
- [x] **Packages installed** (@stagewise/toolbar, @stagewise/toolbar-react)
- [x] **Main.tsx integration** với conditional loading
- [x] **Config file created** với project-specific settings
- [x] **Development mode detection** working
- [x] **Error handling** implemented

### **⚠️ PENDING:**
- [ ] **VS Code Extension** installation
- [ ] **Extension activation** verification
- [ ] **Toolbar visibility** testing
- [ ] **AI Agent connection** testing
- [ ] **End-to-end workflow** testing

---

## 🎊 **EXPECTED BENEFITS**

### **🚀 Development Speed:**
- **No more** manual file selection
- **Instant context** for AI agents
- **Visual feedback** on changes
- **Faster iteration** cycles

### **🎯 Accuracy:**
- **Real DOM context** sent to AI
- **Component relationships** preserved
- **Styling context** included
- **Better AI suggestions**

### **🤝 Team Collaboration:**
- **Visual comments** on UI elements
- **Shared context** understanding
- **Consistent code patterns**
- **Better handoffs**

---

## 📞 **SUPPORT**

### **🔗 Resources:**
- **GitHub:** https://github.com/stagewise-io/stagewise
- **Discord:** https://discord.gg/gkdGsDYaKA
- **Documentation:** https://stagewise.io
- **VS Code Extension:** https://marketplace.visualstudio.com/items?itemName=stagewise.stagewise-vscode-extension

### **🐛 Issues:**
- **Open issue:** https://github.com/stagewise-io/stagewise/issues
- **Check existing:** Search for similar problems
- **Provide details:** Browser, VS Code version, error logs

---

## 🎯 **NEXT STEPS**

1. **📦 Install VS Code Extension** (5 phút)
2. **🧪 Test toolbar visibility** (2 phút)
3. **🤖 Test AI agent connection** (3 phút)
4. **🎨 Try visual coding workflow** (10 phút)
5. **📝 Document team usage** (optional)

**Total setup time: ~20 phút** ⏰

---

**🎉 Sau khi hoàn thành, bạn sẽ có visual coding superpowers trong retail-sales-pulse-ios project!** 🚀
