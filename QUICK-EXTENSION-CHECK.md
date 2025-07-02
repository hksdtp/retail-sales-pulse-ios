# ⚡ Quick VS Code Extension Verification

Ninh ơi, đây là checklist nhanh để verify Stagewise extension đã được cài đặt đúng:

## 🧩 **STEP 1: CHECK EXTENSION INSTALLED**

### **Method 1: Extensions Tab**
1. **Press:** `Ctrl+Shift+X` (Windows/Linux) hoặc `Cmd+Shift+X` (Mac)
2. **Search:** `stagewise`
3. **Look for:** `Stagewise` extension
4. **Status should be:** `Installed` (not "Install")

### **Method 2: Command Palette**
1. **Press:** `Ctrl+Shift+P` (Windows/Linux) hoặc `Cmd+Shift+P` (Mac)
2. **Type:** `stagewise`
3. **Should see commands:**
   - `Stagewise: Setup Toolbar`
   - `Stagewise: Connect to Browser`
   - `Stagewise: Disconnect`

## ✅ **STEP 2: ACTIVATE EXTENSION**

### **If commands appear:**
1. **Run:** `Stagewise: Setup Toolbar`
2. **Follow** any setup prompts
3. **Extension is ready!** ✅

### **If no commands appear:**
1. **Restart VS Code** completely
2. **Reopen** retail-sales-pulse-ios project
3. **Try again** with Command Palette

## 🧪 **STEP 3: TEST CONNECTION**

### **Start Development Server:**
```bash
cd packages/web
npm run dev
```

### **Open Browser:**
- Navigate to: `http://localhost:8088`
- **F12** → Console
- **Look for:** `[Stagewise]` logs

### **Expected Console Output:**
```
🚀 [Stagewise] Starting initialization...
✅ [Stagewise] Packages loaded successfully
✅ [Stagewise] Toolbar initialized successfully!
```

## 🎯 **STEP 4: TRY ELEMENT SELECTION**

### **Basic Test:**
1. **Right-click** any button trong app
2. **Stagewise toolbar** should appear
3. **Type comment:** "Change color to green"
4. **Press Enter**
5. **Check VS Code** for AI response

### **If toolbar doesn't appear:**
- **Check console** for errors
- **Verify extension** is active
- **Restart** both VS Code và browser

## 🚨 **TROUBLESHOOTING**

### **❌ Extension not found:**
```
Solution:
1. Check exact name: stagewise.stagewise-vscode-extension
2. Try direct link: https://marketplace.visualstudio.com/items?itemName=stagewise.stagewise-vscode-extension
3. Manual install from VSIX file
```

### **❌ Commands not appearing:**
```
Solution:
1. Restart VS Code completely
2. Reload window: Ctrl+Shift+P → "Developer: Reload Window"
3. Check extension enabled in Extensions tab
```

### **❌ Toolbar not showing:**
```
Solution:
1. Check console for Stagewise logs
2. Verify development mode (localhost)
3. Clear browser cache
4. Restart development server
```

## 🎊 **SUCCESS INDICATORS**

### **✅ Extension Working:**
- Commands appear trong Command Palette
- Console shows Stagewise initialization logs
- Toolbar appears when selecting elements
- VS Code receives context from browser

### **✅ Ready to Use:**
- Can select any DOM element
- Can type comments trong toolbar
- AI agent receives context trong VS Code
- Code suggestions appear

## 📞 **NEED HELP?**

### **🔗 Resources:**
- **Extension Page:** https://marketplace.visualstudio.com/items?itemName=stagewise.stagewise-vscode-extension
- **GitHub:** https://github.com/stagewise-io/stagewise
- **Discord:** https://discord.gg/gkdGsDYaKA

### **🐛 Common Issues:**
- **Extension not installing:** Check VS Code version compatibility
- **Commands not working:** Restart VS Code after installation
- **Toolbar not appearing:** Verify development mode và console logs

---

## 🎯 **NEXT STEPS AFTER VERIFICATION**

1. **✅ Extension verified** → Try visual coding workflow
2. **⚠️ Issues found** → Follow troubleshooting steps
3. **🎨 Ready to code** → Start với simple styling changes
4. **🚀 Advanced usage** → Try component refactoring

**🎉 Once verified, you'll have visual coding superpowers!** 🚀
