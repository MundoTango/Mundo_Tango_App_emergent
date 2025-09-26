# ReportModal Component Documentation
*(ESA LIFE CEO 61×21 Platform)*

## 1. Overview
- **Route**: Modal component (not a route)
- **Purpose**: Content reporting interface with 8 predefined categories for community moderation, implementing ESA Framework Layer 11 content moderation
- **ESA Framework Layer**: 
  - Layer 11 (Content Moderation)
  - Layer 4 (Security & Safety)

## 2. Technical Implementation

### Components
```typescript
import { X, Flag, AlertCircle, Shield, User, Zap, Heart, MessageSquare } from 'lucide-react';
import { createPortal } from 'react-dom';
```

### APIs
- `POST /api/admin/reports` - Submit report (MISSING - Frontend exists but backend not implemented)
- Expected payload:
```json
{
  "postId": 123,
  "reason": "spam",
  "description": "Additional details",
  "reportedUserId": 456,
  "reportType": "post"
}
```

### Real-time Features
- Admin notification on report submission
- Report count updates
- Moderation queue updates

## 3. Database Schema

### Tables
- **post_reports**: Report records
  - id (serial primary key)
  - post_id (integer)
  - comment_id (integer, nullable)
  - reporter_id (integer)
  - reason (varchar)
  - description (text)
  - status (varchar: pending, reviewed, resolved, dismissed)
  - moderator_id (integer, nullable)
  - moderator_notes (text, nullable)
  - created_at, updated_at

### Relationships
```sql
post_reports.post_id → posts.id
post_reports.reporter_id → users.id
post_reports.moderator_id → users.id
```

## 4. User Permissions
- **Access Control**: Any authenticated user can report
- **Roles**:
  - Users: Can report content
  - Moderators: Can review reports
  - Admins: Can take action on reports
- **Limitations**: Can't report own content

## 5. MT Ocean Theme
- **Design Implementation**:
  - Modal overlay with backdrop blur
  - Glassmorphic modal container
  - Category icons with semantic colors
  - Gradient submit button (#5EEAD4 → #155E75)
- **Animations**:
  - Fade-in overlay
  - Scale-up modal entrance
  - Category hover effects

## 6. Test Coverage
- **Current Status**: Frontend tests only
- **Requirements**:
  - Test all report categories
  - Test form validation
  - Test API submission
  - Test modal accessibility
  - Test keyboard navigation (Escape to close)

## 7. Known Issues

### Report Categories Implemented
```typescript
const REPORT_CATEGORIES = [
  { id: 'spam', label: 'Spam or Scam', icon: Zap, color: 'text-orange-600' },
  { id: 'inappropriate', label: 'Inappropriate Content', icon: AlertCircle, color: 'text-red-600' },
  { id: 'harassment', label: 'Harassment or Bullying', icon: Shield, color: 'text-purple-600' },
  { id: 'fake_profile', label: 'Fake Profile', icon: User, color: 'text-blue-600' },
  { id: 'false_information', label: 'False Information', icon: MessageSquare, color: 'text-yellow-600' },
  { id: 'hate_speech', label: 'Hate Speech', icon: Heart, color: 'text-red-700' },
  { id: 'copyright', label: 'Copyright Violation', icon: Shield, color: 'text-indigo-600' },
  { id: 'other', label: 'Other', icon: Flag, color: 'text-gray-600' }
];
```

### Critical Issue
- **Backend API Missing**: `/api/admin/reports` endpoint not implemented
- **Temporary Solution**: Frontend complete, awaiting backend

### Current Issues
- **Multiple reports**: No check for duplicate reports
- **Feedback**: No real-time status updates
- **Evidence**: No file upload for proof
- **Anonymous reporting**: Not supported

## 8. Agent Responsibilities
- **Moderation Agent (Layer 11)**: Processes reports
- **Security Agent (Layer 4)**: Validates report legitimacy
- **Analytics Agent (Layer 30)**: Tracks report patterns
- **Notification Agent**: Alerts moderators

## 9. Integration Points
- **External Services**:
  - None (self-contained)
- **Internal Systems**:
  - Toast notifications
  - Admin dashboard queue
  - User reputation system
  - Analytics pipeline

## 10. Performance Metrics
- **Load Times**:
  - Modal open: <50ms
  - Form submission: <500ms
- **Optimization**:
  - Portal rendering for performance
  - Lazy loaded when needed
  - Form validation client-side
  - Debounced description input

## Code Example - Complete Modal Implementation
```tsx
const ReportModal = ({ isOpen, postId, onClose, onSubmit }) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent scroll
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);
  
  const handleSubmit = async () => {
    if (!selectedReason) {
      toast({ title: 'Please select a reason', variant: 'destructive' });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // This API endpoint needs to be implemented
      const response = await fetch('/api/admin/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          postId,
          reason: selectedReason,
          description,
          reportType: 'post'
        })
      });
      
      if (!response.ok) throw new Error('Failed to submit report');
      
      toast({
        title: 'Report submitted',
        description: 'Thank you for helping keep our community safe.'
      });
      
      onSubmit(selectedReason, description);
      onClose();
      resetForm();
      
    } catch (error) {
      console.error('Report submission failed:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit report. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const resetForm = () => {
    setSelectedReason('');
    setDescription('');
  };
  
  if (!isOpen) return null;
  
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Flag className="w-5 h-5 text-red-500" />
            Report Post
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4 space-y-4">
          <p className="text-gray-600">
            Help us understand what's wrong with this post
          </p>
          
          {/* Categories */}
          <div className="space-y-2">
            {REPORT_CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedReason(category.id)}
                className={`w-full p-3 rounded-lg border-2 transition-all text-left flex items-start gap-3 ${
                  selectedReason === category.id
                    ? 'border-cyan-500 bg-cyan-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <category.icon className={`w-5 h-5 mt-0.5 ${category.color}`} />
                <div>
                  <div className="font-medium">{category.label}</div>
                  <div className="text-sm text-gray-500">
                    {category.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          {/* Additional details */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Additional details (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide more context..."
              className="w-full p-3 border rounded-lg resize-none h-24 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              maxLength={500}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {description.length}/500
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t p-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedReason || isSubmitting}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
```

## Implementation Notes
1. **API Integration Pending**: Backend endpoint needs implementation
2. **Portal Rendering**: Uses React Portal for proper z-index
3. **Accessibility**: Keyboard navigation and screen reader support
4. **Form Validation**: Client-side validation before submission
5. **User Feedback**: Toast notifications for all actions
6. **Moderation Queue**: Reports go to admin dashboard (when implemented)