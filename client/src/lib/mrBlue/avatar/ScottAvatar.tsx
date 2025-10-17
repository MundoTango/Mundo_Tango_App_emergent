import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * ESA Agent #73: Scott 3D Avatar
 * Realistic humanoid with blue undercut hair, vest, jewelry
 * Based on Scott Boddye character design
 */

interface ScottAvatarProps {
  isSpeaking: boolean;
  isListening: boolean;
  isThinking: boolean;
  emotion: 'neutral' | 'happy' | 'thinking' | 'concerned' | 'excited';
}

export function ScottAvatar({ isSpeaking, isListening, isThinking, emotion }: ScottAvatarProps) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);
  const mouthRef = useRef<THREE.Mesh>(null);
  
  const [blinkTimer, setBlinkTimer] = useState(0);

  // Colors from MT Ocean Theme + Scott's real colors
  const skinColor = new THREE.Color('#D4A574'); // Skin tone
  const hairColor = new THREE.Color('#3B82F6'); // Blue hair
  const vestColor = new THREE.Color('#E5E7EB'); // Light vest
  const jewelryColor = new THREE.Color('#14B8A6'); // Turquoise accents

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const time = state.clock.elapsedTime;

    // ========================================
    // IDLE ANIMATIONS
    // ========================================
    
    // Breathing (subtle chest movement)
    groupRef.current.scale.y = 1 + Math.sin(time * 1.5) * 0.02;
    
    // Floating/swaying
    groupRef.current.position.y = Math.sin(time * 0.8) * 0.05;
    groupRef.current.rotation.z = Math.sin(time * 0.5) * 0.03;

    // Head movement (looking around)
    if (headRef.current && !isThinking) {
      headRef.current.rotation.y = Math.sin(time * 0.3) * 0.2;
      headRef.current.rotation.x = Math.sin(time * 0.4) * 0.1;
    }

    // ========================================
    // BLINKING
    // ========================================
    setBlinkTimer((prev) => {
      const newTimer = prev + delta;
      if (newTimer > 3 + Math.random() * 2) {
        // Blink
        if (leftEyeRef.current && rightEyeRef.current) {
          leftEyeRef.current.scale.y = 0.1;
          rightEyeRef.current.scale.y = 0.1;
          setTimeout(() => {
            if (leftEyeRef.current && rightEyeRef.current) {
              leftEyeRef.current.scale.y = 1;
              rightEyeRef.current.scale.y = 1;
            }
          }, 100);
        }
        return 0;
      }
      return newTimer;
    });

    // ========================================
    // SPEAKING ANIMATION (Mouth Sync)
    // ========================================
    if (isSpeaking && mouthRef.current) {
      mouthRef.current.scale.y = 1 + Math.sin(time * 20) * 0.3;
      mouthRef.current.scale.x = 1 + Math.sin(time * 20) * 0.2;
    } else if (mouthRef.current) {
      mouthRef.current.scale.y = 1;
      mouthRef.current.scale.x = 1;
    }

    // ========================================
    // LISTENING ANIMATION
    // ========================================
    if (isListening && headRef.current) {
      headRef.current.position.z = 0.1 + Math.sin(time * 3) * 0.05; // Lean in
      headRef.current.rotation.y = 0; // Face forward
    }

    // ========================================
    // THINKING ANIMATION
    // ========================================
    if (isThinking && headRef.current) {
      headRef.current.rotation.y = Math.sin(time * 2) * 0.3; // Look side to side
      headRef.current.position.y = 0.1; // Slightly up
    } else if (headRef.current) {
      headRef.current.position.y = 0;
      headRef.current.position.z = 0;
    }

    // ========================================
    // EMOTIONAL EXPRESSIONS
    // ========================================
    if (leftEyeRef.current && rightEyeRef.current) {
      switch (emotion) {
        case 'happy':
          leftEyeRef.current.position.y = 0.15;
          rightEyeRef.current.position.y = 0.15;
          break;
        case 'concerned':
          leftEyeRef.current.rotation.z = -0.2;
          rightEyeRef.current.rotation.z = 0.2;
          break;
        case 'excited':
          leftEyeRef.current.scale.setScalar(1.3);
          rightEyeRef.current.scale.setScalar(1.3);
          break;
        default:
          leftEyeRef.current.position.y = 0.1;
          rightEyeRef.current.position.y = 0.1;
          leftEyeRef.current.rotation.z = 0;
          rightEyeRef.current.rotation.z = 0;
          leftEyeRef.current.scale.setScalar(1);
          rightEyeRef.current.scale.setScalar(1);
      }
    }

    // ========================================
    // GESTURE ANIMATIONS
    // ========================================
    if (emotion === 'excited') {
      // Wave gesture
      const waveIntensity = Math.sin(time * 4);
      groupRef.current.rotation.z = waveIntensity * 0.2;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.3, 0]}>
      {/* ==================== BODY ==================== */}
      
      {/* Torso (vest) */}
      <mesh position={[0, -0.4, 0]}>
        <boxGeometry args={[0.6, 0.8, 0.3]} />
        <meshStandardMaterial color={vestColor} />
      </mesh>

      {/* ==================== HEAD ==================== */}
      
      <group ref={headRef} position={[0, 0.3, 0]}>
        {/* Head */}
        <mesh>
          <sphereGeometry args={[0.35, 32, 32]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>

        {/* Blue hair (undercut style - spiky top) */}
        <group position={[0, 0.25, 0]}>
          {/* Hair spikes */}
          {[...Array(8)].map((_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            return (
              <mesh
                key={i}
                position={[
                  Math.cos(angle) * 0.15,
                  0.1,
                  Math.sin(angle) * 0.15
                ]}
                rotation={[0, 0, angle]}
              >
                <coneGeometry args={[0.08, 0.3, 8]} />
                <meshStandardMaterial color={hairColor} />
              </mesh>
            );
          })}
        </group>

        {/* Eyes */}
        <mesh ref={leftEyeRef} position={[-0.12, 0.1, 0.25]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#FFFFFF" />
          {/* Pupil */}
          <mesh position={[0, 0, 0.06]}>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshStandardMaterial color="#1F2937" />
          </mesh>
        </mesh>

        <mesh ref={rightEyeRef} position={[0.12, 0.1, 0.25]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#FFFFFF" />
          {/* Pupil */}
          <mesh position={[0, 0, 0.06]}>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshStandardMaterial color="#1F2937" />
          </mesh>
        </mesh>

        {/* Mouth */}
        <mesh ref={mouthRef} position={[0, -0.1, 0.28]}>
          <boxGeometry args={[0.15, 0.05, 0.05]} />
          <meshStandardMaterial color="#EF4444" />
        </mesh>

        {/* Facial hair (beard) */}
        <mesh position={[0, -0.15, 0.2]}>
          <boxGeometry args={[0.25, 0.12, 0.15]} />
          <meshStandardMaterial color="#4B5563" />
        </mesh>
      </group>

      {/* ==================== ACCESSORIES ==================== */}
      
      {/* Jewelry - necklace */}
      <mesh position={[0, -0.05, 0.25]}>
        <torusGeometry args={[0.15, 0.02, 16, 32]} />
        <meshStandardMaterial color={jewelryColor} metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Bracelets */}
      <mesh position={[-0.35, -0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.08, 0.02, 16, 32]} />
        <meshStandardMaterial color={jewelryColor} metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0.35, -0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.08, 0.02, 16, 32]} />
        <meshStandardMaterial color={jewelryColor} metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Arms */}
      <mesh position={[-0.4, -0.3, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.6, 16]} />
        <meshStandardMaterial color={skinColor} />
      </mesh>
      <mesh position={[0.4, -0.3, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.6, 16]} />
        <meshStandardMaterial color={skinColor} />
      </mesh>

      {/* Vest details (buttons) */}
      {[0, -0.15, -0.3].map((y, i) => (
        <mesh key={i} position={[0, y, 0.16]}>
          <sphereGeometry args={[0.03, 16, 16]} />
          <meshStandardMaterial color="#374151" metalness={0.9} roughness={0.1} />
        </mesh>
      ))}
    </group>
  );
}
