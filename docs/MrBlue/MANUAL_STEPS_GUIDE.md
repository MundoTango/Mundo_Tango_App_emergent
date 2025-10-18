# Mr Blue - Final 5% Manual Execution Guide
## 3D Avatar Production (Agent #73)

**Time Required:** 3 hours  
**Difficulty:** Easy (fully automated script)  
**Result:** Professional Scott avatar GLB (<5MB, 60fps)

---

## Step 1: Download Mixamo X Bot (5 minutes)

### Option A: Mixamo (Recommended - Free)
1. Go to **https://www.mixamo.com**
2. Click **"Sign In"** (top right)
3. Create free Adobe account or login
4. Once logged in:
   - Click **"Characters"** tab
   - Search for **"X Bot"**
   - Select **X Bot** character
   - Click **"Download"** button
   - Format: **FBX (.fbx)**
   - Pose: **T-Pose**
   - Download to your computer

### Option B: Alternative CC0 Models
If Mixamo is unavailable, use these CC0 sources:
- **Poly Pizza**: https://poly.pizza (search "humanoid")
- **Sketchfab**: https://sketchfab.com/search?features=downloadable&licenses=322a749bcfa841b29dff1e8a1bb74b0b&q=character&type=models
- **Quaternius**: http://quaternius.com/index.html (Ultimate Animated Characters pack)

Download format: **FBX** or **GLB** in T-pose

---

## Step 2: Upload to Replit (2 minutes)

1. In Replit, create folder: `assets/models/`
2. Upload your downloaded file:
   - Drag and drop into `assets/models/`
   - Or use Files panel → Upload
3. Rename to: `base-character.fbx`

---

## Step 3: Update Blender Script Path (1 minute)

Open: `docs/MrBlue/blender-automation-scott.py`

Find line ~215:
```python
base_model_path = "path/to/mixamo-xbot.fbx"
```

Change to:
```python
base_model_path = "assets/models/base-character.fbx"
```

Save file.

---

## Step 4: Install Blender (If Not Installed)

### macOS:
```bash
brew install --cask blender
```

### Windows:
Download from: https://www.blender.org/download/

### Linux:
```bash
sudo apt install blender
```

Or use Snap:
```bash
sudo snap install blender --classic
```

---

## Step 5: Execute Blender Automation (3 hours)

### Option A: Command Line (Recommended)
```bash
blender --background --python docs/MrBlue/blender-automation-scott.py
```

**What This Does:**
1. Loads base character
2. Adds blue undercut hair
3. Creates dark vest with turquoise accents
4. Adds jewelry (earrings, necklace)
5. Creates 16 blend shapes:
   - 8 emotions: neutral, happy, thinking, concerned, excited, listening, speaking, idle
   - 8 visemes: A, E, I, O, U, MB, FV, L
6. Optimizes textures (1024x1024)
7. Exports GLB with Draco compression

**Output:** `public/assets/scott-avatar.glb`

### Option B: Blender GUI
1. Open Blender
2. Go to: **Scripting** workspace (top menu)
3. Click **"Open"** → Select `docs/MrBlue/blender-automation-scott.py`
4. Click **"Run Script"** (▶️ button)
5. Wait for completion (check console for progress)

---

## Step 6: Verify Output (2 minutes)

Check file exists:
```bash
ls -lh public/assets/scott-avatar.glb
```

**Target:** <5MB file size

### Quality Checks:
```bash
# Check file size
du -h public/assets/scott-avatar.glb

# Expected: ~3-4MB with Draco compression
```

If file is too large (>5MB):
1. Open in Blender
2. Reduce texture resolution to 512x512
3. Re-export with higher Draco compression

---

## Step 7: Test in Browser (5 minutes)

1. Restart workflow: `npm run dev`
2. Navigate to: `/mr-blue`
3. Verify avatar loads in 3D canvas
4. Check FPS (should be 60fps desktop, 30fps mobile)
5. Test blend shape morphing (emotions change)

---

## Troubleshooting

### Issue: Blender not found
**Solution:** Install Blender (see Step 4)

### Issue: Script fails on import
**Solution:** Verify base model path is correct
```python
# Should point to actual file
base_model_path = "assets/models/base-character.fbx"
```

### Issue: GLB too large (>5MB)
**Solution:** Increase Draco compression
```python
# In blender-automation-scott.py, line ~350
draco_mesh_compression_level=6,  # Increase to 8 or 10
```

### Issue: Avatar not visible in browser
**Solution:** 
1. Check browser console for errors
2. Verify GLB path: `public/assets/scott-avatar.glb`
3. Clear browser cache and hard refresh

### Issue: Low FPS (<30fps)
**Solution:**
1. Reduce polygon count in Blender
2. Use LOD system (already in `ScottAvatarEnhanced.tsx`)
3. Reduce texture size to 512x512

---

## Success Criteria

✅ **File:** `public/assets/scott-avatar.glb` exists  
✅ **Size:** <5MB  
✅ **Performance:** 60fps desktop, 30fps mobile  
✅ **Features:** 16 blend shapes working  
✅ **Visuals:** Blue hair, vest, jewelry present  

---

## Automated Tests Running in Parallel

While Blender processes (3 hours), automated tests run:

**TRACK B: Visual Editor Journeys**
```bash
npm run test:visual-editor
```

**TRACK C: Integration Suite**
```bash
npm run test:integration
```

These tests verify:
- All 8 agents load correctly
- A2A collaboration works
- Knowledge flows operational
- Performance targets met

---

## Final Verification

Once Blender completes:

```bash
# Run full test suite
npm run test:mr-blue

# Expected: All tests passing
# ✅ Agent #73: 3D Avatar - PASS
# ✅ Agent #74: Interactive Tours - PASS
# ✅ Agent #75: Subscription Manager - PASS
# ✅ Agent #76: Platform Search - PASS
# ✅ Agent #77: AI Site Builder - PASS
# ✅ Agent #78: Visual Editor - PASS
# ✅ Agent #79: Quality Validator - PASS
# ✅ Agent #80: Learning Coordinator - PASS
```

---

## Timeline Summary

| Task | Time | Status |
|------|------|--------|
| Download Mixamo | 5 min | Manual |
| Upload to Replit | 2 min | Manual |
| Update script path | 1 min | Manual |
| Execute Blender | 3 hours | Automated |
| Verify output | 2 min | Manual |
| Test in browser | 5 min | Manual |
| **TOTAL** | **~3.25 hours** | **Mix** |

**Parallel Execution:**
- Blender runs (3 hours)
- Tests run simultaneously (30 min)
- Final verification (15 min)

**Total Wall Clock Time:** 3.25 hours

---

**Questions?** The Blender script is fully automated. Just download the base model, update the path, and run!
