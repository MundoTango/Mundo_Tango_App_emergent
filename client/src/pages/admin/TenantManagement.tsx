import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Building2, Plus, Settings, Users, Globe } from "lucide-react";
import { MetaTags } from "@/components/seo/MetaTags";
import { useTranslation } from 'react-i18next';

interface Tenant {
  id: number;
  name: string;
  slug: string;
  domain?: string;
  status: string;
  theme?: string;
  userCount: number;
  createdAt: string;
}

export default function TenantManagement() {
  const { t } = useTranslation();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTenant, setNewTenant] = useState({
    name: "",
    slug: "",
    domain: ""
  });

  // Fetch tenants
  const { data: tenants = [], isLoading } = useQuery<Tenant[]>({
    queryKey: ['/api/admin/tenants'],
  });

  // Create tenant mutation
  const createTenant = useMutation({
    mutationFn: async (data: typeof newTenant) => {
      return await apiRequest('/api/admin/tenants', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tenants'] });
      setIsCreateOpen(false);
      setNewTenant({ name: "", slug: "", domain: "" });
    }
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <MetaTags
        title="Tenant Management"
        description="Manage multi-tenant communities and white-label instances on the platform"
        keywords="tenant management, multi-tenant, communities, white-label"
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white dark:text-white">
            Tenant Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage communities and white-label instances
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-tenant">
              <Plus className="w-4 h-4 mr-2" />
              Create Tenant
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Tenant</DialogTitle>
              <DialogDescription>
                Set up a new community or white-label instance
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Community Name</Label>
                <Input
                  id="name"
                  data-testid="input-tenant-name"
                  value={newTenant.name}
                  onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })}
                  placeholder="e.g., Mundo Tango"
                />
              </div>
              <div>
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  data-testid="input-tenant-slug"
                  value={newTenant.slug}
                  onChange={(e) => setNewTenant({ ...newTenant, slug: e.target.value })}
                  placeholder="e.g., mundo-tango"
                />
              </div>
              <div>
                <Label htmlFor="domain">Custom Domain (Optional)</Label>
                <Input
                  id="domain"
                  data-testid="input-tenant-domain"
                  value={newTenant.domain}
                  onChange={(e) => setNewTenant({ ...newTenant, domain: e.target.value })}
                  placeholder="e.g., mundotango.com"
                />
              </div>
              <Button
                onClick={() => createTenant.mutate(newTenant)}
                disabled={createTenant.isPending || !newTenant.name || !newTenant.slug}
                data-testid="button-submit-tenant"
                className="w-full"
              >
                {createTenant.isPending ? "Creating..." : "Create Tenant"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-tenants">
              {tenants.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Active communities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-users">
              {tenants.reduce((sum, t) => sum + (t.userCount || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all tenants
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custom Domains</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-custom-domains">
              {tenants.filter(t => t.domain).length}
            </div>
            <p className="text-xs text-muted-foreground">
              White-label instances
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tenants List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white dark:text-white">
          Communities
        </h2>

        {isLoading ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Loading tenants...
          </div>
        ) : tenants.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Building2 className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600 dark:text-gray-400">
                No tenants yet. Create your first community to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {tenants.map((tenant) => (
              <Card key={tenant.id} data-testid={`card-tenant-${tenant.id}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-8 h-8 text-blue-500" />
                      <div>
                        <CardTitle>{tenant.name}</CardTitle>
                        <CardDescription>/{tenant.slug}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={tenant.status === 'active' ? 'default' : 'secondary'}>
                        {tenant.status}
                      </Badge>
                      <Button variant="outline" size="sm" data-testid={`button-settings-${tenant.id}`}>
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Users</p>
                      <p className="font-semibold text-gray-900 dark:text-white dark:text-white">
                        {tenant.userCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Domain</p>
                      <p className="font-semibold text-gray-900 dark:text-white dark:text-white">
                        {tenant.domain || 'Default'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Theme</p>
                      <p className="font-semibold text-gray-900 dark:text-white dark:text-white">
                        {tenant.theme || 'Ocean'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
