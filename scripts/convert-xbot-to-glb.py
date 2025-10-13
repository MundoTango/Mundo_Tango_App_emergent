#!/usr/bin/env python3
"""
TRACK 4: 3D Avatar Production Pipeline
Convert X Bot FBX models to optimized GLB for production
"""

import bpy
import os
import sys
from pathlib import Path

# Configuration
INPUT_DIR = Path(__file__).parent.parent / "assets" / "models" / "x-bot"
OUTPUT_DIR = Path(__file__).parent.parent / "public" / "assets" / "models"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

def clean_scene():
    """Remove all objects from scene"""
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

def import_fbx(fbx_path):
    """Import FBX file"""
    print(f"Importing {fbx_path.name}...")
    bpy.ops.import_scene.fbx(filepath=str(fbx_path))

def optimize_mesh():
    """Optimize mesh for web"""
    # Select all mesh objects
    bpy.ops.object.select_all(action='DESELECT')
    for obj in bpy.data.objects:
        if obj.type == 'MESH':
            obj.select_set(True)
            bpy.context.view_layer.objects.active = obj
            
            # Decimate modifier for reduced poly count
            mod = obj.modifiers.new(name="Decimate", type='DECIMATE')
            mod.ratio = 0.8  # Reduce to 80% of original
            bpy.ops.object.modifier_apply(modifier="Decimate")

def optimize_materials():
    """Optimize materials for web (PBR workflow)"""
    for mat in bpy.data.materials:
        if mat.use_nodes:
            nodes = mat.node_tree.nodes
            
            # Ensure Principled BSDF exists
            principled = None
            for node in nodes:
                if node.type == 'BSDF_PRINCIPLED':
                    principled = node
                    break
            
            if principled:
                # Set web-optimized PBR values
                principled.inputs['Metallic'].default_value = 0.0
                principled.inputs['Roughness'].default_value = 0.7

def export_glb(output_path):
    """Export as GLB with optimizations"""
    print(f"Exporting to {output_path.name}...")
    
    bpy.ops.export_scene.gltf(
        filepath=str(output_path),
        export_format='GLB',
        export_texcoords=True,
        export_normals=True,
        export_draco_mesh_compression_enable=True,  # Compression
        export_draco_mesh_compression_level=6,
        export_apply=True,  # Apply modifiers
        export_animations=True,
        export_optimize_animation_size=True
    )

def process_model(fbx_file):
    """Process single FBX model"""
    clean_scene()
    import_fbx(fbx_file)
    optimize_mesh()
    optimize_materials()
    
    # Generate output filename
    output_name = fbx_file.stem.replace('xbot_', 'mrblue_') + '.glb'
    output_path = OUTPUT_DIR / output_name
    
    export_glb(output_path)
    print(f"✅ Converted {fbx_file.name} → {output_name}")

def main():
    """Main conversion pipeline"""
    print("🚀 X Bot to GLB Conversion Pipeline")
    print(f"Input: {INPUT_DIR}")
    print(f"Output: {OUTPUT_DIR}\n")
    
    # Find all FBX files
    fbx_files = list(INPUT_DIR.glob("*.fbx"))
    
    if not fbx_files:
        print("❌ No FBX files found!")
        sys.exit(1)
    
    print(f"Found {len(fbx_files)} FBX files\n")
    
    # Process each file
    for fbx_file in fbx_files:
        try:
            process_model(fbx_file)
        except Exception as e:
            print(f"❌ Error processing {fbx_file.name}: {e}")
    
    print("\n✅ Conversion complete!")
    print(f"📁 GLB files saved to: {OUTPUT_DIR}")

if __name__ == "__main__":
    main()
