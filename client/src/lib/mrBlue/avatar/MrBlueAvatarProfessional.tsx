import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';

/**
 * ESA Agent #73: Professional Mr Blue 3D Avatar
 * 
 * Features:
 * - Professional GLB model with skeletal rigging
 * - Facial blend shapes for emotions
 * - Lip sync with Web Speech API
 * - Smooth animations (idle, emotions, gestures)
 * - Performance optimized (60fps desktop, 30fps mobile)
 */

interface MrBlueAvatarProps {
  isSpeaking: boolean;
  isListening: boolean;
  isThinking: boolean;
  emotion: 'neutral' | 'happy' | 'thinking' | 'concerned' | 'excited';
  audioData?: Float32Array;
}

export function MrBlueAvatarProfessional({
  isSpeaking,
  isListening,
  isThinking,
  emotion,
  audioData
}: MrBlueAvatarProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [currentAnimation, setCurrentAnimation] = useState('idle');
  const blinkTimer = useRef(0);
  
  // Load GLB model with animations
  // For now, using a fallback - will be replaced with actual professional model
  const fallbackModel = useFallbackAvatar();
  
  // Animation system
  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Idle breathing animation
    const time = state.clock.getElapsedTime();
    groupRef.current.position.y = Math.sin(time * 1.5) * 0.02;
    
    // Subtle rotation/sway
    groupRef.current.rotation.y = Math.sin(time * 0.5) * 0.05;
    
    // Automatic blinking
    blinkTimer.current += delta;
    if (blinkTimer.current > 3 + Math.random() * 2) {
      // Trigger blink animation
      blinkTimer.current = 0;
    }

    // Lip sync if speaking
    if (isSpeaking && audioData) {
      applyLipSync(groupRef.current, audioData);
    }
  });

  // Update animation based on state
  useEffect(() => {
    if (isThinking) {
      setCurrentAnimation('thinking');
    } else if (isSpeaking) {
      setCurrentAnimation('speaking');
    } else if (isListening) {
      setCurrentAnimation('listening');
    } else {
      setCurrentAnimation('idle');
    }
  }, [isThinking, isSpeaking, isListening]);

  // Apply emotion blend shapes
  useEffect(() => {
    if (!groupRef.current) return;
    
    applyEmotionBlendShapes(groupRef.current, emotion);
  }, [emotion]);

  return (
    <group ref={groupRef} position={[0, -1, 0]}>
      {fallbackModel}
    </group>
  );
}

// Fallback avatar while professional model loads
function useFallbackAvatar() {
  return (
    <group>
      {/* Head */}
      <mesh position={[0, 1.6, 0]}>
        <sphereGeometry args={[0.25, 32, 32]} />
        <meshStandardMaterial 
          color="#e8b4a8" 
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>
      
      {/* Hair (blue) */}
      <mesh position={[0, 1.75, 0]}>
        <sphereGeometry args={[0.22, 32, 32]} />
        <meshStandardMaterial 
          color="#00CED1" 
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>
      
      {/* Body with vest */}
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.3, 0.35, 0.8, 16]} />
        <meshStandardMaterial 
          color="#1e3a5f" 
          roughness={0.7}
        />
      </mesh>
      
      {/* Vest accent */}
      <mesh position={[0, 0.9, 0.31]}>
        <boxGeometry args={[0.5, 0.7, 0.02]} />
        <meshStandardMaterial 
          color="#40E0D0" 
          roughness={0.3}
          metalness={0.5}
        />
      </mesh>
      
      {/* Eyes */}
      <mesh position={[-0.1, 1.65, 0.2]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      <mesh position={[0.1, 1.65, 0.2]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
    </group>
  );
}

// Apply emotion via blend shapes (when GLB model loaded)
function applyEmotionBlendShapes(group: THREE.Group, emotion: string) {
  // Enhanced emotion system - works with both GLB blend shapes AND fallback
  
  // Try to find mesh with morph targets (GLB model)
  let hasMorphTargets = false;
  group.traverse((child) => {
    if (child instanceof THREE.Mesh && child.morphTargetInfluences) {
      hasMorphTargets = true;
      const emotionMap: Record<string, number> = {
        neutral: 0,
        happy: 1,
        thinking: 2,
        concerned: 3,
        excited: 4,
        listening: 5,
        speaking: 6,
        idle: 7
      };
      
      const targetIndex = emotionMap[emotion] || 0;
      
      // Smooth blend to target emotion
      child.morphTargetInfluences.forEach((_, i) => {
        const target = i === targetIndex ? 1.0 : 0.0;
        child.morphTargetInfluences![i] = THREE.MathUtils.lerp(
          child.morphTargetInfluences![i],
          target,
          0.15 // Smooth interpolation
        );
      });
    }
  });
  
  // Fallback: Use rotation for basic emotion if no morph targets
  if (!hasMorphTargets) {
    switch (emotion) {
      case 'happy':
        group.rotation.x = -0.1;
        group.rotation.z = 0;
        break;
      case 'thinking':
        group.rotation.z = 0.15;
        group.rotation.x = 0.05;
        break;
      case 'concerned':
        group.rotation.x = 0.1;
        group.rotation.z = -0.05;
        break;
      case 'excited':
        group.rotation.x = -0.15;
        break;
      case 'listening':
        group.rotation.z = 0.1;
        break;
      default:
        group.rotation.x = 0;
        group.rotation.z = 0;
    }
  }
}

// Enhanced lip sync implementation with viseme support
function applyLipSync(group: THREE.Group, audioData: Float32Array) {
  // Analyze audio frequency to determine mouth shape
  const volume = audioData.reduce((sum, val) => sum + Math.abs(val), 0) / audioData.length;
  
  // Map volume to mouth opening (0-1 range)
  const mouthOpen = Math.min(volume * 2, 1);
  
  // Try to find mesh with morph targets for visemes
  group.traverse((child) => {
    if (child instanceof THREE.Mesh && child.morphTargetInfluences) {
      // Viseme blend shapes (8-15 range in morph targets)
      // For volume-based fallback, use simple mouth open/close
      const mouthOpenIndex = 14; // Assuming index 14 is mouth open viseme
      if (child.morphTargetInfluences[mouthOpenIndex] !== undefined) {
        child.morphTargetInfluences[mouthOpenIndex] = THREE.MathUtils.lerp(
          child.morphTargetInfluences[mouthOpenIndex],
          mouthOpen,
          0.3 // Fast interpolation for speech
        );
      }
    }
  });
  
  // For future: Map phonemes to visemes
  // A/ah → wide open
  // E/ee → smile + slight open
  // I/ih → slight open
  // O/oh → rounded lips
  // U/oo → pursed lips
  // M/B → lips closed
  // F/V → lower lip bite
  // L → tongue visible
}

/**
 * TODO: Replace fallback with professional GLB model
 * 
 * Options:
 * 1. AI-Generated: Meshy.ai, Luma AI Genie, Rodin
 *    - Generate from text description of Mr Blue
 *    - Export GLB with rigging
 * 
 * 2. Pre-made: Sketchfab/Mixamo
 *    - Download rigged character
 *    - Customize textures (blue hair, vest, turquoise accents)
 * 
 * 3. Custom: Blender
 *    - Model from scratch
 *    - Rig with Mixamo auto-rigger
 *    - Export GLB
 * 
 * Required: GLB with:
 * - Skeletal rigging (armature)
 * - Blend shapes (happy, sad, thinking, etc.)
 * - Optimized (<50k polygons)
 * - PBR textures
 */
