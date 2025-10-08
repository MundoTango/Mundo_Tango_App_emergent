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
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { 
  getCategoryDisplayLabel, 
  getCategoryIcon, 
  getCategoryColor 
} from '@/utils/houseRulesHelpers';

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
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">Loading house rules...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
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
      <Card>
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
      <div className="space-y-2">
        {showTitle && (
          <h3 className="font-semibold text-lg mb-3">
            House Rules ({rules.length})
          </h3>
        )}
        <div className="grid gap-2">
          {rules.map((rule) => {
            const title = rule.customTitle || rule.template?.title || 'Rule';
            const Icon = getCategoryIcon(rule.category);

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
    <Card>
      {showTitle && (
        <CardHeader>
          <CardTitle>House Rules</CardTitle>
          <CardDescription>
            Please review and follow these rules during your stay
          </CardDescription>
        </CardHeader>
      )}
      <CardContent className={showTitle ? '' : 'pt-6'}>
        <div className="space-y-6">
          {Object.entries(rulesByCategory).map(([categorySlug, categoryRules], categoryIndex) => {
            const Icon = getCategoryIcon(categorySlug);
            const colorClass = getCategoryColor(categorySlug);
            const displayLabel = getCategoryDisplayLabel(categorySlug);

            return (
              <div key={categorySlug} data-testid={`category-${categorySlug}`}>
                {categoryIndex > 0 && <Separator className="my-6" />}
                
                <div className="space-y-4">
                  {/* Category Header */}
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-base" data-testid={`category-title-${categorySlug}`}>
                      {displayLabel}
                    </h3>
                    <Badge className={colorClass} data-testid={`category-badge-${categorySlug}`}>
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
