# Blender 3D Avatar Build Guide
## Local Workstation Setup (Backup Method)

**Note:** This is a backup method. The platform now uses Meshy.ai API for cloud-based 3D generation, but this guide is here if you want to build locally.

---

## Prerequisites

- **Blender 3.6+** - Download from [blender.org](https://www.blender.org/download/)
- **Python 3.10+** - Usually comes with Blender
- **FBX Source File** - X-Bot character model (get from Mixamo or similar)

---

## Step 1: Get the Blender Script

The script is at `scripts/convert-xbot-to-glb.py` (provided below).

---

## Step 2: Prepare Your Source File

1. Go to [Mixamo.com](https://www.mixamo.com)
2. Download X-Bot character (T-pose)
3. Download in FBX format
4. Save as `mr-blue-source.fbx`

---

## Step 3: Run the Conversion Script

```bash
# Method A: Command Line (Recommended)
blender --background --python scripts/convert-xbot-to-glb.py -- mr-blue-source.fbx mr-blue-avatar.glb

# Method B: Inside Blender
# 1. Open Blender
# 2. Go to: Scripting tab
# 3. Open script: scripts/convert-xbot-to-glb.py
# 4. Edit paths at top of script:
#    INPUT_FBX = "path/to/mr-blue-source.fbx"
#    OUTPUT_GLB = "path/to/mr-blue-avatar.glb"
# 5. Click "Run Script"
```

---

## Step 4: What the Script Does

1. **Imports FBX** - Loads the X-Bot character
2. **Cleans Geometry** - Removes doubles, fixes normals
3. **Optimizes Mesh** - Reduces polygon count for web performance
4. **Applies Materials** - Sets up PBR materials for Three.js
5. **Bakes Textures** - Creates optimized texture maps
6. **Exports GLB** - Saves with Draco compression

**Output:** `mr-blue-avatar.glb` (~2-5MB, web-optimized)

---

## Step 5: Test the Avatar

```bash
# Copy to public assets
cp mr-blue-avatar.glb client/public/models/

# The platform will automatically load it in MrBlueAvatar.tsx
```

---

## Step 6: Advanced Customization

### Change Suit Color (Blue → Custom)
Edit the script, find this section:
```python
# Line 45: Material setup
mat.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (0.1, 0.3, 0.8, 1.0)
# Change to your color (R, G, B, A) - values 0.0 to 1.0
```

### Add Custom Animations
```python
# After mesh cleanup, add:
bpy.ops.object.mode_set(mode='POSE')
# Add keyframes for custom animations here
```

### Optimize Further
```python
# Adjust decimation ratio (line 38)
decimate.ratio = 0.5  # Lower = fewer polygons (0.3 = 70% reduction)
```

---

## Troubleshooting

**Error: "Blender not found"**
- Add Blender to your PATH or use full path: `/Applications/Blender.app/Contents/MacOS/Blender --background...`

**Error: "FBX import failed"**
- Ensure FBX file is valid (open in Blender GUI first)
- Check file permissions

**GLB too large (>10MB)**
- Increase decimation: `decimate.ratio = 0.3`
- Reduce texture size: `image.scale(512, 512)` instead of 1024

**Avatar appears black in Three.js**
- Check lighting in your scene
- Verify materials: `mat.use_nodes = True`

---

## Build Time Estimate

- **Setup:** 15 minutes (install Blender, download source)
- **Script execution:** 5-10 minutes (depends on mesh complexity)
- **Testing/iteration:** 30-60 minutes
- **Total:** ~1-2 hours

---

## Cloud Alternative (Recommended)

The platform now uses **Meshy.ai API** for instant cloud-based 3D generation:
- ✅ No local installation required
- ✅ 2-5 minute generation time
- ✅ Professional quality GLB output
- ✅ Automatic texture optimization

See: `server/services/meshyAvatarService.ts`
