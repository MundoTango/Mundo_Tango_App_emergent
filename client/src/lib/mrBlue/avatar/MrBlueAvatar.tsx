import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, useAnimations } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as THREE from 'three';

/**
 * ESA Agent #73: 3D Avatar System
 * Mr Blue 3D AI companion with voice interaction
 */

interface MrBlueAvatarProps {
  onMessage?: (message: string) => void;
  autoSpeak?: boolean;
  isSpeaking?: boolean;
  isListening?: boolean;
  isThinking?: boolean;
  emotion?: 'neutral' | 'happy' | 'thinking' | 'concerned' | 'excited';
}

export function MrBlueAvatar({ 
  onMessage, 
  autoSpeak = false,
  isSpeaking: externalIsSpeaking,
  isListening: externalIsListening,
  isThinking,
  emotion = 'neutral'
}: MrBlueAvatarProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Use external states if provided
  const actualIsSpeaking = externalIsSpeaking ?? isSpeaking;
  const actualIsListening = externalIsListening ?? isListening;
  const { toast } = useToast();

  const handleVoiceInput = async () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast({
        title: "Voice Not Supported",
        description: "Your browser doesn't support voice input",
        variant: "destructive",
      });
      return;
    }

    setIsListening(!isListening);
    
    if (!isListening) {
      // Start listening
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onMessage?.(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
        toast({
          title: "Voice Input Failed",
          description: "Could not recognize speech",
          variant: "destructive",
        });
      };

      recognition.start();
    }
  };

  const handleSpeak = (text: string) => {
    if (isMuted) return;

    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="relative w-full h-full" data-testid="mr-blue-avatar">
      {/* 3D Avatar Canvas */}
      <Canvas
        camera={{ position: [0, 0, 3], fov: 50 }}
        className="w-full h-full"
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <AvatarModel 
          isSpeaking={actualIsSpeaking} 
          isThinking={isThinking}
          emotion={emotion}
        />
        <OrbitControls 
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>

      {/* Voice Controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
        <Button
          variant={actualIsListening ? "default" : "outline"}
          size="icon"
          onClick={handleVoiceInput}
          className={actualIsListening ? "animate-pulse" : ""}
          data-testid="button-voice-input"
        >
          {actualIsListening ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMuted(!isMuted)}
          data-testid="button-toggle-mute"
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
      </div>

      {/* Status Indicator */}
      {actualIsSpeaking && (
        <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm animate-pulse">
          Speaking...
        </div>
      )}

      {actualIsListening && (
        <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm animate-pulse">
          Listening...
        </div>
      )}
      
      {isThinking && (
        <div className="absolute top-4 left-4 bg-purple-500 text-white px-3 py-1 rounded-full text-sm animate-pulse">
          Thinking...
        </div>
      )}
    </div>
  );
}

function AvatarModel({ 
  isSpeaking, 
  isThinking, 
  emotion 
}: { 
  isSpeaking?: boolean;
  isThinking?: boolean;
  emotion?: 'neutral' | 'happy' | 'thinking' | 'concerned' | 'excited';
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [avatarExists, setAvatarExists] = useState(false);

  // Check if Meshy.ai generated avatar exists
  useEffect(() => {
    fetch('/api/avatar/info')
      .then(res => res.json())
      .then(data => {
        if (data.exists) {
          setAvatarExists(true);
          console.log('✅ Mr Blue avatar found:', data.path);
        }
      })
      .catch(() => setAvatarExists(false));
  }, []);

  // Try to load GLB model if it exists
  const { scene: glbScene } = avatarExists 
    ? useGLTF('/models/mr-blue-avatar.glb') 
    : { scene: null };

  useFrame((state) => {
    if (groupRef.current) {
      // Idle animation
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      
      // Speaking animation
      if (isSpeaking) {
        groupRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 10) * 0.05;
      } else {
        groupRef.current.scale.y = 1;
      }

      // Hover effect
      if (hovered) {
        groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
      }
    }
  });

  return (
    <group 
      ref={groupRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Load Meshy.ai GLB model if available, otherwise show placeholder */}
      {glbScene ? (
        <primitive object={glbScene} scale={0.01} />
      ) : (
        <>
          {/* Simple avatar representation (placeholder until Meshy.ai avatar is generated) */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.5, 32, 32]} />
            <meshStandardMaterial color={
              hovered ? "#60a5fa" : 
              emotion === 'happy' ? "#10B981" :
              emotion === 'thinking' ? "#8B5CF6" :
              emotion === 'concerned' ? "#F59E0B" :
              emotion === 'excited' ? "#EC4899" :
              "#3b82f6"
            } />
          </mesh>
          
          {/* Eyes */}
          <mesh position={[-0.2, 0.1, 0.4]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0.2, 0.1, 0.4]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>

          {/* Pupils */}
          <mesh position={[-0.2, 0.1, 0.5]}>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshStandardMaterial color="#000000" />
          </mesh>
          <mesh position={[0.2, 0.1, 0.5]}>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshStandardMaterial color="#000000" />
          </mesh>
        </>
      )}
    </group>
  );
}
