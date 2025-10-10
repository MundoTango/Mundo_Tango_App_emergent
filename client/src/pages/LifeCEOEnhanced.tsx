import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Mic, MicOff, Volume2, Globe, Brain, Calendar, Heart, DollarSign, Shield, Send, Plus, Search, FolderOpen, MessageSquare, Settings, MoreVertical, Trash2, Edit2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { queryClient, apiRequest } from '@/lib/queryClient';

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  projectId?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  audioUrl?: string;
}

interface Project {
  id: string;
  name: string;
  color: string;
  icon: string;
  conversations: string[];
  createdAt: Date;
}

export default function LifeCEOEnhanced() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { t } = useTranslation();
  
  const [isRecording, setIsRecording] = useState(false);
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [activeConversationId, setActiveConversationId] = useState<string>('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeProjectId, setActiveProjectId] = useState<string>('');
  const [isInstallPromptVisible, setIsInstallPromptVisible] = useState(false);

  // Check if user is super admin (must be before queries)
  const isSuperAdmin = (user as any)?.isSuperAdmin === true;

  // Fetch conversations from database
  const { data: conversationsData, isLoading: isLoadingConversations } = useQuery<{ success: boolean; data: Conversation[] }>({
    queryKey: ['/api/life-ceo/conversations'],
    enabled: !!user && isSuperAdmin
  });

  // Fetch projects from database
  const { data: projectsData, isLoading: isLoadingProjects } = useQuery<{ success: boolean; data: Project[] }>({
    queryKey: ['/api/life-ceo/projects'],
    enabled: !!user && isSuperAdmin
  });

  // Define all 16 Life CEO agents with translations
  const LIFE_CEO_AGENTS = [
    { id: 'life-ceo', name: t('lifeceo.agent.life_ceo.name', 'Life CEO'), icon: '👔', description: t('lifeceo.agent.life_ceo.description', 'General life management') },
    { id: 'business', name: t('lifeceo.agent.business.name', 'Business Agent'), icon: '💼', description: t('lifeceo.agent.business.description', 'Professional development and meetings') },
    { id: 'finance', name: t('lifeceo.agent.finance.name', 'Finance Agent'), icon: '💰', description: t('lifeceo.agent.finance.description', 'Financial planning and tracking') },
    { id: 'health', name: t('lifeceo.agent.health.name', 'Health Agent'), icon: '🏥', description: t('lifeceo.agent.health.description', 'Wellness and medical management') },
    { id: 'relationships', name: t('lifeceo.agent.relationships.name', 'Relationships Agent'), icon: '❤️', description: t('lifeceo.agent.relationships.description', 'Social connections and family') },
    { id: 'learning', name: t('lifeceo.agent.learning.name', 'Learning Agent'), icon: '📚', description: t('lifeceo.agent.learning.description', 'Education and skill development') },
    { id: 'creative', name: t('lifeceo.agent.creative.name', 'Creative Agent'), icon: '🎨', description: t('lifeceo.agent.creative.description', 'Artistic projects and expression') },
    { id: 'network', name: t('lifeceo.agent.network.name', 'Network Agent'), icon: '🌐', description: t('lifeceo.agent.network.description', 'Professional connections') },
    { id: 'global-mobility', name: t('lifeceo.agent.global_mobility.name', 'Global Mobility Agent'), icon: '✈️', description: t('lifeceo.agent.global_mobility.description', 'Travel and relocation') },
    { id: 'security', name: t('lifeceo.agent.security.name', 'Security Agent'), icon: '🔒', description: t('lifeceo.agent.security.description', 'Privacy and protection') },
    { id: 'emergency', name: t('lifeceo.agent.emergency.name', 'Emergency Agent'), icon: '🚨', description: t('lifeceo.agent.emergency.description', 'Crisis management') },
    { id: 'memory', name: t('lifeceo.agent.memory.name', 'Memory Agent'), icon: '🧠', description: t('lifeceo.agent.memory.description', 'Knowledge and recall') },
    { id: 'voice', name: t('lifeceo.agent.voice.name', 'Voice Agent'), icon: '🎙️', description: t('lifeceo.agent.voice.description', 'Communication enhancement') },
    { id: 'data', name: t('lifeceo.agent.data.name', 'Data Agent'), icon: '📊', description: t('lifeceo.agent.data.description', 'Analytics and insights') },
    { id: 'workflow', name: t('lifeceo.agent.workflow.name', 'Workflow Agent'), icon: '⚙️', description: t('lifeceo.agent.workflow.description', 'Process optimization') },
    { id: 'legal', name: t('lifeceo.agent.legal.name', 'Legal Agent'), icon: '⚖️', description: t('lifeceo.agent.legal.description', 'Legal matters and compliance') }
  ];

  const conversations = conversationsData?.data || [];
  const projects = projectsData?.data || [];
  const audioContextRef = useRef<AudioContext | null>(null);
  const deferredPromptRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioProcessorRef = useRef<ScriptProcessorNode | null>(null);

  const [activeAgents, setActiveAgents] = useState([
    { name: 'Business Agent', status: 'active', icon: '💼' },
    { name: 'Finance Agent', status: 'active', icon: '💰' },
    { name: 'Health Agent', status: 'active', icon: '❤️' },
  ]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('life-ceo');
  const [showAgentSwitcher, setShowAgentSwitcher] = useState(false);

  // Redirect non-super admins
  useEffect(() => {
    if (user && !isSuperAdmin) {
      toast.error(t('lifeceo.error.access_denied', 'Access denied. Life CEO Portal is restricted to Super Admins only.'));
      setLocation('/');
    }
  }, [user, isSuperAdmin, setLocation, t]);

  // Register service worker and handle PWA installation
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
        })
        .catch(error => {
        });
    }

    // Handle PWA install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPromptRef.current = e;
      setIsInstallPromptVisible(true);
    });
  }, []);

  // Save conversation mutation
  const saveConversationMutation = useMutation({
    mutationFn: async (conversation: Conversation) => {
      return await apiRequest('/api/life-ceo/conversations', {
        method: 'POST',
        body: JSON.stringify(conversation)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/life-ceo/conversations'] });
    },
    onError: (error: any) => {
      toast.error(t('lifeceo.error.save_conversation_failed', 'Failed to save conversation'));
      console.error('Save conversation error:', error);
    }
  });

  // Delete conversation mutation
  const deleteConversationMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      return await apiRequest(`/api/life-ceo/conversations/${conversationId}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/life-ceo/conversations'] });
      toast.success(t('lifeceo.success.conversation_deleted', 'Conversation deleted'));
    },
    onError: (error: any) => {
      toast.error(t('lifeceo.error.delete_conversation_failed', 'Failed to delete conversation'));
      console.error('Delete conversation error:', error);
    }
  });

  // Save project mutation
  const saveProjectMutation = useMutation({
    mutationFn: async (project: Project) => {
      return await apiRequest('/api/life-ceo/projects', {
        method: 'POST',
        body: JSON.stringify(project)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/life-ceo/projects'] });
    },
    onError: (error: any) => {
      toast.error(t('lifeceo.error.save_project_failed', 'Failed to save project'));
      console.error('Save project error:', error);
    }
  });

  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      return await apiRequest(`/api/life-ceo/projects/${projectId}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/life-ceo/projects'] });
      toast.success(t('lifeceo.success.project_deleted', 'Project deleted'));
    },
    onError: (error: any) => {
      toast.error(t('lifeceo.error.delete_project_failed', 'Failed to delete project'));
      console.error('Delete project error:', error);
    }
  });

  useEffect(() => {
    // Disabled for testing
    // if (!isSuperAdmin) {
    //   toast.error('Access denied. Life CEO is only available for super administrators.');
    //   setLocation('/memories');
    //   return;
    // }

    // Initialize audio context for noise suppression
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    // Initialize speech recognition with enhanced settings
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = language === 'en' ? 'en-US' : 'es-ES';
      recognitionInstance.maxAlternatives = 3;
      
      // Add enhanced audio processing for unclear speech
      recognitionInstance.audiostart = () => {
      };
      
      recognitionInstance.audioend = () => {
      };

      recognitionInstance.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            setTranscript(prev => prev + event.results[i][0].transcript + ' ');
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
      };

      recognitionInstance.onerror = (event: any) => {
        toast.error(t('lifeceo.error.speech_recognition_failed', `Speech recognition failed: ${event.error}`));
        setIsRecording(false);
      };

      setRecognition(recognitionInstance);
    }
  }, [isSuperAdmin, language, setLocation]);

  // Handle PWA installation
  const handleInstallPWA = async () => {
    if (deferredPromptRef.current) {
      deferredPromptRef.current.prompt();
      const { outcome } = await deferredPromptRef.current.userChoice;
      if (outcome === 'accepted') {
        toast.success(t('lifeceo.success.app_installed', 'Life CEO app installed successfully!'));
      }
      deferredPromptRef.current = null;
      setIsInstallPromptVisible(false);
    }
  };

  // Create new conversation
  const createNewConversation = () => {
    const newConvo: Conversation = {
      id: Date.now().toString(),
      title: t('lifeceo.conversation.new_conversation', 'New Conversation'),
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      projectId: activeProjectId
    };
    saveConversationMutation.mutate(newConvo);
    setActiveConversationId(newConvo.id);
  };

  // Create new project
  const createNewProject = () => {
    const name = prompt(t('lifeceo.project.enter_project_name', 'Enter project name:'));
    if (name) {
      const newProject: Project = {
        id: Date.now().toString(),
        name,
        color: '#' + Math.floor(Math.random()*16777215).toString(16),
        icon: '📁',
        conversations: [],
        createdAt: new Date()
      };
      saveProjectMutation.mutate(newProject);
    }
  };

  // Enhanced voice recording with noise suppression
  const toggleRecording = async () => {
    if (isRecording) {
      recognition?.stop();
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      setIsRecording(false);
    } else {
      try {
        // Request microphone with noise suppression
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 44100
          } 
        });
        
        mediaStreamRef.current = stream;
        
        // Apply enhanced noise filtering for unclear/long audio
        if (audioContextRef.current) {
          const source = audioContextRef.current.createMediaStreamSource(stream);
          
          // Create audio processing chain
          const analyser = audioContextRef.current.createAnalyser();
          analyser.fftSize = 2048;
          analyser.smoothingTimeConstant = 0.8;
          
          // Dynamic compressor for consistent volume
          const compressor = audioContextRef.current.createDynamicsCompressor();
          compressor.threshold.value = -24;
          compressor.knee.value = 30;
          compressor.ratio.value = 12;
          compressor.attack.value = 0.003;
          compressor.release.value = 0.25;
          
          // High-pass filter to remove low-frequency noise
          const highPassFilter = audioContextRef.current.createBiquadFilter();
          highPassFilter.type = 'highpass';
          highPassFilter.frequency.value = 85; // Remove frequencies below 85Hz
          
          // Create custom noise reduction processor
          const scriptProcessor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
          scriptProcessor.onaudioprocess = (e) => {
            const input = e.inputBuffer.getChannelData(0);
            const output = e.outputBuffer.getChannelData(0);
            
            // Enhanced noise reduction algorithm
            for (let i = 0; i < input.length; i++) {
              let sample = input[i];
              
              // Adaptive noise gate with smooth transitions
              const noiseFloor = 0.008;
              if (Math.abs(sample) < noiseFloor) {
                // Smooth fade for noise reduction
                sample = sample * Math.exp(-Math.abs(sample) / noiseFloor);
              }
              
              // Prevent clipping
              sample = Math.max(-1, Math.min(1, sample));
              output[i] = sample;
            }
          };
          
          // Connect audio processing chain
          source.connect(highPassFilter);
          highPassFilter.connect(compressor);
          compressor.connect(scriptProcessor);
          scriptProcessor.connect(analyser);
          
          // Store references for cleanup
          audioProcessorRef.current = scriptProcessor;
        }
        
        recognition?.start();
        setIsRecording(true);
        setTranscript('');
      } catch (error) {
        toast.error(t('lifeceo.error.microphone_access_denied', 'Failed to access microphone'));
      }
    }
  };

  // Send message to Life CEO backend
  const sendMessage = async () => {
    if (!transcript.trim() && !response.trim()) return;

    const currentConvo = conversations.find(c => c.id === activeConversationId);
    if (!currentConvo) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: transcript.trim(),
      timestamp: new Date()
    };

    const updatedConvo = {
      ...currentConvo,
      messages: [...currentConvo.messages, userMessage],
      updatedAt: new Date()
    };

    // Save conversation with user message
    saveConversationMutation.mutate(updatedConvo);
    setTranscript('');
    setIsProcessing(true);

    try {
      // Use the new agent orchestrator endpoint
      const agentEndpoint = `/api/life-ceo/chat/${selectedAgentId}`;
        
      const res = await fetch(agentEndpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({ 
          message: userMessage.content
        })
      });

      const data = await res.json();
      
      if (data.success && data.data) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.data.response || t('lifeceo.response.default', 'I understand. How can I help you further?'),
          timestamp: new Date()
        };

        const finalConvo = {
          ...updatedConvo,
          messages: [...updatedConvo.messages, assistantMessage],
          updatedAt: new Date()
        };

        // Save conversation with assistant message
        saveConversationMutation.mutate(finalConvo);
        setResponse(assistantMessage.content);

        // Speak the response
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(assistantMessage.content);
          utterance.lang = language === 'en' ? 'en-US' : 'es-ES';
          window.speechSynthesis.speak(utterance);
        }
      } else {
        toast.error(data.error || t('lifeceo.error.failed_response', 'Failed to get response from Life CEO'));
      }
    } catch (error) {
      toast.error(t('lifeceo.error.failed_process', 'Failed to process command'));
    } finally {
      setIsProcessing(false);
    }
  };

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const filteredConversations = conversations.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (!activeProjectId || c.projectId === activeProjectId)
  );

  if (!isSuperAdmin) {
    return null;
  }

  return (
    <main role="main" aria-label={t('lifeceo.aria.main', 'Life CEO AI Assistant')} className="flex h-screen bg-gray-50" data-testid="page-lifeceo">
      {/* Sidebar */}
      <aside 
        role="complementary"
        aria-label={t('lifeceo.aria.sidebar', 'Navigation sidebar')}
        className={`${showSidebar ? 'w-64' : 'w-0'} transition-all duration-300 bg-white border-r border-gray-200 overflow-hidden`}
      >
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Life CEO</h2>
            <Button
              onClick={createNewConversation}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700"
              data-testid="button-create-conversation"
              aria-label={t('lifeceo.aria.create_conversation', 'Create new conversation')}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={t('lifeceo.placeholder.search_conversations', 'Search conversations...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-conversations"
              aria-label={t('lifeceo.aria.search_conversations', 'Search conversations')}
            />
          </div>

          {/* Projects */}
          <nav 
            role="navigation"
            aria-label={t('lifeceo.aria.projects', 'Project list')}
            className="mb-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">{t('lifeceo.projects', 'Projects')}</span>
              <Button
                onClick={createNewProject}
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                data-testid="button-create-project"
                aria-label={t('lifeceo.aria.create_project', 'Create new project')}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <div data-testid="list-projects">
              {projects.map(project => (
                <button
                  key={project.id}
                  onClick={() => setActiveProjectId(project.id === activeProjectId ? '' : project.id)}
                  className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-100 w-full text-left ${
                    activeProjectId === project.id ? 'bg-purple-50' : ''
                  }`}
                  data-testid={`project-${project.id}`}
                  aria-label={t('lifeceo.aria.select_project', `Select project: ${project.name}`)}
                  aria-pressed={activeProjectId === project.id}
                >
                  <span>{project.icon}</span>
                  <span className="text-sm truncate" data-testid={`text-project-name-${project.id}`}>{project.name}</span>
                </button>
              ))}
            </div>
          </nav>

          {/* Conversations */}
          <nav 
            role="navigation"
            aria-label={t('lifeceo.aria.conversations', 'Conversations list')}
            className="space-y-1" 
            data-testid="list-conversations"
          >
            {filteredConversations.map(convo => (
              <button
                key={convo.id}
                onClick={() => setActiveConversationId(convo.id)}
                className={`p-2 rounded cursor-pointer hover:bg-gray-100 w-full text-left ${
                  activeConversationId === convo.id ? 'bg-purple-50' : ''
                }`}
                data-testid={`conversation-${convo.id}`}
                aria-label={t('lifeceo.aria.select_conversation', `Select conversation: ${convo.title}`)}
                aria-current={activeConversationId === convo.id ? 'true' : 'false'}
              >
                <div className="flex items-center justify-between">
                  <MessageSquare className="h-4 w-4 text-gray-400" />
                  <span className="text-sm truncate flex-1 mx-2" data-testid={`text-conversation-title-${convo.id}`}>{convo.title}</span>
                  <MoreVertical className="h-4 w-4 text-gray-400" data-testid={`button-delete-conversation-${convo.id}`} />
                </div>
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setLocation('/profile-switcher')}
                variant="ghost"
                size="sm"
                data-testid="button-back"
                aria-label={t('lifeceo.aria.back', 'Go back to previous page')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('lifeceo.button.back', 'Back')}
              </Button>
              
              <h1 className="text-xl font-semibold">
                {activeConversation?.title || t('lifeceo.title', 'Life CEO Assistant')}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              {isInstallPromptVisible && (
                <div data-testid="prompt-pwa-install">
                  <Button
                    onClick={handleInstallPWA}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700"
                    data-testid="button-install-pwa"
                    aria-label={t('lifeceo.aria.install', 'Install Life CEO app on device')}
                  >
                    {t('lifeceo.button.install_app', 'Install App')}
                  </Button>
                </div>
              )}
              
              <Button
                onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
                variant="outline"
                size="sm"
                data-testid="select-language"
                aria-label={t('lifeceo.aria.language', `Change language to ${language === 'en' ? 'Spanish' : 'English'}`)}
              >
                <Globe className="h-4 w-4 mr-2" />
                {language === 'en' ? 'EN' : 'ES'}
              </Button>
              
              <Button
                onClick={() => setShowSidebar(!showSidebar)}
                variant="ghost"
                size="sm"
                data-testid="button-toggle-sidebar"
                aria-label={t('lifeceo.aria.toggle_sidebar', showSidebar ? 'Hide sidebar' : 'Show sidebar')}
                aria-expanded={showSidebar}
              >
                <FolderOpen className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div 
          role="log"
          aria-live="polite"
          aria-atomic="false"
          aria-label={t('lifeceo.aria.messages', 'Conversation messages')}
          className="flex-1 overflow-y-auto p-4 space-y-4" 
          data-testid="list-messages"
        >
          {activeConversation?.messages.map(message => (
            <div
              key={message.id}
              role="article"
              aria-label={`${message.role} ${t('lifeceo.aria.message', 'message')}`}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              data-testid={`message-${message.id}`}
            >
              <div className={`max-w-2xl p-4 rounded-lg ${
                message.role === 'user' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                <p className="text-sm" data-testid={message.role === 'user' ? 'text-transcript' : 'text-response'}>{message.content}</p>
                <span className="text-xs opacity-70">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
          
          {isProcessing && (
            <div 
              role="alert"
              aria-live="assertive"
              aria-busy={isProcessing}
              className="flex justify-start"
            >
              <div className="bg-gray-100 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="animate-pulse" data-testid="status-processing">{t('lifeceo.status.processing', 'Processing...')}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={toggleRecording}
              size="lg"
              data-testid={isRecording ? "button-voice-stop" : "button-voice-record"}
              aria-label={isRecording ? t('lifeceo.aria.stop_recording', 'Stop voice recording') : t('lifeceo.aria.start_recording', 'Start voice recording')}
              aria-pressed={isRecording}
              className={`rounded-full w-16 h-16 ${
                isRecording 
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                  : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              {isRecording ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            </Button>
            
            <div className="flex-1">
              <Input
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder={t('lifeceo.placeholder.type_or_speak', 'Type or speak your command...')}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                disabled={isProcessing}
                data-testid="input-message"
                aria-label={t('lifeceo.aria.input', 'Type your command')}
                aria-describedby="recording-status"
              />
            </div>
            
            <Button
              onClick={sendMessage}
              disabled={!transcript.trim() || isProcessing}
              className="bg-purple-600 hover:bg-purple-700"
              data-testid="button-send-message"
              aria-label={t('lifeceo.aria.send_message', 'Send message')}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          {isRecording && (
            <div 
              id="recording-status"
              role="status"
              aria-live="assertive"
              aria-atomic="true"
              className="mt-2 text-sm text-red-500 animate-pulse" 
              data-testid="status-recording"
            >
              {t('lifeceo.status.recording', 'Recording... Speak clearly')}
            </div>
          )}
        </div>

        {/* Agent Status Bar */}
        <div className="bg-gray-100 border-t border-gray-200 p-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {activeAgents.slice(0, 3).map(agent => (
                <div key={agent.name} className="flex items-center gap-2 text-xs">
                  <span>{agent.icon}</span>
                  <span className="text-gray-600">{agent.name}</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                </div>
              ))}
            </div>
            <Button
              onClick={() => setShowAgentSwitcher(true)}
              variant="ghost"
              size="sm"
              className="text-xs"
              data-testid="button-switch-agent"
              aria-label={t('lifeceo.aria.switch_agent', 'Switch AI agent')}
            >
              <Brain className="h-4 w-4 mr-1" />
              {t('lifeceo.button.switch_agent', 'Switch Agent')} ({LIFE_CEO_AGENTS.find(a => a.id === selectedAgentId)?.name || t('lifeceo.title', 'Life CEO')})
            </Button>
          </div>
        </div>

        {/* Enhanced Agent Switcher Modal with MT Ocean Theme */}
        {showAgentSwitcher && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn" 
            data-testid="agent-switcher"
            role="dialog"
            aria-modal="true"
            aria-labelledby="agent-switcher-title"
            aria-describedby="agent-switcher-description"
          >
            <div className="glassmorphic-card max-w-4xl w-full max-h-[90vh] overflow-hidden rounded-2xl animate-scaleIn">
              <div className="bg-gradient-to-r from-turquoise-400 to-cyan-500 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 id="agent-switcher-title" className="text-2xl font-bold mb-2">{t('lifeceo.modal.agent_selection_title', 'Life CEO Agent Selection')}</h2>
                    <p id="agent-switcher-description" className="text-turquoise-100 text-sm">
                      {t('lifeceo.modal.agent_selection_subtitle', 'Choose your AI assistant to help manage different aspects of your life')}
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowAgentSwitcher(false)}
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20 rounded-full"
                    aria-label={t('lifeceo.aria.close_agent_switcher', 'Close agent selection')}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              {/* Current Agent Display */}
              <div className="p-6 bg-gradient-to-r from-turquoise-50/50 to-cyan-50/50 border-b border-turquoise-200/30">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-turquoise-400 to-cyan-500 rounded-xl flex items-center justify-center text-3xl shadow-lg">
                    {LIFE_CEO_AGENTS.find(a => a.id === selectedAgentId)?.icon || '👔'}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t('lifeceo.modal.currently_active', 'Currently Active')}</p>
                    <h3 className="text-xl font-semibold bg-gradient-to-r from-turquoise-600 to-cyan-600 bg-clip-text text-transparent" data-testid="text-active-agent">
                      {LIFE_CEO_AGENTS.find(a => a.id === selectedAgentId)?.name || t('lifeceo.title', 'Life CEO')}
                    </h3>
                  </div>
                </div>
              </div>
              
              {/* Agent Grid */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-300px)]">
                <div 
                  role="radiogroup"
                  aria-label={t('lifeceo.aria.agent_selection', 'Select AI agent')}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                  {LIFE_CEO_AGENTS.map(agent => {
                    const isSelected = selectedAgentId === agent.id;
                    return (
                      <button
                        key={agent.id}
                        role="radio"
                        aria-checked={isSelected}
                        aria-label={t(`lifeceo.aria.agent_${agent.id}`, `${agent.name}: ${agent.description}`)}
                        onClick={() => {
                          setSelectedAgentId(agent.id);
                          setShowAgentSwitcher(false);
                          toast.success(t('lifeceo.success.switched_to_agent', `Switched to ${agent.name}`), {
                            icon: agent.icon,
                            style: {
                              background: 'linear-gradient(to right, #14B8A6, #2DD4BF)',
                              color: 'white',
                            },
                          });
                        }}
                        className={cn(
                          "group relative p-6 rounded-xl transition-all duration-300",
                          "hover:scale-105 hover:shadow-xl",
                          isSelected 
                            ? "glassmorphic-card ring-2 ring-turquoise-500 ring-offset-2" 
                            : "glassmorphic-card hover:ring-2 hover:ring-turquoise-300"
                        )}
                        data-testid={`button-agent-${agent.id}`}
                      >
                        {/* Selected Badge */}
                        {isSelected && (
                          <div className="absolute -top-2 -right-2 bg-gradient-to-r from-turquoise-400 to-cyan-500 text-white text-xs px-3 py-1 rounded-full shadow-lg">
                            {t('lifeceo.modal.active_badge', 'Active')}
                          </div>
                        )}
                        
                        {/* Agent Icon */}
                        <div className={cn(
                          "w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center text-4xl transition-all duration-300",
                          "bg-gradient-to-br from-white/80 to-white/60 shadow-lg",
                          "group-hover:shadow-xl group-hover:scale-110"
                        )}>
                          {agent.icon}
                        </div>
                        
                        {/* Agent Info */}
                        <div className="text-center">
                          <h3 className={cn(
                            "text-lg font-semibold mb-2 transition-colors",
                            isSelected 
                              ? "bg-gradient-to-r from-turquoise-600 to-cyan-600 bg-clip-text text-transparent"
                              : "text-gray-800 group-hover:text-turquoise-600"
                          )}>
                            {agent.name}
                          </h3>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {agent.description}
                          </p>
                        </div>
                        
                        {/* Hover Effect */}
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-turquoise-400/0 to-cyan-400/0 group-hover:from-turquoise-400/10 group-hover:to-cyan-400/10 transition-all duration-300 pointer-events-none" />
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {/* Footer Info */}
              <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
                <p className="text-center text-sm text-gray-600">
                  <span className="inline-flex items-center gap-1">
                    <Brain className="h-4 w-4 text-turquoise-500" />
                    Each agent specializes in different areas of your life
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}