import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next';;
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { 
  Plus,
  X,
  Edit,
  CheckCircle2
} from 'lucide-react';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  getCategoryDisplayLabel, 
  getCategoryIcon, 
  getCategoryColor,
  CATEGORY_SLUG_TO_DISPLAY 
} from '@/utils/houseRulesHelpers';

interface HouseRuleTemplate {
  id: number;
  category: string;
  title: string;
  description: string;
  isDefault: boolean;
  sortOrder: number;
}

interface SelectedRule {
  id?: number;
  templateId?: number;
  category: string;
  title: string;
  description: string;
  isCustom: boolean;
}

interface HouseRulesSelectorProps {
  homeId?: number;
  initialRules?: SelectedRule[];
  onChange?: (rules: SelectedRule[]) => void;
  showActions?: boolean;
}

export default function HouseRulesSelector({ 
  homeId, 
  initialRules = [], 
  onChange,
  showActions = true 
}: HouseRulesSelectorProps) {
  const [selectedRules, setSelectedRules] = useState<SelectedRule[]>(initialRules);
  const [customRuleDialogOpen, setCustomRuleDialogOpen] = useState(false);
  const [customRuleCategory, setCustomRuleCategory] = useState('');
  const [customRuleTitle, setCustomRuleTitle] = useState('');
  const [customRuleDescription, setCustomRuleDescription] = useState('');
  const { toast } = useToast();

  // Fetch all templates
  const { data: templatesData, isLoading } = useQuery<{ success: boolean; data: HouseRuleTemplate[] }>({
    queryKey: ['/api/house-rules/templates'],
  });

  const templates = templatesData?.data || [];

  // Group templates by category
  const templatesByCategory = templates.reduce((acc, template) => {
  const { t } = useTranslation();
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, HouseRuleTemplate[]>);

  // Save rules mutation
  const saveRulesMutation = useMutation({
    mutationFn: async () => {
      if (!homeId) throw new Error('Home ID required');

      const templateIds = selectedRules
        .filter(r => !r.isCustom && r.templateId)
        .map(r => r.templateId);

      const customRules = selectedRules
        .filter(r => r.isCustom)
        .map(r => ({
          category: r.category,
          title: r.title,
          description: r.description,
        }));

      return apiRequest(`/api/host-homes/${homeId}/rules`, {
        method: 'POST',
        body: JSON.stringify({ templateIds, customRules }),
      });
    },
    onSuccess: () => {
      toast({
        title: {t('states.success', 'Success')},
        description: 'House rules saved successfully',
      });
      queryClient.invalidateQueries({ queryKey: [`/api/host-homes/${homeId}/rules`] });
    },
    onError: (error: any) => {
      toast({
        title: {t('states.error', 'Error')},
        description: error.message || 'Failed to save house rules',
        variant: 'destructive',
      });
    },
  });

  // Update parent when rules change
  useEffect(() => {
    onChange?.(selectedRules);
  }, [selectedRules, onChange]);

  const handleTemplateToggle = (template: HouseRuleTemplate, isSelected: boolean) => {
    if (isSelected) {
      setSelectedRules(prev => [
        ...prev,
        {
          templateId: template.id,
          category: template.category,
          title: template.title,
          description: template.description,
          isCustom: false,
        }
      ]);
    } else {
      setSelectedRules(prev => prev.filter(r => r.templateId !== template.id));
    }
  };

  const handleAddCustomRule = () => {
    if (!customRuleCategory || !customRuleTitle) {
      toast({
        title: 'Validation Error',
        description: 'Category and title are required',
        variant: 'destructive',
      });
      return;
    }

    setSelectedRules(prev => [
      ...prev,
      {
        category: customRuleCategory,
        title: customRuleTitle,
        description: customRuleDescription,
        isCustom: true,
      }
    ]);

    // Reset form
    setCustomRuleCategory('');
    setCustomRuleTitle('');
    setCustomRuleDescription('');
    setCustomRuleDialogOpen(false);

    toast({
      title: 'Custom Rule Added',
      description: 'Your custom rule has been added successfully',
    });
  };

  const handleRemoveRule = (index: number) => {
    setSelectedRules(prev => prev.filter((_, i) => i !== index));
  };

  const isTemplateSelected = (templateId: number) => {
    return selectedRules.some(r => r.templateId === templateId);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">Loading house rules templates...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Template Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select House Rules from Templates</CardTitle>
          <CardDescription>
            Choose from our pre-defined templates organized by category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            {Object.entries(templatesByCategory).map(([categorySlug, categoryTemplates]) => {
              const Icon = getCategoryIcon(categorySlug);
              const displayLabel = getCategoryDisplayLabel(categorySlug);
              const selectedCount = selectedRules.filter(r => r.category === categorySlug).length;

              return (
                <AccordionItem key={categorySlug} value={categorySlug} data-testid={`accordion-category-${categorySlug}`}>
                  <AccordionTrigger data-testid={`trigger-category-${categorySlug}`}>
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-primary" />
                      <span className="font-medium">{displayLabel}</span>
                      {selectedCount > 0 && (
                        <Badge variant="secondary" data-testid={`badge-count-${categorySlug}`}>
                          {selectedCount} selected
                        </Badge>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pt-2">
                      {categoryTemplates.map((template) => {
                        const isSelected = isTemplateSelected(template.id);
                        return (
                          <div
                            key={template.id}
                            className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                            data-testid={`template-item-${template.id}`}
                          >
                            <Checkbox
                              id={`template-${template.id}`}
                              checked={isSelected}
                              onCheckedChange={(checked) => handleTemplateToggle(template, checked as boolean)}
                              data-testid={`checkbox-template-${template.id}`}
                            />
                            <div className="flex-1">
                              <Label
                                htmlFor={`template-${template.id}`}
                                className="font-medium cursor-pointer"
                                data-testid={`label-template-${template.id}`}
                              >
                                {template.title}
                              </Label>
                              <p className="text-sm text-muted-foreground mt-1" data-testid={`desc-template-${template.id}`}>
                                {template.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </CardContent>
      </Card>

      {/* Add Custom Rule */}
      <Card>
        <CardHeader>
          <CardTitle>Custom House Rules</CardTitle>
          <CardDescription>
            Create your own custom rules for specific needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={customRuleDialogOpen} onOpenChange={setCustomRuleDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full" data-testid="button-add-custom">
                <Plus className="h-4 w-4 mr-2" />
                Add Custom Rule
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Custom House Rule</DialogTitle>
                <DialogDescription>
                  Add a rule specific to your property
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="custom-category">Category</Label>
                  <Select value={customRuleCategory} onValueChange={setCustomRuleCategory}>
                    <SelectTrigger id="custom-category" data-testid="select-custom-category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(templatesByCategory).map((categorySlug) => (
                        <SelectItem key={categorySlug} value={categorySlug} data-testid={`option-category-${categorySlug}`}>
                          {getCategoryDisplayLabel(categorySlug)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="custom-title">Rule Title</Label>
                  <Input
                    id="custom-title"
                    placeholder="e.g., No shoes in the house"
                    value={customRuleTitle}
                    onChange={(e) => setCustomRuleTitle(e.target.value)}
                    data-testid="input-custom-title"
                  />
                </div>
                <div>
                  <Label htmlFor="custom-description">Description (Optional)</Label>
                  <Textarea
                    id="custom-description"
                    placeholder="Provide additional details about this rule..."
                    value={customRuleDescription}
                    onChange={(e) => setCustomRuleDescription(e.target.value)}
                    rows={3}
                    data-testid="textarea-custom-description"
                  />
                </div>
                <Button onClick={handleAddCustomRule} className="w-full" data-testid="button-save-custom">
                  Add Rule
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Selected Rules Summary */}
      {selectedRules.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Selected Rules ({selectedRules.length})</CardTitle>
                <CardDescription>
                  Review and manage your house rules
                </CardDescription>
              </div>
              {showActions && homeId && (
                <Button
                  onClick={() => saveRulesMutation.mutate()}
                  disabled={saveRulesMutation.isPending}
                  data-testid="button-save-rules"
                >
                  {saveRulesMutation.isPending ? 'Saving...' : 'Save Rules'}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {selectedRules.map((rule, index) => {
                const Icon = getCategoryIcon(rule.category);
                const colorClass = getCategoryColor(rule.category);
                const displayLabel = getCategoryDisplayLabel(rule.category);

                return (
                  <div
                    key={`${rule.templateId || 'custom'}-${index}`}
                    className="flex items-start gap-3 p-4 border rounded-lg"
                    data-testid={`selected-rule-${index}`}
                  >
                    <Icon className="h-5 w-5 text-primary mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium" data-testid={`selected-title-${index}`}>
                          {rule.title}
                        </span>
                        <Badge className={colorClass} data-testid={`selected-category-${index}`}>
                          {displayLabel}
                        </Badge>
                        {rule.isCustom && (
                          <Badge variant="outline" data-testid={`badge-custom-${index}`}>
                            Custom
                          </Badge>
                        )}
                      </div>
                      {rule.description && (
                        <p className="text-sm text-muted-foreground" data-testid={`selected-desc-${index}`}>
                          {rule.description}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveRule(index)}
                      data-testid={`button-remove-${index}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
