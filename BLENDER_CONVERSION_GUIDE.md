# 🎭 3D Avatar Production - Blender Conversion Guide

**TRACK 1: FBX → GLB Conversion for Mr Blue Avatar**

---

## 📦 Package Contents

```
input_models/
└── x-bot-original.fbx          # Source model with animations

output_models/                   # Your GLB files go here
└── (empty - you will create these)

scripts/
└── convert-xbot-to-glb.py      # Automation script (already created)

animation_mapping.json           # Animation → GLB mapping
production_checklist.md          # QA verification
```

---

## 🚀 Conversion Steps

### Step 1: Open Blender
1. Launch Blender application
2. Go to **File → Import → FBX (.fbx)**
3. Navigate to `assets/models/x-bot/x-bot-original.fbx`
4. Click **Import FBX**

### Step 2: Verify Model
✅ Check that the model appears in viewport
✅ Verify all meshes are present
✅ Check materials/textures loaded correctly

### Step 3: Optimize Mesh (80% reduction target)
1. Select the character mesh
2. Go to **Modifiers → Add Modifier → Decimate**
3. Set **Ratio: 0.2** (reduces to 20% of original poly count = 80% reduction)
4. Click **Apply** modifier

### Step 4: Convert Materials to PBR
1. Switch to **Shading** workspace
2. For each material:
   - Ensure it uses **Principled BSDF** shader
   - Connect textures: Base Color, Metallic, Roughness, Normal
   - Set proper values for realistic rendering

### Step 5: Export as GLB with Draco
1. Go to **File → Export → glTF 2.0 (.glb/.gltf)**
2. **Format:** GLB (Binary)
3. **Include:**
   - ✅ Selected Objects (character)
   - ✅ Custom Properties
   - ✅ Cameras (if any)
   - ✅ Punctual Lights
4. **Transform:**
   - ✅ +Y Up
5. **Geometry:**
   - ✅ Apply Modifiers
   - ✅ UVs
   - ✅ Normals
   - ✅ Tangents
   - ✅ Vertex Colors
6. **Compression:**
   - ✅ **Draco mesh compression** (ENABLED)
   - Compression level: **6** (60-80% size reduction)
   - Quantization:
     - Position: 14
     - Normal: 10
     - Tex Coord: 12
     - Color: 10
     - Generic: 12
7. **Animation:**
   - ✅ Animations
   - ✅ Shape Keys
   - ✅ Shape Key Normals
   - ✅ Skinning
   - Group by NLA Track: ON
8. **Output:** Save to `output_models/mr-blue-avatar.glb`

### Step 6: Export Individual Animations (if separate)
If you need standalone animation files:
1. For each animation (Idle, Talk, Gesture, etc.):
   - Select animation in Action Editor
   - Export with same settings
   - Save as: `mr-blue-{animation-name}.glb`

---

## 🎯 Expected Output

```
output_models/
├── mr-blue-avatar.glb          # Main model with all animations
├── mr-blue-idle.glb            # (Optional) Standalone idle
├── mr-blue-talk.glb            # (Optional) Standalone talking
└── mr-blue-gesture.glb         # (Optional) Standalone gestures
```

### File Size Targets
- **Original FBX:** ~1.7 MB
- **GLB without Draco:** ~800 KB
- **GLB with Draco:** ~300-400 KB ✨ (60-80% reduction)

---

## 📋 Animation Mapping

Based on the original model, we expect these animations:

```json
{
  "idle": {
    "name": "Idle",
    "duration": 3.0,
    "loop": true,
    "priority": 1
  },
  "talking": {
    "name": "Talking",
    "duration": 2.5,
    "loop": true,
    "priority": 2,
    "lipSync": true
  },
  "gesture_point": {
    "name": "PointGesture",
    "duration": 1.5,
    "loop": false,
    "priority": 3
  },
  "gesture_wave": {
    "name": "WaveGesture",
    "duration": 2.0,
    "loop": false,
    "priority": 3
  },
  "thinking": {
    "name": "Thinking",
    "duration": 2.0,
    "loop": true,
    "priority": 2
  }
}
```

---

## ✅ QA Checklist

After conversion, verify:

### Visual Quality
- [ ] Model appears correctly (no missing parts)
- [ ] Textures/materials look good
- [ ] Colors are accurate
- [ ] No visual artifacts

### Technical Specs
- [ ] File size < 500 KB
- [ ] Poly count reduced by ~80%
- [ ] Draco compression applied
- [ ] All animations included

### Animation Quality
- [ ] Idle animation loops smoothly
- [ ] Talking animation suitable for lip-sync
- [ ] Gesture animations play correctly
- [ ] No animation glitches
- [ ] Smooth transitions between states

### Performance
- [ ] Loads in < 2 seconds
- [ ] Renders at 60 FPS
- [ ] No memory leaks
- [ ] Works in Three.js/React Three Fiber

---

## 🔧 Troubleshooting

### Issue: Model too large
**Solution:** Increase Draco compression level to 8-10

### Issue: Animations don't play
**Solution:** Ensure "Group by NLA Track" is ON during export

### Issue: Materials look wrong
**Solution:** Verify PBR shader setup, check texture connections

### Issue: Import fails in Three.js
**Solution:** Ensure GLB binary format (not glTF + bin)

---

## 📤 Delivery

Once conversion is complete:

1. **Copy GLB files** to: `assets/models/mr-blue-production/`
2. **Update this checklist:** `production_checklist.md`
3. **Notify team:** "3D avatar GLB files ready for integration"
4. **Provide files** for MrBlueAvatar component update

---

## 🎯 Next Steps (Auto-Handled)

After you deliver the GLB files:

✅ TRACK 2 will update MrBlueAvatar.tsx to load production model  
✅ Animation system will map GLB actions to Three.js  
✅ Production avatar will replace dev model  
✅ Performance testing will verify 60 FPS target  

---

**🚀 Ready to convert? Follow the steps above and deliver the GLB files!**
