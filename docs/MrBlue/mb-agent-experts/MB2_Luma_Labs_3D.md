# MB2 - Luma Labs 3D Generation Agent (Intelligent SME)
## 🎨 Component: Luma Labs AI Avatar Generation System

**Agent ID:** MB2  
**Track:** Avatar Generation (NEW - October 21, 2025)  
**Primary Technologies:** Luma Labs AI API, React, TypeScript  
**Created:** October 21, 2025  
**Type:** Intelligent Subject Matter Expert
**Replaces:** Manual Blender workflow (MB1)

---

## 🎯 My Responsibilities

I am the **Subject Matter Expert** for Luma Labs AI 3D avatar generation. I know everything about:

### Core Functionality
- ✅ Luma Labs API integration (text-to-3D generation)
- ✅ Professional Scott avatar generation using AI
- ✅ GLB model downloading and optimization
- ✅ Generation progress tracking and webhooks
- ✅ Error handling and retry logic
- ✅ Cost tracking and quota management

### User Journeys I Support
1. **Avatar Generation Journey** - User requests Scott avatar, AI generates it
2. **Model Preview Journey** - User previews generated model before applying
3. **Avatar Update Journey** - User regenerates avatar with different parameters
4. **Performance Mode Journey** - Fallback when generation fails

---

## 🏗️ Architecture I Manage

### Luma Labs API Integration

**API Key:** Stored in Replit Secrets as `LUMA_API_KEY`
**Base URL:** `https://api.lumalabs.ai/dream-machine/v1`

**Key Endpoints:**
1. **Generate 3D Model** - `POST /generations`
2. **Check Status** - `GET /generations/:id`
3. **Download Model** - `GET /generations/:id/assets`

### Backend Services

**Main Service:**
- `server/services/lumaLabsService.ts`
  - generateAvatar() - Create 3D model from text prompt
  - checkGenerationStatus() - Poll for completion
  - downloadModel() - Retrieve GLB file
  - optimizeModel() - Compress for web delivery

**API Routes:**
- `POST /api/avatar/generate` - Start generation
- `GET /api/avatar/status/:generationId` - Check progress
- `GET /api/avatar/download/:generationId` - Get GLB file
- `GET /api/avatar/history` - View past generations

### Frontend Components

**Avatar Generation UI:**
- `client/src/components/mrBlue/LumaAvatarGenerator.tsx`
  - Text prompt input
  - Generation progress indicator
  - Preview panel
  - Apply/Regenerate buttons

**Integration Points:**
- `client/src/components/mrBlue/MrBlueAvatar.tsx` - Renders generated GLB
- `client/src/pages/MrBluePage.tsx` - Avatar generation tab
- `client/src/components/admin/AvatarManagement.tsx` - Admin controls

---

## 🔧 Technical Implementation

### Scott Avatar Prompt Template

**Optimized prompt for Luma Labs:**
```typescript
const scottPrompt = `
Professional male avatar named Scott with blue hair styled upward,
wearing a dark gray vest over casual shirt, turquoise jewelry accents
(earrings, necklace), friendly facial expression, modern stylized 3D 
character suitable for AI assistant interface, clean topology, 
optimized for real-time rendering, T-pose, PBR materials
`;
```

### Generation Workflow

```typescript
// 1. Initiate generation
const generation = await lumaLabsService.generateAvatar({
  prompt: scottPrompt,
  quality: 'high', // high | medium | low
  format: 'glb',
  optimize: true
});

// 2. Poll for completion
const status = await lumaLabsService.checkGenerationStatus(generation.id);
// Status: 'queued' | 'processing' | 'completed' | 'failed'

// 3. Download GLB when complete
if (status === 'completed') {
  const glbUrl = await lumaLabsService.downloadModel(generation.id);
  // Save to: /assets/scott-avatar-luma.glb
}

// 4. Optimize for web
await lumaLabsService.optimizeModel(glbUrl, {
  maxFileSize: '5MB',
  compressionLevel: 'high',
  removeUnusedMaterials: true
});
```

### Database Schema

**New table:** `luma_generations`
```typescript
export const lumaGenerations = pgTable('luma_generations', {
  id: varchar('id').primaryKey(), // Luma generation ID
  userId: varchar('user_id').references(() => users.id),
  prompt: text('prompt').notNull(),
  status: varchar('status').notNull(), // queued, processing, completed, failed
  glbUrl: text('glb_url'),
  previewUrl: text('preview_url'),
  quality: varchar('quality').default('high'),
  cost: integer('cost'), // Credits used
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').defaultNow(),
  completedAt: timestamp('completed_at')
});
```

---

## 📊 Cost Management

### Luma Labs Pricing
- **Text-to-3D Generation:** ~30 credits per model
- **High Quality:** 50 credits
- **Medium Quality:** 30 credits
- **Low Quality:** 15 credits

### Quota Tracking
```typescript
interface LumaQuota {
  creditsRemaining: number;
  generationsToday: number;
  monthlyLimit: number;
  currentUsage: number;
}
```

**Cost Controls:**
- Admin-only generation by default
- Daily generation limits (configurable)
- Credit balance alerts
- Auto-fallback to cached models when quota exceeded

---

## 🎨 Avatar Customization Options

### Generation Parameters

```typescript
interface AvatarGenerationParams {
  // Base prompt
  characterName: string; // 'Scott'
  hairColor: string; // 'blue'
  outfit: string; // 'vest and casual shirt'
  accessories: string; // 'turquoise jewelry'
  
  // Quality settings
  quality: 'high' | 'medium' | 'low';
  polyCount?: number; // target polygon count
  textureResolution?: number; // 1024, 2048, 4096
  
  // Style options
  style: 'realistic' | 'stylized' | 'cartoon';
  emotionalExpression: 'neutral' | 'friendly' | 'professional';
  
  // Technical settings
  pose: 'T-pose' | 'A-pose' | 'natural';
  rigging: boolean; // Include skeleton
  blendShapes: boolean; // Include facial morphs
}
```

### Preset Variations

**Scott Variations:**
1. **Professional Scott** - Suit, formal expression
2. **Casual Scott** - T-shirt, friendly smile
3. **Tango Scott** - Dance outfit, energetic pose
4. **Tech Scott** - Hoodie, focused expression

---

## 🔄 Integration with Existing System

### Replacing Manual Blender Workflow

**Before (MB1):**
- Manual Blender modeling (15-21 hours)
- Mixamo rigging and animation
- Manual export and optimization
- Complex 3D modeling skills required

**After (MB2):**
- AI generation (5-10 minutes)
- Automatic rigging and optimization
- One-click regeneration
- No 3D skills required

### Fallback Strategy

**If Luma generation fails:**
1. Try cached previous generation
2. Fall back to primitive avatar (sphere)
3. Retry with lower quality
4. Alert admin for manual intervention

```typescript
async function getAvatar(): Promise<string> {
  try {
    // Try Luma-generated avatar
    return await getLumaAvatar();
  } catch (error) {
    console.warn('Luma avatar unavailable, using fallback');
    // Try cached version
    if (fs.existsSync('/assets/scott-avatar-luma.glb')) {
      return '/assets/scott-avatar-luma.glb';
    }
    // Ultimate fallback
    return 'primitive'; // Sphere avatar
  }
}
```

---

## 🧪 Testing & Validation

### Generation Quality Checks

**Automated validation:**
- ✅ GLB file size < 10MB
- ✅ Polygon count < 50,000
- ✅ Texture resolution appropriate
- ✅ Model has valid rigging
- ✅ Blend shapes present (if requested)
- ✅ No corrupted geometry

### Manual Review Process

**Before deploying new avatar:**
1. Generate preview render
2. Test in React Three Fiber
3. Verify animations work
4. Check performance (FPS impact)
5. Admin approval required
6. Deploy to production

---

## 📚 API Reference

### Luma Labs API Wrapper

**Service:** `server/services/lumaLabsService.ts`

```typescript
export class LumaLabsService {
  
  // Generate 3D model from text
  async generateAvatar(params: AvatarGenerationParams): Promise<Generation> {
    const response = await fetch('https://api.lumalabs.ai/dream-machine/v1/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.LUMA_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: this.buildPrompt(params),
        aspect_ratio: '1:1',
        model: 'v1.6',
        model_type: '3d',
        callback_url: `${process.env.REPL_URL}/api/webhooks/luma`
      })
    });
    
    return response.json();
  }
  
  // Check generation status
  async checkStatus(generationId: string): Promise<GenerationStatus> {
    const response = await fetch(
      `https://api.lumalabs.ai/dream-machine/v1/generations/${generationId}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.LUMA_API_KEY}`
        }
      }
    );
    
    return response.json();
  }
  
  // Download GLB file
  async downloadModel(generationId: string): Promise<string> {
    const status = await this.checkStatus(generationId);
    
    if (status.state !== 'completed') {
      throw new Error('Generation not complete');
    }
    
    const glbUrl = status.assets.model;
    
    // Download and save locally
    const response = await fetch(glbUrl);
    const buffer = await response.arrayBuffer();
    const filePath = `/tmp/scott-avatar-${generationId}.glb`;
    
    fs.writeFileSync(filePath, Buffer.from(buffer));
    
    return filePath;
  }
  
  // Build optimized prompt
  private buildPrompt(params: AvatarGenerationParams): string {
    return `
      Professional ${params.style} 3D character avatar,
      ${params.characterName} with ${params.hairColor} hair,
      wearing ${params.outfit},
      ${params.accessories},
      ${params.emotionalExpression} expression,
      ${params.pose},
      clean topology optimized for real-time rendering,
      PBR materials, game-ready asset
    `.trim().replace(/\s+/g, ' ');
  }
}
```

---

## 🚀 Deployment Strategy

### Phase 1: Admin Testing (Week 1)
- Generate test avatars
- Validate quality
- Optimize parameters
- Cost analysis

### Phase 2: Scott Avatar (Week 2)
- Generate production Scott avatar
- A/B test vs current avatar
- User feedback collection
- Performance monitoring

### Phase 3: User Customization (Month 2)
- Allow premium users to customize
- Avatar gallery/marketplace
- Community avatar sharing
- Personalization features

---

## 📈 Success Metrics

### Technical Metrics
- ✅ Generation success rate > 95%
- ✅ Average generation time < 10 minutes
- ✅ GLB file size < 5MB
- ✅ FPS impact < 5%

### Business Metrics
- ✅ User satisfaction with avatar quality
- ✅ Cost per generation < $0.50
- ✅ Monthly quota utilization
- ✅ Avatar customization adoption rate

---

## 🔗 Integration Points

### ESA Agents Involved

**Agent #73: Mr Blue Avatar Agent**
- Primary consumer of Luma-generated models
- Handles rendering and animations
- Manages avatar switching

**Agent #75: Avatar Manager**
- Admin controls for generation
- User avatar gallery
- Customization workflows

**Agent #11: UI/UX Design**
- Avatar generation UI design
- Preview/approval interface
- User feedback collection

---

## 📝 Next Steps

### Immediate (This Session)
1. ✅ Create Luma Labs service wrapper
2. ✅ Build generation API routes
3. ✅ Add database schema
4. ⏳ Create frontend UI component
5. ⏳ Test generation workflow

### Short-term (This Week)
1. Generate production Scott avatar
2. Integrate with MrBlueAvatar.tsx
3. Add admin controls
4. Performance testing

### Long-term (This Month)
1. User avatar customization
2. Avatar marketplace
3. Cost optimization
4. Advanced styling options

---

**Last Updated:** October 21, 2025  
**Status:** 🟢 ACTIVE DEVELOPMENT  
**Owner:** MB2 (Luma Labs Expert Agent)  
**Dependencies:** LUMA_API_KEY (secured in Replit Secrets)
