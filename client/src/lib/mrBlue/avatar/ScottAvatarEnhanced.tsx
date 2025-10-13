import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Suspense, useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

/**
 * Track B: React Three Fiber Integration
 * Agent #73: Scott 3D Avatar Expert
 * 
 * Enhanced avatar system with:
 * - GLB model loading (custom Scott avatar)
 * - Blend shape emotion controller
 * - Web Speech API lip sync
 * - Performance optimization (60fps target)
 */

type Emotion = 'neutral' | 'happy' | 'thinking' | 'concerned' | 'excited' | 'listening' | 'speaking' | 'idle';
type Viseme = 'A' | 'E' | 'I' | 'O' | 'U' | 'MB' | 'FV' | 'L';

interface ScottModelProps {
  emotion?: Emotion;
  isSpeaking?: boolean;
  audioVolume?: number;
}

/**
 * Scott 3D Model Component
 * Loads GLB and controls blend shapes
 */
function ScottModel({ emotion = 'neutral', isSpeaking = false, audioVolume = 0 }: ScottModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [currentEmotion, setCurrentEmotion] = useState<Emotion>(emotion);
  
  // Load GLB model (will use fallback until custom model ready)
  const { scene, animations } = useGLTF('/assets/scott-avatar.glb', true);

  // Emotion to blend shape index mapping
  const emotionIndices: Record<Emotion, number> = {
    neutral: 0,
    happy: 1,
    thinking: 2,
    concerned: 3,
    excited: 4,
    listening: 5,
    speaking: 6,
    idle: 7
  };

  // Viseme to blend shape index mapping (offset by 8 for emotions)
  const visemeIndices: Record<Viseme, number> = {
    A: 8,   // ah - open mouth
    E: 9,   // ee - wide smile
    I: 10,  // ih - slight open
    O: 11,  // oh - rounded lips
    U: 12,  // oo - pursed lips
    MB: 13, // m/b - lips closed
    FV: 14, // f/v - lower lip bite
    L: 15   // l - tongue visible
  };

  // Smooth emotion transitions using useFrame
  useFrame(() => {
    if (!scene) return;

    const head = scene.getObjectByName('Head') as THREE.Mesh;
    if (!head || !head.morphTargetInfluences) return;

    // Transition to target emotion
    const targetIndex = emotionIndices[currentEmotion];
    const currentValue = head.morphTargetInfluences[targetIndex];
    const targetValue = 1.0;
    
    // Smooth interpolation (0.1 = 10% per frame = ~3 frames for full transition at 30fps)
    head.morphTargetInfluences[targetIndex] = THREE.MathUtils.lerp(
      currentValue,
      targetValue,
      0.1
    );

    // Reset other emotions
    Object.values(emotionIndices).forEach(index => {
      if (index !== targetIndex && head.morphTargetInfluences) {
        head.morphTargetInfluences[index] = THREE.MathUtils.lerp(
          head.morphTargetInfluences[index],
          0,
          0.15 // Faster fade out
        );
      }
    });

    // Lip sync based on audio volume (simple version)
    if (isSpeaking && audioVolume > 0) {
      const mouthOpenness = Math.min(audioVolume * 0.8, 1.0);
      
      // Use 'A' viseme (open mouth) for basic lip sync
      const visemeAIndex = visemeIndices.A;
      if (head.morphTargetInfluences[visemeAIndex] !== undefined) {
        head.morphTargetInfluences[visemeAIndex] = mouthOpenness;
      }
    } else {
      // Close mouth when not speaking
      Object.values(visemeIndices).forEach(index => {
        if (head.morphTargetInfluences && head.morphTargetInfluences[index] !== undefined) {
          head.morphTargetInfluences[index] = THREE.MathUtils.lerp(
            head.morphTargetInfluences[index],
            0,
            0.2
          );
        }
      });
    }
  });

  // Update emotion when prop changes
  useEffect(() => {
    setCurrentEmotion(emotion);
  }, [emotion]);

  return (
    <group ref={groupRef}>
      <primitive object={scene} scale={1.0} position={[0, -0.8, 0]} />
    </group>
  );
}

/**
 * Fallback Avatar (primitive shapes)
 * Used while custom GLB model is being created
 */
function FallbackAvatar() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      // Subtle breathing animation
      const breathScale = 1 + Math.sin(clock.elapsedTime * 2) * 0.03;
      groupRef.current.scale.y = breathScale;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Head */}
      <mesh position={[0, 0.6, 0]}>
        <sphereGeometry args={[0.25, 32, 32]} />
        <meshStandardMaterial color="#F59E0B" />
      </mesh>

      {/* Body */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.2, 0.8, 32]} />
        <meshStandardMaterial color="#1F2937" />
      </mesh>

      {/* Blue hair accent */}
      <mesh position={[0, 0.75, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#60A5FA" />
      </mesh>

      {/* Turquoise accent ring */}
      <mesh position={[0, 0.35, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.18, 0.02, 16, 32]} />
        <meshStandardMaterial color="#06B6D4" emissive="#06B6D4" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

interface ScottAvatarEnhancedProps {
  emotion?: Emotion;
  isSpeaking?: boolean;
  audioVolume?: number;
  className?: string;
}

/**
 * Main Scott Avatar Component
 * Automatically switches between custom GLB and fallback
 */
export default function ScottAvatarEnhanced({
  emotion = 'neutral',
  isSpeaking = false,
  audioVolume = 0,
  className = ''
}: ScottAvatarEnhancedProps) {
  const [useCustomModel, setUseCustomModel] = useState(false);

  // Check if custom GLB exists
  useEffect(() => {
    fetch('/assets/scott-avatar.glb', { method: 'HEAD' })
      .then(res => {
        if (res.ok) {
          setUseCustomModel(true);
        }
      })
      .catch(() => {
        // Use fallback
        setUseCustomModel(false);
      });
  }, []);

  return (
    <div className={`relative ${className}`} style={{ width: '100%', height: '400px' }}>
      <Canvas
        shadows
        camera={{ position: [0, 0, 2.5], fov: 50 }}
        gl={{ 
          antialias: true,
          powerPreference: 'high-performance',
          alpha: true
        }}
        performance={{ min: 0.5 }} // Throttle to 30fps on slow devices
      >
        {/* Lighting setup */}
        <ambientLight intensity={0.5} />
        <directionalLight 
          position={[5, 5, 5]} 
          intensity={0.8}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight position={[-5, 5, 5]} intensity={0.3} color="#06B6D4" />

        {/* Avatar Model */}
        <Suspense fallback={<FallbackAvatar />}>
          {useCustomModel ? (
            <ScottModel 
              emotion={emotion} 
              isSpeaking={isSpeaking} 
              audioVolume={audioVolume} 
            />
          ) : (
            <FallbackAvatar />
          )}
        </Suspense>

        {/* Camera controls */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 2}
          autoRotate={!isSpeaking}
          autoRotateSpeed={0.5}
        />
      </Canvas>

      {/* Status indicator */}
      <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
        {useCustomModel ? '3D Model: Custom' : '3D Model: Fallback'}
      </div>
    </div>
  );
}

/**
 * Web Speech API Lip Sync Hook
 * Provides audio volume for lip sync animation
 */
export function useVoiceLipSync(isListening: boolean) {
  const [audioVolume, setAudioVolume] = useState(0);

  useEffect(() => {
    if (!isListening) {
      setAudioVolume(0);
      return;
    }

    let audioContext: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let microphone: MediaStreamAudioSourceNode | null = null;
    let animationId: number;

    // Initialize audio analysis
    const startAudioAnalysis = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        audioContext = new AudioContext();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        
        microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const updateVolume = () => {
          if (!analyser) return;

          analyser.getByteFrequencyData(dataArray);
          
          // Calculate average volume
          const sum = dataArray.reduce((a, b) => a + b, 0);
          const average = sum / dataArray.length;
          const normalizedVolume = average / 255;

          setAudioVolume(normalizedVolume);
          animationId = requestAnimationFrame(updateVolume);
        };

        updateVolume();
      } catch (error) {
        console.error('Failed to access microphone:', error);
      }
    };

    startAudioAnalysis();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      if (microphone) microphone.disconnect();
      if (audioContext) audioContext.close();
      setAudioVolume(0);
    };
  }, [isListening]);

  return audioVolume;
}

// Preload GLB model (if available)
useGLTF.preload('/assets/scott-avatar.glb');
