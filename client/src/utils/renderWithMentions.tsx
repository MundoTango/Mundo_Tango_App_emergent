import React from 'react';
import { Link } from 'wouter';

/**
 * ESA LIFE CEO 61x21 - Renders text with @mentions converted to clickable profile links
 * @param text - The text content to process (supports @[Name](user:id) format)
 * @returns JSX elements with mentions as clickable links
 */
export const renderWithMentions = (text: string) => {
  if (!text) return null;
  
  // Updated regex to match @[Name](user:id) format
  const mentionRegex = /@\[([^\]]+)\]\(user:(\d+)\)/g;
  const parts: (string | JSX.Element)[] = [];
  let lastIndex = 0;
  let match;

  // Find all mentions and split text
  while ((match = mentionRegex.exec(text)) !== null) {
    const [fullMatch, name, userId] = match;
    const startIndex = match.index;

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