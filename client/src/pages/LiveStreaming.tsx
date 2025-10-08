// ESA LIFE CEO 61×21 - Phase 20: Live Streaming Page
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { 
  Video, 
  Mic, 
  MicOff, 
  VideoOff, 
  Share2, 
  Users, 
  Eye, 
  Heart, 
  MessageCircle,
  Calendar,
  Clock,
  Settings,
  Radio,
  Tv,
  Music,
  PartyPopper
} from "lucide-react";
import { useSocket } from "@/contexts/socket-context";
import { format } from "date-fns";
import { Helmet } from 'react-helmet';

interface Stream {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  viewerCount: number;
  likes: number;
  thumbnailUrl?: string;
  scheduledAt?: string;
  startedAt?: string;
  host: {
    id: number;
    name: string;
    username: string;
    profileImage?: string;
  };
  isLive?: boolean;
}

export default function LiveStreaming() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [streamTitle, setStreamTitle] = useState("");
  const [streamDescription, setStreamDescription] = useState("");
  const [streamCategory, setStreamCategory] = useState("social");
  const [scheduledDate, setScheduledDate] = useState("");
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  
  const socket = useSocket();

  // Get active streams
  const { data: activeStreams, isLoading: loadingActive } = useQuery({
    queryKey: ["/api/streaming/streams/active", selectedCategory],
    queryFn: async () => {
      const params = selectedCategory !== "all" ? `?category=${selectedCategory}` : "";
      const response = await fetch(`/api/streaming/streams/active${params}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch active streams");
      const data = await response.json();
      return data.streams;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Get scheduled streams
  const { data: scheduledStreams, isLoading: loadingScheduled } = useQuery({
    queryKey: ["/api/streaming/streams/scheduled"],
    queryFn: async () => {
      const response = await fetch("/api/streaming/streams/scheduled", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch scheduled streams");
      const data = await response.json();
      return data.streams;
    },
  });

  // Create stream mutation
  const createStreamMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/streaming/streams", {
        method: "POST",
        body: data,
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Stream created!",
        description: "Your stream has been created successfully.",
      });
      setCreateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/streaming/streams"] });
      if (data.stream) {
        startStreaming(data.stream);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create stream",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Start streaming
  const startStreaming = async (stream: Stream) => {
    try {
      // Get user media
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      localStreamRef.current = mediaStream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      // Initialize WebRTC
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      });

      peerConnectionRef.current = pc;

      // Add tracks to peer connection
      mediaStream.getTracks().forEach(track => {
        pc.addTrack(track, mediaStream);
      });

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate && socket) {
          socket.emit("webrtc:ice-candidate", {
            streamId: stream.id,
            candidate: event.candidate,
          });
        }
      };

      // Create offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Send offer to server
      if (socket) {
        socket.emit("stream:start", {
          streamId: stream.id,
          offer,
        });
      }

      setIsStreaming(true);
    } catch (error) {
      console.error("Failed to start streaming:", error);
      toast({
        title: "Failed to start streaming",
        description: "Please check your camera and microphone permissions.",
        variant: "destructive",
      });
    }
  };

  // Stop streaming
  const stopStreaming = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    
    setIsStreaming(false);
  };

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    socket.on("stream:chat-message", (data) => {
      setChatMessages(prev => [...prev, data]);
    });

    socket.on("webrtc:answer", async (data) => {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(data.answer);
      }
    });

    socket.on("webrtc:ice-candidate", async (data) => {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.addIceCandidate(data.candidate);
      }
    });

    return (
    <>
      <Helmet>
        <title>Live Streaming | Life CEO</title>
      </Helmet>
      
    </>
  ) => {
      socket.off("stream:chat-message");
      socket.off("webrtc:answer");
      socket.off("webrtc:ice-candidate");
    };
  }, [socket]);

  // Send chat message
  const sendChatMessage = () => {
    if (!chatInput.trim() || !socket) return;
    
    socket.emit("stream:chat", {
      message: chatInput,
      timestamp: Date.now(),
    });
    
    setChatInput("");
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "lesson": return <Tv className="h-4 w-4" />;
      case "performance": return <Music className="h-4 w-4" />;
      case "milonga": return <PartyPopper className="h-4 w-4" />;
      default: return <Radio className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Live Streaming</h1>
          <p className="text-gray-600 dark:text-gray-600 dark:text-gray-400 mt-2">
            Watch live Tango performances, lessons, and social events
          </p>
        </div>
        
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700">
              <Video className="mr-2 h-4 w-4" />
              Go Live
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Live Stream</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={streamTitle}
                  onChange={(e) => setStreamTitle(e.target.value)}
                  placeholder="Enter stream title"
                 
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={streamDescription}
                  onChange={(e) => setStreamDescription(e.target.value)}
                  placeholder="Describe your stream"
                  rows={3}
                 
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select value={streamCategory} onValueChange={setStreamCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lesson">Lesson</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                    <SelectItem value="milonga">Milonga</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Schedule (optional)</label>
                <Input
                  type="datetime-local"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                 
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    createStreamMutation.mutate({
                      title: streamTitle,
                      description: streamDescription,
                      category: streamCategory,
                      scheduledAt: scheduledDate || undefined,
                    });
                  }}
                  disabled={!streamTitle || createStreamMutation.isPending}
                 
                >
                  {scheduledDate ? "Schedule Stream" : "Start Streaming"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Category Filter */}
      <div className="flex space-x-2 mb-6 overflow-x-auto">
        <Button
          variant={selectedCategory === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory("all")}
         
        >
          All
        </Button>
        <Button
          variant={selectedCategory === "lesson" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory("lesson")}
         
        >
          <Tv className="mr-1 h-3 w-3" />
          Lessons
        </Button>
        <Button
          variant={selectedCategory === "performance" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory("performance")}
         
        >
          <Music className="mr-1 h-3 w-3" />
          Performances
        </Button>
        <Button
          variant={selectedCategory === "milonga" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory("milonga")}
         
        >
          <PartyPopper className="mr-1 h-3 w-3" />
          Milongas
        </Button>
      </div>

      <Tabs defaultValue="live" className="space-y-4">
        <TabsList>
          <TabsTrigger value="live">
            <Radio className="mr-2 h-4 w-4" />
            Live Now
          </TabsTrigger>
          <TabsTrigger value="scheduled">
            <Calendar className="mr-2 h-4 w-4" />
            Scheduled
          </TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="space-y-4">
          {loadingActive ? (
            <div className="text-center py-8">Loading active streams...</div>
          ) : activeStreams && activeStreams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeStreams.map((stream: Stream) => (
                <Card key={stream.id} className="overflow-hidden hover:shadow-lg transition-shadow" data-testid={`stream-card-${stream.id}`}>
                  <div className="relative aspect-video bg-gray-200 dark:bg-gray-700">
                    {stream.thumbnailUrl ? (
                      <img src={stream.thumbnailUrl} alt={stream.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Video className="h-12 w-12 text-gray-600 dark:text-gray-400" />
                      </div>
                    )}
                    <Badge className="absolute top-2 left-2 bg-red-600">
                      LIVE
                    </Badge>
                    <div className="absolute bottom-2 right-2 flex items-center space-x-2">
                      <Badge variant="secondary" className="bg-black/50 text-white">
                        <Eye className="mr-1 h-3 w-3" />
                        {stream.viewerCount}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <img
                        src={stream.host.profileImage || "/api/placeholder/40/40"}
                        alt={stream.host.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold line-clamp-1">{stream.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-600 dark:text-gray-400">{stream.host.name}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          {getCategoryIcon(stream.category)}
                          <span className="text-xs text-gray-500">{stream.category}</span>
                        </div>
                      </div>
                    </div>
                    <Button className="w-full mt-3" size="sm" data-testid={`button-watch-${stream.id}`}>
                      Watch Stream
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <Video className="h-12 w-12 text-gray-600 dark:text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Live Streams</h3>
              <p className="text-gray-600 dark:text-gray-600 dark:text-gray-400">
                Be the first to go live and share your Tango passion!
              </p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          {loadingScheduled ? (
            <div className="text-center py-8">Loading scheduled streams...</div>
          ) : scheduledStreams && scheduledStreams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {scheduledStreams.map((stream: Stream) => (
                <Card key={stream.id} className="overflow-hidden" data-testid={`scheduled-card-${stream.id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg line-clamp-1">{stream.title}</CardTitle>
                        <div className="flex items-center mt-2 text-sm text-gray-600 dark:text-gray-600 dark:text-gray-400">
                          <Clock className="mr-1 h-3 w-3" />
                          {stream.scheduledAt && format(new Date(stream.scheduledAt), "MMM dd, h:mm a")}
                        </div>
                      </div>
                      {getCategoryIcon(stream.category)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                      {stream.description}
                    </p>
                    <div className="flex items-center space-x-3">
                      <img
                        src={stream.host.profileImage || "/api/placeholder/32/32"}
                        alt={stream.host.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="text-sm font-medium">{stream.host.name}</span>
                    </div>
                    <Button variant="outline" className="w-full mt-3" size="sm" data-testid={`button-notify-${stream.id}`}>
                      Get Notified
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <Calendar className="h-12 w-12 text-gray-600 dark:text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Scheduled Streams</h3>
              <p className="text-gray-600 dark:text-gray-600 dark:text-gray-400">
                Schedule your stream to let the community know when you'll be live
              </p>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Streaming Interface (when live) */}
      {isStreaming && (
        <div className="fixed inset-0 z-50 bg-black">
          <div className="h-full flex">
            <div className="flex-1 relative">
              <video
                ref={videoRef}
                autoPlay
                muted
                className="w-full h-full object-contain"
               
              />
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                <div className="flex space-x-2">
                  <Button variant="secondary" size="icon">
                    <Mic className="h-4 w-4" />
                  </Button>
                  <Button variant="secondary" size="icon">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="secondary" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  variant="destructive"
                  onClick={stopStreaming}
                 
                >
                  End Stream
                </Button>
              </div>
            </div>
            
            {/* Chat Sidebar */}
            <div className="w-80 bg-white dark:bg-gray-900 border-l">
              <div className="p-4 border-b">
                <h3 className="font-semibold">Live Chat</h3>
              </div>
              <ScrollArea className="h-[calc(100vh-8rem)]">
                <div className="p-4 space-y-2">
                  {chatMessages.map((msg, index) => (
                    <div key={index} className="text-sm">
                      <span className="font-medium">{msg.username}:</span>
                      <span className="ml-2">{msg.message}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="p-4 border-t">
                <div className="flex space-x-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendChatMessage()}
                    placeholder="Type a message..."
                   
                  />
                  <Button onClick={sendChatMessage} size="icon">
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}