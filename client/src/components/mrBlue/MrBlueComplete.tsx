import { useState } from 'react';
import { Sparkles, X, Maximize2, Minimize2, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useAuth } from '@/hooks/useAuth';
import { isSuperAdmin } from '@/utils/accessControl';
import { ScottAvatar } from '@/lib/mrBlue/avatar/ScottAvatar';
import { ChatInterface } from '@/lib/mrBlue/chat/ChatInterface';
import { useScottAI } from '@/lib/mrBlue/ai/ScottAI';
import { VisualPageEditor } from '@/lib/mrBlue/visualEditor/VisualPageEditor';
import { ESAMindMap } from '@/components/esa/ESAMindMap';

/**
 * ESA Mr Blue Complete System
 * Integrates Scott 3D Avatar + Chat + AI (Agents #73-80)
 * 
 * Layout: Avatar LEFT (400x400px) + Chat RIGHT
 * Mobile: Smaller avatar, same functionality
 */

export function MrBlueComplete() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [visualEditMode, setVisualEditMode] = useState(false);
  const [emotion, setEmotion] = useState<'neutral' | 'happy' | 'thinking' | 'concerned' | 'excited'>('neutral');
  
  const isAdmin = isSuperAdmin(user);
  
  // AI Integration
  const {
    messages,
    isTyping,
    currentAgent,
    isSpeaking,
    isSearchingContext,
    semanticContext,
    sendMessage,
    suggestions,
  } = useScottAI({
    defaultModel: 'gpt-4o',
    language: 'en-US',
  });

  // Handle AI messages with emotion detection
  const handleMessage = async (message: string, type: 'text' | 'voice') => {
    // Detect emotion from message
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('help') || lowerMessage.includes('problem')) {
      setEmotion('concerned');
    } else if (lowerMessage.includes('great') || lowerMessage.includes('awesome')) {
      setEmotion('excited');
    } else if (lowerMessage.includes('think') || lowerMessage.includes('consider')) {
      setEmotion('thinking');
    } else {
      setEmotion('neutral');
    }

    await sendMessage(message, type);
    
    // Return to neutral after response
    setTimeout(() => setEmotion('neutral'), 3000);
  };

  if (!user) return null;

  return (
    <>
      {/* ========== FLOATING BUTTON ========== */}
      <div 
        className="fixed bottom-6 right-6 z-[9999]"
        data-testid="mr-blue-complete-button"
      >
        {!isOpen && (
          <Button
            onClick={() => setIsOpen(true)}
            size="lg"
            className="rounded-full w-16 h-16 shadow-2xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 hover:scale-110"
            data-testid="button-open-mr-blue-complete"
          >
            <Sparkles className="h-8 w-8" />
          </Button>
        )}
      </div>

      {/* ========== MR BLUE PANEL ========== */}
      {isOpen && (
        <Card 
          className={`
            fixed z-50 shadow-2xl
            ${isFullScreen 
              ? 'inset-4 max-w-none max-h-none' 
              : 'bottom-24 right-6 w-[800px] max-w-[90vw] h-[600px] max-h-[80vh]'
            }
            transition-all duration-300
          `}
          data-testid="mr-blue-complete-panel"
        >
          <CardContent className="p-0 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-500" />
                <div>
                  <h3 className="font-semibold">Mr Blue AI Companion</h3>
                  {isSearchingContext && (
                    <p className="text-xs text-blue-600 animate-pulse">
                      🔍 Searching platform data...
                    </p>
                  )}
                  {!isSearchingContext && semanticContext && semanticContext.matchCount! > 0 && (
                    <p className="text-xs text-green-600">
                      ✓ Found {semanticContext.matchCount} match{semanticContext.matchCount === 1 ? '' : 'es'}
                      {semanticContext.eventName && ` at ${semanticContext.eventName}`}
                    </p>
                  )}
                  {!isSearchingContext && currentAgent !== 'Mr Blue' && (
                    <p className="text-xs text-muted-foreground">
                      Connected to: {currentAgent}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        window.location.href = '/admin/esa-mind';
                      }}
                      data-testid="button-esa-mind-map"
                      title="ESA Mind Map"
                    >
                      <Map className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setVisualEditMode(!visualEditMode);
                        setIsOpen(false);
                      }}
                      data-testid="button-toggle-visual-editor-complete"
                    >
                      {visualEditMode ? 'Exit Edit Mode' : 'Visual Editor'}
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsFullScreen(!isFullScreen)}
                  data-testid="button-toggle-fullscreen"
                >
                  {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  data-testid="button-close-mr-blue-complete"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Main Content: Avatar LEFT + Chat RIGHT */}
            <div className="flex-1 flex overflow-hidden">
              {/* Scott 3D Avatar - LEFT SIDE */}
              <div className={`
                bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950
                ${isFullScreen ? 'w-1/3' : 'w-[400px] max-w-[40%]'}
                md:block hidden
              `}>
                <Canvas
                  camera={{ position: [0, 0, 3], fov: 50 }}
                  className="w-full h-full"
                  data-testid="scott-avatar-canvas"
                >
                  <ambientLight intensity={0.6} />
                  <pointLight position={[10, 10, 10]} intensity={0.8} />
                  <pointLight position={[-10, -10, -10]} intensity={0.3} />
                  
                  <ScottAvatar 
                    isSpeaking={isSpeaking}
                    isListening={false}
                    isThinking={isTyping}
                    emotion={emotion}
                  />
                  
                  <OrbitControls 
                    enableZoom={false}
                    enablePan={false}
                    minPolarAngle={Math.PI / 3}
                    maxPolarAngle={Math.PI / 2}
                  />
                </Canvas>

                {/* Status Indicators */}
                {isSpeaking && (
                  <div className="absolute bottom-4 left-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm animate-pulse">
                    Speaking...
                  </div>
                )}
                {isTyping && (
                  <div className="absolute bottom-4 right-4 bg-purple-500 text-white px-3 py-1 rounded-full text-sm animate-pulse">
                    {currentAgent} is thinking...
                  </div>
                )}
              </div>

              {/* Chat Interface - RIGHT SIDE */}
              <div className="flex-1 border-l dark:border-gray-700">
                <ChatInterface 
                  onMessage={handleMessage}
                  messages={messages}
                  isTyping={isTyping}
                  typingAgent={currentAgent}
                  suggestions={suggestions}
                />
              </div>
            </div>

            {/* Mobile: Smaller avatar at top */}
            <div className="md:hidden h-[200px] bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-b">
              <Canvas
                camera={{ position: [0, 0, 2], fov: 50 }}
                className="w-full h-full"
              >
                <ambientLight intensity={0.6} />
                <pointLight position={[5, 5, 5]} intensity={0.8} />
                
                <ScottAvatar 
                  isSpeaking={isSpeaking}
                  isListening={false}
                  isThinking={isTyping}
                  emotion={emotion}
                />
                
                <OrbitControls 
                  enableZoom={false}
                  enablePan={false}
                />
              </Canvas>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========== VISUAL EDITOR OVERLAY ========== */}
      <VisualPageEditor 
        enabled={visualEditMode}
        onToggle={setVisualEditMode}
      />
    </>
  );
}

export default MrBlueComplete;
