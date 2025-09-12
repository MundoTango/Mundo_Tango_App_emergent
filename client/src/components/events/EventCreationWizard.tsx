
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Calendar, MapPin, Users, Clock, Plus, X } from 'lucide-react';
import { format } from 'date-fns';

interface EventCreationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (eventData: EventFormData) => Promise<void>;
}

interface EventFormData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  maxAttendees?: number;
  imageUrl?: string;
  tags: string[];
  visibility: 'public' | 'private' | 'group';
  isRecurring: boolean;
  recurringPattern?: {
    frequency: 'weekly' | 'monthly';
    interval: number;
    dayOfWeek?: string;
    endDate?: string;
  };
}

export const EventCreationWizard: React.FC<EventCreationWizardProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTag, setNewTag] = useState('');
  
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    maxAttendees: undefined,
    imageUrl: '',
    tags: [],
    visibility: 'public',
    isRecurring: false,
    recurringPattern: undefined
  });

  const resetForm = () => {
    setCurrentStep(1);
    setFormData({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      location: '',
      maxAttendees: undefined,
      imageUrl: '',
      tags: [],
      visibility: 'public',
      isRecurring: false,
      recurringPattern: undefined
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      handleClose();
    } catch (error) {
      console.error('Error creating event:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.title.trim() !== '' && formData.startDate !== '';
      case 2:
        return formData.location.trim() !== '';
      case 3:
        return true;
      default:
        return false;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-md border border-white/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
            Create New Event
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Indicator */}
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`flex-1 h-2 rounded-full transition-colors ${
                  currentStep >= step 
                    ? 'bg-gradient-to-r from-teal-400 to-cyan-400' 
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <Card className="bg-white/50 backdrop-blur-sm border border-white/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-teal-600" />
                  Event Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Monday Night Milonga"
                    className="bg-white/70"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Tell people about your event..."
                    rows={3}
                    className="bg-white/70"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date & Time *</Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      className="bg-white/70"
                    />
                  </div>

                  <div>
                    <Label htmlFor="endDate">End Date & Time</Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      className="bg-white/70"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Location & Capacity */}
          {currentStep === 2 && (
            <Card className="bg-white/50 backdrop-blur-sm border border-white/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-teal-600" />
                  Location & Capacity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g., Tango Studio, 123 Dance St, Buenos Aires"
                    className="bg-white/70"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Note: Location autocomplete is being updated. Please enter full address.
                  </p>
                </div>

                <div>
                  <Label htmlFor="maxAttendees">Maximum Attendees</Label>
                  <Input
                    id="maxAttendees"
                    type="number"
                    value={formData.maxAttendees || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      maxAttendees: e.target.value ? parseInt(e.target.value) : undefined 
                    }))}
                    placeholder="Leave empty for unlimited"
                    className="bg-white/70"
                  />
                </div>

                <div>
                  <Label htmlFor="imageUrl">Event Image URL</Label>
                  <Input
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="https://example.com/event-image.jpg"
                    className="bg-white/70"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Tags & Settings */}
          {currentStep === 3 && (
            <Card className="bg-white/50 backdrop-blur-sm border border-white/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-teal-600" />
                  Tags & Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Event Tags</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag..."
                      className="bg-white/70"
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    />
                    <Button onClick={addTag} size="sm" type="button">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="bg-teal-100 text-teal-700">
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="recurring">Recurring Event</Label>
                  <Switch
                    id="recurring"
                    checked={formData.isRecurring}
                    onCheckedChange={(checked) => setFormData(prev => ({ 
                      ...prev, 
                      isRecurring: checked,
                      recurringPattern: checked ? {
                        frequency: 'weekly',
                        interval: 1
                      } : undefined
                    }))}
                  />
                </div>

                {formData.isRecurring && (
                  <div className="grid grid-cols-2 gap-4 p-4 bg-teal-50 rounded-lg">
                    <div>
                      <Label>Frequency</Label>
                      <select
                        value={formData.recurringPattern?.frequency || 'weekly'}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          recurringPattern: {
                            ...prev.recurringPattern!,
                            frequency: e.target.value as 'weekly' | 'monthly'
                          }
                        }))}
                        className="w-full p-2 rounded border bg-white"
                      >
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                    <div>
                      <Label>Interval</Label>
                      <Input
                        type="number"
                        min="1"
                        value={formData.recurringPattern?.interval || 1}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          recurringPattern: {
                            ...prev.recurringPattern!,
                            interval: parseInt(e.target.value)
                          }
                        }))}
                        className="bg-white"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              onClick={prevStep}
              variant="outline"
              disabled={currentStep === 1}
              className="bg-white/50"
            >
              Previous
            </Button>

            <div className="flex gap-2">
              <Button onClick={handleClose} variant="outline" className="bg-white/50">
                Cancel
              </Button>
              
              {currentStep < 3 ? (
                <Button
                  onClick={nextStep}
                  disabled={!isStepValid()}
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                  {isSubmitting ? 'Creating...' : 'Create Event'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
