# 🔄 Firebase to Supabase Migration Report
## Retail Sales Pulse iOS Project

**Date:** 2025-06-29  
**Project:** retail-sales-pulse-ios  
**Migration Type:** Firebase Firestore → Supabase PostgreSQL  

---

## 📋 **1. PROJECT STRUCTURE ANALYSIS**

### **1.1 Folder Structure**
```
retail-sales-pulse-ios/
├── packages/
│   ├── web/                    # Main React web application
│   │   ├── src/
│   │   │   ├── components/     # React components
│   │   │   │   ├── tasks/      # Task management components
│   │   │   │   ├── auth/       # Authentication components
│   │   │   │   ├── ui/         # UI components
│   │   │   │   └── supabase/   # Supabase-specific components
│   │   │   ├── context/        # React contexts
│   │   │   │   ├── AuthContext.tsx
│   │   │   │   ├── AuthContextSupabase.tsx
│   │   │   │   ├── TaskContext.tsx
│   │   │   │   └── SupabaseTaskDataProvider.tsx
│   │   │   ├── services/       # Business logic services
│   │   │   │   ├── SupabaseService.ts
│   │   │   │   ├── mockAuth.ts
│   │   │   │   └── api.ts
│   │   │   ├── hooks/          # Custom React hooks
│   │   │   ├── pages/          # Page components
│   │   │   └── config/         # Configuration files
│   │   │       └── supabase.ts
│   │   └── scripts/            # Build and utility scripts
│   └── functions/              # Firebase Cloud Functions
└── scripts/                    # Project-level scripts
```

### **1.2 Current Data Sources**
1. **Firebase Firestore** (Primary - Production)
   - API: `https://api-adwc442mha-uc.a.run.app`
   - Collections: `users`, `tasks`, `teams`
   - Authentication: Firebase Auth + Custom tokens

2. **Supabase** (Secondary - Development)
   - URL: `https://fnakxavwxubnbucfoujd.supabase.co`
   - Tables: Partially configured
   - Authentication: Supabase Auth (disabled)

3. **Mock Data** (Fallback)
   - Local storage based
   - Development and testing

---

## 📊 **2. CURRENT FIREBASE USAGE ANALYSIS**

### **2.1 Firebase Configuration**
- **Project ID:** `appqlgd` (production), `qlpbl-b10fc` (dev)
- **API Endpoint:** `https://api-adwc442mha-uc.a.run.app`
- **Authentication:** Custom token based
- **Functions:** Cloud Functions for API endpoints

### **2.2 Data Models**

#### **Users Collection**
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'retail_director' | 'team_leader' | 'member';
  team_id: string;
  location: 'hanoi' | 'hcm';
  department: 'retail';
  department_type: 'retail';
  position: string;
  status: 'active' | 'inactive';
  password_changed: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
}
```

#### **Tasks Collection**
```typescript
interface Task {
  id: string;
  title: string;
  description: string;
  type: 'partner_new' | 'partner_old' | 'architect_new' | 'architect_old' | 
        'client_new' | 'client_old' | 'quote_new' | 'quote_old' | 'other';
  date: string;
  status: 'todo' | 'in-progress' | 'on-hold' | 'completed';
  priority: 'urgent' | 'high' | 'normal' | 'low';
  progress: number;
  location: string;
  teamId: string;
  assignedTo: string;
  user_id: string;
  user_name: string;
  team_id: string;
  created_at: string;
  updated_at: string;
  visibility: 'personal' | 'team' | 'public';
  sharedWith: string[];
}
```

#### **Teams Collection**
```typescript
interface Team {
  id: string;
  name: string;
  leader_id: string;
  location: 'hanoi' | 'hcm';
  description: string;
  department: 'retail';
  department_type: 'retail';
  created_at: Timestamp;
  updated_at: Timestamp;
}
```

### **2.3 Current Data Volume**
- **Tasks:** 31 records
- **Users:** 24 records  
- **Teams:** 12 records

---

## 🎯 **3. MIGRATION STRATEGY**

### **3.1 Phase 1: Schema Design & Setup**
1. **Create Supabase tables** matching Firebase collections
2. **Set up Row Level Security (RLS)** policies
3. **Create indexes** for performance
4. **Set up real-time subscriptions**

### **3.2 Phase 2: Data Migration**
1. **Export Firebase data** (already done - `firebase-data-export.json`)
2. **Transform data format** (Timestamp → ISO strings)
3. **Import to Supabase** with data validation
4. **Verify data integrity**

### **3.3 Phase 3: Code Migration**
1. **Update service layer** to use Supabase
2. **Migrate authentication** to Supabase Auth
3. **Update real-time subscriptions**
4. **Replace Firebase API calls**

### **3.4 Phase 4: Testing & Optimization**
1. **Comprehensive testing** with Playwright
2. **Performance optimization**
3. **Error handling improvements**
4. **User experience enhancements**

---

## 🔧 **4. CURRENT ISSUES TO FIX**

### **4.1 Loading Issues**
- **Problem:** "Đang khởi tạo dữ liệu người dùng..." takes too long
- **Location:** `packages/web/src/pages/Tasks.tsx`
- **Cause:** Inefficient data loading and state management
- **Solution:** Optimize data fetching and loading states

### **4.2 UI Blocking Issues**
- **Problem:** LoadingScreen blocks user interactions
- **Location:** `packages/web/src/components/ui/LoadingScreen.tsx`
- **Cause:** Overlay covers entire UI during loading
- **Solution:** Implement progressive loading and non-blocking UI

### **4.3 Authentication Flow**
- **Problem:** Complex authentication logic with multiple fallbacks
- **Location:** `packages/web/src/context/AuthContextSupabase.tsx`
- **Cause:** Mixed Firebase/Supabase/Mock authentication
- **Solution:** Streamline to single Supabase authentication

---

## 📈 **5. SUPABASE SCHEMA DESIGN**

### **5.1 Users Table**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT, -- Will use Supabase Auth instead
  role TEXT NOT NULL CHECK (role IN ('retail_director', 'team_leader', 'member')),
  team_id UUID REFERENCES teams(id),
  location TEXT CHECK (location IN ('hanoi', 'hcm')),
  department TEXT DEFAULT 'retail',
  department_type TEXT DEFAULT 'retail',
  position TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  password_changed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **5.2 Tasks Table**
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN (
    'partner_new', 'partner_old', 'architect_new', 'architect_old',
    'client_new', 'client_old', 'quote_new', 'quote_old', 'other'
  )),
  date DATE NOT NULL,
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'on-hold', 'completed')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('urgent', 'high', 'normal', 'low')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  location TEXT CHECK (location IN ('hanoi', 'hcm')),
  team_id UUID REFERENCES teams(id),
  assigned_to UUID REFERENCES users(id),
  user_id UUID REFERENCES users(id),
  visibility TEXT DEFAULT 'personal' CHECK (visibility IN ('personal', 'team', 'public')),
  shared_with UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **5.3 Teams Table**
```sql
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  leader_id UUID REFERENCES users(id),
  location TEXT CHECK (location IN ('hanoi', 'hcm')),
  description TEXT,
  department TEXT DEFAULT 'retail',
  department_type TEXT DEFAULT 'retail',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🚀 **6. IMPLEMENTATION PLAN**

### **6.1 Immediate Actions**
1. ✅ **Create migration scripts**
2. ✅ **Set up Supabase schema**
3. ✅ **Migrate data from Firebase export**
4. ✅ **Update service layer**
5. ✅ **Fix loading issues**

### **6.2 Testing Strategy**
1. **Unit tests** for service layer
2. **Integration tests** for data operations
3. **E2E tests** with Playwright
4. **Performance tests** for loading times
5. **User acceptance tests**

### **6.3 Rollback Plan**
1. **Keep Firebase as fallback** during transition
2. **Feature flags** for switching data sources
3. **Data backup** before migration
4. **Quick rollback scripts**

---

## 📊 **7. SUCCESS METRICS**

### **7.1 Performance Metrics**
- **Page load time:** < 2 seconds
- **Data fetch time:** < 500ms
- **UI responsiveness:** No blocking operations > 100ms

### **7.2 Functionality Metrics**
- **All CRUD operations** working correctly
- **Real-time updates** functioning
- **Authentication flow** streamlined
- **Error handling** robust

### **7.3 User Experience Metrics**
- **Loading states** informative and non-blocking
- **Error messages** clear and actionable
- **UI interactions** smooth and responsive

---

## 🎯 **8. NEXT STEPS**

1. **Execute migration scripts** ⏳
2. **Update codebase** to use Supabase ⏳
3. **Fix current issues** ⏳
4. **Comprehensive testing** ⏳
5. **Performance optimization** ⏳
6. **Documentation update** ⏳

---

**Migration Lead:** AI Assistant  
**Review Date:** 2025-06-29  
**Status:** In Progress  
