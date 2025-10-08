
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Clock, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { LocationAutocomplete } from '@/components/ui/LocationAutocomplete';
import { createApiRequest } from '@/lib/apiClient';
import { useCsrfToken } from '@/contexts/CsrfContext';
import { toast } from '@/hooks/use-toast';

const eventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endDate: z.string().optional(),
  endTime: z.string().optional(),
  location: z.string().min(1, 'Location is required'),
  maxAttendees: z.number().min(1).optional(),
  visibility: z.enum(['public', 'private', 'group']),
  tags: z.array(z.string()).default([]),
  imageUrl: z.string().url().optional().or(z.literal('')),
  recurringPattern: z.object({
    frequency: z.enum(['none', 'daily', 'weekly', 'monthly']),
    interval: z.number().min(1).default(1),
    endDate: z.string().optional(),
  }).optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

interface EventCreationWizardProps {
  onComplete: (eventData: any) => void;
  onCancel: () => void;
}

const steps = [
  { id: 'basic', title: 'Basic Info', icon: Calendar },
  { id: 'details', title: 'Details', icon: MapPin },
  { id: 'settings', title: 'Settings', icon: Users },
  { id: 'recurring', title: 'Recurring', icon: Clock },
];

export const EventCreationWizard: React.FC<EventCreationWizardProps> = ({
  onComplete,
  onCancel
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { csrfToken } = useCsrfToken();
  const api = createApiRequest(csrfToken);

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      visibility: 'public',
      tags: [],
      recurringPattern: {
        frequency: 'none',
        interval: 1,
      },
    },
  });

  const { register, handleSubmit, watch, setValue, formState: { errors } } = form;
  const watchedFields = watch();

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: EventFormData) => {
    setIsSubmitting(true);
    
    try {
      // Combine date and time
      const startDateTime = new Date(`${data.startDate}T${data.startTime}`);
      const endDateTime = data.endDate && data.endTime 
        ? new Date(`${data.endDate}T${data.endTime}`)
        : undefined;

      const eventData = {
        ...data,
        startDate: startDateTime.toISOString(),
        endDate: endDateTime?.toISOString(),
        recurringPattern: data.recurringPattern?.frequency === 'none' 
          ? undefined 
          : data.recurringPattern,
      };

      const response = await api.post('/api/events', eventData);
      
      if (response.success) {
        toast({
          title: 'Event Created',
          description: 'Your event has been created successfully!',
        });
        onComplete(response.data);
      } else {
        throw new Error(response.error || 'Failed to create event');
      }
    } catch (error) {
      console.error('Event creation error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create event',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = (tag: string) => {
    if (tag && !watchedFields.tags.includes(tag)) {
      setValue('tags', [...watchedFields.tags, tag]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setValue('tags', watchedFields.tags.filter(tag => tag !== tagToRemove));
  };

  const renderBasicInfo = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">Event Title *</Label>
        <Input
          id="title"
          {...register('title')}
          placeholder="Amazing Tango Milonga"
          className="bg-white/50 border-white/30 dark:bg-neutral-900"
        />
        {errors.title && (
          <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Join us for an incredible evening of tango..."
          rows={4}
          className="bg-white/50 border-white/30 dark:bg-neutral-900"
        />
      </div>

      <div>
        <Label htmlFor="imageUrl">Event Image URL</Label>
        <Input
          id="imageUrl"
          type="url"
          {...register('imageUrl')}
          placeholder="https://example.com/event-image.jpg"
          className="bg-white/50 border-white/30 dark:bg-neutral-900"
        />
      </div>
    </div>
  );

  const renderDetails = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate">Start Date *</Label>
          <Input
            id="startDate"
            type="date"
            {...register('startDate')}
            className="bg-white/50 border-white/30 dark:bg-neutral-900"
          />
          {errors.startDate && (
            <p className="text-sm text-red-600 mt-1">{errors.startDate.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="startTime">Start Time *</Label>
          <Input
            id="startTime"
            type="time"
            {...register('startTime')}
            className="bg-white/50 border-white/30 dark:bg-neutral-900"
          />
          {errors.startTime && (
            <p className="text-sm text-red-600 mt-1">{errors.startTime.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            type="date"
            {...register('endDate')}
            className="bg-white/50 border-white/30 dark:bg-neutral-900"
          />
        </div>
        <div>
          <Label htmlFor="endTime">End Time</Label>
          <Input
            id="endTime"
            type="time"
            {...register('endTime')}
            className="bg-white/50 border-white/30 dark:bg-neutral-900"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="location">Location *</Label>
        <LocationAutocomplete
          value={watchedFields.location || ''}
          onChange={(value) => setValue('location', value)}
          placeholder="Enter venue or address..."
        />
        {errors.location && (
          <p className="text-sm text-red-600 mt-1">{errors.location.message}</p>
        )}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="maxAttendees">Maximum Attendees</Label>
        <Input
          id="maxAttendees"
          type="number"
          min="1"
          {...register('maxAttendees', { valueAsNumber: true })}
          placeholder="Leave empty for unlimited"
          className="bg-white/50 border-white/30 dark:bg-neutral-900"
        />
      </div>

      <div>
        <Label htmlFor="visibility">Visibility</Label>
        <Select
          value={watchedFields.visibility}
          onValueChange={(value: 'public' | 'private' | 'group')> setValue('visibility', value)}
        >
          <SelectTrigger className="bg-white/50 border-white/30 dark:bg-neutral-900">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="public">Public - Anyone can see and join</SelectItem>
            <SelectItem value="private">Private - Invite only</SelectItem>
            <SelectItem value="group">Group - Visible to group members</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Tags</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {watchedFields.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
              {tag} ×
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          {['milonga', 'practica', 'class', 'workshop', 'social'].map((tag) => (
            <Button
              key={tag}
              type="button"
              variant="outline"
              size="sm"
              onClick={()  => addTag(tag)}
              className="bg-white/50 border-white/30 dark:bg-neutral-900"
            >
              + {tag}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderRecurring = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="frequency">Recurring Pattern</Label>
        <Select
          value={watchedFields.recurringPattern?.frequency || 'none'}
          onValueChange={(value)> setValue('recurringPattern.frequency', value as any)}
        >
          <SelectTrigger className="bg-white/50 border-white/30 dark:bg-neutral-900">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No Repetition</SelectItem>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {watchedFields.recurringPattern?.frequency !== 'none' && (
        <>
          <div>
            <Label htmlFor="interval">Repeat Every</Label>
            <div className="flex items-center gap-2">
              <Input
                id="interval"
                type="number"
                min="1"
                {...register('recurringPattern.interval', { valueAsNumber: true })}
                className="w-20 bg-white/50 border-white/30 dark:bg-neutral-900"
              />
              <span className="text-sm text-gray-600 dark:text-neutral-600 dark:text-neutral-400">
                {watchedFields.recurringPattern?.frequency === 'daily' ? 'days' :
                 watchedFields.recurringPattern?.frequency === 'weekly' ? 'weeks' :
                 watchedFields.recurringPattern?.frequency === 'monthly' ? 'months' : ''}
              </span>
            </div>
          </div>

          <div>
            <Label htmlFor="endDate">Recurring End Date</Label>
            <Input
              id="endDate"
              type="date"
              {...register('recurringPattern.endDate')}
              className="bg-white/50 border-white/30 dark:bg-neutral-900"
            />
          </div>
        </>
      )}
    </div>
  );

  const currentStepData = steps[currentStep];
  const StepIcon = currentStepData.icon;

  return (
    <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-white/90 via-white/80 to-turquoise-50/30 backdrop-blur-xl border border-white/20 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <StepIcon className="h-6 w-6 text-turquoise-500" />
          Create Event - {currentStepData.title}
        </CardTitle>
        
        {/* Progress Steps */}
        <div className="flex items-center gap-2 mt-4">
          {steps.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            const StepIconComponent = step.icon;

            return (
              <div
                key={step.id}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  isActive 
                    ? 'bg-turquoise-100 text-turquoise-700' 
                    : isCompleted 
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                }`}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <StepIconComponent className="h-4 w-4" />
                )}
                <span className="text-sm font-medium hidden sm:inline">
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          {currentStep === 0 && renderBasicInfo()}
          {currentStep === 1 && renderDetails()}
          {currentStep === 2 && renderSettings()}
          {currentStep === 3 && renderRecurring()}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t border-gray-200/50 dark:border-neutral-700">
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="bg-white/50 border-white/30 dark:bg-neutral-900"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
              )}
              
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="bg-white/50 border-white/30 dark:bg-neutral-900"
              >
                Cancel
              </Button>
            </div>

            <div>
              {currentStep < steps.length - 1 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="bg-gradient-to-r from-turquoise-500 to-cyan-600 hover:from-turquoise-600 hover:to-cyan-700"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-turquoise-500 to-cyan-600 hover:from-turquoise-600 hover:to-cyan-700"
                >
                  {isSubmitting ? 'Creating...' : 'Create Event'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </form>
    </Card>
  );
};

export default EventCreationWizard;
