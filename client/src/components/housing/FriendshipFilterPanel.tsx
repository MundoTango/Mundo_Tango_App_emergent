import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Users, Heart, Filter, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface FriendshipFilterPanelProps {
  onFilterChange: (filter: string | null) => void;
  currentFilter?: string | null;
}

export function FriendshipFilterPanel({ onFilterChange, currentFilter }: FriendshipFilterPanelProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>(currentFilter || 'all');

  const handleApplyFilter = () => {
    onFilterChange(selectedFilter === 'all' ? null : selectedFilter);
  };

  const handleClearFilter = () => {
    setSelectedFilter('all');
    onFilterChange(null);
  };

  const isActive = currentFilter && currentFilter !== 'all';

  return (
    <Card className="border-2 border-primary/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary" />
            <CardTitle>Filter by Connection</CardTitle>
          </div>
          {isActive && (
            <Badge variant="default" className="bg-primary">
              Active
            </Badge>
          )}
        </div>
        <CardDescription>
          Show properties from hosts within your network
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup value={selectedFilter} onValueChange={setSelectedFilter}>
          <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
            <RadioGroupItem value="all" id="all-hosts" />
            <div className="flex-1">
              <Label htmlFor="all-hosts" className="font-medium cursor-pointer">
                All properties
              </Label>
              <p className="text-sm text-muted-foreground">
                Show properties from all hosts
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
            <RadioGroupItem value="1st_degree" id="1st-filter" />
            <div className="flex-1">
              <Label htmlFor="1st-filter" className="font-medium cursor-pointer flex items-center gap-2">
                <Heart className="w-4 h-4 text-pink-500" />
                Direct friends only
              </Label>
              <p className="text-sm text-muted-foreground">
                Properties from your direct friends
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
            <RadioGroupItem value="2nd_degree" id="2nd-filter" />
            <div className="flex-1">
              <Label htmlFor="2nd-filter" className="font-medium cursor-pointer flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                Friends & friends of friends
              </Label>
              <p className="text-sm text-muted-foreground">
                1st and 2nd degree connections
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
            <RadioGroupItem value="3rd_degree" id="3rd-filter" />
            <div className="flex-1">
              <Label htmlFor="3rd-filter" className="font-medium cursor-pointer flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-500" />
                Extended network
              </Label>
              <p className="text-sm text-muted-foreground">
                All connections within 3 degrees
              </p>
            </div>
          </div>
        </RadioGroup>

        <div className="flex gap-2">
          <Button 
            onClick={handleApplyFilter} 
            className="flex-1"
           
          >
            <Filter className="w-4 h-4 mr-2" />
            Apply Filter
          </Button>
          {isActive && (
            <Button 
              onClick={handleClearFilter} 
              variant="outline"
             
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
