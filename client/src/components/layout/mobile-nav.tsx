// LAYER 47 - Mobile Optimization Agent: Enhanced Responsive Navigation
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Calendar, 
  Plus, 
  MessageCircle, 
  User,
  Users,
  Heart,
  Image as ImageIcon 
} from "lucide-react";
import { Link, useLocation } from "wouter";

interface MobileNavProps {
  onOpenChat: () => void;
}

export default function MobileNav({ onOpenChat }: MobileNavProps) {
  const [location] = useLocation();
  
  // LAYER 47 - Ensure 44x44px min tap targets for accessibility
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 z-40 shadow-2xl">
      <div className="grid grid-cols-5 gap-1">
        <Link href="/memories">
          <Button 
            variant="ghost" 
            className={`flex flex-col items-center py-2 px-1 min-h-[44px] min-w-[44px] h-auto ${location === '/memories' ? 'text-[#155E75] bg-gradient-to-r from-[#5EEAD4]/10 to-[#155E75]/10' : 'text-gray-600'}`}
          >
            <Home className="h-6 w-6" />
            <span className="text-xs mt-1 font-medium">Home</span>
          </Button>
        </Link>
        
        <Link href="/events">
          <Button 
            variant="ghost" 
            className={`flex flex-col items-center py-2 px-1 min-h-[44px] min-w-[44px] h-auto ${location === '/events' ? 'text-[#155E75] bg-gradient-to-r from-[#5EEAD4]/10 to-[#155E75]/10' : 'text-gray-600'}`}
          >
            <Calendar className="h-6 w-6" />
            <span className="text-xs mt-1 font-medium">Events</span>
          </Button>
        </Link>
        
        <Link href="/groups">
          <Button 
            variant="ghost" 
            className={`flex flex-col items-center py-2 px-1 min-h-[44px] min-w-[44px] h-auto ${location === '/groups' ? 'text-[#155E75] bg-gradient-to-r from-[#5EEAD4]/10 to-[#155E75]/10' : 'text-gray-600'}`}
          >
            <Users className="h-6 w-6" />
            <span className="text-xs mt-1 font-medium">Groups</span>
          </Button>
        </Link>
        
        <Link href="/messages">
          <Button 
            variant="ghost" 
            className={`flex flex-col items-center py-2 px-1 min-h-[44px] min-w-[44px] relative h-auto ${location === '/messages' ? 'text-[#155E75] bg-gradient-to-r from-[#5EEAD4]/10 to-[#155E75]/10' : 'text-gray-600'}`}
            onClick={onOpenChat}
          >
            <MessageCircle className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 bg-gradient-to-r from-[#5EEAD4] to-[#155E75] text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              3
            </span>
            <span className="text-xs mt-1 font-medium">Messages</span>
          </Button>
        </Link>
        
        <Link href="/profile">
          <Button 
            variant="ghost" 
            className={`flex flex-col items-center py-2 px-1 min-h-[44px] min-w-[44px] h-auto ${location === '/profile' ? 'text-[#155E75] bg-gradient-to-r from-[#5EEAD4]/10 to-[#155E75]/10' : 'text-gray-600'}`}
          >
            <User className="h-6 w-6" />
            <span className="text-xs mt-1 font-medium">Profile</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
