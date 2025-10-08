"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  ImageIcon, 
  MapPin, 
  Star, 
  ChevronDown, 
  Globe, 
  Smile,
  Users,
  Lock
} from "lucide-react";

interface WhatsOnYourMindProps {
  visibility: string;
  setVisibility: (visibility: string) => void;
  onCreatePost: (type?: string) => void;
}

const WhatsOnYourMind = ({ visibility, setVisibility, onCreatePost }: WhatsOnYourMindProps) => {
  const { user } = useAuth();
  
  const { control, formState: { errors } } = useForm({
    mode: "onChange",
    defaultValues: {
      mindDescription: "",
    },
  });

  const visibilityOptions = [
    { value: "Public", icon: Globe, label: "Public" },
    { value: "Friend", icon: Users, label: "Friends" },
    { value: "Private", icon: Lock, label: "Private" }
  ];

  const getVisibilityIcon = (type: string) => {
    const option = visibilityOptions.find(opt => opt.value === type);
    return option ? option.icon : Globe;
  };

  const VisibilityIcon = getVisibilityIcon(visibility);

  return (
    <div className="space-y-4">
      {/* Header with filter */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-neutral-100">New Feeds</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="bg-red-600 text-white hover:bg-red-700 border-red-600" data-testid="button-bg-red-600">
              {visibility || "ALL"}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {visibilityOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => setVisibility(option.value)}
                className="flex items-center gap-2"
              >
                <option.icon className="h-4 w-4" />
                {option.label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem onClick={() => setVisibility("All")}>
              <Globe className="h-4 w-4 mr-2" />
              All
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Post creation card */}
      <Card className="bg-white shadow-sm dark:bg-neutral-900">
        <CardContent className="p-6">
          {/* User info and visibility */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3 cursor-pointer">
              <Avatar className="h-10 w-10" data-testid="link-h-10">
                <AvatarImage 
                  src={user?.profileImage || "/images/user-placeholder.jpeg"} 
                  className="object-cover"
                / data-testid="link-object-cover">
                <AvatarFallback className="bg-red-600 text-white" data-testid="link-bg-red-600">
                  {user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-sm font-semibold text-gray-900 dark:text-neutral-100">{user?.name}</div>
                <div className="text-sm text-gray-500">@{user?.username}</div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() = data-testid="button-element"> onCreatePost()}
              className="flex items-center gap-2 text-gray-700 dark:text-neutral-300"
            >
              <VisibilityIcon className="h-4 w-4" />
              <span className="font-semibold">Public</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>

          {/* Text input */}
          <div className="relative mb-6">
            <Input
              placeholder="What's on your mind?"
              className="w-full py-3 pl-4 pr-12 border-gray-200 rounded-lg focus:border-red-500 focus:ring-red-500 dark:border-neutral-700"
              onClick={() = data-testid="input-w-full"> onCreatePost()}
              readOnly
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1"
              onClick={() = data-testid="button-absolute"> onCreatePost()}
            >
              <Smile className="h-5 w-5 text-gray-400" />
            </Button>
          </div>

          <hr className="my-4 border-gray-200 dark:border-neutral-700" />

          {/* Action buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 dark:text-neutral-200"
                onClick={() = data-testid="button-flex"> onCreatePost("LOCATION")}
              >
                <MapPin className="h-4 w-4" />
                Location
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 dark:text-neutral-200"
                onClick={() = data-testid="button-flex"> onCreatePost("MEDIA")}
              >
                <ImageIcon className="h-4 w-4" />
                Image/Video
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 dark:text-neutral-200"
                onClick={() = data-testid="button-flex"> onCreatePost("ACTIVITY")}
              >
                <Star className="h-4 w-4" />
                Activity
              </Button>
            </div>
            <Button
              onClick={() = data-testid="button-element"> onCreatePost()}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-2 rounded-lg font-semibold"
            >
              Post
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WhatsOnYourMind;