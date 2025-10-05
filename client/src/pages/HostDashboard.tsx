import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Home,
  Plus,
  MapPin,
  Users,
  Calendar,
  Settings,
  Eye,
  Edit,
  BarChart3,
  MessageCircle,
  Star
} from 'lucide-react';

interface HostHome {
  id: number;
  title: string;
  city: string;
  state?: string;
  country: string;
  maxGuests: number;
  photos: Array<{ url: string; displayOrder: number }>;
  isActive: boolean;
  whoCanBook?: string;
  minimumClosenessScore?: number;
  createdAt: string;
}

export default function HostDashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Fetch user's host homes
  const { data: response, isLoading } = useQuery<{ success: boolean; data: HostHome[] }>({
    queryKey: [`/api/host-homes/user/${user?.id}`],
    enabled: !!user?.id
  });

  const properties = response?.data || [];
  const hasProperties = properties.length > 0;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // First-time host - no properties yet
  if (!hasProperties) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <Card className="p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Home className="w-12 h-12 text-cyan-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to Hosting!
            </h1>
            
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Share your space with the tango community. Connect with dancers from around the world 
              and offer them a home away from home during their travels.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-left">
              <div className="p-6 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-cyan-600" />
                </div>
                <h3 className="font-semibold mb-2">Connection-Based</h3>
                <p className="text-sm text-gray-600">
                  Control who can book based on your friendship connections and closeness scores
                </p>
              </div>

              <div className="p-6 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                  <MessageCircle className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="font-semibold mb-2">Community Trust</h3>
                <p className="text-sm text-gray-600">
                  Host verified tango community members you're connected with
                </p>
              </div>

              <div className="p-6 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Your Schedule</h3>
                <p className="text-sm text-gray-600">
                  Manage availability and approve booking requests on your terms
                </p>
              </div>
            </div>

            <Button
              size="lg"
              onClick={() => navigate('/host-onboarding')}
              className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700"
              data-testid="button-create-first-listing"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Listing
            </Button>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Existing host - show properties
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Properties</h1>
            <p className="text-gray-600 mt-1">
              Manage your listings and booking requests
            </p>
          </div>
          <Button
            onClick={() => navigate('/host-onboarding')}
            className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700"
            data-testid="button-add-property"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Property
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-cyan-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{properties.length}</p>
                <p className="text-sm text-gray-600">Active Listings</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">-</p>
                <p className="text-sm text-gray-600">Pending Requests</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">-</p>
                <p className="text-sm text-gray-600">Total Guests</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">-</p>
                <p className="text-sm text-gray-600">Avg Rating</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Property Image */}
              <div className="relative h-48 bg-gradient-to-br from-cyan-400 to-teal-500">
                {property.photos && property.photos.length > 0 ? (
                  <img
                    src={property.photos[0].url}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Home className="w-16 h-16 text-white/50" />
                  </div>
                )}
                
                <div className="absolute top-3 right-3">
                  <Badge className={property.isActive ? 'bg-green-500' : 'bg-gray-500'}>
                    {property.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>

              {/* Property Info */}
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-1" data-testid={`text-property-${property.id}`}>
                  {property.title}
                </h3>
                
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <MapPin className="w-4 h-4" />
                  <span>{property.city}, {property.country}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                  <Users className="w-4 h-4" />
                  <span>Up to {property.maxGuests} guests</span>
                </div>

                {/* Connection-based access */}
                {property.whoCanBook && (
                  <div className="mb-4 p-2 bg-cyan-50 rounded text-sm">
                    <span className="font-medium text-cyan-900">
                      {property.whoCanBook === 'friends_only' && '🔒 Friends only'}
                      {property.whoCanBook === 'friends_of_friends' && '🤝 Friends & FOF'}
                      {property.whoCanBook === 'all_connected' && '🌐 All connected'}
                    </span>
                  </div>
                )}

                {/* Actions */}
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/listing/${property.id}`)}
                    data-testid={`button-view-${property.id}`}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/host/edit/${property.id}`)}
                    data-testid={`button-edit-${property.id}`}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/host-calendar?propertyId=${property.id}`)}
                    data-testid={`button-calendar-${property.id}`}
                  >
                    <Calendar className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card
            className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/host-bookings')}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-cyan-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Manage Bookings</h3>
                <p className="text-sm text-gray-600">Review and respond to booking requests</p>
              </div>
            </div>
          </Card>

          <Card
            className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/host/analytics')}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">View Analytics</h3>
                <p className="text-sm text-gray-600">Track your hosting performance</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
