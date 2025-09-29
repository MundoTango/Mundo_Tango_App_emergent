import React from 'react';
import { Link } from 'wouter';

/**
 * ESA LIFE CEO 61x21 - Renders text with @mentions converted to clickable links
 * Supports users and events with multiple legacy formats for backward compatibility:
 * - @[Name](user:id) - User mention format
 * - @[Event Name](event:id) - Event mention format
 * - @(user:id) - Legacy user format 1
 * - @(type:user,id:id) - Legacy user format 2
 * @param text - The text content to process
 * @returns JSX elements with mentions as clickable links
 */
export const renderWithMentions = (text: string) => {
  if (!text) return null;
  
  const parts: (string | JSX.Element)[] = [];
  let lastIndex = 0;
  
  // Combined regex to match all mention formats
  // Format 1: @[Name](user:id) - User mention
  // Format 2: @[Name](event:id) - Event mention
  // Format 3: @(user:id) - Legacy user
  // Format 4: @(type:user,id:id) - Legacy user
  const mentionRegex = /@(?:\[([^\]]+)\]\((user|event):(\d+)\)|\(user:(\d+)\)|\(type:user,id:(\d+)\))/g;
  let match;

  // Find all mentions and split text
  while ((match = mentionRegex.exec(text)) !== null) {
    const [fullMatch] = match;
    const startIndex = match.index;
    
    // Extract name, type, and id from different format groups
    let name: string;
    let type: 'user' | 'event';
    let id: string;
    
    if (match[1] && match[2] && match[3]) {
      // Format: @[Name](user:id) or @[Name](event:id)
      name = match[1];
      type = match[2] as 'user' | 'event';
      id = match[3];
    } else if (match[4]) {
      // Format: @(user:id)
      name = 'User';
      type = 'user';
      id = match[4];
    } else if (match[5]) {
      // Format: @(type:user,id:id)
      name = 'User';
      type = 'user';
      id = match[5];
    } else {
      continue;
    }

    // Add text before the mention
    if (startIndex > lastIndex) {
      parts.push(text.substring(lastIndex, startIndex));
    }

    // Determine link and styling based on type
    const href = type === 'event' ? `/events/${id}` : `/profile/${id}`;
    const className = type === 'event'
      ? 'text-green-600 hover:text-green-700 font-medium bg-green-50 px-1 py-0.5 rounded hover:bg-green-100 transition-colors inline-block'
      : 'text-blue-600 hover:text-blue-700 font-medium bg-blue-50 px-1 py-0.5 rounded hover:bg-blue-100 transition-colors inline-block';

    // Add the mention as a clickable link
    parts.push(
      <Link
        key={`mention-${type}-${id}-${startIndex}`}
        href={href}
        className={className}
        data-mention-type={type}
        data-mention-id={id}
      >
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