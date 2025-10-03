import { UnifiedMapSystem, MapItem, LayerConfig } from './UnifiedMapSystem';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function BasicMapExample() {
  const items: MapItem[] = [
    {
      id: 1,
      lat: 40.7128,
      lng: -74.0060,
      data: { title: 'New York', type: 'city', population: 8000000 },
      layerId: 'cities',
    },
    {
      id: 2,
      lat: 34.0522,
      lng: -118.2437,
      data: { title: 'Los Angeles', type: 'city', population: 4000000 },
      layerId: 'cities',
    },
  ];

  return (
    <UnifiedMapSystem
      items={items}
      markerRenderer={(item) => <div>{item.data.title}</div>}
      popupRenderer={(item) => (
        <div>
          <h3 className="font-bold">{item.data.title}</h3>
          <p>Population: {item.data.population.toLocaleString()}</p>
        </div>
      )}
      center={[39.8283, -98.5795]}
      zoom={4}
      height="600px"
    />
  );
}

export function FullFeaturedMapExample() {
  const items: MapItem[] = [
    {
      id: 1,
      lat: 40.7128,
      lng: -74.0060,
      data: { title: 'NYC Event', type: 'event', date: '2025-10-15' },
      layerId: 'events',
    },
    {
      id: 2,
      lat: 40.7580,
      lng: -73.9855,
      data: { title: 'Times Square Hotel', type: 'housing', price: 200 },
      layerId: 'housing',
    },
    {
      id: 3,
      lat: 40.7589,
      lng: -73.9851,
      data: { title: 'Great Restaurant', type: 'recommendation', rating: 4.5 },
      layerId: 'recommendations',
    },
  ];

  const layers: LayerConfig[] = [
    { id: 'events', label: 'Events', enabled: true, icon: '📅' },
    { id: 'housing', label: 'Housing', enabled: true, icon: '🏠' },
    { id: 'recommendations', label: 'Recommendations', enabled: true, icon: '⭐' },
  ];

  return (
    <UnifiedMapSystem
      items={items}
      markerRenderer={(item) => (
        <div className="flex items-center gap-2">
          <span>{layers.find(l => l.id === item.layerId)?.icon}</span>
          <span>{item.data.title}</span>
        </div>
      )}
      popupRenderer={(item) => (
        <div className="space-y-2">
          <h3 className="font-bold text-lg">{item.data.title}</h3>
          <Badge>{item.layerId}</Badge>
          {item.data.date && <p>Date: {item.data.date}</p>}
          {item.data.price && <p>Price: ${item.data.price}/night</p>}
          {item.data.rating && <p>Rating: {item.data.rating} ⭐</p>}
        </div>
      )}
      filters={
        <div className="flex gap-2">
          <Button variant="outline" size="sm">All Dates</Button>
          <Button variant="outline" size="sm">Price Range</Button>
        </div>
      }
      layers={layers}
      clustering={true}
      progressiveLoading={true}
      fullscreen={true}
      csvExport={true}
      search={true}
      onFilterChange={(filters) => console.log('Filters changed:', filters)}
      onItemClick={(item) => console.log('Item clicked:', item)}
      center={[40.7589, -73.9851]}
      zoom={13}
      height="800px"
    />
  );
}

export function EventMapReplacement() {
  const eventItems: MapItem[] = [
    {
      id: 1,
      lat: 40.7128,
      lng: -74.0060,
      data: {
        title: 'Tango Milonga',
        location: 'Dance Studio NYC',
        startDate: '2025-10-15T20:00:00',
        attendeeCount: 45,
      },
    },
  ];

  return (
    <UnifiedMapSystem
      items={eventItems}
      markerRenderer={(item) => <span>📅</span>}
      popupRenderer={(item) => (
        <div className="space-y-2">
          <h3 className="font-semibold">{item.data.title}</h3>
          <p className="text-sm text-gray-600">{item.data.location}</p>
          <p className="text-sm">
            {new Date(item.data.startDate).toLocaleDateString()}
          </p>
          <p className="text-sm">{item.data.attendeeCount} attending</p>
        </div>
      )}
      search={true}
      fullscreen={true}
      center={[40.7128, -74.0060]}
      zoom={12}
      height="600px"
    />
  );
}

export function CityGroupMapReplacement() {
  const cityItems: MapItem[] = [
    {
      id: 1,
      lat: -34.6037,
      lng: -58.3816,
      data: {
        name: 'Buenos Aires',
        country: 'Argentina',
        memberCount: 150,
        eventCount: 23,
        slug: 'buenos-aires',
      },
    },
  ];

  return (
    <UnifiedMapSystem
      items={cityItems}
      markerRenderer={(item) => (
        <div className="text-2xl">🌍</div>
      )}
      popupRenderer={(item) => (
        <div className="space-y-2 cursor-pointer" onClick={() => {
          window.location.href = `/groups/${item.data.slug}`;
        }}>
          <h3 className="font-bold text-lg bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent">
            {item.data.name}
          </h3>
          <p className="text-sm text-gray-600">{item.data.country}</p>
          <div className="flex gap-4 text-sm">
            <div>
              <span className="font-semibold text-pink-600">{item.data.memberCount}</span>
              <span className="text-gray-600"> members</span>
            </div>
            <div>
              <span className="font-semibold text-blue-600">{item.data.eventCount}</span>
              <span className="text-gray-600"> events</span>
            </div>
          </div>
          <Button size="sm" className="w-full">View Group</Button>
        </div>
      )}
      clustering={true}
      progressiveLoading={true}
      search={true}
      csvExport={true}
      fullscreen={true}
      center={[0, 0]}
      zoom={2}
      height="100%"
    />
  );
}
