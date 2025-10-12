# Agent #77: AI Site Builder Architect

**Division:** Domain #7 (AI & Intelligence) + Domain #3 (UX/UI)  
**Layer:** 31 (AI Infrastructure) + 17 (Business Logic)  
**Status:** Active  
**Created:** October 12, 2025

---

## Role & Responsibilities

Agent #77 is responsible for building an AI-powered site builder that allows Professional tier users to create custom websites for their events, tango schools, or services using conversational AI and drag-drop tools.

### Core Responsibilities:
1. Build AI-powered site builder for Professionals
2. Allow Pros to create custom sites for events/schools/services
3. Implement drag-drop + AI conversation hybrid builder
4. Enable Mr Blue to modify sites via natural language
5. Create template library (event site, school site, service site)
6. Build deployment system for Pro sites (subdomain or custom domain)

---

## Site Builder Vision

### For Professionals:

**Use Cases:**
1. **Event Organizer:** Create festival website in 10 minutes
2. **Tango Teacher:** Build school website with class schedule
3. **Host:** Create property showcase site
4. **General Pro:** Personal brand site

**Key Features:**
- 🤖 AI-generated sites (describe what you want)
- 🎨 Drag-drop customization
- 📱 Mobile-responsive templates
- 🌐 Subdomain deployment (yourname.mundotango.life)
- 🔗 Custom domain support (future)
- 📊 Built-in analytics

---

## Template Library

### 1. **Event/Festival Template**

**Features:**
- Hero banner with event dates
- Ticket purchase integration
- Schedule/lineup display
- Venue map & directions
- Photo gallery
- Registration form

**AI Generation Prompt:**
```
User: "Create a festival site for Tango Buenos Aires 2025"
↓
Mr Blue generates:
- Hero: "Tango Buenos Aires 2025" with dates
- Sections: About, Schedule, Tickets, Venue, Gallery
- Style: Elegant, Argentine tango theme
- Colors: Burgundy & gold
```

---

### 2. **Tango School Template**

**Features:**
- Class schedule calendar
- Teacher profiles
- Course packages & pricing
- Student testimonials
- Booking system
- Video showcase

**AI Generation Prompt:**
```
User: "Build a site for my tango school in Paris"
↓
Mr Blue generates:
- Hero: School name & tagline
- Sections: Classes, Teachers, Pricing, Testimonials, Contact
- Style: Modern, Parisian elegance
- Colors: Navy & cream
```

---

### 3. **Teacher/Instructor Template**

**Features:**
- Personal bio & photo
- Teaching philosophy
- Class offerings
- Availability calendar
- Booking widget
- Student reviews

---

### 4. **Host/Property Template**

**Features:**
- Property photos gallery
- Amenities list
- Pricing & availability
- Booking calendar
- Guest reviews
- Location map

---

### 5. **Generic Professional Template**

**Features:**
- Flexible sections
- About/Services/Contact
- Portfolio/gallery
- Testimonials
- Call-to-action
- Social links

---

## Technology Stack

### Page Builder Framework

**Recommended: GrapesJS**

**Why GrapesJS:**
- Open-source
- Drag-drop interface
- Component-based
- Export clean HTML/CSS
- Plugin ecosystem
- React integration

**Alternative: Craft.js**
- React-first
- More control
- Steeper learning curve
- Better for custom components

**Decision:** GrapesJS for ease of use + extensibility

---

## AI Site Generation System

### Conversation → Site Pipeline

```typescript
// lib/siteBuilder/aiGenerator.ts

interface SiteGenerationRequest {
  userPrompt: string
  siteType: 'event' | 'school' | 'teacher' | 'host' | 'generic'
  userContext: {
    name: string
    city: string
    language: string
  }
}

export async function generateSite(request: SiteGenerationRequest): Promise<SiteData> {
  // Step 1: Understand intent
  const intent = await parseIntent(request.userPrompt)
  
  // Step 2: Select template
  const template = selectTemplate(intent.siteType)
  
  // Step 3: Generate content
  const content = await generateContent(intent, request.userContext)
  
  // Step 4: Apply styling
  const styling = await generateStyling(intent.style, intent.colors)
  
  // Step 5: Assemble site
  const site = assembleSite(template, content, styling)
  
  return site
}

async function parseIntent(prompt: string): Promise<Intent> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `Parse user's site request into structured data:
        {
          "siteType": "event" | "school" | "teacher" | "host" | "generic",
          "purpose": "describe the purpose",
          "style": "elegant" | "modern" | "playful" | "professional",
          "colors": ["primary", "secondary"],
          "sections": ["hero", "about", "schedule", ...]
        }`
      },
      { role: 'user', content: prompt }
    ]
  })
  
  return JSON.parse(response.choices[0].message.content)
}

async function generateContent(intent: Intent, context: UserContext): Promise<SiteContent> {
  // Generate headlines, copy, CTAs using GPT-4
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `Generate website content for a ${intent.siteType} site.
        
        User: ${context.name} in ${context.city}
        Purpose: ${intent.purpose}
        Style: ${intent.style}
        
        Generate:
        - Hero headline (attention-grabbing)
        - Hero subheadline (value proposition)
        - Section content for: ${intent.sections.join(', ')}
        - Call-to-action buttons
        
        Write in ${context.language}.
        Respond in JSON format.`
      }
    ]
  })
  
  return JSON.parse(response.choices[0].message.content)
}
```

---

## Drag-Drop Editor Integration

### GrapesJS Setup

```typescript
// components/siteBuilder/EditorComponent.tsx

import 'grapesjs/dist/css/grapes.min.css'
import grapesjs from 'grapesjs'
import { useEffect, useRef } from 'react'

export function SiteEditor({ initialContent, onSave }: SiteEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (!editorRef.current) return
    
    const editor = grapesjs.init({
      container: editorRef.current,
      fromElement: true,
      height: '100vh',
      width: 'auto',
      storageManager: false,
      
      // Custom blocks (Mundo Tango components)
      blockManager: {
        blocks: [
          {
            id: 'hero-section',
            label: 'Hero Section',
            content: '<section class="hero">...</section>',
            category: 'Sections'
          },
          {
            id: 'event-schedule',
            label: 'Event Schedule',
            content: '<div class="schedule">...</div>',
            category: 'Events'
          },
          // ... more blocks
        ]
      },
      
      // Panels (toolbar)
      panels: {
        defaults: [
          {
            id: 'layers',
            el: '.panel__right',
            resizable: { minDim: 200 }
          },
          {
            id: 'styles',
            el: '.panel__right',
            resizable: { minDim: 200 }
          }
        ]
      }
    })
    
    // Load initial content
    if (initialContent) {
      editor.setComponents(initialContent.html)
      editor.setStyle(initialContent.css)
    }
    
    // Save handler
    editor.on('storage:start:store', () => {
      const html = editor.getHtml()
      const css = editor.getCss()
      onSave({ html, css })
    })
    
    return () => editor.destroy()
  }, [])
  
  return (
    <div className="site-editor">
      <div ref={editorRef} />
      <div className="panel__right"></div>
    </div>
  )
}
```

---

## Mr Blue Design Assistant

### Natural Language Site Editing

**User:** "Make the hero image bigger"

**Mr Blue:**
```typescript
// Mr Blue analyzes current site
const hero = editor.getSelected() // or find('.hero')

// Updates size
editor.getComponents().forEach(component => {
  if (component.get('type') === 'hero') {
    component.setStyle({
      height: '600px' // from 400px
    })
  }
})

// Responds
await mrBlueSpeaks("I made the hero section bigger. How does it look?")
```

**User:** "Add a gallery section after the about section"

**Mr Blue:**
```typescript
// Finds about section
const aboutSection = editor.getWrapper().find('.about-section')[0]

// Generates gallery component
const gallery = editor.addComponents({
  type: 'gallery',
  components: [/* gallery items */]
}, { at: aboutSection.index() + 1 })

// Responds
await mrBlueSpeaks("I added a photo gallery after the about section. Want to upload some photos?")
```

---

## Deployment System

### Subdomain Routing

**Architecture:**
```
pro-name.mundotango.life
  ↓
Nginx/Cloudflare routing
  ↓
Static site files from S3/CDN
  ↓
User's browser
```

**Implementation:**
```typescript
// services/deployment.ts

export async function deploySite(siteId: string, userId: string): Promise<string> {
  const site = await db.select().from(proSites).where(eq(proSites.id, siteId))
  const user = await db.select().from(users).where(eq(users.id, userId))
  
  // Generate subdomain
  const subdomain = generateSubdomain(user.username) // e.g., 'maria-lopez'
  const fullDomain = `${subdomain}.mundotango.life`
  
  // Build static site
  const { html, css, js } = await buildStaticSite(site)
  
  // Upload to S3/CDN
  const files = [
    { path: 'index.html', content: html },
    { path: 'styles.css', content: css },
    { path: 'script.js', content: js }
  ]
  
  for (const file of files) {
    await uploadToS3(`sites/${subdomain}/${file.path}`, file.content)
  }
  
  // Configure DNS/routing
  await configureDNS(subdomain)
  
  // Update database
  await db.update(proSites).set({
    domain: fullDomain,
    deployedAt: new Date(),
    status: 'live'
  }).where(eq(proSites.id, siteId))
  
  return fullDomain
}

function generateSubdomain(username: string): string {
  // maria-lopez-tango → maria-lopez
  return username
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 63) // DNS limit
}
```

---

## Professional Dashboard: My Sites

### Site Management Interface

```tsx
// pages/professional/MySites.tsx

export default function MySites() {
  const { sites } = useSites()
  
  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1>My Sites</h1>
        <Button onClick={() => createNewSite()}>
          Create New Site
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sites.map(site => (
          <Card key={site.id}>
            <img src={site.screenshot} alt={site.name} />
            <CardHeader>
              <CardTitle>{site.name}</CardTitle>
              <CardDescription>{site.domain}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Views</span>
                  <span className="font-medium">{site.views}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status</span>
                  <Badge variant={site.status === 'live' ? 'success' : 'secondary'}>
                    {site.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button variant="outline" onClick={() => editSite(site.id)}>
                Edit
              </Button>
              <Button variant="outline" onClick={() => window.open(site.domain)}>
                Visit
              </Button>
              <Button variant="ghost" onClick={() => deleteSite(site.id)}>
                <Trash className="w-4 h-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
```

---

## SEO & Analytics

### Built-in SEO Settings

```typescript
// components/siteBuilder/SEOSettings.tsx

export function SEOSettings({ siteId }: { siteId: string }) {
  const { site, updateSEO } = useSite(siteId)
  
  return (
    <form onSubmit={handleSubmit}>
      <Input
        label="Page Title"
        name="title"
        defaultValue={site.seo.title}
        maxLength={60}
      />
      <Textarea
        label="Meta Description"
        name="description"
        defaultValue={site.seo.description}
        maxLength={160}
      />
      <Input
        label="Keywords"
        name="keywords"
        defaultValue={site.seo.keywords.join(', ')}
      />
      <ImageUpload
        label="Social Share Image"
        name="ogImage"
        defaultValue={site.seo.ogImage}
      />
      <Button type="submit">Update SEO</Button>
    </form>
  )
}
```

### Analytics Integration

```typescript
// Track page views, conversions, etc.
export function trackSiteAnalytics(siteId: string, event: string, data: any) {
  // Store in database
  await db.insert(siteAnalytics).values({
    siteId,
    event,
    data,
    timestamp: new Date()
  })
  
  // Also send to Plausible/Google Analytics
  plausible.trackEvent(event, { props: { siteId, ...data } })
}
```

---

## Database Schema

```typescript
// shared/schema.ts

export const proSites = pgTable('pro_sites', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id').notNull().references(() => users.id),
  name: varchar('name').notNull(),
  description: text('description'),
  type: varchar('type'), // 'event', 'school', 'teacher', 'host', 'generic'
  subdomain: varchar('subdomain').unique(),
  customDomain: varchar('custom_domain'),
  domain: varchar('domain'), // Full domain (subdomain.mundotango.life)
  template: varchar('template'),
  content: jsonb('content'), // Site structure & content
  html: text('html'),
  css: text('css'),
  status: varchar('status').default('draft'), // 'draft', 'live', 'archived'
  views: integer('views').default(0),
  seo: jsonb('seo').$type<{
    title: string
    description: string
    keywords: string[]
    ogImage: string
  }>(),
  deployedAt: timestamp('deployed_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
})

export const siteAnalytics = pgTable('site_analytics', {
  id: serial('id').primaryKey(),
  siteId: integer('site_id').references(() => proSites.id),
  event: varchar('event'), // 'page_view', 'click', 'conversion'
  data: jsonb('data'),
  timestamp: timestamp('timestamp').defaultNow()
})
```

---

## Example User Flow

**Step 1: Create Site**
```
Pro User: "Create a site for my tango festival"
↓
Mr Blue: "Great! I'll help you build a festival site. What's the name of your festival?"
↓
User: "Tango Under the Stars 2025"
↓
Mr Blue: "Perfect! Generating your site..."
[Shows generated site with AI content]
```

**Step 2: Customize**
```
User: "Make the background darker"
↓
Mr Blue: [Updates background] "How's this?"
↓
User: "Perfect! Add a ticket sales section"
↓
Mr Blue: [Adds ticket section] "I added a ticket section. Want to connect Stripe?"
```

**Step 3: Deploy**
```
User: "Looks good, publish it!"
↓
Mr Blue: "Publishing to tango-under-the-stars.mundotango.life..."
[Deploys site]
↓
Mr Blue: "Your site is live! 🎉 Here's your link: [domain]"
```

---

## Success Metrics

**Site Builder KPIs:**
1. **Sites Created:** # of sites built per month
2. **Time to Publish:** Average time from start to deploy
3. **Customization Rate:** % who use editor vs. just AI
4. **Site Performance:** Page load times, mobile scores
5. **Conversion:** Sites that drive bookings/sales

---

**Status:** Ready for implementation  
**Dependencies:** GrapesJS, OpenAI GPT-4, S3/CDN, DNS configuration  
**Next Steps:** Build AI generator, integrate GrapesJS, create templates, setup deployment
