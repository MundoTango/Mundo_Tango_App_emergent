# Resume Page Documentation

## 1. Overview
- **Route**: `/resume`
- **Purpose**: Professional tango resume builder for dancers, teachers, and performers
- **ESA Framework Layer**: Layer 3 - Professional Tools

## 2. Technical Implementation

### Components
- `client/src/pages/ResumePage.tsx` - Main resume builder
- `ResumeEditor` - WYSIWYG resume editor
- `SkillsSection` - Dance skills and levels
- `ExperienceSection` - Performance history
- `EducationSection` - Training and workshops
- `MediaSection` - Videos and photos
- `ResumePreview` - Live preview panel
- `ExportOptions` - PDF/Image export

### API Endpoints
- `GET /api/resume/:userId` - Fetch resume data
- `PUT /api/resume/update` - Save resume changes
- `POST /api/resume/media` - Upload media files
- `GET /api/resume/export/pdf` - Generate PDF
- `GET /api/resume/export/image` - Generate image
- `POST /api/resume/share` - Create shareable link
- `GET /api/resume/templates` - Get templates

### Real-time Features
- Live preview updates
- Auto-save functionality
- Collaborative editing
- Real-time validation

### Database Tables
- `resumes` - Resume main data
- `resume_experience` - Work experience
- `resume_education` - Training history
- `resume_skills` - Dance skills
- `resume_media` - Photos/videos
- `resume_templates` - Design templates
- `resume_shares` - Shared links

## 3. User Permissions
- **Owner**: Full edit access
- **Shared View**: Read-only access
- **Public**: Limited public view
- **Admin**: Template management

## 4. MT Ocean Theme Implementation
```css
/* Resume header gradient */
.resume-header {
  background: linear-gradient(135deg, #5EEAD4 0%, #14B8A6 50%, #155E75 100%);
  color: white;
  padding: 30px;
}

/* Section dividers */
.resume-section::before {
  content: '';
  height: 2px;
  background: linear-gradient(90deg, #5EEAD4, transparent);
  display: block;
  margin: 20px 0;
}

/* Skill badges */
.skill-badge {
  background: rgba(94, 234, 212, 0.1);
  border: 1px solid #5EEAD4;
  color: #0F766E;
}
```

## 5. Test Coverage
- **Unit Tests**: 82% coverage
- **Integration Tests**: Export functionality
- **E2E Tests**: Full resume creation
- **Visual Tests**: PDF generation
- **Performance Tests**: Export speed

## 6. Known Issues
- PDF export font embedding
- Large media file uploads
- Template switching data loss
- Mobile editor limitations

## 7. Agent Responsibilities
- **Resume Agent**: Data management
- **Export Agent**: PDF/Image generation
- **Media Agent**: File processing
- **Template Agent**: Design management

## 8. Integration Points
- **PDF Service**: Document generation
- **Media Service**: File storage
- **Share Service**: Link generation
- **Analytics Service**: View tracking
- **SEO Service**: Public resume indexing

## 9. Performance Metrics
- **Page Load**: < 2 seconds
- **Auto-save**: Every 30 seconds
- **PDF Export**: < 5 seconds
- **Media Upload**: < 10 seconds
- **Template Switch**: < 1 second
- **Memory Usage**: < 150MB

## 10. Accessibility
- **Screen Reader**: Section navigation
- **Keyboard Shortcuts**: Quick editing
- **High Contrast**: Print-friendly
- **Font Options**: Readable sizes
- **Export Formats**: Multiple options
- **Mobile Responsive**: Touch optimized