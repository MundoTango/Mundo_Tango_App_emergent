import { Calendar, Home, Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface TripMapLayers {
  events: boolean;
  housing: boolean;
  recommendations: boolean;
}

interface MapLayerTogglesProps {
  layers: TripMapLayers;
  onChange: (layers: TripMapLayers) => void;
}

export default function MapLayerToggles({ layers, onChange }: MapLayerTogglesProps) {
  const handleToggle = (layer: keyof TripMapLayers) => {
    onChange({
      ...layers,
      [layer]: !layers[layer]
    });
  };

  return (
    <Card className="p-4 glass-card-depth-1">
      <h3 className="font-semibold text-sm mb-3 text-gray-700 dark:text-gray-300">
        Map Layers
      </h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-cyan-600" />
            <Label htmlFor="layer-events" className="text-sm cursor-pointer">
              Events
            </Label>
          </div>
          <Switch
            id="layer-events"
            checked={layers.events}
            onCheckedChange={() => handleToggle('events')}
            data-testid="toggle-layer-events"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Home className="h-4 w-4 text-turquoise-600" />
            <Label htmlFor="layer-housing" className="text-sm cursor-pointer">
              Housing
            </Label>
          </div>
          <Switch
            id="layer-housing"
            checked={layers.housing}
            onCheckedChange={() => handleToggle('housing')}
            data-testid="toggle-layer-housing"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-pink-600" />
            <Label htmlFor="layer-recommendations" className="text-sm cursor-pointer">
              Recommendations
            </Label>
          </div>
          <Switch
            id="layer-recommendations"
            checked={layers.recommendations}
            onCheckedChange={() => handleToggle('recommendations')}
            data-testid="toggle-layer-recommendations"
          />
        </div>
      </div>
    </Card>
  );
}
