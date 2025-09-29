import React from 'react';
import { Link } from 'wouter';

/**
 * ESA LIFE CEO 61x21 - Renders text with @mentions converted to clickable profile links
 * Supports multiple formats for backward compatibility:
 * - @[Name](user:id) - New correct format
 * - @(user:id) - Legacy format 1
 * - @(type:user,id:id) - Legacy format 2
 * @param text - The text content to process
 * @returns JSX elements with mentions as clickable links
 */
export const renderWithMentions = (text: string) => {
  if (!text) return null;
  
  const parts: (string | JSX.Element)[] = [];
  let lastIndex = 0;
  
  // Combined regex to match all mention formats
  // Format 1: @[Name](user:id)
  // Format 2: @(user:id)
  // Format 3: @(type:user,id:id)
  const mentionRegex = /@(?:\[([^\]]+)\]\(user:(\d+)\)|\(user:(\d+)\)|\(type:user,id:(\d+)\))/g;
  let match;

  // Find all mentions and split text
  while ((match = mentionRegex.exec(text)) !== null) {
    const [fullMatch] = match;
    const startIndex = match.index;
    
    // Extract name and userId from different format groups
    let name: string;
    let userId: string;
    
    if (match[1] && match[2]) {
      // Format: @[Name](user:id)
      name = match[1];
      userId = match[2];
    } else if (match[3]) {
      // Format: @(user:id)
      name = 'User';
      userId = match[3];
    } else if (match[4]) {
      // Format: @(type:user,id:id)
      name = 'User';
      userId = match[4];
    } else {
      continue;
    }

    // Add text before the mention
    if (startIndex > lastIndex) {
      parts.push(text.substring(lastIndex, startIndex));
    }

    // Add the mention as a clickable link
    parts.push(
      <Link
        key={`mention-${userId}-${startIndex}`}
        href={`/profile/${userId}`}
        className="text-blue-600 hover:text-blue-700 font-medium bg-blue-50 px-1 py-0.5 rounded hover:bg-blue-100 transition-colors inline-block"
        data-user-id={userId}
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