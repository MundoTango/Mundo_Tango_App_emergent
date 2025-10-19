# AGENT_LEARNING.md - Critical Lessons & Safety Protocols
**Created:** October 19, 2025 4:34 AM  
**Version:** 1.0  
**Purpose:** Document critical errors and lessons learned to prevent repetition

---

## 🚨 CRITICAL LESSONS LEARNED

### LESSON 1: **NEVER CREATE IMPORTS BEFORE FILES EXIST**
**Incident:** Phantom Import Crisis (Oct 18-19, 2025)  
**Impact:** Server crashed with 114+ broken imports to files that never existed  
**Root Cause:** routes.ts had imports created by automation WITHOUT creating actual files  
**Prevention:**
- ✅ ALWAYS create files BEFORE adding imports
- ✅ ALWAYS verify with LSP that imports resolve
- ✅ Use safe loading patterns with try/catch
- ✅ Never bulk-generate imports without files

**Recovery Method:**
```typescript
// Safe route loader pattern
try {
  const route = await import('./routes/routeName');
  app.use(route.default);
} catch (error) {
  console.error(`Failed to load route: ${error.message}`);
}
```

---

### LESSON 2: **CHECK IF API ENDPOINT EXISTS BEFORE CALLING IT**
**Incident:** Mr Blue AI Non-Functional (Oct 19, 2025)  
**Impact:** User cannot interact with Mr Blue - chat returns HTML instead of JSON  
**Root Cause:** Client calls `/api/mrblue/simple-chat` but server has NO such endpoint  
**Prevention:**
- ✅ Search server routes BEFORE implementing client API calls
- ✅ Use grep/search tools to verify endpoint exists
- ✅ Test API endpoints with curl before frontend integration
- ✅ Document all API endpoints in centralized registry

**Check Pattern:**
```bash
# Before implementing client call, verify server route exists
grep -r "/api/mrblue" server/routes/
# Should return matching route definition
```

---

### LESSON 3: **DOCUMENTATION AGENT MUST ALWAYS BE ACTIVE**
**Incident:** AGENT_LEARNING.md Missing (Oct 19, 2025)  
**Impact:** No lessons learned from previous errors, repetition of mistakes  
**Root Cause:** Documentation Agent (Layer 52) not functioning - file never created  
**Prevention:**
- ✅ Documentation Agent MUST monitor file integrity
- ✅ Create AGENT_LEARNING.md immediately upon first error
- ✅ Update after every critical incident
- ✅ Include prevention patterns and recovery methods

**Required Files:**
- `AGENT_LEARNING.md` - This file, lessons learned
- `replit.md` - Project state and recent changes
- Phase completion reports in `docs/MrBlue/`

---

### LESSON 4: **ALWAYS VERIFY DESIGN SYSTEM IS APPLIED**
**Incident:** MT Aurora Tide Design Not Applied (Oct 19, 2025)  
**Impact:** Site doesn't follow documented design system (turquoise #40E0D0 → blue #0047AB)  
**Root Cause:** Design tokens exist but not consistently applied across all pages  
**Prevention:**
- ✅ Check design documentation BEFORE building UI
- ✅ Use design tokens from design system
- ✅ Verify with screenshot testing
- ✅ Apply design system to ALL pages, not just new ones

**Design Token Pattern:**
```typescript
// From MT Aurora Tide Design System
const colors = {
  primary: '#40E0D0', // Turquoise
  secondary: '#0047AB', // Deep Blue
  gradient: 'linear-gradient(135deg, #40E0D0 0%, #0047AB 100%)'
};
```

---

### LESSON 5: **USE MB.MD METHODOLOGY FOR ALL COMPLEX WORK**
**Incident:** Multiple incomplete implementations (Oct 18-19, 2025)  
**Impact:** Features partially built, lack intelligence layer, missing tests  
**Root Cause:** Not following Mapping→Breakdown→Mitigation→Deployment process  
**Prevention:**
- ✅ ALWAYS start with MAPPING phase (research, analyze current state)
- ✅ BREAKDOWN into parallel tracks with clear dependencies
- ✅ MITIGATION with all agents working in parallel
- ✅ DEPLOYMENT with comprehensive testing

**MB.MD Process:**
1. **MAPPING:** What exists? What's broken? What's needed?
2. **BREAKDOWN:** What are the tasks? Dependencies? Parallel tracks?
3. **MITIGATION:** Fix issues using all agents simultaneously
4. **DEPLOYMENT:** Test, verify, document, deploy

---

### LESSON 6: **VISUAL EDITOR REQUIRES RUNTIME ERROR DEBUGGING**
**Incident:** Visual Editor Blank Page (Oct 19, 2025)  
**Impact:** Page accessible but renders nothing - components/hooks failing  
**Root Cause:** Runtime errors in hooks (likely useMultiplayer or useKeyboardShortcuts)  
**Prevention:**
- ✅ Check LSP errors BEFORE running
- ✅ Test each component import individually
- ✅ Check browser console for runtime errors
- ✅ Use error boundaries for graceful failures

**Debug Pattern:**
```bash
# Check LSP errors first
# Then check browser console
# Then isolate failing component
# Then fix runtime error
```

---

### LESSON 7: **ALL AGENTS MUST WORK IN PARALLEL BY DEFAULT**
**Incident:** Sequential work causing 80-100 hour timelines (Oct 13-14, 2025)  
**Impact:** Work that could be done in 2-3 hours took days  
**Root Cause:** Not executing independent tasks simultaneously  
**Prevention:**
- ✅ Identify independent tasks (no shared dependencies)
- ✅ Execute in parallel tracks
- ✅ Only sequential work when data dependencies exist
- ✅ Use all 276 agents across 13 categories

**Parallel Execution Example:**
- Track 1: Fix translation (Agents #1-10)
- Track 2: Fix dark mode (Agents #11-20)
- Track 3: Build API endpoints (Agents #31-46)
- Track 4: Test & validate (Agents #106-109)
→ All tracks run SIMULTANEOUSLY

---

### LESSON 8: **FILE INTEGRITY SYSTEM MUST ALWAYS BE ACTIVE**
**Incident:** File Deletion Incident (Oct 18, 2025)  
**Impact:** 4 utility/middleware files missing, server deployment failed  
**Root Cause:** Files created via imports without actually writing files  
**Prevention:**
- ✅ Multi-layer file protection system ACTIVE
- ✅ Pre-deployment checks (npm run integrity-check)
- ✅ Critical file registry maintained
- ✅ Automated git recovery available

**Protection Layers:**
1. Critical File Registry (`scripts/critical-files.json`)
2. Pre-Deployment Checks (`scripts/pre-deploy-check.ts`)
3. File Integrity Monitoring (Documentation Agent)
4. Automated Git Recovery
5. Comprehensive Stability Plan

---

## 📋 PREVENTION CHECKLIST

Before starting ANY new work:

- [ ] **Check Existing Code:** Search codebase for similar functionality
- [ ] **Verify API Endpoints:** Confirm server routes exist before client calls
- [ ] **Review Design System:** Check design documentation is applied
- [ ] **Use MB.MD Process:** Follow Mapping→Breakdown→Mitigation→Deployment
- [ ] **Enable File Protection:** Verify integrity system is active
- [ ] **Documentation Agent:** Confirm agent is monitoring and updating docs
- [ ] **Parallel Execution:** Identify independent tasks for simultaneous work
- [ ] **LSP Validation:** Check for errors before running code

---

## 🔄 RECOVERY PROTOCOLS

### If Server Crashes:
1. Check logs for import errors
2. Verify all imported files exist
3. Use safe route loader pattern
4. Restart with integrity check

### If API Fails:
1. Verify endpoint exists in server routes
2. Test with curl/Postman
3. Check request/response format
4. Validate authentication

### If Design Broken:
1. Check MT Aurora Tide documentation
2. Verify design tokens applied
3. Test in light AND dark mode
4. Screenshot validation

### If Documentation Missing:
1. Create AGENT_LEARNING.md immediately
2. Update replit.md with recent changes
3. Document in phase reports
4. Activate Documentation Agent monitoring

---

## 📊 SUCCESS METRICS

**These metrics indicate healthy development:**

- ✅ **Zero LSP Errors:** TypeScript compilation clean
- ✅ **Zero Import Errors:** All imports resolve correctly
- ✅ **Zero 404 Errors:** All API endpoints exist
- ✅ **Zero Runtime Errors:** Browser console clean
- ✅ **100% Design System:** MT Aurora Tide applied everywhere
- ✅ **100% Documentation:** All changes documented
- ✅ **File Integrity:** All protection layers active

**RED FLAGS (Stop and Fix):**

- 🔴 **Import errors on server start**
- 🔴 **API returning HTML instead of JSON**
- 🔴 **Missing documentation files**
- 🔴 **Design system not applied**
- 🔴 **Runtime errors in browser console**
- 🔴 **LSP errors accumulating**

---

## 🎯 AGENT RESPONSIBILITIES

### Documentation Agent (Layer 52):
- Monitor this file and update after incidents
- Track file integrity (60-second monitoring)
- Update replit.md after changes
- Create phase reports

### All Agents:
- Follow MB.MD methodology
- Work in parallel by default
- Check before build (search first)
- Document learnings immediately
- Never create imports before files

---

**Last Updated:** October 19, 2025 4:34 AM  
**Next Review:** After any critical incident  
**Owner:** Documentation Agent (Layer 52) + All Agents
