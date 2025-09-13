# Community World Map Documentation

## 1. Overview
- **Route**: `/community-world-map`
- **Purpose**: Interactive global map showing tango communities and events worldwide
- **ESA Framework Layer**: Layer 4 - Global Visualization

## 2. Technical Implementation

### Components
- `client/src/pages/community-world-map.tsx` - Map page
- `WorldMapView` - Interactive map component
- `CommunityMarkers` - Location markers
- `MapControls` - Zoom and filter controls
- `LocationInfoPanel` - Details sidebar
- `HeatmapLayer` - Activity density
- `ClusterManager` - Marker clustering
- `MapSearch` - Location search

### API Endpoints
- `GET /api/map/communities` - Map data
- `GET /api/map/clusters` - Clustered markers
- `GET /api/map/heatmap` - Activity heatmap
- `GET /api/map/search` - Location search
- `GET /api/map/details/:id` - Marker details
- `GET /api/map/events` - Event locations
- `GET /api/map/stats/:region` - Regional stats

### Real-time Features
- Live community updates
- Real-time event markers
- Dynamic heatmap updates
- Live user locations (opt-in)
- Instant filter application

### Database Tables
- `map_locations` - Geographic data
- `map_clusters` - Cluster cache
- `activity_heatmap` - Density data
- `region_stats` - Regional metrics
- `map_filters` - User preferences
- `location_cache` - Performance cache

## 3. User Permissions
- **Guest**: View public map
- **User**: Full interaction
- **Premium**: Advanced filters
- **Admin**: Analytics overlay
- **Moderator**: Content management

## 4. MT Ocean Theme Implementation
```css
/* Map container gradient overlay */
.map-container {
  position: relative;
  background: linear-gradient(180deg, rgba(94, 234, 212, 0.1), rgba(21, 94, 117, 0.1));
}

/* Custom marker styling */
.map-marker {
  background: radial-gradient(circle, #5EEAD4, #14B8A6);
  border: 3px solid white;
  box-shadow: 0 4px 8px rgba(94, 234, 212, 0.4);
  border-radius: 50%;
  width: 30px;
  height: 30px;
}

/* Cluster marker */
.cluster-marker {
  background: linear-gradient(135deg, #14B8A6, #0D9488);
  color: white;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

/* Info panel gradient */
.info-panel {
  background: linear-gradient(to bottom, white, rgba(94, 234, 212, 0.05));
  border-left: 4px solid #5EEAD4;
  box-shadow: -4px 0 12px rgba(94, 234, 212, 0.1);
}

/* Heatmap gradient colors */
.heatmap-gradient {
  background: linear-gradient(
    to right,
    rgba(94, 234, 212, 0.2),
    rgba(20, 184, 166, 0.4),
    rgba(13, 148, 136, 0.6),
    rgba(15, 118, 110, 0.8),
    rgba(21, 94, 117, 1)
  );
}

/* Control buttons */
.map-control {
  background: white;
  border: 2px solid #5EEAD4;
  border-radius: 8px;
  padding: 8px;
  transition: all 0.2s;
}

.map-control:hover {
  background: rgba(94, 234, 212, 0.1);
  transform: scale(1.1);
}
```

## 5. Test Coverage
- **Unit Tests**: 76% coverage
- **Integration Tests**: Map interactions
- **E2E Tests**: Full map features
- **Performance Tests**: Large datasets
- **Visual Tests**: Marker rendering

## 6. Known Issues
- WebGL performance on older devices
- Cluster calculation for 10k+ markers
- Mobile pinch-zoom sensitivity
- Offline map caching

## 7. Agent Responsibilities
- **Map Agent**: Map data management
- **Cluster Agent**: Marker clustering
- **Geocoding Agent**: Address lookup
- **Analytics Agent**: Heatmap generation
- **Cache Agent**: Performance optimization

## 8. Integration Points
- **Mapbox/Google Maps**: Map provider
- **WebGL**: Performance rendering
- **Geocoding API**: Address search
- **Analytics Service**: Activity data
- **Cache Service**: Tile caching
- **CDN**: Map tile delivery

## 9. Performance Metrics
- **Initial Load**: < 3 seconds
- **Pan/Zoom**: 60 FPS
- **Marker Render**: < 500ms
- **Cluster Calculation**: < 1 second
- **Search Response**: < 500ms
- **Memory Usage**: < 200MB

## 10. Accessibility
- **Screen Reader**: Location descriptions
- **Keyboard Navigation**: Map controls
- **Alternative View**: List format
- **Color Blind Mode**: Pattern markers
- **Zoom Controls**: Button interface
- **High Contrast**: Mode available