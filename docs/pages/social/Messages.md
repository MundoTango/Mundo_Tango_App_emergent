# Messages Page Documentation

## 1. Overview
- **Route**: `/messages`
- **Purpose**: Real-time messaging platform for private conversations between users
- **ESA Framework Layer**: Layer 3 - Communication

## 2. Technical Implementation

### Components
- `client/src/pages/Messages.tsx` - Main messaging interface
- `ConversationList` - Chat list sidebar
- `MessageThread` - Message display area
- `MessageInput` - Compose interface
- `TypingIndicator` - Real-time typing status
- `MessageSearch` - Search messages
- `MediaAttachments` - Photo/file sharing
- `VoiceMessages` - Audio recording

### API Endpoints
- `GET /api/messages` - List conversations
- `GET /api/messages/:userId` - Get thread
- `POST /api/messages/send` - Send message
- `PUT /api/messages/read` - Mark as read
- `DELETE /api/messages/:id` - Delete message
- `POST /api/messages/attachment` - Upload media
- `GET /api/messages/search` - Search messages

### Real-time Features
- WebSocket real-time messaging
- Live typing indicators
- Read receipts
- Online status
- Push notifications
- Message reactions

### Database Tables
- `messages` - Message content
- `conversations` - Chat threads
- `message_attachments` - Media files
- `message_reactions` - Emoji reactions
- `read_receipts` - Read status
- `typing_status` - Typing indicators

## 3. User Permissions
- **User**: Send/receive messages
- **Premium**: Unlimited storage
- **Verified**: Priority delivery
- **Blocked**: No messaging
- **Admin**: Message moderation

## 4. MT Ocean Theme Implementation
```css
/* Messages container gradient */
.messages-container {
  background: linear-gradient(180deg, #5EEAD4 0%, #14B8A6 20%, #0D9488 50%, #155E75 100%);
  height: 100vh;
}

/* Conversation sidebar */
.conversation-sidebar {
  background: rgba(255, 255, 255, 0.95);
  border-right: 2px solid rgba(94, 234, 212, 0.3);
}

/* Active conversation */
.conversation-item.active {
  background: linear-gradient(90deg, rgba(94, 234, 212, 0.2), transparent);
  border-left: 4px solid #5EEAD4;
}

/* Message bubbles */
.message-bubble.sent {
  background: linear-gradient(135deg, #14B8A6, #0D9488);
  color: white;
  border-radius: 18px 18px 4px 18px;
}

.message-bubble.received {
  background: rgba(94, 234, 212, 0.1);
  border: 1px solid #5EEAD4;
  color: #155E75;
  border-radius: 18px 18px 18px 4px;
}

/* Typing indicator */
.typing-indicator {
  background: rgba(94, 234, 212, 0.2);
  padding: 8px 12px;
  border-radius: 20px;
}
```

## 5. Test Coverage
- **Unit Tests**: 82% coverage
- **Integration Tests**: Message flow
- **E2E Tests**: Full conversation
- **WebSocket Tests**: Real-time features
- **Performance Tests**: Large threads

## 6. Known Issues
- WebSocket reconnection handling
- Large file upload timeout
- Message search indexing delay
- Notification delivery on iOS

## 7. Agent Responsibilities
- **Messaging Agent**: Message delivery
- **Real-time Agent**: WebSocket management
- **Media Agent**: File handling
- **Notification Agent**: Alert delivery
- **Security Agent**: Encryption

## 8. Integration Points
- **WebSocket Server**: Real-time messaging
- **Push Service**: Notifications
- **Media Service**: File storage
- **Encryption Service**: E2E encryption
- **Search Service**: Message indexing
- **Analytics Service**: Usage metrics

## 9. Performance Metrics
- **Message Send**: < 200ms
- **Thread Load**: < 1 second
- **Search Response**: < 500ms
- **File Upload**: < 5 seconds
- **WebSocket Latency**: < 100ms
- **Memory Usage**: < 150MB

## 10. Accessibility
- **Screen Reader**: Message narration
- **Keyboard Navigation**: Full support
- **Voice Input**: Dictation support
- **Visual Indicators**: Status cues
- **Font Scaling**: Adjustable size
- **High Contrast**: Mode available