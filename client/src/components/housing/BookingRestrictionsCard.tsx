import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Shield, Users, Heart, Sparkles, Save } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface BookingRestrictionsCardProps {
  propertyId: number;
  currentSettings?: {
    whoCanBook?: string;
    minimumClosenessScore?: number;
  };
}

export function BookingRestrictionsCard({ propertyId, currentSettings }: BookingRestrictionsCardProps) {
  const { toast } = useToast();
  const [whoCanBook, setWhoCanBook] = useState(currentSettings?.whoCanBook || 'anyone');
  const [minimumCloseness, setMinimumCloseness] = useState(currentSettings?.minimumClosenessScore || 50);

  const updateRestrictionsMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest(`/api/host-homes/${propertyId}/booking-restrictions`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/host-homes', propertyId] });
      toast({
        title: 'Settings updated',
        description: 'Booking restrictions have been saved successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update booking restrictions',
        variant: 'destructive',
      });
    },
  });

  const handleSave = () => {
    updateRestrictionsMutation.mutate({
      whoCanBook,
      minimumClosenessScore: whoCanBook === 'custom_closeness' ? minimumCloseness : 0,
    });
  };

  return (
    <Card className="border-2 border-primary/10">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <CardTitle>Booking Restrictions</CardTitle>
        </div>
        <CardDescription>
          Control who can book your property based on friendship connections
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Label className="text-base font-medium">Who can book this property?</Label>
          <RadioGroup value={whoCanBook} onValueChange={setWhoCanBook}>
            <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
              <RadioGroupItem value="anyone" id="anyone" />
              <div className="flex-1">
                <Label htmlFor="anyone" className="font-medium cursor-pointer">
                  Anyone
                </Label>
                <p className="text-sm text-muted-foreground">
                  All users can book this property
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
              <RadioGroupItem value="1st_degree" id="1st_degree" />
              <div className="flex-1 space-y-1">
                <Label htmlFor="1st_degree" className="font-medium cursor-pointer flex items-center gap-2">
                  <Heart className="w-4 h-4 text-pink-500" />
                  Direct friends only (1st degree)
                </Label>
                <p className="text-sm text-muted-foreground">
                  Only your direct friends can book
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
              <RadioGroupItem value="2nd_degree" id="2nd_degree" />
              <div className="flex-1">
                <Label htmlFor="2nd_degree" className="font-medium cursor-pointer flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  Friends & friends of friends (1st-2nd degree)
                </Label>
                <p className="text-sm text-muted-foreground">
                  Your friends and their friends can book
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
              <RadioGroupItem value="3rd_degree" id="3rd_degree" />
              <div className="flex-1">
                <Label htmlFor="3rd_degree" className="font-medium cursor-pointer flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-500" />
                  Extended network (1st-3rd degree)
                </Label>
                <p className="text-sm text-muted-foreground">
                  Anyone within 3 degrees of separation
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
              <RadioGroupItem value="custom_closeness" id="custom_closeness" />
              <div className="flex-1 space-y-3">
                <Label htmlFor="custom_closeness" className="font-medium cursor-pointer flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Minimum closeness score
                </Label>
                <p className="text-sm text-muted-foreground">
                  Require a minimum friendship closeness score
                </p>
                {whoCanBook === 'custom_closeness' && (
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Minimum score:</span>
                      <span className="text-sm font-bold text-primary">
                        {minimumCloseness}/100
                      </span>
                    </div>
                    <Slider
                      value={[minimumCloseness]}
                      onValueChange={(values) => setMinimumCloseness(values[0])}
                      min={0}
                      max={100}
                      step={5}
                      className="w-full"
                     
                    />
                    <p className="text-xs text-muted-foreground">
                      Higher scores indicate stronger friendships based on shared activities and interactions
                    </p>
                  </div>
                )}
              </div>
            </div>
          </RadioGroup>
        </div>

        <Button 
          onClick={handleSave} 
          disabled={updateRestrictionsMutation.isPending}
          className="w-full"
         
        >
          <Save className="w-4 h-4 mr-2" />
          {updateRestrictionsMutation.isPending ? 'Saving...' : 'Save Restrictions'}
        </Button>
      </CardContent>
    </Card>
  );
}
