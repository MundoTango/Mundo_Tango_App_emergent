import React, { useState } from 'react';
import { X, Calendar, MapPin, Globe } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { LocationAutocomplete } from '@/components/ui/LocationAutocomplete';
import EventAutocomplete from '@/components/autocomplete/EventAutocomplete';
import CityGroupAutocomplete from '@/components/autocomplete/CityGroupAutocomplete';

interface AddTravelDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TravelDetailForm {
  eventName: string;
  eventType: string;
  city: string;
  country: string;
  startDate: string;
  endDate: string;
  status: 'considering' | 'planned' | 'working' | 'ongoing' | 'completed' | 'cancelled';
  notes: string;
  isPublic: boolean;
}

const eventTypes = [
  { value: 'festival', label: 'Festival' },
  { value: 'marathon', label: 'Marathon' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'conference', label: 'Conference' },
  { value: 'vacation', label: 'Vacation' },
  { value: 'competition', label: 'Competition' },
  { value: 'performance', label: 'Performance' },
  { value: 'other', label: 'Other' }
];

export const AddTravelDetailModal: React.FC<AddTravelDetailModalProps data-testid="link-element"> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<TravelDetailForm>({
    eventName: '',
    eventType: '',
    city: '',
    country: '',
    startDate: '',
    endDate: '',
    status: 'planned',
    notes: '',
    isPublic: true
  });
  
  const [selectedEvent, setSelectedEvent] = useState<any data-testid="link-element">(null);
  const [selectedCityGroup, setSelectedCityGroup] = useState<any data-testid="link-element">(null);

  const createTravelDetailMutation = useMutation({
    mutationFn: async (data: TravelDetailForm) => {
      return apiRequest('/api/user/travel-details', {
        method: 'POST',
        body: data
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/travel-details'] });
      toast({
        title: "Success",
        description: "Travel detail added successfully",
      });
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add travel detail",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      eventName: '',
      eventType: '',
      city: '',
      country: '',
      startDate: '',
      endDate: '',
      status: 'planned',
      notes: '',
      isPublic: true
    });
    setSelectedEvent(null);
    setSelectedCityGroup(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTravelDetailMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof TravelDetailForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-turquoise-500" />
            Add Travel Detail
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <EventAutocomplete
                label="Event Name"
                value={selectedEvent}
                onSelect={(event) => {
                  setSelectedEvent(event);
                  if (event) {
                    handleInputChange('eventName', event.title);
                    handleInputChange('eventType', event.eventType || formData.eventType);
                    handleInputChange('city', event.city || formData.city);
                    handleInputChange('country', event.country || formData.country);
                    if (event.startDate) {
                      handleInputChange('startDate', event.startDate.split('T')[0]);
                    }
                    if (event.endDate) {
                      handleInputChange('endDate', event.endDate.split('T')[0]);
                    }
                  } else {
                    handleInputChange('eventName', '');
                  }
                }}
                placeholder="Search for an event or type a new name"
                allowCreate={true}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventType">Event Type</Label>
              <Select 
                value={formData.eventType} 
                onValueChange={(value) = data-testid="select-element"> handleInputChange('eventType', value)}
              >
                <SelectTrigger data-testid="select-element">
                  <SelectValue placeholder="Select event type" / data-testid="select-element">
                </SelectTrigger>
                <SelectContent data-testid="select-element">
                  {eventTypes.map(type => (
                    <SelectItem key={type.value} value={type.value} data-testid="select-element">
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="location">Location</Label>
              <LocationAutocomplete
                value={formData.city && formData.country ? `${formData.city}, ${formData.country}` : ''}
                onChange={(value, details) => {
                  if (details) {
                    handleInputChange('city', details.city);
                    handleInputChange('country', details.country);
                  } else {
                    // Handle free text input
                    const parts = value.split(',').map(p => p.trim());
                    if (parts.length >= 2) {
                      handleInputChange('city', parts[0] || '');
                      handleInputChange('country', parts[parts.length - 1] || '');
                    } else {
                      handleInputChange('city', value);
                      handleInputChange('country', '');
                    }
                  }
                }}
                placeholder="Enter city, country (e.g., Buenos Aires, Argentina)"
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-600 dark:text-gray-400" />
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) = data-testid="input-element"> handleInputChange('startDate', e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-600 dark:text-gray-400" />
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) = data-testid="input-element"> handleInputChange('endDate', e.target.value)}
                  className="pl-10"
                  required
                  min={formData.startDate}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value: any) = data-testid="select-element"> handleInputChange('status', value)}
              >
                <SelectTrigger data-testid="select-element">
                  <SelectValue / data-testid="select-element">
                </SelectTrigger>
                <SelectContent data-testid="select-element">
                  <SelectItem value="considering" data-testid="select-element">Considering</SelectItem>
                  <SelectItem value="planned" data-testid="select-element">Planned</SelectItem>
                  <SelectItem value="working" data-testid="select-element">Working</SelectItem>
                  <SelectItem value="ongoing" data-testid="select-element">Ongoing</SelectItem>
                  <SelectItem value="completed" data-testid="select-element">Completed</SelectItem>
                  <SelectItem value="cancelled" data-testid="select-element">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="visibility">Visibility</Label>
              <Select 
                value={formData.isPublic ? 'public' : 'private'} 
                onValueChange={(value) = data-testid="select-element"> handleInputChange('isPublic', value === 'public')}
              >
                <SelectTrigger data-testid="select-element">
                  <SelectValue / data-testid="select-element">
                </SelectTrigger>
                <SelectContent data-testid="select-element">
                  <SelectItem value="public" data-testid="select-element">Public</SelectItem>
                  <SelectItem value="close_friends" data-testid="select-element">Close Friends</SelectItem>
                  <SelectItem value="private" data-testid="select-element">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) = data-testid="textarea-element"> handleInputChange('notes', e.target.value)}
              placeholder="Any additional details about your travel..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={createTravelDetailMutation.isPending}
             data-testid="button-element">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createTravelDetailMutation.isPending}
              className="bg-gradient-to-r from-turquoise-400 to-cyan-500 hover:from-turquoise-500 hover:to-cyan-600"
             data-testid="button-bg-gradient-to-r">
              {createTravelDetailMutation.isPending ? 'Adding...' : 'Add Travel Detail'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};