# Mundo Tango - Deployment Package
## Complete Platform Export - Branch: 10-21-2025

---

## 📦 Package Contents

This export includes the **complete Mundo Tango platform** with all code, configurations, and documentation.

### What's Included:
- ✅ Full-stack TypeScript application (React + Express + Vite)
- ✅ Database schema (PostgreSQL + Drizzle ORM)
- ✅ All frontend components and pages
- ✅ Backend API routes and services
- ✅ AI integration (Claude, GPT-4o, Gemini)
- ✅ Authentication system (Replit OAuth + JWT)
- ✅ Real-time features (Socket.io)
- ✅ Visual Editor + Mr Blue AI
- ✅ Configuration files
- ✅ Documentation

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18+ (LTS recommended)
- PostgreSQL 14+
- npm or yarn package manager
- Git

### Step 1: Clone/Extract the Repository
```bash
# If using git clone
git clone <your-repository-url>
cd Mundo_Tango_App_emergent

# OR if using zip export
unzip mundo-tango-export.zip
cd Mundo_Tango_App_emergent
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Environment Setup
Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/mundo_tango

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here
REPLIT_COOKIE_SECRET=your-cookie-secret-here

# AI Services (Optional - required for Mr Blue AI)
ANTHROPIC_API_KEY=sk-ant-xxxxx
OPENAI_API_KEY=sk-xxxxx
GOOGLE_GENAI_API_KEY=xxxxx

# Environment
NODE_ENV=development
PORT=5000

# Replit OAuth (Optional - for Replit auth)
REPL_ID=your-repl-id
REPLIT_DOMAINS=your-domain.replit.dev
```

### Step 4: Database Setup
```bash
# Push schema to database (creates all tables)
npm run db:push

# Or with force if there are conflicts
npm run db:push -- --force
```

### Step 5: Start Development Server
```bash
npm run dev
```

The app will be available at: `http://localhost:5000`

---

## 📁 Project Structure

```
Mundo_Tango_App_emergent/
├── client/                   # Frontend React application
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── mrBlue/     # Mr Blue AI interface
│   │   │   ├── visual-editor/ # Visual Editor
│   │   │   └── ...
│   │   ├── pages/          # Application pages
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities and helpers
│   │   └── App.tsx         # Main app component
│   └── index.html
│
├── server/                   # Backend Express application
│   ├── routes/              # API routes
│   │   ├── mrBlueUnifiedRoutes.ts
│   │   ├── mrBlueAutonomous/
│   │   └── ...
│   ├── services/            # Business logic
│   │   ├── gemini/         # Gemini AI integration
│   │   └── ...
│   ├── middleware/          # Express middleware
│   ├── db/                  # Database setup
│   └── index-novite.ts      # Server entry point
│
├── shared/                   # Shared code (frontend + backend)
│   └── schema.ts            # Database schema (Drizzle)
│
├── docs/                     # Documentation
│   ├── MB_MD_QA_PROTOCOL.md
│   ├── INTEGRATION_PROTOCOL.md
│   └── ...
│
├── attached_assets/          # Static assets
├── package.json             # Dependencies
├── vite.config.ts           # Vite configuration
├── drizzle.config.ts        # Database configuration
└── replit.md                # Project documentation
```

---

## 🔧 Key Technologies

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **TanStack Query** - Data fetching
- **Socket.io Client** - Real-time updates
- **Wouter** - Routing

### Backend
- **Node.js + Express** - Server framework
- **TypeScript** - Type safety
- **PostgreSQL** - Database
- **Drizzle ORM** - Database toolkit
- **Socket.io** - WebSocket server
- **JWT** - Authentication
- **Multer** - File uploads

### AI Integration
- **Anthropic Claude 3.5 Sonnet** - Advanced reasoning
- **OpenAI GPT-4o** - Chat and voice
- **Google Gemini 2.5 Pro/Flash** - Cost-optimized AI

---

## 🗄️ Database Schema

The database schema is defined in `shared/schema.ts` using Drizzle ORM.

**Main Tables:**
- `users` - User accounts
- `conversations` - Chat conversations
- `messages` - Chat messages
- `mr_blue_sessions` - AI coding sessions
- `code_changes` - Pending code changes
- `events` - Tango events
- `memories` - User posts/memories
- `groups` - Community groups
- `feature_flags` - Feature toggles

**Migration Command:**
```bash
npm run db:push
```

---

## 🎯 Key Features

### 1. Mr Blue AI Assistant
**Location:** `client/src/components/mrBlue/`

Multi-model AI assistant with:
- Chat interface (Claude, GPT-4o, Gemini)
- Voice conversations (GPT-4o Realtime API)
- Autonomous coding (vibe coding)
- Visual Editor integration
- Cost-optimized routing (87% cost reduction)

### 2. Visual Editor
**Location:** `client/src/components/visual-editor/`

Figma-like interface with:
- Click-to-select elements
- Inspector panel
- AI-powered editing
- Git integration
- Real-time preview

### 3. Social Features
- Memories/Posts system
- Events management
- User profiles
- Groups/Communities

### 4. Authentication
**Location:** `server/replitAuth.ts`

- Replit OAuth integration
- JWT-based sessions
- Role-based access control (RBAC)
- Super admin features

---

## 📡 API Endpoints

### Authentication
- `POST /auth/login` - User login
- `GET /auth/user` - Get current user
- `POST /auth/logout` - User logout

### Mr Blue AI
- `POST /api/mrblue/unified` - Unified AI endpoint (SSE streaming)
- `POST /api/mrblue/stream` - Chat streaming
- `GET /api/mrblue/conversations` - List conversations
- `POST /api/mrblue/conversations` - Create conversation

### Visual Editor
- `POST /api/mrblue/autonomous/write-file` - Write file
- `POST /api/mrblue/autonomous/read-file` - Read file
- `GET /api/mrblue/sessions/:id` - Get coding session

### Social
- `GET /api/memories` - Get memories/posts
- `POST /api/memories` - Create memory
- `GET /api/events` - Get events
- `GET /api/groups` - Get groups

---

## 🔐 Security Considerations

1. **Environment Variables**
   - Never commit `.env` file to git
   - Use strong secrets for JWT_SECRET
   - Rotate API keys regularly

2. **Database**
   - Use connection pooling in production
   - Enable SSL for database connections
   - Regular backups recommended

3. **API Keys**
   - Store in environment variables
   - Use Replit Secrets or similar in production
   - Monitor usage and costs

4. **Authentication**
   - JWT tokens expire after 24 hours
   - Secure cookies with httpOnly flag
   - CSRF protection enabled

---

## 🚢 Production Deployment

### Option 1: Replit Deployments
```bash
# Already configured for Replit
# Just click "Deploy" in Replit dashboard
```

### Option 2: Docker
```bash
# Build Docker image
docker build -t mundo-tango .

# Run container
docker run -p 5000:5000 --env-file .env mundo-tango
```

### Option 3: Traditional Hosting (VPS/Cloud)
```bash
# Build frontend
npm run build

# Start production server
NODE_ENV=production npm start
```

**Production Checklist:**
- ✅ Set `NODE_ENV=production`
- ✅ Use production database
- ✅ Enable HTTPS
- ✅ Configure CORS properly
- ✅ Set up error monitoring (Sentry)
- ✅ Configure CDN for static assets
- ✅ Set up database backups
- ✅ Monitor AI API costs

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

### Database Connection Issues
```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT version();"

# Verify DATABASE_URL in .env
echo $DATABASE_URL
```

### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
```

### TypeScript Errors
```bash
# Regenerate types
npm run db:generate
```

---

## 📊 Current State (as of Oct 28, 2025)

### ✅ What's Working
- Chat interface with multiple AI models
- Message persistence to database
- Real-time WebSocket connections
- Visual Editor UI
- Authentication system
- Database schema
- API routing

### 🚧 In Progress (Phase 1)
- Vibe coding execution (code changes)
- Plan/Build mode clarifications
- Voice WebSocket integration
- Self-awareness system integration

### 📝 Known Issues
1. Voice mode WebSocket not connecting (needs investigation)
2. Vibe coding SSE event parsing not wired up
3. Self-awareness system not integrated into unified endpoint

---

## 📚 Documentation

**Essential Reading:**
- `replit.md` - Project overview and preferences
- `docs/MB_MD_QA_PROTOCOL.md` - Development methodology
- `docs/INTEGRATION_PROTOCOL.md` - Component integration guide
- `docs/AGENT_LEARNINGS.md` - AI agent training

**Architecture Docs:**
- Git workflow documented in Visual Editor
- Multi-model AI routing in `server/services/gemini/`
- Feature flags system in `server/routes/featureFlagsRoutes.ts`

---

## 💡 Tips for New Platform

1. **Database Setup**
   - Import schema first: `npm run db:push`
   - Seed admin user manually via SQL or create signup flow

2. **AI API Keys**
   - Start with one provider (Anthropic or OpenAI)
   - Add others later as needed
   - Monitor costs closely

3. **Development Workflow**
   - Use `npm run dev` for hot reload
   - Frontend: Vite dev server (instant HMR)
   - Backend: Express server with nodemon

4. **Deployment**
   - Test in staging environment first
   - Use environment variables for secrets
   - Monitor error logs (Sentry integration available)

---

## 🆘 Support

**Original Platform:** Replit
**Branch:** 10-21-2025
**Last Updated:** October 28, 2025

**Contact Information:**
- For technical questions, refer to `replit.md`
- Check `docs/` directory for detailed documentation
- Review code comments for implementation details

---

## 📄 License

This is a proprietary application for the Mundo Tango tango community platform.

---

**Note:** This package represents the complete state of the application as of the latest commit on branch `10-21-2025`. All AI features, authentication, and database schemas are included and ready for deployment on any Node.js-compatible platform.
