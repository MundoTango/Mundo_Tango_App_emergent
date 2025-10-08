// ESA LIFE CEO 61×21 - Phase 20: Video Call Component
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { 
  Video, 
  VideoOff,
  Mic, 
  MicOff, 
  PhoneOff,
  Share2,
  Users,
  Grid,
  Maximize,
  Settings,
  MessageCircle
} from "lucide-react";
import { useSocket } from "@/contexts/socket-context";

interface VideoCallProps {
  roomId: string;
  eventId?: number;
  userId: number;
  userName: string;
  isHost?: boolean;
  maxParticipants?: number;
  onLeave?: () => void;
}

interface Participant {
  userId: number;
  username: string;
  socketId: string;
  stream?: MediaStream;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
}

export default function VideoCall({
  roomId,
  eventId,
  userId,
  userName,
  isHost = false,
  maxParticipants = 8,
  onLeave
}: VideoCallProps) {
  const [participants, setParticipants] = useState<Map<string, Participant>>(new Map());
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "speaker">("grid");
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const socket = useSocket();

  // Initialize media and join room
  useEffect(() => {
    initializeMedia();
    return () => {
      cleanup();
    };
  }, []);

  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Join the video call room
      if (socket) {
        socket.emit("call:join", {
          roomId,
          userId,
          username: userName
        });
      }
    } catch (error) {
      console.error("Failed to get media devices:", error);
      toast({
        title: "Camera/Microphone Error",
        description: "Please check your device permissions",
        variant: "destructive"
      });
    }
  };

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    socket.on("call:participants", (data) => {
      // Initialize connections with existing participants
      data.participants.forEach((participant: any) => {
        if (participant.userId !== userId) {
          createPeerConnection(participant.socketId, true);
        }
      });
    });

    socket.on("call:participant-joined", async (data) => {
      // New participant joined, create connection
      if (data.userId !== userId) {
        const pc = createPeerConnection(data.socketId, false);
        // Create offer for new participant
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("call:signal", {
          roomId,
          signal: { type: "offer", offer },
          targetId: data.socketId
        });
      }
    });

    socket.on("call:participant-left", (data) => {
      // Remove participant
      const pc = peerConnections.current.get(data.userId);
      if (pc) {
        pc.close();
        peerConnections.current.delete(data.userId);
      }
      
      setParticipants(prev => {
        const updated = new Map(prev);
        updated.delete(data.userId);
        return updated;
      });
    });

    socket.on("call:signal", async (data) => {
      const { signal, senderId } = data;
      
      if (signal.type === "offer") {
        const pc = createPeerConnection(senderId, false);
        await pc.setRemoteDescription(signal.offer);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        
        socket.emit("call:signal", {
          roomId,
          signal: { type: "answer", answer },
          targetId: senderId
        });
      } else if (signal.type === "answer") {
        const pc = peerConnections.current.get(senderId);
        if (pc) {
          await pc.setRemoteDescription(signal.answer);
        }
      } else if (signal.type === "ice-candidate") {
        const pc = peerConnections.current.get(senderId);
        if (pc) {
          await pc.addIceCandidate(signal.candidate);
        }
      }
    });

    return () => {
      socket.off("call:participants");
      socket.off("call:participant-joined");
      socket.off("call:participant-left");
      socket.off("call:signal");
    };
  }, [socket, userId, roomId]);

  const createPeerConnection = (targetId: string, isInitiator: boolean) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" }
      ]
    });

    // Add local stream tracks
    if (localStream) {
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });
    }

    // Handle incoming stream
    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      setParticipants(prev => {
        const updated = new Map(prev);
        const existing = updated.get(targetId) || {
          userId: 0,
          username: "",
          socketId: targetId,
          isAudioEnabled: true,
          isVideoEnabled: true
        };
        existing.stream = remoteStream;
        updated.set(targetId, existing);
        return updated;
      });
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit("call:signal", {
          roomId,
          signal: { type: "ice-candidate", candidate: event.candidate },
          targetId
        });
      }
    };

    peerConnections.current.set(targetId, pc);
    return pc;
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const startScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      });

      const screenTrack = screenStream.getVideoTracks()[0];
      
      // Replace video track in all peer connections
      peerConnections.current.forEach(pc => {
        const sender = pc.getSenders().find(
          s => s.track && s.track.kind === "video"
        );
        if (sender) {
          sender.replaceTrack(screenTrack);
        }
      });

      screenTrack.onended = () => {
        stopScreenShare();
      };

      setIsScreenSharing(true);
    } catch (error) {
      console.error("Failed to share screen:", error);
      toast({
        title: "Screen Share Error",
        description: "Failed to start screen sharing",
        variant: "destructive"
      });
    }
  };

  const stopScreenShare = async () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      
      // Replace screen track with camera track
      peerConnections.current.forEach(pc => {
        const sender = pc.getSenders().find(
          s => s.track && s.track.kind === "video"
        );
        if (sender && videoTrack) {
          sender.replaceTrack(videoTrack);
        }
      });
    }
    setIsScreenSharing(false);
  };

  const leaveCall = () => {
    cleanup();
    if (onLeave) {
      onLeave();
    }
  };

  const cleanup = () => {
    // Stop all tracks
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }

    // Close all peer connections
    peerConnections.current.forEach(pc => pc.close());
    peerConnections.current.clear();

    // Leave room
    if (socket) {
      socket.emit("call:leave", { roomId, userId });
    }
  };

  const participantArray = Array.from(participants.values());
  const gridCols = participantArray.length <= 1 ? 1 :
                   participantArray.length <= 4 ? 2 :
                   participantArray.length <= 9 ? 3 : 4;

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 p-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h2 className="text-white font-semibold">Video Call</h2>
          <Badge variant="secondary">
            <Users className="mr-1 h-3 w-3" />
            {participantArray.length + 1}/{maxParticipants}
          </Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setViewMode(viewMode === "grid" ? "speaker" : "grid")}
            className="text-white hover:bg-gray-700"
           
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-gray-700"
           
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-4 overflow-auto">
        <div 
          className={`grid gap-4 h-full ${
            viewMode === "grid" 
              ? `grid-cols-${gridCols}` 
              : "grid-cols-1"
          }`}
        >
          {/* Local Video */}
          <Card className="relative bg-gray-800 overflow-hidden">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 flex items-center space-x-2">
              <Badge className="bg-black/50 text-white">
                You {isHost && "(Host)"}
              </Badge>
              {!isAudioEnabled && <MicOff className="h-4 w-4 text-red-500" />}
              {!isVideoEnabled && <VideoOff className="h-4 w-4 text-red-500" />}
            </div>
          </Card>

          {/* Remote Videos */}
          {participantArray.map(participant => (
            <Card 
              key={participant.socketId} 
              className="relative bg-gray-800 overflow-hidden"
              data-testid={`video-participant-${participant.userId}`}
            >
              {participant.stream ? (
                <VideoStream stream={participant.stream} />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-2">
                      <span className="text-2xl text-white">
                        {participant.username[0]?.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-white">{participant.username}</p>
                  </div>
                </div>
              )}
              <div className="absolute bottom-2 left-2">
                <Badge className="bg-black/50 text-white">
                  {participant.username}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-4">
        <div className="flex justify-center space-x-4">
          <Button
            variant={isAudioEnabled ? "secondary" : "destructive"}
            size="icon"
            onClick={toggleAudio}
            className="rounded-full w-12 h-12"
           
          >
            {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </Button>
          
          <Button
            variant={isVideoEnabled ? "secondary" : "destructive"}
            size="icon"
            onClick={toggleVideo}
            className="rounded-full w-12 h-12"
           
          >
            {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </Button>
          
          <Button
            variant={isScreenSharing ? "default" : "secondary"}
            size="icon"
            onClick={isScreenSharing ? stopScreenShare : startScreenShare}
            className="rounded-full w-12 h-12"
           
          >
            <Share2 className="h-5 w-5" />
          </Button>
          
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full w-12 h-12"
           
          >
            <MessageCircle className="h-5 w-5" />
          </Button>
          
          <Button
            variant="destructive"
            size="icon"
            onClick={leaveCall}
            className="rounded-full w-12 h-12"
           
          >
            <PhoneOff className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Video Stream Component
function VideoStream({ stream }: { stream: MediaStream }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      className="w-full h-full object-cover"
    />
  );
}