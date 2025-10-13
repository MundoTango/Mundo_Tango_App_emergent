# CC0 Humanoid Model Sources
## Track A: 3D Avatar Base Model Research

**Goal:** Find professional CC0/open-source humanoid model for Scott avatar customization  
**Requirements:** Rigged, <10k polygons, PBR-ready, GLB/FBX format

---

## 🎯 Recommended Sources

### 1. **Sketchfab CC0 Collection**
**URL:** https://sketchfab.com/search?q=humanoid+rigged&licenses=322a749bcfa841b29dff1e8a1bb74b0b

**Best Models:**
- "Rigged Humanoid Base Mesh" by various artists
- Filter: CC0, Rigged, < 10k polygons
- Download format: GLB preferred

**Search Query:** `humanoid rigged cc0`

---

### 2. **Blender Cloud (Free Assets)**
**URL:** https://cloud.blender.org/p/characters/

**Best Models:**
- "Spring" character base
- "Agent 327" base mesh
- "Caminandes" characters

**Access:** Free with Blender ID, CC-BY or CC0

---

### 3. **Mixamo Characters**
**URL:** https://www.mixamo.com/#/?page=1&type=Character

**Best Models:**
- "X Bot" (default rigged character)
- "Y Bot" (alternative topology)
- Auto-rigged, ready for animation

**License:** Free for use with Adobe account
**Process:** Download FBX, customize in Blender

---

### 4. **OpenGameArt.org**
**URL:** https://opengameart.org/art-search-advanced?keys=humanoid&field_art_type_tid[]=9

**Best Models:**
- Search: "humanoid rigged"
- Filter: CC0, CC-BY 3.0
- Format: FBX, Collada, GLB

---

### 5. **GitHub Open Source Models**
**Repos:**
- https://github.com/KhronosGroup/glTF-Sample-Models
- https://github.com/stephomi/sculptgl

**Models:**
- glTF-Sample-Models/2.0/RiggedFigure/
- Various CC0 test models

---

## ✅ Selected Model Criteria

### Must Have:
- [x] CC0 or permissive license (CC-BY OK)
- [x] Skeletal rig (preferably Mixamo-compatible)
- [x] < 10k polygons (performance)
- [x] GLB or FBX format
- [x] Humanoid proportions (male preferred)

### Nice to Have:
- [ ] Existing blend shapes (can add manually)
- [ ] PBR textures (can replace)
- [ ] Facial topology (can refine)

---

## 🔨 Customization Plan

Once model is downloaded:

### Step 1: Import to Blender
```python
import bpy

# Import GLB
bpy.ops.import_scene.gltf(filepath="base-humanoid.glb")

# OR import FBX
bpy.ops.import_scene.fbx(filepath="base-humanoid.fbx")
```

### Step 2: Scott Customization
```python
# Add blue hair (particle system or mesh)
def add_blue_hair():
    # Create hair from head vertices
    head = bpy.data.objects["Head"]
    # ... extrude top vertices for undercut style
    
    # Add blue material
    mat = bpy.data.materials.new("HairBlue")
    mat.use_nodes = True
    # Set blue gradient (#1E40AF → #60A5FA)

# Add vest geometry
def add_vest():
    # Duplicate torso mesh
    # Extrude outward slightly
    # Add dark gray material (#1F2937)

# Add jewelry
def add_jewelry():
    # Create earrings (simple spheres)
    # Create necklaces (torus geometry)
    # Add gold/turquoise materials
```

### Step 3: Create Blend Shapes
```python
# 8 Emotions
emotions = ["happy", "thinking", "concerned", "excited", 
            "listening", "speaking", "idle", "neutral"]

# 8 Visemes for lip sync
visemes = ["A", "E", "I", "O", "U", "MB", "FV", "L"]

for emotion in emotions:
    bpy.data.objects["Head"].shape_key_add(name=emotion)
    # Sculpt facial expression
    
for viseme in visemes:
    bpy.data.objects["Head"].shape_key_add(name=viseme)
    # Sculpt mouth shape
```

### Step 4: Export GLB
```python
# Optimize and export
bpy.ops.export_scene.gltf(
    filepath="public/assets/scott-avatar.glb",
    export_format='GLB',
    use_draco_mesh_compression=True,
    draco_mesh_compression_level=6,
    export_animations=True,
    export_morph=True,  # Blend shapes
    export_skins=True   # Rigging
)
```

---

## 📊 Model Comparison

| Source | License | Rigged | Polygons | Format | Quality |
|--------|---------|--------|----------|--------|---------|
| **Sketchfab CC0** | CC0 | ✅ | Varies | GLB | ⭐⭐⭐⭐ |
| **Mixamo X Bot** | Free | ✅ | ~5k | FBX | ⭐⭐⭐⭐⭐ |
| **Blender Cloud** | CC-BY | ✅ | 8-12k | Blend | ⭐⭐⭐⭐ |
| **OpenGameArt** | CC0/CC-BY | Mixed | Varies | Mixed | ⭐⭐⭐ |
| **glTF Samples** | CC0 | ✅ | ~3k | GLB | ⭐⭐⭐ |

---

## ⚡ Quick Start (TODAY)

### Option A: Mixamo X Bot (Recommended - Fastest)
1. Go to https://www.mixamo.com
2. Select "X Bot" character
3. Download in T-pose (FBX format)
4. Import to Blender
5. Customize for Scott (2-3 hours)

**Pros:** Pre-rigged, clean topology, proven quality  
**Cons:** Requires Adobe account (free)

### Option B: Sketchfab CC0 Search
1. Search: https://sketchfab.com/search?q=humanoid+rigged+cc0
2. Filter: CC0 license, < 10k polygons
3. Download GLB
4. Customize in Blender

**Pros:** True CC0, GLB format ready  
**Cons:** Quality varies, may need topology fixes

### Option C: glTF Sample Models (Fallback)
1. Clone: https://github.com/KhronosGroup/glTF-Sample-Models
2. Use: `2.0/RiggedFigure/glTF-Binary/RiggedFigure.glb`
3. Customize in Blender

**Pros:** Guaranteed to work, CC0  
**Cons:** Very basic, requires extensive customization

---

## 🎯 TODAY's Action

**DECISION:** Use Mixamo X Bot (Option A)

**Timeline:**
1. Download X Bot FBX (5 min)
2. Import to Blender (5 min)
3. Customize for Scott (2-3 hours):
   - Blue hair mesh
   - Vest geometry
   - Jewelry additions
4. Create 16 blend shapes (2-3 hours)
5. Export optimized GLB (30 min)

**Total:** 5-7 hours for complete professional avatar

---

**Status:** Ready to download model NOW  
**Next Step:** Execute Mixamo download OR Sketchfab search  
**Fallback:** glTF Sample Models if above fail
