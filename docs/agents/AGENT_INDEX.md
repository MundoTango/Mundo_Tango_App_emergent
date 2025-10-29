# Mundo Tango Agent Index
**Last Updated:** October 17, 2025

---

## 📚 ALL AGENTS DIRECTORY

### 🎨 Page Agents (Own UI Pages)
| ID | Name | File | Route | Status |
|----|------|------|-------|--------|
| P1 | Login Page | `docs/The Pages/agents/P1_login.md` | `/login` | ✅ Documented |
| P2 | Register Page | `docs/The Pages/agents/P2_register.md` | `/register` | ✅ Documented |
| P10 | Home Feed Page | `docs/The Pages/agents/P10_home_feed.md` | `/` | ✅ Documented |
| P34 | Admin Projects Page | `docs/The Pages/agents/P34_admin_projects.md` | `/admin/projects` | ✅ Documented |

### 🔧 System Agents (Infrastructure)
| ID | Name | File | Purpose | Status |
|----|------|------|---------|--------|
| #81 | Data Flow Agent | `docs/agents/DATA_FLOW_AGENT.md` | Connection mapping | ✅ Active |
| #82 | Deployment Agent | `docs/agents/DEPLOYMENT_AGENT.md` | Infrastructure | ✅ Active |
| #83 | Master Coordinator | `docs/agents/MASTER_COORDINATOR_AGENT.md` | Orchestration | ✅ Active |

### 🤖 AI Agents (Mr Blue Suite)
| ID | Name | Purpose | Status |
|----|------|---------|--------|
| #73-80 | Mr Blue AI Suite | Universal AI companion | ✅ Active |
| #79 | Quality Validator | Validation & testing | ✅ Active |
| #80 | Learning Coordinator | Knowledge capture | ✅ Active |

### 🧭 Customer Journey Agents (Need Documentation)
| Journey | Routes | Agent Status |
|---------|--------|--------------|
| New User Registration | `/register` → `/onboarding` | 📝 Needs docs |
| Create Memory Post | `/` → Post creator → Feed | 📝 Needs docs |
| Browse Memories Feed | `/` → Scroll → Interact | 📝 Needs docs |
| Event RSVP | `/events/:id` → RSVP → Confirmation | 📝 Needs docs |
| Profile Update | `/profile` → Edit → Save | 📝 Needs docs |
| Send Message | `/messages` → Compose → Send | 📝 Needs docs |
| Search Platform | Header → Search → Results | 📝 Needs docs |
| Admin Dashboard | `/admin` → Manage → Update | 📝 Needs docs |
| Map Interaction | Map view → Pin → Details | 📝 Needs docs |
| Media Upload | Upload → Process → Display | 📝 Needs docs |
| Friend Request | User profile → Add → Accept | 📝 Needs docs |
| Manage Settings | `/settings` → Update → Save | 📝 Needs docs |
| Subscription Flow | Plans → Select → Pay → Confirm | 📝 Needs docs |
| Mobile Experience | Mobile nav → Actions → Gestures | 📝 Needs docs |
| Visual Editor | `/visual-editor` → Edit → Generate | ✅ Documented |

### 🎯 Feature Agents (Need Documentation)
| Feature | Endpoints | Agent Status |
|---------|-----------|--------------|
| Authentication | `/api/auth/*` | 📝 Needs docs |
| Posts Management | `/api/posts/*` | 📝 Needs docs |
| Events Management | `/api/events/*` | 📝 Needs docs |
| Messaging System | `/api/messages/*` | 📝 Needs docs |
| Friends System | `/api/friends/*` | 📝 Needs docs |
| Notifications | `/api/notifications/*` | 📝 Needs docs |
| Admin Operations | `/api/admin/*` | 📝 Needs docs |
| Analytics | `/api/analytics/*` | 📝 Needs docs |
| Search | `/api/search/*` | 📝 Needs docs |
| Map Features | `/api/map/*` | 📝 Needs docs |

### 📊 Platform Stats
- **Total Agents Documented:** 10
- **Total Agents Planned:** 105+
- **Customer Journeys:** 15+ documented
- **Routes Mapped:** 88+
- **API Endpoints:** 8+ active

---

## 🚀 How to Use This Index

**For MB.MD:**
1. Check this index before creating new agents
2. Avoid duplicates
3. Update when creating new agents

**For Agents:**
1. Find your entry above
2. Know your dependencies
3. Check related agents

**For Development:**
1. Find agent responsible for feature
2. Read their documentation
3. Follow their patterns

---

## 📝 Agent Creation Checklist

When creating a new agent:
- [ ] Define clear responsibility
- [ ] Create documentation file
- [ ] Add to this index
- [ ] Register with Master Coordinator (#83)
- [ ] Connect to Data Flow Agent (#81)
- [ ] Report to Learning Agent (#80)
- [ ] Validate with Quality Agent (#79)

---

**Maintained By:** Agent #83 (Master Coordinator) + MB.MD
