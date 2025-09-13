# Public Resume Page Documentation

## 1. Overview
- **Route**: `/public-resume/:username`
- **Purpose**: Public-facing professional tango resume for sharing with venues, students, and partners
- **ESA Framework Layer**: Layer 4 - Public Interface

## 2. Technical Implementation

### Components
- `client/src/pages/PublicResumePage.tsx` - Public resume view
- `ResumeViewer` - Read-only resume display
- `ContactCard` - Contact information (privacy-aware)
- `MediaGallery` - Public media showcase
- `SkillsDisplay` - Dance capabilities
- `ExperienceTimeline` - Professional history
- `ShareButtons` - Social sharing options
- `DownloadOptions` - PDF/Print options

### API Endpoints
- `GET /api/public/resume/:username` - Fetch public resume
- `POST /api/resume/view-track` - Track view analytics
- `GET /api/resume/recommendations/:id` - Get recommendations
- `POST /api/resume/contact` - Send contact request
- `GET /api/resume/download/:format` - Download resume

### Real-time Features
- View count updates
- Online status indicator
- Real-time availability status
- Contact request notifications

### Database Tables
- `public_resumes` - Public resume data
- `resume_views` - View analytics
- `resume_contacts` - Contact requests
- `resume_recommendations` - Endorsements
- `resume_privacy` - Privacy settings

## 3. User Permissions
- **Public**: View public information only
- **Authenticated**: Contact capabilities
- **Owner**: Analytics access
- **Recruiter**: Extended contact info (with permission)

## 4. MT Ocean Theme Implementation
```css
/* Public header design */
.public-resume-header {
  background: linear-gradient(135deg, #5EEAD4 0%, #14B8A6 30%, #0D9488 60%, #155E75 100%);
  padding: 40px;
  color: white;
  position: relative;
}

/* Experience cards */
.experience-card {
  border-left: 3px solid #5EEAD4;
  background: rgba(94, 234, 212, 0.05);
  padding: 15px;
  margin: 10px 0;
}

/* Contact button */
.contact-button {
  background: linear-gradient(45deg, #14B8A6, #0F766E);
  color: white;
  padding: 12px 30px;
  border-radius: 25px;
}
```

## 5. Test Coverage
- **Unit Tests**: 78% coverage
- **Integration Tests**: Public API access
- **E2E Tests**: View and contact flow
- **Security Tests**: Privacy compliance
- **SEO Tests**: Search engine optimization

## 6. Known Issues
- PDF download formatting on mobile
- Contact form spam protection needed
- Media gallery lazy loading
- Print layout breaks with long content

## 7. Agent Responsibilities
- **Public Agent**: Data sanitization
- **Analytics Agent**: View tracking
- **Contact Agent**: Request handling
- **SEO Agent**: Search optimization

## 8. Integration Points
- **SEO Service**: Meta tags generation
- **Analytics Service**: View tracking
- **Contact Service**: Message delivery
- **Share Service**: Social media integration
- **PDF Service**: Download generation

## 9. Performance Metrics
- **Page Load**: < 1.5 seconds
- **Image Load**: Progressive loading
- **PDF Generation**: < 3 seconds
- **Contact Form**: < 500ms response
- **Share Action**: < 200ms
- **SEO Score**: > 90/100

## 10. Accessibility
- **Screen Reader**: Full content access
- **Keyboard Navigation**: All interactive elements
- **Print Stylesheet**: Optimized layout
- **Meta Tags**: Rich snippets
- **Schema Markup**: Structured data
- **Mobile Optimized**: Responsive design