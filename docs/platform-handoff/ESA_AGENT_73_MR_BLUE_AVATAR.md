# Agent #73: Mr Blue - 3D Avatar & Animation Director

**Division:** Domain #3 (UX/UI) + Domain #7 (AI Intelligence)  
**Layer:** 48 (UI/UX Design) + 31 (AI Infrastructure)  
**Status:** Active  
**Created:** October 12, 2025

---

## Role & Responsibilities

Agent #73 is responsible for creating, animating, and managing Mr Blue - the platform's 3D AI avatar companion who guides users through their Mundo Tango experience.

### Core Responsibilities:
1. Create 3D animated Mr Blue avatar (vibrant blue hair, charismatic style)
2. Build animation library (wave, walk, idle, thinking, celebrating)
3. Implement voice cloning system (user's voice → natural TTS)
4. Integrate avatar across platform (tour guide, chat companion, admin assistant)
5. Manage avatar personality & emotional states
6. Optimize performance for mobile devices

---

## Character Design

### Mr Blue Visual Identity

**Based on Inspiration Photos:**
- **Hair:** Vibrant blue mohawk/quiff (signature feature)
- **Style:** Fashionable, approachable, artistic
- **Outfit:** Cream/beige blazer, turquoise accents, casual elegance
- **Accessories:** Bracelets, necklaces, stylish details
- **Vibe:** Confident guide, friendly companion, knowledgeable helper

**Personality Traits:**
- Helpful & supportive (like a best friend)
- Knowledgeable but not condescending
- Enthusiastic about tango & community
- Playful with celebrations (waves, dances)
- Professional when assisting admins

---

## Technology Stack

### 3D Avatar Creation

**Primary: Ready Player Me**
- Customizable 3D human avatars
- Web-optimized GLB format
- Real-time rendering in browser
- Supports custom hair colors (blue!)
- Animation-ready rigging

**Alternative: Custom Blender Model**
- Full control over design
- Styled exactly to photos
- Export to GLB/GLTF
- More work, but unique

**Recommendation:** Start with Ready Player Me for speed, customize later

---

### Animation System

**Animation Sources:**

1. **Mixamo (Adobe)**
   - Walk cycle (casual stroll)
   - Wave (friendly greeting)
   - Idle (breathing, subtle movement)
   - Thinking (hand on chin)
   - Celebrating (arms up, excited)

2. **Custom GSAP Animations**
   - Float in/out (appears smoothly)
   - Position transitions (walks across screen)
   - Scale/rotate micro-interactions
   - Magnetic hover effects

3. **Facial Expressions** (if supported)
   - Happy (default)
   - Thinking (problem-solving)
   - Surprised (discovery)
   - Celebratory (success)

---

### Voice System

**Voice Cloning Technology:**

**Recommended: ElevenLabs**
- Best quality voice cloning
- 1-3 minutes of audio needed
- Natural, emotional TTS
- $22/mo for commercial use

**Alternative: PlayHT**
- 3-5 minutes of audio needed
- Multiple voice styles
- Good quality
- $39/mo for commercial use

**Recording Requirements for User:**
- **Duration:** 3-5 minutes clear speech
- **Content:** Varied sentences (news, casual, instructional)
- **Emotions:** Happy, serious, excited, helpful
- **Quality:** No background noise, consistent volume
- **Format:** WAV or MP3

**Mr Blue Voice Characteristics:**
- Warm, friendly tone
- Clear pronunciation
- Upbeat energy (not robotic)
- Conversational (not scripted)
- Multilingual support (68 languages)

---

## Technical Implementation

### React Three Fiber Component

```typescript
// components/avatar/MrBlueAvatar.tsx

import { Canvas } from '@react-three/fiber'
import { useGLTF, OrbitControls, PresentationControls } from '@react-three/drei'
import { Suspense } from 'react'

interface MrBlueAvatarProps {
  animation: 'idle' | 'wave' | 'walk' | 'think' | 'celebrate'
  position: [number, number, number]
  scale: number
  onReady?: () => void
}

export function MrBlueAvatar({ animation, position, scale, onReady }: MrBlueAvatarProps) {
  const { scene, animations } = useGLTF('/assets/mr-blue.glb')
  
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
      <Suspense fallback={null}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <PresentationControls>
          <primitive 
            object={scene} 
            position={position} 
            scale={scale}
            onLoad={onReady}
          />
        </PresentationControls>
      </Suspense>
    </Canvas>
  )
}
```

### Animation State Machine

**States:**
1. **Idle** - Default breathing animation
2. **Greeting** - Waves when user arrives
3. **Speaking** - Lip sync with TTS (if supported)
4. **Thinking** - Hand on chin while processing
5. **Walking** - Moves to different screen position
6. **Celebrating** - Arms up when user succeeds

### Performance Optimization

**Mobile Performance:**
- LOD (Level of Detail) - Lower poly count on mobile
- Texture compression (Draco, KTX2)
- Lazy loading (only load when needed)
- GPU instancing for multiple avatars
- Reduce animation complexity on low-end devices

**Load Time Optimization:**
- Compress GLB file (<2MB)
- Progressive loading (show simple version first)
- Cache avatar model (load once)
- Preload animations

---

## Integration Points

### 1. Interactive Tour Guide (Agent #74)
- **First login:** Mr Blue waves, introduces himself
- **Tour steps:** Walks user through features
- **Completion:** Celebrates with animation

### 2. Chat Companion (Life Plus / Mr Blue Tier)
- **Position:** Bottom-right floating
- **Behavior:** Idle animation, waves on interaction
- **Voice:** Speaks responses via TTS
- **Actions:** Can walk to different areas to point at features

### 3. Admin Assistant (Super Admin+)
- **Advanced Mode:** Understands design requests
- **Actions:** "Change this color" → points at element
- **Confirmation:** Gives thumbs up when change applied

### 4. Hover Icon (Global)
- **Like ESA MindMap:** Floating button
- **Click:** Mr Blue appears and greets
- **Magnetic:** Follows cursor slightly

---

## Avatar Capabilities by User Tier

### Free Users:
- ❌ No Mr Blue access
- See Mr Blue in tours only

### Global Explorer:
- ❌ No Mr Blue access
- See hints about upgrading to Mr Blue

### Mr Blue Tier (Life Plus):
- ✅ Full Mr Blue access
- ✅ Chat companion
- ✅ Semantic search
- ✅ Platform intelligence
- ✅ Can act on behalf (book, RSVP, message)

### Professional:
- ✅ Everything in Mr Blue
- ✅ Site builder assistant
- ✅ Business analytics guide

### Admin/Super Admin:
- ✅ Everything in Professional
- ✅ Platform modification powers
- ✅ "Change this color" commands
- ✅ Real-time design assistant

---

## Voice TTS Integration

### Sample Mr Blue Phrases:

**Greetings:**
- "Hey there! I'm Mr Blue, your guide to Mundo Tango!"
- "Welcome back! Ready to explore today?"
- "Great to see you! Let's find something amazing."

**Helpful:**
- "I can help you with that. Let me show you how."
- "Looking for someone? I can search the entire platform."
- "Need to book a class? I'll find the perfect teacher for you."

**Celebration:**
- "Awesome! You're getting the hang of this!"
- "Nice work! Your profile looks fantastic!"
- "You just made your first post! The community will love it."

**Admin Mode:**
- "I can change that for you. What color would you prefer?"
- "Let me adjust the layout. How does this look?"
- "Design updated! Refreshing the page for you."

---

## Development Phases

### Phase 1: Character Creation (Day 1-2)
1. Create Mr Blue in Ready Player Me
2. Customize: Blue hair, fashionable outfit
3. Export GLB model (<2MB)
4. Test in React Three Fiber

### Phase 2: Animations (Day 3-4)
1. Import Mixamo animations
2. Create GSAP position/movement animations
3. Build state machine
4. Test animation transitions

### Phase 3: Voice (Day 5-6)
1. Research ElevenLabs vs PlayHT
2. **User records 3-5 min samples**
3. Train voice model
4. Integrate TTS API
5. Test phrases & emotions

### Phase 4: Integration (Day 7-8)
1. Build MrBlueAvatar component
2. Add to tour system
3. Create chat interface
4. Build hover icon
5. Optimize performance

---

## Accessibility

**Options for Users:**
- 🔊 Enable/disable voice
- 🎭 Reduce motion (simple fade instead of walk)
- 👁️ Hide avatar (text-only mode)
- ⚡ Performance mode (2D avatar instead of 3D)

---

## Future Enhancements

1. **Emotions:** More facial expressions
2. **Gestures:** Point, thumbs up, tango dance moves
3. **Costumes:** Different outfits for events
4. **Multiplayer:** Multiple users see shared Mr Blue in groups
5. **AR:** Mr Blue in augmented reality (mobile camera)

---

**Status:** Ready for implementation  
**Dependencies:** Ready Player Me account, ElevenLabs API key, Voice samples from user  
**Next Steps:** Create 3D model, import animations, integrate voice
