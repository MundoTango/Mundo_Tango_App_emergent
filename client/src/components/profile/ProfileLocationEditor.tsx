import React, { useState } from 'react';
import UnifiedLocationPicker from '@/components/universal/UnifiedLocationPicker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MapPin, Save, X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  bio: z.string().optional(),
  location: z.string().min(1, 'Location is required'),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileLocationEditorProps {
  user: any;
  onUpdate?: () => void;
  onCancel?: () => void;
}

export default function ProfileLocationEditor({ user, onUpdate, onCancel }: ProfileLocationEditorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedLocation, setSelectedLocation] = useState<string>(user?.location || '');

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      bio: user?.bio || '',
      location: user?.location || '',
      city: user?.city || '',
      state: user?.state || '',
      country: user?.country || '',
      latitude: user?.latitude || undefined,
      longitude: user?.longitude || undefined,
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: ProfileFormData) =>
      apiRequest(`/api/user/profile`, 'PUT', data),
    onSuccess: () => {
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      onUpdate?.();
    },
    onError: (error: any) => {
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update profile.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const handleLocationChange = (location: string, coordinates?: { lat: number; lng: number }, details?: any) => {
    setSelectedLocation(location);
    form.setValue('location', location);
    
    if (coordinates) {
      form.setValue('latitude', coordinates.lat);
      form.setValue('longitude', coordinates.lng);
    }
    
    if (details) {
      // Extract city, state, country from details if available
      form.setValue('city', details.name || '');
      form.setValue('state', details.address?.split(',')[1]?.trim() || '');
      form.setValue('country', details.address?.split(',').pop()?.trim() || '');
    }
  };

  const clearLocation = () => {
    setSelectedLocation('');
    form.setValue('location', '');
    form.setValue('city', '');
    form.setValue('state', '');
    form.setValue('country', '');
    form.setValue('latitude', undefined);
    form.setValue('longitude', undefined);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Edit Profile & Location
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter first name" {...field} / data-testid="input-element">
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter last name" {...field} / data-testid="input-element">
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Bio Field */}
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell us about yourself..."
                      className="min-h-[100px]"
                      {...field}
                    / data-testid="textarea-min-h-[100px]">
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Unified Location Input */}
            <div className="space-y-4">
              <FormLabel>Location</FormLabel>
              <div className="space-y-3">
                <UnifiedLocationPicker
                  value={selectedLocation}
                  placeholder="Search for your location..."
                  onChange={handleLocationChange}
                  className="w-full"
                  allowManualEntry={true}
                />
                
                {selectedLocation && (
                  <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-800 flex-1">{selectedLocation}</span>
                    <button
                      type="button"
                      onClick={clearLocation}
                      className="text-blue-600 hover:text-blue-800"
                     data-testid="button-text-blue-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              <FormMessage />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={updateProfileMutation.isPending}
                 data-testid="button-element">
                  Cancel
                </Button>
              )}
              
              <Button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="flex items-center gap-2"
               data-testid="button-flex">
                {updateProfileMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}