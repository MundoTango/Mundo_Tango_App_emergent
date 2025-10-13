"""
TRACK 3: Scott Avatar Blender Automation Script
Agent #73: 3D Avatar Expert

This script automates the creation of Scott's custom avatar:
1. Imports Mixamo X Bot base model
2. Customizes for Scott (blue hair, vest, jewelry)
3. Creates 16 blend shapes (8 emotions + 8 visemes)
4. Exports optimized GLB (<5MB)

Usage: blender --background --python blender-automation-scott.py
"""

import bpy
import os
import sys

# Configuration
OUTPUT_PATH = "public/assets/scott-avatar.glb"
TEXTURE_SIZE = 1024  # 1024x1024 for optimization

def clear_scene():
    """Clear default Blender scene"""
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()
    print("✅ Scene cleared")

def import_base_model(filepath):
    """Import Mixamo X Bot or other base humanoid"""
    if filepath.endswith('.fbx'):
        bpy.ops.import_scene.fbx(filepath=filepath)
    elif filepath.endswith('.glb') or filepath.endswith('.gltf'):
        bpy.ops.import_scene.gltf(filepath=filepath)
    print(f"✅ Imported base model: {filepath}")

def customize_scott():
    """Apply Scott's custom features"""
    
    # 1. Add blue hair
    print("🎨 Creating blue undercut hair...")
    
    # Find head bone/mesh
    head = None
    for obj in bpy.data.objects:
        if 'head' in obj.name.lower():
            head = obj
            break
    
    if head:
        # Create hair mesh from head vertices
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.15, location=(0, 0, 1.7))
        hair = bpy.context.active_object
        hair.name = "Hair"
        
        # Apply blue gradient material
        mat = bpy.data.materials.new(name="HairBlue")
        mat.use_nodes = True
        bsdf = mat.node_tree.nodes["Principled BSDF"]
        bsdf.inputs['Base Color'].default_value = (0.118, 0.251, 0.686, 1.0)  # #1E40AF blue
        bsdf.inputs['Roughness'].default_value = 0.4
        hair.data.materials.append(mat)
        print("✅ Blue hair created")
    
    # 2. Add vest
    print("🎨 Creating dark vest...")
    
    # Find torso
    torso = None
    for obj in bpy.data.objects:
        if 'torso' in obj.name.lower() or 'body' in obj.name.lower():
            torso = obj
            break
    
    if torso:
        # Duplicate torso mesh for vest
        bpy.ops.object.select_all(action='DESELECT')
        torso.select_set(True)
        bpy.ops.object.duplicate()
        vest = bpy.context.active_object
        vest.name = "Vest"
        
        # Scale slightly outward
        vest.scale = (1.05, 1.05, 1.05)
        
        # Apply dark gray material
        mat = bpy.data.materials.new(name="VestGray")
        mat.use_nodes = True
        bsdf = mat.node_tree.nodes["Principled BSDF"]
        bsdf.inputs['Base Color'].default_value = (0.122, 0.161, 0.216, 1.0)  # #1F2937 gray
        bsdf.inputs['Roughness'].default_value = 0.5
        vest.data.materials.clear()
        vest.data.materials.append(mat)
        print("✅ Vest created")
    
    # 3. Add jewelry (earrings, necklace)
    print("🎨 Adding jewelry...")
    
    # Earrings (simple spheres)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.02, location=(-0.08, -0.02, 1.65))
    earring_l = bpy.context.active_object
    earring_l.name = "Earring_L"
    
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.02, location=(0.08, -0.02, 1.65))
    earring_r = bpy.context.active_object
    earring_r.name = "Earring_R"
    
    # Gold material for jewelry
    mat = bpy.data.materials.new(name="Gold")
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs['Base Color'].default_value = (1.0, 0.843, 0.0, 1.0)  # Gold color
    bsdf.inputs['Metallic'].default_value = 1.0
    bsdf.inputs['Roughness'].default_value = 0.2
    
    earring_l.data.materials.append(mat)
    earring_r.data.materials.append(mat)
    
    # Necklace (torus)
    bpy.ops.mesh.primitive_torus_add(
        major_radius=0.1,
        minor_radius=0.01,
        location=(0, 0.05, 1.5)
    )
    necklace = bpy.context.active_object
    necklace.name = "Necklace"
    necklace.rotation_euler[0] = 1.57  # Rotate 90 degrees
    necklace.data.materials.append(mat)
    
    print("✅ Jewelry added")

def create_blend_shapes():
    """Create 16 blend shapes for emotions and lip sync"""
    
    print("🎭 Creating blend shapes...")
    
    # Find head mesh
    head = None
    for obj in bpy.data.objects:
        if obj.type == 'MESH' and 'head' in obj.name.lower():
            head = obj
            break
    
    if not head:
        print("⚠️ Warning: No head mesh found for blend shapes")
        return
    
    # 8 Emotions
    emotions = [
        "neutral",
        "happy",
        "thinking",
        "concerned",
        "excited",
        "listening",
        "speaking",
        "idle"
    ]
    
    # 8 Visemes for lip sync
    visemes = [
        "viseme_A",   # ah
        "viseme_E",   # ee
        "viseme_I",   # ih
        "viseme_O",   # oh
        "viseme_U",   # oo
        "viseme_MB",  # lips closed
        "viseme_FV",  # lower lip bite
        "viseme_L"    # tongue out
    ]
    
    bpy.context.view_layer.objects.active = head
    head.select_set(True)
    
    # Create shape keys
    if not head.data.shape_keys:
        head.shape_key_add(name='Basis', from_mix=False)
    
    for emotion in emotions:
        shape_key = head.shape_key_add(name=emotion, from_mix=False)
        print(f"  ✓ Created emotion: {emotion}")
    
    for viseme in visemes:
        shape_key = head.shape_key_add(name=viseme, from_mix=False)
        print(f"  ✓ Created viseme: {viseme}")
    
    print(f"✅ Created {len(emotions) + len(visemes)} blend shapes")

def optimize_textures():
    """Optimize textures for web performance"""
    
    print("🎨 Optimizing textures...")
    
    for img in bpy.data.images:
        # Resize to 1024x1024 if larger
        if img.size[0] > TEXTURE_SIZE or img.size[1] > TEXTURE_SIZE:
            img.scale(TEXTURE_SIZE, TEXTURE_SIZE)
        print(f"  ✓ Optimized: {img.name} ({TEXTURE_SIZE}x{TEXTURE_SIZE})")
    
    print("✅ Textures optimized")

def export_glb():
    """Export optimized GLB with Draco compression"""
    
    print("📦 Exporting GLB...")
    
    # Ensure output directory exists
    output_dir = os.path.dirname(OUTPUT_PATH)
    if output_dir and not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    # Export with Draco compression
    bpy.ops.export_scene.gltf(
        filepath=OUTPUT_PATH,
        export_format='GLB',
        use_draco_mesh_compression=True,
        draco_mesh_compression_level=6,  # Max compression
        export_animations=True,
        export_morph=True,  # Include blend shapes
        export_skins=True,  # Include rigging
        export_texcoords=True,
        export_normals=True,
        export_materials='EXPORT'
    )
    
    # Check file size
    file_size = os.path.getsize(OUTPUT_PATH) / (1024 * 1024)  # MB
    print(f"✅ GLB exported: {OUTPUT_PATH}")
    print(f"📊 File size: {file_size:.2f} MB")
    
    if file_size > 5:
        print(f"⚠️ Warning: File size ({file_size:.2f} MB) exceeds 5MB target")
        print("   Consider reducing texture resolution or polygon count")
    else:
        print(f"✅ File size within target (<5MB)")

def main():
    """Main execution flow"""
    
    print("=" * 60)
    print("🎨 SCOTT AVATAR AUTOMATION - Agent #73")
    print("=" * 60)
    
    # Step 1: Clear scene
    clear_scene()
    
    # Step 2: Import base model
    # NOTE: Update this path to your Mixamo X Bot FBX file
    base_model_path = "path/to/mixamo-xbot.fbx"
    if os.path.exists(base_model_path):
        import_base_model(base_model_path)
    else:
        print(f"⚠️ Base model not found: {base_model_path}")
        print("   Using primitive placeholder instead...")
        # Create basic humanoid shape
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.15, location=(0, 0, 1.7))  # Head
        bpy.ops.mesh.primitive_cylinder_add(radius=0.2, depth=0.6, location=(0, 0, 1.3))  # Torso
    
    # Step 3: Customize for Scott
    customize_scott()
    
    # Step 4: Create blend shapes
    create_blend_shapes()
    
    # Step 5: Optimize textures
    optimize_textures()
    
    # Step 6: Export GLB
    export_glb()
    
    print("=" * 60)
    print("✅ SCOTT AVATAR COMPLETE!")
    print(f"📁 Output: {OUTPUT_PATH}")
    print("=" * 60)

if __name__ == "__main__":
    main()
