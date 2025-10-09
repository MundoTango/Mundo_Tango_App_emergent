# Technical Architecture

**Frontend**: Expo (React Native)
**Backend**: Supabase (Postgres, Auth, Realtime, Storage)
**Security**: RLS + ABAC; HTTPS everywhere
**CI/CD**: GitHub Actions → EAS Build → Upload
**Testing**: Playwright (web preview), Detox (mobile), simple build validation tests

### Environment Variables
- SUPABASE_URL
- SUPABASE_ANON_KEY
- RESEND_API_KEY
- STRIPE_SECRET_KEY (if used for physical/IRL services)