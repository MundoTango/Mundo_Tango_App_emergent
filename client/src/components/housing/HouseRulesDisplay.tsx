import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Clock,
  PawPrint,
  Cigarette,
  Car,
  Users,
  Volume2,
  Sparkles,
  PartyPopper,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface HouseRule {
  id: number;
  hostHomeId: number;
  ruleTemplateId: number | null;
  category: string;
  customTitle: string | null;
  customDescription: string | null;
  isActive: boolean;
  template?: {
    id: number;
    category: string;
    title: string;
    description: string;
  };
}

interface HouseRulesDisplayProps {
  homeId: number;
  variant?: 'detailed' | 'compact';
  showTitle?: boolean;
}

const CATEGORY_ICONS: Record<string, any> = {
  'Check-in/Check-out': Clock,
  'Pets': PawPrint,
  'Smoking': Cigarette,
  'Parking': Car,
  'Events & Parties': PartyPopper,
  'Noise & Quiet Hours': Volume2,
  'Guest Limits': Users,
  'Cleaning & Maintenance': Sparkles,
};

const CATEGORY_COLORS: Record<string, string> = {
  'Check-in/Check-out': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'Pets': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'Smoking': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  'Parking': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  'Events & Parties': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  'Noise & Quiet Hours': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  'Guest Limits': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  'Cleaning & Maintenance': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
};

export default function HouseRulesDisplay({ 
  homeId, 
  variant = 'detailed',
  showTitle = true 
}: HouseRulesDisplayProps) {
  const { data, isLoading, error } = useQuery<{ success: boolean; data: HouseRule[] }>({
    queryKey: [`/api/host-homes/${homeId}/rules`],
    enabled: !!homeId,
  });

  const rules = data?.data || [];

  // Group rules by category
  const rulesByCategory = rules.reduce((acc, rule) => {
    const category = rule.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(rule);
    return acc;
  }, {} as Record<string, HouseRule[]>);

  if (isLoading) {
    return (
      <Card data-testid="house-rules-loading">
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">Loading house rules...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card data-testid="house-rules-error">
        <CardContent className="py-8">
          <div className="flex items-center justify-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>Failed to load house rules</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (rules.length === 0) {
    return (
      <Card data-testid="house-rules-empty">
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            No house rules have been set for this property
          </div>
        </CardContent>
      </Card>
    );
  }

  // Compact variant - minimal display
  if (variant === 'compact') {
    return (
      <div className="space-y-2" data-testid="house-rules-compact">
        {showTitle && (
          <h3 className="font-semibold text-lg mb-3" data-testid="title-house-rules">
            House Rules ({rules.length})
          </h3>
        )}
        <div className="grid gap-2">
          {rules.map((rule) => {
            const title = rule.customTitle || rule.template?.title || 'Rule';
            const Icon = CATEGORY_ICONS[rule.category] || CheckCircle2;

            return (
              <div
                key={rule.id}
                className="flex items-center gap-2 text-sm"
                data-testid={`compact-rule-${rule.id}`}
              >
                <Icon className="h-4 w-4 text-primary flex-shrink-0" />
                <span data-testid={`compact-title-${rule.id}`}>{title}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Detailed variant - full display with categories
  return (
    <Card data-testid="house-rules-detailed">
      {showTitle && (
        <CardHeader>
          <CardTitle data-testid="title-house-rules">House Rules</CardTitle>
          <CardDescription>
            Please review and follow these rules during your stay
          </CardDescription>
        </CardHeader>
      )}
      <CardContent className={showTitle ? '' : 'pt-6'}>
        <div className="space-y-6">
          {Object.entries(rulesByCategory).map(([category, categoryRules], categoryIndex) => {
            const Icon = CATEGORY_ICONS[category] || CheckCircle2;
            const colorClass = CATEGORY_COLORS[category] || 'bg-gray-100 text-gray-800';

            return (
              <div key={category} data-testid={`category-${category}`}>
                {categoryIndex > 0 && <Separator className="my-6" />}
                
                <div className="space-y-4">
                  {/* Category Header */}
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-base" data-testid={`category-title-${category}`}>
                      {category}
                    </h3>
                    <Badge className={colorClass} data-testid={`category-badge-${category}`}>
                      {categoryRules.length}
                    </Badge>
                  </div>

                  {/* Rules in Category */}
                  <div className="space-y-3 ml-8">
                    {categoryRules.map((rule) => {
                      const title = rule.customTitle || rule.template?.title;
                      const description = rule.customDescription || rule.template?.description;
                      const isCustom = !rule.ruleTemplateId;

                      return (
                        <div
                          key={rule.id}
                          className="space-y-1"
                          data-testid={`rule-${rule.id}`}
                        >
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium" data-testid={`rule-title-${rule.id}`}>
                                  {title}
                                </span>
                                {isCustom && (
                                  <Badge 
                                    variant="outline" 
                                    className="text-xs"
                                    data-testid={`rule-custom-badge-${rule.id}`}
                                  >
                                    Custom
                                  </Badge>
                                )}
                              </div>
                              {description && (
                                <p 
                                  className="text-sm text-muted-foreground mt-1"
                                  data-testid={`rule-description-${rule.id}`}
                                >
                                  {description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
