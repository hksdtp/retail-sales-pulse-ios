# Z-Index Layering Guide

## 📋 Tổng quan

Tài liệu này mô tả hệ thống z-index layering trong ứng dụng Retail Sales Pulse iOS để đảm bảo các dropdown, popover và modal hiển thị đúng thứ tự.

## 🎯 Vấn đề đã giải quyết

### **Vấn đề ban đầu:**
- MultiUserPicker dropdown trong TaskFormDialog bị che khuất bởi image upload section
- Các dropdown khác có thể gặp vấn đề tương tự với z-index không đồng nhất
- Người dùng không thể tương tác với dropdown assignment

### **Nguyên nhân:**
- Dialog component có z-index 10000
- Các dropdown chỉ có z-index 50 (quá thấp)
- Stacking context không được quản lý đúng cách

## 🛠️ Giải pháp đã triển khai

### **Z-Index Hierarchy**

```
Layer 0: Base content (z-index: auto/0)
Layer 1: Navigation & UI elements (z-index: 10-100)
Layer 2: Tooltips & small overlays (z-index: 1000-9000)
Layer 3: Dialog overlay (z-index: 9998)
Layer 4: Dialog content (z-index: 10000)
Layer 5: Dropdown/Popover in dialogs (z-index: 10001)
```

### **Components đã được cập nhật:**

#### **1. MultiUserPicker.tsx**
```typescript
// Trước: z-50
// Sau: z-[10001]
className="absolute top-full left-0 right-0 z-[10001] mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg"
```

#### **2. SmartInput.tsx**
```typescript
// Trước: z-50
// Sau: z-[10001]
className="absolute top-full left-0 right-0 z-[10001] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 border-t-0 rounded-b-lg shadow-lg max-h-64 overflow-y-auto"
```

#### **3. TaskTypeSelector.tsx**
```typescript
// Trước: z-50
// Sau: z-[10001]
className="absolute top-full left-0 right-0 z-[10001] mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-64 overflow-y-auto"
```

#### **4. Popover.tsx**
```typescript
// Trước: z-50
// Sau: z-[10001]
className="z-[10001] w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none..."
```

## 📊 Z-Index Reference Table

| Component | Z-Index | Usage | Notes |
|-----------|---------|-------|-------|
| Base content | `auto/0` | Normal page content | Default stacking |
| Navigation | `10-50` | Header, sidebar, nav | Always visible |
| Tooltips | `1000` | Hover tooltips | Above content |
| Toast notifications | `5000` | Success/error messages | High priority |
| Dialog overlay | `9998` | Modal backdrop | Blocks interaction |
| Dialog content | `10000` | Modal/dialog content | Main modal layer |
| **Dropdowns in dialogs** | `10001` | **Form dropdowns** | **Above dialog content** |
| Emergency overlays | `99999` | Critical system messages | Highest priority |

## 🧪 Testing Strategy

### **Test Cases Covered:**

1. **Basic Dropdown Visibility**
   - MultiUserPicker dropdown appears above image upload section
   - SmartInput suggestions visible above other elements
   - DateTimePicker popover displays correctly

2. **Multiple Dropdowns**
   - Multiple dropdowns can be open simultaneously
   - No z-index conflicts between different dropdowns
   - Proper stacking order maintained

3. **Responsive Design**
   - Mobile viewport (375px width)
   - Tablet viewport (768px width)
   - Desktop viewport (1920px width)

4. **Scroll Behavior**
   - Dropdowns work when form is scrolled
   - Position maintained during scroll
   - No visual artifacts

5. **Cross-Browser Compatibility**
   - Chrome/Chromium
   - Firefox
   - Safari/WebKit

### **Test File:**
```
tests/z-index-layering-fix.spec.ts
```

## 🎨 Best Practices

### **1. Z-Index Naming Convention**
```css
/* Use descriptive z-index values */
.dropdown-in-dialog { z-index: 10001; }
.dialog-content { z-index: 10000; }
.dialog-overlay { z-index: 9998; }

/* Avoid arbitrary numbers */
.bad-example { z-index: 999999; } /* ❌ Too high */
.good-example { z-index: 10001; } /* ✅ Logical hierarchy */
```

### **2. Stacking Context Management**
```css
/* Create new stacking context when needed */
.modal-container {
  position: relative;
  z-index: 10000;
  /* This creates a new stacking context */
}

.dropdown-in-modal {
  position: absolute;
  z-index: 10001; /* Relative to modal's context */
}
```

### **3. Component Design**
```typescript
// Always consider z-index in component props
interface DropdownProps {
  zIndex?: number; // Allow override if needed
  className?: string;
}

const Dropdown = ({ zIndex = 10001, className, ...props }) => (
  <div 
    className={cn(`absolute z-[${zIndex}]`, className)}
    {...props}
  />
);
```

## 🔧 Troubleshooting

### **Common Issues:**

#### **1. Dropdown still hidden**
```typescript
// Check if parent has lower z-index
// Solution: Increase parent z-index or use Portal

// Before
<div className="z-10"> {/* Parent too low */}
  <Dropdown className="z-[10001]" /> {/* Won't work */}
</div>

// After
<div className="z-[10000]">
  <Dropdown className="z-[10001]" /> {/* Works */}
</div>
```

#### **2. Multiple modals conflict**
```typescript
// Use incremental z-index for nested modals
const Modal1 = () => <div className="z-[10000]">...</div>
const Modal2 = () => <div className="z-[10002]">...</div> // Higher
```

#### **3. Mobile viewport issues**
```css
/* Ensure dropdowns don't exceed viewport */
.dropdown {
  max-height: 50vh; /* Prevent overflow */
  overflow-y: auto;
}
```

## 📱 Mobile Considerations

### **Viewport Constraints:**
- Limited screen height on mobile
- Touch targets need proper spacing
- Dropdowns should not exceed viewport

### **Implementation:**
```typescript
const isMobile = useMediaQuery('(max-width: 768px)');

<Dropdown
  className={cn(
    "z-[10001]",
    isMobile ? "max-h-[40vh]" : "max-h-64"
  )}
/>
```

## 🚀 Future Enhancements

### **Planned Improvements:**

1. **Dynamic Z-Index Management**
   - Context provider for z-index allocation
   - Automatic conflict resolution
   - Runtime z-index adjustment

2. **Portal-based Dropdowns**
   - Render dropdowns in document.body
   - Eliminate stacking context issues
   - Better performance on complex layouts

3. **Z-Index Debugging Tools**
   - Development mode z-index visualization
   - Conflict detection warnings
   - Layer inspection tools

## 📚 References

- [MDN: CSS Z-Index](https://developer.mozilla.org/en-US/docs/Web/CSS/z-index)
- [CSS Stacking Context](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Positioning/Understanding_z_index/The_stacking_context)
- [Radix UI Z-Index Guidelines](https://www.radix-ui.com/docs/primitives/overview/styling#z-index)

---

**Tác giả:** Augment Agent  
**Ngày cập nhật:** 2025-01-20  
**Version:** 1.0.0
