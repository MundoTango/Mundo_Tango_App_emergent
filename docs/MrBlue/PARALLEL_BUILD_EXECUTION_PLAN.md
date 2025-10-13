# Mr Blue Parallel Build Execution Plan
## AI-Driven Simultaneous Development (All 3 Tracks)

**Build Type:** Custom Option C (Professional 3D Avatar + Visual Editor + Integration)  
**Execution Mode:** ESA Principle 1 - Parallel By Default  
**AI Learning:** Zero user skills - AI learns Blender, React Three Fiber, Git automation on-the-fly  
**Timeline:** 7-8 days (15-30 hours total AI work)  
**Started:** October 13, 2025

---

## 🎯 Build Objectives

### What We're Building
1. **Custom 3D Scott Avatar** (Agent #73)
   - Professional Blender-modeled character
   - GLB format with skeletal rigging
   - 8 emotions + 8 visemes for lip sync
   - <5MB file size, 60fps performance

2. **Visual Page Editor** (Agent #78)
   - AI code generation (OpenAI GPT-4o)
   - Git automation (branch, commit, PR)
   - Preview deployment (staging environment)
   - Production merge workflow

3. **Complete Integration** (Agents #73-80)
   - React Three Fiber avatar loading
   - Lip sync with Web Speech API
   - All 3 customer journeys working
   - End-to-end testing complete

---

## 🔄 Parallel Execution Strategy

### Three Simultaneous Tracks

```
┌─────────────────────────────────────────────────────────────────┐
│                    PARALLEL BUILD - DAY 1-8                      │
│                                                                  │
│  Track A: 3D Avatar         Track B: Integration    Track C: Visual Editor │
│  ─────────────────         ─────────────────       ──────────────────────  │
│                                                                  │
│  AI learns Blender ──┐      Wait for GLB ──┐        Git service ──┐       │
│         ↓            │           ↓          │             ↓         │       │
│  Model character     │      Setup loader    │        Branch mgmt    │       │
│         ↓            │           ↓          │             ↓         │       │
│  Texture + rig       │      Blend shapes    │        File writer    │       │
│         ↓            │           ↓          │             ↓         │       │
│  Export GLB ─────────┘      Lip sync ───────┘        Preview deploy┘       │
│                                 ↓                          ↓               │
│                         INTEGRATION DAY 8                                 │
│                    Load GLB → Test journeys → Production deploy          │
└─────────────────────────────────────────────────────────────────┘
```

### No Blocking Dependencies
- Track A works with placeholder primitives
- Track B uses fallback avatar until GLB ready
- Track C independent of avatar development
- All integrate on Day 8

---

## 📋 Track A: 3D Avatar Build (Agent #73)

### AI Learning Requirements
**What AI Must Learn:**
1. **Blender 3D Modeling**
   - Interface navigation
   - Mesh modeling techniques
   - UV unwrapping
   - PBR texturing
   - Mixamo rigging
   - Animation basics

2. **Tools to Master:**
   - Blender 3.6+ (modeling software)
   - Substance Painter (texturing - optional)
   - Mixamo (auto-rigging service)
   - GLB export (glTF format)

### Learning Resources for AI
- Blender Guru YouTube tutorials
- Blender documentation: https://docs.blender.org
- Mixamo help: https://www.mixamo.com/faq
- GLB format spec: https://github.com/KhronosGroup/glTF

### Daily Tasks (7 days)

#### Day 1: AI Learns Blender Basics + Base Mesh (4-6 hours)
**Learning (2 hours):**
- [ ] Install Blender 3.6+ (if not available, use online Blender.org)
- [ ] Learn interface: 3D viewport, tools, navigation
- [ ] Understand mesh modeling: vertices, edges, faces
- [ ] Study proportions: human body ratios

**Execution (2-4 hours):**
- [ ] Create base humanoid mesh
  - Start with UV sphere → extrude body parts
  - OR use "Human" add-on base mesh
  - Target: 8k-12k polygons (quads only)
  - Height: 1.75m (7.5 Blender units)
  
**Deliverable:** `scott-base-mesh-v1.blend`

---

#### Day 2: AI Learns Facial Topology + Hair (4-6 hours)
**Learning (1 hour):**
- Face topology for animation (edge loops around eyes, mouth)
- Blend shape fundamentals
- Hair particle systems vs mesh hair

**Execution (3-5 hours):**
- [ ] Model facial features
  - Eye sockets (8-loop topology for blinks)
  - Mouth (12-loop for lip sync)
  - Nose, ears, jawline
- [ ] Create blue undercut hairstyle
  - Particle system OR mesh-based
  - Blue gradient material (root to tip)
  
**Deliverable:** `scott-with-face-hair-v1.blend`

---

#### Day 3: AI Learns UV Unwrapping + Texturing (6-8 hours)
**Learning (2 hours):**
- UV unwrapping workflow
- PBR material theory (Base Color, Roughness, Metallic, Normal)
- Texture painting in Blender

**Execution (4-6 hours):**
- [ ] UV unwrap entire model
  - Face: Manual unwrap (2048x2048)
  - Body: Smart UV project (2048x2048)
  - Minimize seams
- [ ] Create PBR textures
  - Skin tone base color
  - Hair blue gradient (#1E40AF → #60A5FA)
  - Vest dark gray (#1F2937)
  - Jewelry metallic (#F59E0B)
  - Turquoise accents (#06B6D4)
  
**Deliverable:** `scott-textured-v1.blend` + texture PNGs

---

#### Day 4: AI Learns Rigging + Blend Shapes (6-8 hours)
**Learning (2 hours):**
- Mixamo auto-rigging process
- Blend shape (shape keys) creation
- Weight painting basics

**Execution (4-6 hours):**
- [ ] Auto-rig with Mixamo
  - Export as FBX
  - Upload to Mixamo.com
  - Download rigged FBX (Y-Bot skeleton)
  - Import back to Blender
  
- [ ] Create 16 blend shapes (shape keys)
  - **8 Emotions:**
    1. neutral (base)
    2. happy (smile, raised cheeks)
    3. thinking (furrowed brow)
    4. concerned (raised eyebrows)
    5. excited (wide smile)
    6. listening (slight tilt)
    7. speaking (mouth open)
    8. idle (subtle movement)
  
  - **8 Visemes (lip sync):**
    1. A (ah - open mouth)
    2. E (ee - wide smile)
    3. I (ih - slight open)
    4. O (oh - rounded lips)
    5. U (oo - pursed lips)
    6. M/B (lips closed)
    7. F/V (lower lip bite)
    8. L (tongue visible)

**Deliverable:** `scott-rigged-blendshapes-v1.blend`

---

#### Day 5: AI Learns Animation + GLB Export (4-6 hours)
**Learning (1 hour):**
- Animation keyframing
- GLB export settings (Draco compression)
- glTF format requirements

**Execution (3-5 hours):**
- [ ] Create idle animation (120 frames, 4 seconds loop)
  - Breathing (chest up/down 20%)
  - Micro head movements (±2° rotation)
  - Blink every 3 seconds (shape key animation)
  
- [ ] Export as GLB
  - File → Export → glTF 2.0 (.glb)
  - Settings:
    - ✅ Include: Mesh, Materials, Textures, Skeleton, Shape Keys
    - ✅ Format: GLB (binary)
    - ✅ Draco compression: Enabled
    - ✅ Sampling: 30fps
  - Target: <5MB final file

**Deliverable:** `public/assets/scott-avatar.glb` (production-ready)

---

## 📋 Track B: React Three Fiber Integration (Agent #73)

### AI Learning Requirements
**What AI Must Learn:**
1. **React Three Fiber** (@react-three/fiber v8.x)
   - useFrame hook (animation loop)
   - useGLTF hook (model loading)
   - Camera controls
   - Lighting setup

2. **Three.js Fundamentals**
   - Scene, camera, renderer
   - Mesh, materials, geometries
   - Animation mixer
   - Morph targets (blend shapes)

### Learning Resources for AI
- React Three Fiber docs: https://docs.pmnd.rs/react-three-fiber
- Three.js docs: https://threejs.org/docs
- @react-three/drei hooks: https://github.com/pmndrs/drei

### Daily Tasks (3-4 days, parallel with Track A)

#### Day 1-2: Setup GLB Loader (2 hours)
**Learning (30 min):**
- useGLTF hook API
- Suspense boundaries
- Model loading optimization

**Execution (1.5 hours):**
```typescript
// client/src/lib/mrBlue/avatar/MrBlueAvatarProfessional.tsx
import { useGLTF, OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';

function ScottModel() {
  const { scene, animations, nodes, materials } = useGLTF('/assets/scott-avatar.glb');
  
  return <primitive object={scene} />;
}

export default function MrBlueAvatarProfessional() {
  return (
    <Canvas camera={{ position: [0, 0, 2], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} />
      <Suspense fallback={<FallbackAvatar />}>
        <ScottModel />
      </Suspense>
      <OrbitControls enableZoom={false} />
    </Canvas>
  );
}
```

**Deliverable:** GLB loader with fallback (works before model ready)

---

#### Day 3: Blend Shape Controller (3 hours)
**Learning (1 hour):**
- Morph target influences
- Blend shape interpolation
- State-based animation

**Execution (2 hours):**
```typescript
const [emotion, setEmotion] = useState<Emotion>('neutral');

useFrame(() => {
  if (scene) {
    const mesh = scene.getObjectByName('Head') as THREE.Mesh;
    if (mesh.morphTargetInfluences) {
      // Interpolate to target emotion
      mesh.morphTargetInfluences[emotionIndex[emotion]] = 
        THREE.MathUtils.lerp(
          mesh.morphTargetInfluences[emotionIndex[emotion]],
          1.0,
          0.1 // Smooth transition
        );
    }
  }
});
```

**Deliverable:** Emotion switching (8 states working)

---

#### Day 4: Lip Sync System (3-4 hours)
**Learning (1 hour):**
- Web Speech API events
- Phoneme to viseme mapping
- Audio analysis (volume detection)

**Execution (2-3 hours):**
```typescript
// Simple volume-based lip sync (fallback)
useEffect(() => {
  const audioContext = new AudioContext();
  const analyser = audioContext.createAnalyser();
  
  const detectVolume = () => {
    const volume = getAudioVolume(analyser);
    setMouthOpenness(volume * 0.8); // Scale volume to mouth opening
  };
  
  const interval = setInterval(detectVolume, 60); // 16ms = 60fps
  return () => clearInterval(interval);
}, []);
```

**Deliverable:** Basic lip sync responding to voice

---

## 📋 Track C: Visual Editor Completion (Agent #78)

### AI Learning Requirements
**What AI Must Learn:**
1. **Git Automation**
   - simple-git library API
   - Branch creation/switching
   - Commit automation
   - Push/pull operations

2. **Deployment Automation**
   - Vercel/Netlify APIs
   - Preview URL generation
   - GitHub PR creation
   - Automated testing

### Learning Resources for AI
- simple-git docs: https://github.com/steveukx/git-js
- GitHub API: https://docs.github.com/en/rest
- Vercel API: https://vercel.com/docs/rest-api

### Daily Tasks (3-4 days, parallel with Tracks A & B)

#### Day 1: Git Automation Service (2-3 hours)
**Learning (30 min):**
- simple-git usage
- Git workflow (branch, stage, commit, push)

**Execution (1.5-2.5 hours):**
```typescript
// server/services/gitAutomation.ts
import simpleGit from 'simple-git';

const git = simpleGit();

export async function createFeatureBranch(branchName: string) {
  await git.checkoutLocalBranch(branchName);
  return { branch: branchName, created: true };
}

export async function applyChanges(files: FileChange[]) {
  for (const file of files) {
    await fs.writeFile(file.path, file.content, 'utf-8');
  }
  
  await git.add('.');
  await git.commit(`Visual edit: ${files.length} files updated`);
  
  return { committed: true, filesChanged: files.length };
}
```

**Deliverable:** Git service with branch creation + file writing

---

#### Day 2: Preview Deployment (2-3 hours)
**Learning (30 min):**
- Vercel CLI / API
- Preview deployment workflow

**Execution (1.5-2.5 hours):**
```typescript
// server/routes/visualEditor.ts
app.post('/api/visual-editor/preview', async (req, res) => {
  const { branch } = req.body;
  
  // Deploy branch to Vercel preview
  const deployment = await vercel.deployments.create({
    name: 'mr-blue-preview',
    gitSource: { ref: branch, type: 'branch' },
  });
  
  res.json({
    previewUrl: `https://${deployment.url}`,
    expiresAt: Date.now() + 86400000, // 24 hours
  });
});
```

**Deliverable:** Preview deployment working with shareable URL

---

#### Day 3: Production Merge Workflow (2-3 hours)
**Learning (30 min):**
- GitHub PR API
- Playwright test runner integration

**Execution (1.5-2.5 hours):**
```typescript
// server/routes/visualEditor.ts
app.post('/api/visual-editor/deploy', async (req, res) => {
  const { branch, testResults } = req.body;
  
  // 1. Run tests on preview
  const tests = await runPlaywrightTests(branch);
  
  if (!tests.passed) {
    return res.status(400).json({ error: 'Tests failed', tests });
  }
  
  // 2. Create GitHub PR
  const pr = await octokit.pulls.create({
    owner: 'your-org',
    repo: 'your-repo',
    title: `Visual Edit: ${branch}`,
    head: branch,
    base: 'main',
    body: 'Auto-generated from Visual Page Editor',
  });
  
  // 3. Auto-merge if tests pass
  await octokit.pulls.merge({
    owner: 'your-org',
    repo: 'your-repo',
    pull_number: pr.data.number,
    merge_method: 'squash',
  });
  
  res.json({ deployed: true, prUrl: pr.data.html_url });
});
```

**Deliverable:** Full production deployment pipeline

---

## 🧪 Day 8: Integration & Testing

### All Tracks Converge

#### Morning: Integration (3 hours)
1. **Load Custom GLB in React Three Fiber**
   - Replace fallback with real scott-avatar.glb
   - Verify all animations load
   - Test blend shapes respond

2. **Connect Visual Editor to Avatar**
   - Edit avatar component via Visual Editor
   - Generate code with AI
   - Deploy changes to preview

3. **End-to-End Customer Journeys**
   - Journey 1: Text change → code gen → deploy
   - Journey 2: Layout change → Tailwind update → deploy
   - Journey 3: Theme change → global CSS → deploy

#### Afternoon: Testing & Validation (3 hours)
1. **Performance Testing**
   - [ ] Avatar: 60fps desktop, 30fps mobile
   - [ ] File size: <5MB GLB
   - [ ] Memory usage: <100MB

2. **Functional Testing**
   - [ ] All 8 emotions working
   - [ ] Lip sync responding to voice
   - [ ] Visual Editor deploys successfully

3. **Documentation Update**
   - [ ] Update avatar-build-log.md (final stats)
   - [ ] Update visual-editor-testing.md (journey results)
   - [ ] Update replit.md (mark as complete)

---

## 📊 Success Metrics

### Track A: 3D Avatar
- [ ] GLB file size: <5MB ✅
- [ ] Desktop performance: 60fps ✅
- [ ] Mobile performance: 30fps ✅
- [ ] Blend shapes: 16 total (8 emotions + 8 visemes) ✅
- [ ] Animation: Idle loop working ✅

### Track B: Integration
- [ ] GLB loads with useGLTF ✅
- [ ] Emotion switching: <300ms ✅
- [ ] Lip sync accuracy: 70%+ ✅
- [ ] Camera controls responsive ✅

### Track C: Visual Editor
- [ ] Git automation: 100% success rate ✅
- [ ] Preview deployment: <60s ✅
- [ ] Production merge: Automated ✅
- [ ] Code quality: 90%+ AI accuracy ✅

### Overall Platform
- [ ] All 3 customer journeys complete ✅
- [ ] Zero LSP errors ✅
- [ ] End-to-end testing passed ✅
- [ ] Documentation updated ✅

---

## 🛠️ AI Self-Learning Protocol

### How AI Will Learn New Skills

**For Blender (Track A):**
1. Read Blender documentation (blender.org/api)
2. Watch video tutorials (search YouTube transcripts)
3. Practice with simple meshes first
4. Iterate based on export results
5. Validate with React Three Fiber imports

**For React Three Fiber (Track B):**
1. Read official docs (docs.pmnd.rs)
2. Study existing fallback avatar code
3. Test with primitive objects first
4. Add complexity incrementally
5. Performance profile with Chrome DevTools

**For Git Automation (Track C):**
1. Read simple-git API docs
2. Test in isolated branch first
3. Validate with git status checks
4. Add error handling for conflicts
5. Test rollback scenarios

**Learning Validation:**
- Each new skill tested in isolation
- Failures documented with solutions
- Successful patterns added to mb.md
- Cross-track learning shared via A2A protocol

---

## 🚀 Execution Checklist

### Pre-Build Validation
- [x] ESA training complete (mb-esa-training.md)
- [x] Agents registered (ESA_AGENT_ORG_CHART.md)
- [x] Parallel plan documented (this file)
- [x] Quality gates defined (60fps, <5MB, 90% accuracy)

### Track A: Start Immediately
- [ ] Install/access Blender 3.6+
- [ ] Create base humanoid mesh
- [ ] Begin facial topology
- [ ] Document progress in avatar-build-log.md

### Track B: Start Immediately
- [ ] Setup useGLTF with fallback
- [ ] Prepare blend shape controller
- [ ] Stub lip sync system

### Track C: Start Immediately
- [ ] Create git automation service
- [ ] Setup preview deployment
- [ ] Plan production merge workflow

### Integration (Day 8)
- [ ] Load real GLB model
- [ ] Test all 3 customer journeys
- [ ] Performance validation
- [ ] Documentation finalization

---

## 📞 Escalation & Support

### If AI Gets Stuck
1. **Search existing code** (grep, glob tools)
2. **Consult external docs** (official documentation)
3. **Try simpler approach** (reduce complexity)
4. **Document blocker** (add to mb.md issues section)
5. **Move to parallel track** (don't block other work)

### Quality Gates (ESA Principle 5)
- **Pre-work:** Context validation complete ✅
- **During work:** Continuous LSP monitoring
- **Post-work:** Agent #79 validation
- **Handoff:** Agent #80 captures learnings

---

**BUILD STATUS:** Ready to Execute  
**AI Learning Mode:** Active  
**Parallel Tracks:** 3 simultaneous  
**Target Completion:** 7-8 days

---

**Last Updated:** October 13, 2025  
**Next Step:** START BUILDING (all 3 tracks simultaneously)  
**Methodology:** ESA Principle 1 - Parallel By Default
