# Blender AI Self-Learning Guide
## Track A: 3D Avatar Build for AI Agent

**Agent:** #73 Scott 3D Avatar Expert  
**Learning Mode:** AI self-teaches Blender fundamentals  
**Goal:** Create professional GLB avatar from scratch  
**Timeline:** 7 days (AI learns + builds simultaneously)

---

## 🎯 What AI Must Learn

### Core Blender Skills
1. **Interface Navigation** - 3D viewport, tools, hotkeys
2. **Mesh Modeling** - Vertices, edges, faces, extrude, loop cuts
3. **UV Unwrapping** - Texture mapping, seam placement
4. **PBR Texturing** - Base color, roughness, metallic, normal maps
5. **Rigging** - Mixamo auto-rigging, weight painting
6. **Blend Shapes** - Shape keys for facial expressions
7. **Animation** - Keyframes, timeline, interpolation
8. **GLB Export** - glTF 2.0 format, Draco compression

---

## 📚 Learning Resources for AI

### Official Documentation
- **Blender Manual:** https://docs.blender.org/manual/en/latest/
- **Blender Python API:** https://docs.blender.org/api/current/
- **glTF 2.0 Spec:** https://github.com/KhronosGroup/glTF/tree/master/specification/2.0

### Video Tutorials (Transcripts Available)
- **Blender Guru - Donut Tutorial:** Interface basics
- **Grant Abbitt - Character Modeling:** Humanoid creation
- **CG Cookie - Rigging Fundamentals:** Mixamo workflow
- **YanSculpts - Facial Topology:** Animation-ready faces

### Automated Learning Path
```python
# AI can run Blender via command line (headless mode)
# Example: blender --background --python script.py

import bpy

# 1. Create base mesh
def create_humanoid_base():
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1, location=(0, 0, 0))
    # ... extrude body parts
    
# 2. UV unwrap
def auto_unwrap():
    bpy.ops.uv.smart_project(angle_limit=66.0, island_margin=0.02)
    
# 3. Export GLB
def export_glb(filepath):
    bpy.ops.export_scene.gltf(
        filepath=filepath,
        export_format='GLB',
        use_draco_mesh_compression=True
    )
```

---

## 🔨 Day-by-Day AI Learning Plan

### Day 1: Interface + Base Mesh (AI learns modeling basics)

**Learning Objectives:**
- Understand 3D space (X, Y, Z axes)
- Navigate viewport (rotate, pan, zoom)
- Select, move, extrude operations
- Proportional human anatomy

**AI Actions:**
```python
# AI Script: Create base humanoid
import bpy

# Clear default scene
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()

# Create head
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.5, location=(0, 0, 1.7))
head = bpy.context.active_object
head.name = "Head"

# Create torso
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 1.0))
torso = bpy.context.active_object
torso.scale = (0.5, 0.3, 0.8)
torso.name = "Torso"

# Create arms (repeat for legs)
bpy.ops.mesh.primitive_cylinder_add(radius=0.1, depth=0.8, location=(0.6, 0, 1.0))
# ... more body parts

# Export checkpoint
bpy.ops.wm.save_as_mainfile(filepath="scott-day1-base.blend")
```

**Validation:**
- [ ] Human proportions (1.75m height = 7 head units)
- [ ] All major body parts present
- [ ] Quads topology (no triangles/ngons)

---

### Day 2: Facial Features (AI learns animation topology)

**Learning Objectives:**
- Edge loops for deformation
- Eye/mouth topology for blend shapes
- Ear/nose modeling

**AI Actions:**
```python
import bpy

# Add edge loops for eyes (8 loops around eye socket)
def create_eye_topology(mesh):
    bpy.context.view_layer.objects.active = mesh
    bpy.ops.object.mode_set(mode='EDIT')
    
    # Select face where eye should be
    # Add loop cuts (Ctrl+R in manual mode)
    bpy.ops.mesh.loopcut_slide(
        MESH_OT_loopcut={"number_cuts": 8},
        TRANSFORM_OT_edge_slide={"value": 0}
    )
    
    # Extrude inward for eye socket
    bpy.ops.mesh.extrude_region_move(
        TRANSFORM_OT_translate={"value": (0, -0.05, 0)}
    )

# Repeat for mouth (12 loops for lip sync)
def create_mouth_topology(mesh):
    # ... similar loop cuts around mouth area
    pass

# Apply to head mesh
head = bpy.data.objects["Head"]
create_eye_topology(head)
create_mouth_topology(head)
```

**Validation:**
- [ ] 8 edge loops around each eye
- [ ] 12 edge loops around mouth
- [ ] Clean topology (all quads)

---

### Day 3: Hair + UV Unwrapping (AI learns texturing prep)

**Learning Objectives:**
- Particle systems OR mesh hair
- UV unwrapping strategies
- Seam placement for minimal stretching

**AI Actions:**
```python
import bpy

# Create mesh-based hair (easier for GLB export)
def create_hair():
    # Duplicate head top vertices
    head = bpy.data.objects["Head"]
    bpy.context.view_layer.objects.active = head
    bpy.ops.object.mode_set(mode='EDIT')
    
    # Select top vertices (manual in UI, can be scripted)
    # Extrude up and style into undercut
    bpy.ops.mesh.extrude_region_move(
        TRANSFORM_OT_translate={"value": (0, 0, 0.15)}
    )
    
    # Add hair material (blue gradient)
    hair_mat = bpy.data.materials.new(name="HairBlue")
    hair_mat.use_nodes = True
    # ... node setup for blue gradient

# UV unwrap entire model
def unwrap_all():
    for obj in bpy.data.objects:
        if obj.type == 'MESH':
            bpy.context.view_layer.objects.active = obj
            bpy.ops.object.mode_set(mode='EDIT')
            bpy.ops.mesh.select_all(action='SELECT')
            
            # Smart UV project
            bpy.ops.uv.smart_project(
                angle_limit=66.0,
                island_margin=0.02,
                area_weight=0.0
            )
            
            bpy.ops.object.mode_set(mode='OBJECT')

create_hair()
unwrap_all()
```

**Validation:**
- [ ] Hair geometry created
- [ ] All meshes UV unwrapped
- [ ] UV islands fit in 0-1 space

---

### Day 4: PBR Texturing (AI learns material creation)

**Learning Objectives:**
- Principled BSDF shader
- Texture painting
- PBR workflow (albedo, roughness, metallic, normal)

**AI Actions:**
```python
import bpy

# Create PBR materials programmatically
def create_skin_material():
    mat = bpy.data.materials.new(name="Skin")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    
    # Clear default
    for node in nodes:
        nodes.remove(node)
    
    # Add Principled BSDF
    bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
    bsdf.location = (0, 0)
    
    # Base Color (skin tone)
    bsdf.inputs['Base Color'].default_value = (0.8, 0.6, 0.5, 1.0)
    bsdf.inputs['Roughness'].default_value = 0.6
    bsdf.inputs['Subsurface'].default_value = 0.1  # SSS for skin
    
    # Output
    output = nodes.new(type='ShaderNodeOutputMaterial')
    output.location = (300, 0)
    
    # Link
    links = mat.node_tree.links
    links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])
    
    return mat

def create_hair_material():
    mat = bpy.data.materials.new(name="HairBlue")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    
    bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
    
    # Blue gradient (ColorRamp node)
    ramp = nodes.new(type='ShaderNodeValToRGB')
    ramp.color_ramp.elements[0].color = (0.12, 0.25, 0.69, 1)  # #1E40AF
    ramp.color_ramp.elements[1].color = (0.38, 0.65, 0.98, 1)  # #60A5FA
    
    # ... link to BSDF base color
    
    return mat

# Apply materials
head = bpy.data.objects["Head"]
head.data.materials.append(create_skin_material())

hair = bpy.data.objects["Hair"]
hair.data.materials.append(create_hair_material())
```

**Validation:**
- [ ] All materials use Principled BSDF
- [ ] Realistic colors (skin, hair, vest)
- [ ] PBR values set (roughness, metallic)

---

### Day 5: Rigging with Mixamo (AI automates rigging)

**Learning Objectives:**
- Mixamo workflow (upload FBX, download rigged)
- Armature basics
- Weight painting refinement

**AI Actions:**
```python
# Step 1: Export for Mixamo
import bpy

def export_for_mixamo():
    # Select all meshes
    bpy.ops.object.select_all(action='DESELECT')
    for obj in bpy.data.objects:
        if obj.type == 'MESH':
            obj.select_set(True)
    
    # Export as FBX
    bpy.ops.export_scene.fbx(
        filepath="scott-for-mixamo.fbx",
        use_selection=True,
        apply_unit_scale=True,
        bake_space_transform=True
    )

export_for_mixamo()

# Step 2: Upload to Mixamo.com (manual or API)
# Step 3: Download rigged FBX with Y-Bot skeleton

# Step 4: Import rigged FBX
def import_rigged():
    bpy.ops.import_scene.fbx(filepath="scott-rigged.fbx")
    
# Step 5: Create blend shapes (shape keys)
def create_blend_shapes():
    head = bpy.data.objects["Head"]
    
    emotions = [
        "happy", "thinking", "concerned", "excited",
        "listening", "speaking", "idle", "neutral"
    ]
    
    visemes = ["A", "E", "I", "O", "U", "MB", "FV", "L"]
    
    for emotion in emotions:
        # Add shape key
        head.shape_key_add(name=emotion)
        # Manually sculpt (or script vertex positions)
        
    for viseme in visemes:
        head.shape_key_add(name=viseme)
        # Sculpt mouth shapes
```

**Validation:**
- [ ] Armature imported with 50+ bones
- [ ] 16 shape keys created (8 emotions + 8 visemes)
- [ ] Weight painting smooth (no collapse on pose)

---

### Day 6: Animation (AI creates idle loop)

**Learning Objectives:**
- Keyframe animation
- Animation curves
- Timeline usage

**AI Actions:**
```python
import bpy

def create_idle_animation():
    armature = bpy.data.objects["Armature"]
    
    # Set frame range
    bpy.context.scene.frame_start = 1
    bpy.context.scene.frame_end = 120  # 4 seconds at 30fps
    
    # Animate breathing (chest bone)
    chest_bone = armature.pose.bones["Spine2"]
    
    # Frame 1: Start
    bpy.context.scene.frame_set(1)
    chest_bone.scale = (1.0, 1.0, 1.0)
    chest_bone.keyframe_insert(data_path="scale")
    
    # Frame 60: Inhale
    bpy.context.scene.frame_set(60)
    chest_bone.scale = (1.0, 1.05, 1.02)  # Expand chest
    chest_bone.keyframe_insert(data_path="scale")
    
    # Frame 120: Exhale (back to start)
    bpy.context.scene.frame_set(120)
    chest_bone.scale = (1.0, 1.0, 1.0)
    chest_bone.keyframe_insert(data_path="scale")
    
    # Blink animation (shape keys)
    head = bpy.data.objects["Head"]
    blink_key = head.data.shape_keys.key_blocks["Blink"]
    
    # Blink at frame 30, 90 (every 3 seconds)
    for frame in [30, 90]:
        bpy.context.scene.frame_set(frame)
        blink_key.value = 1.0  # Closed
        blink_key.keyframe_insert(data_path="value")
        
        bpy.context.scene.frame_set(frame + 5)
        blink_key.value = 0.0  # Open
        blink_key.keyframe_insert(data_path="value")

create_idle_animation()
```

**Validation:**
- [ ] 120-frame animation (4 seconds)
- [ ] Breathing motion smooth
- [ ] Blink every 3 seconds
- [ ] Loop seamlessly

---

### Day 7: GLB Export (AI optimizes for web)

**Learning Objectives:**
- glTF 2.0 format
- Draco compression
- File size optimization

**AI Actions:**
```python
import bpy

def export_optimized_glb():
    # Pre-export optimization
    # 1. Merge materials where possible
    # 2. Compress textures
    # 3. Remove unused data
    
    bpy.ops.outliner.orphans_purge()  # Clean up
    
    # Export GLB
    bpy.ops.export_scene.gltf(
        filepath="public/assets/scott-avatar.glb",
        export_format='GLB',  # Binary format
        use_draco_mesh_compression=True,
        draco_mesh_compression_level=6,
        export_animations=True,
        export_morph=True,  # Shape keys
        export_skins=True,  # Armature
        export_texcoords=True,  # UVs
        export_normals=True,
        export_tangents=True,
        export_materials='EXPORT',
        export_image_format='AUTO'  # Auto-detect best format
    )
    
    # Validate file size
    import os
    size_mb = os.path.getsize("public/assets/scott-avatar.glb") / (1024 * 1024)
    print(f"GLB size: {size_mb:.2f} MB")
    
    if size_mb > 5.0:
        print("WARNING: File size exceeds 5MB target!")
        # Further optimization needed

export_optimized_glb()
```

**Final Validation:**
- [ ] GLB file created
- [ ] File size <5MB
- [ ] All assets embedded (textures, animations)
- [ ] Draco compression enabled
- [ ] Shape keys exported
- [ ] Armature exported

---

## 🤖 AI Execution Strategy

### Since AI Cannot Run Blender GUI:

**Option 1: Headless Blender (Recommended)**
```bash
# AI runs Blender via Python scripts
blender --background --python day1_base_mesh.py
blender --background --python day2_facial_topology.py
# ... continue for all days
```

**Option 2: Document for Human Execution**
- AI creates comprehensive Blender Python scripts
- Human runs scripts in Blender
- AI validates output (GLB import test)

**Option 3: Use Pre-made Assets (Fallback)**
- Find CC0 humanoid base mesh (Blender Cloud, Sketchfab)
- AI modifies via Python scripts
- Customize for Scott character (blue hair, vest, jewelry)

---

## 📊 Success Metrics

### AI Learning Validation
- [ ] All 7 days of Python scripts created
- [ ] Scripts tested in Blender (if available)
- [ ] GLB export successful
- [ ] File loads in React Three Fiber

### Model Quality
- [ ] Polygon count: 8k-12k (performance target)
- [ ] Texture resolution: 2048x2048 (quality target)
- [ ] Animation smoothness: 30fps loop
- [ ] Blend shapes: 16 total (emotions + visemes)

### Web Performance
- [ ] File size: <5MB
- [ ] Load time: <2s
- [ ] Render FPS: 60 (desktop), 30 (mobile)
- [ ] Memory usage: <100MB

---

## 🔄 Integration with Track B

### After GLB Export, Track B Takes Over:
```typescript
// client/src/lib/mrBlue/avatar/MrBlueAvatarProfessional.tsx
import { useGLTF } from '@react-three/drei';

// Load the AI-created GLB
const { scene, animations, nodes, materials } = useGLTF('/assets/scott-avatar.glb');

// Access blend shapes
const head = scene.getObjectByName('Head') as THREE.Mesh;
if (head.morphTargetInfluences) {
  // AI-created blend shapes now accessible!
  head.morphTargetInfluences[0] = 1.0; // Happy emotion
}
```

---

## 📝 Daily Progress Logging

**AI Documents in:** `docs/MrBlue/avatar-build-log.md`

Each day:
```markdown
## Day X: [Task Name]
**Status:** Complete ✅ / In Progress 🟡 / Blocked 🔴
**Time:** X hours
**Deliverable:** [filename].blend / [filename].glb
**Validation:** [checklist results]
**Issues:** [any problems encountered]
**Next:** [tomorrow's focus]
```

---

**AI LEARNING COMPLETE** ✅  
**Ready to Build Scott 3D Avatar**  
**Timeline:** 7 days with parallel Track B/C execution

---

**Last Updated:** October 13, 2025  
**Agent:** #73 Scott 3D Avatar Expert  
**Learning Mode:** Active
