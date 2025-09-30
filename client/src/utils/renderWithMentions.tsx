import React from 'react';
import { Link } from 'wouter';
import { MapPin } from 'lucide-react';

/**
 * ESA LIFE CEO 61x21 - Renders text with @mentions converted to clickable links
 * Supports users, events, groups, and cities with multiple legacy formats:
 * - @[Name](user:id) - User mention format
 * - @[Event Name](event:id) - Event mention format
 * - @[Group Name](group:id) - Professional group mention format
 * - @[City Name](city:id) - City group mention format
 * - @(user:id) - Legacy user format 1
 * - @(type:user,id:id) - Legacy user format 2
 * @param text - The text content to process
 * @returns JSX elements with mentions as clickable links
 */
export const renderWithMentions = (text: string) => {
  if (!text) return null;
  
  const parts: (string | JSX.Element)[] = [];
  let lastIndex = 0;
  
  // Combined regex to match all mention formats (supports numeric and UUID IDs)
  // Format 1: @[Name](type:id) - Canonical format for all types
  // Format 2: @(type:id) - Legacy format without display name
  // Format 3: @(type:type,id:id) - Legacy format with explicit type
  const mentionRegex = /@(?:\[([^\]]+)\]\((user|event|group|city):([^\)]+)\)|\((user|event|group|city):([^\)]+)\)|\(type:(user|event|group|city),id:([^\)]+)\))/g;
  let match;

  // Find all mentions and split text
  while ((match = mentionRegex.exec(text)) !== null) {
    const [fullMatch] = match;
    const startIndex = match.index;
    
    // Extract name, type, and id from different format groups
    let name: string;
    let type: 'user' | 'event' | 'group' | 'city';
    let id: string;
    
    if (match[1] && match[2] && match[3]) {
      // Format: @[Name](type:id) - Canonical with display name
      name = match[1];
      type = match[2] as 'user' | 'event' | 'group' | 'city';
      id = match[3];
    } else if (match[4] && match[5]) {
      // Format: @(type:id) - Legacy without display name
      name = match[4].charAt(0).toUpperCase() + match[4].slice(1); // Capitalize type as fallback
      type = match[4] as 'user' | 'event' | 'group' | 'city';
      id = match[5];
    } else if (match[6] && match[7]) {
      // Format: @(type:type,id:id) - Legacy with explicit type
      name = match[6].charAt(0).toUpperCase() + match[6].slice(1); // Capitalize type as fallback
      type = match[6] as 'user' | 'event' | 'group' | 'city';
      id = match[7];
    } else {
      continue;
    }

    // Add text before the mention
    if (startIndex > lastIndex) {
      parts.push(text.substring(lastIndex, startIndex));
    }

    // Determine link and styling based on type
    // Add URL parameters to indicate post filtering should be shown
    let href: string;
    let className: string;

    switch(type) {
      case 'user':
        href = `/profile/${id}`;
        className = 'text-blue-600 hover:text-blue-700 font-medium bg-blue-50 px-1 py-0.5 rounded hover:bg-blue-100 transition-colors inline-block';
        break;
      case 'event':
        href = `/events/${id}?tab=posts&filter=all`; // Show posts tab with filtering options
        className = 'text-green-600 hover:text-green-700 font-medium bg-green-50 px-1 py-0.5 rounded hover:bg-green-100 transition-colors inline-block';
        break;
      case 'group':
        href = `/groups/${id}?tab=posts&filter=all`; // Show posts tab with membership filtering
        className = 'text-purple-600 hover:text-purple-700 font-medium bg-purple-50 px-1 py-0.5 rounded hover:bg-purple-100 transition-colors inline-block';
        break;
      case 'city':
        href = `/groups/${id}?tab=posts&filter=all`; // Show posts tab with residency filtering
        className = 'text-orange-600 hover:text-orange-700 font-medium bg-orange-50 px-1 py-0.5 rounded hover:bg-orange-100 transition-colors inline-block';
        break;
      default:
        href = '#';
        className = 'text-gray-600 hover:text-gray-700 font-medium bg-gray-50 px-1 py-0.5 rounded hover:bg-gray-100 transition-colors inline-block';
    }

    // Add the mention as a clickable link with MapPin icon for cities
    parts.push(
      <Link
        key={`mention-${type}-${id}-${startIndex}`}
        href={href}
        className={className}
        data-mention-type={type}
        data-mention-id={id}
      >
        {type === 'city' && <MapPin className="inline-block w-3 h-3 mr-0.5" />}
        @{name}
      </Link>
    );

    lastIndex = startIndex + fullMatch.length;
  }

  // Add remaining text after last mention
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  // If no mentions found, return original text
  if (parts.length === 0) {
    return text;
  }

  return <>{parts}</>;
};