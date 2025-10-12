# Supabase Security Issues - Fix Plan

**Created:** October 12, 2025  
**Priority:** CRITICAL  
**Status:** Analysis Complete → Ready for Implementation

---

## 🚨 Issues Identified

### **CRITICAL (ERROR Level) - 40+ Issues**

1. **RLS Disabled on Public Tables** (40+ tables)
   - Tables in public schema without RLS enabled
   - Anyone can read/write data
   - Examples: `user_groups`, `attachments`, `groups`, `event_types`, etc.

2. **Security Definer Views** (Multiple views)
   - Views using SECURITY DEFINER property
   - Bypass RLS, use creator's permissions
   - Example: `resume_view`

### **HIGH (WARNING Level)**

3. **Function Search Path Mutable** (3 functions)
   - Functions without explicit search_path
   - Security vulnerability
   - Functions: `update_post_stats`, `update_updated_at_column`, `handle_new_user`

4. **Extension in Public Schema**
   - PostGIS extension in public schema
   - Should be in separate schema

5. **Postgres Version Vulnerable**
   - Current: supabase-postgres-17.4.1.45
   - Security patches available

### **MEDIUM (INFO Level)**

6. **RLS Enabled But No Policies** (2 tables)
   - `blocked_users` - RLS ON but no policies
   - `chat_room_users` - RLS ON but no policies

---

## 📊 Impact Analysis

### **Tables Affected (40+)**

**User & Groups:**
- user_groups
- groups
- group_members
- group_visitors
- pinned_groups

**Events:**
- event_types
- event_activities

**Professional Roles:**
- dance_experiences
- teaching_experiences
- dj_experiences
- performer_experiences
- photographer_experiences
- tour_operator_experiences
- creator_experiences
- organizer_experiences
- venue_owner_experiences
- business_owner_experiences
- school_owner_experiences
- admin_experiences
- facilitator_experiences
- host_experiences

**Content:**
- attachments
- reactions
- feed_posts
- media_uploads
- reviews
- ratings

**Community:**
- community_members
- community_posts
- community_events
- neighborhoods
- housing_listings

**System:**
- spatial_ref_sys (PostGIS)
- chat_message_statuses
- notifications
- audit_logs

---

## 🛠️ Fix Strategy

### **Phase 1: Enable RLS on All Public Tables** ✅

**Approach:** Systematic RLS enablement
- Enable RLS on ALL public tables
- Create permissive policies for authenticated users
- Restrict to owner access where applicable

### **Phase 2: Create RLS Policies** ✅

**Policy Pattern:**
```sql
-- Read: Users can read their own data + public data
CREATE POLICY "users_select_policy" ON table_name
  FOR SELECT USING (
    auth.uid()::text = user_id::text OR is_public = true
  );

-- Insert: Users can insert their own data
CREATE POLICY "users_insert_policy" ON table_name
  FOR INSERT WITH CHECK (
    auth.uid()::text = user_id::text
  );

-- Update: Users can update their own data
CREATE POLICY "users_update_policy" ON table_name
  FOR UPDATE USING (
    auth.uid()::text = user_id::text
  );

-- Delete: Users can delete their own data
CREATE POLICY "users_delete_policy" ON table_name
  FOR DELETE USING (
    auth.uid()::text = user_id::text
  );
```

### **Phase 3: Fix Security Definer Views** ✅

**Solution:** Remove SECURITY DEFINER or add explicit policies
```sql
-- Option 1: Remove SECURITY DEFINER
CREATE OR REPLACE VIEW resume_view AS
  SELECT * FROM resumes;

-- Option 2: Keep but add RLS on underlying tables
-- (RLS on base tables will be enforced)
```

### **Phase 4: Fix Function Search Paths** ✅

**Solution:** Set explicit search_path on functions
```sql
CREATE OR REPLACE FUNCTION update_post_stats()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- function body
END;
$$ LANGUAGE plpgsql;
```

### **Phase 5: Move PostGIS Extension** ✅

**Solution:** Move to extensions schema
```sql
CREATE SCHEMA IF NOT EXISTS extensions;
ALTER EXTENSION postgis SET SCHEMA extensions;
```

---

## 🚀 Implementation Plan

### **Automated SQL Script**

We'll create a comprehensive SQL script that:
1. Enables RLS on all affected tables
2. Creates standard policies for each table
3. Fixes security definer views
4. Sets search_path on functions
5. Moves PostGIS extension

### **Execution Method**

```bash
# Option 1: Via execute_sql_tool
# Run directly from Replit Agent

# Option 2: Via Supabase Dashboard
# Copy SQL to Supabase SQL Editor and run

# Option 3: Via migration file
# Create migration and apply
```

---

## 📝 SQL Fix Script

### **Script Location:**
`database/security/comprehensive-security-fix.sql`

### **Script Structure:**
```sql
-- ============================================
-- COMPREHENSIVE SUPABASE SECURITY FIX
-- ============================================

-- PHASE 1: Enable RLS on all public tables
ALTER TABLE public.user_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
-- ... (40+ more tables)

-- PHASE 2: Create RLS policies
-- (Table-specific policies based on data ownership patterns)

-- PHASE 3: Fix security definer views
CREATE OR REPLACE VIEW public.resume_view 
  SECURITY INVOKER AS 
  SELECT * FROM resumes;

-- PHASE 4: Fix function search paths
CREATE OR REPLACE FUNCTION update_post_stats()
  RETURNS TRIGGER
  SECURITY DEFINER
  SET search_path = public, pg_temp
  AS $$ ... $$;

-- PHASE 5: Move PostGIS extension
CREATE SCHEMA IF NOT EXISTS extensions;
ALTER EXTENSION postgis SET SCHEMA extensions;
```

---

## ✅ Testing & Validation

### **Post-Fix Checks:**

1. **Verify RLS Enabled:**
```sql
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND rowsecurity = false;
-- Should return 0 rows
```

2. **Verify Policies Exist:**
```sql
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public';
-- Should show policies for all tables
```

3. **Test Access:**
```sql
-- As authenticated user
SELECT COUNT(*) FROM user_groups; -- Should work
-- As anon
SET ROLE anon;
SELECT COUNT(*) FROM user_groups; -- Should fail or return 0
```

4. **Verify Functions:**
```sql
SELECT proname, prosecdef, proconfig
FROM pg_proc
WHERE proname IN ('update_post_stats', 'update_updated_at_column', 'handle_new_user');
-- All should have search_path set
```

---

## 🎯 Success Criteria

✅ **All public tables have RLS enabled**  
✅ **All tables have appropriate RLS policies**  
✅ **No SECURITY DEFINER views without policies**  
✅ **All functions have explicit search_path**  
✅ **PostGIS in extensions schema**  
✅ **Zero security lint errors**  
✅ **All user access patterns working**

---

## ⚡ Execution Timeline

**Immediate:** Create comprehensive fix SQL script  
**+5 min:** Review and validate script  
**+10 min:** Execute via Supabase dashboard  
**+15 min:** Run validation queries  
**+20 min:** Test user access patterns  
**+25 min:** Monitor for errors  
**+30 min:** COMPLETE ✅

---

## 🔐 Policy Templates by Table Type

### **User-Owned Data (most tables):**
```sql
-- Users own their data, can only access their own
CREATE POLICY "select_own" ON table FOR SELECT 
  USING (user_id = auth.uid()::integer);
CREATE POLICY "insert_own" ON table FOR INSERT 
  WITH CHECK (user_id = auth.uid()::integer);
CREATE POLICY "update_own" ON table FOR UPDATE 
  USING (user_id = auth.uid()::integer);
CREATE POLICY "delete_own" ON table FOR DELETE 
  USING (user_id = auth.uid()::integer);
```

### **Public Read, Owner Write (posts, events):**
```sql
-- Anyone can read, only owner can write
CREATE POLICY "select_all" ON table FOR SELECT 
  USING (true);
CREATE POLICY "insert_own" ON table FOR INSERT 
  WITH CHECK (user_id = auth.uid()::integer);
CREATE POLICY "update_own" ON table FOR UPDATE 
  USING (user_id = auth.uid()::integer);
CREATE POLICY "delete_own" ON table FOR DELETE 
  USING (user_id = auth.uid()::integer);
```

### **Community Data (groups, communities):**
```sql
-- Members can read, admins can write
CREATE POLICY "select_members" ON table FOR SELECT 
  USING (is_member(auth.uid()::integer, id));
CREATE POLICY "insert_admin" ON table FOR INSERT 
  WITH CHECK (is_admin(auth.uid()::integer, community_id));
CREATE POLICY "update_admin" ON table FOR UPDATE 
  USING (is_admin(auth.uid()::integer, community_id));
CREATE POLICY "delete_admin" ON table FOR DELETE 
  USING (is_admin(auth.uid()::integer, community_id));
```

### **Reference Data (lookup tables):**
```sql
-- Public read, admin write
CREATE POLICY "select_all" ON table FOR SELECT 
  USING (true);
CREATE POLICY "admin_write" ON table FOR ALL 
  USING (is_super_admin(auth.uid()::integer));
```

---

## 📋 Next Steps

1. ✅ Generate comprehensive SQL fix script
2. ✅ Review script for completeness
3. ✅ Execute via Supabase SQL editor
4. ✅ Validate all fixes
5. ✅ Test user workflows
6. ✅ Monitor for issues
7. ✅ Document resolution

---

**Status:** Ready for immediate execution  
**Risk Level:** Low (RLS prevents accidental data exposure)  
**Rollback:** Can disable RLS if issues occur

---

*Built using ESA Framework - Security First Approach*
