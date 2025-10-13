# 3D Avatar Production Pipeline

## Overview
Automated conversion of X Bot FBX models to optimized GLB for web production.

## Requirements
- Blender 3.0+ (with Python API)
- Python 3.8+

## Installation

### Option 1: Use Blender's Python
```bash
# Run with Blender's bundled Python
blender --background --python scripts/convert-xbot-to-glb.py
```

### Option 2: Standalone (requires bpy module)
```bash
pip install bpy
python scripts/convert-xbot-to-glb.py
```

## Pipeline Steps

1. **Import FBX** - Load X Bot models from `assets/models/x-bot/`
2. **Optimize Mesh** - Reduce polygon count by 20% (Decimate modifier)
3. **Optimize Materials** - Convert to PBR workflow for web
4. **Export GLB** - Save with Draco compression to `public/assets/models/`

## Input Files
- `xbot_basic.fbx` → `mrblue_basic.glb`
- `xbot_anim_idle_pose.fbx` → `mrblue_idle.glb`

## Output
Optimized GLB files with:
- Draco mesh compression (60-80% size reduction)
- PBR materials (web-compatible)
- Embedded animations
- ~500KB per model (vs 2MB FBX)

## Integration
Update Mr Blue avatar component:
```typescript
import { useGLTF } from '@react-three/drei';

function MrBlueAvatar() {
  const { scene } = useGLTF('/assets/models/mrblue_basic.glb');
  return <primitive object={scene} />;
}
```

## Manual Conversion (Blender UI)

If automated script fails:

1. Open Blender
2. File → Import → FBX (.fbx)
3. Select `xbot_basic.fbx`
4. Mesh → Decimate (80% ratio)
5. File → Export → glTF 2.0 (.glb)
6. Enable "Draco Mesh Compression"
7. Export to `public/assets/models/mrblue_basic.glb`

## Verification
```bash
# Check file size
ls -lh public/assets/models/*.glb

# Expected output:
# mrblue_basic.glb  ~500KB
# mrblue_idle.glb   ~600KB
```

## Next Steps
After conversion, update:
1. `client/src/components/mr-blue/MrBlueAvatar.tsx` - Use new GLB path
2. Test in browser - Verify loading and animations
3. Deploy - GLB files are production-ready
